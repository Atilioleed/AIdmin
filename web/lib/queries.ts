import { getPool } from './db';

export interface ReportRow {
  id: string;
  slug: string;
  agentName: string;
  summary: string;
  createdAt: Date;
}

export interface PendingApprovalRow {
  id: string;
  agentSlug: string;
  actionType: string;
  payload: Record<string, unknown>;
  requestedAt: Date;
}

export interface PendingContentReviewRow {
  id: string;
  agentSlug: string;
  channel: string;
  contentText: string;
  scheduledFor: Date | null;
  requestedAt: Date;
}

export interface ClientUploadRow {
  id: string;
  agentSlug: string | null;
  uploadedBy: string;
  storagePath: string;
  fileType: 'image' | 'document' | 'other';
  caption: string | null;
  createdAt: Date;
}

export interface AgentActivityRow {
  slug: string;
  name: string;
  isActive: boolean;
  lastActiveAt: Date | null;
}

/**
 * Ultima actividad (ultimo reporte) de cada agente de este tenant, para paneles
 * de "red de agentes" en vivo (ver components/AgentNetworkVisual.tsx). LEFT JOIN
 * a proposito: un agente sin reportes todavia igual aparece, con lastActiveAt null.
 */
export async function listAgentActivity(tenantId: string): Promise<AgentActivityRow[]> {
  const result = await getPool().query(
    `SELECT a.slug, a.name, a.is_active, MAX(r.created_at) AS last_active_at
     FROM agents a
     LEFT JOIN reports r ON r.agent_id = a.id
     WHERE a.tenant_id = $1
     GROUP BY a.slug, a.name, a.is_active
     ORDER BY a.slug`,
    [tenantId],
  );
  return (
    result.rows as Array<{ slug: string; name: string; is_active: boolean; last_active_at: Date | null }>
  ).map((row) => ({
    slug: row.slug,
    name: row.name,
    isActive: row.is_active,
    lastActiveAt: row.last_active_at,
  }));
}

/**
 * Igual que listAgentActivity pero a través de todas las pymes — vista de
 * plataforma para /admin (ver components/AgentNetworkVisual.tsx). Un slug de
 * agente se marca "activo" si CUALQUIER pyme le sacó un reporte reciente.
 */
export async function listAgentActivityAcrossTenants(): Promise<AgentActivityRow[]> {
  const result = await getPool().query(
    `SELECT a.slug, MIN(a.name) AS name, bool_or(a.is_active) AS is_active, MAX(r.created_at) AS last_active_at
     FROM agents a
     LEFT JOIN reports r ON r.agent_id = a.id
     GROUP BY a.slug
     ORDER BY a.slug`,
  );
  return (
    result.rows as Array<{ slug: string; name: string; is_active: boolean; last_active_at: Date | null }>
  ).map((row) => ({
    slug: row.slug,
    name: row.name,
    isActive: row.is_active,
    lastActiveAt: row.last_active_at,
  }));
}

export async function getLatestReport(tenantId: string, slug: string): Promise<ReportRow | null> {
  const result = await getPool().query(
    `SELECT r.id, a.slug, a.name AS agent_name, r.summary, r.created_at
     FROM reports r
     JOIN agents a ON a.id = r.agent_id
     WHERE a.tenant_id = $1 AND a.slug = $2
     ORDER BY r.created_at DESC
     LIMIT 1`,
    [tenantId, slug],
  );
  const row = result.rows[0] as
    | { id: string; slug: string; agent_name: string; summary: string; created_at: Date }
    | undefined;
  return row
    ? { id: row.id, slug: row.slug, agentName: row.agent_name, summary: row.summary, createdAt: row.created_at }
    : null;
}

export interface ReportDateFilter {
  /** Filtro por un dia exacto (selector de fecha existente). */
  onDate?: string;
  /** Filtro por rango (usado por "ultima semana" / "ultimo mes"), inclusive de ambos extremos. */
  from?: string;
  to?: string;
}

export async function listReports(tenantId: string, limit = 30, filter: ReportDateFilter = {}): Promise<ReportRow[]> {
  const { onDate, from, to } = filter;
  const result = await getPool().query(
    `SELECT r.id, a.slug, a.name AS agent_name, r.summary, r.created_at
     FROM reports r
     JOIN agents a ON a.id = r.agent_id
     WHERE a.tenant_id = $1
       AND ($3::date IS NULL OR r.created_at::date = $3::date)
       AND ($4::date IS NULL OR r.created_at::date >= $4::date)
       AND ($5::date IS NULL OR r.created_at::date <= $5::date)
     ORDER BY r.created_at DESC
     LIMIT $2`,
    [tenantId, limit, onDate ?? null, from ?? null, to ?? null],
  );
  return (
    result.rows as Array<{ id: string; slug: string; agent_name: string; summary: string; created_at: Date }>
  ).map((row) => ({
    id: row.id,
    slug: row.slug,
    agentName: row.agent_name,
    summary: row.summary,
    createdAt: row.created_at,
  }));
}

