import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AGENT_SLUGS, getAgentProfile, type AgentProfileSlug } from '../../../../../lib/agent-profiles';
import { AgentProfileForm } from './AgentProfileForm';

function isAgentSlug(value: string): value is AgentProfileSlug {
  return (AGENT_SLUGS as readonly string[]).includes(value);
}

export default async function AgentProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!isAgentSlug(slug)) notFound();

  const profile = await getAgentProfile(slug);
  if (!profile) notFound();

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div>
        <Link href="/admin/agentes" className="text-xs font-semibold text-[var(--color-violet)] hover:text-[var(--color-coral)]">
          ← Todos los gerentes
        </Link>
        <h1 className="mt-2 font-display text-3xl font-semibold text-[var(--color-ink)]">
          {profile.personaName} <span className="text-gradient-warm">· {profile.displayName}</span>
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-[var(--color-ink-soft)]">
          Esto define cómo se presenta y qué habilidades declara al ejecutarse — aplica a
          todas las pymes. Los límites de autonomía (qué puede y no puede hacer) están
          fijos en el código, no acá.
        </p>
      </div>

      <AgentProfileForm profile={profile} />
    </div>
  );
}
