'use server';

import { revalidatePath } from 'next/cache';
import { getCurrentTenant } from '../../../../lib/tenant';
import { listChatMessages, insertChatMessage } from '../../../../lib/chat';
import { askCeo } from '../../../../lib/ceo-chat';

export async function sendChatMessageAction(formData: FormData): Promise<{ error?: string; reply?: string }> {
  const message = String(formData.get('message') ?? '').trim();
  if (!message) return { error: 'Escribe un mensaje.' };
  if (message.length > 2000) return { error: 'El mensaje es demasiado largo (máx. 2000 caracteres).' };

  const tenant = await getCurrentTenant();
  if (!tenant) return { error: 'No hay una pyme activa en esta sesión.' };

  await insertChatMessage(tenant.id, 'user', message);

  let reply: string;
  try {
    const history = await listChatMessages(tenant.id, 20);
    const result = await askCeo(
      tenant.id,
      history.map((m) => ({ role: m.role, content: m.content })),
    );
    reply = result.reply;
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    reply = `No pude responder ahora mismo (${reason}). Si esto sigue pasando, avísale a soporte.`;
  }
  await insertChatMessage(tenant.id, 'assistant', reply);

  revalidatePath('/dashboard/chat');
  return { reply };
}
