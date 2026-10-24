interface SealFields {
  isVerified?: boolean;
  verifiedUntil?: string | null;
  isVerificationSuspended?: boolean;
}

/**
 * Selo público do cadastro (D11). O job diário desliga o selo vencido, mas os cards também
 * conferem a validade para não mostrar o selo entre o vencimento e a próxima execução do job.
 */
export function isListingSealVisible(item: SealFields, now: Date = new Date()): boolean {
  if (!item.isVerified || item.isVerificationSuspended) return false;
  return !item.verifiedUntil || new Date(item.verifiedUntil) > now;
}
