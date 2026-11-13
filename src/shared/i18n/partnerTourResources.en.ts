import type { PartnerTourTranslation } from './partnerTourResources';

export const partnerTourEn: PartnerTourTranslation = {
  progress: '{{chapter}} · {{current}} of {{total}}',
  tipsOff: "Don't show panel tips",
  skip: 'Skip',
  back: 'Back',
  next: 'Next',
  finish: 'Done',
  replay: 'See the panel tour',
  replayHint: 'From the start or just one part',
  chooserTitle: 'Panel tour',
  chooserDescription: 'See it all or just the part you need.',
  fromStart: 'From the start',
  chapters: {
    home: 'Home',
    agenda: 'Schedule',
    catalog: 'Catalog',
    earnings: 'Earnings',
    more: 'More',
  },
  steps: {
    shortcuts: {
      title: 'Everything one tap away',
      text: "From here you go to Schedule, Catalog, Earnings and More. Let's go through each one.",
    },
    establishment: {
      title: 'Your businesses',
      text: 'Tap the name to see the panel for one business or for all of them together.',
    },
    attention: {
      title: 'Act now',
      text: 'Things that need you, such as documents, payout account and terms.',
    },
    agora: {
      title: 'Now',
      text: "At service time, the code, I'm here and the gate show up. They go away on their own.",
    },
    cards: {
      title: 'Your numbers',
      text: 'Sales, schedule and payouts. In "Customize home" you choose which ones show and in what order.',
    },
    'agenda-week': {
      title: 'Your week',
      text: 'Change weeks with the arrows or by swiping the days. Tap the month to see the calendar.',
    },
    'agenda-day': {
      title: 'The day',
      text: 'Tap a time slot or a session to see who is coming, the code and the gate.',
    },
    'catalog-kinds': {
      title: 'Your listings',
      text: 'Places (your businesses), Events and Tours (tours, rentals and transfers).',
    },
    'catalog-create': {
      title: 'Create',
      text: 'Create a place, an event or a tour.',
    },
    'catalog-first': {
      title: 'Each listing',
      text: 'Open a place to see its plan and seal; an event, for sales, guests and promoters.',
    },
    'earnings-totals': {
      title: 'Your money',
      text: 'What is still coming to your account and what has arrived this month.',
    },
    'earnings-tabs': {
      title: 'Payouts, statement and debts',
      text: 'Each payout, each sale and what was deducted.',
    },
    'earnings-links': {
      title: 'Accounts and reports',
      text: 'Where the money goes, by CNPJ, and sales by period.',
    },
    'more-list': {
      title: 'More',
      text: 'Profile, businesses, plans and accounts. Terms, help and "See the panel tour" are right below.',
    },
  },
};
