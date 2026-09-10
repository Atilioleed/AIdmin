import Link from 'next/link';
import { redirect } from 'next/navigation';
import { UserButton } from '@clerk/nextjs';
import { isCurrentUserPlatformAdmin } from '@/lib/tenant.js';

const NAV_ITEMS = [
  { href: '/admin', label: 'Resumen' },
  { href: '/admin/tenants', label: 'Pymes' },
  { href: '/admin/integrations', label: 'Integraciones' },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // proxy.ts solo garantiza que hay sesion; esta es la autorizacion real (por correo).
  if (!(await isCurrentUserPlatformAdmin())) {
    redirect('/no-autorizado');
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between border-b border-neutral-200 bg-neutral-900 px-6 py-3">
        <div className="flex items-center gap-6">
          <span className="text-sm font-semibold text-white">AIdmin · Admin</span>
          <nav className="flex gap-4">
            {NAV_ITEMS.map((item) => (
              <Link key={item.href} href={item.href} className="text-sm text-neutral-300 hover:text-white">
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <UserButton />
      </header>
      <main className="flex-1 bg-neutral-50 p-6">{children}</main>
    </div>
  );
}
