const KNOWN = new Set([
  'PROMOTER_ALREADY_INVITED',
  'PROMOTER_SELF',
  'PROMOTER_INVALID_EARNING',
  'PROMOTER_EVENT_CLOSED',
  'PROMOTER_NOT_FOUND',
  'PROMOTER_WRONG_STATUS',
  'USERNAME_NOT_FOUND',
  'RATE_LIMITED',
  'PARTNER_TERMS_PENDING',
]);

/** Chave `promoters.errors.*` do erro da API; o resto vira "failed" (§12.5). */
export function promoterErrorKey(error: unknown): string {
  const code = error instanceof Error ? error.message : '';
  return `promoters.errors.${KNOWN.has(code) ? code : 'failed'}`;
}
