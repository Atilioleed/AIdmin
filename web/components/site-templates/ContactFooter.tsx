import type { TenantSiteContent } from './types';

const LINKS: { key: keyof TenantSiteContent['contact']; label: string }[] = [
  { key: 'instagram', label: 'Instagram' },
  { key: 'facebook', label: 'Facebook' },
  { key: 'tiktok', label: 'TikTok' },
  { key: 'linkedin', label: 'LinkedIn' },
  { key: 'xTwitter', label: 'X / Twitter' },
  { key: 'youtube', label: 'YouTube' },
  { key: 'website', label: 'Sitio' },
];

export function ContactFooter({ content }: { content: TenantSiteContent }) {
  const activeLinks = LINKS.filter((l) => content.contact[l.key].trim());

  return (
    <footer className="border-t border-neutral-200 px-6 py-10 text-center">
      <p className="font-semibold text-neutral-900">{content.businessName}</p>
      {activeLinks.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center justify-center gap-4 text-sm text-neutral-500">
          {activeLinks.map((l) => (
            <span key={l.key}>{content.contact[l.key]}</span>
          ))}
        </div>
      )}
      <p className="mt-6 text-xs text-neutral-400">Sitio creado con AIdmin</p>
    </footer>
  );
}
