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
        <h1 className="text-lg font-semibold text-neutral-900">Archivos y fotos para tus gerentes</h1>
        <p className="text-sm text-neutral-500">
          Sube algo y elige a qué gerente va dirigido. Las fotos las ve de verdad (el
          modelo tiene visión); otros archivos los ve por nombre y descripción.
        </p>
      </div>

      <UploadForm />

      <div className="flex flex-col gap-3">
        {uploads.length === 0 ? (
          <p className="rounded-lg border border-dashed border-neutral-300 bg-white p-6 text-sm text-neutral-500">
            Todavía no has subido nada.
          </p>
        ) : (
          uploads.map((u) => (
            <article key={u.id} className="flex gap-3 rounded-lg border border-neutral-200 bg-white p-3">
              {u.fileType === 'image' ? (
                <Image
                  src={`/${u.storagePath}`}
                  alt={u.caption ?? 'Foto subida'}
                  width={80}
                  height={80}
                  className="h-20 w-20 rounded object-cover"
                  unoptimized
                />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded bg-neutral-100 text-xs text-neutral-500">
                  {u.fileType}
                </div>
              )}
              <div className="flex flex-col gap-1 text-sm">
                <span className="text-xs text-neutral-400">
                  {u.agentSlug ?? 'todos los gerentes'} · {u.uploadedBy} ·{' '}
                  {new Date(u.createdAt).toLocaleString('es-CL')}
                </span>
                {u.caption && <span className="text-neutral-800">{u.caption}</span>}
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
