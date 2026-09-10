'use client';

import { useRef, useState, useTransition } from 'react';
import { createTenantAction } from './actions';

export function NewTenantForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await createTenantAction(formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      formRef.current?.reset();
    });
  }

  const inputClass =
    'w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-sunken)] px-3 py-2 text-sm text-[var(--color-ink)] outline-none transition-all focus:border-transparent focus:ring-2 focus:ring-[var(--color-violet)]/40';

  return (
    <form
      ref={formRef}
      action={handleSubmit}
      className="card grid grid-cols-1 gap-4 p-5 sm:grid-cols-2"
    >
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-[var(--color-ink-soft)]">Razón social</label>
        <input name="name" required className={inputClass} />
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-[var(--color-ink-soft)]">RUT</label>
        <input name="rut" className={inputClass} />
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-[var(--color-ink-soft)]">Plan</label>
        <select name="plan" defaultValue="completo" className={inputClass}>
          <option value="piloto">Piloto</option>
          <option value="completo">Completo</option>
          <option value="agencia">Agencia</option>
        </select>
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-[var(--color-ink-soft)]">Clerk Organization ID</label>
        <input name="clerkOrgId" placeholder="org_..." className={inputClass} />
      </div>
      {error && <p className="col-span-full text-xs font-medium text-[var(--color-critical)]">{error}</p>}
      <button
        type="submit"
        disabled={isPending}
        className="col-span-full self-start rounded-lg px-5 py-2.5 text-sm font-semibold text-white shadow-[var(--shadow-glow)] transition-transform duration-200 hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
        style={{ background: 'var(--gradient-brand)' }}
      >
        {isPending ? 'Creando…' : 'Crear pyme (+ sus 6 agentes)'}
      </button>
    </form>
  );
}
