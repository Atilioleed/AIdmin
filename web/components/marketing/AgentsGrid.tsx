import { AGENTS, AgentIcon } from './AgentIcon';
import { Reveal } from './Reveal';

export function AgentsGrid() {
  return (
    <section id="gerentes" className="mx-auto max-w-6xl px-6 py-24">
      <Reveal>
        <div className="max-w-xl">
          <p className="text-xs font-bold uppercase tracking-widest text-[var(--color-coral)]">Tu comité</p>
          <h2 className="mt-2 font-display text-3xl font-semibold text-[var(--color-ink)] sm:text-4xl">
            Seis gerentes, <span className="text-gradient-warm">un solo negocio</span>
          </h2>
          <p className="mt-3 text-[var(--color-ink-soft)]">
            Cada uno con su propia especialidad, su propia personalidad y sus propios
            límites de autonomía — todos reportando al mismo comité diario.
          </p>
        </div>
      </Reveal>

      <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {AGENTS.map((agent, i) => (
          <Reveal key={agent.key} delay={i * 60}>
            <div className="card group h-full p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-card-hover)]">
              <span
                className="flex h-11 w-11 items-center justify-center rounded-xl text-white"
                style={{ background: 'var(--gradient-brand)' }}
              >
                <AgentIcon agent={agent.key} size={20} />
              </span>
              <h3 className="mt-4 font-display text-lg font-semibold text-[var(--color-ink)]">{agent.name}</h3>
              <p className="text-xs font-semibold text-[var(--color-violet)]">{agent.role}</p>
              <p className="mt-2 text-sm leading-relaxed text-[var(--color-ink-soft)]">{agent.description}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
