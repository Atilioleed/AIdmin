const NETWORK_META: Record<string, { label: string; color: string }> = {
  instagram: { label: 'Instagram', color: '#E1306C' },
  facebook: { label: 'Facebook', color: '#1877F2' },
  tiktok: { label: 'TikTok', color: '#111111' },
  linkedin: { label: 'LinkedIn', color: '#0A66C2' },
  x: { label: 'X / Twitter', color: '#111111' },
  twitter: { label: 'X / Twitter', color: '#111111' },
  youtube: { label: 'YouTube', color: '#FF0000' },
};

export function NetworkBadge({ channel }: { channel: string }) {
  const meta = NETWORK_META[channel.toLowerCase()] ?? { label: channel, color: 'var(--color-violet)' };
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold text-white"
      style={{ background: meta.color }}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-white/80" />
      {meta.label}
    </span>
  );
}
