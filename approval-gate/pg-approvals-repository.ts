import type { Pool } from 'pg';
import type { ApprovalStatus } from '../agents/_shared/types.js';
import type { ApprovalRecord, ApprovalRequest, ApprovalsRepository } from './types.js';

interface ApprovalRow {
  id: string;
  agent_id: string;
  run_id: string | null;
  action_type: ApprovalRecord['actionType'];
  payload: Record<string, unknown>;
  status: ApprovalStatus;
  requested_at: Date;
  resolved_at: Date | null;
  resolved_by: string | null;
  resolution_notes: string | null;
}

function toApprovalRecord(row: ApprovalRow): ApprovalRecord {
  return {
    id: row.id,
    agentId: row.agent_id,
    runId: row.run_id,
    actionType: row.action_type,
    payload: row.payload,
    status: row.status,
    requestedAt: row.requested_at,
    resolvedAt: row.resolved_at,
    resolvedBy: row.resolved_by,
    resolutionNotes: row.resolution_notes,
  };
}

// Implementacion real del ApprovalsRepository contra la tabla `approvals` de Postgres.
export class PgApprovalsRepository implements ApprovalsRepository {
  constructor(private readonly pool: Pool) {}

  async insertPending(request: ApprovalRequest): Promise<ApprovalRecord> {
    const result = await this.pool.query<ApprovalRow>(
      `INSERT INTO approvals (agent_id, run_id, action_type, payload)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [request.agentId, request.runId ?? null, request.actionType, request.payload],
    );
    const row = result.rows[0];
    if (!row) {
      throw new Error('No se pudo crear el registro de approval.');
    }
    return toApprovalRecord(row);
  }

  async findById(id: string): Promise<ApprovalRecord | null> {
    const result = await this.pool.query<ApprovalRow>('SELECT * FROM approvals WHERE id = $1', [
      id,
    ]);
    const row = result.rows[0];
    return row ? toApprovalRecord(row) : null;
  }

  async listByStatus(status: ApprovalStatus): Promise<ApprovalRecord[]> {
    const result = await this.pool.query<ApprovalRow>(
      'SELECT * FROM approvals WHERE status = $1 ORDER BY requested_at ASC',
      [status],
    );
    return result.rows.map(toApprovalRecord);
  }

  async resolve(
    id: string,
    decision: 'approved' | 'rejected',
    resolvedBy: string,
    notes?: string,
  ): Promise<ApprovalRecord> {
    const result = await this.pool.query<ApprovalRow>(
      `UPDATE approvals
       SET status = $2, resolved_at = now(), resolved_by = $3, resolution_notes = $4
       WHERE id = $1
       RETURNING *`,
      [id, decision, resolvedBy, notes ?? null],
    );
    const row = result.rows[0];
    if (!row) {
      throw new Error(`Approval ${id} no existe.`);
    }
    return toApprovalRecord(row);
  }
}
