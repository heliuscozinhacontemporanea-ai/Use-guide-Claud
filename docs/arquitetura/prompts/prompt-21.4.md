# Prompt 21.4 — QR assinado e código de 8 caracteres na entrada de atração privada (backend)

> Lote 18, gerado dos commits de referência `fbd67ff..ef9f5a8` da branch `claude/agents-md-v2`. Aplique na ordem do lote (A7, 21.1 a 21.7d), um por vez. Cole o bloco abaixo no agente do AI Studio, inteiro, de uma vez.

---

## Prompt 21.4 — QR assinado e código de 8 caracteres na entrada de atração privada (backend)

Entrada de atração privada com QR Ed25519 próprio e código curto.

~~~~text
Siga o AGENTS.md. O app ainda não foi liberado para usuários: nenhum código de compatibilidade ou transição (§2.2 item 8). As regras de negócio estão nas decisões D20 e D21 de docs/arquitetura/decisoes.md (aplicadas pelo prompt A7).

IMPORTANTE: aplique os diffs abaixo EXATAMENTE, inclusive os arquivos novos. Não reescreva os arquivos do seu jeito. Arquivo tocado sai sem avisos do lint e formatado (AGENTS.md §13). Não altere firebase.json, functions/, AGENTS.md, docs/ nem .env.

O QUE MUDA:
1) QR da entrada assinado com Ed25519 (BOOKING_ENTRY_QR_PRIVATE_KEY_PEM / BOOKING_ENTRY_QR_KEY_ID); sem a chave, a rota responde erro (nunca gera chave na hora). A portaria baixa as chaves públicas para validar sem internet.
2) Código de 8 caracteres derivado como o do passeio, com rótulo próprio; 5 erros por pessoa e 50 por horário a cada 15 min.
3) Entrada não usada até o fechamento vira ausência.
4) .env.example e firestore.indexes.json.

ARQUIVOS (crie, altere ou apague exatamente estes):
- .env.example (alterar)
- firestore.indexes.json (alterar)
- server/application/usecases/payouts/bookingServiceEvidence.ts (alterar)
- server/domain/bookings/adapters/ed25519EntryPassAdapter.test.ts (criar)
- server/domain/bookings/adapters/ed25519EntryPassAdapter.ts (criar)
- server/domain/bookings/adapters/firestoreCheckInStore.ts (alterar)
- server/domain/bookings/adapters/inMemoryBookingsAdapter.ts (alterar)
- server/domain/bookings/errors/bookingDomainError.ts (alterar)
- server/domain/bookings/factory.ts (alterar)
- server/domain/bookings/index.ts (alterar)
- server/domain/bookings/ports/bookingsPort.ts (alterar)
- server/domain/bookings/ports/entryPassSignerPort.ts (criar)
- server/domain/bookings/services/bookingCheckInService.ts (alterar)
- server/domain/bookings/services/bookingEntryService.test.ts (criar)
- server/domain/bookings/services/bookingEntryService.ts (criar)
- server/domain/bookings/services/bookingService.test.ts (alterar)
- server/domain/bookings/services/bookingService.ts (alterar)
- server/domain/bookings/types/bookingTypes.ts (alterar)
- server/domain/bookings/usecases/checkInEntryUseCase.ts (criar)
- server/domain/bookings/usecases/getEntryPassUseCase.ts (criar)
- server/domain/bookings/usecases/getEntryVerificationKeysUseCase.ts (criar)
- server/domain/bookings/utils/checkInCode.ts (alterar)
- server/domain/bookings/utils/checkInWindow.ts (alterar)
- server/domain/bookings/utils/serviceProof.ts (alterar)
- server/interfaces/http/bookings/bookingsController.ts (alterar)
- server/interfaces/http/bookings/bookingsRoutes.ts (alterar)
- server/interfaces/http/bookings/partnerOffersController.test.ts (alterar)
- server/interfaces/http/bookings/partnerOffersController.ts (alterar)
- server/interfaces/http/bookings/schemas/bookingSchemas.test.ts (alterar)
- server/interfaces/http/bookings/schemas/bookingSchemas.ts (alterar)

Aplique as mudanças abaixo EXATAMENTE como estão (formato unified diff: linhas com "-" saem, linhas com "+" entram; as demais são contexto para localizar o trecho). Não reformate outros trechos dos arquivos.

=== .env.example — diff ===
@@ -36,6 +36,13 @@ TICKET_QR_SECRET_PREVIOUS=
 BOOKING_CHECKIN_CODE_SECRET=
 # Segredo anterior durante uma rotação (AGENTS.md §7.8); vazio fora de rotação.
 BOOKING_CHECKIN_CODE_SECRET_PREVIOUS=
+# QR da entrada de atração privada (D20): chave Ed25519 em PKCS#8 (openssl genpkey -algorithm ed25519)
+# e um ID de versão. Sem elas, a entrada responde erro; nunca é gerada chave na hora (AGENTS.md §7.7).
+BOOKING_ENTRY_QR_PRIVATE_KEY_PEM=
+BOOKING_ENTRY_QR_KEY_ID=
+# Só durante uma rotação (§7.8): chave pública e ID anteriores, aceitos até o fim das entradas emitidas.
+BOOKING_ENTRY_QR_PREVIOUS_PUBLIC_KEY_PEM=
+BOOKING_ENTRY_QR_PREVIOUS_KEY_ID=
 OFFLINE_CHECKIN_PRIVATE_KEY_PEM=
 OFFLINE_CHECKIN_KEY_ID=
 # Jobs internos (Cloud Functions → Cloud Run /internal/*).

=== firestore.indexes.json — diff ===
@@ -471,6 +471,24 @@
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
+          "fieldPath": "actorUid",
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

=== server/application/usecases/payouts/bookingServiceEvidence.ts — diff ===
@@ -6,7 +6,7 @@ export interface BookingServiceEvidence {
   pickupAddress: string | null;
   checkIn: {
     at: string;
-    method: 'code' | 'no_code';
+    method: 'code' | 'qr' | 'no_code';
     participantsPresent: number;
     participantsCount: number;
     noCodeReason: string | null;

=== server/domain/bookings/adapters/ed25519EntryPassAdapter.test.ts — ARQUIVO NOVO, conteúdo completo ===
import crypto from 'crypto';
import { afterEach, describe, expect, it } from 'vitest';
import { Ed25519EntryPassAdapter, resetEntryPassKeysForTests } from './ed25519EntryPassAdapter';

function pem(): { privatePem: string; publicPem: string } {
  const { privateKey, publicKey } = crypto.generateKeyPairSync('ed25519');
  return {
    privatePem: privateKey.export({ type: 'pkcs8', format: 'pem' }).toString(),
    publicPem: publicKey.export({ type: 'spki', format: 'pem' }).toString(),
  };
}

const PAYLOAD = {
  v: 1 as const,
  bid: 'bk_1',
  sid: 'slot-1',
  oid: 'offer-1',
  n: 2,
  exp: 1_800_000_000,
};

function useKey(privatePem: string, kid: string) {
  process.env.BOOKING_ENTRY_QR_PRIVATE_KEY_PEM = privatePem;
  process.env.BOOKING_ENTRY_QR_KEY_ID = kid;
  resetEntryPassKeysForTests();
}

describe('Ed25519EntryPassAdapter (§7.7)', () => {
  afterEach(() => {
    for (const name of [
      'BOOKING_ENTRY_QR_PRIVATE_KEY_PEM',
      'BOOKING_ENTRY_QR_KEY_ID',
      'BOOKING_ENTRY_QR_PREVIOUS_PUBLIC_KEY_PEM',
      'BOOKING_ENTRY_QR_PREVIOUS_KEY_ID',
    ]) {
      delete process.env[name];
    }
    resetEntryPassKeysForTests();
  });

  it('assina, confere e recusa QR alterado', () => {
    useKey(pem().privatePem, 'k1');
    const adapter = new Ed25519EntryPassAdapter();
    const token = adapter.sign(PAYLOAD);
    expect(token.startsWith('UGE1.')).toBe(true);
    // Ed25519 é determinística: o mesmo QR pode ser mostrado de novo sem gravar nada.
    expect(adapter.sign(PAYLOAD)).toBe(token);
    expect(adapter.verify(token)).toEqual({ ...PAYLOAD, kid: 'k1' });
    const [prefix, body, signature] = token.split('.');
    const forged = Buffer.from(JSON.stringify({ ...PAYLOAD, kid: 'k1', n: 9 }), 'utf8').toString(
      'base64url'
    );
    expect(adapter.verify(`${prefix}.${forged}.${signature}`)).toBeNull();
    expect(adapter.verify(`XXXX.${body}.${signature}`)).toBeNull();
    expect(adapter.verify('lixo')).toBeNull();
  });

  it('sem chave configurada falha, em vez de gerar chave na hora', () => {
    const adapter = new Ed25519EntryPassAdapter();
    expect(() => adapter.sign(PAYLOAD)).toThrow(/BOOKING_ENTRY_QR_PRIVATE_KEY_PEM/);
  });

  it('recusa chave que não é Ed25519', () => {
    const { privateKey } = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 });
    useKey(privateKey.export({ type: 'pkcs8', format: 'pem' }).toString(), 'k1');
    expect(() => new Ed25519EntryPassAdapter().sign(PAYLOAD)).toThrow(/Ed25519/);
  });

  it('na rotação, o QR assinado com a chave anterior continua valendo', () => {
    const old = pem();
    useKey(old.privatePem, 'k1');
    const oldToken = new Ed25519EntryPassAdapter().sign(PAYLOAD);
    useKey(pem().privatePem, 'k2');
    process.env.BOOKING_ENTRY_QR_PREVIOUS_PUBLIC_KEY_PEM = old.publicPem;
    process.env.BOOKING_ENTRY_QR_PREVIOUS_KEY_ID = 'k1';
    resetEntryPassKeysForTests();
    const adapter = new Ed25519EntryPassAdapter();
    expect(adapter.verify(oldToken)?.kid).toBe('k1');
    expect(adapter.publicKeys().map((key) => key.kid)).toEqual(['k2', 'k1']);
  });
});

