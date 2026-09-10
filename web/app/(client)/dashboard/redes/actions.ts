'use server';

import { currentUser } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { getCurrentTenant } from '../../../../lib/tenant';
import { upsertSocialLinks } from '../../../../lib/social-links';

const FIELDS = ['instagram', 'facebook', 'tiktok', 'linkedin', 'xTwitter', 'youtube', 'website', 'notes'] as const;

export async function saveSocialLinksAction(formData: FormData): Promise<{ error?: string }> {
  const tenant = await getCurrentTenant();
  if (!tenant) return { error: 'No hay una pyme activa en esta sesion.' };

  const values = Object.fromEntries(
    FIELDS.map((field) => [field, String(formData.get(field) ?? '').trim()]),
  ) as Record<(typeof FIELDS)[number], string>;

  const user = await currentUser();
  const updatedBy = user?.primaryEmailAddress?.emailAddress ?? user?.id ?? 'usuario del panel';

  await upsertSocialLinks(tenant.id, { ...values, updatedBy });

  revalidatePath('/dashboard/redes');
  return {};
}
