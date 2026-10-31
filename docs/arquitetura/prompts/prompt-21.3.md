# Prompt 21.3 — Repasse com prova do serviço, avaliação verificada e provas na fila do admin (backend)

> Lote 18, gerado dos commits de referência `ff24a4f..fbd67ff` da branch `claude/agents-md-v2`. Aplique na ordem do lote (A7, 21.1 a 21.7d), um por vez. Cole o bloco abaixo no agente do AI Studio, inteiro, de uma vez.

---

## Prompt 21.3 — Repasse com prova do serviço, avaliação verificada e provas na fila do admin (backend)

Inclui o ajuste `bookingServiceEndsAt` (fim do serviço calculado num lugar só, sai bookingServiceWindow.ts).

~~~~text
Siga o AGENTS.md. O app ainda não foi liberado para usuários: nenhum código de compatibilidade ou transição (§2.2 item 8). As regras de negócio estão nas decisões D20 e D21 de docs/arquitetura/decisoes.md (aplicadas pelo prompt A7).

IMPORTANTE: aplique os diffs abaixo EXATAMENTE, inclusive os arquivos novos. Não reescreva os arquivos do seu jeito. Arquivo tocado sai sem avisos do lint e formatado (AGENTS.md §13). Não altere firebase.json, functions/, AGENTS.md, docs/ nem .env.

O QUE MUDA:
1) bookingServiceEndsAt na fachada de reservas substitui o cálculo repetido de início + duração; bookingServiceWindow.ts é apagado.
2) Repasse de passeio, aluguel e translado nasce retido (service_proof) e é liberado pelo check-in por código, pelo "sim" do comprador, pela ausência marcada, pelo cancelamento com reembolso parcial ou pela decisão do admin.
3) Avaliação com bookingId confere o serviço e ganha o selo verificado.
4) A fila de reclamações do admin mostra check-in, Cheguei com localização, relato e resposta do comprador.
5) Endereço de busca apagado 7 dias depois do serviço e reservas anonimizadas na exclusão de conta (B35).

ARQUIVOS (crie, altere ou apague exatamente estes):
- server/application/usecases/bookings/answerServiceConfirmationApplicationUseCase.ts (alterar)
- server/application/usecases/bookings/bookingApplicationUseCases.test.ts (alterar)
- server/application/usecases/bookings/bookingServiceProofApplicationUseCases.test.ts (alterar)
- server/application/usecases/bookings/bookingServiceWindow.ts (apagar)
- server/application/usecases/bookings/cancelBookingByBuyerApplicationUseCase.ts (alterar)
- server/application/usecases/bookings/checkInBookingApplicationUseCase.ts (alterar)
- server/application/usecases/bookings/markBookingNoShowApplicationUseCase.ts (alterar)
- server/application/usecases/bookings/reconcileBookingWebhookApplicationUseCase.test.ts (alterar)
- server/application/usecases/bookings/reconcileBookingWebhookApplicationUseCase.ts (alterar)
- server/application/usecases/bookings/releaseServiceProofHold.ts (criar)
- server/application/usecases/bookings/reportProviderAbsentApplicationUseCase.ts (alterar)
- server/application/usecases/bookings/rescheduleSlotByPartnerApplicationUseCase.ts (alterar)
- server/application/usecases/bookings/runBookingCompletionJobApplicationUseCase.ts (alterar)
- server/application/usecases/deleteUserAccountApplicationUseCase.test.ts (criar)
- server/application/usecases/deleteUserAccountApplicationUseCase.ts (alterar)
- server/application/usecases/payouts/bookingServiceEvidence.ts (criar)
- server/application/usecases/payouts/decideSaleClaimApplicationUseCase.ts (alterar)
- server/application/usecases/payouts/listAdminSaleClaimsApplicationUseCase.test.ts (criar)
- server/application/usecases/payouts/listAdminSaleClaimsApplicationUseCase.ts (alterar)
- server/application/usecases/payouts/openSaleClaimApplicationUseCase.ts (alterar)
- server/application/usecases/payouts/recordPaidSalePayoutApplicationUseCase.ts (alterar)
- server/application/usecases/payouts/saleClaimApplicationUseCases.test.ts (alterar)
- server/domain/bookings/adapters/firestoreBookingsAdapter.ts (alterar)
- server/domain/bookings/adapters/firestoreCheckInStore.ts (alterar)
- server/domain/bookings/adapters/inMemoryBookingsAdapter.ts (alterar)
- server/domain/bookings/errors/bookingDomainError.ts (alterar)
- server/domain/bookings/factory.ts (alterar)
- server/domain/bookings/index.ts (alterar)
- server/domain/bookings/ports/bookingsPort.ts (alterar)
- server/domain/bookings/services/bookingCheckInService.ts (alterar)
- server/domain/bookings/services/bookingPrivacyService.test.ts (criar)
- server/domain/bookings/services/bookingPrivacyService.ts (criar)
- server/domain/bookings/services/bookingService.ts (alterar)
- server/domain/bookings/services/bookingServiceProofService.ts (alterar)
- server/domain/bookings/types/bookingTypes.ts (alterar)
- server/domain/bookings/usecases/anonymizeBuyerBookingsUseCase.ts (criar)
- server/domain/bookings/usecases/eraseExpiredPickupAddressesUseCase.ts (criar)
- server/domain/bookings/usecases/getVerifiedServiceForReviewUseCase.ts (criar)
- server/domain/bookings/utils/checkInWindow.ts (alterar)
- server/domain/bookings/utils/serviceProof.test.ts (criar)
- server/domain/bookings/utils/serviceProof.ts (criar)
- server/domain/bookings/utils/serviceTime.test.ts (criar)
- server/domain/bookings/utils/serviceTime.ts (criar)
- server/domain/payment/index.ts (alterar)
- server/domain/payment/services/payoutService.test.ts (alterar)
- server/domain/payment/services/payoutService.ts (alterar)
- server/domain/payment/types/payoutEntry.ts (alterar)
- server/domain/payment/usecases/releasePayoutHoldUseCase.ts (criar)
- server/domain/reviews/adapters/firestoreReviewAdapter.ts (alterar)
- server/domain/reviews/controllers/reviewController.ts (alterar)
- server/domain/reviews/dtos/CreateReviewDTO.ts (alterar)
- server/domain/reviews/schemas/reviewSchema.ts (alterar)
- server/domain/reviews/services/reviewService.test.ts (alterar)
- server/domain/reviews/services/reviewService.ts (alterar)

Aplique as mudanças abaixo EXATAMENTE como estão (formato unified diff: linhas com "-" saem, linhas com "+" entram; as demais são contexto para localizar o trecho). Não reformate outros trechos dos arquivos.

=== server/application/usecases/bookings/answerServiceConfirmationApplicationUseCase.ts — diff ===
@@ -3,11 +3,12 @@ import {
   type BookingActor,
   getPendingServiceConfirmationUseCase,
   resolveServiceConfirmationUseCase,
+  bookingServiceEndsAt,
 } from '../../../domain/bookings';
 import { decideSaleClaimUseCase, openSaleClaimUseCase } from '../../../domain/payment';
 import { SYSTEM_ACTOR } from './answerProviderAbsenceApplicationUseCase';
-import { bookingServiceWindow } from './bookingServiceWindow';
 import { sendBookingServiceNotice } from './bookingServiceNotices';
