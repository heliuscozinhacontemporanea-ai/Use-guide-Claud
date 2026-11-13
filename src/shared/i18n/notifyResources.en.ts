import { notifyTypesEn } from './notifyTypesResources.en';
import type { NotifyTranslation } from './notifyResources';

export const notifyEn: NotifyTranslation = {
  types: notifyTypesEn,
  settingsTitle: 'Notifications',
  device: {
    defaultTitle: 'Turn on notifications',
    default:
      'Know right away when your purchase is confirmed, a tour changes time or your guide arrives.',
    enable: 'Turn on',
    granted: 'Notifications are on',
    grantedHint: 'To turn them off, use your phone or browser settings.',
    denied:
      'Use Guide notifications are off here. To get them, allow them in your browser settings.',
    install:
      'On iPhone, notifications only work with Use Guide on your Home Screen. Tap Share, then “Add to Home Screen”, and open the app from there.',
    unsupported:
      'This browser doesn’t show notifications. You can still see everything under the bell at the top of the screen.',
  },
  always: {
    title: 'We always let you know about',
    on: 'Always',
    purchases: {
      label: 'Purchases and payments',
      hint: 'Payment confirmed, pending Pix and refunds',
    },
    trips: { label: 'Tickets and bookings', hint: 'Confirmation, reminders and time changes' },
    account: { label: 'Your account', hint: 'New sign-ins and email or password changes' },
    partnerClaims: { label: 'Cancellations and complaints', hint: 'Plus your customers’ reviews' },
    partnerMoney: {
      label: 'Payouts and registration',
      hint: 'Payment for your sales and your business’s verification',
    },
    note: 'These are important, so they can’t be turned off.',
  },
  choices: {
    title: 'Your choice',
    reviewRequests: 'Review requests',
    reviewRequestsHint: 'After a tour, event or stay, we ask what you thought.',
    news: 'News and offers',
    newsHint: 'New events and tips to make the most of your trip.',
    nightNote: 'These never arrive between 11:30 pm and 5:30 am.',
  },
  sales: {
    title: 'Sale alerts',
    each: 'For every sale',
    eachHint: 'One alert for each sale or booking.',
    daily: 'End-of-day summary',
    dailyHint: 'A single alert with the day’s sales.',
    note: 'Cancellations and complaints always arrive right away.',
  },
  loadError: 'We couldn’t load your choices.',
  saveError: 'We couldn’t save. Please try again.',
  retry: 'Try again',
  center: {
    title: 'Notifications',
    open: 'Open notifications',
    openUnread_one: 'Open notifications, {{count}} unread',
    openUnread_other: 'Open notifications, {{count}} unread',
    markAll: 'Mark all as read',
    more: 'More options',
    filterUnread: 'Unread',
    filterAll: 'All',
    upToDate: 'You’re all caught up',
    upToDateHint: 'New updates will show up here.',
    settings: 'Settings',
    today: 'Today',
    earlier: 'Earlier',
    empty: 'No notifications',
    emptyHint: 'When your purchase is confirmed or something changes, you’ll see it here.',
    unread: 'Unread',
    loadError: 'We couldn’t load your notifications.',
  },
};
