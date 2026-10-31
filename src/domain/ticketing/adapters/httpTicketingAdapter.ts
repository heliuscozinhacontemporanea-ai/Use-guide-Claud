import { firebaseApiFetch } from '../../../shared/infrastructure/firebase/firebaseApiFetch';
import type {
  CreateOrderPaymentIntentResult,
  CreateOrderResult,
  TicketingPort,
} from '../ports/ticketingPort';
import type {
  EventCheckIn,
  EventSalesAnalytics,
  OfflineCheckInSessionResponse,
  OfflineCheckInSyncResult,
  PublicTicketTypeProjection,
  Refund,
  Ticket,
  TicketQrPass,
  OfflineCheckInChanges,
  TicketOrder,
  TicketOrderItem,
  TicketType,
} from '../types/ticketing';

async function parseJsonOrThrow<T>(response: Response, fallbackError: string): Promise<T> {
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(body?.error || body?.message || fallbackError);
  }
  return (body?.data ?? body) as T;
}

export class HttpTicketingAdapter implements TicketingPort {
  async listPublicTicketTypes(occurrenceId: string): Promise<PublicTicketTypeProjection[]> {
    const res = await firebaseApiFetch(
      `/api/ticketing/occurrences/${encodeURIComponent(occurrenceId)}/ticket-types`,
      { method: 'GET' },
      { requireAuth: false }
    );
    return parseJsonOrThrow<PublicTicketTypeProjection[]>(
      res,
      'Não foi possível carregar os ingressos desta sessão.'
    );
  }

  async listManagementTicketTypes(occurrenceId: string): Promise<TicketType[]> {
    const res = await firebaseApiFetch(
      `/api/ticketing/occurrences/${encodeURIComponent(occurrenceId)}/ticket-types/manage`,
      { method: 'GET' },
      { requireAuth: true }
    );
    return parseJsonOrThrow<TicketType[]>(res, 'Não foi possível carregar os lotes de ingressos.');
  }

