// Componentes públicos apenas para src/app/compositions (AGENTS.md §5.2 item 5).
export { BookingOfferPanel } from './components/buyer/BookingOfferPanel';
export { BookingResultView } from './components/buyer/BookingResultView';
export { MyBookingsView } from './components/buyer/MyBookingsView';
export {
  BookingPurchaseDetails,
  type BookingClaimSale,
} from './components/buyer/BookingPurchaseDetails';
export { useBookingPurchases } from './hooks/useBookingPurchases';
export type { PaymentElementSlotProps, RenderPaymentElement } from './components/buyer/types';
export { PartnerOffersManager } from './components/partner/PartnerOffersManager';
export { isBookableCategory } from './utils/offerKindByCategory';
export type { BookableGuideItem } from './types/bookings';
