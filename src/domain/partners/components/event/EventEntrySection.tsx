import { Ticket } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '../../../../shared/utils/cn';
import { type EventSectionProps, updateEventField } from './eventSectionProps';

interface EventEntrySectionProps extends EventSectionProps {
  renderEventTicketingManager?: (eventListingId: string) => ReactNode;
}

const OPTION_CLASS =
  'min-h-[44px] relative overflow-hidden py-4 px-6 rounded-2xl border text-sm font-bold tracking-wider uppercase transition-all duration-300 flex items-center justify-center gap-2 backdrop-blur-md focus-visible:ring-2 focus-visible:ring-teal-400/50';

export function EventEntrySection({
  item,
  onChange,
  renderEventTicketingManager,
}: EventEntrySectionProps) {
  const isPaid = item.entryType === 'pago';

  return (
    <div className="space-y-6 pt-4 border-t border-white/5">
      <div className="flex items-center gap-2">
        <span className="p-2 rounded-xl bg-white/5 border border-white/10 text-indigo-400">
          <Ticket size={18} aria-hidden="true" />
        </span>
        <h3 className="text-sm font-black text-white uppercase tracking-widest">
          Entradas / Ingressos
        </h3>
      </div>

      <div className="grid grid-cols-2 gap-4" role="radiogroup" aria-label="Tipo de entrada">
        <button
          type="button"
          role="radio"
          aria-checked={isPaid}
          onClick={() => updateEventField({ item, onChange }, 'entryType', 'pago')}
          className={cn(
            OPTION_CLASS,
            isPaid
              ? 'bg-indigo-500/80 border-indigo-500/20 text-white shadow-[0_0_20px_rgba(99,102,241,0.2)]'
              : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:text-white'
          )}
        >
          Pago
        </button>
        <button
          type="button"
          role="radio"
          aria-checked={!isPaid}
          onClick={() => updateEventField({ item, onChange }, 'entryType', 'gratuito')}
          className={cn(
            OPTION_CLASS,
            !isPaid
              ? 'bg-indigo-500/50 border-indigo-500/20 text-white shadow-[0_0_20px_rgba(99,102,241,0.2)]'
              : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:text-white'
          )}
        >
          Entrada gratuita
        </button>
      </div>

      {item.id && renderEventTicketingManager && (
        <div className="pt-4">{renderEventTicketingManager(item.id)}</div>
      )}
    </div>
  );
}
