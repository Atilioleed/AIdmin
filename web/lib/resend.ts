// Mismo cliente liviano que agents/_shared/email.ts (duplicado a proposito: web/ y
// agents/ son paquetes npm separados, sin dependencia entre si). Usado para el boton
// "Enviar correo de prueba" en /admin/integrations y para los correos automaticos al
// cliente final de cada pyme cuando cambia el estado de un pedido (ver lib/orders.ts).
export interface SendEmailResult {
  sent: boolean;
  reason?: string;
}

export async function sendEmail(to: string, subject: string, text: string): Promise<SendEmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return { sent: false, reason: 'RESEND_API_KEY no configurada en el panel web.' };
  }

  const from = process.env.RESEND_FROM_EMAIL ?? 'onboarding@resend.dev';

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from, to: [to], subject, text }),
  });

  if (!response.ok) {
    return { sent: false, reason: `Resend respondió ${response.status}: ${await response.text()}` };
  }
  return { sent: true };
}

export async function sendTestEmail(to: string): Promise<SendEmailResult> {
  return sendEmail(
    to,
    'AIdmin — correo de prueba',
    'Este es un correo de prueba enviado desde /admin/integrations en AIdmin.\n\n' +
      'Si lo recibiste, la integración con Resend está funcionando.',
  );
}
