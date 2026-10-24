import { i18n } from '../../../shared/i18n';

const PAYMENT_ERROR_CODES = [
  'SUBSCRIPTION_ALREADY_ACTIVE',
  'SUBSCRIPTION_NOT_FOUND',
  'PLAN_INACTIVE',
  'VALIDATION_ERROR',
  'FORBIDDEN',
  'BILLING_UNAVAILABLE',
  'PAYMENT_FAILED',
  'NOT_FOUND',
  'LISTING_PENDING_VERIFICATION',
  'PLAN_ALREADY_ACTIVE',
  'PARTNER_SUSPENDED',
  'SUBSCRIPTION_PAST_DUE',
] as const;

type PaymentErrorCode = (typeof PAYMENT_ERROR_CODES)[number];

function isPaymentErrorCode(value: string): value is PaymentErrorCode {
  return (PAYMENT_ERROR_CODES as readonly string[]).includes(value);
}

/** Traduz o `code` estável do backend (AGENTS.md §12.5). */
export function getPaymentErrorMessage(error: unknown): string {
  const code = error instanceof Error ? error.message : '';
  return i18n.t(`errors.payment.${isPaymentErrorCode(code) ? code : 'BILLING_UNAVAILABLE'}`);
}
