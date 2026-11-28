import { isActiveGateStaffUseCase, wasGateStaffAtUseCase } from '../gateStaff';
import { Ed25519EntryPassAdapter } from './adapters/ed25519EntryPassAdapter';
import { FirestoreBookingsAdapter } from './adapters/firestoreBookingsAdapter';
import { GuideListingCardSummaryAdapter } from './adapters/guideListingCardSummaryAdapter';
import { GuideBookableItemLookupAdapter } from './adapters/guideBookableItemLookupAdapter';
import { BookingArrivalService } from './services/bookingArrivalService';
import { BookingCheckInService } from './services/bookingCheckInService';
import { BookingEntryService } from './services/bookingEntryService';
import { BookingParticipantService } from './services/bookingParticipantService';
import { BookingPrivacyService } from './services/bookingPrivacyService';
import { BookingService } from './services/bookingService';
import { BookingServiceProofService } from './services/bookingServiceProofService';
import { FleetService } from './services/fleetService';
import { OfferPlaceService } from './services/offerPlaceService';
import { OfferService } from './services/offerService';
import { OwnerAgendaService } from './services/ownerAgendaService';
import { SlotService } from './services/slotService';

let offerService: OfferService | null = null;
let slotService: SlotService | null = null;
let fleetService: FleetService | null = null;
let offerPlaceService: OfferPlaceService | null = null;
let bookingService: BookingService | null = null;
let checkInService: BookingCheckInService | null = null;
let serviceProofService: BookingServiceProofService | null = null;
let privacyService: BookingPrivacyService | null = null;
let entryService: BookingEntryService | null = null;
let participantService: BookingParticipantService | null = null;
let ownerAgendaService: OwnerAgendaService | null = null;
let arrivalService: BookingArrivalService | null = null;
let port: FirestoreBookingsAdapter | null = null;

function getPort(): FirestoreBookingsAdapter {
  port ??= new FirestoreBookingsAdapter();
  return port;
}

export function getOfferService(): OfferService {
  offerService ??= new OfferService(
    getPort(),
    new GuideBookableItemLookupAdapter(),
    new GuideListingCardSummaryAdapter()
  );
  return offerService;
}

export function getSlotService(): SlotService {
  slotService ??= new SlotService(getPort());
  return slotService;
}

export function getFleetService(): FleetService {
  fleetService ??= new FleetService(getPort(), new GuideBookableItemLookupAdapter());
  return fleetService;
}

export function getOfferPlaceService(): OfferPlaceService {
  offerPlaceService ??= new OfferPlaceService(getPort(), new GuideBookableItemLookupAdapter());
  return offerPlaceService;
}

export function getBookingService(): BookingService {
  bookingService ??= new BookingService(getPort(), new GuideBookableItemLookupAdapter());
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

export function getBookingPrivacyService(): BookingPrivacyService {
  privacyService ??= new BookingPrivacyService(getPort());
  return privacyService;
}

export function getBookingEntryService(): BookingEntryService {
  // A chave só é lida na primeira assinatura ou conferência (AGENTS.md §2.2 item 4).
  entryService ??= new BookingEntryService(
    getPort(),
    new Ed25519EntryPassAdapter(),
    undefined,
    (guideItemId, uid, atIso) => {
      const scope = { type: 'place' as const, id: guideItemId };
      return atIso
        ? wasGateStaffAtUseCase(scope, uid, atIso)
        : isActiveGateStaffUseCase(scope, uid);
    }
  );
  return entryService;
}

export function getBookingParticipantService(): BookingParticipantService {
  participantService ??= new BookingParticipantService(getPort());
  return participantService;
}

export function getOwnerAgendaService(): OwnerAgendaService {
  ownerAgendaService ??= new OwnerAgendaService(getPort());
  return ownerAgendaService;
}

export function getBookingArrivalService(): BookingArrivalService {
  arrivalService ??= new BookingArrivalService(getPort());
  return arrivalService;
}
