# Prompt 21.5b — Um código por pessoa ou grupo, entrada nominal e textos neutros (backend)

> Lote 18, gerado dos commits de referência `540bdb0..a9a5dd2` da branch `claude/agents-md-v2`. Aplique na ordem do lote (A7, 21.1 a 21.7d), um por vez. Cole o bloco abaixo no agente do AI Studio, inteiro, de uma vez.

---

## Prompt 21.5b — Um código por pessoa ou grupo, entrada nominal e textos neutros (backend)

Ajustes de 2026-10-30 depois das telas do 21.5a. As telas vêm no 21.5c.

~~~~text
Siga o AGENTS.md. O app ainda não foi liberado para usuários: nenhum código de compatibilidade ou transição (§2.2 item 8). As regras de negócio estão nas decisões D20 e D21 de docs/arquitetura/decisoes.md (aplicadas pelo prompt A7).

IMPORTANTE: aplique os diffs abaixo EXATAMENTE, inclusive os arquivos novos. Não reescreva os arquivos do seu jeito. Arquivo tocado sai sem avisos do lint e formatado (AGENTS.md §13). Não altere firebase.json, functions/, AGENTS.md, docs/ nem .env.

O QUE MUDA:
1) Cada unidade vendida (pessoa, ou grupo definido no anúncio) recebe código e QR próprios; check-in por unidade, avisando quando ela já entrou.
2) Nomes por entrada opcionais na compra; podem ser informados depois e trocados uma vez até 24 h antes (PUT /api/bookings/:id/participants/:unit).
3) A oferta grava o nome do estabelecimento; avisos ao cliente usam esse nome e textos neutros, sem falar de dinheiro antes da ação.
4) Entrada de atração nunca é vendida por grupo; venda por grupo exige o tamanho máximo.

ARQUIVOS (crie, altere ou apague exatamente estes):
- server/application/usecases/bookings/answerProviderAbsenceApplicationUseCase.ts (alterar)
- server/application/usecases/bookings/bookingServiceNotices.ts (alterar)
- server/application/usecases/bookings/bookingServiceProofApplicationUseCases.test.ts (alterar)
- server/application/usecases/bookings/checkInBookingApplicationUseCase.ts (alterar)
- server/application/usecases/bookings/markBookingNoShowApplicationUseCase.ts (alterar)
- server/application/usecases/bookings/recordProviderArrivalApplicationUseCase.ts (alterar)
- server/application/usecases/payouts/bookingServiceEvidence.ts (alterar)
- server/domain/bookings/adapters/ed25519EntryPassAdapter.test.ts (alterar)
- server/domain/bookings/adapters/ed25519EntryPassAdapter.ts (alterar)
- server/domain/bookings/adapters/firestoreBookingsAdapter.ts (alterar)
- server/domain/bookings/adapters/firestoreCheckInStore.ts (alterar)
- server/domain/bookings/adapters/guideBookableItemLookupAdapter.ts (alterar)
- server/domain/bookings/adapters/inMemoryBookingsAdapter.ts (alterar)
- server/domain/bookings/dtos/bookingPersistenceMappers.ts (alterar)
- server/domain/bookings/errors/bookingDomainError.ts (alterar)
- server/domain/bookings/factory.ts (alterar)
- server/domain/bookings/index.ts (alterar)
- server/domain/bookings/ports/bookableItemLookupPort.ts (alterar)
- server/domain/bookings/ports/bookingsPort.ts (alterar)
- server/domain/bookings/ports/entryPassSignerPort.ts (alterar)
- server/domain/bookings/services/bookingCheckInService.test.ts (alterar)
- server/domain/bookings/services/bookingCheckInService.ts (alterar)
- server/domain/bookings/services/bookingEntryService.test.ts (alterar)
- server/domain/bookings/services/bookingEntryService.ts (alterar)
- server/domain/bookings/services/bookingParticipantService.test.ts (criar)
- server/domain/bookings/services/bookingParticipantService.ts (criar)
- server/domain/bookings/services/bookingService.test.ts (alterar)
- server/domain/bookings/services/bookingService.ts (alterar)
- server/domain/bookings/services/bookingServiceProofService.test.ts (alterar)
- server/domain/bookings/services/bookingServiceProofService.ts (alterar)
- server/domain/bookings/services/offerService.test.ts (alterar)
- server/domain/bookings/services/offerService.ts (alterar)
- server/domain/bookings/types/bookingTypes.ts (alterar)
- server/domain/bookings/usecases/checkInBookingByCodeUseCase.ts (alterar)
- server/domain/bookings/usecases/checkInEntryUseCase.ts (alterar)
- server/domain/bookings/usecases/setParticipantNameUseCase.ts (criar)
- server/domain/bookings/utils/checkInCode.ts (alterar)
- server/domain/bookings/utils/serviceProof.test.ts (alterar)
- server/domain/bookings/utils/serviceProof.ts (alterar)
- server/interfaces/http/bookings/bookingResponses.ts (alterar)
- server/interfaces/http/bookings/bookingsController.test.ts (alterar)
- server/interfaces/http/bookings/bookingsController.ts (alterar)
- server/interfaces/http/bookings/bookingsRoutes.ts (alterar)
- server/interfaces/http/bookings/partnerOffersController.test.ts (alterar)
- server/interfaces/http/bookings/partnerOffersController.ts (alterar)
- server/interfaces/http/bookings/schemas/bookingSchemas.test.ts (alterar)
- server/interfaces/http/bookings/schemas/bookingSchemas.ts (alterar)

Aplique as mudanças abaixo EXATAMENTE como estão (formato unified diff: linhas com "-" saem, linhas com "+" entram; as demais são contexto para localizar o trecho). Não reformate outros trechos dos arquivos.

=== server/application/usecases/bookings/answerProviderAbsenceApplicationUseCase.ts — diff ===
@@ -50,6 +50,10 @@ export async function answerProviderAbsenceApplicationUseCase(
     { answer, resolution: 'admin' },
     actor.uid
   );
-  await sendBookingServiceNotice(booking.buyerId, 'absenceToAdmin');
+  await sendBookingServiceNotice(
+    booking.buyerId,
+    'absenceToAdmin',
+    booking.offerSnapshot.businessName
+  );
   return resolved;
 }

=== server/application/usecases/bookings/bookingServiceNotices.ts — ARQUIVO REESCRITO, substitua todo o conteúdo por este ===
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

=== server/application/usecases/bookings/bookingServiceProofApplicationUseCases.test.ts — diff ===
@@ -94,7 +94,7 @@ describe('prova do serviço na camada application (D20)', () => {
     });
     expect(recordProviderAbsenceUseCase).toHaveBeenCalledWith(BUYER, 'bk_1', 'claim_booking_bk_1');
     expect(createNotificationUseCase).toHaveBeenCalledWith(
-      notified('partner-1', 'Comprador diz que você não compareceu')
+      notified('partner-1', 'O cliente diz que você não compareceu')
     );
   });
 
@@ -114,7 +114,7 @@ describe('prova do serviço na camada application (D20)', () => {
       'partner-1'
     );
     expect(createNotificationUseCase).toHaveBeenCalledWith(
-      notified('buyer-1', 'Reembolso integral a caminho')
+      notified('buyer-1', 'Reembolso a caminho')
     );
   });
 