+import { releaseServiceProofHold } from './releaseServiceProofHold';
 
 /**
  * Resposta do comprador a "O serviço aconteceu?" (D20). Sim vale como check-in confirmado. Não abre a
@@ -21,18 +22,21 @@ export async function answerServiceConfirmationApplicationUseCase(
 ): Promise<Booking> {
   const booking = await getPendingServiceConfirmationUseCase(actor, bookingId);
   if (answer === 'yes') {
-    return resolveServiceConfirmationUseCase(
+    const confirmed = await resolveServiceConfirmationUseCase(
       booking.id,
       { answer, resolution: 'confirmed' },
       actor.uid
     );
+    await releaseServiceProofHold(booking.id);
+    return confirmed;
   }
   const claim = await openSaleClaimUseCase({
     referenceType: 'booking',
     referenceId: booking.id,
     buyerUid: actor.uid,
     reason: 'did_not_happen',
-    ...bookingServiceWindow(booking),
+    serviceStartsAt: booking.offerSnapshot.startsAt,
+    serviceEndsAt: bookingServiceEndsAt(booking),
     // A pergunta dura 72 h e passa das 48 h da reclamação comum.
     allowAfterWindow: true,
   });

=== server/application/usecases/bookings/bookingApplicationUseCases.test.ts — diff ===
@@ -3,6 +3,8 @@ import { beforeEach, describe, expect, it, vi } from 'vitest';
 vi.mock('../../../domain/bookings', async () => {
   const { BookingDomainError } = await import('../../../domain/bookings/errors/bookingDomainError');
   return {
+    bookingServiceEndsAt: (await import('../../../domain/bookings/utils/serviceTime'))
+      .bookingServiceEndsAt,
     BookingDomainError,
     createPendingBookingUseCase: vi.fn(),
     cancelPendingBookingUseCase: vi.fn().mockResolvedValue({}),
@@ -15,6 +17,7 @@ vi.mock('../../../domain/bookings', async () => {
 vi.mock('../../../domain/payment', () => ({
   createMarketplacePaymentIntentUseCase: vi.fn(),
   processProviderRefundUseCase: vi.fn().mockResolvedValue({}),
+  releasePayoutHoldUseCase: vi.fn().mockResolvedValue(null),
   reschedulePayoutUseCase: vi.fn().mockResolvedValue(null),
 }));
 vi.mock('../payouts/chargeCancellationPenaltyApplicationUseCase', () => ({

=== server/application/usecases/bookings/bookingServiceProofApplicationUseCases.test.ts — diff ===
@@ -1,9 +1,12 @@
 import { beforeEach, describe, expect, it, vi } from 'vitest';
 
-vi.mock('../../../domain/bookings', () => ({
+vi.mock('../../../domain/bookings', async () => ({
+  bookingServiceEndsAt: (await import('../../../domain/bookings/utils/serviceTime'))
+    .bookingServiceEndsAt,
   checkInBookingByCodeUseCase: vi.fn(),
   clearBookingDeadlineUseCase: vi.fn(),
   completeFinishedBookingsUseCase: vi.fn(),
+  eraseExpiredPickupAddressesUseCase: vi.fn().mockResolvedValue(0),
   getBookingForAbsenceReportUseCase: vi.fn(),
   getOpenProviderAbsenceUseCase: vi.fn(),
   getPendingServiceConfirmationUseCase: vi.fn(),
@@ -16,7 +19,12 @@ vi.mock('../../../domain/payment', async () => {
   const { PaymentDomainError } = await import(
     '../../../domain/payment/services/stripePaymentService'
   );
-  return { PaymentDomainError, decideSaleClaimUseCase: vi.fn(), openSaleClaimUseCase: vi.fn() };
+  return {
+    PaymentDomainError,
+    decideSaleClaimUseCase: vi.fn(),
+    openSaleClaimUseCase: vi.fn(),
+    releasePayoutHoldUseCase: vi.fn(),
+  };
 });
 vi.mock('../../../domain/notifications', () => ({
   createNotificationUseCase: vi.fn().mockResolvedValue(true),
@@ -41,6 +49,7 @@ import {
   decideSaleClaimUseCase,
   openSaleClaimUseCase,
   PaymentDomainError,
+  releasePayoutHoldUseCase,
 } from '../../../domain/payment';
 import { decideSaleClaimApplicationUseCase } from '../payouts/decideSaleClaimApplicationUseCase';
 import { answerProviderAbsenceApplicationUseCase } from './answerProviderAbsenceApplicationUseCase';
@@ -149,6 +158,8 @@ describe('prova do serviço na camada application (D20)', () => {
     expect(decideSaleClaimUseCase).toHaveBeenCalledWith('claim_booking_bk_1', 'system', {
       outcome: 'release',
     });
+    // O check-in é a prova do serviço: o repasse deixa de esperar (D20).
+    expect(releasePayoutHoldUseCase).toHaveBeenCalledWith('booking', 'bk_1', 'service_proof');
     expect(resolveProviderAbsenceUseCase).toHaveBeenCalledWith(
       'bk_1',
       { resolution: 'withdrawn' },
@@ -165,6 +176,7 @@ describe('prova do serviço na camada application (D20)', () => {
       { answer: 'yes', resolution: 'confirmed' },
       'buyer-1'
     );
+    expect(releasePayoutHoldUseCase).toHaveBeenCalledWith('booking', 'bk_1', 'service_proof');
   });
 
   it('comprador responde não depois de "Cliente sem código": reclamação vai ao admin', async () => {
@@ -223,7 +235,12 @@ describe('prova do serviço na camada application (D20)', () => {
     ] as never);
     vi.mocked(openSaleClaimUseCase).mockResolvedValue({ id: 'claim_unconfirmed' } as never);
     const result = await runBookingCompletionJobApplicationUseCase(200);
-    expect(result).toEqual({ completed: 2, askedToConfirm: 1, deadlinesProcessed: 2 });
+    expect(result).toEqual({
+      completed: 2,
+      askedToConfirm: 1,
+      deadlinesProcessed: 2,
+      pickupAddressesErased: 0,
+    });
     expect(createNotificationUseCase).toHaveBeenCalledWith(
       notified('buyer-1', 'O serviço aconteceu?')
     );

=== server/application/usecases/bookings/bookingServiceWindow.ts — APAGUE este arquivo ===

=== server/application/usecases/bookings/cancelBookingByBuyerApplicationUseCase.ts — diff ===
@@ -1,5 +1,6 @@
 import { type BookingActor, requestCancellationByBuyerUseCase } from '../../../domain/bookings';
 import { processProviderRefundUseCase } from '../../../domain/payment';
+import { releaseServiceProofHold } from './releaseServiceProofHold';
 
 /**
  * Cancela pela política exibida antes da compra. O reembolso usa chave idempotente, então repetir a
@@ -19,6 +20,8 @@ export async function cancelBookingByBuyerApplicationUseCase(
       metadata: { referenceType: 'booking_refund', bookingId },
     });
   }
+  // Cancelada, não há serviço a provar: a parte que fica com o proprietário pela política segue (D20).
+  await releaseServiceProofHold(bookingId);
   return {
     status: result.booking.status,
     refundPercent: result.refundPercent,

=== server/application/usecases/bookings/checkInBookingApplicationUseCase.ts — diff ===
@@ -7,16 +7,19 @@ import {
 } from '../../../domain/bookings';
 import { decideSaleClaimUseCase } from '../../../domain/payment';
 import { SYSTEM_ACTOR } from './answerProviderAbsenceApplicationUseCase';
+import { releaseServiceProofHold } from './releaseServiceProofHold';
 
 /**
  * Check-in com o código (D20). Se o comprador já tinha relatado "O prestador não veio", o check-in
- * prova que o prestador chegou: a reclamação é encerrada sem reembolso e o serviço segue normal.
+ * prova que o prestador chegou: a reclamação é encerrada sem reembolso e o serviço segue normal. O
+ * check-in é a prova do serviço: o repasse deixa de esperar por ela.
  */
 export async function checkInBookingApplicationUseCase(
   actor: BookingActor,
   input: CheckInByCodeInput
 ): Promise<Booking> {
   const booking = await checkInBookingByCodeUseCase(actor, input);
+  await releaseServiceProofHold(booking.id);
   const absence = booking.providerAbsence;
   if (absence && !absence.resolution) {
     await decideSaleClaimUseCase(absence.claimId, SYSTEM_ACTOR, { outcome: 'release' });

=== server/application/usecases/bookings/markBookingNoShowApplicationUseCase.ts — ARQUIVO REESCRITO, substitua todo o conteúdo por este ===
import {
  type Booking,
  type BookingActor,
  markBookingNoShowUseCase,
} from '../../../domain/bookings';
import { sendBookingServiceNotice } from './bookingServiceNotices';
import { releaseServiceProofHold } from './releaseServiceProofHold';

/** "Cliente não apareceu" e aviso ao comprador, que pode contestar pela reclamação (D16, D20). */
export async function markBookingNoShowApplicationUseCase(
  actor: BookingActor,
  bookingId: string
): Promise<Booking> {
  const booking = await markBookingNoShowUseCase(actor, bookingId);
  // A ausência é a prova (D20); se o comprador contestar, a reclamação retém o repasse.
  await releaseServiceProofHold(booking.id);
  await sendBookingServiceNotice(booking.buyerId, 'noShowMarked');
  return booking;
}

=== server/application/usecases/bookings/reconcileBookingWebhookApplicationUseCase.test.ts — diff ===
@@ -3,6 +3,10 @@ import { beforeEach, describe, expect, it, vi } from 'vitest';
 vi.mock('../../../domain/bookings', async () => {
   const { BookingDomainError } = await import('../../../domain/bookings/errors/bookingDomainError');
   return {
+    requiresServiceProof: (await import('../../../domain/bookings/utils/serviceProof'))
+      .requiresServiceProof,
+    bookingServiceEndsAt: (await import('../../../domain/bookings/utils/serviceTime'))
+      .bookingServiceEndsAt,
     BookingDomainError,
     confirmBookingPaymentUseCase: vi.fn(),
     getBookingUseCase: vi.fn(),
@@ -55,6 +59,7 @@ describe('reconcileBookingWebhookApplicationUseCase', () => {
     vi.mocked(confirmBookingPaymentUseCase).mockResolvedValue({
       id: 'bk_1',
       sellerPartnerId: 'p1',
+      kind: 'tour',
       participantsCount: 2,
       totalMinor: 30000,
       platformFeeMinor: 4500,
@@ -77,6 +82,8 @@ describe('reconcileBookingWebhookApplicationUseCase', () => {
       platformFeeMinor: 4500,
       serviceEndsAt: '2026-11-10T16:00:00.000Z',
       title: 'Passeio',
+      // D20: o repasse do passeio nasce retido até a prova do serviço.
+      holdReasons: ['service_proof'],
     });
     expect(createNotificationUseCase).toHaveBeenCalledWith(
       expect.objectContaining({ recipientPartnerId: 'p1' })

=== server/application/usecases/bookings/reconcileBookingWebhookApplicationUseCase.ts — diff ===
@@ -1,6 +1,8 @@
 import { recordPaidSalePayoutApplicationUseCase } from '../payouts/recordPaidSalePayoutApplicationUseCase';
 import {
   BookingDomainError,
+  bookingServiceEndsAt,
+  requiresServiceProof,
   confirmBookingPaymentUseCase,
   getBookingUseCase,
   markBookingDisputedUseCase,
@@ -20,10 +22,6 @@ function readMetadata(obj: Record<string, unknown>): Record<string, string> {
   return (obj.metadata as Record<string, string> | undefined) ?? {};
 }
 
-function serviceEndsAt(startsAt: string, durationMinutes: number | undefined): string {
-  return new Date(new Date(startsAt).getTime() + (durationMinutes ?? 0) * 60_000).toISOString();
-}
-
 async function handlePaymentSucceeded(
   paymentIntent: Record<string, unknown>,
   bookingId: string
@@ -39,10 +37,9 @@ async function handlePaymentSucceeded(
       serviceFeeMinor: 0,
       platformFeeMinor: booking.platformFeeMinor,
       title: booking.offerSnapshot.title,
-      serviceEndsAt: serviceEndsAt(
-        booking.offerSnapshot.startsAt,
-        booking.offerSnapshot.durationMinutes
-      ),
+      serviceEndsAt: bookingServiceEndsAt(booking),
+      // D20: o repasse espera a prova de que o serviço aconteceu (check-in ou "sim" do comprador).
+      ...(requiresServiceProof(booking.kind) ? { holdReasons: ['service_proof' as const] } : {}),
     });
     await createNotificationUseCase({
       recipientPartnerId: booking.sellerPartnerId,

=== server/application/usecases/bookings/releaseServiceProofHold.ts — ARQUIVO NOVO, conteúdo completo ===
import { releasePayoutHoldUseCase } from '../../../domain/payment';

/** A reserva ganhou a prova do serviço ou uma decisão final: o repasse deixa de esperar por ela (D20). */
export async function releaseServiceProofHold(bookingId: string): Promise<void> {
  await releasePayoutHoldUseCase('booking', bookingId, 'service_proof');
}

=== server/application/usecases/bookings/reportProviderAbsentApplicationUseCase.ts — diff ===
@@ -3,9 +3,9 @@ import {
   type BookingActor,
   getBookingForAbsenceReportUseCase,
   recordProviderAbsenceUseCase,
+  bookingServiceEndsAt,
 } from '../../../domain/bookings';
 import { openSaleClaimUseCase } from '../../../domain/payment';
-import { bookingServiceWindow } from './bookingServiceWindow';
 import { sendBookingServiceNotice } from './bookingServiceNotices';
 
 /**
@@ -22,7 +22,8 @@ export async function reportProviderAbsentApplicationUseCase(
     referenceId: booking.id,
     buyerUid: actor.uid,
     reason: 'did_not_happen',
-    ...bookingServiceWindow(booking),
+    serviceStartsAt: booking.offerSnapshot.startsAt,
+    serviceEndsAt: bookingServiceEndsAt(booking),
   });
   const recorded = await recordProviderAbsenceUseCase(actor, booking.id, claim.id);
   await sendBookingServiceNotice(recorded.sellerPartnerId, 'absenceReported');

=== server/application/usecases/bookings/rescheduleSlotByPartnerApplicationUseCase.ts — ARQUIVO REESCRITO, substitua todo o conteúdo por este ===
import {
  type BookingActor,
  bookingServiceEndsAt,
  rescheduleSlotByPartnerUseCase,
} from '../../../domain/bookings';
import { reschedulePayoutUseCase } from '../../../domain/payment';

/**
 * Horário remarcado pelo parceiro (D16, 4A): as reservas valem na nova data e o repasse acompanha a nova
 * data. Sem multa; o comprador tem 7 dias depois do aviso para cancelar com reembolso integral.
 */
export async function rescheduleSlotByPartnerApplicationUseCase(
  actor: BookingActor,
  offerId: string,
  slotId: string,
  change: { startsAt: string; endsAt?: string; reason: string }
): Promise<{ rescheduledBookings: number }> {
  const moved = await rescheduleSlotByPartnerUseCase(actor, offerId, slotId, change);
  for (const booking of moved) {
    if (booking.status !== 'confirmed') continue;
    await reschedulePayoutUseCase('booking', booking.id, bookingServiceEndsAt(booking));
  }
  // TODO: avisar os compradores quando notifications aceitar destinatário usuário (débito B13).
  return { rescheduledBookings: moved.length };
}

=== server/application/usecases/bookings/runBookingCompletionJobApplicationUseCase.ts — diff ===
@@ -2,8 +2,10 @@ import {
   type Booking,
   clearBookingDeadlineUseCase,
   completeFinishedBookingsUseCase,
+  eraseExpiredPickupAddressesUseCase,
   listBookingsWithDueDeadlineUseCase,
   resolveServiceConfirmationUseCase,
+  bookingServiceEndsAt,
 } from '../../../domain/bookings';
 import {
   decideSaleClaimUseCase,
@@ -11,13 +13,13 @@ import {
   PaymentDomainError,
 } from '../../../domain/payment';
 import { refundProviderAbsence, SYSTEM_ACTOR } from './answerProviderAbsenceApplicationUseCase';
-import { bookingServiceWindow } from './bookingServiceWindow';
 import { sendBookingServiceNotice } from './bookingServiceNotices';
 
 export interface BookingCompletionJobResult {
   completed: number;
   askedToConfirm: number;
   deadlinesProcessed: number;
+  pickupAddressesErased: number;
 }
 
 /** 72 h sem resposta a "O serviço aconteceu?": reembolso integral ao comprador (D20). */
@@ -29,7 +31,8 @@ async function refundUnconfirmedService(booking: Booking): Promise<void> {
       referenceId: booking.id,
       buyerUid: booking.buyerId,
       reason: 'did_not_happen',
-      ...bookingServiceWindow(booking),
+      serviceStartsAt: booking.offerSnapshot.startsAt,
+      serviceEndsAt: bookingServiceEndsAt(booking),
       allowAfterWindow: true,
     });
     claimId = claim.id;
@@ -71,7 +74,8 @@ async function processDeadline(booking: Booking): Promise<void> {
 
 /**
  * Job de conclusão das reservas (D20): conclui as que terminaram, pergunta ao comprador quando falta a
- * prova do serviço e aplica os prazos vencidos. Uma reserva com erro não trava as demais.
+ * prova do serviço, aplica os prazos vencidos e apaga os endereços de busca vencidos. Uma reserva
+ * com erro não trava as demais.
  */
 export async function runBookingCompletionJobApplicationUseCase(
   limit = 200
@@ -92,5 +96,11 @@ export async function runBookingCompletionJobApplicationUseCase(
       });
     }
   }
-  return { completed, askedToConfirm: askedToConfirm.length, deadlinesProcessed };
+  const pickupAddressesErased = await eraseExpiredPickupAddressesUseCase(limit);
+  return {
+    completed,
+    askedToConfirm: askedToConfirm.length,
+    deadlinesProcessed,
+    pickupAddressesErased,
+  };
 }

=== server/application/usecases/deleteUserAccountApplicationUseCase.test.ts — ARQUIVO NOVO, conteúdo completo ===
import { describe, expect, it, vi } from 'vitest';

vi.mock('../../domain/bookings', () => ({ anonymizeBuyerBookingsUseCase: vi.fn() }));
vi.mock('../../domain/guide', () => ({ deleteResourcesByOwnerUseCase: vi.fn() }));
vi.mock('../../domain/events', () => ({ deleteEventsByOwnerUseCase: vi.fn() }));
vi.mock('../../domain/partners', () => ({
  deleteOwnerListingPlansUseCase: vi.fn(),
  deleteOwnerListingVerificationsUseCase: vi.fn(),
  deletePartnerProfileUseCase: vi.fn(),
}));
vi.mock('../../domain/payment', () => ({ cancelPartnerPlanSubscriptionsUseCase: vi.fn() }));
vi.mock('../../domain/reviews', () => ({ deleteReviewsByUserUseCase: vi.fn() }));
vi.mock('../../domain/users', () => ({ deleteUserAccountUseCase: vi.fn() }));
vi.mock('./listingVerification/deleteVerificationFiles', () => ({
  deleteVerificationFiles: vi.fn(),
}));

import { deleteUserAccountApplicationUseCase } from './deleteUserAccountApplicationUseCase';

describe('deleteUserAccountApplicationUseCase', () => {
  it('anonimiza as reservas do comprador antes de apagar a conta (§7.5, D20)', async () => {
    const calls: string[] = [];
    const step = (name: string) => async () => {
      calls.push(name);
    };
    await deleteUserAccountApplicationUseCase('user-1', {
      deleteReviewsByUser: step('reviews'),
      deleteResourcesByOwner: step('resources'),
      anonymizeBuyerBookings: step('bookings'),
      deletePartnerProfile: step('partner'),
      deleteUserAccount: step('account'),
    });
    expect(calls).toEqual(['reviews', 'resources', 'bookings', 'partner', 'account']);
  });

  it('exige o UID', async () => {
    await expect(
      deleteUserAccountApplicationUseCase('', {
        deleteReviewsByUser: vi.fn(),
        deleteResourcesByOwner: vi.fn(),
        deletePartnerProfile: vi.fn(),
        deleteUserAccount: vi.fn(),
      })
    ).rejects.toThrow('UID');
  });
});

=== server/application/usecases/deleteUserAccountApplicationUseCase.ts — diff ===
@@ -1,3 +1,4 @@
+import { anonymizeBuyerBookingsUseCase } from '../../domain/bookings';
 import { deleteResourcesByOwnerUseCase } from '../../domain/guide';
 import { deleteEventsByOwnerUseCase } from '../../domain/events';
 import {
@@ -19,6 +20,8 @@ export interface UserDeletionCoordinatorDependencies {
   deleteListingVerifications?: (uid: string) => Promise<void>;
   /** Planos dos estabelecimentos (D11): cancela as assinaturas no Stripe e apaga os planos. */
   deleteListingPlans?: (uid: string) => Promise<void>;
+  /** Reservas do comprador: tira endereço e nomes e mantém o registro financeiro (§7.5, D20). */
+  anonymizeBuyerBookings?: (uid: string) => Promise<void>;
   deleteUserAccount: (uid: string) => Promise<void>;
 }
 
@@ -35,6 +38,9 @@ export async function deleteUserAccountApplicationUseCase(
       await cancelPartnerPlanSubscriptionsUseCase(id);
       await deleteOwnerListingPlansUseCase(id);
     },
+    anonymizeBuyerBookings: async (id) => {
+      await anonymizeBuyerBookingsUseCase(id);
+    },
     deleteUserAccount: (id) => deleteUserAccountUseCase(id),
   }
 ): Promise<void> {
@@ -53,6 +59,9 @@ export async function deleteUserAccountApplicationUseCase(
   if (deps.deleteListingPlans) {
     await deps.deleteListingPlans(uid);
   }
+  if (deps.anonymizeBuyerBookings) {
+    await deps.anonymizeBuyerBookings(uid);
+  }
   await deps.deletePartnerProfile(uid);
   await deps.deleteUserAccount(uid);
 }

=== server/application/usecases/payouts/bookingServiceEvidence.ts — ARQUIVO NOVO, conteúdo completo ===
import type { Booking } from '../../../domain/bookings';

/** O que o admin vê para decidir a reclamação de uma reserva (D20); só por allowlist (§7.9). */
export interface BookingServiceEvidence {
  startsAt: string;
  pickupAddress: string | null;
  checkIn: {
    at: string;
    method: 'code' | 'no_code';
    participantsPresent: number;
    participantsCount: number;
    noCodeReason: string | null;
  } | null;
  arrival: { at: string; location: { lat: number; lng: number; accuracyM?: number } | null } | null;
  providerAbsence: {
    reportedAt: string;
    answer: string | null;
    answeredAt: string | null;
  } | null;
  serviceConfirmation: { reason: string; answer: string | null } | null;
  noShow: boolean;
}

export function toBookingServiceEvidence(booking: Booking): BookingServiceEvidence {
  return {
    startsAt: booking.offerSnapshot.startsAt,
    pickupAddress: booking.pickupAddress ?? null,
    checkIn: booking.checkIn
      ? {
          at: booking.checkIn.at,
          method: booking.checkIn.method,
          participantsPresent: booking.checkIn.participantsPresent,
          participantsCount: booking.participantsCount,
          noCodeReason: booking.checkIn.noCodeReason ?? null,
        }
      : null,
    arrival: booking.arrival
      ? { at: booking.arrival.at, location: booking.arrival.location ?? null }
      : null,
    providerAbsence: booking.providerAbsence
      ? {
          reportedAt: booking.providerAbsence.reportedAt,
          answer: booking.providerAbsence.answer ?? null,
          answeredAt: booking.providerAbsence.answeredAt ?? null,
        }
      : null,
    serviceConfirmation: booking.serviceConfirmation
      ? {
          reason: booking.serviceConfirmation.reason,
          answer: booking.serviceConfirmation.answer ?? null,
        }
      : null,
    noShow: booking.status === 'no_show',
  };
}

=== server/application/usecases/payouts/decideSaleClaimApplicationUseCase.ts — diff ===
@@ -5,6 +5,7 @@ import {
   type SaleClaim,
   type SaleClaimDecision,
 } from '../../../domain/payment';
+import { releaseServiceProofHold } from '../bookings/releaseServiceProofHold';
 import { chargeCancellationPenaltyApplicationUseCase } from './chargeCancellationPenaltyApplicationUseCase';
 
 /**
@@ -45,8 +46,13 @@ export async function decideSaleClaimApplicationUseCase(
       ],
     });
   }
-  return decideSaleClaimUseCase(claimId, adminUid, {
+  const decided = await decideSaleClaimUseCase(claimId, adminUid, {
     outcome: decision.outcome,
     ...(decision.amountMinor !== undefined ? { amountMinor: decision.amountMinor } : {}),
   });
+  // D20: a decisão do admin encerra a espera pela prova do serviço; o que sobrou do repasse segue.
+  if (decided.referenceType === 'booking' && decision.outcome !== 'refund_full') {
+    await releaseServiceProofHold(decided.referenceId);
+  }
+  return decided;
 }

=== server/application/usecases/payouts/listAdminSaleClaimsApplicationUseCase.test.ts — ARQUIVO NOVO, conteúdo completo ===
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../../domain/payment', () => ({ listPendingSaleClaimsUseCase: vi.fn() }));
vi.mock('../../../domain/bookings', () => ({ getBookingUseCase: vi.fn() }));
vi.mock('../paymentAccounts/describeSellerAccountsApplicationUseCase', () => ({
  describeSellerAccountsApplicationUseCase: vi.fn().mockResolvedValue({}),
}));

import { getBookingUseCase } from '../../../domain/bookings';
import { listPendingSaleClaimsUseCase } from '../../../domain/payment';
import { listAdminSaleClaimsApplicationUseCase } from './listAdminSaleClaimsApplicationUseCase';

describe('listAdminSaleClaimsApplicationUseCase (D20)', () => {
  beforeEach(() => vi.clearAllMocks());

  it('reclamação de reserva traz as provas do serviço; a de ingresso não busca reserva', async () => {
    vi.mocked(listPendingSaleClaimsUseCase).mockResolvedValue({
      data: [
        { id: 'c1', referenceType: 'booking', referenceId: 'bk_1' },
        { id: 'c2', referenceType: 'ticket_order', referenceId: 'ord_1' },
      ],
      nextCursor: null,
    } as never);
    vi.mocked(getBookingUseCase).mockResolvedValue({
      id: 'bk_1',
      status: 'confirmed',
      participantsCount: 4,
      pickupAddress: 'Pousada Vila Jeri',
      offerSnapshot: { startsAt: '2026-11-10T11:00:00.000Z' },
      arrival: {
        at: '2026-11-10T11:02:00.000Z',
        byUid: 'p',
        location: { lat: -2.79, lng: -40.51 },
      },
      providerAbsence: {
        reportedAt: '2026-11-10T11:31:00.000Z',
        respondBy: 't',
        claimId: 'c1',
        answer: 'was_there',
        answeredAt: '2026-11-10T11:40:00.000Z',
      },
    } as never);
    const result = await listAdminSaleClaimsApplicationUseCase(20);
    expect(getBookingUseCase).toHaveBeenCalledTimes(1);
    expect(result.data[0]?.serviceEvidence).toEqual({
      startsAt: '2026-11-10T11:00:00.000Z',
      pickupAddress: 'Pousada Vila Jeri',
      checkIn: null,
      arrival: { at: '2026-11-10T11:02:00.000Z', location: { lat: -2.79, lng: -40.51 } },
      providerAbsence: {
        reportedAt: '2026-11-10T11:31:00.000Z',
        answer: 'was_there',
        answeredAt: '2026-11-10T11:40:00.000Z',
      },
      serviceConfirmation: null,
      noShow: false,
    });
    // Sem o ID de quem fez o "Cheguei": a allowlist só leva hora e local.
    expect(JSON.stringify(result.data[0])).not.toContain('byUid');
    expect(result.data[1]?.serviceEvidence).toBeUndefined();
  });
});

=== server/application/usecases/payouts/listAdminSaleClaimsApplicationUseCase.ts — ARQUIVO REESCRITO, substitua todo o conteúdo por este ===
import { getBookingUseCase } from '../../../domain/bookings';
import { type AdminSaleClaimView, listPendingSaleClaimsUseCase } from '../../../domain/payment';
import { describeSellerAccountsApplicationUseCase } from '../paymentAccounts/describeSellerAccountsApplicationUseCase';
import { type SellerAccountSummary, sellerOf } from '../paymentAccounts/sellerAccountSummary';
import { type BookingServiceEvidence, toBookingServiceEvidence } from './bookingServiceEvidence';

export type AdminSaleClaimQueueView = AdminSaleClaimView &
  SellerAccountSummary & { serviceEvidence?: BookingServiceEvidence };

/**
 * Fila de reclamações com o vendedor de cada venda e, nas reservas, as provas do serviço: check-in,
 * "Cheguei" com localização, relato de ausência e resposta do comprador (D20). Quem chama garante o
 * papel de admin.
 */
export async function listAdminSaleClaimsApplicationUseCase(
  limit: number,
  cursor?: string
): Promise<{ data: AdminSaleClaimQueueView[]; nextCursor: string | null }> {
  const page = await listPendingSaleClaimsUseCase(limit, cursor);
  const keys = page.data.flatMap((claim) => (claim.accountKey ? [claim.accountKey] : []));
  const [sellers, bookings] = await Promise.all([
    describeSellerAccountsApplicationUseCase(keys),
    Promise.all(
      page.data.map((claim) =>
        claim.referenceType === 'booking' ? getBookingUseCase(claim.referenceId) : null
      )
    ),
  ]);
  return {
    data: page.data.map((claim, index) => {
      const booking = bookings[index];
      return {
        ...claim,
        ...sellerOf(sellers, claim.accountKey),
        ...(booking ? { serviceEvidence: toBookingServiceEvidence(booking) } : {}),
      };
    }),
    nextCursor: page.nextCursor,
  };
}

=== server/application/usecases/payouts/openSaleClaimApplicationUseCase.ts — diff ===
@@ -1,4 +1,4 @@
-import { getBookingUseCase } from '../../../domain/bookings';
+import { bookingServiceEndsAt, getBookingUseCase } from '../../../domain/bookings';
 import { getEventListingByIdUseCase } from '../../../domain/events';
 import { createNotificationUseCase } from '../../../domain/notifications';
 import {
@@ -48,10 +48,9 @@ async function bookingSale(actor: OrchestrationActor, bookingId: string): Promis
   if (!['confirmed', 'completed', 'no_show'].includes(booking.status)) {
     throw new PaymentDomainError('CLAIM_NOT_ALLOWED', 'Esta compra não tem valor a reclamar.', 422);
   }
-  const { startsAt, durationMinutes } = booking.offerSnapshot;
   return {
-    startsAt,
-    endsAt: new Date(new Date(startsAt).getTime() + (durationMinutes ?? 0) * 60_000).toISOString(),
+    startsAt: booking.offerSnapshot.startsAt,
+    endsAt: bookingServiceEndsAt(booking),
     sellerPartnerId: booking.sellerPartnerId,
   };
 }

=== server/application/usecases/payouts/recordPaidSalePayoutApplicationUseCase.ts — diff ===
@@ -1,4 +1,4 @@
-import { recordSalePayoutUseCase } from '../../../domain/payment';
+import { type PayoutHoldReason, recordSalePayoutUseCase } from '../../../domain/payment';
 
 export interface PaidSale {
   referenceType: 'ticket_order' | 'booking';
@@ -8,6 +8,7 @@ export interface PaidSale {
   platformFeeMinor: number;
   serviceEndsAt: string;
   title?: string;
+  holdReasons?: PayoutHoldReason[];
 }
 
 /**

=== server/application/usecases/payouts/saleClaimApplicationUseCases.test.ts — diff ===
@@ -1,6 +1,10 @@
 import { beforeEach, describe, expect, it, vi } from 'vitest';
 
-vi.mock('../../../domain/bookings', () => ({ getBookingUseCase: vi.fn() }));
+vi.mock('../../../domain/bookings', async () => ({
+  bookingServiceEndsAt: (await import('../../../domain/bookings/utils/serviceTime'))
+    .bookingServiceEndsAt,
+  getBookingUseCase: vi.fn(),
+}));
 vi.mock('../../../domain/events', () => ({
   getEventListingByIdUseCase: vi.fn().mockResolvedValue({ ownerId: 'partner-1' }),
 }));

=== server/domain/bookings/adapters/firestoreBookingsAdapter.ts — diff ===
@@ -114,6 +114,9 @@ export class FirestoreBookingsAdapter implements BookingsPort {
   readonly listBookingsWithDeadlineBefore = this.checkIns.listBookingsWithDeadlineBefore.bind(
     this.checkIns
   );
+  readonly listBookingsWithPickupAddressEraseBefore =
+    this.checkIns.listBookingsWithPickupAddressEraseBefore.bind(this.checkIns);
+  readonly deleteParticipants = this.checkIns.deleteParticipants.bind(this.checkIns);
 
   async reserveCapacityAndCreateBooking(
     booking: Booking,

=== server/domain/bookings/adapters/firestoreCheckInStore.ts — diff ===
@@ -6,6 +6,7 @@ import {
   BOOKINGS,
   CHECK_IN_FAILURES,
   nowIso,
+  PARTICIPANTS,
   readBooking,
   writeAudit,
 } from './firestoreBookingsShared';
@@ -84,4 +85,29 @@ export class FirestoreCheckInStore {
       .get();
     return snapshot.docs.map((doc) => BookingPersistenceMapper.toDomain(doc.id, doc.data()));
   }
+
+  async listBookingsWithPickupAddressEraseBefore(
+    nowIsoValue: string,
+    limit: number
+  ): Promise<Booking[]> {
+    const snapshot = await adminDb
+      .collection(BOOKINGS)
+      .where('pickupAddressEraseAt', '<=', nowIsoValue)
+      .orderBy('pickupAddressEraseAt', 'asc')
+      .limit(limit)
+      .get();
+    return snapshot.docs.map((doc) => BookingPersistenceMapper.toDomain(doc.id, doc.data()));
+  }
+
+  async deleteParticipants(bookingId: string): Promise<void> {
+    const snapshot = await adminDb
+      .collection(PARTICIPANTS)
+      .where('bookingId', '==', bookingId)
+      .limit(60)
+      .get();
+    if (snapshot.empty) return;
+    const batch = adminDb.batch();
+    for (const doc of snapshot.docs) batch.delete(doc.ref);
+    await batch.commit();
+  }
 }

=== server/domain/bookings/adapters/inMemoryBookingsAdapter.ts — diff ===
@@ -229,6 +229,14 @@ export class InMemoryBookingsAdapter implements BookingsPort {
       .sort((a, b) => (a.deadline?.at ?? '').localeCompare(b.deadline?.at ?? ''))
       .slice(0, limit);
   }
+  async listBookingsWithPickupAddressEraseBefore(nowIso: string, limit: number) {
+    return [...this.bookings.values()]
+      .filter((b) => b.pickupAddressEraseAt && b.pickupAddressEraseAt <= nowIso)
+      .slice(0, limit);
+  }
+  async deleteParticipants(bookingId: string) {
+    this.participants.delete(bookingId);
+  }
   async countCheckInFailures(slotId: string, sinceIso: string) {
     return this.checkInFailures.filter((f) => f.slotId === slotId && f.at >= sinceIso).length;
   }

=== server/domain/bookings/errors/bookingDomainError.ts — diff ===
@@ -19,7 +19,8 @@ export type BookingErrorCode =
   | 'CHECK_IN_LOCKED'
   | 'NO_SHOW_TOO_EARLY'
   | 'ABSENCE_REPORT_NOT_ALLOWED'
-  | 'NOTHING_TO_ANSWER';
+  | 'NOTHING_TO_ANSWER'
+  | 'SERVICE_NOT_VERIFIED';
 
 const STATUS_BY_CODE: Record<BookingErrorCode, number> = {
   VALIDATION_ERROR: 400,
@@ -43,6 +44,7 @@ const STATUS_BY_CODE: Record<BookingErrorCode, number> = {
   NO_SHOW_TOO_EARLY: 422,
   ABSENCE_REPORT_NOT_ALLOWED: 422,
   NOTHING_TO_ANSWER: 409,
+  SERVICE_NOT_VERIFIED: 422,
 };
 
 export class BookingDomainError extends Error {

=== server/domain/bookings/factory.ts — diff ===
@@ -1,6 +1,7 @@
 import { FirestoreBookingsAdapter } from './adapters/firestoreBookingsAdapter';
 import { GuideBookableItemLookupAdapter } from './adapters/guideBookableItemLookupAdapter';
 import { BookingCheckInService } from './services/bookingCheckInService';
+import { BookingPrivacyService } from './services/bookingPrivacyService';
 import { BookingService } from './services/bookingService';
 import { BookingServiceProofService } from './services/bookingServiceProofService';
 import { OfferService } from './services/offerService';
@@ -9,6 +10,7 @@ let offerService: OfferService | null = null;
 let bookingService: BookingService | null = null;
 let checkInService: BookingCheckInService | null = null;
 let serviceProofService: BookingServiceProofService | null = null;
+let privacyService: BookingPrivacyService | null = null;
 let port: FirestoreBookingsAdapter | null = null;
 
 function getPort(): FirestoreBookingsAdapter {
@@ -35,3 +37,8 @@ export function getBookingServiceProofService(): BookingServiceProofService {
   serviceProofService ??= new BookingServiceProofService(getPort());
   return serviceProofService;
 }
+
+export function getBookingPrivacyService(): BookingPrivacyService {
+  privacyService ??= new BookingPrivacyService(getPort());
+  return privacyService;
+}

=== server/domain/bookings/index.ts — diff ===
@@ -1,3 +1,34 @@
+export { BookingDomainError, type BookingErrorCode } from './errors/bookingDomainError';
+export type { PageRequest } from './ports/bookingsPort';
+export type { CheckInByCodeInput, CheckInCodeView } from './services/bookingCheckInService';
+export type {
+  BookingDetails,
+  BuyerCancellationResult,
+  CreatePendingBookingInput,
+} from './services/bookingService';
+export type { CheckInWithoutCodeInput } from './services/bookingServiceProofService';
+export type { CreateSlotsInput, OfferInput } from './services/offerService';
+export {
+  type AvailabilitySlot,
+  type BookableOffer,
+  type BookableOfferKind,
+  type BookableOfferStatus,
+  type Booking,
+  type BookingActor,
+  type BookingArrival,
+  type BookingCheckIn,
+  type BookingParticipant,
+  type BookingProviderAbsence,
+  type BookingServiceConfirmation,
+  type BookingStatus,
+  canTransitionBooking,
+  type LocalizedText,
+  NO_CODE_REASONS,
+  type NoCodeReason,
+  type Page,
+  type PublicSlot,
+} from './types/bookingTypes';
+export { anonymizeBuyerBookingsUseCase } from './usecases/anonymizeBuyerBookingsUseCase';
 export { cancelBookingForCanceledSlotUseCase } from './usecases/cancelBookingForCanceledSlotUseCase';
 export { cancelPendingBookingUseCase } from './usecases/cancelPendingBookingUseCase';
 export { cancelSlotByPartnerUseCase } from './usecases/cancelSlotByPartnerUseCase';
@@ -9,11 +40,13 @@ export { confirmBookingPaymentUseCase } from './usecases/confirmBookingPaymentUs
 export { createAvailabilitySlotsUseCase } from './usecases/createAvailabilitySlotsUseCase';
 export { createBookableOfferUseCase } from './usecases/createBookableOfferUseCase';
 export { createPendingBookingUseCase } from './usecases/createPendingBookingUseCase';
+export { eraseExpiredPickupAddressesUseCase } from './usecases/eraseExpiredPickupAddressesUseCase';
 export { expireOverdueBookingsUseCase } from './usecases/expireOverdueBookingsUseCase';
 export { getBookingCheckInCodeUseCase } from './usecases/getBookingCheckInCodeUseCase';
 export { getBookingForAbsenceReportUseCase } from './usecases/getBookingForAbsenceReportUseCase';
 export { getBookingForActorUseCase } from './usecases/getBookingForActorUseCase';
 export { getBookingUseCase } from './usecases/getBookingUseCase';
+export { getVerifiedServiceForReviewUseCase } from './usecases/getVerifiedServiceForReviewUseCase';
 export { getOpenProviderAbsenceUseCase } from './usecases/getOpenProviderAbsenceUseCase';
 export { getPendingServiceConfirmationUseCase } from './usecases/getPendingServiceConfirmationUseCase';
 export { getPublicOfferSummaryUseCase } from './usecases/getPublicOfferSummaryUseCase';
@@ -36,34 +69,6 @@ export { resolveProviderAbsenceUseCase } from './usecases/resolveProviderAbsence
 export { resolveServiceConfirmationUseCase } from './usecases/resolveServiceConfirmationUseCase';
 export { setBookableOfferStatusUseCase } from './usecases/setBookableOfferStatusUseCase';
 export { updateBookableOfferUseCase } from './usecases/updateBookableOfferUseCase';
-export { BookingDomainError, type BookingErrorCode } from './errors/bookingDomainError';
-export type { PageRequest } from './ports/bookingsPort';
-export type { CheckInByCodeInput, CheckInCodeView } from './services/bookingCheckInService';
-export type { CheckInWithoutCodeInput } from './services/bookingServiceProofService';
-export type {
-  BookingDetails,
-  BuyerCancellationResult,
-  CreatePendingBookingInput,
-} from './services/bookingService';
-export type { CreateSlotsInput, OfferInput } from './services/offerService';
-export {
-  type AvailabilitySlot,
-  type BookableOffer,
-  type BookableOfferKind,
-  type BookableOfferStatus,
-  type Booking,
-  type BookingActor,
-  type BookingArrival,
-  type BookingCheckIn,
-  type BookingProviderAbsence,
-  type BookingServiceConfirmation,
-  type BookingParticipant,
-  type BookingStatus,
-  canTransitionBooking,
-  type LocalizedText,
-  NO_CODE_REASONS,
-  type NoCodeReason,
-  type Page,
-  type PublicSlot,
-} from './types/bookingTypes';
 export { priceBookingLines } from './utils/bookingPricing';
+export { hasServiceProof, requiresServiceProof } from './utils/serviceProof';
+export { bookingServiceEndsAt } from './utils/serviceTime';

=== server/domain/bookings/ports/bookingsPort.ts — diff ===
@@ -88,6 +88,11 @@ export interface BookingsPort {
   /** Reservas com prazo (`deadline.at`) vencido até `nowIso`, do mais antigo para o mais novo. */
   listBookingsWithDeadlineBefore(nowIso: string, limit: number): Promise<Booking[]>;
 
+  /** Reservas com endereço de busca a apagar até `nowIso` (D20, §7.5). */
+  listBookingsWithPickupAddressEraseBefore(nowIso: string, limit: number): Promise<Booking[]>;
+  /** Apaga os nomes dos participantes da reserva (exclusão de conta, §7.5). */
+  deleteParticipants(bookingId: string): Promise<void>;
+
   getBooking(bookingId: string): Promise<Booking | null>;
   getParticipants(bookingId: string): Promise<BookingParticipant[]>;
   listBookingsByBuyer(buyerId: string, page: PageRequest): Promise<Page<Booking>>;

=== server/domain/bookings/services/bookingCheckInService.ts — diff ===
@@ -18,6 +18,7 @@ import {
   checkInCodeVisibleFromMs,
   checkInWindow,
 } from '../utils/checkInWindow';
+import { hasServiceProof } from '../utils/serviceProof';
 
 // Check-in sem internet chega depois: aceita até 24 h de atraso e 1 min de relógio adiantado.
 const OFFLINE_MAX_DELAY_MS = 24 * 60 * 60 * 1000;
@@ -145,8 +146,10 @@ export class BookingCheckInService {
     return this.port.recordCheckIn(match.id, checkIn);
   }
 
+  /** Prova do serviço para a contestação no cartão (D16, D20): o "Cliente sem código" não conta. */
   async hasCheckIn(bookingId: string): Promise<boolean> {
-    return Boolean((await this.port.getBooking(bookingId))?.checkIn);
+    const booking = await this.port.getBooking(bookingId);
+    return booking ? hasServiceProof(booking) : false;
   }
 
   private checkInTime(capturedAt: string | undefined, nowMs: number): number {

=== server/domain/bookings/services/bookingPrivacyService.test.ts — ARQUIVO NOVO, conteúdo completo ===
import { describe, expect, it } from 'vitest';
import { InMemoryBookingsAdapter } from '../adapters/inMemoryBookingsAdapter';
import type { Booking } from '../types/bookingTypes';
import { BookingPrivacyService } from './bookingPrivacyService';

function booking(id: string, overrides: Partial<Booking> = {}): Booking {
  return {
    id,
    offerId: 'offer-1',
    slotId: 'slot-1',
    guideItemId: 'item-1',
    buyerId: 'buyer-1',
    sellerPartnerId: 'partner-1',
    kind: 'tour',
    status: 'completed',
    lines: [],
    participantsCount: 2,
    subtotalMinor: 20000,
    platformFeeMinor: 3000,
    totalMinor: 20000,
    expiresAt: null,
    offerSnapshot: {
      title: 'Buggy',
      startsAt: '2026-11-10T11:00:00.000Z',
      cancellationPolicy: 'moderate',
    },
    locale: 'pt-BR',
    idempotencyKey: `key-${id}`,
    createdAt: `2026-11-01T12:00:0${id.slice(-1)}.000Z`,
    updatedAt: '',
    ...overrides,
  };
}

describe('BookingPrivacyService (§7.5, D20)', () => {
  it('apaga o endereço de busca 7 dias depois do serviço e mantém a reserva', async () => {
    const port = new InMemoryBookingsAdapter();
    port.bookings.set(
      'bk_1',
      booking('bk_1', {
        pickupAddress: 'Pousada Vila Jeri',
        pickupAddressEraseAt: '2026-11-17T13:00:00.000Z',
      })
    );
    port.bookings.set(
      'bk_2',
      booking('bk_2', { pickupAddress: 'Hotel', pickupAddressEraseAt: '2026-11-20T13:00:00.000Z' })
    );
    const service = new BookingPrivacyService(port, () => new Date('2026-11-18T00:00:00.000Z'));
    expect(await service.eraseExpiredPickupAddresses()).toBe(1);
    const erased = port.bookings.get('bk_1');
    expect(erased?.pickupAddress).toBeUndefined();
    expect(erased?.pickupAddressEraseAt).toBeUndefined();
    expect(erased?.totalMinor).toBe(20000);
    expect(port.bookings.get('bk_2')?.pickupAddress).toBe('Hotel');
  });

  it('exclusão de conta tira endereço e nomes de todas as reservas do comprador', async () => {
    const port = new InMemoryBookingsAdapter();
    for (const id of ['bk_1', 'bk_2', 'bk_3']) {
      port.bookings.set(id, booking(id, { pickupAddress: 'Pousada' }));
      port.participants.set(id, [{ name: 'Ana Souza', isLeadContact: true }]);
    }
    port.bookings.set('bk_x', booking('bk_x', { buyerId: 'outra', pickupAddress: 'Casa' }));
    const service = new BookingPrivacyService(port);
    expect(await service.anonymizeBuyer('buyer-1')).toBe(3);
    for (const id of ['bk_1', 'bk_2', 'bk_3']) {
      expect(port.bookings.get(id)?.pickupAddress).toBeUndefined();
      expect(port.participants.get(id)).toBeUndefined();
    }
    expect(port.bookings.get('bk_x')?.pickupAddress).toBe('Casa');
  });
});

=== server/domain/bookings/services/bookingPrivacyService.ts — ARQUIVO NOVO, conteúdo completo ===
import type { BookingsPort } from '../ports/bookingsPort';
import type { Booking } from '../types/bookingTypes';

const SYSTEM_ACTOR = 'system';
const BUYER_PAGE = 100;

function withoutPickupAddress(booking: Booking): Booking | null {
  if (!booking.pickupAddress && !booking.pickupAddressEraseAt) return null;
  const { pickupAddress: _address, pickupAddressEraseAt: _eraseAt, ...rest } = booking;
  return rest;
}

/**
 * Dados pessoais das reservas (§7.5, D20): o endereço de busca sai 7 dias depois do serviço, e a
 * exclusão de conta tira endereço e nomes de participantes. A reserva fica, porque é registro financeiro.
 */
export class BookingPrivacyService {
  constructor(
    private readonly port: BookingsPort,
    private readonly now: () => Date = () => new Date()
  ) {}

  async eraseExpiredPickupAddresses(limit = 200): Promise<number> {
    const due = await this.port.listBookingsWithPickupAddressEraseBefore(
      this.now().toISOString(),
      limit
    );
    for (const booking of due) {
      await this.port.updateBooking(booking.id, withoutPickupAddress, {
        actorUid: SYSTEM_ACTOR,
        reason: 'pickup_address_erased',
      });
    }
    return due.length;
  }

  async anonymizeBuyer(buyerUid: string): Promise<number> {
    let cursor: string | null = null;
    let anonymized = 0;
    do {
      const page = await this.port.listBookingsByBuyer(buyerUid, { limit: BUYER_PAGE, cursor });
      for (const booking of page.data) {
        await this.port.deleteParticipants(booking.id);
        await this.port.updateBooking(booking.id, withoutPickupAddress, {
          actorUid: SYSTEM_ACTOR,
          reason: 'buyer_account_deleted',
        });
        anonymized += 1;
      }
      cursor = page.nextCursor;
    } while (cursor);
    return anonymized;
  }
}

=== server/domain/bookings/services/bookingService.ts — diff ===
@@ -11,6 +11,7 @@ import {
   type Page,
 } from '../types/bookingTypes';
 import { NO_SHOW_WAIT_MS, SERVICE_CONFIRMATION_MS } from '../utils/checkInWindow';
+import { serviceEndsAtMs } from '../utils/serviceTime';
 import { buildBookingId } from '../utils/buildBookingId';
 import { priceBookingLines } from '../utils/bookingPricing';
 import { calculateBuyerRefund } from '../../../shared/kernel/cancellationPolicy';
@@ -20,6 +21,8 @@ import type { PlatformFeeConfig } from '../../../shared/kernel/platformFees';
 // Tempo para pagar antes de a vaga voltar para a venda (inclui o Pix, que é assíncrono).
 const PAYMENT_WINDOW_MS = 15 * 60 * 1000;
 const SYSTEM_ACTOR = 'system';
+// O endereço serve de prova até a reclamação ser decidida: 48 h para abrir mais 5 dias para decidir (D16).
+const PICKUP_ADDRESS_RETENTION_MS = 7 * 24 * 60 * 60 * 1000;
 
 export interface CreatePendingBookingInput {
   offerId: string;
@@ -111,7 +114,14 @@ export class BookingService {
         cancellationPolicy: offer.cancellationPolicy,
       },
       termsAcceptance: { version: input.acceptedTermsVersion, acceptedAt: timestamp },
-      ...(offer.pickupMode === 'buyer_address' ? { pickupAddress } : {}),
+      ...(offer.pickupMode === 'buyer_address'
+        ? {
+            pickupAddress,
+            pickupAddressEraseAt: new Date(
+              serviceEndsAtMs(slot.startsAt, offer.durationMinutes) + PICKUP_ADDRESS_RETENTION_MS
+            ).toISOString(),
+          }
+        : {}),
       locale: input.locale,
       idempotencyKey: input.idempotencyKey,
       createdAt: timestamp,
@@ -343,10 +353,8 @@ export class BookingService {
     let completed = 0;
     const askedToConfirm: Booking[] = [];
     for (const booking of started) {
-      const endsAtMs =
-        new Date(booking.offerSnapshot.startsAt).getTime() +
-        (booking.offerSnapshot.durationMinutes ?? 0) * 60_000;
-      if (endsAtMs > nowDate.getTime()) continue;
+      const { startsAt, durationMinutes } = booking.offerSnapshot;
+      if (serviceEndsAtMs(startsAt, durationMinutes) > nowDate.getTime()) continue;
       const ask =
         CHECK_IN_CODE_KINDS.includes(booking.kind) &&
         !booking.checkIn &&

=== server/domain/bookings/services/bookingServiceProofService.ts — diff ===
@@ -15,6 +15,7 @@ import {
   SERVICE_CONFIRMATION_MS,
   checkInWindow,
 } from '../utils/checkInWindow';
+import { hasServiceProof } from '../utils/serviceProof';
 
 const NOT_FOUND = () => new BookingDomainError('NOT_FOUND', 'Reserva não encontrada.');
 const NOTHING_TO_ANSWER = () =>
@@ -217,6 +218,22 @@ export class BookingServiceProofService {
     );
   }
 
+  /** Serviço comprovado do comprador, para o selo "Experiência verificada" da avaliação (§9.4, D20). */
+  async getVerifiedServiceForReview(
+    userId: string,
+    bookingId: string
+  ): Promise<{ guideItemId: string }> {
+    const booking = await this.port.getBooking(bookingId);
+    if (!booking || booking.buyerId !== userId) throw NOT_FOUND();
+    if (!hasServiceProof(booking)) {
+      throw new BookingDomainError(
+        'SERVICE_NOT_VERIFIED',
+        'Esta reserva ainda não tem o serviço comprovado.'
+      );
+    }
+    return { guideItemId: booking.guideItemId };
+  }
+
   /** Reservas cujo prazo venceu; o job decide o que fazer com cada uma. */
   listBookingsWithDueDeadline(limit: number): Promise<Booking[]> {
     return this.port.listBookingsWithDeadlineBefore(this.now().toISOString(), limit);

=== server/domain/bookings/types/bookingTypes.ts — diff ===
@@ -192,6 +192,8 @@ export interface Booking {
   termsAcceptance?: TermsAcceptance;
   /** Onde o comprador está (hospedagem ou endereço), quando a oferta busca no endereço. PII (§7.6). */
   pickupAddress?: string;
+  /** Quando o endereço de busca é apagado: 7 dias depois do fim do serviço (D20, §7.5). */
+  pickupAddressEraseAt?: string;
   checkIn?: BookingCheckIn;
   arrival?: BookingArrival;
   providerAbsence?: BookingProviderAbsence;

=== server/domain/bookings/usecases/anonymizeBuyerBookingsUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { getBookingPrivacyService } from '../factory';

/** Exclusão de conta: tira endereço e nomes das reservas do comprador e mantém o registro (§7.5). */
export async function anonymizeBuyerBookingsUseCase(buyerUid: string): Promise<number> {
  return getBookingPrivacyService().anonymizeBuyer(buyerUid);
}

=== server/domain/bookings/usecases/eraseExpiredPickupAddressesUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { getBookingPrivacyService } from '../factory';

/** Apaga o endereço de busca das reservas 7 dias depois do serviço (D20, §7.5). */
export async function eraseExpiredPickupAddressesUseCase(limit = 200): Promise<number> {
  return getBookingPrivacyService().eraseExpiredPickupAddresses(limit);
}

=== server/domain/bookings/usecases/getVerifiedServiceForReviewUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { getBookingServiceProofService } from '../factory';

/** Confere que o comprador usou o serviço da reserva, para a avaliação verificada (§9.4, D20). */
export async function getVerifiedServiceForReviewUseCase(params: {
  userId: string;
  bookingId: string;
}): Promise<{ guideItemId: string }> {
  return getBookingServiceProofService().getVerifiedServiceForReview(
    params.userId,
    params.bookingId
  );
}

=== server/domain/bookings/utils/checkInWindow.ts — diff ===
@@ -1,3 +1,5 @@
+import { serviceEndsAtMs } from './serviceTime';
+
 const MINUTE_MS = 60_000;
 const HOUR_MS = 60 * MINUTE_MS;
 const DAY_MS = 24 * HOUR_MS;
@@ -11,10 +13,6 @@ export const CHECK_IN_CLOSES_AFTER_MS = 12 * HOUR_MS;
 export const CHECK_IN_MAX_FAILURES = 5;
 export const CHECK_IN_FAILURE_WINDOW_MS = 15 * MINUTE_MS;
 
-export function serviceEndsAtMs(startsAt: string, durationMinutes?: number): number {
-  return new Date(startsAt).getTime() + (durationMinutes ?? 0) * MINUTE_MS;
-}
-
 /** 00:00 do dia do serviço em Fortaleza: a partir daí o comprador vê o código. */
 export function checkInCodeVisibleFromMs(startsAt: string): number {
   const local = new Date(startsAt).getTime() - FORTALEZA_OFFSET_MS;

=== server/domain/bookings/utils/serviceProof.test.ts — ARQUIVO NOVO, conteúdo completo ===
import { describe, expect, it } from 'vitest';
import { hasServiceProof, requiresServiceProof } from './serviceProof';

const CHECK_IN = { at: 't', byUid: 'p', participantsPresent: 1 };

describe('prova do serviço (D20)', () => {
  it('check-in com código ou "sim" do comprador provam; "Cliente sem código" sozinho não', () => {
    expect(hasServiceProof({ checkIn: { ...CHECK_IN, method: 'code' } })).toBe(true);
    expect(hasServiceProof({ checkIn: { ...CHECK_IN, method: 'no_code' } })).toBe(false);
    expect(
      hasServiceProof({
        checkIn: { ...CHECK_IN, method: 'no_code' },
        serviceConfirmation: {
          askedAt: 't',
          answerBy: 't',
          reason: 'no_code',
          resolution: 'confirmed',
        },
      })
    ).toBe(true);
    expect(
      hasServiceProof({
        serviceConfirmation: {
          askedAt: 't',
          answerBy: 't',
          reason: 'no_record',
          resolution: 'refunded',
        },
      })
    ).toBe(false);
    expect(hasServiceProof({})).toBe(false);
  });

  it('passeio, aluguel e translado esperam a prova; entrada de atração não', () => {
    expect(requiresServiceProof('tour')).toBe(true);
    expect(requiresServiceProof('rental')).toBe(true);
    expect(requiresServiceProof('transfer')).toBe(true);
    expect(requiresServiceProof('private_entry')).toBe(false);
  });
});

=== server/domain/bookings/utils/serviceProof.ts — ARQUIVO NOVO, conteúdo completo ===
import { type Booking, type BookableOfferKind, CHECK_IN_CODE_KINDS } from '../types/bookingTypes';

/** Tipos cujo repasse espera a prova do serviço (D20); a entrada de atração usa o QR (21.4). */
export function requiresServiceProof(kind: BookableOfferKind): boolean {
  return CHECK_IN_CODE_KINDS.includes(kind);
}

/**
 * Prova de que o serviço aconteceu (D20): check-in com o código ou "sim" do comprador na pergunta
 * "O serviço aconteceu?". O "Cliente sem código" sozinho não prova nada.
 */
export function hasServiceProof(
  booking: Pick<Booking, 'checkIn' | 'serviceConfirmation'>
): boolean {
  return (
    booking.checkIn?.method === 'code' || booking.serviceConfirmation?.resolution === 'confirmed'
  );
}

=== server/domain/bookings/utils/serviceTime.test.ts — ARQUIVO NOVO, conteúdo completo ===
import { describe, expect, it } from 'vitest';
import { bookingServiceEndsAt, serviceEndsAtMs } from './serviceTime';

describe('fim do serviço', () => {
  it('soma a duração ao início; sem duração, o fim é o início', () => {
    expect(
      bookingServiceEndsAt({
        offerSnapshot: {
          title: 'Buggy',
          startsAt: '2026-11-10T11:00:00.000Z',
          durationMinutes: 150,
          cancellationPolicy: 'moderate',
        },
      })
    ).toBe('2026-11-10T13:30:00.000Z');
    expect(serviceEndsAtMs('2026-11-10T11:00:00.000Z')).toBe(
      new Date('2026-11-10T11:00:00.000Z').getTime()
    );
  });
});

=== server/domain/bookings/utils/serviceTime.ts — ARQUIVO NOVO, conteúdo completo ===
import type { Booking } from '../types/bookingTypes';

const MINUTE_MS = 60_000;

/** Fim do serviço: início mais a duração da oferta (sem duração, o fim é o próprio início). */
export function serviceEndsAtMs(startsAt: string, durationMinutes?: number): number {
  return new Date(startsAt).getTime() + (durationMinutes ?? 0) * MINUTE_MS;
}

/** Fim do serviço da reserva em ISO, usado no repasse, na reclamação e na conclusão. */
export function bookingServiceEndsAt(booking: Pick<Booking, 'offerSnapshot'>): string {
  const { startsAt, durationMinutes } = booking.offerSnapshot;
  return new Date(serviceEndsAtMs(startsAt, durationMinutes)).toISOString();
}

=== server/domain/payment/index.ts — diff ===
@@ -20,6 +20,7 @@ export { applyPayoutRefundUseCase } from './usecases/applyPayoutRefundUseCase';
 export { holdPayoutForDisputeUseCase } from './usecases/holdPayoutForDisputeUseCase';
 export { closePayoutDisputeUseCase } from './usecases/closePayoutDisputeUseCase';
 export { reschedulePayoutUseCase } from './usecases/reschedulePayoutUseCase';
+export { releasePayoutHoldUseCase } from './usecases/releasePayoutHoldUseCase';
 export { listPayoutEntriesUseCase } from './usecases/listPayoutEntriesUseCase';
 export { releaseDuePayoutsUseCase } from './usecases/releaseDuePayoutsUseCase';
 export { getPayoutEntryForReferenceUseCase } from './usecases/getPayoutEntryForReferenceUseCase';
@@ -66,7 +67,12 @@ export type { PlanSubscriptionRecord } from './ports/planSubscriptionRepositoryP
 
 export type { ConnectedAccountStatus } from './ports/marketplaceAccountPort';
 export type { PaymentAccountView } from './types/paymentAccount';
-export type { PayoutEntry, PayoutEntryStatus, PayoutEntryView } from './types/payoutEntry';
+export type {
+  PayoutEntry,
+  PayoutEntryStatus,
+  PayoutEntryView,
+  PayoutHoldReason,
+} from './types/payoutEntry';
 export type { DisputeOutcome, RecordSaleInput, ReleaseSummary } from './services/payoutService';
 export type {
   AccountDebt,

=== server/domain/payment/services/payoutService.test.ts — diff ===
@@ -28,6 +28,27 @@ function setup(now = '2026-12-23T04:00:00.000Z', destination: string | null = 'a
 }
 
 describe('PayoutService (D14)', () => {
+  it('venda que espera a prova do serviço nasce retida e só sai depois de soltar (D20)', async () => {
+    const { service, repo, transfers } = setup();
+    const entry = await service.recordSale({ ...SALE, holdReasons: ['service_proof'] });
+    expect(entry).toMatchObject({ status: 'on_hold', holdReasons: ['service_proof'] });
+    await service.releaseDue();
+    expect(transfers.createTransfer).not.toHaveBeenCalled();
+    await service.releaseHold('ticket_order', 'ord_1', 'service_proof');
+    expect(repo.rows.get(entry.id)?.status).toBe('pending');
+    await service.releaseDue();
+    expect(transfers.createTransfer).toHaveBeenCalledTimes(1);
+  });
+
+  it('soltar a prova mantém a reclamação que também retém a venda', async () => {
+    const { service, repo } = setup();
+    const entry = await service.recordSale({ ...SALE, holdReasons: ['service_proof'] });
+    await service.setHold(entry.id, 'claim', true);
+    await service.releaseHold('ticket_order', 'ord_1', 'service_proof');
+    expect(repo.rows.get(entry.id)).toMatchObject({ status: 'on_hold', holdReasons: ['claim'] });
+    await expect(service.releaseHold('booking', 'nao_existe', 'service_proof')).resolves.toBeNull();
+  });
+
   it('registra a venda uma vez, com liberação 48 h depois do fim', async () => {
     const { service, repo } = setup();
     const entry = await service.recordSale(SALE);

=== server/domain/payment/services/payoutService.ts — diff ===
@@ -21,6 +21,8 @@ export interface RecordSaleInput {
   platformFeeMinor: number;
   serviceEndsAt: string;
   title?: string;
+  /** Retenções desde a criação (ex.: `service_proof`), para não haver momento em que o repasse saia. */
+  holdReasons?: PayoutHoldReason[];
 }
 
 export interface ReleaseSummary {
@@ -120,7 +122,9 @@ export class PayoutService {
       partnerAmountMinor: amounts.partnerAmountMinor,
       serviceEndsAt: input.serviceEndsAt,
       releaseAt: computeReleaseAt(input.serviceEndsAt),
-      status: 'pending',
+      ...(input.holdReasons?.length
+        ? { status: 'on_hold' as const, holdReasons: [...new Set(input.holdReasons)] }
+        : { status: 'pending' as const }),
       refunds: {},
       createdAt: nowIso,
       updatedAt: nowIso,
@@ -208,6 +212,15 @@ export class PayoutService {
     return entry ? this.setHold(entry.id, 'dispute', true) : null;
   }
 
+  /** Solta uma retenção da venda pela referência; sem entrada ou sem essa retenção, não faz nada. */
+  async releaseHold(
+    referenceType: string,
+    referenceId: string,
+    reason: PayoutHoldReason
+  ): Promise<PayoutEntry | null> {
+    return this.setHold(entryIdFor(referenceType, referenceId), reason, false);
+  }
+
   /** Retém ou solta a venda por um motivo; as outras retenções continuam valendo. */
   async setHold(
     entryId: string,

=== server/domain/payment/types/payoutEntry.ts — diff ===
@@ -4,8 +4,12 @@
  */
 export type PayoutEntryStatus = 'pending' | 'on_hold' | 'released' | 'canceled';
 
-/** Contestação no Stripe e reclamação do comprador (D16) podem reter a mesma venda ao mesmo tempo. */
-export type PayoutHoldReason = 'dispute' | 'claim';
+/**
+ * Contestação no Stripe e reclamação do comprador (D16) podem reter a mesma venda ao mesmo tempo.
+ * `service_proof`: a venda espera a prova de que o serviço aconteceu (D20); quem a define é a camada
+ * application, o payment só a respeita.
+ */
+export type PayoutHoldReason = 'dispute' | 'claim' | 'service_proof';
 
 export interface PayoutRefundApplied {
   amountMinor: number;

=== server/domain/payment/usecases/releasePayoutHoldUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { payoutService } from '../factory';
import type { PayoutEntry, PayoutHoldReason } from '../types/payoutEntry';

/** Solta uma retenção do repasse da venda; as outras continuam valendo. */
export function releasePayoutHoldUseCase(
  referenceType: string,
  referenceId: string,
  reason: PayoutHoldReason
): Promise<PayoutEntry | null> {
  return payoutService.releaseHold(referenceType, referenceId, reason);
}

=== server/domain/reviews/adapters/firestoreReviewAdapter.ts — diff ===
@@ -9,10 +9,7 @@ import {
   getItemByIdUseCase,
   updateReviewAggregateUseCase,
 } from '../../guide';
-import {
-  getEventListingByIdUseCase,
-  updateEventRatingSummaryUseCase,
-} from '../../events';
+import { getEventListingByIdUseCase, updateEventRatingSummaryUseCase } from '../../events';
 
 export class FirestoreReviewAdapter implements ReviewPort {
   async submitReviewAndRecalculateRating(dto: CreateReviewDTO): Promise<SubmitReviewResult> {
@@ -64,7 +61,11 @@ export class FirestoreReviewAdapter implements ReviewPort {
         userPhoto,
         partnerId: resourceOwnerId ?? null,
         ...(dto.occurrenceId ? { occurrenceId: dto.occurrenceId } : {}),
-        ...(dto.ticketId ? { ticketId: dto.ticketId, verifiedAttendance: isVerifiedAttendance } : {}),
+        ...(dto.ticketId
+          ? { ticketId: dto.ticketId, verifiedAttendance: isVerifiedAttendance }
+          : {}),
+        // Reserva já conferida no serviço; o ID dela não vai para a avaliação, que é pública (§7.5).
+        ...(dto.bookingId ? { verifiedAttendance: true } : {}),
         updatedAt: FieldValue.serverTimestamp(),
       });
     } else {
@@ -78,7 +79,11 @@ export class FirestoreReviewAdapter implements ReviewPort {
         comment: dto.comment,
         partnerId: resourceOwnerId ?? null,
         ...(dto.occurrenceId ? { occurrenceId: dto.occurrenceId } : {}),
-        ...(dto.ticketId ? { ticketId: dto.ticketId, verifiedAttendance: isVerifiedAttendance } : {}),
+        ...(dto.ticketId
+          ? { ticketId: dto.ticketId, verifiedAttendance: isVerifiedAttendance }
+          : {}),
+        // Reserva já conferida no serviço; o ID dela não vai para a avaliação, que é pública (§7.5).
+        ...(dto.bookingId ? { verifiedAttendance: true } : {}),
         createdAt: FieldValue.serverTimestamp(),
         updatedAt: FieldValue.serverTimestamp(),
       });
@@ -303,12 +308,7 @@ export class FirestoreReviewAdapter implements ReviewPort {
             count: remainingCount,
           });
         } else {
-          await updateReviewAggregateUseCase(
-            'items',
-            target.itemId,
-            newRating,
-            remainingCount
-          );
+          await updateReviewAggregateUseCase('items', target.itemId, newRating, remainingCount);
         }
       } catch (error) {
         console.error(

=== server/domain/reviews/controllers/reviewController.ts — diff ===
@@ -1,3 +1,4 @@
+import { BookingDomainError } from '../../bookings';
 import { Response } from 'express';
 import { AuthenticatedRequest } from '../../../infrastructure/auth/authMiddleware';
 import { CreateReviewDTO } from '../dtos/CreateReviewDTO';
@@ -29,6 +30,7 @@ export class ReviewController {
         comment: parseResult.data.comment,
         occurrenceId: parseResult.data.occurrenceId,
         ticketId: parseResult.data.ticketId,
+        bookingId: parseResult.data.bookingId,
       });
 
       const reviewId = await reviewService.submitReview(dto);
@@ -37,24 +39,28 @@ export class ReviewController {
         status: 'success',
         id: reviewId,
       });
-    } catch (error: any) {
+    } catch (error: unknown) {
+      const message = error instanceof Error ? error.message : '';
       console.error('[ReviewController.submitReview Error]:', error);
 
-      if (
-        typeof error.message === 'string' &&
-        error.message.includes('Parceiros não podem avaliar')
-      ) {
-        res.status(403).json({ error: error.message });
+      if (message.includes('Parceiros não podem avaliar')) {
+        res.status(403).json({ error: message });
         return;
       }
 
-      if (typeof error.message === 'string' && error.message.includes('não encontrado')) {
-        res.status(404).json({ error: error.message });
+      if (message.includes('não encontrado')) {
+        res.status(404).json({ error: message });
+        return;
+      }
+
+      // Reserva sem serviço comprovado ou de outra pessoa (D20): erro no formato padrão (§10.2).
+      if (error instanceof BookingDomainError) {
+        res.status(error.statusCode).json({ error: { code: error.code, message: error.message } });
         return;
       }
 
       res.status(500).json({
-        error: error.message || 'Erro interno ao salvar avaliação.',
+        error: message || 'Erro interno ao salvar avaliação.',
       });
     }
   }
@@ -69,7 +75,7 @@ export class ReviewController {
       const rawReviewId = req.params.id;
       const reviewId = Array.isArray(rawReviewId) ? rawReviewId[0] : rawReviewId;
 
-      if (!reviewId || !reviewId.trim()) {
+      if (!reviewId?.trim()) {
         res.status(400).json({ error: 'ID da avaliação é obrigatório' });
         return;
       }
@@ -94,21 +100,22 @@ export class ReviewController {
         status: 'success',
         message: 'Resposta registrada com sucesso',
       });
-    } catch (error: any) {
+    } catch (error: unknown) {
+      const message = error instanceof Error ? error.message : '';
       console.error('[ReviewController.respondToReview Error]:', error);
 
-      if (typeof error.message === 'string' && error.message.includes('Não autorizado')) {
-        res.status(403).json({ error: error.message });
+      if (message.includes('Não autorizado')) {
+        res.status(403).json({ error: message });
         return;
       }
 
-      if (typeof error.message === 'string' && error.message.includes('não encontrada')) {
-        res.status(404).json({ error: error.message });
+      if (message.includes('não encontrada')) {
+        res.status(404).json({ error: message });
         return;
       }
 
       res.status(500).json({
-        error: error.message || 'Erro interno ao responder avaliação.',
+        error: message || 'Erro interno ao responder avaliação.',
       });
     }
   }
@@ -123,7 +130,7 @@ export class ReviewController {
       const rawReviewId = req.params.id;
       const reviewId = Array.isArray(rawReviewId) ? rawReviewId[0] : rawReviewId;
 
-      if (!reviewId || !reviewId.trim()) {
+      if (!reviewId?.trim()) {
         res.status(400).json({ error: 'ID da avaliação é obrigatório' });
         return;
       }
@@ -134,21 +141,22 @@ export class ReviewController {
         status: 'success',
         message: 'Avaliação excluída com sucesso',
       });
-    } catch (error: any) {
+    } catch (error: unknown) {
+      const message = error instanceof Error ? error.message : '';
       console.error('[ReviewController.deleteReview Error]:', error);
 
-      if (typeof error.message === 'string' && error.message.includes('Não autorizado')) {
-        res.status(403).json({ error: error.message });
+      if (message.includes('Não autorizado')) {
+        res.status(403).json({ error: message });
         return;
       }
 
-      if (typeof error.message === 'string' && error.message.includes('não encontrada')) {
-        res.status(404).json({ error: error.message });
+      if (message.includes('não encontrada')) {
+        res.status(404).json({ error: message });
         return;
       }
 
       res.status(500).json({
-        error: error.message || 'Erro interno ao excluir avaliação.',
+        error: message || 'Erro interno ao excluir avaliação.',
       });
     }
   }

=== server/domain/reviews/dtos/CreateReviewDTO.ts — diff ===
@@ -8,6 +8,8 @@ export interface CreateReviewDTOData {
   comment: string;
   occurrenceId?: string;
   ticketId?: string;
+  /** Reserva usada, para o selo verificado em passeio, aluguel e translado (D20). */
+  bookingId?: string;
 }
 
 export class CreateReviewDTO {
@@ -18,6 +20,7 @@ export class CreateReviewDTO {
   readonly comment: string;
   readonly occurrenceId?: string;
   readonly ticketId?: string;
+  readonly bookingId?: string;
 
   constructor(data: CreateReviewDTOData) {
     this.itemId = data.itemId.trim();
@@ -27,6 +30,7 @@ export class CreateReviewDTO {
     this.comment = data.comment.trim();
     this.occurrenceId = data.occurrenceId?.trim() || undefined;
     this.ticketId = data.ticketId?.trim() || undefined;
+    this.bookingId = data.bookingId?.trim() || undefined;
   }
 
   static fromRaw(data: CreateReviewDTOData): CreateReviewDTO {

=== server/domain/reviews/schemas/reviewSchema.ts — diff ===
@@ -8,6 +8,7 @@ export const submitReviewSchema = z
     itemCollection: reviewItemCollectionSchema,
     occurrenceId: z.string().trim().min(1).max(200).optional(),
     ticketId: z.string().trim().min(1).max(200).optional(),
+    bookingId: z.string().trim().min(1).max(200).optional(),
     rating: z
       .number()
       .int('Nota deve ser um número inteiro')

=== server/domain/reviews/services/reviewService.test.ts — diff ===
@@ -13,6 +13,12 @@ vi.mock('../../ticketing', () => ({
   getVerifiedAttendanceForReviewUseCase: ticketingMocks.getVerifiedAttendanceForReviewUseCase,
 }));
 
+const bookingMocks = vi.hoisted(() => ({ getVerifiedServiceForReviewUseCase: vi.fn() }));
+
+vi.mock('../../bookings', () => ({
+  getVerifiedServiceForReviewUseCase: bookingMocks.getVerifiedServiceForReviewUseCase,
+}));
+
 function createReviewPortMock(): ReviewPort {
   return {
     submitReviewAndRecalculateRating: vi.fn(),
@@ -293,6 +299,45 @@ describe('ReviewService', () => {
     });
   });
 
+  describe('submitReview com reserva (D20)', () => {
+    function bookingDto(itemId = 'item-1') {
+      return CreateReviewDTO.fromRaw({
+        itemId,
+        itemCollection: 'items',
+        bookingId: 'bk_1',
+        userId: 'user-1',
+        rating: 5,
+        comment: 'Passeio incrível!',
+      });
+    }
+
+    it('confere o serviço da reserva e grava a avaliação', async () => {
+      bookingMocks.getVerifiedServiceForReviewUseCase.mockResolvedValue({ guideItemId: 'item-1' });
+      vi.mocked(reviewPort.submitReviewAndRecalculateRating).mockResolvedValue({
+        reviewId: 'items__item-1__user-1',
+        isUpdate: false,
+        itemId: 'item-1',
+        itemCollection: 'items',
+        rating: 5,
+        target: { partnerId: null, name: 'Buggy' },
+        author: { name: 'João' },
+      });
+      await expect(service.submitReview(bookingDto())).resolves.toBe('items__item-1__user-1');
+      expect(bookingMocks.getVerifiedServiceForReviewUseCase).toHaveBeenCalledWith({
+        userId: 'user-1',
+        bookingId: 'bk_1',
+      });
+    });
+
+    it('recusa reserva de outro item ou sem serviço comprovado', async () => {
+      bookingMocks.getVerifiedServiceForReviewUseCase.mockResolvedValue({ guideItemId: 'item-2' });
+      await expect(service.submitReview(bookingDto())).rejects.toThrow('não pertence');
+      bookingMocks.getVerifiedServiceForReviewUseCase.mockRejectedValue(new Error('sem prova'));
+      await expect(service.submitReview(bookingDto())).rejects.toThrow('sem prova');
+      expect(reviewPort.submitReviewAndRecalculateRating).not.toHaveBeenCalled();
+    });
+  });
+
   describe('respondToReview', () => {
     it('deve rejeitar quando reviewId for vazio', async () => {
       await expect(service.respondToReview('', 'Obrigado!', 'partner-1')).rejects.toThrow(

=== server/domain/reviews/services/reviewService.ts — diff ===
@@ -1,3 +1,4 @@
+import { getVerifiedServiceForReviewUseCase } from '../../bookings';
 import { getVerifiedAttendanceForReviewUseCase } from '../../ticketing';
 import { CreateReviewDTO } from '../dtos/CreateReviewDTO';
 import { ReviewNotificationPort } from '../ports/reviewNotificationPort';
@@ -36,6 +37,19 @@ export class ReviewService {
       }
     }
 
+    if (dto.bookingId) {
+      if (dto.itemCollection !== 'items') {
+        throw new Error('Reserva só comprova avaliação de passeio, aluguel ou translado.');
+      }
+      const service = await getVerifiedServiceForReviewUseCase({
+        userId: dto.userId,
+        bookingId: dto.bookingId,
+      });
+      if (service.guideItemId !== dto.itemId) {
+        throw new Error('A reserva informada não pertence a este item.');
+      }
+    }
+
     const result = await this.reviewPort.submitReviewAndRecalculateRating(dto);
 
     if (result.target.partnerId) {

VERIFICAÇÃO (obrigatória):
- `npm run typecheck`, `npx biome lint .` (0 erros; arquivos tocados sem avisos), `npm run build`;
- testes ligados aos arquivos deste prompt: `npx vitest related --run server/application/usecases/bookings/answerServiceConfirmationApplicationUseCase.ts server/application/usecases/bookings/bookingApplicationUseCases.test.ts server/application/usecases/bookings/bookingServiceProofApplicationUseCases.test.ts server/application/usecases/bookings/cancelBookingByBuyerApplicationUseCase.ts server/application/usecases/bookings/checkInBookingApplicationUseCase.ts server/application/usecases/bookings/markBookingNoShowApplicationUseCase.ts server/application/usecases/bookings/reconcileBookingWebhookApplicationUseCase.test.ts server/application/usecases/bookings/reconcileBookingWebhookApplicationUseCase.ts server/application/usecases/bookings/releaseServiceProofHold.ts server/application/usecases/bookings/reportProviderAbsentApplicationUseCase.ts server/application/usecases/bookings/rescheduleSlotByPartnerApplicationUseCase.ts server/application/usecases/bookings/runBookingCompletionJobApplicationUseCase.ts server/application/usecases/deleteUserAccountApplicationUseCase.test.ts server/application/usecases/deleteUserAccountApplicationUseCase.ts server/application/usecases/payouts/bookingServiceEvidence.ts server/application/usecases/payouts/decideSaleClaimApplicationUseCase.ts server/application/usecases/payouts/listAdminSaleClaimsApplicationUseCase.test.ts server/application/usecases/payouts/listAdminSaleClaimsApplicationUseCase.ts server/application/usecases/payouts/openSaleClaimApplicationUseCase.ts server/application/usecases/payouts/recordPaidSalePayoutApplicationUseCase.ts server/application/usecases/payouts/saleClaimApplicationUseCases.test.ts server/domain/bookings/adapters/firestoreBookingsAdapter.ts server/domain/bookings/adapters/firestoreCheckInStore.ts server/domain/bookings/adapters/inMemoryBookingsAdapter.ts server/domain/bookings/errors/bookingDomainError.ts server/domain/bookings/factory.ts server/domain/bookings/index.ts server/domain/bookings/ports/bookingsPort.ts server/domain/bookings/services/bookingCheckInService.ts server/domain/bookings/services/bookingPrivacyService.test.ts server/domain/bookings/services/bookingPrivacyService.ts server/domain/bookings/services/bookingService.ts server/domain/bookings/services/bookingServiceProofService.ts server/domain/bookings/types/bookingTypes.ts server/domain/bookings/usecases/anonymizeBuyerBookingsUseCase.ts server/domain/bookings/usecases/eraseExpiredPickupAddressesUseCase.ts server/domain/bookings/usecases/getVerifiedServiceForReviewUseCase.ts server/domain/bookings/utils/checkInWindow.ts server/domain/bookings/utils/serviceProof.test.ts server/domain/bookings/utils/serviceProof.ts server/domain/bookings/utils/serviceTime.test.ts server/domain/bookings/utils/serviceTime.ts server/domain/payment/index.ts server/domain/payment/services/payoutService.test.ts server/domain/payment/services/payoutService.ts server/domain/payment/types/payoutEntry.ts server/domain/payment/usecases/releasePayoutHoldUseCase.ts server/domain/reviews/adapters/firestoreReviewAdapter.ts server/domain/reviews/controllers/reviewController.ts server/domain/reviews/dtos/CreateReviewDTO.ts server/domain/reviews/schemas/reviewSchema.ts server/domain/reviews/services/reviewService.test.ts server/domain/reviews/services/reviewService.ts` (todos verdes). Não precisa rodar a suíte inteira.

ENTREGA: responda no formato do AGENTS.md §16.3.

LIMPEZA (obrigatória, ao terminar de implementar): apague todos os arquivos de public/assets/aistudio/, inclusive o deste prompt. São cópias dos textos colados no chat, salvas automaticamente pelo AI Studio, e public/ vai para o site publicado. Se a pasta ficar vazia, apague a pasta também.
~~~~

### Configurações manuais (você faz, fora do AI Studio, depois de aplicar este prompt)

Nenhuma.
