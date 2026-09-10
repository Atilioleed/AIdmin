import { Logo } from '../Logo';

export function MarketingFooter() {
  return (
    <footer className="border-t border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
        <Logo size="sm" />
        <p className="text-xs text-[var(--color-ink-faint)]">
          © {new Date().getFullYear()} AIdmin — gerentes de inteligencia artificial para pymes.
        </p>
      </div>
    </footer>
  );
}
