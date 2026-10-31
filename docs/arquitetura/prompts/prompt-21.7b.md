# Prompt 21.7b — "Problema com o QR Code?", fim das vendas e lista sem internet atualizada

> Lote 18, gerado dos commits de referência `e9d5a13..ec9e4e2` da branch `claude/agents-md-v2`. Aplique na ordem do lote (A7, 21.1 a 21.7d), um por vez. Cole o bloco abaixo no agente do AI Studio, inteiro, de uma vez.

---

## Prompt 21.7b — "Problema com o QR Code?", fim das vendas e lista sem internet atualizada

Continua a D21.

~~~~text
Siga o AGENTS.md. O app ainda não foi liberado para usuários: nenhum código de compatibilidade ou transição (§2.2 item 8). As regras de negócio estão nas decisões D20 e D21 de docs/arquitetura/decisoes.md (aplicadas pelo prompt A7).

IMPORTANTE: aplique os diffs abaixo EXATAMENTE, inclusive os arquivos novos. Não reescreva os arquivos do seu jeito. Arquivo tocado sai sem avisos do lint e formatado (AGENTS.md §13). Não altere firebase.json, functions/, AGENTS.md, docs/ nem .env.

O QUE MUDA:
1) O titular troca o QR e o código uma vez, até a entrada, com aviso no app; sai o botão "Novo QR", que não invalidava nada.
2) Sessão do evento com "Vendas pelo app até", sugerido e padrão do servidor 2 h antes do início; "Preparar sem internet" só depois dele.
3) Ingressos ganham updatedAt em toda mudança; a portaria baixa a cada 2 min só o que mudou na sessão.
4) Sem internet, QR de versão mais nova que a da lista vence e passa a valer no aparelho; conflito de QR trocado aparece para conferir o documento.
5) Campo de sessões do evento com textos traduzidos e cores do tema.

ARQUIVOS (crie, altere ou apague exatamente estes):
- firestore.indexes.json (alterar)
- server/domain/events/services/eventAccess.ts (alterar)
- server/domain/events/services/eventOccurrencesService.ts (alterar)
- server/domain/ticketing/adapters/firestoreCheckInStore.ts (alterar)
- server/domain/ticketing/adapters/firestoreOrderPaymentStore.ts (alterar)
- server/domain/ticketing/adapters/firestoreOrderReservationStore.ts (alterar)
- server/domain/ticketing/adapters/firestoreRefundStore.ts (alterar)
- server/domain/ticketing/adapters/firestoreTicketStore.ts (alterar)
- server/domain/ticketing/adapters/firestoreTicketingAdapter.test.ts (alterar)
- server/domain/ticketing/adapters/firestoreTicketingAdapter.ts (alterar)
- server/domain/ticketing/controllers/ticketingController.ts (alterar)
- server/domain/ticketing/dtos/ticketingPersistenceMappers.ts (alterar)
- server/domain/ticketing/index.ts (alterar)
- server/domain/ticketing/ports/ticketingPort.ts (alterar)
- server/domain/ticketing/routes/ticketingRoutes.ts (alterar)
- server/domain/ticketing/services/checkInService.test.ts (alterar)
- server/domain/ticketing/services/checkInService.ts (alterar)
- server/domain/ticketing/services/offlineCheckInService.test.ts (criar)
- server/domain/ticketing/services/offlineCheckInService.ts (alterar)
- server/domain/ticketing/services/ticketingServices.test.ts (alterar)
- server/domain/ticketing/types/ticketingTypes.ts (alterar)
- server/domain/ticketing/usecases/listOfflineCheckInChangesUseCase.ts (criar)
- server/domain/ticketing/usecases/reissueTicketQrTokenUseCase.ts (apagar)
- server/domain/ticketing/usecases/swapTicketQrUseCase.ts (criar)
- src/domain/admin/components/subcomponents/AdminEditorEventFields.tsx (alterar)
- src/domain/events/application/usecases/saveEventSessionsUseCase.ts (alterar)
- src/domain/events/components/EventSessionsField.test.tsx (alterar)
- src/domain/events/components/EventSessionsField.tsx (alterar)
- src/domain/events/types/eventSession.ts (alterar)
- src/domain/events/utils/eventSessions.test.ts (alterar)
- src/domain/events/utils/eventSessions.ts (alterar)
- src/domain/events/utils/eventSessionsSalesEnd.test.ts (criar)
- src/domain/partners/hooks/usePartnerEventSessions.ts (alterar)
- src/domain/ticketing/adapters/httpTicketingAdapter.ts (alterar)
- src/domain/ticketing/application/usecases/listOfflineCheckInChangesUseCase.ts (criar)
- src/domain/ticketing/application/usecases/reissueTicketQrTokenUseCase.ts (apagar)
- src/domain/ticketing/application/usecases/swapTicketQrUseCase.ts (criar)
- src/domain/ticketing/components/UserTicketsHistoryView.tsx (alterar)
- src/domain/ticketing/components/wallet/WalletTicketCard.tsx (alterar)
- src/domain/ticketing/hooks/useOfflineTicketSession.ts (alterar)
- src/domain/ticketing/hooks/useTicketWalletActions.ts (alterar)
- src/domain/ticketing/hooks/useUserTickets.ts (alterar)
- src/domain/ticketing/index.ts (alterar)
- src/domain/ticketing/ports/ticketingPort.ts (alterar)
- src/domain/ticketing/types/ticketing.ts (alterar)
- src/domain/ticketing/utils/offlineCheckInStorage.test.ts (criar)
- src/domain/ticketing/utils/offlineCheckInStorage.ts (alterar)
- src/domain/ticketing/utils/offlineTicketVerifier.test.ts (alterar)
- src/domain/ticketing/utils/offlineTicketVerifier.ts (alterar)
- src/shared/i18n/eventSessionsResources.ts (criar)
- src/shared/i18n/resources.ts (alterar)
- src/shared/i18n/ticketGateResources.ts (alterar)
- src/shared/i18n/ticketWalletResources.ts (alterar)

Aplique as mudanças abaixo EXATAMENTE como estão (formato unified diff: linhas com "-" saem, linhas com "+" entram; as demais são contexto para localizar o trecho). Não reformate outros trechos dos arquivos.

=== firestore.indexes.json — diff ===
@@ -521,6 +521,20 @@
           "order": "ASCENDING"
         }
       ]
+    },
+    {
+      "collectionGroup": "tickets",
+      "queryScope": "COLLECTION",
+      "fields": [
+        {
+          "fieldPath": "occurrenceId",
+          "order": "ASCENDING"
+        },
+        {
+          "fieldPath": "updatedAt",
+          "order": "ASCENDING"
+        }
+      ]
     }
   ],
   "fieldOverrides": [

=== server/domain/events/services/eventAccess.ts — diff ===
@@ -63,3 +63,10 @@ export function validateOccurrenceTiming(input: {
     }
   }
 }
+
+/** Fim das vendas pelo app sugerido (D21): 2 h antes do início, quando o parceiro não escolhe outro. */
+export const DEFAULT_SALES_END_BEFORE_START_MS = 2 * 60 * 60 * 1000;
+
+export function defaultSalesEndsAt(startsAt: string): string {
+  return new Date(new Date(startsAt).getTime() - DEFAULT_SALES_END_BEFORE_START_MS).toISOString();
+}

