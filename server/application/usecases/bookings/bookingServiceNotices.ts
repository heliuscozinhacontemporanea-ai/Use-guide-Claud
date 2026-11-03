import { createNotificationUseCase, type NotificationType } from '../../../domain/notifications';

// Avisos da prova do serviço (D20). O texto fica no app, no idioma de quem lê (D25); aqui só o tipo
// e o nome do estabelecimento. Ao cliente, antes de uma ação, nada de dinheiro; ao parceiro, a
// consequência fica, porque é o que o faz responder no prazo.
const NOTICE_TYPES = {
  providerArrived: 'booking_provider_arrived',
  noShowMarked: 'booking_no_show_marked',
  absenceReported: 'booking_absence_reported',
  absenceRefundedBuyer: 'booking_absence_refunded_buyer',
  absenceRefundedPartner: 'booking_absence_refunded_partner',
  absenceToAdmin: 'booking_absence_in_review',
  confirmationAsked: 'booking_confirmation_asked',
  confirmationDenied: 'booking_confirmation_denied',
  confirmationRefundedPartner: 'booking_confirmation_refunded_partner',
  confirmationExpiredPartner: 'booking_confirmation_expired_partner',
} as const satisfies Record<string, NotificationType>;

export type BookingServiceNotice = keyof typeof NOTICE_TYPES;

const PARTNER_NOTICES: ReadonlySet<BookingServiceNotice> = new Set([
  'absenceReported',
  'absenceRefundedPartner',
  'confirmationDenied',
  'confirmationRefundedPartner',
  'confirmationExpiredPartner',
]);

export function bookingServiceNoticeType(notice: BookingServiceNotice): NotificationType {
  return NOTICE_TYPES[notice];
}

/** Aviso não pode derrubar a operação que já foi gravada. */
export async function sendBookingServiceNotice(
  recipientUid: string,
  notice: BookingServiceNotice,
  businessName?: string
): Promise<void> {
  await createNotificationUseCase({
    recipientUid,
    type: NOTICE_TYPES[notice],
    params: businessName ? { business: businessName } : {},
    link: { screen: PARTNER_NOTICES.has(notice) ? 'partner' : 'bookings' },
  }).catch(() => undefined);
}
