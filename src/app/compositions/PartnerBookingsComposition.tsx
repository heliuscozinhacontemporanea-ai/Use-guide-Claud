import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { type BookableGuideItem, PartnerOffersManager } from '../../domain/bookings';
import { listPaymentAccountsUseCase, PartnerStripeConnectPortal } from '../../domain/payment';

type AccountState = 'loading' | 'ready' | 'not_ready' | 'error';

/** Junta o gerenciador de reservas (bookings) e o onboarding financeiro (payment) na área do parceiro. */
export function PartnerBookingsComposition({ items }: { items: BookableGuideItem[] }) {
  const { t } = useTranslation();
  const [account, setAccount] = useState<AccountState>('loading');

  const loadStatus = useCallback(() => {
    let active = true;
    setAccount('loading');
    // A publicação confere a conta do CNPJ da oferta no backend (D14); aqui basta um CNPJ pronto (B26).
    listPaymentAccountsUseCase()
      .then((accounts) => {
        const ready = accounts.some((entry) => entry.account?.readyForSales);
        if (active) setAccount(ready ? 'ready' : 'not_ready');
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
          <div className="space-y-3 p-3 rounded-xl bg-warn-soft border border-warn-line">
            <p className="text-xs text-warn">{t('bookings.partner.stripeRequired')}</p>
            <PartnerStripeConnectPortal />
          </div>
        ) : account === 'error' ? (
          <div
            role="alert"
            className="flex flex-wrap items-center gap-3 p-3 rounded-xl bg-surface border border-line"
          >
            <p className="text-xs text-ink">{t('bookings.partner.accountStatusError')}</p>
            <button
              type="button"
              onClick={loadStatus}
              className="press min-h-11 px-4 rounded-xl border border-line text-xs font-bold text-ink hover:bg-accent-soft focus-visible:ring-2 focus-visible:ring-teal-400/50"
            >
              {t('bookings.partner.retry')}
            </button>
          </div>
        ) : null
      }
    />
  );
}
