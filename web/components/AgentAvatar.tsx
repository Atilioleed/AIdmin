'use client';

import { useEffect, useState } from 'react';
import type { AgentKey } from './marketing/AgentIcon';

interface AvatarStyle {
  primary: string;
  secondary: string;
  accessory: 'crown' | 'megaphone' | 'coin' | 'magnifier' | 'scale' | 'brackets';
}

const AVATAR_STYLES: Record<AgentKey, AvatarStyle> = {
  ceo: { primary: '#6A4CFF', secondary: '#9B7BFF', accessory: 'crown' },
  marketing: { primary: '#FF5A7A', secondary: '#FF8FA6', accessory: 'megaphone' },
  finanzas: { primary: '#3E8FE0', secondary: '#7DB8F2', accessory: 'coin' },
  producto: { primary: '#FF8A5B', secondary: '#FFB18A', accessory: 'magnifier' },
  legal: { primary: '#5B3F8C', secondary: '#8A6FC0', accessory: 'scale' },
  desarrollo: { primary: '#E0A62E', secondary: '#F7BC45', accessory: 'brackets' },
};

function Accessory({ kind, color }: { kind: AvatarStyle['accessory']; color: string }) {
  switch (kind) {
    case 'crown':
      return (
        <path
          d="M-9 -3 L-6 -9 L-2 -4 L0 -10 L2 -4 L6 -9 L9 -3 L9 1 L-9 1 Z"
          fill={color}
          stroke="white"
          strokeWidth="0.8"
          strokeLinejoin="round"
        />
      );
    case 'megaphone':
      return (
        <g fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M-8 1 L2 -5 L2 7 L-8 1 Z" fill={color} stroke="none" />
          <path d="M2 -5 L9 -8 V10 L2 7" />
          <path d="M-3 3.5 L-4.5 8" />
        </g>
      );
    case 'coin':
      return (
        <g>
          <circle cx="0" cy="-1" r="8" fill={color} stroke="white" strokeWidth="0.8" />
          <text x="0" y="2.5" fontSize="9" fontWeight="700" fill="white" textAnchor="middle" fontFamily="sans-serif">
            $
          </text>
        </g>
      );
    case 'magnifier':
      return (
        <g fill="none" stroke={color} strokeWidth="2" strokeLinecap="round">
          <circle cx="-2" cy="-3" r="6" />
          <path d="M2.5 1.5 L8 7" />
        </g>
      );
    case 'scale':
      return (
        <g fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M0 -9 V5" />
          <path d="M-8 -6 H8" />
          <path d="M-8 -6 L-11 0 A3.2 3.2 0 0 0 -5 0 Z" fill={color} stroke="none" />
          <path d="M8 -6 L5 0 A3.2 3.2 0 0 0 11 0 Z" fill={color} stroke="none" />
          <path d="M-5 5 H5" />
        </g>
      );
    case 'brackets':
      return (
        <text x="0" y="4" fontSize="15" fontWeight="700" fill={color} textAnchor="middle" fontFamily="ui-monospace, monospace">
          {'</>'}
        </text>
      );
  }
}

export function AgentAvatar({
  agent,
  size = 72,
  animated = true,
}: {
  agent: AgentKey;
  size?: number;
  animated?: boolean;
}) {
  const style = AVATAR_STYLES[agent];
  const [mounted, setMounted] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const id = `bot-${agent}`;

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const frame = requestAnimationFrame(() => {
      setMounted(true);
      setReducedMotion(prefersReduced);
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  const anim = animated && mounted && !reducedMotion;

  return (
    <svg width={size} height={size} viewBox="0 0 100 110" aria-hidden="true">
      <defs>
        <linearGradient id={`${id}-grad`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={style.secondary} />
          <stop offset="100%" stopColor={style.primary} />
        </linearGradient>
        <filter id={`${id}-glow`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2.2" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* grupo entero: rebote suave e idle */}
      <g
        style={
          anim
            ? { animation: 'bot-bob 3.4s ease-in-out infinite', transformBox: 'fill-box', transformOrigin: 'center' }
            : undefined
        }
      >
        {/* antena */}
        <line x1="50" y1="18" x2="50" y2="8" stroke={style.primary} strokeWidth="2.4" strokeLinecap="round" />
        <circle
          cx="50"
          cy="6"
          r="3.2"
          fill={style.secondary}
          filter={`url(#${id}-glow)`}
          style={
            anim
              ? { animation: 'bot-pulse 2.2s ease-in-out infinite', transformBox: 'fill-box', transformOrigin: 'center' }
              : undefined
          }
        />

        {/* cabeza */}
        <rect x="24" y="18" width="52" height="42" rx="16" fill={`url(#${id}-grad)`} stroke="white" strokeOpacity="0.4" strokeWidth="1.2" />

        {/* pantalla de la cara */}
        <rect x="32" y="28" width="36" height="22" rx="9" fill="white" fillOpacity="0.14" />

        {/* ojos: parpadeo */}
        <g
          fill="white"
          style={
            anim
              ? { animation: 'bot-blink 4.2s ease-in-out infinite', transformBox: 'fill-box', transformOrigin: 'center' }
              : undefined
          }
        >
          <circle cx="42" cy="39" r="4" />
          <circle cx="58" cy="39" r="4" />
        </g>

        {/* cuerpo */}
        <rect x="30" y="64" width="40" height="30" rx="12" fill={`url(#${id}-grad)`} stroke="white" strokeOpacity="0.4" strokeWidth="1.2" />
        <circle cx="50" cy="79" r="6" fill="white" fillOpacity="0.16" />

        {/* accesorio flotando sobre la cabeza */}
        <g transform="translate(50, 14)">
          <Accessory kind={style.accessory} color={style.primary} />
        </g>
      </g>
    </svg>
  );
}
