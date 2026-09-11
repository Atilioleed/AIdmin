import { redirect } from 'next/navigation';
import { getCurrentTenant } from '../../../../lib/tenant';
import { listChatMessages } from '../../../../lib/chat';
import { getAgentProfile } from '../../../../lib/agent-profiles';
import { ChatWindow } from './ChatWindow';

export default async function ChatPage() {
  const tenant = await getCurrentTenant();
  if (!tenant) redirect('/sin-pyme');

  const [messages, profile] = await Promise.all([listChatMessages(tenant.id), getAgentProfile('ceo')]);

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4">
      <div>
        <h1 className="font-display text-3xl font-semibold text-[var(--color-ink)]">
          Chat con el <span className="text-gradient-warm">CEO</span>
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-[var(--color-ink-soft)]">
          Conversación en vivo, no la pauta diaria — pregúntale directamente por el estado del
          negocio, aprobaciones pendientes o lo que necesites saber ahora.
        </p>
      </div>

      <ChatWindow
        initialMessages={messages.map((m) => ({ id: m.id, role: m.role, content: m.content }))}
        ceoName={profile?.personaName ?? 'CEO'}
      />
    </div>
  );
}
