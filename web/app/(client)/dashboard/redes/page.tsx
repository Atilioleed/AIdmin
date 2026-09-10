import { redirect } from 'next/navigation';
import { getCurrentTenant } from '../../../../lib/tenant';
import { getSocialLinks } from '../../../../lib/social-links';
import { SocialLinksForm } from './SocialLinksForm';

export default async function RedesPage() {
  const tenant = await getCurrentTenant();
  if (!tenant) redirect('/sin-pyme');

  const links = await getSocialLinks(tenant.id);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div>
        <h1 className="text-lg font-semibold text-neutral-900">Redes sociales</h1>
        <p className="text-sm text-neutral-500">
          Tu Gerente de Marketing usa esto como referencia para su trabajo. Todavía no
          es una conexión con credenciales reales (eso viene más adelante) — con el
          handle o link alcanza.
        </p>
      </div>

      <SocialLinksForm links={links} />
    </div>
  );
}
