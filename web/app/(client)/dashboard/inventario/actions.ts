'use server';

import { revalidatePath } from 'next/cache';
import { getCurrentTenant } from '../../../../lib/tenant';
import { createProduct, setProductActive, setCoverPhoto } from '../../../../lib/products';
import { getUploadsStorage, validateUpload } from '../../../../lib/uploads-storage';

export async function createProductAction(formData: FormData): Promise<{ error?: string }> {
  const tenant = await getCurrentTenant();
  if (!tenant) return { error: 'No hay una pyme activa en esta sesion.' };

  const name = String(formData.get('name') ?? '').trim();
  const description = String(formData.get('description') ?? '').trim() || null;
  const priceClp = Number(formData.get('priceClp'));
  const costPriceRaw = String(formData.get('costPriceClp') ?? '').trim();
  const costPriceClp = costPriceRaw ? Number(costPriceRaw) : null;
  const stockQuantity = Number(formData.get('stockQuantity') ?? 0);
  const safetyStockThreshold = Number(formData.get('safetyStockThreshold') ?? 0);

  if (!name) return { error: 'El nombre es obligatorio.' };
  if (!Number.isFinite(priceClp) || priceClp < 0) return { error: 'Precio invalido.' };
  if (costPriceClp !== null && (!Number.isFinite(costPriceClp) || costPriceClp < 0)) {
    return { error: 'Precio de costo invalido.' };
  }
  if (!Number.isFinite(stockQuantity) || stockQuantity < 0) return { error: 'Stock invalido.' };
  if (!Number.isFinite(safetyStockThreshold) || safetyStockThreshold < 0) {
    return { error: 'Stock de seguridad invalido.' };
  }

  const photoStoragePaths: string[] = [];
  const photos = formData.getAll('photos');
  for (const photo of photos) {
    if (!(photo instanceof File) || photo.size === 0) continue;
    const validation = validateUpload(photo);
    if (!validation.ok) return { error: validation.error };
    const buffer = Buffer.from(await photo.arrayBuffer());
    photoStoragePaths.push(await getUploadsStorage().save(buffer, photo.name));
  }

  await createProduct(tenant.id, {
    name,
    description,
    priceClp: Math.round(priceClp),
    costPriceClp: costPriceClp !== null ? Math.round(costPriceClp) : null,
    stockQuantity: Math.round(stockQuantity),
    safetyStockThreshold: Math.round(safetyStockThreshold),
    photoStoragePaths,
    coverPhotoIndex: 0,
  });

  revalidatePath('/dashboard/inventario');
  revalidatePath('/dashboard');
  return {};
}

export async function toggleProductActiveAction(productId: string, isActive: boolean): Promise<void> {
  const tenant = await getCurrentTenant();
  if (!tenant) return;
  await setProductActive(tenant.id, productId, isActive);
  revalidatePath('/dashboard/inventario');
}

export async function setCoverPhotoAction(productId: string, coverPhotoIndex: number): Promise<void> {
  const tenant = await getCurrentTenant();
  if (!tenant) return;
  await setCoverPhoto(tenant.id, productId, coverPhotoIndex);
  revalidatePath('/dashboard/inventario');
  revalidatePath('/dashboard/sitio');
}
