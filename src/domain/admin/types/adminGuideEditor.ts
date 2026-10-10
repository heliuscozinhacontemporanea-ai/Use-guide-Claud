import type {
  GuideItem,
} from '../../guide';

export type AdminGuideEditorFormValues =
  Omit<
    GuideItem,
    | 'id'
    | 'rating'
    | 'reviewCount'
    | 'ownerId'
    | 'partnerId'
    | 'isVerified'
    | 'verifiedUntil'
    | 'isVerificationSuspended'
    | 'verificationType'
    | 'contentType'
  >;
