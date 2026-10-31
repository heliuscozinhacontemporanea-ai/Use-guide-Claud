import { FirestoreTicketingAdapter } from './adapters/firestoreTicketingAdapter';
import { Ed25519TicketQrTokenAdapter } from './adapters/ed25519TicketQrTokenAdapter';
import { CheckInService } from './services/checkInService';
import { OfflineCheckInService } from './services/offlineCheckInService';
import { TicketHolderService } from './services/ticketHolderService';
import { TicketOrderService } from './services/ticketOrderService';
import { TicketRefundService } from './services/ticketRefundService';
import { TicketTypeService } from './services/ticketTypeService';
import { TicketingReportService } from './services/ticketingReportService';

const ticketingAdapter = new FirestoreTicketingAdapter();
const ticketQrTokenAdapter = new Ed25519TicketQrTokenAdapter();

export const ticketTypeService = new TicketTypeService(ticketingAdapter);
export const ticketOrderService = new TicketOrderService(ticketingAdapter);
export const ticketRefundService = new TicketRefundService(ticketingAdapter);
export const ticketHolderService = new TicketHolderService(ticketingAdapter);
export const checkInService = new CheckInService(ticketingAdapter, ticketQrTokenAdapter);
export const offlineCheckInService = new OfflineCheckInService(
  ticketingAdapter,
  ticketQrTokenAdapter
);
export const ticketingReportService = new TicketingReportService(ticketingAdapter);
