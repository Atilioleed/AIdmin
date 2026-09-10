'use server';

import { currentUser } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { AGENT_SLUGS, type AgentProfileSlug } from '../../../../../lib/agent-profiles';
import {
  addKnowledgeDocument,
  addKnowledgeLink,
  deleteKnowledge,
} from '../../../../../lib/agent-knowledge';
import { getUploadsStorage, validateUpload } from '../../../../../lib/uploads-storage';

function isAgentSlug(value: string): value is AgentProfileSlug {
  return (AGENT_SLUGS as readonly string[]).includes(value);
}

export async function addKnowledgeAction(slug: string, formData: FormData): Promise<{ error?: string }> {
  if (!isAgentSlug(slug)) return { error: 'Agente desconocido.' };

  const title = String(formData.get('title') ?? '').trim();
  if (!title) return { error: 'El título es obligatorio.' };

  const description = String(formData.get('description') ?? '').trim() || null;
  const type = String(formData.get('type') ?? '');

  const user = await currentUser();
  const updatedBy = user?.primaryEmailAddress?.emailAddress ?? 'admin';

  if (type === 'link') {
    const url = String(formData.get('url') ?? '').trim();
    if (!url) return { error: 'La URL es obligatoria para un link.' };
    await addKnowledgeLink({ agentSlug: slug, title, url, description, updatedBy });
  } else if (type === 'document') {
    const file = formData.get('file');
    if (!(file instanceof File) || file.size === 0) {
      return { error: 'Selecciona un archivo.' };
    }
    const validation = validateUpload(file);
    if (!validation.ok) return { error: validation.error };

    const buffer = Buffer.from(await file.arrayBuffer());
    const storage = getUploadsStorage();
    const storagePath = await storage.save(buffer, file.name);
    await addKnowledgeDocument({ agentSlug: slug, title, storagePath, description, updatedBy });
  } else {
    return { error: 'Tipo de conocimiento desconocido.' };
  }

  revalidatePath(`/admin/agentes/${slug}`);
  return {};
}

export async function deleteKnowledgeAction(slug: string, id: string): Promise<{ error?: string }> {
  if (!isAgentSlug(slug)) return { error: 'Agente desconocido.' };
  await deleteKnowledge(id);
  revalidatePath(`/admin/agentes/${slug}`);
  return {};
}
