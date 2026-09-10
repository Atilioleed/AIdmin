'use client';

import { useState, useTransition } from 'react';
import { sendTestEmailAction } from './actions';

export function TestEmailForm() {
  const [message, setMessage] = useState<{ kind: 'error' | 'success'; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setMessage(null);
    startTransition(async () => {
      const result = await sendTestEmailAction(formData);
      if (result.error) {
        setMessage({ kind: 'error', text: result.error });
        return;
      }
      setMessage({ kind: 'success', text: result.success ?? 'Enviado.' });
    });
  }

  return (
    <form action={handleSubmit} className="flex flex-wrap items-end gap-3">
      <div className="flex-1">
        <label className="mb-1.5 block text-xs font-semibold text-[var(--color-ink-soft)]">
          Enviar correo de prueba a
        </label>
        <input
          name="to"
          type="email"
          required
          placeholder="tu-correo@empresa.cl"
          className="w-full max-w-xs rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-sunken)] px-3 py-2 text-sm text-[var(--color-ink)] outline-none focus:border-transparent focus:ring-2 focus:ring-[var(--color-violet)]/40"
        />
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="rounded-full px-4 py-2 text-sm font-semibold text-white shadow-[var(--shadow-glow)] disabled:opacity-50"
        style={{ background: 'var(--gradient-brand)' }}
      >
        {isPending ? 'Enviando…' : 'Enviar prueba'}
      </button>
      {message && (
        <p
          className="w-full text-xs font-medium"
          style={{ color: message.kind === 'error' ? 'var(--color-critical)' : 'var(--color-good)' }}
        >
          {message.text}
        </p>
      )}
    </form>
  );
}