=== server/domain/events/services/eventOccurrencesService.ts — diff ===
@@ -11,6 +11,7 @@ import {
   type UpdateEventOccurrenceInput,
 } from '../types/eventTypes';
 import {
+  defaultSalesEndsAt,
   assertCanManageListing,
   type EventActorContext,
   validateOccurrenceTiming,
@@ -29,9 +30,13 @@ export class EventOccurrencesService {
       throw new EventNotFoundError();
     }
     assertCanManageListing(actor, listing);
-    validateOccurrenceTiming(input);
+    const withSalesEnd = {
+      ...input,
+      salesEndsAt: input.salesEndsAt ?? defaultSalesEndsAt(input.startsAt),
+    };
+    validateOccurrenceTiming(withSalesEnd);
 
-    const occurrence = await this.eventsPort.createOccurrence(input);
+    const occurrence = await this.eventsPort.createOccurrence(withSalesEnd);
 
     if (!listing.date) {
       await this.eventsPort.updateListing(listing.id, {
@@ -122,6 +127,12 @@ export class EventOccurrencesService {
     const nextEndsAt = input.endsAt || occurrence.endsAt;
     const nextCapacity = input.capacity ?? occurrence.capacity;
     const nextSalesStart = input.salesStartsAt ?? occurrence.salesStartsAt;
+    // Fim das vendas no padrão acompanha o novo horário; escolhido pelo parceiro, fica como está.
+    const followsDefault =
+      !occurrence.salesEndsAt || occurrence.salesEndsAt === defaultSalesEndsAt(occurrence.startsAt);
+    if (input.startsAt && !input.salesEndsAt && followsDefault) {
+      input = { ...input, salesEndsAt: defaultSalesEndsAt(input.startsAt) };
+    }
     const nextSalesEnd = input.salesEndsAt ?? occurrence.salesEndsAt;
 
     validateOccurrenceTiming({

=== server/domain/ticketing/adapters/firestoreCheckInStore.ts — diff ===
@@ -82,6 +82,7 @@ export class FirestoreCheckInStore {
         status: 'checked_in',
         checkedInAt: nowIso,
         checkedInBy: params.checkedInBy,
+        updatedAt: nowIso,
       });
 
       return {
@@ -228,6 +229,7 @@ export class FirestoreCheckInStore {
             status: 'checked_in',
             checkedInAt: ev.scannedAt || nowIso,
             checkedInBy: params.checkedInBy,
+            updatedAt: nowIso,
           });
 
           return 'accepted';

=== server/domain/ticketing/adapters/firestoreOrderPaymentStore.ts — diff ===
@@ -114,6 +114,7 @@ export class FirestoreOrderPaymentStore {
           qrVersion: 1,
           status: 'issued',
           issuedAt: nowIso,
+          updatedAt: nowIso,
           ticketTypeSnapshot: tInput.ticketTypeSnapshot,
           ...(order.eventSnapshot ? { eventSnapshot: order.eventSnapshot } : {}),
         };

=== server/domain/ticketing/adapters/firestoreOrderReservationStore.ts — diff ===
@@ -202,6 +202,7 @@ export class FirestoreOrderReservationStore {
               qrVersion: 1,
               status: 'issued',
               issuedAt: nowIso,
+              updatedAt: nowIso,
               ticketTypeSnapshot: {
                 name: item.ticketTypeSnapshot.name,
                 kind: item.ticketTypeSnapshot.kind,

=== server/domain/ticketing/adapters/firestoreRefundStore.ts — diff ===
@@ -80,6 +80,7 @@ export class FirestoreRefundStore {
         }
         tx.update(ref, {
           status: order.totalMinor === 0 ? 'refunded' : 'refund_pending',
+          updatedAt: new Date().toISOString(),
         });
       }
 
@@ -204,7 +205,7 @@ export class FirestoreRefundStore {
         });
 
         for (const doc of targetTicketDocs) {
-          tx.update(doc.ref, { status: 'refunded' });
+          tx.update(doc.ref, { status: 'refunded', updatedAt: nowIso });
         }
 
         for (const typeUpdate of typeUpdates) {
@@ -228,7 +229,7 @@ export class FirestoreRefundStore {
 
         tx.update(refundRef, patch);
         for (const doc of pendingTicketDocs) {
-          tx.update(doc.ref, { status: 'issued' });
+          tx.update(doc.ref, { status: 'issued', updatedAt: new Date().toISOString() });
         }
       } else {
         tx.update(refundRef, patch);

=== server/domain/ticketing/adapters/firestoreTicketStore.ts — diff ===
@@ -74,6 +74,8 @@ export class FirestoreTicketStore {
     const payload: Record<string, unknown> = {
       ...(extra || {}),
       status,
+      // A lista sem internet da portaria baixa só o que mudou desde a última vez (D21).
+      updatedAt: new Date().toISOString(),
     };
     delete payload.id;
     await ref.update(payload);
@@ -129,6 +131,7 @@ export class FirestoreTicketStore {
         status: 'transferred',
         transferredAt: nowIso,
         qrVersion: nextQrVersion,
+        updatedAt: nowIso,
       });
 
       const newTicketRef = adminDb.collection('tickets').doc();
@@ -144,6 +147,7 @@ export class FirestoreTicketStore {
         qrVersion: nextQrVersion,
         status: 'issued',
         issuedAt: nowIso,
+        updatedAt: nowIso,
         ...(oldTicket.ticketTypeSnapshot
           ? { ticketTypeSnapshot: oldTicket.ticketTypeSnapshot }
           : {}),
@@ -233,6 +237,7 @@ export class FirestoreTicketStore {
         if (ticket.status === 'issued' || ticket.status === 'reserved') {
           tx.update(ticketDoc.ref, {
             occurrenceId: params.toOccurrenceId,
+            updatedAt: nowIso,
             ...(ticket.eventSnapshot
               ? {
                   eventSnapshot: {
@@ -250,4 +255,51 @@ export class FirestoreTicketStore {
       return { movedOrdersCount, movedTicketsCount };
     });
   }
+
+  async listTicketsChangedSince(
+    occurrenceId: string,
+    sinceIso: string,
+    limit: number
+  ): Promise<Ticket[]> {
+    const snap = await adminDb
+      .collection('tickets')
+      .where('occurrenceId', '==', occurrenceId)
+      .where('updatedAt', '>', sinceIso)
+      .orderBy('updatedAt')
+      .limit(limit)
+      .get();
+    return snap.docs.map((doc) =>
+      TicketPersistenceMapper.toDomain(doc.id, (doc.data() || {}) as Record<string, unknown>)
+    );
+  }
+
+  async swapTicketQr(ticketId: string, ownerUid: string, nowIso: string): Promise<Ticket> {
+    return adminDb.runTransaction(async (tx) => {
+      const ref = adminDb.collection('tickets').doc(ticketId);
+      const snap = await tx.get(ref);
+      if (!snap.exists) throw new TicketingDomainError('NOT_FOUND', 'Ingresso não encontrado.');
+      const ticket = TicketPersistenceMapper.toDomain(
+        snap.id,
+        (snap.data() || {}) as Record<string, unknown>
+      );
+      if (ticket.ownerUserId !== ownerUid) {
+        throw new TicketingDomainError('FORBIDDEN', 'Apenas o titular pode trocar o QR Code.');
+      }
+      if (ticket.status !== 'issued') {
+        throw new TicketingDomainError(
+          'UNPROCESSABLE_ENTITY',
+          'Só é possível trocar o QR Code de um ingresso que ainda não foi usado.'
+        );
+      }
+      if (ticket.qrSwappedAt) {
+        throw new TicketingDomainError(
+          'UNPROCESSABLE_ENTITY',
+          'O QR Code deste ingresso já foi trocado uma vez.'
+        );
+      }
+      const qrVersion = (ticket.qrVersion || 1) + 1;
+      tx.update(ref, { qrVersion, qrSwappedAt: nowIso, updatedAt: nowIso });
+      return { ...ticket, qrVersion, qrSwappedAt: nowIso, updatedAt: nowIso };
+    });
+  }
 }

=== server/domain/ticketing/adapters/firestoreTicketingAdapter.test.ts — diff ===
@@ -221,6 +221,6 @@ describe('FirestoreTicketingAdapter.updateRefundStatus', () => {
     const result = await adapter.updateRefundStatus('ref_1', 'failed', 're_stripe_1');
 
     expect(result.status).toBe('failed');
-    expect(txUpdate).toHaveBeenCalledWith(ticketRef, { status: 'issued' });
+    expect(txUpdate).toHaveBeenCalledWith(ticketRef, expect.objectContaining({ status: 'issued' }));
   });
 });

=== server/domain/ticketing/adapters/firestoreTicketingAdapter.ts — diff ===
@@ -60,6 +60,8 @@ export class FirestoreTicketingAdapter implements TicketingPort {
   readonly checkInTicketAtomic = this.checkIn.checkInTicketAtomic.bind(this.checkIn);
   readonly listCheckInsByOccurrenceId = this.checkIn.listCheckInsByOccurrenceId.bind(this.checkIn);
   readonly anonymizeUser = this.privacy.anonymizeUser.bind(this.privacy);
+  readonly listTicketsChangedSince = this.ticket.listTicketsChangedSince.bind(this.ticket);
+  readonly swapTicketQr = this.ticket.swapTicketQr.bind(this.ticket);
   readonly countCheckInCodeFailures = this.checkIn.countCheckInCodeFailures.bind(this.checkIn);
   readonly addCheckInCodeFailure = this.checkIn.addCheckInCodeFailure.bind(this.checkIn);
   readonly listCheckInsByEventListingId = this.checkIn.listCheckInsByEventListingId.bind(

=== server/domain/ticketing/controllers/ticketingController.ts — diff ===
@@ -37,7 +37,8 @@ import { listPublicTicketTypesByOccurrenceUseCase } from '../usecases/listPublic
 import { listTicketTypesForManagementUseCase } from '../usecases/listTicketTypesForManagementUseCase';
 import { listUserTicketOrdersUseCase } from '../usecases/listUserTicketOrdersUseCase';
 import { listUserTicketsUseCase } from '../usecases/listUserTicketsUseCase';
-import { reissueTicketQrTokenUseCase } from '../usecases/reissueTicketQrTokenUseCase';
+import { listOfflineCheckInChangesUseCase } from '../usecases/listOfflineCheckInChangesUseCase';
+import { swapTicketQrUseCase } from '../usecases/swapTicketQrUseCase';
 import { syncOfflineCheckInsUseCase } from '../usecases/syncOfflineCheckInsUseCase';
 import { updateTicketTypeUseCase } from '../usecases/updateTicketTypeUseCase';
 
@@ -279,18 +280,30 @@ export class TicketingController {
     }
   }
 
-  static async reissueTicketQrToken(req: AuthenticatedRequest, res: Response) {
+  static async swapTicketQr(req: AuthenticatedRequest, res: Response) {
     try {
       if (!req.user) return res.status(401).json({ error: 'Não autenticado.' });
-      const ticketId = String(req.params.id || '');
-      const result = await reissueTicketQrTokenUseCase(getActor(req), ticketId);
-      return res.status(200).json({
-        status: 'success',
-        ticketId: result.ticketId,
-        token: result.token,
-        expiresAt: result.expiresAt,
-        data: result,
+      const result = await swapTicketQrUseCase(getActor(req), String(req.params.id || ''));
+      return res.status(200).json({ status: 'success', data: result });
+    } catch (error) {
+      return handleTicketingError(res, error);
+    }
+  }
+
+  static async listOfflineCheckInChanges(req: AuthenticatedRequest, res: Response) {
+    try {
+      if (!req.user) return res.status(401).json({ error: 'Não autenticado.' });
+      const since = typeof req.query.since === 'string' ? req.query.since : '';
+      if (Number.isNaN(new Date(since).getTime())) {
+        return res.status(400).json({ error: 'Parâmetro since inválido.' });
+      }
+      const result = await listOfflineCheckInChangesUseCase(getActor(req), {
+        sessionId: String(req.params.sessionId || ''),
+        since: new Date(since).toISOString(),
       });
+      // A lista muda a cada entrada: sem cache de proxy nem do navegador.
+      res.setHeader('Cache-Control', 'no-store');
+      return res.status(200).json({ status: 'success', data: result });
     } catch (error) {
       return handleTicketingError(res, error);
     }

=== server/domain/ticketing/dtos/ticketingPersistenceMappers.ts — diff ===
@@ -210,6 +210,8 @@ export class TicketPersistenceMapper {
       qrTokenHash: String(raw.qrTokenHash || ''),
       qrVersion:
         typeof raw.qrVersion === 'number' && raw.qrVersion >= 1 ? Math.trunc(raw.qrVersion) : 1,
+      ...(typeof raw.qrSwappedAt === 'string' ? { qrSwappedAt: raw.qrSwappedAt } : {}),
+      ...(typeof raw.updatedAt === 'string' ? { updatedAt: raw.updatedAt } : {}),
       status:
         raw.status === 'reserved' ||
         raw.status === 'checked_in' ||

=== server/domain/ticketing/index.ts — diff ===
@@ -25,7 +25,7 @@ export { listUserTicketsUseCase } from './usecases/listUserTicketsUseCase';
 export { markTicketOrderDisputedUseCase } from './usecases/markTicketOrderDisputedUseCase';
 export { markTicketOrderPaymentFailedUseCase } from './usecases/markTicketOrderPaymentFailedUseCase';
 export { moveOrderToOccurrenceUseCase } from './usecases/moveOrderToOccurrenceUseCase';
-export { reissueTicketQrTokenUseCase } from './usecases/reissueTicketQrTokenUseCase';
+export { swapTicketQrUseCase } from './usecases/swapTicketQrUseCase';
 export { requestTicketRefundUseCase } from './usecases/requestTicketRefundUseCase';
 export { syncOfflineCheckInsUseCase } from './usecases/syncOfflineCheckInsUseCase';
 export { transferTicketUseCase } from './usecases/transferTicketUseCase';

=== server/domain/ticketing/ports/ticketingPort.ts — diff ===
@@ -138,6 +138,13 @@ export interface TicketingPort {
   listTicketsByOrderId(orderId: string): Promise<Ticket[]>;
   listTicketsByOwnerUserId(ownerUserId: string): Promise<Ticket[]>;
   listTicketsByOccurrenceId(occurrenceId: string): Promise<Ticket[]>;
+  /** Ingressos da sessão alterados depois de `sinceIso` (lista sem internet, D21). */
+  listTicketsChangedSince(occurrenceId: string, sinceIso: string, limit: number): Promise<Ticket[]>;
+  /**
+   * Troca única do QR pelo titular (D21): nova versão em transação. Lança FORBIDDEN para quem não é
+   * o titular e UNPROCESSABLE_ENTITY se o ingresso não está emitido ou já teve o QR trocado.
+   */
+  swapTicketQr(ticketId: string, ownerUid: string, nowIso: string): Promise<Ticket>;
   listTicketsByEventListingId(eventListingId: string): Promise<Ticket[]>;
   updateTicketStatus(
     ticketId: string,

=== server/domain/ticketing/routes/ticketingRoutes.ts — diff ===
@@ -55,7 +55,7 @@ router.post('/orders/:id/refund', verifyAuthToken, TicketingController.requestRe
 
 router.get('/tickets', verifyAuthToken, TicketingController.listUserTickets);
 router.get('/tickets/:id/qr', verifyAuthToken, TicketingController.getTicketQrToken);
-router.post('/tickets/:id/qr/reissue', verifyAuthToken, TicketingController.reissueTicketQrToken);
+router.post('/tickets/:id/qr/swap', verifyAuthToken, TicketingController.swapTicketQr);
 
 router.post('/check-in', verifyAuthToken, TicketingController.checkInTicket);
 router.post(
@@ -64,6 +64,11 @@ router.post(
   TicketingController.createOfflineCheckInSession
 );
 router.post('/check-in/offline-sync', verifyAuthToken, TicketingController.syncOfflineCheckIns);
+router.get(
+  '/check-in/offline-sessions/:sessionId/changes',
+  verifyAuthToken,
+  TicketingController.listOfflineCheckInChanges
+);
 
 router.get('/events/:id/orders', verifyAuthToken, TicketingController.listEventOrders);
 router.get('/events/:id/refunds', verifyAuthToken, TicketingController.listEventRefunds);

=== server/domain/ticketing/services/checkInService.test.ts — diff ===
@@ -9,6 +9,10 @@ import type { Ticket } from '../types/ticketingTypes';
 import { deriveTicketCheckInCode } from '../utils/ticketCheckInCode';
 import { CheckInService } from './checkInService';
 
+vi.mock('../../notifications', () => ({
+  createNotificationUseCase: vi.fn().mockResolvedValue(true),
+}));
+
 vi.mock('../../events', () => ({
   getEventListingByIdUseCase: vi.fn().mockResolvedValue({ id: 'evt_1', ownerId: 'partner_1' }),
   getEventOccurrenceByIdUseCase: vi.fn().mockResolvedValue({
@@ -51,6 +55,11 @@ function setup(nowIso: string) {
     addCheckInCodeFailure: vi.fn(async (occurrenceId: string, actorUid: string, at: string) => {
       failures.push({ occurrenceId, actorUid, at });
     }),
+    swapTicketQr: vi.fn(async (id: string) => {
+      const found = tickets.find((item) => item.id === id);
+      if (found) found.qrVersion += 1;
+      return found;
+    }),
     checkInTicketAtomic: vi.fn(async (params: { ticketId: string }) => ({
       ticket: tickets.find((item) => item.id === params.ticketId),
       checkIn: { id: 'ci_1', ticketId: params.ticketId },
@@ -160,4 +169,15 @@ describe('check-in do ingresso: QR Ed25519 e código INGR (D20, B36)', () => {
       )
     ).rejects.toMatchObject({ code: 'FORBIDDEN' });
   });
+
+  it('"Problema com o QR Code?": troca a versão, o código antigo para de valer e o titular é avisado', async () => {
+    const { service, port } = setup('2026-12-20T22:00:00.000Z');
+    const oldCode = deriveTicketCheckInCode('tkt_1', 1);
+    const pass = await service.swapPresentationQr({ uid: 'buyer_1', admin: false }, 'tkt_1');
+    expect(port.swapTicketQr).toHaveBeenCalledWith('tkt_1', 'buyer_1', expect.any(String));
+    expect(pass.code).toBe(deriveTicketCheckInCode('tkt_1', 2));
+    await expect(
+      service.checkInTicket(PARTNER, { occurrenceId: 'occ_1', code: oldCode })
+    ).rejects.toMatchObject({ code: 'UNPROCESSABLE_ENTITY' });
+  });
 });

=== server/domain/ticketing/services/checkInService.ts — diff ===
@@ -1,4 +1,5 @@
 import { createEventAuditLogUseCase, getEventOccurrenceByIdUseCase } from '../../events';
+import { createNotificationUseCase } from '../../notifications';
 import { TicketingDomainError } from '../errors/ticketingDomainError';
 import type { TicketQrTokenPort } from '../ports/ticketQrTokenPort';
 import type { TicketingPort } from '../ports/ticketingPort';
@@ -103,6 +104,22 @@ export class CheckInService {
     };
   }
 
+  /**
+   * "Problema com o QR Code?" (D21): o titular troca o QR e o código uma vez, até a entrada; os
+   * antigos deixam de valer. O aviso no app conta ao titular se não foi ele.
+   */
+  async swapPresentationQr(actor: TicketingActorContext, ticketId: string) {
+    await this.port.swapTicketQr(ticketId, actor.uid, new Date(this.now()).toISOString());
+    await createNotificationUseCase({
+      recipientPartnerId: actor.uid,
+      type: 'admin_message',
+      title: 'QR Code do ingresso trocado',
+      message:
+        'O QR Code e o código anteriores não valem mais. Se não foi você, fale com o suporte.',
+    }).catch(() => undefined);
+    return this.generateTicketPresentationQr(actor, ticketId);
+  }
+
   async checkInTicket(
     actor: TicketingActorContext,
     params: {

=== server/domain/ticketing/services/offlineCheckInService.test.ts — ARQUIVO NOVO, conteúdo completo ===
import { describe, expect, it, vi } from 'vitest';

vi.mock('../../events', () => ({
  getEventListingByIdUseCase: vi.fn().mockResolvedValue({ id: 'evt_1', ownerId: 'partner_1' }),
  getEventOccurrenceByIdUseCase: vi.fn().mockResolvedValue({
    id: 'occ_1',
    eventListingId: 'evt_1',
    startsAt: '2026-12-20T23:00:00.000Z',
    endsAt: '2026-12-21T05:00:00.000Z',
    salesEndsAt: '2026-12-20T21:00:00.000Z',
  }),
  createEventAuditLogUseCase: vi.fn().mockResolvedValue(undefined),
}));

import type { TicketingPort } from '../ports/ticketingPort';
import type { TicketQrTokenPort } from '../ports/ticketQrTokenPort';
import { hashTicketIdForOfflineManifest } from '../utils/offlineManifest';
import { OfflineCheckInService } from './offlineCheckInService';

const PARTNER = { uid: 'partner_1', admin: false };

function setup() {
  const port = {
    listTicketsByOccurrenceId: vi.fn().mockResolvedValue([]),
    createOfflineCheckInSession: vi.fn(async (session: object) => ({ id: 'sess_1', ...session })),
    getOfflineCheckInSessionById: vi
      .fn()
      .mockResolvedValue({ id: 'sess_1', occurrenceId: 'occ_1' }),
    listTicketsChangedSince: vi.fn().mockResolvedValue([
      { id: 'tkt_1', qrVersion: 2, status: 'issued', updatedAt: '2026-12-20T22:01:00.000Z' },
      { id: 'tkt_2', qrVersion: 1, status: 'checked_in', updatedAt: '2026-12-20T22:02:00.000Z' },
    ]),
  } as unknown as TicketingPort;
  const qr = {
    publicKeys: () => [{ kid: 'tq1', publicKeyJwk: {} }],
  } as unknown as TicketQrTokenPort;
  return { port, service: new OfflineCheckInService(port, qr) };
}

describe('lista sem internet da portaria (D21)', () => {
  it('só pode ser preparada depois do fim das vendas pelo app', async () => {
    const { service } = setup();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-12-20T20:00:00.000Z'));
    await expect(
      service.prepareOfflineCheckInSession(PARTNER, { occurrenceId: 'occ_1' })
    ).rejects.toMatchObject({ code: 'UNPROCESSABLE_ENTITY' });
    vi.setSystemTime(new Date('2026-12-20T21:30:00.000Z'));
    await expect(
      service.prepareOfflineCheckInSession(PARTNER, { occurrenceId: 'occ_1' })
    ).resolves.toMatchObject({ manifest: { keys: [{ kid: 'tq1' }] } });
    vi.useRealTimers();
  });

  it('mudanças trazem só hash, versão e se o ingresso ainda vale', async () => {
    const { service } = setup();
    const changes = await service.listOfflineChanges(PARTNER, {
      sessionId: 'sess_1',
      since: '2026-12-20T22:00:00.000Z',
    });
    expect(changes.tickets).toEqual([
      { ticketIdHash: hashTicketIdForOfflineManifest('tkt_1'), qrVersion: 2, usable: true },
      { ticketIdHash: hashTicketIdForOfflineManifest('tkt_2'), qrVersion: 1, usable: false },
    ]);
    await expect(
      service.listOfflineChanges(
        { uid: 'partner_2', admin: false },
        { sessionId: 'sess_1', since: '' }
      )
    ).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });
});

=== server/domain/ticketing/services/offlineCheckInService.ts — diff ===
@@ -16,6 +16,8 @@ import {
   type TicketingActorContext,
 } from './ticketingAccess';
 
+const CHANGES_PAGE = 500;
+
 /** Check-in offline: manifesto assinado e sincronização. */
 export class OfflineCheckInService {
   constructor(
@@ -41,6 +43,14 @@ export class OfflineCheckInService {
     const minPrepMs = startsAtMs - 24 * 3600 * 1000;
     const maxExpireMs = endsAtMs + 6 * 3600 * 1000;
 
+    // Lista só depois do fim das vendas pelo app: assim ela já é a final (D21).
+    const salesEndMs = new Date(occurrence.salesEndsAt || occurrence.startsAt).getTime();
+    if (nowMs < salesEndMs) {
+      throw new TicketingDomainError(
+        'UNPROCESSABLE_ENTITY',
+        'O check-in sem internet fica disponível depois do fim das vendas pelo app.'
+      );
+    }
     if (nowMs < minPrepMs) {
       throw new TicketingDomainError(
         'UNPROCESSABLE_ENTITY',
@@ -185,4 +195,41 @@ export class OfflineCheckInService {
       results,
     };
   }
+
+  /**
+   * O que mudou na sessão desde a última atualização do aparelho (D21): trocas de QR, transferências,
+   * cancelamentos e entradas. Só hash do ID, versão e situação, como no manifesto.
+   */
+  async listOfflineChanges(
+    actor: TicketingActorContext,
+    params: { sessionId: string; since: string }
+  ): Promise<{
+    serverTime: string;
+    hasMore: boolean;
+    tickets: Array<{ ticketIdHash: string; qrVersion: number; usable: boolean }>;
+  }> {
+    const session = await this.port.getOfflineCheckInSessionById(params.sessionId);
+    if (!session) {
+      throw new TicketingDomainError('NOT_FOUND', 'Sessão de check-in offline não encontrada.');
+    }
+    await assertCanManageOccurrence(actor, session.occurrenceId);
+    const serverTime = new Date().toISOString();
+    const changed = await this.port.listTicketsChangedSince(
+      session.occurrenceId,
+      params.since,
+      CHANGES_PAGE + 1
+    );
+    return {
+      serverTime:
+        changed.length > CHANGES_PAGE
+          ? (changed[CHANGES_PAGE - 1]?.updatedAt ?? serverTime)
+          : serverTime,
+      hasMore: changed.length > CHANGES_PAGE,
+      tickets: changed.slice(0, CHANGES_PAGE).map((ticket) => ({
+        ticketIdHash: hashTicketIdForOfflineManifest(ticket.id),
+        qrVersion: ticket.qrVersion || 1,
+        usable: ticket.status === 'issued',
+      })),
+    };
+  }
 }

=== server/domain/ticketing/services/ticketingServices.test.ts — diff ===
@@ -178,6 +178,8 @@ describe('serviços de ticketing', () => {
       getOfflineCheckInSessionById: vi.fn(),
       syncOfflineCheckInsAtomic: vi.fn(),
       anonymizeUser: vi.fn(),
+      listTicketsChangedSince: vi.fn().mockResolvedValue([]),
+      swapTicketQr: vi.fn(),
       countCheckInCodeFailures: vi.fn().mockResolvedValue(0),
       addCheckInCodeFailure: vi.fn().mockResolvedValue(undefined),
     };

=== server/domain/ticketing/types/ticketingTypes.ts — diff ===
@@ -176,6 +176,10 @@ export interface Ticket {
   issuedAt: string;
   checkedInAt?: string;
   checkedInBy?: string;
+  /** "Problema com o QR Code?": o titular trocou o QR, que só pode ser trocado uma vez (D21). */
+  qrSwappedAt?: string;
+  /** Última mudança: a lista sem internet da portaria baixa só o que mudou (D21). */
+  updatedAt?: string;
   transferredAt?: string;
   ticketTypeSnapshot?: {
     name: string;

=== server/domain/ticketing/usecases/listOfflineCheckInChangesUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { offlineCheckInService } from '../factory';
import type { TicketingActorContext } from '../services/ticketingAccess';

/** Mudanças da sessão desde a última atualização da lista sem internet (D21). */
export function listOfflineCheckInChangesUseCase(
  actor: TicketingActorContext,
  params: { sessionId: string; since: string }
) {
  return offlineCheckInService.listOfflineChanges(actor, params);
}

=== server/domain/ticketing/usecases/reissueTicketQrTokenUseCase.ts — APAGUE este arquivo ===

=== server/domain/ticketing/usecases/swapTicketQrUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { checkInService } from '../factory';
import type { TicketingActorContext } from '../services/ticketingAccess';

/** "Problema com o QR Code?": troca única do QR e do código pelo titular (D21). */
export function swapTicketQrUseCase(actor: TicketingActorContext, ticketId: string) {
  return checkInService.swapPresentationQr(actor, ticketId);
}

=== src/domain/admin/components/subcomponents/AdminEditorEventFields.tsx — diff ===
@@ -76,6 +76,7 @@ export function AdminEditorEventFields({
           startsAt: occ.startsAt,
           endsAt: occ.endsAt,
           capacity: occ.capacity,
+          ...(occ.salesEndsAt ? { salesEndsAt: occ.salesEndsAt } : {}),
         })),
         onChange: (sessions) =>
           setValue('occurrences', sessions, { shouldDirty: true, shouldValidate: true }),

=== src/domain/events/application/usecases/saveEventSessionsUseCase.ts — diff ===
@@ -38,6 +38,7 @@ export async function saveEventSessionsUseCase({
       startsAt: session.startsAt,
       endsAt: session.endsAt,
       capacity: session.capacity,
+      ...(session.salesEndsAt ? { salesEndsAt: session.salesEndsAt } : {}),
     });
   }
   for (const session of toUpdate) {
@@ -45,6 +46,7 @@ export async function saveEventSessionsUseCase({
       startsAt: session.startsAt,
       endsAt: session.endsAt,
       capacity: session.capacity,
+      ...(session.salesEndsAt ? { salesEndsAt: session.salesEndsAt } : {}),
     });
   }
   for (const id of toDeleteIds) {

=== src/domain/events/components/EventSessionsField.test.tsx — diff ===
@@ -1,5 +1,6 @@
 import { fireEvent, render, screen } from '@testing-library/react';
-import { describe, expect, it, vi } from 'vitest';
+import { beforeAll, describe, expect, it, vi } from 'vitest';
+import { i18n } from '../../../shared/i18n';
 import { EventSessionsField } from './EventSessionsField';
 
 const one = [
@@ -7,6 +8,10 @@ const one = [
 ];
 
 describe('EventSessionsField', () => {
+  beforeAll(async () => {
+    await i18n.changeLanguage('pt-BR');
+  });
+
   it('mostra os horários no fuso de Fortaleza e adiciona uma sessão', () => {
     const onChange = vi.fn();
     render(<EventSessionsField sessions={one} onChange={onChange} loadState="ready" />);
@@ -20,11 +25,11 @@ describe('EventSessionsField', () => {
     const { rerender } = render(
       <EventSessionsField sessions={one} onChange={onChange} loadState="ready" />
     );
-    expect(screen.queryByRole('button', { name: /Remover sessão/ })).toBeNull();
+    expect(screen.queryByRole('button', { name: /Remover Sessão/ })).toBeNull();
     rerender(
       <EventSessionsField sessions={[...one, ...one]} onChange={onChange} loadState="ready" />
     );
-    const [firstRemove] = screen.getAllByRole('button', { name: /Remover sessão/ });
+    const [firstRemove] = screen.getAllByRole('button', { name: /Remover Sessão/ });
     if (firstRemove) fireEvent.click(firstRemove);
     expect(onChange.mock.calls[0]?.[0]).toHaveLength(1);
   });

=== src/domain/events/components/EventSessionsField.tsx — ARQUIVO REESCRITO, substitua todo o conteúdo por este ===
import { Plus, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  businessDateTimeToIso,
  isoToBusinessDateTime,
} from '../../../shared/utils/businessDateTime';
import { INPUT } from '../../../ui/styles/controls';
import type { EventSessionDraft, EventSessionsLoadState } from '../types/eventSession';
import { defaultSalesEndsAt, newEventSessionDraft, withStartsAt } from '../utils/eventSessions';

export interface EventSessionsFieldProps {
  sessions: EventSessionDraft[];
  onChange: (sessions: EventSessionDraft[]) => void;
  /** Estado da leitura das sessões salvas; enquanto não está pronta, a lista não é editável. */
  loadState: EventSessionsLoadState;
}

const LABEL = 'text-[12px] font-semibold text-ink/70';

/** Sessões do evento (data, horário, capacidade e fim das vendas), no fuso de Fortaleza. Usado pelo parceiro e pelo admin. */
export function EventSessionsField({ sessions, onChange, loadState }: EventSessionsFieldProps) {
  const { t } = useTranslation();
  if (loadState === 'loading') {
    return (
      <p role="status" className="px-2 text-[13px] text-ink/70">
        {t('eventSessions.loading')}
      </p>
    );
  }
  if (loadState === 'error') {
    return (
      <p role="alert" className="px-2 text-[13px] text-danger">
        {t('eventSessions.loadError')}
      </p>
    );
  }

  const replace = (index: number, next: EventSessionDraft) => {
    onChange(sessions.map((session, current) => (current === index ? next : session)));
  };

  return (
    <div className="space-y-4" id="event-sessions-field">
      <div className="flex items-center justify-between gap-2 px-2">
        <div>
          <p className="text-sm font-semibold text-ink">{t('eventSessions.title')}</p>
          <p className="text-[12px] text-ink/70">{t('eventSessions.timezone')}</p>
        </div>
        <button
          type="button"
          onClick={() => onChange([...sessions, newEventSessionDraft()])}
          className="press min-h-11 px-4 rounded-xl bg-accent-soft text-accent text-[13px] font-semibold inline-flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-teal-400/50"
        >
          <Plus size={16} aria-hidden="true" /> {t('eventSessions.add')}
        </button>
      </div>

      {sessions.map((session, index) => {
        const label = t('eventSessions.session', { n: index + 1 });
        return (
          <fieldset
            key={session.id ?? `new-${index}`}
            className="p-4 rounded-2xl bg-surface border border-line space-y-4 min-w-0"
          >
            <div className="flex items-center justify-between">
              <legend className="text-[13px] font-semibold text-ink/80">{label}</legend>
              {sessions.length > 1 && (
                <button
                  type="button"
                  aria-label={t('eventSessions.remove', { session: label })}
                  onClick={() => onChange(sessions.filter((_, current) => current !== index))}
                  className="press w-11 h-11 flex items-center justify-center rounded-xl bg-danger-soft text-danger focus-visible:ring-2 focus-visible:ring-teal-400/50"
                >
                  <Trash2 size={16} aria-hidden="true" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="space-y-1.5 block">
                <span className={LABEL}>{t('eventSessions.startsAt')}</span>
                <input
                  type="datetime-local"
                  value={isoToBusinessDateTime(session.startsAt)}
                  onChange={(e) =>
                    replace(index, withStartsAt(session, businessDateTimeToIso(e.target.value)))
                  }
                  className={INPUT}
                />
              </label>
              <label className="space-y-1.5 block">
                <span className={LABEL}>{t('eventSessions.endsAt')}</span>
                <input
                  type="datetime-local"
                  value={isoToBusinessDateTime(session.endsAt)}
                  onChange={(e) =>
                    replace(index, { ...session, endsAt: businessDateTimeToIso(e.target.value) })
                  }
                  className={INPUT}
                />
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="space-y-1.5 block">
                <span className={LABEL}>{t('eventSessions.capacity')}</span>
                <input
                  type="number"
                  min={1}
                  value={Number.isFinite(session.capacity) ? session.capacity : ''}
                  onChange={(e) => replace(index, { ...session, capacity: e.target.valueAsNumber })}
                  className={INPUT}
                />
              </label>
              <label className="space-y-1.5 block">
                <span className={LABEL}>{t('eventSessions.salesEndsAt')}</span>
                <input
                  type="datetime-local"
                  value={isoToBusinessDateTime(
                    session.salesEndsAt ?? defaultSalesEndsAt(session.startsAt)
                  )}
                  onChange={(e) =>
                    replace(index, {
                      ...session,
                      salesEndsAt: businessDateTimeToIso(e.target.value),
                    })
                  }
                  className={INPUT}
                />
              </label>
            </div>
            <p className="text-[12px] text-ink/70">{t('eventSessions.salesEndsHint')}</p>
          </fieldset>
        );
      })}
    </div>
  );
}

=== src/domain/events/types/eventSession.ts — diff ===
@@ -4,6 +4,8 @@ export interface EventSessionDraft {
   startsAt: string;
   endsAt: string;
   capacity: number;
+  /** Fim das vendas pelo app (D21): sugerido 2 h antes do início. */
+  salesEndsAt?: string;
 }
 
 export type EventSessionsLoadState = 'idle' | 'loading' | 'ready' | 'error';

=== src/domain/events/utils/eventSessions.test.ts — diff ===
@@ -57,6 +57,7 @@ describe('eventSessions', () => {
       startsAt: '2026-11-01T20:00:00.000Z',
       endsAt: '2026-11-01T23:00:00.000Z',
       capacity: 100,
+      salesEndsAt: '2026-11-01T18:00:00.000Z',
     });
   });
 });

=== src/domain/events/utils/eventSessions.ts — diff ===
@@ -1,6 +1,23 @@
 import type { EventSessionDraft } from '../types/eventSession';
 
 const THREE_HOURS_MS = 3 * 60 * 60 * 1000;
+const SALES_END_BEFORE_START_MS = 2 * 60 * 60 * 1000;
+
+/** Fim das vendas sugerido (D21): 2 h antes do início, igual ao padrão do servidor. */
+export function defaultSalesEndsAt(startsAt: string): string {
+  return new Date(new Date(startsAt).getTime() - SALES_END_BEFORE_START_MS).toISOString();
+}
+
+/** Ao mudar o início, o fim das vendas no padrão acompanha; escolhido pelo parceiro, fica. */
+export function withStartsAt(session: EventSessionDraft, startsAt: string): EventSessionDraft {
+  const followsDefault =
+    !session.salesEndsAt || session.salesEndsAt === defaultSalesEndsAt(session.startsAt);
+  return {
+    ...session,
+    startsAt,
+    ...(followsDefault ? { salesEndsAt: defaultSalesEndsAt(startsAt) } : {}),
+  };
+}
 
 export interface EventSessionChanges {
   toCreate: EventSessionDraft[];
@@ -61,5 +78,6 @@ export function newEventSessionDraft(now: Date = new Date()): EventSessionDraft
     startsAt: now.toISOString(),
     endsAt: new Date(now.getTime() + THREE_HOURS_MS).toISOString(),
     capacity: 100,
+    salesEndsAt: defaultSalesEndsAt(now.toISOString()),
   };
 }

=== src/domain/events/utils/eventSessionsSalesEnd.test.ts — ARQUIVO NOVO, conteúdo completo ===
import { describe, expect, it } from 'vitest';
import { defaultSalesEndsAt, newEventSessionDraft, withStartsAt } from './eventSessions';

describe('fim das vendas da sessão (D21)', () => {
  it('nova sessão sugere 2 h antes do início', () => {
    const draft = newEventSessionDraft(new Date('2026-12-20T23:00:00.000Z'));
    expect(draft.salesEndsAt).toBe('2026-12-20T21:00:00.000Z');
  });

  it('no padrão, acompanha o novo início; escolhido pelo parceiro, fica', () => {
    const draft = newEventSessionDraft(new Date('2026-12-20T23:00:00.000Z'));
    expect(withStartsAt(draft, '2026-12-21T01:00:00.000Z').salesEndsAt).toBe(
      defaultSalesEndsAt('2026-12-21T01:00:00.000Z')
    );
    const custom = { ...draft, salesEndsAt: '2026-12-20T22:30:00.000Z' };
    expect(withStartsAt(custom, '2026-12-21T01:00:00.000Z').salesEndsAt).toBe(
      '2026-12-20T22:30:00.000Z'
    );
  });
});

=== src/domain/partners/hooks/usePartnerEventSessions.ts — diff ===
@@ -41,6 +41,7 @@ export function usePartnerEventSessions(
             startsAt: occurrence.startsAt,
             endsAt: occurrence.endsAt,
             capacity: occurrence.capacity,
+            ...(occurrence.salesEndsAt ? { salesEndsAt: occurrence.salesEndsAt } : {}),
           })),
           ...(listing
             ? {

=== src/domain/ticketing/adapters/httpTicketingAdapter.ts — diff ===
@@ -13,6 +13,7 @@ import type {
   Refund,
   Ticket,
   TicketQrPass,
+  OfflineCheckInChanges,
   TicketOrder,
   TicketOrderItem,
   TicketType,
@@ -220,9 +221,21 @@ export class HttpTicketingAdapter implements TicketingPort {
     );
   }
 
-  async reissueTicketQrToken(ticketId: string): Promise<TicketQrPass> {
+  async listOfflineCheckInChanges(
+    sessionId: string,
+    since: string
+  ): Promise<OfflineCheckInChanges> {
     const res = await firebaseApiFetch(
-      `/api/ticketing/tickets/${encodeURIComponent(ticketId)}/qr/reissue`,
+      `/api/ticketing/check-in/offline-sessions/${encodeURIComponent(sessionId)}/changes?since=${encodeURIComponent(since)}`,
+      { method: 'GET' },
+      { requireAuth: true }
+    );
+    return parseJsonOrThrow<OfflineCheckInChanges>(res, 'Não foi possível atualizar a lista.');
+  }
+
+  async swapTicketQr(ticketId: string): Promise<TicketQrPass> {
+    const res = await firebaseApiFetch(
+      `/api/ticketing/tickets/${encodeURIComponent(ticketId)}/qr/swap`,
       {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
@@ -230,7 +243,7 @@ export class HttpTicketingAdapter implements TicketingPort {
       },
       { requireAuth: true }
     );
-    return parseJsonOrThrow<TicketQrPass>(res, 'Não foi possível reemitir o QR Code do ingresso.');
+    return parseJsonOrThrow<TicketQrPass>(res, 'Não foi possível trocar o QR Code do ingresso.');
   }
 
   async requestRefund(

=== src/domain/ticketing/application/usecases/listOfflineCheckInChangesUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { ticketingAdapter } from '../../factory';

export function listOfflineCheckInChangesUseCase(sessionId: string, since: string) {
  return ticketingAdapter.listOfflineCheckInChanges(sessionId, since);
}

=== src/domain/ticketing/application/usecases/reissueTicketQrTokenUseCase.ts — APAGUE este arquivo ===

=== src/domain/ticketing/application/usecases/swapTicketQrUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { ticketingAdapter } from '../../factory';

/** "Problema com o QR Code?": troca única do QR e do código pelo titular (D21). */
export function swapTicketQrUseCase(ticketId: string) {
  return ticketingAdapter.swapTicketQr(ticketId);
}

=== src/domain/ticketing/components/UserTicketsHistoryView.tsx — diff ===
@@ -118,7 +118,7 @@ export function UserTicketsHistoryView({ onBack }: UserTicketsHistoryViewProps =
               )}
               busy={actions.busy}
               onShowQr={() => void actions.showQr(ticket)}
-              onReissueQr={() => void actions.reissueQr(ticket)}
+              onSwapQr={() => void actions.swapQr(ticket)}
               onTransfer={() => actions.setTransferTicket(ticket)}
             />
           ))}

=== src/domain/ticketing/components/wallet/WalletTicketCard.tsx — diff ===
@@ -1,6 +1,9 @@
-import { QrCode, RefreshCw, Send, ShieldAlert } from 'lucide-react';
+import { QrCode, Send, ShieldAlert } from 'lucide-react';
+import { useState } from 'react';
 import { useTranslation } from 'react-i18next';
+import { ConfirmDialog, type ConfirmDialogData } from '../../../../ui/components/ConfirmDialog';
 import { GlassCard } from '../../../../ui/components/GlassCard';
+import { TextButton } from '../../../../ui/components/TextButton';
 import { cn } from '../../../../shared/utils/cn';
 import type { TicketQrPreview } from '../../hooks/useTicketWalletActions';
 import type { Ticket } from '../../types/ticketing';
@@ -12,7 +15,7 @@ interface WalletTicketCardProps {
   canTransfer: boolean;
   busy: boolean;
   onShowQr: () => void;
-  onReissueQr: () => void;
+  onSwapQr: () => void;
   onTransfer: () => void;
 }
 
@@ -25,10 +28,11 @@ export function WalletTicketCard({
   canTransfer,
   busy,
   onShowQr,
-  onReissueQr,
+  onSwapQr,
   onTransfer,
 }: WalletTicketCardProps) {
   const { t, i18n } = useTranslation();
+  const [confirm, setConfirm] = useState<ConfirmDialogData | null>(null);
   const startsAt = ticket.eventSnapshot?.startsAt;
   const formatDate = (iso: string) =>
     new Intl.DateTimeFormat(i18n.language, {
@@ -120,20 +124,6 @@ export function WalletTicketCard({
               {t('ticketWallet.actions.showQr')}
             </button>
           )}
-          {ticket.status === 'issued' && qr && (
-            <button
-              type="button"
-              disabled={busy}
-              onClick={onReissueQr}
-              className={cn(
-                ACTION,
-                'bg-surface border border-line hover:bg-accent-soft text-ink/80'
-              )}
-            >
-              <RefreshCw size={13} aria-hidden="true" />
-              {t('ticketWallet.actions.reissueQr')}
-            </button>
-          )}
           {canTransfer && (
             <button
               type="button"
@@ -146,6 +136,31 @@ export function WalletTicketCard({
           )}
         </div>
       )}
+      {ticket.status === 'issued' && !ticket.qrSwappedAt && (
+        <div className="flex justify-center">
+          <TextButton
+            tone="ink"
+            disabled={busy}
+            onClick={() =>
+              setConfirm({
+                title: t('ticketWallet.swap.title'),
+                message: t('ticketWallet.swap.message'),
+                confirmLabel: t('ticketWallet.swap.confirm'),
+                cancelLabel: t('common.cancel'),
+                tone: 'danger',
+                onCancel: () => setConfirm(null),
+                onConfirm: () => {
+                  setConfirm(null);
+                  onSwapQr();
+                },
+              })
+            }
+          >
+            {t('ticketWallet.swap.action')}
+          </TextButton>
+        </div>
+      )}
+      <ConfirmDialog data={confirm} />
     </GlassCard>
   );
 }

=== src/domain/ticketing/hooks/useOfflineTicketSession.ts — diff ===
@@ -1,7 +1,9 @@
 import { useCallback, useEffect, useState } from 'react';
 import { createOfflineCheckInSessionUseCase } from '../application/usecases/createOfflineCheckInSessionUseCase';
+import { listOfflineCheckInChangesUseCase } from '../application/usecases/listOfflineCheckInChangesUseCase';
 import { syncOfflineCheckInsUseCase } from '../application/usecases/syncOfflineCheckInsUseCase';
 import {
+  applyOfflineChanges,
   getOfflineManifestBundle,
   listPendingOfflineCheckInEvents,
   removeSyncedOfflineCheckInEvents,
@@ -14,6 +16,9 @@ export type OfflineSessionNotice =
   | { kind: 'synced'; count: number; conflicts: number }
   | { kind: 'error'; message: string };
 
+const CHANGES_INTERVAL_MS = 2 * 60_000;
+const MAX_CHANGE_PAGES = 10;
+
 /** Sessão sem internet da portaria: manifesto no aparelho e envio dos check-ins quando o sinal volta. */
 export function useOfflineTicketSession(
   occurrenceId: string,
@@ -93,6 +98,7 @@ export function useOfflineTicketSession(
         expiresAt: session.expiresAt,
         keys: manifest.keys,
         tickets: manifest.tickets,
+        changesSince: session.issuedAt,
       });
       await refresh();
       setNotice({ kind: 'prepared', count: manifest.tickets.length });
@@ -107,10 +113,37 @@ export function useOfflineTicketSession(
     void refresh();
   }, [refresh]);
 
+  // Com sinal, baixa a cada 2 min só o que mudou (D21): QR trocado, transferência, entrada em outro aparelho.
+  const pullChanges = useCallback(async () => {
+    if (!occurrenceId || !navigator.onLine) return;
+    let current = await getOfflineManifestBundle(occurrenceId).catch(() => null);
+    for (let page = 0; current && page < MAX_CHANGE_PAGES; page += 1) {
+      const changes = await listOfflineCheckInChangesUseCase(
+        current.sessionId,
+        current.changesSince
+      );
+      current = applyOfflineChanges(current, changes.tickets, changes.serverTime);
+      await saveOfflineManifestBundle(current);
+      if (!changes.hasMore) break;
+    }
+    if (current) setBundle(current);
+  }, [occurrenceId]);
+
+  const sessionId = bundle?.sessionId;
+  useEffect(() => {
+    if (!sessionId) return;
+    const timer = window.setInterval(
+      () => void pullChanges().catch(() => undefined),
+      CHANGES_INTERVAL_MS
+    );
+    return () => window.clearInterval(timer);
+  }, [sessionId, pullChanges]);
+
   useEffect(() => {
     const onOnline = () => {
       setIsOnline(true);
       void sync();
+      void pullChanges().catch(() => undefined);
     };
     const onOffline = () => setIsOnline(false);
     window.addEventListener('online', onOnline);
@@ -119,7 +152,7 @@ export function useOfflineTicketSession(
       window.removeEventListener('online', onOnline);
       window.removeEventListener('offline', onOffline);
     };
-  }, [sync]);
+  }, [pullChanges, sync]);
 
   return { isOnline, bundle, pending, preparing, syncing, notice, prepare, sync, refresh };
 }

=== src/domain/ticketing/hooks/useTicketWalletActions.ts — diff ===
@@ -67,11 +67,11 @@ export function useTicketWalletActions(wallet: WalletData) {
       await previewQr(await wallet.getSignedQrToken(ticket.id));
     }, 'ticketWallet.errors.qr');
 
-  const reissueQr = (ticket: Ticket) =>
+  const swapQr = (ticket: Ticket) =>
     run(async () => {
-      await previewQr(await wallet.reissueSignedQrToken(ticket.id));
-      setFeedback({ type: 'success', message: t('ticketWallet.feedback.qrReissued') });
-    }, 'ticketWallet.errors.qrReissue');
+      await previewQr(await wallet.swapSignedQrToken(ticket.id));
+      setFeedback({ type: 'success', message: t('ticketWallet.feedback.qrSwapped') });
+    }, 'ticketWallet.errors.qrSwap');
 
   // Erros com código ficam no formulário, que mostra o motivo traduzido junto do @.
   const submitTransfer = async (username: string) => {
@@ -110,7 +110,7 @@ export function useTicketWalletActions(wallet: WalletData) {
     setFeedback,
     qrPreview,
     showQr,
-    reissueQr,
+    swapQr,
     transferTicket,
     setTransferTicket,
     submitTransfer,

=== src/domain/ticketing/hooks/useUserTickets.ts — diff ===
@@ -2,7 +2,7 @@ import { useCallback, useEffect, useState } from 'react';
 import { getTicketQrTokenUseCase } from '../application/usecases/getTicketQrTokenUseCase';
 import { listUserOrdersUseCase } from '../application/usecases/listUserOrdersUseCase';
 import { listUserTicketsUseCase } from '../application/usecases/listUserTicketsUseCase';
-import { reissueTicketQrTokenUseCase } from '../application/usecases/reissueTicketQrTokenUseCase';
+import { swapTicketQrUseCase } from '../application/usecases/swapTicketQrUseCase';
 import { requestTicketRefundUseCase } from '../application/usecases/requestTicketRefundUseCase';
 import { transferTicketUseCase } from '../application/usecases/transferTicketUseCase';
 import type { Ticket, TicketOrder } from '../types/ticketing';
@@ -69,9 +69,9 @@ export function useUserTicketsAndOrders(enabled = true) {
     return getTicketQrTokenUseCase(ticketId);
   }, []);
 
-  const reissueSignedQrToken = useCallback(
+  const swapSignedQrToken = useCallback(
     async (ticketId: string) => {
-      const res = await reissueTicketQrTokenUseCase(ticketId);
+      const res = await swapTicketQrUseCase(ticketId);
       await reload();
       return res;
     },
@@ -87,6 +87,6 @@ export function useUserTicketsAndOrders(enabled = true) {
     transferTicket,
     requestRefund,
     getSignedQrToken,
-    reissueSignedQrToken,
+    swapSignedQrToken,
   };
 }

=== src/domain/ticketing/index.ts — diff ===
@@ -16,7 +16,7 @@ export { listManagementTicketTypesUseCase } from './application/usecases/listMan
 export { listPublicTicketTypesUseCase } from './application/usecases/listPublicTicketTypesUseCase';
 export { listUserOrdersUseCase } from './application/usecases/listUserOrdersUseCase';
 export { listUserTicketsUseCase } from './application/usecases/listUserTicketsUseCase';
-export { reissueTicketQrTokenUseCase } from './application/usecases/reissueTicketQrTokenUseCase';
+export { swapTicketQrUseCase } from './application/usecases/swapTicketQrUseCase';
 export { requestTicketRefundUseCase } from './application/usecases/requestTicketRefundUseCase';
 export { syncOfflineCheckInsUseCase } from './application/usecases/syncOfflineCheckInsUseCase';
 export { transferTicketUseCase } from './application/usecases/transferTicketUseCase';

=== src/domain/ticketing/ports/ticketingPort.ts — diff ===
@@ -7,6 +7,7 @@ import type {
   Refund,
   Ticket,
   TicketQrPass,
+  OfflineCheckInChanges,
   TicketOrder,
   TicketOrderItem,
   TicketType,
@@ -97,7 +98,9 @@ export interface TicketingPort {
   }>;
   listUserTickets(): Promise<Ticket[]>;
   getTicketQrToken(ticketId: string): Promise<TicketQrPass>;
-  reissueTicketQrToken(ticketId: string): Promise<TicketQrPass>;
+  /** Troca única do QR pelo titular (D21). */
+  swapTicketQr(ticketId: string): Promise<TicketQrPass>;
+  listOfflineCheckInChanges(sessionId: string, since: string): Promise<OfflineCheckInChanges>;
   requestRefund(
     orderId: string,
     input: { ticketId?: string; reason: string; idempotencyKey: string }

=== src/domain/ticketing/types/ticketing.ts — diff ===
@@ -160,6 +160,8 @@ export interface Ticket {
   holderEmail: string;
   qrTokenHash: string;
   qrVersion: number;
+  /** O titular já usou "Problema com o QR Code?" (só uma vez por ingresso, D21). */
+  qrSwappedAt?: string;
   status: TicketStatus;
   ticketTypeSnapshot?: {
     name: string;
@@ -259,6 +261,13 @@ export interface OfflineCheckInSessionResponse {
   };
 }
 
+/** Mudanças da lista sem internet desde a última atualização (D21). */
+export interface OfflineCheckInChanges {
+  serverTime: string;
+  hasMore: boolean;
+  tickets: Array<{ ticketIdHash: string; qrVersion: number; usable: boolean }>;
+}
+
 export interface OfflineCheckInSyncResult {
   clientEventId: string;
   ticketId: string;

=== src/domain/ticketing/utils/offlineCheckInStorage.test.ts — ARQUIVO NOVO, conteúdo completo ===
import { describe, expect, it } from 'vitest';
import { applyOfflineChanges, type StoredOfflineManifestBundle } from './offlineCheckInStorage';

const BUNDLE: StoredOfflineManifestBundle = {
  occurrenceId: 'occ_1',
  eventListingId: 'ev_1',
  sessionId: 'sess_1',
  stationId: 'st_1',
  issuedAt: '2026-12-20T21:00:00.000Z',
  expiresAt: '2026-12-21T11:00:00.000Z',
  keys: [],
  tickets: [
    { ticketIdHash: 'a', qrVersion: 1 },
    { ticketIdHash: 'b', qrVersion: 1 },
  ],
  changesSince: '2026-12-20T21:00:00.000Z',
};

describe('atualização da lista sem internet (D21)', () => {
  it('troca de QR atualiza a versão, ingresso novo entra e o que não vale sai', () => {
    const next = applyOfflineChanges(
      BUNDLE,
      [
        { ticketIdHash: 'a', qrVersion: 2, usable: true },
        { ticketIdHash: 'b', qrVersion: 2, usable: false },
        { ticketIdHash: 'c', qrVersion: 2, usable: true },
      ],
      '2026-12-20T22:00:00.000Z'
    );
    expect(next.tickets).toEqual([
      { ticketIdHash: 'a', qrVersion: 2 },
      { ticketIdHash: 'c', qrVersion: 2 },
    ]);
    expect(next.changesSince).toBe('2026-12-20T22:00:00.000Z');
  });
});

=== src/domain/ticketing/utils/offlineCheckInStorage.ts — diff ===
@@ -8,6 +8,8 @@ export interface StoredOfflineManifestBundle {
   /** Chaves públicas Ed25519 aceitas (atual e, na rotação, a anterior). */
   keys: Array<{ kid: string; publicKeyJwk: JsonWebKey }>;
   tickets: Array<{ ticketIdHash: string; qrVersion: number }>;
+  /** Até quando o aparelho já baixou as mudanças do servidor (D21). */
+  changesSince: string;
 }
 
 export interface StoredOfflineCheckInEvent {
@@ -84,17 +86,19 @@ export async function getOfflineManifestBundle(
   });
 }
 
-export async function isTicketMarkedUsedOffline(
+/** Entrada já feita neste aparelho, com a versão do QR que entrou; null se ainda não entrou. */
+export async function getOfflineUsedRecord(
   occurrenceId: string,
   ticketIdHash: string
-): Promise<boolean> {
+): Promise<{ qrVersion: number } | null> {
   const db = await openDb();
   return new Promise((resolve, reject) => {
     const tx = db.transaction(STORE_USED, 'readonly');
     const req = tx.objectStore(STORE_USED).get(`${occurrenceId}:${ticketIdHash}`);
     req.onsuccess = () => {
       db.close();
-      resolve(Boolean(req.result));
+      const record = req.result as { qrVersion?: number } | undefined;
+      resolve(record ? { qrVersion: record.qrVersion ?? 1 } : null);
     };
     req.onerror = () => {
       db.close();
@@ -112,6 +116,7 @@ export async function recordOfflineCheckInEvent(event: StoredOfflineCheckInEvent
       key: `${event.occurrenceId}:${event.ticketIdHash}`,
       occurrenceId: event.occurrenceId,
       ticketIdHash: event.ticketIdHash,
+      qrVersion: event.qrVersion,
       usedAt: event.scannedAt,
     });
     tx.oncomplete = () => {
@@ -171,3 +176,26 @@ export async function sha256HexBrowser(input: string): Promise<string> {
     .map((b) => b.toString(16).padStart(2, '0'))
     .join('');
 }
+
+/**
+ * Aplica as mudanças baixadas do servidor (D21): versão nova de QR, ingresso novo de transferência e
+ * ingresso que deixou de valer (usado, cancelado, transferido) saindo da lista.
+ */
+export function applyOfflineChanges(
+  bundle: StoredOfflineManifestBundle,
+  changes: Array<{ ticketIdHash: string; qrVersion: number; usable: boolean }>,
+  changesSince: string
+): StoredOfflineManifestBundle {
+  const tickets = new Map(bundle.tickets.map((ticket) => [ticket.ticketIdHash, ticket]));
+  for (const change of changes) {
+    if (change.usable) {
+      tickets.set(change.ticketIdHash, {
+        ticketIdHash: change.ticketIdHash,
+        qrVersion: change.qrVersion,
+      });
+    } else {
+      tickets.delete(change.ticketIdHash);
+    }
+  }
+  return { ...bundle, tickets: [...tickets.values()], changesSince };
+}

=== src/domain/ticketing/utils/offlineTicketVerifier.test.ts — diff ===
@@ -3,7 +3,8 @@ import { beforeEach, describe, expect, it, vi } from 'vitest';
 
 const storage = vi.hoisted(() => ({
   bundle: null as unknown,
-  used: false,
+  used: null as { qrVersion: number } | null,
+  saved: [] as unknown[],
   recorded: [] as unknown[],
 }));
 
@@ -13,7 +14,10 @@ vi.mock('./offlineCheckInStorage', async () => {
   return {
     sha256HexBrowser: actual.sha256HexBrowser,
     getOfflineManifestBundle: vi.fn(async () => storage.bundle),
-    isTicketMarkedUsedOffline: vi.fn(async () => storage.used),
+    getOfflineUsedRecord: vi.fn(async () => storage.used),
+    saveOfflineManifestBundle: vi.fn(async (bundle: unknown) => {
+      storage.saved.push(bundle);
+    }),
     recordOfflineCheckInEvent: vi.fn(async (event: unknown) => {
       storage.recorded.push(event);
     }),
@@ -34,7 +38,8 @@ const VALID = { tid: 'tkt_1', occ: 'occ_1', qv: 2, exp: Math.floor(Date.now() /
 
 describe('conferência do QR do ingresso sem internet (D20, B36)', () => {
   beforeEach(async () => {
-    storage.used = false;
+    storage.used = null;
+    storage.saved = [];
     storage.recorded = [];
     storage.bundle = {
       occurrenceId: 'occ_1',
@@ -70,10 +75,26 @@ describe('conferência do QR do ingresso sem internet (D20, B36)', () => {
         verifyAndConsumeOfflineQrToken({ rawToken, occurrenceId: 'occ_1' })
       ).resolves.toEqual({ valid: false, reason });
     }
-    storage.used = true;
+    storage.used = { qrVersion: 2 };
     await expect(
       verifyAndConsumeOfflineQrToken({ rawToken: token(VALID), occurrenceId: 'occ_1' })
     ).resolves.toEqual({ valid: false, reason: 'used' });
+    await expect(
+      verifyAndConsumeOfflineQrToken({
+        rawToken: token({ ...VALID, qv: 3 }),
+        occurrenceId: 'occ_1',
+      })
+    ).resolves.toEqual({ valid: false, reason: 'swappedConflict' });
     expect(storage.recorded).toHaveLength(0);
   });
+
+  it('QR trocado depois da lista: a versão nova vence e passa a ser a da lista (D21)', async () => {
+    const result = await verifyAndConsumeOfflineQrToken({
+      rawToken: token({ ...VALID, qv: 3 }),
+      occurrenceId: 'occ_1',
+    });
+    expect(result.valid).toBe(true);
+    expect(storage.saved).toHaveLength(1);
+    expect(JSON.stringify(storage.saved[0])).toContain('"qrVersion":3');
+  });
 });

=== src/domain/ticketing/utils/offlineTicketVerifier.ts — diff ===
@@ -1,7 +1,8 @@
 import {
   getOfflineManifestBundle,
-  isTicketMarkedUsedOffline,
+  getOfflineUsedRecord,
   recordOfflineCheckInEvent,
+  saveOfflineManifestBundle,
   sha256HexBrowser,
   type StoredOfflineCheckInEvent,
 } from './offlineCheckInStorage';
@@ -17,6 +18,7 @@ export type OfflineRejection =
   | 'notInManifest'
   | 'revoked'
   | 'used'
+  | 'swappedConflict'
   | 'unsupported';
 
 interface TicketQrContent {
@@ -86,9 +88,20 @@ export async function verifyAndConsumeOfflineQrToken(params: {
   const ticketIdHash = await sha256HexBrowser(content.tid);
   const entry = bundle.tickets.find((ticket) => ticket.ticketIdHash === ticketIdHash);
   if (!entry) return { valid: false, reason: 'notInManifest' };
-  if (entry.qrVersion !== content.qv) return { valid: false, reason: 'revoked' };
-  if (await isTicketMarkedUsedOffline(params.occurrenceId, ticketIdHash)) {
-    return { valid: false, reason: 'used' };
+  // Versão mais nova que a da lista vence (D21): a assinatura prova que o servidor gerou, e o titular
+  // trocou o QR depois que a lista foi baixada. A partir daí este aparelho recusa a versão antiga.
+  if (content.qv < entry.qrVersion) return { valid: false, reason: 'revoked' };
+  const used = await getOfflineUsedRecord(params.occurrenceId, ticketIdHash);
+  if (used) {
+    return { valid: false, reason: content.qv > used.qrVersion ? 'swappedConflict' : 'used' };
+  }
+  if (content.qv > entry.qrVersion) {
+    await saveOfflineManifestBundle({
+      ...bundle,
+      tickets: bundle.tickets.map((ticket) =>
+        ticket.ticketIdHash === ticketIdHash ? { ...ticket, qrVersion: content.qv } : ticket
+      ),
+    });
   }
   const event: StoredOfflineCheckInEvent = {
     clientEventId: crypto.randomUUID(),

=== src/shared/i18n/eventSessionsResources.ts — ARQUIVO NOVO, conteúdo completo ===
/** Textos do campo de sessões do evento (parceiro e admin). pt-BR é a fonte. */
export interface EventSessionsTranslation {
  loading: string;
  loadError: string;
  title: string;
  timezone: string;
  add: string;
  session: string;
  remove: string;
  startsAt: string;
  endsAt: string;
  capacity: string;
  salesEndsAt: string;
  salesEndsHint: string;
}

export const eventSessionsPtBR: EventSessionsTranslation = {
  loading: 'Carregando as sessões do evento…',
  loadError:
    'Não foi possível carregar as sessões deste evento. Feche e abra o editor de novo antes de salvar.',
  title: 'Sessões do evento',
  timezone: 'Horários no fuso de Fortaleza (UTC−3).',
  add: 'Adicionar data',
  session: 'Sessão {{n}}',
  remove: 'Remover {{session}}',
  startsAt: 'Início',
  endsAt: 'Término',
  capacity: 'Capacidade máxima',
  salesEndsAt: 'Vendas pelo app até',
  salesEndsHint:
    'Sugerimos 2 h antes do início. Depois desse horário, a lista da portaria sem internet pode ser preparada.',
};

export const eventSessionsEn: EventSessionsTranslation = {
  loading: 'Loading the event sessions…',
  loadError: 'Could not load this event’s sessions. Close and reopen the editor before saving.',
  title: 'Event sessions',
  timezone: 'Times in the Fortaleza time zone (UTC−3).',
  add: 'Add date',
  session: 'Session {{n}}',
  remove: 'Remove {{session}}',
  startsAt: 'Start',
  endsAt: 'End',
  capacity: 'Maximum capacity',
  salesEndsAt: 'App sales until',
  salesEndsHint:
    'We suggest 2 h before the start. After that time, the offline entrance list can be prepared.',
};

export const eventSessionsFr: EventSessionsTranslation = {
  loading: 'Chargement des séances de l’événement…',
  loadError:
    'Impossible de charger les séances de cet événement. Fermez et rouvrez l’éditeur avant d’enregistrer.',
  title: 'Séances de l’événement',
  timezone: 'Horaires au fuseau de Fortaleza (UTC−3).',
  add: 'Ajouter une date',
  session: 'Séance {{n}}',
  remove: 'Supprimer {{session}}',
  startsAt: 'Début',
  endsAt: 'Fin',
  capacity: 'Capacité maximale',
  salesEndsAt: 'Ventes dans l’app jusqu’à',
  salesEndsHint:
    'Nous suggérons 2 h avant le début. Après cet horaire, la liste d’entrée hors ligne peut être préparée.',
};

=== src/shared/i18n/resources.ts — diff ===
@@ -116,6 +116,12 @@ import {
   usernameFr,
   usernamePtBR,
 } from './usernameResources';
+import {
+  type EventSessionsTranslation,
+  eventSessionsEn,
+  eventSessionsFr,
+  eventSessionsPtBR,
+} from './eventSessionsResources';
 import { type LegalTranslation, legalEn, legalFr, legalPtBR } from './legalResources';
 import {
   type VerificationTranslation,
@@ -145,6 +151,7 @@ export interface TranslationResource {
   ticketWallet: TicketWalletTranslation;
   ticketGate: TicketGateTranslation;
   username: UsernameTranslation;
+  eventSessions: EventSessionsTranslation;
   legal: LegalTranslation;
   verification: VerificationTranslation;
   common: {
@@ -378,6 +385,7 @@ const ptBR: TranslationResource = {
   ticketWallet: ticketWalletPtBR,
   ticketGate: ticketGatePtBR,
   username: usernamePtBR,
+  eventSessions: eventSessionsPtBR,
   legal: legalPtBR,
   verification: verificationPtBR,
   common: {
@@ -671,6 +679,7 @@ const en: TranslationResource = {
   ticketWallet: ticketWalletEn,
   ticketGate: ticketGateEn,
   username: usernameEn,
+  eventSessions: eventSessionsEn,
   legal: legalEn,
   verification: verificationEn,
   common: {
@@ -958,6 +967,7 @@ const fr: TranslationResource = {
   ticketWallet: ticketWalletFr,
   ticketGate: ticketGateFr,
   username: usernameFr,
+  eventSessions: eventSessionsFr,
   legal: legalFr,
   verification: verificationFr,
   common: {

=== src/shared/i18n/ticketGateResources.ts — diff ===
@@ -9,6 +9,7 @@ type OfflineReason =
   | 'notInManifest'
   | 'revoked'
   | 'used'
+  | 'swappedConflict'
   | 'unsupported';
 
 export interface TicketGateTranslation {
@@ -74,6 +75,8 @@ export const ticketGatePtBR: TicketGateTranslation = {
     notInManifest: 'Ingresso já usado ou cancelado.',
     revoked: 'Este QR foi substituído (ingresso transferido).',
     used: 'Este ingresso já entrou por este aparelho.',
+    swappedConflict:
+      'QR trocado pelo titular depois de uma entrada com o QR antigo: confira o documento.',
     unsupported: 'Este aparelho não confere QR sem internet. Use outro ou aguarde o sinal.',
   },
   online: 'Com internet',
@@ -123,6 +126,7 @@ export const ticketGateEn: TicketGateTranslation = {
     notInManifest: 'Ticket already used or canceled.',
     revoked: 'This QR was replaced (ticket transferred).',
     used: 'This ticket already entered on this device.',
+    swappedConflict: 'QR replaced by the holder after an entry with the old QR: check the ID.',
     unsupported: 'This device cannot check QR codes offline. Use another one or wait for signal.',
   },
   online: 'Online',
@@ -172,6 +176,8 @@ export const ticketGateFr: TicketGateTranslation = {
     notInManifest: 'Billet déjà utilisé ou annulé.',
     revoked: 'Ce QR a été remplacé (billet transféré).',
     used: 'Ce billet est déjà entré avec cet appareil.',
+    swappedConflict:
+      'QR remplacé par le titulaire après une entrée avec l’ancien QR : vérifiez la pièce d’identité.',
     unsupported:
       'Cet appareil ne vérifie pas les QR hors ligne. Utilisez-en un autre ou attendez le réseau.',
   },

=== src/shared/i18n/ticketWalletResources.ts — diff ===
@@ -23,16 +23,17 @@ export interface TicketWalletTranslation {
   order: string;
   ticketCount_one: string;
   ticketCount_other: string;
-  actions: { showQr: string; reissueQr: string; transfer: string };
+  actions: { showQr: string; transfer: string };
+  swap: { action: string; title: string; message: string; confirm: string };
   ticketStatus: Record<TicketStatusKey, string>;
   resume: { title: string; close: string };
   feedback: {
-    qrReissued: string;
+    qrSwapped: string;
     refundRequested: string;
     alreadyPaid: string;
     paid: string;
   };
-  errors: { qr: string; qrReissue: string; refund: string; resume: string };
+  errors: { qr: string; qrSwap: string; refund: string; resume: string };
 }
 
 export const ticketWalletPtBR: TicketWalletTranslation = {
@@ -57,9 +58,15 @@ export const ticketWalletPtBR: TicketWalletTranslation = {
   ticketCount_other: '{{count}} ingressos',
   actions: {
     showQr: 'Ver QR',
-    reissueQr: 'Novo QR',
     transfer: 'Transferir',
   },
+  swap: {
+    action: 'Problema com o QR Code?',
+    title: 'Trocar o QR Code?',
+    message:
+      'Use se alguém viu ou copiou seu QR Code. O QR e o código atuais param de funcionar, e você só pode fazer isso uma vez. Se a portaria estiver sem internet, o QR antigo ainda pode passar até ela atualizar: chegue cedo e, se precisar, mostre seu documento.',
+    confirm: 'Trocar QR Code',
+  },
   ticketStatus: {
     reserved: 'Reservado',
     issued: 'Emitido',
@@ -73,14 +80,14 @@ export const ticketWalletPtBR: TicketWalletTranslation = {
   },
   resume: { title: 'Concluir pagamento do pedido #{{id}}', close: 'Fechar' },
   feedback: {
-    qrReissued: 'Novo QR Code emitido. O anterior deixou de valer.',
+    qrSwapped: 'QR Code trocado. O anterior e o código antigo não valem mais.',
     refundRequested: 'Reembolso solicitado. Você recebe pelo mesmo meio de pagamento.',
     alreadyPaid: 'Seu pagamento já estava confirmado. Ingressos atualizados.',
     paid: 'Pagamento confirmado e ingressos emitidos!',
   },
   errors: {
     qr: 'Não foi possível gerar o QR Code.',
-    qrReissue: 'Não foi possível emitir um novo QR Code.',
+    qrSwap: 'Não foi possível trocar o QR Code.',
     refund: 'Não foi possível pedir o reembolso.',
     resume: 'Não foi possível retomar o pagamento deste pedido.',
   },
@@ -107,9 +114,15 @@ export const ticketWalletEn: TicketWalletTranslation = {
   ticketCount_other: '{{count}} tickets',
   actions: {
     showQr: 'Show QR',
-    reissueQr: 'New QR',
     transfer: 'Transfer',
   },
+  swap: {
+    action: 'Problem with the QR code?',
+    title: 'Replace the QR code?',
+    message:
+      'Use this if someone saw or copied your QR code. The current QR and code stop working, and you can only do this once. If the entrance is offline, the old QR may still pass until it updates: arrive early and show your ID if needed.',
+    confirm: 'Replace QR code',
+  },
   ticketStatus: {
     reserved: 'Reserved',
     issued: 'Issued',
@@ -123,14 +136,14 @@ export const ticketWalletEn: TicketWalletTranslation = {
   },
   resume: { title: 'Complete payment for order #{{id}}', close: 'Close' },
   feedback: {
-    qrReissued: 'New QR code issued. The previous one is no longer valid.',
+    qrSwapped: 'QR code replaced. The previous one and the old code no longer work.',
     refundRequested: 'Refund requested. You will receive it through the same payment method.',
     alreadyPaid: 'Your payment was already confirmed. Tickets updated.',
     paid: 'Payment confirmed and tickets issued!',
   },
   errors: {
     qr: 'Could not generate the QR code.',
-    qrReissue: 'Could not issue a new QR code.',
+    qrSwap: 'Could not replace the QR code.',
     refund: 'Could not request the refund.',
     resume: 'Could not resume payment for this order.',
   },
@@ -158,9 +171,15 @@ export const ticketWalletFr: TicketWalletTranslation = {
   ticketCount_other: '{{count}} billets',
   actions: {
     showQr: 'Voir le QR',
-    reissueQr: 'Nouveau QR',
     transfer: 'Transférer',
   },
+  swap: {
+    action: 'Un problème avec le QR code ?',
+    title: 'Remplacer le QR code ?',
+    message:
+      'À utiliser si quelqu’un a vu ou copié votre QR code. Le QR et le code actuels ne fonctionnent plus, et vous ne pouvez le faire qu’une fois. Si l’entrée est hors ligne, l’ancien QR peut encore passer jusqu’à sa mise à jour : arrivez tôt et montrez votre pièce d’identité si besoin.',
+    confirm: 'Remplacer le QR code',
+  },
   ticketStatus: {
     reserved: 'Réservé',
     issued: 'Émis',
@@ -174,14 +193,14 @@ export const ticketWalletFr: TicketWalletTranslation = {
   },
   resume: { title: 'Finaliser le paiement de la commande n° {{id}}', close: 'Fermer' },
   feedback: {
-    qrReissued: 'Nouveau QR code émis. L’ancien n’est plus valable.',
+    qrSwapped: 'QR code remplacé. L’ancien et l’ancien code ne sont plus valables.',
     refundRequested: 'Remboursement demandé. Vous le recevrez par le même moyen de paiement.',
     alreadyPaid: 'Votre paiement était déjà confirmé. Billets mis à jour.',
     paid: 'Paiement confirmé et billets émis !',
   },
   errors: {
     qr: 'Impossible de générer le QR code.',
-    qrReissue: 'Impossible d’émettre un nouveau QR code.',
+    qrSwap: 'Impossible de remplacer le QR code.',
     refund: 'Impossible de demander le remboursement.',
     resume: 'Impossible de reprendre le paiement de cette commande.',
   },

VERIFICAÇÃO (obrigatória):
- `npm run typecheck`, `npx biome lint .` (0 erros; arquivos tocados sem avisos), `npm run build`;
- testes ligados aos arquivos deste prompt: `npx vitest related --run server/domain/events/services/eventAccess.ts server/domain/events/services/eventOccurrencesService.ts server/domain/ticketing/adapters/firestoreCheckInStore.ts server/domain/ticketing/adapters/firestoreOrderPaymentStore.ts server/domain/ticketing/adapters/firestoreOrderReservationStore.ts server/domain/ticketing/adapters/firestoreRefundStore.ts server/domain/ticketing/adapters/firestoreTicketStore.ts server/domain/ticketing/adapters/firestoreTicketingAdapter.test.ts server/domain/ticketing/adapters/firestoreTicketingAdapter.ts server/domain/ticketing/controllers/ticketingController.ts server/domain/ticketing/dtos/ticketingPersistenceMappers.ts server/domain/ticketing/index.ts server/domain/ticketing/ports/ticketingPort.ts server/domain/ticketing/routes/ticketingRoutes.ts server/domain/ticketing/services/checkInService.test.ts server/domain/ticketing/services/checkInService.ts server/domain/ticketing/services/offlineCheckInService.test.ts server/domain/ticketing/services/offlineCheckInService.ts server/domain/ticketing/services/ticketingServices.test.ts server/domain/ticketing/types/ticketingTypes.ts server/domain/ticketing/usecases/listOfflineCheckInChangesUseCase.ts server/domain/ticketing/usecases/swapTicketQrUseCase.ts src/domain/admin/components/subcomponents/AdminEditorEventFields.tsx src/domain/events/application/usecases/saveEventSessionsUseCase.ts src/domain/events/components/EventSessionsField.test.tsx src/domain/events/components/EventSessionsField.tsx src/domain/events/types/eventSession.ts src/domain/events/utils/eventSessions.test.ts src/domain/events/utils/eventSessions.ts src/domain/events/utils/eventSessionsSalesEnd.test.ts src/domain/partners/hooks/usePartnerEventSessions.ts src/domain/ticketing/adapters/httpTicketingAdapter.ts src/domain/ticketing/application/usecases/listOfflineCheckInChangesUseCase.ts src/domain/ticketing/application/usecases/swapTicketQrUseCase.ts src/domain/ticketing/components/UserTicketsHistoryView.tsx src/domain/ticketing/components/wallet/WalletTicketCard.tsx src/domain/ticketing/hooks/useOfflineTicketSession.ts src/domain/ticketing/hooks/useTicketWalletActions.ts src/domain/ticketing/hooks/useUserTickets.ts src/domain/ticketing/index.ts src/domain/ticketing/ports/ticketingPort.ts src/domain/ticketing/types/ticketing.ts src/domain/ticketing/utils/offlineCheckInStorage.test.ts src/domain/ticketing/utils/offlineCheckInStorage.ts src/domain/ticketing/utils/offlineTicketVerifier.test.ts src/domain/ticketing/utils/offlineTicketVerifier.ts src/shared/i18n/eventSessionsResources.ts src/shared/i18n/resources.ts src/shared/i18n/ticketGateResources.ts src/shared/i18n/ticketWalletResources.ts` (todos verdes). Não precisa rodar a suíte inteira.

ENTREGA: responda no formato do AGENTS.md §16.3.

LIMPEZA (obrigatória, ao terminar de implementar): apague todos os arquivos de public/assets/aistudio/, inclusive o deste prompt. São cópias dos textos colados no chat, salvas automaticamente pelo AI Studio, e public/ vai para o site publicado. Se a pasta ficar vazia, apague a pasta também.
~~~~

### Configurações manuais (você faz, fora do AI Studio, depois de aplicar este prompt)

1. Publique os índices do Firestore: `firebase deploy --only firestore:indexes` (índice novo em `tickets`). Espere o índice ficar pronto antes de testar a portaria.
