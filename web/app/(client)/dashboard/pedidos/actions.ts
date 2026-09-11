'use server';

import { revalidatePath } from 'next/cache';
import { currentUser } from '@clerk/nextjs/server';
import { getCurrentTenant } from '../../../../lib/tenant';
import { createOrder, updateOrderStatus, type OrderItem, type OrderStatus } from '../../../../lib/orders';

export async function createOrderAction(formData: FormData): Promise<{ error?: string }> {
  const tenant = await getCurrentTenant();
  if (!tenant) return { error: 'No hay una pyme activa en esta sesión.' };

  const customerName = String(formData.get('customerName') ?? '').trim();
  if (!customerName) return { error: 'El nombre del cliente es obligatorio.' };

  const customerEmail = String(formData.get('customerEmail') ?? '').trim() || null;
  if (customerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
    return { error: 'El correo del cliente no es válido.' };
  }
  const customerPhone = String(formData.get('customerPhone') ?? '').trim() || null;
  const shippingAddress = String(formData.get('shippingAddress') ?? '').trim() || null;
  const notes = String(formData.get('notes') ?? '').trim() || null;

  let items: OrderItem[];
  try {
    items = JSON.parse(String(formData.get('itemsJson') ?? '[]')) as OrderItem[];
  } catch {
    return { error: 'Ítems inválidos.' };
  }
  if (items.length === 0) return { error: 'Agrega al menos un producto o servicio.' };

  const user = await currentUser();
  const createdBy = user?.primaryEmailAddress?.emailAddress ?? user?.id ?? 'usuario del panel';

  await createOrder(tenant.id, { customerName, customerEmail, customerPhone, shippingAddress, items, notes, createdBy });

  revalidatePath('/dashboard/pedidos');
  return {};
}

export async function updateOrderStatusAction(
  orderId: string,
  status: OrderStatus,
  trackingInfo: string,
): Promise<{ error?: string; emailSent?: boolean; emailReason?: string }> {
  const tenant = await getCurrentTenant();
  if (!tenant) return { error: 'No hay una pyme activa en esta sesión.' };

  const result = await updateOrderStatus(tenant.id, orderId, tenant.name, {
    status,
    trackingInfo: trackingInfo.trim() || null,
  });

  revalidatePath('/dashboard/pedidos');
  return { emailSent: result.emailSent, emailReason: result.emailReason };
}
