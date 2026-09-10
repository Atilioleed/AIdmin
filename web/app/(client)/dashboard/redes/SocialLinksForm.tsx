'use client';

import { useState, useTransition } from 'react';
import type { SocialLinks } from '../../../../lib/social-links';
import { saveSocialLinksAction } from './actions';

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
    <form action={handleSubmit} className="flex flex-col gap-4 rounded-lg border border-neutral-200 bg-white p-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {FIELDS.map((field) => (
          <div key={field.name}>
            <label className="mb-1 block text-xs font-medium text-neutral-600">{field.label}</label>
            <input
              name={field.name}
              defaultValue={links[field.name] as string}
              placeholder={field.placeholder}
              className="w-full rounded border border-neutral-300 px-2 py-1.5 text-sm"
            />
          </div>
        ))}
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-neutral-600">Notas</label>
        <textarea
          name="notes"
          defaultValue={links.notes}
          rows={2}
          placeholder="Ej: también manejamos un WhatsApp Business, o una red que no está en la lista."
          className="w-full rounded border border-neutral-300 px-2 py-1.5 text-sm"
        />
      </div>

      {error && <p className="text-xs text-red-600">{error}</p>}
      {saved && !error && <p className="text-xs text-emerald-600">Guardado.</p>}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="self-start rounded bg-neutral-900 px-4 py-1.5 text-sm font-medium text-white hover:bg-neutral-700 disabled:opacity-50"
        >
          {isPending ? 'Guardando…' : 'Guardar'}
        </button>
        {links.updatedAt && (
          <p className="text-xs text-neutral-400">
            Última edición: {new Date(links.updatedAt).toLocaleString('es-CL')}
            {links.updatedBy ? ` por ${links.updatedBy}` : ''}
          </p>
        )}
      </div>
    </form>
  );
}
