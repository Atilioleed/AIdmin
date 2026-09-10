import { listTenants } from '../../../../lib/tenant.js';
import { PLAN_LABELS } from '../../../../lib/plans.js';
import { NewTenantForm } from './NewTenantForm.js';

const STATUS_LABEL: Record<string, string> = {
  trial: 'Prueba',
  active: 'Activa',
  paused: 'Pausada',
  cancelled: 'Cancelada',
};

export default async function TenantsPage() {
  const tenants = await listTenants();

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <div>
        <h1 className="text-lg font-semibold text-neutral-900">Pymes afiliadas</h1>
        <p className="text-sm text-neutral-500">
          Crear una pyme acá le da su propio set de 6 agentes de inmediato. Falta
          crear su Organization en Clerk aparte (dashboard de Clerk) y pegar el ID acá.
        </p>
      </div>

      <NewTenantForm />

      <div className="overflow-x-auto rounded-lg border border-neutral-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-neutral-200 text-xs uppercase text-neutral-500">
            <tr>
              <th className="px-4 py-2">Nombre</th>
              <th className="px-4 py-2">Plan</th>
              <th className="px-4 py-2">Estado</th>
              <th className="px-4 py-2">Clerk Org</th>
              <th className="px-4 py-2">Creada</th>
            </tr>
          </thead>
          <tbody>
            {tenants.map((t) => (
              <tr key={t.id} className="border-b border-neutral-100 last:border-0">
                <td className="px-4 py-2 font-medium text-neutral-900">{t.name}</td>
                <td className="px-4 py-2 text-neutral-600">{PLAN_LABELS[t.plan]}</td>
                <td className="px-4 py-2 text-neutral-600">{STATUS_LABEL[t.status]}</td>
                <td className="px-4 py-2 text-neutral-400">{t.clerkOrgId ?? '—'}</td>
                <td className="px-4 py-2 text-neutral-400">
                  {new Date(t.createdAt).toLocaleDateString('es-CL')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
