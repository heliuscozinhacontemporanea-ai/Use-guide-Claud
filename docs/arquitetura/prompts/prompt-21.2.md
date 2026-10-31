# Prompt 21.2 — Cheguei, ausência, prestador não veio, sem código e confirmação (backend)

> Lote 18, gerado dos commits de referência `c24a606..ff24a4f` da branch `claude/agents-md-v2`. Aplique na ordem do lote (A7, 21.1 a 21.7d), um por vez. Cole o bloco abaixo no agente do AI Studio, inteiro, de uma vez.

---

## Prompt 21.2 — Cheguei, ausência, prestador não veio, sem código e confirmação (backend)

Continua a D20 no backend.

~~~~text
Siga o AGENTS.md. O app ainda não foi liberado para usuários: nenhum código de compatibilidade ou transição (§2.2 item 8). As regras de negócio estão nas decisões D20 e D21 de docs/arquitetura/decisoes.md (aplicadas pelo prompt A7).

IMPORTANTE: aplique os diffs abaixo EXATAMENTE, inclusive os arquivos novos. Não reescreva os arquivos do seu jeito. Arquivo tocado sai sem avisos do lint e formatado (AGENTS.md §13). Não altere firebase.json, functions/, AGENTS.md, docs/ nem .env.

O QUE MUDA:
1) "Cheguei" com localização e aviso ao comprador; ausência (no-show) só 30 min depois do início.
2) "O prestador não veio" abre a reclamação e dá 2 h ao prestador: admitida ou sem resposta, reembolso integral e multa de 20%; check-in depois encerra o relato.
3) "Cliente sem código" e conclusão sem registro perguntam ao comprador "O serviço aconteceu?" por 72 h.
4) O job de conclusão de reservas aplica os prazos vencidos.

ARQUIVOS (crie, altere ou apague exatamente estes):
- server/application/usecases/bookings/answerProviderAbsenceApplicationUseCase.ts (criar)
- server/application/usecases/bookings/answerServiceConfirmationApplicationUseCase.ts (criar)
- server/application/usecases/bookings/bookingServiceNotices.ts (criar)
- server/application/usecases/bookings/bookingServiceProofApplicationUseCases.test.ts (criar)
- server/application/usecases/bookings/bookingServiceWindow.ts (criar)
- server/application/usecases/bookings/checkInBookingApplicationUseCase.ts (criar)
- server/application/usecases/bookings/checkInWithoutCodeApplicationUseCase.ts (criar)
- server/application/usecases/bookings/markBookingNoShowApplicationUseCase.ts (criar)
- server/application/usecases/bookings/recordProviderArrivalApplicationUseCase.ts (criar)
- server/application/usecases/bookings/reportProviderAbsentApplicationUseCase.ts (criar)
- server/application/usecases/bookings/runBookingCompletionJobApplicationUseCase.ts (criar)
- server/domain/bookings/adapters/firestoreBookingsAdapter.ts (alterar)
- server/domain/bookings/adapters/firestoreCheckInStore.ts (alterar)
- server/domain/bookings/adapters/inMemoryBookingsAdapter.ts (alterar)
- server/domain/bookings/errors/bookingDomainError.ts (alterar)
- server/domain/bookings/factory.ts (alterar)
- server/domain/bookings/index.ts (alterar)
- server/domain/bookings/ports/bookingsPort.ts (alterar)
- server/domain/bookings/services/bookingCheckInService.test.ts (alterar)
- server/domain/bookings/services/bookingCheckInService.ts (alterar)
- server/domain/bookings/services/bookingService.test.ts (alterar)
- server/domain/bookings/services/bookingService.ts (alterar)
- server/domain/bookings/services/bookingServiceProofService.test.ts (criar)
- server/domain/bookings/services/bookingServiceProofService.ts (criar)
- server/domain/bookings/types/bookingTypes.ts (alterar)
- server/domain/bookings/usecases/checkInWithoutCodeUseCase.ts (criar)
- server/domain/bookings/usecases/clearBookingDeadlineUseCase.ts (criar)
- server/domain/bookings/usecases/completeFinishedBookingsUseCase.ts (alterar)
- server/domain/bookings/usecases/getBookingForAbsenceReportUseCase.ts (criar)
- server/domain/bookings/usecases/getOpenProviderAbsenceUseCase.ts (criar)
- server/domain/bookings/usecases/getPendingServiceConfirmationUseCase.ts (criar)
- server/domain/bookings/usecases/listBookingsWithDueDeadlineUseCase.ts (criar)
- server/domain/bookings/usecases/recordProviderAbsenceUseCase.ts (criar)
- server/domain/bookings/usecases/recordProviderArrivalUseCase.ts (criar)
- server/domain/bookings/usecases/resolveProviderAbsenceUseCase.ts (criar)
- server/domain/bookings/usecases/resolveServiceConfirmationUseCase.ts (criar)
- server/domain/bookings/utils/checkInWindow.ts (alterar)
- server/domain/payment/services/saleClaimService.test.ts (alterar)
- server/domain/payment/services/saleClaimService.ts (alterar)
- server/interfaces/http/bookings/bookingResponses.ts (alterar)
- server/interfaces/http/bookings/bookingsController.test.ts (alterar)
- server/interfaces/http/bookings/bookingsController.ts (alterar)
- server/interfaces/http/bookings/bookingsRoutes.ts (alterar)
- server/interfaces/http/bookings/internalBookingsController.ts (alterar)
- server/interfaces/http/bookings/partnerOffersController.test.ts (alterar)
- server/interfaces/http/bookings/partnerOffersController.ts (alterar)
- server/interfaces/http/bookings/schemas/bookingSchemas.ts (alterar)

Aplique as mudanças abaixo EXATAMENTE como estão (formato unified diff: linhas com "-" saem, linhas com "+" entram; as demais são contexto para localizar o trecho). Não reformate outros trechos dos arquivos.

=== server/application/usecases/bookings/answerProviderAbsenceApplicationUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import {
  type Booking,
  type BookingActor,
  getOpenProviderAbsenceUseCase,
  resolveProviderAbsenceUseCase,
} from '../../../domain/bookings';
import { decideSaleClaimApplicationUseCase } from '../payouts/decideSaleClaimApplicationUseCase';
import { sendBookingServiceNotice } from './bookingServiceNotices';

export const SYSTEM_ACTOR = 'system';

/**
 * Reembolso integral e multa de 20% quando o prestador admite a falta ou não responde em 2 h (D20).
 * Reembolsa antes de gravar o desfecho: se o Stripe falhar, o relato continua aberto e o job tenta de novo.
 */
export async function refundProviderAbsence(
  booking: Booking,
  claimId: string,
  actorUid: string,
  answer?: 'admitted'
): Promise<Booking> {
  await decideSaleClaimApplicationUseCase(SYSTEM_ACTOR, claimId, {
    outcome: 'refund_full',
    chargePenalty: true,
  });
  const resolved = await resolveProviderAbsenceUseCase(
    booking.id,
    { resolution: 'refunded', ...(answer ? { answer } : {}) },
    actorUid
  );
  await sendBookingServiceNotice(booking.buyerId, 'absenceRefundedBuyer');
  await sendBookingServiceNotice(booking.sellerPartnerId, 'absenceRefundedPartner');
  return resolved;
}

/** Resposta do prestador ao "O prestador não veio": admite a falta ou diz que esteve lá (D20). */
export async function answerProviderAbsenceApplicationUseCase(
  actor: BookingActor,
  offerId: string,
  bookingId: string,
  answer: 'was_there' | 'admitted'
): Promise<Booking> {
  const booking = await getOpenProviderAbsenceUseCase(actor, offerId, bookingId);
  if (answer === 'admitted') {
    return refundProviderAbsence(booking, booking.providerAbsence.claimId, actor.uid, 'admitted');
  }
  // A reclamação continua aberta na fila do admin, que decide com o "Cheguei" e a conversa.
  const resolved = await resolveProviderAbsenceUseCase(
    booking.id,
    { answer, resolution: 'admin' },
    actor.uid
  );
  await sendBookingServiceNotice(booking.buyerId, 'absenceToAdmin');
  return resolved;
}

=== server/application/usecases/bookings/answerServiceConfirmationApplicationUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import {
  type Booking,
  type BookingActor,
  getPendingServiceConfirmationUseCase,
  resolveServiceConfirmationUseCase,
} from '../../../domain/bookings';
import { decideSaleClaimUseCase, openSaleClaimUseCase } from '../../../domain/payment';
import { SYSTEM_ACTOR } from './answerProviderAbsenceApplicationUseCase';
import { bookingServiceWindow } from './bookingServiceWindow';
import { sendBookingServiceNotice } from './bookingServiceNotices';

/**
 * Resposta do comprador a "O serviço aconteceu?" (D20). Sim vale como check-in confirmado. Não abre a
 * reclamação: sem nenhum registro do serviço, o reembolso é integral na hora; depois de "Cliente sem
 * código", o caso vai ao admin, que decide com o que o prestador registrou.
 */
export async function answerServiceConfirmationApplicationUseCase(
  actor: BookingActor,
  bookingId: string,
  answer: 'yes' | 'no'
): Promise<Booking> {
  const booking = await getPendingServiceConfirmationUseCase(actor, bookingId);
  if (answer === 'yes') {
    return resolveServiceConfirmationUseCase(
      booking.id,
      { answer, resolution: 'confirmed' },
      actor.uid
    );
  }
  const claim = await openSaleClaimUseCase({
    referenceType: 'booking',
    referenceId: booking.id,
    buyerUid: actor.uid,
    reason: 'did_not_happen',
    ...bookingServiceWindow(booking),
    // A pergunta dura 72 h e passa das 48 h da reclamação comum.
    allowAfterWindow: true,
  });
  if (booking.serviceConfirmation.reason === 'no_record') {
    await decideSaleClaimUseCase(claim.id, SYSTEM_ACTOR, { outcome: 'refund_full' });
    const refunded = await resolveServiceConfirmationUseCase(
      booking.id,
      { answer, claimId: claim.id, resolution: 'refunded' },
      actor.uid
    );
    await sendBookingServiceNotice(booking.buyerId, 'absenceRefundedBuyer');
    await sendBookingServiceNotice(booking.sellerPartnerId, 'confirmationRefundedPartner');
    return refunded;
  }
  const resolved = await resolveServiceConfirmationUseCase(
    booking.id,
    { answer, claimId: claim.id, resolution: 'admin' },
    actor.uid
  );
  await sendBookingServiceNotice(booking.sellerPartnerId, 'confirmationDenied');
  return resolved;
}

=== server/application/usecases/bookings/bookingServiceNotices.ts — ARQUIVO NOVO, conteúdo completo ===
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

=== server/application/usecases/bookings/bookingServiceProofApplicationUseCases.test.ts — ARQUIVO NOVO, conteúdo completo ===
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../../domain/bookings', () => ({
  checkInBookingByCodeUseCase: vi.fn(),
  clearBookingDeadlineUseCase: vi.fn(),
  completeFinishedBookingsUseCase: vi.fn(),
  getBookingForAbsenceReportUseCase: vi.fn(),
  getOpenProviderAbsenceUseCase: vi.fn(),
  getPendingServiceConfirmationUseCase: vi.fn(),
  listBookingsWithDueDeadlineUseCase: vi.fn(),
  recordProviderAbsenceUseCase: vi.fn(),
  resolveProviderAbsenceUseCase: vi.fn(),
  resolveServiceConfirmationUseCase: vi.fn(),
}));
vi.mock('../../../domain/payment', async () => {
  const { PaymentDomainError } = await import(
    '../../../domain/payment/services/stripePaymentService'
  );
  return { PaymentDomainError, decideSaleClaimUseCase: vi.fn(), openSaleClaimUseCase: vi.fn() };
});
vi.mock('../../../domain/notifications', () => ({
  createNotificationUseCase: vi.fn().mockResolvedValue(true),
}));
vi.mock('../payouts/decideSaleClaimApplicationUseCase', () => ({
  decideSaleClaimApplicationUseCase: vi.fn(),
}));

import {
  checkInBookingByCodeUseCase,
  completeFinishedBookingsUseCase,
  getBookingForAbsenceReportUseCase,
  getOpenProviderAbsenceUseCase,
  getPendingServiceConfirmationUseCase,
  listBookingsWithDueDeadlineUseCase,
  recordProviderAbsenceUseCase,
  resolveProviderAbsenceUseCase,
  resolveServiceConfirmationUseCase,
} from '../../../domain/bookings';
import { createNotificationUseCase } from '../../../domain/notifications';
import {
  decideSaleClaimUseCase,
  openSaleClaimUseCase,
  PaymentDomainError,
} from '../../../domain/payment';
import { decideSaleClaimApplicationUseCase } from '../payouts/decideSaleClaimApplicationUseCase';
import { answerProviderAbsenceApplicationUseCase } from './answerProviderAbsenceApplicationUseCase';
import { answerServiceConfirmationApplicationUseCase } from './answerServiceConfirmationApplicationUseCase';
import { checkInBookingApplicationUseCase } from './checkInBookingApplicationUseCase';
import { reportProviderAbsentApplicationUseCase } from './reportProviderAbsentApplicationUseCase';
import { runBookingCompletionJobApplicationUseCase } from './runBookingCompletionJobApplicationUseCase';

const BUYER = { uid: 'buyer-1', admin: false };
const PARTNER = { uid: 'partner-1', admin: false };
const BOOKING = {
  id: 'bk_1',
  buyerId: 'buyer-1',
  sellerPartnerId: 'partner-1',
  offerSnapshot: { startsAt: '2026-11-10T11:00:00.000Z', durationMinutes: 120 },
};
const ABSENCE = { reportedAt: 't', respondBy: 't2', claimId: 'claim_booking_bk_1' };

function notified(recipient: string, title: string) {
  return expect.objectContaining({ recipientPartnerId: recipient, title });
}

