'use server';

import { revalidatePath } from 'next/cache';
import { updateTenantDailyCap } from '../../../../../lib/agent-usage';

export async function updateDailyCapAction(tenantId: string, formData: FormData): Promise<{ error?: string }> {
  const raw = String(formData.get('capTokens') ?? '').trim();
  const capTokens = Number(raw);

  if (!Number.isFinite(capTokens) || capTokens < 1000) {
    return { error: 'El tope debe ser un número mayor a 1.000 tokens.' };
  }

  await updateTenantDailyCap(tenantId, Math.round(capTokens));

  revalidatePath(`/admin/tenants/${tenantId}`);
  return {};
}
