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
        <h1 className="text-lg font-semibold text-neutral-900">Tu sitio web</h1>
        <p className="text-sm text-neutral-500">
          Elige una plantilla, personaliza colores e información básica, y publica.
          Un diseño más a medida tiene un costo aparte — hablemos si lo necesitas.
        </p>
      </div>

      <SiteBuilderForm templates={templates} website={website} tenantSlug={tenant.slug} />
    </div>
  );
}
