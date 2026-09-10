const SIZES = {
  sm: { mark: 28, text: 'text-lg', gap: 'gap-2' },
  md: { mark: 36, text: 'text-xl', gap: 'gap-2.5' },
  lg: { mark: 52, text: 'text-3xl', gap: 'gap-3' },
} as const;

export function Logo({
  size = 'md',
  muted = false,
  iconOnly = false,
}: {
  size?: keyof typeof SIZES;
  muted?: boolean;
  iconOnly?: boolean;
}) {
  const { mark, text, gap } = SIZES[size];

  const icon = (
    <svg width={mark} height={mark} viewBox="0 0 40 40" fill="none" aria-hidden="true" className="shrink-0">
      <defs>
        <linearGradient id="aidmin-mark" x1="2" y1="2" x2="38" y2="38" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FF5A7A" />
          <stop offset="55%" stopColor="#FF8A5B" />
          <stop offset="100%" stopColor="#6A4CFF" />
        </linearGradient>
      </defs>
      <rect x="1.5" y="1.5" width="37" height="37" rx="11" fill="url(#aidmin-mark)" />
      <rect x="1.5" y="1.5" width="37" height="37" rx="11" stroke="white" strokeOpacity="0.25" />
      <path
        d="M13 27L18.2 13H21.8L27 27H23.6L22.5 23.9H17.5L16.4 27H13ZM18.4 21.3H21.6L20 16.7L18.4 21.3Z"
        fill="white"
      />
      <circle cx="29.5" cy="12" r="2.4" fill="white" fillOpacity="0.92" />
    </svg>
  );

  if (iconOnly) return icon;

  return (
    <span className={`inline-flex items-center ${gap}`}>
      {icon}
      <span className={`font-display font-semibold leading-none tracking-tight ${text}`}>
        <span className="text-gradient-warm">AI</span>
        <span className={muted ? 'text-white' : 'text-[var(--color-violet-ink)]'}>dmin</span>
      </span>
    </span>
  );
}
