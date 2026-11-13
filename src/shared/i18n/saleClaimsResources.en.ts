import type { SaleClaimsTranslation } from './saleClaimsResources';

export const saleClaimsEn: SaleClaimsTranslation = {
  action: 'Report a problem',
  actionShort: 'Report',
  prompt: 'Something went wrong? Until {{date}}',
  dialog: {
    title: 'Report a problem',
    description:
      'Tell us what happened. The organizer’s payment is held until we review it, within 5 days.',
    reasonLabel: 'What happened?',
    reasonRequired: 'Choose what happened.',
    detailsLabel: 'Details (optional)',
    detailsHint: 'Up to {{max}} characters. Don’t include documents or card details.',
    submit: 'Send report',
    sending: 'Sending…',
  },
  reason: {
    did_not_happen: 'It didn’t happen',
    not_as_described: 'Not as described',
    changed_without_notice: 'Changed without notice',
    safety_issue: 'Safety issue',
    other: 'Other reason',
  },
  line: {
    open: 'Problem under review · reply by {{date}}',
    refund_pending: 'Refund in progress',
    refunded: 'Refunded {{amount}}',
    released: 'Review completed, no refund',
    expired: 'Review closed, no refund',
  },
  errors: {
    NOT_FOUND: 'Purchase not found.',
    CLAIM_NOT_ALLOWED: 'This purchase has no amount to claim.',
    CLAIM_TOO_EARLY: 'Before it starts, cancel the purchase instead.',
    CLAIM_WINDOW_CLOSED: 'Problems had to be reported within 48 h after the end.',
    CLAIM_ALREADY_EXISTS: 'You already reported a problem with this purchase.',
    UNAVAILABLE: 'Couldn’t send it now. Try again.',
  },
};
