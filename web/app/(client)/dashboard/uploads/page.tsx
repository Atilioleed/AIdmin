import Image from 'next/image';
import { redirect } from 'next/navigation';
import { getCurrentTenant } from '../../../../lib/tenant';
import { listClientUploads } from '../../../../lib/queries';
import { UploadForm } from './UploadForm';

export default async function UploadsPage() {
  const tenant = await getCurrentTenant();
  if (!tenant) redirect('/sin-pyme');

  const uploads = await listClientUploads(tenant.id);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div>
        <h1 className="font-display text-3xl font-semibold text-[var(--color-ink)]">
          Archivos para tus <span className="text-gradient-warm">gerentes</span>
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-[var(--color-ink-soft)]">
          Sube algo y elige a qué gerente va dirigido. Las fotos las ve de verdad (el modelo tiene
          visión); otros archivos los ve por nombre y descripción.
        </p>
      </div>

      <UploadForm />

      <div className="flex flex-col gap-3">
        {uploads.length === 0 ? (
          <div className="card p-8 text-center">
            <p className="text-sm text-[var(--color-ink-faint)]">Todavía no has subido nada.</p>
          </div>
        ) : (
          uploads.map((u) => (
            <article key={u.id} className="card flex gap-3 p-4">
              {u.fileType === 'image' ? (
                <Image
                  src={`/${u.storagePath}`}
                  alt={u.caption ?? 'Foto subida'}
                  width={80}
                  height={80}
                  className="h-20 w-20 rounded-lg object-cover"
                  unoptimized
                />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-lg bg-[var(--color-surface-sunken)] text-xs text-[var(--color-ink-faint)]">
                  {u.fileType}
                </div>
              )}
              <div className="flex flex-col gap-1 text-sm">
                <span className="text-xs text-[var(--color-ink-faint)]">
                  {u.agentSlug ?? 'todos los gerentes'} · {u.uploadedBy} · {new Date(u.createdAt).toLocaleString('es-CL')}
                </span>
                {u.caption && <span className="text-[var(--color-ink)]">{u.caption}</span>}
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
