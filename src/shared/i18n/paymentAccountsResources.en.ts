import type { PaymentAccountsTranslation } from './paymentAccountsResources';

export const paymentAccountsEn: PaymentAccountsTranslation = {
  title: 'Payouts',
  subtitle:
    'Each verified CNPJ gets paid into its own account. Sales from a listing go to the account of its CNPJ.',
  loading: 'Loading payout accounts…',
  empty: 'No verified CNPJ yet. Verify a listing with a CNPJ to receive payments.',
  refresh: 'Refresh payout accounts',
  retry: 'Try again',
  missingKey: 'Payments are unavailable right now: the Stripe publishable key is not set.',
  page: {
    title: 'Payout accounts',
    intro:
      'Each CNPJ is paid into its own account. Each catalog item is paid into the account of its business CNPJ.',
    items_one: '{{count}} item',
    items_other: '{{count}} items',
  },
  listings_one: '{{count}} listing sells under this CNPJ',
  listings_other: '{{count}} listings sell under this CNPJ',
  requirements_one: '{{count}} pending item on Stripe',
  requirements_other: '{{count}} pending items on Stripe',
  status: {
    ready: 'Ready to receive',
    pending: 'Setup incomplete',
    restricted: 'Under review by Stripe',
    disabled: 'Disabled by Stripe',
    notStarted: 'Setup not started',
  },
  actions: {
    start: 'Set up payouts',
    continue: 'Continue setup',
    manage: 'Manage',
    back: 'Back to accounts',
  },
  tabs: {
    label: 'Account sections',
    onboarding: 'Setup',
    balances: 'Balances',
    payouts: 'Payouts',
    payments: 'Payments',
    account: 'Account details',
  },
  errors: {
    NOT_FOUND: 'This CNPJ is not verified on your account.',
    FORBIDDEN: 'This payout account belongs to another partner.',
    VALIDATION_ERROR: 'Invalid account. Refresh the page and try again.',
    PAYMENT_ACCOUNT_UNAVAILABLE: "We couldn't reach Stripe right now. Try again in a moment.",
  },
};
