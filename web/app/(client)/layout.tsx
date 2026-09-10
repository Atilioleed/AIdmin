import Link from 'next/link';
import { OrganizationSwitcher, UserButton } from '@clerk/nextjs';
import { getCurrentTenant } from '../../lib/tenant';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Comité' },
  { href: '/dashboard/negocio', label: 'Negocio' },
  { href: '/dashboard/sitio', label: 'Sitio web' },
  { href: '/dashboard/inventario', label: 'Inventario' },
  { href: '/dashboard/redes', label: 'Redes' },
  { href: '/dashboard/approvals', label: 'Aprobaciones' },
  { href: '/dashboard/content', label: 'Contenido' },
  { href: '/dashboard/uploads', label: 'Archivos' },
  { href: '/dashboard/reports', label: 'Reportes' },
];

export default async function ClientLayout({ children }: { children: React.ReactNode }) {
  const tenant = await getCurrentTenant();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between border-b border-neutral-200 bg-white px-6 py-3">
        <div className="flex items-center gap-6">
          <span className="text-sm font-semibold text-neutral-900">
            AIdmin{tenant ? ` · ${tenant.name}` : ''}
          </span>
          <nav className="flex gap-4">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm text-neutral-600 hover:text-neutral-900"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <OrganizationSwitcher hidePersonal />
          <UserButton />
        </div>
      </header>
      <main className="flex-1 bg-neutral-50 p-6">{children}</main>
    </div>
  );
}
