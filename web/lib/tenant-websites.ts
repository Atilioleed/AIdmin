import { getPool } from './db';

export interface TenantWebsite {
  templateSlug: string;
  businessNameOverride: string;
  tagline: string;
  logoStoragePath: string | null;
  colorPrimary: string;
  colorSecondary: string;
  colorBackground: string;
  published: boolean;
  customDomain: string;
  updatedAt: Date | null;
  updatedBy: string | null;
}

interface TenantWebsiteRow {
  template_slug: string;
  business_name_override: string | null;
  tagline: string | null;
  logo_storage_path: string | null;
  color_primary: string;
  color_secondary: string;
  color_background: string;
  published: boolean;
  custom_domain: string | null;
  updated_at: Date;
  updated_by: string | null;
}

const COLUMNS =
  'template_slug, business_name_override, tagline, logo_storage_path, color_primary, ' +
  'color_secondary, color_background, published, custom_domain, updated_at, updated_by';

function toTenantWebsite(row: TenantWebsiteRow): TenantWebsite {
  return {
    templateSlug: row.template_slug,
    businessNameOverride: row.business_name_override ?? '',
    tagline: row.tagline ?? '',
    logoStoragePath: row.logo_storage_path,
    colorPrimary: row.color_primary,
    colorSecondary: row.color_secondary,
    colorBackground: row.color_background,
    published: row.published,
    customDomain: row.custom_domain ?? '',
    updatedAt: row.updated_at,
    updatedBy: row.updated_by,
  };
}

export async function getTenantWebsite(tenantId: string): Promise<TenantWebsite | null> {
  const result = await getPool().query<TenantWebsiteRow>(
    `SELECT ${COLUMNS} FROM tenant_websites WHERE tenant_id = $1`,
    [tenantId],
  );
  const row = result.rows[0];
  return row ? toTenantWebsite(row) : null;
}

// Para la ruta publica /sitio/[tenantSlug] - solo devuelve el sitio si esta publicado.
export async function getPublishedTenantWebsiteBySlug(
  tenantSlug: string,
): Promise<{ tenantId: string; tenantName: string; website: TenantWebsite } | null> {
  const result = await getPool().query<TenantWebsiteRow & { tenant_id: string; tenant_name: string }>(
    `SELECT tw.template_slug, tw.business_name_override, tw.tagline, tw.logo_storage_path,
            tw.color_primary, tw.color_secondary, tw.color_background, tw.published,
            tw.custom_domain, tw.updated_at, tw.updated_by, t.id AS tenant_id, t.name AS tenant_name
     FROM tenant_websites tw
     JOIN tenants t ON t.id = tw.tenant_id
     WHERE t.slug = $1 AND tw.published = TRUE`,
    [tenantSlug],
  );
  const row = result.rows[0];
  if (!row) return null;
  return { tenantId: row.tenant_id, tenantName: row.tenant_name, website: toTenantWebsite(row) };
}

/** Para app/sitemap.ts - un slug + fecha por cada sitio publico ya publicado. */
export async function listPublishedTenantSlugs(): Promise<{ slug: string; updatedAt: Date }[]> {
  const result = await getPool().query<{ slug: string; updated_at: Date }>(
    `SELECT t.slug, tw.updated_at
     FROM tenant_websites tw
     JOIN tenants t ON t.id = tw.tenant_id
     WHERE tw.published = TRUE AND t.slug IS NOT NULL`,
  );
  return result.rows.map((row) => ({ slug: row.slug, updatedAt: row.updated_at }));
}

export interface TenantWebsiteInput {
  templateSlug: string;
  businessNameOverride: string;
  tagline: string;
  logoStoragePath: string | null;
  colorPrimary: string;
  colorSecondary: string;
  colorBackground: string;
  published: boolean;
  customDomain: string;
  updatedBy: string;
}

export async function upsertTenantWebsite(tenantId: string, input: TenantWebsiteInput): Promise<void> {
  await getPool().query(
    `INSERT INTO tenant_websites
       (tenant_id, template_slug, business_name_override, tagline, logo_storage_path,
        color_primary, color_secondary, color_background, published, custom_domain, updated_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
     ON CONFLICT (tenant_id) DO UPDATE SET
       template_slug = EXCLUDED.template_slug,
       business_name_override = EXCLUDED.business_name_override,
       tagline = EXCLUDED.tagline,
       logo_storage_path = EXCLUDED.logo_storage_path,
       color_primary = EXCLUDED.color_primary,
       color_secondary = EXCLUDED.color_secondary,
       color_background = EXCLUDED.color_background,
       published = EXCLUDED.published,
       custom_domain = EXCLUDED.custom_domain,
       updated_by = EXCLUDED.updated_by`,
    [
      tenantId,
      input.templateSlug,
      input.businessNameOverride,
      input.tagline,
      input.logoStoragePath,
      input.colorPrimary,
      input.colorSecondary,
      input.colorBackground,
      input.published,
      input.customDomain,
      input.updatedBy,
    ],
  );
}
