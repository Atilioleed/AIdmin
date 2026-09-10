'use client';

import { useState } from 'react';

export function ShareButton() {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const shareData = {
      title: 'AIdmin — gerentes de inteligencia artificial para pymes',
      text: 'Seis gerentes de IA trabajando todos los días en tu pyme, con aprobación humana en cada gasto y publicación.',
      url: typeof window !== 'undefined' ? window.location.href : 'https://aidmin.cl',
    };

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch {
        // usuario cancelo el share nativo - no hacer nada
        return;
      }
    }

    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(shareData.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      className="inline-flex items-center gap-2 text-sm font-semibold text-white/75 hover:text-white"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="18" cy="5" r="2.6" stroke="currentColor" strokeWidth="1.6" />
        <circle cx="6" cy="12" r="2.6" stroke="currentColor" strokeWidth="1.6" />
        <circle cx="18" cy="19" r="2.6" stroke="currentColor" strokeWidth="1.6" />
        <path d="M8.3 10.7 15.7 6.3M8.3 13.3l7.4 4.4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
      {copied ? 'Link copiado' : 'Compartir'}
    </button>
  );
}
