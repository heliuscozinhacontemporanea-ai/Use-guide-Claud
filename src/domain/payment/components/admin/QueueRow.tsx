import { ChevronRight } from 'lucide-react';
import type { ReactNode } from 'react';

/** Linha de uma fila do admin (D17): título, uma linha de contexto, status e valor; o resto na folha. */
export function QueueRow({
  title,
  subtitle,
  status,
  amount,
  onOpen,
  action,
}: {
  title: string;
  subtitle: string;
  status: ReactNode;
  amount: string;
  onOpen?: () => void;
  /** Ação em texto à direita, para filas sem folha de detalhes. */
  action?: ReactNode;
}) {
  const body = (
    <>
      <div className="flex-1 min-w-0">
        <p className="text-[15px] font-semibold text-ink truncate">{title}</p>
        <p className="text-[13px] text-ink/70 truncate">{subtitle}</p>
        <div className="mt-1">{status}</div>
      </div>
      <span className="text-sm font-semibold text-ink tabular-nums">{amount}</span>
    </>
  );
  return (
    <li>
      {onOpen ? (
        <button
          type="button"
          onClick={onOpen}
          className="w-full text-left px-4 py-3.5 min-h-16 flex items-center gap-3 hover:bg-ink/[0.03] focus-visible:outline-none focus-visible:bg-ink/[0.05]"
        >
          {body}
          <ChevronRight size={18} className="text-ink/40 shrink-0" aria-hidden="true" />
        </button>
      ) : (
        <div className="px-4 py-3.5 min-h-16 flex items-center gap-3">
          {body}
          {action}
        </div>
      )}
    </li>
  );
}
