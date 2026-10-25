import { i18n } from '../../../shared/i18n';

const KNOWN_CODES = [
  'VALIDATION_ERROR',
  'FORBIDDEN',
  'EMAIL_NOT_VERIFIED',
  'NOT_FOUND',
  'SLOT_UNAVAILABLE',
  'INSUFFICIENT_CAPACITY',
  'INVALID_TRANSITION',
  'LATE_PAYMENT_REJECTED',
  'KIND_NOT_AVAILABLE',
  'CANCELLATION_NOT_ALLOWED',
  'TERMS_NOT_ACCEPTED',
  'SELLER_ACCOUNT_NOT_ELIGIBLE',
  'INTERNAL_ERROR',
] as const;

/** Traduz o `code` estável do backend (AGENTS.md §12.5). */
export function getBookingErrorMessage(error: unknown): string {
  const code = error instanceof Error ? error.message : '';
  const known = (KNOWN_CODES as readonly string[]).includes(code) ? code : 'INTERNAL_ERROR';
  return i18n.t(`bookings.errors.${known}`);
}
