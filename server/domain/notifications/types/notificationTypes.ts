/**
 * Catálogo de avisos (D25). O aviso é gravado como tipo + dados; o texto sai no idioma de quem lê
 * (AGENTS.md §12.5). O assunto define o ícone, para onde o toque leva e o que a pessoa pode desligar.
 */
export const NOTIFICATION_TYPES = {
  purchase_ticket_paid: 'purchases',
  purchase_booking_paid: 'purchases',
  purchase_expired: 'purchases',
  ticket_reminder_day: 'tickets',
  ticket_reminder_soon: 'tickets',
  booking_reminder_day: 'bookings',
  booking_reminder_soon: 'bookings',
  review_request: 'reviews',
  review_reply_received: 'reviews',
  review_report_decided: 'reviews',
  account_username_changed: 'account',
  ticket_received: 'tickets',
  ticket_returned: 'tickets',
  ticket_link_accepted: 'tickets',
  ticket_qr_replaced: 'tickets',
  event_canceled: 'tickets',
  event_postponed: 'tickets',
  booking_provider_arrived: 'bookings',
  booking_no_show_marked: 'bookings',
  booking_absence_in_review: 'bookings',
  booking_absence_refunded_buyer: 'purchases',
  booking_confirmation_asked: 'bookings',
  sale_ticket: 'sales',
  sale_booking: 'sales',
  sale_claim_opened: 'operations',
  booking_absence_reported: 'operations',
  booking_absence_refunded_partner: 'operations',
  booking_confirmation_denied: 'operations',
  booking_confirmation_refunded_partner: 'operations',
  booking_confirmation_expired_partner: 'operations',
  review_received: 'partnerReviews',
  review_updated: 'partnerReviews',
  plan_expiring: 'finance',
  plan_renewal_failed: 'finance',
  sale_daily_digest: 'sales',
  admin_message: 'messages',
} as const;

export type NotificationType = keyof typeof NOTIFICATION_TYPES;
export type NotificationCategory = (typeof NOTIFICATION_TYPES)[NotificationType] | 'news';

/** Dados que entram no texto traduzido. Nada de PII além do que a pessoa já vê no app. */
export type NotificationParams = Record<string, string | number>;

/** Para onde o toque leva. O app monta a rota; o servidor não conhece URLs. */
export interface NotificationLink {
  screen:
    | 'tickets'
    | 'bookings'
    | 'purchases'
    | 'reviews'
    | 'account'
    | 'partner'
    | 'item'
    | 'event';
  id?: string;
}

export interface NewNotification {
  recipientUid: string;
  type: NotificationType;
  params?: NotificationParams;
  link?: NotificationLink;
  /** Mesmo aviso não é gravado duas vezes (vira o id do documento). */
  dedupeKey?: string;
}

/** Escolhas da pessoa (D25, revisão). O resto chega sempre. */
export interface NotificationPreferences {
  reviewRequests: boolean;
  news: boolean;
  salesAlerts: 'each' | 'daily';
}

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  reviewRequests: true,
  news: false,
  salesAlerts: 'each',
};

/** Avisos somem da central depois de 90 dias (TTL do Firestore em `expiresAt`). */
export const NOTIFICATION_RETENTION_DAYS = 90;

/**
 * Tipos opcionais (D25, revisão): só saem com a escolha ligada e nunca das 21h às 9h (Fortaleza).
 * Novidades entram aqui quando existirem.
 */
export const OPTIONAL_TYPES: Partial<Record<NotificationType, 'reviewRequests' | 'news'>> = {
  review_request: 'reviewRequests',
};
