import type { ReviewReportsTranslation } from './reviewReportsResources';

export const reviewReportsEn: ReviewReportsTranslation = {
  recent: {
    loading: 'Loading reviews',
    noReply: 'No reply',
    replied: 'Replied',
    empty: 'No reviews yet.',
    error: "Couldn't load the reviews.",
    seeAll: 'See all and reply',
  },
  action: 'Report response',
  sheet: {
    title: 'Report response',
    description:
      '{{place}}. The Use Guide team reviews it and replies within 3 days. The business does not find out who reported it.',
    reasonLegend: 'Reason',
    detailsLabel: 'Tell us what happened (optional)',
    submit: 'Send report',
    sending: 'Sending…',
  },
  reasons: {
    offensive: 'Offensive or disrespectful',
    fraud: 'Fraud or scam',
    personal_data: 'Exposes personal data',
    other: 'Other reason',
  },
  status: {
    open: 'Report under review · answer by {{date}}',
    upheld: 'Report accepted: the response was removed',
    dismissed: 'Report reviewed: the response was kept',
  },
  sent: 'Report sent. The result shows up here on the card.',
  errors: {
    REPORT_LIMIT_REACHED: 'You have sent too many reports today. Try again tomorrow.',
    ALREADY_REPORTED: 'You have already reported this response.',
    NO_RESPONSE_TO_REPORT: 'This review no longer has a response.',
    generic: 'Could not send the report.',
  },
  admin: {
    tab: 'Moderation',
    title: 'Reported responses',
    loading: 'Loading reports…',
    empty: 'No reports to review.',
    unknownPlace: 'Place no longer in the guide',
    review: 'Review · {{rating}} out of 5',
    response: 'Reported response',
    reason: 'Reason: {{reason}}',
    details: 'Details: {{details}}',
    decideBy: 'Answer by {{date}}',
    uphold: 'Remove response',
    dismiss: 'Keep response',
    upholdConfirm: 'Remove the business response? The review stays published.',
    upheld: 'Response removed.',
    dismissed: 'Report dismissed; the response stays.',
    loadMore: 'Show more',
    errors: {
      load: 'Could not load the reports.',
      decide: 'Could not record the decision.',
      ALREADY_DECIDED: 'This report has already been decided.',
    },
  },
};
