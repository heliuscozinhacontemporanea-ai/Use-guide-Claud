# Prompt 18.4d.3b — Reagendamento (D16)

> Lote 17, gerado do commit de referência `d2f73d8` da branch `claude/agents-md-v2`. Aplique depois do 18.4d.3a. Cole o bloco abaixo no agente do AI Studio, inteiro, de uma vez.

---

## Prompt 18.4d.3b — Reagendamento (D16)

Última parte do 18.4d (backend e as regras de prévia do reembolso no app). As telas vêm no 18.4e e no 18.4f.

~~~~text
Siga o AGENTS.md. NÃO altere o AGENTS.md. O app ainda não foi liberado para usuários: nenhum código de compatibilidade ou transição (§2.2 item 8).

IMPORTANTE: aplique os diffs abaixo EXATAMENTE, inclusive os arquivos novos. Não reescreva os arquivos do seu jeito. Arquivo tocado sai sem avisos do lint e formatado (AGENTS.md §13). Nenhuma dependência nova.

DECISÃO D16 item 4A (docs/arquitetura/decisoes.md): o ingresso ou a reserva vale na nova data; o comprador pode pedir reembolso integral, inclusive a taxa de serviço, em até 7 dias depois do aviso; sem resposta, vale a nova data. Reagendar não gera multa.

O QUE MUDA:
1) Regra pura (server/shared/kernel/cancellationPolicy.ts e a cópia em src/shared/utils/cancellationPolicy.ts, com teste de paridade): calculateBuyerRefund aceita rescheduledAt; até 7 dias depois do aviso e antes da nova data, devolve tudo, com a taxa de serviço (motivo reschedule). Constante RESCHEDULE_REFUND_DAYS = 7.
2) Ingressos: adiar a sessão passa a levar SEMPRE os pedidos para a nova sessão (o parâmetro moveExistingOrders sai; a tela nunca o enviava, e os ingressos ficavam na sessão antiga), inclusive os com reembolso parcial, e grava rescheduledAt no pedido. O reembolso pedido pelo comprador usa esse aviso. O aviso ao comprador diz que o ingresso vale na nova data e que ele tem 7 dias para pedir o reembolso integral.
3) Reservas: nova rota POST /api/partners/offers/:offerId/slots/:slotId/reschedule (dono da oferta, token com checkRevoked; corpo startsAt, endsAt opcional e reason). O horário muda e as reservas ativas vão junto, na mesma transação, com rescheduledAt; o cancelamento pelo comprador usa esse aviso. A resposta da reserva ganha rescheduledAt, e a prévia do reembolso no app também.
4) Repasse: PayoutService.reschedule move serviceEndsAt e releaseAt (48 h depois do fim na nova data) das vendas reagendadas, para o dinheiro não sair antes do serviço.
5) Divisão de arquivo (AGENTS.md §13): firestoreBookingsAdapter.ts tinha 421 linhas; os horários foram para firestoreSlotStore.ts e o que os dois usam, para firestoreBookingsShared.ts, sem mudar comportamento.

ARQUIVOS (crie, altere ou apague exatamente estes):
- server/application/usecases/bookings/bookingApplicationUseCases.test.ts (alterar)
- server/application/usecases/bookings/rescheduleSlotByPartnerApplicationUseCase.ts (criar)
- server/application/usecases/eventLifecycleOrchestration.test.ts (alterar)
- server/application/usecases/postponeEventOccurrenceAndNotifyApplicationUseCase.ts (alterar)
- server/domain/bookings/adapters/firestoreBookingsAdapter.ts (alterar)
- server/domain/bookings/adapters/firestoreBookingsShared.ts (criar)
- server/domain/bookings/adapters/firestoreSlotStore.ts (criar)
- server/domain/bookings/adapters/inMemoryBookingsAdapter.ts (alterar)
- server/domain/bookings/index.ts (alterar)
- server/domain/bookings/ports/bookingsPort.ts (alterar)
- server/domain/bookings/services/bookingService.test.ts (alterar)
- server/domain/bookings/services/bookingService.ts (alterar)
- server/domain/bookings/services/offerService.test.ts (alterar)
- server/domain/bookings/services/offerService.ts (alterar)
- server/domain/bookings/types/bookingTypes.ts (alterar)
- server/domain/bookings/usecases/rescheduleSlotByPartnerUseCase.ts (criar)
- server/domain/events/controllers/eventsController.ts (alterar)
- server/domain/partners/controllers/partnerContentController.ts (alterar)
- server/domain/payment/index.ts (alterar)
- server/domain/payment/services/payoutService.test.ts (alterar)
- server/domain/payment/services/payoutService.ts (alterar)
- server/domain/payment/usecases/reschedulePayoutUseCase.ts (criar)
- server/domain/ticketing/adapters/firestoreTicketStore.ts (alterar)
- server/domain/ticketing/dtos/ticketingPersistenceMappers.ts (alterar)
- server/domain/ticketing/services/ticketRefundService.ts (alterar)
- server/domain/ticketing/types/ticketingTypes.ts (alterar)
- server/interfaces/http/bookings/bookingResponses.ts (alterar)
- server/interfaces/http/bookings/bookingsRoutes.ts (alterar)
- server/interfaces/http/bookings/partnerOffersController.ts (alterar)
- server/interfaces/http/bookings/schemas/bookingSchemas.ts (alterar)
- server/shared/kernel/cancellationPolicy.parity.test.ts (alterar)
- server/shared/kernel/cancellationPolicy.test.ts (alterar)
- server/shared/kernel/cancellationPolicy.ts (alterar)
- src/domain/bookings/components/buyer/buyerComponents.test.tsx (alterar)
- src/domain/bookings/types/bookings.ts (alterar)
- src/domain/bookings/utils/refundPreview.ts (alterar)
- src/domain/ticketing/types/ticketing.ts (alterar)
- src/domain/ticketing/utils/ticketWalletRules.ts (alterar)
- src/shared/utils/cancellationPolicy.ts (alterar)

Aplique as mudanças abaixo EXATAMENTE como estão (formato unified diff: linhas com "-" saem, linhas com "+" entram; as demais são contexto para localizar o trecho). Não reformate outros trechos dos arquivos.

=== server/application/usecases/bookings/bookingApplicationUseCases.test.ts — diff ===
@@ -9,11 +9,13 @@ vi.mock('../../../domain/bookings', async () => {
     requestCancellationByBuyerUseCase: vi.fn(),
     cancelSlotByPartnerUseCase: vi.fn(),
     cancelBookingForCanceledSlotUseCase: vi.fn(),
+    rescheduleSlotByPartnerUseCase: vi.fn(),
   };
 });
 vi.mock('../../../domain/payment', () => ({
   createMarketplacePaymentIntentUseCase: vi.fn(),
   processProviderRefundUseCase: vi.fn().mockResolvedValue({}),
+  reschedulePayoutUseCase: vi.fn().mockResolvedValue(null),
 }));
 vi.mock('../payouts/chargeCancellationPenaltyApplicationUseCase', () => ({
   chargeCancellationPenaltyApplicationUseCase: vi.fn().mockResolvedValue(0),
@@ -27,14 +29,17 @@ import {
   cancelSlotByPartnerUseCase,
   createPendingBookingUseCase,
   requestCancellationByBuyerUseCase,
+  rescheduleSlotByPartnerUseCase,
 } from '../../../domain/bookings';
 import {
   createMarketplacePaymentIntentUseCase,
   processProviderRefundUseCase,
+  reschedulePayoutUseCase,
 } from '../../../domain/payment';
 import { cancelBookingByBuyerApplicationUseCase } from './cancelBookingByBuyerApplicationUseCase';
 import { cancelSlotByPartnerApplicationUseCase } from './cancelSlotByPartnerApplicationUseCase';
 import { createBookingApplicationUseCase } from './createBookingApplicationUseCase';
+import { rescheduleSlotByPartnerApplicationUseCase } from './rescheduleSlotByPartnerApplicationUseCase';
 import { isPartnerSuspended } from '../isPartnerSuspended';
 import { chargeCancellationPenaltyApplicationUseCase } from '../payouts/chargeCancellationPenaltyApplicationUseCase';
 import { assertListingCanSellUseCase } from '../../../domain/partners';
@@ -237,3 +242,32 @@ describe('cancelSlotByPartnerApplicationUseCase', () => {
     expect(chargeCancellationPenaltyApplicationUseCase).not.toHaveBeenCalled();
   });
 });
+
+describe('rescheduleSlotByPartnerApplicationUseCase (D16 4A)', () => {
+  beforeEach(() => vi.clearAllMocks());
+
+  it('o repasse das reservas pagas acompanha a nova data, sem multa', async () => {
+    vi.mocked(rescheduleSlotByPartnerUseCase).mockResolvedValue([
+      {
+        id: 'bk_1',
+        status: 'confirmed',
+        offerSnapshot: { startsAt: '2026-11-12T11:00:00.000Z', durationMinutes: 120 },
+      },
+      { id: 'bk_2', status: 'pending_payment', offerSnapshot: { startsAt: 'x' } },
+    ] as never);
+    const result = await rescheduleSlotByPartnerApplicationUseCase(
+      { uid: 'p1', admin: false },
+      'offer-1',
+      'slot-1',
+      { startsAt: '2026-11-12T11:00:00.000Z', reason: 'Mar agitado' }
+    );
+    expect(result).toEqual({ rescheduledBookings: 2 });
+    expect(reschedulePayoutUseCase).toHaveBeenCalledTimes(1);
+    expect(reschedulePayoutUseCase).toHaveBeenCalledWith(
+      'booking',
+      'bk_1',
+      '2026-11-12T13:00:00.000Z'
+    );
+    expect(chargeCancellationPenaltyApplicationUseCase).not.toHaveBeenCalled();
+  });
+});

=== server/application/usecases/bookings/rescheduleSlotByPartnerApplicationUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { type BookingActor, rescheduleSlotByPartnerUseCase } from '../../../domain/bookings';
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
    const endsAt = new Date(
      new Date(booking.offerSnapshot.startsAt).getTime() +
        (booking.offerSnapshot.durationMinutes ?? 0) * 60_000
    ).toISOString();
    await reschedulePayoutUseCase('booking', booking.id, endsAt);
  }
  // TODO: avisar os compradores quando notifications aceitar destinatário usuário (débito B13).
  return { rescheduledBookings: moved.length };
}

