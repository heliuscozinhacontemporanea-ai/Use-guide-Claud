import type { NotificationTypeTexts } from './notifyTypesResources';

export const notifyTypesEn: NotificationTypeTexts = {
  terms_updated_partner: {
    title: 'The partner terms have changed',
    body: 'The changes take effect 15 days after this notice. Tap to read and accept the new version.',
  },
  terms_updated_buyer: {
    title: 'The terms of use have changed',
    body: 'The changes take effect 15 days after this notice. Tap to read.',
  },
  gate_staff_invited: {
    title: 'Invitation to the gate',
    body: '{{business}} invited you to check people in at {{event}}.',
    bodyGeneric: 'You got an invitation to work the gate of an event.',
  },
  promoter_invited: {
    title: 'Invitation to promote',
    body: '{{business}} wants you to promote {{event}}. See how much you earn.',
    bodyGeneric: 'You got an invitation to promote an event.',
  },
  promoter_accepted: {
    title: 'Promoter accepted',
    body: '{{username}} agreed to promote {{event}}.',
    bodyGeneric: 'A promoter accepted your invitation.',
  },
  promoter_declined: {
    title: 'Invitation declined',
    body: '{{username}} declined to promote {{event}}.',
    bodyGeneric: 'An invitation to promote was declined.',
  },
  courtesy_received: {
    title: 'You got a ticket',
    body: '{{business}} invited you to {{event}}. The ticket is in your wallet.',
    bodyGeneric: 'A complimentary ticket is in your wallet.',
  },
  courtesy_canceled: {
    title: 'Complimentary ticket canceled',
    body: 'The complimentary ticket for {{event}} was canceled by the organizer.',
    bodyGeneric: 'A complimentary ticket of yours was canceled by the organizer.',
  },
  courtesy_link_accepted: {
    title: 'Invite accepted',
    body: '{{username}} got the complimentary ticket from your invite link.',
    bodyGeneric: 'The complimentary ticket from your invite link was received.',
  },
  ticket_received: {
    title: 'You got a ticket',
    body: 'A ticket for {{event}} is in your wallet.',
    bodyGeneric: 'A new ticket is in your wallet.',
  },
  ticket_returned: {
    title: 'Ticket returned',
    body: 'The ticket for {{event}} is back in your wallet.',
    bodyGeneric: 'A ticket is back in your wallet.',
  },
  ticket_link_accepted: {
    title: 'Ticket delivered',
    body: '{{username}} got the ticket you sent.',
    bodyGeneric: 'The ticket you sent was received.',
  },
  ticket_qr_replaced: {
    title: 'QR code replaced',
    body: 'The previous QR code and code no longer work. If this wasn’t you, contact us.',
  },
  event_canceled: {
    title: 'Event canceled',
    body: '{{event}} was canceled. Your refund is on its way.',
    bodyGeneric: 'One of your events was canceled. Your refund is on its way.',
  },
  event_postponed: {
    title: 'Event has a new date',
    body: '{{event}} moved to {{date}}. Your ticket is valid on the new date. If you can’t go, ask for a refund within 7 days.',
    bodyGeneric:
      'One of your events moved to {{date}}. Your ticket is valid on the new date. If you can’t go, ask for a refund within 7 days.',
  },
  booking_provider_arrived: {
    title: '{{business}} has arrived',
    titleGeneric: 'Your guide has arrived',
    body: 'They’re waiting for you at the meeting point. Show your code.',
  },
  booking_no_show_marked: {
    title: 'Marked as no-show',
    body: '{{business}} marked that you didn’t show up. If you were there, tell us in Purchases.',
    bodyGeneric:
      'The provider marked that you didn’t show up. If you were there, tell us in Purchases.',
  },
  booking_absence_in_review: {
    title: 'We’re looking into it',
    body: '{{business}} says they were there. We’ll get back to you within 5 days.',
    bodyGeneric: 'The provider says they were there. We’ll get back to you within 5 days.',
  },
  booking_absence_refunded_buyer: {
    title: 'Refund on its way',
    body: 'You’ll get back what you paid, including the service fee.',
  },
  booking_confirmation_asked: {
    title: 'Did everything go well?',
    body: 'Let us know in Purchases whether the service happened, within 72 hours.',
  },
  sale_ticket: {
    title: 'New sale',
    body_one: '{{count}} ticket sold.',
    body_other: '{{count}} tickets sold.',
  },
  sale_booking: {
    title: 'New booking',
    body_one: '{{offer}} for {{count}} person.',
    body_other: '{{offer}} for {{count}} people.',
  },
  sale_claim_opened: {
    title: 'A customer opened a complaint',
    body: 'The money from this sale is held until a decision, within 5 days.',
  },
  booking_absence_reported: {
    title: 'Customer says you didn’t show up',
    body: 'Reply within 2 hours in your panel’s bookings. Without a reply, the customer is refunded and the 20% fine applies.',
  },
  booking_absence_refunded_partner: {
    title: 'Customer refunded',
    body: 'There was no reply in time. The customer was refunded and the 20% fine applies.',
  },
  booking_confirmation_denied: {
    title: 'A customer opened a complaint',
    body: 'The customer said the service didn’t happen. The money is held until a decision, within 5 days.',
  },
  booking_confirmation_refunded_partner: {
    title: 'Customer refunded',
    body: 'Arrival wasn’t confirmed with the code and the customer said the service didn’t happen.',
  },
  booking_confirmation_expired_partner: {
    title: 'Customer refunded',
    body: 'Arrival wasn’t confirmed with the code and the customer didn’t reply within 72 hours.',
  },
  review_received: {
    title: 'New review',
    body_one: '{{user}} gave {{item}} {{count}} star.',
    body_other: '{{user}} gave {{item}} {{count}} stars.',
  },
  review_updated: {
    title: 'Review updated',
    body_one: '{{user}} changed their rating of {{item}} to {{count}} star.',
    body_other: '{{user}} changed their rating of {{item}} to {{count}} stars.',
  },
  plan_expiring: {
    title: 'Your plan is ending soon',
    body_one: 'The plan for {{listing}} ends in {{count}} day. Renew to keep the badge.',
    body_other: 'The plan for {{listing}} ends in {{count}} days. Renew to keep the badge.',
  },
  plan_renewal_failed: {
    title: 'We couldn’t renew your plan',
    body: 'The card was declined. Update your payment method to keep the badge.',
  },
  sale_daily_digest: {
    title: 'Today’s sales',
    body_one: '{{count}} sale or booking today. See the details in your panel.',
    body_other: '{{count}} sales or bookings today. See the details in your panel.',
  },
  purchase_ticket_paid: {
    title: 'Purchase confirmed',
    body_one: 'Your ticket for {{event}} is in Tickets.',
    body_other: 'Your {{count}} tickets for {{event}} are in Tickets.',
  },
  purchase_booking_paid: {
    title: 'Booking confirmed',
    body: '{{offer}}, {{date}}. Your code appears on the day.',
  },
  purchase_expired: {
    title: 'Purchase not completed',
    body: 'Payment for {{offer}} didn’t arrive in time, so the spot was released. You can buy again.',
    bodyGeneric: 'Payment didn’t arrive in time, so the spot was released. You can buy again.',
  },
  ticket_reminder_day: {
    title: 'Your event is tomorrow',
    body: '{{event}}, {{date}}. Your ticket code appears from midnight.',
  },
  ticket_reminder_soon: {
    title: 'Starting soon',
    body: '{{event}} starts in less than 2 hours. Your ticket is in Tickets.',
  },
  booking_reminder_day: {
    title: 'Your booking is tomorrow',
    body: '{{offer}}, {{date}}. Your code appears from midnight.',
  },
  booking_reminder_soon: {
    title: 'Almost time',
    body: '{{offer}} starts in less than 2 hours. Your code is in Bookings.',
  },
  review_request: {
    title: 'How was it?',
    body: 'Tell us how {{offer}} went. Your review helps other travelers.',
    bodyGeneric: 'Tell us how it went. Your review helps other travelers.',
  },
  review_reply_received: {
    title: 'Someone replied to your review',
    body: '{{business}} replied to what you wrote.',
    bodyGeneric: 'The business replied to what you wrote.',
  },
  review_report_decided: {
    title: 'We reviewed your report',
    body: 'Thanks for letting us know. The review is complete.',
  },
  account_username_changed: {
    title: 'Your @ changed',
    body: 'You’re now {{username}}. If this wasn’t you, contact us.',
  },
  admin_message: {
    title: '{{title}}',
    body: '{{message}}',
  },
};