describe('prova do serviço na camada application (D20)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(resolveProviderAbsenceUseCase).mockResolvedValue(BOOKING as never);
    vi.mocked(resolveServiceConfirmationUseCase).mockResolvedValue(BOOKING as never);
  });

  it('"O prestador não veio" abre a reclamação, grava o relato e avisa o prestador', async () => {
    vi.mocked(getBookingForAbsenceReportUseCase).mockResolvedValue(BOOKING as never);
    vi.mocked(openSaleClaimUseCase).mockResolvedValue({ id: 'claim_booking_bk_1' } as never);
    vi.mocked(recordProviderAbsenceUseCase).mockResolvedValue(BOOKING as never);
    await reportProviderAbsentApplicationUseCase(BUYER, 'bk_1');
    expect(openSaleClaimUseCase).toHaveBeenCalledWith({
      referenceType: 'booking',
      referenceId: 'bk_1',
      buyerUid: 'buyer-1',
      reason: 'did_not_happen',
      serviceStartsAt: '2026-11-10T11:00:00.000Z',
      serviceEndsAt: '2026-11-10T13:00:00.000Z',
    });
    expect(recordProviderAbsenceUseCase).toHaveBeenCalledWith(BUYER, 'bk_1', 'claim_booking_bk_1');
    expect(createNotificationUseCase).toHaveBeenCalledWith(
      notified('partner-1', 'Comprador diz que você não compareceu')
    );
  });

  it('prestador admite: reembolso integral com multa antes de gravar o desfecho', async () => {
    vi.mocked(getOpenProviderAbsenceUseCase).mockResolvedValue({
      ...BOOKING,
      providerAbsence: ABSENCE,
    } as never);
    await answerProviderAbsenceApplicationUseCase(PARTNER, 'offer-1', 'bk_1', 'admitted');
    expect(decideSaleClaimApplicationUseCase).toHaveBeenCalledWith('system', 'claim_booking_bk_1', {
      outcome: 'refund_full',
      chargePenalty: true,
    });
    expect(resolveProviderAbsenceUseCase).toHaveBeenCalledWith(
      'bk_1',
      { resolution: 'refunded', answer: 'admitted' },
      'partner-1'
    );
    expect(createNotificationUseCase).toHaveBeenCalledWith(
      notified('buyer-1', 'Reembolso integral a caminho')
    );
  });

  it('se o reembolso falhar, o desfecho não é gravado (o job tenta de novo)', async () => {
    vi.mocked(getOpenProviderAbsenceUseCase).mockResolvedValue({
      ...BOOKING,
      providerAbsence: ABSENCE,
    } as never);
    vi.mocked(decideSaleClaimApplicationUseCase).mockRejectedValueOnce(new Error('stripe'));
    await expect(
      answerProviderAbsenceApplicationUseCase(PARTNER, 'offer-1', 'bk_1', 'admitted')
    ).rejects.toThrow('stripe');
    expect(resolveProviderAbsenceUseCase).not.toHaveBeenCalled();
  });

  it('prestador diz que foi: a reclamação fica com o admin, sem reembolso', async () => {
    vi.mocked(getOpenProviderAbsenceUseCase).mockResolvedValue({
      ...BOOKING,
      providerAbsence: ABSENCE,
    } as never);
    await answerProviderAbsenceApplicationUseCase(PARTNER, 'offer-1', 'bk_1', 'was_there');
    expect(decideSaleClaimApplicationUseCase).not.toHaveBeenCalled();
    expect(resolveProviderAbsenceUseCase).toHaveBeenCalledWith(
      'bk_1',
      { answer: 'was_there', resolution: 'admin' },
      'partner-1'
    );
  });

  it('check-in depois do relato encerra a reclamação sem reembolso', async () => {
    vi.mocked(checkInBookingByCodeUseCase).mockResolvedValue({
      ...BOOKING,
      providerAbsence: ABSENCE,
    } as never);
    await checkInBookingApplicationUseCase(PARTNER, {
      offerId: 'offer-1',
      slotId: 'slot-1',
      code: 'K7M4QX',
      participantsPresent: 2,
    });
    expect(decideSaleClaimUseCase).toHaveBeenCalledWith('claim_booking_bk_1', 'system', {
      outcome: 'release',
    });
    expect(resolveProviderAbsenceUseCase).toHaveBeenCalledWith(
      'bk_1',
      { resolution: 'withdrawn' },
      'partner-1'
    );
  });

  it('comprador responde sim: confirmado, sem reclamação', async () => {
    vi.mocked(getPendingServiceConfirmationUseCase).mockResolvedValue(BOOKING as never);
    await answerServiceConfirmationApplicationUseCase(BUYER, 'bk_1', 'yes');
    expect(openSaleClaimUseCase).not.toHaveBeenCalled();
    expect(resolveServiceConfirmationUseCase).toHaveBeenCalledWith(
      'bk_1',
      { answer: 'yes', resolution: 'confirmed' },
      'buyer-1'
    );
  });

  it('comprador responde não depois de "Cliente sem código": reclamação vai ao admin', async () => {
    vi.mocked(getPendingServiceConfirmationUseCase).mockResolvedValue({
      ...BOOKING,
      serviceConfirmation: { askedAt: 't', answerBy: 't2', reason: 'no_code' },
    } as never);
    vi.mocked(openSaleClaimUseCase).mockResolvedValue({ id: 'claim_booking_bk_1' } as never);
    await answerServiceConfirmationApplicationUseCase(BUYER, 'bk_1', 'no');
    expect(openSaleClaimUseCase).toHaveBeenCalledWith(
      expect.objectContaining({ reason: 'did_not_happen', allowAfterWindow: true })
    );
    expect(resolveServiceConfirmationUseCase).toHaveBeenCalledWith(
      'bk_1',
      { answer: 'no', claimId: 'claim_booking_bk_1', resolution: 'admin' },
      'buyer-1'
    );
    expect(decideSaleClaimUseCase).not.toHaveBeenCalled();
  });

  it('comprador responde não sem nenhum registro do serviço: reembolso integral na hora', async () => {
    vi.mocked(getPendingServiceConfirmationUseCase).mockResolvedValue({
      ...BOOKING,
      serviceConfirmation: { askedAt: 't', answerBy: 't2', reason: 'no_record' },
    } as never);
    vi.mocked(openSaleClaimUseCase).mockResolvedValue({ id: 'claim_booking_bk_1' } as never);
    await answerServiceConfirmationApplicationUseCase(BUYER, 'bk_1', 'no');
    expect(decideSaleClaimUseCase).toHaveBeenCalledWith('claim_booking_bk_1', 'system', {
      outcome: 'refund_full',
    });
    expect(resolveServiceConfirmationUseCase).toHaveBeenCalledWith(
      'bk_1',
      { answer: 'no', claimId: 'claim_booking_bk_1', resolution: 'refunded' },
      'buyer-1'
    );
  });

  it('job: pergunta aos compradores, reembolsa ausência sem resposta e confirmação vencida', async () => {
    vi.mocked(completeFinishedBookingsUseCase).mockResolvedValue({
      completed: 2,
      askedToConfirm: [BOOKING as never],
    });
    vi.mocked(listBookingsWithDueDeadlineUseCase).mockResolvedValue([
      {
        ...BOOKING,
        id: 'bk_absence',
        providerAbsence: { ...ABSENCE, claimId: 'claim_absence' },
        deadline: { kind: 'provider_absence_response', at: 't2' },
      },
      {
        ...BOOKING,
        id: 'bk_unconfirmed',
        serviceConfirmation: { askedAt: 't', answerBy: 't2', reason: 'no_record' },
        deadline: { kind: 'service_confirmation', at: 't2' },
      },
    ] as never);
    vi.mocked(openSaleClaimUseCase).mockResolvedValue({ id: 'claim_unconfirmed' } as never);
    const result = await runBookingCompletionJobApplicationUseCase(200);
    expect(result).toEqual({ completed: 2, askedToConfirm: 1, deadlinesProcessed: 2 });
    expect(createNotificationUseCase).toHaveBeenCalledWith(
      notified('buyer-1', 'O serviço aconteceu?')
    );
    expect(decideSaleClaimApplicationUseCase).toHaveBeenCalledWith('system', 'claim_absence', {
      outcome: 'refund_full',
      chargePenalty: true,
    });
    // Confirmação vencida: reembolso integral sem multa (o prestador pode só ter esquecido o código).
    expect(decideSaleClaimUseCase).toHaveBeenCalledWith('claim_unconfirmed', 'system', {
      outcome: 'refund_full',
    });
    expect(resolveServiceConfirmationUseCase).toHaveBeenCalledWith(
      'bk_unconfirmed',
      { claimId: 'claim_unconfirmed', resolution: 'refunded' },
      'system'
    );
  });

  it('job: reclamação já aberta leva a confirmação vencida ao admin, e um erro não trava as demais', async () => {
    vi.mocked(completeFinishedBookingsUseCase).mockResolvedValue({
      completed: 0,
      askedToConfirm: [],
    });
    vi.mocked(listBookingsWithDueDeadlineUseCase).mockResolvedValue([
      {
        ...BOOKING,
        id: 'bk_error',
        providerAbsence: { ...ABSENCE, claimId: 'claim_error' },
        deadline: { kind: 'provider_absence_response', at: 't2' },
      },
      {
        ...BOOKING,
        id: 'bk_claimed',
        serviceConfirmation: { askedAt: 't', answerBy: 't2', reason: 'no_code' },
        deadline: { kind: 'service_confirmation', at: 't2' },
      },
    ] as never);
    vi.mocked(decideSaleClaimApplicationUseCase).mockRejectedValueOnce(new Error('stripe'));
    vi.mocked(openSaleClaimUseCase).mockRejectedValueOnce(
      new PaymentDomainError('CLAIM_ALREADY_EXISTS', 'Já existe.', 409)
    );
    const errors = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const result = await runBookingCompletionJobApplicationUseCase(200);
    expect(result.deadlinesProcessed).toBe(1);
    expect(resolveServiceConfirmationUseCase).toHaveBeenCalledWith(
      'bk_claimed',
      { resolution: 'admin' },
      'system'
    );
    expect(errors).toHaveBeenCalledWith(
      '[bookings.completionJob] prazo não processado',
      expect.objectContaining({ bookingId: 'bk_error' })
    );
    errors.mockRestore();
  });
});

=== server/application/usecases/bookings/bookingServiceWindow.ts — ARQUIVO NOVO, conteúdo completo ===
import type { Booking } from '../../../domain/bookings';

/** Início e fim do serviço da reserva, para abrir a reclamação no domínio de pagamento. */
export function bookingServiceWindow(booking: Booking): {
  serviceStartsAt: string;
  serviceEndsAt: string;
} {
  const { startsAt, durationMinutes } = booking.offerSnapshot;
  return {
    serviceStartsAt: startsAt,
    serviceEndsAt: new Date(
      new Date(startsAt).getTime() + (durationMinutes ?? 0) * 60_000
    ).toISOString(),
  };
}

=== server/application/usecases/bookings/checkInBookingApplicationUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import {
  type Booking,
  type BookingActor,
  type CheckInByCodeInput,
  checkInBookingByCodeUseCase,
  resolveProviderAbsenceUseCase,
} from '../../../domain/bookings';
import { decideSaleClaimUseCase } from '../../../domain/payment';
import { SYSTEM_ACTOR } from './answerProviderAbsenceApplicationUseCase';

/**
 * Check-in com o código (D20). Se o comprador já tinha relatado "O prestador não veio", o check-in
 * prova que o prestador chegou: a reclamação é encerrada sem reembolso e o serviço segue normal.
 */
export async function checkInBookingApplicationUseCase(
  actor: BookingActor,
  input: CheckInByCodeInput
): Promise<Booking> {
  const booking = await checkInBookingByCodeUseCase(actor, input);
  const absence = booking.providerAbsence;
  if (absence && !absence.resolution) {
    await decideSaleClaimUseCase(absence.claimId, SYSTEM_ACTOR, { outcome: 'release' });
    return resolveProviderAbsenceUseCase(booking.id, { resolution: 'withdrawn' }, actor.uid);
  }
  return booking;
}

=== server/application/usecases/bookings/checkInWithoutCodeApplicationUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import {
  type Booking,
  type BookingActor,
  type CheckInWithoutCodeInput,
  checkInWithoutCodeUseCase,
} from '../../../domain/bookings';
import { sendBookingServiceNotice } from './bookingServiceNotices';

/** "Cliente sem código" e a pergunta "O serviço aconteceu?" ao comprador (D20). */
export async function checkInWithoutCodeApplicationUseCase(
  actor: BookingActor,
  input: CheckInWithoutCodeInput
): Promise<Booking> {
  const booking = await checkInWithoutCodeUseCase(actor, input);
  await sendBookingServiceNotice(booking.buyerId, 'confirmationAsked');
  return booking;
}

=== server/application/usecases/bookings/markBookingNoShowApplicationUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import {
  type Booking,
  type BookingActor,
  markBookingNoShowUseCase,
} from '../../../domain/bookings';
import { sendBookingServiceNotice } from './bookingServiceNotices';

/** "Cliente não apareceu" e aviso ao comprador, que pode contestar pela reclamação (D16, D20). */
export async function markBookingNoShowApplicationUseCase(
  actor: BookingActor,
  bookingId: string
): Promise<Booking> {
  const booking = await markBookingNoShowUseCase(actor, bookingId);
  await sendBookingServiceNotice(booking.buyerId, 'noShowMarked');
  return booking;
}

=== server/application/usecases/bookings/recordProviderArrivalApplicationUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import {
  type Booking,
  type BookingActor,
  type BookingArrival,
  recordProviderArrivalUseCase,
} from '../../../domain/bookings';
import { sendBookingServiceNotice } from './bookingServiceNotices';

/**
 * "Cheguei" do prestador e aviso ao comprador (D20). Tocar de novo não muda a hora gravada, mas avisa o
 * comprador outra vez: serve de "ainda estou esperando".
 */
export async function recordProviderArrivalApplicationUseCase(
  actor: BookingActor,
  offerId: string,
  bookingId: string,
  location?: BookingArrival['location']
): Promise<Booking> {
  const booking = await recordProviderArrivalUseCase(actor, offerId, bookingId, location);
  await sendBookingServiceNotice(booking.buyerId, 'providerArrived');
  return booking;
}

