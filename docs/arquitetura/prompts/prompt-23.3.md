# Prompt 23.3 — Avisos novos: compra confirmada e não concluída, lembretes, convite para avaliar, resposta, denúncia e troca do @

> Lote 19, gerado dos commits de referência `ef3d953..23f936b` da branch `claude/agents-md-v2`. Aplique na ordem do lote (C18, A8, 22.1, 22.2, 22.6, 23.0, 23.1, 23.2a, 23.2b, 23.2c, 23.3), um por vez, depois do C18. Cole o bloco abaixo no agente do AI Studio, inteiro, de uma vez.

---

## Prompt 23.3 — Avisos novos: compra confirmada e não concluída, lembretes, convite para avaliar, resposta, denúncia e troca do @

Aprovado em 2026-11-03, com o silêncio dos avisos opcionais das 23h30 às 5h30.

~~~~text
Siga o AGENTS.md. O app ainda não foi liberado para usuários: nenhum código de compatibilidade ou transição (§2.2 item 8). As regras estão nas decisões D25 de docs/arquitetura/decisoes.md (aplicadas pelo prompt A8).

IMPORTANTE: aplique os diffs abaixo EXATAMENTE, inclusive os arquivos novos. Não reescreva os arquivos do seu jeito. Arquivo tocado sai sem avisos do lint e formatado (AGENTS.md §13). Não altere firebase.json, AGENTS.md, docs/ nem .env. Em functions/ mexa só nos arquivos listados abaixo.

O QUE MUDA:
1) Compra confirmada (ingresso e reserva) para quem comprou.
2) Compra não concluída: pedido ou reserva expirada avisa só quem chegou ao pagamento (jobs de expiração pela camada application; a rota /internal/ticketing/expire-orders passa para server/interfaces/http/ticketing).
3) Job de lembretes a cada 15 min (POST /internal/notifications/reminders): véspera e 2 h antes, um aviso por pessoa e sessão.
4) Convite para avaliar (opcional, Pedidos de avaliação): reserva concluída com prova do serviço e evento em que a pessoa entrou.
5) Resposta do estabelecimento à avaliação e resultado da denúncia avisam quem escreveu.
6) Troca do @ avisa a conta: PUT /api/users/me/username passa para server/interfaces/http/users (users continua folha).
7) Avisos opcionais nunca saem das 23h30 às 5h30 (Fortaleza); esperam até as 5h30.

ARQUIVOS (crie, altere ou apague exatamente estes):
- .env.example (alterar)
- firestore.indexes.json (alterar)
- functions/src/index.ts (alterar)
- functions/src/sendServiceReminders.ts (criar)
- server.ts (alterar)
- server/application/usecases/bookings/bookingServiceProofApplicationUseCases.test.ts (alterar)
- server/application/usecases/bookings/reconcileBookingWebhookApplicationUseCase.ts (alterar)
- server/application/usecases/bookings/runBookingCompletionJobApplicationUseCase.ts (alterar)
- server/application/usecases/notifications/claimUsernameApplicationUseCase.ts (criar)
- server/application/usecases/notifications/expireUnpaidBookingsApplicationUseCase.ts (criar)
- server/application/usecases/notifications/expireUnpaidTicketOrdersApplicationUseCase.ts (criar)
- server/application/usecases/notifications/notificationTriggers.test.ts (criar)
- server/application/usecases/notifications/sendServiceRemindersApplicationUseCase.ts (criar)
- server/application/usecases/reconcileStripeWebhookEventApplicationUseCase.ts (alterar)
- server/domain/bookings/adapters/firestoreBookingsAdapter.ts (alterar)
- server/domain/bookings/adapters/inMemoryBookingsAdapter.ts (alterar)
- server/domain/bookings/index.ts (alterar)
- server/domain/bookings/ports/bookingsPort.ts (alterar)
- server/domain/bookings/services/bookingService.test.ts (alterar)
- server/domain/bookings/services/bookingService.ts (alterar)
- server/domain/bookings/usecases/completeFinishedBookingsUseCase.ts (alterar)
- server/domain/bookings/usecases/expireOverdueBookingsUseCase.ts (alterar)
- server/domain/bookings/usecases/listConfirmedBookingsStartingBetweenUseCase.ts (criar)
- server/domain/notifications/adapters/fcmPushSenderAdapter.ts (alterar)
- server/domain/notifications/i18n/notificationTexts.ts (alterar)
- server/domain/notifications/services/pushDispatchService.test.ts (alterar)
- server/domain/notifications/services/pushDispatchService.ts (alterar)
- server/domain/notifications/types/notificationTypes.ts (alterar)
- server/domain/notifications/utils/renderNotificationText.ts (alterar)
- server/domain/reviews/adapters/firestoreReviewAdapter.test.ts (alterar)
- server/domain/reviews/adapters/firestoreReviewAdapter.ts (alterar)
- server/domain/reviews/adapters/reviewNotificationAdapter.ts (alterar)
- server/domain/reviews/factory.ts (alterar)
- server/domain/reviews/ports/reviewNotificationPort.ts (alterar)
- server/domain/reviews/ports/reviewPort.ts (alterar)
- server/domain/reviews/services/reviewService.test.ts (alterar)
- server/domain/reviews/services/reviewService.ts (alterar)
- server/domain/reviews/usecases/decideReviewReportUseCase.ts (alterar)
- server/domain/ticketing/adapters/firestoreTicketStore.ts (alterar)
- server/domain/ticketing/adapters/firestoreTicketingAdapter.ts (alterar)
- server/domain/ticketing/controllers/ticketingController.ts (alterar)
- server/domain/ticketing/index.ts (alterar)
- server/domain/ticketing/ports/ticketingPort.ts (alterar)
- server/domain/ticketing/services/ticketHolderService.ts (alterar)
- server/domain/ticketing/services/ticketOrderService.ts (alterar)
- server/domain/ticketing/services/ticketingServices.test.ts (alterar)
- server/domain/ticketing/usecases/expireAllOverdueOrdersUseCase.ts (alterar)
- server/domain/ticketing/usecases/listCheckedInTicketsEndedBetweenUseCase.ts (criar)
- server/domain/ticketing/usecases/listIssuedTicketsStartingBetweenUseCase.ts (criar)
- server/domain/users/controllers/usernameController.ts (alterar)
- server/domain/users/routes/userRoutes.ts (alterar)
- server/domain/users/schemas/usernameSchema.ts (apagar)
- server/domain/users/services/usernameService.ts (alterar)
- server/domain/users/usecases/claimUsernameUseCase.ts (alterar)
- server/interfaces/http/bookings/internalBookingsController.ts (alterar)
- server/interfaces/http/notifications/internalNotificationsController.ts (alterar)
- server/interfaces/http/ticketing/internalTicketingController.ts (criar)
- server/interfaces/http/users/schemas/usernameSchema.ts (criar)
- server/interfaces/http/users/usernameClaimRoutes.ts (criar)
- src/app/useNotificationNavigation.ts (alterar)
- src/domain/notifications/types/notification.ts (alterar)
- src/domain/notifications/types/notificationCategories.ts (alterar)
- src/domain/notifications/utils/describeNotification.ts (alterar)
- src/shared/i18n/notifyResources.ts (alterar)
- src/shared/i18n/notifyTypesResources.ts (alterar)

Aplique as mudanças abaixo EXATAMENTE como estão (formato unified diff: linhas com "-" saem, linhas com "+" entram; as demais são contexto para localizar o trecho). Não reformate outros trechos dos arquivos.

=== .env.example — diff ===
@@ -67,6 +67,7 @@ PARTNERS_EXPIRING_PLANS_JOB_URL=
 PAYOUTS_RELEASE_JOB_URL=
 NOTIFICATIONS_DISPATCH_JOB_URL=
 NOTIFICATIONS_DAILY_DIGEST_JOB_URL=
+NOTIFICATIONS_REMINDERS_JOB_URL=
 
 # Firebase Client SDK Credentials & App Check Config
 VITE_FIREBASE_API_KEY=

=== firestore.indexes.json — diff ===
@@ -585,6 +585,34 @@
           "order": "ASCENDING"
         }
       ]
