export type PromotionsErrorCode =
  | 'INVALID_ARGUMENT'
  | 'NOT_FOUND'
  | 'FORBIDDEN'
  | 'PROMO_CODE_TAKEN'
  | 'PROMO_LOCKED'
  | 'PROMO_IN_USE'
  | 'PROMO_INVALID'
  | 'PROMO_NOT_STARTED'
  | 'PROMO_EXPIRED'
  | 'PROMO_EXHAUSTED'
  | 'PROMO_ALREADY_USED'
  | 'PROMO_TARGET_INVALID';

/** Erros de cupom; o `code` vai para a resposta e a UI traduz por ele (AGENTS.md §10.2). */
export class PromotionsDomainError extends Error {
  constructor(
    public readonly code: PromotionsErrorCode,
    message: string
  ) {
    super(message);
    this.name = 'PromotionsDomainError';
  }
}
