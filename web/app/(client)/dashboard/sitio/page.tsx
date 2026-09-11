import { redirect } from 'next/navigation';
import { getCurrentTenant } from '../../../../lib/tenant';
import { getTenantWebsite } from '../../../../lib/tenant-websites';
import { listWebsiteTemplates } from '../../../../lib/website-templates';
import { SiteBuilderForm } from './SiteBuilderForm';

export default async function SitioPage() {
  const tenant = await getCurrentTenant();
  if (!tenant) redirect('/sin-pyme');

  const [templates, website] = await Promise.all([listWebsiteTemplates(), getTenantWebsite(tenant.id)]);

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <div>
        <h1 className="font-display text-3xl font-semibold text-[var(--color-ink)]">
          Tu sitio <span className="text-gradient-warm">web</span>
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-[var(--color-ink-soft)]">
          Elige una plantilla — la miniatura es una vista real, no un dibujo — personaliza colores
          e información básica, y publica. Un diseño más a medida tiene un costo aparte — hablemos
          si lo necesitas.
        </p>
      </div>

      <SiteBuilderForm templates={templates} website={website} tenantSlug={tenant.slug} />
    </div>
  );
}
