'use client';

import { useRef, useState, useTransition } from 'react';
import type { WebsiteTemplate } from '../../../../lib/website-templates';
import type { TenantWebsite } from '../../../../lib/tenant-websites';
import { TemplateThumbnail } from './TemplateThumbnail';
import { saveTenantWebsiteAction } from './actions';

const inputClass =
  'w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-sunken)] px-3 py-2 text-sm text-[var(--color-ink)] outline-none focus:border-transparent focus:ring-2 focus:ring-[var(--color-violet)]/40';
const labelClass = 'mb-1.5 block text-xs font-semibold text-[var(--color-ink-soft)]';

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
        <label className={labelClass}>Elige una plantilla</label>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {templates.map((t) => (
            <button
              key={t.slug}
              type="button"
              onClick={() => setSelectedTemplate(t.slug)}
              className={`overflow-hidden rounded-2xl border text-left transition-all ${
                selectedTemplate === t.slug
                  ? 'border-[var(--color-violet)] shadow-[var(--shadow-card-hover)]'
                  : 'border-[var(--color-border)] hover:border-[var(--color-violet)]/50'
              }`}
            >
              <TemplateThumbnail slug={t.slug} />
              <div className="p-3">
                <p className="text-sm font-semibold text-[var(--color-ink)]">{t.name}</p>
                <p className="mt-0.5 text-xs text-[var(--color-ink-faint)]">{t.description}</p>
                <span className="mt-2 inline-block rounded-full bg-[var(--color-surface-sunken)] px-2 py-0.5 text-[11px] text-[var(--color-ink-soft)]">
                  {t.category}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="card flex flex-col gap-4 p-5">
        <div>
          <label className={labelClass}>Nombre a mostrar</label>
          <input name="businessNameOverride" defaultValue={website?.businessNameOverride} placeholder="Deja vacío para usar el nombre de la pyme" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Tagline</label>
          <input name="tagline" defaultValue={website?.tagline} placeholder="Una frase corta que resuma tu negocio" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Logo</label>
          <input type="file" name="logo" accept="image/*" className="w-full text-sm" />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className={labelClass}>Color primario</label>
            <input type="color" name="colorPrimary" defaultValue={website?.colorPrimary ?? '#6a4cff'} className="h-9 w-full rounded-lg border border-[var(--color-border)]" />
          </div>
          <div>
            <label className={labelClass}>Color secundario</label>
            <input type="color" name="colorSecondary" defaultValue={website?.colorSecondary ?? '#ff8a5b'} className="h-9 w-full rounded-lg border border-[var(--color-border)]" />
          </div>
          <div>
            <label className={labelClass}>Fondo</label>
            <input type="color" name="colorBackground" defaultValue={website?.colorBackground ?? '#ffffff'} className="h-9 w-full rounded-lg border border-[var(--color-border)]" />
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm text-[var(--color-ink-soft)]">
          <input type="checkbox" name="published" defaultChecked={website?.published} />
          Publicar (visible en /sitio/{tenantSlug ?? '...'})
        </label>

        <div className="border-t border-[var(--color-border-soft)] pt-4">
          <label className={labelClass}>
            Dominio propio <span className="font-normal text-[var(--color-ink-faint)]">(próximamente)</span>
          </label>
          <input name="customDomain" defaultValue={website?.customDomain} placeholder="www.tu-negocio.cl" className={inputClass} />
          <p className="mt-1 text-xs text-[var(--color-ink-faint)]">
            Todavía no conectamos dominios propios automáticamente — dejamos el tuyo guardado
            para activarlo apenas esté listo. Un dominio a medida tiene un costo aparte.
          </p>
        </div>
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
          {isPending ? 'Guardando…' : 'Guardar y publicar'}
        </button>
        {website?.published && tenantSlug && (
          <a href={`/sitio/${tenantSlug}`} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-[var(--color-violet)] hover:text-[var(--color-coral)]">
            Ver sitio en vivo →
          </a>
        )}
      </div>
    </form>
  );
}
