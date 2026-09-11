'use client';

import { useState, useTransition } from 'react';
import { acceptTermsAction } from './actions';

export function AcceptTermsCard() {
  const [checked, setChecked] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleAccept() {
    setError(null);
    startTransition(async () => {
      const result = await acceptTermsAction();
      if (result.error) setError(result.error);
    });
  }

  return (
    <div className="card overflow-hidden border-2 p-6" style={{ borderColor: 'var(--color-gold)' }}>
      <div className="flex items-start gap-3">
        <span
          className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white"
          style={{ background: 'var(--gradient-brand)' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M9 12.5 11.5 15 16 9.5M12 3l8 4v5c0 5-3.4 8.4-8 9.5C7.4 20.4 4 17 4 12V7l8-4Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
          </svg>
        </span>
        <div className="flex-1">
          <p className="font-display text-base font-semibold text-[var(--color-ink)]">Falta aceptar el contrato</p>
          <p className="mt-1 text-sm text-[var(--color-ink-soft)]">
            Antes de que tu comité empiece a trabajar de verdad, revisa y acepta los{' '}
            <a href="/terminos" target="_blank" rel="noopener noreferrer" className="font-semibold text-[var(--color-violet)] hover:text-[var(--color-coral)]">
              Términos y condiciones
            </a>{' '}
            del servicio.
          </p>
          <label className="mt-3 flex items-center gap-2 text-sm text-[var(--color-ink)]">
            <input type="checkbox" checked={checked} onChange={(e) => setChecked(e.target.checked)} />
            Leí y acepto los Términos y condiciones de AIdmin.
          </label>
          {error && <p className="mt-2 text-xs font-medium text-[var(--color-critical)]">{error}</p>}
          <button
            type="button"
            disabled={!checked || isPending}
            onClick={handleAccept}
            className="mt-4 rounded-full px-5 py-2 text-sm font-semibold text-white shadow-[var(--shadow-glow)] disabled:opacity-40"
            style={{ background: 'var(--gradient-brand)' }}
          >
            {isPending ? 'Guardando…' : 'Aceptar y continuar'}
          </button>
        </div>
      </div>
    </div>
  );
}
