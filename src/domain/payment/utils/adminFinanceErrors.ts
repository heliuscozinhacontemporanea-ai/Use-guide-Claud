const KNOWN_ERRORS = [
  'NOT_FOUND',
  'FORBIDDEN',
  'CLAIM_ALREADY_DECIDED',
  'CLAIM_REFUND_FAILED',
  'INVALID_REFUND_AMOUNT',
  'PENALTY_NOT_ALLOWED',
  'FORCE_MAJEURE_NOT_PENDING',
  'DEBT_ALREADY_SETTLED',
];

/** Erros chegam pelo `code` da API (AGENTS.md §12.5); o texto vem das traduções. */
export function adminFinanceErrorKey(code: string): string {
  return `adminFinance.errors.${KNOWN_ERRORS.includes(code) ? code : 'UNAVAILABLE'}`;
}

export function errorCodeOf(error: unknown): string {
  return error instanceof Error ? error.message : 'UNAVAILABLE';
}
