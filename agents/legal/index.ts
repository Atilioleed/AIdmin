import 'dotenv/config';
import { fileURLToPath } from 'node:url';
import { Agent, type AgentRunResult } from '../_shared/agent.js';
import { createLlmClient } from '../_shared/llm-client-factory.js';
import { resolveTenantId } from '../_shared/tenant.js';
import { createLegalTools } from './tools.js';

const CONSTITUTION_PATH = fileURLToPath(new URL('./constitution.md', import.meta.url));

const CATALOG_REVIEW_CONTEXT = `
Corre tu revision del catalogo de documentos de FIRMA IA.

Usa tus tools en el orden que consideres razonable: revisa el catalogo de plantillas
y el checklist de referencia, y marca (flag_document_for_legal_review) los
documentos que necesiten revision humana, separando riesgo alto de mejora menor.
Termina con tu reporte segun el formato de tu constitucion.
`.trim();

export async function runLegalAgent(tenantId?: string): Promise<AgentRunResult> {
  const resolvedTenantId = resolveTenantId(tenantId);
  const agent = new Agent(
    {
      tenantId: resolvedTenantId,
      slug: 'legal',
      constitutionPath: CONSTITUTION_PATH,
      tools: createLegalTools(resolvedTenantId),
    },
    { anthropic: createLlmClient() },
  );

  const result = await agent.run(CATALOG_REVIEW_CONTEXT);

  console.log(`[legal] run ${result.runId} completado (${result.toolCallCount} tool calls)`);
  console.log(result.finalText);

  return result;
}

const isMainModule = process.argv[1]?.endsWith('index.ts') ?? false;
if (isMainModule) {
  runLegalAgent().catch((error: unknown) => {
    console.error('[legal] fallo la corrida:', error);
    process.exitCode = 1;
  });
}
