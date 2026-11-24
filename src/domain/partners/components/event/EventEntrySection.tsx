import { Ticket } from 'lucide-react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '../../../../shared/utils/cn';
import { type EventSectionProps, updateEventField } from './eventSectionProps';

interface EventEntrySectionProps extends EventSectionProps {
  renderEventTicketingManager?: (eventListingId: string) => ReactNode;
  /** Evento do Use Guide não vende pelo app (escolhas da F4): "Pago no local", sem lotes. */
  sellsTickets?: boolean;
}

const OPTION_CLASS =
  'min-h-[44px] relative overflow-hidden py-4 px-6 rounded-2xl border text-sm font-bold tracking-wider uppercase transition-all duration-300 flex items-center justify-center gap-2 backdrop-blur-md focus-visible:ring-2 focus-visible:ring-teal-400/50';

export function EventEntrySection({
  item,
  onChange,
  renderEventTicketingManager,
  sellsTickets = true,
}: EventEntrySectionProps) {
  const { t } = useTranslation();
  const isPaid = item.entryType === 'pago';

  return (
    <div className="space-y-6 pt-4 border-t border-line">
      <div className="flex items-center gap-2">
        <span className="p-2 rounded-xl bg-surface border border-line text-accent">
          <Ticket size={18} aria-hidden="true" />
        </span>
        <h3 className="text-sm font-black text-ink uppercase tracking-widest">
          {t('partnerCatalog.fields.entryTitle')}
        </h3>
      </div>

      <div
        className="grid grid-cols-2 gap-4"
        role="radiogroup"
        aria-label={t('partnerCatalog.fields.entryLabel')}
      >
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
          {t(sellsTickets ? 'partnerCatalog.fields.paid' : 'partnerCatalog.fields.paidAtPlace')}
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
          {t('partnerCatalog.fields.free')}
        </button>
      </div>

      {!sellsTickets ? (
        <p className="px-1 text-[13px] text-ink/70">{t('partnerCatalog.fields.noAppSales')}</p>
      ) : null}
      {sellsTickets && item.id && renderEventTicketingManager && (
        <div className="pt-4">{renderEventTicketingManager(item.id)}</div>
      )}
    </div>
  );
}
