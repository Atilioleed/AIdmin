import { Reveal } from './Reveal';

const STATS = [
  { value: '6', label: 'gerentes IA trabajando en equipo' },
  { value: '24/7', label: 'disponibilidad, sin turnos ni licencias' },
  { value: '100%', label: 'de gastos y publicaciones con tu aprobación' },
  { value: '$169.900', label: 'plan desde, todo incluido' },
];

export function Stats() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <Reveal>
        <div className="grid grid-cols-2 gap-6 rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8 shadow-[var(--shadow-card)] sm:grid-cols-4 sm:p-10">
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              <p className="font-display text-3xl font-semibold text-gradient-warm sm:text-4xl">{s.value}</p>
              <p className="mt-2 text-xs leading-snug text-[var(--color-ink-soft)]">{s.label}</p>
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  );
}
