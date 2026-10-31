# Prompt 21.1 — Código de check-in de reservas (backend)

> Lote 18, gerado dos commits de referência `2809f57..c24a606` da branch `claude/agents-md-v2`. Aplique na ordem do lote (A7, 21.1 a 21.7d), um por vez. Cole o bloco abaixo no agente do AI Studio, inteiro, de uma vez.

---

## Prompt 21.1 — Código de check-in de reservas (backend)

Primeiro prompt da D20. Só backend; as telas vêm no 21.5a.

~~~~text
Siga o AGENTS.md. O app ainda não foi liberado para usuários: nenhum código de compatibilidade ou transição (§2.2 item 8). As regras de negócio estão nas decisões D20 e D21 de docs/arquitetura/decisoes.md (aplicadas pelo prompt A7).

IMPORTANTE: aplique os diffs abaixo EXATAMENTE, inclusive os arquivos novos. Não reescreva os arquivos do seu jeito. Arquivo tocado sai sem avisos do lint e formatado (AGENTS.md §13). Não altere firebase.json, functions/, AGENTS.md, docs/ nem .env.

O QUE MUDA:
1) Código de 6 caracteres por reserva, derivado por HMAC do ID (BOOKING_CHECKIN_CODE_SECRET), nunca gravado; visível ao comprador a partir de 00:00 do dia do serviço (America/Fortaleza).
2) Check-in só pelo dono da oferta, de 2 h antes do início a 12 h depois do fim, com 5 erros por horário a cada 15 min contados no Firestore (bookingCheckInFailures); check-in sem internet usa a hora do aparelho.
3) Endereço de busca quando a oferta busca o comprador; reserva com check-in não vira ausência; contestação perdida com check-in fica com a plataforma.
4) .env.example, firestore.rules (bookingCheckInFailures só backend), firestore.indexes.json e teste das rules.

ARQUIVOS (crie, altere ou apague exatamente estes):
- .env.example (alterar)
- firestore.indexes.json (alterar)
- firestore.rules (alterar)
- firestore.rules.bookings.test.ts (alterar)
- server/application/usecases/payouts/disputeOutcomeApplicationUseCase.test.ts (criar)
- server/application/usecases/payouts/disputeOutcomeApplicationUseCase.ts (alterar)
- server/domain/bookings/adapters/firestoreBookingsAdapter.ts (alterar)
- server/domain/bookings/adapters/firestoreBookingsShared.ts (alterar)
- server/domain/bookings/adapters/firestoreCheckInStore.ts (criar)
- server/domain/bookings/adapters/inMemoryBookingsAdapter.ts (alterar)
- server/domain/bookings/errors/bookingDomainError.ts (alterar)
- server/domain/bookings/factory.ts (alterar)
- server/domain/bookings/index.ts (alterar)
- server/domain/bookings/ports/bookingsPort.ts (alterar)
- server/domain/bookings/services/bookingCheckInService.test.ts (criar)
- server/domain/bookings/services/bookingCheckInService.ts (criar)
- server/domain/bookings/services/bookingService.test.ts (alterar)
- server/domain/bookings/services/bookingService.ts (alterar)
- server/domain/bookings/services/offerService.ts (alterar)
- server/domain/bookings/types/bookingTypes.ts (alterar)
- server/domain/bookings/usecases/checkInBookingByCodeUseCase.ts (criar)
- server/domain/bookings/usecases/getBookingCheckInCodeUseCase.ts (criar)
- server/domain/bookings/usecases/hasCheckedInBookingUseCase.ts (criar)
- server/domain/bookings/utils/checkInCode.test.ts (criar)
- server/domain/bookings/utils/checkInCode.ts (criar)
- server/domain/bookings/utils/checkInWindow.ts (criar)
- server/interfaces/http/bookings/bookingResponses.ts (alterar)
- server/interfaces/http/bookings/bookingsController.test.ts (alterar)
- server/interfaces/http/bookings/bookingsController.ts (alterar)
- server/interfaces/http/bookings/bookingsRoutes.ts (alterar)
- server/interfaces/http/bookings/partnerOffersController.test.ts (criar)
- server/interfaces/http/bookings/partnerOffersController.ts (alterar)
- server/interfaces/http/bookings/schemas/bookingSchemas.test.ts (alterar)
- server/interfaces/http/bookings/schemas/bookingSchemas.ts (alterar)

Aplique as mudanças abaixo EXATAMENTE como estão (formato unified diff: linhas com "-" saem, linhas com "+" entram; as demais são contexto para localizar o trecho). Não reformate outros trechos dos arquivos.

=== .env.example — diff ===
@@ -32,6 +32,10 @@ FEATURED_SLOTS_PER_LIST=3
 TICKET_QR_SECRET=
 # Segredo anterior do HMAC do QR durante uma rotação (AGENTS.md §7.8); vazio fora de rotação.
 TICKET_QR_SECRET_PREVIOUS=
+# Código de check-in de reservas (D20): HMAC com no mínimo 32 caracteres aleatórios (openssl rand -base64 32).
+BOOKING_CHECKIN_CODE_SECRET=
+# Segredo anterior durante uma rotação (AGENTS.md §7.8); vazio fora de rotação.
+BOOKING_CHECKIN_CODE_SECRET_PREVIOUS=
 OFFLINE_CHECKIN_PRIVATE_KEY_PEM=
 OFFLINE_CHECKIN_KEY_ID=
 # Jobs internos (Cloud Functions → Cloud Run /internal/*).

=== firestore.indexes.json — diff ===
@@ -457,6 +457,20 @@
           "order": "ASCENDING"
         }
       ]
