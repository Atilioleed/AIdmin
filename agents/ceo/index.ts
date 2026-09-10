import 'dotenv/config';
import { fileURLToPath } from 'node:url';
import { Agent, type AgentRunResult } from '../_shared/agent.js';
import { createLlmClient } from '../_shared/llm-client-factory.js';
import { createCeoTools } from './tools.js';

const CONSTITUTION_PATH = fileURLToPath(new URL('./constitution.md', import.meta.url));

const COMMITTEE_CONTEXT = `
Arma la pauta de comite del dia para FIRMA IA.

Lee los reportes recientes de todos los agentes activos y las aprobaciones
pendientes. Cruza sus posiciones para encontrar acuerdos y tensiones entre ellos,
aunque no hayan hablado directamente entre si. Termina con la pauta completa segun
el formato de tu constitucion.
`.trim();

export async function runCeoAgent(): Promise<AgentRunResult> {
  const agent = new Agent(
    {
      slug: 'ceo',
      constitutionPath: CONSTITUTION_PATH,
      tools: createCeoTools(),
    },
    { anthropic: createLlmClient() },
  );

  const result = await agent.run(COMMITTEE_CONTEXT);

  console.log(`[ceo] run ${result.runId} completado (${result.toolCallCount} tool calls)`);
  console.log(result.finalText);

  return result;
}

const isMainModule = process.argv[1]?.endsWith('index.ts') ?? false;
if (isMainModule) {
  runCeoAgent().catch((error: unknown) => {
    console.error('[ceo] fallo la corrida:', error);
    process.exitCode = 1;
  });
}
