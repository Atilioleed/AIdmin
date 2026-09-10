'use server';

import { revalidatePath } from 'next/cache';
import { getPool } from '../../../../lib/db.js';

const AGENT_SEEDS = [
  ['desarrollo', 'Gerente de Desarrollo', 'Monitoreo de infraestructura, errores y costos de hosting.', 'act_low_risk'],
  [
    'ceo',
    'Gerente General (CEO)',
    'Lee los reportes recientes de los otros agentes y las aprobaciones pendientes; arma la pauta de comite diaria.',
    'recommend_only',
  ],
  [
    'marketing',
    'Gerente de Marketing',
    'Gestiona redes, contenido y campanas via Metricool. Contenido organico pasa por content-gate, gasto por approval-gate.',
    'act_with_gate',
  ],
  ['finanzas', 'Gerente de Finanzas', 'Flujo de caja, conciliacion y cuentas por pagar.', 'propose_only'],
  [
    'producto',
    'Gerente de Producto',
    'Catalogo, costos y precios; investiga mercado y competencia para proponer mejoras.',
    'propose_only',
  ],
  [
    'legal',
    'Gerente Legal',
    'Revisa el catalogo de documentos legales por cumplimiento; coordina con Producto en propuestas nuevas.',
    'propose_only',
  ],
] as const;

export async function createTenantAction(formData: FormData): Promise<{ error?: string }> {
  const name = String(formData.get('name') ?? '').trim();
  const rut = String(formData.get('rut') ?? '').trim() || null;
  const plan = String(formData.get('plan') ?? 'completo');
  const clerkOrgId = String(formData.get('clerkOrgId') ?? '').trim() || null;

  if (!name) return { error: 'El nombre es obligatorio.' };
  if (!['piloto', 'completo', 'agencia'].includes(plan)) return { error: 'Plan invalido.' };

  const pool = getPool();
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const tenantResult = await client.query<{ id: string }>(
      `INSERT INTO tenants (name, rut, plan, status, clerk_org_id)
       VALUES ($1, $2, $3, 'trial', $4)
       RETURNING id`,
      [name, rut, plan, clerkOrgId],
    );
    const tenantId = tenantResult.rows[0]?.id;
    for (const [slug, agentName, roleDescription, autonomyLevel] of AGENT_SEEDS) {
      await client.query(
        `INSERT INTO agents (tenant_id, slug, name, role_description, autonomy_level, is_active)
         VALUES ($1, $2, $3, $4, $5, TRUE)`,
        [tenantId, slug, agentName, roleDescription, autonomyLevel],
      );
    }
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    const message = error instanceof Error ? error.message : 'Error desconocido';
    if (message.includes('clerk_org_id')) {
      return { error: 'Ya existe una pyme con ese Clerk Organization ID.' };
    }
    return { error: message };
  } finally {
    client.release();
  }

  revalidatePath('/admin/tenants');
  return {};
}
