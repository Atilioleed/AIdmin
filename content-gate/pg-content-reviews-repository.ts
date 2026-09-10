import type { Pool } from 'pg';
import type {
  ContentReviewRecord,
  ContentReviewRequest,
  ContentReviewsRepository,
  ContentReviewStatus,
} from './types.js';

interface ContentReviewRow {
  id: string;
  agent_id: string;
  run_id: string | null;
  channel: string;
  content_text: string;
  scheduled_for: Date | null;
  status: ContentReviewStatus;
  requested_at: Date;
  resolved_at: Date | null;
  resolved_by: string | null;
  resolution_notes: string | null;
}

function toContentReviewRecord(row: ContentReviewRow): ContentReviewRecord {
  return {
    id: row.id,
    agentId: row.agent_id,
    runId: row.run_id,
    channel: row.channel,
    contentText: row.content_text,
    scheduledFor: row.scheduled_for,
    status: row.status,
    requestedAt: row.requested_at,
    resolvedAt: row.resolved_at,
    resolvedBy: row.resolved_by,
    resolutionNotes: row.resolution_notes,
  };
}

export class PgContentReviewsRepository implements ContentReviewsRepository {
  constructor(private readonly pool: Pool) {}

  async insertPending(request: ContentReviewRequest): Promise<ContentReviewRecord> {
    const result = await this.pool.query<ContentReviewRow>(
      `INSERT INTO content_reviews (agent_id, run_id, channel, content_text, scheduled_for)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        request.agentId,
        request.runId ?? null,
        request.channel,
        request.contentText,
        request.scheduledFor ?? null,
      ],
    );
    const row = result.rows[0];
    if (!row) {
      throw new Error('No se pudo crear el registro de content_review.');
    }
    return toContentReviewRecord(row);
  }

  async findById(id: string): Promise<ContentReviewRecord | null> {
    const result = await this.pool.query<ContentReviewRow>(
      'SELECT * FROM content_reviews WHERE id = $1',
      [id],
    );
    const row = result.rows[0];
    return row ? toContentReviewRecord(row) : null;
  }

  async listByStatus(status: ContentReviewStatus): Promise<ContentReviewRecord[]> {
    const result = await this.pool.query<ContentReviewRow>(
      'SELECT * FROM content_reviews WHERE status = $1 ORDER BY requested_at ASC',
      [status],
    );
    return result.rows.map(toContentReviewRecord);
  }

  async resolve(
    id: string,
    decision: 'approved' | 'rejected',
    resolvedBy: string,
    notes?: string,
  ): Promise<ContentReviewRecord> {
    const result = await this.pool.query<ContentReviewRow>(
      `UPDATE content_reviews
       SET status = $2, resolved_at = now(), resolved_by = $3, resolution_notes = $4
       WHERE id = $1
       RETURNING *`,
      [id, decision, resolvedBy, notes ?? null],
    );
    const row = result.rows[0];
    if (!row) {
      throw new Error(`Content review ${id} no existe.`);
    }
    return toContentReviewRecord(row);
  }
}
