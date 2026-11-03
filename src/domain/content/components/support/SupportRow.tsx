import { ChevronRight } from 'lucide-react';
import type { ReactNode } from 'react';

const ROW =
  'press w-full min-h-16 px-4 py-3.5 flex items-center gap-3 text-left hover:bg-ink/[0.03] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-teal-400/50 focus-visible:outline-none';

interface SupportRowProps {
  label: string;
  hint?: string;
  href?: string;
  external?: boolean;
  onClick?: () => void;
  trailing?: ReactNode;
}

/** Linha de lista do Suporte: título, contexto e seta, sem ícone (lista compacta da D17). Vira link quando recebe `href`. */
export function SupportRow({ label, hint, href, external, onClick, trailing }: SupportRowProps) {
  const content = (
    <>
      <span className="flex-1 min-w-0">
        <span className="block text-[15px] font-semibold text-ink">{label}</span>
        {hint && <span className="block text-[13px] text-ink/70 break-words">{hint}</span>}
      </span>
      {!trailing && <ChevronRight size={18} className="shrink-0 text-ink/40" aria-hidden="true" />}
    </>
  );
  return (
    <li className="flex items-center">
      {href ? (
        <a
          href={href}
          className={ROW}
          {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        >
          {content}
        </a>
      ) : (
        <button type="button" onClick={onClick} className={ROW}>
          {content}
        </button>
      )}
      {trailing}
    </li>
  );
}