  async createTicketType(
    input: Parameters<TicketingPort['createTicketType']>[0]
  ): Promise<TicketType> {
    const res = await firebaseApiFetch(
      '/api/ticketing/ticket-types',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      },
      { requireAuth: true }
    );
    return parseJsonOrThrow<TicketType>(res, 'Não foi possível criar o lote de ingresso.');
  }

  async updateTicketType(
    ticketTypeId: string,
    patch: Parameters<TicketingPort['updateTicketType']>[1]
  ): Promise<TicketType> {
    const res = await firebaseApiFetch(
      `/api/ticketing/ticket-types/${encodeURIComponent(ticketTypeId)}`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      },
      { requireAuth: true }
    );
    return parseJsonOrThrow<TicketType>(res, 'Não foi possível atualizar o lote de ingresso.');
  }

  async deleteOrArchiveTicketType(ticketTypeId: string): Promise<{ mode: 'deleted' | 'archived' }> {
    const res = await firebaseApiFetch(
      `/api/ticketing/ticket-types/${encodeURIComponent(ticketTypeId)}`,
      { method: 'DELETE' },
      { requireAuth: true }
    );
    return parseJsonOrThrow<{ mode: 'deleted' | 'archived' }>(
      res,
      'Não foi possível remover o lote de ingresso.'
    );
  }

  async createOrder(
    input: Parameters<TicketingPort['createOrder']>[0]
  ): Promise<CreateOrderResult> {
    const res = await firebaseApiFetch(
      '/api/ticketing/orders',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      },
      { requireAuth: true }
    );
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(body?.error || body?.message || 'Não foi possível reservar os ingressos.');
    }
    const payload = (body?.data ?? body) as CreateOrderResult;
    return {
      ...payload,
      serverNow: body?.serverNow || payload?.serverNow || new Date().toISOString(),
    };
  }

  async createOrderPaymentIntent(
    orderId: string,
    input: { idempotencyKey: string }
  ): Promise<CreateOrderPaymentIntentResult> {
    const res = await firebaseApiFetch(
      `/api/ticketing/orders/${encodeURIComponent(orderId)}/payment-intent`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      },
      { requireAuth: true }
    );
    return parseJsonOrThrow<CreateOrderPaymentIntentResult>(
      res,
      'Não foi possível iniciar o pagamento via Stripe.'
    );
  }

  async confirmOrderPaymentReturn(
    orderId: string,
    input: { paymentIntentId: string }
  ): Promise<{ orderStatus: TicketOrder['status']; paymentStatus: string }> {
    const res = await firebaseApiFetch(
      `/api/ticketing/orders/${encodeURIComponent(orderId)}/confirm-return`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      },
      { requireAuth: true }
    );
    return parseJsonOrThrow<{ orderStatus: TicketOrder['status']; paymentStatus: string }>(
      res,
      'Não foi possível verificar o status do pagamento.'
    );
  }

  async expireOrder(orderId: string): Promise<{ orderId: string; expired: boolean }> {
    const res = await firebaseApiFetch(
      `/api/ticketing/orders/${encodeURIComponent(orderId)}/expire`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      },
      { requireAuth: true }
    );
    return parseJsonOrThrow<{ orderId: string; expired: boolean }>(
      res,
      'Não foi possível expirar a reserva.'
    );
  }

  async listUserOrders(): Promise<TicketOrder[]> {
    const res = await firebaseApiFetch(
      '/api/ticketing/orders',
      { method: 'GET' },
      { requireAuth: true }
    );
    return parseJsonOrThrow<TicketOrder[]>(res, 'Não foi possível carregar seus pedidos.');
  }

  async getOrder(orderId: string): Promise<{
    order: TicketOrder;
    items: TicketOrderItem[];
    tickets: Ticket[];
    serverNow?: string;
  }> {
    const res = await firebaseApiFetch(
      `/api/ticketing/orders/${encodeURIComponent(orderId)}`,
      { method: 'GET' },
      { requireAuth: true }
    );
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(body?.error || body?.message || 'Não foi possível consultar o pedido.');
    }
    const data = body?.data ?? body;
    return {
      ...data,
      serverNow: body?.serverNow || data?.serverNow || new Date().toISOString(),
    };
  }

  async listUserTickets(): Promise<Ticket[]> {
    const res = await firebaseApiFetch(
      '/api/ticketing/tickets',
      { method: 'GET' },
      { requireAuth: true }
    );
    return parseJsonOrThrow<Ticket[]>(res, 'Não foi possível carregar seus ingressos.');
  }

  async getTicketQrToken(ticketId: string): Promise<TicketQrPass> {
    const res = await firebaseApiFetch(
      `/api/ticketing/tickets/${encodeURIComponent(ticketId)}/qr`,
      { method: 'GET' },
      { requireAuth: true }
    );
    return parseJsonOrThrow<TicketQrPass>(
      res,
      'Não foi possível gerar o QR Code assinado do ingresso.'
    );
  }

  async listOfflineCheckInChanges(
    sessionId: string,
    since: string
  ): Promise<OfflineCheckInChanges> {
    const res = await firebaseApiFetch(
      `/api/ticketing/check-in/offline-sessions/${encodeURIComponent(sessionId)}/changes?since=${encodeURIComponent(since)}`,
      { method: 'GET' },
      { requireAuth: true }
    );
    return parseJsonOrThrow<OfflineCheckInChanges>(res, 'Não foi possível atualizar a lista.');
  }

  async returnTicketToBuyer(ticketId: string): Promise<{ ticketId: string }> {
    const res = await firebaseApiFetch(
      '/api/ticket-transfers/return',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticketId }),
      },
      { requireAuth: true }
    );
    const body = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(body?.error?.code || 'INTERNAL_ERROR');
    return body;
  }

  async swapTicketQr(ticketId: string): Promise<TicketQrPass> {
    const res = await firebaseApiFetch(
      `/api/ticketing/tickets/${encodeURIComponent(ticketId)}/qr/swap`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      },
      { requireAuth: true }
    );
    return parseJsonOrThrow<TicketQrPass>(res, 'Não foi possível trocar o QR Code do ingresso.');
  }

  async requestRefund(
    orderId: string,
    input: { ticketId?: string; reason: string; idempotencyKey: string }
  ): Promise<Refund> {
    const res = await firebaseApiFetch(
      `/api/ticketing/orders/${encodeURIComponent(orderId)}/refund`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      },
      { requireAuth: true }
    );
    return parseJsonOrThrow<Refund>(res, 'Não foi possível solicitar o reembolso.');
  }

  async transferTicket(
    ticketId: string,
    username: string
  ): Promise<{ ticketId: string; recipient: { username: string; displayName: string | null } }> {
    const res = await firebaseApiFetch(
      '/api/ticket-transfers',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticketId, username: username.replace(/^@/, '').toLowerCase() }),
      },
      { requireAuth: true }
    );
    const body = await res.json().catch(() => ({}));
    // Erro com `code` estável: a carteira traduz pela chave (§12.5).
    if (!res.ok) throw new Error(body?.error?.code || 'INTERNAL_ERROR');
    return body;
  }

  async checkInTicket(input: {
    occurrenceId: string;
    ticketId?: string;
    qrToken?: string;
    /** Código de 8 caracteres do ingresso, quando o QR não lê (D20). */
    code?: string;
  }): Promise<{ ticket: Ticket; checkIn: EventCheckIn }> {
    const res = await firebaseApiFetch(
      '/api/ticketing/check-in',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      },
      { requireAuth: true }
    );
    return parseJsonOrThrow<{ ticket: Ticket; checkIn: EventCheckIn }>(
      res,
      'Falha ao validar check-in do ingresso.'
    );
  }

  async createOfflineCheckInSession(input: {
    occurrenceId: string;
    stationId: string;
    ttlHours?: number;
  }): Promise<OfflineCheckInSessionResponse> {
    const res = await firebaseApiFetch(
      '/api/ticketing/check-in/offline-sessions',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      },
      { requireAuth: true }
    );
    return parseJsonOrThrow<OfflineCheckInSessionResponse>(
      res,
      'Não foi possível preparar o manifesto offline desta ocorrência.'
    );
  }

  async syncOfflineCheckIns(input: {
    occurrenceId: string;
    sessionId: string;
    stationId: string;
    items: Array<{
      clientEventId: string;
      ticketId: string;
      qrToken: string;
      qrVersion: number;
      checkedInAt: string;
    }>;
  }): Promise<{ results: OfflineCheckInSyncResult[] }> {
    const res = await firebaseApiFetch(
      '/api/ticketing/check-in/offline-sync',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      },
      { requireAuth: true }
    );
    return parseJsonOrThrow<{ results: OfflineCheckInSyncResult[] }>(
      res,
      'Não foi possível sincronizar os check-ins realizados offline.'
    );
  }

  async getEventSalesAnalytics(
    eventListingId: string,
    occurrenceId?: string,
    asAdmin = false
  ): Promise<EventSalesAnalytics> {
    const base = asAdmin
      ? `/api/admin/events/${encodeURIComponent(eventListingId)}/analytics`
      : `/api/partners/events/${encodeURIComponent(eventListingId)}/analytics`;
    const url = occurrenceId ? `${base}?occurrenceId=${encodeURIComponent(occurrenceId)}` : base;
    const res = await firebaseApiFetch(url, { method: 'GET' }, { requireAuth: true });
    return parseJsonOrThrow<EventSalesAnalytics>(
      res,
      'Não foi possível carregar as métricas de vendas.'
    );
  }

  async listEventOrders(eventListingId: string, asAdmin = false): Promise<TicketOrder[]> {
    const url = asAdmin
      ? `/api/admin/events/${encodeURIComponent(eventListingId)}/orders`
      : `/api/partners/events/${encodeURIComponent(eventListingId)}/orders`;
    const res = await firebaseApiFetch(url, { method: 'GET' }, { requireAuth: true });
    return parseJsonOrThrow<TicketOrder[]>(res, 'Não foi possível carregar os pedidos do evento.');
  }

  async listEventCheckIns(eventListingId: string, asAdmin = false): Promise<EventCheckIn[]> {
    const url = asAdmin
      ? `/api/admin/events/${encodeURIComponent(eventListingId)}/check-ins`
      : `/api/partners/events/${encodeURIComponent(eventListingId)}/check-ins`;
    const res = await firebaseApiFetch(url, { method: 'GET' }, { requireAuth: true });
    return parseJsonOrThrow<EventCheckIn[]>(
      res,
      'Não foi possível carregar os check-ins do evento.'
    );
  }

  async listEventRefunds(eventListingId: string, asAdmin = false): Promise<Refund[]> {
    const url = asAdmin
      ? `/api/admin/events/${encodeURIComponent(eventListingId)}/refunds`
      : `/api/partners/events/${encodeURIComponent(eventListingId)}/refunds`;
    const res = await firebaseApiFetch(url, { method: 'GET' }, { requireAuth: true });
    return parseJsonOrThrow<Refund[]>(res, 'Não foi possível carregar os reembolsos do evento.');
  }
}
