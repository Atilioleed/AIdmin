import { Logo } from '../Logo';

export function MarketingFooter() {
  return (
    <footer className="border-t border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
        <Logo size="sm" />
        <div className="flex flex-col items-center gap-1 text-xs text-[var(--color-ink-faint)] sm:items-end">
          <p className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 sm:justify-end">
            <a href="mailto:hola@aidmin.cl" className="hover:text-[var(--color-ink-soft)]">
              hola@aidmin.cl
            </a>
            <span aria-hidden="true">·</span>
            <a href="https://wa.me/56942668165" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--color-ink-soft)]">
              +56 9 4266 8165
            </a>
          </p>
          <p>© {new Date().getFullYear()} AIdmin — gerentes de inteligencia artificial para pymes.</p>
        </div>
      </div>
    </footer>
  );
}
