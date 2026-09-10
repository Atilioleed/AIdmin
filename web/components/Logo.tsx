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
      {/* Marca: un cerebro hecho de nodos conectados - la misma idea de "red de
          agentes siempre conectados" de components/AgentNetworkVisual.tsx, en
          miniatura. No es un cerebro anatomico ni un icono de stock: es la forma
          propia del producto. */}
      <g stroke="white" strokeOpacity="0.55" strokeWidth="1.1" strokeLinecap="round">
        <line x1="20" y1="9" x2="27" y2="12.5" />
        <line x1="27" y1="12.5" x2="30" y2="20" />
        <line x1="30" y1="20" x2="25.5" y2="27.5" />
        <line x1="25.5" y1="27.5" x2="20" y2="30" />
        <line x1="20" y1="30" x2="14.5" y2="27.5" />
        <line x1="14.5" y1="27.5" x2="10" y2="20" />
        <line x1="10" y1="20" x2="13" y2="12.5" />
        <line x1="13" y1="12.5" x2="20" y2="9" />
        <line x1="20" y1="20" x2="20" y2="9" />
        <line x1="20" y1="20" x2="30" y2="20" />
        <line x1="20" y1="20" x2="20" y2="30" />
        <line x1="20" y1="20" x2="10" y2="20" />
      </g>
      <g fill="white">
        <circle cx="20" cy="20" r="2.6" fillOpacity="0.95" />
        <circle cx="20" cy="9" r="1.7" fillOpacity="0.85" />
        <circle cx="27" cy="12.5" r="1.5" fillOpacity="0.75" />
        <circle cx="30" cy="20" r="1.7" fillOpacity="0.85" />
        <circle cx="25.5" cy="27.5" r="1.5" fillOpacity="0.75" />
        <circle cx="20" cy="30" r="1.7" fillOpacity="0.85" />
        <circle cx="14.5" cy="27.5" r="1.5" fillOpacity="0.75" />
        <circle cx="10" cy="20" r="1.7" fillOpacity="0.85" />
        <circle cx="13" cy="12.5" r="1.5" fillOpacity="0.75" />
      </g>
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
