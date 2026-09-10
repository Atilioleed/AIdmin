import { randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import Anthropic from '@anthropic-ai/sdk';
import type { Pool } from 'pg';
import { getPool } from './db.js';
import { loadAgentProfile, formatAgentProfileForPrompt } from './agent-profile.js';
import { checkDailyCapOk, recordUsage } from './usage.js';
import type { AgentSlug, DecisionType } from './types.js';

export interface AgentToolContext {
  agentId: string;
  runId: string;
}

export interface AgentTool<TInput = Record<string, unknown>> {
  name: string;
  description: string;
  inputSchema: Anthropic.Tool.InputSchema;
  // El resultado se pasa a formatToolResult() (por defecto JSON.stringify) antes de
  // volver al modelo. Si el resultado incluye texto de una fuente externa (un log, el
  // body de una respuesta HTTP, etc.), la tool debe envolverlo con
  // asUntrustedContent() antes de retornarlo - ver agents/_shared/untrusted-content.ts.
  // `context` trae el agentId/runId de la corrida actual - lo necesitan tools que a su
  // vez escriben en otra tabla con atribucion propia (p.ej. approval-gate).
  execute: (input: TInput, context: AgentToolContext) => Promise<unknown>;
}

export interface AgentConfig {
  tenantId: string;
  slug: AgentSlug;
  constitutionPath: string;
  tools: AgentTool[];
  model?: string;
  maxTokens?: number;
  maxToolIterations?: number;
}

// Convencion para que una tool devuelva contenido multimodal (p.ej. una foto que un
// cliente subio) en vez de texto plano. Ver agents/_shared/uploads-tool.ts para el
// primer uso real. Cualquier tool que NO use esta forma sigue funcionando igual que
// siempre (JSON.stringify del output).
export interface MultimodalToolContent {
  __multimodalContent: Array<{ type: 'text'; text: string } | { type: 'image'; url: string }>;
}

function isMultimodalToolContent(value: unknown): value is MultimodalToolContent {
  return (
    typeof value === 'object' &&
    value !== null &&
    Array.isArray((value as { __multimodalContent?: unknown }).__multimodalContent)
  );
}

export interface AgentRunResult {
  runId: string;
  agentId: string;
  finalText: string;
  toolCallCount: number;
  // true = esta corrida no llamo al modelo porque ya se paso el tope diario de
  // tokens de este tenant+agente (tenants.daily_token_cap_per_agent). finalText
  // trae una nota explicando esto, no un reporte real.
  capped: boolean;
}

const DEFAULT_MODEL = 'claude-sonnet-5';
const DEFAULT_MAX_TOKENS = 4096;
const DEFAULT_MAX_TOOL_ITERATIONS = 8;

/**
 * Clase base que envuelven todos los agentes ("gerentes"). Carga su constitucion
 * (system prompt versionado en markdown), corre el loop de function-calling contra el
 * SDK de Anthropic, y escribe cada decision (incluida cada llamada a tool) en
 * decisions_log antes de devolver un resultado. Ningun agente concreto debe saltarse
 * este logging: run() es el unico punto de entrada.
 */
export class Agent {
  private readonly config: AgentConfig;
  private readonly anthropic: Anthropic;
  private readonly pool: Pool;
  // Mitad FIJA del system prompt: limites de autonomia, contenido externo = dato,
  // formato del reporte. Nunca editable desde el panel admin - ver agent-profile.ts
  // para la mitad editable (personalidad/habilidades/objetivo, cargada por run()).
  private readonly fixedConstitution: string;

  constructor(config: AgentConfig, deps: { anthropic?: Anthropic; pool?: Pool } = {}) {
    this.config = config;
    this.anthropic = deps.anthropic ?? new Anthropic();
    this.pool = deps.pool ?? getPool();
    this.fixedConstitution = readFileSync(config.constitutionPath, 'utf8');
  }

  async run(userContext: string): Promise<AgentRunResult> {
    const runId = randomUUID();
    const agentId = await this.getAgentId();

    const cap = await checkDailyCapOk(this.pool, this.config.tenantId, this.config.slug);
    if (!cap.ok) {
      const finalText =
        `Se alcanzó el tope diario de uso para este agente (${cap.usedTokens.toLocaleString('es-CL')} / ` +
        `${cap.capTokens.toLocaleString('es-CL')} tokens). No se ejecutó ninguna consulta al modelo hoy - ` +
        'vuelve a correr mañana o pide que se suba el tope desde /admin/tenants.';
      await this.logDecision(agentId, runId, 'error', null, null, null, finalText);
      await this.saveReport(agentId, runId, finalText);
      await recordUsage(this.pool, this.config.tenantId, this.config.slug, 0, 0, true);
      return { runId, agentId, finalText, toolCallCount: 0, capped: true };
    }

    const profile = await loadAgentProfile(this.pool, this.config.slug);
    const system = `${formatAgentProfileForPrompt(profile)}\n\n---\n\n${this.fixedConstitution}`;
    const model = this.config.model ?? process.env.ANTHROPIC_MODEL ?? DEFAULT_MODEL;
    const maxTokens = this.config.maxTokens ?? DEFAULT_MAX_TOKENS;
    const maxIterations = this.config.maxToolIterations ?? DEFAULT_MAX_TOOL_ITERATIONS;

    const tools: Anthropic.Tool[] = this.config.tools.map((tool) => ({
      name: tool.name,
      description: tool.description,
      input_schema: tool.inputSchema,
    }));

    const messages: Anthropic.MessageParam[] = [{ role: 'user', content: userContext }];
    let toolCallCount = 0;
    let finalText = '';
    let totalInputTokens = 0;
    let totalOutputTokens = 0;

    for (let iteration = 0; iteration < maxIterations; iteration += 1) {
      const response = await this.anthropic.messages.create({
        model,
        max_tokens: maxTokens,
        system,
        messages,
        tools,
      });

      totalInputTokens += response.usage.input_tokens;
      totalOutputTokens += response.usage.output_tokens;

      const textBlocks = response.content.filter(
        (block): block is Anthropic.TextBlock => block.type === 'text',
      );
      const reasoning = textBlocks
        .map((block) => block.text)
        .join('\n')
        .trim();
      const toolUseBlocks = response.content.filter(
        (block): block is Anthropic.ToolUseBlock => block.type === 'tool_use',
      );

      if (toolUseBlocks.length === 0) {
        finalText = reasoning;
        await this.logDecision(agentId, runId, 'report_generated', null, null, null, reasoning);
        break;
      }

      messages.push({ role: 'assistant', content: response.content });

      const toolResults: Anthropic.ToolResultBlockParam[] = [];
      for (const toolUseBlock of toolUseBlocks) {
        toolCallCount += 1;
        const tool = this.config.tools.find((t) => t.name === toolUseBlock.name);
        let output: unknown;
        let isError = false;
        if (!tool) {
          output = { error: `Tool desconocida: ${toolUseBlock.name}` };
          isError = true;
        } else {
          try {
            output = await tool.execute(toolUseBlock.input as Record<string, unknown>, {
              agentId,
              runId,
            });
          } catch (error) {
            output = { error: error instanceof Error ? error.message : String(error) };
            isError = true;
          }
        }

        await this.logDecision(
          agentId,
          runId,
          isError ? 'error' : 'tool_call',
          toolUseBlock.name,
          toolUseBlock.input,
          output,
          reasoning || `Llamada a tool ${toolUseBlock.name}`,
        );

        const content = isMultimodalToolContent(output)
          ? output.__multimodalContent.map((block) =>
              block.type === 'image'
                ? ({ type: 'image', source: { type: 'url', url: block.url } } as const)
                : ({ type: 'text', text: block.text } as const),
            )
          : JSON.stringify(output);

        toolResults.push({
          type: 'tool_result',
          tool_use_id: toolUseBlock.id,
          content,
          is_error: isError,
        });
      }

      messages.push({ role: 'user', content: toolResults });

      if (response.stop_reason !== 'tool_use') {
        finalText = reasoning;
        await this.logDecision(agentId, runId, 'report_generated', null, null, null, reasoning);
        break;
      }
    }

    await this.saveReport(agentId, runId, finalText);
    await recordUsage(this.pool, this.config.tenantId, this.config.slug, totalInputTokens, totalOutputTokens, false);

    return { runId, agentId, finalText, toolCallCount, capped: false };
  }

  private async getAgentId(): Promise<string> {
    const result = await this.pool.query<{ id: string }>(
      'SELECT id FROM agents WHERE tenant_id = $1 AND slug = $2',
      [this.config.tenantId, this.config.slug],
    );
    const row = result.rows[0];
    if (!row) {
      throw new Error(
        `No existe un agente "${this.config.slug}" para el tenant ${this.config.tenantId} ` +
          '(corre db/seed.sql o crea el tenant/agentes desde el panel admin).',
      );
    }
    return row.id;
  }

  private async logDecision(
    agentId: string,
    runId: string,
    decisionType: DecisionType,
    toolName: string | null,
    input: unknown,
    output: unknown,
    reasoning: string,
  ): Promise<void> {
    await this.pool.query(
      `INSERT INTO decisions_log (agent_id, run_id, decision_type, tool_name, input, output, reasoning)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        agentId,
        runId,
        decisionType,
        toolName,
        input === undefined ? null : JSON.stringify(input),
        output === undefined ? null : JSON.stringify(output),
        reasoning || '(sin razonamiento explicito)',
      ],
    );
  }

  private async saveReport(agentId: string, runId: string, summary: string): Promise<void> {
    await this.pool.query(
      `INSERT INTO reports (agent_id, run_id, summary, details)
       VALUES ($1, $2, $3, $4)`,
      [agentId, runId, summary || '(sin resumen)', JSON.stringify({})],
    );
  }
}
