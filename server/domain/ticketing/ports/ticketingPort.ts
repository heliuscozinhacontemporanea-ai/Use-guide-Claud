import type { TermsAcceptance } from '../../../shared/kernel/legalTerms';
import type {
  TicketTransferLink,
  EventCheckIn,
  EventPromoCode,
  EventWaitlistEntry,
  InventoryReservation,
  OfflineCheckInEvent,
  OfflineCheckInSession,
  OfflineCheckInSyncResultItem,
  Refund,
  RefundStatus,
  Ticket,
  TicketOrder,
  TicketOrderItem,
  TicketOrderSalesPolicySnapshot,
  TicketOrderStatus,
  TicketStatus,
  TicketTransfer,
  TicketType,
} from '../types/ticketingTypes';

export interface ReserveOrderTransactionInput {
  occurrenceId: string;
  occurrenceCapacity: number;
  eventListingId: string;
  buyerId: string;
  idempotencyKey: string;
  currency: 'BRL';
  subtotalMinor: number;
  discountMinor: number;
  platformFeeMinor: number;
  paymentFeeMinor: number;
  serviceFeeMinor: number;
  totalMinor: number;
  promoCodeId?: string;
  promoterCode?: string;
  buyerSnapshot: {
    name: string;
    email: string;
  };
  eventSnapshot: {
    title: string;
    startsAt: string;
    endsAt: string;
    locationName?: string;
  };
  salesPolicySnapshot: TicketOrderSalesPolicySnapshot;
  termsAcceptance: TermsAcceptance;
  expiresAt: string;
  items: Array<{
    ticketTypeId: string;
    quantity: number;
    unitPriceMinor: number;
    discountMinor: number;
    allocatedPlatformFeeMinor: number;
    allocatedPaymentFeeMinor: number;
    allocatedServiceFeeMinor: number;
    totalMinor: number;
    ticketTypeSnapshot: {
      name: string;
      kind: TicketType['kind'];
    };
    holders: Array<{
      name: string;
      email: string;
      qrTokenHash: string;
      rawQrToken: string;
    }>;
  }>;
  issueImmediately: boolean;
}

export interface ReserveOrderTransactionResult {
  order: TicketOrder;
  items: TicketOrderItem[];
  reservations: InventoryReservation[];
  issuedTickets: Array<{ ticket: Ticket; rawQrToken?: string }>;
  isIdempotentReplay: boolean;
}

export interface TicketingPort {
  createTicketType(
    input: Omit<TicketType, 'id' | 'soldCount' | 'reservedCount' | 'createdAt' | 'updatedAt'>
  ): Promise<TicketType>;
  getTicketTypeById(id: string): Promise<TicketType | null>;
  listTicketTypesByOccurrenceId(occurrenceId: string): Promise<TicketType[]>;
  updateTicketType(id: string, patch: Partial<TicketType>): Promise<TicketType>;
  deleteTicketType(id: string): Promise<void>;

  reserveInventoryAndCreateOrderAtomic(
    input: ReserveOrderTransactionInput
  ): Promise<ReserveOrderTransactionResult>;

  confirmOrderPaymentAndIssueTicketsAtomic(params: {
    orderId: string;
    paymentId?: string;
    paymentIntentId?: string;
    ticketsToIssue: Array<{
      orderItemId: string;
      ticketTypeId: string;
      holderName: string;
      holderEmail: string;
      qrTokenHash: string;
      ticketTypeSnapshot: {
        name: string;
        kind: TicketType['kind'];
        unitPriceMinor: number;
        effectivePaidMinor?: number;
      };
    }>;
  }): Promise<{
    order: TicketOrder;
    tickets: Ticket[];
    alreadyPaid: boolean;
  }>;

  expireOrderAndReleaseInventoryAtomic(orderId: string): Promise<{
    order: TicketOrder | null;
    releasedQuantity: number;
    alreadyReleased: boolean;
  }>;

  getOrderById(orderId: string): Promise<TicketOrder | null>;
  getOrderByIdempotencyKey(buyerId: string, idempotencyKey: string): Promise<TicketOrder | null>;
  listOrderItemsByOrderId(orderId: string): Promise<TicketOrderItem[]>;
  listOrdersByBuyerId(buyerId: string): Promise<TicketOrder[]>;
  listOrdersByOccurrenceId(occurrenceId: string): Promise<TicketOrder[]>;
  listOrdersByEventListingId(eventListingId: string): Promise<TicketOrder[]>;
  listExpiredPendingOrders(nowIso: string): Promise<TicketOrder[]>;
  updateOrderStatus(
    orderId: string,
    status: TicketOrderStatus,
    extra?: Partial<TicketOrder>
  ): Promise<TicketOrder>;

