# Prompt 23.2a — Avisos como tipo + dados, escolhas por conta e notifications como domínio folha (backend)

> Lote 19, gerado dos commits de referência `8834efd..6739469` da branch `claude/agents-md-v2`. Aplique na ordem do lote (C18, A8, 22.1, 22.2, 22.6, 23.0, 23.1, 23.2a, 23.2b, 23.2c, 23.3, 23.4, 23.5), um por vez, depois do C18. Cole o bloco abaixo no agente do AI Studio, inteiro, de uma vez.

---

## Prompt 23.2a — Avisos como tipo + dados, escolhas por conta e notifications como domínio folha (backend)

Parte do servidor da D25. O app passa a ler os avisos novos no 23.2b: aplique os dois em seguida.

~~~~text
Siga o AGENTS.md. O app ainda não foi liberado para usuários: nenhum código de compatibilidade ou transição (§2.2 item 8). As regras estão nas decisões D25 de docs/arquitetura/decisoes.md (aplicadas pelo prompt A8).

IMPORTANTE: aplique os diffs abaixo EXATAMENTE, inclusive os arquivos novos. Não reescreva os arquivos do seu jeito. Arquivo tocado sai sem avisos do lint e formatado (AGENTS.md §13). Não altere firebase.json, functions/, AGENTS.md, docs/ nem .env.

O QUE MUDA:
1) Aviso gravado como tipo + dados (recipientUid, type, params, link), sem texto pronto; 25 tipos no catálogo; mesmo aviso não é gravado duas vezes (dedupeKey); somem da central em 90 dias.
2) Os 13 pontos do servidor que criavam avisos passam a gravar tipo + dados.
3) GET e PATCH /api/notifications/preferences (coleção notificationPreferences, só backend): pedidos de avaliação, novidades e avisos de venda.
4) notifications vira domínio folha: a mensagem do admin para todos os parceiros sai por server/application e a rota passa a ser POST /api/admin/notifications.
5) Exclusão de conta apaga avisos e escolhas.
6) Rules: notifications lida por recipientUid; notificationPreferences só backend; partnerNotificationSettings sai. Índice novo por recipientUid.

ARQUIVOS (crie, altere ou apague exatamente estes):
- firestore.indexes.json (alterar)
- firestore.rules (alterar)
- firestore.rules.notifications.test.ts (alterar)
- firestore.rules.security.test.ts (alterar)
- server.ts (alterar)
- server/application/usecases/bookings/bookingServiceNotices.ts (alterar)
- server/application/usecases/bookings/bookingServiceProofApplicationUseCases.test.ts (alterar)
- server/application/usecases/bookings/reconcileBookingWebhookApplicationUseCase.test.ts (alterar)
- server/application/usecases/bookings/reconcileBookingWebhookApplicationUseCase.ts (alterar)
- server/application/usecases/cancelEventOccurrenceAndRefundApplicationUseCase.ts (alterar)
- server/application/usecases/deleteUserAccountApplicationUseCase.ts (alterar)
- server/application/usecases/eventLifecycleOrchestration.test.ts (alterar)
- server/application/usecases/listingPlans/listingPlanApplicationUseCases.test.ts (alterar)
- server/application/usecases/listingPlans/runListingPlanMaintenanceApplicationUseCase.ts (alterar)
- server/application/usecases/payouts/openSaleClaimApplicationUseCase.ts (alterar)
- server/application/usecases/payouts/saleClaimApplicationUseCases.test.ts (alterar)
- server/application/usecases/postponeEventOccurrenceAndNotifyApplicationUseCase.ts (alterar)
- server/application/usecases/reconcilePlanSubscriptionWebhookApplicationUseCase.test.ts (alterar)
- server/application/usecases/reconcilePlanSubscriptionWebhookApplicationUseCase.ts (alterar)
- server/application/usecases/reconcileStripeWebhookEventApplicationUseCase.ts (alterar)
- server/application/usecases/sendAdminMessageApplicationUseCase.ts (criar)
- server/application/usecases/ticketing/acceptTicketTransferLinkApplicationUseCase.ts (alterar)
- server/application/usecases/ticketing/returnTicketToBuyerApplicationUseCase.ts (alterar)
- server/application/usecases/ticketing/transferTicketToUsernameApplicationUseCase.test.ts (alterar)
- server/application/usecases/ticketing/transferTicketToUsernameApplicationUseCase.ts (alterar)
- server/domain/notifications/adapters/firebaseAdminNotificationAdapter.test.ts (alterar)
- server/domain/notifications/adapters/firebaseAdminNotificationAdapter.ts (alterar)
- server/domain/notifications/controllers/notificationController.ts (alterar)
- server/domain/notifications/dtos/SendAdminMessageDTO.test.ts (apagar)
- server/domain/notifications/dtos/SendAdminMessageDTO.ts (apagar)
- server/domain/notifications/dtos/UpdateNotificationSettingsDTO.test.ts (apagar)
- server/domain/notifications/dtos/UpdateNotificationSettingsDTO.ts (apagar)
- server/domain/notifications/errors/notificationErrors.ts (alterar)
- server/domain/notifications/factory.ts (alterar)
- server/domain/notifications/index.ts (alterar)
- server/domain/notifications/ports/notificationRepositoryPort.ts (alterar)
- server/domain/notifications/routes/notificationRoutes.ts (alterar)
- server/domain/notifications/schemas/notificationSchema.ts (alterar)
- server/domain/notifications/services/notificationService.test.ts (alterar)
- server/domain/notifications/services/notificationService.ts (alterar)
- server/domain/notifications/types/notificationTypes.ts (criar)
- server/domain/notifications/usecases/createNotificationUseCase.ts (alterar)
- server/domain/notifications/usecases/deleteUserNotificationsUseCase.ts (criar)
- server/domain/notifications/usecases/getNotificationPreferencesUseCase.ts (criar)
- server/domain/notifications/usecases/markAllNotificationsAsReadUseCase.ts (criar)
- server/domain/notifications/usecases/markNotificationAsReadUseCase.ts (criar)
- server/domain/notifications/usecases/sendAdminMessageUseCase.ts (criar)
- server/domain/notifications/usecases/updateNotificationPreferencesUseCase.ts (criar)
- server/domain/reviews/adapters/reviewNotificationAdapter.ts (alterar)
- server/domain/ticketing/services/checkInService.ts (alterar)
- server/interfaces/http/notifications/adminMessageRoutes.ts (criar)
- server/interfaces/http/notifications/adminMessageSchema.ts (criar)

Aplique as mudanças abaixo EXATAMENTE como estão (formato unified diff: linhas com "-" saem, linhas com "+" entram; as demais são contexto para localizar o trecho). Não reformate outros trechos dos arquivos.

