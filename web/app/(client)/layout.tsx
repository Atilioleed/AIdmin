import Link from 'next/link';
import { OrganizationSwitcher, UserButton } from '@clerk/nextjs';
import { getCurrentTenant } from '../../lib/tenant';
import { Logo } from '../../components/Logo';
import { AnimatedMain } from '../../components/AnimatedMain';
import { ClientNav } from './ClientNav';

export const NAV_ITEMS = [
  { href: '/dashboard', label: 'Comité', icon: 'home' as const },
  { href: '/dashboard/negocio', label: 'Negocio', icon: 'building' as const },
  { href: '/dashboard/sitio', label: 'Sitio web', icon: 'globe' as const },
  { href: '/dashboard/inventario', label: 'Inventario', icon: 'box' as const },
  { href: '/dashboard/pedidos', label: 'Pedidos', icon: 'receipt' as const },
  { href: '/dashboard/redes', label: 'Redes', icon: 'share' as const },
  { href: '/dashboard/approvals', label: 'Aprobaciones', icon: 'check' as const },
  { href: '/dashboard/content', label: 'Contenido', icon: 'megaphone' as const },
  { href: '/dashboard/chat', label: 'Chat con el CEO', icon: 'chat' as const },
  { href: '/dashboard/uploads', label: 'Archivos', icon: 'paperclip' as const },
  { href: '/dashboard/reports', label: 'Reportes', icon: 'chart' as const },
];

export default async function ClientLayout({ children }: { children: React.ReactNode }) {
  const tenant = await getCurrentTenant();

  return (
    <div className="flex min-h-screen bg-mesh">
      <aside className="relative flex w-64 shrink-0 flex-col overflow-hidden bg-[var(--color-violet-deep)] px-5 py-6">
        <div
          className="pointer-events-none absolute -left-16 -top-24 h-64 w-64 rounded-full opacity-40 blur-3xl animate-drift"
          style={{ background: 'var(--gradient-brand)' }}
          aria-hidden="true"
        />
        <div className="relative">
          <Link href="/dashboard">
            <Logo size="md" muted />
          </Link>
          <p className="mt-1 truncate pl-0.5 text-xs font-medium text-white/50">
            {tenant ? tenant.name : 'Panel de cliente'}
          </p>
        </div>

        <ClientNav items={NAV_ITEMS} />

        <div className="relative mt-auto rounded-2xl border border-white/10 bg-white/5 p-4 text-xs text-white/60">
          <p className="font-semibold text-white/85">Tu comité, siempre activo</p>
          <p className="mt-1 leading-relaxed">
            6 gerentes de IA trabajando todos los días — cada gasto y cada publicación
            esperan tu aprobación.
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
          <div className="flex items-center gap-3">
            <OrganizationSwitcher hidePersonal />
            <UserButton />
          </div>
        </header>
        <main className="flex-1 px-8 py-8">
          <AnimatedMain>{children}</AnimatedMain>
        </main>
      </div>
    </div>
  );
}
