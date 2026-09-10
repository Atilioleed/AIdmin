import { UserButton } from '@clerk/nextjs';

export default function SinPymePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-neutral-50 p-6 text-center">
      <h1 className="text-xl font-semibold text-neutral-900">Tu cuenta no esta asociada a ninguna pyme</h1>
      <p className="max-w-md text-sm text-neutral-600">
        Para entrar al panel necesitas pertenecer a la Organization de tu empresa en
        AIdmin. Si tu pyme ya esta dada de alta, pide que te inviten a su Organization;
        si no, contacta a Atilio para activarla.
      </p>
      <UserButton />
    </div>
  );
}
