import {
  GuideCreateItemInput,
  GuideItemRecord,
  GuideUpdateItemInput,
  GuideVerificationType,
} from '../types/guideTypes';

export interface GuideVerificationUpdate {
  isVerified: boolean;
  verifiedUntil: string | null;
  verificationType: GuideVerificationType;
  isVerificationSuspended: boolean;
}

export interface GuidePort {
  createItem(
    data: GuideCreateItemInput & {
      ownerId: string;
      id?: string;
    }
  ): Promise<string>;
  getItemById(id: string): Promise<GuideItemRecord | null>;
  updateItem(id: string, data: GuideUpdateItemInput): Promise<void>;
  deleteItem(id: string): Promise<void>;
  updateVerificationByOwner(ownerId: string, verification: GuideVerificationUpdate): Promise<void>;
  updateReviewAggregate(
    resourceType: 'items',
    resourceId: string,
    rating: number,
    reviewCount: number
  ): Promise<void>;
  deleteResourcesByOwner(ownerId: string): Promise<void>;
  getAllItems(): Promise<GuideItemRecord[]>;
}
