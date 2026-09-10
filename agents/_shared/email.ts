/**
 * Cliente delgado sobre la API REST de Resend (sin SDK - un solo fetch, evita
 * agregar una dependencia npm para un caso de uso tan chico). Usado por el CEO
 * para avisarle al dueño de la pyme por correo cuando hay algo pendiente de
 * revision humana (ver agents/ceo/index.ts). Si RESEND_API_KEY esta vacio, el
 * envio queda deshabilitado (retorna sin lanzar) - permite que el resto del
 * pipeline del CEO funcione sin bloquear en que el usuario cree la cuenta de
 * Resend.
 */
export interface SendOwnerAlertResult {
  sent: boolean;
  reason?: string;
}

export async function sendOwnerAlertEmail(
  to: string,
  subject: string,
  body: string,
): Promise<SendOwnerAlertResult> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return { sent: false, reason: 'RESEND_API_KEY no configurada - envio omitido.' };
  }

  const from = process.env.RESEND_FROM_EMAIL ?? 'onboarding@resend.dev';

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject,
      text: body,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    return { sent: false, reason: `Resend respondio ${response.status}: ${errorText}` };
  }

  return { sent: true };
}
