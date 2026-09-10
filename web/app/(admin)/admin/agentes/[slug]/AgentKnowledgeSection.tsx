'use client';

import { useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { AgentKnowledgeItem } from '../../../../../lib/agent-knowledge';
import type { AgentProfileSlug } from '../../../../../lib/agent-profiles';
import { addKnowledgeAction, deleteKnowledgeAction } from './knowledge-actions';

const inputClass =
  'w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-sunken)] px-3 py-2 text-sm text-[var(--color-ink)] outline-none transition-all focus:border-transparent focus:ring-2 focus:ring-[var(--color-violet)]/40';

export function AgentKnowledgeSection({
  slug,
  items,
}: {
  slug: AgentProfileSlug;
  items: AgentKnowledgeItem[];
}) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [type, setType] = useState<'document' | 'link'>('link');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await addKnowledgeAction(slug, formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      formRef.current?.reset();
      setType('link');
      router.refresh();
    });
  }

  function handleDelete(id: string) {
    setDeletingId(id);
    startTransition(async () => {
      await deleteKnowledgeAction(slug, id);
      setDeletingId(null);
      router.refresh();
    });
  }

  return (
    <div className="card flex flex-col gap-6 p-6">
      <div>
        <h2 className="font-display text-lg font-semibold text-[var(--color-ink)]">Base de conocimiento</h2>
        <p className="mt-1 text-sm text-[var(--color-ink-soft)]">
          Documentos y links de referencia que este gerente puede consultar al trabajar — guías,
          normativa, precios de referencia, lo que sea útil. Aplica a todas las pymes.
        </p>
      </div>

      {items.length > 0 ? (
        <ul className="flex flex-col gap-2">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex items-start justify-between gap-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-sunken)] px-3 py-2.5"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-[var(--color-violet)]/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--color-violet)]">
                    {item.type === 'document' ? 'Documento' : 'Link'}
                  </span>
                  <span className="truncate text-sm font-medium text-[var(--color-ink)]">{item.title}</span>
                </div>
                {item.type === 'link' ? (
                  <a
                    href={item.urlOrPath}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-0.5 block truncate text-xs text-[var(--color-ink-faint)] hover:text-[var(--color-violet)]"
                  >
                    {item.urlOrPath}
                  </a>
                ) : (
                  <a
                    href={`/${item.urlOrPath}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-0.5 block truncate text-xs text-[var(--color-ink-faint)] hover:text-[var(--color-violet)]"
                  >
                    Ver archivo
                  </a>
                )}
                {item.description && (
                  <p className="mt-1 text-xs text-[var(--color-ink-soft)]">{item.description}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => handleDelete(item.id)}
                disabled={isPending && deletingId === item.id}
                className="shrink-0 rounded-lg border border-[var(--color-border)] px-2.5 py-1.5 text-xs font-semibold text-[var(--color-ink-faint)] transition-colors hover:border-[var(--color-critical)] hover:text-[var(--color-critical)] disabled:opacity-30"
              >
                {isPending && deletingId === item.id ? '…' : 'Eliminar'}
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-[var(--color-ink-faint)]">Todavía no hay nada cargado para este gerente.</p>
      )}

      <form ref={formRef} action={handleSubmit} className="flex flex-col gap-3 border-t border-[var(--color-border)] pt-5">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setType('link')}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
              type === 'link'
                ? 'text-white'
                : 'border border-[var(--color-border)] text-[var(--color-ink-soft)]'
            }`}
            style={type === 'link' ? { background: 'var(--gradient-brand)' } : undefined}
          >
            Link
          </button>
          <button
            type="button"
            onClick={() => setType('document')}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
              type === 'document'
                ? 'text-white'
                : 'border border-[var(--color-border)] text-[var(--color-ink-soft)]'
            }`}
            style={type === 'document' ? { background: 'var(--gradient-brand)' } : undefined}
          >
            Documento
          </button>
          <input type="hidden" name="type" value={type} />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-[var(--color-ink-soft)]">Título</label>
          <input name="title" required className={inputClass} placeholder="Ej: Checklist de cumplimiento SII" />
        </div>

        {type === 'link' ? (
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-[var(--color-ink-soft)]">URL</label>
            <input name="url" type="url" required className={inputClass} placeholder="https://..." />
          </div>
        ) : (
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-[var(--color-ink-soft)]">
              Archivo (foto, PDF, doc — máx. 10MB)
            </label>
            <input name="file" type="file" required className="w-full text-sm" />
          </div>
        )}

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-[var(--color-ink-soft)]">
            Descripción <span className="font-normal text-[var(--color-ink-faint)]">(opcional)</span>
          </label>
          <textarea name="description" rows={2} className={inputClass} placeholder="Para qué sirve, cuándo usarlo." />
        </div>

        {error && <p className="text-xs font-medium text-[var(--color-critical)]">{error}</p>}

        <button
          type="submit"
          disabled={isPending}
          className="self-start rounded-full px-5 py-2 text-sm font-semibold text-white shadow-[var(--shadow-glow)] transition-transform hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
          style={{ background: 'var(--gradient-brand)' }}
        >
          {isPending && deletingId === null ? 'Agregando…' : 'Agregar'}
        </button>
      </form>
    </div>
  );
}