@@ -146,14 +146,16 @@ describe('prova do serviço na camada application (D20)', () => {
 
   it('check-in depois do relato encerra a reclamação sem reembolso', async () => {
     vi.mocked(checkInBookingByCodeUseCase).mockResolvedValue({
-      ...BOOKING,
-      providerAbsence: ABSENCE,
+      booking: { ...BOOKING, providerAbsence: ABSENCE },
+      unit: 0,
+      name: null,
+      alreadyCheckedIn: false,
+      checkedInAt: 't',
     } as never);
     await checkInBookingApplicationUseCase(PARTNER, {
       offerId: 'offer-1',
       slotId: 'slot-1',
       code: 'K7M4QX',
-      participantsPresent: 2,
     });
     expect(decideSaleClaimUseCase).toHaveBeenCalledWith('claim_booking_bk_1', 'system', {
       outcome: 'release',

=== server/application/usecases/bookings/checkInBookingApplicationUseCase.ts — ARQUIVO REESCRITO, substitua todo o conteúdo por este ===
import {
  type BookingActor,
  type CheckInByCodeInput,
  checkInBookingByCodeUseCase,
  resolveProviderAbsenceUseCase,
  type UnitCheckInResult,
} from '../../../domain/bookings';
import { decideSaleClaimUseCase } from '../../../domain/payment';
import { SYSTEM_ACTOR } from './answerProviderAbsenceApplicationUseCase';
import { releaseServiceProofHold } from './releaseServiceProofHold';

/**
 * Check-in com o código (D20). Se o cliente já tinha relatado que ninguém veio, o check-in prova que o
 * parceiro chegou: a reclamação é encerrada sem reembolso e o serviço segue normal. O check-in é a
 * prova do serviço: o repasse deixa de esperar por ela.
 */
export async function checkInBookingApplicationUseCase(
  actor: BookingActor,
  input: CheckInByCodeInput
): Promise<UnitCheckInResult> {
  const result = await checkInBookingByCodeUseCase(actor, input);
  await releaseServiceProofHold(result.booking.id);
  const absence = result.booking.providerAbsence;
  if (absence && !absence.resolution) {
    await decideSaleClaimUseCase(absence.claimId, SYSTEM_ACTOR, { outcome: 'release' });
    const booking = await resolveProviderAbsenceUseCase(
      result.booking.id,
      { resolution: 'withdrawn' },
      actor.uid
    );
    return { ...result, booking };
  }
  return result;
}

=== server/application/usecases/bookings/markBookingNoShowApplicationUseCase.ts — diff ===
@@ -14,6 +14,10 @@ export async function markBookingNoShowApplicationUseCase(
   const booking = await markBookingNoShowUseCase(actor, bookingId);
   // A ausência é a prova (D20); se o comprador contestar, a reclamação retém o repasse.
   await releaseServiceProofHold(booking.id);
-  await sendBookingServiceNotice(booking.buyerId, 'noShowMarked');
+  await sendBookingServiceNotice(
+    booking.buyerId,
+    'noShowMarked',
+    booking.offerSnapshot.businessName
+  );
   return booking;
 }

=== server/application/usecases/bookings/recordProviderArrivalApplicationUseCase.ts — diff ===
@@ -17,6 +17,10 @@ export async function recordProviderArrivalApplicationUseCase(
   location?: BookingArrival['location']
 ): Promise<Booking> {
   const booking = await recordProviderArrivalUseCase(actor, offerId, bookingId, location);
-  await sendBookingServiceNotice(booking.buyerId, 'providerArrived');
+  await sendBookingServiceNotice(
+    booking.buyerId,
+    'providerArrived',
+    booking.offerSnapshot.businessName
+  );
   return booking;
 }

=== server/application/usecases/payouts/bookingServiceEvidence.ts — diff ===
@@ -4,11 +4,12 @@ import type { Booking } from '../../../domain/bookings';
 export interface BookingServiceEvidence {
   startsAt: string;
   pickupAddress: string | null;
+  /** Unidades usadas (pessoas ou grupos) de quantas foram compradas, e como. */
   checkIn: {
     at: string;
     method: 'code' | 'qr' | 'no_code';
-    participantsPresent: number;
-    participantsCount: number;
+    used: number;
+    total: number;
     noCodeReason: string | null;
   } | null;
   arrival: { at: string; location: { lat: number; lng: number; accuracyM?: number } | null } | null;
@@ -22,16 +23,18 @@ export interface BookingServiceEvidence {
 }
 
 export function toBookingServiceEvidence(booking: Booking): BookingServiceEvidence {
+  const checkIns = [...(booking.checkIns ?? [])].sort((a, b) => a.at.localeCompare(b.at));
+  const first = checkIns[0];
   return {
     startsAt: booking.offerSnapshot.startsAt,
     pickupAddress: booking.pickupAddress ?? null,
-    checkIn: booking.checkIn
+    checkIn: first
       ? {
-          at: booking.checkIn.at,
-          method: booking.checkIn.method,
-          participantsPresent: booking.checkIn.participantsPresent,
-          participantsCount: booking.participantsCount,
-          noCodeReason: booking.checkIn.noCodeReason ?? null,
+          at: first.at,
+          method: first.method,
+          used: checkIns.length,
+          total: booking.participantsCount,
+          noCodeReason: first.noCodeReason ?? null,
         }
       : null,
     arrival: booking.arrival

=== server/domain/bookings/adapters/ed25519EntryPassAdapter.test.ts — diff ===
@@ -15,7 +15,8 @@ const PAYLOAD = {
   bid: 'bk_1',
   sid: 'slot-1',
   oid: 'offer-1',
-  n: 2,
+  u: 1,
+  nm: 'Ana Souza',
   exp: 1_800_000_000,
 };
 
@@ -47,7 +48,7 @@ describe('Ed25519EntryPassAdapter (§7.7)', () => {
     expect(adapter.sign(PAYLOAD)).toBe(token);
     expect(adapter.verify(token)).toEqual({ ...PAYLOAD, kid: 'k1' });
     const [prefix, body, signature] = token.split('.');
-    const forged = Buffer.from(JSON.stringify({ ...PAYLOAD, kid: 'k1', n: 9 }), 'utf8').toString(
+    const forged = Buffer.from(JSON.stringify({ ...PAYLOAD, kid: 'k1', u: 0 }), 'utf8').toString(
       'base64url'
     );
     expect(adapter.verify(`${prefix}.${forged}.${signature}`)).toBeNull();

=== server/domain/bookings/adapters/ed25519EntryPassAdapter.ts — diff ===
@@ -49,7 +49,8 @@ function isPayload(value: unknown): value is EntryPassPayload {
     typeof p.bid === 'string' &&
     typeof p.sid === 'string' &&
     typeof p.oid === 'string' &&
-    typeof p.n === 'number' &&
+    typeof p.u === 'number' &&
+    (p.nm === undefined || typeof p.nm === 'string') &&
     typeof p.exp === 'number'
   );
 }

=== server/domain/bookings/adapters/firestoreBookingsAdapter.ts — diff ===
@@ -107,7 +107,8 @@ export class FirestoreBookingsAdapter implements BookingsPort {
   readonly setSlotStatus = this.slots.setSlotStatus.bind(this.slots);
   readonly rescheduleSlot = this.slots.rescheduleSlot.bind(this.slots);
 
-  readonly recordCheckIn = this.checkIns.recordCheckIn.bind(this.checkIns);
+  readonly recordCheckIns = this.checkIns.recordCheckIns.bind(this.checkIns);
+  readonly setParticipant = this.checkIns.setParticipant.bind(this.checkIns);
   readonly countCheckInFailures = this.checkIns.countCheckInFailures.bind(this.checkIns);
   readonly addCheckInFailure = this.checkIns.addCheckInFailure.bind(this.checkIns);
   readonly updateBooking = this.checkIns.updateBooking.bind(this.checkIns);

=== server/domain/bookings/adapters/firestoreCheckInStore.ts — diff ===
@@ -1,7 +1,11 @@
 import { adminDb } from '../../../infrastructure/firebase/adminClient';
-import { BookingPersistenceMapper } from '../dtos/bookingPersistenceMappers';
+import {
+  BookingPersistenceMapper,
+  ParticipantPersistenceMapper,
+} from '../dtos/bookingPersistenceMappers';
 import { BookingDomainError } from '../errors/bookingDomainError';
-import type { Booking, BookingCheckIn } from '../types/bookingTypes';
+import type { Booking, BookingCheckIn, BookingParticipant } from '../types/bookingTypes';
+import { newCheckIns } from '../utils/serviceProof';
 import {
   BOOKINGS,
   CHECK_IN_FAILURES,
@@ -13,14 +17,19 @@ import {
 
 /** Check-in, prazos e demais registros da prova do serviço nas reservas (D20). */
 export class FirestoreCheckInStore {
-  async recordCheckIn(bookingId: string, checkIn: BookingCheckIn): Promise<Booking> {
+  async recordCheckIns(bookingId: string, checkIns: BookingCheckIn[]): Promise<Booking> {
     return adminDb.runTransaction(async (tx) => {
       const booking = await readBooking(tx, bookingId);
-      if (booking.checkIn) return booking;
+      const added = newCheckIns(booking, checkIns);
+      if (added.length === 0) return booking;
       if (booking.status !== 'confirmed' && booking.status !== 'completed') {
         throw new BookingDomainError('INVALID_TRANSITION', 'Esta reserva não aceita check-in.');
       }
-      const updated: Booking = { ...booking, checkIn, updatedAt: nowIso() };
+      const updated: Booking = {
+        ...booking,
+        checkIns: [...(booking.checkIns ?? []), ...added],
+        updatedAt: nowIso(),
+      };
       tx.set(
         adminDb.collection(BOOKINGS).doc(bookingId),
         BookingPersistenceMapper.toPersistence(updated)
@@ -29,13 +38,35 @@ export class FirestoreCheckInStore {
         bookingId,
         from: booking.status,
         to: booking.status,
-        actorUid: checkIn.byUid,
-        reason: 'checked_in',
+        actorUid: added[0]?.byUid ?? 'system',
+        reason: `checked_in:${added.map((item) => item.unit).join(',')}`,
       });
       return updated;
     });
   }
 
+  async setParticipant(
+    bookingId: string,
+    unit: number,
+    change: (current: BookingParticipant | null) => BookingParticipant
+  ): Promise<BookingParticipant> {
+    const ref = adminDb.collection(PARTICIPANTS).doc(`${bookingId}_${unit}`);
+    return adminDb.runTransaction(async (tx) => {
+      const snapshot = await tx.get(ref);
+      const current = snapshot.exists
+        ? ParticipantPersistenceMapper.toDomain(snapshot.data() ?? {})
+        : null;
+      const next = change(current);
+      tx.set(ref, {
+        bookingId,
+        name: next.name,
+        isLeadContact: next.isLeadContact,
+        ...(next.nameChangedAt ? { nameChangedAt: next.nameChangedAt } : {}),
+      });
+      return next;
+    });
+  }
+
   async countCheckInFailures(slotId: string, sinceIso: string, actorUid?: string): Promise<number> {
     let query = adminDb.collection(CHECK_IN_FAILURES).where('slotId', '==', slotId);
     if (actorUid) query = query.where('actorUid', '==', actorUid);

=== server/domain/bookings/adapters/guideBookableItemLookupAdapter.ts — diff ===
@@ -11,6 +11,7 @@ export class GuideBookableItemLookupAdapter implements BookableItemLookupPort {
       partnerId:
         typeof item.partnerId === 'string' && item.partnerId ? item.partnerId : item.ownerId,
       category: String(item.category ?? ''),
+      name: typeof item.name === 'string' ? item.name : '',
     };
   }
 }

=== server/domain/bookings/adapters/inMemoryBookingsAdapter.ts — diff ===
@@ -1,5 +1,6 @@
 import { BookingDomainError } from '../errors/bookingDomainError';
 import type { BookingsPort, PageRequest } from '../ports/bookingsPort';
+import { newCheckIns } from '../utils/serviceProof';
 import {
   type AvailabilitySlot,
   type AvailabilitySlotStatus,
@@ -198,18 +199,30 @@ export class InMemoryBookingsAdapter implements BookingsPort {
   }
   readonly checkInFailures: Array<{ slotId: string; actorUid: string; at: string }> = [];
 
-  async recordCheckIn(bookingId: string, checkIn: BookingCheckIn) {
+  async recordCheckIns(bookingId: string, checkIns: BookingCheckIn[]) {
     const booking = this.bookings.get(bookingId);
     if (!booking) throw new BookingDomainError('NOT_FOUND', 'Reserva não encontrada.');
-    if (booking.checkIn) return booking;
+    const added = newCheckIns(booking, checkIns);
+    if (added.length === 0) return booking;
     if (booking.status !== 'confirmed' && booking.status !== 'completed') {
       throw new BookingDomainError('INVALID_TRANSITION', 'Esta reserva não aceita check-in.');
     }
-    const updated: Booking = { ...booking, checkIn };
+    const updated: Booking = { ...booking, checkIns: [...(booking.checkIns ?? []), ...added] };
     this.bookings.set(bookingId, updated);
     this.audit.push({ bookingId, reason: 'checked_in' });
     return updated;
   }
+  async setParticipant(
+    bookingId: string,
+    unit: number,
+    change: (current: BookingParticipant | null) => BookingParticipant
+  ) {
+    const list = [...(this.participants.get(bookingId) ?? [])];
+    const next = change(list[unit] ?? null);
+    list[unit] = next;
+    this.participants.set(bookingId, list);
+    return next;
+  }
   async updateBooking(
     bookingId: string,
     change: (current: Booking) => Booking | null,

=== server/domain/bookings/dtos/bookingPersistenceMappers.ts — diff ===
@@ -82,6 +82,10 @@ export const BookingPersistenceMapper = {
 
 export const ParticipantPersistenceMapper = {
   toDomain(data: Data): BookingParticipant {
-    return { name: str(data.name), isLeadContact: data.isLeadContact === true };
+    return {
+      name: str(data.name),
+      isLeadContact: data.isLeadContact === true,
+      ...(typeof data.nameChangedAt === 'string' ? { nameChangedAt: data.nameChangedAt } : {}),
+    };
   },
 };

=== server/domain/bookings/errors/bookingDomainError.ts — diff ===
@@ -21,7 +21,8 @@ export type BookingErrorCode =
   | 'ABSENCE_REPORT_NOT_ALLOWED'
   | 'NOTHING_TO_ANSWER'
   | 'SERVICE_NOT_VERIFIED'
-  | 'INVALID_ENTRY_PASS';
+  | 'INVALID_ENTRY_PASS'
+  | 'NAME_CHANGE_NOT_ALLOWED';
 
 const STATUS_BY_CODE: Record<BookingErrorCode, number> = {
   VALIDATION_ERROR: 400,
@@ -47,6 +48,7 @@ const STATUS_BY_CODE: Record<BookingErrorCode, number> = {
   NOTHING_TO_ANSWER: 409,
   SERVICE_NOT_VERIFIED: 422,
   INVALID_ENTRY_PASS: 422,
+  NAME_CHANGE_NOT_ALLOWED: 422,
 };
 
 export class BookingDomainError extends Error {

=== server/domain/bookings/factory.ts — diff ===
@@ -3,6 +3,7 @@ import { FirestoreBookingsAdapter } from './adapters/firestoreBookingsAdapter';
 import { GuideBookableItemLookupAdapter } from './adapters/guideBookableItemLookupAdapter';
 import { BookingCheckInService } from './services/bookingCheckInService';
 import { BookingEntryService } from './services/bookingEntryService';
+import { BookingParticipantService } from './services/bookingParticipantService';
 import { BookingPrivacyService } from './services/bookingPrivacyService';
 import { BookingService } from './services/bookingService';
 import { BookingServiceProofService } from './services/bookingServiceProofService';
@@ -14,6 +15,7 @@ let checkInService: BookingCheckInService | null = null;
 let serviceProofService: BookingServiceProofService | null = null;
 let privacyService: BookingPrivacyService | null = null;
 let entryService: BookingEntryService | null = null;
+let participantService: BookingParticipantService | null = null;
 let port: FirestoreBookingsAdapter | null = null;
 
 function getPort(): FirestoreBookingsAdapter {
@@ -51,3 +53,8 @@ export function getBookingEntryService(): BookingEntryService {
   entryService ??= new BookingEntryService(getPort(), new Ed25519EntryPassAdapter());
   return entryService;
 }
+
+export function getBookingParticipantService(): BookingParticipantService {
+  participantService ??= new BookingParticipantService(getPort());
+  return participantService;
+}

=== server/domain/bookings/index.ts — diff ===
@@ -1,12 +1,17 @@
 export { BookingDomainError, type BookingErrorCode } from './errors/bookingDomainError';
 export type { PageRequest } from './ports/bookingsPort';
-export type { CheckInByCodeInput, CheckInCodeView } from './services/bookingCheckInService';
+export type {
+  CheckInByCodeInput,
+  CheckInCodeView,
+  UnitCheckInResult,
+  UnitCode,
+} from './services/bookingCheckInService';
 export type {
   BookingDetails,
   BuyerCancellationResult,
   CreatePendingBookingInput,
 } from './services/bookingService';
-export type { EntryCheckInInput, EntryPassView } from './services/bookingEntryService';
+export type { EntryCheckInInput, EntryPass, EntryPassView } from './services/bookingEntryService';
 export type { CheckInWithoutCodeInput } from './services/bookingServiceProofService';
 export type { CreateSlotsInput, OfferInput } from './services/offerService';
 export {
@@ -71,6 +76,7 @@ export { requestCancellationByBuyerUseCase } from './usecases/requestCancellatio
 export { rescheduleSlotByPartnerUseCase } from './usecases/rescheduleSlotByPartnerUseCase';
 export { resolveProviderAbsenceUseCase } from './usecases/resolveProviderAbsenceUseCase';
 export { resolveServiceConfirmationUseCase } from './usecases/resolveServiceConfirmationUseCase';
+export { setParticipantNameUseCase } from './usecases/setParticipantNameUseCase';
 export { setBookableOfferStatusUseCase } from './usecases/setBookableOfferStatusUseCase';
 export { updateBookableOfferUseCase } from './usecases/updateBookableOfferUseCase';
 export { priceBookingLines } from './utils/bookingPricing';

=== server/domain/bookings/ports/bookableItemLookupPort.ts — diff ===
@@ -4,6 +4,8 @@ export interface BookableItem {
   ownerId: string;
   partnerId: string;
   category: string;
+  /** Nome do estabelecimento, mostrado ao cliente na reserva (D20). */
+  name: string;
 }
 
 export interface BookableItemLookupPort {

=== server/domain/bookings/ports/bookingsPort.ts — diff ===
@@ -68,10 +68,19 @@ export interface BookingsPort {
   recordBookingAudit(bookingId: string, actorUid: string, reason: string): Promise<void>;
 
   /**
-   * Grava o check-in numa transação: só reserva confirmada ou concluída e sem check-in; repetir
-   * devolve a reserva com o check-in que já existe.
+   * Grava check-ins de unidades numa transação: só reserva confirmada ou concluída; unidade que já tem
+   * check-in fica como está (repetir não cria outro).
    */
-  recordCheckIn(bookingId: string, checkIn: BookingCheckIn): Promise<Booking>;
+  recordCheckIns(bookingId: string, checkIns: BookingCheckIn[]): Promise<Booking>;
+  /**
+   * Grava o nome da pessoa de uma unidade numa transação; `change` recebe o atual (ou null) e devolve o
+   * novo, ou lança para recusar.
+   */
+  setParticipant(
+    bookingId: string,
+    unit: number,
+    change: (current: BookingParticipant | null) => BookingParticipant
+  ): Promise<BookingParticipant>;
   /** Códigos errados no horário desde `sinceIso`, contados no Firestore (o Cloud Run não guarda estado). */
   countCheckInFailures(slotId: string, sinceIso: string, actorUid?: string): Promise<number>;
   addCheckInFailure(slotId: string, actorUid: string, atIso: string): Promise<void>;

=== server/domain/bookings/ports/entryPassSignerPort.ts — diff ===
@@ -6,8 +6,10 @@ export interface EntryPassPayload {
   bid: string;
   sid: string;
   oid: string;
-  /** Pessoas da reserva, para a portaria conferir sem internet. */
-  n: number;
+  /** Unidade (pessoa) da reserva: cada QR vale uma entrada. */
+  u: number;
+  /** Nome da pessoa na entrada nominal, para a portaria conferir com o documento sem internet. */
+  nm?: string;
   /** Validade em segundos (fim do dia do horário). */
   exp: number;
 }

=== server/domain/bookings/services/bookingCheckInService.test.ts — diff ===
@@ -39,7 +39,7 @@ function booking(id: string, overrides: Partial<Booking> = {}): Booking {
     kind: 'tour',
     status: 'confirmed',
     lines: [],
-    participantsCount: 4,
+    participantsCount: 2,
     subtotalMinor: 40000,
     platformFeeMinor: 6000,
     totalMinor: 40000,
@@ -96,7 +96,6 @@ const checkIn = (code: string, extra: Record<string, unknown> = {}) => ({
   offerId: 'offer-1',
   slotId: 'slot-1',
   code,
-  participantsPresent: 3,
   ...extra,
 });
 
@@ -108,24 +107,29 @@ describe('BookingCheckInService (D20)', () => {
     delete process.env.BOOKING_CHECKIN_CODE_SECRET;
   });
 
-  it('o comprador só vê o código a partir das 00:00 de Fortaleza do dia do serviço', async () => {
+  it('o cliente vê um código por unidade, só a partir das 00:00 de Fortaleza do dia', async () => {
     const { service, setNow } = setup('2026-11-10T02:59:00.000Z');
     const before = await service.getCheckInCode(BUYER, 'booking-1');
-    expect(before).toMatchObject({ code: null, visibleFrom: '2026-11-10T03:00:00.000Z' });
+    expect(before.visibleFrom).toBe('2026-11-10T03:00:00.000Z');
+    expect(before.codes.map((item) => item.code)).toEqual([null, null]);
     setNow('2026-11-10T03:00:00.000Z');
     const view = await service.getCheckInCode(BUYER, 'booking-1');
-    expect(view.code).toBe(deriveCheckInCode('booking-1'));
+    expect(view.codes.map((item) => item.code)).toEqual([
+      deriveCheckInCode('booking-1', undefined, 0),
+      deriveCheckInCode('booking-1', undefined, 1),
+    ]);
+    expect(view.codes[0]?.code).not.toBe(view.codes[1]?.code);
     expect(view.validUntil).toBe('2026-11-11T01:00:00.000Z');
   });
 
-  it('outra pessoa não vê o código: responde como inexistente (IDOR)', async () => {
+  it('outra pessoa não vê os códigos: responde como inexistente (IDOR)', async () => {
     const { service } = setup();
     await expect(service.getCheckInCode(PARTNER, 'booking-1')).rejects.toMatchObject({
       code: 'NOT_FOUND',
     });
   });
 
-  it('entrada de atração privada não usa código', async () => {
+  it('entrada de atração privada não usa este código', async () => {
     const { service, port } = setup();
     port.bookings.set('booking-3', booking('booking-3', { kind: 'private_entry' }));
     await expect(service.getCheckInCode(BUYER, 'booking-3')).rejects.toMatchObject({
@@ -133,31 +137,46 @@ describe('BookingCheckInService (D20)', () => {
     });
   });
 
-  it('o dono da oferta faz check-in com o código e informa os presentes', async () => {
-    const { service, port } = setup();
-    const code = deriveCheckInCode('booking-1');
-    const updated = await service.checkInByCode(
+  it('o dono da oferta faz check-in da unidade do código; repetir avisa que já entrou', async () => {
+    const { service, port, setNow } = setup();
+    const code = deriveCheckInCode('booking-1', undefined, 1);
+    const first = await service.checkInByCode(
       PARTNER,
-      checkIn(`${code.slice(0, 3).toLowerCase()}-${code.slice(3)}`)
+      checkIn(`pass:${code.slice(0, 3).toLowerCase()}-${code.slice(3)}`)
     );
-    expect(updated.id).toBe('booking-1');
-    expect(updated.checkIn).toMatchObject({
-      at: '2026-11-10T11:05:00.000Z',
-      byUid: 'partner-1',
-      method: 'code',
-      participantsPresent: 3,
-    });
+    expect(first).toMatchObject({ unit: 1, alreadyCheckedIn: false, name: null });
+    expect(first.booking.checkIns).toEqual([
+      { unit: 1, at: '2026-11-10T11:05:00.000Z', byUid: 'partner-1', method: 'code' },
+    ]);
     expect(port.audit.at(-1)).toEqual({ bookingId: 'booking-1', reason: 'checked_in' });
-    // Repetir não muda o check-in já gravado.
-    const again = await service.checkInByCode(PARTNER, checkIn(code, { participantsPresent: 1 }));
-    expect(again.checkIn?.participantsPresent).toBe(3);
+    setNow('2026-11-10T11:09:00.000Z');
+    const again = await service.checkInByCode(PARTNER, checkIn(code));
+    expect(again).toMatchObject({
+      alreadyCheckedIn: true,
+      checkedInAt: '2026-11-10T11:05:00.000Z',
+    });
+    expect(again.booking.checkIns).toHaveLength(1);
   });
 
-  it('depois do check-in o comprador não vê mais o código', async () => {
+  it('depois do check-in de uma unidade, o cliente só vê o código das outras', async () => {
     const { service } = setup();
-    await service.checkInByCode(PARTNER, checkIn(deriveCheckInCode('booking-1')));
+    await service.checkInByCode(PARTNER, checkIn(deriveCheckInCode('booking-1', undefined, 0)));
     const view = await service.getCheckInCode(BUYER, 'booking-1');
-    expect(view).toMatchObject({ code: null, checkedInAt: '2026-11-10T11:05:00.000Z' });
+    expect(view.codes[0]).toMatchObject({ code: null, checkedInAt: '2026-11-10T11:05:00.000Z' });
+    expect(view.codes[1]?.code).toBe(deriveCheckInCode('booking-1', undefined, 1));
+  });
+
+  it('na entrada nominal o check-in devolve o nome da pessoa para conferir', async () => {
+    const { service, port } = setup();
+    port.participants.set('booking-1', [
+      { name: 'Ana Souza', isLeadContact: true },
+      { name: 'Bruno Lima', isLeadContact: false },
+    ]);
+    const result = await service.checkInByCode(
+      PARTNER,
+      checkIn(deriveCheckInCode('booking-1', undefined, 1))
+    );
+    expect(result.name).toBe('Bruno Lima');
   });
 
   it('outro parceiro e o admin não fazem check-in na oferta (IDOR)', async () => {
@@ -188,7 +207,7 @@ describe('BookingCheckInService (D20)', () => {
     });
     setNow('2026-11-10T11:21:00.000Z');
     await expect(service.checkInByCode(PARTNER, checkIn(code))).resolves.toMatchObject({
-      id: 'booking-1',
+      unit: 0,
     });
   });
 
@@ -214,11 +233,11 @@ describe('BookingCheckInService (D20)', () => {
 
   it('check-in feito sem internet vale pela hora do aparelho e registra quando sincronizou', async () => {
     const { service } = setup('2026-11-10T15:00:00.000Z');
-    const updated = await service.checkInByCode(
+    const result = await service.checkInByCode(
       PARTNER,
       checkIn(deriveCheckInCode('booking-1'), { capturedAt: '2026-11-10T11:02:00.000Z' })
     );
-    expect(updated.checkIn).toMatchObject({
+    expect(result.booking.checkIns?.[0]).toMatchObject({
       at: '2026-11-10T11:02:00.000Z',
       syncedAt: '2026-11-10T15:00:00.000Z',
     });
@@ -235,14 +254,12 @@ describe('BookingCheckInService (D20)', () => {
     ).rejects.toMatchObject({ code: 'VALIDATION_ERROR' });
   });
 
-  it('presentes acima do número de pessoas da reserva é recusado', async () => {
+  it('código de unidade que não existe na reserva não vale', async () => {
     const { service } = setup();
+    // booking-2 tem 1 unidade: o código da unidade 1 não existe.
     await expect(
-      service.checkInByCode(
-        PARTNER,
-        checkIn(deriveCheckInCode('booking-2'), { participantsPresent: 2 })
-      )
-    ).rejects.toMatchObject({ code: 'VALIDATION_ERROR' });
+      service.checkInByCode(PARTNER, checkIn(deriveCheckInCode('booking-2', undefined, 1)))
+    ).rejects.toMatchObject({ code: 'INVALID_CHECK_IN_CODE' });
   });
 
   it('reserva cancelada não aceita check-in: o código não é encontrado', async () => {
@@ -253,14 +270,7 @@ describe('BookingCheckInService (D20)', () => {
     ).rejects.toMatchObject({ code: 'INVALID_CHECK_IN_CODE' });
   });
 
-  it('hasCheckIn indica a prova do serviço', async () => {
-    const { service } = setup();
-    expect(await service.hasCheckIn('booking-1')).toBe(false);
-    await service.checkInByCode(PARTNER, checkIn(deriveCheckInCode('booking-1')));
-    expect(await service.hasCheckIn('booking-1')).toBe(true);
-  });
-
-  it('reserva reembolsada porque o prestador não veio não aceita mais o código', async () => {
+  it('reserva reembolsada porque o parceiro não veio não aceita mais o código', async () => {
     const { service, port } = setup();
     port.bookings.set(
       'booking-1',
@@ -277,4 +287,11 @@ describe('BookingCheckInService (D20)', () => {
       service.checkInByCode(PARTNER, checkIn(deriveCheckInCode('booking-1')))
     ).rejects.toMatchObject({ code: 'INVALID_CHECK_IN_CODE' });
   });
+
+  it('hasCheckIn indica a prova do serviço', async () => {
+    const { service } = setup();
+    expect(await service.hasCheckIn('booking-1')).toBe(false);
+    await service.checkInByCode(PARTNER, checkIn(deriveCheckInCode('booking-1')));
+    expect(await service.hasCheckIn('booking-1')).toBe(true);
+  });
 });

=== server/domain/bookings/services/bookingCheckInService.ts — diff ===
@@ -7,9 +7,8 @@ import {
   CHECK_IN_CODE_KINDS,
 } from '../types/bookingTypes';
 import {
-  checkInCodesMatch,
   deriveCheckInCode,
-  listAcceptedCheckInCodes,
+  matchCheckInCodeUnit,
   normalizeCheckInCode,
 } from '../utils/checkInCode';
 import {
@@ -19,26 +18,43 @@ import {
   checkInWindow,
   resolveCheckInTime,
 } from '../utils/checkInWindow';
-import { hasServiceProof } from '../utils/serviceProof';
+import { checkInsOf, hasServiceProof } from '../utils/serviceProof';
 
-export interface CheckInCodeView {
-  /** null antes das 00:00 do dia do serviço e depois que a janela de check-in fecha. */
+/** Código de uma unidade: a pessoa (venda por pessoa) ou o grupo. */
+export interface UnitCode {
+  unit: number;
+  /** null fora do dia do serviço ou depois do check-in desta unidade. */
   code: string | null;
+  /** Nome da pessoa, quando a oferta pede nomes (D20). */
+  name: string | null;
+  checkedInAt: string | null;
+}
+
+export interface CheckInCodeView {
+  codes: UnitCode[];
   visibleFrom: string;
   validUntil: string;
-  checkedInAt: string | null;
 }
 
 export interface CheckInByCodeInput {
   offerId: string;
   slotId: string;
   code: string;
-  participantsPresent: number;
   /** Hora do aparelho quando o código foi digitado sem internet. */
   capturedAt?: string;
 }
 
-/** Código de check-in do comprador e check-in pelo prestador (D20). */
+/** Resultado do check-in de uma unidade, com o nome para o parceiro conferir na entrada nominal. */
+export interface UnitCheckInResult {
+  booking: Booking;
+  unit: number;
+  name: string | null;
+  /** A unidade já tinha check-in: a portaria avisa em vez de deixar entrar de novo. */
+  alreadyCheckedIn: boolean;
+  checkedInAt: string;
+}
+
+/** Códigos de check-in do cliente, um por unidade, e check-in pelo parceiro (D20). */
 export class BookingCheckInService {
   constructor(
     private readonly port: BookingsPort,
@@ -47,7 +63,7 @@ export class BookingCheckInService {
 
   async getCheckInCode(actor: BookingActor, bookingId: string): Promise<CheckInCodeView> {
     const booking = await this.port.getBooking(bookingId);
-    // Só o comprador vê o código; para os demais a reserva responde como inexistente (§7.10).
+    // Só o cliente vê os códigos; para os demais a reserva responde como inexistente (§7.10).
     if (!booking || booking.buyerId !== actor.uid) {
       throw new BookingDomainError('NOT_FOUND', 'Reserva não encontrada.');
     }
@@ -64,16 +80,22 @@ export class BookingCheckInService {
     const visibleFromMs = checkInCodeVisibleFromMs(startsAt);
     const { closesAtMs } = checkInWindow(startsAt, durationMinutes);
     const nowMs = this.now().getTime();
-    const visible = nowMs >= visibleFromMs && nowMs <= closesAtMs && !booking.checkIn;
+    const open = nowMs >= visibleFromMs && nowMs <= closesAtMs;
+    const participants = await this.port.getParticipants(booking.id);
+    const used = new Map(checkInsOf(booking).map((checkIn) => [checkIn.unit, checkIn.at]));
     return {
-      code: visible ? deriveCheckInCode(booking.id) : null,
+      codes: Array.from({ length: booking.participantsCount }, (_, unit) => ({
+        unit,
+        code: open && !used.has(unit) ? deriveCheckInCode(booking.id, undefined, unit) : null,
+        name: participants[unit]?.name || null,
+        checkedInAt: used.get(unit) ?? null,
+      })),
       visibleFrom: new Date(visibleFromMs).toISOString(),
       validUntil: new Date(closesAtMs).toISOString(),
-      checkedInAt: booking.checkIn?.at ?? null,
     };
   }
 
-  async checkInByCode(actor: BookingActor, input: CheckInByCodeInput): Promise<Booking> {
+  async checkInByCode(actor: BookingActor, input: CheckInByCodeInput): Promise<UnitCheckInResult> {
     const offer = await this.port.getOffer(input.offerId);
     // Só o dono da oferta faz check-in, nem o admin (D20): oferta de outro responde como inexistente.
     if (!offer || offer.ownerId !== actor.uid) {
@@ -112,38 +134,46 @@ export class BookingCheckInService {
     }
 
     const code = normalizeCheckInCode(input.code);
-    const bookings = code
-      ? (await this.port.listBookingsBySlot(slot.id)).filter(
-          (booking) =>
-            (booking.status === 'confirmed' || booking.status === 'completed') &&
-            // Já reembolsada porque o prestador não veio (D20): o código não vale mais.
-            booking.providerAbsence?.resolution !== 'refunded'
-        )
-      : [];
-    const match = code
-      ? bookings.find((booking) =>
-          listAcceptedCheckInCodes(booking.id).some((accepted) => checkInCodesMatch(accepted, code))
-        )
-      : undefined;
+    let match: { booking: Booking; unit: number } | null = null;
+    if (code) {
+      for (const booking of await this.port.listBookingsBySlot(slot.id)) {
+        const active =
+          (booking.status === 'confirmed' || booking.status === 'completed') &&
+          // Já reembolsada porque o parceiro não veio (D20): os códigos não valem mais.
+          booking.providerAbsence?.resolution !== 'refunded';
+        const unit = active
+          ? matchCheckInCodeUnit(booking.id, booking.participantsCount, code)
+          : null;
+        if (unit !== null) {
+          match = { booking, unit };
+          break;
+        }
+      }
+    }
     if (!match) {
       await this.port.addCheckInFailure(slot.id, actor.uid, nowDate.toISOString());
       throw new BookingDomainError('INVALID_CHECK_IN_CODE', 'Código incorreto.');
     }
-    if (input.participantsPresent > match.participantsCount) {
-      throw new BookingDomainError(
-        'VALIDATION_ERROR',
-        'Presentes acima do número de pessoas da reserva.'
-      );
-    }
 
     const checkIn: BookingCheckIn = {
+      unit: match.unit,
       at: new Date(atMs).toISOString(),
       byUid: actor.uid,
       method: 'code',
-      participantsPresent: input.participantsPresent,
       ...(input.capturedAt ? { syncedAt: nowDate.toISOString() } : {}),
     };
-    return this.port.recordCheckIn(match.id, checkIn);
+    const before = checkInsOf(match.booking).find((item) => item.unit === match.unit);
+    const booking = before
+      ? match.booking
+      : await this.port.recordCheckIns(match.booking.id, [checkIn]);
+    const participants = await this.port.getParticipants(booking.id);
+    return {
+      booking,
+      unit: match.unit,
+      name: participants[match.unit]?.name || null,
+      alreadyCheckedIn: Boolean(before),
+      checkedInAt: before?.at ?? checkIn.at,
+    };
   }
 
   /** Prova do serviço para a contestação no cartão (D16, D20): o "Cliente sem código" não conta. */

=== server/domain/bookings/services/bookingEntryService.test.ts — diff ===
@@ -94,7 +94,6 @@ function setup(now = '2026-11-10T14:00:00.000Z') {
 const entry = (extra: Record<string, unknown>) => ({
   offerId: 'offer-1',
   slotId: 'slot-1',
-  participantsPresent: 2,
   ...extra,
 });
 
@@ -106,57 +105,66 @@ describe('BookingEntryService (D20)', () => {
     delete process.env.BOOKING_CHECKIN_CODE_SECRET;
   });
 
-  it('o comprador vê QR e código de 8 caracteres só no dia, até o fechamento', async () => {
+  it('o cliente vê um QR e um código de 8 por pessoa, só no dia, até o fechamento', async () => {
     const early = setup('2026-11-10T02:59:00.000Z');
-    expect(await early.service.getEntryPass(BUYER, 'bk_1')).toMatchObject({
-      qrToken: null,
-      code: null,
-      visibleFrom: '2026-11-10T03:00:00.000Z',
-      validUntil: ENDS_AT,
-    });
+    const before = await early.service.getEntryPass(BUYER, 'bk_1');
+    expect(before).toMatchObject({ visibleFrom: '2026-11-10T03:00:00.000Z', validUntil: ENDS_AT });
+    expect(before.passes.every((pass) => pass.qrToken === null && pass.code === null)).toBe(true);
     const { service } = setup();
-    const pass = await service.getEntryPass(BUYER, 'bk_1');
-    expect(pass.code).toBe(deriveCheckInCode('bk_1', ENTRY_CODE_LENGTH));
-    expect(pass.code).toHaveLength(8);
-    expect(pass.qrToken).toContain('"bid":"bk_1"');
+    const view = await service.getEntryPass(BUYER, 'bk_1');
+    expect(view.passes).toHaveLength(3);
+    expect(view.passes[2]?.code).toBe(deriveCheckInCode('bk_1', ENTRY_CODE_LENGTH, 2));
+    expect(view.passes[2]?.qrToken).toContain('"u":2');
+    expect(new Set(view.passes.map((pass) => pass.code)).size).toBe(3);
     await expect(service.getEntryPass(OWNER, 'bk_1')).rejects.toMatchObject({ code: 'NOT_FOUND' });
   });
 
+  it('entrada nominal: o QR leva o nome da pessoa para a portaria conferir', async () => {
+    const { service, port } = setup();
+    port.participants.set('bk_1', [{ name: 'Ana Souza', isLeadContact: true }]);
+    const view = await service.getEntryPass(BUYER, 'bk_1');
+    expect(view.passes[0]).toMatchObject({ name: 'Ana Souza' });
+    expect(view.passes[0]?.qrToken).toContain('"nm":"Ana Souza"');
+    expect(view.passes[1]?.name).toBeNull();
+  });
+
   it('o código da entrada não repete os 6 caracteres do passeio', () => {
     expect(deriveCheckInCode('bk_1', ENTRY_CODE_LENGTH).slice(0, 6)).not.toBe(
       deriveCheckInCode('bk_1')
     );
   });
 
-  it('portaria lê o QR, grava a entrada e não deixa entrar de novo', async () => {
+  it('portaria lê o QR de uma pessoa; o mesmo QR de novo avisa que já entrou', async () => {
     const { service, port } = setup();
-    const pass = await service.getEntryPass(BUYER, 'bk_1');
-    const updated = await service.checkIn(OWNER, entry({ qrToken: pass.qrToken }));
-    expect(updated.checkIn).toMatchObject({ method: 'qr', participantsPresent: 2 });
-    const again = await service.checkIn(
-      OWNER,
-      entry({ qrToken: pass.qrToken, participantsPresent: 1 })
-    );
-    expect(again.checkIn?.participantsPresent).toBe(2);
+    const pass = (await service.getEntryPass(BUYER, 'bk_1')).passes[1];
+    const first = await service.checkIn(OWNER, entry({ qrToken: pass?.qrToken }));
+    expect(first).toMatchObject({ unit: 1, alreadyCheckedIn: false });
+    expect(first.booking.checkIns).toEqual([expect.objectContaining({ unit: 1, method: 'qr' })]);
+    const again = await service.checkIn(OWNER, entry({ qrToken: pass?.qrToken }));
+    expect(again).toMatchObject({ unit: 1, alreadyCheckedIn: true });
     expect(port.audit.filter((a) => a.reason === 'checked_in')).toHaveLength(1);
+    const view = await service.getEntryPass(BUYER, 'bk_1');
+    expect(view.passes[1]).toMatchObject({ qrToken: null, code: null });
+    expect(view.passes[0]?.qrToken).not.toBeNull();
   });
 
   it('código de 8 caracteres com prefixo da tela também vale', async () => {
     const { service } = setup();
-    const code = deriveCheckInCode('bk_2', ENTRY_CODE_LENGTH);
-    const updated = await service.checkIn(
-      OWNER,
-      entry({ code: `entr:${code}`, participantsPresent: 1 })
-    );
-    expect(updated).toMatchObject({ id: 'bk_2', checkIn: { method: 'code' } });
+    const code = deriveCheckInCode('bk_2', ENTRY_CODE_LENGTH, 0);
+    const result = await service.checkIn(OWNER, entry({ code: `entr:${code}` }));
+    expect(result).toMatchObject({ unit: 0, booking: { id: 'bk_2' } });
   });
 
-  it('QR de outro horário ou adulterado é recusado', async () => {
+  it('QR de outro horário, adulterado ou de pessoa que não existe é recusado', async () => {
     const { service } = setup();
-    const forged = `UGE1.${JSON.stringify({ v: 1, kid: 'k1', bid: 'bk_1', sid: 'slot-9', oid: 'offer-1', n: 3, exp: 1 })}.ok`;
+    const forged = `UGE1.${JSON.stringify({ v: 1, kid: 'k1', bid: 'bk_1', sid: 'slot-9', oid: 'offer-1', u: 0, exp: 1 })}.ok`;
     await expect(service.checkIn(OWNER, entry({ qrToken: forged }))).rejects.toMatchObject({
       code: 'INVALID_ENTRY_PASS',
     });
+    const ghost = `UGE1.${JSON.stringify({ v: 1, kid: 'k1', bid: 'bk_2', sid: 'slot-1', oid: 'offer-1', u: 5, exp: 1 })}.ok`;
+    await expect(service.checkIn(OWNER, entry({ qrToken: ghost }))).rejects.toMatchObject({
+      code: 'INVALID_ENTRY_PASS',
+    });
     await expect(service.checkIn(OWNER, entry({ qrToken: 'UGE1.{}.bad' }))).rejects.toMatchObject({
       code: 'INVALID_ENTRY_PASS',
     });
@@ -189,7 +197,7 @@ describe('BookingEntryService (D20)', () => {
     ).rejects.toMatchObject({ code: 'CHECK_IN_LOCKED' });
   });
 
-  it('depois do fechamento a entrada não vale; outro parceiro ou oferta que não é entrada recebem 404/422', async () => {
+  it('depois do fechamento não vale; outro parceiro ou oferta que não é entrada recebem 404/422', async () => {
     const late = setup('2026-11-10T20:01:00.000Z');
     await expect(
       late.service.checkIn(OWNER, entry({ code: deriveCheckInCode('bk_1', ENTRY_CODE_LENGTH) }))
@@ -206,14 +214,14 @@ describe('BookingEntryService (D20)', () => {
 
   it('entrada validada sem internet vale pela hora do aparelho, se foi antes do fechamento', async () => {
     const { service } = setup('2026-11-10T21:00:00.000Z');
-    const updated = await service.checkIn(
+    const result = await service.checkIn(
       OWNER,
       entry({
         code: deriveCheckInCode('bk_1', ENTRY_CODE_LENGTH),
         capturedAt: '2026-11-10T19:30:00.000Z',
       })
     );
-    expect(updated.checkIn).toMatchObject({
+    expect(result.booking.checkIns?.[0]).toMatchObject({
       at: '2026-11-10T19:30:00.000Z',
       syncedAt: '2026-11-10T21:00:00.000Z',
     });

=== server/domain/bookings/services/bookingEntryService.ts — ARQUIVO REESCRITO, substitua todo o conteúdo por este ===
import { BookingDomainError } from '../errors/bookingDomainError';
import type { BookingsPort } from '../ports/bookingsPort';
import type { EntryPassSignerPort } from '../ports/entryPassSignerPort';
import type {
  AvailabilitySlot,
  Booking,
  BookingActor,
  BookingCheckIn,
} from '../types/bookingTypes';
import type { UnitCheckInResult } from './bookingCheckInService';
import {
  deriveCheckInCode,
  ENTRY_CODE_LENGTH,
  matchCheckInCodeUnit,
  normalizeCheckInCode,
} from '../utils/checkInCode';
import { checkInsOf } from '../utils/serviceProof';
import {
  CHECK_IN_FAILURE_WINDOW_MS,
  ENTRY_MAX_FAILURES_PER_ACTOR,
  ENTRY_MAX_FAILURES_PER_SLOT,
  checkInCodeVisibleFromMs,
  entryWindow,
  resolveCheckInTime,
} from '../utils/checkInWindow';

const NOT_FOUND = () => new BookingDomainError('NOT_FOUND', 'Reserva não encontrada.');
const NOT_ENTRY = () =>
  new BookingDomainError('CHECK_IN_NOT_APPLICABLE', 'Esta reserva não é entrada de atração.');

/** Entrada de uma pessoa: QR assinado e código de 8 caracteres. */
export interface EntryPass {
  unit: number;
  /** null fora do dia da entrada ou depois que esta pessoa entrou. */
  qrToken: string | null;
  code: string | null;
  /** Nome da pessoa na entrada nominal (D20). */
  name: string | null;
  checkedInAt: string | null;
}

export interface EntryPassView {
  passes: EntryPass[];
  visibleFrom: string;
  validUntil: string;
}

export interface EntryCheckInInput {
  offerId: string;
  slotId: string;
  /** Um dos dois: o QR lido ou o código digitado. */
  qrToken?: string;
  code?: string;
  /** Hora do aparelho quando a entrada foi validada sem internet. */
  capturedAt?: string;
}

/** Entrada de atração privada (D20): um QR assinado por pessoa, verificável sem internet. */
export class BookingEntryService {
  constructor(
    private readonly port: BookingsPort,
    private readonly signer: EntryPassSignerPort,
    private readonly now: () => Date = () => new Date()
  ) {}

  async getEntryPass(actor: BookingActor, bookingId: string): Promise<EntryPassView> {
    const booking = await this.port.getBooking(bookingId);
    // Só o cliente vê as entradas; para os demais elas respondem como inexistentes (§7.10).
    if (!booking || booking.buyerId !== actor.uid) throw NOT_FOUND();
    if (booking.kind !== 'private_entry') throw NOT_ENTRY();
    if (booking.status !== 'confirmed' && booking.status !== 'completed') {
      throw new BookingDomainError('INVALID_TRANSITION', 'Esta reserva não tem entrada ativa.');
    }
    const slot = await this.port.getSlot(booking.slotId);
    if (!slot) throw NOT_FOUND();
    const { closesAtMs } = entryWindow(slot, booking.offerSnapshot.durationMinutes);
    const visibleFromMs = checkInCodeVisibleFromMs(slot.startsAt);
    const nowMs = this.now().getTime();
    const open = nowMs >= visibleFromMs && nowMs <= closesAtMs;
    const participants = await this.port.getParticipants(booking.id);
    const used = new Map(checkInsOf(booking).map((checkIn) => [checkIn.unit, checkIn.at]));
    return {
      passes: Array.from({ length: booking.participantsCount }, (_, unit) => {
        const name = participants[unit]?.name || null;
        const visible = open && !used.has(unit);
        return {
          unit,
          qrToken: visible ? this.sign(booking, slot, unit, name, closesAtMs) : null,
          code: visible ? deriveCheckInCode(booking.id, ENTRY_CODE_LENGTH, unit) : null,
          name,
          checkedInAt: used.get(unit) ?? null,
        };
      }),
      visibleFrom: new Date(visibleFromMs).toISOString(),
      validUntil: new Date(closesAtMs).toISOString(),
    };
  }

  /** Chaves públicas para a portaria conferir o QR sem internet; só para o dono da oferta. */
  async getVerificationKeys(
    actor: BookingActor,
    offerId: string
  ): Promise<Array<{ kid: string; publicKeyJwk: JsonWebKey }>> {
    await this.ownedEntryOffer(actor, offerId);
    return this.signer.publicKeys();
  }

  async checkIn(actor: BookingActor, input: EntryCheckInInput): Promise<UnitCheckInResult> {
    const offer = await this.ownedEntryOffer(actor, input.offerId);
    const slot = await this.port.getSlot(input.slotId);
    if (slot?.offerId !== offer.id) {
      throw new BookingDomainError('NOT_FOUND', 'Horário não encontrado.');
    }
    const nowDate = this.now();
    const atMs = resolveCheckInTime(input.capturedAt, nowDate.getTime());
    if (atMs === null) {
      throw new BookingDomainError('VALIDATION_ERROR', 'Hora da entrada inválida.');
    }
    const { opensAtMs, closesAtMs } = entryWindow(slot, offer.durationMinutes);
    if (atMs < opensAtMs || atMs > closesAtMs) {
      throw new BookingDomainError(
        'CHECK_IN_WINDOW_CLOSED',
        'A entrada deste horário não vale agora.'
      );
    }
    const { booking, unit } = input.qrToken
      ? await this.unitFromQr(input.qrToken, slot)
      : await this.unitFromCode(actor, slot, input.code ?? '', nowDate);
    const before = checkInsOf(booking).find((item) => item.unit === unit);
    const checkIn: BookingCheckIn = {
      unit,
      at: new Date(atMs).toISOString(),
      byUid: actor.uid,
      method: input.qrToken ? 'qr' : 'code',
      ...(input.capturedAt ? { syncedAt: nowDate.toISOString() } : {}),
    };
    // A mesma pessoa não entra duas vezes: o segundo uso volta como `alreadyCheckedIn`.
    const saved = before ? booking : await this.port.recordCheckIns(booking.id, [checkIn]);
    const participants = await this.port.getParticipants(booking.id);
    return {
      booking: saved,
      unit,
      name: participants[unit]?.name || null,
      alreadyCheckedIn: Boolean(before),
      checkedInAt: before?.at ?? checkIn.at,
    };
  }

  private sign(
    booking: Booking,
    slot: AvailabilitySlot,
    unit: number,
    name: string | null,
    closesAtMs: number
  ): string {
    return this.signer.sign({
      v: 1,
      bid: booking.id,
      sid: slot.id,
      oid: booking.offerId,
      u: unit,
      ...(name ? { nm: name } : {}),
      exp: Math.floor(closesAtMs / 1000),
    });
  }

  private async unitFromQr(
    token: string,
    slot: AvailabilitySlot
  ): Promise<{ booking: Booking; unit: number }> {
    const payload = this.signer.verify(token);
    if (!payload || payload.sid !== slot.id || payload.oid !== slot.offerId) {
      throw new BookingDomainError('INVALID_ENTRY_PASS', 'QR Code inválido para este horário.');
    }
    const booking = await this.port.getBooking(payload.bid);
    if (!booking || !isActiveEntry(booking) || payload.u >= booking.participantsCount) {
      throw new BookingDomainError('INVALID_ENTRY_PASS', 'Esta entrada não vale mais.');
    }
    return { booking, unit: payload.u };
  }

  private async unitFromCode(
    actor: BookingActor,
    slot: AvailabilitySlot,
    rawCode: string,
    nowDate: Date
  ): Promise<{ booking: Booking; unit: number }> {
    const since = new Date(nowDate.getTime() - CHECK_IN_FAILURE_WINDOW_MS).toISOString();
    const [byActor, bySlot] = await Promise.all([
      this.port.countCheckInFailures(slot.id, since, actor.uid),
      this.port.countCheckInFailures(slot.id, since),
    ]);
    if (byActor >= ENTRY_MAX_FAILURES_PER_ACTOR || bySlot >= ENTRY_MAX_FAILURES_PER_SLOT) {
      throw new BookingDomainError(
        'CHECK_IN_LOCKED',
        'Muitos códigos errados. Tente de novo em 15 minutos.'
      );
    }
    const code = normalizeCheckInCode(rawCode, ENTRY_CODE_LENGTH);
    if (code) {
      for (const booking of (await this.port.listBookingsBySlot(slot.id)).filter(isActiveEntry)) {
        const unit = matchCheckInCodeUnit(
          booking.id,
          booking.participantsCount,
          code,
          ENTRY_CODE_LENGTH
        );
        if (unit !== null) return { booking, unit };
      }
    }
    await this.port.addCheckInFailure(slot.id, actor.uid, nowDate.toISOString());
    throw new BookingDomainError('INVALID_CHECK_IN_CODE', 'Código incorreto.');
  }

  private async ownedEntryOffer(actor: BookingActor, offerId: string) {
    const offer = await this.port.getOffer(offerId);
    // Só o dono da oferta valida a entrada; de outro parceiro responde como inexistente (§7.10).
    if (!offer || offer.ownerId !== actor.uid) {
      throw new BookingDomainError('NOT_FOUND', 'Oferta não encontrada.');
    }
    if (offer.kind !== 'private_entry') throw NOT_ENTRY();
    return offer;
  }
}

function isActiveEntry(booking: Booking): boolean {
  return (
    booking.kind === 'private_entry' &&
    (booking.status === 'confirmed' || booking.status === 'completed')
  );
}

=== server/domain/bookings/services/bookingParticipantService.test.ts — ARQUIVO NOVO, conteúdo completo ===
import { describe, expect, it } from 'vitest';
import { InMemoryBookingsAdapter } from '../adapters/inMemoryBookingsAdapter';
import type { Booking } from '../types/bookingTypes';
import { BookingParticipantService } from './bookingParticipantService';

const BUYER = { uid: 'buyer-1', admin: false };

function booking(overrides: Partial<Booking> = {}): Booking {
  return {
    id: 'bk_1',
    offerId: 'offer-1',
    slotId: 'slot-1',
    guideItemId: 'item-1',
    buyerId: 'buyer-1',
    sellerPartnerId: 'partner-1',
    kind: 'private_entry',
    status: 'confirmed',
    lines: [],
    participantsCount: 2,
    subtotalMinor: 6000,
    platformFeeMinor: 900,
    totalMinor: 6000,
    expiresAt: null,
    offerSnapshot: {
      title: 'Lagoa privada',
      startsAt: '2026-11-10T12:00:00.000Z',
      cancellationPolicy: 'moderate',
      requiresParticipantNames: true,
    },
    locale: 'pt-BR',
    idempotencyKey: 'key-1',
    createdAt: '',
    updatedAt: '',
    ...overrides,
  };
}

function setup(now = '2026-11-08T12:00:00.000Z', overrides: Partial<Booking> = {}) {
  const port = new InMemoryBookingsAdapter();
  port.bookings.set('bk_1', booking(overrides));
  return { port, service: new BookingParticipantService(port, () => new Date(now)) };
}

describe('BookingParticipantService (D20)', () => {
  it('o cliente informa o nome depois da compra e troca uma vez até 24 h antes', async () => {
    const { service, port } = setup();
    await service.setName(BUYER, 'bk_1', 1, '  Bruno Lima ');
    expect(port.participants.get('bk_1')?.[1]).toEqual({
      name: 'Bruno Lima',
      isLeadContact: false,
    });
    const changed = await service.setName(BUYER, 'bk_1', 1, 'Carla Dias');
    expect(changed).toMatchObject({
      name: 'Carla Dias',
      nameChangedAt: '2026-11-08T12:00:00.000Z',
    });
    await expect(service.setName(BUYER, 'bk_1', 1, 'Daniel Reis')).rejects.toMatchObject({
      code: 'NAME_CHANGE_NOT_ALLOWED',
    });
  });

  it('a troca fecha 24 h antes, mas o primeiro nome pode ser dado até o dia', async () => {
    const { service } = setup('2026-11-09T13:00:00.000Z');
    await service.setName(BUYER, 'bk_1', 0, 'Ana Souza');
    await expect(service.setName(BUYER, 'bk_1', 0, 'Ana Lima')).rejects.toMatchObject({
      code: 'NAME_CHANGE_NOT_ALLOWED',
    });
  });

  it('outra pessoa, oferta sem nomes, unidade inexistente ou já usada são recusadas', async () => {
    const { service } = setup();
    await expect(
      service.setName({ uid: 'intruso', admin: false }, 'bk_1', 0, 'Ana Souza')
    ).rejects.toMatchObject({ code: 'NOT_FOUND' });
    await expect(service.setName(BUYER, 'bk_1', 5, 'Ana Souza')).rejects.toMatchObject({
      code: 'VALIDATION_ERROR',
    });
    const noNames = setup(undefined, {
      offerSnapshot: {
        title: 'x',
        startsAt: '2026-11-10T12:00:00.000Z',
        cancellationPolicy: 'moderate',
      },
    });
    await expect(noNames.service.setName(BUYER, 'bk_1', 0, 'Ana Souza')).rejects.toMatchObject({
      code: 'VALIDATION_ERROR',
    });
    const used = setup(undefined, {
      checkIns: [{ unit: 0, at: 't', byUid: 'p', method: 'qr' }],
    });
    await expect(used.service.setName(BUYER, 'bk_1', 0, 'Ana Souza')).rejects.toMatchObject({
      code: 'VALIDATION_ERROR',
    });
  });
});

=== server/domain/bookings/services/bookingParticipantService.ts — ARQUIVO NOVO, conteúdo completo ===
import { BookingDomainError } from '../errors/bookingDomainError';
import type { BookingsPort } from '../ports/bookingsPort';
import type { BookingActor, BookingParticipant } from '../types/bookingTypes';
import { checkInsOf } from '../utils/serviceProof';

// A troca do nome fecha 24 h antes do início, como nas plataformas de ingresso nominal (D20).
const NAME_CHANGE_CLOSES_BEFORE_MS = 24 * 60 * 60 * 1000;

/** Nome de cada pessoa na entrada nominal (D20): informar uma vez e trocar no máximo uma vez. */
export class BookingParticipantService {
  constructor(
    private readonly port: BookingsPort,
    private readonly now: () => Date = () => new Date()
  ) {}

  async setName(
    actor: BookingActor,
    bookingId: string,
    unit: number,
    rawName: string
  ): Promise<BookingParticipant> {
    const booking = await this.port.getBooking(bookingId);
    // Só o cliente informa os nomes; reserva de outra pessoa responde como inexistente (§7.10).
    if (!booking || booking.buyerId !== actor.uid) {
      throw new BookingDomainError('NOT_FOUND', 'Reserva não encontrada.');
    }
    const name = rawName.trim();
    if (
      !booking.offerSnapshot.requiresParticipantNames ||
      booking.status !== 'confirmed' ||
      !Number.isInteger(unit) ||
      unit < 0 ||
      unit >= booking.participantsCount ||
      checkInsOf(booking).some((checkIn) => checkIn.unit === unit) ||
      name.length < 2 ||
      name.length > 80
    ) {
      throw new BookingDomainError('VALIDATION_ERROR', 'Não é possível informar este nome.');
    }
    const nowDate = this.now();
    const changeClosed =
      nowDate.getTime() >
      new Date(booking.offerSnapshot.startsAt).getTime() - NAME_CHANGE_CLOSES_BEFORE_MS;
    return this.port.setParticipant(booking.id, unit, (current) => {
      if (!current?.name) return { name, isLeadContact: unit === 0 };
      if (current.name === name) return current;
      if (current.nameChangedAt || changeClosed) {
        throw new BookingDomainError(
          'NAME_CHANGE_NOT_ALLOWED',
          'O nome só pode ser trocado uma vez, até 24 h antes.'
        );
      }
      return { ...current, name, nameChangedAt: nowDate.toISOString() };
    });
  }
}

=== server/domain/bookings/services/bookingService.test.ts — diff ===
@@ -249,12 +249,9 @@ describe('BookingService', () => {
     const { service, port, setNow } = setup();
     const booking = await service.createPendingBooking(BUYER, INPUT, FEES);
     await service.confirmBookingPayment(booking.id, 'pi_1');
-    await port.recordCheckIn(booking.id, {
-      at: '2026-11-10T11:02:00.000Z',
-      byUid: 'partner-1',
-      method: 'code',
-      participantsPresent: 2,
-    });
+    await port.recordCheckIns(booking.id, [
+      { unit: 0, at: '2026-11-10T11:02:00.000Z', byUid: 'partner-1', method: 'code' },
+    ]);
     setNow('2026-11-10T12:00:00.000Z');
     await expect(
       service.markBookingNoShow({ uid: 'partner-1', admin: false }, booking.id)
@@ -315,12 +312,9 @@ describe('BookingService', () => {
     const { service, port, setNow } = setup();
     const booking = await service.createPendingBooking(BUYER, INPUT, FEES);
     await service.confirmBookingPayment(booking.id, 'pi_1');
-    await port.recordCheckIn(booking.id, {
-      at: '2026-11-10T11:02:00.000Z',
-      byUid: 'partner-1',
-      method: 'code',
-      participantsPresent: 2,
-    });
+    await port.recordCheckIns(booking.id, [
+      { unit: 0, at: '2026-11-10T11:02:00.000Z', byUid: 'partner-1', method: 'code' },
+    ]);
     setNow('2026-11-10T13:00:00.000Z');
     const result = await service.completeFinishedBookings();
     expect(result).toMatchObject({ completed: 1, askedToConfirm: [] });
@@ -340,4 +334,35 @@ describe('BookingService', () => {
     expect(result).toMatchObject({ completed: 1, askedToConfirm: [] });
     expect(port.bookings.get(booking.id)?.status).toBe('no_show');
   });
+
+  it('a reserva guarda o nome do estabelecimento e a unidade de venda (D20)', async () => {
+    const { service } = setup({
+      offer: { businessName: 'Buggy do Zé', sellingUnit: 'group', groupMaxPeople: 4 },
+    });
+    const booking = await service.createPendingBooking(BUYER, INPUT, FEES);
+    expect(booking.offerSnapshot).toMatchObject({
+      businessName: 'Buggy do Zé',
+      sellingUnit: 'group',
+      groupMaxPeople: 4,
+    });
+  });
+
+  it('venda por grupo não grava nomes, mesmo com a opção ligada', async () => {
+    const { service, port } = setup({
+      offer: { sellingUnit: 'group', groupMaxPeople: 4, requiresParticipantNames: true },
+    });
+    const booking = await service.createPendingBooking(
+      BUYER,
+      { ...INPUT, participants: [{ name: 'Ana' }, { name: 'Bia' }] },
+      FEES
+    );
+    expect(port.participants.get(booking.id) ?? []).toEqual([]);
+    expect(booking.offerSnapshot.requiresParticipantNames).toBeUndefined();
+  });
+
+  it('entrada nominal aceita comprar sem os nomes, para informar depois', async () => {
+    const { service } = setup({ offer: { requiresParticipantNames: true } });
+    const booking = await service.createPendingBooking(BUYER, INPUT, FEES);
+    expect(booking.offerSnapshot.requiresParticipantNames).toBe(true);
+  });
 });

=== server/domain/bookings/services/bookingService.ts — diff ===
@@ -11,6 +11,7 @@ import {
   type Page,
 } from '../types/bookingTypes';
 import { entryWindow, NO_SHOW_WAIT_MS, SERVICE_CONFIRMATION_MS } from '../utils/checkInWindow';
+import { hasAnyCheckIn } from '../utils/serviceProof';
 import { serviceEndsAtMs } from '../utils/serviceTime';
 import { buildBookingId } from '../utils/buildBookingId';
 import { priceBookingLines } from '../utils/bookingPricing';
@@ -75,10 +76,13 @@ export class BookingService {
     }
     const priced = priceBookingLines(offer, input.lines, feeConfig);
 
-    const names = input.participants.map((participant) => participant.name.trim());
-    if (offer.requiresParticipantNames) {
+    // Entrada nominal (D20): os nomes podem vir agora ou depois da compra, até o dia; venda por grupo
+    // não tem nomes, porque o cliente decide quem leva.
+    const named = offer.requiresParticipantNames && offer.sellingUnit !== 'group';
+    const names = named ? input.participants.map((participant) => participant.name.trim()) : [];
+    if (names.length > 0) {
       if (names.length !== priced.participantsCount) {
-        throw new BookingDomainError('VALIDATION_ERROR', 'Informe o nome de cada participante.');
+        throw new BookingDomainError('VALIDATION_ERROR', 'Informe o nome de cada pessoa.');
       }
       if (names.some((name) => name.length < 2 || name.length > 80)) {
         throw new BookingDomainError('VALIDATION_ERROR', 'Nome de participante inválido.');
@@ -112,6 +116,12 @@ export class BookingService {
         ...(offer.durationMinutes ? { durationMinutes: offer.durationMinutes } : {}),
         ...(offer.meetingPoint ? { meetingPoint: offer.meetingPoint.address } : {}),
         cancellationPolicy: offer.cancellationPolicy,
+        ...(offer.businessName ? { businessName: offer.businessName } : {}),
+        sellingUnit: offer.sellingUnit ?? 'person',
+        ...(offer.sellingUnit === 'group' && offer.groupMaxPeople
+          ? { groupMaxPeople: offer.groupMaxPeople }
+          : {}),
+        ...(named ? { requiresParticipantNames: true } : {}),
       },
       termsAcceptance: { version: input.acceptedTermsVersion, acceptedAt: timestamp },
       ...(offer.pickupMode === 'buyer_address'
@@ -127,9 +137,7 @@ export class BookingService {
       createdAt: timestamp,
       updatedAt: timestamp,
     };
-    const participants = offer.requiresParticipantNames
-      ? names.map((name, index) => ({ name, isLeadContact: index === 0 }))
-      : [];
+    const participants = names.map((name, index) => ({ name, isLeadContact: index === 0 }));
     return this.port.reserveCapacityAndCreateBooking(booking, participants);
   }
 
@@ -309,7 +317,7 @@ export class BookingService {
       throw new BookingDomainError('INVALID_TRANSITION', 'Só é possível marcar após o início.');
     }
     // Check-in prova que o comprador apareceu (D20).
-    if (booking.checkIn) {
+    if (hasAnyCheckIn(booking)) {
       throw new BookingDomainError('INVALID_TRANSITION', 'Reserva com check-in não é ausência.');
     }
     if (CHECK_IN_CODE_KINDS.includes(booking.kind)) {
@@ -356,10 +364,10 @@ export class BookingService {
     for (const booking of started) {
       if ((await this.serviceEndMs(booking)) > nowDate.getTime()) continue;
       // Entrada de atração não usada até o fechamento é ausência, como ingresso não usado (D20, A).
-      const unusedEntry = booking.kind === 'private_entry' && !booking.checkIn;
+      const unusedEntry = booking.kind === 'private_entry' && !hasAnyCheckIn(booking);
       const ask =
         CHECK_IN_CODE_KINDS.includes(booking.kind) &&
-        !booking.checkIn &&
+        !hasAnyCheckIn(booking) &&
         !booking.providerAbsence &&
         !booking.serviceConfirmation;
       const updated = await this.port.updateBooking(

=== server/domain/bookings/services/bookingServiceProofService.test.ts — diff ===
@@ -112,13 +112,14 @@ describe('BookingServiceProofService (D20)', () => {
     const updated = await service.checkInWithoutCode(PARTNER, {
       offerId: 'offer-1',
       bookingId: 'booking-1',
-      participantsPresent: 3,
       reason: 'no_phone',
     });
-    expect(updated.checkIn).toMatchObject({
+    // Sem código, o registro vale para todas as unidades da reserva.
+    expect(updated.checkIns).toHaveLength(4);
+    expect(updated.checkIns?.[3]).toMatchObject({
+      unit: 3,
       method: 'no_code',
       noCodeReason: 'no_phone',
-      participantsPresent: 3,
     });
     expect(updated.serviceConfirmation).toMatchObject({
       reason: 'no_code',
@@ -136,7 +137,7 @@ describe('BookingServiceProofService (D20)', () => {
       early.service.getBookingForAbsenceReport(BUYER, 'booking-1')
     ).rejects.toMatchObject({ code: 'ABSENCE_REPORT_NOT_ALLOWED' });
     const checkedIn = setup('2026-11-10T11:31:00.000Z', {
-      checkIn: { at: STARTS_AT, byUid: 'partner-1', method: 'code', participantsPresent: 4 },
+      checkIns: [{ unit: 0, at: STARTS_AT, byUid: 'partner-1', method: 'code' }],
     });
     await expect(
       checkedIn.service.getBookingForAbsenceReport(BUYER, 'booking-1')
@@ -182,7 +183,6 @@ describe('BookingServiceProofService (D20)', () => {
       service.checkInWithoutCode(PARTNER, {
         offerId: 'offer-1',
         bookingId: 'booking-1',
-        participantsPresent: 1,
         reason: 'other',
       })
     ).rejects.toMatchObject({ code: 'INVALID_TRANSITION' });

=== server/domain/bookings/services/bookingServiceProofService.ts — diff ===
@@ -15,7 +15,7 @@ import {
   SERVICE_CONFIRMATION_MS,
   checkInWindow,
 } from '../utils/checkInWindow';
-import { hasServiceProof } from '../utils/serviceProof';
+import { hasAnyCheckIn, hasServiceProof } from '../utils/serviceProof';
 
 const NOT_FOUND = () => new BookingDomainError('NOT_FOUND', 'Reserva não encontrada.');
 const NOTHING_TO_ANSWER = () =>
@@ -24,7 +24,6 @@ const NOTHING_TO_ANSWER = () =>
 export interface CheckInWithoutCodeInput {
   offerId: string;
   bookingId: string;
-  participantsPresent: number;
   reason: NoCodeReason;
 }
 
@@ -66,27 +65,22 @@ export class BookingServiceProofService {
         'O comprador relatou sua ausência: responda pelo aviso da reserva.'
       );
     }
-    if (input.participantsPresent > booking.participantsCount) {
-      throw new BookingDomainError(
-        'VALIDATION_ERROR',
-        'Presentes acima do número de pessoas da reserva.'
-      );
-    }
     const nowDate = this.now();
     const confirmation = this.question(nowDate, 'no_code');
     return this.port.updateBooking(
       booking.id,
       (current) => {
-        if (current.checkIn) return null;
+        if (hasAnyCheckIn(current)) return null;
+        // Sem código, o registro vale para todas as unidades da reserva, por conta do parceiro.
         return {
           ...current,
-          checkIn: {
+          checkIns: Array.from({ length: current.participantsCount }, (_, unit) => ({
+            unit,
             at: nowDate.toISOString(),
             byUid: actor.uid,
-            method: 'no_code',
-            participantsPresent: input.participantsPresent,
+            method: 'no_code' as const,
             noCodeReason: input.reason,
-          },
+          })),
           serviceConfirmation: confirmation,
           deadline: { kind: 'service_confirmation', at: confirmation.answerBy },
         };
@@ -104,7 +98,7 @@ export class BookingServiceProofService {
     const allowed =
       CHECK_IN_CODE_KINDS.includes(booking.kind) &&
       booking.status === 'confirmed' &&
-      !booking.checkIn &&
+      !hasAnyCheckIn(booking) &&
       !booking.providerAbsence &&
       nowMs >= new Date(startsAt).getTime() + PROVIDER_ABSENT_AFTER_MS &&
       nowMs <= checkInWindow(startsAt, durationMinutes).closesAtMs;
@@ -286,7 +280,7 @@ export class BookingServiceProofService {
         'Esta reserva usa o QR Code da entrada.'
       );
     }
-    if (booking.status !== 'confirmed' || booking.checkIn) {
+    if (booking.status !== 'confirmed' || hasAnyCheckIn(booking)) {
       throw new BookingDomainError('INVALID_TRANSITION', 'Esta reserva não aceita esta ação.');
     }
     const { opensAtMs, closesAtMs } = checkInWindow(

=== server/domain/bookings/services/offerService.test.ts — diff ===
@@ -24,7 +24,14 @@ function setup(item: Partial<BookableItem> | null = {}) {
     getItem: async () =>
       item === null
         ? null
-        : { id: 'item-1', ownerId: 'partner-1', partnerId: 'partner-1', category: 'tour', ...item },
+        : {
+            id: 'item-1',
+            ownerId: 'partner-1',
+            partnerId: 'partner-1',
+            category: 'tour',
+            name: 'Buggy do Zé',
+            ...item,
+          },
   };
   let counter = 0;
   const service = new OfferService(
@@ -52,9 +59,42 @@ describe('OfferService', () => {
       status: 'draft',
       ownerId: 'partner-1',
       partnerId: 'partner-1',
+      // O cliente reconhece quem presta pelo nome do estabelecimento (D20).
+      businessName: 'Buggy do Zé',
     });
   });
 
+  it('venda por grupo exige o tamanho do grupo e não vale para entrada de atração (D20)', async () => {
+    const { service } = setup();
+    await expect(
+      service.createOffer(OWNER, {
+        ...INPUT,
+        guideItemId: 'item-1',
+        kind: 'tour',
+        sellingUnit: 'group',
+      })
+    ).rejects.toMatchObject({ code: 'VALIDATION_ERROR' });
+    await expect(
+      service.createOffer(OWNER, {
+        ...INPUT,
+        guideItemId: 'item-1',
+        kind: 'tour',
+        sellingUnit: 'group',
+        groupMaxPeople: 4,
+      })
+    ).resolves.toMatchObject({ sellingUnit: 'group', groupMaxPeople: 4 });
+    const attraction = setup({ category: 'attraction' });
+    await expect(
+      attraction.service.createOffer(OWNER, {
+        ...INPUT,
+        guideItemId: 'item-1',
+        kind: 'private_entry',
+        sellingUnit: 'group',
+        groupMaxPeople: 4,
+      })
+    ).rejects.toMatchObject({ code: 'VALIDATION_ERROR' });
+  });
+
   it('item de outro dono → FORBIDDEN', async () => {
     const { service } = setup({ ownerId: 'outro' });
     await expect(

=== server/domain/bookings/services/offerService.ts — diff ===
@@ -43,6 +43,8 @@ export type OfferInput = Pick<
   | 'durationMinutes'
   | 'meetingPoint'
   | 'pickupMode'
+  | 'sellingUnit'
+  | 'groupMaxPeople'
   | 'cancellationPolicy'
   | 'maxParticipantsPerBooking'
   | 'requiresParticipantNames'
@@ -61,6 +63,24 @@ function assertPolicyForKind(kind: BookableOfferKind, policy: string): void {
   }
 }
 
+/** Entrada de atração é sempre por pessoa; venda por grupo precisa do tamanho do grupo (D20). */
+function assertSellingUnit(
+  kind: BookableOfferKind,
+  unit: BookableOffer['sellingUnit'],
+  groupMaxPeople: number | undefined
+): void {
+  if (unit !== 'group') return;
+  if (kind === 'private_entry') {
+    throw new BookingDomainError('VALIDATION_ERROR', 'Entrada de atração é vendida por pessoa.');
+  }
+  if (!groupMaxPeople) {
+    throw new BookingDomainError(
+      'VALIDATION_ERROR',
+      'Informe quantas pessoas cabem em cada grupo.'
+    );
+  }
+}
+
 function assertValidPricing(pricing: BookableOffer['pricing']): void {
   if (pricing.priceOptions.length === 0) {
     throw new BookingDomainError('VALIDATION_ERROR', 'Informe ao menos uma opção de preço.');
@@ -110,10 +130,12 @@ export class OfferService {
     }
     assertValidPricing(input.pricing);
     assertPolicyForKind(input.kind, input.cancellationPolicy);
+    assertSellingUnit(input.kind, input.sellingUnit, input.groupMaxPeople);
 
     const timestamp = this.now().toISOString();
     const offer: BookableOffer = {
       ...input,
+      ...(item.name ? { businessName: item.name } : {}),
       id: `offer_${this.newId()}`,
       ownerId: item.ownerId,
       partnerId: item.partnerId,
@@ -135,6 +157,11 @@ export class OfferService {
       throw new BookingDomainError('INVALID_TRANSITION', 'Oferta arquivada não pode ser editada.');
     }
     if (input.pricing) assertValidPricing(input.pricing);
+    assertSellingUnit(
+      offer.kind,
+      input.sellingUnit ?? offer.sellingUnit,
+      input.groupMaxPeople ?? offer.groupMaxPeople
+    );
     if (input.cancellationPolicy) {
       assertPolicyForKind(offer.kind, input.cancellationPolicy);
       // D14: depois de publicar, a política só fica igual ou mais flexível (protege quem já reservou).

=== server/domain/bookings/types/bookingTypes.ts — diff ===
@@ -17,6 +17,12 @@ export const CHECK_IN_CODE_KINDS: readonly BookableOfferKind[] = ['tour', 'renta
 /** Onde o serviço começa: no ponto de encontro da oferta ou no endereço que o comprador informa (D20). */
 export type PickupMode = 'meeting_point' | 'buyer_address';
 
+/**
+ * Unidade de venda (D20): por pessoa, cada pessoa tem o próprio código ou QR; por grupo, um código vale
+ * para o grupo inteiro, até `groupMaxPeople`. Entrada de atração é sempre por pessoa.
+ */
+export type SellingUnit = 'person' | 'group';
+
 export interface PriceOption {
   id: string;
   label: LocalizedText;
@@ -50,6 +56,11 @@ export interface BookableOffer {
   durationMinutes?: number;
   meetingPoint?: MeetingPoint;
   pickupMode?: PickupMode;
+  sellingUnit?: SellingUnit;
+  /** Só na venda por grupo: quantas pessoas cabem em cada unidade (ex.: buggy até 4). */
+  groupMaxPeople?: number;
+  /** Nome do estabelecimento, copiado do item do guia: é como o cliente reconhece quem presta (D20). */
+  businessName?: string;
   cancellationPolicy: BookingCancellationPolicy;
   maxParticipantsPerBooking: number;
   requiresParticipantNames: boolean;
@@ -106,8 +117,10 @@ export interface BookingCancellation {
   at: string;
 }
 
-/** Check-in do serviço pelo prestador (D20): prova de que o serviço começou. */
+/** Check-in de uma unidade da reserva (D20): prova de que o serviço começou para ela. */
 export interface BookingCheckIn {
+  /** Unidade usada: a pessoa (venda por pessoa) ou o grupo, de 0 até `participantsCount - 1`. */
+  unit: number;
   /** Hora em que o prestador fez o check-in (a do aparelho, quando foi feito sem internet). */
   at: string;
   byUid: string;
@@ -116,7 +129,6 @@ export interface BookingCheckIn {
    * até o comprador confirmar.
    */
   method: 'code' | 'qr' | 'no_code';
-  participantsPresent: number;
   /** Só no check-in feito sem internet: quando o servidor recebeu e validou o código. */
   syncedAt?: string;
   noCodeReason?: NoCodeReason;
@@ -186,6 +198,11 @@ export interface Booking {
     durationMinutes?: number;
     meetingPoint?: string;
     cancellationPolicy: BookingCancellationPolicy;
+    businessName?: string;
+    sellingUnit?: SellingUnit;
+    groupMaxPeople?: number;
+    /** Entrada nominal: o cliente informa o nome de cada pessoa (D20). */
+    requiresParticipantNames?: boolean;
   };
   /** Aviso de nova data pelo parceiro: até 7 dias depois, o comprador cancela com reembolso integral (D16, 4A). */
   rescheduledAt?: string;
@@ -197,7 +214,8 @@ export interface Booking {
   pickupAddress?: string;
   /** Quando o endereço de busca é apagado: 7 dias depois do fim do serviço (D20, §7.5). */
   pickupAddressEraseAt?: string;
-  checkIn?: BookingCheckIn;
+  /** Uma entrada por unidade usada; repetir o check-in da mesma unidade não cria outra. */
+  checkIns?: BookingCheckIn[];
   arrival?: BookingArrival;
   providerAbsence?: BookingProviderAbsence;
   serviceConfirmation?: BookingServiceConfirmation;
@@ -208,9 +226,15 @@ export interface Booking {
   updatedAt: string;
 }
 
+/**
+ * Pessoa de uma unidade, só quando a oferta pede nomes (entrada nominal, D20). O nome pode ser dado na
+ * compra ou depois, e trocado uma vez até 24 h antes.
+ */
 export interface BookingParticipant {
   name: string;
   isLeadContact: boolean;
+  /** Quando o nome já informado foi trocado: depois disso não muda mais. */
+  nameChangedAt?: string;
 }
 
 /** Quem age na operação. Neutro de propósito: o domínio não conhece a camada application. */

=== server/domain/bookings/usecases/checkInBookingByCodeUseCase.ts — ARQUIVO REESCRITO, substitua todo o conteúdo por este ===
import { getBookingCheckInService } from '../factory';
import type { CheckInByCodeInput, UnitCheckInResult } from '../services/bookingCheckInService';
import type { BookingActor } from '../types/bookingTypes';

/** Check-in de uma unidade pelo dono da oferta, com o código que o cliente informa (D20). */
export async function checkInBookingByCodeUseCase(
  actor: BookingActor,
  input: CheckInByCodeInput
): Promise<UnitCheckInResult> {
  return getBookingCheckInService().checkInByCode(actor, input);
}

=== server/domain/bookings/usecases/checkInEntryUseCase.ts — ARQUIVO REESCRITO, substitua todo o conteúdo por este ===
import { getBookingEntryService } from '../factory';
import type { EntryCheckInInput } from '../services/bookingEntryService';
import type { UnitCheckInResult } from '../services/bookingCheckInService';
import type { BookingActor } from '../types/bookingTypes';

/** Entrada de uma pessoa na portaria, pelo QR ou pelo código de 8 caracteres (D20). */
export async function checkInEntryUseCase(
  actor: BookingActor,
  input: EntryCheckInInput
): Promise<UnitCheckInResult> {
  return getBookingEntryService().checkIn(actor, input);
}

=== server/domain/bookings/usecases/setParticipantNameUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { getBookingParticipantService } from '../factory';
import type { BookingActor, BookingParticipant } from '../types/bookingTypes';

/** Nome da pessoa de uma unidade na entrada nominal: informar ou trocar uma vez (D20). */
export async function setParticipantNameUseCase(
  actor: BookingActor,
  bookingId: string,
  unit: number,
  name: string
): Promise<BookingParticipant> {
  return getBookingParticipantService().setName(actor, bookingId, unit, name);
}

=== server/domain/bookings/utils/checkInCode.ts — diff ===
@@ -26,9 +26,12 @@ function currentSecret(): string {
   return secret;
 }
 
-/** `entry:` separa o código da entrada do código de 6 caracteres, mesmo com o mesmo segredo. */
-function derive(secret: string, bookingId: string, length: number): string {
-  const label = length === ENTRY_CODE_LENGTH ? `entry:${bookingId}` : bookingId;
+/**
+ * Um código por unidade da reserva (D20). `entry:` separa o código da entrada do de 6 caracteres,
+ * mesmo com o mesmo segredo.
+ */
+function derive(secret: string, bookingId: string, length: number, unit: number): string {
+  const label = `${length === ENTRY_CODE_LENGTH ? 'entry:' : ''}${bookingId}#${unit}`;
   let code = '';
   for (let counter = 0; code.length < length; counter += 1) {
     const digest = crypto.createHmac('sha256', secret).update(`${label}:${counter}`).digest();
@@ -45,21 +48,45 @@ function derive(secret: string, bookingId: string, length: number): string {
  * Código da reserva, derivado do ID com o segredo do Secret Manager e nunca gravado (exceção do
  * AGENTS.md §7.7, D20): quem lê o banco não descobre códigos.
  */
-export function deriveCheckInCode(bookingId: string, length = CHECK_IN_CODE_LENGTH): string {
-  return derive(currentSecret(), bookingId, length);
+export function deriveCheckInCode(
+  bookingId: string,
+  length = CHECK_IN_CODE_LENGTH,
+  unit = 0
+): string {
+  return derive(currentSecret(), bookingId, length, unit);
 }
 
 /** Códigos aceitos no check-in: o do segredo atual e, durante a rotação, o do anterior (§7.8). */
 export function listAcceptedCheckInCodes(
   bookingId: string,
-  length = CHECK_IN_CODE_LENGTH
+  length = CHECK_IN_CODE_LENGTH,
+  unit = 0
 ): string[] {
-  const codes = [deriveCheckInCode(bookingId, length)];
+  const codes = [deriveCheckInCode(bookingId, length, unit)];
   const previous = readSecret('BOOKING_CHECKIN_CODE_SECRET_PREVIOUS', MIN_PREVIOUS_SECRET_LENGTH);
-  if (previous) codes.push(derive(previous, bookingId, length));
+  if (previous) codes.push(derive(previous, bookingId, length, unit));
   return codes;
 }
 
+/** Unidade da reserva cujo código bate com o digitado, ou null. */
+export function matchCheckInCodeUnit(
+  bookingId: string,
+  units: number,
+  code: string,
+  length = CHECK_IN_CODE_LENGTH
+): number | null {
+  for (let unit = 0; unit < units; unit += 1) {
+    if (
+      listAcceptedCheckInCodes(bookingId, length, unit).some((accepted) =>
+        checkInCodesMatch(accepted, code)
+      )
+    ) {
+      return unit;
+    }
+  }
+  return null;
+}
+
 /**
  * Aceita minúsculas, espaços, hífen e o prefixo da tela (`PASS:`, `ENTR:`), que não é gravado nem
  * conferido (D20); devolve null se não for um código do tamanho pedido.

=== server/domain/bookings/utils/serviceProof.test.ts — ARQUIVO REESCRITO, substitua todo o conteúdo por este ===
import { describe, expect, it } from 'vitest';
import { hasServiceProof, newCheckIns, requiresServiceProof } from './serviceProof';

const CHECK_IN = { at: 't', byUid: 'p' };

describe('prova do serviço (D20)', () => {
  it('check-in de alguma unidade com código ou QR, ou "sim" do cliente, provam', () => {
    expect(hasServiceProof({ checkIns: [{ ...CHECK_IN, unit: 1, method: 'code' }] })).toBe(true);
    expect(hasServiceProof({ checkIns: [{ ...CHECK_IN, unit: 0, method: 'qr' }] })).toBe(true);
    expect(hasServiceProof({ checkIns: [{ ...CHECK_IN, unit: 0, method: 'no_code' }] })).toBe(
      false
    );
    expect(
      hasServiceProof({
        checkIns: [{ ...CHECK_IN, unit: 0, method: 'no_code' }],
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

  it('unidade repetida ou fora da reserva não conta de novo', () => {
    const booking = {
      participantsCount: 2,
      checkIns: [{ ...CHECK_IN, unit: 0, method: 'code' as const }],
    };
    const added = newCheckIns(booking, [
      { ...CHECK_IN, unit: 0, method: 'code' },
      { ...CHECK_IN, unit: 1, method: 'code' },
      { ...CHECK_IN, unit: 1, method: 'qr' },
      { ...CHECK_IN, unit: 2, method: 'code' },
    ]);
    expect(added.map((item) => item.unit)).toEqual([1]);
  });

  it('passeio, aluguel e translado esperam a prova; entrada de atração não', () => {
    expect(requiresServiceProof('tour')).toBe(true);
    expect(requiresServiceProof('rental')).toBe(true);
    expect(requiresServiceProof('transfer')).toBe(true);
    expect(requiresServiceProof('private_entry')).toBe(false);
  });
});

=== server/domain/bookings/utils/serviceProof.ts — ARQUIVO REESCRITO, substitua todo o conteúdo por este ===
import {
  type BookableOfferKind,
  type Booking,
  type BookingCheckIn,
  CHECK_IN_CODE_KINDS,
} from '../types/bookingTypes';

/** Tipos cujo repasse espera a prova do serviço (D20); a entrada de atração usa o QR. */
export function requiresServiceProof(kind: BookableOfferKind): boolean {
  return CHECK_IN_CODE_KINDS.includes(kind);
}

export function checkInsOf(booking: Pick<Booking, 'checkIns'>): BookingCheckIn[] {
  return booking.checkIns ?? [];
}

export function hasAnyCheckIn(booking: Pick<Booking, 'checkIns'>): boolean {
  return checkInsOf(booking).length > 0;
}

/**
 * Prova de que o serviço aconteceu (D20): check-in de alguma unidade com o código ou o QR, ou "sim"
 * do cliente na pergunta "O serviço aconteceu?". O "Cliente sem código" sozinho não prova nada.
 */
export function hasServiceProof(
  booking: Pick<Booking, 'checkIns' | 'serviceConfirmation'>
): boolean {
  return (
    checkInsOf(booking).some((checkIn) => checkIn.method !== 'no_code') ||
    booking.serviceConfirmation?.resolution === 'confirmed'
  );
}

/** Check-ins de unidades que ainda não têm check-in (repetir a mesma unidade não conta de novo). */
export function newCheckIns(
  booking: Pick<Booking, 'checkIns' | 'participantsCount'>,
  candidates: BookingCheckIn[]
): BookingCheckIn[] {
  const used = new Set(checkInsOf(booking).map((checkIn) => checkIn.unit));
  return candidates.filter((candidate) => {
    if (used.has(candidate.unit) || candidate.unit >= booking.participantsCount) return false;
    used.add(candidate.unit);
    return true;
  });
}

=== server/interfaces/http/bookings/bookingResponses.ts — diff ===
@@ -4,6 +4,7 @@ import type {
   Booking,
   BookingDetails,
   BookingStatus,
+  UnitCheckInResult,
 } from '../../../domain/bookings';
 
 /** Saída por allowlist (AGENTS.md §7.9 regra 4): nunca o documento inteiro. */
@@ -36,13 +37,15 @@ export function toBuyerBooking(booking: Booking) {
       : null,
     rescheduledAt: booking.rescheduledAt ?? null,
     pickupAddress: booking.pickupAddress ?? null,
-    checkIn: booking.checkIn
-      ? {
-          at: booking.checkIn.at,
-          method: booking.checkIn.method,
-          participantsPresent: booking.checkIn.participantsPresent,
-        }
-      : null,
+    // Por unidade, sem quem fez o check-in (allowlist, §7.9 regra 4).
+    checkIns: (booking.checkIns ?? []).map((checkIn) => ({
+      unit: checkIn.unit,
+      at: checkIn.at,
+      method: checkIn.method,
+    })),
+    businessName: booking.offerSnapshot.businessName ?? null,
+    sellingUnit: booking.offerSnapshot.sellingUnit ?? 'person',
+    groupMaxPeople: booking.offerSnapshot.groupMaxPeople ?? null,
     arrivedAt: booking.arrival?.at ?? null,
     providerAbsence: booking.providerAbsence
       ? {
@@ -106,3 +109,14 @@ export function toPartnerSlot(slot: AvailabilitySlot) {
     status: slot.status,
   };
 }
+
+/** Check-in de uma unidade: a reserva, qual unidade, o nome (entrada nominal) e se já tinha entrado. */
+export function toUnitCheckIn(result: UnitCheckInResult) {
+  return {
+    booking: toSellerBooking(result.booking),
+    unit: result.unit,
+    name: result.name,
+    alreadyCheckedIn: result.alreadyCheckedIn,
+    checkedInAt: result.checkedInAt,
+  };
+}

=== server/interfaces/http/bookings/bookingsController.test.ts — diff ===
@@ -203,10 +203,9 @@ describe('BookingsController', () => {
 
   it('código de check-in sai sem cache e só com os campos da visão (D20)', async () => {
     vi.mocked(getBookingCheckInCodeUseCase).mockResolvedValue({
-      code: 'K7M4QX',
+      codes: [{ unit: 0, code: 'K7M4QX', name: null, checkedInAt: null }],
       visibleFrom: '2026-11-10T03:00:00.000Z',
       validUntil: '2026-11-11T01:00:00.000Z',
-      checkedInAt: null,
     });
     const { res, status, json, setHeader } = response();
     await BookingsController.getCheckInCode(request({ params: { bookingId: 'bk_1' } }), res);
@@ -216,7 +215,7 @@ describe('BookingsController', () => {
     );
     expect(setHeader).toHaveBeenCalledWith('Cache-Control', 'no-store');
     expect(status).toHaveBeenCalledWith(200);
-    expect(json.mock.calls[0]?.[0]).toMatchObject({ code: 'K7M4QX' });
+    expect(json.mock.calls[0]?.[0]).toMatchObject({ codes: [{ code: 'K7M4QX' }] });
   });
 
   it('código de check-in de outra pessoa responde 404 (IDOR)', async () => {
@@ -236,12 +235,8 @@ describe('BookingsController', () => {
       booking: {
         ...BOOKING,
         pickupAddress: 'Pousada Vila Jeri',
-        checkIn: {
-          at: '2026-11-10T11:02:00.000Z',
-          byUid: 'p1',
-          method: 'code',
-          participantsPresent: 2,
-        },
+        checkIns: [{ unit: 1, at: '2026-11-10T11:02:00.000Z', byUid: 'p1', method: 'code' }],
+        offerSnapshot: { ...BOOKING.offerSnapshot, businessName: 'Buggy do Zé' },
       } as never,
       participants: [],
     });
@@ -249,7 +244,8 @@ describe('BookingsController', () => {
     await BookingsController.get(request({ params: { bookingId: 'bk_1' } }), res);
     expect(json.mock.calls[0]?.[0]).toMatchObject({
       pickupAddress: 'Pousada Vila Jeri',
-      checkIn: { at: '2026-11-10T11:02:00.000Z', participantsPresent: 2 },
+      checkIns: [{ unit: 1, at: '2026-11-10T11:02:00.000Z', method: 'code' }],
+      businessName: 'Buggy do Zé',
     });
     expect(JSON.stringify(json.mock.calls[0]?.[0])).not.toContain('byUid');
   });

=== server/interfaces/http/bookings/bookingsController.ts — diff ===
@@ -7,6 +7,7 @@ import { reportProviderAbsentApplicationUseCase } from '../../../application/use
 import {
   getBookingCheckInCodeUseCase,
   getEntryPassUseCase,
+  setParticipantNameUseCase,
   getBookingForActorUseCase,
   listAvailableSlotsUseCase,
   listMyBookingsUseCase,
@@ -20,6 +21,7 @@ import {
   DocumentIdSchema,
   IdempotencyKeyHeaderSchema,
   PageQuerySchema,
+  ParticipantNameSchema,
   ServiceConfirmationAnswerSchema,
   SlotWindowQuerySchema,
 } from './schemas/bookingSchemas';
@@ -127,6 +129,30 @@ export class BookingsController {
     }
   }
 
+  static async setParticipantName(req: AuthenticatedRequest, res: Response): Promise<Response> {
+    const actor = actorOf(req);
+    if (!actor) return sendError(res, 401, 'UNAUTHENTICATED', 'Não autenticado.');
+    const bookingId = DocumentIdSchema.safeParse(req.params.bookingId);
+    const unit = Number(req.params.unit);
+    const body = ParticipantNameSchema.safeParse(req.body);
+    if (!bookingId.success || !Number.isInteger(unit) || unit < 0 || unit > 49 || !body.success) {
+      return sendError(res, 400, 'VALIDATION_ERROR', 'Nome inválido.');
+    }
+    try {
+      const participant = await setParticipantNameUseCase(
+        actor,
+        bookingId.data,
+        unit,
+        body.data.name
+      );
+      return res
+        .status(200)
+        .json({ unit, name: participant.name, changed: Boolean(participant.nameChangedAt) });
+    } catch (error) {
+      return handleBookingError(res, 'setParticipantName', error);
+    }
+  }
+
   static async cancel(req: AuthenticatedRequest, res: Response): Promise<Response> {
     const actor = actorOf(req);
     if (!actor) return sendError(res, 401, 'UNAUTHENTICATED', 'Não autenticado.');

=== server/interfaces/http/bookings/bookingsRoutes.ts — diff ===
@@ -16,6 +16,11 @@ bookingsRouter.get('/me', verifyAuthToken, BookingsController.listMine);
 bookingsRouter.get('/:bookingId', verifyAuthToken, BookingsController.get);
 bookingsRouter.get('/:bookingId/check-in-code', verifyAuthToken, BookingsController.getCheckInCode);
 bookingsRouter.get('/:bookingId/entry-pass', verifyAuthToken, BookingsController.getEntryPass);
+bookingsRouter.put(
+  '/:bookingId/participants/:unit',
+  verifyAuthToken,
+  BookingsController.setParticipantName
+);
 bookingsRouter.post('/:bookingId/cancel', verifyAuthTokenStrict, BookingsController.cancel);
 bookingsRouter.post('/:bookingId/no-show', verifyAuthToken, BookingsController.markNoShow);
 // Relato e resposta mexem no reembolso (D20): token revogado não serve.

=== server/interfaces/http/bookings/partnerOffersController.test.ts — diff ===
@@ -54,42 +54,42 @@ describe('PartnerOffersController.checkIn (D20)', () => {
 
   it('401 sem autenticação', async () => {
     const { res, status } = response();
-    await PartnerOffersController.checkIn(
-      request({ code: 'K7M4QX', participantsPresent: 1 }, null),
-      res
-    );
+    await PartnerOffersController.checkIn(request({ code: 'K7M4QX' }, null), res);
     expect(status).toHaveBeenCalledWith(401);
   });
 
   it('400 com campo extra e sem chamar o caso de uso', async () => {
     const { res, status } = response();
-    await PartnerOffersController.checkIn(
-      request({ code: 'K7M4QX', participantsPresent: 1, bookingId: 'bk_1' }),
-      res
-    );
+    await PartnerOffersController.checkIn(request({ code: 'K7M4QX', bookingId: 'bk_1' }), res);
     expect(status).toHaveBeenCalledWith(400);
     expect(checkInBookingByCodeUseCase).not.toHaveBeenCalled();
   });
 
   it('repassa oferta, horário e corpo validados', async () => {
     vi.mocked(checkInBookingByCodeUseCase).mockResolvedValue({
-      id: 'bk_1',
-      status: 'confirmed',
-      lines: [],
-      offerSnapshot: { title: 'Buggy', startsAt: '', cancellationPolicy: 'flexible' },
-      checkIn: { at: 't', byUid: 'partner-1', method: 'code', participantsPresent: 2 },
+      unit: 0,
+      name: null,
+      alreadyCheckedIn: false,
+      checkedInAt: 't',
+      booking: {
+        id: 'bk_1',
+        status: 'confirmed',
+        lines: [],
+        offerSnapshot: { title: 'Buggy', startsAt: '', cancellationPolicy: 'flexible' },
+        checkIns: [{ unit: 0, at: 't', byUid: 'partner-1', method: 'code' }],
+      },
     } as never);
     const { res, status, json } = response();
-    await PartnerOffersController.checkIn(
-      request({ code: 'k7m-4qx', participantsPresent: 2 }),
-      res
-    );
+    await PartnerOffersController.checkIn(request({ code: 'k7m-4qx' }), res);
     expect(checkInBookingByCodeUseCase).toHaveBeenCalledWith(
       { uid: 'partner-1', admin: false },
-      { offerId: 'offer-1', slotId: 'slot-1', code: 'k7m-4qx', participantsPresent: 2 }
+      { offerId: 'offer-1', slotId: 'slot-1', code: 'k7m-4qx' }
     );
     expect(status).toHaveBeenCalledWith(200);
-    expect(json.mock.calls[0]?.[0]).toMatchObject({ checkIn: { participantsPresent: 2 } });
+    expect(json.mock.calls[0]?.[0]).toMatchObject({
+      unit: 0,
+      booking: { checkIns: [{ unit: 0 }] },
+    });
   });
 
   it('muitos erros respondem 429 no formato padrão', async () => {
@@ -100,7 +100,7 @@ describe('PartnerOffersController.checkIn (D20)', () => {
       )
     );
     const { res, status, json } = response();
-    await PartnerOffersController.checkIn(request({ code: 'K7M4QX', participantsPresent: 1 }), res);
+    await PartnerOffersController.checkIn(request({ code: 'K7M4QX' }), res);
     expect(status).toHaveBeenCalledWith(429);
     expect(json.mock.calls[0]?.[0]).toMatchObject({ error: { code: 'CHECK_IN_LOCKED' } });
   });
@@ -133,10 +133,7 @@ describe('PartnerOffersController — ações na reserva (D20)', () => {
 
   it('"Cliente sem código" só com motivo da lista', async () => {
     const bad = response();
-    await PartnerOffersController.checkInWithoutCode(
-      request({ participantsPresent: 2, reason: 'esqueceu' }),
-      bad.res
-    );
+    await PartnerOffersController.checkInWithoutCode(request({ reason: 'esqueceu' }), bad.res);
     expect(bad.status).toHaveBeenCalledWith(400);
     expect(checkInWithoutCodeApplicationUseCase).not.toHaveBeenCalled();
   });
@@ -147,17 +144,23 @@ describe('PartnerOffersController — entrada de atração (D20)', () => {
 
   it('repassa o QR lido e devolve a reserva com o check-in', async () => {
     vi.mocked(checkInEntryUseCase).mockResolvedValue({
-      id: 'bk_1',
-      lines: [],
-      offerSnapshot: { title: 'Lagoa', startsAt: '', cancellationPolicy: 'flexible' },
-      checkIn: { at: 't', byUid: 'partner-1', method: 'qr', participantsPresent: 2 },
+      unit: 0,
+      name: null,
+      alreadyCheckedIn: false,
+      checkedInAt: 't',
+      booking: {
+        id: 'bk_1',
+        lines: [],
+        offerSnapshot: { title: 'Lagoa', startsAt: '', cancellationPolicy: 'flexible' },
+        checkIns: [{ unit: 0, at: 't', byUid: 'partner-1', method: 'qr' }],
+      },
     } as never);
     const qrToken = `UGE1.${'a'.repeat(40)}.sig`;
     const { res, status } = response();
-    await PartnerOffersController.checkInEntry(request({ qrToken, participantsPresent: 2 }), res);
+    await PartnerOffersController.checkInEntry(request({ qrToken }), res);
     expect(checkInEntryUseCase).toHaveBeenCalledWith(
       { uid: 'partner-1', admin: false },
-      { offerId: 'offer-1', slotId: 'slot-1', qrToken, participantsPresent: 2 }
+      { offerId: 'offer-1', slotId: 'slot-1', qrToken }
     );
     expect(status).toHaveBeenCalledWith(200);
   });
@@ -165,7 +168,7 @@ describe('PartnerOffersController — entrada de atração (D20)', () => {
   it('QR e código juntos é 400; chaves públicas saem em { data }', async () => {
     const bad = response();
     await PartnerOffersController.checkInEntry(
-      request({ qrToken: `UGE1.${'a'.repeat(40)}`, code: 'K7M4QXAB', participantsPresent: 1 }),
+      request({ qrToken: `UGE1.${'a'.repeat(40)}`, code: 'K7M4QXAB' }),
       bad.res
     );
     expect(bad.status).toHaveBeenCalledWith(400);

=== server/interfaces/http/bookings/partnerOffersController.ts — diff ===
@@ -18,7 +18,7 @@ import {
 } from '../../../domain/bookings';
 import type { AuthenticatedRequest } from '../../../infrastructure/auth/authenticatedRequest';
 import { handleBookingError, sendError } from './bookingHttpErrors';
-import { toPartnerOffer, toPartnerSlot, toSellerBooking } from './bookingResponses';
+import { toPartnerOffer, toPartnerSlot, toSellerBooking, toUnitCheckIn } from './bookingResponses';
 import {
   CheckInByCodeSchema,
   CheckInWithoutCodeSchema,
@@ -205,12 +205,12 @@ export class PartnerOffersController {
       return sendError(res, 400, 'VALIDATION_ERROR', 'Dados do check-in inválidos.');
     }
     try {
-      const booking = await checkInBookingApplicationUseCase(actor, {
+      const result = await checkInBookingApplicationUseCase(actor, {
         offerId: offerId.data,
         slotId: slotId.data,
         ...body.data,
       });
-      return res.status(200).json(toSellerBooking(booking));
+      return res.status(200).json(toUnitCheckIn(result));
     } catch (error) {
       return handleBookingError(res, 'checkIn', error);
     }
@@ -273,12 +273,12 @@ export class PartnerOffersController {
       return sendError(res, 400, 'VALIDATION_ERROR', 'Dados da entrada inválidos.');
     }
     try {
-      const booking = await checkInEntryUseCase(actor, {
+      const result = await checkInEntryUseCase(actor, {
         offerId: offerId.data,
         slotId: slotId.data,
         ...body.data,
       });
-      return res.status(200).json(toSellerBooking(booking));
+      return res.status(200).json(toUnitCheckIn(result));
     } catch (error) {
       return handleBookingError(res, 'checkInEntry', error);
     }

=== server/interfaces/http/bookings/schemas/bookingSchemas.test.ts — diff ===
@@ -75,38 +75,32 @@ describe('bookingSchemas', () => {
     expect(CreateOfferSchema.safeParse({ ...OFFER, pickupMode: 'hotel' }).success).toBe(false);
   });
 
-  it('check-in: código, presentes e hora do aparelho; nada de reserva ou dono vindo do cliente', () => {
-    expect(CheckInByCodeSchema.safeParse({ code: 'k7m-4qx', participantsPresent: 2 }).success).toBe(
-      true
-    );
+  it('check-in: código e hora do aparelho; nada de reserva, dono ou pessoas vindo do cliente', () => {
+    expect(CheckInByCodeSchema.safeParse({ code: 'k7m-4qx' }).success).toBe(true);
     expect(
-      CheckInByCodeSchema.safeParse({
-        code: 'K7M4QX',
-        participantsPresent: 2,
-        capturedAt: '2026-11-10T11:02:00.000Z',
-      }).success
+      CheckInByCodeSchema.safeParse({ code: 'K7M4QX', capturedAt: '2026-11-10T11:02:00.000Z' })
+        .success
     ).toBe(true);
-    expect(CheckInByCodeSchema.safeParse({ code: 'K7M4QX', participantsPresent: 0 }).success).toBe(
+    expect(CheckInByCodeSchema.safeParse({ code: 'K7M4QX', participantsPresent: 2 }).success).toBe(
       false
     );
-    expect(
-      CheckInByCodeSchema.safeParse({ code: 'K7M4QX', participantsPresent: 2, bookingId: 'x' })
-        .success
-    ).toBe(false);
+    expect(CheckInByCodeSchema.safeParse({ code: 'K7M4QX', bookingId: 'x' }).success).toBe(false);
   });
 
-  it('entrada: QR ou código, nunca os dois nem nenhum (D20)', () => {
-    const qr = `UGE1.${'a'.repeat(40)}.sig`;
-    expect(EntryCheckInSchema.safeParse({ qrToken: qr, participantsPresent: 2 }).success).toBe(
-      true
-    );
+  it('venda por grupo: tamanho do grupo de 2 a 50', () => {
     expect(
-      EntryCheckInSchema.safeParse({ code: 'ENTR:K7M4QXAB', participantsPresent: 2 }).success
+      CreateOfferSchema.safeParse({ ...OFFER, sellingUnit: 'group', groupMaxPeople: 4 }).success
     ).toBe(true);
     expect(
-      EntryCheckInSchema.safeParse({ qrToken: qr, code: 'K7M4QXAB', participantsPresent: 2 })
-        .success
+      CreateOfferSchema.safeParse({ ...OFFER, sellingUnit: 'group', groupMaxPeople: 1 }).success
     ).toBe(false);
-    expect(EntryCheckInSchema.safeParse({ participantsPresent: 2 }).success).toBe(false);
+  });
+
+  it('entrada: QR ou código, nunca os dois nem nenhum (D20)', () => {
+    const qr = `UGE1.${'a'.repeat(40)}.sig`;
+    expect(EntryCheckInSchema.safeParse({ qrToken: qr }).success).toBe(true);
+    expect(EntryCheckInSchema.safeParse({ code: 'ENTR:K7M4QXAB' }).success).toBe(true);
+    expect(EntryCheckInSchema.safeParse({ qrToken: qr, code: 'K7M4QXAB' }).success).toBe(false);
+    expect(EntryCheckInSchema.safeParse({}).success).toBe(false);
   });
 });

=== server/interfaces/http/bookings/schemas/bookingSchemas.ts — diff ===
@@ -50,6 +50,8 @@ const offerFields = {
     .strict()
     .optional(),
   pickupMode: z.enum(['meeting_point', 'buyer_address']).optional(),
+  sellingUnit: z.enum(['person', 'group']).optional(),
+  groupMaxPeople: z.number().int().min(2).max(50).optional(),
   // Opções da plataforma (D14); o serviço confere se a opção vale para o tipo da oferta.
   cancellationPolicy: z.enum([...BOOKING_CANCELLATION_POLICIES, ...TRANSFER_CANCELLATION_POLICIES]),
   maxParticipantsPerBooking: z.number().int().min(1).max(50),
@@ -134,7 +136,6 @@ export const CheckInByCodeSchema = z
   .object({
     // Aceita minúsculas, espaço e hífen; o serviço normaliza e confere o alfabeto.
     code: z.string().trim().min(6).max(12),
-    participantsPresent: z.number().int().min(1).max(50),
     capturedAt: isoDateTime.optional(),
   })
   .strict();
@@ -155,7 +156,6 @@ export const ProviderArrivalSchema = z
 
 export const CheckInWithoutCodeSchema = z
   .object({
-    participantsPresent: z.number().int().min(1).max(50),
     // Mesma lista de NO_CODE_REASONS no domínio de reservas.
     reason: z.enum(['no_phone', 'refused', 'other']),
   })
@@ -172,7 +172,6 @@ export const EntryCheckInSchema = z
     qrToken: z.string().trim().min(20).max(1000).optional(),
     // Aceita o prefixo `ENTR:`, minúsculas, espaço e hífen; o serviço normaliza.
     code: z.string().trim().min(8).max(16).optional(),
-    participantsPresent: z.number().int().min(1).max(50),
     capturedAt: isoDateTime.optional(),
   })
   .strict()
@@ -180,6 +179,8 @@ export const EntryCheckInSchema = z
     message: 'Envie o QR Code ou o código, não os dois.',
   });
 
+export const ParticipantNameSchema = z.object({ name: z.string().trim().min(2).max(80) }).strict();
+
 export const CancelBookingSchema = z.object({ reason: z.string().max(300).optional() }).strict();
 
 export const SlotWindowQuerySchema = z

VERIFICAÇÃO (obrigatória):
- `npm run typecheck`, `npx biome lint .` (0 erros; arquivos tocados sem avisos), `npm run build`;
- testes ligados aos arquivos deste prompt: `npx vitest related --run server/application/usecases/bookings/answerProviderAbsenceApplicationUseCase.ts server/application/usecases/bookings/bookingServiceNotices.ts server/application/usecases/bookings/bookingServiceProofApplicationUseCases.test.ts server/application/usecases/bookings/checkInBookingApplicationUseCase.ts server/application/usecases/bookings/markBookingNoShowApplicationUseCase.ts server/application/usecases/bookings/recordProviderArrivalApplicationUseCase.ts server/application/usecases/payouts/bookingServiceEvidence.ts server/domain/bookings/adapters/ed25519EntryPassAdapter.test.ts server/domain/bookings/adapters/ed25519EntryPassAdapter.ts server/domain/bookings/adapters/firestoreBookingsAdapter.ts server/domain/bookings/adapters/firestoreCheckInStore.ts server/domain/bookings/adapters/guideBookableItemLookupAdapter.ts server/domain/bookings/adapters/inMemoryBookingsAdapter.ts server/domain/bookings/dtos/bookingPersistenceMappers.ts server/domain/bookings/errors/bookingDomainError.ts server/domain/bookings/factory.ts server/domain/bookings/index.ts server/domain/bookings/ports/bookableItemLookupPort.ts server/domain/bookings/ports/bookingsPort.ts server/domain/bookings/ports/entryPassSignerPort.ts server/domain/bookings/services/bookingCheckInService.test.ts server/domain/bookings/services/bookingCheckInService.ts server/domain/bookings/services/bookingEntryService.test.ts server/domain/bookings/services/bookingEntryService.ts server/domain/bookings/services/bookingParticipantService.test.ts server/domain/bookings/services/bookingParticipantService.ts server/domain/bookings/services/bookingService.test.ts server/domain/bookings/services/bookingService.ts server/domain/bookings/services/bookingServiceProofService.test.ts server/domain/bookings/services/bookingServiceProofService.ts server/domain/bookings/services/offerService.test.ts server/domain/bookings/services/offerService.ts server/domain/bookings/types/bookingTypes.ts server/domain/bookings/usecases/checkInBookingByCodeUseCase.ts server/domain/bookings/usecases/checkInEntryUseCase.ts server/domain/bookings/usecases/setParticipantNameUseCase.ts server/domain/bookings/utils/checkInCode.ts server/domain/bookings/utils/serviceProof.test.ts server/domain/bookings/utils/serviceProof.ts server/interfaces/http/bookings/bookingResponses.ts server/interfaces/http/bookings/bookingsController.test.ts server/interfaces/http/bookings/bookingsController.ts server/interfaces/http/bookings/bookingsRoutes.ts server/interfaces/http/bookings/partnerOffersController.test.ts server/interfaces/http/bookings/partnerOffersController.ts server/interfaces/http/bookings/schemas/bookingSchemas.test.ts server/interfaces/http/bookings/schemas/bookingSchemas.ts` (todos verdes). Não precisa rodar a suíte inteira.

ENTREGA: responda no formato do AGENTS.md §16.3.

LIMPEZA (obrigatória, ao terminar de implementar): apague todos os arquivos de public/assets/aistudio/, inclusive o deste prompt. São cópias dos textos colados no chat, salvas automaticamente pelo AI Studio, e public/ vai para o site publicado. Se a pasta ficar vazia, apague a pasta também.
~~~~

### Configurações manuais (você faz, fora do AI Studio, depois de aplicar este prompt)

Nenhuma.
