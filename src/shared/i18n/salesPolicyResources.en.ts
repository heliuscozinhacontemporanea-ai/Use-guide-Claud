import type { SalesPolicyTranslation } from './salesPolicyResources';

export const salesPolicyEn: SalesPolicyTranslation = {
  policies: {
    event: {
      flexible: { title: 'Flexible', description: 'Full refund up to 24 h before the start.' },
      moderate: { title: 'Moderate', description: 'Full refund up to 7 days before the start.' },
      strict: { title: 'Strict', description: 'Full refund up to 30 days before the start.' },
      none: { title: 'No refund', description: 'No refund outside the right of withdrawal.' },
    },
    booking: {
      flexible: { title: 'Flexible', description: 'Full refund up to 24 h before the start.' },
      moderate: {
        title: 'Moderate',
        description: 'Full refund up to 5 days before the start; 50% up to 24 h before.',
      },
      strict: { title: 'Strict', description: '50% refund up to 7 days before the start.' },
      none: { title: 'No refund', description: 'No refund outside the right of withdrawal.' },
    },
    transfer: {
      transfer_flexible: {
        title: 'Flexible transfer',
        description: 'Full refund up to 24 h before departure.',
      },
      transfer_standard: {
        title: 'Standard transfer',
        description: '95% refund up to 24 h before departure.',
      },
    },
  },
  sectionTitle: 'Sales rules',
  policyLegend: 'Cancellation policy',
  lockedHint: 'After publishing, you can only switch to a more flexible policy.',
  withdrawal:
    'Right of withdrawal: full refund, service fee included, if you cancel within 7 days of purchase and at least 48 h before the start.',
  withdrawalNoFee:
    'Right of withdrawal: full refund if you cancel within 7 days of purchase and at least 48 h before the start.',
  noShow: 'No-shows are not refunded.',
  serviceFee: {
    legend: 'Service fee',
    passToBuyer: {
      title: 'The buyer pays',
      description: 'A service fee per paid ticket is added to the ticket price.',
    },
    absorb: {
      title: 'I absorb it',
      description: 'The buyer pays only the ticket price, and the platform commission is higher.',
    },
    line: 'Service fee',
    notRefundable:
      'The service fee is only refunded under the right of withdrawal or if the organizer cancels.',
  },
};