=== server/application/usecases/eventLifecycleOrchestration.test.ts — diff ===
@@ -9,6 +9,7 @@ import {
   type EventOccurrence,
 } from '../../domain/events';
 import { createNotificationUseCase } from '../../domain/notifications';
+import { reschedulePayoutUseCase } from '../../domain/payment';
 import {
   listEventOrdersForPartnerOrAdminUseCase,
   moveOrderToOccurrenceUseCase,
@@ -38,6 +39,10 @@ vi.mock('../../domain/ticketing', () => ({
   moveOrderToOccurrenceUseCase: vi.fn(),
 }));
 
+vi.mock('../../domain/payment', () => ({
+  reschedulePayoutUseCase: vi.fn().mockResolvedValue(null),
+}));
+
 vi.mock('./payouts/chargeCancellationPenaltyApplicationUseCase', () => ({
   chargeCancellationPenaltyApplicationUseCase: vi.fn().mockResolvedValue(0),
 }));
@@ -142,7 +147,7 @@ describe('eventLifecycleOrchestrationUseCases', () => {
     );
   });
 
-  it('postpones an occurrence, moves orders when requested, and notifies buyers', async () => {
+  it('reagenda: leva os pedidos, move o repasse para a nova data e avisa o prazo de 7 dias (D16)', async () => {
     const newOccurrence: EventOccurrence = {
       ...sampleOccurrence,
       id: 'occ-2',
@@ -167,23 +172,34 @@ describe('eventLifecycleOrchestrationUseCases', () => {
       id: 'ev-1',
       title: 'Festival de Verão',
     } as EventListing);
-    vi.mocked(listEventOrdersForPartnerOrAdminUseCase).mockResolvedValue([samplePaidOrder]);
+    vi.mocked(listEventOrdersForPartnerOrAdminUseCase).mockResolvedValue([
+      { ...samplePaidOrder, occurrenceId: 'occ-2' },
+    ]);
 
     const res = await postponeEventOccurrenceAndNotifyApplicationUseCase(actor, 'occ-1', {
       startsAt: '2026-09-17T20:00:00.000Z',
       endsAt: '2026-09-17T23:59:00.000Z',
       reason: 'Mudança de palco',
-      moveExistingOrders: true,
     });
 
     expect(res.postponedOccurrence.status).toBe('postponed');
     expect(res.newOccurrence.id).toBe('occ-2');
     expect(res.movedOrdersCount).toBe(1);
     expect(res.movedTicketsCount).toBe(2);
+    expect(moveOrderToOccurrenceUseCase).toHaveBeenCalledWith(actor, {
+      fromOccurrenceId: 'occ-1',
+      toOccurrenceId: 'occ-2',
+    });
+    expect(reschedulePayoutUseCase).toHaveBeenCalledWith(
+      'ticket_order',
+      'ord-1',
+      '2026-09-17T23:59:00.000Z'
+    );
     expect(createNotificationUseCase).toHaveBeenCalledWith(
       expect.objectContaining({
         recipientPartnerId: 'buyer-1',
         title: 'Evento reagendado',
+        message: expect.stringContaining('7 dias'),
       })
     );
   });

=== server/application/usecases/postponeEventOccurrenceAndNotifyApplicationUseCase.ts — ARQUIVO REESCRITO, substitua todo o conteúdo por este ===
import {
  type EventOccurrence,
  getEventListingByIdUseCase,
  postponeEventOccurrenceUseCase,
} from '../../domain/events';
import { createNotificationUseCase } from '../../domain/notifications';
import { reschedulePayoutUseCase } from '../../domain/payment';
import {
  listEventOrdersForPartnerOrAdminUseCase,
  moveOrderToOccurrenceUseCase,
  type TicketingActorContext,
} from '../../domain/ticketing';

/**
 * Reagendamento (D16, 4A): os ingressos valem na nova data, o repasse acompanha a nova data e o
 * comprador tem 7 dias depois do aviso para pedir reembolso integral, inclusive a taxa de serviço.
 */
export async function postponeEventOccurrenceAndNotifyApplicationUseCase(
  actor: TicketingActorContext,
  occurrenceId: string,
  replacement: {
    startsAt: string;
    endsAt: string;
    salesStartsAt?: string;
    salesEndsAt?: string;
    reason: string;
  }
): Promise<{
  postponedOccurrence: EventOccurrence;
  newOccurrence: EventOccurrence;
  movedOrdersCount: number;
  movedTicketsCount: number;
}> {
  const { postponedOccurrence, newOccurrence } = await postponeEventOccurrenceUseCase(
    actor,
    occurrenceId,
    replacement
  );
  const { movedOrdersCount, movedTicketsCount } = await moveOrderToOccurrenceUseCase(actor, {
    fromOccurrenceId: postponedOccurrence.id,
    toOccurrenceId: newOccurrence.id,
  });

  const listing = await getEventListingByIdUseCase(postponedOccurrence.eventListingId);
  const allOrders = await listEventOrdersForPartnerOrAdminUseCase(
    actor,
    postponedOccurrence.eventListingId
  );
  const affectedOrders = allOrders.filter(
    (order) =>
      order.occurrenceId === newOccurrence.id &&
      (order.status === 'paid' || order.status === 'partially_refunded')
  );

  for (const order of affectedOrders) {
    await reschedulePayoutUseCase('ticket_order', order.id, newOccurrence.endsAt);
    await createNotificationUseCase({
      recipientPartnerId: order.buyerId,
      type: 'admin_message',
      title: 'Evento reagendado',
      message: `A sessão do evento "${listing?.title || 'Evento'}" foi reagendada para ${new Date(newOccurrence.startsAt).toLocaleString('pt-BR', { timeZone: 'America/Fortaleza' })}. Seu ingresso vale na nova data. Se não puder ir, peça o reembolso integral em até 7 dias.`,
      relatedItemId: postponedOccurrence.eventListingId,
      relatedItemCollection: 'events',
    }).catch(() => {});
  }

  return { postponedOccurrence, newOccurrence, movedOrdersCount, movedTicketsCount };
}

=== server/domain/bookings/adapters/firestoreBookingsAdapter.ts — diff ===
@@ -1,4 +1,4 @@
-import type { Query, Transaction } from 'firebase-admin/firestore';
+import type { Query } from 'firebase-admin/firestore';
 import { adminDb } from '../../../infrastructure/firebase/adminClient';
 import {
   BookingPersistenceMapper,
@@ -9,8 +9,6 @@ import {
 import { BookingDomainError } from '../errors/bookingDomainError';
 import type { BookingsPort, PageRequest } from '../ports/bookingsPort';
 import {
-  type AvailabilitySlot,
-  type AvailabilitySlotStatus,
   type BookableOffer,
   type Booking,
   type BookingCancellation,
@@ -20,50 +18,20 @@ import {
   type Page,
   type PublicBookableOffer,
 } from '../types/bookingTypes';
-
-const OFFERS = 'bookableOffers';
-const PUBLIC_OFFERS = 'publicBookableOffers';
-const SLOTS = 'availabilitySlots';
-const BOOKINGS = 'bookings';
-const PARTICIPANTS = 'bookingParticipants';
-const AUDIT = 'bookingAuditLogs';
-
-function nowIso(): string {
-  return new Date().toISOString();
-}
-
-function writeAudit(
-  tx: Transaction,
-  entry: {
-    bookingId: string;
-    from: BookingStatus | null;
-    to: BookingStatus | null;
-    actorUid: string;
-    reason: string;
-  }
-): void {
-  tx.set(adminDb.collection(AUDIT).doc(), { ...entry, at: nowIso() });
-}
-
-function available(slot: AvailabilitySlot): number {
-  return slot.capacityTotal - slot.capacityReserved - slot.capacitySold;
-}
-
-async function readBooking(tx: Transaction, bookingId: string): Promise<Booking> {
-  const snapshot = await tx.get(adminDb.collection(BOOKINGS).doc(bookingId));
-  if (!snapshot.exists) {
-    throw new BookingDomainError('NOT_FOUND', 'Reserva não encontrada.');
-  }
-  return BookingPersistenceMapper.toDomain(snapshot.id, snapshot.data() ?? {});
-}
-
-async function readSlot(tx: Transaction, slotId: string): Promise<AvailabilitySlot> {
-  const snapshot = await tx.get(adminDb.collection(SLOTS).doc(slotId));
-  if (!snapshot.exists) {
-    throw new BookingDomainError('NOT_FOUND', 'Horário não encontrado.');
-  }
-  return SlotPersistenceMapper.toDomain(snapshot.id, snapshot.data() ?? {});
-}
+import {
+  AUDIT,
+  available,
+  BOOKINGS,
+  nowIso,
+  OFFERS,
+  PARTICIPANTS,
+  PUBLIC_OFFERS,
+  readBooking,
+  readSlot,
+  SLOTS,
+  writeAudit,
+} from './firestoreBookingsShared';
+import { FirestoreSlotStore } from './firestoreSlotStore';
 
 async function paginate(query: Query, page: PageRequest): Promise<Page<Booking>> {
   let paged = query.limit(page.limit + 1);
@@ -80,6 +48,8 @@ async function paginate(query: Query, page: PageRequest): Promise<Page<Booking>>
 }
 
 export class FirestoreBookingsAdapter implements BookingsPort {
+  private readonly slots = new FirestoreSlotStore();
+
   async createOffer(offer: BookableOffer): Promise<void> {
     await adminDb
       .collection(OFFERS)
@@ -129,45 +99,11 @@ export class FirestoreBookingsAdapter implements BookingsPort {
     await adminDb.collection(PUBLIC_OFFERS).doc(offerId).delete();
   }
 
-  async createSlots(slots: AvailabilitySlot[]): Promise<AvailabilitySlot[]> {
-    if (slots.length === 0) return [];
-    const refs = slots.map((slot) => adminDb.collection(SLOTS).doc(slot.id));
-    return adminDb.runTransaction(async (tx) => {
-      const snapshots = await tx.getAll(...refs);
-      // set() sobre um horário existente zeraria as vagas vendidas; por isso só criamos os que faltam.
-      const created = slots.filter((_slot, index) => !snapshots[index]?.exists);
-      for (const slot of created) {
-        tx.create(
-          adminDb.collection(SLOTS).doc(slot.id),
-          SlotPersistenceMapper.toPersistence(slot)
-        );
-      }
-      return created;
-    });
-  }
-
-  async getSlot(slotId: string): Promise<AvailabilitySlot | null> {
-    const snapshot = await adminDb.collection(SLOTS).doc(slotId).get();
-    return snapshot.exists
-      ? SlotPersistenceMapper.toDomain(snapshot.id, snapshot.data() ?? {})
-      : null;
-  }
-
-  async listSlots(offerId: string, fromIso: string, toIso: string): Promise<AvailabilitySlot[]> {
-    const snapshot = await adminDb
-      .collection(SLOTS)
-      .where('offerId', '==', offerId)
-      .where('startsAt', '>=', fromIso)
-      .where('startsAt', '<=', toIso)
-      .orderBy('startsAt', 'asc')
-      .limit(500)
-      .get();
-    return snapshot.docs.map((doc) => SlotPersistenceMapper.toDomain(doc.id, doc.data()));
-  }
-
-  async setSlotStatus(slotId: string, status: AvailabilitySlotStatus): Promise<void> {
-    await adminDb.collection(SLOTS).doc(slotId).update({ status, updatedAt: nowIso() });
-  }
+  readonly createSlots = this.slots.createSlots.bind(this.slots);
+  readonly getSlot = this.slots.getSlot.bind(this.slots);
+  readonly listSlots = this.slots.listSlots.bind(this.slots);
+  readonly setSlotStatus = this.slots.setSlotStatus.bind(this.slots);
+  readonly rescheduleSlot = this.slots.rescheduleSlot.bind(this.slots);
 
   async reserveCapacityAndCreateBooking(
     booking: Booking,

=== server/domain/bookings/adapters/firestoreBookingsShared.ts — ARQUIVO NOVO, conteúdo completo ===
import type { Transaction } from 'firebase-admin/firestore';
import { adminDb } from '../../../infrastructure/firebase/adminClient';
import { BookingPersistenceMapper, SlotPersistenceMapper } from '../dtos/bookingPersistenceMappers';
import { BookingDomainError } from '../errors/bookingDomainError';
import type { AvailabilitySlot, Booking, BookingStatus } from '../types/bookingTypes';

export const OFFERS = 'bookableOffers';
export const PUBLIC_OFFERS = 'publicBookableOffers';
export const SLOTS = 'availabilitySlots';
export const BOOKINGS = 'bookings';
export const PARTICIPANTS = 'bookingParticipants';
export const AUDIT = 'bookingAuditLogs';

export function nowIso(): string {
  return new Date().toISOString();
}

export function writeAudit(
  tx: Transaction,
  entry: {
    bookingId: string;
    from: BookingStatus | null;
    to: BookingStatus | null;
    actorUid: string;
    reason: string;
  }
): void {
  tx.set(adminDb.collection(AUDIT).doc(), { ...entry, at: nowIso() });
}

export function available(slot: AvailabilitySlot): number {
  return slot.capacityTotal - slot.capacityReserved - slot.capacitySold;
}

export async function readBooking(tx: Transaction, bookingId: string): Promise<Booking> {
  const snapshot = await tx.get(adminDb.collection(BOOKINGS).doc(bookingId));
  if (!snapshot.exists) {
    throw new BookingDomainError('NOT_FOUND', 'Reserva não encontrada.');
  }
  return BookingPersistenceMapper.toDomain(snapshot.id, snapshot.data() ?? {});
}

export async function readSlot(tx: Transaction, slotId: string): Promise<AvailabilitySlot> {
  const snapshot = await tx.get(adminDb.collection(SLOTS).doc(slotId));
  if (!snapshot.exists) {
    throw new BookingDomainError('NOT_FOUND', 'Horário não encontrado.');
  }
  return SlotPersistenceMapper.toDomain(snapshot.id, snapshot.data() ?? {});
}

=== server/domain/bookings/adapters/firestoreSlotStore.ts — ARQUIVO NOVO, conteúdo completo ===
import { adminDb } from '../../../infrastructure/firebase/adminClient';
import { BookingPersistenceMapper, SlotPersistenceMapper } from '../dtos/bookingPersistenceMappers';
import { BookingDomainError } from '../errors/bookingDomainError';
import type { AvailabilitySlot, AvailabilitySlotStatus, Booking } from '../types/bookingTypes';
import { BOOKINGS, nowIso, SLOTS, writeAudit } from './firestoreBookingsShared';

/** Horários de uma oferta (`availabilitySlots`). */
export class FirestoreSlotStore {
  async createSlots(slots: AvailabilitySlot[]): Promise<AvailabilitySlot[]> {
    if (slots.length === 0) return [];
    const refs = slots.map((slot) => adminDb.collection(SLOTS).doc(slot.id));
    return adminDb.runTransaction(async (tx) => {
      const snapshots = await tx.getAll(...refs);
      // set() sobre um horário existente zeraria as vagas vendidas; por isso só criamos os que faltam.
      const created = slots.filter((_slot, index) => !snapshots[index]?.exists);
      for (const slot of created) {
        tx.create(
          adminDb.collection(SLOTS).doc(slot.id),
          SlotPersistenceMapper.toPersistence(slot)
        );
      }
      return created;
    });
  }

  async getSlot(slotId: string): Promise<AvailabilitySlot | null> {
    const snapshot = await adminDb.collection(SLOTS).doc(slotId).get();
    return snapshot.exists
      ? SlotPersistenceMapper.toDomain(snapshot.id, snapshot.data() ?? {})
      : null;
  }

  async listSlots(offerId: string, fromIso: string, toIso: string): Promise<AvailabilitySlot[]> {
    const snapshot = await adminDb
      .collection(SLOTS)
      .where('offerId', '==', offerId)
      .where('startsAt', '>=', fromIso)
      .where('startsAt', '<=', toIso)
      .orderBy('startsAt', 'asc')
      .limit(500)
      .get();
    return snapshot.docs.map((doc) => SlotPersistenceMapper.toDomain(doc.id, doc.data()));
  }

  async setSlotStatus(slotId: string, status: AvailabilitySlotStatus): Promise<void> {
    await adminDb.collection(SLOTS).doc(slotId).update({ status, updatedAt: nowIso() });
  }

  async rescheduleSlot(params: {
    slotId: string;
    startsAt: string;
    endsAt?: string;
    actorUid: string;
    reason: string;
  }): Promise<Booking[]> {
    const slotRef = adminDb.collection(SLOTS).doc(params.slotId);
    return adminDb.runTransaction(async (tx) => {
      const slotSnapshot = await tx.get(slotRef);
      if (!slotSnapshot.exists) {
        throw new BookingDomainError('NOT_FOUND', 'Horário não encontrado.');
      }
      const bookingsSnapshot = await tx.get(
        adminDb.collection(BOOKINGS).where('slotId', '==', params.slotId).limit(500)
      );
      const at = nowIso();
      tx.update(slotRef, {
        startsAt: params.startsAt,
        endsAt: params.endsAt ?? null,
        updatedAt: at,
      });
      const moved: Booking[] = [];
      for (const doc of bookingsSnapshot.docs) {
        const booking = BookingPersistenceMapper.toDomain(doc.id, doc.data());
        if (booking.status !== 'confirmed' && booking.status !== 'pending_payment') continue;
        const updated: Booking = {
          ...booking,
          offerSnapshot: { ...booking.offerSnapshot, startsAt: params.startsAt },
          rescheduledAt: at,
          updatedAt: at,
        };
        tx.update(doc.ref, {
          'offerSnapshot.startsAt': params.startsAt,
          rescheduledAt: at,
          updatedAt: at,
        });
        writeAudit(tx, {
          bookingId: booking.id,
          from: booking.status,
          to: booking.status,
          actorUid: params.actorUid,
          reason: params.reason,
        });
        moved.push(updated);
      }
      return moved;
    });
  }
}

=== server/domain/bookings/adapters/inMemoryBookingsAdapter.ts — diff ===
@@ -65,6 +65,38 @@ export class InMemoryBookingsAdapter implements BookingsPort {
     if (slot) slot.status = status;
   }
 
+  async rescheduleSlot(params: {
+    slotId: string;
+    startsAt: string;
+    endsAt?: string;
+    actorUid: string;
+    reason: string;
+  }): Promise<Booking[]> {
+    const slot = this.slots.get(params.slotId);
+    if (!slot) throw new BookingDomainError('NOT_FOUND', 'Horário não encontrado.');
+    const at = new Date().toISOString();
+    this.slots.set(slot.id, {
+      ...slot,
+      startsAt: params.startsAt,
+      endsAt: params.endsAt,
+      updatedAt: at,
+    });
+    const moved: Booking[] = [];
+    for (const booking of this.bookings.values()) {
+      if (booking.slotId !== slot.id) continue;
+      if (booking.status !== 'confirmed' && booking.status !== 'pending_payment') continue;
+      const updated: Booking = {
+        ...booking,
+        offerSnapshot: { ...booking.offerSnapshot, startsAt: params.startsAt },
+        rescheduledAt: at,
+        updatedAt: at,
+      };
+      this.bookings.set(booking.id, updated);
+      moved.push(updated);
+    }
+    return moved;
+  }
+
   private available(slot: AvailabilitySlot) {
     return slot.capacityTotal - slot.capacityReserved - slot.capacitySold;
   }

=== server/domain/bookings/index.ts — diff ===
@@ -19,6 +19,7 @@ export { markBookingDisputedUseCase } from './usecases/markBookingDisputedUseCas
 export { markBookingNoShowUseCase } from './usecases/markBookingNoShowUseCase';
 export { markBookingPaymentFailedUseCase } from './usecases/markBookingPaymentFailedUseCase';
 export { markBookingRefundedUseCase } from './usecases/markBookingRefundedUseCase';
+export { rescheduleSlotByPartnerUseCase } from './usecases/rescheduleSlotByPartnerUseCase';
 export { requestCancellationByBuyerUseCase } from './usecases/requestCancellationByBuyerUseCase';
 export { setBookableOfferStatusUseCase } from './usecases/setBookableOfferStatusUseCase';
 export { updateBookableOfferUseCase } from './usecases/updateBookableOfferUseCase';

=== server/domain/bookings/ports/bookingsPort.ts — diff ===
@@ -33,6 +33,14 @@ export interface BookingsPort {
   getSlot(slotId: string): Promise<AvailabilitySlot | null>;
   listSlots(offerId: string, fromIso: string, toIso: string): Promise<AvailabilitySlot[]>;
   setSlotStatus(slotId: string, status: AvailabilitySlotStatus): Promise<void>;
+  /** Muda o horário e leva as reservas ativas junto, na mesma transação; devolve as reservas movidas. */
+  rescheduleSlot(params: {
+    slotId: string;
+    startsAt: string;
+    endsAt?: string;
+    actorUid: string;
+    reason: string;
+  }): Promise<Booking[]>;
 
   /** Idempotente pelo ID da reserva; lança INSUFFICIENT_CAPACITY ou SLOT_UNAVAILABLE. */
   reserveCapacityAndCreateBooking(

=== server/domain/bookings/services/bookingService.test.ts — diff ===
@@ -188,6 +188,21 @@ describe('BookingService', () => {
     });
   });
 
+  it('reagendada pelo parceiro: até 7 dias depois do aviso devolve tudo, mesmo fora da política (D16)', async () => {
+    const { service, port, setNow } = setup();
+    const booking = await service.createPendingBooking(BUYER, INPUT, FEES);
+    await service.confirmBookingPayment(booking.id, 'pi_1');
+    const confirmed = port.bookings.get(booking.id);
+    if (confirmed) {
+      port.bookings.set(booking.id, { ...confirmed, rescheduledAt: '2026-11-08T00:00:00.000Z' });
+    }
+    setNow('2026-11-09T12:00:00.000Z');
+    await expect(service.requestCancellationByBuyer(BUYER, booking.id, '')).resolves.toMatchObject({
+      refundPercent: 100,
+      refundAmountMinor: 20000,
+    });
+  });
+
   it('reserva pendente não pode ser cancelada pelo comprador', async () => {
     const { service } = setup();
     const booking = await service.createPendingBooking(BUYER, INPUT, FEES);

=== server/domain/bookings/services/bookingService.ts — diff ===
@@ -187,7 +187,7 @@ export class BookingService {
       );
     }
     const nowDate = this.now();
-    // D14: arrependimento de 7 dias até 48 h antes do início, senão a política gravada na compra.
+    // D14: arrependimento de 7 dias até 48 h antes do início; D16: 7 dias depois do reagendamento; senão a política.
     const calculated = calculateBuyerRefund({
       family: cancellationFamilyOf(booking.kind),
       policy: booking.offerSnapshot.cancellationPolicy,
@@ -196,6 +196,7 @@ export class BookingService {
       now: nowDate,
       paidMinor: booking.totalMinor,
       serviceFeeMinor: 0,
+      rescheduledAt: booking.rescheduledAt,
     });
     const refund = {
       refundPercent: calculated.percent,

=== server/domain/bookings/services/offerService.test.ts — diff ===
@@ -229,4 +229,69 @@ describe('OfferService', () => {
       hasAvailability: true,
     });
   });
+
+  describe('reagendamento de horário (D16 4A)', () => {
+    function seeded() {
+      const ctx = setup();
+      ctx.port.offers.set('offer-1', {
+        id: 'offer-1',
+        ownerId: 'partner-1',
+        partnerId: 'partner-1',
+      } as never);
+      ctx.port.slots.set('slot-1', {
+        id: 'slot-1',
+        offerId: 'offer-1',
+        startsAt: '2026-11-10T11:00:00.000Z',
+        capacityTotal: 4,
+        capacityReserved: 0,
+        capacitySold: 2,
+        status: 'open',
+        createdAt: '',
+        updatedAt: '',
+      });
+      for (const [id, status] of [
+        ['bk-1', 'confirmed'],
+        ['bk-2', 'canceled'],
+      ] as const) {
+        ctx.port.bookings.set(id, {
+          id,
+          slotId: 'slot-1',
+          status,
+          offerSnapshot: { title: 'Passeio', startsAt: '2026-11-10T11:00:00.000Z' },
+        } as never);
+      }
+      return ctx;
+    }
+    const CHANGE = { startsAt: '2026-11-12T11:00:00.000Z', reason: 'Mar agitado' };
+
+    it('as reservas ativas valem na nova data, com a data do aviso', async () => {
+      const { service, port } = seeded();
+      const moved = await service.rescheduleSlot(OWNER, 'offer-1', 'slot-1', CHANGE);
+      expect(moved.map((booking) => booking.id)).toEqual(['bk-1']);
+      expect(port.slots.get('slot-1')?.startsAt).toBe(CHANGE.startsAt);
+      expect(port.bookings.get('bk-1')).toMatchObject({
+        offerSnapshot: { startsAt: CHANGE.startsAt },
+        rescheduledAt: expect.any(String),
+      });
+      expect(port.bookings.get('bk-2')?.offerSnapshot.startsAt).toBe('2026-11-10T11:00:00.000Z');
+    });
+
+    it('data passada, horário cancelado ou oferta de outro parceiro são recusados', async () => {
+      const { service, port } = seeded();
+      await expect(
+        service.rescheduleSlot(OWNER, 'offer-1', 'slot-1', {
+          ...CHANGE,
+          startsAt: '2026-10-30T11:00:00.000Z',
+        })
+      ).rejects.toMatchObject({ code: 'VALIDATION_ERROR' });
+      await expect(
+        service.rescheduleSlot({ uid: 'outro', admin: false }, 'offer-1', 'slot-1', CHANGE)
+      ).rejects.toMatchObject({ code: 'NOT_FOUND' });
+      const slot = port.slots.get('slot-1');
+      if (slot) port.slots.set('slot-1', { ...slot, status: 'canceled' });
+      await expect(
+        service.rescheduleSlot(OWNER, 'offer-1', 'slot-1', CHANGE)
+      ).rejects.toMatchObject({ code: 'SLOT_UNAVAILABLE' });
+    });
+  });
 });

=== server/domain/bookings/services/offerService.ts — diff ===
@@ -307,6 +307,42 @@ export class OfferService {
     );
   }
 
+  /**
+   * Reagendamento pelo parceiro (D16, 4A): o horário muda e as reservas ativas valem na nova data.
+   * Horário cancelado não volta; a nova data precisa ser futura.
+   */
+  async rescheduleSlot(
+    actor: BookingActor,
+    offerId: string,
+    slotId: string,
+    change: { startsAt: string; endsAt?: string; reason: string }
+  ): Promise<Booking[]> {
+    await this.getOwnedOffer(actor, offerId);
+    const slot = await this.port.getSlot(slotId);
+    if (slot?.offerId !== offerId) {
+      throw new BookingDomainError('NOT_FOUND', 'Horário não encontrado.');
+    }
+    if (slot.status === 'canceled') {
+      throw new BookingDomainError('SLOT_UNAVAILABLE', 'Horário cancelado não pode ser remarcado.');
+    }
+    const startsAt = new Date(change.startsAt);
+    const endsAt = change.endsAt ? new Date(change.endsAt) : null;
+    if (
+      Number.isNaN(startsAt.getTime()) ||
+      startsAt.getTime() <= this.now().getTime() ||
+      (endsAt && !(endsAt.getTime() > startsAt.getTime()))
+    ) {
+      throw new BookingDomainError('VALIDATION_ERROR', 'Informe uma nova data futura.');
+    }
+    return this.port.rescheduleSlot({
+      slotId,
+      startsAt: startsAt.toISOString(),
+      ...(endsAt ? { endsAt: endsAt.toISOString() } : {}),
+      actorUid: actor.uid,
+      reason: change.reason.slice(0, 300),
+    });
+  }
+
   /** Visão do parceiro: inclui vagas reservadas e vendidas e horários fechados ou cancelados. */
   async listOfferSlotsForOwner(
     actor: BookingActor,

=== server/domain/bookings/types/bookingTypes.ts — diff ===
@@ -122,6 +122,8 @@ export interface Booking {
     meetingPoint?: string;
     cancellationPolicy: BookingCancellationPolicy;
   };
+  /** Aviso de nova data pelo parceiro: até 7 dias depois, o comprador cancela com reembolso integral (D16, 4A). */
+  rescheduledAt?: string;
   /** Gravado ao cancelar: torna o cancelamento repetível sem recalcular o reembolso. */
   cancellation?: BookingCancellation;
   /** Versão dos termos aceita na compra (D15). */

=== server/domain/bookings/usecases/rescheduleSlotByPartnerUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { getOfferService } from '../factory';
import type { Booking, BookingActor } from '../types/bookingTypes';

/** Muda o horário e devolve as reservas ativas movidas; repasse e avisos são da camada application. */
export async function rescheduleSlotByPartnerUseCase(
  actor: BookingActor,
  offerId: string,
  slotId: string,
  change: { startsAt: string; endsAt?: string; reason: string }
): Promise<Booking[]> {
  return getOfferService().rescheduleSlot(actor, offerId, slotId, change);
}

=== server/domain/events/controllers/eventsController.ts — diff ===
@@ -158,11 +158,7 @@ export class EventsController {
       if (!req.user) return res.status(401).json({ error: 'Não autenticado.' });
       const id = String(req.params.id ?? '');
       const reason = typeof req.body?.reason === 'string' ? req.body.reason : undefined;
-      const result = await cancelEventListingAndRefundApplicationUseCase(
-        getActor(req),
-        id,
-        reason
-      );
+      const result = await cancelEventListingAndRefundApplicationUseCase(getActor(req), id, reason);
       return res.status(200).json({ status: 'success', data: result });
     } catch (error) {
       return handleEventError(res, error);
@@ -246,7 +242,6 @@ export class EventsController {
       const startsAt = String(req.body?.startsAt ?? '');
       const endsAt = String(req.body?.endsAt ?? '');
       const reason = String(req.body?.reason ?? 'Evento adiado.');
-      const moveExistingOrders = req.body?.moveExistingOrders === true;
       const result = await postponeEventOccurrenceAndNotifyApplicationUseCase(
         getActor(req),
         occurrenceId,
@@ -256,7 +251,6 @@ export class EventsController {
           salesStartsAt: req.body?.salesStartsAt,
           salesEndsAt: req.body?.salesEndsAt,
           reason,
-          moveExistingOrders,
         }
       );
       return res.status(200).json({ status: 'success', data: result });

=== server/domain/partners/controllers/partnerContentController.ts — diff ===
@@ -255,14 +255,12 @@ export class PartnerContentController {
       const startsAt = String(req.body?.startsAt ?? '');
       const endsAt = String(req.body?.endsAt ?? '');
       const reason = String(req.body?.reason ?? 'Evento adiado pelo parceiro.');
-      const moveExistingOrders = req.body?.moveExistingOrders === true;
       const result = await postponeEventOccurrenceAndNotifyApplicationUseCase(user, occurrenceId, {
         startsAt,
         endsAt,
         salesStartsAt: req.body?.salesStartsAt,
         salesEndsAt: req.body?.salesEndsAt,
         reason,
-        moveExistingOrders,
       });
       return res.status(200).json({ status: 'success', data: result });
     } catch (error: unknown) {

=== server/domain/payment/index.ts — diff ===
@@ -18,6 +18,7 @@ export { recordSalePayoutUseCase } from './usecases/recordSalePayoutUseCase';
 export { applyPayoutRefundUseCase } from './usecases/applyPayoutRefundUseCase';
 export { holdPayoutForDisputeUseCase } from './usecases/holdPayoutForDisputeUseCase';
 export { closePayoutDisputeUseCase } from './usecases/closePayoutDisputeUseCase';
+export { reschedulePayoutUseCase } from './usecases/reschedulePayoutUseCase';
 export { releaseDuePayoutsUseCase } from './usecases/releaseDuePayoutsUseCase';
 export { getPayoutEntryForReferenceUseCase } from './usecases/getPayoutEntryForReferenceUseCase';
 export { createAccountDebtUseCase } from './usecases/createAccountDebtUseCase';

=== server/domain/payment/services/payoutService.test.ts — diff ===
@@ -194,4 +194,15 @@ describe('PayoutService (D14)', () => {
     expect(transfers.createTransfer).not.toHaveBeenCalled();
     expect(repo.rows.get('po_ticket_order_ord_1')?.offsetMinor).toBe(9000);
   });
+
+  it('reagendamento move o prazo do repasse para 48 h depois da nova data (D16)', async () => {
+    const { service, repo } = setup();
+    await service.recordSale(SALE);
+    await service.reschedule('ticket_order', 'ord_1', '2026-12-28T03:00:00.000Z');
+    expect(repo.rows.get('po_ticket_order_ord_1')).toMatchObject({
+      serviceEndsAt: '2026-12-28T03:00:00.000Z',
+      releaseAt: '2026-12-30T03:00:00.000Z',
+    });
+    expect((await service.releaseDue()).released).toBe(0);
+  });
 });

=== server/domain/payment/services/payoutService.ts — diff ===
@@ -136,6 +136,24 @@ export class PayoutService {
     return updated;
   }
 
+  /** Venda reagendada (D16, 4A): o repasse passa a sair 48 h depois do fim na nova data. */
+  async reschedule(
+    referenceType: string,
+    referenceId: string,
+    serviceEndsAt: string
+  ): Promise<PayoutEntry | null> {
+    return this.entries.update(entryIdFor(referenceType, referenceId), (current) =>
+      current.status === 'pending' || current.status === 'on_hold'
+        ? {
+            ...current,
+            serviceEndsAt,
+            releaseAt: computeReleaseAt(serviceEndsAt),
+            updatedAt: this.now().toISOString(),
+          }
+        : null
+    );
+  }
+
   /** Contestação aberta: o repasse espera a decisão (D14). */
   async holdForDispute(paymentIntentId: string): Promise<PayoutEntry | null> {
     const entry = await this.entries.getByPaymentIntentId(paymentIntentId);

=== server/domain/payment/usecases/reschedulePayoutUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { payoutService } from '../factory';
import type { PayoutEntry } from '../types/payoutEntry';

/** Venda reagendada: o prazo do repasse acompanha a nova data (D16, 4A). */
export function reschedulePayoutUseCase(
  referenceType: string,
  referenceId: string,
  serviceEndsAt: string
): Promise<PayoutEntry | null> {
  return payoutService.reschedule(referenceType, referenceId, serviceEndsAt);
}

=== server/domain/ticketing/adapters/firestoreTicketStore.ts — diff ===
@@ -202,9 +202,14 @@ export class FirestoreTicketStore {
           orderDoc.id,
           (orderDoc.data() || {}) as Record<string, unknown>
         );
-        if (order.status === 'paid' || order.status === 'pending_payment') {
+        if (
+          order.status === 'paid' ||
+          order.status === 'partially_refunded' ||
+          order.status === 'pending_payment'
+        ) {
           tx.update(orderDoc.ref, {
             occurrenceId: params.toOccurrenceId,
+            rescheduledAt: nowIso,
             ...(order.eventSnapshot
               ? {
                   eventSnapshot: {

=== server/domain/ticketing/dtos/ticketingPersistenceMappers.ts — diff ===
@@ -151,6 +151,7 @@ export class TicketOrderPersistenceMapper {
       expiresAt: typeof raw.expiresAt === 'string' ? raw.expiresAt : undefined,
       createdAt: toIso(raw.createdAt, now),
       paidAt: typeof raw.paidAt === 'string' ? raw.paidAt : undefined,
+      rescheduledAt: typeof raw.rescheduledAt === 'string' ? raw.rescheduledAt : undefined,
       canceledAt: typeof raw.canceledAt === 'string' ? raw.canceledAt : undefined,
       expiredAt: typeof raw.expiredAt === 'string' ? raw.expiredAt : undefined,
       updatedAt: toIso(raw.updatedAt, now),

=== server/domain/ticketing/services/ticketRefundService.ts — diff ===
@@ -34,6 +34,7 @@ function buyerSelfServiceRefund(order: TicketOrder, startsAt: string | undefined
     now: new Date(),
     paidMinor: order.totalMinor - order.serviceFeeMinor,
     serviceFeeMinor: order.serviceFeeMinor,
+    rescheduledAt: order.rescheduledAt,
   });
   const amountMinor = refund.refundMinor + refund.serviceFeeRefundMinor;
   if (amountMinor <= 0) {

=== server/domain/ticketing/types/ticketingTypes.ts — diff ===
@@ -126,6 +126,8 @@ export interface TicketOrder {
   expiresAt?: string;
   createdAt: string;
   paidAt?: string;
+  /** Aviso da nova data: até 7 dias depois, o comprador cancela com reembolso integral (D16, 4A). */
+  rescheduledAt?: string;
   canceledAt?: string;
   expiredAt?: string;
   updatedAt?: string;

=== server/interfaces/http/bookings/bookingResponses.ts — diff ===
@@ -34,6 +34,7 @@ export function toBuyerBooking(booking: Booking) {
           at: booking.cancellation.at,
         }
       : null,
+    rescheduledAt: booking.rescheduledAt ?? null,
     createdAt: booking.createdAt,
   };
 }

=== server/interfaces/http/bookings/bookingsRoutes.ts — diff ===
@@ -30,4 +30,9 @@ partnerOffersRouter.post(
   verifyAuthTokenStrict,
   PartnerOffersController.cancelSlot
 );
+partnerOffersRouter.post(
+  '/:offerId/slots/:slotId/reschedule',
+  verifyAuthTokenStrict,
+  PartnerOffersController.rescheduleSlot
+);
 partnerOffersRouter.get('/:offerId/bookings', PartnerOffersController.listBookings);

=== server/interfaces/http/bookings/partnerOffersController.ts — diff ===
@@ -1,5 +1,6 @@
 import type { Response } from 'express';
 import { cancelSlotByPartnerApplicationUseCase } from '../../../application/usecases/bookings/cancelSlotByPartnerApplicationUseCase';
+import { rescheduleSlotByPartnerApplicationUseCase } from '../../../application/usecases/bookings/rescheduleSlotByPartnerApplicationUseCase';
 import { setBookableOfferStatusApplicationUseCase } from '../../../application/usecases/bookings/setBookableOfferStatusApplicationUseCase';
 import {
   createAvailabilitySlotsUseCase,
@@ -18,6 +19,7 @@ import {
   DocumentIdSchema,
   OfferStatusSchema,
   PageQuerySchema,
+  RescheduleSlotSchema,
   SlotWindowQuerySchema,
   UpdateOfferSchema,
 } from './schemas/bookingSchemas';
@@ -77,7 +79,11 @@ export class PartnerOffersController {
       return sendError(res, 400, 'VALIDATION_ERROR', 'Status inválido.');
     }
     try {
-      const offer = await setBookableOfferStatusApplicationUseCase(actor, offerId.data, parsed.data.status);
+      const offer = await setBookableOfferStatusApplicationUseCase(
+        actor,
+        offerId.data,
+        parsed.data.status
+      );
       return res.status(200).json(toPartnerOffer(offer));
     } catch (error) {
       return handleBookingError(res, 'setOfferStatus', error);
@@ -137,6 +143,29 @@ export class PartnerOffersController {
     }
   }
 
+  static async rescheduleSlot(req: AuthenticatedRequest, res: Response): Promise<Response> {
+    const actor = actorOf(req);
+    if (!actor) return sendError(res, 401, 'UNAUTHENTICATED', 'Não autenticado.');
+    const offerId = DocumentIdSchema.safeParse(req.params.offerId);
+    const slotId = DocumentIdSchema.safeParse(req.params.slotId);
+    if (!offerId.success || !slotId.success) {
+      return sendError(res, 404, 'NOT_FOUND', 'Horário não encontrado.');
+    }
+    const body = RescheduleSlotSchema.safeParse(req.body);
+    if (!body.success) return sendError(res, 400, 'VALIDATION_ERROR', 'Nova data inválida.');
+    try {
+      const result = await rescheduleSlotByPartnerApplicationUseCase(
+        actor,
+        offerId.data,
+        slotId.data,
+        body.data
+      );
+      return res.status(200).json(result);
+    } catch (error) {
+      return handleBookingError(res, 'rescheduleSlot', error);
+    }
+  }
+
   static async listBookings(req: AuthenticatedRequest, res: Response): Promise<Response> {
     const actor = actorOf(req);
     if (!actor) return sendError(res, 401, 'UNAUTHENTICATED', 'Não autenticado.');

=== server/interfaces/http/bookings/schemas/bookingSchemas.ts — diff ===
@@ -120,6 +120,14 @@ export const CreateBookingSchema = z
   })
   .strict();
 
+export const RescheduleSlotSchema = z
+  .object({
+    startsAt: z.string().datetime(),
+    endsAt: z.string().datetime().optional(),
+    reason: z.string().trim().min(3).max(300),
+  })
+  .strict();
+
 export const CancelBookingSchema = z.object({ reason: z.string().max(300).optional() }).strict();
 
 export const SlotWindowQuerySchema = z

=== server/shared/kernel/cancellationPolicy.parity.test.ts — diff ===
@@ -15,6 +15,7 @@ describe('paridade das políticas de cancelamento frontend × backend', () => {
     expect(frontend.BOOKING_CANCELLATION_POLICIES).toEqual(backend.BOOKING_CANCELLATION_POLICIES);
     expect(frontend.TRANSFER_CANCELLATION_POLICIES).toEqual(backend.TRANSFER_CANCELLATION_POLICIES);
     expect(frontend.WITHDRAWAL_DAYS).toBe(backend.WITHDRAWAL_DAYS);
+    expect(frontend.RESCHEDULE_REFUND_DAYS).toBe(backend.RESCHEDULE_REFUND_DAYS);
     expect(frontend.WITHDRAWAL_MIN_HOURS_BEFORE_START).toBe(
       backend.WITHDRAWAL_MIN_HOURS_BEFORE_START
     );
@@ -48,6 +49,15 @@ describe('paridade das políticas de cancelamento frontend × backend', () => {
             expect(frontend.calculateBuyerRefund(params)).toEqual(
               backend.calculateBuyerRefund(params)
             );
+            for (const daysAgo of [3, 8]) {
+              const rescheduled = {
+                ...params,
+                rescheduledAt: new Date(params.now.getTime() - daysAgo * 86_400_000).toISOString(),
+              };
+              expect(frontend.calculateBuyerRefund(rescheduled)).toEqual(
+                backend.calculateBuyerRefund(rescheduled)
+              );
+            }
           }
         }
       }

=== server/shared/kernel/cancellationPolicy.test.ts — diff ===
@@ -48,6 +48,31 @@ describe('políticas de cancelamento (D14)', () => {
     });
   });
 
+  it('reagendamento: até 7 dias depois do aviso e antes da nova data devolve tudo (D16 4A)', () => {
+    const base = {
+      family: 'event' as const,
+      policy: 'none' as const,
+      purchasedAt: OLD_PURCHASE,
+      startsAt: STARTS,
+      paidMinor: 10000,
+      serviceFeeMinor: 300,
+    };
+    const now = hoursBefore(24);
+    const daysAgo = (days: number) => new Date(now.getTime() - days * 86_400_000).toISOString();
+    expect(calculateBuyerRefund({ ...base, now, rescheduledAt: daysAgo(7) })).toEqual({
+      reason: 'reschedule',
+      percent: 100,
+      refundMinor: 10000,
+      serviceFeeRefundMinor: 300,
+    });
+    expect(calculateBuyerRefund({ ...base, now, rescheduledAt: daysAgo(7.1) })).toMatchObject({
+      reason: 'none',
+    });
+    expect(
+      calculateBuyerRefund({ ...base, now: hoursBefore(-1), rescheduledAt: daysAgo(1) })
+    ).toMatchObject({ reason: 'none', refundMinor: 0 });
+  });
+
   it('eventos: flexível 24 h, moderada 7 dias, rígida 30 dias', () => {
     expect(refund('event', 'flexible', 25).refundMinor).toBe(10000);
     expect(refund('event', 'flexible', 23).refundMinor).toBe(0);

=== server/shared/kernel/cancellationPolicy.ts — diff ===
@@ -47,6 +47,9 @@ const POLICY_TIERS: Record<CancellationPolicyFamily, Record<string, RefundTier[]
 
 /** Direito de arrependimento (CDC art. 49): 7 dias da compra, até 48 h antes do início (D14). */
 export const WITHDRAWAL_DAYS = 7;
+
+/** Depois do aviso de reagendamento, o comprador tem 7 dias para pedir reembolso integral (D16, 4A). */
+export const RESCHEDULE_REFUND_DAYS = 7;
 export const WITHDRAWAL_MIN_HOURS_BEFORE_START = 48;
 
 const HOUR_MS = 60 * 60 * 1000;
@@ -75,7 +78,7 @@ export function canChangeCancellationPolicy(
 }
 
 export interface BuyerRefund {
-  reason: 'withdrawal' | 'policy' | 'none';
+  reason: 'withdrawal' | 'reschedule' | 'policy' | 'none';
   percent: number;
   refundMinor: number;
   serviceFeeRefundMinor: number;
@@ -83,7 +86,8 @@ export interface BuyerRefund {
 
 /**
  * Quanto volta ao comprador que cancela. `paidMinor` é o valor do serviço (sem a taxa de serviço), que só
- * volta no arrependimento. Depois do início (ou no-show) não há reembolso.
+ * volta no arrependimento e no reagendamento. Depois do início (ou no-show) não há reembolso.
+ * `rescheduledAt` é o aviso da nova data: até 7 dias depois dele, volta tudo, sem multa ao proprietário.
  */
 export function calculateBuyerRefund(params: {
   family: CancellationPolicyFamily;
@@ -93,6 +97,7 @@ export function calculateBuyerRefund(params: {
   now: Date;
   paidMinor: number;
   serviceFeeMinor: number;
+  rescheduledAt?: string;
 }): BuyerRefund {
   const nowMs = params.now.getTime();
   const startsAtMs = new Date(params.startsAt).getTime();
@@ -100,6 +105,17 @@ export function calculateBuyerRefund(params: {
   if (hoursUntilStart <= 0) {
     return { reason: 'none', percent: 0, refundMinor: 0, serviceFeeRefundMinor: 0 };
   }
+  const daysSinceReschedule = params.rescheduledAt
+    ? (nowMs - new Date(params.rescheduledAt).getTime()) / (24 * HOUR_MS)
+    : Number.POSITIVE_INFINITY;
+  if (daysSinceReschedule >= 0 && daysSinceReschedule <= RESCHEDULE_REFUND_DAYS) {
+    return {
+      reason: 'reschedule',
+      percent: 100,
+      refundMinor: params.paidMinor,
+      serviceFeeRefundMinor: params.serviceFeeMinor,
+    };
+  }
   const daysSincePurchase = (nowMs - new Date(params.purchasedAt).getTime()) / (24 * HOUR_MS);
   if (
     daysSincePurchase <= WITHDRAWAL_DAYS &&

=== src/domain/bookings/components/buyer/buyerComponents.test.tsx — diff ===
@@ -164,11 +164,13 @@ describe('previewRefund', () => {
   const startsAt = '2026-11-10T11:00:00.000Z';
   const booking = (
     cancellationPolicy: 'moderate' | 'none',
-    createdAt = '2026-10-01T12:00:00.000Z'
+    createdAt = '2026-10-01T12:00:00.000Z',
+    rescheduledAt: string | null = null
   ) => ({
     kind: 'tour' as const,
     totalMinor: 20000,
     createdAt,
+    rescheduledAt,
     offer: {
       title: 'Passeio',
       startsAt,
@@ -193,6 +195,15 @@ describe('previewRefund', () => {
     });
   });
 
+  it('reagendada: até 7 dias depois do aviso devolve tudo (D16)', () => {
+    expect(
+      previewRefund(
+        booking('none', '2026-10-01T12:00:00.000Z', '2026-11-08T00:00:00.000Z'),
+        new Date('2026-11-09T00:00:00.000Z')
+      )
+    ).toEqual({ refundPercent: 100, refundAmountMinor: 20000 });
+  });
+
   it('arrependimento devolve tudo mesmo sem reembolso na política', () => {
     expect(
       previewRefund(

=== src/domain/bookings/types/bookings.ts — diff ===
@@ -103,6 +103,8 @@ export interface BookingSummary {
     refundAmountMinor: number;
     at: string;
   } | null;
+  /** Aviso de nova data (D16, 4A): até 7 dias depois, o cancelamento devolve tudo. */
+  rescheduledAt: string | null;
   createdAt: string;
   /** Só na visão do parceiro vendedor. */
   buyerId?: string;

=== src/domain/bookings/utils/refundPreview.ts — ARQUIVO REESCRITO, substitua todo o conteúdo por este ===
import { calculateBuyerRefund } from '../../../shared/utils/cancellationPolicy';
import type { BookingSummary } from '../types/bookings';

/**
 * Mesma regra do backend (arrependimento, reagendamento e política gravada na compra), só para mostrar o valor antes de
 * cancelar. Quem decide o reembolso é o backend.
 */
export function previewRefund(
  booking: Pick<BookingSummary, 'kind' | 'offer' | 'totalMinor' | 'createdAt' | 'rescheduledAt'>,
  now: Date
): { refundPercent: number; refundAmountMinor: number } {
  const refund = calculateBuyerRefund({
    family: (booking.kind as string) === 'transfer' ? 'transfer' : 'booking',
    policy: booking.offer.cancellationPolicy,
    purchasedAt: booking.createdAt,
    startsAt: booking.offer.startsAt,
    now,
    paidMinor: booking.totalMinor,
    serviceFeeMinor: 0,
    rescheduledAt: booking.rescheduledAt ?? undefined,
  });
  return { refundPercent: refund.percent, refundAmountMinor: refund.refundMinor };
}

=== src/domain/ticketing/types/ticketing.ts — diff ===
@@ -122,6 +122,7 @@ export interface TicketOrder {
   };
   salesPolicySnapshot: TicketOrderSalesPolicySnapshot;
   paidAt?: string;
+  rescheduledAt?: string;
   expiresAt?: string;
   idempotencyKey: string;
   createdAt: string;

=== src/domain/ticketing/utils/ticketWalletRules.ts — diff ===
@@ -15,7 +15,7 @@ export function canTransferTicket(ticket: Ticket, order: TicketOrder | undefined
 
 /**
  * Mesma conta do backend (arrependimento ou política do pedido), só para mostrar o valor antes de pedir.
- * A taxa de serviço só volta no arrependimento (D14).
+ * A taxa de serviço só volta no arrependimento (D14) e no reagendamento (D16).
  */
 export function previewOrderRefundMinor(order: TicketOrder, now: Date): number {
   if (order.status !== 'paid' || !order.eventSnapshot?.startsAt || !order.salesPolicySnapshot) {
@@ -30,6 +30,7 @@ export function previewOrderRefundMinor(order: TicketOrder, now: Date): number {
     now,
     paidMinor: order.totalMinor - serviceFeeMinor,
     serviceFeeMinor,
+    rescheduledAt: order.rescheduledAt,
   });
   return refund.refundMinor + refund.serviceFeeRefundMinor;
 }

=== src/shared/utils/cancellationPolicy.ts — diff ===
@@ -47,6 +47,9 @@ const POLICY_TIERS: Record<CancellationPolicyFamily, Record<string, RefundTier[]
 
 /** Direito de arrependimento (CDC art. 49): 7 dias da compra, até 48 h antes do início (D14). */
 export const WITHDRAWAL_DAYS = 7;
+
+/** Depois do aviso de reagendamento, o comprador tem 7 dias para pedir reembolso integral (D16, 4A). */
+export const RESCHEDULE_REFUND_DAYS = 7;
 export const WITHDRAWAL_MIN_HOURS_BEFORE_START = 48;
 
 const HOUR_MS = 60 * 60 * 1000;
@@ -75,7 +78,7 @@ export function canChangeCancellationPolicy(
 }
 
 export interface BuyerRefund {
-  reason: 'withdrawal' | 'policy' | 'none';
+  reason: 'withdrawal' | 'reschedule' | 'policy' | 'none';
   percent: number;
   refundMinor: number;
   serviceFeeRefundMinor: number;
@@ -83,7 +86,8 @@ export interface BuyerRefund {
 
 /**
  * Quanto volta ao comprador que cancela. `paidMinor` é o valor do serviço (sem a taxa de serviço), que só
- * volta no arrependimento. Depois do início (ou no-show) não há reembolso.
+ * volta no arrependimento e no reagendamento. Depois do início (ou no-show) não há reembolso.
+ * `rescheduledAt` é o aviso da nova data: até 7 dias depois dele, volta tudo, sem multa ao proprietário.
  */
 export function calculateBuyerRefund(params: {
   family: CancellationPolicyFamily;
@@ -93,6 +97,7 @@ export function calculateBuyerRefund(params: {
   now: Date;
   paidMinor: number;
   serviceFeeMinor: number;
+  rescheduledAt?: string;
 }): BuyerRefund {
   const nowMs = params.now.getTime();
   const startsAtMs = new Date(params.startsAt).getTime();
@@ -100,6 +105,17 @@ export function calculateBuyerRefund(params: {
   if (hoursUntilStart <= 0) {
     return { reason: 'none', percent: 0, refundMinor: 0, serviceFeeRefundMinor: 0 };
   }
+  const daysSinceReschedule = params.rescheduledAt
+    ? (nowMs - new Date(params.rescheduledAt).getTime()) / (24 * HOUR_MS)
+    : Number.POSITIVE_INFINITY;
+  if (daysSinceReschedule >= 0 && daysSinceReschedule <= RESCHEDULE_REFUND_DAYS) {
+    return {
+      reason: 'reschedule',
+      percent: 100,
+      refundMinor: params.paidMinor,
+      serviceFeeRefundMinor: params.serviceFeeMinor,
+    };
+  }
   const daysSincePurchase = (nowMs - new Date(params.purchasedAt).getTime()) / (24 * HOUR_MS);
   if (
     daysSincePurchase <= WITHDRAWAL_DAYS &&

VERIFICAÇÃO (obrigatória):
- `npm run typecheck`, `npx biome lint .` (0 erros; arquivos tocados sem avisos), `npm run build`;
- testes ligados aos arquivos deste prompt: `npx vitest related --run server/application/usecases/bookings/bookingApplicationUseCases.test.ts server/application/usecases/bookings/rescheduleSlotByPartnerApplicationUseCase.ts server/application/usecases/eventLifecycleOrchestration.test.ts server/application/usecases/postponeEventOccurrenceAndNotifyApplicationUseCase.ts server/domain/bookings/adapters/firestoreBookingsAdapter.ts server/domain/bookings/adapters/firestoreBookingsShared.ts server/domain/bookings/adapters/firestoreSlotStore.ts server/domain/bookings/adapters/inMemoryBookingsAdapter.ts server/domain/bookings/index.ts server/domain/bookings/ports/bookingsPort.ts server/domain/bookings/services/bookingService.test.ts server/domain/bookings/services/bookingService.ts server/domain/bookings/services/offerService.test.ts server/domain/bookings/services/offerService.ts server/domain/bookings/types/bookingTypes.ts server/domain/bookings/usecases/rescheduleSlotByPartnerUseCase.ts server/domain/events/controllers/eventsController.ts server/domain/partners/controllers/partnerContentController.ts server/domain/payment/index.ts server/domain/payment/services/payoutService.test.ts server/domain/payment/services/payoutService.ts server/domain/payment/usecases/reschedulePayoutUseCase.ts server/domain/ticketing/adapters/firestoreTicketStore.ts server/domain/ticketing/dtos/ticketingPersistenceMappers.ts server/domain/ticketing/services/ticketRefundService.ts server/domain/ticketing/types/ticketingTypes.ts server/interfaces/http/bookings/bookingResponses.ts server/interfaces/http/bookings/bookingsRoutes.ts server/interfaces/http/bookings/partnerOffersController.ts server/interfaces/http/bookings/schemas/bookingSchemas.ts server/shared/kernel/cancellationPolicy.parity.test.ts server/shared/kernel/cancellationPolicy.test.ts server/shared/kernel/cancellationPolicy.ts src/domain/bookings/components/buyer/buyerComponents.test.tsx src/domain/bookings/types/bookings.ts src/domain/bookings/utils/refundPreview.ts src/domain/ticketing/types/ticketing.ts src/domain/ticketing/utils/ticketWalletRules.ts src/shared/utils/cancellationPolicy.ts` (todos verdes). Não precisa rodar a suíte inteira.

LIMPEZA (obrigatória, ao terminar de implementar): apague todos os arquivos de public/assets/aistudio/, inclusive o deste prompt. São cópias dos textos colados no chat, salvas automaticamente pelo AI Studio, e public/ vai para o site publicado. Se a pasta ficar vazia, apague a pasta também.
~~~~

### Configurações manuais (você faz, fora do AI Studio, depois de aplicar este prompt)

1. Nenhuma. Sem índice, regra, variável de ambiente, Function ou configuração do Stripe nova.
