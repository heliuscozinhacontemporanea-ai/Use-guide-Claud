// Componentes públicos apenas para src/app/compositions (AGENTS.md §5.2 item 5).

export {
  isBookingServiceEvidence,
  ServiceEvidenceList,
} from './components/admin/ServiceEvidenceList';
export { BookingOfferPanel } from './components/buyer/BookingOfferPanel';
export {
  type BookingClaimSale,
  BookingPurchaseDetails,
} from './components/buyer/BookingPurchaseDetails';
export { BookingResultView } from './components/buyer/BookingResultView';
export { MyBookingsView } from './components/buyer/MyBookingsView';
export type { PaymentElementSlotProps, RenderPaymentElement } from './components/buyer/types';
export { EntryOfflineKeys } from './components/partner/EntryOfflineKeys';
export { EstablishmentCodeSheet } from './components/partner/EstablishmentCodeSheet';
export { PartnerOffersManager } from './components/partner/PartnerOffersManager';
export { PartnerSlotSheet } from './components/partner/PartnerSlotSheet';
export { SlotCheckInSheet } from './components/partner/SlotCheckInSheet';
export { SlotContactsList } from './components/partner/SlotContactsList';
export { startSlotServiceUseCase } from './application/usecases/startSlotServiceUseCase';
export { useBookingPurchases } from './hooks/useBookingPurchases';
export { useMyBookings } from './hooks/useMyBookings';
export { useSlotArrival } from './hooks/useSlotArrival';
export type { BookableGuideItem } from './types/bookings';
export { isBookableCategory } from './utils/offerKindByCategory';