=== server/domain/bookings/adapters/ed25519EntryPassAdapter.ts — ARQUIVO NOVO, conteúdo completo ===
import crypto from 'crypto';
import type { EntryPassPayload, EntryPassSignerPort } from '../ports/entryPassSignerPort';

/** Prefixo do QR da entrada: separa de qualquer outro token e permite trocar o formato depois. */
export const ENTRY_PASS_PREFIX = 'UGE1';

interface LoadedKeys {
  kid: string;
  privateKey: crypto.KeyObject;
  verifiers: Array<{ kid: string; publicKey: crypto.KeyObject }>;
}

let loaded: LoadedKeys | null = null;

function readPem(name: string): string | null {
  const value = process.env[name]?.trim();
  return value ? value.replace(/\\n/g, '\n') : null;
}

// Sem chave configurada a entrada não funciona: nunca gerar chave na hora (AGENTS.md §7.7).
function keys(): LoadedKeys {
  if (loaded) return loaded;
  const pem = readPem('BOOKING_ENTRY_QR_PRIVATE_KEY_PEM');
  const kid = process.env.BOOKING_ENTRY_QR_KEY_ID?.trim();
  if (!pem || !kid) {
    throw new Error('BOOKING_ENTRY_QR_PRIVATE_KEY_PEM ou BOOKING_ENTRY_QR_KEY_ID ausente.');
  }
  const privateKey = crypto.createPrivateKey(pem);
  if (privateKey.asymmetricKeyType !== 'ed25519') {
    throw new Error('BOOKING_ENTRY_QR_PRIVATE_KEY_PEM precisa ser uma chave Ed25519.');
  }
  const verifiers = [{ kid, publicKey: crypto.createPublicKey(privateKey) }];
  // Rotação (§7.8): a chave pública anterior vale até o fim das entradas já emitidas com ela.
  const previousPem = readPem('BOOKING_ENTRY_QR_PREVIOUS_PUBLIC_KEY_PEM');
  const previousKid = process.env.BOOKING_ENTRY_QR_PREVIOUS_KEY_ID?.trim();
  if (previousPem && previousKid) {
    verifiers.push({ kid: previousKid, publicKey: crypto.createPublicKey(previousPem) });
  }
  loaded = { kid, privateKey, verifiers };
  return loaded;
}

function isPayload(value: unknown): value is EntryPassPayload {
  const p = value as Partial<EntryPassPayload> | null;
  return (
    !!p &&
    p.v === 1 &&
    typeof p.kid === 'string' &&
    typeof p.bid === 'string' &&
    typeof p.sid === 'string' &&
    typeof p.oid === 'string' &&
    typeof p.n === 'number' &&
    typeof p.exp === 'number'
  );
}

/** Ed25519: assinatura determinística, então o mesmo QR pode ser reemitido sem gravar nada. */
export class Ed25519EntryPassAdapter implements EntryPassSignerPort {
  sign(payload: Omit<EntryPassPayload, 'kid'>): string {
    const { kid, privateKey } = keys();
    const body = Buffer.from(JSON.stringify({ ...payload, kid }), 'utf8').toString('base64url');
    const signature = crypto.sign(null, Buffer.from(body, 'utf8'), privateKey);
    return `${ENTRY_PASS_PREFIX}.${body}.${signature.toString('base64url')}`;
  }

  verify(token: string): EntryPassPayload | null {
    const [prefix, body, signature, extra] = token.trim().split('.');
    if (prefix !== ENTRY_PASS_PREFIX || !body || !signature || extra !== undefined) return null;
    try {
      const payload: unknown = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
      if (!isPayload(payload)) return null;
      const verifier = keys().verifiers.find((candidate) => candidate.kid === payload.kid);
      if (!verifier) return null;
      const valid = crypto.verify(
        null,
        Buffer.from(body, 'utf8'),
        verifier.publicKey,
        Buffer.from(signature, 'base64url')
      );
      return valid ? payload : null;
    } catch {
      return null;
    }
  }

  publicKeys(): Array<{ kid: string; publicKeyJwk: JsonWebKey }> {
    return keys().verifiers.map(({ kid, publicKey }) => ({
      kid,
      publicKeyJwk: publicKey.export({ format: 'jwk' }) as JsonWebKey,
    }));
  }
}

/** Só testes: esquece as chaves lidas para trocar as variáveis de ambiente. */
export function resetEntryPassKeysForTests(): void {
  loaded = null;
}

=== server/domain/bookings/adapters/firestoreCheckInStore.ts — diff ===
@@ -36,13 +36,10 @@ export class FirestoreCheckInStore {
     });
   }
 
