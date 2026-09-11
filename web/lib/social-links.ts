import { getPool } from './db';

export interface SocialLinks {
  instagram: string;
  facebook: string;
  tiktok: string;
  linkedin: string;
  xTwitter: string;
  youtube: string;
  website: string;
  notes: string;
  isMetricoolConnected: boolean;
  metricoolConnectedAt: Date | null;
  updatedAt: Date | null;
  updatedBy: string | null;
}

interface SocialLinksRow {
  instagram: string | null;
  facebook: string | null;
  tiktok: string | null;
  linkedin: string | null;
  x_twitter: string | null;
  youtube: string | null;
  website: string | null;
  notes: string | null;
  metricool_api_key: string | null;
  metricool_connected_at: Date | null;
  updated_at: Date;
  updated_by: string | null;
}

const EMPTY: SocialLinks = {
  instagram: '',
  facebook: '',
  tiktok: '',
  linkedin: '',
  xTwitter: '',
  youtube: '',
  website: '',
  notes: '',
  isMetricoolConnected: false,
  metricoolConnectedAt: null,
  updatedAt: null,
  updatedBy: null,
};

function toSocialLinks(row: SocialLinksRow): SocialLinks {
  return {
    instagram: row.instagram ?? '',
    facebook: row.facebook ?? '',
    tiktok: row.tiktok ?? '',
    linkedin: row.linkedin ?? '',
    xTwitter: row.x_twitter ?? '',
    youtube: row.youtube ?? '',
    website: row.website ?? '',
    notes: row.notes ?? '',
    isMetricoolConnected: Boolean(row.metricool_api_key),
    metricoolConnectedAt: row.metricool_connected_at,
    updatedAt: row.updated_at,
    updatedBy: row.updated_by,
  };
}

const SELECT_COLUMNS =
  'instagram, facebook, tiktok, linkedin, x_twitter, youtube, website, notes, ' +
  'metricool_api_key, metricool_connected_at, updated_at, updated_by';

export async function getSocialLinks(tenantId: string): Promise<SocialLinks> {
  const result = await getPool().query<SocialLinksRow>(
    `SELECT ${SELECT_COLUMNS} FROM social_links WHERE tenant_id = $1`,
    [tenantId],
  );
  const row = result.rows[0];
  return row ? toSocialLinks(row) : EMPTY;
}

export interface SocialLinksInput {
  instagram: string;
  facebook: string;
  tiktok: string;
  linkedin: string;
  xTwitter: string;
  youtube: string;
  website: string;
  notes: string;
  updatedBy: string;
}

export async function upsertSocialLinks(tenantId: string, input: SocialLinksInput): Promise<void> {
  await getPool().query(
    `INSERT INTO social_links
       (tenant_id, instagram, facebook, tiktok, linkedin, x_twitter, youtube, website, notes, updated_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     ON CONFLICT (tenant_id) DO UPDATE SET
       instagram = EXCLUDED.instagram,
       facebook = EXCLUDED.facebook,
       tiktok = EXCLUDED.tiktok,
       linkedin = EXCLUDED.linkedin,
       x_twitter = EXCLUDED.x_twitter,
       youtube = EXCLUDED.youtube,
       website = EXCLUDED.website,
       notes = EXCLUDED.notes,
       updated_by = EXCLUDED.updated_by`,
    [
      tenantId,
      input.instagram,
      input.facebook,
      input.tiktok,
      input.linkedin,
      input.xTwitter,
      input.youtube,
      input.website,
      input.notes,
      input.updatedBy,
    ],
  );
}

/**
 * Guarda la API key de Metricool de esta pyme (fila debe existir - se crea con un
 * upsert de campos vacios si hace falta). Nunca se vuelve a leer el valor real hacia
 * la UI, solo si esta seteada o no (ver toSocialLinks/isMetricoolConnected).
 */
export async function connectMetricool(tenantId: string, apiKey: string, updatedBy: string): Promise<void> {
  await getPool().query(
    `INSERT INTO social_links (tenant_id, metricool_api_key, metricool_connected_at, updated_by)
     VALUES ($1, $2, now(), $3)
     ON CONFLICT (tenant_id) DO UPDATE SET
       metricool_api_key = EXCLUDED.metricool_api_key,
       metricool_connected_at = now(),
       updated_by = EXCLUDED.updated_by`,
    [tenantId, apiKey, updatedBy],
  );
}

export async function disconnectMetricool(tenantId: string): Promise<void> {
  await getPool().query(
    `UPDATE social_links SET metricool_api_key = NULL, metricool_connected_at = NULL WHERE tenant_id = $1`,
    [tenantId],
  );
}
