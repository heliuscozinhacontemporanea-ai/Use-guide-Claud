import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getEventListingByIdUseCase } from '../../domain/events';
import {
  listPaymentAccountsUseCase,
  PartnerStripeConnectPortal,
  PaymentAccountNotice,
} from '../../domain/payment';
import { PartnerEventTicketingManager } from '../../domain/ticketing';

/**
 * Painel de ingressos do parceiro com a conta financeira certa: o evento vende pela conta do CNPJ do
 * estabelecimento dele (D14), não por qualquer CNPJ pronto (B26).
 */
export function PartnerEventTicketingComposition({ eventListingId }: { eventListingId: string }) {
  const { t } = useTranslation();
  const [ready, setReady] = useState<boolean | null>(null);

  const loadStatus = useCallback(() => {
    let active = true;
    Promise.all([getEventListingByIdUseCase(eventListingId), listPaymentAccountsUseCase()])
      .then(([listing, accounts]) => {
        const establishmentId = listing?.establishmentId;
        const isReady = accounts.some(
          (entry) =>
            entry.account?.readyForSales === true &&
            !!establishmentId &&
            entry.itemIds.includes(establishmentId)
        );
        if (active) setReady(isReady);
      })
      .catch(() => {
        // Falha de rede não significa conta incompleta: não mostra o aviso por engano.
        if (active) setReady(null);
      });
    return () => {
      active = false;
    };
  }, [eventListingId]);

  useEffect(() => loadStatus(), [loadStatus]);

  return (
    <PartnerEventTicketingManager
      eventListingId={eventListingId}
      accountNotice={
        ready === false ? (
          <PaymentAccountNotice message={t('ticketSessions.accountNotice')} onClosed={loadStatus} />
        ) : null
      }
      financePanel={<PartnerStripeConnectPortal />}
    />
  );
}
