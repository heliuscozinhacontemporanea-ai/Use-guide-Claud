import type { TicketWalletTranslation } from './ticketWalletResources';

export const ticketWalletEn: TicketWalletTranslation = {
  title: 'Tickets',
  tabsLabel: 'Tickets by date',
  loadError: "Couldn't load your tickets.",
  loading: 'Loading your tickets…',
  tabs: { upcoming: 'Upcoming ({{count}})', past: 'Past ({{count}})' },
  emptyUpcoming: 'No tickets for upcoming events.',
  emptyPast: 'No tickets for past events.',
  session: 'Session: {{date}}',
  code: {
    label: 'Code {{code}}',
    hint: 'Show the QR code at the entrance. If it cannot be read, tell them the code.',
    warning: 'Never share the code by phone or message. No one at Use Guide asks for this code.',
    notYet: 'The code appears on the day of the event, from {{date}}.',
  },
  order: 'Order #{{id}}',
  ticketCount_one: '{{count}} ticket',
  ticketCount_other: '{{count}} tickets',
  actions: {
    showQr: 'Show QR',
    transfer: 'Transfer',
    return: 'Give back',
  },
  swap: {
    action: 'Problem with the QR code?',
    title: 'Replace the QR code?',
    message:
      'Use this if someone saw or copied your QR code. The current QR and code stop working, and you can only do this once. If the entrance is offline, the old QR may still pass until it updates: arrive early and show your ID if needed.',
    confirm: 'Replace QR code',
  },
  ticketStatus: {
    reserved: 'Reserved',
    issued: 'Issued',
    checked_in: 'Used',
    transferred: 'Transferred',
    refund_pending: 'Refund in progress',
    refunded: 'Refunded',
    canceled: 'Canceled',
    invalidated: 'Invalid',
    expired: 'Expired',
  },
  resume: { title: 'Complete payment for order #{{id}}', close: 'Close' },
  feedback: {
    qrSwapped: 'QR code replaced. The previous one and the old code no longer work.',
    refundRequested: 'Refund requested. You will receive it through the same payment method.',
    alreadyPaid: 'Your payment was already confirmed. Tickets updated.',
    paid: 'Payment confirmed and tickets issued!',
  },
  errors: {
    qr: 'Could not generate the QR code.',
    qrSwap: 'Could not replace the QR code.',
    refund: 'Could not request the refund.',
    resume: 'Could not resume payment for this order.',
  },
};
