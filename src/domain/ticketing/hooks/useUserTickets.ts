import { useCallback, useEffect, useState } from 'react';
import { getTicketQrTokenUseCase } from '../application/usecases/getTicketQrTokenUseCase';
import { listUserOrdersUseCase } from '../application/usecases/listUserOrdersUseCase';
import { listUserTicketsUseCase } from '../application/usecases/listUserTicketsUseCase';
import { reissueTicketQrTokenUseCase } from '../application/usecases/reissueTicketQrTokenUseCase';
import { requestTicketRefundUseCase } from '../application/usecases/requestTicketRefundUseCase';
import { transferTicketUseCase } from '../application/usecases/transferTicketUseCase';
import type { Ticket, TicketOrder } from '../types/ticketing';

export function useUserTicketsAndOrders(enabled = true) {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [orders, setOrders] = useState<TicketOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!enabled) {
      setTickets([]);
      setOrders([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [loadedTickets, loadedOrders] = await Promise.all([
        listUserTicketsUseCase(),
        listUserOrdersUseCase(),
      ]);
      setTickets(loadedTickets);
      setOrders(loadedOrders);
    } catch (err) {
      console.error('[useUserTicketsAndOrders]', err);
      setError(err instanceof Error ? err.message : 'Não foi possível carregar seus ingressos.');
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const transferTicket = useCallback(
    async (ticketId: string, username: string) => {
      setError(null);
      const res = await transferTicketUseCase(ticketId, username);
      await reload();
      return res;
    },
    [reload]
  );

  const requestRefund = useCallback(
    async (orderId: string, reason: string, ticketId?: string) => {
      setError(null);
      const idempotencyKey = `ref_${orderId}_${ticketId || 'all'}_${crypto.randomUUID()}`;
      const res = await requestTicketRefundUseCase(orderId, {
        ticketId,
        reason,
        idempotencyKey,
      });
      await reload();
      return res;
    },
    [reload]
  );

  const getSignedQrToken = useCallback(async (ticketId: string) => {
    return getTicketQrTokenUseCase(ticketId);
  }, []);

  const reissueSignedQrToken = useCallback(
    async (ticketId: string) => {
      const res = await reissueTicketQrTokenUseCase(ticketId);
      await reload();
      return res;
    },
    [reload]
  );

  return {
    tickets,
    orders,
    loading,
    error,
    reload,
    transferTicket,
    requestRefund,
    getSignedQrToken,
    reissueSignedQrToken,
  };
}
