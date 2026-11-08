# Prompt 11 — bookings: núcleo do domínio (backend)

> Lote 6 — gerado do commit de referência `da4738e` da branch `claude/agents-md-v2`. Cole o bloco abaixo no agente do AI Studio, inteiro, de uma vez.

---

## Prompt 11 — bookings: núcleo do domínio (backend)

Cria o domínio `server/domain/bookings` (decisão D3, fase 1: passeios e entradas de atrações privadas). Inclui ofertas, horários com capacidade, reservas com as vagas controladas em transação, máquina de estados com auditoria, preço e reembolso calculados no backend, além das regras do Firestore e dos índices. Ainda sem rotas HTTP, pagamento ou telas (prompts 12 a 14).

~~~~text
Siga o AGENTS.md. NÃO altere o AGENTS.md. O app ainda não foi liberado para usuários: nenhum código de compatibilidade, migração ou transição (§2.2 item 8). A decisão D5 (tradução automática) está em aberto: não implemente tradução automática.
Leia docs/arquitetura/04-bookings-design.md inteiro antes de começar.

O QUE MUDA:
1) server/domain/bookings: types (BookableOffer, AvailabilitySlot, Booking, máquina de estados canTransitionBooking), errors (BookingDomainError com code e statusCode estáveis), ports (BookingsPort e BookableItemLookupPort), adapters (FirestoreBookingsAdapter com todas as leituras antes das escritas em cada transação; GuideBookableItemLookupAdapter, que lê o item pelo UseCase público do guide; InMemoryBookingsAdapter, usado SOMENTE por testes), dtos (mappers), services (OfferService e BookingService), utils puros (preço em centavos, reembolso com Math.floor, recorrência no fuso de Fortaleza, IDs determinísticos com sha256), 21 UseCases (um por arquivo), factory preguiçosa e index.ts.
2) Fase 1: só 'tour' (item de categoria tour) e 'private_entry' (categoria sight); 'rental' e 'transfer' → KIND_NOT_AVAILABLE.
3) Idempotência: o ID da reserva vem de sha256(comprador + chave) e o do horário de oferta + instante; criar horário repetido não zera vagas vendidas.
4) Cancelamento pelo comprador grava `cancellation` (quem, percentual, valor) para que repetir a chamada devolva o mesmo resultado.
5) Quem age (BookingActor) é um tipo do próprio domínio: o domínio não importa server/application (AGENTS.md §3.4 regra 1).
6) firestore.rules: as regras da seção 2 do desenho + firestore.rules.bookings.test.ts. firestore.indexes.json: 6 índices novos.
7) docs/arquitetura/02-grafo-dependencias.md: aresta bookings → guide (sem ciclo).

ARQUIVOS (crie, altere ou apague exatamente estes):
- docs/arquitetura/02-grafo-dependencias.md (alterar)
- firestore.indexes.json (alterar)
- firestore.rules (alterar)
- firestore.rules.bookings.test.ts (criar)
- server/domain/bookings/adapters/firestoreBookingsAdapter.ts (criar)
- server/domain/bookings/adapters/guideBookableItemLookupAdapter.ts (criar)
- server/domain/bookings/adapters/inMemoryBookingsAdapter.ts (criar)
- server/domain/bookings/dtos/bookingPersistenceMappers.ts (criar)
- server/domain/bookings/errors/bookingDomainError.ts (criar)
- server/domain/bookings/factory.ts (criar)
- server/domain/bookings/index.ts (criar)
- server/domain/bookings/ports/bookableItemLookupPort.ts (criar)
- server/domain/bookings/ports/bookingsPort.ts (criar)
- server/domain/bookings/services/bookingService.test.ts (criar)
- server/domain/bookings/services/bookingService.ts (criar)
- server/domain/bookings/services/offerService.test.ts (criar)
- server/domain/bookings/services/offerService.ts (criar)
- server/domain/bookings/types/bookingTypes.ts (criar)
- server/domain/bookings/usecases/cancelBookingForCanceledSlotUseCase.ts (criar)
- server/domain/bookings/usecases/cancelSlotByPartnerUseCase.ts (criar)
- server/domain/bookings/usecases/completeFinishedBookingsUseCase.ts (criar)
- server/domain/bookings/usecases/confirmBookingPaymentUseCase.ts (criar)
- server/domain/bookings/usecases/createAvailabilitySlotsUseCase.ts (criar)
- server/domain/bookings/usecases/createBookableOfferUseCase.ts (criar)
- server/domain/bookings/usecases/createPendingBookingUseCase.ts (criar)
- server/domain/bookings/usecases/expireOverdueBookingsUseCase.ts (criar)
- server/domain/bookings/usecases/getBookingForActorUseCase.ts (criar)
- server/domain/bookings/usecases/getBookingUseCase.ts (criar)
- server/domain/bookings/usecases/listAvailableSlotsUseCase.ts (criar)
- server/domain/bookings/usecases/listMyBookingsUseCase.ts (criar)
- server/domain/bookings/usecases/listOfferBookingsForPartnerUseCase.ts (criar)
- server/domain/bookings/usecases/listPartnerOffersUseCase.ts (criar)
- server/domain/bookings/usecases/markBookingDisputedUseCase.ts (criar)
- server/domain/bookings/usecases/markBookingNoShowUseCase.ts (criar)
- server/domain/bookings/usecases/markBookingPaymentFailedUseCase.ts (criar)
- server/domain/bookings/usecases/markBookingRefundedUseCase.ts (criar)
- server/domain/bookings/usecases/requestCancellationByBuyerUseCase.ts (criar)
- server/domain/bookings/usecases/setBookableOfferStatusUseCase.ts (criar)
- server/domain/bookings/usecases/updateBookableOfferUseCase.ts (criar)
- server/domain/bookings/utils/bookingPricing.ts (criar)
- server/domain/bookings/utils/bookingUtils.test.ts (criar)
- server/domain/bookings/utils/buildBookingId.ts (criar)
- server/domain/bookings/utils/cancellationRefund.ts (criar)
- server/domain/bookings/utils/slotRecurrence.ts (criar)

Aplique as mudanças abaixo EXATAMENTE como estão (formato unified diff: linhas com "-" saem, linhas com "+" entram; as demais são contexto para localizar o trecho). Não reformate outros trechos dos arquivos.

=== docs/arquitetura/02-grafo-dependencias.md — diff ===
@@ -36,6 +36,7 @@
 | reviews | notifications | `adapters/reviewNotificationAdapter.ts` | OK (port + adapter = anti-corruption layer) |
 | reviews | ticketing | `services/reviewService.ts` | OK (verificação de compra) |
 | ticketing | events | `services/ticketingService.ts` | OK |
+| bookings | guide | `adapters/guideBookableItemLookupAdapter.ts` | OK (port `BookableItemLookupPort`; guide não importa bookings; prompt 11) |
 
 ### 2.2. Dependências indiretas (fecho transitivo, só domínios)
 
@@ -47,6 +48,7 @@
 | favorites | events, guide | — |
 | insights | events, guide | — |
 | ticketing | events | — |
+| bookings | guide | — |
 | events, guide, users, admin, payment, climawind, seo | — | — (folhas) |
 
 ### 2.3. Camada `server/application` (Composition UseCases)

=== firestore.indexes.json — diff ===
@@ -187,6 +187,90 @@
           "order": "DESCENDING"
         }
       ]
