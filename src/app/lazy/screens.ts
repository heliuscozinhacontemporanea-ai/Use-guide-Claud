import { lazyNamed } from '../../ui/lazy/lazyNamed';

/** Telas e folhas baixadas sob demanda (DESIGN.md P11). Os `load*` também servem para pré-carregar. */
export const loadSearchOverlay = () => import('./entries/searchOverlay');
export const loadListingDetail = () => import('./entries/listingDetail');
export const loadLoginModal = () => import('./entries/loginModal');
export const loadPartnerJoin = () => import('./entries/partnerJoin');
export const loadClaim = () => import('./entries/claim');
export const loadPartnerPortal = () => import('../compositions/PartnerPortalComposition');
export const loadAdminPanel = () => import('../compositions/AdminPanelComposition');
const loadListingActions = () => import('./entries/listingActions');
const loadEventTicketPanel = () => import('./entries/eventTicketPanel');
const loadItemBooking = () => import('../compositions/ItemBookingComposition');
const loadCheckoutResult = () => import('../compositions/CheckoutResultComposition');
const loadAccountActionPage = () => import('./entries/accountActionPage');

export const SearchOverlay = lazyNamed(loadSearchOverlay, 'SearchOverlay');
export const ListingDetail = lazyNamed(loadListingDetail, 'ListingDetail');
export const FavoriteButton = lazyNamed(loadListingActions, 'FavoriteButton');
export const ReviewSection = lazyNamed(loadListingActions, 'ReviewSection');
export const LoginModal = lazyNamed(loadLoginModal, 'LoginModal');
export const PartnerJoinSheet = lazyNamed(loadPartnerJoin, 'PartnerJoinSheet');
export const ClaimListingSheet = lazyNamed(loadClaim, 'ClaimListingSheet');
export const PartnerPortalComposition = lazyNamed(loadPartnerPortal, 'PartnerPortalComposition');
export const AdminPanelComposition = lazyNamed(loadAdminPanel, 'AdminPanelComposition');
export const EventTicketingPurchasePanel = lazyNamed(
  loadEventTicketPanel,
  'EventTicketingPurchasePanel'
);
export const ItemBookingComposition = lazyNamed(loadItemBooking, 'ItemBookingComposition');
export const CheckoutResultComposition = lazyNamed(loadCheckoutResult, 'CheckoutResultComposition');
export const AccountActionPage = lazyNamed(loadAccountActionPage, 'AccountActionPage');

/** O que quase toda visita abre: anúncio (com favoritar e avaliações), busca e login. */
export const COMMON_SCREENS = [
  loadListingDetail,
  loadListingActions,
  loadSearchOverlay,
  loadLoginModal,
] as const;
