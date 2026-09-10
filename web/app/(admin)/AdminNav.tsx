'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const ICONS: Record<string, React.ReactNode> = {
  home: (
    <path
      d="M4 10.5 12 4l8 6.5V19a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1v-4h-4v4a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-8.5Z"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinejoin="round"
    />
  ),
  building: (
    <>
      <rect x="5" y="3.5" width="10" height="17" rx="1" stroke="currentColor" strokeWidth="1.6" />
      <path d="M15 9h4v11a1 1 0 0 1-1 1h-3V9Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M8 7.5h1M11 7.5h1M8 11h1M11 11h1M8 14.5h1M11 14.5h1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </>
  ),
  pulse: (
    <path
      d="M3 12h4l2-7 4 14 2-7h6"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
};

export function AdminNav({ items }: { items: { href: string; label: string; icon: keyof typeof ICONS }[] }) {
  const pathname = usePathname();

  return (
    <nav className="relative mt-8 flex flex-col gap-1">
      {items.map((item) => {
        const active = item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors duration-200 ${
              active ? 'text-white' : 'text-white/55 hover:text-white/90'
            }`}
          >
            {active && (
              <span
                className="absolute inset-0 -z-10 rounded-xl"
                style={{ background: 'var(--gradient-brand)' }}
              />
            )}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="shrink-0">
              {ICONS[item.icon]}
            </svg>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
