'use client';

import { useState, useTransition } from 'react';
import Image from 'next/image';
import { setCoverPhotoAction } from './actions';

export function PhotoGallery({
  productId,
  photoStoragePaths,
  coverPhotoIndex,
}: {
  productId: string;
  photoStoragePaths: string[];
  coverPhotoIndex: number;
}) {
  const [cover, setCover] = useState(coverPhotoIndex);
  const [isPending, startTransition] = useTransition();

  if (photoStoragePaths.length === 0) {
    return (
      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-[var(--color-surface-sunken)] text-[10px] text-[var(--color-ink-faint)]">
        Sin foto
      </div>
    );
  }

  return (
    <div className="flex shrink-0 gap-1.5">
      <Image
        src={`/${photoStoragePaths[cover]}`}
        alt=""
        width={64}
        height={64}
        className="h-16 w-16 rounded-lg object-cover"
        unoptimized
      />
      {photoStoragePaths.length > 1 && (
        <div className="flex flex-col gap-1">
          {photoStoragePaths.map((path, i) => (
            <button
              key={path}
              type="button"
              disabled={isPending || i === cover}
              onClick={() => {
                setCover(i);
                startTransition(() => setCoverPhotoAction(productId, i));
              }}
              className={`h-[18px] w-[18px] overflow-hidden rounded border ${
                i === cover ? 'border-[var(--color-violet)]' : 'border-[var(--color-border)] opacity-60 hover:opacity-100'
              }`}
              title={i === cover ? 'Foto de portada' : 'Usar como portada'}
            >
              <Image src={`/${path}`} alt="" width={18} height={18} className="h-full w-full object-cover" unoptimized />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