/** Fechas (una por dia, mas reciente primero) que tienen al menos un reporte - para el selector de fecha del historial. */
export async function listReportDates(tenantId: string, limit = 60): Promise<string[]> {
  const result = await getPool().query<{ day: string }>(
    `SELECT DISTINCT r.created_at::date::text AS day
     FROM reports r
     JOIN agents a ON a.id = r.agent_id
     WHERE a.tenant_id = $1
     ORDER BY day DESC
     LIMIT $2`,
    [tenantId, limit],
  );
  return result.rows.map((r) => r.day);
}

export async function getReportById(tenantId: string, reportId: string): Promise<ReportRow | null> {
  const result = await getPool().query(
    `SELECT r.id, a.slug, a.name AS agent_name, r.summary, r.created_at
     FROM reports r
     JOIN agents a ON a.id = r.agent_id
     WHERE a.tenant_id = $1 AND r.id = $2`,
    [tenantId, reportId],
  );
  const row = result.rows[0] as
    | { id: string; slug: string; agent_name: string; summary: string; created_at: Date }
    | undefined;
  return row
    ? { id: row.id, slug: row.slug, agentName: row.agent_name, summary: row.summary, createdAt: row.created_at }
    : null;
}

export async function listPendingApprovals(tenantId: string): Promise<PendingApprovalRow[]> {
  const result = await getPool().query(
    `SELECT ap.id, ag.slug AS agent_slug, ap.action_type, ap.payload, ap.requested_at
     FROM approvals ap
     JOIN agents ag ON ag.id = ap.agent_id
     WHERE ag.tenant_id = $1 AND ap.status = 'pending_approval'
     ORDER BY ap.requested_at ASC`,
    [tenantId],
  );
  return (
    result.rows as Array<{
      id: string;
      agent_slug: string;
      action_type: string;
      payload: Record<string, unknown>;
      requested_at: Date;
    }>
  ).map((row) => ({
    id: row.id,
    agentSlug: row.agent_slug,
    actionType: row.action_type,
    payload: row.payload,
    requestedAt: row.requested_at,
  }));
}

export async function listPendingContentReviews(tenantId: string): Promise<PendingContentReviewRow[]> {
  const result = await getPool().query(
    `SELECT cr.id, ag.slug AS agent_slug, cr.channel, cr.content_text, cr.scheduled_for, cr.requested_at
     FROM content_reviews cr
     JOIN agents ag ON ag.id = cr.agent_id
     WHERE ag.tenant_id = $1 AND cr.status = 'pending_review'
     ORDER BY cr.requested_at ASC`,
    [tenantId],
  );
  return (
    result.rows as Array<{
      id: string;
      agent_slug: string;
      channel: string;
      content_text: string;
      scheduled_for: Date | null;
      requested_at: Date;
    }>
  ).map((row) => ({
    id: row.id,
    agentSlug: row.agent_slug,
    channel: row.channel,
    contentText: row.content_text,
    scheduledFor: row.scheduled_for,
    requestedAt: row.requested_at,
  }));
}

export async function listClientUploads(tenantId: string, limit = 30): Promise<ClientUploadRow[]> {
  const result = await getPool().query(
    `SELECT id, agent_slug, uploaded_by, storage_path, file_type, caption, created_at
     FROM client_uploads
     WHERE tenant_id = $1
     ORDER BY created_at DESC
     LIMIT $2`,
    [tenantId, limit],
  );
  return (
    result.rows as Array<{
      id: string;
      agent_slug: string | null;
      uploaded_by: string;
      storage_path: string;
      file_type: ClientUploadRow['fileType'];
      caption: string | null;
      created_at: Date;
    }>
  ).map((row) => ({
    id: row.id,
    agentSlug: row.agent_slug,
    uploadedBy: row.uploaded_by,
    storagePath: row.storage_path,
    fileType: row.file_type,
    caption: row.caption,
    createdAt: row.created_at,
  }));
}

export async function insertClientUpload(input: {
  tenantId: string;
  agentSlug: string | null;
  uploadedBy: string;
  storagePath: string;
  fileType: ClientUploadRow['fileType'];
  caption: string | null;
}): Promise<void> {
  await getPool().query(
    `INSERT INTO client_uploads (tenant_id, agent_slug, uploaded_by, storage_path, file_type, caption)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [input.tenantId, input.agentSlug, input.uploadedBy, input.storagePath, input.fileType, input.caption],
  );
}
