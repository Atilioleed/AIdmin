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
    updatedAt: row.updated_at,
    updatedBy: row.updated_by,
  };
}

export async function getSocialLinks(tenantId: string): Promise<SocialLinks> {
  const result = await getPool().query<SocialLinksRow>(
    `SELECT instagram, facebook, tiktok, linkedin, x_twitter, youtube, website, notes, updated_at, updated_by
     FROM social_links WHERE tenant_id = $1`,
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
