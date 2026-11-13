import type { TicketSessionsTranslation } from './ticketSessionsResources';

export const ticketSessionsEn: TicketSessionsTranslation = {
  sheet: {
    sold: 'Sold',
    soldTickets: 'Tickets sold',
    entered: 'Entered',
    enteredOf: '{{entered}} of {{total}}',
    openGate: 'Open entrance',
    postpone: 'Postpone session',
    cancel: 'Cancel session',
    gateTitle: 'Entrance',
    openGateMode: 'Open entrance mode',
    offlineHint:
      'Without internet, the entrance keeps checking QR codes and sends the entries when the connection is back.',
    error: 'The session could not be loaded.',
  },
  postpone: 'Postpone session',
  cancel: 'Cancel session',
  statusPostponed: 'Session postponed',
  statusCanceled: 'Session canceled',
  accountNotice:
    'Paid ticket sales unavailable: finish the payment setup for the CNPJ of this event’s place. Free registrations work normally.',
  entries: {
    title: 'Entries',
    open: 'See who came in',
    count_one: '{{count}} entry',
    count_other: '{{count}} entries',
    empty: 'Nobody has come in yet.',
    error: "Couldn't load the entries.",
    buyer: 'Buyer',
    guest: 'Guest',
    guestTag: 'guest',
    offline: 'recorded offline',
    method: { qr: 'QR', code: 'Code' },
  },
  postponeDialog: {
    title: 'Postpone session',
    description:
      'Tickets stay valid on the new date, with no penalty for you. Each buyer is notified and has 7 days to ask for a full refund, service fee included.',
    newStart: 'New start date and time',
    durationKept: 'The session keeps the same duration.',
    reason: 'Reason',
    reasonHint: 'Shown in the notice to buyers. 3 to 300 characters.',
    submit: 'Postpone session',
    invalid: 'Enter a future date and the reason.',
    done_one: 'Session postponed. {{count}} order stays valid on the new date.',
    done_other: 'Session postponed. {{count}} orders stay valid on the new date.',
  },
  cancelDialog: {
    title: 'Cancel session',
    noSales: 'This session has no paid tickets. Canceling ends its sales.',
    withSales_one:
      'This session has {{count}} paid order. It will be fully refunded, service fee included.',
    withSales_other:
      'This session has {{count}} paid orders. All of them will be fully refunded, service fee included.',
    penalty:
      'Your CNPJ pays a penalty of 20% of the amount sold, with 24 h to pay under Payouts › Debts. After that, the penalty is deducted from payouts and the CNPJ’s sales are paused.',
    forceMajeure:
      'Was it force majeure (e.g. wind or closure by the authorities)? Declare it under Payouts › Debts before the due date: the penalty is suspended until the review.',
    reason: 'Cancellation reason',
    reasonHint: 'Shown in the notice to buyers. 3 to 300 characters.',
    postponeInstead: 'Postpone instead',
    confirm: 'Cancel session',
    back: 'Back',
    invalid: 'Enter the cancellation reason.',
    done: 'Session canceled. Refunds have started.',
  },
  failed: 'Could not complete this now. Please try again.',
};
