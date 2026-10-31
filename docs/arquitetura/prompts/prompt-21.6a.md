# Prompt 21.6a — QR do ingresso Ed25519, código INGR e anonimização (backend)

> Lote 18, gerado dos commits de referência `bf8cd48..7b032b9` da branch `claude/agents-md-v2`. Aplique na ordem do lote (A7, 21.1 a 21.7d), um por vez. Cole o bloco abaixo no agente do AI Studio, inteiro, de uma vez.

---

## Prompt 21.6a — QR do ingresso Ed25519, código INGR e anonimização (backend)

Resolve o débito B36.

~~~~text
Siga o AGENTS.md. O app ainda não foi liberado para usuários: nenhum código de compatibilidade ou transição (§2.2 item 8). As regras de negócio estão nas decisões D20 e D21 de docs/arquitetura/decisoes.md (aplicadas pelo prompt A7).

IMPORTANTE: aplique os diffs abaixo EXATAMENTE, inclusive os arquivos novos. Não reescreva os arquivos do seu jeito. Arquivo tocado sai sem avisos do lint e formatado (AGENTS.md §13). Não altere firebase.json, functions/, AGENTS.md, docs/ nem .env.

O QUE MUDA:
1) Assinador Ed25519 e código curto viram módulos genéricos em server/infrastructure/crypto (ed25519TokenSigner.ts, shortCode.ts); reservas e ingressos usam os mesmos.
2) Ingresso: QR UGT1 assinado com TICKET_QR_PRIVATE_KEY_PEM, sem chave gerada na hora; saem o adapter RSA de 2048 bits e o offlineTicketBundle sem uso.
3) Código de 8 caracteres junto do QR (do ID e da versão do ingresso, TICKET_CHECKIN_CODE_SECRET), visível no dia da sessão; check-in por código só na janela da sessão, com 5 erros por pessoa da equipe e 50 por sessão a cada 15 min (ticketCheckInCodeFailures).
4) O manifesto sem internet leva as chaves públicas aceitas (atual e anterior).
5) Exclusão de conta anonimiza pedidos, ingressos e transferências e apaga a lista de espera.
6) Anúncio por grupo: "Máximo de grupos por reserva".

ARQUIVOS (crie, altere ou apague exatamente estes):
- .env.example (alterar)
- firestore.indexes.json (alterar)
- firestore.rules (alterar)
- server/application/usecases/deleteUserAccountApplicationUseCase.test.ts (alterar)
- server/application/usecases/deleteUserAccountApplicationUseCase.ts (alterar)
- server/domain/bookings/adapters/ed25519EntryPassAdapter.ts (alterar)
- server/domain/bookings/utils/checkInCode.ts (alterar)
- server/domain/bookings/utils/checkInWindow.ts (alterar)
- server/domain/ticketing/adapters/ed25519TicketQrTokenAdapter.test.ts (criar)
- server/domain/ticketing/adapters/ed25519TicketQrTokenAdapter.ts (criar)
- server/domain/ticketing/adapters/firestoreCheckInStore.ts (alterar)
- server/domain/ticketing/adapters/firestoreTicketPrivacyStore.ts (criar)
- server/domain/ticketing/adapters/firestoreTicketingAdapter.ts (alterar)
- server/domain/ticketing/adapters/rsaPssTicketQrTokenAdapter.ts (apagar)
- server/domain/ticketing/controllers/ticketingController.ts (alterar)
- server/domain/ticketing/errors/ticketingDomainError.ts (alterar)
- server/domain/ticketing/factory.ts (alterar)
- server/domain/ticketing/index.ts (alterar)
- server/domain/ticketing/ports/ticketQrTokenPort.ts (alterar)
- server/domain/ticketing/ports/ticketingPort.ts (alterar)
- server/domain/ticketing/schemas/ticketingSchema.ts (alterar)
- server/domain/ticketing/services/checkInService.test.ts (criar)
- server/domain/ticketing/services/checkInService.ts (alterar)
- server/domain/ticketing/services/offlineCheckInService.ts (alterar)
- server/domain/ticketing/services/ticketHolderService.ts (alterar)
- server/domain/ticketing/services/ticketingServices.test.ts (alterar)
- server/domain/ticketing/types/ticketingTypes.ts (alterar)
- server/domain/ticketing/usecases/anonymizeTicketingUserUseCase.ts (criar)
- server/domain/ticketing/utils/offlineManifest.ts (criar)
- server/domain/ticketing/utils/offlineTicketBundle.ts (apagar)
- server/domain/ticketing/utils/ticketCheckInCode.ts (criar)
- server/domain/ticketing/utils/ticketCheckInWindow.ts (criar)
- server/infrastructure/crypto/ed25519TokenSigner.ts (criar)
- server/infrastructure/crypto/shortCode.ts (criar)
- server/shared/kernel/businessDay.ts (criar)
- src/domain/bookings/components/partner/PartnerOfferEditor.tsx (alterar)
- src/shared/i18n/serviceProofResources.ts (alterar)

Aplique as mudanças abaixo EXATAMENTE como estão (formato unified diff: linhas com "-" saem, linhas com "+" entram; as demais são contexto para localizar o trecho). Não reformate outros trechos dos arquivos.

=== .env.example — diff ===
@@ -43,8 +43,17 @@ BOOKING_ENTRY_QR_KEY_ID=
 # Só durante uma rotação (§7.8): chave pública e ID anteriores, aceitos até o fim das entradas emitidas.
 BOOKING_ENTRY_QR_PREVIOUS_PUBLIC_KEY_PEM=
 BOOKING_ENTRY_QR_PREVIOUS_KEY_ID=
-OFFLINE_CHECKIN_PRIVATE_KEY_PEM=
-OFFLINE_CHECKIN_KEY_ID=
+# QR do ingresso (D20, B36): chave privada Ed25519 própria (openssl genpkey -algorithm ed25519) e um ID
+# de versão. Sem elas, o QR do ingresso responde erro; nunca é gerada chave na hora (AGENTS.md §7.7).
+TICKET_QR_PRIVATE_KEY_PEM=
+TICKET_QR_KEY_ID=
+# Só durante uma rotação (§7.8): chave pública e ID anteriores, aceitos até o fim dos eventos.
+TICKET_QR_PREVIOUS_PUBLIC_KEY_PEM=
+TICKET_QR_PREVIOUS_KEY_ID=
+# Código de 8 caracteres junto do QR do ingresso (D20): HMAC com no mínimo 32 caracteres aleatórios.
+TICKET_CHECKIN_CODE_SECRET=
+# Segredo anterior durante uma rotação (§7.8); vazio fora de rotação.
+TICKET_CHECKIN_CODE_SECRET_PREVIOUS=
 # Jobs internos (Cloud Functions → Cloud Run /internal/*).
 # Cloud Run: INTERNAL_JOB_KEY vem do Secret Manager.
 # Functions: INTERNAL_JOB_KEY é o mesmo segredo (declarado em `secrets`); as URLs são parâmetros que o

=== firestore.indexes.json — diff ===
@@ -489,6 +489,38 @@
           "order": "ASCENDING"
         }
       ]
