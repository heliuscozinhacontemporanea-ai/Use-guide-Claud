import { Tag, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { TicketCheckoutState } from '../../hooks/useTicketCheckout';

const INPUT =
  'w-full min-h-11 px-3.5 rounded-xl bg-surface border border-line text-xs text-ink placeholder:text-ink/60 focus-visible:ring-2 focus-visible:ring-teal-400/50 focus:border-teal-400';

interface TicketBuyerFormProps {
  checkout: TicketCheckoutState;
}

/** Comprador, titulares de cada ingresso e cupom. */
export function TicketBuyerForm({ checkout }: TicketBuyerFormProps) {
  const { t } = useTranslation();
  const { buyer, selectedItems, totalQuantity, holders, setHolder } = checkout;
  return (
    <div className="space-y-3">
      <p className="text-xs font-bold text-ink/80 uppercase tracking-wider">
        {t('ticketCheckout.buyer.title')}
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <input
          type="text"
          value={buyer.name}
          onChange={(event) => buyer.setName(event.target.value)}
          placeholder={t('ticketCheckout.buyer.name')}
          aria-label={t('ticketCheckout.buyer.name')}
          autoComplete="name"
          className={INPUT}
        />
        <input
          type="email"
          value={buyer.email}
          onChange={(event) => buyer.setEmail(event.target.value)}
          placeholder={t('ticketCheckout.buyer.email')}
          aria-label={t('ticketCheckout.buyer.email')}
          autoComplete="email"
          className={INPUT}
        />
      </div>

      {totalQuantity > 1 && (
        <div className="space-y-2 pt-2 border-t border-line">
          <p className="flex items-center gap-1.5 text-xs font-bold text-ink/80">
            <User size={13} className="text-teal-400" aria-hidden="true" />
            {t('ticketCheckout.holders.title', { count: totalQuantity })}
          </p>
          {selectedItems.flatMap(({ ticketType, quantity }) =>
            Array.from({ length: quantity }, (_, index) => {
              const key = `${ticketType.id}_${index}`;
              const holder = holders[key] || {
                name: index === 0 ? buyer.name : '',
                email: index === 0 ? buyer.email : '',
              };
              return (
                <fieldset
                  key={key}
                  className="p-2.5 pt-1 rounded-xl bg-surface border border-line space-y-2"
                >
                  <legend className="px-1 text-xs font-bold text-accent">
                    {t('ticketCheckout.holders.label', {
                      number: index + 1,
                      ticket: ticketType.name,
                    })}
                  </legend>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={holder.name}
                      onChange={(event) => setHolder(key, { ...holder, name: event.target.value })}
                      placeholder={t('ticketCheckout.holders.name')}
                      aria-label={t('ticketCheckout.holders.name')}
                      className={INPUT}
                    />
                    <input
                      type="email"
                      value={holder.email}
                      onChange={(event) => setHolder(key, { ...holder, email: event.target.value })}
                      placeholder={t('ticketCheckout.holders.email')}
                      aria-label={t('ticketCheckout.holders.email')}
                      className={INPUT}
                    />
                  </div>
                </fieldset>
              );
            })
          )}
        </div>
      )}

      {!checkout.isAllFree && (
        <div className="relative">
          <Tag
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/60"
            aria-hidden="true"
          />
          <input
            type="text"
            value={checkout.promoCode}
            onChange={(event) => checkout.setPromoCode(event.target.value)}
            placeholder={t('ticketCheckout.promoCode')}
            aria-label={t('ticketCheckout.promoCode')}
            className={`${INPUT} pl-9 uppercase`}
          />
        </div>
      )}
    </div>
  );
}