+    },
+    {
+      "collectionGroup": "tickets",
+      "queryScope": "COLLECTION",
+      "fields": [
+        {
+          "fieldPath": "status",
+          "order": "ASCENDING"
+        },
+        {
+          "fieldPath": "eventSnapshot.startsAt",
+          "order": "ASCENDING"
+        }
+      ]
+    },
+    {
+      "collectionGroup": "tickets",
+      "queryScope": "COLLECTION",
+      "fields": [
+        {
+          "fieldPath": "status",
+          "order": "ASCENDING"
+        },
+        {
+          "fieldPath": "eventSnapshot.endsAt",
+          "order": "ASCENDING"
+        }
+      ]
     }
   ],
   "fieldOverrides": [

=== functions/src/index.ts — diff ===
@@ -5,3 +5,4 @@ export { expireBookings } from './expireBookings';
 export { expireTicketingOrders } from './expireTicketingOrders';
 export { notificationsDailyDigest } from './notificationsDailyDigest';
 export { releasePayouts } from './releasePayouts';
+export { sendServiceReminders } from './sendServiceReminders';

=== functions/src/sendServiceReminders.ts — ARQUIVO NOVO, conteúdo completo ===
import { defineString } from 'firebase-functions/params';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { callInternalJob, internalJobKey } from './callInternalJob';

const jobUrl = defineString('NOTIFICATIONS_REMINDERS_JOB_URL');

// A cada 15 min: lembretes da véspera e de 2 h antes, e convite para avaliar depois do evento (D25).
export const sendServiceReminders = onSchedule(
  {
    schedule: '*/15 * * * *',
    timeZone: 'America/Fortaleza',
    secrets: [internalJobKey],
  },
  async () => {
    await callInternalJob(jobUrl.value(), 'sendServiceReminders');
  }
);

=== server.ts — diff ===
@@ -14,6 +14,8 @@ import insightsRouter from './server/domain/insights/routes/insightsRoutes';
 import mediaRouter from './server/domain/media/routes/mediaRoutes';
 import notificationRouter from './server/domain/notifications/routes/notificationRoutes';
 import { adminMessageRouter } from './server/interfaces/http/notifications/adminMessageRoutes';
+import { usernameClaimRouter } from './server/interfaces/http/users/usernameClaimRoutes';
+import { InternalTicketingController } from './server/interfaces/http/ticketing/internalTicketingController';
 import { InternalNotificationsController } from './server/interfaces/http/notifications/internalNotificationsController';
 import partnerRouter from './server/domain/partners/routes/partnerRoutes';
 import { PaymentController } from './server/domain/payment/controllers/paymentController';
@@ -24,7 +26,6 @@ import {
 } from './server/domain/reviews/routes/reviewReportRoutes';
 import reviewRouter from './server/domain/reviews/routes/reviewRoutes';
 import { isKnownPagePath } from './server/domain/seo';
-import { TicketingController } from './server/domain/ticketing/controllers/ticketingController';
 import ticketingRouter, {
   adminTicketingEventsRouter,
 } from './server/domain/ticketing/routes/ticketingRoutes';
@@ -145,7 +146,7 @@ async function startServer() {
   app.post(
     '/internal/ticketing/expire-orders',
     verifyInternalJobKey,
-    TicketingController.expireOrdersInternalJob
+    InternalTicketingController.expireOrders
   );
   app.post('/internal/bookings/expire', verifyInternalJobKey, InternalBookingsController.expire);
   app.post('/internal/payouts/release', verifyInternalJobKey, InternalPayoutsController.release);
@@ -159,6 +160,11 @@ async function startServer() {
     verifyInternalJobKey,
     InternalNotificationsController.dispatch
   );
+  app.post(
+    '/internal/notifications/reminders',
+    verifyInternalJobKey,
+    InternalNotificationsController.reminders
+  );
   app.post(
     '/internal/notifications/daily-digest',
     verifyInternalJobKey,
@@ -214,6 +220,7 @@ async function startServer() {
   app.use('/api/weather', climaWindRouter);
   app.use('/api/admin/notifications', adminMessageRouter);
   app.use('/api/notifications', notificationRouter);
+  app.use('/api/users', usernameClaimRouter);
   app.use('/api/users', userRouter);
   app.use('/api/listing-verifications', listingVerificationRouter);
   app.use('/api/listing-plans', listingPlanRouter);

=== server/application/usecases/bookings/bookingServiceProofApplicationUseCases.test.ts — diff ===
@@ -220,6 +220,7 @@ describe('prova do serviço na camada application (D20)', () => {
     vi.mocked(completeFinishedBookingsUseCase).mockResolvedValue({
       completed: 2,
       askedToConfirm: [BOOKING as never],
+      reviewInvites: [],
     });
     vi.mocked(listBookingsWithDueDeadlineUseCase).mockResolvedValue([
       {
@@ -265,6 +266,7 @@ describe('prova do serviço na camada application (D20)', () => {
     vi.mocked(completeFinishedBookingsUseCase).mockResolvedValue({
       completed: 0,
       askedToConfirm: [],
+      reviewInvites: [],
     });
     vi.mocked(listBookingsWithDueDeadlineUseCase).mockResolvedValue([
       {

=== server/application/usecases/bookings/reconcileBookingWebhookApplicationUseCase.ts — diff ===
@@ -48,6 +48,13 @@ async function handlePaymentSucceeded(
       link: { screen: 'partner' },
       dedupeKey: `sale_booking_${booking.id}`,
     }).catch(() => undefined);
+    await createNotificationUseCase({
+      recipientUid: booking.buyerId,
+      type: 'purchase_booking_paid',
+      params: { offer: booking.offerSnapshot.title, startsAt: booking.offerSnapshot.startsAt },
+      link: { screen: 'bookings' },
+      dedupeKey: `purchase_booking_paid_${booking.id}`,
+    }).catch(() => undefined);
   } catch (error) {
     if (!(error instanceof BookingDomainError) || error.code !== 'LATE_PAYMENT_REJECTED') {
       throw error;

=== server/application/usecases/bookings/runBookingCompletionJobApplicationUseCase.ts — diff ===
@@ -1,3 +1,4 @@
+import { createNotificationUseCase } from '../../../domain/notifications';
 import {
   type Booking,
   bookingServiceEndsAt,
@@ -80,10 +81,20 @@ async function processDeadline(booking: Booking): Promise<void> {
 export async function runBookingCompletionJobApplicationUseCase(
   limit = 200
 ): Promise<BookingCompletionJobResult> {
-  const { completed, askedToConfirm } = await completeFinishedBookingsUseCase(limit);
+  const { completed, askedToConfirm, reviewInvites } = await completeFinishedBookingsUseCase(limit);
   for (const booking of askedToConfirm) {
     await sendBookingServiceNotice(booking.buyerId, 'confirmationAsked');
   }
+  for (const booking of reviewInvites) {
+    // Opcional (D25): o envio respeita "Pedidos de avaliação" e o silêncio das 23h30 às 5h30.
+    await createNotificationUseCase({
+      recipientUid: booking.buyerId,
+      type: 'review_request',
+      params: { offer: booking.offerSnapshot.title },
+      link: { screen: 'bookings' },
+      dedupeKey: `review_request_${booking.id}`,
+    }).catch(() => undefined);
+  }
   let deadlinesProcessed = 0;
   for (const booking of await listBookingsWithDueDeadlineUseCase(limit)) {
     try {

=== server/application/usecases/notifications/claimUsernameApplicationUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { createNotificationUseCase } from '../../../domain/notifications';
import { claimUsernameUseCase } from '../../../domain/users';

/** Troca do @ avisa a própria conta (segurança, D25); a primeira escolha não gera aviso. */
export async function claimUsernameApplicationUseCase(uid: string, username: string): Promise<string> {
  const result = await claimUsernameUseCase(uid, username);
  if (result.previous && result.previous !== result.username) {
    await createNotificationUseCase({
      recipientUid: uid,
      type: 'account_username_changed',
      params: { username: result.username },
      link: { screen: 'account' },
    }).catch(() => undefined);
  }
  return result.username;
}

=== server/application/usecases/notifications/expireUnpaidBookingsApplicationUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { expireOverdueBookingsUseCase } from '../../../domain/bookings';
import { createNotificationUseCase } from '../../../domain/notifications';

/** Reserva não paga no prazo libera a vaga e avisa o comprador que chegou ao pagamento (D25). */
export async function expireUnpaidBookingsApplicationUseCase(limit = 200): Promise<number> {
  const expired = await expireOverdueBookingsUseCase(limit);
  for (const booking of expired) {
    if (!booking.paymentIntentId) continue;
    await createNotificationUseCase({
      recipientUid: booking.buyerId,
      type: 'purchase_expired',
      params: { offer: booking.offerSnapshot.title },
      link: { screen: 'purchases' },
      dedupeKey: `purchase_expired_${booking.id}`,
    }).catch(() => undefined);
  }
  return expired.length;
}

=== server/application/usecases/notifications/expireUnpaidTicketOrdersApplicationUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { createNotificationUseCase } from '../../../domain/notifications';
import { expireAllOverdueOrdersUseCase } from '../../../domain/ticketing';

/**
 * Pedido não pago no prazo (ex.: Pix vencido) libera os ingressos e avisa o comprador (D25).
 * Só quem chegou ao pagamento é avisado: sem pagamento iniciado, a pessoa só olhou.
 */
export async function expireUnpaidTicketOrdersApplicationUseCase(): Promise<{
  expiredCount: number;
}> {
  const { expired } = await expireAllOverdueOrdersUseCase();
  for (const order of expired) {
    if (!order.paymentIntentId) continue;
    await createNotificationUseCase({
      recipientUid: order.buyerId,
      type: 'purchase_expired',
      params: { offer: order.eventSnapshot?.title || '' },
      link: { screen: 'purchases' },
      dedupeKey: `purchase_expired_${order.id}`,
    }).catch(() => undefined);
  }
  return { expiredCount: expired.length };
}

=== server/application/usecases/notifications/notificationTriggers.test.ts — ARQUIVO NOVO, conteúdo completo ===
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../../domain/notifications', () => ({
  createNotificationUseCase: vi.fn().mockResolvedValue(true),
}));
vi.mock('../../../domain/bookings', () => ({
  listConfirmedBookingsStartingBetweenUseCase: vi.fn().mockResolvedValue([]),
  expireOverdueBookingsUseCase: vi.fn(),
}));
vi.mock('../../../domain/ticketing', () => ({
  listIssuedTicketsStartingBetweenUseCase: vi.fn().mockResolvedValue([]),
  listCheckedInTicketsEndedBetweenUseCase: vi.fn().mockResolvedValue([]),
  expireAllOverdueOrdersUseCase: vi.fn(),
}));
vi.mock('../../../domain/users', () => ({ claimUsernameUseCase: vi.fn() }));

import {
  expireOverdueBookingsUseCase,
  listConfirmedBookingsStartingBetweenUseCase,
} from '../../../domain/bookings';
import { createNotificationUseCase } from '../../../domain/notifications';
import {
  expireAllOverdueOrdersUseCase,
  listCheckedInTicketsEndedBetweenUseCase,
  listIssuedTicketsStartingBetweenUseCase,
} from '../../../domain/ticketing';
import { claimUsernameUseCase } from '../../../domain/users';
import { claimUsernameApplicationUseCase } from './claimUsernameApplicationUseCase';
import { expireUnpaidBookingsApplicationUseCase } from './expireUnpaidBookingsApplicationUseCase';
import { expireUnpaidTicketOrdersApplicationUseCase } from './expireUnpaidTicketOrdersApplicationUseCase';
import { sendServiceRemindersApplicationUseCase } from './sendServiceRemindersApplicationUseCase';

const NOW = new Date('2026-11-03T15:00:00.000Z');
const ticket = (id: string, owner: string) => ({
  id,
  ownerUserId: owner,
  occurrenceId: 'occ-1',
  eventSnapshot: { title: 'Luau na Duna', startsAt: '2026-11-04T15:00:00.000Z', endsAt: '' },
});

describe('avisos novos (D25)', () => {
  beforeEach(() => vi.clearAllMocks());

  it('lembrete da véspera: um aviso por pessoa e sessão, com a quantidade de ingressos', async () => {
    vi.mocked(listIssuedTicketsStartingBetweenUseCase).mockImplementation(async (from) =>
      from === '2026-11-04T14:00:00.000Z'
        ? ([ticket('t1', 'ana'), ticket('t2', 'ana'), ticket('t3', 'bia')] as never)
        : []
    );
    const result = await sendServiceRemindersApplicationUseCase(NOW);
    expect(result.dayBefore).toBe(2);
    expect(createNotificationUseCase).toHaveBeenCalledWith(
      expect.objectContaining({
        recipientUid: 'ana',
        type: 'ticket_reminder_day',
        params: expect.objectContaining({ count: 2, event: 'Luau na Duna' }),
        dedupeKey: 'ticket_reminder_day_ana_occ-1',
      })
    );
  });

  it('lembrete de 2 h da reserva e convite para avaliar quem entrou no evento', async () => {
    vi.mocked(listConfirmedBookingsStartingBetweenUseCase).mockImplementation(async (from) =>
      from === '2026-11-03T15:30:00.000Z'
        ? ([
            {
              id: 'b1',
              buyerId: 'caio',
              offerSnapshot: { title: 'Buggy', startsAt: '2026-11-03T16:30:00.000Z' },
            },
          ] as never)
        : []
    );
    vi.mocked(listCheckedInTicketsEndedBetweenUseCase).mockResolvedValue([
      ticket('t9', 'duda'),
    ] as never);
    const result = await sendServiceRemindersApplicationUseCase(NOW);
    expect(result).toMatchObject({ soon: 1, reviewInvites: 1 });
    expect(createNotificationUseCase).toHaveBeenCalledWith(
      expect.objectContaining({ recipientUid: 'caio', type: 'booking_reminder_soon' })
    );
    expect(createNotificationUseCase).toHaveBeenCalledWith(
      expect.objectContaining({ recipientUid: 'duda', type: 'review_request' })
    );
  });

  it('compra não concluída avisa só quem chegou ao pagamento', async () => {
    vi.mocked(expireAllOverdueOrdersUseCase).mockResolvedValue({
      expiredCount: 2,
      expired: [
        { id: 'o1', buyerId: 'ana', paymentIntentId: 'pi_1', eventSnapshot: { title: 'Luau' } },
        { id: 'o2', buyerId: 'bia' },
      ] as never,
    });
    vi.mocked(expireOverdueBookingsUseCase).mockResolvedValue([
      { id: 'b1', buyerId: 'caio', paymentIntentId: 'pi_2', offerSnapshot: { title: 'Buggy' } },
    ] as never);
    await expireUnpaidTicketOrdersApplicationUseCase();
    await expireUnpaidBookingsApplicationUseCase();
    expect(createNotificationUseCase).toHaveBeenCalledTimes(2);
    expect(createNotificationUseCase).toHaveBeenCalledWith(
      expect.objectContaining({ recipientUid: 'ana', type: 'purchase_expired' })
    );
  });

  it('troca do @ avisa; a primeira escolha não', async () => {
    vi.mocked(claimUsernameUseCase).mockResolvedValueOnce({ username: 'ana', previous: null });
    await claimUsernameApplicationUseCase('u1', 'ana');
    expect(createNotificationUseCase).not.toHaveBeenCalled();
    vi.mocked(claimUsernameUseCase).mockResolvedValueOnce({ username: 'ana.s', previous: 'ana' });
    await claimUsernameApplicationUseCase('u1', 'ana.s');
    expect(createNotificationUseCase).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'account_username_changed', params: { username: 'ana.s' } })
    );
  });
});

=== server/application/usecases/notifications/sendServiceRemindersApplicationUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { listConfirmedBookingsStartingBetweenUseCase } from '../../../domain/bookings';
import { createNotificationUseCase, type NewNotification } from '../../../domain/notifications';
import {
  listCheckedInTicketsEndedBetweenUseCase,
  listIssuedTicketsStartingBetweenUseCase,
} from '../../../domain/ticketing';

const MINUTE_MS = 60_000;
const HOUR_MS = 60 * MINUTE_MS;

/**
 * Janelas largas de propósito: o job roda a cada 15 min e o `dedupeKey` garante um aviso só por
 * pessoa e sessão, mesmo se uma rodada falhar ou duas se sobrepuserem.
 */
const DAY_BEFORE = { from: 23 * HOUR_MS, to: 25 * HOUR_MS };
const SOON = { from: 30 * MINUTE_MS, to: 2 * HOUR_MS };
const AFTER_EVENT = { from: -6 * HOUR_MS, to: -1 * HOUR_MS };

function range(now: Date, window: { from: number; to: number }): [string, string] {
  return [
    new Date(now.getTime() + window.from).toISOString(),
    new Date(now.getTime() + window.to).toISOString(),
  ];
}

async function send(notification: NewNotification): Promise<boolean> {
  return createNotificationUseCase(notification).catch(() => false);
}

/** Um aviso por pessoa e sessão, com a quantidade de ingressos dela. */
async function ticketReminders(
  now: Date,
  window: { from: number; to: number },
  type: 'ticket_reminder_day' | 'ticket_reminder_soon'
): Promise<number> {
  const tickets = await listIssuedTicketsStartingBetweenUseCase(...range(now, window));
  const groups = new Map<string, typeof tickets>();
  for (const ticket of tickets) {
    const key = `${ticket.ownerUserId}_${ticket.occurrenceId}`;
    groups.set(key, [...(groups.get(key) ?? []), ticket]);
  }
  let sent = 0;
  for (const [key, group] of groups) {
    const first = group[0];
    if (!first) continue;
    const created = await send({
      recipientUid: first.ownerUserId,
      type,
      params: {
        event: first.eventSnapshot?.title || '',
        startsAt: first.eventSnapshot?.startsAt || '',
        count: group.length,
      },
      link: { screen: 'tickets' },
      dedupeKey: `${type}_${key}`,
    });
    if (created) sent += 1;
  }
  return sent;
}

async function bookingReminders(
  now: Date,
  window: { from: number; to: number },
  type: 'booking_reminder_day' | 'booking_reminder_soon'
): Promise<number> {
  let sent = 0;
  for (const booking of await listConfirmedBookingsStartingBetweenUseCase(...range(now, window))) {
    const created = await send({
      recipientUid: booking.buyerId,
      type,
      params: { offer: booking.offerSnapshot.title, startsAt: booking.offerSnapshot.startsAt },
      link: { screen: 'bookings' },
      dedupeKey: `${type}_${booking.id}`,
    });
    if (created) sent += 1;
  }
  return sent;
}

/** Quem entrou no evento (check-in) recebe o convite para avaliar; é opcional (D25). */
async function eventReviewInvites(now: Date): Promise<number> {
  const tickets = await listCheckedInTicketsEndedBetweenUseCase(...range(now, AFTER_EVENT));
  const seen = new Set<string>();
  let sent = 0;
  for (const ticket of tickets) {
    const key = `${ticket.ownerUserId}_${ticket.occurrenceId}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const created = await send({
      recipientUid: ticket.ownerUserId,
      type: 'review_request',
      params: { offer: ticket.eventSnapshot?.title || '' },
      link: { screen: 'tickets' },
      dedupeKey: `review_request_ticket_${key}`,
    });
    if (created) sent += 1;
  }
  return sent;
}

/** Job dos lembretes (D25): véspera, 2 h antes e convite para avaliar depois do evento. */
export async function sendServiceRemindersApplicationUseCase(now = new Date()): Promise<{
  dayBefore: number;
  soon: number;
  reviewInvites: number;
}> {
  const dayBefore =
    (await ticketReminders(now, DAY_BEFORE, 'ticket_reminder_day')) +
    (await bookingReminders(now, DAY_BEFORE, 'booking_reminder_day'));
  const soon =
    (await ticketReminders(now, SOON, 'ticket_reminder_soon')) +
    (await bookingReminders(now, SOON, 'booking_reminder_soon'));
  return { dayBefore, soon, reviewInvites: await eventReviewInvites(now) };
}

=== server/application/usecases/reconcileStripeWebhookEventApplicationUseCase.ts — diff ===
@@ -85,6 +85,15 @@ export async function reconcileStripeWebhookEventApplicationUseCase(
         title: order.eventSnapshot?.title,
       });
 
+      if (!confirmed.alreadyPaid) {
+        await createNotificationUseCase({
+          recipientUid: order.buyerId,
+          type: 'purchase_ticket_paid',
+          params: { event: order.eventSnapshot?.title || '', count: confirmed.tickets.length },
+          link: { screen: 'tickets' },
+          dedupeKey: `purchase_ticket_paid_${order.id}`,
+        }).catch(() => undefined);
+      }
       const targetPartnerId = metadata.partnerId || metadata.sellerPartnerId;
       if (!confirmed.alreadyPaid && targetPartnerId) {
         await createNotificationUseCase({

=== server/domain/bookings/adapters/firestoreBookingsAdapter.ts — diff ===
@@ -368,4 +368,20 @@ export class FirestoreBookingsAdapter implements BookingsPort {
       .get();
     return snapshot.docs.map((doc) => BookingPersistenceMapper.toDomain(doc.id, doc.data()));
   }
+
+  async listConfirmedBookingsStartingBetween(
+    fromIso: string,
+    toIso: string,
+    limit: number
+  ): Promise<Booking[]> {
+    const snapshot = await adminDb
+      .collection(BOOKINGS)
+      .where('status', '==', 'confirmed')
+      .where('offerSnapshot.startsAt', '>=', fromIso)
+      .where('offerSnapshot.startsAt', '<', toIso)
+      .orderBy('offerSnapshot.startsAt', 'asc')
+      .limit(limit)
+      .get();
+    return snapshot.docs.map((doc) => BookingPersistenceMapper.toDomain(doc.id, doc.data()));
+  }
 }

=== server/domain/bookings/adapters/inMemoryBookingsAdapter.ts — diff ===
@@ -302,4 +302,14 @@ export class InMemoryBookingsAdapter implements BookingsPort {
       .filter((b) => b.status === 'confirmed' && b.offerSnapshot.startsAt <= nowIso)
       .slice(0, limit);
   }
+  async listConfirmedBookingsStartingBetween(fromIso: string, toIso: string, limit: number) {
+    return [...this.bookings.values()]
+      .filter(
+        (b) =>
+          b.status === 'confirmed' &&
+          b.offerSnapshot.startsAt >= fromIso &&
+          b.offerSnapshot.startsAt < toIso
+      )
+      .slice(0, limit);
+  }
 }

=== server/domain/bookings/index.ts — diff ===
@@ -61,6 +61,7 @@ export { getPublicOfferSummaryUseCase } from './usecases/getPublicOfferSummaryUs
 export { getVerifiedServiceForReviewUseCase } from './usecases/getVerifiedServiceForReviewUseCase';
 export { hasCheckedInBookingUseCase } from './usecases/hasCheckedInBookingUseCase';
 export { listAvailableSlotsUseCase } from './usecases/listAvailableSlotsUseCase';
+export { listConfirmedBookingsStartingBetweenUseCase } from './usecases/listConfirmedBookingsStartingBetweenUseCase';
 export { listBookingsWithDueDeadlineUseCase } from './usecases/listBookingsWithDueDeadlineUseCase';
 export { listMyBookingsUseCase } from './usecases/listMyBookingsUseCase';
 export { listOfferBookingsForPartnerUseCase } from './usecases/listOfferBookingsForPartnerUseCase';

=== server/domain/bookings/ports/bookingsPort.ts — diff ===
@@ -109,4 +109,10 @@ export interface BookingsPort {
   listBookingsBySlot(slotId: string): Promise<Booking[]>;
   listExpiredPendingBookings(nowIso: string, limit: number): Promise<Booking[]>;
   listConfirmedBookingsStartedBefore(nowIso: string, limit: number): Promise<Booking[]>;
+  /** Reservas confirmadas que começam em [fromIso, toIso) — lembretes (D25). */
+  listConfirmedBookingsStartingBetween(
+    fromIso: string,
+    toIso: string,
+    limit: number
+  ): Promise<Booking[]>;
 }

=== server/domain/bookings/services/bookingService.test.ts — diff ===
@@ -154,7 +154,7 @@ describe('BookingService', () => {
     const { service, port, setNow } = setup({ capacity: 2 });
     const booking = await service.createPendingBooking(BUYER, INPUT, FEES);
     setNow('2026-11-01T12:16:00.000Z');
-    await expect(service.expireOverdueBookings()).resolves.toBe(1);
+    await expect(service.expireOverdueBookings()).resolves.toHaveLength(1);
     expect(port.slots.get('slot-1')?.capacityReserved).toBe(0);
     const other = await service.createPendingBooking({ uid: 'buyer-2', admin: false }, INPUT, FEES);
     await service.confirmBookingPayment(other.id, 'pi_2');
@@ -318,6 +318,8 @@ describe('BookingService', () => {
     setNow('2026-11-10T13:00:00.000Z');
     const result = await service.completeFinishedBookings();
     expect(result).toMatchObject({ completed: 1, askedToConfirm: [] });
+    // Serviço com prova: convite para avaliar (D25).
+    expect(result.reviewInvites.map((b) => b.id)).toEqual([booking.id]);
     expect(port.bookings.get(booking.id)?.serviceConfirmation).toBeUndefined();
   });

=== server/domain/bookings/services/bookingService.ts — diff ===
@@ -174,9 +174,15 @@ export class BookingService {
     await this.port.recordBookingAudit(bookingId, 'system:webhook', 'payment_failed');
   }
 
-  async expireOverdueBookings(limit = 200): Promise<number> {
+  /** Reservas confirmadas que começam em [fromIso, toIso), para os lembretes (D25). */
+  listConfirmedStartingBetween(fromIso: string, toIso: string, limit = 200): Promise<Booking[]> {
+    return this.port.listConfirmedBookingsStartingBetween(fromIso, toIso, limit);
+  }
+
+  /** Devolve as vagas das reservas não pagas no prazo; retorna as que expiraram agora. */
+  async expireOverdueBookings(limit = 200): Promise<Booking[]> {
     const overdue = await this.port.listExpiredPendingBookings(this.now().toISOString(), limit);
-    let expired = 0;
+    const expired: Booking[] = [];
     for (const booking of overdue) {
       try {
         await this.port.releaseCapacityAndSetStatus({
@@ -185,7 +191,7 @@ export class BookingService {
           actorUid: SYSTEM_ACTOR,
           reason: 'payment_window_elapsed',
         });
-        expired += 1;
+        expired.push(booking);
       } catch (error) {
         // Uma reserva confirmada no meio do caminho não pode travar as demais.
         if (!(error instanceof BookingDomainError)) throw error;
@@ -353,7 +359,7 @@ export class BookingService {
    */
   async completeFinishedBookings(
     limit = 200
-  ): Promise<{ completed: number; askedToConfirm: Booking[] }> {
+  ): Promise<{ completed: number; askedToConfirm: Booking[]; reviewInvites: Booking[] }> {
     const nowDate = this.now();
     const started = await this.port.listConfirmedBookingsStartedBefore(
       nowDate.toISOString(),
@@ -361,6 +367,8 @@ export class BookingService {
     );
     let completed = 0;
     const askedToConfirm: Booking[] = [];
+    // Serviço que aconteceu (sem pergunta pendente nem ausência): convite para avaliar (D25).
+    const reviewInvites: Booking[] = [];
     for (const booking of started) {
       if ((await this.serviceEndMs(booking)) > nowDate.getTime()) continue;
       // Entrada de atração não usada até o fechamento é ausência, como ingresso não usado (D20, A).
@@ -389,8 +397,10 @@ export class BookingService {
       if (updated.status === 'confirmed') continue;
       completed += 1;
       if (ask && updated.status === 'completed') askedToConfirm.push(updated);
+      else if (updated.status === 'completed' && !updated.providerAbsence)
+        reviewInvites.push(updated);
     }
-    return { completed, askedToConfirm };
+    return { completed, askedToConfirm, reviewInvites };
   }
 
   /** Fim do serviço; a entrada de atração vale até o fechamento do horário (D20). */

=== server/domain/bookings/usecases/completeFinishedBookingsUseCase.ts — ARQUIVO REESCRITO, substitua todo o conteúdo por este ===
import { getBookingService } from '../factory';
import type { Booking } from '../types/bookingTypes';

/**
 * Conclui as reservas cujo horário terminou. Devolve as que ficaram sem prova do serviço (D20) e as
 * que podem receber o convite para avaliar (D25).
 */
export async function completeFinishedBookingsUseCase(
  limit = 200
): Promise<{ completed: number; askedToConfirm: Booking[]; reviewInvites: Booking[] }> {
  return getBookingService().completeFinishedBookings(limit);
}

=== server/domain/bookings/usecases/expireOverdueBookingsUseCase.ts — ARQUIVO REESCRITO, substitua todo o conteúdo por este ===
import { getBookingService } from '../factory';
import type { Booking } from '../types/bookingTypes';

/** Devolve as vagas das reservas não pagas no prazo. Retorna as que expiraram nesta rodada. */
export async function expireOverdueBookingsUseCase(limit = 200): Promise<Booking[]> {
  return getBookingService().expireOverdueBookings(limit);
}

=== server/domain/bookings/usecases/listConfirmedBookingsStartingBetweenUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { getBookingService } from '../factory';
import type { Booking } from '../types/bookingTypes';

/** Reservas confirmadas que começam no intervalo, para os lembretes (D25). */
export function listConfirmedBookingsStartingBetweenUseCase(
  fromIso: string,
  toIso: string,
  limit = 200
): Promise<Booking[]> {
  return getBookingService().listConfirmedStartingBetween(fromIso, toIso, limit);
}

=== server/domain/notifications/adapters/fcmPushSenderAdapter.ts — diff ===
@@ -8,6 +8,8 @@ const PATHS: Record<NotificationLink['screen'], string> = {
   tickets: '/?menu=tickets',
   bookings: '/?menu=bookings',
   purchases: '/?menu=purchases',
+  reviews: '/?menu=reviews',
+  account: '/?menu=username',
   partner: '/?partner=1',
   item: '/?partner=1',
   event: '/?partner=1',

=== server/domain/notifications/i18n/notificationTexts.ts — diff ===
@@ -32,7 +32,8 @@ export const NOTIFICATION_TEXTS_PT_BR: NotificationTypeTexts = {
   event_postponed: {
     title: 'Evento com nova data',
     body: '{{event}} passou para {{date}}. Seu ingresso vale na nova data. Se não puder ir, peça o reembolso em até 7 dias.',
-    bodyGeneric: 'Um evento seu passou para {{date}}. Seu ingresso vale na nova data. Se não puder ir, peça o reembolso em até 7 dias.',
+    bodyGeneric:
+      'Um evento seu passou para {{date}}. Seu ingresso vale na nova data. Se não puder ir, peça o reembolso em até 7 dias.',
   },
   booking_provider_arrived: {
     title: '{{business}} chegou',
@@ -42,7 +43,8 @@ export const NOTIFICATION_TEXTS_PT_BR: NotificationTypeTexts = {
   booking_no_show_marked: {
     title: 'Ausência registrada',
     body: '{{business}} registrou que você não foi. Se você estava lá, conte pra gente em Compras.',
-    bodyGeneric: 'O prestador registrou que você não foi. Se você estava lá, conte pra gente em Compras.',
+    bodyGeneric:
+      'O prestador registrou que você não foi. Se você estava lá, conte pra gente em Compras.',
   },
   booking_absence_in_review: {
     title: 'Estamos analisando',
@@ -115,6 +117,54 @@ export const NOTIFICATION_TEXTS_PT_BR: NotificationTypeTexts = {
     body_one: '{{count}} venda ou reserva hoje. Veja os detalhes no painel.',
     body_other: '{{count}} vendas ou reservas hoje. Veja os detalhes no painel.',
   },
+  purchase_ticket_paid: {
+    title: 'Compra confirmada',
+    body_one: 'Seu ingresso para {{event}} já está em Ingressos.',
+    body_other: 'Seus {{count}} ingressos para {{event}} já estão em Ingressos.',
+  },
+  purchase_booking_paid: {
+    title: 'Reserva confirmada',
+    body: '{{offer}}, {{date}}. O seu código aparece no dia.',
+  },
+  purchase_expired: {
+    title: 'Compra não concluída',
+    body: 'O pagamento de {{offer}} não chegou a tempo e a vaga foi liberada. Você pode comprar de novo.',
+    bodyGeneric: 'O pagamento não chegou a tempo e a vaga foi liberada. Você pode comprar de novo.',
+  },
+  ticket_reminder_day: {
+    title: 'Seu evento é amanhã',
+    body: '{{event}}, {{date}}. O código do ingresso aparece a partir da meia-noite.',
+  },
+  ticket_reminder_soon: {
+    title: 'Começa daqui a pouco',
+    body: '{{event}} começa em menos de 2 horas. Seu ingresso está em Ingressos.',
+  },
+  booking_reminder_day: {
+    title: 'Sua reserva é amanhã',
+    body: '{{offer}}, {{date}}. O seu código aparece a partir da meia-noite.',
+  },
+  booking_reminder_soon: {
+    title: 'Falta pouco',
+    body: '{{offer}} começa em menos de 2 horas. Seu código está em Reservas.',
+  },
+  review_request: {
+    title: 'Como foi?',
+    body: 'Conte como foi {{offer}}. Sua avaliação ajuda outros viajantes.',
+    bodyGeneric: 'Conte como foi. Sua avaliação ajuda outros viajantes.',
+  },
+  review_reply_received: {
+    title: 'Responderam sua avaliação',
+    body: '{{business}} respondeu o que você escreveu.',
+    bodyGeneric: 'O estabelecimento respondeu o que você escreveu.',
+  },
+  review_report_decided: {
+    title: 'Analisamos sua denúncia',
+    body: 'Obrigado por avisar. A análise foi concluída.',
+  },
+  account_username_changed: {
+    title: 'Seu @ mudou',
+    body: 'Agora você é {{username}}. Se não foi você, fale com a gente.',
+  },
   admin_message: {
     title: '{{title}}',
     body: '{{message}}',
@@ -149,7 +199,8 @@ export const NOTIFICATION_TEXTS_EN: NotificationTypeTexts = {
   event_postponed: {
     title: 'Event has a new date',
     body: '{{event}} moved to {{date}}. Your ticket is valid on the new date. If you can’t go, ask for a refund within 7 days.',
-    bodyGeneric: 'One of your events moved to {{date}}. Your ticket is valid on the new date. If you can’t go, ask for a refund within 7 days.',
+    bodyGeneric:
+      'One of your events moved to {{date}}. Your ticket is valid on the new date. If you can’t go, ask for a refund within 7 days.',
   },
   booking_provider_arrived: {
     title: '{{business}} has arrived',
@@ -159,7 +210,8 @@ export const NOTIFICATION_TEXTS_EN: NotificationTypeTexts = {
   booking_no_show_marked: {
     title: 'Marked as no-show',
     body: '{{business}} marked that you didn’t show up. If you were there, tell us in Purchases.',
-    bodyGeneric: 'The provider marked that you didn’t show up. If you were there, tell us in Purchases.',
+    bodyGeneric:
+      'The provider marked that you didn’t show up. If you were there, tell us in Purchases.',
   },
   booking_absence_in_review: {
     title: 'We’re looking into it',
@@ -232,6 +284,54 @@ export const NOTIFICATION_TEXTS_EN: NotificationTypeTexts = {
     body_one: '{{count}} sale or booking today. See the details in your panel.',
     body_other: '{{count}} sales or bookings today. See the details in your panel.',
   },
+  purchase_ticket_paid: {
+    title: 'Purchase confirmed',
+    body_one: 'Your ticket for {{event}} is in Tickets.',
+    body_other: 'Your {{count}} tickets for {{event}} are in Tickets.',
+  },
+  purchase_booking_paid: {
+    title: 'Booking confirmed',
+    body: '{{offer}}, {{date}}. Your code appears on the day.',
+  },
+  purchase_expired: {
+    title: 'Purchase not completed',
+    body: 'Payment for {{offer}} didn’t arrive in time, so the spot was released. You can buy again.',
+    bodyGeneric: 'Payment didn’t arrive in time, so the spot was released. You can buy again.',
+  },
+  ticket_reminder_day: {
+    title: 'Your event is tomorrow',
+    body: '{{event}}, {{date}}. Your ticket code appears from midnight.',
+  },
+  ticket_reminder_soon: {
+    title: 'Starting soon',
+    body: '{{event}} starts in less than 2 hours. Your ticket is in Tickets.',
+  },
+  booking_reminder_day: {
+    title: 'Your booking is tomorrow',
+    body: '{{offer}}, {{date}}. Your code appears from midnight.',
+  },
+  booking_reminder_soon: {
+    title: 'Almost time',
+    body: '{{offer}} starts in less than 2 hours. Your code is in Bookings.',
+  },
+  review_request: {
+    title: 'How was it?',
+    body: 'Tell us how {{offer}} went. Your review helps other travelers.',
+    bodyGeneric: 'Tell us how it went. Your review helps other travelers.',
+  },
+  review_reply_received: {
+    title: 'Someone replied to your review',
+    body: '{{business}} replied to what you wrote.',
+    bodyGeneric: 'The business replied to what you wrote.',
+  },
+  review_report_decided: {
+    title: 'We reviewed your report',
+    body: 'Thanks for letting us know. The review is complete.',
+  },
+  account_username_changed: {
+    title: 'Your @ changed',
+    body: 'You’re now {{username}}. If this wasn’t you, contact us.',
+  },
   admin_message: {
     title: '{{title}}',
     body: '{{message}}',
@@ -266,7 +366,8 @@ export const NOTIFICATION_TEXTS_FR: NotificationTypeTexts = {
   event_postponed: {
     title: 'Nouvelle date pour l’événement',
     body: '{{event}} est reporté au {{date}}. Votre billet est valable à la nouvelle date. Si vous ne pouvez pas venir, demandez le remboursement sous 7 jours.',
-    bodyGeneric: 'Un de vos événements est reporté au {{date}}. Votre billet est valable à la nouvelle date. Si vous ne pouvez pas venir, demandez le remboursement sous 7 jours.',
+    bodyGeneric:
+      'Un de vos événements est reporté au {{date}}. Votre billet est valable à la nouvelle date. Si vous ne pouvez pas venir, demandez le remboursement sous 7 jours.',
   },
   booking_provider_arrived: {
     title: '{{business}} est arrivé',
@@ -276,7 +377,8 @@ export const NOTIFICATION_TEXTS_FR: NotificationTypeTexts = {
   booking_no_show_marked: {
     title: 'Absence enregistrée',
     body: '{{business}} a indiqué que vous n’êtes pas venu. Si vous étiez là, dites-le-nous dans Achats.',
-    bodyGeneric: 'Le prestataire a indiqué que vous n’êtes pas venu. Si vous étiez là, dites-le-nous dans Achats.',
+    bodyGeneric:
+      'Le prestataire a indiqué que vous n’êtes pas venu. Si vous étiez là, dites-le-nous dans Achats.',
   },
   booking_absence_in_review: {
     title: 'Nous examinons la situation',
@@ -337,8 +439,10 @@ export const NOTIFICATION_TEXTS_FR: NotificationTypeTexts = {
   },
   plan_expiring: {
     title: 'Votre formule se termine bientôt',
-    body_one: 'La formule de {{listing}} se termine dans {{count}} jour. Renouvelez-la pour garder le badge.',
-    body_other: 'La formule de {{listing}} se termine dans {{count}} jours. Renouvelez-la pour garder le badge.',
+    body_one:
+      'La formule de {{listing}} se termine dans {{count}} jour. Renouvelez-la pour garder le badge.',
+    body_other:
+      'La formule de {{listing}} se termine dans {{count}} jours. Renouvelez-la pour garder le badge.',
   },
   plan_renewal_failed: {
     title: 'Impossible de renouveler votre formule',
@@ -349,6 +453,55 @@ export const NOTIFICATION_TEXTS_FR: NotificationTypeTexts = {
     body_one: '{{count}} vente ou réservation aujourd’hui. Voir le détail dans votre espace.',
     body_other: '{{count}} ventes ou réservations aujourd’hui. Voir le détail dans votre espace.',
   },
+  purchase_ticket_paid: {
+    title: 'Achat confirmé',
+    body_one: 'Votre billet pour {{event}} est dans Billets.',
+    body_other: 'Vos {{count}} billets pour {{event}} sont dans Billets.',
+  },
+  purchase_booking_paid: {
+    title: 'Réservation confirmée',
+    body: '{{offer}}, {{date}}. Votre code apparaît le jour même.',
+  },
+  purchase_expired: {
+    title: 'Achat non finalisé',
+    body: 'Le paiement de {{offer}} n’est pas arrivé à temps et la place a été libérée. Vous pouvez acheter à nouveau.',
+    bodyGeneric:
+      'Le paiement n’est pas arrivé à temps et la place a été libérée. Vous pouvez acheter à nouveau.',
+  },
+  ticket_reminder_day: {
+    title: 'Votre événement, c’est demain',
+    body: '{{event}}, {{date}}. Le code du billet apparaît à partir de minuit.',
+  },
+  ticket_reminder_soon: {
+    title: 'Ça commence bientôt',
+    body: '{{event}} commence dans moins de 2 heures. Votre billet est dans Billets.',
+  },
+  booking_reminder_day: {
+    title: 'Votre réservation, c’est demain',
+    body: '{{offer}}, {{date}}. Votre code apparaît à partir de minuit.',
+  },
+  booking_reminder_soon: {
+    title: 'C’est bientôt',
+    body: '{{offer}} commence dans moins de 2 heures. Votre code est dans Réservations.',
+  },
+  review_request: {
+    title: 'C’était comment ?',
+    body: 'Racontez-nous comment s’est passé {{offer}}. Votre avis aide les autres voyageurs.',
+    bodyGeneric: 'Racontez-nous comment ça s’est passé. Votre avis aide les autres voyageurs.',
+  },
+  review_reply_received: {
+    title: 'On a répondu à votre avis',
+    body: '{{business}} a répondu à ce que vous avez écrit.',
+    bodyGeneric: 'L’établissement a répondu à ce que vous avez écrit.',
+  },
+  review_report_decided: {
+    title: 'Nous avons examiné votre signalement',
+    body: 'Merci de nous avoir prévenus. L’examen est terminé.',
+  },
+  account_username_changed: {
+    title: 'Votre @ a changé',
+    body: 'Vous êtes maintenant {{username}}. Si ce n’était pas vous, contactez-nous.',
+  },
   admin_message: {
     title: '{{title}}',
     body: '{{message}}',

=== server/domain/notifications/services/pushDispatchService.test.ts — diff ===
@@ -11,7 +11,7 @@ import { isQuietHour, nextMorning, PushDispatchService } from './pushDispatchSer
 
 // 15h em Fortaleza (UTC−3).
 const AFTERNOON = new Date('2026-11-03T18:00:00.000Z');
-const NIGHT = new Date('2026-11-04T01:30:00.000Z'); // 22h30 do dia 3 em Fortaleza
+const NIGHT = new Date('2026-11-04T03:00:00.000Z'); // meia-noite do dia 4 em Fortaleza
 
 function entry(partial: Partial<OutboxEntry> = {}): OutboxEntry {
   return {
@@ -103,13 +103,13 @@ describe('PushDispatchService', () => {
     expect(result.skipped).toBe(1);
   });
 
-  it('aviso opcional respeita a escolha e espera as 9h', async () => {
+  it('aviso opcional respeita a escolha e espera as 5h30', async () => {
     const optional = OPTIONAL_TYPES as Record<string, 'news'>;
     optional.ticket_received = 'news';
     try {
       vi.mocked(repo.getPreferences).mockResolvedValue({ news: true });
       expect(await service.dispatch(NIGHT)).toMatchObject({ deferred: 1 });
-      expect(outbox.defer).toHaveBeenCalledWith('n1', new Date('2026-11-04T12:00:00.000Z'));
+      expect(outbox.defer).toHaveBeenCalledWith('n1', new Date('2026-11-04T08:30:00.000Z'));
 
       vi.mocked(repo.getPreferences).mockResolvedValue({ news: false });
       expect(await service.dispatch(AFTERNOON)).toMatchObject({ skipped: 1 });
@@ -147,12 +147,18 @@ describe('PushDispatchService', () => {
     );
   });
 
-  it('horário de silêncio é das 21h às 9h em Fortaleza', () => {
+  it('horário de silêncio é das 23h30 às 5h30 em Fortaleza', () => {
     expect(isQuietHour(AFTERNOON)).toBe(false);
     expect(isQuietHour(NIGHT)).toBe(true);
-    expect(isQuietHour(new Date('2026-11-03T11:59:00.000Z'))).toBe(true);
-    expect(nextMorning(new Date('2026-11-03T10:00:00.000Z'))).toEqual(
-      new Date('2026-11-03T12:00:00.000Z')
+    expect(isQuietHour(new Date('2026-11-04T02:29:00.000Z'))).toBe(false); // 23h29
+    expect(isQuietHour(new Date('2026-11-04T02:30:00.000Z'))).toBe(true); // 23h30
+    expect(isQuietHour(new Date('2026-11-04T08:29:00.000Z'))).toBe(true); // 5h29
+    expect(isQuietHour(new Date('2026-11-04T08:30:00.000Z'))).toBe(false); // 5h30
+    expect(nextMorning(new Date('2026-11-04T07:00:00.000Z'))).toEqual(
+      new Date('2026-11-04T08:30:00.000Z')
+    );
+    expect(nextMorning(new Date('2026-11-04T02:45:00.000Z'))).toEqual(
+      new Date('2026-11-04T08:30:00.000Z')
     );
   });
 });

=== server/domain/notifications/services/pushDispatchService.ts — diff ===
@@ -21,8 +21,13 @@ const BATCH = 100;
 const LEASE_MS = 5 * MINUTE_MS;
 const MAX_ATTEMPTS = 5;
 
-function fortalezaHour(now: Date): number {
-  return new Date(now.getTime() - FORTALEZA_OFFSET_MS).getUTCHours();
+// Silêncio dos avisos opcionais (D25): das 23h30 às 5h30, em minutos do dia em Fortaleza.
+const QUIET_START_MIN = 23 * 60 + 30;
+const QUIET_END_MIN = 5 * 60 + 30;
+
+function fortalezaMinuteOfDay(now: Date): number {
+  const local = new Date(now.getTime() - FORTALEZA_OFFSET_MS);
+  return local.getUTCHours() * 60 + local.getUTCMinutes();
 }
 
 function fortalezaDayStart(now: Date): Date {
@@ -30,15 +35,16 @@ function fortalezaDayStart(now: Date): Date {
   return new Date(Math.floor(local / DAY_MS) * DAY_MS + FORTALEZA_OFFSET_MS);
 }
 
-/** Avisos opcionais nunca chegam das 21h às 9h (D25, revisão). */
+/** Avisos opcionais nunca chegam das 23h30 às 5h30 (D25, revisão). */
 export function isQuietHour(now: Date): boolean {
-  const hour = fortalezaHour(now);
-  return hour >= 21 || hour < 9;
+  const minute = fortalezaMinuteOfDay(now);
+  return minute >= QUIET_START_MIN || minute < QUIET_END_MIN;
 }
 
+/** Próximas 5h30 em Fortaleza: quando o aviso adiado sai. */
 export function nextMorning(now: Date): Date {
-  const nine = new Date(fortalezaDayStart(now).getTime() + 9 * HOUR_MS);
-  return fortalezaHour(now) < 9 ? nine : new Date(nine.getTime() + DAY_MS);
+  const morning = new Date(fortalezaDayStart(now).getTime() + QUIET_END_MIN * MINUTE_MS);
+  return fortalezaMinuteOfDay(now) < QUIET_END_MIN ? morning : new Date(morning.getTime() + DAY_MS);
 }
 
 export interface DispatchResult {

=== server/domain/notifications/types/notificationTypes.ts — diff ===
@@ -3,6 +3,17 @@
  * (AGENTS.md §12.5). O assunto define o ícone, para onde o toque leva e o que a pessoa pode desligar.
  */
 export const NOTIFICATION_TYPES = {
+  purchase_ticket_paid: 'purchases',
+  purchase_booking_paid: 'purchases',
+  purchase_expired: 'purchases',
+  ticket_reminder_day: 'tickets',
+  ticket_reminder_soon: 'tickets',
+  booking_reminder_day: 'bookings',
+  booking_reminder_soon: 'bookings',
+  review_request: 'reviews',
+  review_reply_received: 'reviews',
+  review_report_decided: 'reviews',
+  account_username_changed: 'account',
   ticket_received: 'tickets',
   ticket_returned: 'tickets',
   ticket_link_accepted: 'tickets',
@@ -31,17 +42,22 @@ export const NOTIFICATION_TYPES = {
 } as const;
 
 export type NotificationType = keyof typeof NOTIFICATION_TYPES;
-export type NotificationCategory =
-  | (typeof NOTIFICATION_TYPES)[NotificationType]
-  | 'news'
-  | 'reviews';
+export type NotificationCategory = (typeof NOTIFICATION_TYPES)[NotificationType] | 'news';
 
 /** Dados que entram no texto traduzido. Nada de PII além do que a pessoa já vê no app. */
 export type NotificationParams = Record<string, string | number>;
 
 /** Para onde o toque leva. O app monta a rota; o servidor não conhece URLs. */
 export interface NotificationLink {
-  screen: 'tickets' | 'bookings' | 'purchases' | 'partner' | 'item' | 'event';
+  screen:
+    | 'tickets'
+    | 'bookings'
+    | 'purchases'
+    | 'reviews'
+    | 'account'
+    | 'partner'
+    | 'item'
+    | 'event';
   id?: string;
 }
 
@@ -71,7 +87,9 @@ export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
 export const NOTIFICATION_RETENTION_DAYS = 90;
 
 /**
- * Tipos opcionais (D25, revisão): só saem com a escolha ligada e nunca das 21h às 9h (Fortaleza).
- * Hoje nenhum aviso gravado é opcional; os pedidos de avaliação e as novidades entram aqui quando existirem.
+ * Tipos opcionais (D25, revisão): só saem com a escolha ligada e nunca das 23h30 às 5h30 (Fortaleza).
+ * Novidades entram aqui quando existirem.
  */
-export const OPTIONAL_TYPES: Partial<Record<NotificationType, 'reviewRequests' | 'news'>> = {};
+export const OPTIONAL_TYPES: Partial<Record<NotificationType, 'reviewRequests' | 'news'>> = {
+  review_request: 'reviewRequests',
+};

=== server/domain/notifications/utils/renderNotificationText.ts — diff ===
@@ -12,7 +12,7 @@ const TEXTS: Record<Locale, NotificationTypeTexts> = {
   en: NOTIFICATION_TEXTS_EN,
   fr: NOTIFICATION_TEXTS_FR,
 };
-const NAMED_PARAMS = ['event', 'business', 'username', 'listing'];
+const NAMED_PARAMS = ['event', 'business', 'username', 'listing', 'offer'];
 const COUNT_PARAMS = ['count', 'participants', 'rating', 'days'];
 const TIME_ZONE = 'America/Fortaleza';

=== server/domain/reviews/adapters/firestoreReviewAdapter.test.ts — diff ===
@@ -63,12 +63,12 @@ const mocks = vi.hoisted(() => {
 
   const createQueryObj = (
     col: string,
-    filters: Array<{ field: string; op: string; val: any }> = []
+    filters: Array<{ field: string; op: string; val: unknown }> = []
   ) => {
-    const queryObj: any = {
+    const queryObj: Record<string, unknown> = {
       _col: col,
       _filters: [...filters],
-      where: vi.fn((field: string, op: string, val: any) => {
+      where: vi.fn((field: string, op: string, val: unknown): Record<string, unknown> => {
         return createQueryObj(col, [...filters, { field, op, val }]);
       }),
       get: vi.fn().mockResolvedValue({ empty: true, forEach: () => {}, docs: [] }),
@@ -84,7 +84,7 @@ const mocks = vi.hoisted(() => {
   const adminDb = {
     collection: vi.fn((col: string) => ({
       doc: (id: string) => getDocRef(col, id),
-      where: (field: string, op: string, val: any) => createQueryObj(col, [{ field, op, val }]),
+      where: (field: string, op: string, val: unknown) => createQueryObj(col, [{ field, op, val }]),
       get: vi.fn().mockResolvedValue({ empty: true, docs: [] }),
     })),
     batch: vi.fn(() => mockBatch),
@@ -150,7 +150,7 @@ describe('FirestoreReviewAdapter — respondToReview Authorization', () => {
 
     await expect(
       adapter.respondToReview('review-id', 'Resposta do proprietário', 'owner-atual', false)
-    ).resolves.toBeUndefined();
+    ).resolves.toMatchObject({ authorId: expect.any(String) });
 
     expect(reviewRef.update).toHaveBeenCalledWith(
       expect.objectContaining({
@@ -172,7 +172,7 @@ describe('FirestoreReviewAdapter — respondToReview Authorization', () => {
 
     await expect(
       adapter.respondToReview('review-id', 'Moderação oficial da plataforma', 'admin-id', true)
-    ).resolves.toBeUndefined();
+    ).resolves.toMatchObject({ authorId: expect.any(String) });
 
     expect(reviewRef.update).toHaveBeenCalledWith(
       expect.objectContaining({
@@ -222,7 +222,7 @@ describe('FirestoreReviewAdapter — submitReviewAndRecalculateRating', () => {
       get: vi.fn().mockResolvedValue({
         empty: false,
         docs: reviews.map((r) => ({ data: () => r })),
-        forEach: (cb: any) => {
+        forEach: (cb: (doc: { data: () => unknown }) => void) => {
           reviews.forEach((r) => {
             cb({ data: () => r });
           });
@@ -238,7 +238,7 @@ describe('FirestoreReviewAdapter — submitReviewAndRecalculateRating', () => {
         };
       }
       return { doc: (id: string) => mocks.getDocRef(col, id) };
-    }) as any);
+    }) as never);
 
     const result = await adapter.submitReviewAndRecalculateRating({
       itemId: 'item-1',
@@ -282,7 +282,7 @@ describe('FirestoreReviewAdapter — deleteReviewsByUser', () => {
         get: vi.fn().mockResolvedValue({ empty: true, forEach: () => {} }),
       })),
       doc: (id: string) => mocks.getDocRef(col, id),
-    })) as any);
+    })) as never);
 
     await expect(adapter.deleteReviewsByUser('user-sem-reviews')).resolves.toBeUndefined();
   });

=== server/domain/reviews/adapters/firestoreReviewAdapter.ts — diff ===
@@ -145,7 +145,7 @@ export class FirestoreReviewAdapter implements ReviewPort {
     response: string,
     responderId: string,
     isAdmin = false
-  ): Promise<void> {
+  ): Promise<{ authorId: string; itemName: string }> {
     const reviewRef = adminDb.collection('reviews').doc(reviewId);
 
     const reviewSnap = await reviewRef.get();
@@ -178,6 +178,15 @@ export class FirestoreReviewAdapter implements ReviewPort {
       responderId,
       updatedAt: FieldValue.serverTimestamp(),
     });
+    const saved = reviewSnap.data() ?? {};
+    const savedItemId = typeof saved.itemId === 'string' ? saved.itemId : '';
+    // Nome do lugar para o aviso a quem avaliou; sem nome, o texto do aviso diz "o estabelecimento".
+    const itemName = !savedItemId
+      ? ''
+      : saved.itemCollection === 'events'
+        ? ((await getEventListingByIdUseCase(savedItemId))?.title ?? '')
+        : ((await getItemByIdUseCase(savedItemId))?.name ?? '');
+    return { authorId: typeof saved.userId === 'string' ? saved.userId : '', itemName };
   }
 
   async deleteReview(reviewId: string, requesterId: string, isAdmin = false): Promise<void> {

=== server/domain/reviews/adapters/reviewNotificationAdapter.ts — diff ===
@@ -13,4 +13,27 @@ export class ReviewNotificationAdapter implements ReviewNotificationPort {
       link: { screen: context.itemCollection === 'events' ? 'event' : 'item', id: context.itemId },
     });
   }
+
+  async notifyReviewReplied(context: {
+    authorId: string;
+    reviewId: string;
+    businessName: string;
+  }): Promise<void> {
+    await createNotificationUseCase({
+      recipientUid: context.authorId,
+      type: 'review_reply_received',
+      params: { business: context.businessName },
+      link: { screen: 'reviews' },
+      dedupeKey: `review_reply_${context.reviewId}`,
+    });
+  }
+
+  async notifyReportDecided(context: { reporterUid: string; reportId: string }): Promise<void> {
+    await createNotificationUseCase({
+      recipientUid: context.reporterUid,
+      type: 'review_report_decided',
+      link: { screen: 'reviews' },
+      dedupeKey: `review_report_decided_${context.reportId}`,
+    });
+  }
 }

=== server/domain/reviews/factory.ts — diff ===
@@ -5,7 +5,7 @@ import { ReviewReportService } from './services/reviewReportService';
 import { ReviewService } from './services/reviewService';
 
 const reviewAdapter = new FirestoreReviewAdapter();
-const reviewNotificationAdapter = new ReviewNotificationAdapter();
+export const reviewNotificationAdapter = new ReviewNotificationAdapter();
 
 export const reviewService = new ReviewService(reviewAdapter, reviewNotificationAdapter);
 export const reviewReportService = new ReviewReportService(new FirestoreReviewReportAdapter());

=== server/domain/reviews/ports/reviewNotificationPort.ts — diff ===
@@ -10,4 +10,12 @@ export interface ReviewNotificationContext {
 
 export interface ReviewNotificationPort {
   notifyReviewReceived(context: ReviewNotificationContext): Promise<void>;
+  /** Avisa quem escreveu a avaliação que o estabelecimento respondeu (D25). */
+  notifyReviewReplied(context: {
+    authorId: string;
+    reviewId: string;
+    businessName: string;
+  }): Promise<void>;
+  /** Avisa quem denunciou que a análise terminou (D25). */
+  notifyReportDecided(context: { reporterUid: string; reportId: string }): Promise<void>;
 }

=== server/domain/reviews/ports/reviewPort.ts — diff ===
@@ -26,7 +26,7 @@ export interface ReviewPort {
     response: string,
     responderId: string,
     isAdmin?: boolean
-  ): Promise<void>;
+  ): Promise<{ authorId: string; itemName: string }>;
   deleteReview(reviewId: string, requesterId: string, isAdmin?: boolean): Promise<void>;
   deleteReviewsByUser(userId: string): Promise<void>;
   getReviewsStats(): Promise<{ totalReviews: number; avgRating: number }>;

=== server/domain/reviews/services/reviewService.test.ts — diff ===
@@ -21,7 +21,7 @@ vi.mock('../../bookings', () => ({
 function createReviewPortMock(): ReviewPort {
   return {
     submitReviewAndRecalculateRating: vi.fn(),
-    respondToReview: vi.fn(),
+    respondToReview: vi.fn().mockResolvedValue({ authorId: 'user-1', itemName: 'Pousada' }),
     deleteReview: vi.fn(),
     deleteReviewsByUser: vi.fn(),
     getReviewsStats: vi.fn(),
@@ -31,6 +31,8 @@ function createReviewPortMock(): ReviewPort {
 function createReviewNotificationPortMock(): ReviewNotificationPort {
   return {
     notifyReviewReceived: vi.fn(),
+    notifyReviewReplied: vi.fn().mockResolvedValue(undefined),
+    notifyReportDecided: vi.fn().mockResolvedValue(undefined),
   };
 }
 
@@ -359,6 +361,11 @@ describe('ReviewService', () => {
         'partner-1',
         false
       );
+      expect(notificationPort.notifyReviewReplied).toHaveBeenCalledWith({
+        authorId: 'user-1',
+        reviewId: 'review-1',
+        businessName: 'Pousada',
+      });
     });
   });
 });

=== server/domain/reviews/services/reviewService.ts — diff ===
@@ -84,7 +84,18 @@ export class ReviewService {
       throw new Error('Conteúdo da resposta é obrigatório');
     }
 
-    await this.reviewPort.respondToReview(reviewId, response.trim(), responderId, isAdmin);
+    const { authorId, itemName } = await this.reviewPort.respondToReview(
+      reviewId,
+      response.trim(),
+      responderId,
+      isAdmin
+    );
+    if (authorId && authorId !== responderId) {
+      // Só a primeira resposta avisa (dedupe pelo id da avaliação); editar a resposta não repete.
+      await this.reviewNotificationPort
+        .notifyReviewReplied({ authorId, reviewId, businessName: itemName })
+        .catch(() => undefined);
+    }
   }
 
   async deleteReview(reviewId: string, requesterId: string, isAdmin = false): Promise<void> {

=== server/domain/reviews/usecases/decideReviewReportUseCase.ts — ARQUIVO REESCRITO, substitua todo o conteúdo por este ===
import { reviewNotificationAdapter, reviewReportService } from '../factory';
import type { ReviewReport, ReviewReportOutcome } from '../types/reviewReport';

/** Aceita remove a resposta denunciada; recusada mantém (D19). Quem denunciou é avisado (D25). */
export async function decideReviewReportUseCase(
  adminUid: string,
  reportId: string,
  outcome: ReviewReportOutcome
): Promise<ReviewReport> {
  const decided = await reviewReportService.decide(adminUid, reportId, outcome);
  await reviewNotificationAdapter
    .notifyReportDecided({ reporterUid: decided.reporterUid, reportId: decided.id })
    .catch(() => undefined);
  return decided;
}

=== server/domain/ticketing/adapters/firestoreTicketStore.ts — diff ===
@@ -258,6 +258,27 @@ export class FirestoreTicketStore {
     });
   }
 
+  async listTicketsByEventTime(query: {
+    status: TicketStatus;
+    field: 'startsAt' | 'endsAt';
+    fromIso: string;
+    toIso: string;
+    limit: number;
+  }): Promise<Ticket[]> {
+    const path = `eventSnapshot.${query.field}`;
+    const snap = await adminDb
+      .collection('tickets')
+      .where('status', '==', query.status)
+      .where(path, '>=', query.fromIso)
+      .where(path, '<', query.toIso)
+      .orderBy(path)
+      .limit(query.limit)
+      .get();
+    return snap.docs.map((doc) =>
+      TicketPersistenceMapper.toDomain(doc.id, (doc.data() || {}) as Record<string, unknown>)
+    );
+  }
+
   async listTicketsChangedSince(
     occurrenceId: string,
     sinceIso: string,

=== server/domain/ticketing/adapters/firestoreTicketingAdapter.ts — diff ===
@@ -63,6 +63,7 @@ export class FirestoreTicketingAdapter implements TicketingPort {
   readonly listCheckInsByOccurrenceId = this.checkIn.listCheckInsByOccurrenceId.bind(this.checkIn);
   readonly anonymizeUser = this.privacy.anonymizeUser.bind(this.privacy);
   readonly listTicketsChangedSince = this.ticket.listTicketsChangedSince.bind(this.ticket);
+  readonly listTicketsByEventTime = this.ticket.listTicketsByEventTime.bind(this.ticket);
   readonly swapTicketQr = this.ticket.swapTicketQr.bind(this.ticket);
   readonly createTransferLink = this.transferLinks.createTransferLink.bind(this.transferLinks);
   readonly getTransferLink = this.transferLinks.getTransferLink.bind(this.transferLinks);

=== server/domain/ticketing/controllers/ticketingController.ts — diff ===
@@ -23,7 +23,6 @@ import { createEventPromoCodeUseCase } from '../usecases/createEventPromoCodeUse
 import { createOfflineCheckInSessionUseCase } from '../usecases/createOfflineCheckInSessionUseCase';
 import { createTicketOrderUseCase } from '../usecases/createTicketOrderUseCase';
 import { createTicketTypeUseCase } from '../usecases/createTicketTypeUseCase';
-import { expireAllOverdueOrdersUseCase } from '../usecases/expireAllOverdueOrdersUseCase';
 import { expireTicketOrderUseCase } from '../usecases/expireTicketOrderUseCase';
 import { getEventSalesAnalyticsUseCase } from '../usecases/getEventSalesAnalyticsUseCase';
 import { getTicketOrderUseCase } from '../usecases/getTicketOrderUseCase';
@@ -228,16 +227,6 @@ export class TicketingController {
     }
   }
 
-  // A chave do job é verificada antes, pelo middleware verifyInternalJobKey.
-  static async expireOrdersInternalJob(_req: Request, res: Response) {
-    try {
-      const result = await expireAllOverdueOrdersUseCase();
-      return res.status(200).json({ status: 'success', ...result });
-    } catch (error) {
-      return handleTicketingError(res, error);
-    }
-  }
-
   static async listUserOrders(req: AuthenticatedRequest, res: Response) {
     try {
       if (!req.user) return res.status(401).json({ error: 'Não autenticado.' });

=== server/domain/ticketing/index.ts — diff ===
@@ -45,6 +45,8 @@ export { createTicketOrderUseCase } from './usecases/createTicketOrderUseCase';
 export { createTicketTypeUseCase } from './usecases/createTicketTypeUseCase';
 export { expireAllOverdueOrdersUseCase } from './usecases/expireAllOverdueOrdersUseCase';
 export { expireTicketOrderUseCase } from './usecases/expireTicketOrderUseCase';
+export { listCheckedInTicketsEndedBetweenUseCase } from './usecases/listCheckedInTicketsEndedBetweenUseCase';
+export { listIssuedTicketsStartingBetweenUseCase } from './usecases/listIssuedTicketsStartingBetweenUseCase';
 export { finalizeTicketRefundStatusUseCase } from './usecases/finalizeTicketRefundStatusUseCase';
 export { getEventSalesAnalyticsUseCase } from './usecases/getEventSalesAnalyticsUseCase';
 export { getTicketOrderUseCase } from './usecases/getTicketOrderUseCase';

=== server/domain/ticketing/ports/ticketingPort.ts — diff ===
@@ -141,6 +141,17 @@ export interface TicketingPort {
   listTicketsByOccurrenceId(occurrenceId: string): Promise<Ticket[]>;
   /** Ingressos da sessão alterados depois de `sinceIso` (lista sem internet, D21). */
   listTicketsChangedSince(occurrenceId: string, sinceIso: string, limit: number): Promise<Ticket[]>;
+  /**
+   * Ingressos num estado cujo evento começa (`startsAt`) ou termina (`endsAt`) em [fromIso, toIso):
+   * lembretes e convite para avaliar (D25).
+   */
+  listTicketsByEventTime(query: {
+    status: TicketStatus;
+    field: 'startsAt' | 'endsAt';
+    fromIso: string;
+    toIso: string;
+    limit: number;
+  }): Promise<Ticket[]>;
   /**
    * Troca única do QR pelo titular (D21): nova versão em transação. Lança FORBIDDEN para quem não é
    * o titular e UNPROCESSABLE_ENTITY se o ingresso não está emitido ou já teve o QR trocado.

=== server/domain/ticketing/services/ticketHolderService.ts — diff ===
@@ -19,6 +19,28 @@ import { loadTransferContext } from './transferEligibility';
 export class TicketHolderService {
   constructor(private readonly port: TicketingPort) {}
 
+  /** Ingressos válidos cujo evento começa no intervalo (lembretes, D25). */
+  listIssuedTicketsStartingBetween(fromIso: string, toIso: string, limit = 500): Promise<Ticket[]> {
+    return this.port.listTicketsByEventTime({
+      status: 'issued',
+      field: 'startsAt',
+      fromIso,
+      toIso,
+      limit,
+    });
+  }
+
+  /** Ingressos usados na portaria cujo evento terminou no intervalo (convite para avaliar, D25). */
+  listCheckedInTicketsEndedBetween(fromIso: string, toIso: string, limit = 500): Promise<Ticket[]> {
+    return this.port.listTicketsByEventTime({
+      status: 'checked_in',
+      field: 'endsAt',
+      fromIso,
+      toIso,
+      limit,
+    });
+  }
+
   /** Exclusão de conta (§7.5): quantos registros perderam o dado pessoal. */
   async anonymizeUser(uid: string): Promise<number> {
     const result = await this.port.anonymizeUser(uid);

=== server/domain/ticketing/services/ticketOrderService.ts — diff ===
@@ -299,14 +299,15 @@ export class TicketOrderService {
     return this.port.expireOrderAndReleaseInventoryAtomic(orderId);
   }
 
-  async expireAllOverdueOrders(nowIso = new Date().toISOString()): Promise<number> {
+  /** Expira os pedidos não pagos no prazo e devolve os que expiraram agora (para avisar o comprador). */
+  async expireAllOverdueOrders(nowIso = new Date().toISOString()): Promise<TicketOrder[]> {
     const expiredOrders = await this.port.listExpiredPendingOrders(nowIso);
-    let count = 0;
+    const expired: TicketOrder[] = [];
     for (const order of expiredOrders) {
       const res = await this.port.expireOrderAndReleaseInventoryAtomic(order.id);
-      if (!res.alreadyReleased) count += 1;
+      if (!res.alreadyReleased) expired.push(order);
     }
-    return count;
+    return expired;
   }
 
   async getOrderForUser(

=== server/domain/ticketing/services/ticketingServices.test.ts — diff ===
@@ -179,6 +179,7 @@ describe('serviços de ticketing', () => {
       syncOfflineCheckInsAtomic: vi.fn(),
       anonymizeUser: vi.fn(),
       listTicketsChangedSince: vi.fn().mockResolvedValue([]),
+      listTicketsByEventTime: vi.fn().mockResolvedValue([]),
       swapTicketQr: vi.fn(),
       createTransferLink: vi.fn(),
       getTransferLink: vi.fn(),

=== server/domain/ticketing/usecases/expireAllOverdueOrdersUseCase.ts — ARQUIVO REESCRITO, substitua todo o conteúdo por este ===
import { ticketOrderService } from '../factory';
import type { TicketOrder } from '../types/ticketingTypes';

/** Expira os pedidos não pagos no prazo. `expired` traz os que expiraram nesta rodada. */
export async function expireAllOverdueOrdersUseCase(
  nowIso?: string
): Promise<{ expiredCount: number; expired: TicketOrder[] }> {
  const expired = await ticketOrderService.expireAllOverdueOrders(nowIso);
  return { expiredCount: expired.length, expired };
}

=== server/domain/ticketing/usecases/listCheckedInTicketsEndedBetweenUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { ticketHolderService } from '../factory';
import type { Ticket } from '../types/ticketingTypes';

export function listCheckedInTicketsEndedBetweenUseCase(
  fromIso: string,
  toIso: string
): Promise<Ticket[]> {
  return ticketHolderService.listCheckedInTicketsEndedBetween(fromIso, toIso);
}

=== server/domain/ticketing/usecases/listIssuedTicketsStartingBetweenUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { ticketHolderService } from '../factory';
import type { Ticket } from '../types/ticketingTypes';

export function listIssuedTicketsStartingBetweenUseCase(
  fromIso: string,
  toIso: string
): Promise<Ticket[]> {
  return ticketHolderService.listIssuedTicketsStartingBetween(fromIso, toIso);
}

=== server/domain/users/controllers/usernameController.ts — diff ===
@@ -1,8 +1,6 @@
 import type { Response } from 'express';
 import type { AuthenticatedRequest } from '../../../infrastructure/auth/authMiddleware';
 import { UsernameError } from '../errors/usernameError';
-import { usernameSchema } from '../schemas/usernameSchema';
-import { claimUsernameUseCase } from '../usecases/claimUsernameUseCase';
 import { findUserByUsernameUseCase } from '../usecases/findUserByUsernameUseCase';
 import { suggestUsernameUseCase } from '../usecases/suggestUsernameUseCase';
 
@@ -41,24 +39,6 @@ export class UsernameController {
     }
   }
 
-  static async claim(req: AuthenticatedRequest, res: Response) {
-    const uid = req.user?.uid;
-    if (!uid) return unauthenticated(res);
-    const parsed = usernameSchema.safeParse(req.body);
-    if (!parsed.success) {
-      return res
-        .status(400)
-        .json({ error: { code: 'VALIDATION_ERROR', message: 'Nome de usuário inválido.' } });
-    }
-    try {
-      return res
-        .status(200)
-        .json({ username: await claimUsernameUseCase(uid, parsed.data.username) });
-    } catch (error) {
-      return sendError(res, error, 'claim');
-    }
-  }
-
   static async find(req: AuthenticatedRequest, res: Response) {
     if (!req.user?.uid) return unauthenticated(res);
     try {

=== server/domain/users/routes/userRoutes.ts — diff ===
@@ -19,7 +19,6 @@ router.post(
   UserController.uploadPhoto
 );
 router.get('/me/username-suggestion', verifyAuthToken, UsernameController.suggest);
-router.put('/me/username', verifyAuthToken, UsernameController.claim);
 // A busca do @ revela quem tem conta: limite por pessoa contra varredura (D21, §7.4).
 router.get(
   '/by-username/:username',

=== server/domain/users/schemas/usernameSchema.ts — APAGUE este arquivo ===

=== server/domain/users/services/usernameService.ts — diff ===
@@ -37,6 +37,10 @@ export class UsernameService {
     return `${base.slice(0, 20)}${Date.now().toString(36).slice(-6)}`;
   }
 
+  async currentUsername(uid: string): Promise<string | null> {
+    return (await this.port.getCurrent(uid)).username;
+  }
+
   async claim(uid: string, rawUsername: string): Promise<string> {
     const username = normalizeUsername(rawUsername);
     if (!username) throw new UsernameError('USERNAME_INVALID', 'Nome de usuário inválido.');

=== server/domain/users/usecases/claimUsernameUseCase.ts — ARQUIVO REESCRITO, substitua todo o conteúdo por este ===
import { usernameService } from '../factory';

/**
 * Escolhe ou troca o @ da conta (troca uma vez a cada 30 dias, D21). `previous` é o @ anterior
 * (nulo na primeira escolha), para avisar a conta de uma troca que ela não fez (D25).
 */
export async function claimUsernameUseCase(
  uid: string,
  username: string
): Promise<{ username: string; previous: string | null }> {
  const previous = await usernameService.currentUsername(uid);
  return { username: await usernameService.claim(uid, username), previous };
}

=== server/interfaces/http/bookings/internalBookingsController.ts — diff ===
@@ -1,13 +1,13 @@
 import type { Request, Response } from 'express';
+import { expireUnpaidBookingsApplicationUseCase } from '../../../application/usecases/notifications/expireUnpaidBookingsApplicationUseCase';
 import { runBookingCompletionJobApplicationUseCase } from '../../../application/usecases/bookings/runBookingCompletionJobApplicationUseCase';
-import { expireOverdueBookingsUseCase } from '../../../domain/bookings';
 import { handleBookingError } from './bookingHttpErrors';
 
 // Chamados pelos jobs agendados; a chave já foi conferida pelo middleware verifyInternalJobKey.
 export class InternalBookingsController {
   static async expire(_req: Request, res: Response): Promise<Response> {
     try {
-      return res.status(200).json({ expired: await expireOverdueBookingsUseCase(200) });
+      return res.status(200).json({ expired: await expireUnpaidBookingsApplicationUseCase(200) });
     } catch (error) {
       return handleBookingError(res, 'expireJob', error);
     }

=== server/interfaces/http/notifications/internalNotificationsController.ts — diff ===
@@ -1,4 +1,5 @@
 import type { Request, Response } from 'express';
+import { sendServiceRemindersApplicationUseCase } from '../../../application/usecases/notifications/sendServiceRemindersApplicationUseCase';
 import {
   dispatchPushNotificationsUseCase,
   enqueueDailySalesDigestUseCase,
@@ -14,7 +15,7 @@ function fail(res: Response, operation: string, error: unknown): Response {
     .json({ error: { code: 'PUSH_JOB_FAILED', message: 'Falha ao enviar notificações.' } });
 }
 
-/** Jobs do push (Cloud Scheduler, `X-Internal-Job-Key`): fila a cada minuto e resumo às 20h. */
+/** Jobs das notificações (Cloud Scheduler, `X-Internal-Job-Key`): fila, lembretes e resumo das 20h. */
 export class InternalNotificationsController {
   static async dispatch(_req: Request, res: Response): Promise<Response> {
     try {
@@ -31,4 +32,12 @@ export class InternalNotificationsController {
       return fail(res, 'dailyDigest', error);
     }
   }
+
+  static async reminders(_req: Request, res: Response): Promise<Response> {
+    try {
+      return res.status(200).json({ data: await sendServiceRemindersApplicationUseCase() });
+    } catch (error) {
+      return fail(res, 'reminders', error);
+    }
+  }
 }

=== server/interfaces/http/ticketing/internalTicketingController.ts — ARQUIVO NOVO, conteúdo completo ===
import type { Request, Response } from 'express';
import { expireUnpaidTicketOrdersApplicationUseCase } from '../../../application/usecases/notifications/expireUnpaidTicketOrdersApplicationUseCase';

// Chamado pelo job agendado; a chave já foi conferida pelo middleware verifyInternalJobKey.
export class InternalTicketingController {
  static async expireOrders(_req: Request, res: Response): Promise<Response> {
    try {
      const result = await expireUnpaidTicketOrdersApplicationUseCase();
      return res.status(200).json({ status: 'success', ...result });
    } catch (error) {
      console.error('[InternalTicketingController.expireOrders]', {
        name: error instanceof Error ? error.name : 'UnknownError',
      });
      // 500 de propósito: o Scheduler registra a falha e a próxima rodada tenta de novo.
      return res
        .status(500)
        .json({ error: { code: 'EXPIRE_ORDERS_FAILED', message: 'Falha ao expirar pedidos.' } });
    }
  }
}

=== server/interfaces/http/users/schemas/usernameSchema.ts — ARQUIVO NOVO, conteúdo completo ===
import { z } from 'zod';

/** Formato fino fica no serviço (normalizeUsername); aqui só tamanho e campos permitidos. */
export const usernameSchema = z.object({ username: z.string().trim().min(3).max(31) }).strict();

=== server/interfaces/http/users/usernameClaimRoutes.ts — ARQUIVO NOVO, conteúdo completo ===
import { type Response, Router } from 'express';
import { claimUsernameApplicationUseCase } from '../../../application/usecases/notifications/claimUsernameApplicationUseCase';
import { UsernameError } from '../../../domain/users';
import type { AuthenticatedRequest } from '../../../infrastructure/auth/authenticatedRequest';
import { verifyAuthToken } from '../../../infrastructure/auth/authMiddleware';
import { usernameSchema } from './schemas/usernameSchema';

const STATUS: Record<UsernameError['code'], number> = {
  USERNAME_INVALID: 400,
  USERNAME_TAKEN: 409,
  USERNAME_CHANGE_TOO_SOON: 422,
  USERNAME_NOT_FOUND: 404,
};

async function claim(req: AuthenticatedRequest, res: Response): Promise<Response> {
  const uid = req.user?.uid;
  if (!uid) {
    return res.status(401).json({ error: { code: 'UNAUTHENTICATED', message: 'Faça login.' } });
  }
  const parsed = usernameSchema.safeParse(req.body);
  if (!parsed.success) {
    return res
      .status(400)
      .json({ error: { code: 'VALIDATION_ERROR', message: 'Nome de usuário inválido.' } });
  }
  try {
    return res
      .status(200)
      .json({ username: await claimUsernameApplicationUseCase(uid, parsed.data.username) });
  } catch (error) {
    if (error instanceof UsernameError) {
      return res
        .status(STATUS[error.code])
        .json({ error: { code: error.code, message: error.message } });
    }
    console.error('[username.claim]', error instanceof Error ? error.name : 'unknown');
    return res
      .status(500)
      .json({ error: { code: 'INTERNAL_ERROR', message: 'Erro ao processar o nome de usuário.' } });
  }
}

/** PUT /api/users/me/username: a troca avisa a conta, então passa pela camada application. */
export const usernameClaimRouter = Router();
usernameClaimRouter.put('/me/username', verifyAuthToken, claim);

=== src/app/useNotificationNavigation.ts — diff ===
@@ -7,6 +7,8 @@ const MENU_TARGET: Partial<Record<NotificationLink['screen'], MenuView>> = {
   tickets: 'tickets',
   bookings: 'bookings',
   purchases: 'purchases',
+  reviews: 'reviews',
+  account: 'username',
 };
 
 /**

=== src/domain/notifications/types/notification.ts — diff ===
@@ -8,7 +8,15 @@ export type NotificationDate = string | number | Date | TimestampLike | null;
 
 /** Para onde o toque leva (definido pelo servidor). */
 export interface NotificationLink {
-  screen: 'tickets' | 'bookings' | 'purchases' | 'partner' | 'item' | 'event';
+  screen:
+    | 'tickets'
+    | 'bookings'
+    | 'purchases'
+    | 'reviews'
+    | 'account'
+    | 'partner'
+    | 'item'
+    | 'event';
   id?: string;
 }

=== src/domain/notifications/types/notificationCategories.ts — diff ===
@@ -3,7 +3,7 @@ import type { NotificationLink } from './notification';
 /**
  * O que a pessoa escolhe (D25, revisão). Compras, ingressos, reservas, conta e, para o parceiro,
  * vendas, cancelamentos, reclamações e repasses chegam sempre: sem eles a pessoa perde um serviço
- * ou um prazo. Avisos opcionais nunca chegam das 21h às 9h (Fortaleza).
+ * ou um prazo. Avisos opcionais nunca chegam das 23h30 às 5h30 (Fortaleza).
  */
 export interface NotificationPreferences {
   /** Pedido de avaliação depois de um passeio, evento ou estadia. */

=== src/domain/notifications/utils/describeNotification.ts — diff ===
@@ -5,7 +5,7 @@ import type { NotificationCenterItem } from '../types/notificationCategories';
 const TIME_ZONE = 'America/Fortaleza';
 
 /** Dados que, se vierem vazios, trocam o texto pela versão sem nome (`titleGeneric`/`bodyGeneric`). */
-const NAMED_PARAMS = ['event', 'business', 'username', 'listing'] as const;
+const NAMED_PARAMS = ['event', 'business', 'username', 'listing', 'offer'] as const;
 
 export function toDate(value: NotificationDate): Date {
   if (!value) return new Date(0);
@@ -47,7 +47,9 @@ export function describeNotification(
     if (typeof params[countKey] === 'number') values.count = params[countKey];
   }
   const pick = (part: 'title' | 'body') =>
-    missingName && hasText(t, `${base}.${part}Generic`) ? `${base}.${part}Generic` : `${base}.${part}`;
+    missingName && hasText(t, `${base}.${part}Generic`)
+      ? `${base}.${part}Generic`
+      : `${base}.${part}`;
 
   return {
     id: notification.id,

=== src/shared/i18n/notifyResources.ts — diff ===
@@ -111,7 +111,7 @@ export const notifyPtBR: NotifyTranslation = {
     reviewRequestsHint: 'Depois de um passeio, evento ou estadia, pedimos sua opinião.',
     news: 'Novidades e ofertas',
     newsHint: 'Eventos novos e dicas para aproveitar a viagem.',
-    nightNote: 'Esses avisos nunca chegam entre 21h e 9h.',
+    nightNote: 'Esses avisos nunca chegam entre 23h30 e 5h30.',
   },
   sales: {
     title: 'Avisos de venda',
@@ -184,7 +184,7 @@ export const notifyEn: NotifyTranslation = {
     reviewRequestsHint: 'After a tour, event or stay, we ask what you thought.',
     news: 'News and offers',
     newsHint: 'New events and tips to make the most of your trip.',
-    nightNote: 'These never arrive between 9 pm and 9 am.',
+    nightNote: 'These never arrive between 11:30 pm and 5:30 am.',
   },
   sales: {
     title: 'Sale alerts',
@@ -267,7 +267,7 @@ export const notifyFr: NotifyTranslation = {
       'Après une excursion, un événement ou un séjour, nous demandons votre avis.',
     news: 'Nouveautés et offres',
     newsHint: 'Nouveaux événements et conseils pour profiter du voyage.',
-    nightNote: 'Ces messages n’arrivent jamais entre 21 h et 9 h.',
+    nightNote: 'Ces messages n’arrivent jamais entre 23 h 30 et 5 h 30.',
   },
   sales: {
     title: 'Alertes de vente',

=== src/shared/i18n/notifyTypesResources.ts — diff ===
@@ -114,6 +114,54 @@ export const notifyTypesPtBR: NotificationTypeTexts = {
     body_one: '{{count}} venda ou reserva hoje. Veja os detalhes no painel.',
     body_other: '{{count}} vendas ou reservas hoje. Veja os detalhes no painel.',
   },
+  purchase_ticket_paid: {
+    title: 'Compra confirmada',
+    body_one: 'Seu ingresso para {{event}} já está em Ingressos.',
+    body_other: 'Seus {{count}} ingressos para {{event}} já estão em Ingressos.',
+  },
+  purchase_booking_paid: {
+    title: 'Reserva confirmada',
+    body: '{{offer}}, {{date}}. O seu código aparece no dia.',
+  },
+  purchase_expired: {
+    title: 'Compra não concluída',
+    body: 'O pagamento de {{offer}} não chegou a tempo e a vaga foi liberada. Você pode comprar de novo.',
+    bodyGeneric: 'O pagamento não chegou a tempo e a vaga foi liberada. Você pode comprar de novo.',
+  },
+  ticket_reminder_day: {
+    title: 'Seu evento é amanhã',
+    body: '{{event}}, {{date}}. O código do ingresso aparece a partir da meia-noite.',
+  },
+  ticket_reminder_soon: {
+    title: 'Começa daqui a pouco',
+    body: '{{event}} começa em menos de 2 horas. Seu ingresso está em Ingressos.',
+  },
+  booking_reminder_day: {
+    title: 'Sua reserva é amanhã',
+    body: '{{offer}}, {{date}}. O seu código aparece a partir da meia-noite.',
+  },
+  booking_reminder_soon: {
+    title: 'Falta pouco',
+    body: '{{offer}} começa em menos de 2 horas. Seu código está em Reservas.',
+  },
+  review_request: {
+    title: 'Como foi?',
+    body: 'Conte como foi {{offer}}. Sua avaliação ajuda outros viajantes.',
+    bodyGeneric: 'Conte como foi. Sua avaliação ajuda outros viajantes.',
+  },
+  review_reply_received: {
+    title: 'Responderam sua avaliação',
+    body: '{{business}} respondeu o que você escreveu.',
+    bodyGeneric: 'O estabelecimento respondeu o que você escreveu.',
+  },
+  review_report_decided: {
+    title: 'Analisamos sua denúncia',
+    body: 'Obrigado por avisar. A análise foi concluída.',
+  },
+  account_username_changed: {
+    title: 'Seu @ mudou',
+    body: 'Agora você é {{username}}. Se não foi você, fale com a gente.',
+  },
   admin_message: {
     title: '{{title}}',
     body: '{{message}}',
@@ -233,6 +281,54 @@ export const notifyTypesEn: NotificationTypeTexts = {
     body_one: '{{count}} sale or booking today. See the details in your panel.',
     body_other: '{{count}} sales or bookings today. See the details in your panel.',
   },
+  purchase_ticket_paid: {
+    title: 'Purchase confirmed',
+    body_one: 'Your ticket for {{event}} is in Tickets.',
+    body_other: 'Your {{count}} tickets for {{event}} are in Tickets.',
+  },
+  purchase_booking_paid: {
+    title: 'Booking confirmed',
+    body: '{{offer}}, {{date}}. Your code appears on the day.',
+  },
+  purchase_expired: {
+    title: 'Purchase not completed',
+    body: 'Payment for {{offer}} didn’t arrive in time, so the spot was released. You can buy again.',
+    bodyGeneric: 'Payment didn’t arrive in time, so the spot was released. You can buy again.',
+  },
+  ticket_reminder_day: {
+    title: 'Your event is tomorrow',
+    body: '{{event}}, {{date}}. Your ticket code appears from midnight.',
+  },
+  ticket_reminder_soon: {
+    title: 'Starting soon',
+    body: '{{event}} starts in less than 2 hours. Your ticket is in Tickets.',
+  },
+  booking_reminder_day: {
+    title: 'Your booking is tomorrow',
+    body: '{{offer}}, {{date}}. Your code appears from midnight.',
+  },
+  booking_reminder_soon: {
+    title: 'Almost time',
+    body: '{{offer}} starts in less than 2 hours. Your code is in Bookings.',
+  },
+  review_request: {
+    title: 'How was it?',
+    body: 'Tell us how {{offer}} went. Your review helps other travelers.',
+    bodyGeneric: 'Tell us how it went. Your review helps other travelers.',
+  },
+  review_reply_received: {
+    title: 'Someone replied to your review',
+    body: '{{business}} replied to what you wrote.',
+    bodyGeneric: 'The business replied to what you wrote.',
+  },
+  review_report_decided: {
+    title: 'We reviewed your report',
+    body: 'Thanks for letting us know. The review is complete.',
+  },
+  account_username_changed: {
+    title: 'Your @ changed',
+    body: 'You’re now {{username}}. If this wasn’t you, contact us.',
+  },
   admin_message: {
     title: '{{title}}',
     body: '{{message}}',
@@ -354,6 +450,55 @@ export const notifyTypesFr: NotificationTypeTexts = {
     body_one: '{{count}} vente ou réservation aujourd’hui. Voir le détail dans votre espace.',
     body_other: '{{count}} ventes ou réservations aujourd’hui. Voir le détail dans votre espace.',
   },
+  purchase_ticket_paid: {
+    title: 'Achat confirmé',
+    body_one: 'Votre billet pour {{event}} est dans Billets.',
+    body_other: 'Vos {{count}} billets pour {{event}} sont dans Billets.',
+  },
+  purchase_booking_paid: {
+    title: 'Réservation confirmée',
+    body: '{{offer}}, {{date}}. Votre code apparaît le jour même.',
+  },
+  purchase_expired: {
+    title: 'Achat non finalisé',
+    body: 'Le paiement de {{offer}} n’est pas arrivé à temps et la place a été libérée. Vous pouvez acheter à nouveau.',
+    bodyGeneric:
+      'Le paiement n’est pas arrivé à temps et la place a été libérée. Vous pouvez acheter à nouveau.',
+  },
+  ticket_reminder_day: {
+    title: 'Votre événement, c’est demain',
+    body: '{{event}}, {{date}}. Le code du billet apparaît à partir de minuit.',
+  },
+  ticket_reminder_soon: {
+    title: 'Ça commence bientôt',
+    body: '{{event}} commence dans moins de 2 heures. Votre billet est dans Billets.',
+  },
+  booking_reminder_day: {
+    title: 'Votre réservation, c’est demain',
+    body: '{{offer}}, {{date}}. Votre code apparaît à partir de minuit.',
+  },
+  booking_reminder_soon: {
+    title: 'C’est bientôt',
+    body: '{{offer}} commence dans moins de 2 heures. Votre code est dans Réservations.',
+  },
+  review_request: {
+    title: 'C’était comment ?',
+    body: 'Racontez-nous comment s’est passé {{offer}}. Votre avis aide les autres voyageurs.',
+    bodyGeneric: 'Racontez-nous comment ça s’est passé. Votre avis aide les autres voyageurs.',
+  },
+  review_reply_received: {
+    title: 'On a répondu à votre avis',
+    body: '{{business}} a répondu à ce que vous avez écrit.',
+    bodyGeneric: 'L’établissement a répondu à ce que vous avez écrit.',
+  },
+  review_report_decided: {
+    title: 'Nous avons examiné votre signalement',
+    body: 'Merci de nous avoir prévenus. L’examen est terminé.',
+  },
+  account_username_changed: {
+    title: 'Votre @ a changé',
+    body: 'Vous êtes maintenant {{username}}. Si ce n’était pas vous, contactez-nous.',
+  },
   admin_message: {
     title: '{{title}}',
     body: '{{message}}',

VERIFICAÇÃO (obrigatória):
- `npm run typecheck`, `npx biome lint .` (0 erros; arquivos tocados sem avisos), `npm run build`;
- testes ligados aos arquivos deste prompt: `npx vitest related --run functions/src/index.ts functions/src/sendServiceReminders.ts server.ts server/application/usecases/bookings/bookingServiceProofApplicationUseCases.test.ts server/application/usecases/bookings/reconcileBookingWebhookApplicationUseCase.ts server/application/usecases/bookings/runBookingCompletionJobApplicationUseCase.ts server/application/usecases/notifications/claimUsernameApplicationUseCase.ts server/application/usecases/notifications/expireUnpaidBookingsApplicationUseCase.ts server/application/usecases/notifications/expireUnpaidTicketOrdersApplicationUseCase.ts server/application/usecases/notifications/notificationTriggers.test.ts server/application/usecases/notifications/sendServiceRemindersApplicationUseCase.ts server/application/usecases/reconcileStripeWebhookEventApplicationUseCase.ts server/domain/bookings/adapters/firestoreBookingsAdapter.ts server/domain/bookings/adapters/inMemoryBookingsAdapter.ts server/domain/bookings/index.ts server/domain/bookings/ports/bookingsPort.ts server/domain/bookings/services/bookingService.test.ts server/domain/bookings/services/bookingService.ts server/domain/bookings/usecases/completeFinishedBookingsUseCase.ts server/domain/bookings/usecases/expireOverdueBookingsUseCase.ts server/domain/bookings/usecases/listConfirmedBookingsStartingBetweenUseCase.ts server/domain/notifications/adapters/fcmPushSenderAdapter.ts server/domain/notifications/i18n/notificationTexts.ts server/domain/notifications/services/pushDispatchService.test.ts server/domain/notifications/services/pushDispatchService.ts server/domain/notifications/types/notificationTypes.ts server/domain/notifications/utils/renderNotificationText.ts server/domain/reviews/adapters/firestoreReviewAdapter.test.ts server/domain/reviews/adapters/firestoreReviewAdapter.ts server/domain/reviews/adapters/reviewNotificationAdapter.ts server/domain/reviews/factory.ts server/domain/reviews/ports/reviewNotificationPort.ts server/domain/reviews/ports/reviewPort.ts server/domain/reviews/services/reviewService.test.ts server/domain/reviews/services/reviewService.ts server/domain/reviews/usecases/decideReviewReportUseCase.ts server/domain/ticketing/adapters/firestoreTicketStore.ts server/domain/ticketing/adapters/firestoreTicketingAdapter.ts server/domain/ticketing/controllers/ticketingController.ts server/domain/ticketing/index.ts server/domain/ticketing/ports/ticketingPort.ts server/domain/ticketing/services/ticketHolderService.ts server/domain/ticketing/services/ticketOrderService.ts server/domain/ticketing/services/ticketingServices.test.ts server/domain/ticketing/usecases/expireAllOverdueOrdersUseCase.ts server/domain/ticketing/usecases/listCheckedInTicketsEndedBetweenUseCase.ts server/domain/ticketing/usecases/listIssuedTicketsStartingBetweenUseCase.ts server/domain/users/controllers/usernameController.ts server/domain/users/routes/userRoutes.ts server/domain/users/services/usernameService.ts server/domain/users/usecases/claimUsernameUseCase.ts server/interfaces/http/bookings/internalBookingsController.ts server/interfaces/http/notifications/internalNotificationsController.ts server/interfaces/http/ticketing/internalTicketingController.ts server/interfaces/http/users/schemas/usernameSchema.ts server/interfaces/http/users/usernameClaimRoutes.ts src/app/useNotificationNavigation.ts src/domain/notifications/types/notification.ts src/domain/notifications/types/notificationCategories.ts src/domain/notifications/utils/describeNotification.ts src/shared/i18n/notifyResources.ts src/shared/i18n/notifyTypesResources.ts` (todos verdes). Não precisa rodar a suíte inteira.

ENTREGA: responda no formato do AGENTS.md §16.3.

LIMPEZA (obrigatória, ao terminar de implementar): apague todos os arquivos de public/assets/aistudio/, inclusive o deste prompt. São cópias dos textos colados no chat, salvas automaticamente pelo AI Studio, e public/ vai para o site publicado. Se a pasta ficar vazia, apague a pasta também.
~~~~

### Configurações manuais (você faz, fora do AI Studio, depois de aplicar este prompt)

1. Em functions/.env.<projeto>, preencha `NOTIFICATIONS_REMINDERS_JOB_URL=https://<serviço>.run.app/internal/notifications/reminders`.
2. Publique os índices do Firestore (`npm run deploy:firestore`) e as funções (`npm run deploy:functions`).
3. Publique uma revisão nova do Cloud Run (`use-guide`, `us-east1`) e o Hosting com o mesmo código.
