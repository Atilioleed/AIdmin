import type { Pool } from 'pg';
import type { AgentTool } from '../_shared/agent.js';
import { getPool } from '../_shared/db.js';

interface RecentReportRow {
  slug: string;
  name: string;
  summary: string;
  created_at: Date;
}

interface PendingApprovalRow {
  id: string;
  agent_slug: string;
  action_type: string;
  payload: Record<string, unknown>;
  requested_at: Date;
}

/**
 * Ultimo reporte de cada agente ACTIVO del mismo tenant. Es la unica forma en que el
 * CEO "escucha" a los demas agentes - lectura pura, sin ningun efecto secundario. El
 * filtro por tenant_id es el perimetro de aislamiento entre pymes: el CEO de una pyme
 * nunca debe ver reportes de otra.
 */
function buildListRecentReportsTool(tenantId: string, pool: Pool): AgentTool {
  return {
    name: 'list_recent_reports',
    description:
      'Devuelve el reporte mas reciente de cada agente activo (Desarrollo, Finanzas, ' +
      'Legal, Producto, Marketing) de esta pyme. Si un agente no tiene reportes, no aparece en la lista.',
    inputSchema: { type: 'object', properties: {} },
    async execute() {
      const result = await pool.query<RecentReportRow>(
        `SELECT DISTINCT ON (a.slug) a.slug, a.name, r.summary, r.created_at
         FROM reports r
         JOIN agents a ON a.id = r.agent_id
         WHERE a.tenant_id = $1 AND a.is_active = TRUE AND a.slug <> 'ceo'
         ORDER BY a.slug, r.created_at DESC`,
        [tenantId],
      );
      return result.rows;
    },
  };
}

/**
 * Approvals en pending_approval de cualquier agente DE ESTE TENANT. Solo lectura: el
 * CEO nunca aprueba ni rechaza, solo las deja visibles y priorizadas en la pauta.
 */
function buildListPendingApprovalsTool(tenantId: string, pool: Pool): AgentTool {
  return {
    name: 'list_pending_approvals',
    description: 'Lista las aprobaciones en pending_approval de esta pyme, mas antiguas primero.',
    inputSchema: { type: 'object', properties: {} },
    async execute() {
      const result = await pool.query<PendingApprovalRow>(
        `SELECT ap.id, ag.slug AS agent_slug, ap.action_type, ap.payload, ap.requested_at
         FROM approvals ap
         JOIN agents ag ON ag.id = ap.agent_id
         WHERE ag.tenant_id = $1 AND ap.status = 'pending_approval'
         ORDER BY ap.requested_at ASC`,
        [tenantId],
      );
      return result.rows;
    },
  };
}

export function createCeoTools(tenantId: string, pool: Pool = getPool()): AgentTool[] {
  return [
    buildListRecentReportsTool(tenantId, pool),
    buildListPendingApprovalsTool(tenantId, pool),
  ];
}
