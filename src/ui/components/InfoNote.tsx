import { Info } from 'lucide-react';
import type { ReactNode } from 'react';

/** Quadro de aviso do painel do parceiro, com ícone ⓘ (protótipos da F3). */
export function InfoNote({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-start gap-2 rounded-2xl border border-partner-line bg-partner-soft px-3 py-2.5">
      <Info size={14} aria-hidden="true" className="mt-0.5 shrink-0 text-partner" />
      <p className="text-[13px] leading-snug text-ink/80">{children}</p>
    </div>
  );
}

/** Destaque dentro do aviso (`<b>` nas traduções). */
export const INFO_NOTE_STRONG = <strong className="font-semibold text-partner" />;
