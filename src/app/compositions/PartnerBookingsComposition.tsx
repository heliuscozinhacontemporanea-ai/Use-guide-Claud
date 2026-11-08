import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  type BookableGuideItem,
  isBookableCategory,
  PartnerOffersManager,
} from '../../domain/bookings';
import { listPaymentAccountsUseCase, PaymentAccountNotice } from '../../domain/payment';

type AccountState =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'loaded'; readyItemIds: Set<string> };

/** Junta o gerenciador de reservas (bookings) e o onboarding financeiro (payment) na área do parceiro. */
export function PartnerBookingsComposition({ items }: { items: BookableGuideItem[] }) {
  const { t } = useTranslation();
  const [account, setAccount] = useState<AccountState>({ status: 'loading' });

  const loadStatus = useCallback(() => {
    let active = true;
    setAccount({ status: 'loading' });
    // Cada estabelecimento vende pela conta do CNPJ dele (D14): o aviso e o botão de publicar são por item.
    listPaymentAccountsUseCase()
      .then((accounts) => {
        const readyItemIds = new Set(
          accounts.filter((entry) => entry.account?.readyForSales).flatMap((entry) => entry.itemIds)
        );
        if (active) setAccount({ status: 'loaded', readyItemIds });
      })
      .catch(() => {
        // Falha de rede não significa conta incompleta: não mostra o onboarding por engano.
        if (active) setAccount({ status: 'error' });
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => loadStatus(), [loadStatus]);

  const isReady = (itemId: string) =>
    account.status === 'loaded' && account.readyItemIds.has(itemId);
  const bookable = items.filter((item) => isBookableCategory(item.category));
  const notReady = account.status === 'loaded' ? bookable.filter((item) => !isReady(item.id)) : [];
  const noneReady = notReady.length === bookable.length;

  return (
    <PartnerOffersManager
      items={items}
      canPublish={isReady}
      accountNotice={
        notReady.length > 0 ? (
          <PaymentAccountNotice
            message={t(
              noneReady ? 'bookings.partner.stripeRequired' : 'bookings.partner.stripeRequiredSome'
            )}
            onClosed={loadStatus}
          />
        ) : account.status === 'error' ? (
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
