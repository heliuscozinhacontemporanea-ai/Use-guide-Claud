export type ListingPlanErrorCode =
  | 'VALIDATION_ERROR'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'LISTING_PENDING_VERIFICATION'
  | 'TRIAL_ALREADY_USED'
  | 'PLAN_ALREADY_ACTIVE'
  | 'PARTNER_SUSPENDED';

const STATUS: Record<ListingPlanErrorCode, number> = {
  VALIDATION_ERROR: 400,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  LISTING_PENDING_VERIFICATION: 422,
  TRIAL_ALREADY_USED: 409,
  PLAN_ALREADY_ACTIVE: 409,
  PARTNER_SUSPENDED: 403,
};

export class ListingPlanError extends Error {
  readonly statusCode: number;

  constructor(
    public readonly code: ListingPlanErrorCode,
    message: string
  ) {
    super(message);
    this.name = 'ListingPlanError';
    this.statusCode = STATUS[code];
  }
}
