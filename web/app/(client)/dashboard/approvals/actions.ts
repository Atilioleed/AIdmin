'use server';

import { currentUser } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { getPool } from '../../../../lib/db';
import { approveApproval, rejectApproval } from '../../../../lib/gates';
import { getCurrentTenant } from '../../../../lib/tenant';

async function resolvedByLabel(): Promise<string> {
  const user = await currentUser();
  return user?.primaryEmailAddress?.emailAddress ?? user?.id ?? 'usuario del panel';
}

// Verifica que el approval pertenezca al tenant de la sesion actual ANTES de dejar
// que el server action lo resuelva. Sin esto, cualquiera con un id de approval (aunque
// sea de otra pyme) podria aprobarlo/rechazarlo desde este action - es el mismo
// perimetro de aislamiento que ya se aplica en las queries de lectura.
async function assertBelongsToCurrentTenant(approvalId: string): Promise<void> {
  const tenant = await getCurrentTenant();
  if (!tenant) throw new Error('No hay una pyme activa en esta sesion.');
  const result = await getPool().query(
    `SELECT 1 FROM approvals ap JOIN agents ag ON ag.id = ap.agent_id
     WHERE ap.id = $1 AND ag.tenant_id = $2`,
    [approvalId, tenant.id],
  );
  if (result.rowCount === 0) {
    throw new Error('Ese approval no pertenece a tu pyme.');
  }
}

export async function approveApprovalAction(id: string, notes: string): Promise<void> {
  await assertBelongsToCurrentTenant(id);
  await approveApproval(id, await resolvedByLabel(), notes || undefined);
  revalidatePath('/dashboard/approvals');
}

export async function rejectApprovalAction(id: string, notes: string): Promise<void> {
  await assertBelongsToCurrentTenant(id);
  await rejectApproval(id, await resolvedByLabel(), notes || undefined);
  revalidatePath('/dashboard/approvals');
}
