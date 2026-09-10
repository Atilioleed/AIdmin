'use client';

import { useRef, useState, useTransition } from 'react';
import type { WebsiteTemplate } from '../../../../lib/website-templates';
import type { TenantWebsite } from '../../../../lib/tenant-websites';
import { saveTenantWebsiteAction } from './actions';

export function SiteBuilderForm({
  templates,
  website,
  tenantSlug,
}: {
  templates: WebsiteTemplate[];
  website: TenantWebsite | null;
  tenantSlug: string | null;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [selectedTemplate, setSelectedTemplate] = useState(website?.templateSlug ?? templates[0]?.slug ?? '');
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setError(null);
    setSaved(false);
    formData.set('templateSlug', selectedTemplate);
    startTransition(async () => {
      const result = await saveTenantWebsiteAction(formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      setSaved(true);
    });
  }

  return (
    <form ref={formRef} action={handleSubmit} className="flex flex-col gap-6">
      <div>
        <label className="mb-2 block text-xs font-medium text-neutral-600">Elige una plantilla</label>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {templates.map((t) => (
            <button
              key={t.slug}
              type="button"
              onClick={() => setSelectedTemplate(t.slug)}
              className={`rounded-lg border p-3 text-left transition-colors ${
                selectedTemplate === t.slug
                  ? 'border-neutral-900 bg-neutral-50'
                  : 'border-neutral-200 bg-white hover:border-neutral-400'
              }`}
            >
              <p className="text-sm font-semibold text-neutral-900">{t.name}</p>
              <p className="mt-0.5 text-xs text-neutral-500">{t.description}</p>
              <span className="mt-2 inline-block rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] text-neutral-500">
                {t.category}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-4 rounded-lg border border-neutral-200 bg-white p-4">
        <div>
          <label className="mb-1 block text-xs font-medium text-neutral-600">Nombre a mostrar</label>
          <input
            name="businessNameOverride"
            defaultValue={website?.businessNameOverride}
            placeholder="Deja vacío para usar el nombre de la pyme"
            className="w-full rounded border border-neutral-300 px-2 py-1.5 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-neutral-600">Tagline</label>
          <input
            name="tagline"
            defaultValue={website?.tagline}
            placeholder="Una frase corta que resuma tu negocio"
            className="w-full rounded border border-neutral-300 px-2 py-1.5 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-neutral-600">Logo</label>
          <input type="file" name="logo" accept="image/*" className="w-full text-sm" />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-neutral-600">Color primario</label>
            <input
              type="color"
              name="colorPrimary"
              defaultValue={website?.colorPrimary ?? '#6a4cff'}
              className="h-9 w-full rounded border border-neutral-300"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-neutral-600">Color secundario</label>
            <input
              type="color"
              name="colorSecondary"
              defaultValue={website?.colorSecondary ?? '#ff8a5b'}
              className="h-9 w-full rounded border border-neutral-300"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-neutral-600">Fondo</label>
            <input
              type="color"
              name="colorBackground"
              defaultValue={website?.colorBackground ?? '#ffffff'}
              className="h-9 w-full rounded border border-neutral-300"
            />
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm text-neutral-700">
          <input type="checkbox" name="published" defaultChecked={website?.published} />
          Publicar (visible en /sitio/{tenantSlug ?? '...'})
        </label>
      </div>

      {error && <p className="text-xs text-red-600">{error}</p>}
      {saved && !error && <p className="text-xs text-emerald-600">Guardado.</p>}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="self-start rounded bg-neutral-900 px-4 py-1.5 text-sm font-medium text-white hover:bg-neutral-700 disabled:opacity-50"
        >
          {isPending ? 'Guardando…' : 'Guardar y publicar'}
        </button>
        {website?.published && tenantSlug && (
          <a href={`/sitio/${tenantSlug}`} target="_blank" rel="noopener noreferrer" className="text-xs text-neutral-600 underline">
            Ver sitio en vivo →
          </a>
        )}
      </div>
    </form>
  );
}
