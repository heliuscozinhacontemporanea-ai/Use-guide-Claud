import { useCallback, useEffect, useState } from 'react';
import { checkInTicketUseCase } from '../application/usecases/checkInTicketUseCase';
import { getEventSalesAnalyticsUseCase } from '../application/usecases/getEventSalesAnalyticsUseCase';
import { listEventCheckInsUseCase } from '../application/usecases/listEventCheckInsUseCase';
import { listEventOrdersUseCase } from '../application/usecases/listEventOrdersUseCase';
import { listEventRefundsUseCase } from '../application/usecases/listEventRefundsUseCase';
import { listPaymentAccountsUseCase } from '../../payment';
import type { EventCheckIn, EventSalesAnalytics, Refund, TicketOrder } from '../types/ticketing';

export function usePartnerEventSales(
  eventListingId?: string,
  occurrenceId?: string,
  asAdmin = false
) {
  const [analytics, setAnalytics] = useState<EventSalesAnalytics | null>(null);
  const [orders, setOrders] = useState<TicketOrder[]>([]);
  const [checkIns, setCheckIns] = useState<EventCheckIn[]>([]);
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!eventListingId) {
      setAnalytics(null);
      setOrders([]);
      setCheckIns([]);
      setRefunds([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [loadedAnalytics, loadedOrders, loadedCheckIns, loadedRefunds] = await Promise.all([
        getEventSalesAnalyticsUseCase(eventListingId, occurrenceId, asAdmin),
        listEventOrdersUseCase(eventListingId, asAdmin),
        listEventCheckInsUseCase(eventListingId, asAdmin),
        listEventRefundsUseCase(eventListingId, asAdmin),
      ]);
      setAnalytics(loadedAnalytics);
      setOrders(loadedOrders);
      setCheckIns(loadedCheckIns);
      setRefunds(loadedRefunds);
    } catch (err) {
      console.error('[usePartnerEventSales]', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Não foi possível carregar os relatórios de vendas do evento.'
      );
    } finally {
      setLoading(false);
    }
  }, [eventListingId, occurrenceId, asAdmin]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const performCheckIn = useCallback(
    async (targetOccurrenceId: string, codeOrTicketId: string) => {
      setError(null);
      const trimmed = codeOrTicketId.trim();
      const isQrToken = trimmed.startsWith('ug_tkt_') || trimmed.startsWith('ugt2.');
      const res = await checkInTicketUseCase({
        occurrenceId: targetOccurrenceId,
        ...(isQrToken ? { qrToken: trimmed } : { ticketId: trimmed }),
      });
      await reload();
      return res;
    },
    [reload]
  );

  return {
    analytics,
    orders,
    checkIns,
    refunds,
    loading,
    error,
    reload,
    performCheckIn,
  };
}

/**
 * Aviso de conta financeira do painel de ingressos. Por enquanto basta um CNPJ da conta pronto para
 * receber; a venda confere a conta do estabelecimento do evento no backend (D14, débito B26).
 */
export function usePartnerMerchantAccount(enabled = true) {
  const [status, setStatus] = useState<{ readyForSales: boolean } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    setError(null);
    try {
      const accounts = await listPaymentAccountsUseCase();
      setStatus({ readyForSales: accounts.some((entry) => entry.account?.readyForSales) });
    } catch (err) {
      console.error('[usePartnerMerchantAccount]', err);
      setError(
        err instanceof Error ? err.message : 'Não foi possível carregar a conta financeira.'
      );
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { status, loading, error, reload };
}