=== server/application/usecases/bookings/reportProviderAbsentApplicationUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import {
  type Booking,
  type BookingActor,
  getBookingForAbsenceReportUseCase,
  recordProviderAbsenceUseCase,
} from '../../../domain/bookings';
import { openSaleClaimUseCase } from '../../../domain/payment';
import { bookingServiceWindow } from './bookingServiceWindow';
import { sendBookingServiceNotice } from './bookingServiceNotices';

/**
 * "O prestador não veio" (D20): abre a reclamação, que retém o repasse, e dá 2 h ao prestador para
 * responder. Sem resposta, o job reembolsa o comprador e cobra a multa.
 */
export async function reportProviderAbsentApplicationUseCase(
  actor: BookingActor,
  bookingId: string
): Promise<Booking> {
  const booking = await getBookingForAbsenceReportUseCase(actor, bookingId);
  const claim = await openSaleClaimUseCase({
    referenceType: 'booking',
    referenceId: booking.id,
    buyerUid: actor.uid,
    reason: 'did_not_happen',
    ...bookingServiceWindow(booking),
  });
  const recorded = await recordProviderAbsenceUseCase(actor, booking.id, claim.id);
  await sendBookingServiceNotice(recorded.sellerPartnerId, 'absenceReported');
  return recorded;
}

=== server/application/usecases/bookings/runBookingCompletionJobApplicationUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import {
  type Booking,
  clearBookingDeadlineUseCase,
  completeFinishedBookingsUseCase,
  listBookingsWithDueDeadlineUseCase,
  resolveServiceConfirmationUseCase,
} from '../../../domain/bookings';
import {
  decideSaleClaimUseCase,
  openSaleClaimUseCase,
  PaymentDomainError,
} from '../../../domain/payment';
import { refundProviderAbsence, SYSTEM_ACTOR } from './answerProviderAbsenceApplicationUseCase';
import { bookingServiceWindow } from './bookingServiceWindow';
import { sendBookingServiceNotice } from './bookingServiceNotices';

export interface BookingCompletionJobResult {
  completed: number;
  askedToConfirm: number;
  deadlinesProcessed: number;
}

/** 72 h sem resposta a "O serviço aconteceu?": reembolso integral ao comprador (D20). */
async function refundUnconfirmedService(booking: Booking): Promise<void> {
  let claimId: string;
  try {
    const claim = await openSaleClaimUseCase({
      referenceType: 'booking',
      referenceId: booking.id,
      buyerUid: booking.buyerId,
      reason: 'did_not_happen',
      ...bookingServiceWindow(booking),
      allowAfterWindow: true,
    });
    claimId = claim.id;
  } catch (error) {
    // Já existe reclamação desta venda: o admin decide por ela, sem reembolso automático.
    if (error instanceof PaymentDomainError && error.code === 'CLAIM_ALREADY_EXISTS') {
      await resolveServiceConfirmationUseCase(booking.id, { resolution: 'admin' }, SYSTEM_ACTOR);
      return;
    }
    throw error;
  }
  await decideSaleClaimUseCase(claimId, SYSTEM_ACTOR, { outcome: 'refund_full' });
  await resolveServiceConfirmationUseCase(
    booking.id,
    { claimId, resolution: 'refunded' },
    SYSTEM_ACTOR
  );
  await sendBookingServiceNotice(booking.buyerId, 'absenceRefundedBuyer');
  await sendBookingServiceNotice(booking.sellerPartnerId, 'confirmationExpiredPartner');
}

async function processDeadline(booking: Booking): Promise<void> {
  const absence = booking.providerAbsence;
  if (booking.deadline?.kind === 'provider_absence_response' && absence && !absence.resolution) {
    await refundProviderAbsence(booking, absence.claimId, SYSTEM_ACTOR);
    return;
  }
  const confirmation = booking.serviceConfirmation;
  if (
    booking.deadline?.kind === 'service_confirmation' &&
    confirmation &&
    !confirmation.resolution
  ) {
    await refundUnconfirmedService(booking);
    return;
  }
  await clearBookingDeadlineUseCase(booking.id, SYSTEM_ACTOR);
}

/**
 * Job de conclusão das reservas (D20): conclui as que terminaram, pergunta ao comprador quando falta a
 * prova do serviço e aplica os prazos vencidos. Uma reserva com erro não trava as demais.
 */
