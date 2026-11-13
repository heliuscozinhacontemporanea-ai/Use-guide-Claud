import type { ListingPlanTranslation } from './listingPlanResources';

export const listingPlanEn: ListingPlanTranslation = {
  chip: {
    active: 'Badge until {{date}}',
    trial: 'Free trial until {{date}}',
    admin: 'Team badge',
    suspended: 'Badge suspended',
    pendingSeal: 'Plan active, badge after verification',
    none: 'Get the badge',
  },
  planNames: {
    trial: 'Free trial',
    monthly: 'Monthly',
    'semi-annual': 'Six-month',
    annual: 'Annual',
    admin: 'Granted by the team',
  },
  dialog: {
    title: 'Use Guide Verified',
    close: 'Close',
    loading: 'Loading the plan…',
    retry: 'Try again',
  },
  status: {
    activeUntil: '{{plan}} plan active until {{date}}.',
    adminGranted: 'Badge granted by the Use Guide team.',
    none: 'This business has no plan yet.',
    sealOn: 'The badge shows on the business and on its events.',
    sealPendingVerification: 'The badge shows once the team approves the business verification.',
    sealSuspended: 'The Use Guide team removed the badge. The plan is still active.',
  },
  benefits: {
    title: 'The plan includes',
    seal: '"Use Guide Verified" badge on the business and on its events',
    metrics: 'View and click metrics',
    featured: 'Daily rotation in the "Featured" spots at the top of the list',
    reviews: 'Reviews and replies stay available, with or without a plan',
  },
  verificationRequired:
    'To start a plan, submit this business for verification and wait for the team to approve it.',
  verifyAction: 'Verify business',
  options: {
    title: 'Choose the period',
    trialName: '7-day free trial',
    trialHint: 'Once per account, on the business you choose.',
    free: 'Free',
    perMonth: '{{amount}}/month',
    empty: 'No plans available right now.',
  },
  actions: {
    activateTrial: 'Start 7 free days',
    continue: 'Continue to payment',
    processing: 'Processing…',
  },
  trialActivated: 'Free trial active until {{date}}.',
  checkoutName: 'Use Guide Verified · {{plan}} · {{name}}',
  admin: {
    grant: 'Grant badge',
    revoke: 'Remove badge',
    grantLabel: 'Grant badge to {{name}}',
    revokeLabel: 'Remove badge from {{name}}',
    confirmGrant: 'Grant the badge to {{name}}? An active paid plan is not changed.',
    confirmRevoke:
      'Remove the badge from {{name}}? An active paid plan is kept; only the badge stops showing.',
    granted: 'Badge granted.',
    grantedPendingVerification:
      'Badge granted. It shows once the business verification is approved.',
    revoked: 'Badge removed.',
    noPlan: 'No plan',
  },
  errors: {
    VALIDATION_ERROR: 'Invalid data. Please review and try again.',
    FORBIDDEN: 'This business does not belong to your account.',
    NOT_FOUND: 'Business not found.',
    LISTING_PENDING_VERIFICATION: 'The team must verify the business before a plan.',
    TRIAL_ALREADY_USED: 'This account has already used the free trial.',
    PLAN_ALREADY_ACTIVE: 'This business already has an active plan.',
    PARTNER_SUSPENDED: 'Your account is suspended.',
    INTERNAL_ERROR: 'Something went wrong. Please try again shortly.',
  },
};
