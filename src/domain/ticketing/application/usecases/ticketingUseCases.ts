import { ticketingAdapter } from '../../factory';
import type { TicketingPort } from '../../ports/ticketingPort';

export function listPublicTicketTypesUseCase(occurrenceId: string) {
  return ticketingAdapter.listPublicTicketTypes(occurrenceId);
}

export function listManagementTicketTypesUseCase(occurrenceId: string) {
  return ticketingAdapter.listManagementTicketTypes(occurrenceId);
}

export function createTicketTypeUseCase(
  input: Parameters<TicketingPort['createTicketType']>[0]
) {
  return ticketingAdapter.createTicketType(input);
}

export function updateTicketTypeUseCase(
  ticketTypeId: string,
  patch: Parameters<TicketingPort['updateTicketType']>[1]
) {
  return ticketingAdapter.updateTicketType(ticketTypeId, patch);
}

export function deleteOrArchiveTicketTypeUseCase(ticketTypeId: string) {
  return ticketingAdapter.deleteOrArchiveTicketType(ticketTypeId);
}

export function createTicketOrderUseCase(
  input: Parameters<TicketingPort['createOrder']>[0]
) {
  return ticketingAdapter.createOrder(input);
}

export function createTicketOrderPaymentIntentUseCase(
  orderId: string,
  input: Parameters<TicketingPort['createOrderPaymentIntent']>[1]
) {
  return ticketingAdapter.createOrderPaymentIntent(orderId, input);
}

export function confirmTicketOrderPaymentReturnUseCase(
  orderId: string,
  input: Parameters<TicketingPort['confirmOrderPaymentReturn']>[1]
) {
  return ticketingAdapter.confirmOrderPaymentReturn(orderId, input);
}

export function expireTicketOrderUseCase(orderId: string) {
  return ticketingAdapter.expireOrder(orderId);
}

export function listUserOrdersUseCase() {
  return ticketingAdapter.listUserOrders();
}

export function getTicketOrderUseCase(orderId: string) {
  return ticketingAdapter.getOrder(orderId);
}

export function listUserTicketsUseCase() {
  return ticketingAdapter.listUserTickets();
}

export function getTicketQrTokenUseCase(ticketId: string) {
  return ticketingAdapter.getTicketQrToken(ticketId);
}

export function reissueTicketQrTokenUseCase(ticketId: string) {
  return ticketingAdapter.reissueTicketQrToken(ticketId);
}

export function requestTicketRefundUseCase(
  orderId: string,
  input: Parameters<TicketingPort['requestRefund']>[1]
) {
  return ticketingAdapter.requestRefund(orderId, input);
}

export function transferTicketUseCase(
  ticketId: string,
  input: Parameters<TicketingPort['transferTicket']>[1]
) {
  return ticketingAdapter.transferTicket(ticketId, input);
}

export function checkInTicketUseCase(
  input: Parameters<TicketingPort['checkInTicket']>[0]
) {
  return ticketingAdapter.checkInTicket(input);
}

export function createOfflineCheckInSessionUseCase(
  input: Parameters<TicketingPort['createOfflineCheckInSession']>[0]
) {
  return ticketingAdapter.createOfflineCheckInSession(input);
}

export function syncOfflineCheckInsUseCase(
  input: Parameters<TicketingPort['syncOfflineCheckIns']>[0]
) {
  return ticketingAdapter.syncOfflineCheckIns(input);
}

export function getEventSalesAnalyticsUseCase(
  eventListingId: string,
  occurrenceId?: string,
  asAdmin = false
) {
  return ticketingAdapter.getEventSalesAnalytics(eventListingId, occurrenceId, asAdmin);
}

export function listEventOrdersUseCase(eventListingId: string, asAdmin = false) {
  return ticketingAdapter.listEventOrders(eventListingId, asAdmin);
}

export function listEventCheckInsUseCase(eventListingId: string, asAdmin = false) {
  return ticketingAdapter.listEventCheckIns(eventListingId, asAdmin);
}

export function listEventRefundsUseCase(eventListingId: string, asAdmin = false) {
  return ticketingAdapter.listEventRefunds(eventListingId, asAdmin);
}

export function getPartnerMerchantStatusUseCase() {
  return ticketingAdapter.getPartnerMerchantStatus();
}

export function createPartnerConnectAccountUseCase() {
  return ticketingAdapter.createPartnerConnectAccount();
}

export function createPartnerConnectAccountSessionUseCase() {
  return ticketingAdapter.createPartnerConnectAccountSession();
}
