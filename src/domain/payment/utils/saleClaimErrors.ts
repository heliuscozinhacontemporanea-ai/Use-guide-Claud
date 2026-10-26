const KNOWN_ERRORS = [
  'NOT_FOUND',
  'CLAIM_NOT_ALLOWED',
  'CLAIM_TOO_EARLY',
  'CLAIM_WINDOW_CLOSED',
  'CLAIM_ALREADY_EXISTS',
];

/** Erros chegam pelo `code` da API (AGENTS.md §12.5); o texto vem das traduções. */
export function saleClaimErrorKey(error: unknown): string {
  const code = error instanceof Error ? error.message : '';
  return `saleClaims.errors.${KNOWN_ERRORS.includes(code) ? code : 'UNAVAILABLE'}`;
}
