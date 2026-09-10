'use client';

import { useEffect, useState } from 'react';
import { AGENTS, AgentIcon, type AgentKey } from './marketing/AgentIcon';
import { Logo } from './Logo';

export interface AgentActivityInput {
  agentSlug: AgentKey;
  lastActiveAt: Date | string | null;
}

const VIEW_W = 480;
const VIEW_H = 340;
const CENTER = { x: VIEW_W / 2, y: VIEW_H / 2 };
const RX = 188;
const RY = 122;

const NODES = AGENTS.map((agent, i) => {
  const angle = ((-90 + i * 60) * Math.PI) / 180;
  return {
    key: agent.key,
    name: agent.name,
    x: CENTER.x + RX * Math.cos(angle),
    y: CENTER.y + RY * Math.sin(angle),
  };
});

// Curva suave hacia el centro, siempre en el mismo sentido de giro — le da al
// conjunto una sensacion de remolino/flujo en vez de rayos rectos y rigidos.
function connectorPath(x: number, y: number): string {
  const mx = (x + CENTER.x) / 2;
  const my = (y + CENTER.y) / 2;
  const dx = CENTER.x - x;
  const dy = CENTER.y - y;
  const len = Math.hypot(dx, dy) || 1;
  const px = -dy / len;
  const py = dx / len;
  const curve = 34;
  return `M ${x} ${y} Q ${mx + px * curve} ${my + py * curve} ${CENTER.x} ${CENTER.y}`;
}

function minutesAgo(date: Date): number {
  return Math.max(0, Math.floor((Date.now() - date.getTime()) / 60000));
}

