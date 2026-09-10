import type { TenantSiteContent } from './types';

export function About({ content }: { content: TenantSiteContent }) {
  if (!content.about.trim()) return null;
  return (
    <section className="mx-auto max-w-3xl px-6 py-14">
      <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-400">Sobre nosotros</h2>
      <p className="mt-3 whitespace-pre-line text-lg leading-relaxed text-neutral-700">{content.about}</p>
    </section>
  );
}
