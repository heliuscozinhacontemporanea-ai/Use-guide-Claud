import { createNotificationUseCase } from '../../../domain/notifications';

// Avisos no app da prova do serviço (D20); e-mail fica para quando houver provedor. Sem PII no texto.
// Ao cliente, antes de uma ação, nada de dinheiro: o resultado vem depois. Ao parceiro, a consequência
// fica, porque é o que o faz responder no prazo. `{business}` é o nome do estabelecimento.
export const BOOKING_SERVICE_NOTICES = {
  providerArrived: {
    title: '{business} chegou',
    message: 'Estão esperando você no local combinado. Informe seu código pessoalmente.',
  },
  noShowMarked: {
    title: 'Ausência registrada',
    message:
      '{business} registrou que você não compareceu. Se você estava lá, relate o problema em Compras.',
  },
  absenceReported: {
    title: 'O cliente diz que você não compareceu',
    message:
      'Responda em até 2 h nas reservas do painel. Sem resposta, o cliente recebe o reembolso integral e vale a multa de 20%.',
  },
  absenceRefundedBuyer: {
    title: 'Reembolso a caminho',
    message: 'Você recebe o valor pago de volta, com a taxa de serviço.',
  },
  absenceRefundedPartner: {
    title: 'Reembolso feito ao cliente',
    message:
      'A ausência não foi contestada no prazo. O cliente foi reembolsado e a multa de 20% vale.',
  },
  absenceToAdmin: {
    title: 'Relato em análise',
    message: '{business} diz que esteve no local. Nossa equipe decide em até 5 dias.',
  },
  confirmationAsked: {
    title: 'O serviço aconteceu?',
    message: 'Conte para a gente em Compras, em até 72 h.',
  },
  confirmationDenied: {
    title: 'Reclamação em análise',
    message:
      'O cliente disse que o serviço não aconteceu. O repasse desta venda fica retido até a decisão, em até 5 dias.',
  },
  confirmationRefundedPartner: {
    title: 'Reembolso ao cliente',
    message: 'O serviço não teve check-in com código e o cliente disse que ele não aconteceu.',
  },
  confirmationExpiredPartner: {
    title: 'Reembolso ao cliente',
    message: 'O serviço não teve check-in com código e o cliente não confirmou em 72 h.',
  },
} as const;

export type BookingServiceNotice = keyof typeof BOOKING_SERVICE_NOTICES;

const FALLBACK_BUSINESS = 'A equipe';

/** Aviso não pode derrubar a operação que já foi gravada. */
export async function sendBookingServiceNotice(
  recipientUid: string,
  notice: BookingServiceNotice,
  businessName?: string
): Promise<void> {
  const fill = (text: string) => text.replace('{business}', businessName || FALLBACK_BUSINESS);
  const { title, message } = BOOKING_SERVICE_NOTICES[notice];
  await createNotificationUseCase({
    recipientPartnerId: recipientUid,
    type: 'admin_message',
    title: fill(title),
    message: fill(message),
  }).catch(() => undefined);
}
