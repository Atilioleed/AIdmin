import { UserButton } from '@clerk/nextjs';

export default function NoAutorizadoPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-neutral-50 p-6 text-center">
      <h1 className="text-xl font-semibold text-neutral-900">No tienes acceso a este panel</h1>
      <p className="max-w-md text-sm text-neutral-600">
        Esta seccion es solo para administradores de la plataforma AIdmin. Si crees que
        esto es un error, contacta a Atilio.
      </p>
      <UserButton />
    </div>
  );
}
