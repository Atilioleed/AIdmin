import { redirect } from 'next/navigation';
import { getCurrentTenant } from '../../../../lib/tenant';
import { listPendingContentReviews } from '../../../../lib/queries';
import { ContentCard } from './ContentCard';
import { GenerateContentForm } from './GenerateContentForm';

export default async function ContentPage() {
  const tenant = await getCurrentTenant();
  if (!tenant) redirect('/sin-pyme');

  const reviews = await listPendingContentReviews(tenant.id);

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div>
        <h1 className="font-display text-3xl font-semibold text-[var(--color-ink)]">
          Contenido <span className="text-gradient-warm">pendiente</span>
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-[var(--color-ink-soft)]">
          Posts que Marketing dejó listos, con día, hora y red social. Nada se publica hasta que lo
          apruebes aquí.
        </p>
      </div>

      <GenerateContentForm />

      {reviews.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="text-sm text-[var(--color-ink-faint)]">No hay contenido pendiente ahora mismo.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
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
