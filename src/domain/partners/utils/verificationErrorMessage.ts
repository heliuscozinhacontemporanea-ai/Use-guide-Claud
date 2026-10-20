import { i18n } from '../../../shared/i18n';

const KNOWN_CODES = [
  'VALIDATION_ERROR',
  'UNAUTHENTICATED',
  'FORBIDDEN',
  'NOT_FOUND',
  'DOCUMENT_IN_USE',
  'CNPJ_ALREADY_USED',
  'ALREADY_VERIFIED',
  'NOT_PENDING',
  'CRYPTO_UNAVAILABLE',
  'INVALID_DOCUMENT_FILE',
  'IMAGE_TOO_LARGE',
  'STORAGE_UNAVAILABLE',
  'INTERNAL_ERROR',
] as const;

/** Traduz o `code` estável do backend (AGENTS.md §12.5). */
export function getVerificationErrorMessage(error: unknown): string {
  const code = error instanceof Error ? error.message : '';
  const known = (KNOWN_CODES as readonly string[]).includes(code) ? code : 'INTERNAL_ERROR';
  return i18n.t(`verification.errors.${known}`);
}