function relativeLabel(date: Date | null): string {
  if (!date) return 'sin actividad aún';
  const minutes = minutesAgo(date);
  if (minutes < 1) return 'justo ahora';
  if (minutes < 60) return `hace ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `hace ${hours} h`;
  return `hace ${Math.floor(hours / 24)} d`;
}

const RECENT_THRESHOLD_MIN = 60 * 24; // < 24h se muestra como "activo"

export function AgentNetworkVisual({
  activity,
  title,
  subtitle,
  compact = false,
}: {
  /** Si se omite, el componente queda en modo decorativo (todos los nodos "vivos"). */
  activity?: AgentActivityInput[];
  title?: string;
  subtitle?: string;
  compact?: boolean;
}) {
  const [mounted, setMounted] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const id = requestAnimationFrame(() => {
      setMounted(true);
      setReducedMotion(prefersReduced);
    });
    return () => cancelAnimationFrame(id);
  }, []);

  const activityBySlug = new Map(
    (activity ?? []).map((a) => [a.agentSlug, a.lastActiveAt ? new Date(a.lastActiveAt) : null]),
  );
  const isLive = activity !== undefined;

  return (
    <div
      className={`relative overflow-hidden rounded-3xl border border-white/10 ${compact ? 'p-5' : 'p-8'}`}
      style={{ background: 'var(--gradient-hero)' }}
    >
      <div
        className="pointer-events-none absolute -left-20 -top-16 h-72 w-72 rounded-full opacity-25 blur-3xl animate-drift"
        style={{ background: 'var(--gradient-cool)' }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-20 -right-10 h-72 w-72 rounded-full opacity-20 blur-3xl animate-drift"
        style={{ background: 'var(--gradient-warm)', animationDelay: '4s' }}
        aria-hidden="true"
      />

      {(title || subtitle) && (
        <div className="relative mb-4 flex items-start justify-between gap-3">
          <div>
            {title && <h3 className="font-display text-lg font-semibold text-white">{title}</h3>}
            {subtitle && <p className="mt-0.5 max-w-md text-xs text-white/60">{subtitle}</p>}
          </div>
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-[11px] font-semibold text-[var(--color-gold-soft)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-gold)] animate-pulse-glow" />
            En vivo, sin pausas
          </span>
        </div>
      )}

      <div className="relative w-full" style={{ aspectRatio: `${VIEW_W} / ${VIEW_H}` }}>
        <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} className="absolute inset-0 h-full w-full" aria-hidden="true">
          <defs>
            <linearGradient id="anv-connector" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#ff8a5b" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#9b7bff" stopOpacity="0.55" />
            </linearGradient>
            <radialGradient id="anv-core" cx="35%" cy="30%" r="75%">
              <stop offset="0%" stopColor="#ffb08a" />
              <stop offset="45%" stopColor="#ff5a7a" />
              <stop offset="100%" stopColor="#6a4cff" />
            </radialGradient>
            <filter id="anv-glow" x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* particulas de fondo, puramente decorativas */}
          {[...Array(14)].map((_, i) => {
            const bx = (i * 137) % VIEW_W;
            const by = (i * 71 + 30) % VIEW_H;
            return (
              <circle
                key={i}
                cx={bx}
                cy={by}
                r={i % 3 === 0 ? 1.6 : 1}
                fill="white"
                className={mounted && !reducedMotion ? 'animate-twinkle' : ''}
                style={{ animationDelay: `${(i % 7) * 0.5}s` }}
                opacity={0.3}
              />
            );
          })}

          {NODES.map((node, i) => {
            const lastActiveAt = activityBySlug.get(node.key) ?? null;
            const recent = isLive ? Boolean(lastActiveAt && minutesAgo(lastActiveAt) < RECENT_THRESHOLD_MIN) : true;
            const pathId = `anv-path-${node.key}`;
            return (
              <g key={node.key}>
                <path
                  id={pathId}
                  d={connectorPath(node.x, node.y)}
                  stroke="url(#anv-connector)"
                  strokeWidth={1.5}
                  fill="none"
                  opacity={recent ? 0.55 : 0.2}
                />
                {mounted && !reducedMotion && recent && (
                  <circle r={2.6} fill="#ffe3ad" filter="url(#anv-glow)">
                    <animateMotion
                      dur={`${3 + (i % 3)}s`}
                      begin={`${i * 0.45}s`}
                      repeatCount="indefinite"
                      keyPoints="0;1;0"
                      keyTimes="0;0.5;1"
                      calcMode="linear"
                    >
                      <mpath href={`#${pathId}`} />
                    </animateMotion>
                  </circle>
                )}
              </g>
            );
          })}

          <circle
            cx={CENTER.x}
            cy={CENTER.y}
            r={34}
            fill="url(#anv-core)"
            filter="url(#anv-glow)"
            className={mounted && !reducedMotion ? 'animate-core-breathe' : ''}
          />
        </svg>

        {/* Nucleo — overlay HTML sobre el brillo SVG, para nitidez */}
        <div
          className="absolute flex items-center justify-center rounded-xl bg-white/90 p-1.5 shadow-[var(--shadow-glow)]"
          style={{
            left: `${(CENTER.x / VIEW_W) * 100}%`,
            top: `${(CENTER.y / VIEW_H) * 100}%`,
            transform: 'translate(-50%, -50%)',
          }}
        >
          <Logo size="sm" iconOnly />
        </div>

        {NODES.map((node) => {
          const agent = AGENTS.find((a) => a.key === node.key)!;
          const lastActiveAt = activityBySlug.get(node.key) ?? null;
          const recent = isLive ? Boolean(lastActiveAt && minutesAgo(lastActiveAt) < RECENT_THRESHOLD_MIN) : true;
          return (
            <div
              key={node.key}
              className="absolute flex flex-col items-center gap-1"
              style={{
                left: `${(node.x / VIEW_W) * 100}%`,
                top: `${(node.y / VIEW_H) * 100}%`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              <div className="relative">
                <span
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white shadow-[var(--shadow-glow)]"
                  style={{ background: 'var(--gradient-brand)' }}
                >
                  <AgentIcon agent={node.key} size={17} />
                </span>
                <svg width={40} height={40} viewBox="0 0 40 40" className="pointer-events-none absolute inset-0" aria-hidden="true">
                  {mounted && !reducedMotion && recent && (
                    <circle cx="20" cy="20" r="17" fill="none" stroke="var(--color-gold)" strokeWidth="1.4" className="animate-node-pulse-ring" />
                  )}
                </svg>
                <span
                  className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-[var(--color-violet-deep)]"
                  style={{ background: recent ? 'var(--color-gold)' : 'rgba(255,255,255,0.25)' }}
                  aria-hidden="true"
                />
              </div>
              <span className="text-[10px] font-semibold leading-none text-white/85">{agent.name}</span>
              {isLive && mounted && (
                <span className="text-[9px] leading-none text-white/45">{relativeLabel(lastActiveAt)}</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
