export { PromotionsDomainError, type PromotionsErrorCode } from './errors/promotionsDomainError';
export {
  isPromoLocked,
  PROMO_CODE_PATTERN,
  PROMO_MAX_PERCENT,
  type PromoCode,
  type PromoCodeInput,
  type PromoCodeLimitsEdit,
  type PromoCodesSummary,
  type PromoDiscountType,
  type PromoStatus,
  type PromoTarget,
  type PromoTargetKind,
  promoStatus,
} from './types/promoCode';
export { createPromoCodeUseCase } from './usecases/createPromoCodeUseCase';
export { deletePromoCodeUseCase } from './usecases/deletePromoCodeUseCase';
export { getOwnedPromoCodeUseCase } from './usecases/getOwnedPromoCodeUseCase';
export { getPromoCodeForCheckoutUseCase } from './usecases/getPromoCodeForCheckoutUseCase';
export { listOwnerPromoCodesUseCase } from './usecases/listOwnerPromoCodesUseCase';
export { releasePromoUseUseCase } from './usecases/releasePromoUseUseCase';
export { replacePromoCodeUseCase } from './usecases/replacePromoCodeUseCase';
export { reservePromoUseUseCase } from './usecases/reservePromoUseUseCase';
export { summarizeOwnerPromoCodesUseCase } from './usecases/summarizeOwnerPromoCodesUseCase';
export { updatePromoCodeLimitsUseCase } from './usecases/updatePromoCodeLimitsUseCase';
export { computePromoDiscount, type PromoLine } from './utils/computePromoDiscount';
