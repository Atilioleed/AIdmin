'use server';

import { currentUser } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { getPool } from '../../../../lib/db.js';
import { approveContentReview, rejectContentReview } from '../../../../lib/gates.js';
import { getCurrentTenant } from '../../../../lib/tenant.js';

async function resolvedByLabel(): Promise<string> {
  const user = await currentUser();
  return user?.primaryEmailAddress?.emailAddress ?? user?.id ?? 'usuario del panel';
}

async function assertBelongsToCurrentTenant(contentReviewId: string): Promise<void> {
  const tenant = await getCurrentTenant();
  if (!tenant) throw new Error('No hay una pyme activa en esta sesion.');
  const result = await getPool().query(
    `SELECT 1 FROM content_reviews cr JOIN agents ag ON ag.id = cr.agent_id
     WHERE cr.id = $1 AND ag.tenant_id = $2`,
    [contentReviewId, tenant.id],
  );
  if (result.rowCount === 0) {
    throw new Error('Ese contenido no pertenece a tu pyme.');
  }
}

export async function approveContentAction(id: string, notes: string): Promise<void> {
  await assertBelongsToCurrentTenant(id);
  await approveContentReview(id, await resolvedByLabel(), notes || undefined);
  revalidatePath('/dashboard/content');
}

export async function rejectContentAction(id: string, notes: string): Promise<void> {
  await assertBelongsToCurrentTenant(id);
  await rejectContentReview(id, await resolvedByLabel(), notes || undefined);
  revalidatePath('/dashboard/content');
}
