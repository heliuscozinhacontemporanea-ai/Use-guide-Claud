import { useTranslation } from 'react-i18next';
import { formatMoneyMinor } from '../../../../shared/utils/money';
import type { PublicTicketTypeProjection } from '../../types/ticketing';

interface TicketTypeListProps {
  ticketTypes: PublicTicketTypeProjection[];
  quantities: Record<string, number>;
  totalQuantity: number;
  maxPerUser: number;
  onChange: (ticketType: PublicTicketTypeProjection, delta: number) => void;
}

const STEP_BUTTON =
  'w-11 h-11 rounded-xl disabled:opacity-40 border font-bold flex items-center justify-center transition-colors focus-visible:ring-2 focus-visible:ring-teal-400/50 cursor-pointer';

export function TicketTypeList({
  ticketTypes,
  quantities,
  totalQuantity,
  maxPerUser,
  onChange,
}: TicketTypeListProps) {
  const { t, i18n } = useTranslation();
  const availability = (ticketType: PublicTicketTypeProjection) => {
    if (ticketType.status === 'sold_out') return t('ticketCheckout.status.soldOut');
    if (ticketType.status === 'not_started') return t('ticketCheckout.status.notStarted');
    if (ticketType.status === 'ended') return t('ticketCheckout.status.ended');
    return t('ticketCheckout.status.available', { count: ticketType.availableQuantity });
  };

  return (
    <ul className="space-y-2.5">
      {ticketTypes.map((ticketType) => {
        const quantity = quantities[ticketType.id] || 0;
        const isAvailable = ticketType.status === 'on_sale' && ticketType.availableQuantity > 0;
        return (
          <li
            key={ticketType.id}
            className="p-3.5 rounded-2xl bg-surface border border-line flex items-center justify-between gap-3"
          >
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-bold text-ink break-words">{ticketType.name}</span>
                <span className="text-xs font-black text-teal-300">
                  {ticketType.kind === 'free' || ticketType.priceMinor <= 0
                    ? t('ticketCheckout.free')
                    : formatMoneyMinor(ticketType.priceMinor, i18n.language)}
                </span>
              </div>
              {ticketType.description && (
                <p className="text-xs text-ink/70 line-clamp-2">{ticketType.description}</p>
              )}
              <p className="text-xs text-ink/70">{availability(ticketType)}</p>
            </div>

            {isAvailable ? (
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => onChange(ticketType, -1)}
                  disabled={quantity === 0}
                  aria-label={t('ticketCheckout.decrease', { name: ticketType.name })}
                  className={`${STEP_BUTTON} bg-surface border-line text-ink`}
                >
                  -
                </button>
                <span className="w-7 text-center text-sm font-bold text-ink" aria-live="polite">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => onChange(ticketType, 1)}
                  disabled={
                    quantity >= ticketType.maxPerOrder ||
                    quantity >= ticketType.availableQuantity ||
                    totalQuantity >= maxPerUser
                  }
                  aria-label={t('ticketCheckout.increase', { name: ticketType.name })}
                  className={`${STEP_BUTTON} bg-teal-500/20 border-teal-500/30 text-teal-300`}
                >
                  +
                </button>
              </div>
            ) : (
              <span className="px-2.5 py-1 rounded-full bg-surface text-ink/70 text-xs font-semibold">
                {t('ticketCheckout.unavailable')}
              </span>
            )}
          </li>
        );
      })}
    </ul>
  );
}
