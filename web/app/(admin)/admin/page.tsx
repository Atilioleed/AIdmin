import { listTenants } from '../../../lib/tenant';
import { PLAN_PRICES_CLP, formatClp } from '../../../lib/plans';

export default async function AdminOverviewPage() {
  const tenants = await listTenants();
  const active = tenants.filter((t) => t.status === 'active');
  const revenue = active.reduce((sum, t) => sum + PLAN_PRICES_CLP[t.plan], 0);

  const stats = [
    { label: 'Ingresos mensuales (calculado)', value: formatClp(revenue) },
    { label: 'Pymes afiliadas', value: String(tenants.length) },
    { label: 'Pymes activas', value: String(active.length) },
  ];

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <div>
        <h1 className="text-lg font-semibold text-neutral-900">Resumen</h1>
        <p className="text-sm text-neutral-500">
          Ingresos calculados de plan × pymes activas — no hay pasarela de pago real
          conectada todavía (decisión explícita del sprint).
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-lg border border-neutral-200 bg-white p-4">
            <p className="text-xs text-neutral-500">{s.label}</p>
            <p className="mt-1 text-2xl font-semibold text-neutral-900">{s.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
