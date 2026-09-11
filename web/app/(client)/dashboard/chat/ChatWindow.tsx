'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { AgentAvatar } from '../../../../components/AgentAvatar';
import { MarkdownContent } from '../../../../components/MarkdownContent';
import { sendChatMessageAction } from './actions';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export function ChatWindow({ initialMessages, ceoName }: { initialMessages: Message[]; ceoName: string }) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  function handleSubmit(formData: FormData) {
    const text = String(formData.get('message') ?? '').trim();
    if (!text) return;

    setError(null);
    const userMsg: Message = { id: `local-${Date.now()}`, role: 'user', content: text };
    setMessages((prev) => [...prev, userMsg]);
    formRef.current?.reset();

    startTransition(async () => {
      const result = await sendChatMessageAction(formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      if (result.reply) {
        setMessages((prev) => [...prev, { id: `local-${Date.now()}-r`, role: 'assistant', content: result.reply! }]);
      }
    });
  }

  return (
    <div className="card flex h-[65vh] flex-col overflow-hidden p-0">
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
            <AgentAvatar agent="ceo" size={64} />
            <p className="max-w-sm text-sm text-[var(--color-ink-faint)]">
              Pregúntale al {ceoName} cómo va tu negocio, qué está pendiente de aprobar, o pídele un
              resumen rápido — responde con el contexto real de tu pyme.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {messages.map((m) => (
              <div key={m.id} className={`flex items-end gap-2.5 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                {m.role === 'assistant' && <AgentAvatar agent="ceo" size={32} animated={false} />}
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    m.role === 'user'
                      ? 'whitespace-pre-wrap text-white'
                      : 'bg-[var(--color-surface-sunken)] text-[var(--color-ink-soft)]'
                  }`}
                  style={m.role === 'user' ? { background: 'var(--gradient-brand)' } : undefined}
                >
                  {m.role === 'assistant' ? <MarkdownContent text={m.content} compact /> : m.content}
                </div>
              </div>
            ))}
            {isPending && (
              <div className="flex items-end gap-2.5">
                <AgentAvatar agent="ceo" size={32} animated={false} />
                <div className="rounded-2xl bg-[var(--color-surface-sunken)] px-4 py-2.5 text-sm text-[var(--color-ink-faint)]">
                  Escribiendo…
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <form
        ref={formRef}
        action={handleSubmit}
        className="flex items-end gap-3 border-t border-[var(--color-border-soft)] p-4"
      >
        <textarea
          name="message"
          required
          rows={1}
          placeholder="Escríbele al CEO…"
          className="flex-1 resize-none rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-sunken)] px-3.5 py-2.5 text-sm text-[var(--color-ink)] outline-none focus:border-transparent focus:ring-2 focus:ring-[var(--color-violet)]/40"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              formRef.current?.requestSubmit();
            }
          }}
        />
        <button
          type="submit"
          disabled={isPending}
          className="shrink-0 rounded-full px-5 py-2.5 text-sm font-semibold text-white shadow-[var(--shadow-glow)] disabled:opacity-50"
          style={{ background: 'var(--gradient-brand)' }}
        >
          Enviar
        </button>
      </form>
      {error && <p className="px-4 pb-3 text-xs font-medium text-[var(--color-critical)]">{error}</p>}
    </div>
  );
}
