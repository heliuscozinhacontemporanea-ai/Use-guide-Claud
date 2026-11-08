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
    <div className="space-y-6 pt-4 border-t border-line">
      <div className="flex items-center gap-2">
        <span className="p-2 rounded-xl bg-surface border border-line text-accent">
          <Ticket size={18} aria-hidden="true" />
        </span>
        <h3 className="text-sm font-black text-ink uppercase tracking-widest">
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
              ? 'bg-accent-soft border-accent-line text-accent'
              : 'bg-surface border-line text-ink/70 hover:bg-ink/[0.06] hover:text-ink'
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
              ? 'bg-accent-soft border-accent-line text-accent'
              : 'bg-surface border-line text-ink/70 hover:bg-ink/[0.06] hover:text-ink'
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
