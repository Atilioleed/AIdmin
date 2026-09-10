import { redirect } from 'next/navigation';
import { getCurrentTenant } from '../../../../lib/tenant';
import { listReports } from '../../../../lib/queries';

export default async function ReportsPage() {
  const tenant = await getCurrentTenant();
  if (!tenant) redirect('/sin-pyme');

  const reports = await listReports(tenant.id);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4">
      <h1 className="text-lg font-semibold text-neutral-900">Historial de reportes</h1>
      {reports.length === 0 ? (
        <p className="rounded-lg border border-dashed border-neutral-300 bg-white p-6 text-sm text-neutral-500">
          Todavía no hay reportes. Corre un agente para ver su primer reporte aquí.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {reports.map((r) => (
            <details key={r.id} className="rounded-lg border border-neutral-200 bg-white p-4">
              <summary className="cursor-pointer text-sm font-medium text-neutral-900">
                {r.agentName} · {new Date(r.createdAt).toLocaleString('es-CL')}
              </summary>
              <div className="mt-3 whitespace-pre-wrap text-sm text-neutral-700">{r.summary}</div>
            </details>
          ))}
        </div>
      )}
    </div>
  );
}
