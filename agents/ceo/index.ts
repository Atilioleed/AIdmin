import 'dotenv/config';
import { fileURLToPath } from 'node:url';
import { Agent, type AgentRunResult } from '../_shared/agent.js';
import { getPool } from '../_shared/db.js';
import { sendOwnerAlertEmail } from '../_shared/email.js';
import { createLlmClient } from '../_shared/llm-client-factory.js';
import { resolveTenantId } from '../_shared/tenant.js';
import { createCeoTools } from './tools.js';

const CONSTITUTION_PATH = fileURLToPath(new URL('./constitution.md', import.meta.url));

const COMMITTEE_CONTEXT = `
Arma la pauta de comite del dia para FIRMA IA.

Lee los reportes recientes de todos los agentes activos y las aprobaciones
pendientes. Cruza sus posiciones para encontrar acuerdos y tensiones entre ellos,
aunque no hayan hablado directamente entre si. Termina con la pauta completa segun
el formato de tu constitucion.
`.trim();

interface PendingCountRow {
  pending_count: string;
}

interface OwnerAlertEmailRow {
  owner_alert_email: string | null;
}

/**
 * Si la pyme tiene un correo de alertas configurado (/dashboard/negocio) y quedo
 * algo pendiente de revision humana tras armar la pauta, le avisa al dueño por
 * correo con el resumen del CEO. No manda nada si no hay pendientes o no hay
 * correo configurado - evita spam. Especifico de CEO, no toca Agent.run()
 * compartido con los otros 5 agentes.
 */
async function sendOwnerAlertIfNeeded(tenantId: string, result: AgentRunResult): Promise<void> {
  const pool = getPool();

  const emailResult = await pool.query<OwnerAlertEmailRow>(
    'SELECT owner_alert_email FROM business_context WHERE tenant_id = $1',
    [tenantId],
  );
  const ownerEmail = emailResult.rows[0]?.owner_alert_email?.trim();
  if (!ownerEmail) return;

  const pendingResult = await pool.query<PendingCountRow>(
    `SELECT
       (SELECT count(*) FROM approvals ap JOIN agents ag ON ag.id = ap.agent_id
          WHERE ag.tenant_id = $1 AND ap.status = 'pending_approval')
       +
       (SELECT count(*) FROM content_reviews cr JOIN agents ag ON ag.id = cr.agent_id
          WHERE ag.tenant_id = $1 AND cr.status = 'pending_review')
       AS pending_count`,
    [tenantId],
  );
  const pendingCount = Number(pendingResult.rows[0]?.pending_count ?? '0');
  if (pendingCount === 0) return;

  const alert = await sendOwnerAlertEmail(
    ownerEmail,
    `AIdmin: ${pendingCount} pendiente(s) de revision en tu pauta de hoy`,
    result.finalText,
  );

  if (alert.sent) {
    console.log(`[ceo] alerta enviada a ${ownerEmail}`);
  } else {
    console.log(`[ceo] alerta no enviada: ${alert.reason}`);
  }
}

export async function runCeoAgent(tenantId?: string): Promise<AgentRunResult> {
  const resolvedTenantId = resolveTenantId(tenantId);
  const agent = new Agent(
    {
      tenantId: resolvedTenantId,
      slug: 'ceo',
      constitutionPath: CONSTITUTION_PATH,
      tools: createCeoTools(resolvedTenantId),
    },
    { anthropic: createLlmClient() },
  );

  const result = await agent.run(COMMITTEE_CONTEXT);

  console.log(`[ceo] run ${result.runId} completado (${result.toolCallCount} tool calls)`);
  console.log(result.finalText);

  await sendOwnerAlertIfNeeded(resolvedTenantId, result);

  return result;
}

const isMainModule = process.argv[1]?.endsWith('index.ts') ?? false;
if (isMainModule) {
  runCeoAgent().catch((error: unknown) => {
    console.error('[ceo] fallo la corrida:', error);
    process.exitCode = 1;
  });
}
