'use server';

import { currentUser } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { getCurrentTenant } from '../../../../lib/tenant';
import { upsertTenantWebsite, getTenantWebsite } from '../../../../lib/tenant-websites';
import { getUploadsStorage, validateUpload } from '../../../../lib/uploads-storage';
import { SITE_TEMPLATE_REGISTRY } from '../../../../components/site-templates/registry';

export async function saveTenantWebsiteAction(formData: FormData): Promise<{ error?: string }> {
  const tenant = await getCurrentTenant();
  if (!tenant) return { error: 'No hay una pyme activa en esta sesion.' };

  const templateSlug = String(formData.get('templateSlug') ?? '');
  if (!(templateSlug in SITE_TEMPLATE_REGISTRY)) return { error: 'Elige una plantilla valida.' };

  const businessNameOverride = String(formData.get('businessNameOverride') ?? '').trim();
  const tagline = String(formData.get('tagline') ?? '').trim();
  const colorPrimary = String(formData.get('colorPrimary') ?? '#6a4cff');
  const colorSecondary = String(formData.get('colorSecondary') ?? '#ff8a5b');
  const colorBackground = String(formData.get('colorBackground') ?? '#ffffff');
  const published = formData.get('published') === 'on';

  let logoStoragePath: string | null = (await getTenantWebsite(tenant.id))?.logoStoragePath ?? null;
  const logoFile = formData.get('logo');
  if (logoFile instanceof File && logoFile.size > 0) {
    const validation = validateUpload(logoFile);
    if (!validation.ok) return { error: validation.error };
    const buffer = Buffer.from(await logoFile.arrayBuffer());
    logoStoragePath = await getUploadsStorage().save(buffer, logoFile.name);
  }

  const user = await currentUser();
  const updatedBy = user?.primaryEmailAddress?.emailAddress ?? user?.id ?? 'usuario del panel';

  await upsertTenantWebsite(tenant.id, {
    templateSlug,
    businessNameOverride,
    tagline,
    logoStoragePath,
    colorPrimary,
    colorSecondary,
    colorBackground,
    published,
    updatedBy,
  });

  revalidatePath('/dashboard/sitio');
  revalidatePath('/dashboard');
  return {};
}
