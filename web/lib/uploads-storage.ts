import { randomUUID } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

// Puerto + implementacion local-disk (dev), mismo patron que
// ApprovalsRepository/ContentReviewsRepository: cuando se conecte Supabase Storage en
// produccion, solo se agrega una segunda implementacion de esta interfaz.
export interface UploadsStorage {
  save(buffer: Buffer, originalName: string): Promise<string>; // -> storage_path
  publicUrl(storagePath: string): string;
}

const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads');

export class LocalDiskUploadsStorage implements UploadsStorage {
  async save(buffer: Buffer, originalName: string): Promise<string> {
    await mkdir(UPLOADS_DIR, { recursive: true });
    const safeExt = path.extname(originalName).slice(0, 10);
    const filename = `${randomUUID()}${safeExt}`;
    await writeFile(path.join(UPLOADS_DIR, filename), buffer);
    return `uploads/${filename}`;
  }

  publicUrl(storagePath: string): string {
    return `/${storagePath}`;
  }
}

export function getUploadsStorage(): UploadsStorage {
  return new LocalDiskUploadsStorage();
}

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
const ALLOWED_MIME_PREFIXES = ['image/'];
const ALLOWED_MIME_EXACT = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

export function validateUpload(file: File): { ok: true; fileType: 'image' | 'document' } | { ok: false; error: string } {
  if (file.size > MAX_UPLOAD_BYTES) {
    return { ok: false, error: 'El archivo supera los 10MB.' };
  }
  if (ALLOWED_MIME_PREFIXES.some((prefix) => file.type.startsWith(prefix))) {
    return { ok: true, fileType: 'image' };
  }
  if (ALLOWED_MIME_EXACT.has(file.type)) {
    return { ok: true, fileType: 'document' };
  }
  return { ok: false, error: `Tipo de archivo no permitido: ${file.type || 'desconocido'}.` };
}
