import type { TicketingPort } from '../ports/ticketingPort';
import { FirestoreTicketTypeStore } from './firestoreTicketTypeStore';
import { FirestoreOrderReservationStore } from './firestoreOrderReservationStore';
import { FirestoreOrderPaymentStore } from './firestoreOrderPaymentStore';
import { FirestoreOrderQueryStore } from './firestoreOrderQueryStore';
import { FirestoreTicketStore } from './firestoreTicketStore';
import { FirestoreCheckInStore } from './firestoreCheckInStore';
import { FirestoreRefundStore } from './firestoreRefundStore';
import { FirestoreEngagementStore } from './firestoreEngagementStore';
import { FirestoreTicketPrivacyStore } from './firestoreTicketPrivacyStore';
import { FirestoreTransferLinkStore } from './firestoreTransferLinkStore';

/** Implementação do `TicketingPort` no Firestore, composta pelos stores de cada parte do ticketing. */
export class FirestoreTicketingAdapter implements TicketingPort {
  private readonly ticketType = new FirestoreTicketTypeStore();
  private readonly orderReservation = new FirestoreOrderReservationStore();
  private readonly orderPayment = new FirestoreOrderPaymentStore();
  private readonly orderQuery = new FirestoreOrderQueryStore();
  private readonly ticket = new FirestoreTicketStore();
  private readonly checkIn = new FirestoreCheckInStore();
  private readonly refund = new FirestoreRefundStore();
  private readonly engagement = new FirestoreEngagementStore();
  private readonly privacy = new FirestoreTicketPrivacyStore();
  private readonly transferLinks = new FirestoreTransferLinkStore();

  readonly createTicketType = this.ticketType.createTicketType.bind(this.ticketType);
  readonly getTicketTypeById = this.ticketType.getTicketTypeById.bind(this.ticketType);
  readonly listTicketTypesByOccurrenceId = this.ticketType.listTicketTypesByOccurrenceId.bind(
    this.ticketType
  );
  readonly updateTicketType = this.ticketType.updateTicketType.bind(this.ticketType);
  readonly deleteTicketType = this.ticketType.deleteTicketType.bind(this.ticketType);
  readonly reserveInventoryAndCreateOrderAtomic =
    this.orderReservation.reserveInventoryAndCreateOrderAtomic.bind(this.orderReservation);
  readonly confirmOrderPaymentAndIssueTicketsAtomic =
    this.orderPayment.confirmOrderPaymentAndIssueTicketsAtomic.bind(this.orderPayment);
  readonly expireOrderAndReleaseInventoryAtomic =
    this.orderPayment.expireOrderAndReleaseInventoryAtomic.bind(this.orderPayment);
  readonly getOrderById = this.orderQuery.getOrderById.bind(this.orderQuery);
  readonly getOrderByIdempotencyKey = this.orderQuery.getOrderByIdempotencyKey.bind(
    this.orderQuery
  );
  readonly listOrderItemsByOrderId = this.orderQuery.listOrderItemsByOrderId.bind(this.orderQuery);
  readonly listOrdersByBuyerId = this.orderQuery.listOrdersByBuyerId.bind(this.orderQuery);
  readonly listOrdersByOccurrenceId = this.orderQuery.listOrdersByOccurrenceId.bind(
    this.orderQuery
  );
  readonly listOrdersByEventListingId = this.orderQuery.listOrdersByEventListingId.bind(
    this.orderQuery
  );
  readonly listExpiredPendingOrders = this.orderQuery.listExpiredPendingOrders.bind(
    this.orderQuery
  );
  readonly updateOrderStatus = this.orderQuery.updateOrderStatus.bind(this.orderQuery);
  readonly getTicketById = this.ticket.getTicketById.bind(this.ticket);
  readonly getTicketByQrTokenHash = this.ticket.getTicketByQrTokenHash.bind(this.ticket);
  readonly listTicketsByOrderId = this.ticket.listTicketsByOrderId.bind(this.ticket);
  readonly listTicketsByOwnerUserId = this.ticket.listTicketsByOwnerUserId.bind(this.ticket);
  readonly listTicketsByOccurrenceId = this.ticket.listTicketsByOccurrenceId.bind(this.ticket);
  readonly listTicketsByEventListingId = this.ticket.listTicketsByEventListingId.bind(this.ticket);
  readonly updateTicketStatus = this.ticket.updateTicketStatus.bind(this.ticket);
  readonly checkInTicketAtomic = this.checkIn.checkInTicketAtomic.bind(this.checkIn);
  readonly listCheckInsByOccurrenceId = this.checkIn.listCheckInsByOccurrenceId.bind(this.checkIn);
  readonly anonymizeUser = this.privacy.anonymizeUser.bind(this.privacy);
  readonly listTicketsChangedSince = this.ticket.listTicketsChangedSince.bind(this.ticket);
  readonly swapTicketQr = this.ticket.swapTicketQr.bind(this.ticket);
  readonly createTransferLink = this.transferLinks.createTransferLink.bind(this.transferLinks);
  readonly getTransferLink = this.transferLinks.getTransferLink.bind(this.transferLinks);
  readonly claimTransferLink = this.transferLinks.claimTransferLink.bind(this.transferLinks);
  readonly releaseTransferLink = this.transferLinks.releaseTransferLink.bind(this.transferLinks);
  readonly cancelTransferLinksForTicket = this.transferLinks.cancelTransferLinksForTicket.bind(
    this.transferLinks
  );
  readonly countCheckInCodeFailures = this.checkIn.countCheckInCodeFailures.bind(this.checkIn);
  readonly addCheckInCodeFailure = this.checkIn.addCheckInCodeFailure.bind(this.checkIn);
  readonly listCheckInsByEventListingId = this.checkIn.listCheckInsByEventListingId.bind(
    this.checkIn
  );
  readonly createOfflineCheckInSession = this.checkIn.createOfflineCheckInSession.bind(
    this.checkIn
  );
  readonly getOfflineCheckInSessionById = this.checkIn.getOfflineCheckInSessionById.bind(
    this.checkIn
  );
  readonly syncOfflineCheckInsAtomic = this.checkIn.syncOfflineCheckInsAtomic.bind(this.checkIn);
  readonly createRefundAtomic = this.refund.createRefundAtomic.bind(this.refund);
  readonly updateRefundStatus = this.refund.updateRefundStatus.bind(this.refund);
  readonly getRefundById = this.refund.getRefundById.bind(this.refund);
  readonly listRefundsByOrderId = this.refund.listRefundsByOrderId.bind(this.refund);
  readonly listRefundsByEventListingId = this.refund.listRefundsByEventListingId.bind(this.refund);
  readonly transferTicketAtomic = this.ticket.transferTicketAtomic.bind(this.ticket);
  readonly moveOrdersAndTicketsToOccurrenceAtomic =
    this.ticket.moveOrdersAndTicketsToOccurrenceAtomic.bind(this.ticket);
  readonly createPromoCode = this.engagement.createPromoCode.bind(this.engagement);
  readonly getPromoCodeByCode = this.engagement.getPromoCodeByCode.bind(this.engagement);
  readonly createWaitlistEntry = this.engagement.createWaitlistEntry.bind(this.engagement);
  readonly listWaitlistByOccurrenceId = this.engagement.listWaitlistByOccurrenceId.bind(
    this.engagement
  );
}
