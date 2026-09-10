import { redirect } from 'next/navigation';
import { getCurrentTenant } from '../../../../lib/tenant';
import { getBusinessContext } from '../../../../lib/business-context';
import { BusinessContextForm } from './BusinessContextForm';

export default async function NegocioPage() {
  const tenant = await getCurrentTenant();
  if (!tenant) redirect('/sin-pyme');

  const context = await getBusinessContext(tenant.id);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div>
        <h1 className="text-lg font-semibold text-neutral-900">Contexto de tu negocio</h1>
        <p className="text-sm text-neutral-500">
          Esto lo lee tu comité completo (los 6 gerentes) antes de trabajar — son las
          mismas preguntas que haría un fondo antes de invertir. Mientras más completo
          esté, mejor trabajan por vos.
        </p>
      </div>

      <BusinessContextForm context={context} />
    </div>
  );
}
