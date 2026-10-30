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
  'CHECK_IN_NOT_APPLICABLE',
  'CHECK_IN_WINDOW_CLOSED',
  'INVALID_CHECK_IN_CODE',
  'CHECK_IN_LOCKED',
  'NO_SHOW_TOO_EARLY',
  'ABSENCE_REPORT_NOT_ALLOWED',
  'NOTHING_TO_ANSWER',
  'INVALID_ENTRY_PASS',
  'CLAIM_ALREADY_EXISTS',
  'NAME_CHANGE_NOT_ALLOWED',
  'INTERNAL_ERROR',
] as const;

/** Traduz o `code` estável do backend (AGENTS.md §12.5). */
export function getBookingErrorMessage(error: unknown): string {
  const code = error instanceof Error ? error.message : '';
  const known = (KNOWN_CODES as readonly string[]).includes(code) ? code : 'INTERNAL_ERROR';
  return i18n.t(`bookings.errors.${known}`);
}
