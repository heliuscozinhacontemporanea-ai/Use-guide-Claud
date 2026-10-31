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

export interface CreateOrderResult {
  order: TicketOrder;
  items: TicketOrderItem[];
  issuedTickets: Array<{ ticket: Ticket; rawQrToken?: string }>;
  isIdempotentReplay: boolean;
  serverNow: string;
}

export interface CreateOrderPaymentIntentResult {
  paymentIntentId: string;
  clientSecret: string;
  status: string;
  transactionId: string;
  orderStatus: TicketOrder['status'];
}

export interface TicketingPort {
  listPublicTicketTypes(occurrenceId: string): Promise<PublicTicketTypeProjection[]>;
  listManagementTicketTypes(occurrenceId: string): Promise<TicketType[]>;
  createTicketType(input: {
    occurrenceId: string;
    name: string;
    description?: string;
    kind: TicketType['kind'];
    priceMinor: number;
    quantity: number;
    minPerOrder?: number;
    maxPerOrder?: number;
    salesStartsAt?: string;
    salesEndsAt?: string;
    visibility?: 'public' | 'hidden' | 'restricted';
    requiresEligibilityProof?: boolean;
    sortOrder?: number;
  }): Promise<TicketType>;
  updateTicketType(
    ticketTypeId: string,
    patch: Partial<
      Pick<
        TicketType,
        | 'name'
        | 'description'
        | 'priceMinor'
        | 'quantity'
        | 'minPerOrder'
        | 'maxPerOrder'
        | 'salesStartsAt'
        | 'salesEndsAt'
        | 'status'
        | 'visibility'
        | 'requiresEligibilityProof'
        | 'sortOrder'
      >
    >
  ): Promise<TicketType>;
  deleteOrArchiveTicketType(ticketTypeId: string): Promise<{ mode: 'deleted' | 'archived' }>;
  createOrder(input: {
    occurrenceId: string;
    items: Array<{
      ticketTypeId: string;
      quantity: number;
      holders?: Array<{ name: string; email: string }>;
    }>;
    buyer: { name: string; email: string };
    promoCode?: string;
    idempotencyKey: string;
    acceptedTermsVersion: string;
  }): Promise<CreateOrderResult>;
  createOrderPaymentIntent(
    orderId: string,
    input: { idempotencyKey: string }
  ): Promise<CreateOrderPaymentIntentResult>;
  confirmOrderPaymentReturn(
    orderId: string,
    input: { paymentIntentId: string }
  ): Promise<{ orderStatus: TicketOrder['status']; paymentStatus: string }>;
  expireOrder(orderId: string): Promise<{ orderId: string; expired: boolean }>;
  listUserOrders(): Promise<TicketOrder[]>;
  getOrder(orderId: string): Promise<{
    order: TicketOrder;
    items: TicketOrderItem[];
    tickets: Ticket[];
    serverNow?: string;
  }>;
  listUserTickets(): Promise<Ticket[]>;
  getTicketQrToken(ticketId: string): Promise<TicketQrPass>;
  /** Troca única do QR pelo titular (D21). */
  swapTicketQr(ticketId: string): Promise<TicketQrPass>;
  listOfflineCheckInChanges(sessionId: string, since: string): Promise<OfflineCheckInChanges>;
  requestRefund(
    orderId: string,
    input: { ticketId?: string; reason: string; idempotencyKey: string }
  ): Promise<Refund>;
  /** Transfere para a conta dona do @ (D21); erro vira `Error(code)`. */
  transferTicket(
    ticketId: string,
    username: string
  ): Promise<{ ticketId: string; recipient: { username: string; displayName: string | null } }>;
  checkInTicket(input: {
    occurrenceId: string;
    ticketId?: string;
    qrToken?: string;
    /** Código de 8 caracteres do ingresso, quando o QR não lê (D20). */
    code?: string;
  }): Promise<{ ticket: Ticket; checkIn: EventCheckIn }>;
  createOfflineCheckInSession(input: {
    occurrenceId: string;
    stationId: string;
    ttlHours?: number;
  }): Promise<OfflineCheckInSessionResponse>;
  syncOfflineCheckIns(input: {
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
  }): Promise<{ results: OfflineCheckInSyncResult[] }>;
  getEventSalesAnalytics(
    eventListingId: string,
    occurrenceId?: string,
    asAdmin?: boolean
  ): Promise<EventSalesAnalytics>;
  listEventOrders(eventListingId: string, asAdmin?: boolean): Promise<TicketOrder[]>;
  listEventCheckIns(eventListingId: string, asAdmin?: boolean): Promise<EventCheckIn[]>;
  listEventRefunds(eventListingId: string, asAdmin?: boolean): Promise<Refund[]>;
}
