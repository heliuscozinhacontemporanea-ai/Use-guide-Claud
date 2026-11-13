import { lazyNamed } from '../../ui/lazy/lazyNamed';

/** Sub-telas do menu lateral, baixadas sob demanda (DESIGN.md P11) e pré-carregadas ao abrir o menu. */
const loadUserViews = () => import('./entries/userViews');
const loadContentViews = () => import('./entries/contentViews');
const loadTicketViews = () => import('./entries/ticketMenuViews');
const loadBookingViews = () => import('./entries/bookingMenuViews');
const loadFavorites = () => import('./entries/favoritesList');
const loadNotificationSettings = () => import('./entries/notificationSettings');
const loadImageCropper = () => import('./entries/imageCropper');
const loadPurchases = () => import('../compositions/BuyerPurchasesComposition');
const loadMyReviews = () => import('../compositions/MyReviewsComposition');

export const AccountView = lazyNamed(loadUserViews, 'AccountView');
export const AppearanceSettingsView = lazyNamed(loadUserViews, 'AppearanceSettingsView');
export const ChangePasswordView = lazyNamed(loadUserViews, 'ChangePasswordView');
export const LanguageSettingsView = lazyNamed(loadUserViews, 'LanguageSettingsView');
export const SettingsView = lazyNamed(loadUserViews, 'SettingsView');
export const UsernameSettingsView = lazyNamed(loadUserViews, 'UsernameSettingsView');
export const ImageCropperView = lazyNamed(loadImageCropper, 'ImageCropperView');
export const AboutView = lazyNamed(loadContentViews, 'AboutView');
export const AboutLicensesView = lazyNamed(loadContentViews, 'AboutLicensesView');
export const AboutTermsView = lazyNamed(loadContentViews, 'AboutTermsView');
export const SupportView = lazyNamed(loadContentViews, 'SupportView');
export const MyGatesView = lazyNamed(loadTicketViews, 'MyGatesView');
export const MyPromotionsView = lazyNamed(loadTicketViews, 'MyPromotionsView');
export const UserTicketsHistoryView = lazyNamed(loadTicketViews, 'UserTicketsHistoryView');
export const MyBookingsView = lazyNamed(loadBookingViews, 'MyBookingsView');
export const SlotCheckInSheet = lazyNamed(loadBookingViews, 'SlotCheckInSheet');
export const FavoritesList = lazyNamed(loadFavorites, 'FavoritesList');
export const NotificationSettingsView = lazyNamed(
  loadNotificationSettings,
  'NotificationSettingsView'
);
export const BuyerPurchasesComposition = lazyNamed(loadPurchases, 'BuyerPurchasesComposition');
export const MyReviewsComposition = lazyNamed(loadMyReviews, 'MyReviewsComposition');

/** As sub-telas mais abertas a partir do menu. */
export const MENU_SCREENS = [
  loadUserViews,
  loadTicketViews,
  loadBookingViews,
  loadFavorites,
  loadPurchases,
] as const;
