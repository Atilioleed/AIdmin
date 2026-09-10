import Link from 'next/link';
import { listAgentProfiles } from '../../../../lib/agent-profiles';

export default async function AgentesPage() {
  const profiles = await listAgentProfiles();

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8">
      <div>
        <h1 className="font-display text-3xl font-semibold text-[var(--color-ink)]">
          Personalidad y <span className="text-gradient-warm">habilidades</span>
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-[var(--color-ink-soft)]">
          Personalidad, tono, habilidades y objetivo de cada gerente — aplica a todas las
          pymes. Los límites de autonomía (aprobación humana de plata y contenido
          público) están fijos en el código, no se editan acá.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {profiles.map((profile) => (
          <Link
            key={profile.slug}
            href={`/admin/agentes/${profile.slug}`}
            className="card group flex flex-col gap-3 p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-card-hover)]"
          >
            <div className="flex items-center gap-3">
              <span
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-display text-sm font-semibold text-white"
                style={{ background: 'var(--gradient-brand)' }}
              >
                {profile.personaName.charAt(0)}
              </span>
              <div>
                <p className="font-display text-base font-semibold text-[var(--color-ink)]">{profile.personaName}</p>
                <p className="text-xs text-[var(--color-ink-faint)]">{profile.displayName}</p>
              </div>
            </div>
            <p className="line-clamp-3 text-sm text-[var(--color-ink-soft)]">{profile.personality}</p>
            <p className="mt-auto text-xs font-semibold text-[var(--color-violet)] group-hover:text-[var(--color-coral)]">
              {profile.skills.length} habilidad{profile.skills.length === 1 ? '' : 'es'} declaradas · Editar →
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
