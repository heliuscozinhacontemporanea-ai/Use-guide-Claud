import { ChevronRight } from 'lucide-react';
import type { ReactNode } from 'react';

/** Número em destaque com rótulo e linha de apoio (p10, p19). Com `action`, o cartão inteiro abre o detalhe. */
export function StatTile({
  label,
  value,
  hint,
  action,
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  action?: { label: string; onClick: () => void };
}) {
  const body = (
    <>
      <span className="flex items-center justify-between gap-2 text-[13px] text-ink/70">
        {label}
        {action && <ChevronRight size={16} className="shrink-0 text-ink/50" aria-hidden="true" />}
      </span>
      <span className="block text-[24px] leading-tight font-bold text-ink break-words">
        {value}
      </span>
      {hint && <span className="block text-[13px] text-ink/70">{hint}</span>}
      {action && (
        <span className="block pt-1 text-[13px] font-semibold text-accent">{action.label}</span>
      )}
    </>
  );
  const shape = 'min-w-0 rounded-[20px] bg-surface border border-line p-4 space-y-1';
  return action ? (
    <button
      type="button"
      onClick={action.onClick}
      className={`press ${shape} block w-full text-left focus-visible:ring-2 focus-visible:ring-teal-400/50 focus-visible:outline-none`}
    >
      {body}
    </button>
  ) : (
    <div className={shape}>{body}</div>
  );
}