+    },
+    {
+      "collectionGroup": "ticketCheckInCodeFailures",
+      "queryScope": "COLLECTION",
+      "fields": [
+        {
+          "fieldPath": "occurrenceId",
+          "order": "ASCENDING"
+        },
+        {
+          "fieldPath": "at",
+          "order": "ASCENDING"
+        }
+      ]
+    },
+    {
+      "collectionGroup": "ticketCheckInCodeFailures",
+      "queryScope": "COLLECTION",
+      "fields": [
+        {
+          "fieldPath": "occurrenceId",
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

=== firestore.rules — diff ===
@@ -100,6 +100,9 @@ service cloud.firestore {
     match /bookingCheckInFailures/{failureId} {
       allow read, write: if false;
     }
+    match /ticketCheckInCodeFailures/{failureId} {
+      allow read, write: if false;
+    }
     match /bookingAuditLogs/{logId} {
       allow read: if isAdmin();
       allow write: if false;

=== server/application/usecases/deleteUserAccountApplicationUseCase.test.ts — diff ===
@@ -1,6 +1,7 @@
 import { describe, expect, it, vi } from 'vitest';
 
 vi.mock('../../domain/bookings', () => ({ anonymizeBuyerBookingsUseCase: vi.fn() }));
+vi.mock('../../domain/ticketing', () => ({ anonymizeTicketingUserUseCase: vi.fn() }));
 vi.mock('../../domain/guide', () => ({ deleteResourcesByOwnerUseCase: vi.fn() }));
 vi.mock('../../domain/events', () => ({ deleteEventsByOwnerUseCase: vi.fn() }));
 vi.mock('../../domain/partners', () => ({
@@ -27,10 +28,11 @@ describe('deleteUserAccountApplicationUseCase', () => {
       deleteReviewsByUser: step('reviews'),
       deleteResourcesByOwner: step('resources'),
       anonymizeBuyerBookings: step('bookings'),
+      anonymizeTicketing: step('ticketing'),
       deletePartnerProfile: step('partner'),
       deleteUserAccount: step('account'),
     });
-    expect(calls).toEqual(['reviews', 'resources', 'bookings', 'partner', 'account']);
+    expect(calls).toEqual(['reviews', 'resources', 'bookings', 'ticketing', 'partner', 'account']);
   });
 
   it('exige o UID', async () => {

=== server/application/usecases/deleteUserAccountApplicationUseCase.ts — diff ===
@@ -8,6 +8,7 @@ import {
 } from '../../domain/partners';
 import { cancelPartnerPlanSubscriptionsUseCase } from '../../domain/payment';
 import { deleteReviewsByUserUseCase } from '../../domain/reviews';
+import { anonymizeTicketingUserUseCase } from '../../domain/ticketing';
 import { deleteUserAccountUseCase } from '../../domain/users';
 import { deleteVerificationFiles } from './listingVerification/deleteVerificationFiles';
 
@@ -22,6 +23,8 @@ export interface UserDeletionCoordinatorDependencies {
   deleteListingPlans?: (uid: string) => Promise<void>;
   /** Reservas do comprador: tira endereço e nomes e mantém o registro financeiro (§7.5, D20). */
   anonymizeBuyerBookings?: (uid: string) => Promise<void>;
+  /** Pedidos, ingressos, transferências e lista de espera: sai nome e e-mail, fica o registro (§7.5). */
+  anonymizeTicketing?: (uid: string) => Promise<void>;
   deleteUserAccount: (uid: string) => Promise<void>;
 }
 
@@ -41,6 +44,9 @@ export async function deleteUserAccountApplicationUseCase(
     anonymizeBuyerBookings: async (id) => {
       await anonymizeBuyerBookingsUseCase(id);
     },
+    anonymizeTicketing: async (id) => {
+      await anonymizeTicketingUserUseCase(id);
+    },
     deleteUserAccount: (id) => deleteUserAccountUseCase(id),
   }
 ): Promise<void> {
@@ -62,6 +68,9 @@ export async function deleteUserAccountApplicationUseCase(
   if (deps.anonymizeBuyerBookings) {
     await deps.anonymizeBuyerBookings(uid);
   }
+  if (deps.anonymizeTicketing) {
+    await deps.anonymizeTicketing(uid);
+  }
   await deps.deletePartnerProfile(uid);
   await deps.deleteUserAccount(uid);
 }

=== server/domain/bookings/adapters/ed25519EntryPassAdapter.ts — ARQUIVO REESCRITO, substitua todo o conteúdo por este ===
import { Ed25519TokenSigner } from '../../../infrastructure/crypto/ed25519TokenSigner';
import type { EntryPassPayload, EntryPassSignerPort } from '../ports/entryPassSignerPort';

/** Prefixo do QR da entrada: separa de qualquer outro token e permite trocar o formato depois. */
export const ENTRY_PASS_PREFIX = 'UGE1';

const signer = new Ed25519TokenSigner({
  prefix: ENTRY_PASS_PREFIX,
  privateKeyEnv: 'BOOKING_ENTRY_QR_PRIVATE_KEY_PEM',
  keyIdEnv: 'BOOKING_ENTRY_QR_KEY_ID',
  previousPublicKeyEnv: 'BOOKING_ENTRY_QR_PREVIOUS_PUBLIC_KEY_PEM',
  previousKeyIdEnv: 'BOOKING_ENTRY_QR_PREVIOUS_KEY_ID',
});

function isPayload(value: unknown): value is EntryPassPayload {
  const p = value as Partial<EntryPassPayload> | null;
  return (
    !!p &&
    p.v === 1 &&
    typeof p.kid === 'string' &&
    typeof p.bid === 'string' &&
    typeof p.sid === 'string' &&
    typeof p.oid === 'string' &&
    typeof p.u === 'number' &&
    (p.nm === undefined || typeof p.nm === 'string') &&
    typeof p.exp === 'number'
  );
}

export class Ed25519EntryPassAdapter implements EntryPassSignerPort {
  sign(payload: Omit<EntryPassPayload, 'kid'>): string {
    return signer.sign(payload);
  }

  verify(token: string): EntryPassPayload | null {
    const payload = signer.verify(token);
    return isPayload(payload) ? payload : null;
  }

  publicKeys(): Array<{ kid: string; publicKeyJwk: JsonWebKey }> {
    return signer.publicKeys();
  }
}

/** Só testes: esquece as chaves lidas para trocar as variáveis de ambiente. */
export function resetEntryPassKeysForTests(): void {
  signer.reset();
}

=== server/domain/bookings/utils/checkInCode.ts — ARQUIVO REESCRITO, substitua todo o conteúdo por este ===
import {
  SHORT_CODE_ALPHABET,
  ShortCodeDeriver,
  normalizeShortCode,
  shortCodesMatch,
} from '../../../infrastructure/crypto/shortCode';

export const CHECK_IN_CODE_ALPHABET = SHORT_CODE_ALPHABET;
export const CHECK_IN_CODE_LENGTH = 6;
/** Entrada de atração privada: código junto do QR, com 8 caracteres (D20). */
export const ENTRY_CODE_LENGTH = 8;

const codes = new ShortCodeDeriver('BOOKING_CHECKIN_CODE_SECRET');

/**
 * Um código por unidade da reserva (D20). `entry:` separa o código da entrada do de 6 caracteres,
 * mesmo com o mesmo segredo.
 */
function label(bookingId: string, length: number, unit: number): string {
  return `${length === ENTRY_CODE_LENGTH ? 'entry:' : ''}${bookingId}#${unit}`;
}

/**
 * Código da reserva, derivado do ID com o segredo do Secret Manager e nunca gravado (exceção do
 * AGENTS.md §7.7, D20): quem lê o banco não descobre códigos.
 */
export function deriveCheckInCode(
  bookingId: string,
  length = CHECK_IN_CODE_LENGTH,
  unit = 0
): string {
  return codes.current(label(bookingId, length, unit), length);
}

/** Códigos aceitos no check-in: o do segredo atual e, durante a rotação, o do anterior (§7.8). */
export function listAcceptedCheckInCodes(
  bookingId: string,
  length = CHECK_IN_CODE_LENGTH,
  unit = 0
): string[] {
  return codes.accepted(label(bookingId, length, unit), length);
}

/** Unidade da reserva cujo código bate com o digitado, ou null. */
export function matchCheckInCodeUnit(
  bookingId: string,
  units: number,
  code: string,
  length = CHECK_IN_CODE_LENGTH
): number | null {
  for (let unit = 0; unit < units; unit += 1) {
    if (codes.matches(label(bookingId, length, unit), length, code)) return unit;
  }
  return null;
}

export function normalizeCheckInCode(input: string, length = CHECK_IN_CODE_LENGTH): string | null {
  return normalizeShortCode(input, length);
}

export const checkInCodesMatch = shortCodesMatch;

=== server/domain/bookings/utils/checkInWindow.ts — diff ===
@@ -1,10 +1,9 @@
+import { businessDayStartMs } from '../../../shared/kernel/businessDay';
 import { serviceEndsAtMs } from './serviceTime';
 
 const MINUTE_MS = 60_000;
 const HOUR_MS = 60 * MINUTE_MS;
 const DAY_MS = 24 * HOUR_MS;
-// America/Fortaleza é UTC−3 o ano todo, sem horário de verão (AGENTS.md §1).
-const FORTALEZA_OFFSET_MS = 3 * HOUR_MS;
 
 /** Check-in de 2 h antes do início até 12 h depois do fim (D20). */
 export const CHECK_IN_OPENS_BEFORE_MS = 2 * HOUR_MS;
@@ -15,8 +14,7 @@ export const CHECK_IN_FAILURE_WINDOW_MS = 15 * MINUTE_MS;
 
 /** 00:00 do dia do serviço em Fortaleza: a partir daí o comprador vê o código. */
 export function checkInCodeVisibleFromMs(startsAt: string): number {
-  const local = new Date(startsAt).getTime() - FORTALEZA_OFFSET_MS;
-  return Math.floor(local / DAY_MS) * DAY_MS + FORTALEZA_OFFSET_MS;
+  return businessDayStartMs(startsAt);
 }
 
 export function checkInWindow(

=== server/domain/ticketing/adapters/ed25519TicketQrTokenAdapter.test.ts — ARQUIVO NOVO, conteúdo completo ===
import crypto from 'crypto';
import { afterEach, describe, expect, it } from 'vitest';
import {
  Ed25519TicketQrTokenAdapter,
  resetTicketQrKeysForTests,
} from './ed25519TicketQrTokenAdapter';

const PAYLOAD = { v: 1 as const, tid: 'tkt_1', occ: 'occ_1', qv: 1, exp: 1_900_000_000 };

function useKey(kid: string) {
  const { privateKey, publicKey } = crypto.generateKeyPairSync('ed25519');
  process.env.TICKET_QR_PRIVATE_KEY_PEM = privateKey
    .export({ type: 'pkcs8', format: 'pem' })
    .toString();
  process.env.TICKET_QR_KEY_ID = kid;
  resetTicketQrKeysForTests();
  return publicKey.export({ type: 'spki', format: 'pem' }).toString();
}

describe('Ed25519TicketQrTokenAdapter (§7.7, B36)', () => {
  afterEach(() => {
    for (const name of [
      'TICKET_QR_PRIVATE_KEY_PEM',
      'TICKET_QR_KEY_ID',
      'TICKET_QR_PREVIOUS_PUBLIC_KEY_PEM',
      'TICKET_QR_PREVIOUS_KEY_ID',
    ]) {
      delete process.env[name];
    }
    resetTicketQrKeysForTests();
  });

  it('sem chave configurada falha, em vez de gerar chave na hora', () => {
    expect(() => new Ed25519TicketQrTokenAdapter().issue(PAYLOAD)).toThrow(
      /TICKET_QR_PRIVATE_KEY_PEM/
    );
  });

  it('recusa QR alterado, vencido ou de outro prefixo', () => {
    useKey('k1');
    const adapter = new Ed25519TicketQrTokenAdapter(() => 1_800_000_000_000);
    const token = adapter.issue(PAYLOAD);
    expect(adapter.verify(token)).toEqual({ ...PAYLOAD, kid: 'k1' });
    const [, body, signature] = token.split('.');
    const forged = Buffer.from(JSON.stringify({ ...PAYLOAD, kid: 'k1', qv: 2 })).toString(
      'base64url'
    );
    expect(adapter.verify(`UGT1.${forged}.${signature}`)).toBeNull();
    expect(adapter.verify(`UGE1.${body}.${signature}`)).toBeNull();
    expect(new Ed25519TicketQrTokenAdapter(() => 2_000_000_000_000).verify(token)).toBeNull();
  });

  it('na rotação, o QR da chave anterior continua valendo', () => {
    const oldPublic = useKey('k1');
    const oldToken = new Ed25519TicketQrTokenAdapter().issue(PAYLOAD);
    useKey('k2');
    process.env.TICKET_QR_PREVIOUS_PUBLIC_KEY_PEM = oldPublic;
    process.env.TICKET_QR_PREVIOUS_KEY_ID = 'k1';
    resetTicketQrKeysForTests();
    const adapter = new Ed25519TicketQrTokenAdapter(() => 1_800_000_000_000);
    expect(adapter.verify(oldToken)?.kid).toBe('k1');
    expect(adapter.publicKeys().map((key) => key.kid)).toEqual(['k2', 'k1']);
  });
});

=== server/domain/ticketing/adapters/ed25519TicketQrTokenAdapter.ts — ARQUIVO NOVO, conteúdo completo ===
import { Ed25519TokenSigner } from '../../../infrastructure/crypto/ed25519TokenSigner';
import type { TicketQrPayload, TicketQrTokenPort } from '../ports/ticketQrTokenPort';

/** Prefixo do QR do ingresso: separa da entrada de atração (`UGE1`) e de tokens antigos. */
export const TICKET_QR_PREFIX = 'UGT1';

const signer = new Ed25519TokenSigner({
  prefix: TICKET_QR_PREFIX,
  privateKeyEnv: 'TICKET_QR_PRIVATE_KEY_PEM',
  keyIdEnv: 'TICKET_QR_KEY_ID',
  previousPublicKeyEnv: 'TICKET_QR_PREVIOUS_PUBLIC_KEY_PEM',
  previousKeyIdEnv: 'TICKET_QR_PREVIOUS_KEY_ID',
});

function isPayload(value: unknown): value is TicketQrPayload {
  const p = value as Partial<TicketQrPayload> | null;
  return (
    !!p &&
    p.v === 1 &&
    typeof p.kid === 'string' &&
    typeof p.tid === 'string' &&
    typeof p.occ === 'string' &&
    typeof p.qv === 'number' &&
    typeof p.exp === 'number'
  );
}

/** QR do ingresso com Ed25519 e chave própria, sem chave gerada na hora (AGENTS.md §7.7, B36). */
export class Ed25519TicketQrTokenAdapter implements TicketQrTokenPort {
  constructor(private readonly now: () => number = () => Date.now()) {}

  issue(payload: Omit<TicketQrPayload, 'kid'>): string {
    return signer.sign(payload);
  }

  verify(token: string): TicketQrPayload | null {
    const payload = signer.verify(token);
    if (!isPayload(payload)) return null;
    return payload.exp * 1000 >= this.now() ? payload : null;
  }

  publicKeys(): Array<{ kid: string; publicKeyJwk: JsonWebKey }> {
    return signer.publicKeys();
  }
}

/** Só testes: esquece as chaves lidas para trocar as variáveis de ambiente. */
export function resetTicketQrKeysForTests(): void {
  signer.reset();
}

=== server/domain/ticketing/adapters/firestoreCheckInStore.ts — diff ===
@@ -12,9 +12,11 @@ import type {
   OfflineCheckInSyncResultItem,
   Ticket,
 } from '../types/ticketingTypes';
-import { hashTicketIdForOfflineManifest } from './rsaPssTicketQrTokenAdapter';
+import { hashTicketIdForOfflineManifest } from '../utils/offlineManifest';
 
 /** Check-in online e offline. Coleções só de backend; o cliente lê pela API (§6.2). */
+const CODE_FAILURES = 'ticketCheckInCodeFailures';
+
 export class FirestoreCheckInStore {
   async checkInTicketAtomic(params: {
     ticketId: string;
@@ -94,6 +96,26 @@ export class FirestoreCheckInStore {
     });
   }
 
+  async countCheckInCodeFailures(
+    occurrenceId: string,
+    sinceIso: string,
+    actorUid?: string
+  ): Promise<number> {
+    let query = adminDb.collection(CODE_FAILURES).where('occurrenceId', '==', occurrenceId);
+    if (actorUid) query = query.where('actorUid', '==', actorUid);
+    const snapshot = await query.where('at', '>=', sinceIso).count().get();
+    return snapshot.data().count;
+  }
+
+  async addCheckInCodeFailure(
+    occurrenceId: string,
+    actorUid: string,
+    atIso: string
+  ): Promise<void> {
+    // Só a sessão, quem digitou e quando: nunca o código digitado (AGENTS.md §10.3).
+    await adminDb.collection(CODE_FAILURES).add({ occurrenceId, actorUid, at: atIso });
+  }
+
   async listCheckInsByOccurrenceId(occurrenceId: string): Promise<EventCheckIn[]> {
     const snap = await adminDb
       .collection('eventCheckIns')

=== server/domain/ticketing/adapters/firestoreTicketPrivacyStore.ts — ARQUIVO NOVO, conteúdo completo ===
import { FieldValue } from 'firebase-admin/firestore';
import type { DocumentReference, WriteBatch } from 'firebase-admin/firestore';
import { adminDb } from '../../../infrastructure/firebase/adminClient';

// Limite do Firestore por lote de escrita.
const BATCH_LIMIT = 500;

async function writeInBatches(
  refs: DocumentReference[],
  apply: (batch: WriteBatch, ref: DocumentReference) => void
): Promise<void> {
  for (let start = 0; start < refs.length; start += BATCH_LIMIT) {
    const batch = adminDb.batch();
    for (const ref of refs.slice(start, start + BATCH_LIMIT)) apply(batch, ref);
    await batch.commit();
  }
}

async function refsWhere(collection: string, field: string, uid: string) {
  const snap = await adminDb.collection(collection).where(field, '==', uid).get();
  return snap.docs.map((doc) => doc.ref);
}

/** Exclusão de conta no ticketing (§7.5): tira o dado pessoal e mantém o registro financeiro. */
export class FirestoreTicketPrivacyStore {
  async anonymizeUser(uid: string): Promise<{
    orders: number;
    tickets: number;
    transfers: number;
    waitlist: number;
  }> {
    const at = new Date().toISOString();
    const [orders, tickets, transfers, waitlist] = await Promise.all([
      refsWhere('ticketOrders', 'buyerId', uid),
      refsWhere('tickets', 'ownerUserId', uid),
      refsWhere('ticketTransfers', 'toUserId', uid),
      refsWhere('eventWaitlistEntries', 'userId', uid),
    ]);
    await writeInBatches(orders, (batch, ref) =>
      batch.update(ref, { buyerSnapshot: { name: '', email: '' }, anonymizedAt: at })
    );
    await writeInBatches(tickets, (batch, ref) =>
      batch.update(ref, { holderName: '', holderEmail: '', anonymizedAt: at })
    );
    await writeInBatches(transfers, (batch, ref) =>
      batch.update(ref, {
        recipientEmail: '',
        recipientName: FieldValue.delete(),
        anonymizedAt: at,
      })
    );
    await writeInBatches(waitlist, (batch, ref) => batch.delete(ref));
    return {
      orders: orders.length,
      tickets: tickets.length,
      transfers: transfers.length,
      waitlist: waitlist.length,
    };
  }
}

=== server/domain/ticketing/adapters/firestoreTicketingAdapter.ts — diff ===
@@ -7,6 +7,7 @@ import { FirestoreTicketStore } from './firestoreTicketStore';
 import { FirestoreCheckInStore } from './firestoreCheckInStore';
 import { FirestoreRefundStore } from './firestoreRefundStore';
 import { FirestoreEngagementStore } from './firestoreEngagementStore';
+import { FirestoreTicketPrivacyStore } from './firestoreTicketPrivacyStore';
 
 /** Implementação do `TicketingPort` no Firestore, composta pelos stores de cada parte do ticketing. */
 export class FirestoreTicketingAdapter implements TicketingPort {
@@ -18,6 +19,7 @@ export class FirestoreTicketingAdapter implements TicketingPort {
   private readonly checkIn = new FirestoreCheckInStore();
   private readonly refund = new FirestoreRefundStore();
   private readonly engagement = new FirestoreEngagementStore();
+  private readonly privacy = new FirestoreTicketPrivacyStore();
 
   readonly createTicketType = this.ticketType.createTicketType.bind(this.ticketType);
   readonly getTicketTypeById = this.ticketType.getTicketTypeById.bind(this.ticketType);
@@ -57,6 +59,9 @@ export class FirestoreTicketingAdapter implements TicketingPort {
   readonly updateTicketStatus = this.ticket.updateTicketStatus.bind(this.ticket);
   readonly checkInTicketAtomic = this.checkIn.checkInTicketAtomic.bind(this.checkIn);
   readonly listCheckInsByOccurrenceId = this.checkIn.listCheckInsByOccurrenceId.bind(this.checkIn);
+  readonly anonymizeUser = this.privacy.anonymizeUser.bind(this.privacy);
+  readonly countCheckInCodeFailures = this.checkIn.countCheckInCodeFailures.bind(this.checkIn);
+  readonly addCheckInCodeFailure = this.checkIn.addCheckInCodeFailure.bind(this.checkIn);
   readonly listCheckInsByEventListingId = this.checkIn.listCheckInsByEventListingId.bind(
     this.checkIn
   );

=== server/domain/ticketing/adapters/rsaPssTicketQrTokenAdapter.ts — APAGUE este arquivo ===

=== server/domain/ticketing/controllers/ticketingController.ts — diff ===
@@ -4,7 +4,7 @@ import { confirmTicketOrderPaymentClientReturnApplicationUseCase } from '../../.
 import { createTicketOrderPaymentIntentApplicationUseCase } from '../../../application/usecases/createTicketOrderPaymentIntentApplicationUseCase';
 import { processTicketRefundApplicationUseCase } from '../../../application/usecases/processTicketRefundApplicationUseCase';
 import { AuthenticatedRequest } from '../../../infrastructure/auth/authenticatedRequest';
-import { hashTicketIdForOfflineManifest } from '../adapters/rsaPssTicketQrTokenAdapter';
+import { hashTicketIdForOfflineManifest } from '../utils/offlineManifest';
 import { TicketingDomainError } from '../errors/ticketingDomainError';
 import {
   checkInTicketSchema,
@@ -64,6 +64,8 @@ function handleTicketingError(res: Response, error: unknown): Response {
         return res.status(409).json({ error: error.message });
       case 'UNPROCESSABLE_ENTITY':
         return res.status(422).json({ error: error.message });
+      case 'TOO_MANY_REQUESTS':
+        return res.status(429).json({ error: error.message });
       case 'SERVICE_UNAVAILABLE':
         return res.status(503).json({ error: error.message });
     }

=== server/domain/ticketing/errors/ticketingDomainError.ts — diff ===
@@ -4,6 +4,7 @@ export type TicketingErrorCode =
   | 'NOT_FOUND'
   | 'CONFLICT'
   | 'UNPROCESSABLE_ENTITY'
+  | 'TOO_MANY_REQUESTS'
   | 'SERVICE_UNAVAILABLE';
 
 export class TicketingDomainError extends Error {

=== server/domain/ticketing/factory.ts — diff ===
@@ -1,5 +1,5 @@
 import { FirestoreTicketingAdapter } from './adapters/firestoreTicketingAdapter';
-import { RsaPssTicketQrTokenAdapter } from './adapters/rsaPssTicketQrTokenAdapter';
+import { Ed25519TicketQrTokenAdapter } from './adapters/ed25519TicketQrTokenAdapter';
 import { CheckInService } from './services/checkInService';
 import { OfflineCheckInService } from './services/offlineCheckInService';
 import { TicketHolderService } from './services/ticketHolderService';
@@ -9,7 +9,7 @@ import { TicketTypeService } from './services/ticketTypeService';
 import { TicketingReportService } from './services/ticketingReportService';
 
 const ticketingAdapter = new FirestoreTicketingAdapter();
-const ticketQrTokenAdapter = new RsaPssTicketQrTokenAdapter();
+const ticketQrTokenAdapter = new Ed25519TicketQrTokenAdapter();
 
 export const ticketTypeService = new TicketTypeService(ticketingAdapter);
 export const ticketOrderService = new TicketOrderService(ticketingAdapter);

=== server/domain/ticketing/index.ts — diff ===
@@ -1,3 +1,4 @@
+export { anonymizeTicketingUserUseCase } from './usecases/anonymizeTicketingUserUseCase';
 export { archiveTicketTypeUseCase } from './usecases/archiveTicketTypeUseCase';
 export { checkInTicketUseCase } from './usecases/checkInTicketUseCase';
 export { confirmTicketOrderPaymentUseCase } from './usecases/confirmTicketOrderPaymentUseCase';

=== server/domain/ticketing/ports/ticketQrTokenPort.ts — ARQUIVO REESCRITO, substitua todo o conteúdo por este ===
/** Conteúdo assinado do QR do ingresso; campos curtos para o QR ficar menos denso e ler rápido. */
export interface TicketQrPayload {
  v: 1;
  kid: string;
  /** ID do ingresso. */
  tid: string;
  /** Sessão (ocorrência) do evento. */
  occ: string;
  /** Versão do QR: muda na transferência e na reemissão, e o QR anterior deixa de valer. */
  qv: number;
  exp: number;
}

export interface TicketQrTokenPort {
  issue(payload: Omit<TicketQrPayload, 'kid'>): string;
  /** Payload de um QR com assinatura válida e dentro da validade; ou null. */
  verify(token: string): TicketQrPayload | null;
  /** Chaves públicas aceitas (atual e, na rotação, a anterior), para conferir sem internet. */
  publicKeys(): Array<{ kid: string; publicKeyJwk: JsonWebKey }>;
}

=== server/domain/ticketing/ports/ticketingPort.ts — diff ===
@@ -155,6 +155,20 @@ export interface TicketingPort {
     clientEventId?: string;
   }): Promise<{ ticket: Ticket; checkIn: EventCheckIn }>;
   listCheckInsByOccurrenceId(occurrenceId: string): Promise<EventCheckIn[]>;
+  /** Exclusão de conta (§7.5): tira nome e e-mail de pedidos, ingressos e transferências e apaga a lista de espera. */
+  anonymizeUser(uid: string): Promise<{
+    orders: number;
+    tickets: number;
+    transfers: number;
+    waitlist: number;
+  }>;
+  /** Códigos errados na sessão desde `sinceIso`; com `actorUid`, só os dessa pessoa da equipe. */
+  countCheckInCodeFailures(
+    occurrenceId: string,
+    sinceIso: string,
+    actorUid?: string
+  ): Promise<number>;
+  addCheckInCodeFailure(occurrenceId: string, actorUid: string, atIso: string): Promise<void>;
   listCheckInsByEventListingId(eventListingId: string): Promise<EventCheckIn[]>;
 
   createOfflineCheckInSession(

=== server/domain/ticketing/schemas/ticketingSchema.ts — diff ===
@@ -128,10 +128,11 @@ export const checkInTicketSchema = z
     occurrenceId: z.string().trim().min(1),
     ticketId: z.string().trim().min(1).optional(),
     qrToken: z.string().trim().min(8).max(512).optional(),
+    code: z.string().trim().min(8).max(16).optional(),
   })
   .strict()
   .superRefine((data, ctx) => {
-    if (!data.ticketId && !data.qrToken) {
+    if (!data.ticketId && !data.qrToken && !data.code) {
       ctx.addIssue({
         code: z.ZodIssueCode.custom,
         path: ['qrToken'],

=== server/domain/ticketing/services/checkInService.test.ts — ARQUIVO NOVO, conteúdo completo ===
import crypto from 'crypto';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  Ed25519TicketQrTokenAdapter,
  resetTicketQrKeysForTests,
} from '../adapters/ed25519TicketQrTokenAdapter';
import type { TicketingPort } from '../ports/ticketingPort';
import type { Ticket } from '../types/ticketingTypes';
import { deriveTicketCheckInCode } from '../utils/ticketCheckInCode';
import { CheckInService } from './checkInService';

vi.mock('../../events', () => ({
  getEventListingByIdUseCase: vi.fn().mockResolvedValue({ id: 'evt_1', ownerId: 'partner_1' }),
  getEventOccurrenceByIdUseCase: vi.fn().mockResolvedValue({
    id: 'occ_1',
    eventListingId: 'evt_1',
    // 20:00 e 02:00 em Fortaleza.
    startsAt: '2026-12-20T23:00:00.000Z',
    endsAt: '2026-12-21T05:00:00.000Z',
  }),
  createEventAuditLogUseCase: vi.fn().mockResolvedValue(undefined),
}));

const PARTNER = { uid: 'partner_1', admin: false };

function ticket(id: string, overrides: Partial<Ticket> = {}): Ticket {
  return {
    id,
    occurrenceId: 'occ_1',
    ownerUserId: 'buyer_1',
    status: 'issued',
    qrVersion: 1,
    ...overrides,
  } as Ticket;
}

function setup(nowIso: string) {
  const failures: Array<{ occurrenceId: string; actorUid: string; at: string }> = [];
  const tickets = [
    ticket('tkt_1'),
    ticket('tkt_2', { qrVersion: 2 }),
    ticket('tkt_3', { status: 'refunded' }),
  ];
  const port = {
    getTicketById: vi.fn(async (id: string) => tickets.find((item) => item.id === id) ?? null),
    listTicketsByOccurrenceId: vi.fn(async () => tickets),
    countCheckInCodeFailures: vi.fn(
      async (_occ: string, since: string, actor?: string) =>
        failures.filter((f) => f.at >= since && (!actor || f.actorUid === actor)).length
    ),
    addCheckInCodeFailure: vi.fn(async (occurrenceId: string, actorUid: string, at: string) => {
      failures.push({ occurrenceId, actorUid, at });
    }),
    checkInTicketAtomic: vi.fn(async (params: { ticketId: string }) => ({
      ticket: tickets.find((item) => item.id === params.ticketId),
      checkIn: { id: 'ci_1', ticketId: params.ticketId },
    })),
  } as unknown as TicketingPort;
  const nowMs = new Date(nowIso).getTime();
  const qr = new Ed25519TicketQrTokenAdapter(() => nowMs);
  return { port, failures, service: new CheckInService(port, qr, () => nowMs) };
}

describe('check-in do ingresso: QR Ed25519 e código INGR (D20, B36)', () => {
  beforeEach(() => {
    const { privateKey } = crypto.generateKeyPairSync('ed25519');
    process.env.TICKET_QR_PRIVATE_KEY_PEM = privateKey
      .export({ type: 'pkcs8', format: 'pem' })
      .toString();
    process.env.TICKET_QR_KEY_ID = 'tq1';
    process.env.TICKET_CHECKIN_CODE_SECRET = 'segredo-de-teste-com-mais-de-32-caracteres';
    resetTicketQrKeysForTests();
  });

  afterEach(() => {
    delete process.env.TICKET_QR_PRIVATE_KEY_PEM;
    delete process.env.TICKET_QR_KEY_ID;
    delete process.env.TICKET_CHECKIN_CODE_SECRET;
    resetTicketQrKeysForTests();
  });

  it('o QR do titular passa na portaria; o código só aparece no dia da sessão', async () => {
    const before = setup('2026-12-19T12:00:00.000Z');
    const early = await before.service.generateTicketPresentationQr(
      { uid: 'buyer_1', admin: false },
      'tkt_1'
    );
    expect(early.token.startsWith('UGT1.')).toBe(true);
    expect(early.code).toBeNull();
    expect(early.codeVisibleFrom).toBe('2026-12-20T03:00:00.000Z');

    const day = setup('2026-12-20T20:00:00.000Z');
    const pass = await day.service.generateTicketPresentationQr(
      { uid: 'buyer_1', admin: false },
      'tkt_1'
    );
    expect(pass.code).toBe(deriveTicketCheckInCode('tkt_1', 1));
    await day.service.checkInTicket(PARTNER, { occurrenceId: 'occ_1', qrToken: early.token });
    expect(day.port.checkInTicketAtomic).toHaveBeenCalledWith(
      expect.objectContaining({ ticketId: 'tkt_1' })
    );
  });

  it('código digitado acha o ingresso pela versão atual do QR; código da versão antiga não vale', async () => {
    const { service, port } = setup('2026-12-20T22:00:00.000Z');
    await service.checkInTicket(PARTNER, {
      occurrenceId: 'occ_1',
      code: `INGR:${deriveTicketCheckInCode('tkt_2', 2)}`,
    });
    expect(port.checkInTicketAtomic).toHaveBeenCalledWith(
      expect.objectContaining({ ticketId: 'tkt_2' })
    );
    await expect(
      service.checkInTicket(PARTNER, {
        occurrenceId: 'occ_1',
        code: deriveTicketCheckInCode('tkt_2', 1),
      })
    ).rejects.toMatchObject({ code: 'UNPROCESSABLE_ENTITY' });
    await expect(
      service.checkInTicket(PARTNER, {
        occurrenceId: 'occ_1',
        code: deriveTicketCheckInCode('tkt_3', 1),
      })
    ).rejects.toMatchObject({ code: 'UNPROCESSABLE_ENTITY' });
  });

  it('código fora da janela da sessão é recusado sem contar erro', async () => {
    const { service, failures } = setup('2026-12-20T15:00:00.000Z');
    await expect(
      service.checkInTicket(PARTNER, {
        occurrenceId: 'occ_1',
        code: deriveTicketCheckInCode('tkt_1', 1),
      })
    ).rejects.toMatchObject({ code: 'UNPROCESSABLE_ENTITY' });
    expect(failures).toHaveLength(0);
  });

  it('5 erros da mesma pessoa da equipe em 15 min travam o código, não o QR', async () => {
    const { service, failures } = setup('2026-12-20T22:00:00.000Z');
    for (let attempt = 0; attempt < 5; attempt += 1) {
      await expect(
        service.checkInTicket(PARTNER, { occurrenceId: 'occ_1', code: 'AAAAAAAA' })
      ).rejects.toMatchObject({ code: 'UNPROCESSABLE_ENTITY' });
    }
    expect(failures).toHaveLength(5);
    await expect(
      service.checkInTicket(PARTNER, {
        occurrenceId: 'occ_1',
        code: deriveTicketCheckInCode('tkt_1', 1),
      })
    ).rejects.toMatchObject({ code: 'TOO_MANY_REQUESTS' });
  });

  it('outro parceiro não faz check-in por código (IDOR)', async () => {
    const { service } = setup('2026-12-20T22:00:00.000Z');
    await expect(
      service.checkInTicket(
        { uid: 'partner_2', admin: false },
        { occurrenceId: 'occ_1', code: deriveTicketCheckInCode('tkt_1', 1) }
      )
    ).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });
});

=== server/domain/ticketing/services/checkInService.ts — diff ===
@@ -4,6 +4,18 @@ import type { TicketQrTokenPort } from '../ports/ticketQrTokenPort';
 import type { TicketingPort } from '../ports/ticketingPort';
 import { type EventCheckIn, type Ticket } from '../types/ticketingTypes';
 import { listTicketQrTokenLookupHashes } from '../utils/qrToken';
+import {
+  deriveTicketCheckInCode,
+  normalizeTicketCheckInCode,
+  ticketCheckInCodeMatches,
+} from '../utils/ticketCheckInCode';
+import {
+  TICKET_CODE_FAILURE_WINDOW_MS,
+  TICKET_CODE_MAX_FAILURES_PER_ACTOR,
+  TICKET_CODE_MAX_FAILURES_PER_OCCURRENCE,
+  ticketCheckInWindow,
+  ticketCodeVisibleFromMs,
+} from '../utils/ticketCheckInWindow';
 import {
   assertCanManageOccurrence,
   getAuditActorType,
@@ -15,7 +27,8 @@ import {
 export class CheckInService {
   constructor(
     private readonly port: TicketingPort,
-    private readonly qrTokenPort?: TicketQrTokenPort
+    private readonly qrTokenPort?: TicketQrTokenPort,
+    private readonly now: () => number = () => Date.now()
   ) {}
 
   /** Prova de uso numa contestação: algum ingresso do pedido passou pelo check-in (D14). */
@@ -31,6 +44,9 @@ export class CheckInService {
     ticketId: string;
     token: string;
     expiresAt: string;
+    /** Código de 8 caracteres junto do QR; null antes do dia da sessão (D20). */
+    code: string | null;
+    codeVisibleFrom: string | null;
   }> {
     const ticket = await this.port.getTicketById(ticketId);
     if (!ticket) {
@@ -50,7 +66,8 @@ export class CheckInService {
     }
 
     const occurrence = await getEventOccurrenceByIdUseCase(ticket.occurrenceId);
-    const nowSec = Math.floor(Date.now() / 1000);
+    const nowMs = this.now();
+    const nowSec = Math.floor(nowMs / 1000);
     const occEndSec = occurrence
       ? Math.floor(new Date(occurrence.endsAt).getTime() / 1000) + 6 * 3600
       : nowSec + 24 * 3600;
@@ -63,19 +80,26 @@ export class CheckInService {
       );
     }
 
+    const qrVersion = ticket.qrVersion || 1;
     const token = this.qrTokenPort.issue({
       v: 1,
-      ticketId: ticket.id,
-      occurrenceId: ticket.occurrenceId,
-      qrVersion: ticket.qrVersion || 1,
-      iat: nowSec,
+      tid: ticket.id,
+      occ: ticket.occurrenceId,
+      qv: qrVersion,
       exp: expSec,
     });
+    const codeVisibleFromMs = occurrence ? ticketCodeVisibleFromMs(occurrence.startsAt) : null;
 
     return {
       ticketId: ticket.id,
       token,
       expiresAt: new Date(expSec * 1000).toISOString(),
+      code:
+        codeVisibleFromMs !== null && nowMs >= codeVisibleFromMs
+          ? deriveTicketCheckInCode(ticket.id, qrVersion)
+          : null,
+      codeVisibleFrom:
+        codeVisibleFromMs === null ? null : new Date(codeVisibleFromMs).toISOString(),
     };
   }
 
@@ -85,11 +109,16 @@ export class CheckInService {
       occurrenceId: string;
       ticketId?: string;
       qrToken?: string;
+      /** Código de 8 caracteres digitado na portaria quando o QR não lê (D20). */
+      code?: string;
     }
   ): Promise<{ ticket: Ticket; checkIn: EventCheckIn }> {
-    const { listing } = await assertCanManageOccurrence(actor, params.occurrenceId);
+    const { listing, occurrence } = await assertCanManageOccurrence(actor, params.occurrenceId);
 
     let targetTicketId = params.ticketId;
+    if (!targetTicketId && params.code) {
+      targetTicketId = await this.ticketIdFromCode(actor, occurrence, params.code);
+    }
     if (!targetTicketId && params.qrToken) {
       const rawToken = params.qrToken.trim();
       if (this.qrTokenPort && rawToken.includes('.')) {
@@ -100,20 +129,20 @@ export class CheckInService {
             'Assinatura ou validade do QR Code inválida.'
           );
         }
-        if (verified.occurrenceId !== params.occurrenceId) {
+        if (verified.occ !== params.occurrenceId) {
           throw new TicketingDomainError(
             'UNPROCESSABLE_ENTITY',
             'Este ingresso pertence a outra sessão/ocorrência do evento.'
           );
         }
-        const ticket = await this.port.getTicketById(verified.ticketId);
+        const ticket = await this.port.getTicketById(verified.tid);
         if (!ticket) {
           throw new TicketingDomainError(
             'NOT_FOUND',
             'Ingresso não localizado para o QR Code informado.'
           );
         }
-        if ((ticket.qrVersion || 1) !== verified.qrVersion) {
+        if ((ticket.qrVersion || 1) !== verified.qv) {
           throw new TicketingDomainError(
             'UNPROCESSABLE_ENTITY',
             'Este QR Code foi substituído ou invalidado por transferência.'
@@ -162,4 +191,54 @@ export class CheckInService {
 
     return result;
   }
+
+  /**
+   * Ingresso cujo código bate com o digitado, só para quem gerencia a sessão e na janela dela.
+   * Errar demais trava o código, nunca o QR (D20, exceção do §7.7).
+   */
+  private async ticketIdFromCode(
+    actor: TicketingActorContext,
+    occurrence: { id: string; startsAt: string; endsAt: string },
+    rawCode: string
+  ): Promise<string> {
+    const nowMs = this.now();
+    const { opensAtMs, closesAtMs } = ticketCheckInWindow(occurrence.startsAt, occurrence.endsAt);
+    if (nowMs < opensAtMs || nowMs > closesAtMs) {
+      throw new TicketingDomainError(
+        'UNPROCESSABLE_ENTITY',
+        'O check-in por código desta sessão não está aberto agora.'
+      );
+    }
+    const since = new Date(nowMs - TICKET_CODE_FAILURE_WINDOW_MS).toISOString();
+    const [byActor, bySession] = await Promise.all([
+      this.port.countCheckInCodeFailures(occurrence.id, since, actor.uid),
+      this.port.countCheckInCodeFailures(occurrence.id, since),
+    ]);
+    if (
+      byActor >= TICKET_CODE_MAX_FAILURES_PER_ACTOR ||
+      bySession >= TICKET_CODE_MAX_FAILURES_PER_OCCURRENCE
+    ) {
+      throw new TicketingDomainError(
+        'TOO_MANY_REQUESTS',
+        'Muitos códigos errados. Leia o QR Code ou tente de novo em 15 minutos.'
+      );
+    }
+    const code = normalizeTicketCheckInCode(rawCode);
+    const tickets = code ? await this.port.listTicketsByOccurrenceId(occurrence.id) : [];
+    const match = tickets.find(
+      (ticket) =>
+        (ticket.status === 'issued' || ticket.status === 'checked_in') &&
+        code !== null &&
+        ticketCheckInCodeMatches(ticket.id, ticket.qrVersion || 1, code)
+    );
+    if (!match) {
+      await this.port.addCheckInCodeFailure(
+        occurrence.id,
+        actor.uid,
+        new Date(nowMs).toISOString()
+      );
+      throw new TicketingDomainError('UNPROCESSABLE_ENTITY', 'Código incorreto.');
+    }
+    return match.id;
+  }
 }

=== server/domain/ticketing/services/offlineCheckInService.ts — diff ===
@@ -1,6 +1,6 @@
 import crypto from 'crypto';
 import { createEventAuditLogUseCase } from '../../events';
-import { hashTicketIdForOfflineManifest } from '../adapters/rsaPssTicketQrTokenAdapter';
+import { hashTicketIdForOfflineManifest } from '../utils/offlineManifest';
 import { TicketingDomainError } from '../errors/ticketingDomainError';
 import type { TicketQrTokenPort } from '../ports/ticketQrTokenPort';
 import type { TicketingPort } from '../ports/ticketingPort';
@@ -61,7 +61,8 @@ export class OfflineCheckInService {
       );
     }
 
-    const { keyId, publicKeyJwk } = this.qrTokenPort.getPublicKeyMetadata();
+    const keys = this.qrTokenPort.publicKeys();
+    const keyId = keys[0]?.kid ?? '';
     const allTickets = await this.port.listTicketsByOccurrenceId(occurrence.id);
     const eligibleTickets = allTickets
       .filter((t) => t.status === 'issued')
@@ -106,7 +107,7 @@ export class OfflineCheckInService {
       issuedAt,
       expiresAt,
       keyId,
-      publicKeyJwk,
+      keys,
       tickets: eligibleTickets,
     };

=== server/domain/ticketing/services/ticketHolderService.ts — diff ===
@@ -17,6 +17,12 @@ import {
 export class TicketHolderService {
   constructor(private readonly port: TicketingPort) {}
 
+  /** Exclusão de conta (§7.5): quantos registros perderam o dado pessoal. */
+  async anonymizeUser(uid: string): Promise<number> {
+    const result = await this.port.anonymizeUser(uid);
+    return result.orders + result.tickets + result.transfers + result.waitlist;
+  }
+
   async transferTicket(
     actor: TicketingActorContext,
     params: {

=== server/domain/ticketing/services/ticketingServices.test.ts — diff ===
@@ -177,15 +177,15 @@ describe('serviços de ticketing', () => {
       createOfflineCheckInSession: vi.fn(),
       getOfflineCheckInSessionById: vi.fn(),
       syncOfflineCheckInsAtomic: vi.fn(),
+      anonymizeUser: vi.fn(),
+      countCheckInCodeFailures: vi.fn().mockResolvedValue(0),
+      addCheckInCodeFailure: vi.fn().mockResolvedValue(undefined),
     };
 
     const mockQrTokenPort = {
-      issue: vi.fn().mockReturnValue('ugt2.mock.sig'),
+      issue: vi.fn().mockReturnValue('UGT1.mock.sig'),
       verify: vi.fn(),
-      getPublicKeyMetadata: vi.fn().mockReturnValue({
-        keyId: 'key_mock',
-        publicKeyJwk: { kty: 'RSA' },
-      }),
+      publicKeys: vi.fn().mockReturnValue([{ kid: 'key_mock', publicKeyJwk: { kty: 'OKP' } }]),
     };
 
     services = {

=== server/domain/ticketing/types/ticketingTypes.ts — diff ===
@@ -269,7 +269,8 @@ export interface OfflineCheckInManifest {
   issuedAt: string;
   expiresAt: string;
   keyId: string;
-  publicKeyJwk: JsonWebKey;
+  /** Chave atual e, na rotação, a anterior: o aparelho confere o QR sem internet. */
+  keys: Array<{ kid: string; publicKeyJwk: JsonWebKey }>;
   tickets: Array<{
     ticketIdHash: string;
     qrVersion: number;

=== server/domain/ticketing/usecases/anonymizeTicketingUserUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { ticketHolderService } from '../factory';

/** Exclusão de conta: tira o dado pessoal do ticketing e mantém pedidos e ingressos (§7.5). */
export function anonymizeTicketingUserUseCase(uid: string): Promise<number> {
  return ticketHolderService.anonymizeUser(uid);
}

=== server/domain/ticketing/utils/offlineManifest.ts — ARQUIVO NOVO, conteúdo completo ===
import crypto from 'crypto';

/** O manifesto do aparelho leva o hash do ID do ingresso, não o ID (quem copia o manifesto não forja QR). */
export function hashTicketIdForOfflineManifest(ticketId: string): string {
  return crypto.createHash('sha256').update(ticketId.trim()).digest('hex');
}

=== server/domain/ticketing/utils/offlineTicketBundle.ts — APAGUE este arquivo ===

=== server/domain/ticketing/utils/ticketCheckInCode.ts — ARQUIVO NOVO, conteúdo completo ===
import { ShortCodeDeriver, normalizeShortCode } from '../../../infrastructure/crypto/shortCode';

/** Código junto do QR do ingresso, para a portaria digitar quando a leitura falha (D20). */
export const TICKET_CODE_LENGTH = 8;

const codes = new ShortCodeDeriver('TICKET_CHECKIN_CODE_SECRET');

// A versão do QR entra no rótulo: na transferência ou reemissão, o código antigo deixa de valer.
function label(ticketId: string, qrVersion: number): string {
  return `ticket:${ticketId}#v${qrVersion}`;
}

/** Derivado do ID e da versão com o segredo do Secret Manager e nunca gravado (§7.7, D20). */
export function deriveTicketCheckInCode(ticketId: string, qrVersion: number): string {
  return codes.current(label(ticketId, qrVersion), TICKET_CODE_LENGTH);
}

export function ticketCheckInCodeMatches(
  ticketId: string,
  qrVersion: number,
  code: string
): boolean {
  return codes.matches(label(ticketId, qrVersion), TICKET_CODE_LENGTH, code);
}

export function normalizeTicketCheckInCode(input: string): string | null {
  return normalizeShortCode(input, TICKET_CODE_LENGTH);
}

=== server/domain/ticketing/utils/ticketCheckInWindow.ts — ARQUIVO NOVO, conteúdo completo ===
import { businessDayStartMs } from '../../../shared/kernel/businessDay';

const MINUTE_MS = 60_000;
const HOUR_MS = 60 * MINUTE_MS;

/** Mesma janela do QR assinado e da sessão sem internet: de 6 h antes do início a 6 h depois do fim. */
export const TICKET_CHECK_IN_OPENS_BEFORE_MS = 6 * HOUR_MS;
export const TICKET_CHECK_IN_CLOSES_AFTER_MS = 6 * HOUR_MS;
/** Código errado: no máximo 5 por pessoa da equipe e 50 por sessão a cada 15 min (D20, §7.7). */
export const TICKET_CODE_MAX_FAILURES_PER_ACTOR = 5;
export const TICKET_CODE_MAX_FAILURES_PER_OCCURRENCE = 50;
export const TICKET_CODE_FAILURE_WINDOW_MS = 15 * MINUTE_MS;

export function ticketCheckInWindow(
  startsAt: string,
  endsAt: string
): { opensAtMs: number; closesAtMs: number } {
  return {
    opensAtMs: new Date(startsAt).getTime() - TICKET_CHECK_IN_OPENS_BEFORE_MS,
    closesAtMs: new Date(endsAt).getTime() + TICKET_CHECK_IN_CLOSES_AFTER_MS,
  };
}

/** O código aparece para o comprador a partir de 00:00 do dia da sessão em Fortaleza (D20). */
export function ticketCodeVisibleFromMs(startsAt: string): number {
  return businessDayStartMs(startsAt);
}

=== server/infrastructure/crypto/ed25519TokenSigner.ts — ARQUIVO NOVO, conteúdo completo ===
import crypto from 'crypto';

/** Nomes das variáveis de cada QR assinado; cada uso tem a própria chave (§7.8). */
export interface Ed25519TokenSignerConfig {
  /** Prefixo do token: separa um QR de outro e permite trocar o formato depois. */
  prefix: string;
  privateKeyEnv: string;
  keyIdEnv: string;
  previousPublicKeyEnv: string;
  previousKeyIdEnv: string;
}

interface LoadedKeys {
  kid: string;
  privateKey: crypto.KeyObject;
  verifiers: Array<{ kid: string; publicKey: crypto.KeyObject }>;
}

/**
 * QR assinado com Ed25519 (AGENTS.md §7.7): `<prefixo>.<payload base64url>.<assinatura>`, com o
 * `kid` dentro do payload para a rotação. A assinatura é determinística, então o mesmo QR pode ser
 * reemitido sem gravar nada. As chaves são lidas na primeira chamada; sem elas, falha.
 */
export class Ed25519TokenSigner {
  private loaded: LoadedKeys | null = null;

  constructor(
    private readonly config: Ed25519TokenSignerConfig,
    private readonly env: NodeJS.ProcessEnv = process.env
  ) {}

  sign(payload: Record<string, unknown>): string {
    const { kid, privateKey } = this.keys();
    const body = Buffer.from(JSON.stringify({ ...payload, kid }), 'utf8').toString('base64url');
    const signature = crypto.sign(null, Buffer.from(body, 'utf8'), privateKey);
    return `${this.config.prefix}.${body}.${signature.toString('base64url')}`;
  }

  /** Payload com assinatura válida de uma chave aceita, ainda sem conferir os campos; ou null. */
  verify(token: string): (Record<string, unknown> & { kid: string }) | null {
    const [prefix, body, signature, extra] = token.trim().split('.');
    if (prefix !== this.config.prefix || !body || !signature || extra !== undefined) return null;
    try {
      const payload: unknown = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
      if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return null;
      const kid = (payload as { kid?: unknown }).kid;
      if (typeof kid !== 'string') return null;
      const verifier = this.keys().verifiers.find((candidate) => candidate.kid === kid);
      if (!verifier) return null;
      const valid = crypto.verify(
        null,
        Buffer.from(body, 'utf8'),
        verifier.publicKey,
        Buffer.from(signature, 'base64url')
      );
      return valid ? (payload as Record<string, unknown> & { kid: string }) : null;
    } catch {
      return null;
    }
  }

  /** Chaves públicas aceitas, para conferir o QR no aparelho sem internet. */
  publicKeys(): Array<{ kid: string; publicKeyJwk: JsonWebKey }> {
    return this.keys().verifiers.map(({ kid, publicKey }) => ({
      kid,
      publicKeyJwk: publicKey.export({ format: 'jwk' }) as JsonWebKey,
    }));
  }

  /** Só testes: esquece as chaves lidas para trocar as variáveis de ambiente. */
  reset(): void {
    this.loaded = null;
  }

  private readPem(name: string): string | null {
    const value = this.env[name]?.trim();
    return value ? value.replace(/\\n/g, '\n') : null;
  }

  // Sem chave configurada o QR não funciona: nunca gerar chave na hora (§7.7).
  private keys(): LoadedKeys {
    if (this.loaded) return this.loaded;
    const { privateKeyEnv, keyIdEnv, previousPublicKeyEnv, previousKeyIdEnv } = this.config;
    const pem = this.readPem(privateKeyEnv);
    const kid = this.env[keyIdEnv]?.trim();
    if (!pem || !kid) throw new Error(`${privateKeyEnv} ou ${keyIdEnv} ausente.`);
    const privateKey = crypto.createPrivateKey(pem);
    if (privateKey.asymmetricKeyType !== 'ed25519') {
      throw new Error(`${privateKeyEnv} precisa ser uma chave Ed25519.`);
    }
    const verifiers = [{ kid, publicKey: crypto.createPublicKey(privateKey) }];
    // Rotação (§7.8): a chave pública anterior vale até o fim dos QRs já emitidos com ela.
    const previousPem = this.readPem(previousPublicKeyEnv);
    const previousKid = this.env[previousKeyIdEnv]?.trim();
    if (previousPem && previousKid) {
      verifiers.push({ kid: previousKid, publicKey: crypto.createPublicKey(previousPem) });
    }
    this.loaded = { kid, privateKey, verifiers };
    return this.loaded;
  }
}

=== server/infrastructure/crypto/shortCode.ts — ARQUIVO NOVO, conteúdo completo ===
import crypto from 'crypto';

/** Sem 0/O e 1/I/L, que se confundem ditos em voz alta ou digitados (D20). */
export const SHORT_CODE_ALPHABET = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';

const MIN_CURRENT_SECRET_LENGTH = 32;
const MIN_PREVIOUS_SECRET_LENGTH = 16;
// Maior múltiplo de 31 que cabe num byte: bytes acima são descartados para não favorecer letras.
const UNBIASED_BYTE_LIMIT = 248;

/** Código curto derivado por HMAC-SHA-256 de um rótulo (ID, unidade, versão); nunca gravado. */
export function deriveShortCode(secret: string, label: string, length: number): string {
  let code = '';
  for (let counter = 0; code.length < length; counter += 1) {
    const digest = crypto.createHmac('sha256', secret).update(`${label}:${counter}`).digest();
    for (const byte of digest) {
      if (byte >= UNBIASED_BYTE_LIMIT) continue;
      code += SHORT_CODE_ALPHABET[byte % SHORT_CODE_ALPHABET.length];
      if (code.length === length) break;
    }
  }
  return code;
}

/**
 * Aceita minúsculas, espaços, hífen e o prefixo da tela (`PASS:`, `INGR:`), que não é gravado nem
 * conferido (D20); devolve null se não for um código do tamanho pedido.
 */
export function normalizeShortCode(input: string, length: number): string | null {
  const normalized = input
    .toUpperCase()
    .replace(/^[A-Z]{4}:/, '')
    .replace(/[\s-]/g, '');
  const pattern = new RegExp(`^[${SHORT_CODE_ALPHABET}]{${length}}$`);
  return pattern.test(normalized) ? normalized : null;
}

export function shortCodesMatch(expected: string, received: string): boolean {
  const a = Buffer.from(expected);
  const b = Buffer.from(received);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

/**
 * Códigos de um uso (reserva, ingresso) com o segredo do Secret Manager e, durante a rotação, o
 * anterior (§7.8). Sem o segredo atual, falha na primeira chamada (§2.2.4).
 */
export class ShortCodeDeriver {
  constructor(
    private readonly secretEnv: string,
    private readonly env: NodeJS.ProcessEnv = process.env
  ) {}

  current(label: string, length: number): string {
    return deriveShortCode(this.currentSecret(), label, length);
  }

  accepted(label: string, length: number): string[] {
    const codes = [this.current(label, length)];
    const previous = this.readSecret(`${this.secretEnv}_PREVIOUS`, MIN_PREVIOUS_SECRET_LENGTH);
    if (previous) codes.push(deriveShortCode(previous, label, length));
    return codes;
  }

  matches(label: string, length: number, code: string): boolean {
    return this.accepted(label, length).some((accepted) => shortCodesMatch(accepted, code));
  }

  private readSecret(name: string, minLength: number): string | null {
    const value = this.env[name]?.trim();
    return value && value.length >= minLength ? value : null;
  }

  private currentSecret(): string {
    const secret = this.readSecret(this.secretEnv, MIN_CURRENT_SECRET_LENGTH);
    if (!secret) {
      throw new Error(
        `${this.secretEnv} ausente ou com menos de ${MIN_CURRENT_SECRET_LENGTH} caracteres.`
      );
    }
    return secret;
  }
}

=== server/shared/kernel/businessDay.ts — ARQUIVO NOVO, conteúdo completo ===
const HOUR_MS = 60 * 60_000;
const DAY_MS = 24 * HOUR_MS;
// America/Fortaleza é UTC−3 o ano todo, sem horário de verão (AGENTS.md §1).
const FORTALEZA_OFFSET_MS = 3 * HOUR_MS;

/** 00:00 em Fortaleza do dia em que `iso` acontece, em milissegundos UTC. */
export function businessDayStartMs(iso: string): number {
  const local = new Date(iso).getTime() - FORTALEZA_OFFSET_MS;
  return Math.floor(local / DAY_MS) * DAY_MS + FORTALEZA_OFFSET_MS;
}

=== src/domain/bookings/components/partner/PartnerOfferEditor.tsx — diff ===
@@ -1,6 +1,6 @@
 import { zodResolver } from '@hookform/resolvers/zod';
 import { useState } from 'react';
-import { Controller, useForm } from 'react-hook-form';
+import { Controller, useForm, useWatch } from 'react-hook-form';
 import { useTranslation } from 'react-i18next';
 import { useCancellationPolicyOptions } from '../../../../shared/hooks/useCancellationPolicyOptions';
 import { RadioCardGroup } from '../../../../ui/components/RadioCardGroup';
@@ -47,6 +47,10 @@ export function PartnerOfferEditor({
     defaultValues,
   });
 
+  // Na venda por grupo, o limite da reserva conta grupos, não pessoas (D20).
+  const sellingUnit = useWatch({ control, name: 'sellingUnit' });
+  const group = defaultValues.kind === 'tour' && sellingUnit === 'group';
+
   const submit = handleSubmit(async (values) => {
     setSubmitError(null);
     try {
@@ -77,7 +81,14 @@ export function PartnerOfferEditor({
       <OfferPriceFields control={control} register={register} errors={errors} />
       <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
         {numberField('durationMinutes', t('bookings.editor.durationLabel'))}
-        {numberField('maxParticipantsPerBooking', t('bookings.editor.maxParticipantsLabel'))}
+        {numberField(
+          'maxParticipantsPerBooking',
+          t(
+            group
+              ? 'serviceProof.offerEditor.maxGroupsLabel'
+              : 'bookings.editor.maxParticipantsLabel'
+          )
+        )}
       </div>
       <label className="block space-y-1">
         <span className="text-xs text-ink/70">{t('bookings.editor.meetingPointLabel')}</span>

=== src/shared/i18n/serviceProofResources.ts — diff ===
@@ -134,6 +134,7 @@ export interface ServiceProofTranslation {
     perGroup: string;
     perGroupHint: string;
     groupMaxLabel: string;
+    maxGroupsLabel: string;
     requireNamesHint: string;
   };
 }
@@ -288,6 +289,7 @@ export const serviceProofPtBR: ServiceProofTranslation = {
     perGroup: 'Por grupo',
     perGroupHint: 'Um código para o grupo inteiro, como um buggy ou um barco.',
     groupMaxLabel: 'Máximo de pessoas por grupo',
+    maxGroupsLabel: 'Máximo de grupos por reserva',
     requireNamesHint: 'O nome aparece em cada entrada e a portaria confere com documento com foto.',
   },
 };
@@ -442,6 +444,7 @@ export const serviceProofEn: ServiceProofTranslation = {
     perGroup: 'Per group',
     perGroupHint: 'One code for the whole group, like a buggy or a boat.',
     groupMaxLabel: 'Maximum people per group',
+    maxGroupsLabel: 'Maximum groups per booking',
     requireNamesHint: 'The name shows on each entry and the staff checks it against a photo ID.',
   },
 };
@@ -599,6 +602,7 @@ export const serviceProofFr: ServiceProofTranslation = {
     perGroup: 'Par groupe',
     perGroupHint: 'Un code pour tout le groupe, comme un buggy ou un bateau.',
     groupMaxLabel: 'Nombre maximum de personnes par groupe',
+    maxGroupsLabel: 'Nombre maximum de groupes par réservation',
     requireNamesHint:
       'Le nom apparaît sur chaque entrée et l’accueil le vérifie avec une pièce d’identité.',
   },

VERIFICAÇÃO (obrigatória):
- `npm run typecheck`, `npx biome lint .` (0 erros; arquivos tocados sem avisos), `npm run build`;
- testes ligados aos arquivos deste prompt: `npx vitest related --run server/application/usecases/deleteUserAccountApplicationUseCase.test.ts server/application/usecases/deleteUserAccountApplicationUseCase.ts server/domain/bookings/adapters/ed25519EntryPassAdapter.ts server/domain/bookings/utils/checkInCode.ts server/domain/bookings/utils/checkInWindow.ts server/domain/ticketing/adapters/ed25519TicketQrTokenAdapter.test.ts server/domain/ticketing/adapters/ed25519TicketQrTokenAdapter.ts server/domain/ticketing/adapters/firestoreCheckInStore.ts server/domain/ticketing/adapters/firestoreTicketPrivacyStore.ts server/domain/ticketing/adapters/firestoreTicketingAdapter.ts server/domain/ticketing/controllers/ticketingController.ts server/domain/ticketing/errors/ticketingDomainError.ts server/domain/ticketing/factory.ts server/domain/ticketing/index.ts server/domain/ticketing/ports/ticketQrTokenPort.ts server/domain/ticketing/ports/ticketingPort.ts server/domain/ticketing/schemas/ticketingSchema.ts server/domain/ticketing/services/checkInService.test.ts server/domain/ticketing/services/checkInService.ts server/domain/ticketing/services/offlineCheckInService.ts server/domain/ticketing/services/ticketHolderService.ts server/domain/ticketing/services/ticketingServices.test.ts server/domain/ticketing/types/ticketingTypes.ts server/domain/ticketing/usecases/anonymizeTicketingUserUseCase.ts server/domain/ticketing/utils/offlineManifest.ts server/domain/ticketing/utils/ticketCheckInCode.ts server/domain/ticketing/utils/ticketCheckInWindow.ts server/infrastructure/crypto/ed25519TokenSigner.ts server/infrastructure/crypto/shortCode.ts server/shared/kernel/businessDay.ts src/domain/bookings/components/partner/PartnerOfferEditor.tsx src/shared/i18n/serviceProofResources.ts` (todos verdes). Não precisa rodar a suíte inteira.
- `npm run test:rules` (as regras mudaram).

ENTREGA: responda no formato do AGENTS.md §16.3.

LIMPEZA (obrigatória, ao terminar de implementar): apague todos os arquivos de public/assets/aistudio/, inclusive o deste prompt. São cópias dos textos colados no chat, salvas automaticamente pelo AI Studio, e public/ vai para o site publicado. Se a pasta ficar vazia, apague a pasta também.
~~~~

### Configurações manuais (você faz, fora do AI Studio, depois de aplicar este prompt)

1. Gere a chave do ingresso: `openssl genpkey -algorithm ed25519 -out ingresso.pem`. Crie no Secret Manager `TICKET_QR_PRIVATE_KEY_PEM` (conteúdo do PEM) e `TICKET_QR_KEY_ID` (ex.: `ingresso-2026-11`) e monte no Cloud Run; no AI Studio, outra chave gerada do mesmo jeito. Apague o arquivo local depois.
2. Crie `TICKET_CHECKIN_CODE_SECRET` com 32 bytes aleatórios (`openssl rand -base64 32`), no Secret Manager e no AI Studio (valores diferentes). As variáveis `*_PREVIOUS*` ficam vazias fora de rotação.
3. Remova `OFFLINE_CHECKIN_PRIVATE_KEY_PEM` e `OFFLINE_CHECKIN_KEY_ID` do Cloud Run e do AI Studio e apague esses segredos do Secret Manager.
4. Publique as regras e os índices do Firestore: `firebase deploy --only firestore:rules,firestore:indexes`.
