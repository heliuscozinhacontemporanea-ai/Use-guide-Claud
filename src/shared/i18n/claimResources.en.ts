import type { ClaimTranslation } from './claimResources';

export const claimEn: ClaimTranslation = {
  row: { question: 'Do you own this place?', action: 'I’m the owner' },
  title: 'Claim listing',
  lead: 'Use Guide checks your documents and moves the listing to your account, with its photos and reviews.',
  note: 'The document number is encrypted and only shown masked. While the request is under review, the listing stays live as it is.',
  submit: 'Send request',
  loginNote:
    'Sign in or create your account to claim {{name}}. You’ll come right back to the request.',
  sent: {
    title: 'Request sent',
    text: 'Use Guide checks your documents and lets you know in the app. Meanwhile, {{name}} stays live as it is.',
    button: 'Go to dashboard',
  },
  suggest: {
    title: 'Already on the guide?',
    action: 'It’s mine',
    hint: 'If it’s yours, claim the listing instead of creating another one. If not, keep signing up as usual.',
  },
  panel: {
    pending: 'Under review',
    pendingText: 'Request to claim the listing · sent on {{date}}',
    pendingHint:
      'Once approved, the listing shows up in your Catalog and the step guide shows what’s missing to sell.',
    rejected: 'Declined',
    rejectedText: 'Reason: {{reason}}',
    resend: 'Send again',
    approved: 'Approved',
    approvedText: '{{name}} is now yours. Photos, reviews and rating stay.',
  },
  admin: {
    tag: 'Claim listing',
    place: '{{category}} · {{city}} · Use Guide listing',
    sentBy: 'Sent by {{name}} · {{date}}',
    holder: { owner: 'Holder, partner or manager', representative: 'Representative' },
    other: 'Another request for this place: {{name}}, {{role}}, sent on {{date}}.',
    open: 'Open: {{file}}',
    approve: 'Approve',
    reject: 'Decline',
    confirmTitle: 'Move the listing to {{name}}?',
    confirmText:
      'Check the CNPJ card with the tax office, the person’s link to the company (QSA or MEI) and their ID. {{listing}} moves to this account with photos, reviews and rating, and becomes verified. Other requests for this place are declined with the reason “Another request was approved”.',
    return: 'Return to Use Guide',
    returnConfirm:
      'Return {{listing}} to Use Guide? The listing leaves {{name}}’s account and the verification is undone.',
    returned: 'Returned to Use Guide',
    approvedToast: 'Listing moved to the account.',
    rejectedToast: 'Request declined.',
    returnedToast: 'Listing returned to Use Guide.',
    empty: 'No requests to claim a listing.',
  },
  errors: {
    EMAIL_NOT_VERIFIED: 'Confirm your email before sending the request.',
    TERMS_REQUIRED: 'To continue, accept the Partner Terms.',
    LISTING_NOT_CLAIMABLE: 'This listing can no longer be claimed in the app.',
    ALREADY_APPROVED: 'This listing is already yours.',
    DOCUMENT_IN_USE: 'This document is already linked to another account.',
    CNPJ_ALREADY_USED: 'Each CNPJ is for one business. Branches use the branch CNPJ.',
    LISTING_IN_USE:
      'The listing already has bookings, events or a plan from the new owner. Sort it out with them through support.',
    NOT_PENDING: 'This request has already been reviewed.',
    failed: 'We couldn’t send it right now. Try again.',
  },
};