+    },
+    {
+      "collectionGroup": "bookingCheckInFailures",
+      "queryScope": "COLLECTION",
+      "fields": [
+        {
+          "fieldPath": "slotId",
+          "order": "ASCENDING"
+        },
+        {
+          "fieldPath": "at",
+          "order": "ASCENDING"
+        }
+      ]
     }
   ],
   "fieldOverrides": [

=== firestore.rules — diff ===
@@ -97,6 +97,9 @@ service cloud.firestore {
     match /bookingParticipants/{participantId} {
       allow read, write: if false;
     }
+    match /bookingCheckInFailures/{failureId} {
+      allow read, write: if false;
+    }
     match /bookingAuditLogs/{logId} {
       allow read: if isAdmin();
       allow write: if false;

=== firestore.rules.bookings.test.ts — diff ===
@@ -33,6 +33,7 @@ describe('Firestore Rules — bookings', () => {
       await setDoc(doc(db, 'bookings/booking-1'), { buyerId: 'buyer-1' });
       await setDoc(doc(db, 'bookingParticipants/booking-1_0'), { bookingId: 'booking-1' });
       await setDoc(doc(db, 'bookingAuditLogs/log-1'), { bookingId: 'booking-1' });
+      await setDoc(doc(db, 'bookingCheckInFailures/f-1'), { slotId: 'slot-1' });
     });
   });
 
@@ -58,6 +59,8 @@ describe('Firestore Rules — bookings', () => {
     await assertFails(setDoc(doc(partner, 'bookableOffers/offer-1'), { ownerId: 'partner-1' }));
     await assertFails(getDoc(doc(partner, 'availabilitySlots/slot-1')));
     await assertFails(setDoc(doc(partner, 'availabilitySlots/slot-1'), { capacityTotal: 999 }));
+    await assertFails(getDoc(doc(partner, 'bookingCheckInFailures/f-1')));
+    await assertFails(setDoc(doc(partner, 'bookingCheckInFailures/f-2'), { slotId: 'slot-1' }));
   });
 
   it('auditoria só é lida por admin e nunca escrita pelo cliente', async () => {

=== server/application/usecases/payouts/disputeOutcomeApplicationUseCase.test.ts — ARQUIVO NOVO, conteúdo completo ===
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../../domain/payment', () => ({ getPaymentReferenceUseCase: vi.fn() }));
vi.mock('../../../domain/ticketing', () => ({ hasCheckedInTicketForOrderUseCase: vi.fn() }));
vi.mock('../../../domain/bookings', () => ({ hasCheckedInBookingUseCase: vi.fn() }));

import { hasCheckedInBookingUseCase } from '../../../domain/bookings';
import { getPaymentReferenceUseCase } from '../../../domain/payment';
import { hasCheckedInTicketForOrderUseCase } from '../../../domain/ticketing';
import { disputeOutcomeApplicationUseCase } from './disputeOutcomeApplicationUseCase';

describe('disputeOutcomeApplicationUseCase', () => {
  beforeEach(() => vi.clearAllMocks());

  it('ganha ou consulta sem estorno não pesa para ninguém', async () => {
    expect(await disputeOutcomeApplicationUseCase('pi_1', 'won')).toBe('won');
    expect(await disputeOutcomeApplicationUseCase('pi_1', 'warning_closed')).toBe('won');
    expect(getPaymentReferenceUseCase).not.toHaveBeenCalled();
  });

  it('reserva com check-in: a plataforma arca; sem check-in: o parceiro paga (D20)', async () => {
    vi.mocked(getPaymentReferenceUseCase).mockResolvedValue({
      referenceType: 'booking',
      referenceId: 'bk_1',
    } as never);
    vi.mocked(hasCheckedInBookingUseCase).mockResolvedValueOnce(true);
    expect(await disputeOutcomeApplicationUseCase('pi_1', 'lost')).toBe('lost_platform_absorbs');
    vi.mocked(hasCheckedInBookingUseCase).mockResolvedValueOnce(false);
    expect(await disputeOutcomeApplicationUseCase('pi_1', 'lost')).toBe('lost_partner_pays');
    expect(hasCheckedInBookingUseCase).toHaveBeenCalledWith('bk_1');
  });

  it('ingresso continua decidido pelo check-in do ingresso', async () => {
    vi.mocked(getPaymentReferenceUseCase).mockResolvedValue({
      referenceType: 'ticket_order',
      referenceId: 'ord_1',
    } as never);
    vi.mocked(hasCheckedInTicketForOrderUseCase).mockResolvedValue(true);
    expect(await disputeOutcomeApplicationUseCase('pi_1', 'lost')).toBe('lost_platform_absorbs');
    expect(hasCheckedInBookingUseCase).not.toHaveBeenCalled();
  });
});

=== server/application/usecases/payouts/disputeOutcomeApplicationUseCase.ts — diff ===
@@ -1,9 +1,10 @@
+import { hasCheckedInBookingUseCase } from '../../../domain/bookings';
 import { type DisputeOutcome, getPaymentReferenceUseCase } from '../../../domain/payment';
 import { hasCheckedInTicketForOrderUseCase } from '../../../domain/ticketing';
 
 /**
- * Quem arca com a contestação encerrada (D14, D16). `warning_closed` é consulta sem estorno. Perdida:
- * com check-in do ingresso, a plataforma arca; reserva não tem check-in no app e vira dívida, que o
+ * Quem arca com a contestação encerrada (D14, D16, D20). `warning_closed` é consulta sem estorno.
+ * Perdida: com check-in do ingresso ou da reserva, a plataforma arca; sem check-in vira dívida, que o
  * admin pode perdoar com prova apresentada fora do app.
  */
 export async function disputeOutcomeApplicationUseCase(
@@ -17,5 +18,10 @@ export async function disputeOutcomeApplicationUseCase(
       ? 'lost_platform_absorbs'
       : 'lost_partner_pays';
   }
+  if (reference?.referenceType === 'booking') {
+    return (await hasCheckedInBookingUseCase(reference.referenceId))
+      ? 'lost_platform_absorbs'
+      : 'lost_partner_pays';
+  }
   return 'lost_partner_pays';
 }

=== server/domain/bookings/adapters/firestoreBookingsAdapter.ts — diff ===
@@ -31,6 +31,7 @@ import {
   SLOTS,
   writeAudit,
 } from './firestoreBookingsShared';
+import { FirestoreCheckInStore } from './firestoreCheckInStore';
 import { FirestoreSlotStore } from './firestoreSlotStore';
 
 async function paginate(query: Query, page: PageRequest): Promise<Page<Booking>> {
@@ -49,6 +50,7 @@ async function paginate(query: Query, page: PageRequest): Promise<Page<Booking>>
 
 export class FirestoreBookingsAdapter implements BookingsPort {
   private readonly slots = new FirestoreSlotStore();
+  private readonly checkIns = new FirestoreCheckInStore();
 
   async createOffer(offer: BookableOffer): Promise<void> {
     await adminDb
@@ -105,6 +107,10 @@ export class FirestoreBookingsAdapter implements BookingsPort {
   readonly setSlotStatus = this.slots.setSlotStatus.bind(this.slots);
   readonly rescheduleSlot = this.slots.rescheduleSlot.bind(this.slots);
 
+  readonly recordCheckIn = this.checkIns.recordCheckIn.bind(this.checkIns);
+  readonly countCheckInFailures = this.checkIns.countCheckInFailures.bind(this.checkIns);
+  readonly addCheckInFailure = this.checkIns.addCheckInFailure.bind(this.checkIns);
+
   async reserveCapacityAndCreateBooking(
     booking: Booking,
     participants: BookingParticipant[]

=== server/domain/bookings/adapters/firestoreBookingsShared.ts — diff ===
@@ -10,6 +10,7 @@ export const SLOTS = 'availabilitySlots';
 export const BOOKINGS = 'bookings';
 export const PARTICIPANTS = 'bookingParticipants';
 export const AUDIT = 'bookingAuditLogs';
+export const CHECK_IN_FAILURES = 'bookingCheckInFailures';
 
 export function nowIso(): string {
   return new Date().toISOString();

=== server/domain/bookings/adapters/firestoreCheckInStore.ts — ARQUIVO NOVO, conteúdo completo ===
import { adminDb } from '../../../infrastructure/firebase/adminClient';
import { BookingPersistenceMapper } from '../dtos/bookingPersistenceMappers';
import { BookingDomainError } from '../errors/bookingDomainError';
import type { Booking, BookingCheckIn } from '../types/bookingTypes';
import {
  BOOKINGS,
  CHECK_IN_FAILURES,
  nowIso,
  readBooking,
  writeAudit,
} from './firestoreBookingsShared';

/** Check-in das reservas e contagem de códigos errados por horário (D20). */
export class FirestoreCheckInStore {
  async recordCheckIn(bookingId: string, checkIn: BookingCheckIn): Promise<Booking> {
    return adminDb.runTransaction(async (tx) => {
      const booking = await readBooking(tx, bookingId);
      if (booking.checkIn) return booking;
      if (booking.status !== 'confirmed' && booking.status !== 'completed') {
        throw new BookingDomainError('INVALID_TRANSITION', 'Esta reserva não aceita check-in.');
      }
      const updated: Booking = { ...booking, checkIn, updatedAt: nowIso() };
      tx.set(
        adminDb.collection(BOOKINGS).doc(bookingId),
        BookingPersistenceMapper.toPersistence(updated)
      );
      writeAudit(tx, {
        bookingId,
        from: booking.status,
        to: booking.status,
        actorUid: checkIn.byUid,
        reason: 'checked_in',
      });
      return updated;
    });
  }

  async countCheckInFailures(slotId: string, sinceIso: string): Promise<number> {
    const snapshot = await adminDb
      .collection(CHECK_IN_FAILURES)
      .where('slotId', '==', slotId)
      .where('at', '>=', sinceIso)
      .count()
      .get();
    return snapshot.data().count;
  }

  async addCheckInFailure(slotId: string, actorUid: string, atIso: string): Promise<void> {
    // Só o horário, quem digitou e quando: nunca o código digitado (AGENTS.md §10.3).
    await adminDb.collection(CHECK_IN_FAILURES).add({ slotId, actorUid, at: atIso });
  }
}

=== server/domain/bookings/adapters/inMemoryBookingsAdapter.ts — diff ===
@@ -6,6 +6,7 @@ import {
   type BookableOffer,
   type Booking,
   type BookingCancellation,
+  type BookingCheckIn,
   type BookingParticipant,
   type BookingStatus,
   canTransitionBooking,
@@ -195,6 +196,27 @@ export class InMemoryBookingsAdapter implements BookingsPort {
   async recordBookingAudit(bookingId: string, _actorUid: string, reason: string) {
     this.audit.push({ bookingId, reason });
   }
+  readonly checkInFailures: Array<{ slotId: string; actorUid: string; at: string }> = [];
+
+  async recordCheckIn(bookingId: string, checkIn: BookingCheckIn) {
+    const booking = this.bookings.get(bookingId);
+    if (!booking) throw new BookingDomainError('NOT_FOUND', 'Reserva não encontrada.');
+    if (booking.checkIn) return booking;
+    if (booking.status !== 'confirmed' && booking.status !== 'completed') {
+      throw new BookingDomainError('INVALID_TRANSITION', 'Esta reserva não aceita check-in.');
+    }
+    const updated: Booking = { ...booking, checkIn };
+    this.bookings.set(bookingId, updated);
+    this.audit.push({ bookingId, reason: 'checked_in' });
+    return updated;
+  }
+  async countCheckInFailures(slotId: string, sinceIso: string) {
+    return this.checkInFailures.filter((f) => f.slotId === slotId && f.at >= sinceIso).length;
+  }
+  async addCheckInFailure(slotId: string, actorUid: string, at: string) {
+    this.checkInFailures.push({ slotId, actorUid, at });
+  }
+
   async getBooking(bookingId: string) {
     return this.bookings.get(bookingId) ?? null;
   }

=== server/domain/bookings/errors/bookingDomainError.ts — diff ===
@@ -12,7 +12,11 @@ export type BookingErrorCode =
   | 'PARTNER_SUSPENDED'
   | 'POLICY_CHANGE_NOT_ALLOWED'
   | 'TERMS_NOT_ACCEPTED'
-  | 'SERVICE_UNAVAILABLE';
+  | 'SERVICE_UNAVAILABLE'
+  | 'CHECK_IN_NOT_APPLICABLE'
+  | 'CHECK_IN_WINDOW_CLOSED'
+  | 'INVALID_CHECK_IN_CODE'
+  | 'CHECK_IN_LOCKED';
 
 const STATUS_BY_CODE: Record<BookingErrorCode, number> = {
   VALIDATION_ERROR: 400,
@@ -29,6 +33,10 @@ const STATUS_BY_CODE: Record<BookingErrorCode, number> = {
   POLICY_CHANGE_NOT_ALLOWED: 422,
   TERMS_NOT_ACCEPTED: 422,
   SERVICE_UNAVAILABLE: 503,
+  CHECK_IN_NOT_APPLICABLE: 422,
+  CHECK_IN_WINDOW_CLOSED: 422,
+  INVALID_CHECK_IN_CODE: 422,
+  CHECK_IN_LOCKED: 429,
 };
 
 export class BookingDomainError extends Error {

=== server/domain/bookings/factory.ts — diff ===
@@ -1,10 +1,12 @@
 import { FirestoreBookingsAdapter } from './adapters/firestoreBookingsAdapter';
 import { GuideBookableItemLookupAdapter } from './adapters/guideBookableItemLookupAdapter';
+import { BookingCheckInService } from './services/bookingCheckInService';
 import { BookingService } from './services/bookingService';
 import { OfferService } from './services/offerService';
 
 let offerService: OfferService | null = null;
 let bookingService: BookingService | null = null;
+let checkInService: BookingCheckInService | null = null;
 let port: FirestoreBookingsAdapter | null = null;
 
 function getPort(): FirestoreBookingsAdapter {
@@ -21,3 +23,8 @@ export function getBookingService(): BookingService {
   bookingService ??= new BookingService(getPort());
   return bookingService;
 }
+
+export function getBookingCheckInService(): BookingCheckInService {
+  checkInService ??= new BookingCheckInService(getPort());
+  return checkInService;
+}

=== server/domain/bookings/index.ts — diff ===
@@ -1,15 +1,18 @@
 export { cancelBookingForCanceledSlotUseCase } from './usecases/cancelBookingForCanceledSlotUseCase';
 export { cancelPendingBookingUseCase } from './usecases/cancelPendingBookingUseCase';
 export { cancelSlotByPartnerUseCase } from './usecases/cancelSlotByPartnerUseCase';
+export { checkInBookingByCodeUseCase } from './usecases/checkInBookingByCodeUseCase';
 export { completeFinishedBookingsUseCase } from './usecases/completeFinishedBookingsUseCase';
 export { confirmBookingPaymentUseCase } from './usecases/confirmBookingPaymentUseCase';
 export { createAvailabilitySlotsUseCase } from './usecases/createAvailabilitySlotsUseCase';
 export { createBookableOfferUseCase } from './usecases/createBookableOfferUseCase';
 export { createPendingBookingUseCase } from './usecases/createPendingBookingUseCase';
 export { expireOverdueBookingsUseCase } from './usecases/expireOverdueBookingsUseCase';
+export { getBookingCheckInCodeUseCase } from './usecases/getBookingCheckInCodeUseCase';
 export { getBookingForActorUseCase } from './usecases/getBookingForActorUseCase';
 export { getBookingUseCase } from './usecases/getBookingUseCase';
 export { getPublicOfferSummaryUseCase } from './usecases/getPublicOfferSummaryUseCase';
+export { hasCheckedInBookingUseCase } from './usecases/hasCheckedInBookingUseCase';
 export { listAvailableSlotsUseCase } from './usecases/listAvailableSlotsUseCase';
 export { listMyBookingsUseCase } from './usecases/listMyBookingsUseCase';
 export { listOfferBookingsForPartnerUseCase } from './usecases/listOfferBookingsForPartnerUseCase';
@@ -26,6 +29,7 @@ export { updateBookableOfferUseCase } from './usecases/updateBookableOfferUseCas
 
 export { BookingDomainError, type BookingErrorCode } from './errors/bookingDomainError';
 export type { PageRequest } from './ports/bookingsPort';
+export type { CheckInByCodeInput, CheckInCodeView } from './services/bookingCheckInService';
 export type {
   BookingDetails,
   BuyerCancellationResult,
@@ -39,6 +43,7 @@ export {
   type BookableOfferStatus,
   type Booking,
   type BookingActor,
+  type BookingCheckIn,
   type BookingParticipant,
   type BookingStatus,
   canTransitionBooking,

=== server/domain/bookings/ports/bookingsPort.ts — diff ===
@@ -4,6 +4,7 @@ import type {
   BookableOffer,
   Booking,
   BookingCancellation,
+  BookingCheckIn,
   BookingParticipant,
   BookingStatus,
   Page,
@@ -66,6 +67,15 @@ export interface BookingsPort {
   /** Só auditoria, sem mudar status (ex: pagamento recusado que ainda pode ser tentado de novo). */
   recordBookingAudit(bookingId: string, actorUid: string, reason: string): Promise<void>;
 
+  /**
+   * Grava o check-in numa transação: só reserva confirmada ou concluída e sem check-in; repetir
+   * devolve a reserva com o check-in que já existe.
+   */
+  recordCheckIn(bookingId: string, checkIn: BookingCheckIn): Promise<Booking>;
+  /** Códigos errados no horário desde `sinceIso`, contados no Firestore (o Cloud Run não guarda estado). */
+  countCheckInFailures(slotId: string, sinceIso: string): Promise<number>;
+  addCheckInFailure(slotId: string, actorUid: string, atIso: string): Promise<void>;
+
   getBooking(bookingId: string): Promise<Booking | null>;
   getParticipants(bookingId: string): Promise<BookingParticipant[]>;
   listBookingsByBuyer(buyerId: string, page: PageRequest): Promise<Page<Booking>>;

=== server/domain/bookings/services/bookingCheckInService.test.ts — ARQUIVO NOVO, conteúdo completo ===
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { InMemoryBookingsAdapter } from '../adapters/inMemoryBookingsAdapter';
import type { BookableOffer, Booking } from '../types/bookingTypes';
import { deriveCheckInCode } from '../utils/checkInCode';
import { BookingCheckInService } from './bookingCheckInService';

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

function booking(id: string, overrides: Partial<Booking> = {}): Booking {
  return {
    id,
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
    idempotencyKey: `key-${id}`,
    createdAt: '2026-11-01T12:00:00.000Z',
    updatedAt: '2026-11-01T12:00:00.000Z',
    ...overrides,
  };
}

function setup(now = '2026-11-10T11:05:00.000Z', offerOverrides: Partial<BookableOffer> = {}) {
  const port = new InMemoryBookingsAdapter();
  port.offers.set('offer-1', offer(offerOverrides));
  port.offers.set(
    'offer-2',
    offer({ id: 'offer-2', ownerId: 'partner-2', partnerId: 'partner-2' })
  );
  port.slots.set('slot-1', {
    id: 'slot-1',
    offerId: 'offer-1',
    startsAt: STARTS_AT,
    capacityTotal: 10,
    capacityReserved: 0,
    capacitySold: 5,
    status: 'open',
    createdAt: '',
    updatedAt: '',
  });
  port.bookings.set('booking-1', booking('booking-1'));
  port.bookings.set(
    'booking-2',
    booking('booking-2', { buyerId: 'buyer-2', participantsCount: 1 })
  );
  let current = new Date(now);
  const service = new BookingCheckInService(port, () => current);
  return {
    port,
    service,
    setNow: (iso: string) => {
      current = new Date(iso);
    },
  };
}

const checkIn = (code: string, extra: Record<string, unknown> = {}) => ({
  offerId: 'offer-1',
  slotId: 'slot-1',
  code,
  participantsPresent: 3,
  ...extra,
});

describe('BookingCheckInService (D20)', () => {
  beforeEach(() => {
    process.env.BOOKING_CHECKIN_CODE_SECRET = 's'.repeat(32);
  });
  afterEach(() => {
    delete process.env.BOOKING_CHECKIN_CODE_SECRET;
  });

  it('o comprador só vê o código a partir das 00:00 de Fortaleza do dia do serviço', async () => {
    const { service, setNow } = setup('2026-11-10T02:59:00.000Z');
    const before = await service.getCheckInCode(BUYER, 'booking-1');
    expect(before).toMatchObject({ code: null, visibleFrom: '2026-11-10T03:00:00.000Z' });
    setNow('2026-11-10T03:00:00.000Z');
    const view = await service.getCheckInCode(BUYER, 'booking-1');
    expect(view.code).toBe(deriveCheckInCode('booking-1'));
    expect(view.validUntil).toBe('2026-11-11T01:00:00.000Z');
  });

  it('outra pessoa não vê o código: responde como inexistente (IDOR)', async () => {
    const { service } = setup();
    await expect(service.getCheckInCode(PARTNER, 'booking-1')).rejects.toMatchObject({
      code: 'NOT_FOUND',
    });
  });

  it('entrada de atração privada não usa código', async () => {
    const { service, port } = setup();
    port.bookings.set('booking-3', booking('booking-3', { kind: 'private_entry' }));
    await expect(service.getCheckInCode(BUYER, 'booking-3')).rejects.toMatchObject({
      code: 'CHECK_IN_NOT_APPLICABLE',
    });
  });

  it('o dono da oferta faz check-in com o código e informa os presentes', async () => {
    const { service, port } = setup();
    const code = deriveCheckInCode('booking-1');
    const updated = await service.checkInByCode(
      PARTNER,
      checkIn(`${code.slice(0, 3).toLowerCase()}-${code.slice(3)}`)
    );
    expect(updated.id).toBe('booking-1');
    expect(updated.checkIn).toMatchObject({
      at: '2026-11-10T11:05:00.000Z',
      byUid: 'partner-1',
      method: 'code',
      participantsPresent: 3,
    });
    expect(port.audit.at(-1)).toEqual({ bookingId: 'booking-1', reason: 'checked_in' });
    // Repetir não muda o check-in já gravado.
    const again = await service.checkInByCode(PARTNER, checkIn(code, { participantsPresent: 1 }));
    expect(again.checkIn?.participantsPresent).toBe(3);
  });

  it('depois do check-in o comprador não vê mais o código', async () => {
    const { service } = setup();
    await service.checkInByCode(PARTNER, checkIn(deriveCheckInCode('booking-1')));
    const view = await service.getCheckInCode(BUYER, 'booking-1');
    expect(view).toMatchObject({ code: null, checkedInAt: '2026-11-10T11:05:00.000Z' });
  });

  it('outro parceiro e o admin não fazem check-in na oferta (IDOR)', async () => {
    const { service } = setup();
    const code = deriveCheckInCode('booking-1');
    await expect(
      service.checkInByCode({ uid: 'partner-2', admin: false }, checkIn(code))
    ).rejects.toMatchObject({ code: 'NOT_FOUND' });
    await expect(
      service.checkInByCode({ uid: 'admin-1', admin: true }, checkIn(code))
    ).rejects.toMatchObject({ code: 'NOT_FOUND' });
    await expect(
      service.checkInByCode(PARTNER, { ...checkIn(code), offerId: 'offer-2' })
    ).rejects.toMatchObject({ code: 'NOT_FOUND' });
  });

  it('código errado conta tentativa e trava o horário depois de 5 erros em 15 min', async () => {
    const { service, port, setNow } = setup();
    for (let attempt = 0; attempt < 5; attempt += 1) {
      await expect(service.checkInByCode(PARTNER, checkIn('ZZZZZZ'))).rejects.toMatchObject({
        code: 'INVALID_CHECK_IN_CODE',
      });
    }
    expect(port.checkInFailures).toHaveLength(5);
    const code = deriveCheckInCode('booking-1');
    await expect(service.checkInByCode(PARTNER, checkIn(code))).rejects.toMatchObject({
      code: 'CHECK_IN_LOCKED',
    });
    setNow('2026-11-10T11:21:00.000Z');
    await expect(service.checkInByCode(PARTNER, checkIn(code))).resolves.toMatchObject({
      id: 'booking-1',
    });
  });

  it('texto que nem é código também conta como tentativa', async () => {
    const { service, port } = setup();
    await expect(service.checkInByCode(PARTNER, checkIn('abc 01'))).rejects.toMatchObject({
      code: 'INVALID_CHECK_IN_CODE',
    });
    expect(port.checkInFailures).toHaveLength(1);
  });

  it('fora da janela (antes de 2 h do início ou 12 h depois do fim) recusa', async () => {
    const code = deriveCheckInCode('booking-1');
    const early = setup('2026-11-10T08:59:00.000Z');
    await expect(early.service.checkInByCode(PARTNER, checkIn(code))).rejects.toMatchObject({
      code: 'CHECK_IN_WINDOW_CLOSED',
    });
    const late = setup('2026-11-11T01:01:00.000Z');
    await expect(late.service.checkInByCode(PARTNER, checkIn(code))).rejects.toMatchObject({
      code: 'CHECK_IN_WINDOW_CLOSED',
    });
  });

  it('check-in feito sem internet vale pela hora do aparelho e registra quando sincronizou', async () => {
    const { service } = setup('2026-11-10T15:00:00.000Z');
    const updated = await service.checkInByCode(
      PARTNER,
      checkIn(deriveCheckInCode('booking-1'), { capturedAt: '2026-11-10T11:02:00.000Z' })
    );
    expect(updated.checkIn).toMatchObject({
      at: '2026-11-10T11:02:00.000Z',
      syncedAt: '2026-11-10T15:00:00.000Z',
    });
  });

  it('recusa hora do aparelho no futuro ou com mais de 24 h', async () => {
    const { service } = setup('2026-11-10T15:00:00.000Z');
    const code = deriveCheckInCode('booking-1');
    await expect(
      service.checkInByCode(PARTNER, checkIn(code, { capturedAt: '2026-11-10T15:05:00.000Z' }))
    ).rejects.toMatchObject({ code: 'VALIDATION_ERROR' });
    await expect(
      service.checkInByCode(PARTNER, checkIn(code, { capturedAt: '2026-11-09T14:00:00.000Z' }))
    ).rejects.toMatchObject({ code: 'VALIDATION_ERROR' });
  });

  it('presentes acima do número de pessoas da reserva é recusado', async () => {
    const { service } = setup();
    await expect(
      service.checkInByCode(
        PARTNER,
        checkIn(deriveCheckInCode('booking-2'), { participantsPresent: 2 })
      )
    ).rejects.toMatchObject({ code: 'VALIDATION_ERROR' });
  });

  it('reserva cancelada não aceita check-in: o código não é encontrado', async () => {
    const { service, port } = setup();
    port.bookings.set('booking-1', booking('booking-1', { status: 'canceled' }));
    await expect(
      service.checkInByCode(PARTNER, checkIn(deriveCheckInCode('booking-1')))
    ).rejects.toMatchObject({ code: 'INVALID_CHECK_IN_CODE' });
  });

  it('hasCheckIn indica a prova do serviço', async () => {
    const { service } = setup();
    expect(await service.hasCheckIn('booking-1')).toBe(false);
    await service.checkInByCode(PARTNER, checkIn(deriveCheckInCode('booking-1')));
    expect(await service.hasCheckIn('booking-1')).toBe(true);
  });
});

=== server/domain/bookings/services/bookingCheckInService.ts — ARQUIVO NOVO, conteúdo completo ===
import { BookingDomainError } from '../errors/bookingDomainError';
import type { BookingsPort } from '../ports/bookingsPort';
import {
  type Booking,
  type BookingActor,
  type BookingCheckIn,
  CHECK_IN_CODE_KINDS,
} from '../types/bookingTypes';
import {
  checkInCodesMatch,
  deriveCheckInCode,
  listAcceptedCheckInCodes,
  normalizeCheckInCode,
} from '../utils/checkInCode';
import {
  CHECK_IN_FAILURE_WINDOW_MS,
  CHECK_IN_MAX_FAILURES,
  checkInCodeVisibleFromMs,
  checkInWindow,
} from '../utils/checkInWindow';

// Check-in sem internet chega depois: aceita até 24 h de atraso e 1 min de relógio adiantado.
const OFFLINE_MAX_DELAY_MS = 24 * 60 * 60 * 1000;
const CLOCK_SKEW_MS = 60 * 1000;

export interface CheckInCodeView {
  /** null antes das 00:00 do dia do serviço e depois que a janela de check-in fecha. */
  code: string | null;
  visibleFrom: string;
  validUntil: string;
  checkedInAt: string | null;
}

export interface CheckInByCodeInput {
  offerId: string;
  slotId: string;
  code: string;
  participantsPresent: number;
  /** Hora do aparelho quando o código foi digitado sem internet. */
  capturedAt?: string;
}

/** Código de check-in do comprador e check-in pelo prestador (D20). */
export class BookingCheckInService {
  constructor(
    private readonly port: BookingsPort,
    private readonly now: () => Date = () => new Date()
  ) {}

  async getCheckInCode(actor: BookingActor, bookingId: string): Promise<CheckInCodeView> {
    const booking = await this.port.getBooking(bookingId);
    // Só o comprador vê o código; para os demais a reserva responde como inexistente (§7.10).
    if (!booking || booking.buyerId !== actor.uid) {
      throw new BookingDomainError('NOT_FOUND', 'Reserva não encontrada.');
    }
    if (!CHECK_IN_CODE_KINDS.includes(booking.kind)) {
      throw new BookingDomainError(
        'CHECK_IN_NOT_APPLICABLE',
        'Esta reserva não usa código de check-in.'
      );
    }
    if (booking.status !== 'confirmed' && booking.status !== 'completed') {
      throw new BookingDomainError('INVALID_TRANSITION', 'Esta reserva não tem código ativo.');
    }
    const { startsAt, durationMinutes } = booking.offerSnapshot;
    const visibleFromMs = checkInCodeVisibleFromMs(startsAt);
    const { closesAtMs } = checkInWindow(startsAt, durationMinutes);
    const nowMs = this.now().getTime();
    const visible = nowMs >= visibleFromMs && nowMs <= closesAtMs && !booking.checkIn;
    return {
      code: visible ? deriveCheckInCode(booking.id) : null,
      visibleFrom: new Date(visibleFromMs).toISOString(),
      validUntil: new Date(closesAtMs).toISOString(),
      checkedInAt: booking.checkIn?.at ?? null,
    };
  }

  async checkInByCode(actor: BookingActor, input: CheckInByCodeInput): Promise<Booking> {
    const offer = await this.port.getOffer(input.offerId);
    // Só o dono da oferta faz check-in, nem o admin (D20): oferta de outro responde como inexistente.
    if (!offer || offer.ownerId !== actor.uid) {
      throw new BookingDomainError('NOT_FOUND', 'Oferta não encontrada.');
    }
    if (!CHECK_IN_CODE_KINDS.includes(offer.kind)) {
      throw new BookingDomainError(
        'CHECK_IN_NOT_APPLICABLE',
        'Esta oferta não usa código de check-in.'
      );
    }
    const slot = await this.port.getSlot(input.slotId);
    if (slot?.offerId !== offer.id) {
      throw new BookingDomainError('NOT_FOUND', 'Horário não encontrado.');
    }

    const nowDate = this.now();
    const atMs = this.checkInTime(input.capturedAt, nowDate.getTime());
    const { opensAtMs, closesAtMs } = checkInWindow(slot.startsAt, offer.durationMinutes);
    if (atMs < opensAtMs || atMs > closesAtMs) {
      throw new BookingDomainError(
        'CHECK_IN_WINDOW_CLOSED',
        'O check-in deste horário não está aberto agora.'
      );
    }

    const since = new Date(nowDate.getTime() - CHECK_IN_FAILURE_WINDOW_MS).toISOString();
    if ((await this.port.countCheckInFailures(slot.id, since)) >= CHECK_IN_MAX_FAILURES) {
      throw new BookingDomainError(
        'CHECK_IN_LOCKED',
        'Muitos códigos errados. Tente de novo em 15 minutos.'
      );
    }

    const code = normalizeCheckInCode(input.code);
    const bookings = code
      ? (await this.port.listBookingsBySlot(slot.id)).filter(
          (booking) => booking.status === 'confirmed' || booking.status === 'completed'
        )
      : [];
    const match = code
      ? bookings.find((booking) =>
          listAcceptedCheckInCodes(booking.id).some((accepted) => checkInCodesMatch(accepted, code))
        )
      : undefined;
    if (!match) {
      await this.port.addCheckInFailure(slot.id, actor.uid, nowDate.toISOString());
      throw new BookingDomainError('INVALID_CHECK_IN_CODE', 'Código incorreto.');
    }
    if (input.participantsPresent > match.participantsCount) {
      throw new BookingDomainError(
        'VALIDATION_ERROR',
        'Presentes acima do número de pessoas da reserva.'
      );
    }

    const checkIn: BookingCheckIn = {
      at: new Date(atMs).toISOString(),
      byUid: actor.uid,
      method: 'code',
      participantsPresent: input.participantsPresent,
      ...(input.capturedAt ? { syncedAt: nowDate.toISOString() } : {}),
    };
    return this.port.recordCheckIn(match.id, checkIn);
  }

  async hasCheckIn(bookingId: string): Promise<boolean> {
    return Boolean((await this.port.getBooking(bookingId))?.checkIn);
  }

  private checkInTime(capturedAt: string | undefined, nowMs: number): number {
    if (!capturedAt) return nowMs;
    const capturedMs = new Date(capturedAt).getTime();
    if (
      Number.isNaN(capturedMs) ||
      capturedMs > nowMs + CLOCK_SKEW_MS ||
      capturedMs < nowMs - OFFLINE_MAX_DELAY_MS
    ) {
      throw new BookingDomainError('VALIDATION_ERROR', 'Hora do check-in inválida.');
    }
    return Math.min(capturedMs, nowMs);
  }
}

=== server/domain/bookings/services/bookingService.test.ts — diff ===
@@ -237,4 +237,43 @@ describe('BookingService', () => {
     await expect(service.completeFinishedBookings()).resolves.toBe(1);
     expect(port.bookings.get(booking.id)?.status).toBe('completed');
   });
+
+  it('reserva com check-in não pode ser marcada como ausência (D20)', async () => {
+    const { service, port, setNow } = setup();
+    const booking = await service.createPendingBooking(BUYER, INPUT, FEES);
+    await service.confirmBookingPayment(booking.id, 'pi_1');
+    await port.recordCheckIn(booking.id, {
+      at: '2026-11-10T11:02:00.000Z',
+      byUid: 'partner-1',
+      method: 'code',
+      participantsPresent: 2,
+    });
+    setNow('2026-11-10T12:00:00.000Z');
+    await expect(
+      service.markBookingNoShow({ uid: 'partner-1', admin: false }, booking.id)
+    ).rejects.toMatchObject({ code: 'INVALID_TRANSITION' });
+  });
+
+  it('oferta que busca no endereço exige onde o comprador está e grava na reserva (D20)', async () => {
+    const { service } = setup({ offer: { pickupMode: 'buyer_address' } });
+    await expect(service.createPendingBooking(BUYER, INPUT, FEES)).rejects.toMatchObject({
+      code: 'VALIDATION_ERROR',
+    });
+    const booking = await service.createPendingBooking(
+      BUYER,
+      { ...INPUT, pickupAddress: '  Pousada Vila Jeri, Rua do Forró  ' },
+      FEES
+    );
+    expect(booking.pickupAddress).toBe('Pousada Vila Jeri, Rua do Forró');
+  });
+
+  it('oferta com ponto de encontro ignora o endereço enviado', async () => {
+    const { service } = setup();
+    const booking = await service.createPendingBooking(
+      BUYER,
+      { ...INPUT, pickupAddress: 'Pousada' },
+      FEES
+    );
+    expect(booking.pickupAddress).toBeUndefined();
+  });
 });

=== server/domain/bookings/services/bookingService.ts — diff ===
@@ -27,6 +27,8 @@ export interface CreatePendingBookingInput {
   idempotencyKey: string;
   locale: Locale;
   acceptedTermsVersion: string;
+  /** Obrigatório quando a oferta busca o comprador no endereço (D20). */
+  pickupAddress?: string;
 }
 
 export interface BuyerCancellationResult {
@@ -78,6 +80,14 @@ export class BookingService {
       }
     }
 
+    const pickupAddress = input.pickupAddress?.trim() ?? '';
+    if (
+      offer.pickupMode === 'buyer_address' &&
+      (pickupAddress.length < 3 || pickupAddress.length > 300)
+    ) {
+      throw new BookingDomainError('VALIDATION_ERROR', 'Informe onde você está hospedado.');
+    }
+
     const nowDate = this.now();
     const timestamp = nowDate.toISOString();
     const booking: Booking = {
@@ -99,6 +109,7 @@ export class BookingService {
         cancellationPolicy: offer.cancellationPolicy,
       },
       termsAcceptance: { version: input.acceptedTermsVersion, acceptedAt: timestamp },
+      ...(offer.pickupMode === 'buyer_address' ? { pickupAddress } : {}),
       locale: input.locale,
       idempotencyKey: input.idempotencyKey,
       createdAt: timestamp,
@@ -285,6 +296,10 @@ export class BookingService {
     if (this.now().getTime() < new Date(booking.offerSnapshot.startsAt).getTime()) {
       throw new BookingDomainError('INVALID_TRANSITION', 'Só é possível marcar após o início.');
     }
+    // Check-in prova que o comprador apareceu (D20).
+    if (booking.checkIn) {
+      throw new BookingDomainError('INVALID_TRANSITION', 'Reserva com check-in não é ausência.');
+    }
     return this.port.setBookingStatus({
       bookingId,
       to: 'no_show',

=== server/domain/bookings/services/offerService.ts — diff ===
@@ -42,6 +42,7 @@ export type OfferInput = Pick<
   | 'pricing'
   | 'durationMinutes'
   | 'meetingPoint'
+  | 'pickupMode'
   | 'cancellationPolicy'
   | 'maxParticipantsPerBooking'
   | 'requiresParticipantNames'

=== server/domain/bookings/types/bookingTypes.ts — diff ===
@@ -11,6 +11,12 @@ export const AVAILABLE_OFFER_KINDS: readonly BookableOfferKind[] = ['tour', 'pri
 
 export type BookableOfferStatus = 'draft' | 'published' | 'paused' | 'archived';
 
+/** Tipos com check-in por código de 6 caracteres (D20); a entrada de atração privada usa QR Code. */
+export const CHECK_IN_CODE_KINDS: readonly BookableOfferKind[] = ['tour', 'rental', 'transfer'];
+
+/** Onde o serviço começa: no ponto de encontro da oferta ou no endereço que o comprador informa (D20). */
+export type PickupMode = 'meeting_point' | 'buyer_address';
+
 export interface PriceOption {
   id: string;
   label: LocalizedText;
@@ -43,6 +49,7 @@ export interface BookableOffer {
   pricing: { currency: 'BRL'; priceOptions: PriceOption[] };
   durationMinutes?: number;
   meetingPoint?: MeetingPoint;
+  pickupMode?: PickupMode;
   cancellationPolicy: BookingCancellationPolicy;
   maxParticipantsPerBooking: number;
   requiresParticipantNames: boolean;
@@ -99,6 +106,17 @@ export interface BookingCancellation {
   at: string;
 }
 
+/** Check-in do serviço pelo prestador com o código do comprador (D20): prova de que o serviço começou. */
+export interface BookingCheckIn {
+  /** Hora em que o prestador digitou o código (a do aparelho, quando o check-in foi feito sem internet). */
+  at: string;
+  byUid: string;
+  method: 'code';
+  participantsPresent: number;
+  /** Só no check-in feito sem internet: quando o servidor recebeu e validou o código. */
+  syncedAt?: string;
+}
+
 export interface Booking {
   id: string;
   offerId: string;
@@ -128,6 +146,9 @@ export interface Booking {
   cancellation?: BookingCancellation;
   /** Versão dos termos aceita na compra (D15). */
   termsAcceptance?: TermsAcceptance;
+  /** Onde o comprador está (hospedagem ou endereço), quando a oferta busca no endereço. PII (§7.6). */
+  pickupAddress?: string;
+  checkIn?: BookingCheckIn;
   locale: Locale;
   idempotencyKey: string;
   createdAt: string;

=== server/domain/bookings/usecases/checkInBookingByCodeUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { getBookingCheckInService } from '../factory';
import type { CheckInByCodeInput } from '../services/bookingCheckInService';
import type { Booking, BookingActor } from '../types/bookingTypes';

/** Check-in pelo dono da oferta com o código que o comprador informa na hora do serviço (D20). */
export async function checkInBookingByCodeUseCase(
  actor: BookingActor,
  input: CheckInByCodeInput
): Promise<Booking> {
  return getBookingCheckInService().checkInByCode(actor, input);
}

=== server/domain/bookings/usecases/getBookingCheckInCodeUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { getBookingCheckInService } from '../factory';
import type { CheckInCodeView } from '../services/bookingCheckInService';
import type { BookingActor } from '../types/bookingTypes';

/** Código de check-in do comprador, visível a partir das 00:00 do dia do serviço (D20). */
export async function getBookingCheckInCodeUseCase(
  actor: BookingActor,
  bookingId: string
): Promise<CheckInCodeView> {
  return getBookingCheckInService().getCheckInCode(actor, bookingId);
}

=== server/domain/bookings/usecases/hasCheckedInBookingUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { getBookingCheckInService } from '../factory';

/** Prova do serviço numa contestação de cartão (D16, D20). */
export async function hasCheckedInBookingUseCase(bookingId: string): Promise<boolean> {
  return getBookingCheckInService().hasCheckIn(bookingId);
}

=== server/domain/bookings/utils/checkInCode.test.ts — ARQUIVO NOVO, conteúdo completo ===
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  CHECK_IN_CODE_ALPHABET,
  checkInCodesMatch,
  deriveCheckInCode,
  listAcceptedCheckInCodes,
  normalizeCheckInCode,
} from './checkInCode';
import { checkInCodeVisibleFromMs, checkInWindow } from './checkInWindow';

const SECRET = 'a'.repeat(32);

describe('código de check-in (D20)', () => {
  beforeEach(() => {
    process.env.BOOKING_CHECKIN_CODE_SECRET = SECRET;
    delete process.env.BOOKING_CHECKIN_CODE_SECRET_PREVIOUS;
  });
  afterEach(() => {
    delete process.env.BOOKING_CHECKIN_CODE_SECRET;
    delete process.env.BOOKING_CHECKIN_CODE_SECRET_PREVIOUS;
  });

  it('gera 6 caracteres do alfabeto sem ambíguos, sempre iguais para a mesma reserva', () => {
    const code = deriveCheckInCode('booking-1');
    expect(code).toHaveLength(6);
    expect([...code].every((char) => CHECK_IN_CODE_ALPHABET.includes(char))).toBe(true);
    expect(deriveCheckInCode('booking-1')).toBe(code);
    expect(deriveCheckInCode('booking-2')).not.toBe(code);
  });

  it('muda com o segredo e aceita o anterior durante a rotação', () => {
    const before = deriveCheckInCode('booking-1');
    process.env.BOOKING_CHECKIN_CODE_SECRET = 'b'.repeat(32);
    process.env.BOOKING_CHECKIN_CODE_SECRET_PREVIOUS = SECRET;
    expect(deriveCheckInCode('booking-1')).not.toBe(before);
    expect(listAcceptedCheckInCodes('booking-1')).toContain(before);
  });

  it('falha sem segredo, em vez de usar valor fixo (§7.7)', () => {
    delete process.env.BOOKING_CHECKIN_CODE_SECRET;
    expect(() => deriveCheckInCode('booking-1')).toThrow(/BOOKING_CHECKIN_CODE_SECRET/);
  });

  it('normaliza minúsculas, espaço e hífen e recusa caracteres fora do alfabeto', () => {
    expect(normalizeCheckInCode('k7m-4qx')).toBe('K7M4QX');
    expect(normalizeCheckInCode(' K7M 4QX ')).toBe('K7M4QX');
    expect(normalizeCheckInCode('K7M4Q0')).toBeNull();
    expect(normalizeCheckInCode('K7M4Q')).toBeNull();
    expect(checkInCodesMatch('K7M4QX', 'K7M4QX')).toBe(true);
    expect(checkInCodesMatch('K7M4QX', 'K7M4QY')).toBe(false);
  });

  it('aparece às 00:00 de Fortaleza e a janela vai de 2 h antes a 12 h depois do fim', () => {
    // 08:00 em Fortaleza = 11:00 UTC; meia-noite de Fortaleza = 03:00 UTC.
    expect(new Date(checkInCodeVisibleFromMs('2026-11-10T11:00:00.000Z')).toISOString()).toBe(
      '2026-11-10T03:00:00.000Z'
    );
    // 01:00 UTC do dia 11 ainda é dia 10 em Fortaleza.
    expect(new Date(checkInCodeVisibleFromMs('2026-11-11T01:00:00.000Z')).toISOString()).toBe(
      '2026-11-10T03:00:00.000Z'
    );
    const window = checkInWindow('2026-11-10T11:00:00.000Z', 120);
    expect(new Date(window.opensAtMs).toISOString()).toBe('2026-11-10T09:00:00.000Z');
    expect(new Date(window.closesAtMs).toISOString()).toBe('2026-11-11T01:00:00.000Z');
  });
});

=== server/domain/bookings/utils/checkInCode.ts — ARQUIVO NOVO, conteúdo completo ===
import crypto from 'crypto';

/** Sem 0/O e 1/I/L, que se confundem ditos em voz alta ou digitados (D20). */
export const CHECK_IN_CODE_ALPHABET = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
export const CHECK_IN_CODE_LENGTH = 6;

const MIN_CURRENT_SECRET_LENGTH = 32;
const MIN_PREVIOUS_SECRET_LENGTH = 16;
// Maior múltiplo de 31 que cabe num byte: bytes acima são descartados para não favorecer letras.
const UNBIASED_BYTE_LIMIT = 248;

function readSecret(name: string, minLength: number): string | null {
  const value = process.env[name]?.trim();
  return value && value.length >= minLength ? value : null;
}

function currentSecret(): string {
  const secret = readSecret('BOOKING_CHECKIN_CODE_SECRET', MIN_CURRENT_SECRET_LENGTH);
  if (!secret) {
    throw new Error(
      `BOOKING_CHECKIN_CODE_SECRET ausente ou com menos de ${MIN_CURRENT_SECRET_LENGTH} caracteres.`
    );
  }
  return secret;
}

function derive(secret: string, bookingId: string): string {
  let code = '';
  for (let counter = 0; code.length < CHECK_IN_CODE_LENGTH; counter += 1) {
    const digest = crypto.createHmac('sha256', secret).update(`${bookingId}:${counter}`).digest();
    for (const byte of digest) {
      if (byte >= UNBIASED_BYTE_LIMIT) continue;
      code += CHECK_IN_CODE_ALPHABET[byte % CHECK_IN_CODE_ALPHABET.length];
      if (code.length === CHECK_IN_CODE_LENGTH) break;
    }
  }
  return code;
}

/**
 * Código da reserva, derivado do ID com o segredo do Secret Manager e nunca gravado (exceção do
 * AGENTS.md §7.7, D20): quem lê o banco não descobre códigos.
 */
export function deriveCheckInCode(bookingId: string): string {
  return derive(currentSecret(), bookingId);
}

/** Códigos aceitos no check-in: o do segredo atual e, durante a rotação, o do anterior (§7.8). */
export function listAcceptedCheckInCodes(bookingId: string): string[] {
  const codes = [deriveCheckInCode(bookingId)];
  const previous = readSecret('BOOKING_CHECKIN_CODE_SECRET_PREVIOUS', MIN_PREVIOUS_SECRET_LENGTH);
  if (previous) codes.push(derive(previous, bookingId));
  return codes;
}

const CODE_PATTERN = new RegExp(`^[${CHECK_IN_CODE_ALPHABET}]{${CHECK_IN_CODE_LENGTH}}$`);

/** Aceita minúsculas, espaços e hífen (o app mostra `K7M-4QX`); devolve null se não for um código. */
export function normalizeCheckInCode(input: string): string | null {
  const normalized = input.toUpperCase().replace(/[\s-]/g, '');
  return CODE_PATTERN.test(normalized) ? normalized : null;
}

export function checkInCodesMatch(expected: string, received: string): boolean {
  const a = Buffer.from(expected);
  const b = Buffer.from(received);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

=== server/domain/bookings/utils/checkInWindow.ts — ARQUIVO NOVO, conteúdo completo ===
const MINUTE_MS = 60_000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;
// America/Fortaleza é UTC−3 o ano todo, sem horário de verão (AGENTS.md §1).
const FORTALEZA_OFFSET_MS = 3 * HOUR_MS;

/** Check-in de 2 h antes do início até 12 h depois do fim (D20). */
export const CHECK_IN_OPENS_BEFORE_MS = 2 * HOUR_MS;
export const CHECK_IN_CLOSES_AFTER_MS = 12 * HOUR_MS;
/** No máximo 5 códigos errados por horário a cada 15 min (D20, exceção do §7.7). */
export const CHECK_IN_MAX_FAILURES = 5;
export const CHECK_IN_FAILURE_WINDOW_MS = 15 * MINUTE_MS;

export function serviceEndsAtMs(startsAt: string, durationMinutes?: number): number {
  return new Date(startsAt).getTime() + (durationMinutes ?? 0) * MINUTE_MS;
}

/** 00:00 do dia do serviço em Fortaleza: a partir daí o comprador vê o código. */
export function checkInCodeVisibleFromMs(startsAt: string): number {
  const local = new Date(startsAt).getTime() - FORTALEZA_OFFSET_MS;
  return Math.floor(local / DAY_MS) * DAY_MS + FORTALEZA_OFFSET_MS;
}

export function checkInWindow(
  startsAt: string,
  durationMinutes?: number
): { opensAtMs: number; closesAtMs: number } {
  return {
    opensAtMs: new Date(startsAt).getTime() - CHECK_IN_OPENS_BEFORE_MS,
    closesAtMs: serviceEndsAtMs(startsAt, durationMinutes) + CHECK_IN_CLOSES_AFTER_MS,
  };
}

=== server/interfaces/http/bookings/bookingResponses.ts — diff ===
@@ -35,6 +35,10 @@ export function toBuyerBooking(booking: Booking) {
         }
       : null,
     rescheduledAt: booking.rescheduledAt ?? null,
+    pickupAddress: booking.pickupAddress ?? null,
+    checkIn: booking.checkIn
+      ? { at: booking.checkIn.at, participantsPresent: booking.checkIn.participantsPresent }
+      : null,
     createdAt: booking.createdAt,
   };
 }

=== server/interfaces/http/bookings/bookingsController.test.ts — diff ===
@@ -11,6 +11,7 @@ vi.mock('../../../domain/bookings', async () => {
   const { BookingDomainError } = await import('../../../domain/bookings/errors/bookingDomainError');
   return {
     BookingDomainError,
+    getBookingCheckInCodeUseCase: vi.fn(),
     getBookingForActorUseCase: vi.fn(),
     listAvailableSlotsUseCase: vi.fn(),
     listMyBookingsUseCase: vi.fn(),
@@ -21,6 +22,7 @@ vi.mock('../../../domain/bookings', async () => {
 import { createBookingApplicationUseCase } from '../../../application/usecases/bookings/createBookingApplicationUseCase';
 import {
   BookingDomainError,
+  getBookingCheckInCodeUseCase,
   getBookingForActorUseCase,
   listMyBookingsUseCase,
 } from '../../../domain/bookings';
@@ -30,7 +32,8 @@ import { BookingsController } from './bookingsController';
 function response() {
   const json = vi.fn();
   const status = vi.fn().mockReturnValue({ json });
-  return { res: { status } as unknown as Response, status, json };
+  const setHeader = vi.fn();
+  return { res: { status, setHeader } as unknown as Response, status, json, setHeader };
 }
 
 function request(parts: Partial<AuthenticatedRequest>, uid: string | null = 'buyer-1') {
@@ -183,4 +186,57 @@ describe('BookingsController', () => {
     expect(status).toHaveBeenCalledWith(500);
     expect(JSON.stringify(json.mock.calls[0]?.[0])).not.toContain('quota');
   });
+
+  it('código de check-in sai sem cache e só com os campos da visão (D20)', async () => {
+    vi.mocked(getBookingCheckInCodeUseCase).mockResolvedValue({
+      code: 'K7M4QX',
+      visibleFrom: '2026-11-10T03:00:00.000Z',
+      validUntil: '2026-11-11T01:00:00.000Z',
+      checkedInAt: null,
+    });
+    const { res, status, json, setHeader } = response();
+    await BookingsController.getCheckInCode(request({ params: { bookingId: 'bk_1' } }), res);
+    expect(getBookingCheckInCodeUseCase).toHaveBeenCalledWith(
+      { uid: 'buyer-1', admin: false },
+      'bk_1'
+    );
+    expect(setHeader).toHaveBeenCalledWith('Cache-Control', 'no-store');
+    expect(status).toHaveBeenCalledWith(200);
+    expect(json.mock.calls[0]?.[0]).toMatchObject({ code: 'K7M4QX' });
+  });
+
+  it('código de check-in de outra pessoa responde 404 (IDOR)', async () => {
+    vi.mocked(getBookingCheckInCodeUseCase).mockRejectedValue(
+      new BookingDomainError('NOT_FOUND', 'Reserva não encontrada.')
+    );
+    const { res, status } = response();
+    await BookingsController.getCheckInCode(
+      request({ params: { bookingId: 'bk_1' } }, 'intruso'),
+      res
+    );
+    expect(status).toHaveBeenCalledWith(404);
+  });
+
+  it('a resposta da reserva traz o check-in e o endereço de busca, sem o código', async () => {
+    vi.mocked(getBookingForActorUseCase).mockResolvedValue({
+      booking: {
+        ...BOOKING,
+        pickupAddress: 'Pousada Vila Jeri',
+        checkIn: {
+          at: '2026-11-10T11:02:00.000Z',
+          byUid: 'p1',
+          method: 'code',
+          participantsPresent: 2,
+        },
+      } as never,
+      participants: [],
+    });
+    const { res, json } = response();
+    await BookingsController.get(request({ params: { bookingId: 'bk_1' } }), res);
+    expect(json.mock.calls[0]?.[0]).toMatchObject({
+      pickupAddress: 'Pousada Vila Jeri',
+      checkIn: { at: '2026-11-10T11:02:00.000Z', participantsPresent: 2 },
+    });
+    expect(JSON.stringify(json.mock.calls[0]?.[0])).not.toContain('byUid');
+  });
 });

=== server/interfaces/http/bookings/bookingsController.ts — diff ===
@@ -2,6 +2,7 @@ import type { Response } from 'express';
 import { cancelBookingByBuyerApplicationUseCase } from '../../../application/usecases/bookings/cancelBookingByBuyerApplicationUseCase';
 import { createBookingApplicationUseCase } from '../../../application/usecases/bookings/createBookingApplicationUseCase';
 import {
+  getBookingCheckInCodeUseCase,
   getBookingForActorUseCase,
   listAvailableSlotsUseCase,
   listMyBookingsUseCase,
@@ -92,6 +93,21 @@ export class BookingsController {
     }
   }
 
+  static async getCheckInCode(req: AuthenticatedRequest, res: Response): Promise<Response> {
+    const actor = actorOf(req);
+    if (!actor) return sendError(res, 401, 'UNAUTHENTICATED', 'Não autenticado.');
+    const bookingId = DocumentIdSchema.safeParse(req.params.bookingId);
+    if (!bookingId.success) return sendError(res, 404, 'NOT_FOUND', 'Reserva não encontrada.');
+    try {
+      const view = await getBookingCheckInCodeUseCase(actor, bookingId.data);
+      // O código não pode ficar em cache de proxy nem do navegador.
+      res.setHeader('Cache-Control', 'no-store');
+      return res.status(200).json(view);
+    } catch (error) {
+      return handleBookingError(res, 'getCheckInCode', error);
+    }
+  }
+
   static async cancel(req: AuthenticatedRequest, res: Response): Promise<Response> {
     const actor = actorOf(req);
     if (!actor) return sendError(res, 401, 'UNAUTHENTICATED', 'Não autenticado.');

=== server/interfaces/http/bookings/bookingsRoutes.ts — diff ===
@@ -14,6 +14,7 @@ bookingsRouter.get('/offers/:offerId/slots', BookingsController.listSlots);
 bookingsRouter.post('/', verifyAuthTokenStrict, BookingsController.create);
 bookingsRouter.get('/me', verifyAuthToken, BookingsController.listMine);
 bookingsRouter.get('/:bookingId', verifyAuthToken, BookingsController.get);
+bookingsRouter.get('/:bookingId/check-in-code', verifyAuthToken, BookingsController.getCheckInCode);
 bookingsRouter.post('/:bookingId/cancel', verifyAuthTokenStrict, BookingsController.cancel);
 bookingsRouter.post('/:bookingId/no-show', verifyAuthToken, BookingsController.markNoShow);
 
@@ -36,3 +37,9 @@ partnerOffersRouter.post(
   PartnerOffersController.rescheduleSlot
 );
 partnerOffersRouter.get('/:offerId/bookings', PartnerOffersController.listBookings);
+// Check-in libera o repasse (D20): token revogado não serve.
+partnerOffersRouter.post(
+  '/:offerId/slots/:slotId/check-ins',
+  verifyAuthTokenStrict,
+  PartnerOffersController.checkIn
+);

=== server/interfaces/http/bookings/partnerOffersController.test.ts — ARQUIVO NOVO, conteúdo completo ===
import type { Response } from 'express';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../../domain/bookings', async () => {
  const { BookingDomainError } = await import('../../../domain/bookings/errors/bookingDomainError');
  return { BookingDomainError, checkInBookingByCodeUseCase: vi.fn() };
});

import { BookingDomainError, checkInBookingByCodeUseCase } from '../../../domain/bookings';
import type { AuthenticatedRequest } from '../../../infrastructure/auth/authenticatedRequest';
import { PartnerOffersController } from './partnerOffersController';

function response() {
  const json = vi.fn();
  const status = vi.fn().mockReturnValue({ json });
  return { res: { status } as unknown as Response, status, json };
}

function request(body: unknown, uid: string | null = 'partner-1') {
  return {
    params: { offerId: 'offer-1', slotId: 'slot-1' },
    query: {},
    headers: {},
    body,
    user: uid ? { uid, admin: false, emailVerified: true, authTime: 0 } : undefined,
  } as unknown as AuthenticatedRequest;
}

describe('PartnerOffersController.checkIn (D20)', () => {
  beforeEach(() => vi.clearAllMocks());

  it('401 sem autenticação', async () => {
    const { res, status } = response();
    await PartnerOffersController.checkIn(
      request({ code: 'K7M4QX', participantsPresent: 1 }, null),
      res
    );
    expect(status).toHaveBeenCalledWith(401);
  });

  it('400 com campo extra e sem chamar o caso de uso', async () => {
    const { res, status } = response();
    await PartnerOffersController.checkIn(
      request({ code: 'K7M4QX', participantsPresent: 1, bookingId: 'bk_1' }),
      res
    );
    expect(status).toHaveBeenCalledWith(400);
    expect(checkInBookingByCodeUseCase).not.toHaveBeenCalled();
  });

  it('repassa oferta, horário e corpo validados', async () => {
    vi.mocked(checkInBookingByCodeUseCase).mockResolvedValue({
      id: 'bk_1',
      status: 'confirmed',
      lines: [],
      offerSnapshot: { title: 'Buggy', startsAt: '', cancellationPolicy: 'flexible' },
      checkIn: { at: 't', byUid: 'partner-1', method: 'code', participantsPresent: 2 },
    } as never);
    const { res, status, json } = response();
    await PartnerOffersController.checkIn(
      request({ code: 'k7m-4qx', participantsPresent: 2 }),
      res
    );
    expect(checkInBookingByCodeUseCase).toHaveBeenCalledWith(
      { uid: 'partner-1', admin: false },
      { offerId: 'offer-1', slotId: 'slot-1', code: 'k7m-4qx', participantsPresent: 2 }
    );
    expect(status).toHaveBeenCalledWith(200);
    expect(json.mock.calls[0]?.[0]).toMatchObject({ checkIn: { participantsPresent: 2 } });
  });

  it('muitos erros respondem 429 no formato padrão', async () => {
    vi.mocked(checkInBookingByCodeUseCase).mockRejectedValue(
      new BookingDomainError(
        'CHECK_IN_LOCKED',
        'Muitos códigos errados. Tente de novo em 15 minutos.'
      )
    );
    const { res, status, json } = response();
    await PartnerOffersController.checkIn(request({ code: 'K7M4QX', participantsPresent: 1 }), res);
    expect(status).toHaveBeenCalledWith(429);
    expect(json.mock.calls[0]?.[0]).toMatchObject({ error: { code: 'CHECK_IN_LOCKED' } });
  });
});

=== server/interfaces/http/bookings/partnerOffersController.ts — diff ===
@@ -3,6 +3,7 @@ import { cancelSlotByPartnerApplicationUseCase } from '../../../application/usec
 import { rescheduleSlotByPartnerApplicationUseCase } from '../../../application/usecases/bookings/rescheduleSlotByPartnerApplicationUseCase';
 import { setBookableOfferStatusApplicationUseCase } from '../../../application/usecases/bookings/setBookableOfferStatusApplicationUseCase';
 import {
+  checkInBookingByCodeUseCase,
   createAvailabilitySlotsUseCase,
   createBookableOfferUseCase,
   listOfferBookingsForPartnerUseCase,
@@ -14,6 +15,7 @@ import type { AuthenticatedRequest } from '../../../infrastructure/auth/authenti
 import { handleBookingError, sendError } from './bookingHttpErrors';
 import { toPartnerOffer, toPartnerSlot, toSellerBooking } from './bookingResponses';
 import {
+  CheckInByCodeSchema,
   CreateOfferSchema,
   CreateSlotsSchema,
   DocumentIdSchema,
@@ -183,4 +185,25 @@ export class PartnerOffersController {
       return handleBookingError(res, 'listOfferBookings', error);
     }
   }
+
+  static async checkIn(req: AuthenticatedRequest, res: Response): Promise<Response> {
+    const actor = actorOf(req);
+    if (!actor) return sendError(res, 401, 'UNAUTHENTICATED', 'Não autenticado.');
+    const offerId = DocumentIdSchema.safeParse(req.params.offerId);
+    const slotId = DocumentIdSchema.safeParse(req.params.slotId);
+    const body = CheckInByCodeSchema.safeParse(req.body);
+    if (!offerId.success || !slotId.success || !body.success) {
+      return sendError(res, 400, 'VALIDATION_ERROR', 'Dados do check-in inválidos.');
+    }
+    try {
+      const booking = await checkInBookingByCodeUseCase(actor, {
+        offerId: offerId.data,
+        slotId: slotId.data,
+        ...body.data,
+      });
+      return res.status(200).json(toSellerBooking(booking));
+    } catch (error) {
+      return handleBookingError(res, 'checkIn', error);
+    }
+  }
 }

=== server/interfaces/http/bookings/schemas/bookingSchemas.test.ts — diff ===
@@ -1,5 +1,10 @@
 import { describe, expect, it } from 'vitest';
-import { CreateOfferSchema, CreateSlotsSchema, UpdateOfferSchema } from './bookingSchemas';
+import {
+  CheckInByCodeSchema,
+  CreateOfferSchema,
+  CreateSlotsSchema,
+  UpdateOfferSchema,
+} from './bookingSchemas';
 
 const OFFER = {
   guideItemId: 'item-1',
@@ -61,4 +66,31 @@ describe('bookingSchemas', () => {
       }).success
     ).toBe(false);
   });
+
+  it('busca no endereço é opção fechada da oferta', () => {
+    expect(CreateOfferSchema.safeParse({ ...OFFER, pickupMode: 'buyer_address' }).success).toBe(
+      true
+    );
+    expect(CreateOfferSchema.safeParse({ ...OFFER, pickupMode: 'hotel' }).success).toBe(false);
+  });
+
+  it('check-in: código, presentes e hora do aparelho; nada de reserva ou dono vindo do cliente', () => {
+    expect(CheckInByCodeSchema.safeParse({ code: 'k7m-4qx', participantsPresent: 2 }).success).toBe(
+      true
+    );
+    expect(
+      CheckInByCodeSchema.safeParse({
+        code: 'K7M4QX',
+        participantsPresent: 2,
+        capturedAt: '2026-11-10T11:02:00.000Z',
+      }).success
+    ).toBe(true);
+    expect(CheckInByCodeSchema.safeParse({ code: 'K7M4QX', participantsPresent: 0 }).success).toBe(
+      false
+    );
+    expect(
+      CheckInByCodeSchema.safeParse({ code: 'K7M4QX', participantsPresent: 2, bookingId: 'x' })
+        .success
+    ).toBe(false);
+  });
 });

=== server/interfaces/http/bookings/schemas/bookingSchemas.ts — diff ===
@@ -49,6 +49,7 @@ const offerFields = {
     })
     .strict()
     .optional(),
+  pickupMode: z.enum(['meeting_point', 'buyer_address']).optional(),
   // Opções da plataforma (D14); o serviço confere se a opção vale para o tipo da oferta.
   cancellationPolicy: z.enum([...BOOKING_CANCELLATION_POLICIES, ...TRANSFER_CANCELLATION_POLICIES]),
   maxParticipantsPerBooking: z.number().int().min(1).max(50),
@@ -117,6 +118,7 @@ export const CreateBookingSchema = z
     idempotencyKey: idempotencyKey.optional(),
     locale,
     acceptedTermsVersion: z.string().trim().min(1).max(40),
+    pickupAddress: z.string().trim().min(3).max(300).optional(),
   })
   .strict();
 
@@ -128,6 +130,15 @@ export const RescheduleSlotSchema = z
   })
   .strict();
 
+export const CheckInByCodeSchema = z
+  .object({
+    // Aceita minúsculas, espaço e hífen; o serviço normaliza e confere o alfabeto.
+    code: z.string().trim().min(6).max(12),
+    participantsPresent: z.number().int().min(1).max(50),
+    capturedAt: isoDateTime.optional(),
+  })
+  .strict();
+
 export const CancelBookingSchema = z.object({ reason: z.string().max(300).optional() }).strict();
 
 export const SlotWindowQuerySchema = z

VERIFICAÇÃO (obrigatória):
- `npm run typecheck`, `npx biome lint .` (0 erros; arquivos tocados sem avisos), `npm run build`;
- testes ligados aos arquivos deste prompt: `npx vitest related --run firestore.rules.bookings.test.ts server/application/usecases/payouts/disputeOutcomeApplicationUseCase.test.ts server/application/usecases/payouts/disputeOutcomeApplicationUseCase.ts server/domain/bookings/adapters/firestoreBookingsAdapter.ts server/domain/bookings/adapters/firestoreBookingsShared.ts server/domain/bookings/adapters/firestoreCheckInStore.ts server/domain/bookings/adapters/inMemoryBookingsAdapter.ts server/domain/bookings/errors/bookingDomainError.ts server/domain/bookings/factory.ts server/domain/bookings/index.ts server/domain/bookings/ports/bookingsPort.ts server/domain/bookings/services/bookingCheckInService.test.ts server/domain/bookings/services/bookingCheckInService.ts server/domain/bookings/services/bookingService.test.ts server/domain/bookings/services/bookingService.ts server/domain/bookings/services/offerService.ts server/domain/bookings/types/bookingTypes.ts server/domain/bookings/usecases/checkInBookingByCodeUseCase.ts server/domain/bookings/usecases/getBookingCheckInCodeUseCase.ts server/domain/bookings/usecases/hasCheckedInBookingUseCase.ts server/domain/bookings/utils/checkInCode.test.ts server/domain/bookings/utils/checkInCode.ts server/domain/bookings/utils/checkInWindow.ts server/interfaces/http/bookings/bookingResponses.ts server/interfaces/http/bookings/bookingsController.test.ts server/interfaces/http/bookings/bookingsController.ts server/interfaces/http/bookings/bookingsRoutes.ts server/interfaces/http/bookings/partnerOffersController.test.ts server/interfaces/http/bookings/partnerOffersController.ts server/interfaces/http/bookings/schemas/bookingSchemas.test.ts server/interfaces/http/bookings/schemas/bookingSchemas.ts` (todos verdes). Não precisa rodar a suíte inteira.
- `npm run test:rules` (as regras mudaram).

ENTREGA: responda no formato do AGENTS.md §16.3.

LIMPEZA (obrigatória, ao terminar de implementar): apague todos os arquivos de public/assets/aistudio/, inclusive o deste prompt. São cópias dos textos colados no chat, salvas automaticamente pelo AI Studio, e public/ vai para o site publicado. Se a pasta ficar vazia, apague a pasta também.
~~~~

### Configurações manuais (você faz, fora do AI Studio, depois de aplicar este prompt)

1. No Secret Manager (produção) e no painel Secrets do AI Studio (valor diferente), crie `BOOKING_CHECKIN_CODE_SECRET` com 32 bytes aleatórios (`openssl rand -base64 32`) e monte no Cloud Run. `BOOKING_CHECKIN_CODE_SECRET_PREVIOUS` fica vazio fora de rotação.
2. Publique as regras e os índices do Firestore: `firebase deploy --only firestore:rules,firestore:indexes`.
