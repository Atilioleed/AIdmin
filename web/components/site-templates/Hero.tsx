import type { HeadingFont, HeroLayout, TenantSiteContent } from './types';
import { headingFontClass } from './types';

export function Hero({
  content,
  layout,
  headingFont,
  eyebrow,
}: {
  content: TenantSiteContent;
  layout: HeroLayout;
  headingFont: HeadingFont;
  eyebrow: string;
}) {
  const { businessName, tagline, colors, logoUrl } = content;
  const headingClass = `text-4xl sm:text-5xl leading-tight ${headingFontClass(headingFont)}`;

  if (layout === 'overlay') {
    return (
      <section
        className="relative flex min-h-[420px] flex-col items-center justify-center overflow-hidden px-6 py-24 text-center"
        style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})` }}
      >
        {logoUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logoUrl} alt={businessName} className="mb-6 h-16 w-16 rounded-full bg-white/90 object-contain p-2" />
        )}
        <span className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-white/80">{eyebrow}</span>
        <h1 className={`${headingClass} text-white`}>{businessName}</h1>
        {tagline && <p className="mt-4 max-w-xl text-lg text-white/85">{tagline}</p>}
      </section>
    );
  }

  if (layout === 'split') {
    return (
      <section className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-6 py-20 md:grid-cols-2">
        <div>
          <span className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: colors.primary }}>
            {eyebrow}
          </span>
          <h1 className={`${headingClass} mt-3`}>{businessName}</h1>
          {tagline && <p className="mt-4 text-lg text-neutral-600">{tagline}</p>}
        </div>
        <div
          className="flex aspect-square items-center justify-center rounded-3xl"
          style={{ background: `linear-gradient(135deg, ${colors.primary}22, ${colors.secondary}22)` }}
        >
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt={businessName} className="h-2/3 w-2/3 object-contain" />
          ) : (
            <span className="text-6xl font-bold" style={{ color: colors.primary }}>
              {businessName.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
      </section>
    );
  }

  // centered
  return (
    <section className="mx-auto flex max-w-3xl flex-col items-center px-6 py-24 text-center">
      {logoUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={logoUrl} alt={businessName} className="mb-6 h-16 w-16 object-contain" />
      )}
      <span className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: colors.primary }}>
        {eyebrow}
      </span>
      <h1 className={`${headingClass} mt-3`}>{businessName}</h1>
      {tagline && <p className="mt-4 max-w-xl text-lg text-neutral-600">{tagline}</p>}
    </section>
  );
}
