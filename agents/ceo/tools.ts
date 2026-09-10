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
 * Ultimo reporte de cada agente ACTIVO. Es la unica forma en que el CEO "escucha" a
 * los demas agentes - lectura pura, sin ningun efecto secundario.
 */
function buildListRecentReportsTool(pool: Pool): AgentTool {
  return {
    name: 'list_recent_reports',
    description:
      'Devuelve el reporte mas reciente de cada agente activo (Desarrollo, Finanzas, ' +
      'Legal, Producto). Si un agente no tiene reportes, no aparece en la lista.',
    inputSchema: { type: 'object', properties: {} },
    async execute() {
      const result = await pool.query<RecentReportRow>(
        `SELECT DISTINCT ON (a.slug) a.slug, a.name, r.summary, r.created_at
         FROM reports r
         JOIN agents a ON a.id = r.agent_id
         WHERE a.is_active = TRUE AND a.slug <> 'ceo'
         ORDER BY a.slug, r.created_at DESC`,
      );
      return result.rows;
    },
  };
}

/**
 * Approvals en pending_approval de cualquier agente. Solo lectura: el CEO nunca
 * aprueba ni rechaza, solo las deja visibles y priorizadas en la pauta.
 */
function buildListPendingApprovalsTool(pool: Pool): AgentTool {
  return {
    name: 'list_pending_approvals',
    description:
      'Lista las aprobaciones en pending_approval de cualquier agente, mas antiguas primero.',
    inputSchema: { type: 'object', properties: {} },
    async execute() {
      const result = await pool.query<PendingApprovalRow>(
        `SELECT ap.id, ag.slug AS agent_slug, ap.action_type, ap.payload, ap.requested_at
         FROM approvals ap
         JOIN agents ag ON ag.id = ap.agent_id
         WHERE ap.status = 'pending_approval'
         ORDER BY ap.requested_at ASC`,
      );
      return result.rows;
    },
  };
}

export function createCeoTools(pool: Pool = getPool()): AgentTool[] {
  return [buildListRecentReportsTool(pool), buildListPendingApprovalsTool(pool)];
}
