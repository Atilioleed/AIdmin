'use client';

import { useRef, useState, useTransition } from 'react';
import { createTenantAction } from './actions.js';

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

  return (
    <form
      ref={formRef}
      action={handleSubmit}
      className="grid grid-cols-2 gap-3 rounded-lg border border-neutral-200 bg-white p-4"
    >
      <div>
        <label className="mb-1 block text-xs font-medium text-neutral-600">Razón social</label>
        <input name="name" required className="w-full rounded border border-neutral-300 px-2 py-1.5 text-sm" />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-neutral-600">RUT</label>
        <input name="rut" className="w-full rounded border border-neutral-300 px-2 py-1.5 text-sm" />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-neutral-600">Plan</label>
        <select name="plan" defaultValue="completo" className="w-full rounded border border-neutral-300 px-2 py-1.5 text-sm">
          <option value="piloto">Piloto</option>
          <option value="completo">Completo</option>
          <option value="agencia">Agencia</option>
        </select>
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-neutral-600">Clerk Organization ID</label>
        <input
          name="clerkOrgId"
          placeholder="org_..."
          className="w-full rounded border border-neutral-300 px-2 py-1.5 text-sm"
        />
      </div>
      {error && <p className="col-span-2 text-xs text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={isPending}
        className="col-span-2 self-start rounded bg-neutral-900 px-4 py-1.5 text-sm font-medium text-white hover:bg-neutral-700 disabled:opacity-50"
      >
        {isPending ? 'Creando…' : 'Crear pyme (+ sus 6 agentes)'}
      </button>
    </form>
  );
}
