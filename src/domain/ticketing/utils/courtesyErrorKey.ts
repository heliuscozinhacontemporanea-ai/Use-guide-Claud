const KNOWN = new Set([
  'COURTESY_ALREADY_GIVEN',
  'COURTESY_GUEST_HAS_PURCHASE',
  'COURTESY_SELF',
  'COURTESY_SESSION_CLOSED',
  'COURTESY_SOLD_OUT',
  'COURTESY_LINK_INVALID',
  'COURTESY_LINK_EXPIRED',
  'COURTESY_ALREADY_USED',
  'RECIPIENT_NOT_VERIFIED',
  'USERNAME_NOT_FOUND',
  'RATE_LIMITED',
]);

/** Chave `courtesy.errors.*` do erro da API; o resto vira "failed" (§12.5). */
export function courtesyErrorKey(error: unknown): string {
  const code = error instanceof Error ? error.message : '';
  return `courtesy.errors.${KNOWN.has(code) ? code : 'failed'}`;
}
