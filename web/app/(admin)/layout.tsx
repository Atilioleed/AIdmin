import Link from 'next/link';
import { redirect } from 'next/navigation';
import { UserButton } from '@clerk/nextjs';
import { isCurrentUserPlatformAdmin } from '../../lib/tenant';
import { Logo } from '../../components/Logo';
import { AdminNav } from './AdminNav';
import { AnimatedMain } from './AnimatedMain';

export const NAV_ITEMS = [
  { href: '/admin', label: 'Resumen', icon: 'home' as const },
  { href: '/admin/agentes', label: 'Gerentes IA', icon: 'sparkles' as const },
  { href: '/admin/tenants', label: 'Pymes', icon: 'building' as const },
  { href: '/admin/integrations', label: 'Integraciones', icon: 'pulse' as const },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // proxy.ts solo garantiza que hay sesion; esta es la autorizacion real (por correo).
  if (!(await isCurrentUserPlatformAdmin())) {
    redirect('/no-autorizado');
  }

  return (
    <div className="flex min-h-screen bg-mesh">
      <aside className="relative flex w-64 shrink-0 flex-col overflow-hidden bg-[var(--color-violet-deep)] px-5 py-6">
        <div
          className="pointer-events-none absolute -left-16 -top-24 h-64 w-64 rounded-full opacity-40 blur-3xl animate-drift"
          style={{ background: 'var(--gradient-brand)' }}
          aria-hidden="true"
        />
        <div className="relative">
          <Link href="/admin">
            <Logo size="md" muted />
          </Link>
          <p className="mt-1 pl-0.5 text-xs font-medium text-white/50">Panel de administración</p>
        </div>

        <AdminNav items={NAV_ITEMS} />

        <div className="relative mt-auto rounded-2xl border border-white/10 bg-white/5 p-4 text-xs text-white/60">
          <p className="font-semibold text-white/85">Piso de precio: $169.900</p>
          <p className="mt-1 leading-relaxed">
            Posicionamiento premium — sin comparable directo hoy en el mercado chileno.
          </p>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-surface)]/80 px-8 py-4 backdrop-blur">
          <div>
            <p className="font-display text-lg font-semibold text-[var(--color-ink)]">
              Hola, bienvenido de vuelta
            </p>
            <p className="text-xs text-[var(--color-ink-faint)]">
              {new Date().toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
          </div>
          <UserButton />
        </header>
        <main className="flex-1 px-8 py-8">
          <AnimatedMain>{children}</AnimatedMain>
        </main>
      </div>
    </div>
  );
}
