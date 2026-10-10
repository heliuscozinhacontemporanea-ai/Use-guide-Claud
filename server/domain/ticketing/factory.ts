import { FirestoreTicketingAdapter } from './adapters/firestoreTicketingAdapter';
import { RsaPssTicketQrTokenAdapter } from './adapters/rsaPssTicketQrTokenAdapter';
import { TicketingService } from './services/ticketingService';

const ticketingAdapter = new FirestoreTicketingAdapter();
const ticketQrTokenAdapter = new RsaPssTicketQrTokenAdapter();
export const ticketingService = new TicketingService(
  ticketingAdapter,
  ticketQrTokenAdapter
);
