import { lazyNamed } from '../../ui/lazy/lazyNamed';

/** Telas e folhas baixadas sob demanda (DESIGN.md P11). Os `load*` também servem para pré-carregar. */
export const loadSearchOverlay = () => import('./entries/searchOverlay');
export const loadListingDetail = () => import('./entries/listingDetail');
export const loadLoginModal = () => import('./entries/loginModal');
export const loadPartnersModal = () => import('./entries/partnersModal');
export const loadPartnerPortal = () => import('../compositions/PartnerPortalComposition');
export const loadAdminPanel = () => import('../compositions/AdminPanelComposition');
const loadEventTicketPanel = () => import('./entries/eventTicketPanel');
const loadItemBooking = () => import('../compositions/ItemBookingComposition');
const loadCheckoutResult = () => import('../compositions/CheckoutResultComposition');
const loadAccountActionPage = () => import('./entries/accountActionPage');

export const SearchOverlay = lazyNamed(loadSearchOverlay, 'SearchOverlay');
export const ListingDetail = lazyNamed(loadListingDetail, 'ListingDetail');
export const LoginModal = lazyNamed(loadLoginModal, 'LoginModal');
export const PartnersModal = lazyNamed(loadPartnersModal, 'PartnersModal');
export const PartnerPortalComposition = lazyNamed(loadPartnerPortal, 'PartnerPortalComposition');
export const AdminPanelComposition = lazyNamed(loadAdminPanel, 'AdminPanelComposition');
export const EventTicketingPurchasePanel = lazyNamed(
  loadEventTicketPanel,
  'EventTicketingPurchasePanel'
);
export const ItemBookingComposition = lazyNamed(loadItemBooking, 'ItemBookingComposition');
export const CheckoutResultComposition = lazyNamed(loadCheckoutResult, 'CheckoutResultComposition');
export const AccountActionPage = lazyNamed(loadAccountActionPage, 'AccountActionPage');

/** O que quase toda visita abre: anúncio, busca e login. */
export const COMMON_SCREENS = [loadListingDetail, loadSearchOverlay, loadLoginModal] as const;
