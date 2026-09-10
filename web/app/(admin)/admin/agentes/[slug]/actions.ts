'use server';

import { revalidatePath } from 'next/cache';
import { currentUser } from '@clerk/nextjs/server';
import { AGENT_SLUGS, updateAgentProfile, type AgentProfileSlug } from '../../../../../lib/agent-profiles';

function isAgentSlug(value: string): value is AgentProfileSlug {
  return (AGENT_SLUGS as readonly string[]).includes(value);
}

export async function updateAgentProfileAction(
  slug: string,
  formData: FormData,
): Promise<{ error?: string }> {
  if (!isAgentSlug(slug)) return { error: 'Agente desconocido.' };

  const personaName = String(formData.get('personaName') ?? '').trim();
  const displayName = String(formData.get('displayName') ?? '').trim();
  const personality = String(formData.get('personality') ?? '').trim();
  const objective = String(formData.get('objective') ?? '').trim();
  const extraInstructionsRaw = String(formData.get('extraInstructions') ?? '').trim();
  const skills = formData
    .getAll('skills')
    .map((s) => String(s).trim())
    .filter(Boolean);

  if (!personaName) return { error: 'El nombre es obligatorio.' };
  if (!displayName) return { error: 'El cargo/rol visible es obligatorio.' };
  if (!personality) return { error: 'La personalidad no puede quedar vacía.' };
  if (!objective) return { error: 'El objetivo no puede quedar vacío.' };

  const user = await currentUser();
  const updatedBy = user?.primaryEmailAddress?.emailAddress ?? 'admin';

  await updateAgentProfile(slug, {
    personaName,
    displayName,
    personality,
    skills,
    objective,
    extraInstructions: extraInstructionsRaw || null,
    updatedBy,
  });

  revalidatePath('/admin/agentes');
  revalidatePath(`/admin/agentes/${slug}`);
  return {};
}
