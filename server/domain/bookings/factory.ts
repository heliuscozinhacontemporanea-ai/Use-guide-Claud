import { FirestoreBookingsAdapter } from './adapters/firestoreBookingsAdapter';
import { GuideBookableItemLookupAdapter } from './adapters/guideBookableItemLookupAdapter';
import { BookingCheckInService } from './services/bookingCheckInService';
import { BookingService } from './services/bookingService';
import { BookingServiceProofService } from './services/bookingServiceProofService';
import { OfferService } from './services/offerService';

let offerService: OfferService | null = null;
let bookingService: BookingService | null = null;
let checkInService: BookingCheckInService | null = null;
let serviceProofService: BookingServiceProofService | null = null;
let port: FirestoreBookingsAdapter | null = null;

function getPort(): FirestoreBookingsAdapter {
  port ??= new FirestoreBookingsAdapter();
  return port;
}

export function getOfferService(): OfferService {
  offerService ??= new OfferService(getPort(), new GuideBookableItemLookupAdapter());
  return offerService;
}

export function getBookingService(): BookingService {
  bookingService ??= new BookingService(getPort());
  return bookingService;
}

export function getBookingCheckInService(): BookingCheckInService {
  checkInService ??= new BookingCheckInService(getPort());
  return checkInService;
}

export function getBookingServiceProofService(): BookingServiceProofService {
  serviceProofService ??= new BookingServiceProofService(getPort());
  return serviceProofService;
}
