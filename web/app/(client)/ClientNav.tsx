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
  globe: (
    <>
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M3.5 12h17M12 3.5c2.6 2.4 4 5.4 4 8.5s-1.4 6.1-4 8.5c-2.6-2.4-4-5.4-4-8.5s1.4-6.1 4-8.5Z" stroke="currentColor" strokeWidth="1.6" />
    </>
  ),
  box: (
    <path
      d="M4 8 12 4l8 4-8 4-8-4Zm0 0v9l8 4m0-9v9m8-13v9l-8 4"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  share: (
    <>
      <circle cx="18" cy="5.5" r="2.4" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="6" cy="12" r="2.4" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="18" cy="18.5" r="2.4" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8.2 10.7 15.8 6.8M8.2 13.3l7.6 4.4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </>
  ),
  check: (
    <>
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8 12.3 10.8 15 16 9.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  megaphone: (
    <>
      <path d="M4 10v4a1 1 0 0 0 1 1h2l5 4V5L7 9H5a1 1 0 0 0-1 1Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M16 9.2a4 4 0 0 1 0 5.6M18.7 6.5a8 8 0 0 1 0 11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </>
  ),
  paperclip: (
    <path
      d="M8 12.5 15 5.5a3.2 3.2 0 0 1 4.5 4.5L11 18.5a5 5 0 1 1-7-7L12.5 3"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  chart: (
    <path d="M4 19h16M7 19v-6M12 19V7M17 19v-9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  ),
  chat: (
    <path
      d="M4 5.5h16v11H9l-4 3.5v-3.5H4v-11Z"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinejoin="round"
    />
  ),
};

export function ClientNav({ items }: { items: { href: string; label: string; icon: keyof typeof ICONS }[] }) {
  const pathname = usePathname();

  return (
    <nav className="relative mt-8 flex flex-col gap-1">
      {items.map((item) => {
        const active = item.href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors duration-200 ${
              active ? 'text-white' : 'text-white/55 hover:text-white/90'
            }`}
          >
            {active && <span className="absolute inset-0 -z-10 rounded-xl" style={{ background: 'var(--gradient-brand)' }} />}
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
