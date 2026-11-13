import type { LegalTranslation } from './legalResources';

export const legalEn: LegalTranslation = {
  title: 'Terms and policies',
  version: 'Version of {{date}}',
  prevailing: 'If the languages differ, the Portuguese version prevails.',
  use: {
    title: 'Terms of use',
    paragraphs: [
      'By using Use Guide, you agree to these terms and to the privacy policy below. If you do not agree, do not use the app.',
      'Use Guide brings together information, maps and tips about travel destinations in Brazil and sells tickets, tours, rentals, transfers and entries from registered organizers and businesses.',
      'You must provide true information and keep your credentials secret. Your account is personal and non-transferable.',
      'You may not use the app for illegal activities, copy or distribute its content without permission, or try to access restricted areas.',
      'Route, trail and weather information is for guidance only. Assess the risks before following a suggested route.',
      'The app uses third-party services such as Google Maps, Firebase and Stripe, subject to their own rules.',
      'Changes to these terms: when the change is important, we notify you in the app 15 days in advance. Continuing to use Use Guide after the effective date counts as acceptance of the new version.',
      'These terms may change. New purchases and sales require accepting the current version; your order follows the version you accepted.',
      'Questions: ajuda@useguide.com.br.',
    ],
  },
  purchases: {
    title: 'Purchases, cancellation and refunds',
    paragraphs: [
      'You pay Use Guide, which passes the amount on to the organizer after the service.',
      'Before payment you see the total with the service fee shown separately. The service fee pays the platform.',
      'Each organizer chooses one of the platform cancellation policies listed below. The chosen policy is shown before payment and saved with the order: later changes to the listing do not affect your order.',
      'Right of withdrawal (Brazilian Consumer Code, art. 49): if you cancel within 7 days of purchase and at least 48 hours before the start, you get a full refund, including any service fee.',
      'Outside that window the order policy applies and the service fee is not refunded. After the start, or if you do not show up, there is no refund.',
      'Cancellation by the organizer: full refund, service fee included. In proven force majeure, the organizer may offer a new date; if you do not accept it, you get a full refund.',
      'Refunds go back to the payment method used for the purchase.',
      'Ticket transfer: allowed when the organizer permits it, up to the deadline shown on the order.',
      'If you dispute the purchase with your card issuer, the order is suspended until the decision.',
    ],
    policiesTitle: 'Platform cancellation policies',
    families: {
      event: 'Events',
      booking: 'Tours, rentals and entries',
      transfer: 'Transfers (Brazilian Civil Code, art. 740)',
    },
  },
  partner: {
    title: 'Partner terms',
    paragraphs: [
      'Each verified CNPJ receives into its own Stripe account, and each business sells through the account of its CNPJ. Individual CPFs do not sell.',
      'Stripe fees are paid by the platform. On a partial refund, the platform fee applies to the amount you keep.',
      'Payouts: the amount of each sale is transferred 48 hours after the service ends. A complaint opened in that window holds that sale’s payout for up to 5 days.',
      'Cancellation policy: you choose one of the platform options. After publishing, you can only switch to a more flexible option. The buyer’s right of withdrawal always applies.',
      'Cancellation by the owner: buyers get a full refund, service fee included, paid by the platform before the payout. You pay a penalty of 20% of the amount sold (excluding service fees), by card or Pix, within 24 hours. If unpaid, the penalty is deducted from the CNPJ’s pending and future payouts, and the CNPJ is blocked from new sales until it is settled.',
      'Proven force majeure: the first solution is rescheduling. Buyers who do not accept the new date get a full refund, with no penalty for you.',
      'Card disputes: with proof of use (check-in), the platform contests and bears the outcome. Without proof, the disputed amount becomes a debt of the CNPJ.',
      'Complimentary tickets: you can send complimentary tickets by @ or by personal link, one per person per event. A complimentary ticket takes a spot in the session, has no price, fee or payout, and cannot be refunded, transferred or sold. You may not give a complimentary ticket to anyone who bought, canceled or was refunded a ticket for the same event.',
      'Promoters: the deal with each promoter (commission, amount per ticket or flat fee) is paid by you, directly, after the event. Use Guide calculates and shows the amounts, but does not make or guarantee this payment.',
      'Selling outside the platform: you may not sell or charge outside Use Guide for a ticket, complimentary ticket, invite link, booking or service listed here, nor ask a customer to cancel a purchase to pay outside. Breaking this rule suspends the sales of the CNPJ and may lead to the closing of the partner account.',
      'Changes to these terms: when the change is important, we notify you in the app 15 days in advance. Continuing to sell after the effective date counts as acceptance of the new version; acceptance can also be recorded in Earnings › Payout accounts.',
    ],
    feesWithValues:
      'Platform fee: {{bookings}} on bookings (tours, rentals, transfers and entries). On tickets, {{tickets}} plus a service fee of {{serviceFee}} per paid ticket, charged to the buyer; or {{absorbed}} when you absorb the service fee.',
    feesGeneric:
      'Platform fee: the current rates are shown under Payouts, in the partner panel, before you accept these terms.',
  },
  privacy: {
    title: 'Data privacy',
    paragraphs: [
      'We collect only what is needed, such as name, email, location and usage data, with your consent, to offer a personalized experience (Brazilian Law 13.709/2018, LGPD).',
      'We use the data to show places and products, personalize recommendations, improve performance and security, and send notifications.',
      'If you turn on notifications, we store an identifier for the device to send them. You can turn them off at any time in Settings › Notifications or in your browser; the identifier is deleted when you sign out on this device or delete your account.',
      'Third-party services such as Google and Stripe follow their own privacy rules, compatible with the LGPD. Card data stays with Stripe and never passes through Use Guide.',
      'Data is stored on servers protected by encryption and accessed only by authorized people.',
      'You can request access to, correction of or deletion of your data at ajuda@useguide.com.br. Purchase records are anonymized, not deleted, for the legal period.',
    ],
  },
  accept: {
    buyer: 'I have read and accept the <terms>terms and cancellation policy</terms>',
    partner: 'I have read and accept the <terms>partner terms</terms>',
    required: 'Accept the terms to continue.',
    close: 'Close',
  },
  partnerTerms: {
    title: 'Partner terms',
    description:
      'Read and accept the rules on fees, payouts, cancellations, penalties, complimentary tickets, promoters and selling outside the platform.',
    button: 'Accept terms',
    accepted: 'Partner terms accepted on {{date}}.',
    error: 'Could not record your acceptance. Try again.',
  },
  about: {
    title: 'About the app',
    back: 'Back',
    general: 'General',
    licenses: 'Licenses',
    terms: 'Terms',
  },
};
