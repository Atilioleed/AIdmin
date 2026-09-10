import { redirect } from 'next/navigation';
import { getCurrentTenant } from '../../../../lib/tenant';
import { listPendingContentReviews } from '../../../../lib/queries';
import { ContentCard } from './ContentCard';

export default async function ContentPage() {
  const tenant = await getCurrentTenant();
  if (!tenant) redirect('/sin-pyme');

  const reviews = await listPendingContentReviews(tenant.id);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4">
      <div>
        <h1 className="text-lg font-semibold text-neutral-900">Contenido pendiente de revisión</h1>
        <p className="text-sm text-neutral-500">
          Posts orgánicos que Marketing dejó listos. Ninguno se publica hasta que lo
          apruebes acá (Metricool real aún no está conectado, así que por ahora esto
          deja constancia de la aprobación).
        </p>
      </div>
      {reviews.length === 0 ? (
        <p className="rounded-lg border border-dashed border-neutral-300 bg-white p-6 text-sm text-neutral-500">
          No hay contenido pendiente ahora mismo.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {reviews.map((r) => (
            <ContentCard
              key={r.id}
              id={r.id}
              agentSlug={r.agentSlug}
              channel={r.channel}
              contentText={r.contentText}
              scheduledFor={r.scheduledFor ? r.scheduledFor.toISOString() : null}
              requestedAt={r.requestedAt.toISOString()}
            />
          ))}
        </div>
      )}
    </div>
  );
}