export async function runBookingCompletionJobApplicationUseCase(
  limit = 200
): Promise<BookingCompletionJobResult> {
  const { completed, askedToConfirm } = await completeFinishedBookingsUseCase(limit);
  for (const booking of askedToConfirm) {
    await sendBookingServiceNotice(booking.buyerId, 'confirmationAsked');
  }
  let deadlinesProcessed = 0;
  for (const booking of await listBookingsWithDueDeadlineUseCase(limit)) {
    try {
      await processDeadline(booking);
      deadlinesProcessed += 1;
    } catch (error) {
      console.error('[bookings.completionJob] prazo não processado', {
        bookingId: booking.id,
        message: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    }
  }
  return { completed, askedToConfirm: askedToConfirm.length, deadlinesProcessed };
}

=== server/domain/bookings/adapters/firestoreBookingsAdapter.ts — diff ===
@@ -110,6 +110,10 @@ export class FirestoreBookingsAdapter implements BookingsPort {
   readonly recordCheckIn = this.checkIns.recordCheckIn.bind(this.checkIns);
   readonly countCheckInFailures = this.checkIns.countCheckInFailures.bind(this.checkIns);
   readonly addCheckInFailure = this.checkIns.addCheckInFailure.bind(this.checkIns);
+  readonly updateBooking = this.checkIns.updateBooking.bind(this.checkIns);
+  readonly listBookingsWithDeadlineBefore = this.checkIns.listBookingsWithDeadlineBefore.bind(
+    this.checkIns
+  );
 
   async reserveCapacityAndCreateBooking(
     booking: Booking,

=== server/domain/bookings/adapters/firestoreCheckInStore.ts — diff ===
@@ -10,7 +10,7 @@ import {
   writeAudit,
 } from './firestoreBookingsShared';
 
-/** Check-in das reservas e contagem de códigos errados por horário (D20). */
+/** Check-in, prazos e demais registros da prova do serviço nas reservas (D20). */
 export class FirestoreCheckInStore {
   async recordCheckIn(bookingId: string, checkIn: BookingCheckIn): Promise<Booking> {
     return adminDb.runTransaction(async (tx) => {
@@ -49,4 +49,39 @@ export class FirestoreCheckInStore {
     // Só o horário, quem digitou e quando: nunca o código digitado (AGENTS.md §10.3).
     await adminDb.collection(CHECK_IN_FAILURES).add({ slotId, actorUid, at: atIso });
   }
+
+  async updateBooking(
+    bookingId: string,
+    change: (current: Booking) => Booking | null,
+    audit: { actorUid: string; reason: string }
+  ): Promise<Booking> {
+    return adminDb.runTransaction(async (tx) => {
+      const booking = await readBooking(tx, bookingId);
+      const updated = change(booking);
+      if (!updated) return booking;
+      const saved: Booking = { ...updated, updatedAt: nowIso() };
+      tx.set(
+        adminDb.collection(BOOKINGS).doc(bookingId),
+        BookingPersistenceMapper.toPersistence(saved)
+      );
+      writeAudit(tx, {
+        bookingId,
+        from: booking.status,
+        to: saved.status,
+        actorUid: audit.actorUid,
+        reason: audit.reason,
+      });
+      return saved;
+    });
+  }
+
+  async listBookingsWithDeadlineBefore(nowIsoValue: string, limit: number): Promise<Booking[]> {
+    const snapshot = await adminDb
+      .collection(BOOKINGS)
+      .where('deadline.at', '<=', nowIsoValue)
+      .orderBy('deadline.at', 'asc')
+      .limit(limit)
+      .get();
+    return snapshot.docs.map((doc) => BookingPersistenceMapper.toDomain(doc.id, doc.data()));
+  }
 }

=== server/domain/bookings/adapters/inMemoryBookingsAdapter.ts — diff ===
@@ -210,6 +210,25 @@ export class InMemoryBookingsAdapter implements BookingsPort {
     this.audit.push({ bookingId, reason: 'checked_in' });
     return updated;
   }
+  async updateBooking(
+    bookingId: string,
+    change: (current: Booking) => Booking | null,
+    audit: { actorUid: string; reason: string }
+  ) {
+    const booking = this.bookings.get(bookingId);
+    if (!booking) throw new BookingDomainError('NOT_FOUND', 'Reserva não encontrada.');
+    const updated = change(booking);
+    if (!updated) return booking;
+    this.bookings.set(bookingId, updated);
+    this.audit.push({ bookingId, reason: audit.reason });
+    return updated;
+  }
+  async listBookingsWithDeadlineBefore(nowIso: string, limit: number) {
+    return [...this.bookings.values()]
+      .filter((b) => b.deadline && b.deadline.at <= nowIso)
+      .sort((a, b) => (a.deadline?.at ?? '').localeCompare(b.deadline?.at ?? ''))
+      .slice(0, limit);
+  }
   async countCheckInFailures(slotId: string, sinceIso: string) {
     return this.checkInFailures.filter((f) => f.slotId === slotId && f.at >= sinceIso).length;
   }

=== server/domain/bookings/errors/bookingDomainError.ts — diff ===
@@ -16,7 +16,10 @@ export type BookingErrorCode =
   | 'CHECK_IN_NOT_APPLICABLE'
   | 'CHECK_IN_WINDOW_CLOSED'
   | 'INVALID_CHECK_IN_CODE'
-  | 'CHECK_IN_LOCKED';
+  | 'CHECK_IN_LOCKED'
+  | 'NO_SHOW_TOO_EARLY'
+  | 'ABSENCE_REPORT_NOT_ALLOWED'
+  | 'NOTHING_TO_ANSWER';
 
 const STATUS_BY_CODE: Record<BookingErrorCode, number> = {
   VALIDATION_ERROR: 400,
@@ -37,6 +40,9 @@ const STATUS_BY_CODE: Record<BookingErrorCode, number> = {
   CHECK_IN_WINDOW_CLOSED: 422,
   INVALID_CHECK_IN_CODE: 422,
   CHECK_IN_LOCKED: 429,
+  NO_SHOW_TOO_EARLY: 422,
+  ABSENCE_REPORT_NOT_ALLOWED: 422,
+  NOTHING_TO_ANSWER: 409,
 };
 
 export class BookingDomainError extends Error {

=== server/domain/bookings/factory.ts — diff ===
@@ -2,11 +2,13 @@ import { FirestoreBookingsAdapter } from './adapters/firestoreBookingsAdapter';
 import { GuideBookableItemLookupAdapter } from './adapters/guideBookableItemLookupAdapter';
 import { BookingCheckInService } from './services/bookingCheckInService';
 import { BookingService } from './services/bookingService';
+import { BookingServiceProofService } from './services/bookingServiceProofService';
 import { OfferService } from './services/offerService';
 
 let offerService: OfferService | null = null;
 let bookingService: BookingService | null = null;
 let checkInService: BookingCheckInService | null = null;
+let serviceProofService: BookingServiceProofService | null = null;
 let port: FirestoreBookingsAdapter | null = null;
 
 function getPort(): FirestoreBookingsAdapter {
@@ -28,3 +30,8 @@ export function getBookingCheckInService(): BookingCheckInService {
   checkInService ??= new BookingCheckInService(getPort());
   return checkInService;
 }
+
+export function getBookingServiceProofService(): BookingServiceProofService {
+  serviceProofService ??= new BookingServiceProofService(getPort());
+  return serviceProofService;
+}

=== server/domain/bookings/index.ts — diff ===
@@ -2,6 +2,8 @@ export { cancelBookingForCanceledSlotUseCase } from './usecases/cancelBookingFor
 export { cancelPendingBookingUseCase } from './usecases/cancelPendingBookingUseCase';
 export { cancelSlotByPartnerUseCase } from './usecases/cancelSlotByPartnerUseCase';
 export { checkInBookingByCodeUseCase } from './usecases/checkInBookingByCodeUseCase';
+export { checkInWithoutCodeUseCase } from './usecases/checkInWithoutCodeUseCase';
+export { clearBookingDeadlineUseCase } from './usecases/clearBookingDeadlineUseCase';
 export { completeFinishedBookingsUseCase } from './usecases/completeFinishedBookingsUseCase';
 export { confirmBookingPaymentUseCase } from './usecases/confirmBookingPaymentUseCase';
 export { createAvailabilitySlotsUseCase } from './usecases/createAvailabilitySlotsUseCase';
@@ -9,11 +11,15 @@ export { createBookableOfferUseCase } from './usecases/createBookableOfferUseCas
 export { createPendingBookingUseCase } from './usecases/createPendingBookingUseCase';
 export { expireOverdueBookingsUseCase } from './usecases/expireOverdueBookingsUseCase';
 export { getBookingCheckInCodeUseCase } from './usecases/getBookingCheckInCodeUseCase';
+export { getBookingForAbsenceReportUseCase } from './usecases/getBookingForAbsenceReportUseCase';
 export { getBookingForActorUseCase } from './usecases/getBookingForActorUseCase';
 export { getBookingUseCase } from './usecases/getBookingUseCase';
+export { getOpenProviderAbsenceUseCase } from './usecases/getOpenProviderAbsenceUseCase';
+export { getPendingServiceConfirmationUseCase } from './usecases/getPendingServiceConfirmationUseCase';
 export { getPublicOfferSummaryUseCase } from './usecases/getPublicOfferSummaryUseCase';
 export { hasCheckedInBookingUseCase } from './usecases/hasCheckedInBookingUseCase';
 export { listAvailableSlotsUseCase } from './usecases/listAvailableSlotsUseCase';
+export { listBookingsWithDueDeadlineUseCase } from './usecases/listBookingsWithDueDeadlineUseCase';
 export { listMyBookingsUseCase } from './usecases/listMyBookingsUseCase';
 export { listOfferBookingsForPartnerUseCase } from './usecases/listOfferBookingsForPartnerUseCase';
 export { listOfferSlotsForPartnerUseCase } from './usecases/listOfferSlotsForPartnerUseCase';
@@ -22,14 +28,18 @@ export { markBookingDisputedUseCase } from './usecases/markBookingDisputedUseCas
 export { markBookingNoShowUseCase } from './usecases/markBookingNoShowUseCase';
 export { markBookingPaymentFailedUseCase } from './usecases/markBookingPaymentFailedUseCase';
 export { markBookingRefundedUseCase } from './usecases/markBookingRefundedUseCase';
-export { rescheduleSlotByPartnerUseCase } from './usecases/rescheduleSlotByPartnerUseCase';
+export { recordProviderAbsenceUseCase } from './usecases/recordProviderAbsenceUseCase';
+export { recordProviderArrivalUseCase } from './usecases/recordProviderArrivalUseCase';
 export { requestCancellationByBuyerUseCase } from './usecases/requestCancellationByBuyerUseCase';
+export { rescheduleSlotByPartnerUseCase } from './usecases/rescheduleSlotByPartnerUseCase';
+export { resolveProviderAbsenceUseCase } from './usecases/resolveProviderAbsenceUseCase';
+export { resolveServiceConfirmationUseCase } from './usecases/resolveServiceConfirmationUseCase';
 export { setBookableOfferStatusUseCase } from './usecases/setBookableOfferStatusUseCase';
 export { updateBookableOfferUseCase } from './usecases/updateBookableOfferUseCase';
-
 export { BookingDomainError, type BookingErrorCode } from './errors/bookingDomainError';
 export type { PageRequest } from './ports/bookingsPort';
 export type { CheckInByCodeInput, CheckInCodeView } from './services/bookingCheckInService';
+export type { CheckInWithoutCodeInput } from './services/bookingServiceProofService';
 export type {
   BookingDetails,
   BuyerCancellationResult,
@@ -43,11 +53,16 @@ export {
   type BookableOfferStatus,
   type Booking,
   type BookingActor,
+  type BookingArrival,
   type BookingCheckIn,
+  type BookingProviderAbsence,
+  type BookingServiceConfirmation,
   type BookingParticipant,
   type BookingStatus,
   canTransitionBooking,
   type LocalizedText,
+  NO_CODE_REASONS,
+  type NoCodeReason,
   type Page,
   type PublicSlot,
 } from './types/bookingTypes';

=== server/domain/bookings/ports/bookingsPort.ts — diff ===
@@ -76,6 +76,18 @@ export interface BookingsPort {
   countCheckInFailures(slotId: string, sinceIso: string): Promise<number>;
   addCheckInFailure(slotId: string, actorUid: string, atIso: string): Promise<void>;
 
+  /**
+   * Muda a reserva numa transação: `change` recebe o estado atual e devolve o novo, ou null para não
+   * gravar nada (idempotência); pode lançar para recusar. Grava auditoria com `reason`.
+   */
+  updateBooking(
+    bookingId: string,
+    change: (current: Booking) => Booking | null,
+    audit: { actorUid: string; reason: string }
+  ): Promise<Booking>;
+  /** Reservas com prazo (`deadline.at`) vencido até `nowIso`, do mais antigo para o mais novo. */
+  listBookingsWithDeadlineBefore(nowIso: string, limit: number): Promise<Booking[]>;
+
   getBooking(bookingId: string): Promise<Booking | null>;
   getParticipants(bookingId: string): Promise<BookingParticipant[]>;
   listBookingsByBuyer(buyerId: string, page: PageRequest): Promise<Page<Booking>>;

=== server/domain/bookings/services/bookingCheckInService.test.ts — diff ===
@@ -259,4 +259,22 @@ describe('BookingCheckInService (D20)', () => {
     await service.checkInByCode(PARTNER, checkIn(deriveCheckInCode('booking-1')));
     expect(await service.hasCheckIn('booking-1')).toBe(true);
   });
+
+  it('reserva reembolsada porque o prestador não veio não aceita mais o código', async () => {
+    const { service, port } = setup();
+    port.bookings.set(
+      'booking-1',
+      booking('booking-1', {
+        providerAbsence: {
+          reportedAt: '2026-11-10T11:31:00.000Z',
+          respondBy: '2026-11-10T13:31:00.000Z',
+          claimId: 'claim_1',
+          resolution: 'refunded',
+        },
+      })
+    );
+    await expect(
+      service.checkInByCode(PARTNER, checkIn(deriveCheckInCode('booking-1')))
+    ).rejects.toMatchObject({ code: 'INVALID_CHECK_IN_CODE' });
+  });
 });

=== server/domain/bookings/services/bookingCheckInService.ts — diff ===
@@ -113,7 +113,10 @@ export class BookingCheckInService {
     const code = normalizeCheckInCode(input.code);
     const bookings = code
       ? (await this.port.listBookingsBySlot(slot.id)).filter(
-          (booking) => booking.status === 'confirmed' || booking.status === 'completed'
+          (booking) =>
+            (booking.status === 'confirmed' || booking.status === 'completed') &&
+            // Já reembolsada porque o prestador não veio (D20): o código não vale mais.
+            booking.providerAbsence?.resolution !== 'refunded'
         )
       : [];
     const match = code

=== server/domain/bookings/services/bookingService.test.ts — diff ===
@@ -232,10 +232,17 @@ describe('BookingService', () => {
       code: 'INVALID_TRANSITION',
     });
     setNow('2026-11-10T12:00:00.000Z');
-    await expect(service.completeFinishedBookings()).resolves.toBe(0);
+    await expect(service.completeFinishedBookings()).resolves.toMatchObject({ completed: 0 });
     setNow('2026-11-10T13:00:00.000Z');
-    await expect(service.completeFinishedBookings()).resolves.toBe(1);
+    const result = await service.completeFinishedBookings();
+    expect(result.completed).toBe(1);
     expect(port.bookings.get(booking.id)?.status).toBe('completed');
+    // Sem check-in nem outro registro: pergunta "O serviço aconteceu?" por 72 h (D20).
+    expect(result.askedToConfirm.map((b) => b.id)).toEqual([booking.id]);
+    expect(port.bookings.get(booking.id)).toMatchObject({
+      serviceConfirmation: { reason: 'no_record', answerBy: '2026-11-13T13:00:00.000Z' },
+      deadline: { kind: 'service_confirmation', at: '2026-11-13T13:00:00.000Z' },
+    });
   });
 
   it('reserva com check-in não pode ser marcada como ausência (D20)', async () => {
@@ -276,4 +283,47 @@ describe('BookingService', () => {
     );
     expect(booking.pickupAddress).toBeUndefined();
   });
+
+  it('ausência só 30 min depois do "Cheguei" (D20)', async () => {
+    const { service, port, setNow } = setup();
+    const booking = await service.createPendingBooking(BUYER, INPUT, FEES);
+    await service.confirmBookingPayment(booking.id, 'pi_1');
+    const partner = { uid: 'partner-1', admin: false };
+    setNow('2026-11-10T11:10:00.000Z');
+    await expect(service.markBookingNoShow(partner, booking.id)).rejects.toMatchObject({
+      code: 'NO_SHOW_TOO_EARLY',
+    });
+    await port.updateBooking(
+      booking.id,
+      (current) => ({
+        ...current,
+        arrival: { at: '2026-11-10T11:05:00.000Z', byUid: 'partner-1' },
+      }),
+      { actorUid: 'partner-1', reason: 'provider_arrived' }
+    );
+    setNow('2026-11-10T11:34:00.000Z');
+    await expect(service.markBookingNoShow(partner, booking.id)).rejects.toMatchObject({
+      code: 'NO_SHOW_TOO_EARLY',
+    });
+    setNow('2026-11-10T11:35:00.000Z');
+    await expect(service.markBookingNoShow(partner, booking.id)).resolves.toMatchObject({
+      status: 'no_show',
+    });
+  });
+
+  it('conclusão com check-in por código não pergunta ao comprador', async () => {
+    const { service, port, setNow } = setup();
+    const booking = await service.createPendingBooking(BUYER, INPUT, FEES);
+    await service.confirmBookingPayment(booking.id, 'pi_1');
+    await port.recordCheckIn(booking.id, {
+      at: '2026-11-10T11:02:00.000Z',
+      byUid: 'partner-1',
+      method: 'code',
+      participantsPresent: 2,
+    });
+    setNow('2026-11-10T13:00:00.000Z');
+    const result = await service.completeFinishedBookings();
+    expect(result).toMatchObject({ completed: 1, askedToConfirm: [] });
+    expect(port.bookings.get(booking.id)?.serviceConfirmation).toBeUndefined();
+  });
 });

=== server/domain/bookings/services/bookingService.ts — diff ===
@@ -6,9 +6,11 @@ import {
   type BookingActor,
   type BookingCancellation,
   type BookingParticipant,
+  CHECK_IN_CODE_KINDS,
   cancellationFamilyOf,
   type Page,
 } from '../types/bookingTypes';
+import { NO_SHOW_WAIT_MS, SERVICE_CONFIRMATION_MS } from '../utils/checkInWindow';
 import { buildBookingId } from '../utils/buildBookingId';
 import { priceBookingLines } from '../utils/bookingPricing';
 import { calculateBuyerRefund } from '../../../shared/kernel/cancellationPolicy';
@@ -300,6 +302,24 @@ export class BookingService {
     if (booking.checkIn) {
       throw new BookingDomainError('INVALID_TRANSITION', 'Reserva com check-in não é ausência.');
     }
+    if (CHECK_IN_CODE_KINDS.includes(booking.kind)) {
+      // D20: ausência só depois do "Cheguei" e de 30 min de espera, e sem relato de que o prestador faltou.
+      const waitedUntil = booking.arrival
+        ? new Date(booking.arrival.at).getTime() + NO_SHOW_WAIT_MS
+        : Number.POSITIVE_INFINITY;
+      if (this.now().getTime() < waitedUntil) {
+        throw new BookingDomainError(
+          'NO_SHOW_TOO_EARLY',
+          'Toque em "Cheguei" e espere 30 min antes de marcar a ausência.'
+        );
+      }
+      if (booking.providerAbsence) {
+        throw new BookingDomainError(
+          'INVALID_TRANSITION',
+          'O comprador relatou sua ausência: responda pelo aviso da reserva.'
+        );
+      }
+    }
     return this.port.setBookingStatus({
       bookingId,
       to: 'no_show',
@@ -308,26 +328,49 @@ export class BookingService {
     });
   }
 
-  async completeFinishedBookings(limit = 200): Promise<number> {
+  /**
+   * Conclui as reservas cujo horário terminou. Sem check-in nem outro registro, o comprador recebe a
+   * pergunta "O serviço aconteceu?" (D20); essas reservas voltam em `askedToConfirm`.
+   */
+  async completeFinishedBookings(
+    limit = 200
+  ): Promise<{ completed: number; askedToConfirm: Booking[] }> {
     const nowDate = this.now();
     const started = await this.port.listConfirmedBookingsStartedBefore(
       nowDate.toISOString(),
       limit
     );
     let completed = 0;
+    const askedToConfirm: Booking[] = [];
     for (const booking of started) {
       const endsAtMs =
         new Date(booking.offerSnapshot.startsAt).getTime() +
         (booking.offerSnapshot.durationMinutes ?? 0) * 60_000;
       if (endsAtMs > nowDate.getTime()) continue;
-      await this.port.setBookingStatus({
-        bookingId: booking.id,
-        to: 'completed',
-        actorUid: SYSTEM_ACTOR,
-        reason: 'finished',
-      });
+      const ask =
+        CHECK_IN_CODE_KINDS.includes(booking.kind) &&
+        !booking.checkIn &&
+        !booking.providerAbsence &&
+        !booking.serviceConfirmation;
+      const updated = await this.port.updateBooking(
+        booking.id,
+        (current) => {
+          if (current.status !== 'confirmed') return null;
+          if (!ask) return { ...current, status: 'completed' };
+          const answerBy = new Date(nowDate.getTime() + SERVICE_CONFIRMATION_MS).toISOString();
+          return {
+            ...current,
+            status: 'completed',
+            serviceConfirmation: { askedAt: nowDate.toISOString(), answerBy, reason: 'no_record' },
+            deadline: { kind: 'service_confirmation', at: answerBy },
+          };
+        },
+        { actorUid: SYSTEM_ACTOR, reason: 'finished' }
+      );
+      if (updated.status !== 'completed') continue;
       completed += 1;
+      if (ask) askedToConfirm.push(updated);
     }
-    return completed;
+    return { completed, askedToConfirm };
   }
 }

=== server/domain/bookings/services/bookingServiceProofService.test.ts — ARQUIVO NOVO, conteúdo completo ===
import { describe, expect, it } from 'vitest';
import { InMemoryBookingsAdapter } from '../adapters/inMemoryBookingsAdapter';
import type { BookableOffer, Booking } from '../types/bookingTypes';
import { BookingServiceProofService } from './bookingServiceProofService';

const STARTS_AT = '2026-11-10T11:00:00.000Z';
const PARTNER = { uid: 'partner-1', admin: false };
const BUYER = { uid: 'buyer-1', admin: false };

function offer(overrides: Partial<BookableOffer> = {}): BookableOffer {
  return {
    id: 'offer-1',
    guideItemId: 'item-1',
    ownerId: 'partner-1',
    partnerId: 'partner-1',
    kind: 'tour',
    title: { 'pt-BR': 'Buggy' },
    status: 'published',
    pricing: { currency: 'BRL', priceOptions: [] },
    durationMinutes: 120,
    cancellationPolicy: 'moderate',
    maxParticipantsPerBooking: 6,
    requiresParticipantNames: false,
    createdAt: '',
    updatedAt: '',
    ...overrides,
  };
}

function booking(overrides: Partial<Booking> = {}): Booking {
  return {
    id: 'booking-1',
    offerId: 'offer-1',
    slotId: 'slot-1',
    guideItemId: 'item-1',
    buyerId: 'buyer-1',
    sellerPartnerId: 'partner-1',
    kind: 'tour',
    status: 'confirmed',
    lines: [],
    participantsCount: 4,
    subtotalMinor: 40000,
    platformFeeMinor: 6000,
    totalMinor: 40000,
    expiresAt: null,
    offerSnapshot: {
      title: 'Buggy',
      startsAt: STARTS_AT,
      durationMinutes: 120,
      cancellationPolicy: 'moderate',
    },
    locale: 'pt-BR',
    idempotencyKey: 'key-1',
    createdAt: '2026-11-01T12:00:00.000Z',
    updatedAt: '2026-11-01T12:00:00.000Z',
    ...overrides,
  };
}

function setup(now = '2026-11-10T11:05:00.000Z', bookingOverrides: Partial<Booking> = {}) {
  const port = new InMemoryBookingsAdapter();
  port.offers.set('offer-1', offer());
  port.offers.set('offer-2', offer({ id: 'offer-2', ownerId: 'partner-2' }));
  port.bookings.set('booking-1', booking(bookingOverrides));
  let current = new Date(now);
  const service = new BookingServiceProofService(port, () => current);
  return {
    port,
    service,
    setNow: (iso: string) => {
      current = new Date(iso);
    },
  };
}

describe('BookingServiceProofService (D20)', () => {
  it('"Cheguei" grava hora e localização; tocar de novo mantém a primeira hora', async () => {
    const { service, setNow } = setup();
    const first = await service.recordArrival(PARTNER, 'offer-1', 'booking-1', {
      lat: -2.79,
      lng: -40.51,
    });
    expect(first.arrival).toEqual({
      at: '2026-11-10T11:05:00.000Z',
      byUid: 'partner-1',
      location: { lat: -2.79, lng: -40.51 },
    });
    setNow('2026-11-10T11:20:00.000Z');
    const again = await service.recordArrival(PARTNER, 'offer-1', 'booking-1');
    expect(again.arrival?.at).toBe('2026-11-10T11:05:00.000Z');
  });

  it('outro parceiro ou a oferta errada não registram nada (IDOR)', async () => {
    const { service } = setup();
    await expect(
      service.recordArrival({ uid: 'partner-2', admin: false }, 'offer-1', 'booking-1')
    ).rejects.toMatchObject({ code: 'NOT_FOUND' });
    await expect(service.recordArrival(PARTNER, 'offer-2', 'booking-1')).rejects.toMatchObject({
      code: 'NOT_FOUND',
    });
  });

  it('"Cheguei" fora da janela do serviço é recusado', async () => {
    const { service } = setup('2026-11-10T08:00:00.000Z');
    await expect(service.recordArrival(PARTNER, 'offer-1', 'booking-1')).rejects.toMatchObject({
      code: 'CHECK_IN_WINDOW_CLOSED',
    });
  });

  it('"Cliente sem código" grava o check-in por conta do prestador e pergunta ao comprador', async () => {
    const { service } = setup();
    const updated = await service.checkInWithoutCode(PARTNER, {
      offerId: 'offer-1',
      bookingId: 'booking-1',
      participantsPresent: 3,
      reason: 'no_phone',
    });
    expect(updated.checkIn).toMatchObject({
      method: 'no_code',
      noCodeReason: 'no_phone',
      participantsPresent: 3,
    });
    expect(updated.serviceConfirmation).toMatchObject({
      reason: 'no_code',
      answerBy: '2026-11-13T11:05:00.000Z',
    });
    expect(updated.deadline).toEqual({
      kind: 'service_confirmation',
      at: '2026-11-13T11:05:00.000Z',
    });
  });

  it('"O prestador não veio" só 30 min depois do horário e sem check-in', async () => {
    const early = setup('2026-11-10T11:29:00.000Z');
    await expect(
      early.service.getBookingForAbsenceReport(BUYER, 'booking-1')
    ).rejects.toMatchObject({ code: 'ABSENCE_REPORT_NOT_ALLOWED' });
    const checkedIn = setup('2026-11-10T11:31:00.000Z', {
      checkIn: { at: STARTS_AT, byUid: 'partner-1', method: 'code', participantsPresent: 4 },
    });
    await expect(
      checkedIn.service.getBookingForAbsenceReport(BUYER, 'booking-1')
    ).rejects.toMatchObject({ code: 'ABSENCE_REPORT_NOT_ALLOWED' });
    const ok = setup('2026-11-10T11:31:00.000Z');
    await expect(ok.service.getBookingForAbsenceReport(BUYER, 'booking-1')).resolves.toMatchObject({
      id: 'booking-1',
    });
    await expect(ok.service.getBookingForAbsenceReport(PARTNER, 'booking-1')).rejects.toMatchObject(
      { code: 'NOT_FOUND' }
    );
  });

  it('relato grava prazo de 2 h; resposta tira o prazo e não aceita responder de novo', async () => {
    const { service } = setup('2026-11-10T11:31:00.000Z');
    const reported = await service.recordProviderAbsence(
      BUYER,
      'booking-1',
      'claim_booking_booking-1'
    );
    expect(reported.providerAbsence).toMatchObject({ respondBy: '2026-11-10T13:31:00.000Z' });
    expect(reported.deadline).toEqual({
      kind: 'provider_absence_response',
      at: '2026-11-10T13:31:00.000Z',
    });
    await service.getOpenProviderAbsence(PARTNER, 'offer-1', 'booking-1');
    const resolved = await service.resolveProviderAbsence(
      'booking-1',
      { answer: 'was_there', resolution: 'admin' },
      'partner-1'
    );
    expect(resolved.deadline).toBeUndefined();
    expect(resolved.providerAbsence).toMatchObject({ answer: 'was_there', resolution: 'admin' });
    await expect(
      service.getOpenProviderAbsence(PARTNER, 'offer-1', 'booking-1')
    ).rejects.toMatchObject({ code: 'NOTHING_TO_ANSWER' });
  });

  it('"Cliente sem código" depois do relato de ausência é recusado: o prestador responde ao relato', async () => {
    const { service } = setup('2026-11-10T11:31:00.000Z');
    await service.recordProviderAbsence(BUYER, 'booking-1', 'claim_1');
    await expect(
      service.checkInWithoutCode(PARTNER, {
        offerId: 'offer-1',
        bookingId: 'booking-1',
        participantsPresent: 1,
        reason: 'other',
      })
    ).rejects.toMatchObject({ code: 'INVALID_TRANSITION' });
  });

  it('pergunta ao comprador vence em 72 h e só ele responde', async () => {
    const { service, setNow } = setup('2026-11-10T13:00:00.000Z', {
      status: 'completed',
      serviceConfirmation: {
        askedAt: '2026-11-10T13:00:00.000Z',
        answerBy: '2026-11-13T13:00:00.000Z',
        reason: 'no_record',
      },
      deadline: { kind: 'service_confirmation', at: '2026-11-13T13:00:00.000Z' },
    });
    await expect(service.getPendingConfirmation(PARTNER, 'booking-1')).rejects.toMatchObject({
      code: 'NOT_FOUND',
    });
    await expect(service.getPendingConfirmation(BUYER, 'booking-1')).resolves.toMatchObject({
      id: 'booking-1',
    });
    expect(await service.listBookingsWithDueDeadline(10)).toHaveLength(0);
    setNow('2026-11-13T13:01:00.000Z');
    await expect(service.getPendingConfirmation(BUYER, 'booking-1')).rejects.toMatchObject({
      code: 'NOTHING_TO_ANSWER',
    });
    expect((await service.listBookingsWithDueDeadline(10)).map((b) => b.id)).toEqual(['booking-1']);
    const resolved = await service.resolveServiceConfirmation(
      'booking-1',
      { resolution: 'refunded', claimId: 'claim_1' },
      'system'
    );
    expect(resolved.deadline).toBeUndefined();
    expect(resolved.serviceConfirmation?.resolution).toBe('refunded');
  });
});

=== server/domain/bookings/services/bookingServiceProofService.ts — ARQUIVO NOVO, conteúdo completo ===
import { BookingDomainError } from '../errors/bookingDomainError';
import type { BookingsPort } from '../ports/bookingsPort';
import {
  type Booking,
  type BookingActor,
  type BookingArrival,
  type BookingProviderAbsence,
  type BookingServiceConfirmation,
  CHECK_IN_CODE_KINDS,
  type NoCodeReason,
} from '../types/bookingTypes';
import {
  ABSENCE_RESPONSE_MS,
  PROVIDER_ABSENT_AFTER_MS,
  SERVICE_CONFIRMATION_MS,
  checkInWindow,
} from '../utils/checkInWindow';

const NOT_FOUND = () => new BookingDomainError('NOT_FOUND', 'Reserva não encontrada.');
const NOTHING_TO_ANSWER = () =>
  new BookingDomainError('NOTHING_TO_ANSWER', 'Não há nada para responder nesta reserva.');

export interface CheckInWithoutCodeInput {
  offerId: string;
  bookingId: string;
  participantsPresent: number;
  reason: NoCodeReason;
}

/**
 * Prova do serviço sem o código (D20): "Cheguei", "O prestador não veio", "Cliente sem código" e a
 * pergunta "O serviço aconteceu?". Reembolso, multa e avisos ficam na camada application.
 */
export class BookingServiceProofService {
  constructor(
    private readonly port: BookingsPort,
    private readonly now: () => Date = () => new Date()
  ) {}

  async recordArrival(
    actor: BookingActor,
    offerId: string,
    bookingId: string,
    location?: BookingArrival['location']
  ): Promise<Booking> {
    const booking = await this.ownedActiveBooking(actor, offerId, bookingId);
    const arrival: BookingArrival = {
      at: this.now().toISOString(),
      byUid: actor.uid,
      ...(location ? { location } : {}),
    };
    // O primeiro "Cheguei" vale: é dele que conta a espera de 30 min.
    return this.port.updateBooking(
      booking.id,
      (current) => (current.arrival ? null : { ...current, arrival }),
      { actorUid: actor.uid, reason: 'provider_arrived' }
    );
  }

  async checkInWithoutCode(actor: BookingActor, input: CheckInWithoutCodeInput): Promise<Booking> {
    const booking = await this.ownedActiveBooking(actor, input.offerId, input.bookingId);
    if (booking.providerAbsence) {
      throw new BookingDomainError(
        'INVALID_TRANSITION',
        'O comprador relatou sua ausência: responda pelo aviso da reserva.'
      );
    }
    if (input.participantsPresent > booking.participantsCount) {
      throw new BookingDomainError(
        'VALIDATION_ERROR',
        'Presentes acima do número de pessoas da reserva.'
      );
    }
    const nowDate = this.now();
    const confirmation = this.question(nowDate, 'no_code');
    return this.port.updateBooking(
      booking.id,
      (current) => {
        if (current.checkIn) return null;
        return {
          ...current,
          checkIn: {
            at: nowDate.toISOString(),
            byUid: actor.uid,
            method: 'no_code',
            participantsPresent: input.participantsPresent,
            noCodeReason: input.reason,
          },
          serviceConfirmation: confirmation,
          deadline: { kind: 'service_confirmation', at: confirmation.answerBy },
        };
      },
      { actorUid: actor.uid, reason: 'checked_in_without_code' }
    );
  }

  /** Confere se o comprador pode relatar "O prestador não veio"; não grava nada. */
  async getBookingForAbsenceReport(actor: BookingActor, bookingId: string): Promise<Booking> {
    const booking = await this.port.getBooking(bookingId);
    if (!booking || booking.buyerId !== actor.uid) throw NOT_FOUND();
    const nowMs = this.now().getTime();
    const { startsAt, durationMinutes } = booking.offerSnapshot;
    const allowed =
      CHECK_IN_CODE_KINDS.includes(booking.kind) &&
      booking.status === 'confirmed' &&
      !booking.checkIn &&
      !booking.providerAbsence &&
      nowMs >= new Date(startsAt).getTime() + PROVIDER_ABSENT_AFTER_MS &&
      nowMs <= checkInWindow(startsAt, durationMinutes).closesAtMs;
    if (!allowed) {
      throw new BookingDomainError(
        'ABSENCE_REPORT_NOT_ALLOWED',
        'Só é possível relatar 30 min depois do horário, sem check-in feito.'
      );
    }
    return booking;
  }

  async recordProviderAbsence(
    actor: BookingActor,
    bookingId: string,
    claimId: string
  ): Promise<Booking> {
    const nowDate = this.now();
    const absence: BookingProviderAbsence = {
      reportedAt: nowDate.toISOString(),
      respondBy: new Date(nowDate.getTime() + ABSENCE_RESPONSE_MS).toISOString(),
      claimId,
    };
    return this.port.updateBooking(
      bookingId,
      (current) =>
        current.providerAbsence
          ? null
          : {
              ...current,
              providerAbsence: absence,
              deadline: { kind: 'provider_absence_response', at: absence.respondBy },
            },
      { actorUid: actor.uid, reason: 'provider_absence_reported' }
    );
  }

  /** Relato de ausência ainda sem resposta nem desfecho, na oferta do prestador. */
  async getOpenProviderAbsence(
    actor: BookingActor,
    offerId: string,
    bookingId: string
  ): Promise<Booking & { providerAbsence: BookingProviderAbsence }> {
    const booking = await this.ownedBooking(actor, offerId, bookingId);
    const absence = booking.providerAbsence;
    if (!absence || absence.resolution) throw NOTHING_TO_ANSWER();
    return { ...booking, providerAbsence: absence };
  }

  async resolveProviderAbsence(
    bookingId: string,
    outcome: Pick<BookingProviderAbsence, 'resolution' | 'answer'>,
    actorUid: string
  ): Promise<Booking> {
    const nowIso = this.now().toISOString();
    return this.port.updateBooking(
      bookingId,
      (current) => {
        if (!current.providerAbsence || current.providerAbsence.resolution) return null;
        return withoutDeadline({
          ...current,
          providerAbsence: {
            ...current.providerAbsence,
            ...(outcome.answer ? { answer: outcome.answer, answeredAt: nowIso } : {}),
            ...(outcome.resolution ? { resolution: outcome.resolution, resolvedAt: nowIso } : {}),
          },
        });
      },
      { actorUid, reason: `provider_absence_${outcome.resolution ?? 'answered'}` }
    );
  }

  /** Pergunta "O serviço aconteceu?" ainda aberta, para o comprador responder. */
  async getPendingConfirmation(
    actor: BookingActor,
    bookingId: string
  ): Promise<Booking & { serviceConfirmation: BookingServiceConfirmation }> {
    const booking = await this.port.getBooking(bookingId);
    if (!booking || booking.buyerId !== actor.uid) throw NOT_FOUND();
    const confirmation = booking.serviceConfirmation;
    if (
      !confirmation ||
      confirmation.resolution ||
      this.now().toISOString() > confirmation.answerBy
    ) {
      throw NOTHING_TO_ANSWER();
    }
    return { ...booking, serviceConfirmation: confirmation };
  }

  async resolveServiceConfirmation(
    bookingId: string,
    outcome: Pick<BookingServiceConfirmation, 'answer' | 'claimId' | 'resolution'>,
    actorUid: string
  ): Promise<Booking> {
    const nowIso = this.now().toISOString();
    return this.port.updateBooking(
      bookingId,
      (current) => {
        if (!current.serviceConfirmation || current.serviceConfirmation.resolution) return null;
        return withoutDeadline({
          ...current,
          serviceConfirmation: {
            ...current.serviceConfirmation,
            ...outcome,
            ...(outcome.answer ? { answeredAt: nowIso } : {}),
          },
        });
      },
      { actorUid, reason: `service_confirmation_${outcome.resolution}` }
    );
  }

  /** Reservas cujo prazo venceu; o job decide o que fazer com cada uma. */
  listBookingsWithDueDeadline(limit: number): Promise<Booking[]> {
    return this.port.listBookingsWithDeadlineBefore(this.now().toISOString(), limit);
  }

  /** Prazo que já não tem o que esperar (o caso foi resolvido por outro caminho). */
  async clearDeadline(bookingId: string, actorUid: string): Promise<Booking> {
    return this.port.updateBooking(
      bookingId,
      (current) => (current.deadline ? withoutDeadline(current) : null),
      { actorUid, reason: 'deadline_cleared' }
    );
  }

  question(
    nowDate: Date,
    reason: BookingServiceConfirmation['reason']
  ): BookingServiceConfirmation {
    return {
      askedAt: nowDate.toISOString(),
      answerBy: new Date(nowDate.getTime() + SERVICE_CONFIRMATION_MS).toISOString(),
      reason,
    };
  }

  private async ownedBooking(
    actor: BookingActor,
    offerId: string,
    bookingId: string
  ): Promise<Booking> {
    const [offer, booking] = await Promise.all([
      this.port.getOffer(offerId),
      this.port.getBooking(bookingId),
    ]);
    // Só o dono da oferta age na reserva; de outro parceiro responde como inexistente (§7.10).
    if (!offer || offer.ownerId !== actor.uid || booking?.offerId !== offer.id) throw NOT_FOUND();
    return booking;
  }

  /** Reserva confirmada, com código, sem check-in e dentro da janela do serviço. */
  private async ownedActiveBooking(
    actor: BookingActor,
    offerId: string,
    bookingId: string
  ): Promise<Booking> {
    const booking = await this.ownedBooking(actor, offerId, bookingId);
    if (!CHECK_IN_CODE_KINDS.includes(booking.kind)) {
      throw new BookingDomainError(
        'CHECK_IN_NOT_APPLICABLE',
        'Esta reserva usa o QR Code da entrada.'
      );
    }
    if (booking.status !== 'confirmed' || booking.checkIn) {
      throw new BookingDomainError('INVALID_TRANSITION', 'Esta reserva não aceita esta ação.');
    }
    const { opensAtMs, closesAtMs } = checkInWindow(
      booking.offerSnapshot.startsAt,
      booking.offerSnapshot.durationMinutes
    );
    const nowMs = this.now().getTime();
    if (nowMs < opensAtMs || nowMs > closesAtMs) {
      throw new BookingDomainError(
        'CHECK_IN_WINDOW_CLOSED',
        'Fora da janela do serviço desta reserva.'
      );
    }
    return booking;
  }
}

function withoutDeadline(booking: Booking): Booking {
  const { deadline: _deadline, ...rest } = booking;
  return rest;
}

=== server/domain/bookings/types/bookingTypes.ts — diff ===
@@ -106,15 +106,59 @@ export interface BookingCancellation {
   at: string;
 }
 
-/** Check-in do serviço pelo prestador com o código do comprador (D20): prova de que o serviço começou. */
+/** Check-in do serviço pelo prestador (D20): prova de que o serviço começou. */
 export interface BookingCheckIn {
-  /** Hora em que o prestador digitou o código (a do aparelho, quando o check-in foi feito sem internet). */
+  /** Hora em que o prestador fez o check-in (a do aparelho, quando foi feito sem internet). */
   at: string;
   byUid: string;
-  method: 'code';
+  /** `no_code`: "Cliente sem código", por conta e risco do prestador até o comprador confirmar. */
+  method: 'code' | 'no_code';
   participantsPresent: number;
   /** Só no check-in feito sem internet: quando o servidor recebeu e validou o código. */
   syncedAt?: string;
+  noCodeReason?: NoCodeReason;
+}
+
+export const NO_CODE_REASONS = ['no_phone', 'refused', 'other'] as const;
+export type NoCodeReason = (typeof NO_CODE_REASONS)[number];
+
+/** "Cheguei": hora e localização do prestador no ponto de encontro ou no endereço (D20). */
+export interface BookingArrival {
+  at: string;
+  byUid: string;
+  /** Prova para o admin; nunca vai para log (AGENTS.md §10.3). */
+  location?: { lat: number; lng: number; accuracyM?: number };
+}
+
+/** "O prestador não veio": o comprador relata e o prestador tem 2 h para responder (D20). */
+export interface BookingProviderAbsence {
+  reportedAt: string;
+  respondBy: string;
+  /** Reclamação aberta junto, que retém o repasse e leva o caso ao admin. */
+  claimId: string;
+  answer?: 'was_there' | 'admitted';
+  answeredAt?: string;
+  /** refunded: sem resposta ou admitida; withdrawn: o prestador fez o check-in; admin: disse que foi. */
+  resolution?: 'refunded' | 'withdrawn' | 'admin';
+  resolvedAt?: string;
+}
+
+/** "O serviço aconteceu?": pergunta ao comprador quando falta a prova do código (D20). */
+export interface BookingServiceConfirmation {
+  askedAt: string;
+  answerBy: string;
+  reason: 'no_code' | 'no_record';
+  answer?: 'yes' | 'no';
+  answeredAt?: string;
+  claimId?: string;
+  /** confirmed: respondeu sim; admin: respondeu não; refunded: não respondeu em 72 h. */
+  resolution?: 'confirmed' | 'admin' | 'refunded';
+}
+
+/** Próximo prazo da reserva, num campo só para o job buscar por data (D20). */
+export interface BookingDeadline {
+  kind: 'provider_absence_response' | 'service_confirmation';
+  at: string;
 }
 
 export interface Booking {
@@ -149,6 +193,10 @@ export interface Booking {
   /** Onde o comprador está (hospedagem ou endereço), quando a oferta busca no endereço. PII (§7.6). */
   pickupAddress?: string;
   checkIn?: BookingCheckIn;
+  arrival?: BookingArrival;
+  providerAbsence?: BookingProviderAbsence;
+  serviceConfirmation?: BookingServiceConfirmation;
+  deadline?: BookingDeadline;
   locale: Locale;
   idempotencyKey: string;
   createdAt: string;

=== server/domain/bookings/usecases/checkInWithoutCodeUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { getBookingServiceProofService } from '../factory';
import type { CheckInWithoutCodeInput } from '../services/bookingServiceProofService';
import type { Booking, BookingActor } from '../types/bookingTypes';

/** "Cliente sem código": por conta e risco do prestador, até o comprador confirmar (D20). */
export async function checkInWithoutCodeUseCase(
  actor: BookingActor,
  input: CheckInWithoutCodeInput
): Promise<Booking> {
  return getBookingServiceProofService().checkInWithoutCode(actor, input);
}

=== server/domain/bookings/usecases/clearBookingDeadlineUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { getBookingServiceProofService } from '../factory';
import type { Booking } from '../types/bookingTypes';

/** Tira o prazo de uma reserva cujo caso já foi resolvido por outro caminho (D20). */
export async function clearBookingDeadlineUseCase(
  bookingId: string,
  actorUid: string
): Promise<Booking> {
  return getBookingServiceProofService().clearDeadline(bookingId, actorUid);
}

=== server/domain/bookings/usecases/completeFinishedBookingsUseCase.ts — ARQUIVO REESCRITO, substitua todo o conteúdo por este ===
import { getBookingService } from '../factory';
import type { Booking } from '../types/bookingTypes';

/** Conclui as reservas cujo horário terminou e devolve as que ficaram sem prova do serviço (D20). */
export async function completeFinishedBookingsUseCase(
  limit = 200
): Promise<{ completed: number; askedToConfirm: Booking[] }> {
  return getBookingService().completeFinishedBookings(limit);
}

=== server/domain/bookings/usecases/getBookingForAbsenceReportUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { getBookingServiceProofService } from '../factory';
import type { Booking, BookingActor } from '../types/bookingTypes';

/** Confere se o comprador pode relatar "O prestador não veio" (D20); não grava nada. */
export async function getBookingForAbsenceReportUseCase(
  actor: BookingActor,
  bookingId: string
): Promise<Booking> {
  return getBookingServiceProofService().getBookingForAbsenceReport(actor, bookingId);
}

=== server/domain/bookings/usecases/getOpenProviderAbsenceUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { getBookingServiceProofService } from '../factory';
import type { Booking, BookingActor, BookingProviderAbsence } from '../types/bookingTypes';

/** Relato de ausência ainda aberto na oferta do prestador (D20). */
export async function getOpenProviderAbsenceUseCase(
  actor: BookingActor,
  offerId: string,
  bookingId: string
): Promise<Booking & { providerAbsence: BookingProviderAbsence }> {
  return getBookingServiceProofService().getOpenProviderAbsence(actor, offerId, bookingId);
}

=== server/domain/bookings/usecases/getPendingServiceConfirmationUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { getBookingServiceProofService } from '../factory';
import type { Booking, BookingActor, BookingServiceConfirmation } from '../types/bookingTypes';

/** Pergunta "O serviço aconteceu?" ainda aberta para o comprador (D20). */
export async function getPendingServiceConfirmationUseCase(
  actor: BookingActor,
  bookingId: string
): Promise<Booking & { serviceConfirmation: BookingServiceConfirmation }> {
  return getBookingServiceProofService().getPendingConfirmation(actor, bookingId);
}

=== server/domain/bookings/usecases/listBookingsWithDueDeadlineUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { getBookingServiceProofService } from '../factory';
import type { Booking } from '../types/bookingTypes';

/** Reservas com prazo vencido de resposta do prestador ou do comprador (D20). */
export async function listBookingsWithDueDeadlineUseCase(limit = 100): Promise<Booking[]> {
  return getBookingServiceProofService().listBookingsWithDueDeadline(limit);
}

=== server/domain/bookings/usecases/recordProviderAbsenceUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { getBookingServiceProofService } from '../factory';
import type { Booking, BookingActor } from '../types/bookingTypes';

/** Grava o relato de ausência do prestador e o prazo de 2 h para ele responder (D20). */
export async function recordProviderAbsenceUseCase(
  actor: BookingActor,
  bookingId: string,
  claimId: string
): Promise<Booking> {
  return getBookingServiceProofService().recordProviderAbsence(actor, bookingId, claimId);
}

=== server/domain/bookings/usecases/recordProviderArrivalUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { getBookingServiceProofService } from '../factory';
import type { Booking, BookingActor, BookingArrival } from '../types/bookingTypes';

/** "Cheguei" do prestador, com a localização quando o navegador permite (D20). */
export async function recordProviderArrivalUseCase(
  actor: BookingActor,
  offerId: string,
  bookingId: string,
  location?: BookingArrival['location']
): Promise<Booking> {
  return getBookingServiceProofService().recordArrival(actor, offerId, bookingId, location);
}

=== server/domain/bookings/usecases/resolveProviderAbsenceUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { getBookingServiceProofService } from '../factory';
import type { Booking, BookingProviderAbsence } from '../types/bookingTypes';

/** Grava a resposta e o desfecho do relato de ausência e tira o prazo (D20). */
export async function resolveProviderAbsenceUseCase(
  bookingId: string,
  outcome: Pick<BookingProviderAbsence, 'resolution' | 'answer'>,
  actorUid: string
): Promise<Booking> {
  return getBookingServiceProofService().resolveProviderAbsence(bookingId, outcome, actorUid);
}

=== server/domain/bookings/usecases/resolveServiceConfirmationUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { getBookingServiceProofService } from '../factory';
import type { Booking, BookingServiceConfirmation } from '../types/bookingTypes';

/** Grava a resposta ou o desfecho da pergunta "O serviço aconteceu?" e tira o prazo (D20). */
export async function resolveServiceConfirmationUseCase(
  bookingId: string,
  outcome: Pick<BookingServiceConfirmation, 'answer' | 'claimId' | 'resolution'>,
  actorUid: string
): Promise<Booking> {
  return getBookingServiceProofService().resolveServiceConfirmation(bookingId, outcome, actorUid);
}

=== server/domain/bookings/utils/checkInWindow.ts — diff ===
@@ -30,3 +30,12 @@ export function checkInWindow(
     closesAtMs: serviceEndsAtMs(startsAt, durationMinutes) + CHECK_IN_CLOSES_AFTER_MS,
   };
 }
+
+/** "Cliente não apareceu" só 30 min depois do "Cheguei" (D20). */
+export const NO_SHOW_WAIT_MS = 30 * MINUTE_MS;
+/** "O prestador não veio" a partir de 30 min depois do horário (D20). */
+export const PROVIDER_ABSENT_AFTER_MS = 30 * MINUTE_MS;
+/** Prazo do prestador para responder ao "O prestador não veio" (D20). */
+export const ABSENCE_RESPONSE_MS = 2 * HOUR_MS;
+/** Prazo do comprador para responder "O serviço aconteceu?" (D20). */
+export const SERVICE_CONFIRMATION_MS = 72 * HOUR_MS;

=== server/domain/payment/services/saleClaimService.test.ts — diff ===
@@ -55,6 +55,13 @@ describe('SaleClaimService (D16 2A)', () => {
     await expect(late.service.open(CLAIM)).rejects.toMatchObject({ code: 'CLAIM_WINDOW_CLOSED' });
   });
 
+  it('aberta pelo sistema depois das 48 h, enquanto o repasse não saiu (D20)', async () => {
+    const late = await setup('2026-12-23T03:00:01.000Z');
+    await expect(late.service.open({ ...CLAIM, allowAfterWindow: true })).resolves.toMatchObject({
+      status: 'open',
+    });
+  });
+
   it('abre uma por venda, retém o repasse e decide em até 5 dias', async () => {
     const { service, entries } = await setup();
     const claim = await service.open(CLAIM);

=== server/domain/payment/services/saleClaimService.ts — diff ===
@@ -20,6 +20,11 @@ export interface OpenSaleClaimInput {
   details?: string;
   serviceStartsAt: string;
   serviceEndsAt: string;
+  /**
+   * Aberta pelo sistema depois das 48 h (pergunta "O serviço aconteceu?" de 72 h, D20); o repasse ainda
+   * não pode ter sido liberado.
+   */
+  allowAfterWindow?: boolean;
 }
 
 export interface SaleClaimDecision {
@@ -89,7 +94,8 @@ export class SaleClaimService {
       );
     }
     const entry = await this.payouts.getForReference(input.referenceType, input.referenceId);
-    if (nowIso > computeReleaseAt(input.serviceEndsAt) || entry?.status === 'released') {
+    const windowClosed = !input.allowAfterWindow && nowIso > computeReleaseAt(input.serviceEndsAt);
+    if (windowClosed || entry?.status === 'released') {
       throw new PaymentDomainError(
         'CLAIM_WINDOW_CLOSED',
         'O prazo para relatar um problema era de 48 h depois do fim do serviço.',

=== server/interfaces/http/bookings/bookingResponses.ts — diff ===
@@ -37,7 +37,28 @@ export function toBuyerBooking(booking: Booking) {
     rescheduledAt: booking.rescheduledAt ?? null,
     pickupAddress: booking.pickupAddress ?? null,
     checkIn: booking.checkIn
-      ? { at: booking.checkIn.at, participantsPresent: booking.checkIn.participantsPresent }
+      ? {
+          at: booking.checkIn.at,
+          method: booking.checkIn.method,
+          participantsPresent: booking.checkIn.participantsPresent,
+        }
+      : null,
+    arrivedAt: booking.arrival?.at ?? null,
+    providerAbsence: booking.providerAbsence
+      ? {
+          reportedAt: booking.providerAbsence.reportedAt,
+          respondBy: booking.providerAbsence.respondBy,
+          answer: booking.providerAbsence.answer ?? null,
+          resolution: booking.providerAbsence.resolution ?? null,
+        }
+      : null,
+    serviceConfirmation: booking.serviceConfirmation
+      ? {
+          askedAt: booking.serviceConfirmation.askedAt,
+          answerBy: booking.serviceConfirmation.answerBy,
+          answer: booking.serviceConfirmation.answer ?? null,
+          resolution: booking.serviceConfirmation.resolution ?? null,
+        }
       : null,
     createdAt: booking.createdAt,
   };

=== server/interfaces/http/bookings/bookingsController.test.ts — diff ===
@@ -7,6 +7,18 @@ vi.mock('../../../application/usecases/bookings/createBookingApplicationUseCase'
 vi.mock('../../../application/usecases/bookings/cancelBookingByBuyerApplicationUseCase', () => ({
   cancelBookingByBuyerApplicationUseCase: vi.fn(),
 }));
+vi.mock('../../../application/usecases/bookings/markBookingNoShowApplicationUseCase', () => ({
+  markBookingNoShowApplicationUseCase: vi.fn(),
+}));
+vi.mock('../../../application/usecases/bookings/reportProviderAbsentApplicationUseCase', () => ({
+  reportProviderAbsentApplicationUseCase: vi.fn(),
+}));
+vi.mock(
+  '../../../application/usecases/bookings/answerServiceConfirmationApplicationUseCase',
+  () => ({
+    answerServiceConfirmationApplicationUseCase: vi.fn(),
+  })
+);
 vi.mock('../../../domain/bookings', async () => {
   const { BookingDomainError } = await import('../../../domain/bookings/errors/bookingDomainError');
   return {
@@ -19,7 +31,9 @@ vi.mock('../../../domain/bookings', async () => {
   };
 });
 
+import { answerServiceConfirmationApplicationUseCase } from '../../../application/usecases/bookings/answerServiceConfirmationApplicationUseCase';
 import { createBookingApplicationUseCase } from '../../../application/usecases/bookings/createBookingApplicationUseCase';
+import { reportProviderAbsentApplicationUseCase } from '../../../application/usecases/bookings/reportProviderAbsentApplicationUseCase';
 import {
   BookingDomainError,
   getBookingCheckInCodeUseCase,
@@ -239,4 +253,36 @@ describe('BookingsController', () => {
     });
     expect(JSON.stringify(json.mock.calls[0]?.[0])).not.toContain('byUid');
   });
+
+  it('"O prestador não veio" repassa só o comprador e a reserva (D20)', async () => {
+    vi.mocked(reportProviderAbsentApplicationUseCase).mockResolvedValue(BOOKING as never);
+    const { res, status } = response();
+    await BookingsController.reportProviderAbsent(request({ params: { bookingId: 'bk_1' } }), res);
+    expect(reportProviderAbsentApplicationUseCase).toHaveBeenCalledWith(
+      { uid: 'buyer-1', admin: false },
+      'bk_1'
+    );
+    expect(status).toHaveBeenCalledWith(200);
+  });
+
+  it('resposta a "O serviço aconteceu?" só aceita sim ou não', async () => {
+    const { res, status } = response();
+    await BookingsController.answerServiceConfirmation(
+      request({ params: { bookingId: 'bk_1' }, body: { answer: 'talvez' } }),
+      res
+    );
+    expect(status).toHaveBeenCalledWith(400);
+    expect(answerServiceConfirmationApplicationUseCase).not.toHaveBeenCalled();
+    vi.mocked(answerServiceConfirmationApplicationUseCase).mockResolvedValue(BOOKING as never);
+    const ok = response();
+    await BookingsController.answerServiceConfirmation(
+      request({ params: { bookingId: 'bk_1' }, body: { answer: 'no' } }),
+      ok.res
+    );
+    expect(answerServiceConfirmationApplicationUseCase).toHaveBeenCalledWith(
+      { uid: 'buyer-1', admin: false },
+      'bk_1',
+      'no'
+    );
+  });
 });

=== server/interfaces/http/bookings/bookingsController.ts — diff ===
@@ -1,12 +1,14 @@
 import type { Response } from 'express';
 import { cancelBookingByBuyerApplicationUseCase } from '../../../application/usecases/bookings/cancelBookingByBuyerApplicationUseCase';
+import { answerServiceConfirmationApplicationUseCase } from '../../../application/usecases/bookings/answerServiceConfirmationApplicationUseCase';
 import { createBookingApplicationUseCase } from '../../../application/usecases/bookings/createBookingApplicationUseCase';
+import { markBookingNoShowApplicationUseCase } from '../../../application/usecases/bookings/markBookingNoShowApplicationUseCase';
+import { reportProviderAbsentApplicationUseCase } from '../../../application/usecases/bookings/reportProviderAbsentApplicationUseCase';
 import {
   getBookingCheckInCodeUseCase,
   getBookingForActorUseCase,
   listAvailableSlotsUseCase,
   listMyBookingsUseCase,
-  markBookingNoShowUseCase,
 } from '../../../domain/bookings';
 import type { AuthenticatedRequest } from '../../../infrastructure/auth/authenticatedRequest';
 import { handleBookingError, sendError } from './bookingHttpErrors';
@@ -17,6 +19,7 @@ import {
   DocumentIdSchema,
   IdempotencyKeyHeaderSchema,
   PageQuerySchema,
+  ServiceConfirmationAnswerSchema,
   SlotWindowQuerySchema,
 } from './schemas/bookingSchemas';
 
@@ -134,10 +137,46 @@ export class BookingsController {
     const bookingId = DocumentIdSchema.safeParse(req.params.bookingId);
     if (!bookingId.success) return sendError(res, 404, 'NOT_FOUND', 'Reserva não encontrada.');
     try {
-      const booking = await markBookingNoShowUseCase(actor, bookingId.data);
+      const booking = await markBookingNoShowApplicationUseCase(actor, bookingId.data);
       return res.status(200).json(toSellerBooking(booking));
     } catch (error) {
       return handleBookingError(res, 'markNoShow', error);
     }
   }
+
+  static async reportProviderAbsent(req: AuthenticatedRequest, res: Response): Promise<Response> {
+    const actor = actorOf(req);
+    if (!actor) return sendError(res, 401, 'UNAUTHENTICATED', 'Não autenticado.');
+    const bookingId = DocumentIdSchema.safeParse(req.params.bookingId);
+    if (!bookingId.success) return sendError(res, 404, 'NOT_FOUND', 'Reserva não encontrada.');
+    try {
+      const booking = await reportProviderAbsentApplicationUseCase(actor, bookingId.data);
+      return res.status(200).json(toBuyerBooking(booking));
+    } catch (error) {
+      return handleBookingError(res, 'reportProviderAbsent', error);
+    }
+  }
+
+  static async answerServiceConfirmation(
+    req: AuthenticatedRequest,
+    res: Response
+  ): Promise<Response> {
+    const actor = actorOf(req);
+    if (!actor) return sendError(res, 401, 'UNAUTHENTICATED', 'Não autenticado.');
+    const bookingId = DocumentIdSchema.safeParse(req.params.bookingId);
+    const body = ServiceConfirmationAnswerSchema.safeParse(req.body);
+    if (!bookingId.success || !body.success) {
+      return sendError(res, 400, 'VALIDATION_ERROR', 'Resposta inválida.');
+    }
+    try {
+      const booking = await answerServiceConfirmationApplicationUseCase(
+        actor,
+        bookingId.data,
+        body.data.answer
+      );
+      return res.status(200).json(toBuyerBooking(booking));
+    } catch (error) {
+      return handleBookingError(res, 'answerServiceConfirmation', error);
+    }
+  }
 }

=== server/interfaces/http/bookings/bookingsRoutes.ts — diff ===
@@ -17,6 +17,17 @@ bookingsRouter.get('/:bookingId', verifyAuthToken, BookingsController.get);
 bookingsRouter.get('/:bookingId/check-in-code', verifyAuthToken, BookingsController.getCheckInCode);
 bookingsRouter.post('/:bookingId/cancel', verifyAuthTokenStrict, BookingsController.cancel);
 bookingsRouter.post('/:bookingId/no-show', verifyAuthToken, BookingsController.markNoShow);
+// Relato e resposta mexem no reembolso (D20): token revogado não serve.
+bookingsRouter.post(
+  '/:bookingId/provider-absent',
+  verifyAuthTokenStrict,
+  BookingsController.reportProviderAbsent
+);
+bookingsRouter.post(
+  '/:bookingId/service-confirmation',
+  verifyAuthTokenStrict,
+  BookingsController.answerServiceConfirmation
+);
 
 export const partnerOffersRouter = Router();
 partnerOffersRouter.use(verifyAuthToken);
@@ -43,3 +54,18 @@ partnerOffersRouter.post(
   verifyAuthTokenStrict,
   PartnerOffersController.checkIn
 );
+partnerOffersRouter.post(
+  '/:offerId/bookings/:bookingId/arrival',
+  verifyAuthToken,
+  PartnerOffersController.recordArrival
+);
+partnerOffersRouter.post(
+  '/:offerId/bookings/:bookingId/check-in-without-code',
+  verifyAuthTokenStrict,
+  PartnerOffersController.checkInWithoutCode
+);
+partnerOffersRouter.post(
+  '/:offerId/bookings/:bookingId/absence-response',
+  verifyAuthTokenStrict,
+  PartnerOffersController.answerProviderAbsence
+);

=== server/interfaces/http/bookings/internalBookingsController.ts — diff ===
@@ -1,8 +1,6 @@
 import type { Request, Response } from 'express';
-import {
-  completeFinishedBookingsUseCase,
-  expireOverdueBookingsUseCase,
-} from '../../../domain/bookings';
+import { runBookingCompletionJobApplicationUseCase } from '../../../application/usecases/bookings/runBookingCompletionJobApplicationUseCase';
+import { expireOverdueBookingsUseCase } from '../../../domain/bookings';
 import { handleBookingError } from './bookingHttpErrors';
 
 // Chamados pelos jobs agendados; a chave já foi conferida pelo middleware verifyInternalJobKey.
@@ -17,7 +15,7 @@ export class InternalBookingsController {
 
   static async complete(_req: Request, res: Response): Promise<Response> {
     try {
-      return res.status(200).json({ completed: await completeFinishedBookingsUseCase(200) });
+      return res.status(200).json(await runBookingCompletionJobApplicationUseCase(200));
     } catch (error) {
       return handleBookingError(res, 'completeJob', error);
     }

=== server/interfaces/http/bookings/partnerOffersController.test.ts — diff ===
@@ -3,10 +3,25 @@ import { beforeEach, describe, expect, it, vi } from 'vitest';
 
 vi.mock('../../../domain/bookings', async () => {
   const { BookingDomainError } = await import('../../../domain/bookings/errors/bookingDomainError');
-  return { BookingDomainError, checkInBookingByCodeUseCase: vi.fn() };
+  return { BookingDomainError };
 });
+vi.mock('../../../application/usecases/bookings/checkInBookingApplicationUseCase', () => ({
+  checkInBookingApplicationUseCase: vi.fn(),
+}));
+vi.mock('../../../application/usecases/bookings/recordProviderArrivalApplicationUseCase', () => ({
+  recordProviderArrivalApplicationUseCase: vi.fn(),
+}));
+vi.mock('../../../application/usecases/bookings/checkInWithoutCodeApplicationUseCase', () => ({
+  checkInWithoutCodeApplicationUseCase: vi.fn(),
+}));
+vi.mock('../../../application/usecases/bookings/answerProviderAbsenceApplicationUseCase', () => ({
+  answerProviderAbsenceApplicationUseCase: vi.fn(),
+}));
 
-import { BookingDomainError, checkInBookingByCodeUseCase } from '../../../domain/bookings';
+import { checkInBookingApplicationUseCase as checkInBookingByCodeUseCase } from '../../../application/usecases/bookings/checkInBookingApplicationUseCase';
+import { checkInWithoutCodeApplicationUseCase } from '../../../application/usecases/bookings/checkInWithoutCodeApplicationUseCase';
+import { recordProviderArrivalApplicationUseCase } from '../../../application/usecases/bookings/recordProviderArrivalApplicationUseCase';
+import { BookingDomainError } from '../../../domain/bookings';
 import type { AuthenticatedRequest } from '../../../infrastructure/auth/authenticatedRequest';
 import { PartnerOffersController } from './partnerOffersController';
 
@@ -18,7 +33,7 @@ function response() {
 
 function request(body: unknown, uid: string | null = 'partner-1') {
   return {
-    params: { offerId: 'offer-1', slotId: 'slot-1' },
+    params: { offerId: 'offer-1', slotId: 'slot-1', bookingId: 'bk_1' },
     query: {},
     headers: {},
     body,
@@ -82,3 +97,39 @@ describe('PartnerOffersController.checkIn (D20)', () => {
     expect(json.mock.calls[0]?.[0]).toMatchObject({ error: { code: 'CHECK_IN_LOCKED' } });
   });
 });
+
+describe('PartnerOffersController — ações na reserva (D20)', () => {
+  beforeEach(() => vi.clearAllMocks());
+
+  it('"Cheguei" aceita sem localização e recusa localização fora do intervalo', async () => {
+    vi.mocked(recordProviderArrivalApplicationUseCase).mockResolvedValue({
+      id: 'bk_1',
+      lines: [],
+      offerSnapshot: { title: 'Buggy', startsAt: '', cancellationPolicy: 'flexible' },
+    } as never);
+    const ok = response();
+    await PartnerOffersController.recordArrival(request({}), ok.res);
+    expect(recordProviderArrivalApplicationUseCase).toHaveBeenCalledWith(
+      { uid: 'partner-1', admin: false },
+      'offer-1',
+      'bk_1',
+      undefined
+    );
+    const bad = response();
+    await PartnerOffersController.recordArrival(
+      request({ location: { lat: 200, lng: 0 } }),
+      bad.res
+    );
+    expect(bad.status).toHaveBeenCalledWith(400);
+  });
+
+  it('"Cliente sem código" só com motivo da lista', async () => {
+    const bad = response();
+    await PartnerOffersController.checkInWithoutCode(
+      request({ participantsPresent: 2, reason: 'esqueceu' }),
+      bad.res
+    );
+    expect(bad.status).toHaveBeenCalledWith(400);
+    expect(checkInWithoutCodeApplicationUseCase).not.toHaveBeenCalled();
+  });
+});

=== server/interfaces/http/bookings/partnerOffersController.ts — diff ===
@@ -1,9 +1,12 @@
 import type { Response } from 'express';
+import { answerProviderAbsenceApplicationUseCase } from '../../../application/usecases/bookings/answerProviderAbsenceApplicationUseCase';
+import { checkInBookingApplicationUseCase } from '../../../application/usecases/bookings/checkInBookingApplicationUseCase';
+import { checkInWithoutCodeApplicationUseCase } from '../../../application/usecases/bookings/checkInWithoutCodeApplicationUseCase';
+import { recordProviderArrivalApplicationUseCase } from '../../../application/usecases/bookings/recordProviderArrivalApplicationUseCase';
 import { cancelSlotByPartnerApplicationUseCase } from '../../../application/usecases/bookings/cancelSlotByPartnerApplicationUseCase';
 import { rescheduleSlotByPartnerApplicationUseCase } from '../../../application/usecases/bookings/rescheduleSlotByPartnerApplicationUseCase';
 import { setBookableOfferStatusApplicationUseCase } from '../../../application/usecases/bookings/setBookableOfferStatusApplicationUseCase';
 import {
-  checkInBookingByCodeUseCase,
   createAvailabilitySlotsUseCase,
   createBookableOfferUseCase,
   listOfferBookingsForPartnerUseCase,
@@ -16,11 +19,14 @@ import { handleBookingError, sendError } from './bookingHttpErrors';
 import { toPartnerOffer, toPartnerSlot, toSellerBooking } from './bookingResponses';
 import {
   CheckInByCodeSchema,
+  CheckInWithoutCodeSchema,
   CreateOfferSchema,
   CreateSlotsSchema,
   DocumentIdSchema,
   OfferStatusSchema,
   PageQuerySchema,
+  ProviderAbsenceAnswerSchema,
+  ProviderArrivalSchema,
   RescheduleSlotSchema,
   SlotWindowQuerySchema,
   UpdateOfferSchema,
@@ -196,7 +202,7 @@ export class PartnerOffersController {
       return sendError(res, 400, 'VALIDATION_ERROR', 'Dados do check-in inválidos.');
     }
     try {
-      const booking = await checkInBookingByCodeUseCase(actor, {
+      const booking = await checkInBookingApplicationUseCase(actor, {
         offerId: offerId.data,
         slotId: slotId.data,
         ...body.data,
@@ -206,4 +212,78 @@ export class PartnerOffersController {
       return handleBookingError(res, 'checkIn', error);
     }
   }
+
+  static async recordArrival(req: AuthenticatedRequest, res: Response): Promise<Response> {
+    const parsed = parseBookingAction(req, ProviderArrivalSchema);
+    if (!parsed.ok) return sendError(res, parsed.status, parsed.code, parsed.message);
+    try {
+      const booking = await recordProviderArrivalApplicationUseCase(
+        parsed.actor,
+        parsed.offerId,
+        parsed.bookingId,
+        parsed.body.location
+      );
+      return res.status(200).json(toSellerBooking(booking));
+    } catch (error) {
+      return handleBookingError(res, 'recordArrival', error);
+    }
+  }
+
+  static async checkInWithoutCode(req: AuthenticatedRequest, res: Response): Promise<Response> {
+    const parsed = parseBookingAction(req, CheckInWithoutCodeSchema);
+    if (!parsed.ok) return sendError(res, parsed.status, parsed.code, parsed.message);
+    try {
+      const booking = await checkInWithoutCodeApplicationUseCase(parsed.actor, {
+        offerId: parsed.offerId,
+        bookingId: parsed.bookingId,
+        ...parsed.body,
+      });
+      return res.status(200).json(toSellerBooking(booking));
+    } catch (error) {
+      return handleBookingError(res, 'checkInWithoutCode', error);
+    }
+  }
+
+  static async answerProviderAbsence(req: AuthenticatedRequest, res: Response): Promise<Response> {
+    const parsed = parseBookingAction(req, ProviderAbsenceAnswerSchema);
+    if (!parsed.ok) return sendError(res, parsed.status, parsed.code, parsed.message);
+    try {
+      const booking = await answerProviderAbsenceApplicationUseCase(
+        parsed.actor,
+        parsed.offerId,
+        parsed.bookingId,
+        parsed.body.answer
+      );
+      return res.status(200).json(toSellerBooking(booking));
+    } catch (error) {
+      return handleBookingError(res, 'answerProviderAbsence', error);
+    }
+  }
+}
+
+type BookingAction<T> =
+  | {
+      ok: true;
+      actor: { uid: string; admin: boolean };
+      offerId: string;
+      bookingId: string;
+      body: T;
+    }
+  | { ok: false; status: number; code: string; message: string };
+
+/** Autenticação, IDs da rota e corpo das ações do prestador numa reserva. */
+function parseBookingAction<T>(
+  req: AuthenticatedRequest,
+  schema: { safeParse(value: unknown): { success: true; data: T } | { success: false } }
+): BookingAction<T> {
+  const actor = actorOf(req);
+  if (!actor)
+    return { ok: false, status: 401, code: 'UNAUTHENTICATED', message: 'Não autenticado.' };
+  const offerId = DocumentIdSchema.safeParse(req.params.offerId);
+  const bookingId = DocumentIdSchema.safeParse(req.params.bookingId);
+  const body = schema.safeParse(req.body ?? {});
+  if (!offerId.success || !bookingId.success || !body.success) {
+    return { ok: false, status: 400, code: 'VALIDATION_ERROR', message: 'Dados inválidos.' };
+  }
+  return { ok: true, actor, offerId: offerId.data, bookingId: bookingId.data, body: body.data };
 }

=== server/interfaces/http/bookings/schemas/bookingSchemas.ts — diff ===
@@ -139,6 +139,34 @@ export const CheckInByCodeSchema = z
   })
   .strict();
 
+export const ProviderArrivalSchema = z
+  .object({
+    // Opcional: o navegador pode negar a localização, e o "Cheguei" vale mesmo assim (D20).
+    location: z
+      .object({
+        lat: z.number().min(-90).max(90),
+        lng: z.number().min(-180).max(180),
+        accuracyM: z.number().min(0).max(100_000).optional(),
+      })
+      .strict()
+      .optional(),
+  })
+  .strict();
+
+export const CheckInWithoutCodeSchema = z
+  .object({
+    participantsPresent: z.number().int().min(1).max(50),
+    // Mesma lista de NO_CODE_REASONS no domínio de reservas.
+    reason: z.enum(['no_phone', 'refused', 'other']),
+  })
+  .strict();
+
+export const ProviderAbsenceAnswerSchema = z
+  .object({ answer: z.enum(['was_there', 'admitted']) })
+  .strict();
+
+export const ServiceConfirmationAnswerSchema = z.object({ answer: z.enum(['yes', 'no']) }).strict();
+
 export const CancelBookingSchema = z.object({ reason: z.string().max(300).optional() }).strict();
 
 export const SlotWindowQuerySchema = z

VERIFICAÇÃO (obrigatória):
- `npm run typecheck`, `npx biome lint .` (0 erros; arquivos tocados sem avisos), `npm run build`;
- testes ligados aos arquivos deste prompt: `npx vitest related --run server/application/usecases/bookings/answerProviderAbsenceApplicationUseCase.ts server/application/usecases/bookings/answerServiceConfirmationApplicationUseCase.ts server/application/usecases/bookings/bookingServiceNotices.ts server/application/usecases/bookings/bookingServiceProofApplicationUseCases.test.ts server/application/usecases/bookings/bookingServiceWindow.ts server/application/usecases/bookings/checkInBookingApplicationUseCase.ts server/application/usecases/bookings/checkInWithoutCodeApplicationUseCase.ts server/application/usecases/bookings/markBookingNoShowApplicationUseCase.ts server/application/usecases/bookings/recordProviderArrivalApplicationUseCase.ts server/application/usecases/bookings/reportProviderAbsentApplicationUseCase.ts server/application/usecases/bookings/runBookingCompletionJobApplicationUseCase.ts server/domain/bookings/adapters/firestoreBookingsAdapter.ts server/domain/bookings/adapters/firestoreCheckInStore.ts server/domain/bookings/adapters/inMemoryBookingsAdapter.ts server/domain/bookings/errors/bookingDomainError.ts server/domain/bookings/factory.ts server/domain/bookings/index.ts server/domain/bookings/ports/bookingsPort.ts server/domain/bookings/services/bookingCheckInService.test.ts server/domain/bookings/services/bookingCheckInService.ts server/domain/bookings/services/bookingService.test.ts server/domain/bookings/services/bookingService.ts server/domain/bookings/services/bookingServiceProofService.test.ts server/domain/bookings/services/bookingServiceProofService.ts server/domain/bookings/types/bookingTypes.ts server/domain/bookings/usecases/checkInWithoutCodeUseCase.ts server/domain/bookings/usecases/clearBookingDeadlineUseCase.ts server/domain/bookings/usecases/completeFinishedBookingsUseCase.ts server/domain/bookings/usecases/getBookingForAbsenceReportUseCase.ts server/domain/bookings/usecases/getOpenProviderAbsenceUseCase.ts server/domain/bookings/usecases/getPendingServiceConfirmationUseCase.ts server/domain/bookings/usecases/listBookingsWithDueDeadlineUseCase.ts server/domain/bookings/usecases/recordProviderAbsenceUseCase.ts server/domain/bookings/usecases/recordProviderArrivalUseCase.ts server/domain/bookings/usecases/resolveProviderAbsenceUseCase.ts server/domain/bookings/usecases/resolveServiceConfirmationUseCase.ts server/domain/bookings/utils/checkInWindow.ts server/domain/payment/services/saleClaimService.test.ts server/domain/payment/services/saleClaimService.ts server/interfaces/http/bookings/bookingResponses.ts server/interfaces/http/bookings/bookingsController.test.ts server/interfaces/http/bookings/bookingsController.ts server/interfaces/http/bookings/bookingsRoutes.ts server/interfaces/http/bookings/internalBookingsController.ts server/interfaces/http/bookings/partnerOffersController.test.ts server/interfaces/http/bookings/partnerOffersController.ts server/interfaces/http/bookings/schemas/bookingSchemas.ts` (todos verdes). Não precisa rodar a suíte inteira.

ENTREGA: responda no formato do AGENTS.md §16.3.

LIMPEZA (obrigatória, ao terminar de implementar): apague todos os arquivos de public/assets/aistudio/, inclusive o deste prompt. São cópias dos textos colados no chat, salvas automaticamente pelo AI Studio, e public/ vai para o site publicado. Se a pasta ficar vazia, apague a pasta também.
~~~~

### Configurações manuais (você faz, fora do AI Studio, depois de aplicar este prompt)

Nenhuma.
