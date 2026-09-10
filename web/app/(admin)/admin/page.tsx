import Link from 'next/link';
import { listTenants } from '../../../lib/tenant';
import { PLAN_PRICES_CLP, PLAN_LABELS } from '../../../lib/plans';
import { AnimatedNumber } from '../../../components/AnimatedNumber';

const STAT_ACCENTS = [
  { icon: 'coin', bg: 'var(--gradient-warm)' },
  { icon: 'building', bg: 'var(--gradient-cool)' },
  { icon: 'spark', bg: 'var(--gradient-brand)' },
] as const;

function StatIcon({ kind }: { kind: (typeof STAT_ACCENTS)[number]['icon'] }) {
  if (kind === 'coin') {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="8.5" stroke="white" strokeWidth="1.7" />
        <path d="M12 7.5v9M9.3 9.7c0-1.2 1.2-2.2 2.7-2.2s2.7.9 2.7 2c0 2.6-5.4 1.3-5.4 3.8 0 1.1 1.2 2 2.7 2s2.7-.9 2.7-2" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  }
  if (kind === 'building') {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <rect x="5" y="4" width="9" height="16" rx="1" stroke="white" strokeWidth="1.7" />
        <path d="M14 9h5v10a1 1 0 0 1-1 1h-4" stroke="white" strokeWidth="1.7" strokeLinejoin="round" />
        <path d="M8 7.5h1.2M8 11h1.2M8 14.5h1.2" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1" stroke="white" strokeWidth="1.7" strokeLinecap="round" />
      <circle cx="12" cy="12" r="3.2" fill="white" />
    </svg>
  );
}

export default async function AdminOverviewPage() {
  const tenants = await listTenants();
  const active = tenants.filter((t) => t.status === 'active');
  const revenue = active.reduce((sum, t) => sum + PLAN_PRICES_CLP[t.plan], 0);
  const recent = [...tenants].sort((a, b) => +b.createdAt - +a.createdAt).slice(0, 5);

  const stats = [
    { label: 'Ingresos mensuales (calculado)', value: revenue, format: 'clp' as const },
    { label: 'Pymes afiliadas', value: tenants.length, format: 'count' as const },
    { label: 'Pymes activas', value: active.length, format: 'count' as const },
  ];

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8">
      <div>
        <h1 className="font-display text-3xl font-semibold text-[var(--color-ink)]">
          Resumen del <span className="text-gradient-warm">negocio</span>
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-[var(--color-ink-soft)]">
          Ingresos calculados de plan × pymes activas — no hay pasarela de pago real
          conectada todavía (decisión explícita del sprint).
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map((s, i) => (
          <div key={s.label} className="card group relative overflow-hidden p-5 transition-shadow duration-300 hover:shadow-[var(--shadow-card-hover)]">
            <div
              className="mb-4 flex h-10 w-10 items-center justify-center rounded-full"
              style={{ background: STAT_ACCENTS[i].bg }}
            >
              <StatIcon kind={STAT_ACCENTS[i].icon} />
            </div>
            <p className="text-xs font-medium text-[var(--color-ink-faint)]">{s.label}</p>
            <p className="mt-1 font-display text-3xl font-semibold text-[var(--color-ink)]">
              <AnimatedNumber value={s.value} format={s.format} />
            </p>
            <span
              className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-[0.07] blur-xl"
              style={{ background: STAT_ACCENTS[i].bg }}
              aria-hidden="true"
            />
          </div>
        ))}
      </div>

      <div className="card p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-[var(--color-ink)]">Pymes recientes</h2>
          <Link href="/admin/tenants" className="text-xs font-semibold text-[var(--color-violet)] hover:text-[var(--color-coral)]">
            Ver todas →
          </Link>
        </div>
        {recent.length === 0 ? (
          <p className="text-sm text-[var(--color-ink-faint)]">Todavía no hay pymes afiliadas.</p>
        ) : (
          <ul className="flex flex-col divide-y divide-[var(--color-border-soft)]">
            {recent.map((t) => (
              <li key={t.id} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <span
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-display text-sm font-semibold text-white"
                    style={{ background: 'var(--gradient-brand)' }}
                  >
                    {t.name.charAt(0).toUpperCase()}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-[var(--color-ink)]">{t.name}</p>
                    <p className="text-xs text-[var(--color-ink-faint)]">{PLAN_LABELS[t.plan]}</p>
                  </div>
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                    t.status === 'active'
                      ? 'bg-[var(--color-good-bg)] text-[var(--color-good)]'
                      : 'bg-[var(--color-warn-bg)] text-[var(--color-warn)]'
                  }`}
                >
                  {t.status === 'active' ? 'Activa' : t.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
