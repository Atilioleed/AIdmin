'use client';

import { useRef, useState, useTransition } from 'react';
import { uploadClientFileAction } from './actions.js';

const AGENT_OPTIONS = [
  { value: 'all', label: 'Todos los gerentes' },
  { value: 'desarrollo', label: 'Desarrollo (Mauricio)' },
  { value: 'finanzas', label: 'Finanzas (Valentina)' },
  { value: 'legal', label: 'Legal (Francisca)' },
  { value: 'producto', label: 'Producto (Camila)' },
  { value: 'marketing', label: 'Marketing (Sofía)' },
  { value: 'ceo', label: 'CEO / Comité (Rodrigo)' },
];

export function UploadForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await uploadClientFileAction(formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      formRef.current?.reset();
    });
  }

  return (
    <form ref={formRef} action={handleSubmit} className="flex flex-col gap-3 rounded-lg border border-neutral-200 bg-white p-4">
      <div>
        <label className="mb-1 block text-xs font-medium text-neutral-600">Archivo (foto, PDF, doc — máx. 10MB)</label>
        <input type="file" name="file" required className="w-full text-sm" />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-neutral-600">Para qué gerente</label>
        <select name="agentSlug" defaultValue="all" className="w-full rounded border border-neutral-300 px-2 py-1.5 text-sm">
          {AGENT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-neutral-600">Descripción / contexto</label>
        <textarea
          name="caption"
          rows={2}
          placeholder="Ej: foto del local para el nuevo post de Instagram"
          className="w-full rounded border border-neutral-300 px-2 py-1.5 text-sm"
        />
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={isPending}
        className="self-start rounded bg-neutral-900 px-4 py-1.5 text-sm font-medium text-white hover:bg-neutral-700 disabled:opacity-50"
      >
        {isPending ? 'Subiendo…' : 'Subir'}
      </button>
    </form>
  );
}
