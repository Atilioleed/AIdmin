import { auth, currentUser } from '@clerk/nextjs/server';
import { getPool } from './db';

export interface TenantRecord {
  id: string;
  name: string;
  slug: string | null;
  rut: string | null;
  plan: 'piloto' | 'completo' | 'agencia';
  status: 'trial' | 'active' | 'paused' | 'cancelled';
  clerkOrgId: string | null;
  createdAt: Date;
}

function toTenant(row: {
  id: string;
  name: string;
  slug: string | null;
  rut: string | null;
  plan: TenantRecord['plan'];
  status: TenantRecord['status'];
  clerk_org_id: string | null;
  created_at: Date;
}): TenantRecord {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    rut: row.rut,
    plan: row.plan,
    status: row.status,
    clerkOrgId: row.clerk_org_id,
    createdAt: row.created_at,
  };
}

const SELECT_COLUMNS = 'id, name, slug, rut, plan, status, clerk_org_id, created_at';

/**
 * Resuelve el tenant de la sesion actual a partir de la Organization activa de
 * Clerk. proxy.ts ya garantiza que /dashboard/** solo se sirve con un orgId presente;
 * esto es el perimetro real de aislamiento entre pymes en cada query de datos.
 */
export async function getCurrentTenant(): Promise<TenantRecord | null> {
  const { orgId } = await auth();
  if (!orgId) return null;
  const result = await getPool().query(`SELECT ${SELECT_COLUMNS} FROM tenants WHERE clerk_org_id = $1`, [orgId]);
  const row = result.rows[0] as Parameters<typeof toTenant>[0] | undefined;
  return row ? toTenant(row) : null;
}

export async function getTenantById(tenantId: string): Promise<TenantRecord | null> {
  const result = await getPool().query(`SELECT ${SELECT_COLUMNS} FROM tenants WHERE id = $1`, [tenantId]);
  const row = result.rows[0] as Parameters<typeof toTenant>[0] | undefined;
  return row ? toTenant(row) : null;
}

export async function listTenants(): Promise<TenantRecord[]> {
  const result = await getPool().query(`SELECT ${SELECT_COLUMNS} FROM tenants ORDER BY created_at DESC`);
  return (result.rows as Parameters<typeof toTenant>[0][]).map(toTenant);
}

// slug amigable para /sitio/<slug> - minusculas, guiones, sin acentos. Se genera
// al crear la pyme desde /admin/tenants; si ya existe, se le agrega un sufijo
// numerico hasta encontrar uno libre.
function slugify(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // quita acentos (ej. "Panaderia" -> "Panaderia")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 60);
}

export async function generateUniqueTenantSlug(name: string): Promise<string> {
  const base = slugify(name) || 'pyme';
  const pool = getPool();
  let candidate = base;
  let suffix = 2;
  while (true) {
    const result = await pool.query('SELECT 1 FROM tenants WHERE slug = $1', [candidate]);
    if (result.rowCount === 0) return candidate;
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }
}

// Los admin de plataforma se identifican por correo, no por Clerk user ID (mas facil
// de gestionar). ADMIN_EMAILS acepta varios separados por coma, sin distinguir
// mayusculas/minusculas.
function adminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

/**
 * Chequeo real de autorizacion de admin - vive en cada layout/page que lo necesita,
 * no solo en proxy.ts (que no tiene el email del usuario sin una llamada extra a la
 * API de Clerk). Sigue la recomendacion de Clerk de no confiar unicamente en el
 * middleware/proxy para autorizacion fina.
 */
export async function isCurrentUserPlatformAdmin(): Promise<boolean> {
  const user = await currentUser();
  const email = user?.primaryEmailAddress?.emailAddress?.toLowerCase();
  if (!email) return false;
  return adminEmails().includes(email);
}
