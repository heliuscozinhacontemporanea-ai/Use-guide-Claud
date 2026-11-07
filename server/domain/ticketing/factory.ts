import { Ed25519TicketQrTokenAdapter } from './adapters/ed25519TicketQrTokenAdapter';
import { FirestoreCourtesyStore } from './adapters/firestoreCourtesyStore';
import { FirestorePromoterStore } from './adapters/firestorePromoterStore';
import { FirestoreTicketingAdapter } from './adapters/firestoreTicketingAdapter';
import { CheckInService } from './services/checkInService';
import { CourtesyService } from './services/courtesyService';
import { OfflineCheckInService } from './services/offlineCheckInService';
import { PromoterService } from './services/promoterService';
import { TicketHolderService } from './services/ticketHolderService';
import { TicketingReportService } from './services/ticketingReportService';
import { TicketOrderService } from './services/ticketOrderService';
import { TicketRefundService } from './services/ticketRefundService';
import { TicketTransferLinkService } from './services/ticketTransferLinkService';
import { TicketTypeService } from './services/ticketTypeService';

const ticketingAdapter = new FirestoreTicketingAdapter();
const ticketQrTokenAdapter = new Ed25519TicketQrTokenAdapter();

export const ticketTypeService = new TicketTypeService(ticketingAdapter);
export const promoterService = new PromoterService(new FirestorePromoterStore(), ticketingAdapter);
export const ticketOrderService = new TicketOrderService(ticketingAdapter, (listingId, raw, uid) =>
  promoterService.resolveForOrder(listingId, raw, uid)
);
export const ticketRefundService = new TicketRefundService(ticketingAdapter);
export const ticketHolderService = new TicketHolderService(ticketingAdapter);
export const ticketTransferLinkService = new TicketTransferLinkService(ticketingAdapter);
export const checkInService = new CheckInService(ticketingAdapter, ticketQrTokenAdapter);
export const offlineCheckInService = new OfflineCheckInService(
  ticketingAdapter,
  ticketQrTokenAdapter
);
export const ticketingReportService = new TicketingReportService(ticketingAdapter);
export const courtesyService = new CourtesyService(new FirestoreCourtesyStore(), ticketingAdapter);