  getTicketById(ticketId: string): Promise<Ticket | null>;
  getTicketByQrTokenHash(qrTokenHash: string): Promise<Ticket | null>;
  listTicketsByOrderId(orderId: string): Promise<Ticket[]>;
  listTicketsByOwnerUserId(ownerUserId: string): Promise<Ticket[]>;
  listTicketsByOccurrenceId(occurrenceId: string): Promise<Ticket[]>;
  /** Ingressos da sessão alterados depois de `sinceIso` (lista sem internet, D21). */
  listTicketsChangedSince(occurrenceId: string, sinceIso: string, limit: number): Promise<Ticket[]>;
  /**
   * Troca única do QR pelo titular (D21): nova versão em transação. Lança FORBIDDEN para quem não é
   * o titular e UNPROCESSABLE_ENTITY se o ingresso não está emitido ou já teve o QR trocado.
   */
  swapTicketQr(ticketId: string, ownerUid: string, nowIso: string): Promise<Ticket>;
  /** Grava o link e cancela outro pendente do mesmo ingresso, em transação (D21). */
  createTransferLink(link: Omit<TicketTransferLink, 'id'>): Promise<TicketTransferLink>;
  getTransferLink(linkId: string): Promise<TicketTransferLink | null>;
  /** Marca como aceito se ainda pendente e dentro da validade; senão lança TRANSFER_LINK_*. */
  claimTransferLink(
    linkId: string,
    acceptorUid: string,
    nowIso: string
  ): Promise<TicketTransferLink>;
  /** A transferência falhou depois do aceite: o link volta a valer até expirar. */
  releaseTransferLink(linkId: string): Promise<void>;
  cancelTransferLinksForTicket(ticketId: string, ownerUid: string): Promise<void>;
  listTicketsByEventListingId(eventListingId: string): Promise<Ticket[]>;
  updateTicketStatus(
    ticketId: string,
    status: TicketStatus,
    extra?: Partial<Ticket>
  ): Promise<Ticket>;

  checkInTicketAtomic(params: {
    ticketId: string;
    occurrenceId: string;
    checkedInBy: string;
    source?: 'online' | 'offline';
    offlineSessionId?: string;
    stationId?: string;
    clientEventId?: string;
  }): Promise<{ ticket: Ticket; checkIn: EventCheckIn }>;
  listCheckInsByOccurrenceId(occurrenceId: string): Promise<EventCheckIn[]>;
  /** Exclusão de conta (§7.5): tira nome e e-mail de pedidos, ingressos e transferências e apaga a lista de espera. */
  anonymizeUser(uid: string): Promise<{
    orders: number;
    tickets: number;
    transfers: number;
    waitlist: number;
  }>;
  /** Códigos errados na sessão desde `sinceIso`; com `actorUid`, só os dessa pessoa da equipe. */
  countCheckInCodeFailures(
    occurrenceId: string,
    sinceIso: string,
    actorUid?: string
  ): Promise<number>;
  addCheckInCodeFailure(occurrenceId: string, actorUid: string, atIso: string): Promise<void>;
  listCheckInsByEventListingId(eventListingId: string): Promise<EventCheckIn[]>;

  createOfflineCheckInSession(
    session: Omit<OfflineCheckInSession, 'id'>
  ): Promise<OfflineCheckInSession>;
  getOfflineCheckInSessionById(sessionId: string): Promise<OfflineCheckInSession | null>;
  syncOfflineCheckInsAtomic(params: {
    session: OfflineCheckInSession;
    checkedInBy: string;
    events: OfflineCheckInEvent[];
  }): Promise<OfflineCheckInSyncResultItem[]>;

  createRefundAtomic(params: {
    orderId: string;
    ticketId?: string;
    amountMinor: number;
    serviceFeeMinor: number;
    requestedBy: Refund['requestedBy'];
    reason: string;
    idempotencyKey: string;
  }): Promise<{ refund: Refund; isReplay: boolean }>;
  updateRefundStatus(
    refundId: string,
    status: RefundStatus,
    providerRefundId?: string | null
  ): Promise<Refund>;
  getRefundById(refundId: string): Promise<Refund | null>;
  listRefundsByOrderId(orderId: string): Promise<Refund[]>;
  listRefundsByEventListingId(eventListingId: string): Promise<Refund[]>;

  transferTicketAtomic(params: {
    ticketId: string;
    fromUserId: string;
    toUserId?: string;
    recipientEmail: string;
    recipientName?: string;
    newQrTokenHash: string;
    receivedFrom?: Ticket['receivedFrom'];
  }): Promise<{
    oldTicket: Ticket;
    newTicket: Ticket;
    transfer: TicketTransfer;
  }>;

  moveOrdersAndTicketsToOccurrenceAtomic(params: {
    fromOccurrenceId: string;
    toOccurrenceId: string;
    newStartsAt: string;
    newEndsAt: string;
  }): Promise<{ movedOrdersCount: number; movedTicketsCount: number }>;

  createPromoCode(
    input: Omit<EventPromoCode, 'id' | 'usedCount' | 'createdAt' | 'updatedAt'>
  ): Promise<EventPromoCode>;
  getPromoCodeByCode(eventListingId: string, code: string): Promise<EventPromoCode | null>;

  createWaitlistEntry(
    input: Omit<EventWaitlistEntry, 'id' | 'status' | 'createdAt'>
  ): Promise<EventWaitlistEntry>;
  listWaitlistByOccurrenceId(occurrenceId: string): Promise<EventWaitlistEntry[]>;
}
