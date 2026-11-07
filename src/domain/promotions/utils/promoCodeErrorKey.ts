const KNOWN = new Set([
  'PROMO_CODE_TAKEN',
  'PROMO_LOCKED',
  'PROMO_IN_USE',
  'PROMO_TARGET_INVALID',
  'VALIDATION_ERROR',
]);

/** Chave `promoCodes.errors.*` do erro da API; o resto vira "failed" (§12.5). */
export function promoCodeErrorKey(error: unknown): string {
  const code = error instanceof Error ? error.message : '';
  return `promoCodes.errors.${KNOWN.has(code) ? code : 'failed'}`;
}
