import type {
  PartnerPromoCode,
  PromoCodeInput,
  PromoCodeLimitsEdit,
  PromoCodesData,
} from '../types/promoCode';

export interface PromoCodesPort {
  list(): Promise<PromoCodesData>;
  create(input: PromoCodeInput): Promise<PartnerPromoCode>;
  /** Só antes do primeiro uso. */
  replace(id: string, input: PromoCodeInput): Promise<PartnerPromoCode>;
  updateLimits(id: string, edit: PromoCodeLimitsEdit): Promise<void>;
  remove(id: string): Promise<void>;
}
