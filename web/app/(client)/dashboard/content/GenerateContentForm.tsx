'use client';

import { useRef, useState, useTransition } from 'react';
import { AgentAvatar } from '../../../../components/AgentAvatar';
import { generateContentAction } from './actions';

const CHANNELS = ['instagram', 'facebook', 'tiktok', 'linkedin', 'x', 'youtube'];

export function GenerateContentForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setError(null);
    setSuccess(false);
    startTransition(async () => {
      const result = await generateContentAction(formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      formRef.current?.reset();
      setSuccess(true);
    });
  }

  return (
    <div className="card p-5">
      <div className="flex items-center gap-3">
        <AgentAvatar agent="marketing" size={40} />
        <div>
          <p className="font-display text-base font-semibold text-[var(--color-ink)]">Pídele contenido a Marketing</p>
          <p className="text-xs text-[var(--color-ink-soft)]">
            Como community manager, te redacta un borrador al toque — queda pendiente de tu
            aprobación abajo, como cualquier otro post.
          </p>
        </div>
      </div>

      <form ref={formRef} action={handleSubmit} className="mt-4 flex flex-wrap items-end gap-3">
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-[var(--color-ink-soft)]">Red</label>
          <select
            name="channel"
            defaultValue="instagram"
            className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-sunken)] px-3 py-2 text-sm capitalize text-[var(--color-ink)] outline-none focus:border-transparent focus:ring-2 focus:ring-[var(--color-violet)]/40"
          >
            {CHANNELS.map((c) => (
              <option key={c} value={c} className="capitalize">
                {c}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label className="mb-1.5 block text-xs font-semibold text-[var(--color-ink-soft)]">¿Sobre qué?</label>
          <input
            name="brief"
            required
            placeholder="Ej: 20% de descuento esta semana en toda la tienda"
            className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-sunken)] px-3 py-2 text-sm text-[var(--color-ink)] outline-none focus:border-transparent focus:ring-2 focus:ring-[var(--color-violet)]/40"
          />
        </div>
        <button
          type="submit"
          disabled={isPending}
          className="rounded-full px-5 py-2.5 text-sm font-semibold text-white shadow-[var(--shadow-glow)] disabled:opacity-50"
          style={{ background: 'var(--gradient-brand)' }}
        >
          {isPending ? 'Generando…' : 'Generar'}
        </button>
      </form>
      {error && <p className="mt-2 text-xs font-medium text-[var(--color-critical)]">{error}</p>}
      {success && <p className="mt-2 text-xs font-medium text-[var(--color-good)]">Listo, lo agregué a pendientes abajo.</p>}
    </div>
  );
}
