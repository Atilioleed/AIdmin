import type { ReactNode } from 'react';

/** Para previews de una linea (listas, tarjetas) - saca la sintaxis de markdown sin renderizarla. */
export function stripMarkdown(text: string): string {
  return text
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/`(.+?)`/g, '$1')
    .replace(/^[-*]\s+/gm, '')
    .replace(/^---+$/gm, '')
    .replace(/\n+/g, ' ')
    .trim();
}

// Renderizador de markdown propio y liviano (sin dependencia externa) para los
// reportes que generan los agentes - vienen en markdown simple (## titulo, **texto
// en negrita** como sub-seccion, listas con "-", horizontal rule "---"). No usa
// dangerouslySetInnerHTML: arma elementos React reales, asi que el contenido del
// reporte (que puede venir de datos externos, ver asUntrustedContent()) nunca se
// interpreta como HTML.

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  const parts: ReactNode[] = [];
  const pattern = /\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let i = 0;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    if (match[1] !== undefined) {
      parts.push(
        <strong key={`${keyPrefix}-b${i}`} className="font-semibold text-[var(--color-ink)]">
          {match[1]}
        </strong>,
      );
    } else if (match[2] !== undefined) {
      parts.push(
        <em key={`${keyPrefix}-i${i}`} className="italic">
          {match[2]}
        </em>,
      );
    } else if (match[3] !== undefined) {
      parts.push(
        <code key={`${keyPrefix}-c${i}`} className="rounded bg-[var(--color-surface-sunken)] px-1 py-0.5 font-mono text-[0.85em]">
          {match[3]}
        </code>,
      );
    }
    lastIndex = pattern.lastIndex;
    i += 1;
  }
  if (lastIndex < text.length) parts.push(text.slice(lastIndex));
  return parts;
}

// Una linea entera envuelta en **...** (nada mas) es una sub-seccion, no negrita
// dentro de una oracion - asi arma la pauta el CEO (ver agents/ceo/constitution.md).
function isStandaloneBold(line: string): string | null {
  const trimmed = line.trim();
  const match = /^\*\*(.+)\*\*$/.exec(trimmed);
  return match ? match[1] : null;
}

export function MarkdownContent({ text, compact = false }: { text: string; compact?: boolean }) {
  const lines = text.replace(/\r\n/g, '\n').split('\n');
  const blocks: ReactNode[] = [];
  let i = 0;
  let key = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (trimmed === '') {
      i += 1;
      continue;
    }

    if (/^---+$/.test(trimmed)) {
      blocks.push(<hr key={key++} className="my-5 border-[var(--color-border-soft)]" />);
      i += 1;
      continue;
    }

    const h2 = /^##\s+(.+)/.exec(trimmed);
    if (h2) {
      blocks.push(
        <h2
          key={key++}
          className={`font-display font-semibold text-[var(--color-ink)] first:mt-0 ${compact ? 'mt-3 text-base' : 'mt-6 text-xl'}`}
        >
          {renderInline(h2[1], `h2-${key}`)}
        </h2>,
      );
      i += 1;
      continue;
    }

    const h3 = /^###\s+(.+)/.exec(trimmed);
    if (h3) {
      blocks.push(
        <h3 key={key++} className={`font-semibold text-[var(--color-ink)] ${compact ? 'mt-3 text-sm' : 'mt-5 text-base'}`}>
          {renderInline(h3[1], `h3-${key}`)}
        </h3>,
      );
      i += 1;
      continue;
    }

    const standaloneBold = isStandaloneBold(trimmed);
    if (standaloneBold) {
      blocks.push(
        <h3
          key={key++}
          className={`flex items-center gap-2 font-semibold text-[var(--color-violet)] ${compact ? 'mt-3 text-sm' : 'mt-5 text-base'}`}
        >
          {renderInline(standaloneBold, `sb-${key}`)}
        </h3>,
      );
      i += 1;
      continue;
    }

    if (/^[-*]\s+/.test(trimmed)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^[-*]\s+/, ''));
        i += 1;
      }
      blocks.push(
        <ul key={key++} className={`flex flex-col gap-1.5 ${compact ? 'my-1' : 'my-2'}`}>
          {items.map((item, idx) => (
            <li key={idx} className="flex gap-2 text-sm leading-relaxed text-[var(--color-ink-soft)]">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full" style={{ background: 'var(--gradient-brand)' }} />
              <span>{renderInline(item, `li-${key}-${idx}`)}</span>
            </li>
          ))}
        </ul>,
      );
      continue;
    }

    if (/^\d+\.\s+/.test(trimmed)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^\d+\.\s+/, ''));
        i += 1;
      }
      blocks.push(
        <ol
          key={key++}
          className={`flex list-decimal flex-col gap-1.5 pl-5 marker:font-semibold marker:text-[var(--color-violet)] ${compact ? 'my-1' : 'my-2'}`}
        >
          {items.map((item, idx) => (
            <li key={idx} className="text-sm leading-relaxed text-[var(--color-ink-soft)]">
              {renderInline(item, `ol-${key}-${idx}`)}
            </li>
          ))}
        </ol>,
      );
      continue;
    }

    // Parrafo: junta lineas seguidas hasta la proxima linea vacia o el proximo bloque especial.
    const paraLines: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() !== '' &&
      !/^(##|###|[-*]\s|\d+\.\s|---+$)/.test(lines[i].trim()) &&
      !isStandaloneBold(lines[i].trim())
    ) {
      paraLines.push(lines[i].trim());
      i += 1;
    }
    blocks.push(
      <p key={key++} className={`text-sm leading-relaxed text-[var(--color-ink-soft)] ${compact ? 'my-1' : 'my-2'}`}>
        {renderInline(paraLines.join(' '), `p-${key}`)}
      </p>,
    );
  }

  return <div className="flex flex-col">{blocks}</div>;
}
