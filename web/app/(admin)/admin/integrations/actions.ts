'use server';

import { sendTestEmail } from '../../../../lib/resend';

export async function sendTestEmailAction(formData: FormData): Promise<{ error?: string; success?: string }> {
  const to = String(formData.get('to') ?? '').trim();
  if (!to || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
    return { error: 'Escribe un correo válido.' };
  }

  const result = await sendTestEmail(to);
  if (!result.sent) {
    return { error: result.reason ?? 'No se pudo enviar.' };
  }
  return { success: `Correo de prueba enviado a ${to}.` };
}
