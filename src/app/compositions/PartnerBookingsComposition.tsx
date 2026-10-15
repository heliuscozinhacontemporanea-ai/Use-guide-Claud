import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { type BookableGuideItem, PartnerOffersManager } from '../../domain/bookings';
import { getPartnerConnectStatusUseCase, PartnerStripeConnectPortal } from '../../domain/payment';

type AccountState = 'loading' | 'ready' | 'not_ready' | 'error';

/** Junta o gerenciador de reservas (bookings) e o onboarding financeiro (payment) na área do parceiro. */
export function PartnerBookingsComposition({ items }: { items: BookableGuideItem[] }) {
  const { t } = useTranslation();
  const [account, setAccount] = useState<AccountState>('loading');

  const loadStatus = useCallback(() => {
    let active = true;
    setAccount('loading');
    getPartnerConnectStatusUseCase()
      .then((status) => {
        if (active) setAccount(status.readyForSales ? 'ready' : 'not_ready');
      })
      .catch(() => {
        // Falha de rede não significa conta incompleta: não mostra o onboarding por engano.
        if (active) setAccount('error');
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => loadStatus(), [loadStatus]);

  return (
    <PartnerOffersManager
      items={items}
      canPublish={account === 'ready'}
      accountNotice={
        account === 'not_ready' ? (
          <div className="space-y-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30">
            <p className="text-xs text-amber-200">{t('bookings.partner.stripeRequired')}</p>
            <PartnerStripeConnectPortal />
          </div>
        ) : account === 'error' ? (
          <div
            role="alert"
            className="flex flex-wrap items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10"
          >
            <p className="text-xs text-white/80">{t('bookings.partner.accountStatusError')}</p>
            <button
              type="button"
              onClick={loadStatus}
              className="min-h-11 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold text-white focus-visible:ring-2 focus-visible:ring-teal-400/50"
            >
              {t('bookings.partner.retry')}
            </button>
          </div>
        ) : null
      }
    />
  );
}
