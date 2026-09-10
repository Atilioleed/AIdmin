import 'dotenv/config';
import { fileURLToPath } from 'node:url';
import { Agent, type AgentRunResult } from '../_shared/agent.js';
import { createLlmClient } from '../_shared/llm-client-factory.js';
import { resolveTenantId } from '../_shared/tenant.js';
import { desarrolloTools } from './tools.js';

const CONSTITUTION_PATH = fileURLToPath(new URL('./constitution.md', import.meta.url));

const DAILY_CHECK_CONTEXT = `
Corre tu chequeo diario de infraestructura para FIRMA IA.

Usa tus tools en el orden que consideres razonable para juntar la informacion que
necesitas (uptime del sitio de prueba, logs recientes). Si encuentras algo de bajo
riesgo que amerite un borrador de fix, puedes abrirlo. Termina con tu reporte segun el
formato de tu constitucion.
`.trim();

export async function runDesarrolloAgent(tenantId?: string): Promise<AgentRunResult> {
  const agent = new Agent(
    {
      tenantId: resolveTenantId(tenantId),
      slug: 'desarrollo',
      constitutionPath: CONSTITUTION_PATH,
      tools: desarrolloTools,
    },
    { anthropic: createLlmClient() },
  );

  const result = await agent.run(DAILY_CHECK_CONTEXT);

  console.log(`[desarrollo] run ${result.runId} completado (${result.toolCallCount} tool calls)`);
  console.log(result.finalText);

  return result;
}

const isMainModule = process.argv[1]?.endsWith('index.ts') ?? false;
if (isMainModule) {
  runDesarrolloAgent().catch((error: unknown) => {
    console.error('[desarrollo] fallo la corrida:', error);
    process.exitCode = 1;
  });
}
