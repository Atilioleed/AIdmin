'use server';

import { currentUser } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { getCurrentTenant } from '../../../../lib/tenant';
import { upsertBusinessContext } from '../../../../lib/business-context';

const FIELDS = [
  'objective',
  'problem',
  'productsServices',
  'targetMarket',
  'revenueModel',
  'capitalStock',
  'innovation',
  'competitors',
  'scalability',
] as const;

export async function saveBusinessContextAction(formData: FormData): Promise<{ error?: string }> {
  const tenant = await getCurrentTenant();
  if (!tenant) return { error: 'No hay una pyme activa en esta sesion.' };

  const values = Object.fromEntries(
    FIELDS.map((field) => [field, String(formData.get(field) ?? '').trim()]),
  ) as Record<(typeof FIELDS)[number], string>;

  const user = await currentUser();
  const updatedBy = user?.primaryEmailAddress?.emailAddress ?? user?.id ?? 'usuario del panel';

  await upsertBusinessContext(tenant.id, { ...values, updatedBy });

  revalidatePath('/dashboard/negocio');
  return {};
}
