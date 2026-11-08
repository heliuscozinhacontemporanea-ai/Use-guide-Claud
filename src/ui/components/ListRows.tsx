import { ChevronRight } from 'lucide-react';
import type { ReactNode } from 'react';
import { StatusText, type StatusTone } from './StatusText';

/** Cartão de lista com divisórias (p09, p19): cada linha é um `ListRowButton`. */
export function ListCard({ label, children }: { label?: string; children: ReactNode }) {
  return (
    <ul
      aria-label={label}
      className="rounded-[20px] bg-surface border border-line divide-y divide-line overflow-hidden"
    >
      {children}
    </ul>
  );
}

/** Linha tocável: título, linha de apoio, status com ponto e seta. */
export function ListRowButton({
  title,
  sub,
  status,
  aside,
  onClick,
}: {
  title: string;
  sub?: string;
  status?: { tone: StatusTone; text: string };
  aside?: ReactNode;
  onClick: () => void;
}) {
  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        className="press w-full px-4 py-3.5 min-h-16 flex items-center gap-3 text-left focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-teal-400/50"
      >
        <span className="flex-1 min-w-0">
          <span className="block text-[15px] font-semibold text-ink break-words">{title}</span>
          {sub && <span className="block text-[13px] text-ink/70">{sub}</span>}
          {status && (
            <span className="mt-1 block">
              <StatusText tone={status.tone}>{status.text}</StatusText>
            </span>
          )}
        </span>
        {aside}
        <ChevronRight size={18} className="text-ink/50 shrink-0" aria-hidden="true" />
      </button>
    </li>
  );
}

/** Linha só de leitura, com valor à direita (ex.: vendas por item, p23). */
export function ListRowStatic({
  title,
  sub,
  aside,
}: {
  title: string;
  sub?: string;
  aside?: ReactNode;
}) {
  return (
    <li className="px-4 py-3.5 min-h-16 flex items-center gap-3">
      <span className="flex-1 min-w-0">
        <span className="block text-[15px] font-semibold text-ink break-words">{title}</span>
        {sub && <span className="block text-[13px] text-ink/70">{sub}</span>}
      </span>
      {aside}
    </li>
  );
}
