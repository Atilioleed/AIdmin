import 'dotenv/config';
import { fileURLToPath } from 'node:url';
import { Agent, type AgentRunResult } from '../_shared/agent.js';
import { createLlmClient } from '../_shared/llm-client-factory.js';
import { resolveTenantId } from '../_shared/tenant.js';
import { createMarketingTools } from './tools.js';

const CONSTITUTION_PATH = fileURLToPath(new URL('./constitution.md', import.meta.url));

const CONTENT_REVIEW_CONTEXT = `
Corre tu revision de contenido y redes para FIRMA IA.

Revisa el calendario de contenido, las metricas del periodo y los comentarios
recientes. Deja listos (propose_post) los posts organicos que correspondan segun el
calendario, y si detectas una oportunidad de campaña paga o cambio de presupuesto
bien fundamentado, dejalo con propose_paid_campaign / propose_budget_change. Ambos
tipos de propuesta quedan pendientes de aprobacion humana - nunca publiques ni
ejecutes nada tu misma. Termina con tu reporte segun el formato de tu constitucion.
`.trim();

export async function runMarketingAgent(tenantId?: string): Promise<AgentRunResult> {
  const agent = new Agent(
    {
      tenantId: resolveTenantId(tenantId),
      slug: 'marketing',
      constitutionPath: CONSTITUTION_PATH,
      tools: createMarketingTools(),
    },
    { anthropic: createLlmClient() },
  );

  const result = await agent.run(CONTENT_REVIEW_CONTEXT);

  console.log(`[marketing] run ${result.runId} completado (${result.toolCallCount} tool calls)`);
  console.log(result.finalText);

  return result;
}

const isMainModule = process.argv[1]?.endsWith('index.ts') ?? false;
if (isMainModule) {
  runMarketingAgent().catch((error: unknown) => {
    console.error('[marketing] fallo la corrida:', error);
    process.exitCode = 1;
  });
}
