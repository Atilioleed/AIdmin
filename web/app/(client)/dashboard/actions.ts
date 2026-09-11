'use server';

import { revalidatePath } from 'next/cache';
import { currentUser } from '@clerk/nextjs/server';
import { getCurrentTenant } from '../../../lib/tenant';
import { acceptTerms } from '../../../lib/tenant';

export async function acceptTermsAction(): Promise<{ error?: string }> {
  const tenant = await getCurrentTenant();
  if (!tenant) return { error: 'No hay una pyme activa en esta sesión.' };

  const user = await currentUser();
  const acceptedBy = user?.primaryEmailAddress?.emailAddress ?? user?.id ?? 'usuario del panel';

  await acceptTerms(tenant.id, acceptedBy);

  revalidatePath('/dashboard');
  return {};
}
