import {
  GuideCreateItemInput,
  GuideItemRecord,
  GuidePublication,
  GuideUpdateItemInput,
  GuideVerificationType,
} from '../types/guideTypes';

export interface GuideVerificationUpdate {
  isVerified: boolean;
  verifiedUntil: string | null;
  verificationType: GuideVerificationType;
  isVerificationSuspended: boolean;
}

/** Contato privado do anúncio que vende pelo app (C2/B37): só o servidor lê. */
export interface GuideItemContact {
  phone?: string;
}

export interface GuidePort {
  createItem(
    data: GuideCreateItemInput & {
      ownerId: string;
      id?: string;
      publication: GuidePublication;
    }
  ): Promise<string>;
  getItemById(id: string): Promise<GuideItemRecord | null>;
  updateItem(id: string, data: GuideUpdateItemInput): Promise<void>;
  setPublication(id: string, publication: GuidePublication): Promise<void>;
  deleteItem(id: string): Promise<void>;
  /** Cópia pública do selo do estabelecimento (D11); o plano fica em `listingPlans`. */
  updateItemVerification(itemId: string, verification: GuideVerificationUpdate): Promise<void>;
  updateReviewAggregate(
    resourceType: 'items',
    resourceId: string,
    rating: number,
    reviewCount: number
  ): Promise<void>;
  deleteResourcesByOwner(ownerId: string): Promise<void>;
  getAllItems(): Promise<GuideItemRecord[]>;
  /** Estabelecimentos e itens de um dono (painel do parceiro, D27). */
  listItemsByOwner(ownerId: string): Promise<GuideItemRecord[]>;
  getItemContact(itemId: string): Promise<GuideItemContact | null>;
  setItemContact(itemId: string, contact: GuideItemContact): Promise<void>;
  deleteItemContact(itemId: string): Promise<void>;
  /**
   * Troca o dono do anúncio só se o dono atual for `expectedOwnerId` (D35 "Sou o dono"): devolve
   * `false` se outro dono já estiver gravado. Já com o novo dono, não muda nada e devolve `true`.
   */
  transferOwner(itemId: string, expectedOwnerId: string, ownerId: string): Promise<boolean>;
}
