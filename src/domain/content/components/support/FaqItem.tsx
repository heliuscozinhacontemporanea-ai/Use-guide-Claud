import { ChevronDown } from 'lucide-react';
import { useId, useState } from 'react';
import { cn } from '../../../../shared/utils/cn';

export type FaqEntry = { id: string; q: string; a: string };

/** Pergunta que abre a resposta logo abaixo (botão com aria-expanded). */
export function FaqItem({ entry }: { entry: FaqEntry }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  return (
    <li>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
        className="w-full min-h-14 px-4 py-3 flex items-center gap-3 text-left hover:bg-ink/[0.03] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-teal-400/50 focus-visible:outline-none"
      >
        <span className="flex-1 text-[15px] font-semibold text-ink">{entry.q}</span>
        <ChevronDown
          size={18}
          aria-hidden="true"
          className={cn(
            'shrink-0 text-ink/40 transition-transform motion-reduce:transition-none',
            open && 'rotate-180'
          )}
        />
      </button>
      {open && (
        <p id={panelId} className="px-4 pb-4 text-[14px] text-ink/80 leading-relaxed">
          {entry.a}
        </p>
      )}
    </li>
  );
}
