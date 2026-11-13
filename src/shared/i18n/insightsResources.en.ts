import type { InsightsTranslation } from './insightsResources';

export const insightsEn: InsightsTranslation = {
  reports: {
    empty: 'No records found for reports',
    pickTitle: 'Select an item or event to see its report',
    typeItem: 'Item',
    typeEvent: 'Event',
    typeBusiness: 'Business',
    seeAll: 'See all',
    seeAllLabel: 'See all items and events',
    title: 'Insights report',
    loading: 'Loading the report...',
    loadError: 'We could not load the report for this item.',
    planRequiredTitle: 'Use Guide Verified plan metrics',
    planRequired:
      'Metrics for this listing are part of the business plan. Start the plan in My Items. Reviews stay available.',
  },
  stats: {
    views: 'Views',
    whatsapp: 'WhatsApp clicks',
    favorites: 'Favorited',
    shares: 'Shared',
  },
  audience: {
    title: 'Who viewed',
    signedIn: 'With a Use Guide account',
    anonymous: 'Visitors',
    noViews: 'No views yet.',
  },
  chart: {
    title: 'Visit flow',
    subtitle: 'Last 7 days',
    series: 'Views',
  },
  reviews: {
    title: 'Pending reviews',
    waiting_one: '{{count}} awaiting reply',
    waiting_other: '{{count}} awaiting reply',
    showAll: 'See all',
    showLess: 'Show less',
    rating: '{{rating}} out of 5 stars',
    replyPlaceholder: 'Write your reply...',
    replyLabel: 'Reply to the review by {{name}}',
    send: 'Send reply',
    cancel: 'Cancel',
    reply: 'Reply to review',
    none: 'No pending reviews',
    replyError: 'Could not send the reply.',
  },
  monthVisits: {
    label: 'Visits this month',
    versus: '{{percent}} vs. {{month}}',
    firstMonth: 'No visits in {{month}}',
    withPlan: 'Available with the plan',
    unavailable: "Couldn't load now",
  },
};
