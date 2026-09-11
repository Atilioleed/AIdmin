'use client';

import { useState, useTransition } from 'react';
import type { SocialLinks } from '../../../../lib/social-links';
import { saveSocialLinksAction } from './actions';

const inputClass =
  'w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-sunken)] px-3 py-2 text-sm text-[var(--color-ink)] outline-none focus:border-transparent focus:ring-2 focus:ring-[var(--color-violet)]/40';

const FIELDS: { name: keyof SocialLinks; label: string; placeholder: string }[] = [
  { name: 'instagram', label: 'Instagram', placeholder: '@tu_pyme o instagram.com/tu_pyme' },
  { name: 'facebook', label: 'Facebook', placeholder: 'facebook.com/tu_pyme' },
  { name: 'tiktok', label: 'TikTok', placeholder: '@tu_pyme' },
  { name: 'linkedin', label: 'LinkedIn', placeholder: 'linkedin.com/company/tu_pyme' },
  { name: 'xTwitter', label: 'X / Twitter', placeholder: '@tu_pyme' },
  { name: 'youtube', label: 'YouTube', placeholder: 'youtube.com/@tu_pyme' },
  { name: 'website', label: 'Sitio web', placeholder: 'https://tu-pyme.cl' },
];

export function SocialLinksForm({ links }: { links: SocialLinks }) {
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const result = await saveSocialLinksAction(formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      setSaved(true);
    });
  }

  return (
    <form action={handleSubmit} className="card flex flex-col gap-5 p-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {FIELDS.map((field) => (
          <div key={field.name}>
            <label className="mb-1.5 block text-xs font-semibold text-[var(--color-ink-soft)]">{field.label}</label>
            <input name={field.name} defaultValue={links[field.name] as string} placeholder={field.placeholder} className={inputClass} />
          </div>
        ))}
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-semibold text-[var(--color-ink-soft)]">Notas</label>
        <textarea
          name="notes"
          defaultValue={links.notes}
          rows={2}
          placeholder="Ej: también manejamos un WhatsApp Business, o una red que no está en la lista."
          className={inputClass}
        />
      </div>

      {error && <p className="text-xs font-medium text-[var(--color-critical)]">{error}</p>}
      {saved && !error && <p className="text-xs font-medium text-[var(--color-good)]">Guardado.</p>}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="self-start rounded-full px-5 py-2.5 text-sm font-semibold text-white shadow-[var(--shadow-glow)] disabled:opacity-50"
          style={{ background: 'var(--gradient-brand)' }}
        >
          {isPending ? 'Guardando…' : 'Guardar'}
        </button>
        {links.updatedAt && (
          <p className="text-xs text-[var(--color-ink-faint)]">
            Última edición: {new Date(links.updatedAt).toLocaleString('es-CL')}
            {links.updatedBy ? ` por ${links.updatedBy}` : ''}
          </p>
        )}
      </div>
    </form>
  );
}
