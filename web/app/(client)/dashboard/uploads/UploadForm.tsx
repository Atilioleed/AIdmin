'use client';

import { useRef, useState, useTransition } from 'react';
import { uploadClientFileAction } from './actions';

const inputClass =
  'w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-sunken)] px-3 py-2 text-sm text-[var(--color-ink)] outline-none focus:border-transparent focus:ring-2 focus:ring-[var(--color-violet)]/40';
const labelClass = 'mb-1.5 block text-xs font-semibold text-[var(--color-ink-soft)]';

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
    <form ref={formRef} action={handleSubmit} className="card flex flex-col gap-4 p-5">
      <div>
        <label className={labelClass}>Archivo (foto, PDF, doc — máx. 10MB)</label>
        <input type="file" name="file" required className="w-full text-sm" />
      </div>
      <div>
        <label className={labelClass}>Para qué gerente</label>
        <select name="agentSlug" defaultValue="all" className={inputClass}>
          {AGENT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className={labelClass}>Descripción / contexto</label>
        <textarea name="caption" rows={2} placeholder="Ej: foto del local para el nuevo post de Instagram" className={inputClass} />
      </div>
      {error && <p className="text-xs font-medium text-[var(--color-critical)]">{error}</p>}
      <button
        type="submit"
        disabled={isPending}
        className="self-start rounded-full px-5 py-2.5 text-sm font-semibold text-white shadow-[var(--shadow-glow)] disabled:opacity-50"
        style={{ background: 'var(--gradient-brand)' }}
      >
        {isPending ? 'Subiendo…' : 'Subir'}
      </button>
    </form>
  );
}
