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
        <h1 className="font-display text-3xl font-semibold text-[var(--color-ink)]">
          Contexto de tu <span className="text-gradient-warm">negocio</span>
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-[var(--color-ink-soft)]">
          Esto lo lee tu comité completo (los 6 gerentes) antes de trabajar — son las mismas
          preguntas que haría un fondo antes de invertir. Mientras más completo esté, mejor
          trabajan por ti.
        </p>
      </div>

      <BusinessContextForm context={context} />
    </div>
  );
}
