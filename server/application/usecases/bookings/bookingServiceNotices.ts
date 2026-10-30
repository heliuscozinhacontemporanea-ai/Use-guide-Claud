import { createNotificationUseCase } from '../../../domain/notifications';

// Avisos no app da prova do serviço (D20); e-mail fica para quando houver provedor. Sem PII no texto.
export const BOOKING_SERVICE_NOTICES = {
  providerArrived: {
    title: 'Seu prestador chegou',
    message: 'O prestador está te esperando no local combinado. Informe seu código pessoalmente.',
  },
  noShowMarked: {
    title: 'Ausência registrada',
    message:
      'O prestador registrou que você não compareceu. Se você estava lá, relate o problema em Compras.',
  },
  absenceReported: {
    title: 'Comprador diz que você não compareceu',
    message:
      'Responda em até 2 h nas reservas do painel. Sem resposta, o comprador recebe o reembolso integral e vale a multa de 20%.',
  },
  absenceRefundedBuyer: {
    title: 'Reembolso integral a caminho',
    message:
      'O prestador não compareceu. Você recebe o valor pago de volta, com a taxa de serviço.',
  },
  absenceRefundedPartner: {
    title: 'Reembolso feito ao comprador',
    message:
      'A ausência não foi contestada no prazo. O comprador foi reembolsado e a multa de 20% vale.',
  },
  absenceToAdmin: {
    title: 'Relato em análise',
    message: 'O prestador diz que esteve no local. Nossa equipe decide em até 5 dias.',
  },
  confirmationAsked: {
    title: 'O serviço aconteceu?',
    message:
      'Responda em Compras em até 72 h. Sem resposta, você recebe o reembolso integral do valor pago.',
  },
  confirmationDenied: {
    title: 'Reclamação em análise',
    message:
      'O comprador disse que o serviço não aconteceu. O repasse desta venda fica retido até a decisão, em até 5 dias.',
  },
  confirmationRefundedPartner: {
    title: 'Reembolso ao comprador',
    message: 'O serviço não teve check-in com código e o comprador disse que ele não aconteceu.',
  },
  confirmationExpiredPartner: {
    title: 'Reembolso ao comprador',
    message: 'O serviço não teve check-in com código e o comprador não confirmou em 72 h.',
  },
} as const;

export type BookingServiceNotice = keyof typeof BOOKING_SERVICE_NOTICES;

/** Aviso não pode derrubar a operação que já foi gravada. */
export async function sendBookingServiceNotice(
  recipientUid: string,
  notice: BookingServiceNotice
): Promise<void> {
  await createNotificationUseCase({
    recipientPartnerId: recipientUid,
    type: 'admin_message',
    ...BOOKING_SERVICE_NOTICES[notice],
  }).catch(() => undefined);
}
