import { ticketingService } from '../factory';
import type { TicketingActorContext } from '../services/ticketingService';
import type {
  EventCheckIn,
  EventPromoCode,
  EventSalesAnalytics,
  EventWaitlistEntry,
  OfflineCheckInEvent,
  OfflineCheckInManifest,
  OfflineCheckInSession,
  OfflineCheckInSyncResultItem,
  PublicTicketTypeProjection,
  Refund,
  Ticket,
  TicketOrder,
  TicketOrderItem,
  TicketTransfer,
  TicketType,
  VerifiedAttendanceForReview,
} from '../types/ticketingTypes';

export async function createTicketTypeUseCase(
  actor: TicketingActorContext,
  input: Parameters<typeof ticketingService.createTicketType>[1]
): Promise<TicketType> {
  return ticketingService.createTicketType(actor, input);
}

export async function updateTicketTypeUseCase(
  actor: TicketingActorContext,
  ticketTypeId: string,
  patch: Parameters<typeof ticketingService.updateTicketType>[2]
): Promise<TicketType> {
  return ticketingService.updateTicketType(actor, ticketTypeId, patch);
}

export async function archiveTicketTypeUseCase(
  actor: TicketingActorContext,
  ticketTypeId: string
): Promise<{ mode: 'deleted' | 'archived' }> {
  return ticketingService.archiveOrDeleteTicketType(actor, ticketTypeId);
}

export async function listPublicTicketTypesByOccurrenceUseCase(
  occurrenceId: string
): Promise<PublicTicketTypeProjection[]> {
  return ticketingService.listPublicTicketTypesByOccurrence(occurrenceId);
}

export async function listTicketTypesForManagementUseCase(
  actor: TicketingActorContext,
  occurrenceId: string
): Promise<TicketType[]> {
  return ticketingService.listTicketTypesForManagement(actor, occurrenceId);
}

export async function createTicketOrderUseCase(
  actor: TicketingActorContext,
  input: Parameters<typeof ticketingService.createTicketOrder>[1]
): Promise<{
  order: TicketOrder;
  items: TicketOrderItem[];
  issuedTickets: Array<{ ticket: Ticket; rawQrToken?: string }>;
  isIdempotentReplay: boolean;
  serverNow: string;
}> {
  return ticketingService.createTicketOrder(actor, input);
}

export async function confirmTicketOrderPaymentUseCase(params: {
  orderId: string;
  paymentId?: string;
  paymentIntentId?: string;
}): Promise<{ order: TicketOrder; tickets: Ticket[]; alreadyPaid: boolean }> {
  return ticketingService.confirmTicketOrderPayment(params);
}

export async function markTicketOrderPaymentFailedUseCase(params: {
  orderId: string;
  paymentId?: string;
  paymentIntentId?: string;
}): Promise<TicketOrder> {
  return ticketingService.updateOrderPaymentState({
    orderId: params.orderId,
    status: 'payment_failed',
    paymentId: params.paymentId,
    paymentIntentId: params.paymentIntentId,
  });
}

export async function markTicketOrderDisputedUseCase(params: {
  orderId: string;
  paymentId?: string;
  paymentIntentId?: string;
}): Promise<TicketOrder> {
  return ticketingService.updateOrderPaymentState({
    orderId: params.orderId,
    status: 'chargeback',
    paymentId: params.paymentId,
    paymentIntentId: params.paymentIntentId,
  });
}

export async function expireTicketOrderUseCase(
  orderId: string,
  actor?: TicketingActorContext
) {
  return ticketingService.expireTicketOrder(orderId, actor);
}

export async function expireAllOverdueOrdersUseCase(
  nowIso?: string
): Promise<{ expiredCount: number }> {
  const expiredCount = await ticketingService.expireAllOverdueOrders(nowIso);
  return { expiredCount };
}

export async function getTicketOrderUseCase(
  actor: TicketingActorContext,
  orderId: string
) {
  return ticketingService.getOrderForUser(actor, orderId);
}

export async function listUserTicketOrdersUseCase(
  actor: TicketingActorContext
): Promise<TicketOrder[]> {
  return ticketingService.listUserOrders(actor);
}

export async function listUserTicketsUseCase(
  actor: TicketingActorContext
): Promise<Ticket[]> {
  return ticketingService.listUserTickets(actor);
}

export async function getTicketQrTokenUseCase(
  actor: TicketingActorContext,
  ticketId: string
): Promise<{
  ticketId: string;
  token: string;
  expiresAt: string;
}> {
  return ticketingService.generateTicketPresentationQr(actor, ticketId);
}