-  async countCheckInFailures(slotId: string, sinceIso: string): Promise<number> {
-    const snapshot = await adminDb
-      .collection(CHECK_IN_FAILURES)
-      .where('slotId', '==', slotId)
-      .where('at', '>=', sinceIso)
-      .count()
-      .get();
+  async countCheckInFailures(slotId: string, sinceIso: string, actorUid?: string): Promise<number> {
+    let query = adminDb.collection(CHECK_IN_FAILURES).where('slotId', '==', slotId);
+    if (actorUid) query = query.where('actorUid', '==', actorUid);
+    const snapshot = await query.where('at', '>=', sinceIso).count().get();
     return snapshot.data().count;
   }

=== server/domain/bookings/adapters/inMemoryBookingsAdapter.ts — diff ===
@@ -237,8 +237,10 @@ export class InMemoryBookingsAdapter implements BookingsPort {
   async deleteParticipants(bookingId: string) {
     this.participants.delete(bookingId);
   }
-  async countCheckInFailures(slotId: string, sinceIso: string) {
-    return this.checkInFailures.filter((f) => f.slotId === slotId && f.at >= sinceIso).length;
+  async countCheckInFailures(slotId: string, sinceIso: string, actorUid?: string) {
+    return this.checkInFailures.filter(
+      (f) => f.slotId === slotId && f.at >= sinceIso && (!actorUid || f.actorUid === actorUid)
+    ).length;
   }
   async addCheckInFailure(slotId: string, actorUid: string, at: string) {
     this.checkInFailures.push({ slotId, actorUid, at });

=== server/domain/bookings/errors/bookingDomainError.ts — diff ===
@@ -20,7 +20,8 @@ export type BookingErrorCode =
   | 'NO_SHOW_TOO_EARLY'
   | 'ABSENCE_REPORT_NOT_ALLOWED'
   | 'NOTHING_TO_ANSWER'
-  | 'SERVICE_NOT_VERIFIED';
+  | 'SERVICE_NOT_VERIFIED'
+  | 'INVALID_ENTRY_PASS';
 
 const STATUS_BY_CODE: Record<BookingErrorCode, number> = {
   VALIDATION_ERROR: 400,
@@ -45,6 +46,7 @@ const STATUS_BY_CODE: Record<BookingErrorCode, number> = {
   ABSENCE_REPORT_NOT_ALLOWED: 422,
   NOTHING_TO_ANSWER: 409,
   SERVICE_NOT_VERIFIED: 422,
+  INVALID_ENTRY_PASS: 422,
 };
 
 export class BookingDomainError extends Error {

=== server/domain/bookings/factory.ts — diff ===
@@ -1,6 +1,8 @@
+import { Ed25519EntryPassAdapter } from './adapters/ed25519EntryPassAdapter';
 import { FirestoreBookingsAdapter } from './adapters/firestoreBookingsAdapter';
 import { GuideBookableItemLookupAdapter } from './adapters/guideBookableItemLookupAdapter';
 import { BookingCheckInService } from './services/bookingCheckInService';
+import { BookingEntryService } from './services/bookingEntryService';
 import { BookingPrivacyService } from './services/bookingPrivacyService';
 import { BookingService } from './services/bookingService';
 import { BookingServiceProofService } from './services/bookingServiceProofService';
@@ -11,6 +13,7 @@ let bookingService: BookingService | null = null;
 let checkInService: BookingCheckInService | null = null;
 let serviceProofService: BookingServiceProofService | null = null;
 let privacyService: BookingPrivacyService | null = null;
+let entryService: BookingEntryService | null = null;
 let port: FirestoreBookingsAdapter | null = null;
 
 function getPort(): FirestoreBookingsAdapter {
@@ -42,3 +45,9 @@ export function getBookingPrivacyService(): BookingPrivacyService {
   privacyService ??= new BookingPrivacyService(getPort());
   return privacyService;
 }
+
+export function getBookingEntryService(): BookingEntryService {
+  // A chave só é lida na primeira assinatura ou conferência (AGENTS.md §2.2 item 4).
+  entryService ??= new BookingEntryService(getPort(), new Ed25519EntryPassAdapter());
+  return entryService;
+}

=== server/domain/bookings/index.ts — diff ===
@@ -6,6 +6,7 @@ export type {
   BuyerCancellationResult,
   CreatePendingBookingInput,
 } from './services/bookingService';
+export type { EntryCheckInInput, EntryPassView } from './services/bookingEntryService';
 export type { CheckInWithoutCodeInput } from './services/bookingServiceProofService';
 export type { CreateSlotsInput, OfferInput } from './services/offerService';
 export {
@@ -33,6 +34,7 @@ export { cancelBookingForCanceledSlotUseCase } from './usecases/cancelBookingFor
 export { cancelPendingBookingUseCase } from './usecases/cancelPendingBookingUseCase';
 export { cancelSlotByPartnerUseCase } from './usecases/cancelSlotByPartnerUseCase';
 export { checkInBookingByCodeUseCase } from './usecases/checkInBookingByCodeUseCase';
+export { checkInEntryUseCase } from './usecases/checkInEntryUseCase';
 export { checkInWithoutCodeUseCase } from './usecases/checkInWithoutCodeUseCase';
 export { clearBookingDeadlineUseCase } from './usecases/clearBookingDeadlineUseCase';
 export { completeFinishedBookingsUseCase } from './usecases/completeFinishedBookingsUseCase';
@@ -46,6 +48,8 @@ export { getBookingCheckInCodeUseCase } from './usecases/getBookingCheckInCodeUs
 export { getBookingForAbsenceReportUseCase } from './usecases/getBookingForAbsenceReportUseCase';
 export { getBookingForActorUseCase } from './usecases/getBookingForActorUseCase';
 export { getBookingUseCase } from './usecases/getBookingUseCase';
+export { getEntryPassUseCase } from './usecases/getEntryPassUseCase';
+export { getEntryVerificationKeysUseCase } from './usecases/getEntryVerificationKeysUseCase';
 export { getVerifiedServiceForReviewUseCase } from './usecases/getVerifiedServiceForReviewUseCase';
 export { getOpenProviderAbsenceUseCase } from './usecases/getOpenProviderAbsenceUseCase';
 export { getPendingServiceConfirmationUseCase } from './usecases/getPendingServiceConfirmationUseCase';

=== server/domain/bookings/ports/bookingsPort.ts — diff ===
@@ -73,7 +73,7 @@ export interface BookingsPort {
    */
   recordCheckIn(bookingId: string, checkIn: BookingCheckIn): Promise<Booking>;
   /** Códigos errados no horário desde `sinceIso`, contados no Firestore (o Cloud Run não guarda estado). */
-  countCheckInFailures(slotId: string, sinceIso: string): Promise<number>;
+  countCheckInFailures(slotId: string, sinceIso: string, actorUid?: string): Promise<number>;
   addCheckInFailure(slotId: string, actorUid: string, atIso: string): Promise<void>;
 
   /**

=== server/domain/bookings/ports/entryPassSignerPort.ts — ARQUIVO NOVO, conteúdo completo ===
/** Conteúdo assinado do QR da entrada de atração privada (D20). Só IDs internos, sem PII. */
export interface EntryPassPayload {
  v: 1;
  kid: string;
  /** Reserva, horário e oferta da entrada. */
  bid: string;
  sid: string;
  oid: string;
  /** Pessoas da reserva, para a portaria conferir sem internet. */
  n: number;
  /** Validade em segundos (fim do dia do horário). */
  exp: number;
}

/** Assinatura do QR da entrada, verificável sem internet pela chave pública (AGENTS.md §7.7). */
export interface EntryPassSignerPort {
  sign(payload: Omit<EntryPassPayload, 'kid'>): string;
  /** Devolve o conteúdo se a assinatura vale para a chave atual ou a anterior; senão null. */
  verify(token: string): EntryPassPayload | null;
  publicKeys(): Array<{ kid: string; publicKeyJwk: JsonWebKey }>;
}

=== server/domain/bookings/services/bookingCheckInService.ts — diff ===
@@ -17,13 +17,10 @@ import {
   CHECK_IN_MAX_FAILURES,
   checkInCodeVisibleFromMs,
   checkInWindow,
+  resolveCheckInTime,
 } from '../utils/checkInWindow';
 import { hasServiceProof } from '../utils/serviceProof';
 
-// Check-in sem internet chega depois: aceita até 24 h de atraso e 1 min de relógio adiantado.
-const OFFLINE_MAX_DELAY_MS = 24 * 60 * 60 * 1000;
-const CLOCK_SKEW_MS = 60 * 1000;
-
 export interface CheckInCodeView {
   /** null antes das 00:00 do dia do serviço e depois que a janela de check-in fecha. */
   code: string | null;
@@ -94,7 +91,10 @@ export class BookingCheckInService {
     }
 
     const nowDate = this.now();
-    const atMs = this.checkInTime(input.capturedAt, nowDate.getTime());
+    const atMs = resolveCheckInTime(input.capturedAt, nowDate.getTime());
+    if (atMs === null) {
+      throw new BookingDomainError('VALIDATION_ERROR', 'Hora do check-in inválida.');
+    }
     const { opensAtMs, closesAtMs } = checkInWindow(slot.startsAt, offer.durationMinutes);
     if (atMs < opensAtMs || atMs > closesAtMs) {
       throw new BookingDomainError(
@@ -151,17 +151,4 @@ export class BookingCheckInService {
     const booking = await this.port.getBooking(bookingId);
     return booking ? hasServiceProof(booking) : false;
   }
-
-  private checkInTime(capturedAt: string | undefined, nowMs: number): number {
-    if (!capturedAt) return nowMs;
-    const capturedMs = new Date(capturedAt).getTime();
-    if (
-      Number.isNaN(capturedMs) ||
-      capturedMs > nowMs + CLOCK_SKEW_MS ||
-      capturedMs < nowMs - OFFLINE_MAX_DELAY_MS
-    ) {
-      throw new BookingDomainError('VALIDATION_ERROR', 'Hora do check-in inválida.');
-    }
-    return Math.min(capturedMs, nowMs);
-  }
 }

=== server/domain/bookings/services/bookingEntryService.test.ts — ARQUIVO NOVO, conteúdo completo ===
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { InMemoryBookingsAdapter } from '../adapters/inMemoryBookingsAdapter';
import type { EntryPassPayload, EntryPassSignerPort } from '../ports/entryPassSignerPort';
import type { BookableOffer, Booking } from '../types/bookingTypes';
import { deriveCheckInCode, ENTRY_CODE_LENGTH } from '../utils/checkInCode';
import { BookingEntryService } from './bookingEntryService';

const OWNER = { uid: 'partner-1', admin: false };
const BUYER = { uid: 'buyer-1', admin: false };
const STARTS_AT = '2026-11-10T12:00:00.000Z';
const ENDS_AT = '2026-11-10T20:00:00.000Z';

/** Assinador de teste: o token é o próprio conteúdo em JSON, com "assinatura" fixa. */
class FakeSigner implements EntryPassSignerPort {
  sign(payload: Omit<EntryPassPayload, 'kid'>): string {
    return `UGE1.${JSON.stringify({ ...payload, kid: 'k1' })}.ok`;
  }
  verify(token: string): EntryPassPayload | null {
    const [, body, signature] = token.split(/\.(?=\{)|\.(?=ok$)/);
    return signature === 'ok' && body ? (JSON.parse(body) as EntryPassPayload) : null;
  }
  publicKeys() {
    return [{ kid: 'k1', publicKeyJwk: { kty: 'OKP', crv: 'Ed25519', x: 'abc' } }];
  }
}

function offer(overrides: Partial<BookableOffer> = {}): BookableOffer {
  return {
    id: 'offer-1',
    guideItemId: 'item-1',
    ownerId: 'partner-1',
    partnerId: 'partner-1',
    kind: 'private_entry',
    title: { 'pt-BR': 'Lagoa privada' },
    status: 'published',
    pricing: { currency: 'BRL', priceOptions: [] },
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
    kind: 'private_entry',
    status: 'confirmed',
    lines: [],
    participantsCount: 3,
    subtotalMinor: 9000,
    platformFeeMinor: 1350,
    totalMinor: 9000,
    expiresAt: null,
    offerSnapshot: { title: 'Lagoa privada', startsAt: STARTS_AT, cancellationPolicy: 'moderate' },
    locale: 'pt-BR',
    idempotencyKey: `key-${id}`,
    createdAt: '2026-11-01T12:00:00.000Z',
    updatedAt: '',
    ...overrides,
  };
}

function setup(now = '2026-11-10T14:00:00.000Z') {
  const port = new InMemoryBookingsAdapter();
  port.offers.set('offer-1', offer());
  port.offers.set('offer-2', offer({ id: 'offer-2', kind: 'tour' }));
  port.slots.set('slot-1', {
    id: 'slot-1',
    offerId: 'offer-1',
    startsAt: STARTS_AT,
    endsAt: ENDS_AT,
    capacityTotal: 50,
    capacityReserved: 0,
    capacitySold: 5,
    status: 'open',
    createdAt: '',
    updatedAt: '',
  });
  port.bookings.set('bk_1', booking('bk_1'));
  port.bookings.set('bk_2', booking('bk_2', { buyerId: 'buyer-2', participantsCount: 1 }));
  let current = new Date(now);
  const service = new BookingEntryService(port, new FakeSigner(), () => current);
  return { port, service, setNow: (iso: string) => (current = new Date(iso)) };
}

const entry = (extra: Record<string, unknown>) => ({
  offerId: 'offer-1',
  slotId: 'slot-1',
  participantsPresent: 2,
  ...extra,
});

describe('BookingEntryService (D20)', () => {
  beforeEach(() => {
    process.env.BOOKING_CHECKIN_CODE_SECRET = 's'.repeat(32);
  });
  afterEach(() => {
    delete process.env.BOOKING_CHECKIN_CODE_SECRET;
  });

  it('o comprador vê QR e código de 8 caracteres só no dia, até o fechamento', async () => {
    const early = setup('2026-11-10T02:59:00.000Z');
    expect(await early.service.getEntryPass(BUYER, 'bk_1')).toMatchObject({
      qrToken: null,
      code: null,
      visibleFrom: '2026-11-10T03:00:00.000Z',
      validUntil: ENDS_AT,
    });
    const { service } = setup();
    const pass = await service.getEntryPass(BUYER, 'bk_1');
    expect(pass.code).toBe(deriveCheckInCode('bk_1', ENTRY_CODE_LENGTH));
    expect(pass.code).toHaveLength(8);
    expect(pass.qrToken).toContain('"bid":"bk_1"');
    await expect(service.getEntryPass(OWNER, 'bk_1')).rejects.toMatchObject({ code: 'NOT_FOUND' });
  });

  it('o código da entrada não repete os 6 caracteres do passeio', () => {
    expect(deriveCheckInCode('bk_1', ENTRY_CODE_LENGTH).slice(0, 6)).not.toBe(
      deriveCheckInCode('bk_1')
    );
  });

  it('portaria lê o QR, grava a entrada e não deixa entrar de novo', async () => {
    const { service, port } = setup();
    const pass = await service.getEntryPass(BUYER, 'bk_1');
    const updated = await service.checkIn(OWNER, entry({ qrToken: pass.qrToken }));
    expect(updated.checkIn).toMatchObject({ method: 'qr', participantsPresent: 2 });
    const again = await service.checkIn(
      OWNER,
      entry({ qrToken: pass.qrToken, participantsPresent: 1 })
    );
    expect(again.checkIn?.participantsPresent).toBe(2);
    expect(port.audit.filter((a) => a.reason === 'checked_in')).toHaveLength(1);
  });

  it('código de 8 caracteres com prefixo da tela também vale', async () => {
    const { service } = setup();
    const code = deriveCheckInCode('bk_2', ENTRY_CODE_LENGTH);
    const updated = await service.checkIn(
      OWNER,
      entry({ code: `entr:${code}`, participantsPresent: 1 })
    );
    expect(updated).toMatchObject({ id: 'bk_2', checkIn: { method: 'code' } });
  });

  it('QR de outro horário ou adulterado é recusado', async () => {
    const { service } = setup();
    const forged = `UGE1.${JSON.stringify({ v: 1, kid: 'k1', bid: 'bk_1', sid: 'slot-9', oid: 'offer-1', n: 3, exp: 1 })}.ok`;
    await expect(service.checkIn(OWNER, entry({ qrToken: forged }))).rejects.toMatchObject({
      code: 'INVALID_ENTRY_PASS',
    });
    await expect(service.checkIn(OWNER, entry({ qrToken: 'UGE1.{}.bad' }))).rejects.toMatchObject({
      code: 'INVALID_ENTRY_PASS',
    });
  });

  it('5 códigos errados da mesma pessoa travam por 15 min', async () => {
    const { service, port } = setup();
    for (let attempt = 0; attempt < 5; attempt += 1) {
      await expect(service.checkIn(OWNER, entry({ code: 'ZZZZZZZZ' }))).rejects.toMatchObject({
        code: 'INVALID_CHECK_IN_CODE',
      });
    }
    await expect(
      service.checkIn(OWNER, entry({ code: deriveCheckInCode('bk_1', ENTRY_CODE_LENGTH) }))
    ).rejects.toMatchObject({ code: 'CHECK_IN_LOCKED' });
    expect(port.checkInFailures.every((f) => f.actorUid === 'partner-1')).toBe(true);
  });

  it('50 erros no horário travam todo mundo, mesmo quem não errou', async () => {
    const { service, port } = setup();
    for (let i = 0; i < 50; i += 1) {
      port.checkInFailures.push({
        slotId: 'slot-1',
        actorUid: `staff-${i}`,
        at: '2026-11-10T13:59:00.000Z',
      });
    }
    await expect(
      service.checkIn(OWNER, entry({ code: deriveCheckInCode('bk_1', ENTRY_CODE_LENGTH) }))
    ).rejects.toMatchObject({ code: 'CHECK_IN_LOCKED' });
  });

  it('depois do fechamento a entrada não vale; outro parceiro ou oferta que não é entrada recebem 404/422', async () => {
    const late = setup('2026-11-10T20:01:00.000Z');
    await expect(
      late.service.checkIn(OWNER, entry({ code: deriveCheckInCode('bk_1', ENTRY_CODE_LENGTH) }))
    ).rejects.toMatchObject({ code: 'CHECK_IN_WINDOW_CLOSED' });
    const { service } = setup();
    await expect(
      service.checkIn({ uid: 'partner-2', admin: false }, entry({ code: 'X' }))
    ).rejects.toMatchObject({ code: 'NOT_FOUND' });
    await expect(service.getVerificationKeys(OWNER, 'offer-2')).rejects.toMatchObject({
      code: 'CHECK_IN_NOT_APPLICABLE',
    });
    expect(await service.getVerificationKeys(OWNER, 'offer-1')).toHaveLength(1);
  });

  it('entrada validada sem internet vale pela hora do aparelho, se foi antes do fechamento', async () => {
    const { service } = setup('2026-11-10T21:00:00.000Z');
    const updated = await service.checkIn(
      OWNER,
      entry({
        code: deriveCheckInCode('bk_1', ENTRY_CODE_LENGTH),
        capturedAt: '2026-11-10T19:30:00.000Z',
      })
    );
    expect(updated.checkIn).toMatchObject({
      at: '2026-11-10T19:30:00.000Z',
      syncedAt: '2026-11-10T21:00:00.000Z',
    });
  });
});

=== server/domain/bookings/services/bookingEntryService.ts — ARQUIVO NOVO, conteúdo completo ===
import { BookingDomainError } from '../errors/bookingDomainError';
import type { BookingsPort } from '../ports/bookingsPort';
import type { EntryPassSignerPort } from '../ports/entryPassSignerPort';
import type {
  AvailabilitySlot,
  Booking,
  BookingActor,
  BookingCheckIn,
} from '../types/bookingTypes';
import {
  checkInCodesMatch,
  deriveCheckInCode,
  ENTRY_CODE_LENGTH,
  listAcceptedCheckInCodes,
  normalizeCheckInCode,
} from '../utils/checkInCode';
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

export interface EntryPassView {
  /** QR assinado e código de 8 caracteres; null fora do dia da entrada ou depois do check-in. */
  qrToken: string | null;
  code: string | null;
  visibleFrom: string;
  validUntil: string;
  checkedInAt: string | null;
}

export interface EntryCheckInInput {
  offerId: string;
  slotId: string;
  /** Um dos dois: o QR lido ou o código digitado. */
  qrToken?: string;
  code?: string;
  participantsPresent: number;
  /** Hora do aparelho quando a entrada foi validada sem internet. */
  capturedAt?: string;
}

/** Entrada de atração privada (D20): QR assinado, verificável sem internet, e código de 8 caracteres. */
export class BookingEntryService {
  constructor(
    private readonly port: BookingsPort,
    private readonly signer: EntryPassSignerPort,
    private readonly now: () => Date = () => new Date()
  ) {}

  async getEntryPass(actor: BookingActor, bookingId: string): Promise<EntryPassView> {
    const booking = await this.port.getBooking(bookingId);
    // Só o comprador vê a entrada; para os demais ela responde como inexistente (§7.10).
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
    const visible = nowMs >= visibleFromMs && nowMs <= closesAtMs && !booking.checkIn;
    return {
      qrToken: visible ? this.sign(booking, slot, closesAtMs) : null,
      code: visible ? deriveCheckInCode(booking.id, ENTRY_CODE_LENGTH) : null,
      visibleFrom: new Date(visibleFromMs).toISOString(),
      validUntil: new Date(closesAtMs).toISOString(),
      checkedInAt: booking.checkIn?.at ?? null,
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

  async checkIn(actor: BookingActor, input: EntryCheckInInput): Promise<Booking> {
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
    const booking = input.qrToken
      ? await this.bookingFromQr(input.qrToken, slot)
      : await this.bookingFromCode(actor, slot, input.code ?? '', nowDate);
    if (input.participantsPresent > booking.participantsCount) {
      throw new BookingDomainError(
        'VALIDATION_ERROR',
        'Presentes acima do número de pessoas da reserva.'
      );
    }
    const checkIn: BookingCheckIn = {
      at: new Date(atMs).toISOString(),
      byUid: actor.uid,
      method: input.qrToken ? 'qr' : 'code',
      participantsPresent: input.participantsPresent,
      ...(input.capturedAt ? { syncedAt: nowDate.toISOString() } : {}),
    };
    // Repetir a entrada devolve o check-in já gravado: a pessoa não entra duas vezes.
    return this.port.recordCheckIn(booking.id, checkIn);
  }

  private sign(booking: Booking, slot: AvailabilitySlot, closesAtMs: number): string {
    return this.signer.sign({
      v: 1,
      bid: booking.id,
      sid: slot.id,
      oid: booking.offerId,
      n: booking.participantsCount,
      exp: Math.floor(closesAtMs / 1000),
    });
  }

  private async bookingFromQr(token: string, slot: AvailabilitySlot): Promise<Booking> {
    const payload = this.signer.verify(token);
    if (!payload || payload.sid !== slot.id || payload.oid !== slot.offerId) {
      throw new BookingDomainError('INVALID_ENTRY_PASS', 'QR Code inválido para este horário.');
    }
    const booking = await this.port.getBooking(payload.bid);
    if (!booking || !isActiveEntry(booking)) {
      throw new BookingDomainError('INVALID_ENTRY_PASS', 'Esta entrada não vale mais.');
    }
    return booking;
  }

  private async bookingFromCode(
    actor: BookingActor,
    slot: AvailabilitySlot,
    rawCode: string,
    nowDate: Date
  ): Promise<Booking> {
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
    const match = code
      ? (await this.port.listBookingsBySlot(slot.id))
          .filter(isActiveEntry)
          .find((booking) =>
            listAcceptedCheckInCodes(booking.id, ENTRY_CODE_LENGTH).some((accepted) =>
              checkInCodesMatch(accepted, code)
            )
          )
      : undefined;
    if (!match) {
      await this.port.addCheckInFailure(slot.id, actor.uid, nowDate.toISOString());
      throw new BookingDomainError('INVALID_CHECK_IN_CODE', 'Código incorreto.');
    }
    return match;
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

=== server/domain/bookings/services/bookingService.test.ts — diff ===
@@ -326,4 +326,18 @@ describe('BookingService', () => {
     expect(result).toMatchObject({ completed: 1, askedToConfirm: [] });
     expect(port.bookings.get(booking.id)?.serviceConfirmation).toBeUndefined();
   });
+
+  it('entrada de atração não usada até o fechamento vira ausência, sem pergunta (D20, A)', async () => {
+    const { service, port, setNow } = setup({ offer: { kind: 'private_entry' } });
+    const slot = port.slots.get('slot-1');
+    if (slot) port.slots.set('slot-1', { ...slot, endsAt: '2026-11-10T20:00:00.000Z' });
+    const booking = await service.createPendingBooking(BUYER, INPUT, FEES);
+    await service.confirmBookingPayment(booking.id, 'pi_1');
+    setNow('2026-11-10T19:00:00.000Z');
+    expect((await service.completeFinishedBookings()).completed).toBe(0);
+    setNow('2026-11-10T20:01:00.000Z');
+    const result = await service.completeFinishedBookings();
+    expect(result).toMatchObject({ completed: 1, askedToConfirm: [] });
+    expect(port.bookings.get(booking.id)?.status).toBe('no_show');
+  });
 });

=== server/domain/bookings/services/bookingService.ts — diff ===
@@ -10,7 +10,7 @@ import {
   cancellationFamilyOf,
   type Page,
 } from '../types/bookingTypes';
-import { NO_SHOW_WAIT_MS, SERVICE_CONFIRMATION_MS } from '../utils/checkInWindow';
+import { entryWindow, NO_SHOW_WAIT_MS, SERVICE_CONFIRMATION_MS } from '../utils/checkInWindow';
 import { serviceEndsAtMs } from '../utils/serviceTime';
 import { buildBookingId } from '../utils/buildBookingId';
 import { priceBookingLines } from '../utils/bookingPricing';
@@ -340,7 +340,8 @@ export class BookingService {
 
   /**
    * Conclui as reservas cujo horário terminou. Sem check-in nem outro registro, o comprador recebe a
-   * pergunta "O serviço aconteceu?" (D20); essas reservas voltam em `askedToConfirm`.
+   * pergunta "O serviço aconteceu?" (D20); essas reservas voltam em `askedToConfirm`. A entrada de
+   * atração não usada vira ausência e conta em `completed`.
    */
   async completeFinishedBookings(
     limit = 200
@@ -353,8 +354,9 @@ export class BookingService {
     let completed = 0;
     const askedToConfirm: Booking[] = [];
     for (const booking of started) {
-      const { startsAt, durationMinutes } = booking.offerSnapshot;
-      if (serviceEndsAtMs(startsAt, durationMinutes) > nowDate.getTime()) continue;
+      if ((await this.serviceEndMs(booking)) > nowDate.getTime()) continue;
+      // Entrada de atração não usada até o fechamento é ausência, como ingresso não usado (D20, A).
+      const unusedEntry = booking.kind === 'private_entry' && !booking.checkIn;
       const ask =
         CHECK_IN_CODE_KINDS.includes(booking.kind) &&
         !booking.checkIn &&
@@ -364,6 +366,7 @@ export class BookingService {
         booking.id,
         (current) => {
           if (current.status !== 'confirmed') return null;
+          if (unusedEntry) return { ...current, status: 'no_show' };
           if (!ask) return { ...current, status: 'completed' };
           const answerBy = new Date(nowDate.getTime() + SERVICE_CONFIRMATION_MS).toISOString();
           return {
@@ -373,12 +376,20 @@ export class BookingService {
             deadline: { kind: 'service_confirmation', at: answerBy },
           };
         },
-        { actorUid: SYSTEM_ACTOR, reason: 'finished' }
+        { actorUid: SYSTEM_ACTOR, reason: unusedEntry ? 'entry_unused' : 'finished' }
       );
-      if (updated.status !== 'completed') continue;
+      if (updated.status === 'confirmed') continue;
       completed += 1;
-      if (ask) askedToConfirm.push(updated);
+      if (ask && updated.status === 'completed') askedToConfirm.push(updated);
     }
     return { completed, askedToConfirm };
   }
+
+  /** Fim do serviço; a entrada de atração vale até o fechamento do horário (D20). */
+  private async serviceEndMs(booking: Booking): Promise<number> {
+    const { startsAt, durationMinutes } = booking.offerSnapshot;
+    if (booking.kind !== 'private_entry') return serviceEndsAtMs(startsAt, durationMinutes);
+    const slot = await this.port.getSlot(booking.slotId);
+    return entryWindow(slot ?? { startsAt }, durationMinutes).closesAtMs;
+  }
 }

=== server/domain/bookings/types/bookingTypes.ts — diff ===
@@ -111,8 +111,11 @@ export interface BookingCheckIn {
   /** Hora em que o prestador fez o check-in (a do aparelho, quando foi feito sem internet). */
   at: string;
   byUid: string;
-  /** `no_code`: "Cliente sem código", por conta e risco do prestador até o comprador confirmar. */
-  method: 'code' | 'no_code';
+  /**
+   * `qr`: QR da entrada de atração. `no_code`: "Cliente sem código", por conta e risco do prestador
+   * até o comprador confirmar.
+   */
+  method: 'code' | 'qr' | 'no_code';
   participantsPresent: number;
   /** Só no check-in feito sem internet: quando o servidor recebeu e validou o código. */
   syncedAt?: string;

=== server/domain/bookings/usecases/checkInEntryUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { getBookingEntryService } from '../factory';
import type { EntryCheckInInput } from '../services/bookingEntryService';
import type { Booking, BookingActor } from '../types/bookingTypes';

/** Entrada na portaria pelo QR ou pelo código de 8 caracteres (D20). */
export async function checkInEntryUseCase(
  actor: BookingActor,
  input: EntryCheckInInput
): Promise<Booking> {
  return getBookingEntryService().checkIn(actor, input);
}

=== server/domain/bookings/usecases/getEntryPassUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { getBookingEntryService } from '../factory';
import type { EntryPassView } from '../services/bookingEntryService';
import type { BookingActor } from '../types/bookingTypes';

/** QR assinado e código de 8 caracteres da entrada de atração, para o comprador (D20). */
export async function getEntryPassUseCase(
  actor: BookingActor,
  bookingId: string
): Promise<EntryPassView> {
  return getBookingEntryService().getEntryPass(actor, bookingId);
}

=== server/domain/bookings/usecases/getEntryVerificationKeysUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { getBookingEntryService } from '../factory';
import type { BookingActor } from '../types/bookingTypes';

/** Chaves públicas do QR da entrada, para a portaria validar sem internet (D20). */
export async function getEntryVerificationKeysUseCase(
  actor: BookingActor,
  offerId: string
): Promise<Array<{ kid: string; publicKeyJwk: JsonWebKey }>> {
  return getBookingEntryService().getVerificationKeys(actor, offerId);
}

=== server/domain/bookings/utils/checkInCode.ts — ARQUIVO REESCRITO, substitua todo o conteúdo por este ===
import crypto from 'crypto';

/** Sem 0/O e 1/I/L, que se confundem ditos em voz alta ou digitados (D20). */
export const CHECK_IN_CODE_ALPHABET = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
export const CHECK_IN_CODE_LENGTH = 6;
/** Entrada de atração privada: código junto do QR, com 8 caracteres (D20). */
export const ENTRY_CODE_LENGTH = 8;

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

/** `entry:` separa o código da entrada do código de 6 caracteres, mesmo com o mesmo segredo. */
function derive(secret: string, bookingId: string, length: number): string {
  const label = length === ENTRY_CODE_LENGTH ? `entry:${bookingId}` : bookingId;
  let code = '';
  for (let counter = 0; code.length < length; counter += 1) {
    const digest = crypto.createHmac('sha256', secret).update(`${label}:${counter}`).digest();
    for (const byte of digest) {
      if (byte >= UNBIASED_BYTE_LIMIT) continue;
      code += CHECK_IN_CODE_ALPHABET[byte % CHECK_IN_CODE_ALPHABET.length];
      if (code.length === length) break;
    }
  }
  return code;
}

/**
 * Código da reserva, derivado do ID com o segredo do Secret Manager e nunca gravado (exceção do
 * AGENTS.md §7.7, D20): quem lê o banco não descobre códigos.
 */
export function deriveCheckInCode(bookingId: string, length = CHECK_IN_CODE_LENGTH): string {
  return derive(currentSecret(), bookingId, length);
}

/** Códigos aceitos no check-in: o do segredo atual e, durante a rotação, o do anterior (§7.8). */
export function listAcceptedCheckInCodes(
  bookingId: string,
  length = CHECK_IN_CODE_LENGTH
): string[] {
  const codes = [deriveCheckInCode(bookingId, length)];
  const previous = readSecret('BOOKING_CHECKIN_CODE_SECRET_PREVIOUS', MIN_PREVIOUS_SECRET_LENGTH);
  if (previous) codes.push(derive(previous, bookingId, length));
  return codes;
}

/**
 * Aceita minúsculas, espaços, hífen e o prefixo da tela (`PASS:`, `ENTR:`), que não é gravado nem
 * conferido (D20); devolve null se não for um código do tamanho pedido.
 */
export function normalizeCheckInCode(input: string, length = CHECK_IN_CODE_LENGTH): string | null {
  const normalized = input
    .toUpperCase()
    .replace(/^[A-Z]{4}:/, '')
    .replace(/[\s-]/g, '');
  const pattern = new RegExp(`^[${CHECK_IN_CODE_ALPHABET}]{${length}}$`);
  return pattern.test(normalized) ? normalized : null;
}

export function checkInCodesMatch(expected: string, received: string): boolean {
  const a = Buffer.from(expected);
  const b = Buffer.from(received);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

=== server/domain/bookings/utils/checkInWindow.ts — diff ===
@@ -37,3 +37,42 @@ export const PROVIDER_ABSENT_AFTER_MS = 30 * MINUTE_MS;
 export const ABSENCE_RESPONSE_MS = 2 * HOUR_MS;
 /** Prazo do comprador para responder "O serviço aconteceu?" (D20). */
 export const SERVICE_CONFIRMATION_MS = 72 * HOUR_MS;
+
+/** Entrada de atração privada: 5 erros por pessoa e 50 por horário a cada 15 min (D20, §7.7). */
+export const ENTRY_MAX_FAILURES_PER_ACTOR = 5;
+export const ENTRY_MAX_FAILURES_PER_SLOT = 50;
+
+/**
+ * Entrada vale o dia do horário até o fechamento (D20): até o fim do horário, ou o fim da duração,
+ * ou, sem nenhum dos dois, o fim do dia em Fortaleza.
+ */
+export function entryWindow(
+  slot: { startsAt: string; endsAt?: string },
+  durationMinutes?: number
+): { opensAtMs: number; closesAtMs: number } {
+  const startMs = new Date(slot.startsAt).getTime();
+  const closesAtMs = slot.endsAt
+    ? new Date(slot.endsAt).getTime()
+    : durationMinutes
+      ? serviceEndsAtMs(slot.startsAt, durationMinutes)
+      : checkInCodeVisibleFromMs(slot.startsAt) + DAY_MS - 1;
+  return { opensAtMs: startMs - CHECK_IN_OPENS_BEFORE_MS, closesAtMs };
+}
+
+// Check-in sem internet chega depois: aceita até 24 h de atraso e 1 min de relógio adiantado.
+const OFFLINE_MAX_DELAY_MS = 24 * HOUR_MS;
+const CLOCK_SKEW_MS = MINUTE_MS;
+
+/** Hora que vale para o check-in: a do aparelho quando foi feito sem internet; null se for inválida. */
+export function resolveCheckInTime(capturedAt: string | undefined, nowMs: number): number | null {
+  if (!capturedAt) return nowMs;
+  const capturedMs = new Date(capturedAt).getTime();
+  if (
+    Number.isNaN(capturedMs) ||
+    capturedMs > nowMs + CLOCK_SKEW_MS ||
+    capturedMs < nowMs - OFFLINE_MAX_DELAY_MS
+  ) {
+    return null;
+  }
+  return Math.min(capturedMs, nowMs);
+}

=== server/domain/bookings/utils/serviceProof.ts — ARQUIVO REESCRITO, substitua todo o conteúdo por este ===
import { type Booking, type BookableOfferKind, CHECK_IN_CODE_KINDS } from '../types/bookingTypes';

/** Tipos cujo repasse espera a prova do serviço (D20); a entrada de atração usa o QR (21.4). */
export function requiresServiceProof(kind: BookableOfferKind): boolean {
  return CHECK_IN_CODE_KINDS.includes(kind);
}

/**
 * Prova de que o serviço aconteceu (D20): check-in com o código ou o QR, ou "sim" do comprador na
 * pergunta "O serviço aconteceu?". O "Cliente sem código" sozinho não prova nada.
 */
export function hasServiceProof(
  booking: Pick<Booking, 'checkIn' | 'serviceConfirmation'>
): boolean {
  return (
    (booking.checkIn !== undefined && booking.checkIn.method !== 'no_code') ||
    booking.serviceConfirmation?.resolution === 'confirmed'
  );
}

=== server/interfaces/http/bookings/bookingsController.ts — diff ===
@@ -6,6 +6,7 @@ import { markBookingNoShowApplicationUseCase } from '../../../application/usecas
 import { reportProviderAbsentApplicationUseCase } from '../../../application/usecases/bookings/reportProviderAbsentApplicationUseCase';
 import {
   getBookingCheckInCodeUseCase,
+  getEntryPassUseCase,
   getBookingForActorUseCase,
   listAvailableSlotsUseCase,
   listMyBookingsUseCase,
@@ -111,6 +112,21 @@ export class BookingsController {
     }
   }
 
+  static async getEntryPass(req: AuthenticatedRequest, res: Response): Promise<Response> {
+    const actor = actorOf(req);
+    if (!actor) return sendError(res, 401, 'UNAUTHENTICATED', 'Não autenticado.');
+    const bookingId = DocumentIdSchema.safeParse(req.params.bookingId);
+    if (!bookingId.success) return sendError(res, 404, 'NOT_FOUND', 'Reserva não encontrada.');
+    try {
+      const view = await getEntryPassUseCase(actor, bookingId.data);
+      // QR e código não podem ficar em cache de proxy nem do navegador.
+      res.setHeader('Cache-Control', 'no-store');
+      return res.status(200).json(view);
+    } catch (error) {
+      return handleBookingError(res, 'getEntryPass', error);
+    }
+  }
+
   static async cancel(req: AuthenticatedRequest, res: Response): Promise<Response> {
     const actor = actorOf(req);
     if (!actor) return sendError(res, 401, 'UNAUTHENTICATED', 'Não autenticado.');

=== server/interfaces/http/bookings/bookingsRoutes.ts — diff ===
@@ -15,6 +15,7 @@ bookingsRouter.post('/', verifyAuthTokenStrict, BookingsController.create);
 bookingsRouter.get('/me', verifyAuthToken, BookingsController.listMine);
 bookingsRouter.get('/:bookingId', verifyAuthToken, BookingsController.get);
 bookingsRouter.get('/:bookingId/check-in-code', verifyAuthToken, BookingsController.getCheckInCode);
+bookingsRouter.get('/:bookingId/entry-pass', verifyAuthToken, BookingsController.getEntryPass);
 bookingsRouter.post('/:bookingId/cancel', verifyAuthTokenStrict, BookingsController.cancel);
 bookingsRouter.post('/:bookingId/no-show', verifyAuthToken, BookingsController.markNoShow);
 // Relato e resposta mexem no reembolso (D20): token revogado não serve.
@@ -69,3 +70,12 @@ partnerOffersRouter.post(
   verifyAuthTokenStrict,
   PartnerOffersController.answerProviderAbsence
 );
+partnerOffersRouter.get(
+  '/:offerId/entry-verification-keys',
+  PartnerOffersController.entryVerificationKeys
+);
+partnerOffersRouter.post(
+  '/:offerId/slots/:slotId/entry-check-ins',
+  verifyAuthTokenStrict,
+  PartnerOffersController.checkInEntry
+);

=== server/interfaces/http/bookings/partnerOffersController.test.ts — diff ===
@@ -3,7 +3,11 @@ import { beforeEach, describe, expect, it, vi } from 'vitest';
 
 vi.mock('../../../domain/bookings', async () => {
   const { BookingDomainError } = await import('../../../domain/bookings/errors/bookingDomainError');
-  return { BookingDomainError };
+  return {
+    BookingDomainError,
+    checkInEntryUseCase: vi.fn(),
+    getEntryVerificationKeysUseCase: vi.fn(),
+  };
 });
 vi.mock('../../../application/usecases/bookings/checkInBookingApplicationUseCase', () => ({
   checkInBookingApplicationUseCase: vi.fn(),
@@ -21,7 +25,11 @@ vi.mock('../../../application/usecases/bookings/answerProviderAbsenceApplication
 import { checkInBookingApplicationUseCase as checkInBookingByCodeUseCase } from '../../../application/usecases/bookings/checkInBookingApplicationUseCase';
 import { checkInWithoutCodeApplicationUseCase } from '../../../application/usecases/bookings/checkInWithoutCodeApplicationUseCase';
 import { recordProviderArrivalApplicationUseCase } from '../../../application/usecases/bookings/recordProviderArrivalApplicationUseCase';
-import { BookingDomainError } from '../../../domain/bookings';
+import {
+  BookingDomainError,
+  checkInEntryUseCase,
+  getEntryVerificationKeysUseCase,
+} from '../../../domain/bookings';
 import type { AuthenticatedRequest } from '../../../infrastructure/auth/authenticatedRequest';
 import { PartnerOffersController } from './partnerOffersController';
 
@@ -133,3 +141,39 @@ describe('PartnerOffersController — ações na reserva (D20)', () => {
     expect(checkInWithoutCodeApplicationUseCase).not.toHaveBeenCalled();
   });
 });
+
+describe('PartnerOffersController — entrada de atração (D20)', () => {
+  beforeEach(() => vi.clearAllMocks());
+
+  it('repassa o QR lido e devolve a reserva com o check-in', async () => {
+    vi.mocked(checkInEntryUseCase).mockResolvedValue({
+      id: 'bk_1',
+      lines: [],
+      offerSnapshot: { title: 'Lagoa', startsAt: '', cancellationPolicy: 'flexible' },
+      checkIn: { at: 't', byUid: 'partner-1', method: 'qr', participantsPresent: 2 },
+    } as never);
+    const qrToken = `UGE1.${'a'.repeat(40)}.sig`;
+    const { res, status } = response();
+    await PartnerOffersController.checkInEntry(request({ qrToken, participantsPresent: 2 }), res);
+    expect(checkInEntryUseCase).toHaveBeenCalledWith(
+      { uid: 'partner-1', admin: false },
+      { offerId: 'offer-1', slotId: 'slot-1', qrToken, participantsPresent: 2 }
+    );
+    expect(status).toHaveBeenCalledWith(200);
+  });
+
+  it('QR e código juntos é 400; chaves públicas saem em { data }', async () => {
+    const bad = response();
+    await PartnerOffersController.checkInEntry(
+      request({ qrToken: `UGE1.${'a'.repeat(40)}`, code: 'K7M4QXAB', participantsPresent: 1 }),
+      bad.res
+    );
+    expect(bad.status).toHaveBeenCalledWith(400);
+    vi.mocked(getEntryVerificationKeysUseCase).mockResolvedValue([
+      { kid: 'k1', publicKeyJwk: { kty: 'OKP' } },
+    ]);
+    const ok = response();
+    await PartnerOffersController.entryVerificationKeys(request({}), ok.res);
+    expect(ok.json).toHaveBeenCalledWith({ data: [{ kid: 'k1', publicKeyJwk: { kty: 'OKP' } }] });
+  });
+});

=== server/interfaces/http/bookings/partnerOffersController.ts — diff ===
@@ -7,7 +7,9 @@ import { cancelSlotByPartnerApplicationUseCase } from '../../../application/usec
 import { rescheduleSlotByPartnerApplicationUseCase } from '../../../application/usecases/bookings/rescheduleSlotByPartnerApplicationUseCase';
 import { setBookableOfferStatusApplicationUseCase } from '../../../application/usecases/bookings/setBookableOfferStatusApplicationUseCase';
 import {
+  checkInEntryUseCase,
   createAvailabilitySlotsUseCase,
+  getEntryVerificationKeysUseCase,
   createBookableOfferUseCase,
   listOfferBookingsForPartnerUseCase,
   listOfferSlotsForPartnerUseCase,
@@ -23,6 +25,7 @@ import {
   CreateOfferSchema,
   CreateSlotsSchema,
   DocumentIdSchema,
+  EntryCheckInSchema,
   OfferStatusSchema,
   PageQuerySchema,
   ProviderAbsenceAnswerSchema,
@@ -259,6 +262,40 @@ export class PartnerOffersController {
       return handleBookingError(res, 'answerProviderAbsence', error);
     }
   }
+
+  static async checkInEntry(req: AuthenticatedRequest, res: Response): Promise<Response> {
+    const actor = actorOf(req);
+    if (!actor) return sendError(res, 401, 'UNAUTHENTICATED', 'Não autenticado.');
+    const offerId = DocumentIdSchema.safeParse(req.params.offerId);
+    const slotId = DocumentIdSchema.safeParse(req.params.slotId);
+    const body = EntryCheckInSchema.safeParse(req.body);
+    if (!offerId.success || !slotId.success || !body.success) {
+      return sendError(res, 400, 'VALIDATION_ERROR', 'Dados da entrada inválidos.');
+    }
+    try {
+      const booking = await checkInEntryUseCase(actor, {
+        offerId: offerId.data,
+        slotId: slotId.data,
+        ...body.data,
+      });
+      return res.status(200).json(toSellerBooking(booking));
+    } catch (error) {
+      return handleBookingError(res, 'checkInEntry', error);
+    }
+  }
+
+  static async entryVerificationKeys(req: AuthenticatedRequest, res: Response): Promise<Response> {
+    const actor = actorOf(req);
+    if (!actor) return sendError(res, 401, 'UNAUTHENTICATED', 'Não autenticado.');
+    const offerId = DocumentIdSchema.safeParse(req.params.offerId);
+    if (!offerId.success) return sendError(res, 404, 'NOT_FOUND', 'Oferta não encontrada.');
+    try {
+      const keys = await getEntryVerificationKeysUseCase(actor, offerId.data);
+      return res.status(200).json({ data: keys });
+    } catch (error) {
+      return handleBookingError(res, 'entryVerificationKeys', error);
+    }
+  }
 }
 
 type BookingAction<T> =

=== server/interfaces/http/bookings/schemas/bookingSchemas.test.ts — diff ===
@@ -1,6 +1,7 @@
 import { describe, expect, it } from 'vitest';
 import {
   CheckInByCodeSchema,
+  EntryCheckInSchema,
   CreateOfferSchema,
   CreateSlotsSchema,
   UpdateOfferSchema,
@@ -93,4 +94,19 @@ describe('bookingSchemas', () => {
         .success
     ).toBe(false);
   });
+
+  it('entrada: QR ou código, nunca os dois nem nenhum (D20)', () => {
+    const qr = `UGE1.${'a'.repeat(40)}.sig`;
+    expect(EntryCheckInSchema.safeParse({ qrToken: qr, participantsPresent: 2 }).success).toBe(
+      true
+    );
+    expect(
+      EntryCheckInSchema.safeParse({ code: 'ENTR:K7M4QXAB', participantsPresent: 2 }).success
+    ).toBe(true);
+    expect(
+      EntryCheckInSchema.safeParse({ qrToken: qr, code: 'K7M4QXAB', participantsPresent: 2 })
+        .success
+    ).toBe(false);
+    expect(EntryCheckInSchema.safeParse({ participantsPresent: 2 }).success).toBe(false);
+  });
 });

=== server/interfaces/http/bookings/schemas/bookingSchemas.ts — diff ===
@@ -167,6 +167,19 @@ export const ProviderAbsenceAnswerSchema = z
 
 export const ServiceConfirmationAnswerSchema = z.object({ answer: z.enum(['yes', 'no']) }).strict();
 
+export const EntryCheckInSchema = z
+  .object({
+    qrToken: z.string().trim().min(20).max(1000).optional(),
+    // Aceita o prefixo `ENTR:`, minúsculas, espaço e hífen; o serviço normaliza.
+    code: z.string().trim().min(8).max(16).optional(),
+    participantsPresent: z.number().int().min(1).max(50),
+    capturedAt: isoDateTime.optional(),
+  })
+  .strict()
+  .refine((body) => Boolean(body.qrToken) !== Boolean(body.code), {
+    message: 'Envie o QR Code ou o código, não os dois.',
+  });
+
 export const CancelBookingSchema = z.object({ reason: z.string().max(300).optional() }).strict();
 
 export const SlotWindowQuerySchema = z

VERIFICAÇÃO (obrigatória):
- `npm run typecheck`, `npx biome lint .` (0 erros; arquivos tocados sem avisos), `npm run build`;
- testes ligados aos arquivos deste prompt: `npx vitest related --run server/application/usecases/payouts/bookingServiceEvidence.ts server/domain/bookings/adapters/ed25519EntryPassAdapter.test.ts server/domain/bookings/adapters/ed25519EntryPassAdapter.ts server/domain/bookings/adapters/firestoreCheckInStore.ts server/domain/bookings/adapters/inMemoryBookingsAdapter.ts server/domain/bookings/errors/bookingDomainError.ts server/domain/bookings/factory.ts server/domain/bookings/index.ts server/domain/bookings/ports/bookingsPort.ts server/domain/bookings/ports/entryPassSignerPort.ts server/domain/bookings/services/bookingCheckInService.ts server/domain/bookings/services/bookingEntryService.test.ts server/domain/bookings/services/bookingEntryService.ts server/domain/bookings/services/bookingService.test.ts server/domain/bookings/services/bookingService.ts server/domain/bookings/types/bookingTypes.ts server/domain/bookings/usecases/checkInEntryUseCase.ts server/domain/bookings/usecases/getEntryPassUseCase.ts server/domain/bookings/usecases/getEntryVerificationKeysUseCase.ts server/domain/bookings/utils/checkInCode.ts server/domain/bookings/utils/checkInWindow.ts server/domain/bookings/utils/serviceProof.ts server/interfaces/http/bookings/bookingsController.ts server/interfaces/http/bookings/bookingsRoutes.ts server/interfaces/http/bookings/partnerOffersController.test.ts server/interfaces/http/bookings/partnerOffersController.ts server/interfaces/http/bookings/schemas/bookingSchemas.test.ts server/interfaces/http/bookings/schemas/bookingSchemas.ts` (todos verdes). Não precisa rodar a suíte inteira.

ENTREGA: responda no formato do AGENTS.md §16.3.

LIMPEZA (obrigatória, ao terminar de implementar): apague todos os arquivos de public/assets/aistudio/, inclusive o deste prompt. São cópias dos textos colados no chat, salvas automaticamente pelo AI Studio, e public/ vai para o site publicado. Se a pasta ficar vazia, apague a pasta também.
~~~~

### Configurações manuais (você faz, fora do AI Studio, depois de aplicar este prompt)

1. Gere a chave da entrada: `openssl genpkey -algorithm ed25519 -out entrada.pem`. Crie no Secret Manager `BOOKING_ENTRY_QR_PRIVATE_KEY_PEM` (conteúdo do PEM) e `BOOKING_ENTRY_QR_KEY_ID` (ex.: `entrada-2026-11`) e monte no Cloud Run; no AI Studio, use outra chave gerada do mesmo jeito. Apague o arquivo local depois. As variáveis `*_PREVIOUS_*` ficam vazias fora de rotação.
2. Publique os índices do Firestore: `firebase deploy --only firestore:indexes`.
