// Mismo cliente liviano que agents/_shared/email.ts (duplicado a proposito: web/ y
// agents/ son paquetes npm separados, sin dependencia entre si). Usado solo para el
// boton "Enviar correo de prueba" en /admin/integrations - el envio real de alertas
// del CEO lo hace agents/_shared/email.ts.
export interface SendEmailResult {
  sent: boolean;
  reason?: string;
}

export async function sendTestEmail(to: string): Promise<SendEmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return { sent: false, reason: 'RESEND_API_KEY no configurada en el panel web.' };
  }

  const from = process.env.RESEND_FROM_EMAIL ?? 'onboarding@resend.dev';

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from,
      to: [to],
      subject: 'AIdmin — correo de prueba',
      text:
        'Este es un correo de prueba enviado desde /admin/integrations en AIdmin.\n\n' +
        'Si lo recibiste, la integración con Resend para las alertas del CEO está funcionando.',
    }),
  });

  if (!response.ok) {
    return { sent: false, reason: `Resend respondió ${response.status}: ${await response.text()}` };
  }
  return { sent: true };
}
