import type { Metadata } from 'next';
import { UserButton } from '@clerk/nextjs';
import { OrganizationGate } from './OrganizationGate';

export const metadata: Metadata = {
  title: 'Sin pyme asociada',
  robots: { index: false, follow: false },
};

export default function SinPymePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-5 bg-neutral-50 p-6 text-center">
      <h1 className="text-xl font-semibold text-neutral-900">Tu cuenta no esta asociada a ninguna pyme</h1>
      <p className="max-w-md text-sm text-neutral-600">
        Si ya perteneces a la Organization de tu empresa pero llegaste a esta pantalla,
        es porque tu sesión todavía no la tiene activa - elígela abajo. Si tu pyme
        todavía no está dada de alta, contacta a Atilio para activarla.
      </p>
      <OrganizationGate />
      <UserButton />
    </div>
  );
}
