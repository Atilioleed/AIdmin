'use client';

import { usePathname } from 'next/navigation';

export function AnimatedMain({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div key={pathname} className="animate-rise-in">
      {children}
    </div>
  );
}
