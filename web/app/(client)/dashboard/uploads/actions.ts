'use server';

import { currentUser } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { insertClientUpload } from '../../../../lib/queries.js';
import { getCurrentTenant } from '../../../../lib/tenant.js';
import { getUploadsStorage, validateUpload } from '../../../../lib/uploads-storage.js';

export async function uploadClientFileAction(formData: FormData): Promise<{ error?: string }> {
  const tenant = await getCurrentTenant();
  if (!tenant) return { error: 'No hay una pyme activa en esta sesion.' };

  const file = formData.get('file');
  if (!(file instanceof File) || file.size === 0) {
    return { error: 'Selecciona un archivo.' };
  }

  const validation = validateUpload(file);
  if (!validation.ok) {
    return { error: validation.error };
  }

  const agentSlugRaw = formData.get('agentSlug');
  const agentSlug = typeof agentSlugRaw === 'string' && agentSlugRaw !== 'all' ? agentSlugRaw : null;
  const captionRaw = formData.get('caption');
  const caption = typeof captionRaw === 'string' && captionRaw.trim() ? captionRaw.trim() : null;

  const user = await currentUser();
  const uploadedBy = user?.primaryEmailAddress?.emailAddress ?? user?.id ?? 'usuario del panel';

  const buffer = Buffer.from(await file.arrayBuffer());
  const storage = getUploadsStorage();
  const storagePath = await storage.save(buffer, file.name);

  await insertClientUpload({
    tenantId: tenant.id,
    agentSlug,
    uploadedBy,
    storagePath,
    fileType: validation.fileType,
    caption,
  });

  revalidatePath('/dashboard/uploads');
  return {};
}