=== firestore.indexes.json — diff ===
@@ -5,7 +5,7 @@
       "queryScope": "COLLECTION",
       "fields": [
         {
-          "fieldPath": "recipientPartnerId",
+          "fieldPath": "recipientUid",
           "order": "ASCENDING"
         },
         {

=== firestore.rules — diff ===
@@ -164,13 +164,12 @@ service cloud.firestore {
     match /notifications/{notificationId} {
       allow read:
         if isAuthenticated()
-        && resource.data.recipientPartnerId ==
-           request.auth.uid;
+        && resource.data.recipientUid == request.auth.uid;
       allow create, update, delete: if false;
     }
-    match /partnerNotificationSettings/{partnerId} {
-      allow read: if isOwner(partnerId);
-      allow create, update, delete: if false;
+    // Escolhas de notificação (D25): só o backend lê e grava (GET/PATCH /api/notifications/preferences).
+    match /notificationPreferences/{uid} {
+      allow read, write: if false;
     }
     match /transactions/{transactionId} {
       allow read, write: if false;

=== firestore.rules.notifications.test.ts — ARQUIVO REESCRITO, substitua todo o conteúdo por este ===
import { readFile } from 'node:fs/promises';
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
} from '@firebase/rules-unit-testing';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { afterAll, beforeAll, beforeEach, describe, it } from 'vitest';

describe('Firestore Rules — Notificações (D25)', () => {
  let testEnv: Awaited<ReturnType<typeof initializeTestEnvironment>>;

  beforeAll(async () => {
    const rules = await readFile(new URL('./firestore.rules', import.meta.url), 'utf8');
    testEnv = await initializeTestEnvironment({
      projectId: 'notifications-rules-test',
      firestore: { rules },
    });
  });

  afterAll(async () => {
    await testEnv.cleanup();
  });

  beforeEach(async () => {
    await testEnv.clearFirestore();
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const db = context.firestore();
      await db
        .doc('notifications/n-1')
        .set({ recipientUid: 'user-a', type: 'ticket_received', params: {}, read: false });
      await db
        .doc('notifications/n-2')
        .set({ recipientUid: 'user-b', type: 'sale_ticket', params: {}, read: false });
      await db.doc('notificationPreferences/user-a').set({ news: false });
    });
  });

  it('cada conta lê só os próprios avisos', async () => {
    const db = testEnv.authenticatedContext('user-a').firestore();
    await assertSucceeds(getDoc(doc(db, 'notifications/n-1')));
    await assertFails(getDoc(doc(db, 'notifications/n-2')));
  });

  it('visitante sem login não lê avisos', async () => {
    const db = testEnv.unauthenticatedContext().firestore();
    await assertFails(getDoc(doc(db, 'notifications/n-1')));
  });

  it('o app não cria nem altera avisos (escrita só pelo backend)', async () => {
    const db = testEnv.authenticatedContext('user-a').firestore();
    await assertFails(
      setDoc(doc(db, 'notifications/n-3'), { recipientUid: 'user-a', type: 'admin_message' })
    );
    await assertFails(updateDoc(doc(db, 'notifications/n-1'), { read: true }));
  });

  it('escolhas de notificação ficam só no backend, até para o dono', async () => {
    const db = testEnv.authenticatedContext('user-a').firestore();
    await assertFails(getDoc(doc(db, 'notificationPreferences/user-a')));
    await assertFails(setDoc(doc(db, 'notificationPreferences/user-a'), { news: true }));
  });
});

=== firestore.rules.security.test.ts — diff ===
@@ -122,12 +122,12 @@ describe('Firestore Rules — Security Suite', () => {
       });
 
       await db.doc('notifications/notif-1').set({
-        recipientPartnerId: 'user-1',
-        title: 'Nova notificação',
+        recipientUid: 'user-1',
+        type: 'admin_message',
       });
 
-      await db.doc('partnerNotificationSettings/user-1').set({
-        reviewNotifications: true,
+      await db.doc('notificationPreferences/user-1').set({
+        news: false,
       });
 
       await db.doc('transactions/tx-1').set({
@@ -331,11 +331,11 @@ describe('Firestore Rules — Security Suite', () => {
       await assertFails(deleteDoc(doc(db, 'notifications/notif-1')));
     });
 
-    it('client → partnerNotificationSettings write negado', async () => {
+    it('client → notificationPreferences write negado', async () => {
       const db = testEnv.authenticatedContext('user-1').firestore();
-      await assertFails(setDoc(doc(db, 'partnerNotificationSettings/user-1'), { reviewNotifications: false }));
-      await assertFails(updateDoc(doc(db, 'partnerNotificationSettings/user-1'), { reviewNotifications: false }));
-      await assertFails(deleteDoc(doc(db, 'partnerNotificationSettings/user-1')));
+      await assertFails(setDoc(doc(db, 'notificationPreferences/user-1'), { news: true }));
+      await assertFails(updateDoc(doc(db, 'notificationPreferences/user-1'), { news: true }));
+      await assertFails(deleteDoc(doc(db, 'notificationPreferences/user-1')));
     });
 
     it('client → transactions write negado', async () => {

=== server.ts — diff ===
@@ -13,6 +13,7 @@ import { itemRouter } from './server/domain/guide/routes/guideRoutes';
 import insightsRouter from './server/domain/insights/routes/insightsRoutes';
 import mediaRouter from './server/domain/media/routes/mediaRoutes';
 import notificationRouter from './server/domain/notifications/routes/notificationRoutes';
+import { adminMessageRouter } from './server/interfaces/http/notifications/adminMessageRoutes';
 import partnerRouter from './server/domain/partners/routes/partnerRoutes';
 import { PaymentController } from './server/domain/payment/controllers/paymentController';
 import paymentRouter from './server/domain/payment/routes/paymentRoutes';
@@ -200,6 +201,7 @@ async function startServer() {
   app.use('/api/admin/account-debts', adminAccountDebtRouter);
   app.use('/api/payment', paymentRouter);
   app.use('/api/weather', climaWindRouter);
+  app.use('/api/admin/notifications', adminMessageRouter);
   app.use('/api/notifications', notificationRouter);
   app.use('/api/users', userRouter);
   app.use('/api/listing-verifications', listingVerificationRouter);

=== server/application/usecases/bookings/bookingServiceNotices.ts — ARQUIVO REESCRITO, substitua todo o conteúdo por este ===
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

=== server/application/usecases/bookings/bookingServiceProofApplicationUseCases.test.ts — diff ===
@@ -68,8 +68,8 @@ const BOOKING = {
 };
 const ABSENCE = { reportedAt: 't', respondBy: 't2', claimId: 'claim_booking_bk_1' };
 
-function notified(recipient: string, title: string) {
-  return expect.objectContaining({ recipientPartnerId: recipient, title });
+function notified(recipient: string, type: string) {
+  return expect.objectContaining({ recipientUid: recipient, type });
 }
 
 describe('prova do serviço na camada application (D20)', () => {
@@ -94,7 +94,7 @@ describe('prova do serviço na camada application (D20)', () => {
     });
     expect(recordProviderAbsenceUseCase).toHaveBeenCalledWith(BUYER, 'bk_1', 'claim_booking_bk_1');
     expect(createNotificationUseCase).toHaveBeenCalledWith(
-      notified('partner-1', 'O cliente diz que você não compareceu')
+      notified('partner-1', 'booking_absence_reported')
     );
   });
 
@@ -114,7 +114,7 @@ describe('prova do serviço na camada application (D20)', () => {
       'partner-1'
     );
     expect(createNotificationUseCase).toHaveBeenCalledWith(
-      notified('buyer-1', 'Reembolso a caminho')
+      notified('buyer-1', 'booking_absence_refunded_buyer')
     );
   });
 
@@ -244,7 +244,7 @@ describe('prova do serviço na camada application (D20)', () => {
       pickupAddressesErased: 0,
     });
     expect(createNotificationUseCase).toHaveBeenCalledWith(
-      notified('buyer-1', 'O serviço aconteceu?')
+      notified('buyer-1', 'booking_confirmation_asked')
     );
     expect(decideSaleClaimApplicationUseCase).toHaveBeenCalledWith('system', 'claim_absence', {
       outcome: 'refund_full',

=== server/application/usecases/bookings/reconcileBookingWebhookApplicationUseCase.test.ts — diff ===
@@ -86,7 +86,7 @@ describe('reconcileBookingWebhookApplicationUseCase', () => {
       holdReasons: ['service_proof'],
     });
     expect(createNotificationUseCase).toHaveBeenCalledWith(
-      expect.objectContaining({ recipientPartnerId: 'p1' })
+      expect.objectContaining({ recipientUid: 'p1' })
     );
   });

=== server/application/usecases/bookings/reconcileBookingWebhookApplicationUseCase.ts — diff ===
@@ -42,10 +42,11 @@ async function handlePaymentSucceeded(
       ...(requiresServiceProof(booking.kind) ? { holdReasons: ['service_proof' as const] } : {}),
     });
     await createNotificationUseCase({
-      recipientPartnerId: booking.sellerPartnerId,
-      type: 'admin_message',
-      title: 'Nova reserva confirmada',
-      message: `${booking.offerSnapshot.title} — ${booking.participantsCount} participante(s).`,
+      recipientUid: booking.sellerPartnerId,
+      type: 'sale_booking',
+      params: { offer: booking.offerSnapshot.title, participants: booking.participantsCount },
+      link: { screen: 'partner' },
+      dedupeKey: `sale_booking_${booking.id}`,
     }).catch(() => undefined);
   } catch (error) {
     if (!(error instanceof BookingDomainError) || error.code !== 'LATE_PAYMENT_REJECTED') {

=== server/application/usecases/cancelEventOccurrenceAndRefundApplicationUseCase.ts — diff ===
@@ -49,12 +49,11 @@ export async function cancelEventOccurrenceAndRefundApplicationUseCase(
       refundsInitiated.push(refund);
 
       await createNotificationUseCase({
-        recipientPartnerId: order.buyerId,
-        type: 'admin_message',
-        title: 'Sessão de evento cancelada',
-        message: `A sessão do evento "${order.eventSnapshot?.title || 'Evento'}" foi cancelada. Seu reembolso foi iniciado.`,
-        relatedItemId: occurrence.eventListingId,
-        relatedItemCollection: 'events',
+        recipientUid: order.buyerId,
+        type: 'event_canceled',
+        params: { event: order.eventSnapshot?.title || '' },
+        link: { screen: 'purchases' },
+        dedupeKey: `event_canceled_${occurrence.id}_${order.id}`,
       }).catch(() => {});
     } catch {
       // Continua processando demais pedidos elegíveis

=== server/application/usecases/deleteUserAccountApplicationUseCase.ts — diff ===
@@ -6,6 +6,7 @@ import {
   deleteOwnerListingVerificationsUseCase,
   deletePartnerProfileUseCase,
 } from '../../domain/partners';
+import { deleteUserNotificationsUseCase } from '../../domain/notifications';
 import { cancelPartnerPlanSubscriptionsUseCase } from '../../domain/payment';
 import { deleteReviewsByUserUseCase } from '../../domain/reviews';
 import { anonymizeTicketingUserUseCase } from '../../domain/ticketing';
@@ -25,6 +26,8 @@ export interface UserDeletionCoordinatorDependencies {
   anonymizeBuyerBookings?: (uid: string) => Promise<void>;
   /** Pedidos, ingressos, transferências e lista de espera: sai nome e e-mail, fica o registro (§7.5). */
   anonymizeTicketing?: (uid: string) => Promise<void>;
+  /** Avisos e escolhas de notificação (D25, §7.5). */
+  deleteNotifications?: (uid: string) => Promise<void>;
   /** O @ fica reservado por 14 dias e depois é liberado (D21). */
   releaseUsernames?: (uid: string) => Promise<void>;
   deleteUserAccount: (uid: string) => Promise<void>;
@@ -49,6 +52,7 @@ export async function deleteUserAccountApplicationUseCase(
     anonymizeTicketing: async (id) => {
       await anonymizeTicketingUserUseCase(id);
     },
+    deleteNotifications: (id) => deleteUserNotificationsUseCase(id),
     releaseUsernames: (id) => releaseUsernamesUseCase(id),
     deleteUserAccount: (id) => deleteUserAccountUseCase(id),
   }
@@ -74,6 +78,9 @@ export async function deleteUserAccountApplicationUseCase(
   if (deps.anonymizeTicketing) {
     await deps.anonymizeTicketing(uid);
   }
+  if (deps.deleteNotifications) {
+    await deps.deleteNotifications(uid);
+  }
   if (deps.releaseUsernames) {
     await deps.releaseUsernames(uid);
   }

=== server/application/usecases/eventLifecycleOrchestration.test.ts — diff ===
@@ -141,8 +141,8 @@ describe('eventLifecycleOrchestrationUseCases', () => {
     );
     expect(createNotificationUseCase).toHaveBeenCalledWith(
       expect.objectContaining({
-        recipientPartnerId: 'buyer-1',
-        title: 'Sessão de evento cancelada',
+        recipientUid: 'buyer-1',
+        type: 'event_canceled',
       })
     );
   });
@@ -197,9 +197,8 @@ describe('eventLifecycleOrchestrationUseCases', () => {
     );
     expect(createNotificationUseCase).toHaveBeenCalledWith(
       expect.objectContaining({
-        recipientPartnerId: 'buyer-1',
-        title: 'Evento reagendado',
-        message: expect.stringContaining('7 dias'),
+        recipientUid: 'buyer-1',
+        type: 'event_postponed',
       })
     );
   });

=== server/application/usecases/listingPlans/listingPlanApplicationUseCases.test.ts — diff ===
@@ -126,8 +126,9 @@ describe('casos de uso do plano por estabelecimento (D11)', () => {
     expect(m.setActive).toHaveBeenCalledWith('item-1', false);
     expect(m.notify).toHaveBeenCalledTimes(1);
     expect(m.notify.mock.calls[0]?.[0]).toMatchObject({
-      id: 'plan_expiring_item-2_2d_2026-10-23',
-      recipientPartnerId: 'owner-1',
+      dedupeKey: 'plan_expiring_item-2_2d_2026-10-23',
+      recipientUid: 'owner-1',
+      type: 'plan_expiring',
     });
     expect(result).toEqual({ expired: 1, notified: 1 });
   });

=== server/application/usecases/listingPlans/runListingPlanMaintenanceApplicationUseCase.ts — diff ===
@@ -31,11 +31,11 @@ export async function runListingPlanMaintenanceApplicationUseCase(
     const listingName = typeof item?.name === 'string' ? item.name : '';
     // TODO: notifications ainda não aceita chave i18n (AGENTS.md §12.5); texto em pt-BR por enquanto.
     const created = await createNotificationUseCase({
-      id: `plan_expiring_${plan.itemId}_${daysRemaining}d_${plan.planUntil.slice(0, 10)}`,
-      recipientPartnerId: plan.ownerId,
+      dedupeKey: `plan_expiring_${plan.itemId}_${daysRemaining}d_${plan.planUntil.slice(0, 10)}`,
+      recipientUid: plan.ownerId,
       type: 'plan_expiring',
-      title: 'Seu plano está expirando',
-      message: `O plano de ${listingName || 'um estabelecimento'} vence em ${daysRemaining} dia(s). Renove para manter o selo.`,
+      params: { listing: listingName || '', days: daysRemaining },
+      link: { screen: 'partner' },
     });
     if (created) notified++;
   }

=== server/application/usecases/payouts/openSaleClaimApplicationUseCase.ts — diff ===
@@ -76,11 +76,10 @@ export async function openSaleClaimApplicationUseCase(
   if (sale.sellerPartnerId) {
     // Sem o texto do comprador: o parceiro vê só que o repasse desta venda está em análise.
     await createNotificationUseCase({
-      recipientPartnerId: sale.sellerPartnerId,
-      type: 'admin_message',
-      title: 'Reclamação em análise',
-      message:
-        'Um comprador relatou um problema. O repasse desta venda fica retido até a decisão, em até 5 dias.',
+      recipientUid: sale.sellerPartnerId,
+      type: 'sale_claim_opened',
+      link: { screen: 'partner' },
+      dedupeKey: `sale_claim_opened_${claim.id}`,
     }).catch(() => undefined);
   }
   return {

=== server/application/usecases/payouts/saleClaimApplicationUseCases.test.ts — diff ===
@@ -77,7 +77,7 @@ describe('openSaleClaimApplicationUseCase (D16)', () => {
       })
     );
     expect(createNotificationUseCase).toHaveBeenCalledWith(
-      expect.objectContaining({ recipientPartnerId: 'partner-1' })
+      expect.objectContaining({ recipientUid: 'partner-1' })
     );
     expect(JSON.stringify(vi.mocked(createNotificationUseCase).mock.calls)).not.toContain(
       'texto privado'

=== server/application/usecases/postponeEventOccurrenceAndNotifyApplicationUseCase.ts — diff ===
@@ -55,12 +55,11 @@ export async function postponeEventOccurrenceAndNotifyApplicationUseCase(
   for (const order of affectedOrders) {
     await reschedulePayoutUseCase('ticket_order', order.id, newOccurrence.endsAt);
     await createNotificationUseCase({
-      recipientPartnerId: order.buyerId,
-      type: 'admin_message',
-      title: 'Evento reagendado',
-      message: `A sessão do evento "${listing?.title || 'Evento'}" foi reagendada para ${new Date(newOccurrence.startsAt).toLocaleString('pt-BR', { timeZone: 'America/Fortaleza' })}. Seu ingresso vale na nova data. Se não puder ir, peça o reembolso integral em até 7 dias.`,
-      relatedItemId: postponedOccurrence.eventListingId,
-      relatedItemCollection: 'events',
+      recipientUid: order.buyerId,
+      type: 'event_postponed',
+      params: { event: listing?.title || '', startsAt: newOccurrence.startsAt },
+      link: { screen: 'tickets' },
+      dedupeKey: `event_postponed_${postponedOccurrence.id}_${order.id}`,
     }).catch(() => {});
   }

=== server/application/usecases/reconcilePlanSubscriptionWebhookApplicationUseCase.test.ts — diff ===
@@ -85,7 +85,7 @@ describe('reconcilePlanSubscriptionWebhookApplicationUseCase', () => {
     );
     expect(activatePaidPlanApplicationUseCase).not.toHaveBeenCalled();
     expect(createNotificationUseCase).toHaveBeenCalledWith(
-      expect.objectContaining({ recipientPartnerId: 'p1' })
+      expect.objectContaining({ recipientUid: 'p1' })
     );
   });

=== server/application/usecases/reconcilePlanSubscriptionWebhookApplicationUseCase.ts — diff ===
@@ -57,9 +57,8 @@ export async function reconcilePlanSubscriptionWebhookApplicationUseCase(
 
   // TODO: notifications ainda não aceita chave i18n (AGENTS.md §12.5); texto em pt-BR por enquanto.
   await createNotificationUseCase({
-    recipientPartnerId: partnerId,
-    type: 'admin_message',
-    title: 'Falha na renovação do plano',
-    message: 'Não conseguimos cobrar seu cartão. Atualize a forma de pagamento para manter o selo.',
+    recipientUid: partnerId,
+    type: 'plan_renewal_failed',
+    link: { screen: 'partner' },
   }).catch(() => undefined);
 }

=== server/application/usecases/reconcileStripeWebhookEventApplicationUseCase.ts — diff ===
@@ -88,10 +88,11 @@ export async function reconcileStripeWebhookEventApplicationUseCase(
       const targetPartnerId = metadata.partnerId || metadata.sellerPartnerId;
       if (!confirmed.alreadyPaid && targetPartnerId) {
         await createNotificationUseCase({
-          recipientPartnerId: targetPartnerId,
-          type: 'admin_message',
-          title: 'Nova venda de ingresso confirmada!',
-          message: `Pedido #${confirmed.order.id.slice(0, 8)} confirmado via Stripe (${confirmed.tickets.length} ingresso(s)).`,
+          recipientUid: targetPartnerId,
+          type: 'sale_ticket',
+          params: { count: confirmed.tickets.length },
+          link: { screen: 'partner' },
+          dedupeKey: `sale_ticket_${confirmed.order.id}`,
         }).catch(() => undefined);
       }
     } else if (

=== server/application/usecases/sendAdminMessageApplicationUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { sendAdminMessageUseCase } from '../../domain/notifications';
import { getAllPartnerIdsUseCase } from '../../domain/partners';

/** "Todos os parceiros" depende de `partners`; `notifications` continua folha (§5.4). */
export async function sendAdminMessageApplicationUseCase(input: {
  recipientIds: string[] | 'all';
  title: string;
  message: string;
}): Promise<void> {
  const recipients =
    input.recipientIds === 'all' ? await getAllPartnerIdsUseCase() : input.recipientIds;
  await sendAdminMessageUseCase(recipients, input.title, input.message);
}

=== server/application/usecases/ticketing/acceptTicketTransferLinkApplicationUseCase.ts — diff ===
@@ -37,12 +37,10 @@ export async function acceptTicketTransferLinkApplicationUseCase(
       }
     );
     await createNotificationUseCase({
-      recipientPartnerId: link.fromUserId,
-      type: 'admin_message',
-      title: 'Ingresso entregue',
-      message: recipient?.username
-        ? `@${recipient.username} aceitou o ingresso que você enviou por link.`
-        : 'O ingresso que você enviou por link foi aceito.',
+      recipientUid: link.fromUserId,
+      type: 'ticket_link_accepted',
+      params: { username: recipient?.username || '' },
+      link: { screen: 'tickets' },
     }).catch(() => undefined);
     return { ticketId: newTicket.id };
   } catch (error) {

=== server/application/usecases/ticketing/returnTicketToBuyerApplicationUseCase.ts — diff ===
@@ -9,12 +9,10 @@ export async function returnTicketToBuyerApplicationUseCase(
   const { newTicket } = await transferTicketUseCase(actor, { ticketId, returnToBuyer: true });
   // Aviso não pode desfazer a devolução já gravada.
   await createNotificationUseCase({
-    recipientPartnerId: newTicket.ownerUserId,
-    type: 'admin_message',
-    title: 'Ingresso devolvido',
-    message: newTicket.eventSnapshot?.title
-      ? `O ingresso para ${newTicket.eventSnapshot.title} voltou para a sua carteira.`
-      : 'Um ingresso voltou para a sua carteira.',
+    recipientUid: newTicket.ownerUserId,
+    type: 'ticket_returned',
+    params: { event: newTicket.eventSnapshot?.title || '' },
+    link: { screen: 'tickets' },
   }).catch(() => undefined);
   return { ticketId: newTicket.id };
 }

=== server/application/usecases/ticketing/transferTicketToUsernameApplicationUseCase.test.ts — diff ===
@@ -57,7 +57,7 @@ describe('transferência pelo @ (D21)', () => {
     });
     expect(JSON.stringify(result)).not.toContain('@exemplo.com');
     expect(createNotificationUseCase).toHaveBeenCalledWith(
-      expect.objectContaining({ recipientPartnerId: 'u2' })
+      expect.objectContaining({ recipientUid: 'u2' })
     );
   });

=== server/application/usecases/ticketing/transferTicketToUsernameApplicationUseCase.ts — diff ===
@@ -45,12 +45,10 @@ export async function transferTicketToUsernameApplicationUseCase(
   });
   // Aviso não pode desfazer a transferência já gravada.
   await createNotificationUseCase({
-    recipientPartnerId: recipient.uid,
-    type: 'admin_message',
-    title: 'Você recebeu um ingresso',
-    message: newTicket.eventSnapshot?.title
-      ? `Um ingresso para ${newTicket.eventSnapshot.title} está na sua carteira.`
-      : 'Um ingresso está na sua carteira.',
+    recipientUid: recipient.uid,
+    type: 'ticket_received',
+    params: { event: newTicket.eventSnapshot?.title || '' },
+    link: { screen: 'tickets' },
   }).catch(() => undefined);
   return {
     ticketId: newTicket.id,

=== server/domain/notifications/adapters/firebaseAdminNotificationAdapter.test.ts — ARQUIVO REESCRITO, substitua todo o conteúdo por este ===
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => {
  const doc = { get: vi.fn(), update: vi.fn(), create: vi.fn(), set: vi.fn() };
  const collection = { doc: vi.fn(() => doc), where: vi.fn() };
  return {
    doc,
    collection,
    adminDb: { collection: vi.fn(() => collection), bulkWriter: vi.fn() },
  };
});

vi.mock('../../../infrastructure/firebase/adminClient', () => ({ adminDb: mocks.adminDb }));
vi.mock('firebase-admin/firestore', () => ({
  FieldValue: { serverTimestamp: vi.fn(() => 'SERVER_TIMESTAMP') },
  Timestamp: { fromDate: vi.fn((date: Date) => ({ date })) },
}));

import { FirebaseAdminNotificationAdapter } from './firebaseAdminNotificationAdapter';

describe('FirebaseAdminNotificationAdapter', () => {
  const adapter = new FirebaseAdminNotificationAdapter();
  const expiresAt = new Date('2027-02-01T00:00:00.000Z');

  beforeEach(() => vi.clearAllMocks());

  it('não altera aviso de outra pessoa', async () => {
    mocks.doc.get.mockResolvedValue({ exists: true, get: () => 'dono' });
    expect(await adapter.markAsRead('n1', 'intruso')).toBe(false);
    expect(mocks.doc.update).not.toHaveBeenCalled();
  });

  it('grava só os campos do aviso e não repete o mesmo dedupeKey', async () => {
    mocks.doc.create.mockResolvedValueOnce(undefined);
    expect(
      await adapter.create(
        { recipientUid: 'u1', type: 'plan_expiring', params: { days: 3 }, dedupeKey: 'k1' },
        expiresAt
      )
    ).toBe(true);
    expect(mocks.collection.doc).toHaveBeenCalledWith('k1');
    expect(mocks.doc.create).toHaveBeenCalledWith({
      recipientUid: 'u1',
      type: 'plan_expiring',
      params: { days: 3 },
      link: null,
      read: false,
      createdAt: 'SERVER_TIMESTAMP',
      expiresAt: { date: expiresAt },
    });

    mocks.doc.create.mockRejectedValueOnce(Object.assign(new Error('exists'), { code: 6 }));
    expect(
      await adapter.create(
        { recipientUid: 'u1', type: 'plan_expiring', dedupeKey: 'k1' },
        expiresAt
      )
    ).toBe(false);
  });
});

=== server/domain/notifications/adapters/firebaseAdminNotificationAdapter.ts — ARQUIVO REESCRITO, substitua todo o conteúdo por este ===
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { adminDb } from '../../../infrastructure/firebase/adminClient';
import type { NotificationRepositoryPort } from '../ports/notificationRepositoryPort';
import type { NewNotification, NotificationPreferences } from '../types/notificationTypes';

const NOTIFICATIONS = 'notifications';
const PREFERENCES = 'notificationPreferences';

function toDocument(
  data: Omit<NewNotification, 'dedupeKey'>,
  expiresAt: Date
): Record<string, unknown> {
  return {
    recipientUid: data.recipientUid,
    type: data.type,
    params: data.params ?? {},
    link: data.link ?? null,
    read: false,
    createdAt: FieldValue.serverTimestamp(),
    expiresAt: Timestamp.fromDate(expiresAt),
  };
}

export class FirebaseAdminNotificationAdapter implements NotificationRepositoryPort {
  async create(notification: NewNotification, expiresAt: Date): Promise<boolean> {
    const collection = adminDb.collection(NOTIFICATIONS);
    const { dedupeKey, ...data } = notification;
    if (!dedupeKey) {
      await collection.doc().set(toDocument(data, expiresAt));
      return true;
    }
    try {
      // `create` falha se o documento já existe: o mesmo aviso nunca sai duas vezes.
      await collection.doc(dedupeKey).create(toDocument(data, expiresAt));
      return true;
    } catch (error) {
      if ((error as { code?: number }).code === 6) return false;
      throw error;
    }
  }

  async createMany(
    recipientUids: string[],
    data: Omit<NewNotification, 'recipientUid' | 'dedupeKey'>,
    expiresAt: Date
  ): Promise<void> {
    const writer = adminDb.bulkWriter();
    for (const recipientUid of recipientUids) {
      writer.set(
        adminDb.collection(NOTIFICATIONS).doc(),
        toDocument({ ...data, recipientUid }, expiresAt)
      );
    }
    await writer.close();
  }

  async markAsRead(notificationId: string, recipientUid: string): Promise<boolean> {
    const ref = adminDb.collection(NOTIFICATIONS).doc(notificationId);
    const snap = await ref.get();
    if (!snap.exists || snap.get('recipientUid') !== recipientUid) return false;
    await ref.update({ read: true, readAt: FieldValue.serverTimestamp() });
    return true;
  }

  async markAllAsRead(recipientUid: string): Promise<void> {
    const snap = await adminDb
      .collection(NOTIFICATIONS)
      .where('recipientUid', '==', recipientUid)
      .where('read', '==', false)
      .get();
    if (snap.empty) return;
    const writer = adminDb.bulkWriter();
    for (const doc of snap.docs) {
      writer.update(doc.ref, { read: true, readAt: FieldValue.serverTimestamp() });
    }
    await writer.close();
  }

  async getPreferences(uid: string): Promise<Partial<NotificationPreferences> | null> {
    const snap = await adminDb.collection(PREFERENCES).doc(uid).get();
    if (!snap.exists) return null;
    const data = snap.data() ?? {};
    const preferences: Partial<NotificationPreferences> = {};
    if (typeof data.reviewRequests === 'boolean') preferences.reviewRequests = data.reviewRequests;
    if (typeof data.news === 'boolean') preferences.news = data.news;
    if (data.salesAlerts === 'each' || data.salesAlerts === 'daily') {
      preferences.salesAlerts = data.salesAlerts;
    }
    return preferences;
  }

  async savePreferences(uid: string, preferences: NotificationPreferences): Promise<void> {
    await adminDb
      .collection(PREFERENCES)
      .doc(uid)
      .set({ ...preferences, updatedAt: FieldValue.serverTimestamp() });
  }

  async deleteAllForUser(uid: string): Promise<void> {
    const snap = await adminDb.collection(NOTIFICATIONS).where('recipientUid', '==', uid).get();
    const writer = adminDb.bulkWriter();
    for (const doc of snap.docs) writer.delete(doc.ref);
    writer.delete(adminDb.collection(PREFERENCES).doc(uid));
    await writer.close();
  }
}

=== server/domain/notifications/controllers/notificationController.ts — ARQUIVO REESCRITO, substitua todo o conteúdo por este ===
import type { Response } from 'express';
import type { AuthenticatedRequest } from '../../../infrastructure/auth/authenticatedRequest';
import { NotificationDomainError } from '../errors/notificationErrors';
import {
  notificationIdParamsSchema,
  notificationPreferencesPatchSchema,
} from '../schemas/notificationSchema';
import { getNotificationPreferencesUseCase } from '../usecases/getNotificationPreferencesUseCase';
import { markAllNotificationsAsReadUseCase } from '../usecases/markAllNotificationsAsReadUseCase';
import { markNotificationAsReadUseCase } from '../usecases/markNotificationAsReadUseCase';
import { updateNotificationPreferencesUseCase } from '../usecases/updateNotificationPreferencesUseCase';

function sendError(res: Response, status: number, code: string, message: string): Response {
  return res.status(status).json({ error: { code, message } });
}

function handleError(res: Response, error: unknown, operation: string): Response {
  if (error instanceof NotificationDomainError) {
    return sendError(res, error.statusCode, error.code, error.message);
  }
  console.error(`[NotificationController.${operation}]`, {
    name: error instanceof Error ? error.name : 'UnknownError',
  });
  return sendError(res, 500, 'INTERNAL_ERROR', 'Erro interno do servidor.');
}

export class NotificationController {
  static async markAsRead(req: AuthenticatedRequest, res: Response): Promise<Response> {
    if (!req.user?.uid) return sendError(res, 401, 'UNAUTHENTICATED', 'Não autenticado.');
    const params = notificationIdParamsSchema.safeParse(req.params);
    if (!params.success) return sendError(res, 400, 'VALIDATION_ERROR', 'Aviso inválido.');
    try {
      await markNotificationAsReadUseCase(params.data.id, req.user.uid);
      return res.status(204).send();
    } catch (error) {
      return handleError(res, error, 'markAsRead');
    }
  }

  static async markAllAsRead(req: AuthenticatedRequest, res: Response): Promise<Response> {
    if (!req.user?.uid) return sendError(res, 401, 'UNAUTHENTICATED', 'Não autenticado.');
    try {
      await markAllNotificationsAsReadUseCase(req.user.uid);
      return res.status(204).send();
    } catch (error) {
      return handleError(res, error, 'markAllAsRead');
    }
  }

  static async getPreferences(req: AuthenticatedRequest, res: Response): Promise<Response> {
    if (!req.user?.uid) return sendError(res, 401, 'UNAUTHENTICATED', 'Não autenticado.');
    try {
      return res.status(200).json({ data: await getNotificationPreferencesUseCase(req.user.uid) });
    } catch (error) {
      return handleError(res, error, 'getPreferences');
    }
  }

  static async updatePreferences(req: AuthenticatedRequest, res: Response): Promise<Response> {
    if (!req.user?.uid) return sendError(res, 401, 'UNAUTHENTICATED', 'Não autenticado.');
    const body = notificationPreferencesPatchSchema.safeParse(req.body);
    if (!body.success) return sendError(res, 400, 'VALIDATION_ERROR', 'Escolha inválida.');
    try {
      const data = await updateNotificationPreferencesUseCase(req.user.uid, body.data);
      return res.status(200).json({ data });
    } catch (error) {
      return handleError(res, error, 'updatePreferences');
    }
  }
}

=== server/domain/notifications/dtos/SendAdminMessageDTO.test.ts — APAGUE este arquivo ===

=== server/domain/notifications/dtos/SendAdminMessageDTO.ts — APAGUE este arquivo ===

=== server/domain/notifications/dtos/UpdateNotificationSettingsDTO.test.ts — APAGUE este arquivo ===

=== server/domain/notifications/dtos/UpdateNotificationSettingsDTO.ts — APAGUE este arquivo ===

=== server/domain/notifications/errors/notificationErrors.ts — ARQUIVO REESCRITO, substitua todo o conteúdo por este ===
export type NotificationErrorCode = 'NOTIFICATION_NOT_FOUND' | 'VALIDATION_ERROR';

const STATUS: Record<NotificationErrorCode, number> = {
  NOTIFICATION_NOT_FOUND: 404,
  VALIDATION_ERROR: 400,
};

/** Erro com `code` estável (AGENTS.md §10.2). Aviso de outra pessoa responde 404, sem revelar que existe. */
export class NotificationDomainError extends Error {
  readonly statusCode: number;
  constructor(
    readonly code: NotificationErrorCode,
    message: string
  ) {
    super(message);
    this.name = 'NotificationDomainError';
    this.statusCode = STATUS[code];
  }
}

=== server/domain/notifications/factory.ts — ARQUIVO REESCRITO, substitua todo o conteúdo por este ===
import { FirebaseAdminNotificationAdapter } from './adapters/firebaseAdminNotificationAdapter';
import { NotificationService } from './services/notificationService';

export const notificationService = new NotificationService(new FirebaseAdminNotificationAdapter());

=== server/domain/notifications/index.ts — ARQUIVO REESCRITO, substitua todo o conteúdo por este ===
export { NotificationDomainError } from './errors/notificationErrors';
export type {
  NewNotification,
  NotificationLink,
  NotificationParams,
  NotificationPreferences,
  NotificationType,
} from './types/notificationTypes';
export { createNotificationUseCase } from './usecases/createNotificationUseCase';
export { deleteUserNotificationsUseCase } from './usecases/deleteUserNotificationsUseCase';
export { getNotificationPreferencesUseCase } from './usecases/getNotificationPreferencesUseCase';
export { markAllNotificationsAsReadUseCase } from './usecases/markAllNotificationsAsReadUseCase';
export { markNotificationAsReadUseCase } from './usecases/markNotificationAsReadUseCase';
export { sendAdminMessageUseCase } from './usecases/sendAdminMessageUseCase';
export { updateNotificationPreferencesUseCase } from './usecases/updateNotificationPreferencesUseCase';

=== server/domain/notifications/ports/notificationRepositoryPort.ts — ARQUIVO REESCRITO, substitua todo o conteúdo por este ===
import type { NewNotification, NotificationPreferences } from '../types/notificationTypes';

export interface NotificationRepositoryPort {
  /** Falso quando o `dedupeKey` já existe. */
  create(notification: NewNotification, expiresAt: Date): Promise<boolean>;
  createMany(
    recipientUids: string[],
    data: Omit<NewNotification, 'recipientUid' | 'dedupeKey'>,
    expiresAt: Date
  ): Promise<void>;
  /** Falso quando o aviso não existe ou é de outra pessoa. */
  markAsRead(notificationId: string, recipientUid: string): Promise<boolean>;
  markAllAsRead(recipientUid: string): Promise<void>;
  getPreferences(uid: string): Promise<Partial<NotificationPreferences> | null>;
  savePreferences(uid: string, preferences: NotificationPreferences): Promise<void>;
  deleteAllForUser(uid: string): Promise<void>;
}

=== server/domain/notifications/routes/notificationRoutes.ts — ARQUIVO REESCRITO, substitua todo o conteúdo por este ===
import { Router } from 'express';
import { verifyAuthToken } from '../../../infrastructure/auth/authMiddleware';
import { NotificationController } from '../controllers/notificationController';

const router = Router();

router.patch('/read-all', verifyAuthToken, NotificationController.markAllAsRead);
router.patch('/:id/read', verifyAuthToken, NotificationController.markAsRead);
router.get('/preferences', verifyAuthToken, NotificationController.getPreferences);
router.patch('/preferences', verifyAuthToken, NotificationController.updatePreferences);

export default router;

=== server/domain/notifications/schemas/notificationSchema.ts — ARQUIVO REESCRITO, substitua todo o conteúdo por este ===
import { z } from 'zod';

export const notificationPreferencesPatchSchema = z
  .object({
    reviewRequests: z.boolean().optional(),
    news: z.boolean().optional(),
    salesAlerts: z.enum(['each', 'daily']).optional(),
  })
  .strict()
  .refine((patch) => Object.keys(patch).length > 0);

export const notificationIdParamsSchema = z.object({ id: z.string().trim().min(1).max(128) });

=== server/domain/notifications/services/notificationService.test.ts — ARQUIVO REESCRITO, substitua todo o conteúdo por este ===
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NotificationDomainError } from '../errors/notificationErrors';
import type { NotificationRepositoryPort } from '../ports/notificationRepositoryPort';
import { NotificationService } from './notificationService';

const NOW = new Date('2026-11-03T12:00:00.000Z');

function createRepository(): NotificationRepositoryPort {
  return {
    create: vi.fn().mockResolvedValue(true),
    createMany: vi.fn(),
    markAsRead: vi.fn().mockResolvedValue(true),
    markAllAsRead: vi.fn(),
    getPreferences: vi.fn().mockResolvedValue(null),
    savePreferences: vi.fn(),
    deleteAllForUser: vi.fn(),
  };
}

describe('NotificationService', () => {
  let repo: NotificationRepositoryPort;
  let service: NotificationService;

  beforeEach(() => {
    repo = createRepository();
    service = new NotificationService(repo, () => NOW);
  });

  it('grava tipo e dados com validade de 90 dias', async () => {
    await service.create({
      recipientUid: 'u1',
      type: 'ticket_received',
      params: { event: 'Luau' },
    });
    expect(repo.create).toHaveBeenCalledWith(
      { recipientUid: 'u1', type: 'ticket_received', params: { event: 'Luau' } },
      new Date('2027-02-01T12:00:00.000Z')
    );
  });

  it('recusa tipo desconhecido ou sem destinatário', async () => {
    await expect(
      service.create({ recipientUid: '', type: 'ticket_received' })
    ).rejects.toBeInstanceOf(NotificationDomainError);
    await expect(
      service.create({ recipientUid: 'u1', type: 'nao_existe' as 'ticket_received' })
    ).rejects.toMatchObject({ code: 'VALIDATION_ERROR' });
  });

  it('mensagem do admin vai uma vez para cada pessoa, com o texto como está', async () => {
    await service.sendAdminMessage(['a', 'b', 'a', ''], 'Aviso', 'Manutenção às 2h');
    expect(repo.createMany).toHaveBeenCalledWith(
      ['a', 'b'],
      { type: 'admin_message', params: { title: 'Aviso', message: 'Manutenção às 2h' } },
      expect.any(Date)
    );
  });

  it('marcar como lida aviso de outra pessoa responde não encontrado (IDOR)', async () => {
    vi.mocked(repo.markAsRead).mockResolvedValue(false);
    await expect(service.markAsRead('n1', 'intruso')).rejects.toMatchObject({
      code: 'NOTIFICATION_NOT_FOUND',
      statusCode: 404,
    });
  });

  it('preferências começam no padrão (novidades desligadas) e salvam só o que mudou por cima', async () => {
    expect(await service.getPreferences('u1')).toEqual({
      reviewRequests: true,
      news: false,
      salesAlerts: 'each',
    });
    vi.mocked(repo.getPreferences).mockResolvedValue({ news: true });
    const next = await service.updatePreferences('u1', { salesAlerts: 'daily' });
    expect(next).toEqual({ reviewRequests: true, news: true, salesAlerts: 'daily' });
    expect(repo.savePreferences).toHaveBeenCalledWith('u1', next);
  });
});

=== server/domain/notifications/services/notificationService.ts — ARQUIVO REESCRITO, substitua todo o conteúdo por este ===
import { NotificationDomainError } from '../errors/notificationErrors';
import type { NotificationRepositoryPort } from '../ports/notificationRepositoryPort';
import {
  DEFAULT_NOTIFICATION_PREFERENCES,
  NOTIFICATION_RETENTION_DAYS,
  NOTIFICATION_TYPES,
  type NewNotification,
  type NotificationPreferences,
} from '../types/notificationTypes';

const DAY_MS = 24 * 60 * 60 * 1000;

export class NotificationService {
  constructor(
    private readonly repo: NotificationRepositoryPort,
    private readonly now: () => Date = () => new Date()
  ) {}

  private expiresAt(): Date {
    return new Date(this.now().getTime() + NOTIFICATION_RETENTION_DAYS * DAY_MS);
  }

  async create(notification: NewNotification): Promise<boolean> {
    if (!notification.recipientUid || !(notification.type in NOTIFICATION_TYPES)) {
      throw new NotificationDomainError('VALIDATION_ERROR', 'Aviso inválido.');
    }
    return this.repo.create(notification, this.expiresAt());
  }

  /** Mensagem escrita pelo admin: vai como está, sem tradução. */
  async sendAdminMessage(recipientUids: string[], title: string, message: string): Promise<void> {
    const unique = [...new Set(recipientUids.filter(Boolean))];
    if (unique.length === 0) return;
    await this.repo.createMany(
      unique,
      { type: 'admin_message', params: { title, message } },
      this.expiresAt()
    );
  }

  async markAsRead(notificationId: string, recipientUid: string): Promise<void> {
    const updated = await this.repo.markAsRead(notificationId, recipientUid);
    if (!updated) {
      throw new NotificationDomainError('NOTIFICATION_NOT_FOUND', 'Notificação não encontrada.');
    }
  }

  markAllAsRead(recipientUid: string): Promise<void> {
    return this.repo.markAllAsRead(recipientUid);
  }

  async getPreferences(uid: string): Promise<NotificationPreferences> {
    const saved = await this.repo.getPreferences(uid);
    return { ...DEFAULT_NOTIFICATION_PREFERENCES, ...(saved ?? {}) };
  }

  async updatePreferences(
    uid: string,
    patch: Partial<NotificationPreferences>
  ): Promise<NotificationPreferences> {
    const next = { ...(await this.getPreferences(uid)), ...patch };
    await this.repo.savePreferences(uid, next);
    return next;
  }

  deleteAllForUser(uid: string): Promise<void> {
    return this.repo.deleteAllForUser(uid);
  }
}

=== server/domain/notifications/types/notificationTypes.ts — ARQUIVO NOVO, conteúdo completo ===
/**
 * Catálogo de avisos (D25). O aviso é gravado como tipo + dados; o texto sai no idioma de quem lê
 * (AGENTS.md §12.5). O assunto define o ícone, para onde o toque leva e o que a pessoa pode desligar.
 */
export const NOTIFICATION_TYPES = {
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
  admin_message: 'messages',
} as const;

export type NotificationType = keyof typeof NOTIFICATION_TYPES;
export type NotificationCategory = (typeof NOTIFICATION_TYPES)[NotificationType] | 'news' | 'reviews';

/** Dados que entram no texto traduzido. Nada de PII além do que a pessoa já vê no app. */
export type NotificationParams = Record<string, string | number>;

/** Para onde o toque leva. O app monta a rota; o servidor não conhece URLs. */
export interface NotificationLink {
  screen: 'tickets' | 'bookings' | 'purchases' | 'partner' | 'item' | 'event';
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

=== server/domain/notifications/usecases/createNotificationUseCase.ts — ARQUIVO REESCRITO, substitua todo o conteúdo por este ===
import { notificationService } from '../factory';
import type { NewNotification } from '../types/notificationTypes';

/** Grava um aviso. Falso quando o mesmo aviso (`dedupeKey`) já existe. */
export function createNotificationUseCase(notification: NewNotification): Promise<boolean> {
  return notificationService.create(notification);
}

=== server/domain/notifications/usecases/deleteUserNotificationsUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { notificationService } from '../factory';

/** Exclusão de conta (§7.5): apaga os avisos e as escolhas da pessoa. */
export function deleteUserNotificationsUseCase(uid: string): Promise<void> {
  return notificationService.deleteAllForUser(uid);
}

=== server/domain/notifications/usecases/getNotificationPreferencesUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { notificationService } from '../factory';
import type { NotificationPreferences } from '../types/notificationTypes';

export function getNotificationPreferencesUseCase(uid: string): Promise<NotificationPreferences> {
  return notificationService.getPreferences(uid);
}

=== server/domain/notifications/usecases/markAllNotificationsAsReadUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { notificationService } from '../factory';

export function markAllNotificationsAsReadUseCase(recipientUid: string): Promise<void> {
  return notificationService.markAllAsRead(recipientUid);
}

=== server/domain/notifications/usecases/markNotificationAsReadUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { notificationService } from '../factory';

export function markNotificationAsReadUseCase(
  notificationId: string,
  recipientUid: string
): Promise<void> {
  return notificationService.markAsRead(notificationId, recipientUid);
}

=== server/domain/notifications/usecases/sendAdminMessageUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { notificationService } from '../factory';

export function sendAdminMessageUseCase(
  recipientUids: string[],
  title: string,
  message: string
): Promise<void> {
  return notificationService.sendAdminMessage(recipientUids, title, message);
}

=== server/domain/notifications/usecases/updateNotificationPreferencesUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { notificationService } from '../factory';
import type { NotificationPreferences } from '../types/notificationTypes';

export function updateNotificationPreferencesUseCase(
  uid: string,
  patch: Partial<NotificationPreferences>
): Promise<NotificationPreferences> {
  return notificationService.updatePreferences(uid, patch);
}

=== server/domain/reviews/adapters/reviewNotificationAdapter.ts — ARQUIVO REESCRITO, substitua todo o conteúdo por este ===
import { createNotificationUseCase } from '../../notifications';
import type {
  ReviewNotificationContext,
  ReviewNotificationPort,
} from '../ports/reviewNotificationPort';

export class ReviewNotificationAdapter implements ReviewNotificationPort {
  async notifyReviewReceived(context: ReviewNotificationContext): Promise<void> {
    await createNotificationUseCase({
      recipientUid: context.recipientPartnerId,
      type: context.isUpdate ? 'review_updated' : 'review_received',
      params: { user: context.userName, item: context.itemName, rating: context.rating },
      link: { screen: context.itemCollection === 'events' ? 'event' : 'item', id: context.itemId },
    });
  }
}

=== server/domain/ticketing/services/checkInService.ts — diff ===
@@ -111,11 +111,9 @@ export class CheckInService {
   async swapPresentationQr(actor: TicketingActorContext, ticketId: string) {
     await this.port.swapTicketQr(ticketId, actor.uid, new Date(this.now()).toISOString());
     await createNotificationUseCase({
-      recipientPartnerId: actor.uid,
-      type: 'admin_message',
-      title: 'QR Code do ingresso trocado',
-      message:
-        'O QR Code e o código anteriores não valem mais. Se não foi você, fale com o suporte.',
+      recipientUid: actor.uid,
+      type: 'ticket_qr_replaced',
+      link: { screen: 'tickets' },
     }).catch(() => undefined);
     return this.generateTicketPresentationQr(actor, ticketId);
   }

=== server/interfaces/http/notifications/adminMessageRoutes.ts — ARQUIVO NOVO, conteúdo completo ===
import { type Response, Router } from 'express';
import { sendAdminMessageApplicationUseCase } from '../../../application/usecases/sendAdminMessageApplicationUseCase';
import type { AuthenticatedRequest } from '../../../infrastructure/auth/authenticatedRequest';
import { verifyAdminToken } from '../../../infrastructure/auth/authMiddleware';
import { sendAdminMessageSchema } from './adminMessageSchema';

async function send(req: AuthenticatedRequest, res: Response): Promise<Response> {
  const body = sendAdminMessageSchema.safeParse(req.body);
  if (!body.success) {
    return res
      .status(400)
      .json({ error: { code: 'VALIDATION_ERROR', message: 'Mensagem inválida.' } });
  }
  try {
    await sendAdminMessageApplicationUseCase(body.data);
    return res.status(204).send();
  } catch (error) {
    console.error('[AdminMessage.send]', {
      name: error instanceof Error ? error.name : 'UnknownError',
    });
    return res
      .status(500)
      .json({ error: { code: 'INTERNAL_ERROR', message: 'Erro interno do servidor.' } });
  }
}

export const adminMessageRouter = Router();
adminMessageRouter.post('/', verifyAdminToken, send);

=== server/interfaces/http/notifications/adminMessageSchema.ts — ARQUIVO NOVO, conteúdo completo ===
import { z } from 'zod';

export const sendAdminMessageSchema = z
  .object({
    recipientIds: z.union([
      z.array(z.string().trim().min(1).max(128)).min(1).max(500),
      z.literal('all'),
    ]),
    title: z.string().trim().min(1).max(100),
    message: z.string().trim().min(1).max(500),
  })
  .strict();

VERIFICAÇÃO (obrigatória):
- `npm run typecheck`, `npx biome lint .` (0 erros; arquivos tocados sem avisos), `npm run build`;
- testes ligados aos arquivos deste prompt: `npx vitest related --run firestore.rules.notifications.test.ts firestore.rules.security.test.ts server.ts server/application/usecases/bookings/bookingServiceNotices.ts server/application/usecases/bookings/bookingServiceProofApplicationUseCases.test.ts server/application/usecases/bookings/reconcileBookingWebhookApplicationUseCase.test.ts server/application/usecases/bookings/reconcileBookingWebhookApplicationUseCase.ts server/application/usecases/cancelEventOccurrenceAndRefundApplicationUseCase.ts server/application/usecases/deleteUserAccountApplicationUseCase.ts server/application/usecases/eventLifecycleOrchestration.test.ts server/application/usecases/listingPlans/listingPlanApplicationUseCases.test.ts server/application/usecases/listingPlans/runListingPlanMaintenanceApplicationUseCase.ts server/application/usecases/payouts/openSaleClaimApplicationUseCase.ts server/application/usecases/payouts/saleClaimApplicationUseCases.test.ts server/application/usecases/postponeEventOccurrenceAndNotifyApplicationUseCase.ts server/application/usecases/reconcilePlanSubscriptionWebhookApplicationUseCase.test.ts server/application/usecases/reconcilePlanSubscriptionWebhookApplicationUseCase.ts server/application/usecases/reconcileStripeWebhookEventApplicationUseCase.ts server/application/usecases/sendAdminMessageApplicationUseCase.ts server/application/usecases/ticketing/acceptTicketTransferLinkApplicationUseCase.ts server/application/usecases/ticketing/returnTicketToBuyerApplicationUseCase.ts server/application/usecases/ticketing/transferTicketToUsernameApplicationUseCase.test.ts server/application/usecases/ticketing/transferTicketToUsernameApplicationUseCase.ts server/domain/notifications/adapters/firebaseAdminNotificationAdapter.test.ts server/domain/notifications/adapters/firebaseAdminNotificationAdapter.ts server/domain/notifications/controllers/notificationController.ts server/domain/notifications/errors/notificationErrors.ts server/domain/notifications/factory.ts server/domain/notifications/index.ts server/domain/notifications/ports/notificationRepositoryPort.ts server/domain/notifications/routes/notificationRoutes.ts server/domain/notifications/schemas/notificationSchema.ts server/domain/notifications/services/notificationService.test.ts server/domain/notifications/services/notificationService.ts server/domain/notifications/types/notificationTypes.ts server/domain/notifications/usecases/createNotificationUseCase.ts server/domain/notifications/usecases/deleteUserNotificationsUseCase.ts server/domain/notifications/usecases/getNotificationPreferencesUseCase.ts server/domain/notifications/usecases/markAllNotificationsAsReadUseCase.ts server/domain/notifications/usecases/markNotificationAsReadUseCase.ts server/domain/notifications/usecases/sendAdminMessageUseCase.ts server/domain/notifications/usecases/updateNotificationPreferencesUseCase.ts server/domain/reviews/adapters/reviewNotificationAdapter.ts server/domain/ticketing/services/checkInService.ts server/interfaces/http/notifications/adminMessageRoutes.ts server/interfaces/http/notifications/adminMessageSchema.ts` (todos verdes). Não precisa rodar a suíte inteira.

ENTREGA: responda no formato do AGENTS.md §16.3.

LIMPEZA (obrigatória, ao terminar de implementar): apague todos os arquivos de public/assets/aistudio/, inclusive o deste prompt. São cópias dos textos colados no chat, salvas automaticamente pelo AI Studio, e public/ vai para o site publicado. Se a pasta ficar vazia, apague a pasta também.
~~~~

### Configurações manuais (você faz, fora do AI Studio, depois de aplicar este prompt)

1. Publique as regras e os índices do Firestore (`npm run deploy:firestore`).
2. Os avisos de teste gravados no formato antigo (com `recipientPartnerId`) não aparecem mais: apague-os da coleção `notifications` no console.
3. Publique uma revisão nova do Cloud Run (`use-guide`, `us-east1`) e o Hosting com o mesmo código.