+    },
+    {
+      "collectionGroup": "bookableOffers",
+      "queryScope": "COLLECTION",
+      "fields": [
+        {
+          "fieldPath": "guideItemId",
+          "order": "ASCENDING"
+        },
+        {
+          "fieldPath": "status",
+          "order": "ASCENDING"
+        }
+      ]
+    },
+    {
+      "collectionGroup": "availabilitySlots",
+      "queryScope": "COLLECTION",
+      "fields": [
+        {
+          "fieldPath": "offerId",
+          "order": "ASCENDING"
+        },
+        {
+          "fieldPath": "startsAt",
+          "order": "ASCENDING"
+        }
+      ]
+    },
+    {
+      "collectionGroup": "bookings",
+      "queryScope": "COLLECTION",
+      "fields": [
+        {
+          "fieldPath": "buyerId",
+          "order": "ASCENDING"
+        },
+        {
+          "fieldPath": "createdAt",
+          "order": "DESCENDING"
+        }
+      ]
+    },
+    {
+      "collectionGroup": "bookings",
+      "queryScope": "COLLECTION",
+      "fields": [
+        {
+          "fieldPath": "offerId",
+          "order": "ASCENDING"
+        },
+        {
+          "fieldPath": "createdAt",
+          "order": "DESCENDING"
+        }
+      ]
+    },
+    {
+      "collectionGroup": "bookings",
+      "queryScope": "COLLECTION",
+      "fields": [
+        {
+          "fieldPath": "status",
+          "order": "ASCENDING"
+        },
+        {
+          "fieldPath": "expiresAt",
+          "order": "ASCENDING"
+        }
+      ]
+    },
+    {
+      "collectionGroup": "bookings",
+      "queryScope": "COLLECTION",
+      "fields": [
+        {
+          "fieldPath": "status",
+          "order": "ASCENDING"
+        },
+        {
+          "fieldPath": "offerSnapshot.startsAt",
+          "order": "ASCENDING"
+        }
+      ]
     }
   ],
   "fieldOverrides": [

=== firestore.rules — diff ===
@@ -65,6 +65,26 @@ service cloud.firestore {
     match /partnerSubscriptions/{partnerId} {
       allow read, write: if false;
     }
+    match /bookableOffers/{offerId} {
+      allow read, write: if false;
+    }
+    match /publicBookableOffers/{offerId} {
+      allow read: if resource.data.status == 'published';
+      allow write: if false;
+    }
+    match /availabilitySlots/{slotId} {
+      allow read, write: if false;
+    }
+    match /bookings/{bookingId} {
+      allow read, write: if false;
+    }
+    match /bookingParticipants/{participantId} {
+      allow read, write: if false;
+    }
+    match /bookingAuditLogs/{logId} {
+      allow read: if isAdmin();
+      allow write: if false;
+    }
     match /stripeWebhookEvents/{eventId} {
       allow read, write: if false;
     }

=== firestore.rules.bookings.test.ts — ARQUIVO NOVO, conteúdo completo ===
import { readFile } from 'node:fs/promises';
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
} from '@firebase/rules-unit-testing';
import { deleteDoc, doc, getDoc, setDoc } from 'firebase/firestore';
import { afterAll, beforeAll, beforeEach, describe, it } from 'vitest';

describe('Firestore Rules — bookings', () => {
  let testEnv: Awaited<ReturnType<typeof initializeTestEnvironment>>;

  beforeAll(async () => {
    const rules = await readFile(new URL('./firestore.rules', import.meta.url), 'utf8');
    testEnv = await initializeTestEnvironment({
      projectId: 'bookings-rules-test',
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
      await setDoc(doc(db, 'publicBookableOffers/published-1'), { status: 'published' });
      await setDoc(doc(db, 'publicBookableOffers/draft-1'), { status: 'draft' });
      await setDoc(doc(db, 'bookableOffers/offer-1'), { ownerId: 'partner-1' });
      await setDoc(doc(db, 'availabilitySlots/slot-1'), { offerId: 'offer-1' });
      await setDoc(doc(db, 'bookings/booking-1'), { buyerId: 'buyer-1' });
      await setDoc(doc(db, 'bookingParticipants/booking-1_0'), { bookingId: 'booking-1' });
      await setDoc(doc(db, 'bookingAuditLogs/log-1'), { bookingId: 'booking-1' });
    });
  });

  it('anônimo lê oferta pública publicada, mas não rascunho', async () => {
    const db = testEnv.unauthenticatedContext().firestore();
    await assertSucceeds(getDoc(doc(db, 'publicBookableOffers/published-1')));
    await assertFails(getDoc(doc(db, 'publicBookableOffers/draft-1')));
  });

  it('ninguém escreve na projeção pública pelo cliente', async () => {
    const db = testEnv.authenticatedContext('partner-1', { admin: true }).firestore();
    await assertFails(setDoc(doc(db, 'publicBookableOffers/published-1'), { status: 'published' }));
    await assertFails(deleteDoc(doc(db, 'publicBookableOffers/published-1')));
  });

  it('coleções internas negam leitura e escrita até para o dono', async () => {
    const buyer = testEnv.authenticatedContext('buyer-1').firestore();
    const partner = testEnv.authenticatedContext('partner-1').firestore();
    await assertFails(getDoc(doc(buyer, 'bookings/booking-1')));
    await assertFails(setDoc(doc(buyer, 'bookings/booking-2'), { buyerId: 'buyer-1' }));
    await assertFails(getDoc(doc(buyer, 'bookingParticipants/booking-1_0')));
    await assertFails(getDoc(doc(partner, 'bookableOffers/offer-1')));
    await assertFails(setDoc(doc(partner, 'bookableOffers/offer-1'), { ownerId: 'partner-1' }));
    await assertFails(getDoc(doc(partner, 'availabilitySlots/slot-1')));
    await assertFails(setDoc(doc(partner, 'availabilitySlots/slot-1'), { capacityTotal: 999 }));
  });

  it('auditoria só é lida por admin e nunca escrita pelo cliente', async () => {
    const admin = testEnv.authenticatedContext('admin-1', { admin: true }).firestore();
    const user = testEnv.authenticatedContext('buyer-1').firestore();
    await assertSucceeds(getDoc(doc(admin, 'bookingAuditLogs/log-1')));
    await assertFails(getDoc(doc(user, 'bookingAuditLogs/log-1')));
    await assertFails(setDoc(doc(admin, 'bookingAuditLogs/log-2'), { bookingId: 'x' }));
  });
});

=== server/domain/bookings/adapters/firestoreBookingsAdapter.ts — ARQUIVO NOVO, conteúdo completo ===
import type { Query, Transaction } from 'firebase-admin/firestore';
import { adminDb } from '../../../infrastructure/firebase/adminClient';
import {
  BookingPersistenceMapper,
  OfferPersistenceMapper,
  ParticipantPersistenceMapper,
  SlotPersistenceMapper,
} from '../dtos/bookingPersistenceMappers';
import { BookingDomainError } from '../errors/bookingDomainError';
import type { BookingsPort, PageRequest } from '../ports/bookingsPort';
import {
  type AvailabilitySlot,
  type AvailabilitySlotStatus,
  type BookableOffer,
  type Booking,
  type BookingCancellation,
  type BookingParticipant,
  type BookingStatus,
  canTransitionBooking,
  type Page,
  type PublicBookableOffer,
} from '../types/bookingTypes';

const OFFERS = 'bookableOffers';
const PUBLIC_OFFERS = 'publicBookableOffers';
const SLOTS = 'availabilitySlots';
const BOOKINGS = 'bookings';
const PARTICIPANTS = 'bookingParticipants';
const AUDIT = 'bookingAuditLogs';

function nowIso(): string {
  return new Date().toISOString();
}

function writeAudit(
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

function available(slot: AvailabilitySlot): number {
  return slot.capacityTotal - slot.capacityReserved - slot.capacitySold;
}

async function readBooking(tx: Transaction, bookingId: string): Promise<Booking> {
  const snapshot = await tx.get(adminDb.collection(BOOKINGS).doc(bookingId));
  if (!snapshot.exists) {
    throw new BookingDomainError('NOT_FOUND', 'Reserva não encontrada.');
  }
  return BookingPersistenceMapper.toDomain(snapshot.id, snapshot.data() ?? {});
}

async function readSlot(tx: Transaction, slotId: string): Promise<AvailabilitySlot> {
  const snapshot = await tx.get(adminDb.collection(SLOTS).doc(slotId));
  if (!snapshot.exists) {
    throw new BookingDomainError('NOT_FOUND', 'Horário não encontrado.');
  }
  return SlotPersistenceMapper.toDomain(snapshot.id, snapshot.data() ?? {});
}

async function paginate(query: Query, page: PageRequest): Promise<Page<Booking>> {
  let paged = query.limit(page.limit + 1);
  if (page.cursor) {
    const cursorSnapshot = await adminDb.collection(BOOKINGS).doc(page.cursor).get();
    if (cursorSnapshot.exists) paged = paged.startAfter(cursorSnapshot);
  }
  const snapshot = await paged.get();
  const docs = snapshot.docs.slice(0, page.limit);
  return {
    data: docs.map((doc) => BookingPersistenceMapper.toDomain(doc.id, doc.data())),
    nextCursor: snapshot.docs.length > page.limit ? (docs.at(-1)?.id ?? null) : null,
  };
}

export class FirestoreBookingsAdapter implements BookingsPort {
  async createOffer(offer: BookableOffer): Promise<void> {
    await adminDb
      .collection(OFFERS)
      .doc(offer.id)
      .create(OfferPersistenceMapper.toPersistence(offer));
  }

  async saveOffer(offer: BookableOffer): Promise<void> {
    await adminDb.collection(OFFERS).doc(offer.id).set(OfferPersistenceMapper.toPersistence(offer));
  }

  async getOffer(offerId: string): Promise<BookableOffer | null> {
    const snapshot = await adminDb.collection(OFFERS).doc(offerId).get();
    return snapshot.exists
      ? OfferPersistenceMapper.toDomain(snapshot.id, snapshot.data() ?? {})
      : null;
  }

  async listOffersByOwner(ownerId: string): Promise<BookableOffer[]> {
    const snapshot = await adminDb
      .collection(OFFERS)
      .where('ownerId', '==', ownerId)
      .limit(200)
      .get();
    return snapshot.docs.map((doc) => OfferPersistenceMapper.toDomain(doc.id, doc.data()));
  }

  async listPublishedOffersByGuideItem(guideItemId: string): Promise<BookableOffer[]> {
    const snapshot = await adminDb
      .collection(OFFERS)
      .where('guideItemId', '==', guideItemId)
      .where('status', '==', 'published')
      .limit(20)
      .get();
    return snapshot.docs.map((doc) => OfferPersistenceMapper.toDomain(doc.id, doc.data()));
  }

  async upsertPublicOfferProjection(offer: PublicBookableOffer): Promise<void> {
    const { id, ...data } = offer;
    await adminDb
      .collection(PUBLIC_OFFERS)
      .doc(id)
      .set(JSON.parse(JSON.stringify(data)));
  }

  async deletePublicOfferProjection(offerId: string): Promise<void> {
    await adminDb.collection(PUBLIC_OFFERS).doc(offerId).delete();
  }

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

  async reserveCapacityAndCreateBooking(
    booking: Booking,
    participants: BookingParticipant[]
  ): Promise<Booking> {
    const slotRef = adminDb.collection(SLOTS).doc(booking.slotId);
    const bookingRef = adminDb.collection(BOOKINGS).doc(booking.id);
    return adminDb.runTransaction(async (tx) => {
      const [slotSnapshot, existingSnapshot] = await Promise.all([
        tx.get(slotRef),
        tx.get(bookingRef),
      ]);
      if (existingSnapshot.exists) {
        return BookingPersistenceMapper.toDomain(
          existingSnapshot.id,
          existingSnapshot.data() ?? {}
        );
      }
      if (!slotSnapshot.exists) {
        throw new BookingDomainError('NOT_FOUND', 'Horário não encontrado.');
      }
      const slot = SlotPersistenceMapper.toDomain(slotSnapshot.id, slotSnapshot.data() ?? {});
      if (slot.status !== 'open' || new Date(slot.startsAt).getTime() <= Date.now()) {
        throw new BookingDomainError('SLOT_UNAVAILABLE', 'Horário indisponível.');
      }
      if (available(slot) < booking.participantsCount) {
        throw new BookingDomainError(
          'INSUFFICIENT_CAPACITY',
          'Vagas insuficientes para este horário.'
        );
      }
      tx.update(slotRef, {
        capacityReserved: slot.capacityReserved + booking.participantsCount,
        updatedAt: nowIso(),
      });
      tx.set(bookingRef, BookingPersistenceMapper.toPersistence(booking));
      participants.forEach((participant, index) => {
        tx.set(adminDb.collection(PARTICIPANTS).doc(`${booking.id}_${index}`), {
          bookingId: booking.id,
          name: participant.name,
          isLeadContact: participant.isLeadContact,
        });
      });
      writeAudit(tx, {
        bookingId: booking.id,
        from: null,
        to: booking.status,
        actorUid: booking.buyerId,
        reason: 'created',
      });
      return booking;
    });
  }

  async confirmBookingAndCommitCapacity(
    bookingId: string,
    paymentIntentId: string
  ): Promise<Booking> {
    return adminDb.runTransaction(async (tx) => {
      const booking = await readBooking(tx, bookingId);
      if (booking.status === 'confirmed') {
        return booking;
      }
      const slot = await readSlot(tx, booking.slotId);
      const slotRef = adminDb.collection(SLOTS).doc(slot.id);

      if (booking.status === 'pending_payment') {
        tx.update(slotRef, {
          capacityReserved: Math.max(0, slot.capacityReserved - booking.participantsCount),
          capacitySold: slot.capacitySold + booking.participantsCount,
          updatedAt: nowIso(),
        });
      } else if (
        booking.status === 'expired' &&
        slot.status === 'open' &&
        available(slot) >= booking.participantsCount
      ) {
        // Pagamento chegou depois da expiração e ainda há vaga: a reserva volta a valer.
        tx.update(slotRef, {
          capacitySold: slot.capacitySold + booking.participantsCount,
          updatedAt: nowIso(),
        });
      } else {
        throw new BookingDomainError(
          'LATE_PAYMENT_REJECTED',
          'Pagamento recebido para uma reserva que não pode mais ser confirmada.'
        );
      }

      const confirmed: Booking = {
        ...booking,
        status: 'confirmed',
        expiresAt: null,
        paymentIntentId,
        updatedAt: nowIso(),
      };
      tx.set(
        adminDb.collection(BOOKINGS).doc(bookingId),
        BookingPersistenceMapper.toPersistence(confirmed)
      );
      writeAudit(tx, {
        bookingId,
        from: booking.status,
        to: 'confirmed',
        actorUid: 'system:webhook',
        reason: 'payment_succeeded',
      });
      return confirmed;
    });
  }

  async releaseCapacityAndSetStatus(params: {
    bookingId: string;
    to: 'expired' | 'canceled';
    actorUid: string;
    reason: string;
    cancellation?: BookingCancellation;
  }): Promise<Booking> {
    return adminDb.runTransaction(async (tx) => {
      const booking = await readBooking(tx, params.bookingId);
      if (booking.status === params.to) {
        return booking;
      }
      if (!canTransitionBooking(booking.status, params.to)) {
        throw new BookingDomainError('INVALID_TRANSITION', 'Mudança de status não permitida.');
      }
      const slot = await readSlot(tx, booking.slotId);
      const field = booking.status === 'pending_payment' ? 'capacityReserved' : 'capacitySold';
      tx.update(adminDb.collection(SLOTS).doc(slot.id), {
        [field]: Math.max(0, slot[field] - booking.participantsCount),
        updatedAt: nowIso(),
      });
      const updated: Booking = {
        ...booking,
        status: params.to,
        expiresAt: null,
        ...(params.cancellation ? { cancellation: params.cancellation } : {}),
        updatedAt: nowIso(),
      };
      tx.set(
        adminDb.collection(BOOKINGS).doc(booking.id),
        BookingPersistenceMapper.toPersistence(updated)
      );
      writeAudit(tx, {
        bookingId: booking.id,
        from: booking.status,
        to: params.to,
        actorUid: params.actorUid,
        reason: params.reason,
      });
      return updated;
    });
  }

  async setBookingStatus(params: {
    bookingId: string;
    to: BookingStatus;
    actorUid: string;
    reason: string;
  }): Promise<Booking> {
    return adminDb.runTransaction(async (tx) => {
      const booking = await readBooking(tx, params.bookingId);
      if (booking.status === params.to) {
        return booking;
      }
      if (!canTransitionBooking(booking.status, params.to)) {
        throw new BookingDomainError('INVALID_TRANSITION', 'Mudança de status não permitida.');
      }
      const updated: Booking = { ...booking, status: params.to, updatedAt: nowIso() };
      tx.set(
        adminDb.collection(BOOKINGS).doc(booking.id),
        BookingPersistenceMapper.toPersistence(updated)
      );
      writeAudit(tx, {
        bookingId: booking.id,
        from: booking.status,
        to: params.to,
        actorUid: params.actorUid,
        reason: params.reason,
      });
      return updated;
    });
  }

  async recordBookingAudit(bookingId: string, actorUid: string, reason: string): Promise<void> {
    await adminDb
      .collection(AUDIT)
      .add({ bookingId, from: null, to: null, actorUid, reason, at: nowIso() });
  }

  async getBooking(bookingId: string): Promise<Booking | null> {
    const snapshot = await adminDb.collection(BOOKINGS).doc(bookingId).get();
    return snapshot.exists
      ? BookingPersistenceMapper.toDomain(snapshot.id, snapshot.data() ?? {})
      : null;
  }

  async getParticipants(bookingId: string): Promise<BookingParticipant[]> {
    const snapshot = await adminDb
      .collection(PARTICIPANTS)
      .where('bookingId', '==', bookingId)
      .limit(60)
      .get();
    return snapshot.docs.map((doc) => ParticipantPersistenceMapper.toDomain(doc.data()));
  }

  async listBookingsByBuyer(buyerId: string, page: PageRequest): Promise<Page<Booking>> {
    return paginate(
      adminDb.collection(BOOKINGS).where('buyerId', '==', buyerId).orderBy('createdAt', 'desc'),
      page
    );
  }

  async listBookingsByOffer(offerId: string, page: PageRequest): Promise<Page<Booking>> {
    return paginate(
      adminDb.collection(BOOKINGS).where('offerId', '==', offerId).orderBy('createdAt', 'desc'),
      page
    );
  }

  async listBookingsBySlot(slotId: string): Promise<Booking[]> {
    const snapshot = await adminDb
      .collection(BOOKINGS)
      .where('slotId', '==', slotId)
      .limit(500)
      .get();
    return snapshot.docs.map((doc) => BookingPersistenceMapper.toDomain(doc.id, doc.data()));
  }

  async listExpiredPendingBookings(nowIsoValue: string, limit: number): Promise<Booking[]> {
    const snapshot = await adminDb
      .collection(BOOKINGS)
      .where('status', '==', 'pending_payment')
      .where('expiresAt', '<=', nowIsoValue)
      .orderBy('expiresAt', 'asc')
      .limit(limit)
      .get();
    return snapshot.docs.map((doc) => BookingPersistenceMapper.toDomain(doc.id, doc.data()));
  }

  async listConfirmedBookingsStartedBefore(nowIsoValue: string, limit: number): Promise<Booking[]> {
    const snapshot = await adminDb
      .collection(BOOKINGS)
      .where('status', '==', 'confirmed')
      .where('offerSnapshot.startsAt', '<=', nowIsoValue)
      .orderBy('offerSnapshot.startsAt', 'asc')
      .limit(limit)
      .get();
    return snapshot.docs.map((doc) => BookingPersistenceMapper.toDomain(doc.id, doc.data()));
  }
}

=== server/domain/bookings/adapters/guideBookableItemLookupAdapter.ts — ARQUIVO NOVO, conteúdo completo ===
import { getItemByIdUseCase } from '../../guide';
import type { BookableItem, BookableItemLookupPort } from '../ports/bookableItemLookupPort';

export class GuideBookableItemLookupAdapter implements BookableItemLookupPort {
  async getItem(guideItemId: string): Promise<BookableItem | null> {
    const item = await getItemByIdUseCase(guideItemId);
    if (!item?.ownerId) return null;
    return {
      id: item.id,
      ownerId: item.ownerId,
      partnerId:
        typeof item.partnerId === 'string' && item.partnerId ? item.partnerId : item.ownerId,
      category: String(item.category ?? ''),
    };
  }
}

=== server/domain/bookings/adapters/inMemoryBookingsAdapter.ts — ARQUIVO NOVO, conteúdo completo ===
import { BookingDomainError } from '../errors/bookingDomainError';
import type { BookingsPort, PageRequest } from '../ports/bookingsPort';
import {
  type AvailabilitySlot,
  type AvailabilitySlotStatus,
  type BookableOffer,
  type Booking,
  type BookingCancellation,
  type BookingParticipant,
  type BookingStatus,
  canTransitionBooking,
  type Page,
  type PublicBookableOffer,
} from '../types/bookingTypes';

/** Usado SOMENTE por testes (AGENTS.md §2.2 item 7): mesmas regras de vagas do adapter do Firestore. */
export class InMemoryBookingsAdapter implements BookingsPort {
  readonly offers = new Map<string, BookableOffer>();
  readonly publicOffers = new Map<string, PublicBookableOffer>();
  readonly slots = new Map<string, AvailabilitySlot>();
  readonly bookings = new Map<string, Booking>();
  readonly participants = new Map<string, BookingParticipant[]>();
  readonly audit: Array<{ bookingId: string; reason: string }> = [];

  async createOffer(offer: BookableOffer) {
    this.offers.set(offer.id, offer);
  }
  async saveOffer(offer: BookableOffer) {
    this.offers.set(offer.id, offer);
  }
  async getOffer(offerId: string) {
    return this.offers.get(offerId) ?? null;
  }
  async listOffersByOwner(ownerId: string) {
    return [...this.offers.values()].filter((offer) => offer.ownerId === ownerId);
  }
  async listPublishedOffersByGuideItem(guideItemId: string) {
    return [...this.offers.values()].filter(
      (offer) => offer.guideItemId === guideItemId && offer.status === 'published'
    );
  }
  async upsertPublicOfferProjection(offer: PublicBookableOffer) {
    this.publicOffers.set(offer.id, offer);
  }
  async deletePublicOfferProjection(offerId: string) {
    this.publicOffers.delete(offerId);
  }
  async createSlots(slots: AvailabilitySlot[]) {
    const created = slots.filter((slot) => !this.slots.has(slot.id));
    for (const slot of created) this.slots.set(slot.id, { ...slot });
    return created;
  }
  async getSlot(slotId: string) {
    return this.slots.get(slotId) ?? null;
  }
  async listSlots(offerId: string, fromIso: string, toIso: string) {
    return [...this.slots.values()]
      .filter(
        (slot) => slot.offerId === offerId && slot.startsAt >= fromIso && slot.startsAt <= toIso
      )
      .sort((a, b) => a.startsAt.localeCompare(b.startsAt));
  }
  async setSlotStatus(slotId: string, status: AvailabilitySlotStatus) {
    const slot = this.slots.get(slotId);
    if (slot) slot.status = status;
  }

  private available(slot: AvailabilitySlot) {
    return slot.capacityTotal - slot.capacityReserved - slot.capacitySold;
  }

  async reserveCapacityAndCreateBooking(booking: Booking, participants: BookingParticipant[]) {
    const existing = this.bookings.get(booking.id);
    if (existing) return existing;
    const slot = this.slots.get(booking.slotId);
    if (!slot) throw new BookingDomainError('NOT_FOUND', 'Horário não encontrado.');
    if (slot.status !== 'open')
      throw new BookingDomainError('SLOT_UNAVAILABLE', 'Horário indisponível.');
    if (this.available(slot) < booking.participantsCount) {
      throw new BookingDomainError('INSUFFICIENT_CAPACITY', 'Vagas insuficientes.');
    }
    slot.capacityReserved += booking.participantsCount;
    this.bookings.set(booking.id, booking);
    this.participants.set(booking.id, participants);
    return booking;
  }

  async confirmBookingAndCommitCapacity(bookingId: string, paymentIntentId: string) {
    const booking = this.bookings.get(bookingId);
    if (!booking) throw new BookingDomainError('NOT_FOUND', 'Reserva não encontrada.');
    if (booking.status === 'confirmed') return booking;
    const slot = this.slots.get(booking.slotId);
    if (!slot) throw new BookingDomainError('NOT_FOUND', 'Horário não encontrado.');
    if (booking.status === 'pending_payment') {
      slot.capacityReserved -= booking.participantsCount;
      slot.capacitySold += booking.participantsCount;
    } else if (
      booking.status === 'expired' &&
      slot.status === 'open' &&
      this.available(slot) >= booking.participantsCount
    ) {
      slot.capacitySold += booking.participantsCount;
    } else {
      throw new BookingDomainError('LATE_PAYMENT_REJECTED', 'Pagamento não aceito.');
    }
    const confirmed: Booking = {
      ...booking,
      status: 'confirmed',
      expiresAt: null,
      paymentIntentId,
    };
    this.bookings.set(bookingId, confirmed);
    return confirmed;
  }

  async releaseCapacityAndSetStatus(params: {
    bookingId: string;
    to: 'expired' | 'canceled';
    actorUid: string;
    reason: string;
    cancellation?: BookingCancellation;
  }) {
    const booking = this.bookings.get(params.bookingId);
    if (!booking) throw new BookingDomainError('NOT_FOUND', 'Reserva não encontrada.');
    if (booking.status === params.to) return booking;
    if (!canTransitionBooking(booking.status, params.to)) {
      throw new BookingDomainError('INVALID_TRANSITION', 'Mudança não permitida.');
    }
    const slot = this.slots.get(booking.slotId);
    if (slot) {
      if (booking.status === 'pending_payment') slot.capacityReserved -= booking.participantsCount;
      else slot.capacitySold -= booking.participantsCount;
    }
    const updated: Booking = {
      ...booking,
      status: params.to,
      expiresAt: null,
      ...(params.cancellation ? { cancellation: params.cancellation } : {}),
    };
    this.bookings.set(booking.id, updated);
    this.audit.push({ bookingId: booking.id, reason: params.reason });
    return updated;
  }

  async setBookingStatus(params: {
    bookingId: string;
    to: BookingStatus;
    actorUid: string;
    reason: string;
  }) {
    const booking = this.bookings.get(params.bookingId);
    if (!booking) throw new BookingDomainError('NOT_FOUND', 'Reserva não encontrada.');
    if (booking.status === params.to) return booking;
    if (!canTransitionBooking(booking.status, params.to)) {
      throw new BookingDomainError('INVALID_TRANSITION', 'Mudança não permitida.');
    }
    const updated: Booking = { ...booking, status: params.to };
    this.bookings.set(booking.id, updated);
    this.audit.push({ bookingId: booking.id, reason: params.reason });
    return updated;
  }

  async recordBookingAudit(bookingId: string, _actorUid: string, reason: string) {
    this.audit.push({ bookingId, reason });
  }
  async getBooking(bookingId: string) {
    return this.bookings.get(bookingId) ?? null;
  }
  async getParticipants(bookingId: string) {
    return this.participants.get(bookingId) ?? [];
  }

  private page(items: Booking[], page: PageRequest): Page<Booking> {
    const sorted = items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    const start = page.cursor ? sorted.findIndex((item) => item.id === page.cursor) + 1 : 0;
    const data = sorted.slice(start, start + page.limit);
    return {
      data,
      nextCursor: start + page.limit < sorted.length ? (data.at(-1)?.id ?? null) : null,
    };
  }
  async listBookingsByBuyer(buyerId: string, page: PageRequest) {
    return this.page(
      [...this.bookings.values()].filter((b) => b.buyerId === buyerId),
      page
    );
  }
  async listBookingsByOffer(offerId: string, page: PageRequest) {
    return this.page(
      [...this.bookings.values()].filter((b) => b.offerId === offerId),
      page
    );
  }
  async listBookingsBySlot(slotId: string) {
    return [...this.bookings.values()].filter((b) => b.slotId === slotId);
  }
  async listExpiredPendingBookings(nowIso: string, limit: number) {
    return [...this.bookings.values()]
      .filter(
        (b) => b.status === 'pending_payment' && b.expiresAt !== null && b.expiresAt <= nowIso
      )
      .slice(0, limit);
  }
  async listConfirmedBookingsStartedBefore(nowIso: string, limit: number) {
    return [...this.bookings.values()]
      .filter((b) => b.status === 'confirmed' && b.offerSnapshot.startsAt <= nowIso)
      .slice(0, limit);
  }
}

=== server/domain/bookings/dtos/bookingPersistenceMappers.ts — ARQUIVO NOVO, conteúdo completo ===
import type {
  AvailabilitySlot,
  BookableOffer,
  Booking,
  BookingParticipant,
} from '../types/bookingTypes';

type Data = Record<string, unknown>;

function str(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function int(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) ? Math.trunc(value) : 0;
}

/** Converte Timestamp do Firestore (ou string) em ISO; o resto do domínio só vê ISO. */
function iso(value: unknown): string {
  if (typeof value === 'string') return value;
  if (value && typeof value === 'object' && 'toDate' in value) {
    return (value as { toDate(): Date }).toDate().toISOString();
  }
  return '';
}

export const OfferPersistenceMapper = {
  toDomain(id: string, data: Data): BookableOffer {
    return {
      ...(data as unknown as BookableOffer),
      id,
      createdAt: iso(data.createdAt),
      updatedAt: iso(data.updatedAt),
    };
  },
  toPersistence(offer: BookableOffer): Data {
    const { id: _id, ...rest } = offer;
    return JSON.parse(JSON.stringify(rest)) as Data;
  },
};

export const SlotPersistenceMapper = {
  toDomain(id: string, data: Data): AvailabilitySlot {
    return {
      id,
      offerId: str(data.offerId),
      startsAt: iso(data.startsAt),
      ...(data.endsAt ? { endsAt: iso(data.endsAt) } : {}),
      capacityTotal: int(data.capacityTotal),
      capacityReserved: int(data.capacityReserved),
      capacitySold: int(data.capacitySold),
      status: str(data.status, 'closed') as AvailabilitySlot['status'],
      createdAt: iso(data.createdAt),
      updatedAt: iso(data.updatedAt),
    };
  },
  toPersistence(slot: AvailabilitySlot): Data {
    const { id: _id, ...rest } = slot;
    return JSON.parse(JSON.stringify(rest)) as Data;
  },
};

export const BookingPersistenceMapper = {
  toDomain(id: string, data: Data): Booking {
    return {
      ...(data as unknown as Booking),
      id,
      participantsCount: int(data.participantsCount),
      subtotalMinor: int(data.subtotalMinor),
      platformFeeMinor: int(data.platformFeeMinor),
      totalMinor: int(data.totalMinor),
      expiresAt: data.expiresAt ? iso(data.expiresAt) : null,
      createdAt: iso(data.createdAt),
      updatedAt: iso(data.updatedAt),
    };
  },
  toPersistence(booking: Booking): Data {
    const { id: _id, ...rest } = booking;
    return JSON.parse(JSON.stringify(rest)) as Data;
  },
};

export const ParticipantPersistenceMapper = {
  toDomain(data: Data): BookingParticipant {
    return { name: str(data.name), isLeadContact: data.isLeadContact === true };
  },
};

=== server/domain/bookings/errors/bookingDomainError.ts — ARQUIVO NOVO, conteúdo completo ===
export type BookingErrorCode =
  | 'VALIDATION_ERROR'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'SLOT_UNAVAILABLE'
  | 'INSUFFICIENT_CAPACITY'
  | 'INVALID_TRANSITION'
  | 'LATE_PAYMENT_REJECTED'
  | 'KIND_NOT_AVAILABLE'
  | 'CANCELLATION_NOT_ALLOWED';

const STATUS_BY_CODE: Record<BookingErrorCode, number> = {
  VALIDATION_ERROR: 400,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  SLOT_UNAVAILABLE: 409,
  INSUFFICIENT_CAPACITY: 409,
  INVALID_TRANSITION: 409,
  LATE_PAYMENT_REJECTED: 409,
  KIND_NOT_AVAILABLE: 422,
  CANCELLATION_NOT_ALLOWED: 422,
};

export class BookingDomainError extends Error {
  readonly statusCode: number;

  constructor(
    public readonly code: BookingErrorCode,
    message: string
  ) {
    super(message);
    this.name = 'BookingDomainError';
    this.statusCode = STATUS_BY_CODE[code];
  }
}

=== server/domain/bookings/factory.ts — ARQUIVO NOVO, conteúdo completo ===
import { FirestoreBookingsAdapter } from './adapters/firestoreBookingsAdapter';
import { GuideBookableItemLookupAdapter } from './adapters/guideBookableItemLookupAdapter';
import { BookingService } from './services/bookingService';
import { OfferService } from './services/offerService';

let offerService: OfferService | null = null;
let bookingService: BookingService | null = null;
let port: FirestoreBookingsAdapter | null = null;

function getPort(): FirestoreBookingsAdapter {
  port ??= new FirestoreBookingsAdapter();
  return port;
}

export function getOfferService(): OfferService {
  offerService ??= new OfferService(getPort(), new GuideBookableItemLookupAdapter());
  return offerService;
}

export function getBookingService(): BookingService {
  bookingService ??= new BookingService(getPort());
  return bookingService;
}

=== server/domain/bookings/index.ts — ARQUIVO NOVO, conteúdo completo ===
export { cancelBookingForCanceledSlotUseCase } from './usecases/cancelBookingForCanceledSlotUseCase';
export { cancelSlotByPartnerUseCase } from './usecases/cancelSlotByPartnerUseCase';
export { completeFinishedBookingsUseCase } from './usecases/completeFinishedBookingsUseCase';
export { confirmBookingPaymentUseCase } from './usecases/confirmBookingPaymentUseCase';
export { createAvailabilitySlotsUseCase } from './usecases/createAvailabilitySlotsUseCase';
export { createBookableOfferUseCase } from './usecases/createBookableOfferUseCase';
export { createPendingBookingUseCase } from './usecases/createPendingBookingUseCase';
export { expireOverdueBookingsUseCase } from './usecases/expireOverdueBookingsUseCase';
export { getBookingForActorUseCase } from './usecases/getBookingForActorUseCase';
export { getBookingUseCase } from './usecases/getBookingUseCase';
export { listAvailableSlotsUseCase } from './usecases/listAvailableSlotsUseCase';
export { listMyBookingsUseCase } from './usecases/listMyBookingsUseCase';
export { listOfferBookingsForPartnerUseCase } from './usecases/listOfferBookingsForPartnerUseCase';
export { listPartnerOffersUseCase } from './usecases/listPartnerOffersUseCase';
export { markBookingDisputedUseCase } from './usecases/markBookingDisputedUseCase';
export { markBookingNoShowUseCase } from './usecases/markBookingNoShowUseCase';
export { markBookingPaymentFailedUseCase } from './usecases/markBookingPaymentFailedUseCase';
export { markBookingRefundedUseCase } from './usecases/markBookingRefundedUseCase';
export { requestCancellationByBuyerUseCase } from './usecases/requestCancellationByBuyerUseCase';
export { setBookableOfferStatusUseCase } from './usecases/setBookableOfferStatusUseCase';
export { updateBookableOfferUseCase } from './usecases/updateBookableOfferUseCase';

export { BookingDomainError, type BookingErrorCode } from './errors/bookingDomainError';
export type { PageRequest } from './ports/bookingsPort';
export type {
  BookingDetails,
  BuyerCancellationResult,
  CreatePendingBookingInput,
} from './services/bookingService';
export type { CreateSlotsInput, OfferInput } from './services/offerService';
export {
  type AvailabilitySlot,
  type BookableOffer,
  type BookableOfferKind,
  type BookableOfferStatus,
  type Booking,
  type BookingActor,
  type BookingParticipant,
  type BookingStatus,
  canTransitionBooking,
  type LocalizedText,
  type Page,
  type PublicSlot,
} from './types/bookingTypes';
export { priceBookingLines } from './utils/bookingPricing';
export { calculateCancellationRefund } from './utils/cancellationRefund';

=== server/domain/bookings/ports/bookableItemLookupPort.ts — ARQUIVO NOVO, conteúdo completo ===
/** Item do catálogo (domínio guide) visto pelo bookings: só o que a regra de oferta precisa. */
export interface BookableItem {
  id: string;
  ownerId: string;
  partnerId: string;
  category: string;
}

export interface BookableItemLookupPort {
  getItem(guideItemId: string): Promise<BookableItem | null>;
}

=== server/domain/bookings/ports/bookingsPort.ts — ARQUIVO NOVO, conteúdo completo ===
import type {
  AvailabilitySlot,
  AvailabilitySlotStatus,
  BookableOffer,
  Booking,
  BookingCancellation,
  BookingParticipant,
  BookingStatus,
  Page,
  PublicBookableOffer,
} from '../types/bookingTypes';

export interface PageRequest {
  cursor?: string | null;
  limit: number;
}

/**
 * Persistência do domínio. Toda operação que mexe em vagas é transacional no adapter;
 * toda mudança de status valida `canTransitionBooking` e grava auditoria.
 */
export interface BookingsPort {
  createOffer(offer: BookableOffer): Promise<void>;
  saveOffer(offer: BookableOffer): Promise<void>;
  getOffer(offerId: string): Promise<BookableOffer | null>;
  listOffersByOwner(ownerId: string): Promise<BookableOffer[]>;
  listPublishedOffersByGuideItem(guideItemId: string): Promise<BookableOffer[]>;
  upsertPublicOfferProjection(offer: PublicBookableOffer): Promise<void>;
  deletePublicOfferProjection(offerId: string): Promise<void>;

  /** Cria só os horários cujo ID ainda não existe; devolve os criados. */
  createSlots(slots: AvailabilitySlot[]): Promise<AvailabilitySlot[]>;
  getSlot(slotId: string): Promise<AvailabilitySlot | null>;
  listSlots(offerId: string, fromIso: string, toIso: string): Promise<AvailabilitySlot[]>;
  setSlotStatus(slotId: string, status: AvailabilitySlotStatus): Promise<void>;

  /** Idempotente pelo ID da reserva; lança INSUFFICIENT_CAPACITY ou SLOT_UNAVAILABLE. */
  reserveCapacityAndCreateBooking(
    booking: Booking,
    participants: BookingParticipant[]
  ): Promise<Booking>;
  /** Idempotente: já confirmada devolve a atual. Pagamento que não pode ser aceito → LATE_PAYMENT_REJECTED. */
  confirmBookingAndCommitCapacity(bookingId: string, paymentIntentId: string): Promise<Booking>;
  /** Devolve as vagas (reservadas ou vendidas, conforme o status atual) e muda o status. */
  releaseCapacityAndSetStatus(params: {
    bookingId: string;
    to: 'expired' | 'canceled';
    actorUid: string;
    reason: string;
    cancellation?: BookingCancellation;
  }): Promise<Booking>;
  setBookingStatus(params: {
    bookingId: string;
    to: BookingStatus;
    actorUid: string;
    reason: string;
  }): Promise<Booking>;
  /** Só auditoria, sem mudar status (ex: pagamento recusado que ainda pode ser tentado de novo). */
  recordBookingAudit(bookingId: string, actorUid: string, reason: string): Promise<void>;

  getBooking(bookingId: string): Promise<Booking | null>;
  getParticipants(bookingId: string): Promise<BookingParticipant[]>;
  listBookingsByBuyer(buyerId: string, page: PageRequest): Promise<Page<Booking>>;
  listBookingsByOffer(offerId: string, page: PageRequest): Promise<Page<Booking>>;
  listBookingsBySlot(slotId: string): Promise<Booking[]>;
  listExpiredPendingBookings(nowIso: string, limit: number): Promise<Booking[]>;
  listConfirmedBookingsStartedBefore(nowIso: string, limit: number): Promise<Booking[]>;
}

=== server/domain/bookings/services/bookingService.test.ts — ARQUIVO NOVO, conteúdo completo ===
import { describe, expect, it } from 'vitest';
import { InMemoryBookingsAdapter } from '../adapters/inMemoryBookingsAdapter';
import type { BookableOffer } from '../types/bookingTypes';
import { BookingService, type CreatePendingBookingInput } from './bookingService';

const BUYER = { uid: 'buyer-1', admin: false };
const STARTS_AT = '2026-11-10T11:00:00.000Z';

function buildOffer(overrides: Partial<BookableOffer> = {}): BookableOffer {
  return {
    id: 'offer-1',
    guideItemId: 'item-1',
    ownerId: 'partner-1',
    partnerId: 'partner-1',
    kind: 'tour',
    title: { 'pt-BR': 'Passeio' },
    status: 'published',
    pricing: {
      currency: 'BRL',
      priceOptions: [{ id: 'adult', label: { 'pt-BR': 'Adulto' }, unitAmountMinor: 10000 }],
    },
    durationMinutes: 120,
    cancellationPolicy: { freeCancellationHoursBefore: 24, refundPercentAfterDeadline: 50 },
    maxParticipantsPerBooking: 6,
    requiresParticipantNames: false,
    createdAt: '2026-10-01T00:00:00.000Z',
    updatedAt: '2026-10-01T00:00:00.000Z',
    ...overrides,
  };
}

function setup(options: { now?: string; capacity?: number; offer?: Partial<BookableOffer> } = {}) {
  const port = new InMemoryBookingsAdapter();
  port.offers.set('offer-1', buildOffer(options.offer));
  for (const id of ['slot-1', 'slot-other']) {
    port.slots.set(id, {
      id,
      offerId: id === 'slot-1' ? 'offer-1' : 'offer-2',
      startsAt: STARTS_AT,
      capacityTotal: options.capacity ?? 4,
      capacityReserved: 0,
      capacitySold: 0,
      status: 'open',
      createdAt: '',
      updatedAt: '',
    });
  }
  let now = new Date(options.now ?? '2026-11-01T12:00:00.000Z');
  const service = new BookingService(port, () => now);
  const setNow = (iso: string) => {
    now = new Date(iso);
  };
  return { port, service, setNow };
}

const INPUT: CreatePendingBookingInput = {
  offerId: 'offer-1',
  slotId: 'slot-1',
  lines: [{ priceOptionId: 'adult', quantity: 2 }],
  participants: [],
  idempotencyKey: 'key-12345',
  locale: 'pt-BR',
};

describe('BookingService', () => {
  it('cria reserva pendente com preço do backend, vagas reservadas e prazo de 15 min', async () => {
    const { service, port } = setup();
    const booking = await service.createPendingBooking(BUYER, INPUT, 10);
    expect(booking).toMatchObject({
      status: 'pending_payment',
      totalMinor: 20000,
      platformFeeMinor: 2000,
      sellerPartnerId: 'partner-1',
      expiresAt: '2026-11-01T12:15:00.000Z',
    });
    expect(port.slots.get('slot-1')?.capacityReserved).toBe(2);
  });

  it('mesma chave de idempotência devolve a mesma reserva sem reservar de novo', async () => {
    const { service, port } = setup();
    const first = await service.createPendingBooking(BUYER, INPUT, 10);
    const second = await service.createPendingBooking(BUYER, INPUT, 10);
    expect(second.id).toBe(first.id);
    expect(port.slots.get('slot-1')?.capacityReserved).toBe(2);
  });

  it('horário de outra oferta → VALIDATION_ERROR; vagas insuficientes → 409', async () => {
    const { service } = setup({ capacity: 1 });
    await expect(
      service.createPendingBooking(BUYER, { ...INPUT, slotId: 'slot-other' }, 10)
    ).rejects.toMatchObject({ code: 'VALIDATION_ERROR' });
    await expect(service.createPendingBooking(BUYER, INPUT, 10)).rejects.toMatchObject({
      code: 'INSUFFICIENT_CAPACITY',
      statusCode: 409,
    });
  });

  it('exige um nome por participante quando a oferta pede', async () => {
    const { service } = setup({ offer: { requiresParticipantNames: true } });
    await expect(
      service.createPendingBooking(BUYER, { ...INPUT, participants: [{ name: 'Ana' }] }, 10)
    ).rejects.toMatchObject({ code: 'VALIDATION_ERROR' });
    const booking = await service.createPendingBooking(
      BUYER,
      { ...INPUT, participants: [{ name: 'Ana' }, { name: 'Bia' }] },
      10
    );
    expect(booking.status).toBe('pending_payment');
  });

  it('terceiro não vê a reserva (404); comprador e parceiro vendedor veem', async () => {
    const { service } = setup();
    const booking = await service.createPendingBooking(BUYER, INPUT, 10);
    await expect(
      service.getBookingForActor({ uid: 'intruso', admin: false }, booking.id)
    ).rejects.toMatchObject({ code: 'NOT_FOUND' });
    await expect(service.getBookingForActor(BUYER, booking.id)).resolves.toBeTruthy();
    await expect(
      service.getBookingForActor({ uid: 'partner-1', admin: false }, booking.id)
    ).resolves.toBeTruthy();
  });

  it('confirmação move vagas de reservadas para vendidas e é idempotente', async () => {
    const { service, port } = setup();
    const booking = await service.createPendingBooking(BUYER, INPUT, 10);
    await service.confirmBookingPayment(booking.id, 'pi_1');
    await service.confirmBookingPayment(booking.id, 'pi_1');
    expect(port.slots.get('slot-1')).toMatchObject({ capacityReserved: 0, capacitySold: 2 });
    expect(port.bookings.get(booking.id)?.status).toBe('confirmed');
  });

  it('expiração devolve as vagas; pagamento tardio sem vaga é recusado', async () => {
    const { service, port, setNow } = setup({ capacity: 2 });
    const booking = await service.createPendingBooking(BUYER, INPUT, 10);
    setNow('2026-11-01T12:16:00.000Z');
    await expect(service.expireOverdueBookings()).resolves.toBe(1);
    expect(port.slots.get('slot-1')?.capacityReserved).toBe(0);
    const other = await service.createPendingBooking({ uid: 'buyer-2', admin: false }, INPUT, 10);
    await service.confirmBookingPayment(other.id, 'pi_2');
    await expect(service.confirmBookingPayment(booking.id, 'pi_1')).rejects.toMatchObject({
      code: 'LATE_PAYMENT_REJECTED',
    });
  });

  it('cancelamento pelo comprador: 100% antes do prazo, repetível, devolve a vaga', async () => {
    const { service, port } = setup();
    const booking = await service.createPendingBooking(BUYER, INPUT, 10);
    await service.confirmBookingPayment(booking.id, 'pi_1');
    const first = await service.requestCancellationByBuyer(BUYER, booking.id, 'mudança de planos');
    expect(first).toMatchObject({ refundPercent: 100, refundAmountMinor: 20000 });
    expect(port.slots.get('slot-1')?.capacitySold).toBe(0);
    const again = await service.requestCancellationByBuyer(BUYER, booking.id, '');
    expect(again.refundAmountMinor).toBe(20000);
  });

  it('cancelamento depois do prazo devolve 50%; outra pessoa não cancela', async () => {
    const { service, setNow } = setup();
    const booking = await service.createPendingBooking(BUYER, INPUT, 10);
    await service.confirmBookingPayment(booking.id, 'pi_1');
    await expect(
      service.requestCancellationByBuyer({ uid: 'intruso', admin: false }, booking.id, '')
    ).rejects.toMatchObject({ code: 'NOT_FOUND' });
    setNow('2026-11-10T00:00:00.000Z');
    await expect(service.requestCancellationByBuyer(BUYER, booking.id, '')).resolves.toMatchObject({
      refundPercent: 50,
      refundAmountMinor: 10000,
    });
  });

  it('reserva pendente não pode ser cancelada pelo comprador', async () => {
    const { service } = setup();
    const booking = await service.createPendingBooking(BUYER, INPUT, 10);
    await expect(service.requestCancellationByBuyer(BUYER, booking.id, '')).rejects.toMatchObject({
      code: 'CANCELLATION_NOT_ALLOWED',
    });
  });

  it('não comparecimento só pelo parceiro e só depois do início; conclusão após a duração', async () => {
    const { service, port, setNow } = setup();
    const booking = await service.createPendingBooking(BUYER, INPUT, 10);
    await service.confirmBookingPayment(booking.id, 'pi_1');
    const partner = { uid: 'partner-1', admin: false };
    await expect(service.markBookingNoShow(partner, booking.id)).rejects.toMatchObject({
      code: 'INVALID_TRANSITION',
    });
    setNow('2026-11-10T12:00:00.000Z');
    await expect(service.completeFinishedBookings()).resolves.toBe(0);
    setNow('2026-11-10T13:00:00.000Z');
    await expect(service.completeFinishedBookings()).resolves.toBe(1);
    expect(port.bookings.get(booking.id)?.status).toBe('completed');
  });
});

=== server/domain/bookings/services/bookingService.ts — ARQUIVO NOVO, conteúdo completo ===
import type { Locale } from '../../../shared/kernel/locale';
import { BookingDomainError } from '../errors/bookingDomainError';
import type { BookingsPort, PageRequest } from '../ports/bookingsPort';
import type {
  Booking,
  BookingActor,
  BookingCancellation,
  BookingParticipant,
  Page,
} from '../types/bookingTypes';
import { buildBookingId } from '../utils/buildBookingId';
import { priceBookingLines } from '../utils/bookingPricing';
import { calculateCancellationRefund } from '../utils/cancellationRefund';

// Tempo para pagar antes de a vaga voltar para a venda (inclui o Pix, que é assíncrono).
const PAYMENT_WINDOW_MS = 15 * 60 * 1000;
const SYSTEM_ACTOR = 'system';

export interface CreatePendingBookingInput {
  offerId: string;
  slotId: string;
  lines: Array<{ priceOptionId: string; quantity: number }>;
  participants: Array<{ name: string }>;
  idempotencyKey: string;
  locale: Locale;
}

export interface BuyerCancellationResult {
  booking: Booking;
  refundPercent: 0 | 50 | 100;
  refundAmountMinor: number;
}

export interface BookingDetails {
  booking: Booking;
  participants: BookingParticipant[];
}

export class BookingService {
  constructor(
    private readonly port: BookingsPort,
    private readonly now: () => Date = () => new Date()
  ) {}

  async createPendingBooking(
    actor: BookingActor,
    input: CreatePendingBookingInput,
    platformFeePercent: number
  ): Promise<Booking> {
    const offer = await this.port.getOffer(input.offerId);
    if (offer?.status !== 'published') {
      throw new BookingDomainError('NOT_FOUND', 'Oferta não encontrada.');
    }
    const slot = await this.port.getSlot(input.slotId);
    if (slot?.offerId !== offer.id) {
      throw new BookingDomainError('VALIDATION_ERROR', 'Horário não pertence a esta oferta.');
    }
    const priced = priceBookingLines(offer, input.lines, platformFeePercent);

    const names = input.participants.map((participant) => participant.name.trim());
    if (offer.requiresParticipantNames) {
      if (names.length !== priced.participantsCount) {
        throw new BookingDomainError('VALIDATION_ERROR', 'Informe o nome de cada participante.');
      }
      if (names.some((name) => name.length < 2 || name.length > 80)) {
        throw new BookingDomainError('VALIDATION_ERROR', 'Nome de participante inválido.');
      }
    }

    const nowDate = this.now();
    const timestamp = nowDate.toISOString();
    const booking: Booking = {
      id: buildBookingId(actor.uid, input.idempotencyKey),
      offerId: offer.id,
      slotId: slot.id,
      guideItemId: offer.guideItemId,
      buyerId: actor.uid,
      sellerPartnerId: offer.partnerId,
      kind: offer.kind,
      status: 'pending_payment',
      ...priced,
      expiresAt: new Date(nowDate.getTime() + PAYMENT_WINDOW_MS).toISOString(),
      offerSnapshot: {
        title: offer.title['pt-BR'],
        startsAt: slot.startsAt,
        ...(offer.durationMinutes ? { durationMinutes: offer.durationMinutes } : {}),
        ...(offer.meetingPoint ? { meetingPoint: offer.meetingPoint.address } : {}),
        cancellationPolicy: offer.cancellationPolicy,
      },
      locale: input.locale,
      idempotencyKey: input.idempotencyKey,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    const participants = offer.requiresParticipantNames
      ? names.map((name, index) => ({ name, isLeadContact: index === 0 }))
      : [];
    return this.port.reserveCapacityAndCreateBooking(booking, participants);
  }

  async getBookingForActor(actor: BookingActor, bookingId: string): Promise<BookingDetails> {
    const booking = await this.port.getBooking(bookingId);
    const allowed =
      booking &&
      (actor.admin || booking.buyerId === actor.uid || booking.sellerPartnerId === actor.uid);
    // Reserva de terceiros responde como inexistente (proteção contra IDOR, AGENTS.md §7.10).
    if (!booking || !allowed) {
      throw new BookingDomainError('NOT_FOUND', 'Reserva não encontrada.');
    }
    return { booking, participants: await this.port.getParticipants(bookingId) };
  }

  async getBooking(bookingId: string): Promise<Booking | null> {
    return this.port.getBooking(bookingId);
  }

  async listBuyerBookings(actor: BookingActor, page: PageRequest): Promise<Page<Booking>> {
    return this.port.listBookingsByBuyer(actor.uid, page);
  }

  async listOfferBookings(offerId: string, page: PageRequest): Promise<Page<Booking>> {
    return this.port.listBookingsByOffer(offerId, page);
  }

  async confirmBookingPayment(bookingId: string, paymentIntentId: string): Promise<Booking> {
    return this.port.confirmBookingAndCommitCapacity(bookingId, paymentIntentId);
  }

  /** A reserva continua aguardando pagamento: o comprador pode tentar de novo até expirar. */
  async markBookingPaymentFailed(bookingId: string): Promise<void> {
    await this.port.recordBookingAudit(bookingId, 'system:webhook', 'payment_failed');
  }

  async expireOverdueBookings(limit = 200): Promise<number> {
    const overdue = await this.port.listExpiredPendingBookings(this.now().toISOString(), limit);
    let expired = 0;
    for (const booking of overdue) {
      try {
        await this.port.releaseCapacityAndSetStatus({
          bookingId: booking.id,
          to: 'expired',
          actorUid: SYSTEM_ACTOR,
          reason: 'payment_window_elapsed',
        });
        expired += 1;
      } catch (error) {
        // Uma reserva confirmada no meio do caminho não pode travar as demais.
        if (!(error instanceof BookingDomainError)) throw error;
      }
    }
    return expired;
  }

  /** Cancela pelo comprador e devolve o reembolso devido. Repetir devolve o mesmo resultado. */
  async requestCancellationByBuyer(
    actor: BookingActor,
    bookingId: string,
    reason: string
  ): Promise<BuyerCancellationResult> {
    const booking = await this.port.getBooking(bookingId);
    if (!booking || booking.buyerId !== actor.uid) {
      throw new BookingDomainError('NOT_FOUND', 'Reserva não encontrada.');
    }
    if (booking.status === 'canceled' && booking.cancellation?.by === 'buyer') {
      return {
        booking,
        refundPercent: booking.cancellation.refundPercent,
        refundAmountMinor: booking.cancellation.refundAmountMinor,
      };
    }
    if (booking.status !== 'confirmed') {
      throw new BookingDomainError(
        'CANCELLATION_NOT_ALLOWED',
        'Esta reserva não pode ser cancelada.'
      );
    }
    const nowDate = this.now();
    const refund = calculateCancellationRefund({
      policy: booking.offerSnapshot.cancellationPolicy,
      startsAt: booking.offerSnapshot.startsAt,
      totalMinor: booking.totalMinor,
      now: nowDate,
    });
    const cancellation: BookingCancellation = {
      by: 'buyer',
      ...refund,
      reason: reason.slice(0, 300),
      at: nowDate.toISOString(),
    };
    const updated = await this.port.releaseCapacityAndSetStatus({
      bookingId,
      to: 'canceled',
      actorUid: actor.uid,
      reason: 'buyer_canceled',
      cancellation,
    });
    return { booking: updated, ...refund };
  }

  /** Cancela uma reserva do horário cancelado pelo parceiro: reembolso sempre integral. */
  async cancelBookingForCanceledSlot(bookingId: string, actorUid: string): Promise<Booking> {
    const booking = await this.port.getBooking(bookingId);
    if (!booking) {
      throw new BookingDomainError('NOT_FOUND', 'Reserva não encontrada.');
    }
    return this.port.releaseCapacityAndSetStatus({
      bookingId,
      to: 'canceled',
      actorUid,
      reason: 'slot_canceled_by_partner',
      cancellation: {
        by: 'partner',
        refundPercent: 100,
        refundAmountMinor: booking.status === 'confirmed' ? booking.totalMinor : 0,
        reason: 'slot_canceled',
        at: this.now().toISOString(),
      },
    });
  }

  async markBookingRefunded(bookingId: string): Promise<Booking> {
    return this.port.setBookingStatus({
      bookingId,
      to: 'refunded',
      actorUid: 'system:webhook',
      reason: 'refund_succeeded',
    });
  }

  async markBookingDisputed(bookingId: string): Promise<Booking> {
    return this.port.setBookingStatus({
      bookingId,
      to: 'disputed',
      actorUid: 'system:webhook',
      reason: 'dispute_created',
    });
  }

  async markBookingNoShow(actor: BookingActor, bookingId: string): Promise<Booking> {
    const booking = await this.port.getBooking(bookingId);
    if (!booking || (!actor.admin && booking.sellerPartnerId !== actor.uid)) {
      throw new BookingDomainError('NOT_FOUND', 'Reserva não encontrada.');
    }
    if (this.now().getTime() < new Date(booking.offerSnapshot.startsAt).getTime()) {
      throw new BookingDomainError('INVALID_TRANSITION', 'Só é possível marcar após o início.');
    }
    return this.port.setBookingStatus({
      bookingId,
      to: 'no_show',
      actorUid: actor.uid,
      reason: 'no_show',
    });
  }

  async completeFinishedBookings(limit = 200): Promise<number> {
    const nowDate = this.now();
    const started = await this.port.listConfirmedBookingsStartedBefore(
      nowDate.toISOString(),
      limit
    );
    let completed = 0;
    for (const booking of started) {
      const endsAtMs =
        new Date(booking.offerSnapshot.startsAt).getTime() +
        (booking.offerSnapshot.durationMinutes ?? 0) * 60_000;
      if (endsAtMs > nowDate.getTime()) continue;
      await this.port.setBookingStatus({
        bookingId: booking.id,
        to: 'completed',
        actorUid: SYSTEM_ACTOR,
        reason: 'finished',
      });
      completed += 1;
    }
    return completed;
  }
}

=== server/domain/bookings/services/offerService.test.ts — ARQUIVO NOVO, conteúdo completo ===
import { describe, expect, it } from 'vitest';
import { InMemoryBookingsAdapter } from '../adapters/inMemoryBookingsAdapter';
import type { BookableItem, BookableItemLookupPort } from '../ports/bookableItemLookupPort';
import { type OfferInput, OfferService } from './offerService';

const NOW = new Date('2026-11-01T12:00:00.000Z');
const OWNER = { uid: 'partner-1', admin: false };

const INPUT: OfferInput = {
  title: { 'pt-BR': 'Passeio Lagoa do Paraíso' },
  pricing: {
    currency: 'BRL',
    priceOptions: [{ id: 'adult', label: { 'pt-BR': 'Adulto' }, unitAmountMinor: 15000 }],
  },
  durationMinutes: 240,
  cancellationPolicy: { freeCancellationHoursBefore: 24, refundPercentAfterDeadline: 50 },
  maxParticipantsPerBooking: 8,
  requiresParticipantNames: false,
};

function setup(item: Partial<BookableItem> | null = {}) {
  const port = new InMemoryBookingsAdapter();
  const items: BookableItemLookupPort = {
    getItem: async () =>
      item === null
        ? null
        : { id: 'item-1', ownerId: 'partner-1', partnerId: 'partner-1', category: 'tour', ...item },
  };
  let counter = 0;
  const service = new OfferService(
    port,
    items,
    () => NOW,
    () => {
      counter += 1;
      return `id${counter}`;
    }
  );
  return { port, service };
}

describe('OfferService', () => {
  it('cria oferta em rascunho com dono e parceiro vindos do item', async () => {
    const { service } = setup();
    const offer = await service.createOffer(OWNER, {
      ...INPUT,
      guideItemId: 'item-1',
      kind: 'tour',
    });
    expect(offer).toMatchObject({
      id: 'offer_id1',
      status: 'draft',
      ownerId: 'partner-1',
      partnerId: 'partner-1',
    });
  });

  it('item de outro dono → FORBIDDEN', async () => {
    const { service } = setup({ ownerId: 'outro' });
    await expect(
      service.createOffer(OWNER, { ...INPUT, guideItemId: 'item-1', kind: 'tour' })
    ).rejects.toMatchObject({ code: 'FORBIDDEN', statusCode: 403 });
  });

  it('rental e transfer ainda não estão disponíveis', async () => {
    const { service } = setup();
    await expect(
      service.createOffer(OWNER, { ...INPUT, guideItemId: 'item-1', kind: 'rental' })
    ).rejects.toMatchObject({ code: 'KIND_NOT_AVAILABLE', statusCode: 422 });
  });

  it('tipo incompatível com a categoria do item e preço não inteiro são recusados', async () => {
    const { service } = setup({ category: 'restaurant' });
    await expect(
      service.createOffer(OWNER, { ...INPUT, guideItemId: 'item-1', kind: 'tour' })
    ).rejects.toMatchObject({ code: 'VALIDATION_ERROR' });
    const ok = setup();
    await expect(
      ok.service.createOffer(OWNER, {
        ...INPUT,
        pricing: {
          currency: 'BRL',
          priceOptions: [{ id: 'a', label: { 'pt-BR': 'A' }, unitAmountMinor: 150.9 }],
        },
        guideItemId: 'item-1',
        kind: 'tour',
      })
    ).rejects.toMatchObject({ code: 'VALIDATION_ERROR' });
  });

  it('publicar cria a projeção pública sem dono; pausar remove', async () => {
    const { service, port } = setup();
    const offer = await service.createOffer(OWNER, {
      ...INPUT,
      guideItemId: 'item-1',
      kind: 'tour',
    });
    await service.setOfferStatus(OWNER, offer.id, 'published');
    const projection = port.publicOffers.get(offer.id);
    expect(projection).toMatchObject({ status: 'published' });
    expect(projection).not.toHaveProperty('ownerId');
    expect(projection).not.toHaveProperty('partnerId');
    await service.setOfferStatus(OWNER, offer.id, 'paused');
    expect(port.publicOffers.has(offer.id)).toBe(false);
  });

  it('oferta de outro parceiro responde como inexistente', async () => {
    const { service } = setup();
    const offer = await service.createOffer(OWNER, {
      ...INPUT,
      guideItemId: 'item-1',
      kind: 'tour',
    });
    await expect(
      service.setOfferStatus({ uid: 'intruso', admin: false }, offer.id, 'published')
    ).rejects.toMatchObject({ code: 'NOT_FOUND' });
  });

  it('recorrência cria horários em UTC, ignora passados e repetidos', async () => {
    const { service } = setup();
    const offer = await service.createOffer(OWNER, {
      ...INPUT,
      guideItemId: 'item-1',
      kind: 'tour',
    });
    const recurrence = {
      mode: 'recurrence' as const,
      capacity: 10,
      startDate: '2026-11-01',
      endDate: '2026-11-03',
      weekdays: [0, 1, 2],
      times: ['08:00'],
    };
    const created = await service.createSlots(OWNER, offer.id, recurrence);
    // 01/11 08:00 local = 11:00Z, antes de NOW (12:00Z): fica de fora.
    expect(created.map((slot) => slot.startsAt)).toEqual([
      '2026-11-02T11:00:00.000Z',
      '2026-11-03T11:00:00.000Z',
    ]);
    expect(created[0]?.endsAt).toBe('2026-11-02T15:00:00.000Z');
    await expect(service.createSlots(OWNER, offer.id, recurrence)).resolves.toEqual([]);
  });

  it('mais de 200 horários por vez é recusado', async () => {
    const { service } = setup();
    const offer = await service.createOffer(OWNER, {
      ...INPUT,
      guideItemId: 'item-1',
      kind: 'tour',
    });
    await expect(
      service.createSlots(OWNER, offer.id, {
        mode: 'recurrence',
        capacity: 5,
        startDate: '2026-11-02',
        endDate: '2027-02-28',
        weekdays: [0, 1, 2, 3, 4, 5, 6],
        times: ['08:00', '14:00'],
      })
    ).rejects.toMatchObject({ code: 'VALIDATION_ERROR' });
  });

  it('horários públicos só de oferta publicada, sem dados internos', async () => {
    const { service } = setup();
    const offer = await service.createOffer(OWNER, {
      ...INPUT,
      guideItemId: 'item-1',
      kind: 'tour',
    });
    await service.createSlots(OWNER, offer.id, {
      mode: 'list',
      capacity: 4,
      slots: [{ startsAt: '2026-11-05T11:00:00.000Z' }],
    });
    await expect(
      service.listAvailableSlots(offer.id, '2026-11-01T00:00:00.000Z', '2026-12-01T00:00:00.000Z')
    ).rejects.toMatchObject({ code: 'NOT_FOUND' });
    await service.setOfferStatus(OWNER, offer.id, 'published');
    const slots = await service.listAvailableSlots(
      offer.id,
      '2026-11-01T00:00:00.000Z',
      '2026-12-01T00:00:00.000Z'
    );
    expect(slots).toEqual([
      {
        id: expect.any(String),
        startsAt: '2026-11-05T11:00:00.000Z',
        endsAt: '2026-11-05T15:00:00.000Z',
        available: 4,
      },
    ]);
  });
});

=== server/domain/bookings/services/offerService.ts — ARQUIVO NOVO, conteúdo completo ===
import { BookingDomainError } from '../errors/bookingDomainError';
import type { BookableItemLookupPort } from '../ports/bookableItemLookupPort';
import type { BookingsPort } from '../ports/bookingsPort';
import {
  AVAILABLE_OFFER_KINDS,
  type AvailabilitySlot,
  type BookableOffer,
  type BookableOfferKind,
  type BookableOfferStatus,
  type Booking,
  type BookingActor,
  type PublicBookableOffer,
  type PublicSlot,
} from '../types/bookingTypes';
import { buildSlotId } from '../utils/buildBookingId';
import { expandSlotRecurrence, type SlotRecurrence } from '../utils/slotRecurrence';

const MAX_SLOTS_PER_REQUEST = 200;

// Fase 1: passeio vende horário de passeio; atração privada vende entrada (decisão D3).
const CATEGORY_BY_KIND: Partial<Record<BookableOfferKind, string>> = {
  tour: 'tour',
  private_entry: 'sight',
};

const OFFER_STATUS_TRANSITIONS: Record<BookableOfferStatus, readonly BookableOfferStatus[]> = {
  draft: ['published', 'archived'],
  published: ['paused', 'archived'],
  paused: ['published', 'archived'],
  archived: [],
};

export type OfferInput = Pick<
  BookableOffer,
  | 'title'
  | 'description'
  | 'pricing'
  | 'durationMinutes'
  | 'meetingPoint'
  | 'cancellationPolicy'
  | 'maxParticipantsPerBooking'
  | 'requiresParticipantNames'
>;

export type CreateSlotsInput =
  | { mode: 'list'; slots: Array<{ startsAt: string; endsAt?: string }>; capacity: number }
  | ({ mode: 'recurrence'; capacity: number } & SlotRecurrence);

function assertValidPricing(pricing: BookableOffer['pricing']): void {
  if (pricing.priceOptions.length === 0) {
    throw new BookingDomainError('VALIDATION_ERROR', 'Informe ao menos uma opção de preço.');
  }
  for (const option of pricing.priceOptions) {
    if (!Number.isInteger(option.unitAmountMinor) || option.unitAmountMinor <= 0) {
      throw new BookingDomainError(
        'VALIDATION_ERROR',
        'Preço deve ser um valor inteiro em centavos.'
      );
    }
  }
}

export function toPublicOffer(offer: BookableOffer): PublicBookableOffer {
  const { ownerId: _owner, partnerId: _partner, createdAt: _created, ...publicFields } = offer;
  return publicFields;
}

export class OfferService {
  constructor(
    private readonly port: BookingsPort,
    private readonly items: BookableItemLookupPort,
    private readonly now: () => Date = () => new Date(),
    private readonly newId: () => string = () => crypto.randomUUID()
  ) {}

  async createOffer(
    actor: BookingActor,
    input: OfferInput & { guideItemId: string; kind: BookableOfferKind }
  ): Promise<BookableOffer> {
    if (!AVAILABLE_OFFER_KINDS.includes(input.kind)) {
      throw new BookingDomainError(
        'KIND_NOT_AVAILABLE',
        'Este tipo de oferta ainda não está disponível.'
      );
    }
    const item = await this.items.getItem(input.guideItemId);
    if (!item) {
      throw new BookingDomainError('NOT_FOUND', 'Item do guia não encontrado.');
    }
    if (!actor.admin && item.ownerId !== actor.uid) {
      throw new BookingDomainError('FORBIDDEN', 'Você não é o dono deste item.');
    }
    if (CATEGORY_BY_KIND[input.kind] !== item.category) {
      throw new BookingDomainError('VALIDATION_ERROR', 'Tipo de oferta incompatível com o item.');
    }
    assertValidPricing(input.pricing);

    const timestamp = this.now().toISOString();
    const offer: BookableOffer = {
      ...input,
      id: `offer_${this.newId()}`,
      ownerId: item.ownerId,
      partnerId: item.partnerId,
      status: 'draft',
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    await this.port.createOffer(offer);
    return offer;
  }

  async updateOffer(
    actor: BookingActor,
    offerId: string,
    input: Partial<OfferInput>
  ): Promise<BookableOffer> {
    const offer = await this.getOwnedOffer(actor, offerId);
    if (offer.status === 'archived') {
      throw new BookingDomainError('INVALID_TRANSITION', 'Oferta arquivada não pode ser editada.');
    }
    if (input.pricing) assertValidPricing(input.pricing);
    const updated: BookableOffer = { ...offer, ...input, updatedAt: this.now().toISOString() };
    await this.port.saveOffer(updated);
    if (updated.status === 'published') {
      await this.port.upsertPublicOfferProjection(toPublicOffer(updated));
    }
    return updated;
  }

  async setOfferStatus(
    actor: BookingActor,
    offerId: string,
    status: Exclude<BookableOfferStatus, 'draft'>
  ): Promise<BookableOffer> {
    const offer = await this.getOwnedOffer(actor, offerId);
    if (offer.status === status) return offer;
    if (!OFFER_STATUS_TRANSITIONS[offer.status].includes(status)) {
      throw new BookingDomainError('INVALID_TRANSITION', 'Mudança de status não permitida.');
    }
    const updated: BookableOffer = { ...offer, status, updatedAt: this.now().toISOString() };
    await this.port.saveOffer(updated);
    if (status === 'published') {
      await this.port.upsertPublicOfferProjection(toPublicOffer(updated));
    } else {
      await this.port.deletePublicOfferProjection(offerId);
    }
    return updated;
  }

  async listOwnerOffers(actor: BookingActor): Promise<BookableOffer[]> {
    return this.port.listOffersByOwner(actor.uid);
  }

  async createSlots(
    actor: BookingActor,
    offerId: string,
    input: CreateSlotsInput
  ): Promise<AvailabilitySlot[]> {
    const offer = await this.getOwnedOffer(actor, offerId);
    if (offer.status === 'archived') {
      throw new BookingDomainError('INVALID_TRANSITION', 'Oferta arquivada não recebe horários.');
    }
    if (!Number.isInteger(input.capacity) || input.capacity < 1) {
      throw new BookingDomainError('VALIDATION_ERROR', 'Capacidade inválida.');
    }

    const requested =
      input.mode === 'list'
        ? input.slots.map((slot) => ({
            startsAt: new Date(slot.startsAt).toISOString(),
            endsAt: slot.endsAt,
          }))
        : expandSlotRecurrence(input).map((startsAt) => ({ startsAt, endsAt: undefined }));
    if (requested.length > MAX_SLOTS_PER_REQUEST) {
      throw new BookingDomainError(
        'VALIDATION_ERROR',
        `No máximo ${MAX_SLOTS_PER_REQUEST} horários por vez.`
      );
    }

    const nowMs = this.now().getTime();
    const timestamp = this.now().toISOString();
    const unique = new Map<string, AvailabilitySlot>();
    for (const slot of requested) {
      if (new Date(slot.startsAt).getTime() <= nowMs) continue;
      const endsAt =
        slot.endsAt ??
        (offer.durationMinutes
          ? new Date(
              new Date(slot.startsAt).getTime() + offer.durationMinutes * 60_000
            ).toISOString()
          : undefined);
      const id = buildSlotId(offerId, slot.startsAt);
      unique.set(id, {
        id,
        offerId,
        startsAt: slot.startsAt,
        ...(endsAt ? { endsAt } : {}),
        capacityTotal: input.capacity,
        capacityReserved: 0,
        capacitySold: 0,
        status: 'open',
        createdAt: timestamp,
        updatedAt: timestamp,
      });
    }
    return this.port.createSlots([...unique.values()]);
  }

  async listAvailableSlots(offerId: string, fromIso: string, toIso: string): Promise<PublicSlot[]> {
    const offer = await this.port.getOffer(offerId);
    if (offer?.status !== 'published') {
      throw new BookingDomainError('NOT_FOUND', 'Oferta não encontrada.');
    }
    const nowMs = this.now().getTime();
    const slots = await this.port.listSlots(offerId, fromIso, toIso);
    return slots
      .filter((slot) => slot.status === 'open' && new Date(slot.startsAt).getTime() > nowMs)
      .map((slot) => ({
        id: slot.id,
        startsAt: slot.startsAt,
        ...(slot.endsAt ? { endsAt: slot.endsAt } : {}),
        available: Math.max(0, slot.capacityTotal - slot.capacityReserved - slot.capacitySold),
      }));
  }

  /** Fecha o horário e devolve as reservas ativas dele (a camada application reembolsa e notifica). */
  async cancelSlot(actor: BookingActor, offerId: string, slotId: string): Promise<Booking[]> {
    await this.getOwnedOffer(actor, offerId);
    const slot = await this.port.getSlot(slotId);
    if (slot?.offerId !== offerId) {
      throw new BookingDomainError('NOT_FOUND', 'Horário não encontrado.');
    }
    if (slot.status !== 'canceled') {
      await this.port.setSlotStatus(slotId, 'canceled');
    }
    const bookings = await this.port.listBookingsBySlot(slotId);
    return bookings.filter(
      (booking) => booking.status === 'confirmed' || booking.status === 'pending_payment'
    );
  }

  async getOwnedOffer(actor: BookingActor, offerId: string): Promise<BookableOffer> {
    const offer = await this.port.getOffer(offerId);
    // Oferta de outro parceiro responde como inexistente: não revela que o ID existe.
    if (!offer || (!actor.admin && offer.ownerId !== actor.uid)) {
      throw new BookingDomainError('NOT_FOUND', 'Oferta não encontrada.');
    }
    return offer;
  }
}

=== server/domain/bookings/types/bookingTypes.ts — ARQUIVO NOVO, conteúdo completo ===
import type { Locale } from '../../../shared/kernel/locale';

/** Texto cadastrado pelo parceiro; pt-BR é obrigatório (AGENTS.md §12.6). */
export type LocalizedText = { 'pt-BR': string; en?: string; fr?: string };

/** Fase 1 vende só `tour` e `private_entry`; os outros já existem no modelo (decisão D3). */
export type BookableOfferKind = 'tour' | 'private_entry' | 'rental' | 'transfer';
export const AVAILABLE_OFFER_KINDS: readonly BookableOfferKind[] = ['tour', 'private_entry'];

export type BookableOfferStatus = 'draft' | 'published' | 'paused' | 'archived';

export interface PriceOption {
  id: string;
  label: LocalizedText;
  unitAmountMinor: number;
  minQuantity?: number;
  maxQuantity?: number;
}

export interface CancellationPolicy {
  freeCancellationHoursBefore: number;
  refundPercentAfterDeadline: 0 | 50 | 100;
}

export interface MeetingPoint {
  address: string;
  lat?: number;
  lng?: number;
  instructions?: LocalizedText;
}

export interface BookableOffer {
  id: string;
  guideItemId: string;
  ownerId: string;
  partnerId: string;
  kind: BookableOfferKind;
  title: LocalizedText;
  description?: LocalizedText;
  status: BookableOfferStatus;
  pricing: { currency: 'BRL'; priceOptions: PriceOption[] };
  durationMinutes?: number;
  meetingPoint?: MeetingPoint;
  cancellationPolicy: CancellationPolicy;
  maxParticipantsPerBooking: number;
  requiresParticipantNames: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Projeção pública lida pelo cliente em `publicBookableOffers` (sem dono nem parceiro). */
export type PublicBookableOffer = Omit<BookableOffer, 'ownerId' | 'partnerId' | 'createdAt'>;

export type AvailabilitySlotStatus = 'open' | 'closed' | 'canceled';

export interface AvailabilitySlot {
  id: string;
  offerId: string;
  startsAt: string;
  endsAt?: string;
  capacityTotal: number;
  capacityReserved: number;
  capacitySold: number;
  status: AvailabilitySlotStatus;
  createdAt: string;
  updatedAt: string;
}

export interface PublicSlot {
  id: string;
  startsAt: string;
  endsAt?: string;
  available: number;
}

export type BookingStatus =
  | 'pending_payment'
  | 'confirmed'
  | 'completed'
  | 'canceled'
  | 'refunded'
  | 'expired'
  | 'no_show'
  | 'disputed';

export interface BookingLine {
  priceOptionId: string;
  quantity: number;
  unitAmountMinor: number;
}

export interface BookingCancellation {
  by: 'buyer' | 'partner' | 'system';
  refundPercent: 0 | 50 | 100;
  refundAmountMinor: number;
  reason: string;
  at: string;
}

export interface Booking {
  id: string;
  offerId: string;
  slotId: string;
  guideItemId: string;
  buyerId: string;
  sellerPartnerId: string;
  kind: BookableOfferKind;
  status: BookingStatus;
  lines: BookingLine[];
  participantsCount: number;
  subtotalMinor: number;
  platformFeeMinor: number;
  totalMinor: number;
  expiresAt: string | null;
  paymentIntentId?: string;
  offerSnapshot: {
    title: string;
    startsAt: string;
    durationMinutes?: number;
    meetingPoint?: string;
    cancellationPolicy: CancellationPolicy;
  };
  /** Gravado ao cancelar: torna o cancelamento repetível sem recalcular o reembolso. */
  cancellation?: BookingCancellation;
  locale: Locale;
  idempotencyKey: string;
  createdAt: string;
  updatedAt: string;
}

export interface BookingParticipant {
  name: string;
  isLeadContact: boolean;
}

/** Quem age na operação. Neutro de propósito: o domínio não conhece a camada application. */
export interface BookingActor {
  uid: string;
  admin: boolean;
}

export interface Page<T> {
  data: T[];
  nextCursor: string | null;
}

export const BOOKING_TRANSITIONS: Record<BookingStatus, readonly BookingStatus[]> = {
  pending_payment: ['confirmed', 'expired', 'canceled'],
  confirmed: ['completed', 'canceled', 'no_show', 'disputed'],
  canceled: ['refunded'],
  completed: ['disputed'],
  refunded: [],
  expired: [],
  no_show: ['disputed'],
  disputed: ['confirmed', 'refunded'],
};

export function canTransitionBooking(from: BookingStatus, to: BookingStatus): boolean {
  return BOOKING_TRANSITIONS[from].includes(to);
}

=== server/domain/bookings/usecases/cancelBookingForCanceledSlotUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { getBookingService } from '../factory';
import type { Booking } from '../types/bookingTypes';

export async function cancelBookingForCanceledSlotUseCase(
  bookingId: string,
  actorUid: string
): Promise<Booking> {
  return getBookingService().cancelBookingForCanceledSlot(bookingId, actorUid);
}

=== server/domain/bookings/usecases/cancelSlotByPartnerUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { getOfferService } from '../factory';
import type { Booking, BookingActor } from '../types/bookingTypes';

/** Fecha o horário e devolve as reservas ativas; reembolsar e notificar é da camada application. */
export async function cancelSlotByPartnerUseCase(
  actor: BookingActor,
  offerId: string,
  slotId: string
): Promise<Booking[]> {
  return getOfferService().cancelSlot(actor, offerId, slotId);
}

=== server/domain/bookings/usecases/completeFinishedBookingsUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { getBookingService } from '../factory';

/** Marca como concluídas as reservas confirmadas cujo horário já terminou. */
export async function completeFinishedBookingsUseCase(limit = 200): Promise<number> {
  return getBookingService().completeFinishedBookings(limit);
}

=== server/domain/bookings/usecases/confirmBookingPaymentUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { getBookingService } from '../factory';
import type { Booking } from '../types/bookingTypes';

/** Chamado só pelo webhook (fonte da verdade). Lança LATE_PAYMENT_REJECTED quando não dá para confirmar. */
export async function confirmBookingPaymentUseCase(
  bookingId: string,
  paymentIntentId: string
): Promise<Booking> {
  return getBookingService().confirmBookingPayment(bookingId, paymentIntentId);
}

=== server/domain/bookings/usecases/createAvailabilitySlotsUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { getOfferService } from '../factory';
import type { CreateSlotsInput } from '../services/offerService';
import type { AvailabilitySlot, BookingActor } from '../types/bookingTypes';

/** Lista explícita ou recorrência no fuso America/Fortaleza; horários repetidos ou passados são ignorados. */
export async function createAvailabilitySlotsUseCase(
  actor: BookingActor,
  offerId: string,
  input: CreateSlotsInput
): Promise<AvailabilitySlot[]> {
  return getOfferService().createSlots(actor, offerId, input);
}

=== server/domain/bookings/usecases/createBookableOfferUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { getOfferService } from '../factory';
import type { OfferInput } from '../services/offerService';
import type { BookableOffer, BookableOfferKind, BookingActor } from '../types/bookingTypes';

export async function createBookableOfferUseCase(
  actor: BookingActor,
  input: OfferInput & { guideItemId: string; kind: BookableOfferKind }
): Promise<BookableOffer> {
  return getOfferService().createOffer(actor, input);
}

=== server/domain/bookings/usecases/createPendingBookingUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { getBookingService } from '../factory';
import type { CreatePendingBookingInput } from '../services/bookingService';
import type { Booking, BookingActor } from '../types/bookingTypes';

/** Reserva as vagas por 15 min. A mesma chave de idempotência devolve a mesma reserva. */
export async function createPendingBookingUseCase(
  actor: BookingActor,
  input: CreatePendingBookingInput,
  platformFeePercent: number
): Promise<Booking> {
  return getBookingService().createPendingBooking(actor, input, platformFeePercent);
}

=== server/domain/bookings/usecases/expireOverdueBookingsUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { getBookingService } from '../factory';

/** Devolve as vagas das reservas não pagas no prazo. Retorna quantas expiraram. */
export async function expireOverdueBookingsUseCase(limit = 200): Promise<number> {
  return getBookingService().expireOverdueBookings(limit);
}

=== server/domain/bookings/usecases/getBookingForActorUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { getBookingService } from '../factory';
import type { BookingDetails } from '../services/bookingService';
import type { BookingActor } from '../types/bookingTypes';

/** Comprador, parceiro vendedor ou admin; para qualquer outro a reserva não existe. */
export async function getBookingForActorUseCase(
  actor: BookingActor,
  bookingId: string
): Promise<BookingDetails> {
  return getBookingService().getBookingForActor(actor, bookingId);
}

=== server/domain/bookings/usecases/getBookingUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { getBookingService } from '../factory';
import type { Booking } from '../types/bookingTypes';

/** Leitura interna (webhook, jobs). Rotas HTTP usam getBookingForActorUseCase. */
export async function getBookingUseCase(bookingId: string): Promise<Booking | null> {
  return getBookingService().getBooking(bookingId);
}

=== server/domain/bookings/usecases/listAvailableSlotsUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { getOfferService } from '../factory';
import type { PublicSlot } from '../types/bookingTypes';

export async function listAvailableSlotsUseCase(
  offerId: string,
  fromIso: string,
  toIso: string
): Promise<PublicSlot[]> {
  return getOfferService().listAvailableSlots(offerId, fromIso, toIso);
}

=== server/domain/bookings/usecases/listMyBookingsUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { getBookingService } from '../factory';
import type { PageRequest } from '../ports/bookingsPort';
import type { Booking, BookingActor, Page } from '../types/bookingTypes';

export async function listMyBookingsUseCase(
  actor: BookingActor,
  page: PageRequest
): Promise<Page<Booking>> {
  return getBookingService().listBuyerBookings(actor, page);
}

=== server/domain/bookings/usecases/listOfferBookingsForPartnerUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { getBookingService, getOfferService } from '../factory';
import type { PageRequest } from '../ports/bookingsPort';
import type { Booking, BookingActor, Page } from '../types/bookingTypes';

export async function listOfferBookingsForPartnerUseCase(
  actor: BookingActor,
  offerId: string,
  page: PageRequest
): Promise<Page<Booking>> {
  await getOfferService().getOwnedOffer(actor, offerId);
  return getBookingService().listOfferBookings(offerId, page);
}

=== server/domain/bookings/usecases/listPartnerOffersUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { getOfferService } from '../factory';
import type { BookableOffer, BookingActor } from '../types/bookingTypes';

export async function listPartnerOffersUseCase(actor: BookingActor): Promise<BookableOffer[]> {
  return getOfferService().listOwnerOffers(actor);
}

=== server/domain/bookings/usecases/markBookingDisputedUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { getBookingService } from '../factory';
import type { Booking } from '../types/bookingTypes';

export async function markBookingDisputedUseCase(bookingId: string): Promise<Booking> {
  return getBookingService().markBookingDisputed(bookingId);
}

=== server/domain/bookings/usecases/markBookingNoShowUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { getBookingService } from '../factory';
import type { Booking, BookingActor } from '../types/bookingTypes';

export async function markBookingNoShowUseCase(
  actor: BookingActor,
  bookingId: string
): Promise<Booking> {
  return getBookingService().markBookingNoShow(actor, bookingId);
}

=== server/domain/bookings/usecases/markBookingPaymentFailedUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { getBookingService } from '../factory';

export async function markBookingPaymentFailedUseCase(bookingId: string): Promise<void> {
  return getBookingService().markBookingPaymentFailed(bookingId);
}

=== server/domain/bookings/usecases/markBookingRefundedUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { getBookingService } from '../factory';
import type { Booking } from '../types/bookingTypes';

export async function markBookingRefundedUseCase(bookingId: string): Promise<Booking> {
  return getBookingService().markBookingRefunded(bookingId);
}

=== server/domain/bookings/usecases/requestCancellationByBuyerUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { getBookingService } from '../factory';
import type { BuyerCancellationResult } from '../services/bookingService';
import type { BookingActor } from '../types/bookingTypes';

/** Cancela e calcula o reembolso pela política; não chama o pagamento (isso é da camada application). */
export async function requestCancellationByBuyerUseCase(
  actor: BookingActor,
  bookingId: string,
  reason: string
): Promise<BuyerCancellationResult> {
  return getBookingService().requestCancellationByBuyer(actor, bookingId, reason);
}

=== server/domain/bookings/usecases/setBookableOfferStatusUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { getOfferService } from '../factory';
import type { BookableOffer, BookableOfferStatus, BookingActor } from '../types/bookingTypes';

/** Publicar mantém a projeção pública; pausar ou arquivar a remove. */
export async function setBookableOfferStatusUseCase(
  actor: BookingActor,
  offerId: string,
  status: Exclude<BookableOfferStatus, 'draft'>
): Promise<BookableOffer> {
  return getOfferService().setOfferStatus(actor, offerId, status);
}

=== server/domain/bookings/usecases/updateBookableOfferUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { getOfferService } from '../factory';
import type { OfferInput } from '../services/offerService';
import type { BookableOffer, BookingActor } from '../types/bookingTypes';

export async function updateBookableOfferUseCase(
  actor: BookingActor,
  offerId: string,
  input: Partial<OfferInput>
): Promise<BookableOffer> {
  return getOfferService().updateOffer(actor, offerId, input);
}

=== server/domain/bookings/utils/bookingPricing.ts — ARQUIVO NOVO, conteúdo completo ===
import { BookingDomainError } from '../errors/bookingDomainError';
import type { BookableOffer, BookingLine } from '../types/bookingTypes';

export interface PricedBooking {
  lines: BookingLine[];
  participantsCount: number;
  subtotalMinor: number;
  platformFeeMinor: number;
  totalMinor: number;
}

/**
 * Preço sempre recalculado no backend a partir da oferta (AGENTS.md §8.5). O turista paga o subtotal;
 * a taxa da plataforma sai do repasse ao parceiro (application_fee_amount).
 */
export function priceBookingLines(
  offer: Pick<BookableOffer, 'pricing' | 'maxParticipantsPerBooking'>,
  requested: Array<{ priceOptionId: string; quantity: number }>,
  platformFeePercent: number
): PricedBooking {
  if (requested.length === 0) {
    throw new BookingDomainError('VALIDATION_ERROR', 'Selecione ao menos um item.');
  }
  const seen = new Set<string>();
  const lines = requested.map((request) => {
    if (seen.has(request.priceOptionId)) {
      throw new BookingDomainError('VALIDATION_ERROR', 'Opção de preço repetida.');
    }
    seen.add(request.priceOptionId);
    const option = offer.pricing.priceOptions.find((item) => item.id === request.priceOptionId);
    if (!option) {
      throw new BookingDomainError('VALIDATION_ERROR', 'Opção de preço inválida.');
    }
    if (!Number.isInteger(request.quantity) || request.quantity < (option.minQuantity ?? 1)) {
      throw new BookingDomainError('VALIDATION_ERROR', 'Quantidade inválida.');
    }
    if (option.maxQuantity !== undefined && request.quantity > option.maxQuantity) {
      throw new BookingDomainError('VALIDATION_ERROR', 'Quantidade acima do permitido.');
    }
    return {
      priceOptionId: option.id,
      quantity: request.quantity,
      unitAmountMinor: option.unitAmountMinor,
    };
  });

  const participantsCount = lines.reduce((sum, line) => sum + line.quantity, 0);
  if (participantsCount > offer.maxParticipantsPerBooking) {
    throw new BookingDomainError('VALIDATION_ERROR', 'Número de participantes acima do limite.');
  }
  const subtotalMinor = lines.reduce((sum, line) => sum + line.quantity * line.unitAmountMinor, 0);
  const platformFeeMinor = Math.round((subtotalMinor * platformFeePercent) / 100);
  return { lines, participantsCount, subtotalMinor, platformFeeMinor, totalMinor: subtotalMinor };
}

=== server/domain/bookings/utils/bookingUtils.test.ts — ARQUIVO NOVO, conteúdo completo ===
import { describe, expect, it } from 'vitest';
import { canTransitionBooking } from '../types/bookingTypes';
import { buildBookingId, buildSlotId } from './buildBookingId';
import { priceBookingLines } from './bookingPricing';
import { calculateCancellationRefund } from './cancellationRefund';
import { expandSlotRecurrence, fortalezaLocalToUtcIso } from './slotRecurrence';

const OFFER = {
  maxParticipantsPerBooking: 6,
  pricing: {
    currency: 'BRL' as const,
    priceOptions: [
      { id: 'adult', label: { 'pt-BR': 'Adulto' }, unitAmountMinor: 15090 },
      { id: 'child', label: { 'pt-BR': 'Criança' }, unitAmountMinor: 7545, maxQuantity: 2 },
    ],
  },
};

describe('priceBookingLines', () => {
  it('soma em centavos e arredonda a taxa', () => {
    const priced = priceBookingLines(
      OFFER,
      [
        { priceOptionId: 'adult', quantity: 2 },
        { priceOptionId: 'child', quantity: 1 },
      ],
      10
    );
    expect(priced.subtotalMinor).toBe(37725);
    expect(priced.totalMinor).toBe(37725);
    expect(priced.platformFeeMinor).toBe(3773);
    expect(priced.participantsCount).toBe(3);
  });

  it('recusa opção inexistente, repetida, quantidade fora do limite e excesso de participantes', () => {
    expect(() => priceBookingLines(OFFER, [{ priceOptionId: 'vip', quantity: 1 }], 10)).toThrow(
      'Opção'
    );
    expect(() =>
      priceBookingLines(
        OFFER,
        [
          { priceOptionId: 'adult', quantity: 1 },
          { priceOptionId: 'adult', quantity: 1 },
        ],
        10
      )
    ).toThrow('repetida');
    expect(() => priceBookingLines(OFFER, [{ priceOptionId: 'child', quantity: 3 }], 10)).toThrow(
      'acima'
    );
    expect(() => priceBookingLines(OFFER, [{ priceOptionId: 'adult', quantity: 0 }], 10)).toThrow(
      'inválida'
    );
    expect(() => priceBookingLines(OFFER, [{ priceOptionId: 'adult', quantity: 1.5 }], 10)).toThrow(
      'inválida'
    );
    expect(() => priceBookingLines(OFFER, [{ priceOptionId: 'adult', quantity: 7 }], 10)).toThrow(
      'limite'
    );
    expect(() => priceBookingLines(OFFER, [], 10)).toThrow('ao menos');
  });
});

describe('calculateCancellationRefund', () => {
  const policy = { freeCancellationHoursBefore: 24, refundPercentAfterDeadline: 50 as const };
  const startsAt = '2026-11-10T11:00:00.000Z';

  it('100% até o prazo gratuito', () => {
    expect(
      calculateCancellationRefund({
        policy,
        startsAt,
        totalMinor: 10001,
        now: new Date('2026-11-09T10:00:00.000Z'),
      })
    ).toEqual({ refundPercent: 100, refundAmountMinor: 10001 });
  });

  it('percentual da política depois do prazo, arredondado para baixo', () => {
    expect(
      calculateCancellationRefund({
        policy,
        startsAt,
        totalMinor: 10001,
        now: new Date('2026-11-10T00:00:00.000Z'),
      })
    ).toEqual({ refundPercent: 50, refundAmountMinor: 5000 });
  });

  it('nada depois do início', () => {
    expect(
      calculateCancellationRefund({
        policy,
        startsAt,
        totalMinor: 10001,
        now: new Date('2026-11-10T11:00:00.000Z'),
      })
    ).toEqual({ refundPercent: 0, refundAmountMinor: 0 });
  });
});

describe('canTransitionBooking', () => {
  it('segue a máquina de estados do desenho', () => {
    expect(canTransitionBooking('pending_payment', 'confirmed')).toBe(true);
    expect(canTransitionBooking('confirmed', 'canceled')).toBe(true);
    expect(canTransitionBooking('canceled', 'refunded')).toBe(true);
    expect(canTransitionBooking('expired', 'confirmed')).toBe(false);
    expect(canTransitionBooking('refunded', 'confirmed')).toBe(false);
    expect(canTransitionBooking('pending_payment', 'refunded')).toBe(false);
  });
});

describe('recorrência e IDs', () => {
  it('08:00 em Fortaleza = 11:00Z', () => {
    expect(fortalezaLocalToUtcIso('2026-11-02', '08:00')).toBe('2026-11-02T11:00:00.000Z');
    expect(fortalezaLocalToUtcIso('2026-11-02', '22:30')).toBe('2026-11-03T01:30:00.000Z');
  });

  it('gera só os dias da semana pedidos', () => {
    // 2026-11-02 é segunda-feira.
    const slots = expandSlotRecurrence({
      startDate: '2026-11-02',
      endDate: '2026-11-08',
      weekdays: [1, 3],
      times: ['08:00', '14:00'],
    });
    expect(slots).toEqual([
      '2026-11-02T11:00:00.000Z',
      '2026-11-02T17:00:00.000Z',
      '2026-11-04T11:00:00.000Z',
      '2026-11-04T17:00:00.000Z',
    ]);
  });

  it('recusa período invertido e horário inválido', () => {
    expect(() =>
      expandSlotRecurrence({
        startDate: '2026-11-08',
        endDate: '2026-11-02',
        weekdays: [1],
        times: ['08:00'],
      })
    ).toThrow();
    expect(() => fortalezaLocalToUtcIso('2026-11-02', '25:00')).toThrow();
  });

  it('IDs determinísticos', () => {
    expect(buildBookingId('u1', 'key-12345')).toBe(buildBookingId('u1', 'key-12345'));
    expect(buildBookingId('u1', 'key-12345')).not.toBe(buildBookingId('u2', 'key-12345'));
    expect(buildBookingId('u1', 'key-12345')).toMatch(/^bk_[0-9a-f]{32}$/);
    expect(buildSlotId('offer_1', '2026-11-02T11:00:00.000Z')).toBe('offer_1_1793617200');
  });
});

=== server/domain/bookings/utils/buildBookingId.ts — ARQUIVO NOVO, conteúdo completo ===
import { createHash } from 'node:crypto';

/** ID determinístico: a mesma tentativa (comprador + chave de idempotência) sempre cai na mesma reserva. */
export function buildBookingId(buyerId: string, idempotencyKey: string): string {
  const digest = createHash('sha256').update(`${buyerId}:${idempotencyKey}`).digest('hex');
  return `bk_${digest.slice(0, 32)}`;
}

/** Um horário por oferta e instante de início: criar o mesmo horário duas vezes não duplica. */
export function buildSlotId(offerId: string, startsAtIso: string): string {
  return `${offerId}_${Math.floor(new Date(startsAtIso).getTime() / 1000)}`;
}

=== server/domain/bookings/utils/cancellationRefund.ts — ARQUIVO NOVO, conteúdo completo ===
import type { CancellationPolicy } from '../types/bookingTypes';

const HOUR_MS = 60 * 60 * 1000;

/**
 * Reembolso do cancelamento pelo comprador: 100% até o prazo gratuito, depois o percentual da política,
 * e nada após o início. Math.floor garante que nunca se devolve mais do que foi pago.
 */
export function calculateCancellationRefund(params: {
  policy: CancellationPolicy;
  startsAt: string;
  totalMinor: number;
  now: Date;
}): { refundPercent: 0 | 50 | 100; refundAmountMinor: number } {
  const startsAtMs = new Date(params.startsAt).getTime();
  const nowMs = params.now.getTime();
  let refundPercent: 0 | 50 | 100;
  if (nowMs >= startsAtMs) {
    refundPercent = 0;
  } else if (nowMs <= startsAtMs - params.policy.freeCancellationHoursBefore * HOUR_MS) {
    refundPercent = 100;
  } else {
    refundPercent = params.policy.refundPercentAfterDeadline;
  }
  return {
    refundPercent,
    refundAmountMinor: Math.floor((params.totalMinor * refundPercent) / 100),
  };
}

=== server/domain/bookings/utils/slotRecurrence.ts — ARQUIVO NOVO, conteúdo completo ===
import { BookingDomainError } from '../errors/bookingDomainError';

// America/Fortaleza é UTC−3 fixo (sem horário de verão desde 2019), então a conversão é aritmética.
const FORTALEZA_OFFSET_HOURS = 3;
const MAX_DAYS = 370;

export interface SlotRecurrence {
  startDate: string;
  endDate: string;
  weekdays: number[];
  times: string[];
}

function parseDate(value: string): { year: number; month: number; day: number } {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) throw new BookingDomainError('VALIDATION_ERROR', 'Data inválida.');
  return { year: Number(match[1]), month: Number(match[2]), day: Number(match[3]) };
}

function parseTime(value: string): { hours: number; minutes: number } {
  const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(value);
  if (!match) throw new BookingDomainError('VALIDATION_ERROR', 'Horário inválido.');
  return { hours: Number(match[1]), minutes: Number(match[2]) };
}

/** Converte data e hora locais de Fortaleza em ISO UTC. */
export function fortalezaLocalToUtcIso(date: string, time: string): string {
  const { year, month, day } = parseDate(date);
  const { hours, minutes } = parseTime(time);
  return new Date(
    Date.UTC(year, month - 1, day, hours + FORTALEZA_OFFSET_HOURS, minutes)
  ).toISOString();
}

/** Expande a recorrência (dias da semana 0=domingo … 6=sábado, horários locais) em instantes UTC. */
export function expandSlotRecurrence(recurrence: SlotRecurrence): string[] {
  const start = parseDate(recurrence.startDate);
  const end = parseDate(recurrence.endDate);
  const startUtc = Date.UTC(start.year, start.month - 1, start.day);
  const endUtc = Date.UTC(end.year, end.month - 1, end.day);
  const days = Math.round((endUtc - startUtc) / 86_400_000);
  if (days < 0 || days > MAX_DAYS) {
    throw new BookingDomainError('VALIDATION_ERROR', 'Período da recorrência inválido.');
  }
  const weekdays = new Set(recurrence.weekdays);
  const result: string[] = [];
  for (let offset = 0; offset <= days; offset += 1) {
    const current = new Date(startUtc + offset * 86_400_000);
    if (!weekdays.has(current.getUTCDay())) continue;
    const date = current.toISOString().slice(0, 10);
    for (const time of recurrence.times) {
      result.push(fortalezaLocalToUtcIso(date, time));
    }
  }
  return result;
}

VERIFICAÇÃO (obrigatória):
- `npm run typecheck` sem erros; `npx biome lint .` com 0 erros.
- `npm test` → 109 arquivos, 671 testes.
- `npm run build` sem erros.
- `npm run test:rules` passa (4 arquivos, 59 testes).

No resumo, lembre-me (não execute): `npm run deploy:rules` e `npm run deploy:indexes`.
Responda no formato do AGENTS.md §16.3.
~~~~
