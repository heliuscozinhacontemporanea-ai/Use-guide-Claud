import type { ListingPlanRecord } from '../types/listingPlan';

export interface ListingPlanRepositoryPort {
  get(itemId: string): Promise<ListingPlanRecord | null>;
  save(record: ListingPlanRecord): Promise<void>;
  /** Marca na conta que o trial foi usado e grava o plano, na mesma transação (um trial por conta, D11). */
  activateTrial(record: ListingPlanRecord): Promise<void>;
  hasUsedTrial(ownerId: string): Promise<boolean>;
  isOwnerSuspended(ownerId: string): Promise<boolean>;
  setSealActive(itemId: string, sealActive: boolean): Promise<void>;
  /** Planos com selo público ligado e validade já passada. */
  listExpiredWithSeal(nowIso: string, limit: number): Promise<ListingPlanRecord[]>;
  /** Planos com selo público ligado que vencem entre as duas datas. */
  listExpiringWithSeal(fromIso: string, toIso: string, limit: number): Promise<ListingPlanRecord[]>;
  /** Planos em vigor (validade depois de `nowIso`), para o rodízio do destaque. */
  listActive(nowIso: string, limit: number): Promise<ListingPlanRecord[]>;
  delete(itemId: string): Promise<void>;
  deleteByOwner(ownerId: string): Promise<void>;
}