export async function reissueTicketQrTokenUseCase(
  actor: TicketingActorContext,
  ticketId: string
): Promise<{
  ticketId: string;
  token: string;
  expiresAt: string;
}> {
  return ticketingService.generateTicketPresentationQr(actor, ticketId);
}

export async function requestTicketRefundUseCase(
  actor: TicketingActorContext,
  params: Parameters<typeof ticketingService.requestTicketRefund>[1]
): Promise<{ refund: Refund; isReplay: boolean; order: TicketOrder }> {
  return ticketingService.requestTicketRefund(actor, params);
}

export async function finalizeTicketRefundStatusUseCase(
  refundId: string,
  status: Refund['status'],
  providerRefundId?: string | null
): Promise<Refund> {
  return ticketingService.finalizeRefundStatus(
    refundId,
    status,
    providerRefundId
  );
}

export async function transferTicketUseCase(
  actor: TicketingActorContext,
  params: Parameters<typeof ticketingService.transferTicket>[1]
): Promise<{
  oldTicket: Ticket;
  newTicket: Ticket;
  transfer: TicketTransfer;
  newRawQrToken: string;
}> {
  return ticketingService.transferTicket(actor, params);
}

export async function checkInTicketUseCase(
  actor: TicketingActorContext,
  params: Parameters<typeof ticketingService.checkInTicket>[1]
): Promise<{ ticket: Ticket; checkIn: EventCheckIn }> {
  return ticketingService.checkInTicket(actor, params);
}

export async function createOfflineCheckInSessionUseCase(
  actor: TicketingActorContext,
  params: { occurrenceId: string; stationId?: string }
): Promise<{
  session: OfflineCheckInSession;
  manifest: OfflineCheckInManifest;
}> {
  return ticketingService.prepareOfflineCheckInSession(actor, params);
}

export async function syncOfflineCheckInsUseCase(
  actor: TicketingActorContext,
  params: {
    sessionId: string;
    events: OfflineCheckInEvent[];
  }
): Promise<{
  sessionId: string;
  results: OfflineCheckInSyncResultItem[];
}> {
  return ticketingService.syncOfflineCheckInEvents(actor, params);
}

export async function getEventSalesAnalyticsUseCase(
  actor: TicketingActorContext,
  eventListingId: string,
  occurrenceId?: string
): Promise<EventSalesAnalytics> {
  return ticketingService.getEventSalesAnalytics(
    actor,
    eventListingId,
    occurrenceId
  );
}

export async function listEventOrdersForPartnerOrAdminUseCase(
  actor: TicketingActorContext,
  eventListingId: string
): Promise<TicketOrder[]> {
  return ticketingService.listEventOrdersForPartnerOrAdmin(
    actor,
    eventListingId
  );
}

export async function listEventCheckInsForPartnerOrAdminUseCase(
  actor: TicketingActorContext,
  eventListingId: string
): Promise<EventCheckIn[]> {
  return ticketingService.listEventCheckInsForPartnerOrAdmin(
    actor,
    eventListingId
  );
}

export async function listEventRefundsForPartnerOrAdminUseCase(
  actor: TicketingActorContext,
  eventListingId: string
): Promise<Refund[]> {
  return ticketingService.listEventRefundsForPartnerOrAdmin(
    actor,
    eventListingId
  );
}

export async function getVerifiedAttendanceForReviewUseCase(params: {
  userId: string;
  occurrenceId: string;
  ticketId: string;
}): Promise<VerifiedAttendanceForReview> {
  return ticketingService.getVerifiedAttendanceForReview(params);
}

export async function moveOrderToOccurrenceUseCase(
  actor: TicketingActorContext,
  params: {
    fromOccurrenceId: string;
    toOccurrenceId: string;
  }
) {
  return ticketingService.moveOrdersAndTicketsToOccurrence(actor, params);
}

export async function createEventPromoCodeUseCase(
  actor: TicketingActorContext,
  input: Parameters<typeof ticketingService.createPromoCode>[1]
): Promise<EventPromoCode> {
  return ticketingService.createPromoCode(actor, input);
}

export async function joinEventWaitlistUseCase(
  actor: TicketingActorContext,
  input: Parameters<typeof ticketingService.joinWaitlist>[1]
): Promise<EventWaitlistEntry> {
  return ticketingService.joinWaitlist(actor, input);
}
