import { i18n } from '../../../shared/i18n';

const KNOWN_CODES = [
  'VALIDATION_ERROR',
  'FORBIDDEN',
  'NOT_FOUND',
  'LISTING_PENDING_VERIFICATION',
  'TRIAL_ALREADY_USED',
  'PLAN_ALREADY_ACTIVE',
  'PARTNER_SUSPENDED',
  'INTERNAL_ERROR',
] as const;

/** Traduz o `code` estável do backend (AGENTS.md §12.5). */
export function getListingPlanErrorMessage(error: unknown): string {
  const code = error instanceof Error ? error.message : '';
  const known = (KNOWN_CODES as readonly string[]).includes(code) ? code : 'INTERNAL_ERROR';
  return i18n.t(`listingPlan.errors.${known}`);
}
