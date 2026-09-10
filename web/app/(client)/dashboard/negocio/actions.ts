'use server';

import { currentUser } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { getCurrentTenant } from '../../../../lib/tenant';
import { upsertBusinessContext, type BusinessType } from '../../../../lib/business-context';

const TEXT_FIELDS = [
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

const VALID_BUSINESS_TYPES: BusinessType[] = ['producto', 'servicio', 'mixto'];

export async function saveBusinessContextAction(formData: FormData): Promise<{ error?: string }> {
  const tenant = await getCurrentTenant();
  if (!tenant) return { error: 'No hay una pyme activa en esta sesion.' };

  const values = Object.fromEntries(
    TEXT_FIELDS.map((field) => [field, String(formData.get(field) ?? '').trim()]),
  ) as Record<(typeof TEXT_FIELDS)[number], string>;

  const businessTypeRaw = String(formData.get('businessType') ?? '');
  const businessType: BusinessType = VALID_BUSINESS_TYPES.includes(businessTypeRaw as BusinessType)
    ? (businessTypeRaw as BusinessType)
    : '';

  const ownerAlertEmail = String(formData.get('ownerAlertEmail') ?? '').trim();
  if (ownerAlertEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(ownerAlertEmail)) {
    return { error: 'El correo de alertas no es válido.' };
  }

  const ownerWhatsappNumber = String(formData.get('ownerWhatsappNumber') ?? '').trim();

  const user = await currentUser();
  const updatedBy = user?.primaryEmailAddress?.emailAddress ?? user?.id ?? 'usuario del panel';

  await upsertBusinessContext(tenant.id, { ...values, businessType, ownerAlertEmail, ownerWhatsappNumber, updatedBy });

  revalidatePath('/dashboard/negocio');
  revalidatePath('/dashboard');
  return {};
}
