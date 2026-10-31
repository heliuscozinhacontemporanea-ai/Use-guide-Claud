# Prompt 21.7d — @ obrigatório depois de criar a conta e link de transferência (30 min)

> Lote 18, gerado dos commits de referência `f29204b..fef8a57` da branch `claude/agents-md-v2`. Aplique na ordem do lote (A7, 21.1 a 21.7d), um por vez. Cole o bloco abaixo no agente do AI Studio, inteiro, de uma vez.

---

## Prompt 21.7d — @ obrigatório depois de criar a conta e link de transferência (30 min)

Telas aprovadas em 2026-10-31.

~~~~text
Siga o AGENTS.md. O app ainda não foi liberado para usuários: nenhum código de compatibilidade ou transição (§2.2 item 8). As regras de negócio estão nas decisões D20 e D21 de docs/arquitetura/decisoes.md (aplicadas pelo prompt A7).

IMPORTANTE: aplique os diffs abaixo EXATAMENTE, inclusive os arquivos novos. Não reescreva os arquivos do seu jeito. Arquivo tocado sai sem avisos do lint e formatado (AGENTS.md §13). Não altere firebase.json, functions/, AGENTS.md, docs/ nem .env.

O QUE MUDA:
1) Passo "Escolha seu nome de usuário" depois do cadastro por e-mail ou Google e para contas sem @; só fecha ao salvar ou ao sair da conta. Formulário do @ compartilhado com Configurações; o Dialog ganha a opção sem fechar.
2) Quando o @ não existe, quem comprou gera um link de transferência que vale 30 min e uma vez. O código vai depois do # (/#receber-ingresso=<id>.<código>) e o backend guarda só o HMAC (TICKET_QR_SECRET, com rotação).
3) O ingresso fica com quem comprou até a pessoa entrar ou criar conta, escolher o @, verificar o e-mail e aceitar; quem comprou pode cancelar, e gerar outro cancela o anterior. Ingresso recebido não gera link.
4) Coleção ticketTransferLinks só backend (firestore.rules) e 2 índices novos; abrir e aceitar com limite por pessoa (30 a cada 10 min).

ARQUIVOS (crie, altere ou apague exatamente estes):
- firestore.indexes.json (alterar)
- firestore.rules (alterar)
- server/application/usecases/ticketing/acceptTicketTransferLinkApplicationUseCase.test.ts (criar)
- server/application/usecases/ticketing/acceptTicketTransferLinkApplicationUseCase.ts (criar)
- server/application/usecases/ticketing/createTicketTransferLinkApplicationUseCase.ts (criar)
- server/domain/ticketing/adapters/firestoreTicketPrivacyStore.ts (alterar)
- server/domain/ticketing/adapters/firestoreTicketingAdapter.ts (alterar)
- server/domain/ticketing/adapters/firestoreTransferLinkStore.ts (criar)
- server/domain/ticketing/controllers/ticketingController.ts (alterar)
- server/domain/ticketing/dtos/ticketingPersistenceMappers.ts (alterar)
- server/domain/ticketing/errors/ticketingDomainError.ts (alterar)
- server/domain/ticketing/factory.ts (alterar)
- server/domain/ticketing/index.ts (alterar)
- server/domain/ticketing/ports/ticketingPort.ts (alterar)
- server/domain/ticketing/services/ticketHolderService.ts (alterar)
- server/domain/ticketing/services/ticketTransferLinkService.test.ts (criar)
- server/domain/ticketing/services/ticketTransferLinkService.ts (criar)
- server/domain/ticketing/services/ticketingServices.test.ts (alterar)
- server/domain/ticketing/services/transferEligibility.ts (criar)
- server/domain/ticketing/types/ticketingTypes.ts (alterar)
- server/domain/ticketing/usecases/cancelTicketTransferLinkUseCase.ts (criar)
- server/domain/ticketing/usecases/claimTicketTransferLinkUseCase.ts (criar)
- server/domain/ticketing/usecases/createTicketTransferLinkUseCase.ts (criar)
- server/domain/ticketing/usecases/previewTicketTransferLinkUseCase.ts (criar)
- server/domain/ticketing/usecases/releaseTicketTransferLinkUseCase.ts (criar)
- server/domain/ticketing/utils/transferLinkToken.ts (criar)
- server/interfaces/http/ticketTransfers/ticketTransferController.ts (alterar)
- server/interfaces/http/ticketTransfers/ticketTransferRoutes.ts (alterar)
- server/interfaces/http/ticketTransfers/ticketTransferSchema.ts (alterar)
- src/app/App.tsx (alterar)
- src/app/TransferLinkReceiver.tsx (criar)
- src/app/UsernameGate.test.tsx (criar)
- src/app/UsernameGate.tsx (criar)
- src/domain/ticketing/adapters/httpTicketingAdapter.ts (alterar)
- src/domain/ticketing/application/usecases/acceptTransferLinkUseCase.ts (criar)
- src/domain/ticketing/application/usecases/cancelTransferLinkUseCase.ts (criar)
- src/domain/ticketing/application/usecases/createTransferLinkUseCase.ts (criar)
- src/domain/ticketing/application/usecases/previewTransferLinkUseCase.ts (criar)
- src/domain/ticketing/components/UserTicketsHistoryView.tsx (alterar)
- src/domain/ticketing/components/wallet/TransferLinkPanel.tsx (criar)
- src/domain/ticketing/components/wallet/TransferLinkReceiverDialog.tsx (criar)
- src/domain/ticketing/components/wallet/TransferTicketForm.tsx (alterar)
- src/domain/ticketing/components/wallet/WalletTicketCard.tsx (alterar)
- src/domain/ticketing/hooks/useTicketWalletActions.ts (alterar)
- src/domain/ticketing/index.ts (alterar)
- src/domain/ticketing/ports/ticketingPort.ts (alterar)
- src/domain/ticketing/types/ticketing.ts (alterar)
- src/domain/ticketing/utils/transferLinkUrl.test.ts (criar)
- src/domain/ticketing/utils/transferLinkUrl.ts (criar)
- src/domain/user/components/UsernameForm.tsx (criar)
- src/domain/user/components/UsernameOnboardingDialog.tsx (criar)
- src/domain/user/components/UsernameSettingsView.tsx (alterar)
- src/domain/user/index.ts (alterar)
- src/shared/i18n/usernameResources.ts (alterar)
- src/ui/components/Dialog.tsx (alterar)

Aplique as mudanças abaixo EXATAMENTE como estão (formato unified diff: linhas com "-" saem, linhas com "+" entram; as demais são contexto para localizar o trecho). Não reformate outros trechos dos arquivos.

=== firestore.indexes.json — diff ===
@@ -535,6 +535,38 @@
           "order": "ASCENDING"
         }
       ]
+    },
+    {
+      "collectionGroup": "ticketTransferLinks",
+      "queryScope": "COLLECTION",
+      "fields": [
+        {
+          "fieldPath": "ticketId",
+          "order": "ASCENDING"
+        },
+        {
+          "fieldPath": "status",
+          "order": "ASCENDING"
+        }
+      ]
+    },
+    {
+      "collectionGroup": "ticketTransferLinks",
+      "queryScope": "COLLECTION",
+      "fields": [
+        {
+          "fieldPath": "ticketId",
+          "order": "ASCENDING"
+        },
+        {
+          "fieldPath": "fromUserId",
+          "order": "ASCENDING"
+        },
+        {
+          "fieldPath": "status",
+          "order": "ASCENDING"
+        }
+      ]
     }
   ],
   "fieldOverrides": [

=== firestore.rules — diff ===
@@ -103,6 +103,9 @@ service cloud.firestore {
     match /ticketCheckInCodeFailures/{failureId} {
       allow read, write: if false;
     }
+    match /ticketTransferLinks/{linkId} {
+      allow read, write: if false;
+    }
     match /bookingAuditLogs/{logId} {
       allow read: if isAdmin();
       allow write: if false;

=== server/application/usecases/ticketing/acceptTicketTransferLinkApplicationUseCase.test.ts — ARQUIVO NOVO, conteúdo completo ===
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../../domain/ticketing', () => ({
  claimTicketTransferLinkUseCase: vi.fn(),
  releaseTicketTransferLinkUseCase: vi.fn().mockResolvedValue(undefined),
  transferTicketUseCase: vi.fn(),
}));
vi.mock('../../../domain/users', () => ({
  getUserProfileUseCase: vi.fn().mockResolvedValue({
    email: 'bruno@exemplo.com',
    firstName: 'Bruno',
    lastName: 'Lima',
    username: 'bruno',
  }),
  resolveUsernameOwnerUseCase: vi.fn(),
}));
vi.mock('../../../domain/notifications', () => ({
  createNotificationUseCase: vi.fn().mockResolvedValue(true),
}));

import {
  claimTicketTransferLinkUseCase,
  releaseTicketTransferLinkUseCase,
  transferTicketUseCase,
} from '../../../domain/ticketing';
import { acceptTicketTransferLinkApplicationUseCase } from './acceptTicketTransferLinkApplicationUseCase';

const LINK = {
  id: 'lnk_1',
  ticketId: 'tkt_1',
  fromUserId: 'buyer',
  receivedFrom: { username: 'ana', displayName: 'Ana Souza' },
};

describe('aceite do link de transferência (D21)', () => {
  beforeEach(() => {
    vi.mocked(claimTicketTransferLinkUseCase).mockResolvedValue(LINK as never);
  });

  it('transfere em nome de quem gerou o link para quem aceitou', async () => {
    vi.mocked(transferTicketUseCase).mockResolvedValue({ newTicket: { id: 'tkt_2' } } as never);
    await expect(
      acceptTicketTransferLinkApplicationUseCase(
        { uid: 'bruno', emailVerified: true },
        'lnk_1',
        't'
      )
    ).resolves.toEqual({ ticketId: 'tkt_2' });
    expect(transferTicketUseCase).toHaveBeenCalledWith(
      { uid: 'buyer', admin: false },
      expect.objectContaining({ toUserId: 'bruno', receivedFrom: LINK.receivedFrom })
    );
  });

  it('sem e-mail verificado recusa; transferência que falha devolve o link', async () => {
    await expect(
      acceptTicketTransferLinkApplicationUseCase(
        { uid: 'bruno', emailVerified: false },
        'lnk_1',
        't'
      )
    ).rejects.toMatchObject({ code: 'RECIPIENT_NOT_VERIFIED' });
    vi.mocked(transferTicketUseCase).mockRejectedValue(new Error('prazo'));
    await expect(
      acceptTicketTransferLinkApplicationUseCase(
        { uid: 'bruno', emailVerified: true },
        'lnk_1',
        't'
      )
    ).rejects.toThrow('prazo');
    expect(releaseTicketTransferLinkUseCase).toHaveBeenCalledWith('lnk_1');
  });
});

=== server/application/usecases/ticketing/acceptTicketTransferLinkApplicationUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { createNotificationUseCase } from '../../../domain/notifications';
import {
  claimTicketTransferLinkUseCase,
  releaseTicketTransferLinkUseCase,
  transferTicketUseCase,
} from '../../../domain/ticketing';
import { getUserProfileUseCase } from '../../../domain/users';
import { TicketTransferError } from './transferTicketToUsernameApplicationUseCase';

/**
 * Aceite do link (D21): conta com e-mail verificado reserva o link e recebe o ingresso. Se a
 * transferência falhar (prazo, ingresso usado), o link volta a valer até vencer.
 */
export async function acceptTicketTransferLinkApplicationUseCase(
  actor: { uid: string; emailVerified: boolean },
  linkId: string,
  token: string
): Promise<{ ticketId: string }> {
  if (!actor.emailVerified) {
    throw new TicketTransferError(
      'RECIPIENT_NOT_VERIFIED',
      'Confirme seu e-mail para receber o ingresso.'
    );
  }
  const link = await claimTicketTransferLinkUseCase(linkId, token, actor.uid);
  try {
    const recipient = await getUserProfileUseCase(actor.uid);
    const recipientName = `${recipient?.firstName ?? ''} ${recipient?.lastName ?? ''}`.trim();
    const { newTicket } = await transferTicketUseCase(
      { uid: link.fromUserId, admin: false },
      {
        ticketId: link.ticketId,
        toUserId: actor.uid,
        recipientEmail: recipient?.email ?? '',
        recipientName: recipientName || recipient?.username || undefined,
        receivedFrom: link.receivedFrom,
      }
    );
    await createNotificationUseCase({
      recipientPartnerId: link.fromUserId,
      type: 'admin_message',
      title: 'Ingresso entregue',
      message: recipient?.username
        ? `@${recipient.username} aceitou o ingresso que você enviou por link.`
        : 'O ingresso que você enviou por link foi aceito.',
    }).catch(() => undefined);
    return { ticketId: newTicket.id };
  } catch (error) {
    await releaseTicketTransferLinkUseCase(link.id).catch(() => undefined);
    throw error;
  }
}

=== server/application/usecases/ticketing/createTicketTransferLinkApplicationUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import {
  createTicketTransferLinkUseCase,
  type TicketingActorContext,
} from '../../../domain/ticketing';
import { getUserProfileUseCase } from '../../../domain/users';

/** Link de transferência (D21): grava de quem é o ingresso (@ e nome) para quem abrir o link ver. */
export async function createTicketTransferLinkApplicationUseCase(
  actor: TicketingActorContext,
  ticketId: string
): Promise<{ linkId: string; token: string; expiresAt: string }> {
  const sender = await getUserProfileUseCase(actor.uid);
  const senderName = `${sender?.firstName ?? ''} ${sender?.lastName ?? ''}`.trim();
  return createTicketTransferLinkUseCase(actor, ticketId, {
    username: sender?.username ?? null,
    displayName: senderName || null,
  });
}

=== server/domain/ticketing/adapters/firestoreTicketPrivacyStore.ts — diff ===
@@ -30,11 +30,12 @@ export class FirestoreTicketPrivacyStore {
     waitlist: number;
   }> {
     const at = new Date().toISOString();
-    const [orders, tickets, transfers, waitlist] = await Promise.all([
+    const [orders, tickets, transfers, waitlist, links] = await Promise.all([
       refsWhere('ticketOrders', 'buyerId', uid),
       refsWhere('tickets', 'ownerUserId', uid),
       refsWhere('ticketTransfers', 'toUserId', uid),
       refsWhere('eventWaitlistEntries', 'userId', uid),
+      refsWhere('ticketTransferLinks', 'fromUserId', uid),
     ]);
     await writeInBatches(orders, (batch, ref) =>
       batch.update(ref, { buyerSnapshot: { name: '', email: '' }, anonymizedAt: at })
@@ -50,6 +51,8 @@ export class FirestoreTicketPrivacyStore {
       })
     );
     await writeInBatches(waitlist, (batch, ref) => batch.delete(ref));
+    // Links guardam o @ e o nome de quem enviou: sem uso depois da exclusão (D21).
+    await writeInBatches(links, (batch, ref) => batch.delete(ref));
     return {
       orders: orders.length,
       tickets: tickets.length,

=== server/domain/ticketing/adapters/firestoreTicketingAdapter.ts — diff ===
@@ -8,6 +8,7 @@ import { FirestoreCheckInStore } from './firestoreCheckInStore';
 import { FirestoreRefundStore } from './firestoreRefundStore';
 import { FirestoreEngagementStore } from './firestoreEngagementStore';
 import { FirestoreTicketPrivacyStore } from './firestoreTicketPrivacyStore';
+import { FirestoreTransferLinkStore } from './firestoreTransferLinkStore';
 
 /** Implementação do `TicketingPort` no Firestore, composta pelos stores de cada parte do ticketing. */
 export class FirestoreTicketingAdapter implements TicketingPort {
@@ -20,6 +21,7 @@ export class FirestoreTicketingAdapter implements TicketingPort {
   private readonly refund = new FirestoreRefundStore();
   private readonly engagement = new FirestoreEngagementStore();
   private readonly privacy = new FirestoreTicketPrivacyStore();
+  private readonly transferLinks = new FirestoreTransferLinkStore();
 
   readonly createTicketType = this.ticketType.createTicketType.bind(this.ticketType);
   readonly getTicketTypeById = this.ticketType.getTicketTypeById.bind(this.ticketType);
@@ -62,6 +64,13 @@ export class FirestoreTicketingAdapter implements TicketingPort {
   readonly anonymizeUser = this.privacy.anonymizeUser.bind(this.privacy);
   readonly listTicketsChangedSince = this.ticket.listTicketsChangedSince.bind(this.ticket);
   readonly swapTicketQr = this.ticket.swapTicketQr.bind(this.ticket);
+  readonly createTransferLink = this.transferLinks.createTransferLink.bind(this.transferLinks);
+  readonly getTransferLink = this.transferLinks.getTransferLink.bind(this.transferLinks);
+  readonly claimTransferLink = this.transferLinks.claimTransferLink.bind(this.transferLinks);
+  readonly releaseTransferLink = this.transferLinks.releaseTransferLink.bind(this.transferLinks);
+  readonly cancelTransferLinksForTicket = this.transferLinks.cancelTransferLinksForTicket.bind(
+    this.transferLinks
+  );
   readonly countCheckInCodeFailures = this.checkIn.countCheckInCodeFailures.bind(this.checkIn);
   readonly addCheckInCodeFailure = this.checkIn.addCheckInCodeFailure.bind(this.checkIn);
   readonly listCheckInsByEventListingId = this.checkIn.listCheckInsByEventListingId.bind(

=== server/domain/ticketing/adapters/firestoreTransferLinkStore.ts — ARQUIVO NOVO, conteúdo completo ===
import { FieldValue } from 'firebase-admin/firestore';
import { adminDb } from '../../../infrastructure/firebase/adminClient';
import { TicketingDomainError } from '../errors/ticketingDomainError';
import type { TicketTransferLink } from '../types/ticketingTypes';

const LINKS = 'ticketTransferLinks';

function toLink(id: string, raw: Record<string, unknown>): TicketTransferLink {
  const from = (raw.receivedFrom ?? {}) as { username?: unknown; displayName?: unknown };
  return {
    id,
    ticketId: String(raw.ticketId ?? ''),
    fromUserId: String(raw.fromUserId ?? ''),
    tokenHash: String(raw.tokenHash ?? ''),
    status: raw.status === 'accepted' || raw.status === 'canceled' ? raw.status : 'pending',
    expiresAt: String(raw.expiresAt ?? ''),
    createdAt: String(raw.createdAt ?? ''),
    receivedFrom: {
      username: typeof from.username === 'string' ? from.username : null,
      displayName: typeof from.displayName === 'string' ? from.displayName : null,
    },
    ...(typeof raw.acceptedBy === 'string' ? { acceptedBy: raw.acceptedBy } : {}),
    ...(typeof raw.acceptedAt === 'string' ? { acceptedAt: raw.acceptedAt } : {}),
  };
}

/** Links de transferência (D21): coleção só do backend; o código do link fica só como HMAC. */
export class FirestoreTransferLinkStore {
  async createTransferLink(link: Omit<TicketTransferLink, 'id'>): Promise<TicketTransferLink> {
    const pending = await adminDb
      .collection(LINKS)
      .where('ticketId', '==', link.ticketId)
      .where('status', '==', 'pending')
      .get();
    const ref = adminDb.collection(LINKS).doc();
    await adminDb.runTransaction(async (tx) => {
      for (const doc of pending.docs) tx.update(doc.ref, { status: 'canceled' });
      tx.set(ref, link);
      tx.update(adminDb.collection('tickets').doc(link.ticketId), {
        transferLinkExpiresAt: link.expiresAt,
        updatedAt: link.createdAt,
      });
    });
    return { ...link, id: ref.id };
  }

  async getTransferLink(linkId: string): Promise<TicketTransferLink | null> {
    const snap = await adminDb.collection(LINKS).doc(linkId).get();
    return snap.exists ? toLink(snap.id, (snap.data() ?? {}) as Record<string, unknown>) : null;
  }

  async claimTransferLink(
    linkId: string,
    acceptorUid: string,
    nowIso: string
  ): Promise<TicketTransferLink> {
    return adminDb.runTransaction(async (tx) => {
      const ref = adminDb.collection(LINKS).doc(linkId);
      const snap = await tx.get(ref);
      if (!snap.exists) {
        throw new TicketingDomainError('TRANSFER_LINK_INVALID', 'Link de transferência inválido.');
      }
      const link = toLink(snap.id, (snap.data() ?? {}) as Record<string, unknown>);
      if (link.status !== 'pending') {
        throw new TicketingDomainError(
          'TRANSFER_LINK_INVALID',
          'Este link já foi usado ou cancelado.'
        );
      }
      if (link.expiresAt <= nowIso) {
        throw new TicketingDomainError('TRANSFER_LINK_EXPIRED', 'Este link venceu.');
      }
      tx.update(ref, { status: 'accepted', acceptedBy: acceptorUid, acceptedAt: nowIso });
      return { ...link, status: 'accepted', acceptedBy: acceptorUid, acceptedAt: nowIso };
    });
  }

  async releaseTransferLink(linkId: string): Promise<void> {
    await adminDb.collection(LINKS).doc(linkId).update({
      status: 'pending',
      acceptedBy: FieldValue.delete(),
      acceptedAt: FieldValue.delete(),
    });
  }

  async cancelTransferLinksForTicket(ticketId: string, ownerUid: string): Promise<void> {
    const pending = await adminDb
      .collection(LINKS)
      .where('ticketId', '==', ticketId)
      .where('fromUserId', '==', ownerUid)
      .where('status', '==', 'pending')
      .get();
    const batch = adminDb.batch();
    for (const doc of pending.docs) batch.update(doc.ref, { status: 'canceled' });
    batch.update(adminDb.collection('tickets').doc(ticketId), {
      transferLinkExpiresAt: FieldValue.delete(),
      updatedAt: new Date().toISOString(),
    });
    await batch.commit();
  }
}

=== server/domain/ticketing/controllers/ticketingController.ts — diff ===
@@ -66,7 +66,12 @@ function handleTicketingError(res: Response, error: unknown): Response {
       case 'TOO_MANY_REQUESTS':
         return res.status(429).json({ error: error.message });
       case 'TRANSFER_ONLY_TO_BUYER':
+      case 'TRANSFER_LINK_OWN':
         return res.status(422).json({ error: error.message });
+      case 'TRANSFER_LINK_INVALID':
+        return res.status(404).json({ error: error.message });
+      case 'TRANSFER_LINK_EXPIRED':
+        return res.status(410).json({ error: error.message });
       case 'SERVICE_UNAVAILABLE':
         return res.status(503).json({ error: error.message });
     }

=== server/domain/ticketing/dtos/ticketingPersistenceMappers.ts — diff ===
@@ -211,6 +211,9 @@ export class TicketPersistenceMapper {
       qrVersion:
         typeof raw.qrVersion === 'number' && raw.qrVersion >= 1 ? Math.trunc(raw.qrVersion) : 1,
       ...(typeof raw.qrSwappedAt === 'string' ? { qrSwappedAt: raw.qrSwappedAt } : {}),
+      ...(typeof raw.transferLinkExpiresAt === 'string'
+        ? { transferLinkExpiresAt: raw.transferLinkExpiresAt }
+        : {}),
       ...(raw.receivedFrom && typeof raw.receivedFrom === 'object'
         ? {
             receivedFrom: {

=== server/domain/ticketing/errors/ticketingDomainError.ts — diff ===
@@ -6,6 +6,9 @@ export type TicketingErrorCode =
   | 'UNPROCESSABLE_ENTITY'
   | 'TOO_MANY_REQUESTS'
   | 'TRANSFER_ONLY_TO_BUYER'
+  | 'TRANSFER_LINK_INVALID'
+  | 'TRANSFER_LINK_EXPIRED'
+  | 'TRANSFER_LINK_OWN'
   | 'SERVICE_UNAVAILABLE';
 
 export class TicketingDomainError extends Error {

=== server/domain/ticketing/factory.ts — diff ===
@@ -3,6 +3,7 @@ import { Ed25519TicketQrTokenAdapter } from './adapters/ed25519TicketQrTokenAdap
 import { CheckInService } from './services/checkInService';
 import { OfflineCheckInService } from './services/offlineCheckInService';
 import { TicketHolderService } from './services/ticketHolderService';
+import { TicketTransferLinkService } from './services/ticketTransferLinkService';
 import { TicketOrderService } from './services/ticketOrderService';
 import { TicketRefundService } from './services/ticketRefundService';
 import { TicketTypeService } from './services/ticketTypeService';
@@ -15,6 +16,7 @@ export const ticketTypeService = new TicketTypeService(ticketingAdapter);
 export const ticketOrderService = new TicketOrderService(ticketingAdapter);
 export const ticketRefundService = new TicketRefundService(ticketingAdapter);
 export const ticketHolderService = new TicketHolderService(ticketingAdapter);
+export const ticketTransferLinkService = new TicketTransferLinkService(ticketingAdapter);
 export const checkInService = new CheckInService(ticketingAdapter, ticketQrTokenAdapter);
 export const offlineCheckInService = new OfflineCheckInService(
   ticketingAdapter,

=== server/domain/ticketing/index.ts — diff ===
@@ -26,6 +26,12 @@ export { markTicketOrderDisputedUseCase } from './usecases/markTicketOrderDisput
 export { markTicketOrderPaymentFailedUseCase } from './usecases/markTicketOrderPaymentFailedUseCase';
 export { moveOrderToOccurrenceUseCase } from './usecases/moveOrderToOccurrenceUseCase';
 export { swapTicketQrUseCase } from './usecases/swapTicketQrUseCase';
+export { cancelTicketTransferLinkUseCase } from './usecases/cancelTicketTransferLinkUseCase';
+export { claimTicketTransferLinkUseCase } from './usecases/claimTicketTransferLinkUseCase';
+export { createTicketTransferLinkUseCase } from './usecases/createTicketTransferLinkUseCase';
+export { previewTicketTransferLinkUseCase } from './usecases/previewTicketTransferLinkUseCase';
+export { releaseTicketTransferLinkUseCase } from './usecases/releaseTicketTransferLinkUseCase';
+export type { TransferLinkPreview } from './services/ticketTransferLinkService';
 export { requestTicketRefundUseCase } from './usecases/requestTicketRefundUseCase';
 export { syncOfflineCheckInsUseCase } from './usecases/syncOfflineCheckInsUseCase';
 export { transferTicketUseCase } from './usecases/transferTicketUseCase';

=== server/domain/ticketing/ports/ticketingPort.ts — diff ===
@@ -1,5 +1,6 @@
 import type { TermsAcceptance } from '../../../shared/kernel/legalTerms';
 import type {
+  TicketTransferLink,
   EventCheckIn,
   EventPromoCode,
   EventWaitlistEntry,
@@ -145,6 +146,18 @@ export interface TicketingPort {
    * o titular e UNPROCESSABLE_ENTITY se o ingresso não está emitido ou já teve o QR trocado.
    */
   swapTicketQr(ticketId: string, ownerUid: string, nowIso: string): Promise<Ticket>;
+  /** Grava o link e cancela outro pendente do mesmo ingresso, em transação (D21). */
+  createTransferLink(link: Omit<TicketTransferLink, 'id'>): Promise<TicketTransferLink>;
+  getTransferLink(linkId: string): Promise<TicketTransferLink | null>;
+  /** Marca como aceito se ainda pendente e dentro da validade; senão lança TRANSFER_LINK_*. */
+  claimTransferLink(
+    linkId: string,
+    acceptorUid: string,
+    nowIso: string
+  ): Promise<TicketTransferLink>;
+  /** A transferência falhou depois do aceite: o link volta a valer até expirar. */
+  releaseTransferLink(linkId: string): Promise<void>;
+  cancelTransferLinksForTicket(ticketId: string, ownerUid: string): Promise<void>;
   listTicketsByEventListingId(eventListingId: string): Promise<Ticket[]>;
   updateTicketStatus(
     ticketId: string,

=== server/domain/ticketing/services/ticketHolderService.ts — diff ===
@@ -1,8 +1,4 @@
-import {
-  createEventAuditLogUseCase,
-  getEventListingByIdUseCase,
-  getEventOccurrenceByIdUseCase,
-} from '../../events';
+import { createEventAuditLogUseCase, getEventOccurrenceByIdUseCase } from '../../events';
 import { TicketingDomainError } from '../errors/ticketingDomainError';
 import type { TicketingPort } from '../ports/ticketingPort';
 import type {
@@ -17,6 +13,7 @@ import {
   getAuditActorType,
   type TicketingActorContext,
 } from './ticketingAccess';
+import { loadTransferContext } from './transferEligibility';
 
 /** Titularidade do ingresso: transferência, troca de sessão e lista de espera. */
 export class TicketHolderService {
@@ -51,47 +48,7 @@ export class TicketHolderService {
       throw new TicketingDomainError('NOT_FOUND', 'Ingresso não encontrado.');
     }
 
-    const [order, listing, occurrence] = await Promise.all([
-      this.port.getOrderById(ticket.orderId),
-      getEventListingByIdUseCase(ticket.eventListingId),
-      getEventOccurrenceByIdUseCase(ticket.occurrenceId),
-    ]);
-
-    const allowTransfer =
-      order?.salesPolicySnapshot.allowTicketTransfer ??
-      listing?.salesPolicy.allowTicketTransfer ??
-      true;
-
-    if (!allowTransfer) {
-      throw new TicketingDomainError(
-        'UNPROCESSABLE_ENTITY',
-        'A política deste evento não permite transferência de titularidade.'
-      );
-    }
-
-    if (occurrence) {
-      if (occurrence.status !== 'scheduled') {
-        throw new TicketingDomainError(
-          'UNPROCESSABLE_ENTITY',
-          'Não é possível transferir ingressos de uma sessão encerrada ou cancelada.'
-        );
-      }
-
-      const startsAtMs = new Date(occurrence.startsAt).getTime();
-      const nowMs = Date.now();
-      const cutoffHours =
-        order?.salesPolicySnapshot.ticketTransferCutoffHours ??
-        listing?.salesPolicy.ticketTransferCutoffHours ??
-        4;
-      const hoursUntilStart = (startsAtMs - nowMs) / (1000 * 60 * 60);
-      if (hoursUntilStart < cutoffHours) {
-        throw new TicketingDomainError(
-          'UNPROCESSABLE_ENTITY',
-          `O prazo limite para transferência de titularidade encerrou (${cutoffHours}h antes do início do evento).`
-        );
-      }
-    }
-
+    const { order } = await loadTransferContext(this.port, ticket);
     const recipient = this.resolveRecipient(ticket, order, params);
     const { rawQrToken, qrTokenHash } = generateOpaqueTicketQrToken();
     const res = await this.port.transferTicketAtomic({

=== server/domain/ticketing/services/ticketTransferLinkService.test.ts — ARQUIVO NOVO, conteúdo completo ===
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../events', () => ({
  getEventListingByIdUseCase: vi.fn().mockResolvedValue(null),
  getEventOccurrenceByIdUseCase: vi.fn().mockResolvedValue({
    status: 'scheduled',
    startsAt: '2026-12-20T23:00:00.000Z',
  }),
}));

import type { TicketingPort } from '../ports/ticketingPort';
import type { TicketTransferLink } from '../types/ticketingTypes';
import { TicketTransferLinkService } from './ticketTransferLinkService';

const NOW = new Date('2026-12-10T12:00:00.000Z').getTime();
const FROM = { username: 'ana', displayName: 'Ana Souza' };

function setup(ownerUserId = 'buyer') {
  const links = new Map<string, TicketTransferLink>();
  const port = {
    getTicketById: vi.fn().mockResolvedValue({
      id: 'tkt_1',
      orderId: 'ord_1',
      ownerUserId,
      status: 'issued',
      eventSnapshot: { title: 'Luau', startsAt: '2026-12-20T23:00:00.000Z' },
      ticketTypeSnapshot: { name: 'Pista' },
    }),
    getOrderById: vi.fn().mockResolvedValue({
      buyerId: 'buyer',
      salesPolicySnapshot: { allowTicketTransfer: true, ticketTransferCutoffHours: 4 },
    }),
    createTransferLink: vi.fn(async (link: Omit<TicketTransferLink, 'id'>) => {
      links.set('lnk_1', { ...link, id: 'lnk_1' });
      return { ...link, id: 'lnk_1' };
    }),
    getTransferLink: vi.fn(async (id: string) => links.get(id) ?? null),
    claimTransferLink: vi.fn(async (id: string) => links.get(id)),
  } as unknown as TicketingPort;
  let now = NOW;
  const service = new TicketTransferLinkService(port, () => now);
  return { port, links, service, setNow: (ms: number) => (now = ms) };
}

describe('link de transferência (D21)', () => {
  beforeEach(() => {
    process.env.TICKET_QR_SECRET = 'segredo-de-teste-com-mais-de-32-caracteres';
  });
  afterEach(() => {
    delete process.env.TICKET_QR_SECRET;
  });

  it('vale 30 min, guarda só o hash do código e mostra o ingresso a quem tem o link', async () => {
    const { service, links } = setup();
    const created = await service.create({ uid: 'buyer' }, 'tkt_1', FROM);
    expect(created.expiresAt).toBe('2026-12-10T12:30:00.000Z');
    expect(created.token.length).toBeGreaterThanOrEqual(40);
    expect(JSON.stringify([...links.values()])).not.toContain(created.token);
    await expect(service.preview('lnk_1', created.token)).resolves.toMatchObject({
      eventTitle: 'Luau',
      ticketType: 'Pista',
      from: FROM,
    });
  });

  it('código errado, link vencido e o próprio comprador são recusados', async () => {
    const { service, setNow } = setup();
    const { token } = await service.create({ uid: 'buyer' }, 'tkt_1', FROM);
    await expect(service.preview('lnk_1', 'x'.repeat(43))).rejects.toMatchObject({
      code: 'TRANSFER_LINK_INVALID',
    });
    await expect(service.claim('lnk_1', token, 'buyer')).rejects.toMatchObject({
      code: 'TRANSFER_LINK_OWN',
    });
    setNow(NOW + 31 * 60_000);
    await expect(service.claim('lnk_1', token, 'bruno')).rejects.toMatchObject({
      code: 'TRANSFER_LINK_EXPIRED',
    });
  });

  it('ingresso recebido não gera link; ingresso de outra pessoa também não', async () => {
    await expect(
      setup('bruno').service.create({ uid: 'bruno' }, 'tkt_1', FROM)
    ).rejects.toMatchObject({
      code: 'TRANSFER_ONLY_TO_BUYER',
    });
    await expect(setup().service.create({ uid: 'intruso' }, 'tkt_1', FROM)).rejects.toMatchObject({
      code: 'NOT_FOUND',
    });
  });
});

=== server/domain/ticketing/services/ticketTransferLinkService.ts — ARQUIVO NOVO, conteúdo completo ===
import { TicketingDomainError } from '../errors/ticketingDomainError';
import type { TicketingPort } from '../ports/ticketingPort';
import type { TicketTransferLink } from '../types/ticketingTypes';
import { generateTransferLinkToken, transferLinkTokenMatches } from '../utils/transferLinkToken';
import type { TicketingActorContext } from './ticketingAccess';
import { loadTransferContext } from './transferEligibility';

/** O link vale 30 min (D21): pouco tempo, porque quem tiver o link pode pegar o ingresso. */
export const TRANSFER_LINK_TTL_MS = 30 * 60 * 1000;

export interface TransferLinkPreview {
  eventTitle: string | null;
  startsAt: string | null;
  ticketType: string | null;
  from: TicketTransferLink['receivedFrom'];
  expiresAt: string;
}

/** Link de transferência para quem ainda não tem conta (D21): uso único, 30 min, só quem comprou gera. */
export class TicketTransferLinkService {
  constructor(
    private readonly port: TicketingPort,
    private readonly now: () => number = () => Date.now()
  ) {}

  async create(
    actor: TicketingActorContext,
    ticketId: string,
    receivedFrom: TicketTransferLink['receivedFrom']
  ): Promise<{ linkId: string; token: string; expiresAt: string }> {
    const ticket = await this.port.getTicketById(ticketId);
    if (!ticket || ticket.ownerUserId !== actor.uid) {
      throw new TicketingDomainError('NOT_FOUND', 'Ingresso não encontrado.');
    }
    if (ticket.status !== 'issued') {
      throw new TicketingDomainError(
        'UNPROCESSABLE_ENTITY',
        'Apenas ingressos emitidos e não utilizados podem ser transferidos.'
      );
    }
    const nowMs = this.now();
    const { order } = await loadTransferContext(this.port, ticket, nowMs);
    if (order && order.buyerId !== ticket.ownerUserId) {
      throw new TicketingDomainError(
        'TRANSFER_ONLY_TO_BUYER',
        'Ingresso recebido só pode ser devolvido para quem comprou.'
      );
    }
    const { token, tokenHash } = generateTransferLinkToken();
    const link = await this.port.createTransferLink({
      ticketId,
      fromUserId: actor.uid,
      tokenHash,
      status: 'pending',
      expiresAt: new Date(nowMs + TRANSFER_LINK_TTL_MS).toISOString(),
      createdAt: new Date(nowMs).toISOString(),
      receivedFrom,
    });
    return { linkId: link.id, token, expiresAt: link.expiresAt };
  }

  async preview(linkId: string, token: string): Promise<TransferLinkPreview> {
    const link = await this.validLink(linkId, token);
    const ticket = await this.port.getTicketById(link.ticketId);
    return {
      eventTitle: ticket?.eventSnapshot?.title ?? null,
      startsAt: ticket?.eventSnapshot?.startsAt ?? null,
      ticketType: ticket?.ticketTypeSnapshot?.name ?? null,
      from: link.receivedFrom,
      expiresAt: link.expiresAt,
    };
  }

  /** Reserva o link para quem aceitou; a transferência vem em seguida (camada de aplicação). */
  async claim(linkId: string, token: string, acceptorUid: string): Promise<TicketTransferLink> {
    const link = await this.validLink(linkId, token);
    if (link.fromUserId === acceptorUid) {
      throw new TicketingDomainError(
        'TRANSFER_LINK_OWN',
        'Este link é seu: envie para outra pessoa.'
      );
    }
    return this.port.claimTransferLink(linkId, acceptorUid, new Date(this.now()).toISOString());
  }

  release(linkId: string): Promise<void> {
    return this.port.releaseTransferLink(linkId);
  }

  cancel(actor: TicketingActorContext, ticketId: string): Promise<void> {
    return this.port.cancelTransferLinksForTicket(ticketId, actor.uid);
  }

  // Link inexistente e código errado dão a mesma resposta: não revela quais links existem.
  private async validLink(linkId: string, token: string): Promise<TicketTransferLink> {
    const link = await this.port.getTransferLink(linkId);
    if (!link || !transferLinkTokenMatches(token, link.tokenHash)) {
      throw new TicketingDomainError('TRANSFER_LINK_INVALID', 'Link de transferência inválido.');
    }
    if (link.status !== 'pending') {
      throw new TicketingDomainError(
        'TRANSFER_LINK_INVALID',
        'Este link já foi usado ou cancelado.'
      );
    }
    if (new Date(link.expiresAt).getTime() <= this.now()) {
      throw new TicketingDomainError('TRANSFER_LINK_EXPIRED', 'Este link venceu.');
    }
    return link;
  }
}

=== server/domain/ticketing/services/ticketingServices.test.ts — diff ===
@@ -180,6 +180,11 @@ describe('serviços de ticketing', () => {
       anonymizeUser: vi.fn(),
       listTicketsChangedSince: vi.fn().mockResolvedValue([]),
       swapTicketQr: vi.fn(),
+      createTransferLink: vi.fn(),
+      getTransferLink: vi.fn(),
+      claimTransferLink: vi.fn(),
+      releaseTransferLink: vi.fn(),
+      cancelTransferLinksForTicket: vi.fn(),
       countCheckInCodeFailures: vi.fn().mockResolvedValue(0),
       addCheckInCodeFailure: vi.fn().mockResolvedValue(undefined),
     };

=== server/domain/ticketing/services/transferEligibility.ts — ARQUIVO NOVO, conteúdo completo ===
import { getEventListingByIdUseCase, getEventOccurrenceByIdUseCase } from '../../events';
import { TicketingDomainError } from '../errors/ticketingDomainError';
import type { TicketingPort } from '../ports/ticketingPort';
import type { Ticket, TicketOrder } from '../types/ticketingTypes';

const HOUR_MS = 60 * 60 * 1000;
const DEFAULT_CUTOFF_HOURS = 4;

/**
 * Pedido, evento e sessão do ingresso, já conferindo se a transferência é permitida agora: política
 * do evento, sessão agendada e prazo antes do início. Usado pela transferência e pelo link (D21).
 */
export async function loadTransferContext(
  port: TicketingPort,
  ticket: Ticket,
  nowMs = Date.now()
): Promise<{ order: TicketOrder | null }> {
  const [order, listing, occurrence] = await Promise.all([
    port.getOrderById(ticket.orderId),
    getEventListingByIdUseCase(ticket.eventListingId),
    getEventOccurrenceByIdUseCase(ticket.occurrenceId),
  ]);

  const allowTransfer =
    order?.salesPolicySnapshot.allowTicketTransfer ??
    listing?.salesPolicy.allowTicketTransfer ??
    true;
  if (!allowTransfer) {
    throw new TicketingDomainError(
      'UNPROCESSABLE_ENTITY',
      'A política deste evento não permite transferência de titularidade.'
    );
  }

  if (occurrence) {
    if (occurrence.status !== 'scheduled') {
      throw new TicketingDomainError(
        'UNPROCESSABLE_ENTITY',
        'Não é possível transferir ingressos de uma sessão encerrada ou cancelada.'
      );
    }
    const cutoffHours =
      order?.salesPolicySnapshot.ticketTransferCutoffHours ??
      listing?.salesPolicy.ticketTransferCutoffHours ??
      DEFAULT_CUTOFF_HOURS;
    if ((new Date(occurrence.startsAt).getTime() - nowMs) / HOUR_MS < cutoffHours) {
      throw new TicketingDomainError(
        'UNPROCESSABLE_ENTITY',
        `O prazo limite para transferência de titularidade encerrou (${cutoffHours}h antes do início do evento).`
      );
    }
  }
  return { order: order ?? null };
}

=== server/domain/ticketing/types/ticketingTypes.ts — diff ===
@@ -180,6 +180,8 @@ export interface Ticket {
   qrSwappedAt?: string;
   /** Ingresso recebido por transferência: de quem veio (@ e nome públicos). Só volta para quem comprou (D21). */
   receivedFrom?: { username: string | null; displayName: string | null };
+  /** Link de transferência pendente (D21): até quando vale. */
+  transferLinkExpiresAt?: string;
   /** Última mudança: a lista sem internet da portaria baixa só o que mudou (D21). */
   updatedAt?: string;
   transferredAt?: string;
@@ -216,6 +218,21 @@ export interface Refund {
   completedAt?: string;
 }
 
+/** Link de transferência para quem ainda não tem conta (D21): 30 min, uso único. */
+export interface TicketTransferLink {
+  id: string;
+  ticketId: string;
+  fromUserId: string;
+  /** HMAC do código do link; o código em si nunca é gravado (§7.7). */
+  tokenHash: string;
+  status: 'pending' | 'accepted' | 'canceled';
+  expiresAt: string;
+  createdAt: string;
+  receivedFrom: { username: string | null; displayName: string | null };
+  acceptedBy?: string;
+  acceptedAt?: string;
+}
+
 export interface TicketTransfer {
   id: string;
   ticketId: string;

=== server/domain/ticketing/usecases/cancelTicketTransferLinkUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { ticketTransferLinkService } from '../factory';
import type { TicketingActorContext } from '../services/ticketingAccess';

export function cancelTicketTransferLinkUseCase(actor: TicketingActorContext, ticketId: string) {
  return ticketTransferLinkService.cancel(actor, ticketId);
}

=== server/domain/ticketing/usecases/claimTicketTransferLinkUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { ticketTransferLinkService } from '../factory';

/** Reserva o link para quem aceitou; quem chama faz a transferência e libera se ela falhar (D21). */
export function claimTicketTransferLinkUseCase(linkId: string, token: string, acceptorUid: string) {
  return ticketTransferLinkService.claim(linkId, token, acceptorUid);
}

=== server/domain/ticketing/usecases/createTicketTransferLinkUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { ticketTransferLinkService } from '../factory';
import type { TicketingActorContext } from '../services/ticketingAccess';
import type { TicketTransferLink } from '../types/ticketingTypes';

/** Link de transferência (D21): 30 min, uso único, só para ingresso de quem comprou. */
export function createTicketTransferLinkUseCase(
  actor: TicketingActorContext,
  ticketId: string,
  receivedFrom: TicketTransferLink['receivedFrom']
) {
  return ticketTransferLinkService.create(actor, ticketId, receivedFrom);
}

=== server/domain/ticketing/usecases/previewTicketTransferLinkUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { ticketTransferLinkService } from '../factory';

/** O que o link entrega (evento, tipo de ingresso, de quem), antes de aceitar (D21). */
export function previewTicketTransferLinkUseCase(linkId: string, token: string) {
  return ticketTransferLinkService.preview(linkId, token);
}

=== server/domain/ticketing/usecases/releaseTicketTransferLinkUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { ticketTransferLinkService } from '../factory';

export function releaseTicketTransferLinkUseCase(linkId: string) {
  return ticketTransferLinkService.release(linkId);
}

=== server/domain/ticketing/utils/transferLinkToken.ts — ARQUIVO NOVO, conteúdo completo ===
import crypto from 'crypto';
import { listTicketQrTokenLookupHashes } from './qrToken';

// Separa o HMAC do link do HMAC do QR, mesmo usando a mesma chave do Secret Manager.
const PURPOSE = 'transfer-link:';

/** Código do link: 256 bits aleatórios (§7.7); vai depois do `#` da URL, fora dos logs do servidor (§7.9). */
export function generateTransferLinkToken(): { token: string; tokenHash: string } {
  const token = crypto.randomBytes(32).toString('base64url');
  const [tokenHash] = listTicketQrTokenLookupHashes(`${PURPOSE}${token}`);
  return { token, tokenHash: tokenHash ?? '' };
}

/** Confere o código com o hash gravado, com a chave atual ou, na rotação, a anterior (§7.8). */
export function transferLinkTokenMatches(token: string, tokenHash: string): boolean {
  const expected = Buffer.from(tokenHash);
  return listTicketQrTokenLookupHashes(`${PURPOSE}${token}`).some((candidate) => {
    const received = Buffer.from(candidate);
    return received.length === expected.length && crypto.timingSafeEqual(received, expected);
  });
}

=== server/interfaces/http/ticketTransfers/ticketTransferController.ts — diff ===
@@ -3,11 +3,21 @@ import {
   TicketTransferError,
   transferTicketToUsernameApplicationUseCase,
 } from '../../../application/usecases/ticketing/transferTicketToUsernameApplicationUseCase';
+import { acceptTicketTransferLinkApplicationUseCase } from '../../../application/usecases/ticketing/acceptTicketTransferLinkApplicationUseCase';
+import { createTicketTransferLinkApplicationUseCase } from '../../../application/usecases/ticketing/createTicketTransferLinkApplicationUseCase';
 import { returnTicketToBuyerApplicationUseCase } from '../../../application/usecases/ticketing/returnTicketToBuyerApplicationUseCase';
-import { TicketingDomainError } from '../../../domain/ticketing';
+import {
+  TicketingDomainError,
+  cancelTicketTransferLinkUseCase,
+  previewTicketTransferLinkUseCase,
+} from '../../../domain/ticketing';
 import { UsernameError } from '../../../domain/users';
 import type { AuthenticatedRequest } from '../../../infrastructure/auth/authenticatedRequest';
-import { ticketReturnSchema, ticketTransferSchema } from './ticketTransferSchema';
+import {
+  ticketReturnSchema,
+  ticketTransferSchema,
+  transferLinkTokenSchema,
+} from './ticketTransferSchema';
 
 const TICKETING_STATUS: Record<TicketingDomainError['code'], number> = {
   INVALID_ARGUMENT: 400,
@@ -17,6 +27,9 @@ const TICKETING_STATUS: Record<TicketingDomainError['code'], number> = {
   UNPROCESSABLE_ENTITY: 422,
   TOO_MANY_REQUESTS: 429,
   TRANSFER_ONLY_TO_BUYER: 422,
+  TRANSFER_LINK_INVALID: 404,
+  TRANSFER_LINK_EXPIRED: 410,
+  TRANSFER_LINK_OWN: 422,
   SERVICE_UNAVAILABLE: 503,
 };
 
@@ -76,4 +89,67 @@ export class TicketTransferController {
       return sendTransferError(res, error, 'returnToBuyer');
     }
   }
+
+  static async createLink(req: AuthenticatedRequest, res: Response): Promise<Response> {
+    const uid = req.user?.uid;
+    if (!uid) return sendError(res, 401, 'UNAUTHENTICATED', 'Faça login.');
+    const parsed = ticketReturnSchema.safeParse(req.body);
+    if (!parsed.success) return sendError(res, 400, 'VALIDATION_ERROR', 'Dados inválidos.');
+    try {
+      const link = await createTicketTransferLinkApplicationUseCase(
+        { uid, admin: req.user?.admin === true },
+        parsed.data.ticketId
+      );
+      // O código do link só sai nesta resposta; não pode ficar em cache.
+      res.setHeader('Cache-Control', 'no-store');
+      return res.status(201).json(link);
+    } catch (error) {
+      return sendTransferError(res, error, 'createLink');
+    }
+  }
+
+  static async cancelLink(req: AuthenticatedRequest, res: Response): Promise<Response> {
+    const uid = req.user?.uid;
+    if (!uid) return sendError(res, 401, 'UNAUTHENTICATED', 'Faça login.');
+    const parsed = ticketReturnSchema.safeParse({ ticketId: req.params.ticketId });
+    if (!parsed.success) return sendError(res, 400, 'VALIDATION_ERROR', 'Dados inválidos.');
+    try {
+      await cancelTicketTransferLinkUseCase({ uid, admin: false }, parsed.data.ticketId);
+      return res.status(204).send();
+    } catch (error) {
+      return sendTransferError(res, error, 'cancelLink');
+    }
+  }
+
+  static async previewLink(req: AuthenticatedRequest, res: Response): Promise<Response> {
+    if (!req.user?.uid) return sendError(res, 401, 'UNAUTHENTICATED', 'Faça login.');
+    const parsed = transferLinkTokenSchema.safeParse(req.body);
+    if (!parsed.success) return sendError(res, 404, 'TRANSFER_LINK_INVALID', 'Link inválido.');
+    try {
+      return res
+        .status(200)
+        .json(
+          await previewTicketTransferLinkUseCase(String(req.params.linkId ?? ''), parsed.data.token)
+        );
+    } catch (error) {
+      return sendTransferError(res, error, 'previewLink');
+    }
+  }
+
+  static async acceptLink(req: AuthenticatedRequest, res: Response): Promise<Response> {
+    const uid = req.user?.uid;
+    if (!uid) return sendError(res, 401, 'UNAUTHENTICATED', 'Faça login.');
+    const parsed = transferLinkTokenSchema.safeParse(req.body);
+    if (!parsed.success) return sendError(res, 404, 'TRANSFER_LINK_INVALID', 'Link inválido.');
+    try {
+      const result = await acceptTicketTransferLinkApplicationUseCase(
+        { uid, emailVerified: req.user?.emailVerified === true },
+        String(req.params.linkId ?? ''),
+        parsed.data.token
+      );
+      return res.status(200).json(result);
+    } catch (error) {
+      return sendTransferError(res, error, 'acceptLink');
+    }
+  }
 }

=== server/interfaces/http/ticketTransfers/ticketTransferRoutes.ts — diff ===
@@ -22,3 +22,27 @@ ticketTransferRouter.post(
   rateLimitByUser('ticket-transfer', 20, 60 * 60_000),
   TicketTransferController.returnToBuyer
 );
+ticketTransferRouter.post(
+  '/links',
+  verifyAuthTokenStrict,
+  rateLimitByUser('ticket-transfer', 20, 60 * 60_000),
+  TicketTransferController.createLink
+);
+ticketTransferRouter.delete(
+  '/links/by-ticket/:ticketId',
+  verifyAuthToken,
+  TicketTransferController.cancelLink
+);
+// Abrir e aceitar link com limite por conta contra tentativas de adivinhar o código (§7.4).
+ticketTransferRouter.post(
+  '/links/:linkId/preview',
+  verifyAuthToken,
+  rateLimitByUser('transfer-link-open', 30, 10 * 60_000),
+  TicketTransferController.previewLink
+);
+ticketTransferRouter.post(
+  '/links/:linkId/accept',
+  verifyAuthTokenStrict,
+  rateLimitByUser('transfer-link-open', 30, 10 * 60_000),
+  TicketTransferController.acceptLink
+);

=== server/interfaces/http/ticketTransfers/ticketTransferSchema.ts — diff ===
@@ -10,3 +10,7 @@ export const ticketTransferSchema = z
 export const ticketReturnSchema = z
   .object({ ticketId: z.string().trim().min(1).max(128) })
   .strict();
+
+export const transferLinkTokenSchema = z
+  .object({ token: z.string().trim().min(20).max(100) })
+  .strict();

=== src/app/App.tsx — ARQUIVO REESCRITO, substitua todo o conteúdo por este ===
import { AppProviders } from './AppProviders';
import { AppRouter } from './AppRouter';
import { TransferLinkReceiver } from './TransferLinkReceiver';
import { UsernameGate } from './UsernameGate';
import { ErrorBoundary } from './ErrorBoundary';
import { LocalePreference } from './locale/LocalePreference';

export default function App() {
  return (
    <ErrorBoundary>
      <AppProviders>
        <AppRouter />
        <UsernameGate />
        <TransferLinkReceiver />
        <LocalePreference />
      </AppProviders>
    </ErrorBoundary>
  );
}

=== src/app/TransferLinkReceiver.tsx — ARQUIVO NOVO, conteúdo completo ===
import { useEffect, useState } from 'react';
import { useAuthContext } from '../domain/auth';
import { parseTransferLinkHash, TransferLinkReceiverDialog } from '../domain/ticketing';
import { useUI } from '../shared/stores/useUIStore';
import { useSideMenu } from './menu/useSideMenu';

const STORAGE_KEY = 'useguide.transferLink';

function readStored(): { linkId: string; token: string } | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as { linkId: string; token: string }) : null;
  } catch {
    return null;
  }
}

function store(link: { linkId: string; token: string } | null) {
  try {
    if (link) sessionStorage.setItem(STORAGE_KEY, JSON.stringify(link));
    else sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // Sem armazenamento, o link só vale enquanto a página estiver aberta.
  }
}

/**
 * Link de transferência aberto (D21): guarda o código na sessão e tira da barra de endereço, para
 * sobreviver ao login e à criação da conta (inclusive a escolha do @) sem ficar à vista.
 */
export function TransferLinkReceiver() {
  const { user, profile, loading } = useAuthContext();
  const { openLoginModal } = useUI();
  const { openMenu } = useSideMenu();
  const [link, setLink] = useState(readStored);

  useEffect(() => {
    const fromHash = parseTransferLinkHash(window.location.hash);
    if (!fromHash) return;
    store(fromHash);
    setLink(fromHash);
    window.history.replaceState(
      window.history.state,
      '',
      window.location.pathname + window.location.search
    );
  }, []);

  const close = () => {
    store(null);
    setLink(null);
  };

  const loggedIn = Boolean(user && !user.isAnonymous);
  // Conta nova escolhe o @ antes (UsernameGate); o link espera.
  if (!link || loading || (loggedIn && !profile?.username)) return null;

  return (
    <TransferLinkReceiverDialog
      link={link}
      loggedIn={loggedIn}
      onLogin={openLoginModal}
      onAccepted={() => {
        close();
        openMenu('tickets');
      }}
      onClose={close}
    />
  );
}

=== src/app/UsernameGate.test.tsx — ARQUIVO NOVO, conteúdo completo ===
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

const auth = vi.hoisted(() => ({
  value: {
    user: { uid: 'u1', isAnonymous: false } as unknown,
    profile: { firstName: 'Ana', username: null } as unknown,
    loading: false,
    refreshProfile: vi.fn(),
  },
}));

vi.mock('../domain/auth', () => ({
  useAuthContext: () => auth.value,
  logoutUseCase: vi.fn(),
}));
vi.mock('../domain/user', () => ({
  UsernameOnboardingDialog: () => <div>escolha-do-arroba</div>,
}));

import { UsernameGate } from './UsernameGate';

describe('@ obrigatório (D21)', () => {
  it('pede o @ para conta logada com nome salvo e sem @', () => {
    render(<UsernameGate />);
    expect(screen.getByText('escolha-do-arroba')).toBeTruthy();
  });

  it('não pede para quem já tem @, sem login ou antes do nome ser salvo', () => {
    auth.value = { ...auth.value, profile: { firstName: 'Ana', username: 'ana' } };
    const { rerender } = render(<UsernameGate />);
    expect(screen.queryByText('escolha-do-arroba')).toBeNull();
    auth.value = { ...auth.value, profile: { firstName: '', username: null } };
    rerender(<UsernameGate />);
    expect(screen.queryByText('escolha-do-arroba')).toBeNull();
    auth.value = { ...auth.value, user: null };
    rerender(<UsernameGate />);
    expect(screen.queryByText('escolha-do-arroba')).toBeNull();
  });
});

=== src/app/UsernameGate.tsx — ARQUIVO NOVO, conteúdo completo ===
import { logoutUseCase, useAuthContext } from '../domain/auth';
import { UsernameOnboardingDialog } from '../domain/user';

/**
 * Toda conta logada precisa de @ (D21): logo depois de criar a conta (e-mail ou Google) e para
 * contas antigas sem @, o app pede a escolha antes de seguir. Junta auth e user, por isso fica no app.
 */
export function UsernameGate() {
  const { user, profile, loading, refreshProfile } = useAuthContext();
  // Espera o nome do cadastro (e-mail ou Google) estar salvo: a sugestão do @ vem dele.
  if (loading || !user || user.isAnonymous || !profile?.firstName || profile.username) return null;
  return (
    <UsernameOnboardingDialog
      onDone={() => void refreshProfile()}
      onSignOut={() => void logoutUseCase()}
    />
  );
}

=== src/domain/ticketing/adapters/httpTicketingAdapter.ts — diff ===
@@ -13,6 +13,8 @@ import type {
   Refund,
   Ticket,
   TicketQrPass,
+  TicketTransferLinkCreated,
+  TicketTransferLinkPreview,
   OfflineCheckInChanges,
   TicketOrder,
   TicketOrderItem,
@@ -27,6 +29,28 @@ async function parseJsonOrThrow<T>(response: Response, fallbackError: string): P
   return (body?.data ?? body) as T;
 }
 
+/** Rotas de transferência: erro vira `Error(code)` para a tela traduzir (§12.5). */
+async function transferCall<T>(
+  path: string,
+  method: 'POST' | 'DELETE',
+  body?: unknown
+): Promise<T> {
+  const res = await firebaseApiFetch(
+    path,
+    {
+      method,
+      ...(body
+        ? { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }
+        : {}),
+    },
+    { requireAuth: true }
+  );
+  if (res.status === 204) return undefined as T;
+  const json = await res.json().catch(() => ({}));
+  if (!res.ok) throw new Error(json?.error?.code || 'INTERNAL_ERROR');
+  return json as T;
+}
+
 export class HttpTicketingAdapter implements TicketingPort {
   async listPublicTicketTypes(occurrenceId: string): Promise<PublicTicketTypeProjection[]> {
     const res = await firebaseApiFetch(
@@ -233,6 +257,33 @@ export class HttpTicketingAdapter implements TicketingPort {
     return parseJsonOrThrow<OfflineCheckInChanges>(res, 'Não foi possível atualizar a lista.');
   }
 
+  async createTransferLink(ticketId: string): Promise<TicketTransferLinkCreated> {
+    return transferCall('/api/ticket-transfers/links', 'POST', { ticketId });
+  }
+
+  async cancelTransferLink(ticketId: string): Promise<void> {
+    await transferCall(
+      `/api/ticket-transfers/links/by-ticket/${encodeURIComponent(ticketId)}`,
+      'DELETE'
+    );
+  }
+
+  async previewTransferLink(linkId: string, token: string): Promise<TicketTransferLinkPreview> {
+    return transferCall(
+      `/api/ticket-transfers/links/${encodeURIComponent(linkId)}/preview`,
+      'POST',
+      { token }
+    );
+  }
+
+  async acceptTransferLink(linkId: string, token: string): Promise<{ ticketId: string }> {
+    return transferCall(
+      `/api/ticket-transfers/links/${encodeURIComponent(linkId)}/accept`,
+      'POST',
+      { token }
+    );
+  }
+
   async returnTicketToBuyer(ticketId: string): Promise<{ ticketId: string }> {
     const res = await firebaseApiFetch(
       '/api/ticket-transfers/return',

=== src/domain/ticketing/application/usecases/acceptTransferLinkUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { ticketingAdapter } from '../../factory';

export function acceptTransferLinkUseCase(linkId: string, token: string) {
  return ticketingAdapter.acceptTransferLink(linkId, token);
}

=== src/domain/ticketing/application/usecases/cancelTransferLinkUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { ticketingAdapter } from '../../factory';

export function cancelTransferLinkUseCase(ticketId: string) {
  return ticketingAdapter.cancelTransferLink(ticketId);
}

=== src/domain/ticketing/application/usecases/createTransferLinkUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { ticketingAdapter } from '../../factory';

export function createTransferLinkUseCase(ticketId: string) {
  return ticketingAdapter.createTransferLink(ticketId);
}

=== src/domain/ticketing/application/usecases/previewTransferLinkUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { ticketingAdapter } from '../../factory';

export function previewTransferLinkUseCase(linkId: string, token: string) {
  return ticketingAdapter.previewTransferLink(linkId, token);
}

=== src/domain/ticketing/components/UserTicketsHistoryView.tsx — diff ===
@@ -130,6 +130,7 @@ export function UserTicketsHistoryView({ onBack }: UserTicketsHistoryViewProps =
           ticket={actions.transferTicket}
           onSubmit={actions.submitTransfer}
           onReturn={actions.submitReturn}
+          onLinkChanged={actions.reloadWallet}
           onCancel={() => actions.setTransferTicket(null)}
         />
       )}

=== src/domain/ticketing/components/wallet/TransferLinkPanel.tsx — ARQUIVO NOVO, conteúdo completo ===
import { Copy, Link2, Share2 } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { formatBusinessDateTime } from '../../../../shared/utils/businessDateTime';
import { StatusText } from '../../../../ui/components/StatusText';
import { TextButton } from '../../../../ui/components/TextButton';
import { BUTTON_PRIMARY, BUTTON_SECONDARY } from '../../../../ui/styles/controls';
import { cancelTransferLinkUseCase } from '../../application/usecases/cancelTransferLinkUseCase';
import { createTransferLinkUseCase } from '../../application/usecases/createTransferLinkUseCase';
import type { Ticket } from '../../types/ticketing';
import { buildTransferLinkUrl } from '../../utils/transferLinkUrl';

const KNOWN_ERRORS = ['RATE_LIMITED', 'TRANSFER_ONLY_TO_BUYER'];

/**
 * Link de transferência para quem ainda não tem conta (D21): vale 30 min e uma vez só. O código
 * aparece só agora; o ingresso continua com quem comprou até alguém aceitar.
 */
export function TransferLinkPanel({
  ticket,
  onChanged,
}: {
  ticket: Ticket;
  onChanged: () => Promise<void> | void;
}) {
  const { t, i18n } = useTranslation();
  const [url, setUrl] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(
    ticket.transferLinkExpiresAt && new Date(ticket.transferLinkExpiresAt) > new Date()
      ? ticket.transferLinkExpiresAt
      : null
  );
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<{ tone: 'success' | 'danger'; message: string } | null>(
    null
  );
  const time = (iso: string) => formatBusinessDateTime(iso, i18n.language);

  const run = async (action: () => Promise<void>) => {
    setBusy(true);
    setStatus(null);
    try {
      await action();
    } catch (err: unknown) {
      const code =
        err instanceof Error && KNOWN_ERRORS.includes(err.message) ? err.message : 'failed';
      setStatus({ tone: 'danger', message: t(`username.transfer.errors.${code}`) });
    } finally {
      setBusy(false);
    }
  };

  const create = () =>
    run(async () => {
      const link = await createTransferLinkUseCase(ticket.id);
      setUrl(buildTransferLinkUrl(window.location.origin, link.linkId, link.token));
      setExpiresAt(link.expiresAt);
      await onChanged();
    });

  const cancel = () =>
    run(async () => {
      await cancelTransferLinkUseCase(ticket.id);
      setUrl(null);
      setExpiresAt(null);
      await onChanged();
    });

  const share = async () => {
    if (!url) return;
    const text = t('username.transfer.link.shareText', {
      event: ticket.eventSnapshot?.title ?? '',
    });
    if (navigator.share) {
      await navigator.share({ text, url }).catch(() => undefined);
      return;
    }
    await copy();
  };

  const copy = async () => {
    if (!url) return;
    await navigator.clipboard
      ?.writeText(url)
      .then(() => setStatus({ tone: 'success', message: t('username.transfer.link.copied') }))
      .catch(() => undefined);
  };

  return (
    <div className="space-y-3 p-3 rounded-2xl bg-ink/[0.04]">
      <p className="flex items-center gap-2 text-[13px] font-semibold text-ink">
        <Link2 size={16} aria-hidden="true" />
        {t('username.transfer.link.title')}
      </p>
      {url ? (
        <>
          <p className="text-[13px] text-ink/70">
            {t('username.transfer.link.ready', { time: expiresAt ? time(expiresAt) : '' })}
          </p>
          <p className="text-[12px] text-ink/70 break-all select-all p-2 rounded-xl bg-surface border border-line">
            {url}
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => void share()}
              className={`${BUTTON_PRIMARY} inline-flex items-center justify-center gap-1.5`}
            >
              <Share2 size={16} aria-hidden="true" />
              {t('username.transfer.link.share')}
            </button>
            <button
              type="button"
              onClick={() => void copy()}
              className={`${BUTTON_SECONDARY} inline-flex items-center justify-center gap-1.5`}
            >
              <Copy size={16} aria-hidden="true" />
              {t('username.transfer.link.copy')}
            </button>
          </div>
        </>
      ) : expiresAt ? (
        <p className="text-[13px] text-ink/70">
          {t('username.transfer.link.pending', { time: time(expiresAt) })}
        </p>
      ) : (
        <>
          <p className="text-[13px] text-ink/70">{t('username.transfer.link.hint')}</p>
          <button
            type="button"
            disabled={busy}
            onClick={() => void create()}
            className={`${BUTTON_SECONDARY} w-full`}
          >
            {t('username.transfer.link.create')}
          </button>
        </>
      )}
      {status && (
        <p role="status">
          <StatusText tone={status.tone}>{status.message}</StatusText>
        </p>
      )}
      {(url || expiresAt) && (
        <div className="flex justify-center">
          <TextButton tone="danger" disabled={busy} onClick={() => void cancel()}>
            {t('username.transfer.link.cancel')}
          </TextButton>
        </div>
      )}
    </div>
  );
}

=== src/domain/ticketing/components/wallet/TransferLinkReceiverDialog.tsx — ARQUIVO NOVO, conteúdo completo ===
import { Ticket as TicketIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { formatBusinessDateTime } from '../../../../shared/utils/businessDateTime';
import { Dialog } from '../../../../ui/components/Dialog';
import { StatusText } from '../../../../ui/components/StatusText';
import { TextButton } from '../../../../ui/components/TextButton';
import { BUTTON_PRIMARY } from '../../../../ui/styles/controls';
import { acceptTransferLinkUseCase } from '../../application/usecases/acceptTransferLinkUseCase';
import { previewTransferLinkUseCase } from '../../application/usecases/previewTransferLinkUseCase';
import type { TicketTransferLinkPreview } from '../../types/ticketing';

const KNOWN_ERRORS = [
  'TRANSFER_LINK_INVALID',
  'TRANSFER_LINK_EXPIRED',
  'TRANSFER_LINK_OWN',
  'RECIPIENT_NOT_VERIFIED',
  'RATE_LIMITED',
];

function errorCode(err: unknown): string {
  return err instanceof Error && KNOWN_ERRORS.includes(err.message) ? err.message : 'failed';
}

/**
 * Quem abriu um link de transferência (D21): sem login, pede para entrar ou criar a conta; com
 * login, mostra o ingresso e de quem vem antes de aceitar.
 */
export function TransferLinkReceiverDialog({
  link,
  loggedIn,
  onLogin,
  onAccepted,
  onClose,
}: {
  link: { linkId: string; token: string };
  loggedIn: boolean;
  onLogin: () => void;
  onAccepted: () => void;
  onClose: () => void;
}) {
  const { t, i18n } = useTranslation();
  const [preview, setPreview] = useState<TicketTransferLinkPreview | null>(null);
  const [errorKey, setErrorKey] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [accepted, setAccepted] = useState(false);

  const error = errorKey ? t(`username.transfer.link.errors.${errorKey}`) : null;

  useEffect(() => {
    if (!loggedIn) return;
    setErrorKey(null);
    void previewTransferLinkUseCase(link.linkId, link.token)
      .then(setPreview)
      .catch((err: unknown) => setErrorKey(errorCode(err)));
  }, [link.linkId, link.token, loggedIn]);

  const accept = async () => {
    setBusy(true);
    setErrorKey(null);
    try {
      await acceptTransferLinkUseCase(link.linkId, link.token);
      setAccepted(true);
    } catch (err: unknown) {
      setErrorKey(errorCode(err));
    } finally {
      setBusy(false);
    }
  };

  const fromLabel = preview?.from.username
    ? `@${preview.from.username}`
    : (preview?.from.displayName ?? '');

  return (
    <Dialog
      open
      onOpenChange={(open) => !open && onClose()}
      title={t('username.transfer.link.receiveTitle')}
    >
      <div className="space-y-4">
        {!loggedIn ? (
          <>
            <p className="text-[13px] text-ink/70">{t('username.transfer.link.loginHint')}</p>
            <button type="button" onClick={onLogin} className={`${BUTTON_PRIMARY} w-full`}>
              {t('username.transfer.link.login')}
            </button>
          </>
        ) : accepted ? (
          <>
            <StatusText tone="success">{t('username.transfer.link.accepted')}</StatusText>
            <button type="button" onClick={onAccepted} className={`${BUTTON_PRIMARY} w-full`}>
              {t('username.transfer.link.seeTickets')}
            </button>
          </>
        ) : preview ? (
          <>
            <div className="flex items-start gap-3 p-3 rounded-2xl bg-ink/[0.04]">
              <span className="w-11 h-11 shrink-0 rounded-xl bg-accent-soft text-accent flex items-center justify-center">
                <TicketIcon size={20} aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="text-[15px] font-semibold text-ink break-words">
                  {preview.eventTitle}
                </p>
                <p className="text-[13px] text-ink/70">
                  {[
                    preview.ticketType,
                    preview.startsAt && formatBusinessDateTime(preview.startsAt, i18n.language),
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                </p>
              </div>
            </div>
            <p className="text-[13px] text-ink/70">
              {t('username.transfer.link.from', {
                name: fromLabel,
                time: formatBusinessDateTime(preview.expiresAt, i18n.language),
              })}
            </p>
            {error && (
              <p role="alert">
                <StatusText tone="danger">{error}</StatusText>
              </p>
            )}
            <button
              type="button"
              disabled={busy}
              onClick={() => void accept()}
              className={`${BUTTON_PRIMARY} w-full`}
            >
              {t('username.transfer.link.accept')}
            </button>
            <div className="flex justify-center">
              <TextButton tone="ink" onClick={onClose}>
                {t('username.transfer.link.decline')}
              </TextButton>
            </div>
          </>
        ) : error ? (
          <p role="alert">
            <StatusText tone="danger">{error}</StatusText>
          </p>
        ) : (
          <div className="h-24 rounded-2xl bg-ink/[0.04] animate-pulse motion-reduce:animate-none" />
        )}
      </div>
    </Dialog>
  );
}

=== src/domain/ticketing/components/wallet/TransferTicketForm.tsx — diff ===
@@ -5,6 +5,7 @@ import { TextButton } from '../../../../ui/components/TextButton';
 import { BUTTON_PRIMARY, BUTTON_SECONDARY } from '../../../../ui/styles/controls';
 import { findUserByUsernameUseCase, type UsernameProfile } from '../../../user';
 import type { Ticket } from '../../types/ticketing';
+import { TransferLinkPanel } from './TransferLinkPanel';
 
 const KNOWN_ERRORS = [
   'USERNAME_NOT_FOUND',
@@ -20,6 +21,8 @@ interface TransferTicketFormProps {
   /** Ingresso recebido: só volta para quem comprou (D21). */
   onReturn: () => Promise<void>;
   onCancel: () => void;
+  /** Recarrega a carteira depois de criar ou cancelar o link. */
+  onLinkChanged: () => Promise<void> | void;
 }
 
 /** Transferência pelo @ (D21): procura a conta, mostra foto, nome e @ e só então transfere. */
@@ -28,6 +31,7 @@ export function TransferTicketForm({
   onSubmit,
   onReturn,
   onCancel,
+  onLinkChanged,
 }: TransferTicketFormProps) {
   const { t } = useTranslation();
   const inputId = useId();
@@ -35,10 +39,15 @@ export function TransferTicketForm({
   const [recipient, setRecipient] = useState<UsernameProfile | null>(null);
   const [busy, setBusy] = useState(false);
   const [error, setError] = useState<string | null>(null);
+  // @ não encontrado ou link já pendente: oferece o link para quem ainda não tem conta (D21).
+  const [showLink, setShowLink] = useState(
+    Boolean(ticket.transferLinkExpiresAt && new Date(ticket.transferLinkExpiresAt) > new Date())
+  );
 
   const fail = (err: unknown) => {
     const code =
       err instanceof Error && KNOWN_ERRORS.includes(err.message) ? err.message : 'failed';
+    if (code === 'USERNAME_NOT_FOUND') setShowLink(true);
     setError(t(`username.transfer.errors.${code}`));
   };
 
@@ -218,6 +227,7 @@ export function TransferTicketForm({
           </div>
         </form>
       )}
+      {showLink && <TransferLinkPanel ticket={ticket} onChanged={onLinkChanged} />}
     </section>
   );
 }

=== src/domain/ticketing/components/wallet/WalletTicketCard.tsx — diff ===
@@ -73,6 +73,11 @@ export function WalletTicketCard({
         </span>
       </div>
 
+      {ticket.transferLinkExpiresAt && new Date(ticket.transferLinkExpiresAt) > new Date() && (
+        <p className="text-[13px] text-warn">
+          {t('username.transfer.link.pending', { time: formatDate(ticket.transferLinkExpiresAt) })}
+        </p>
+      )}
       {qr && (
         <div className="space-y-3">
           <div className="mx-auto w-full max-w-[240px] aspect-square rounded-2xl bg-white p-3">

=== src/domain/ticketing/hooks/useTicketWalletActions.ts — diff ===
@@ -128,6 +128,7 @@ export function useTicketWalletActions(wallet: WalletData) {
     setTransferTicket,
     submitTransfer,
     submitReturn,
+    reloadWallet: wallet.reload,
     requestRefund,
     resumingOrder,
     setResumingOrder,

=== src/domain/ticketing/index.ts — diff ===
@@ -52,3 +52,5 @@ export type {
   EventSalesAnalytics,
   PublicTicketTypeProjection,
 } from './types/ticketing';
+export { TransferLinkReceiverDialog } from './components/wallet/TransferLinkReceiverDialog';
+export { parseTransferLinkHash } from './utils/transferLinkUrl';

=== src/domain/ticketing/ports/ticketingPort.ts — diff ===
@@ -7,6 +7,8 @@ import type {
   Refund,
   Ticket,
   TicketQrPass,
+  TicketTransferLinkCreated,
+  TicketTransferLinkPreview,
   OfflineCheckInChanges,
   TicketOrder,
   TicketOrderItem,
@@ -112,6 +114,11 @@ export interface TicketingPort {
   ): Promise<{ ticketId: string; recipient: { username: string; displayName: string | null } }>;
   /** Devolve o ingresso recebido para quem comprou (D21). */
   returnTicketToBuyer(ticketId: string): Promise<{ ticketId: string }>;
+  /** Link para quem ainda não tem conta (D21): 30 min, uso único. */
+  createTransferLink(ticketId: string): Promise<TicketTransferLinkCreated>;
+  cancelTransferLink(ticketId: string): Promise<void>;
+  previewTransferLink(linkId: string, token: string): Promise<TicketTransferLinkPreview>;
+  acceptTransferLink(linkId: string, token: string): Promise<{ ticketId: string }>;
   checkInTicket(input: {
     occurrenceId: string;
     ticketId?: string;

=== src/domain/ticketing/types/ticketing.ts — diff ===
@@ -164,6 +164,8 @@ export interface Ticket {
   qrSwappedAt?: string;
   /** Recebido por transferência: de quem veio. Só pode voltar para essa pessoa (D21). */
   receivedFrom?: { username: string | null; displayName: string | null };
+  /** Link de transferência pendente: até quando vale (D21). */
+  transferLinkExpiresAt?: string;
   status: TicketStatus;
   ticketTypeSnapshot?: {
     name: string;
@@ -232,6 +234,22 @@ export interface EventSalesAnalytics {
 }
 
 /** QR assinado do ingresso e código de 8 caracteres, que só aparece no dia da sessão (D20). */
+/** Link de transferência criado agora; o código só existe nesta resposta (D21). */
+export interface TicketTransferLinkCreated {
+  linkId: string;
+  token: string;
+  expiresAt: string;
+}
+
+/** O que o link entrega, mostrado a quem recebeu antes de aceitar. */
+export interface TicketTransferLinkPreview {
+  eventTitle: string | null;
+  startsAt: string | null;
+  ticketType: string | null;
+  from: { username: string | null; displayName: string | null };
+  expiresAt: string;
+}
+
 export interface TicketQrPass {
   ticketId: string;
   token: string;

=== src/domain/ticketing/utils/transferLinkUrl.test.ts — ARQUIVO NOVO, conteúdo completo ===
import { describe, expect, it } from 'vitest';
import { buildTransferLinkUrl, parseTransferLinkHash } from './transferLinkUrl';

const TOKEN = 'abcDEF123_-abcDEF123_-abcDEF123_-abcDEF12';

describe('transferLinkUrl', () => {
  it('coloca o código depois do # e lê de volta', () => {
    const url = buildTransferLinkUrl('https://useguide.app', 'link1234', TOKEN);
    expect(url).toBe(`https://useguide.app/#receber-ingresso=link1234.${TOKEN}`);
    expect(parseTransferLinkHash(new URL(url).hash)).toEqual({ linkId: 'link1234', token: TOKEN });
  });

  it('recusa hash de outro formato', () => {
    expect(parseTransferLinkHash('')).toBeNull();
    expect(parseTransferLinkHash('#outra=link1234.abc')).toBeNull();
    expect(parseTransferLinkHash('#receber-ingresso=link1234.curto')).toBeNull();
    expect(parseTransferLinkHash(`#receber-ingresso=../x.${TOKEN}`)).toBeNull();
  });
});

=== src/domain/ticketing/utils/transferLinkUrl.ts — ARQUIVO NOVO, conteúdo completo ===
/** O código vai depois do `#`: o navegador não envia ao servidor nem a logs de proxy (§7.9). */
const HASH_KEY = 'receber-ingresso';

export function buildTransferLinkUrl(origin: string, linkId: string, token: string): string {
  return `${origin}/#${HASH_KEY}=${linkId}.${token}`;
}

export function parseTransferLinkHash(hash: string): { linkId: string; token: string } | null {
  const match = new RegExp(`^#${HASH_KEY}=([A-Za-z0-9]{8,40})\\.([A-Za-z0-9_-]{20,100})$`).exec(
    hash
  );
  return match?.[1] && match[2] ? { linkId: match[1], token: match[2] } : null;
}

=== src/domain/user/components/UsernameForm.tsx — ARQUIVO NOVO, conteúdo completo ===
import { useEffect, useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { formatBusinessDate } from '../../../shared/utils/businessDateTime';
import { StatusText } from '../../../ui/components/StatusText';
import { BUTTON_PRIMARY } from '../../../ui/styles/controls';
import type { useUsername } from '../hooks/useUsername';
import {
  isUsernameFormatValid,
  nextUsernameChangeAt,
  normalizeUsernameInput,
} from '../utils/username';

const KNOWN_ERRORS = ['USERNAME_INVALID', 'USERNAME_TAKEN', 'USERNAME_CHANGE_TOO_SOON'];

/** Escolha ou troca do @ (D21): usado em Configurações e no passo obrigatório depois do cadastro. */
export function UsernameForm({
  username,
  onSaved,
}: {
  username: ReturnType<typeof useUsername>;
  onSaved?: (saved: string) => void;
}) {
  const { t, i18n } = useTranslation();
  const inputId = useId();
  const { current, changedAt, suggestion, save } = username;
  const [value, setValue] = useState('');
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<{ tone: 'success' | 'danger'; message: string } | null>(
    null
  );

  useEffect(() => {
    setValue(current ?? suggestion);
  }, [current, suggestion]);

  const normalized = normalizeUsernameInput(value);
  const lockedUntil = nextUsernameChangeAt(current, changedAt, new Date());

  const submit = async () => {
    setSaving(true);
    setResult(null);
    try {
      const saved = await save(normalized);
      setResult({ tone: 'success', message: t('username.saved', { username: saved }) });
      onSaved?.(saved);
    } catch (err: unknown) {
      const code =
        err instanceof Error && KNOWN_ERRORS.includes(err.message) ? err.message : 'failed';
      setResult({ tone: 'danger', message: t(`username.errors.${code}`) });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      className="space-y-4"
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        void submit();
      }}
    >
      <p className="text-[13px] text-ink/70">{t('username.intro')}</p>
      <div className="space-y-1.5">
        <label htmlFor={inputId} className="text-[13px] font-semibold text-ink/80">
          {t('username.label')}
        </label>
        <div className="flex items-center min-h-11 rounded-xl bg-surface border border-line focus-within:ring-2 focus-within:ring-teal-400/50">
          <span className="pl-3 text-sm text-ink/70" aria-hidden="true">
            @
          </span>
          <input
            id={inputId}
            value={value}
            onChange={(event) => setValue(event.target.value)}
            maxLength={31}
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            disabled={Boolean(lockedUntil)}
            aria-describedby={`${inputId}-rules`}
            className="flex-1 min-w-0 min-h-11 px-1 bg-transparent text-sm text-ink focus:outline-none disabled:opacity-60"
          />
        </div>
        <p id={`${inputId}-rules`} className="text-[12px] text-ink/70">
          {t('username.rules')}
        </p>
      </div>
      {lockedUntil ? (
        <p className="text-[13px] text-ink/70">
          {t('username.lockedUntil', {
            date: formatBusinessDate(lockedUntil.toISOString(), i18n.language, {
              dateStyle: 'long',
            }),
          })}
        </p>
      ) : (
        current && <p className="text-[13px] text-ink/70">{t('username.changeWarning')}</p>
      )}
      {result && (
        <p role="status">
          <StatusText tone={result.tone}>{result.message}</StatusText>
        </p>
      )}
      {!lockedUntil && (
        <button
          type="submit"
          disabled={saving || normalized === current || !isUsernameFormatValid(value)}
          className={`${BUTTON_PRIMARY} w-full`}
        >
          {t(current ? 'username.change' : 'username.save')}
        </button>
      )}
    </form>
  );
}

=== src/domain/user/components/UsernameOnboardingDialog.tsx — ARQUIVO NOVO, conteúdo completo ===
import { useTranslation } from 'react-i18next';
import { Dialog } from '../../../ui/components/Dialog';
import { TextButton } from '../../../ui/components/TextButton';
import { useUsername } from '../hooks/useUsername';
import { UsernameForm } from './UsernameForm';

/**
 * Passo obrigatório logo depois de criar a conta (e-mail ou Google) e para contas sem @ (D21):
 * assim toda conta pode ser encontrada pelo @. Só fecha ao salvar ou ao sair da conta.
 */
export function UsernameOnboardingDialog({
  onDone,
  onSignOut,
}: {
  onDone: () => void;
  onSignOut: () => void;
}) {
  const { t } = useTranslation();
  const username = useUsername();

  return (
    <Dialog
      open
      dismissible={false}
      onOpenChange={() => undefined}
      title={t('username.onboardingTitle')}
    >
      {username.loading ? (
        <div className="h-28 rounded-[20px] bg-ink/[0.04] animate-pulse motion-reduce:animate-none" />
      ) : username.error ? (
        <div className="flex items-center justify-between gap-2 text-[13px] text-ink/70">
          <span>{t('username.loadError')}</span>
          <TextButton tone="accent" onClick={() => void username.reload()}>
            {t('username.retry')}
          </TextButton>
        </div>
      ) : (
        <UsernameForm username={username} onSaved={onDone} />
      )}
      <div className="mt-4 flex justify-center">
        <TextButton tone="ink" onClick={onSignOut}>
          {t('username.signOut')}
        </TextButton>
      </div>
    </Dialog>
  );
}

=== src/domain/user/components/UsernameSettingsView.tsx — ARQUIVO REESCRITO, substitua todo o conteúdo por este ===
import { useTranslation } from 'react-i18next';
import { BackButton } from '../../../ui/components/BackButton';
import { TextButton } from '../../../ui/components/TextButton';
import { useUsername } from '../hooks/useUsername';
import { UsernameForm } from './UsernameForm';

/** Configurações › Nome de usuário (D21). */
export function UsernameSettingsView({ onBack }: { onBack: () => void }) {
  const { t } = useTranslation();
  const username = useUsername();

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-5">
        <BackButton label={t('settings.back')} onClick={onBack} />
        <h2 className="text-[22px] font-display font-bold text-ink">{t('username.title')}</h2>
      </div>

      {username.loading ? (
        <div className="h-28 rounded-[20px] bg-ink/[0.04] animate-pulse motion-reduce:animate-none" />
      ) : username.error ? (
        <div className="flex items-center justify-between gap-2 text-[13px] text-ink/70">
          <span>{t('username.loadError')}</span>
          <TextButton tone="accent" onClick={() => void username.reload()}>
            {t('username.retry')}
          </TextButton>
        </div>
      ) : (
        <UsernameForm username={username} />
      )}
    </div>
  );
}

=== src/domain/user/index.ts — diff ===
@@ -27,6 +27,7 @@ export { useUserPhoto } from './hooks/useUserPhoto';
 
 export { AccountView } from './components/AccountView';
 export { UsernameSettingsView } from './components/UsernameSettingsView';
+export { UsernameOnboardingDialog } from './components/UsernameOnboardingDialog';
 export { findUserByUsernameUseCase } from './application/usecases/findUserByUsernameUseCase';
 export type { UsernameProfile } from './types/user';
 export { ChangePasswordView } from './components/ChangePasswordView';

=== src/shared/i18n/usernameResources.ts — diff ===
@@ -11,6 +11,8 @@ export interface UsernameTranslation {
   saved: string;
   loadError: string;
   retry: string;
+  onboardingTitle: string;
+  signOut: string;
   errors: {
     USERNAME_INVALID: string;
     USERNAME_TAKEN: string;
@@ -30,6 +32,34 @@ export interface UsernameTranslation {
     returnHint: string;
     returnConfirm: string;
     returned: string;
+    link: {
+      title: string;
+      hint: string;
+      create: string;
+      ready: string;
+      pending: string;
+      share: string;
+      copy: string;
+      copied: string;
+      cancel: string;
+      shareText: string;
+      receiveTitle: string;
+      loginHint: string;
+      login: string;
+      from: string;
+      accept: string;
+      decline: string;
+      accepted: string;
+      seeTickets: string;
+      errors: {
+        TRANSFER_LINK_INVALID: string;
+        TRANSFER_LINK_EXPIRED: string;
+        TRANSFER_LINK_OWN: string;
+        RECIPIENT_NOT_VERIFIED: string;
+        RATE_LIMITED: string;
+        failed: string;
+      };
+    };
     errors: {
       TRANSFER_ONLY_TO_BUYER: string;
       USERNAME_NOT_FOUND: string;
@@ -44,7 +74,7 @@ export interface UsernameTranslation {
 export const usernamePtBR: UsernameTranslation = {
   title: 'Nome de usuário',
   intro:
-    'Seu nome de usuário identifica você no Use Guide. Outras pessoas podem usá-lo para encontrar sua conta, por exemplo ao enviar um ingresso.',
+    'Seu nome de usuário identifica você no Use Guide. Outras pessoas podem usá-lo para encontrar sua conta.',
   label: 'Seu @',
   rules: 'De 3 a 30 letras, números, ponto ou sublinhado. Sem espaços nem acentos.',
   save: 'Salvar',
@@ -55,6 +85,8 @@ export const usernamePtBR: UsernameTranslation = {
   saved: 'Pronto: agora você é @{{username}}.',
   loadError: 'Não foi possível carregar seu nome de usuário.',
   retry: 'Tentar de novo',
+  onboardingTitle: 'Escolha seu nome de usuário',
+  signOut: 'Sair da conta',
   errors: {
     USERNAME_INVALID: 'Este @ não é permitido. Use letras, números, ponto ou sublinhado.',
     USERNAME_TAKEN: 'Este @ já está em uso. Escolha outro.',
@@ -75,6 +107,37 @@ export const usernamePtBR: UsernameTranslation = {
       'Você recebeu este ingresso de {{name}}. Ingresso recebido só pode voltar para quem comprou.',
     returnConfirm: 'Devolver para {{name}}',
     returned: 'Ingresso devolvido para {{name}}.',
+    link: {
+      title: 'A pessoa ainda não tem conta?',
+      hint: 'Envie um link: ela cria a conta e aceita o ingresso. O link vale 30 minutos e uma vez só, e o ingresso continua com você até alguém aceitar.',
+      create: 'Gerar link de transferência',
+      ready:
+        'Link pronto. Vale até {{time}} e só pode ser usado uma vez. Quem tiver o link pode aceitar o ingresso: envie só para a pessoa certa.',
+      pending:
+        'Há um link de transferência aberto até {{time}}. O ingresso continua com você até alguém aceitar.',
+      share: 'Compartilhar',
+      copy: 'Copiar link',
+      copied: 'Link copiado.',
+      cancel: 'Cancelar link',
+      shareText:
+        'Tenho um ingresso para você: {{event}}. Abra o link, crie sua conta no Use Guide e aceite.',
+      receiveTitle: 'Você recebeu um ingresso',
+      loginHint: 'Entre ou crie sua conta no Use Guide para ver e aceitar o ingresso.',
+      login: 'Entrar ou criar conta',
+      from: 'Enviado por {{name}}. O link vale até {{time}}.',
+      accept: 'Aceitar ingresso',
+      decline: 'Agora não',
+      accepted: 'Pronto: o ingresso está na sua carteira.',
+      seeTickets: 'Ver meus ingressos',
+      errors: {
+        TRANSFER_LINK_INVALID: 'Este link não é válido ou já foi usado.',
+        TRANSFER_LINK_EXPIRED: 'Este link venceu. Peça um novo para quem enviou.',
+        TRANSFER_LINK_OWN: 'Este link é seu: envie para a outra pessoa.',
+        RECIPIENT_NOT_VERIFIED: 'Confirme seu e-mail para receber o ingresso.',
+        RATE_LIMITED: 'Muitas tentativas seguidas. Tente de novo em alguns minutos.',
+        failed: 'Não foi possível concluir. Tente de novo.',
+      },
+    },
     errors: {
       TRANSFER_ONLY_TO_BUYER: 'Ingresso recebido só pode ser devolvido para quem comprou.',
       USERNAME_NOT_FOUND: 'Nenhuma conta com este @. Peça para a pessoa conferir em Configurações.',
@@ -89,8 +152,7 @@ export const usernamePtBR: UsernameTranslation = {
 
 export const usernameEn: UsernameTranslation = {
   title: 'Username',
-  intro:
-    'Your username identifies you on Use Guide. Other people can use it to find your account, for example when sending you a ticket.',
+  intro: 'Your username identifies you on Use Guide. Other people can use it to find your account.',
   label: 'Your @',
   rules: '3 to 30 letters, numbers, dot or underscore. No spaces or accents.',
   save: 'Save',
@@ -100,6 +162,8 @@ export const usernameEn: UsernameTranslation = {
   saved: 'Done: you are now @{{username}}.',
   loadError: 'Could not load your username.',
   retry: 'Try again',
+  onboardingTitle: 'Choose your username',
+  signOut: 'Sign out',
   errors: {
     USERNAME_INVALID: 'This @ is not allowed. Use letters, numbers, dot or underscore.',
     USERNAME_TAKEN: 'This @ is already taken. Choose another one.',
@@ -120,6 +184,37 @@ export const usernameEn: UsernameTranslation = {
       'You received this ticket from {{name}}. A received ticket can only go back to the buyer.',
     returnConfirm: 'Give back to {{name}}',
     returned: 'Ticket given back to {{name}}.',
+    link: {
+      title: 'The person has no account yet?',
+      hint: 'Send a link: they create an account and accept the ticket. The link is valid for 30 minutes and only once, and the ticket stays with you until someone accepts it.',
+      create: 'Create transfer link',
+      ready:
+        'Link ready. Valid until {{time}} and only once. Anyone with the link can accept the ticket: send it only to the right person.',
+      pending:
+        'A transfer link is open until {{time}}. The ticket stays with you until someone accepts it.',
+      share: 'Share',
+      copy: 'Copy link',
+      copied: 'Link copied.',
+      cancel: 'Cancel link',
+      shareText:
+        'I have a ticket for you: {{event}}. Open the link, create your Use Guide account and accept it.',
+      receiveTitle: 'You received a ticket',
+      loginHint: 'Sign in or create your Use Guide account to see and accept the ticket.',
+      login: 'Sign in or create account',
+      from: 'Sent by {{name}}. The link is valid until {{time}}.',
+      accept: 'Accept ticket',
+      decline: 'Not now',
+      accepted: 'Done: the ticket is in your wallet.',
+      seeTickets: 'See my tickets',
+      errors: {
+        TRANSFER_LINK_INVALID: 'This link is not valid or was already used.',
+        TRANSFER_LINK_EXPIRED: 'This link has expired. Ask the sender for a new one.',
+        TRANSFER_LINK_OWN: 'This link is yours: send it to the other person.',
+        RECIPIENT_NOT_VERIFIED: 'Confirm your email to receive the ticket.',
+        RATE_LIMITED: 'Too many attempts in a row. Try again in a few minutes.',
+        failed: 'Could not complete. Try again.',
+      },
+    },
     errors: {
       TRANSFER_ONLY_TO_BUYER: 'A received ticket can only be given back to the buyer.',
       USERNAME_NOT_FOUND: 'No account with this @. Ask the person to check it in Settings.',
@@ -135,7 +230,7 @@ export const usernameEn: UsernameTranslation = {
 export const usernameFr: UsernameTranslation = {
   title: 'Nom d’utilisateur',
   intro:
-    'Votre nom d’utilisateur vous identifie sur Use Guide. D’autres personnes peuvent l’utiliser pour trouver votre compte, par exemple pour vous envoyer un billet.',
+    'Votre nom d’utilisateur vous identifie sur Use Guide. D’autres personnes peuvent l’utiliser pour trouver votre compte.',
   label: 'Votre @',
   rules: 'De 3 à 30 lettres, chiffres, point ou tiret bas. Sans espaces ni accents.',
   save: 'Enregistrer',
@@ -146,6 +241,8 @@ export const usernameFr: UsernameTranslation = {
   saved: 'C’est fait : vous êtes maintenant @{{username}}.',
   loadError: 'Impossible de charger votre nom d’utilisateur.',
   retry: 'Réessayer',
+  onboardingTitle: 'Choisissez votre nom d’utilisateur',
+  signOut: 'Se déconnecter',
   errors: {
     USERNAME_INVALID: 'Ce @ n’est pas autorisé. Utilisez lettres, chiffres, point ou tiret bas.',
     USERNAME_TAKEN: 'Ce @ est déjà pris. Choisissez-en un autre.',
@@ -166,6 +263,37 @@ export const usernameFr: UsernameTranslation = {
       'Vous avez reçu ce billet de {{name}}. Un billet reçu ne peut revenir qu’à la personne qui l’a acheté.',
     returnConfirm: 'Rendre à {{name}}',
     returned: 'Billet rendu à {{name}}.',
+    link: {
+      title: 'La personne n’a pas encore de compte ?',
+      hint: 'Envoyez un lien : elle crée son compte et accepte le billet. Le lien est valable 30 minutes et une seule fois, et le billet reste à vous jusqu’à l’acceptation.',
+      create: 'Créer un lien de transfert',
+      ready:
+        'Lien prêt. Valable jusqu’à {{time}} et une seule fois. Toute personne ayant le lien peut accepter le billet : envoyez-le seulement à la bonne personne.',
+      pending:
+        'Un lien de transfert est ouvert jusqu’à {{time}}. Le billet reste à vous jusqu’à l’acceptation.',
+      share: 'Partager',
+      copy: 'Copier le lien',
+      copied: 'Lien copié.',
+      cancel: 'Annuler le lien',
+      shareText:
+        'J’ai un billet pour toi : {{event}}. Ouvre le lien, crée ton compte Use Guide et accepte-le.',
+      receiveTitle: 'Vous avez reçu un billet',
+      loginHint: 'Connectez-vous ou créez votre compte Use Guide pour voir et accepter le billet.',
+      login: 'Se connecter ou créer un compte',
+      from: 'Envoyé par {{name}}. Le lien est valable jusqu’à {{time}}.',
+      accept: 'Accepter le billet',
+      decline: 'Plus tard',
+      accepted: 'C’est fait : le billet est dans votre portefeuille.',
+      seeTickets: 'Voir mes billets',
+      errors: {
+        TRANSFER_LINK_INVALID: 'Ce lien n’est pas valable ou a déjà été utilisé.',
+        TRANSFER_LINK_EXPIRED: 'Ce lien a expiré. Demandez-en un nouveau à l’expéditeur.',
+        TRANSFER_LINK_OWN: 'Ce lien est à vous : envoyez-le à l’autre personne.',
+        RECIPIENT_NOT_VERIFIED: 'Confirmez votre e-mail pour recevoir le billet.',
+        RATE_LIMITED: 'Trop de tentatives d’affilée. Réessayez dans quelques minutes.',
+        failed: 'Impossible de terminer. Réessayez.',
+      },
+    },
     errors: {
       TRANSFER_ONLY_TO_BUYER: 'Un billet reçu ne peut être rendu qu’à la personne qui l’a acheté.',
       USERNAME_NOT_FOUND:

=== src/ui/components/Dialog.tsx — diff ===
@@ -14,6 +14,8 @@ interface DialogProps {
   className?: string;
   /** Aberto por cima de outro modal (ex.: termos dentro do checkout). */
   nested?: boolean;
+  /** false: passo obrigatório, sem botão fechar, Esc nem toque fora. */
+  dismissible?: boolean;
 }
 
 export function Dialog({
@@ -24,6 +26,7 @@ export function Dialog({
   children,
   className,
   nested = false,
+  dismissible = true,
 }: DialogProps) {
   const { t } = useTranslation();
   return (
@@ -44,6 +47,8 @@ export function Dialog({
           style={{ zIndex: nested ? Z_INDEX.modalNested : Z_INDEX.modal }}
           // O Radix foca o primeiro controle (o botão fechar) e o anel de foco aparece sem o usuário usar o teclado.
           // Focar a própria folha mantém o Tab e o leitor de tela começando dentro do diálogo.
+          onEscapeKeyDown={(event) => !dismissible && event.preventDefault()}
+          onPointerDownOutside={(event) => !dismissible && event.preventDefault()}
           onOpenAutoFocus={(event) => {
             event.preventDefault();
             (event.currentTarget as HTMLElement).focus();
@@ -66,12 +71,14 @@ export function Dialog({
 
           {children}
 
-          <RadixDialog.Close
-            aria-label={t('common.close')}
-            className="press absolute top-4 right-4 w-11 h-11 flex items-center justify-center rounded-full text-ink/60 hover:text-ink hover:bg-ink/[0.06] focus-visible:ring-2 focus-visible:ring-teal-400/50 focus-visible:outline-none"
-          >
-            <X size={20} />
-          </RadixDialog.Close>
+          {dismissible && (
+            <RadixDialog.Close
+              aria-label={t('common.close')}
+              className="press absolute top-4 right-4 w-11 h-11 flex items-center justify-center rounded-full text-ink/60 hover:text-ink hover:bg-ink/[0.06] focus-visible:ring-2 focus-visible:ring-teal-400/50 focus-visible:outline-none"
+            >
+              <X size={20} />
+            </RadixDialog.Close>
+          )}
         </RadixDialog.Content>
       </RadixDialog.Portal>
     </RadixDialog.Root>

VERIFICAÇÃO (obrigatória):
- `npm run typecheck`, `npx biome lint .` (0 erros; arquivos tocados sem avisos), `npm run build`;
- testes ligados aos arquivos deste prompt: `npx vitest related --run server/application/usecases/ticketing/acceptTicketTransferLinkApplicationUseCase.test.ts server/application/usecases/ticketing/acceptTicketTransferLinkApplicationUseCase.ts server/application/usecases/ticketing/createTicketTransferLinkApplicationUseCase.ts server/domain/ticketing/adapters/firestoreTicketPrivacyStore.ts server/domain/ticketing/adapters/firestoreTicketingAdapter.ts server/domain/ticketing/adapters/firestoreTransferLinkStore.ts server/domain/ticketing/controllers/ticketingController.ts server/domain/ticketing/dtos/ticketingPersistenceMappers.ts server/domain/ticketing/errors/ticketingDomainError.ts server/domain/ticketing/factory.ts server/domain/ticketing/index.ts server/domain/ticketing/ports/ticketingPort.ts server/domain/ticketing/services/ticketHolderService.ts server/domain/ticketing/services/ticketTransferLinkService.test.ts server/domain/ticketing/services/ticketTransferLinkService.ts server/domain/ticketing/services/ticketingServices.test.ts server/domain/ticketing/services/transferEligibility.ts server/domain/ticketing/types/ticketingTypes.ts server/domain/ticketing/usecases/cancelTicketTransferLinkUseCase.ts server/domain/ticketing/usecases/claimTicketTransferLinkUseCase.ts server/domain/ticketing/usecases/createTicketTransferLinkUseCase.ts server/domain/ticketing/usecases/previewTicketTransferLinkUseCase.ts server/domain/ticketing/usecases/releaseTicketTransferLinkUseCase.ts server/domain/ticketing/utils/transferLinkToken.ts server/interfaces/http/ticketTransfers/ticketTransferController.ts server/interfaces/http/ticketTransfers/ticketTransferRoutes.ts server/interfaces/http/ticketTransfers/ticketTransferSchema.ts src/app/App.tsx src/app/TransferLinkReceiver.tsx src/app/UsernameGate.test.tsx src/app/UsernameGate.tsx src/domain/ticketing/adapters/httpTicketingAdapter.ts src/domain/ticketing/application/usecases/acceptTransferLinkUseCase.ts src/domain/ticketing/application/usecases/cancelTransferLinkUseCase.ts src/domain/ticketing/application/usecases/createTransferLinkUseCase.ts src/domain/ticketing/application/usecases/previewTransferLinkUseCase.ts src/domain/ticketing/components/UserTicketsHistoryView.tsx src/domain/ticketing/components/wallet/TransferLinkPanel.tsx src/domain/ticketing/components/wallet/TransferLinkReceiverDialog.tsx src/domain/ticketing/components/wallet/TransferTicketForm.tsx src/domain/ticketing/components/wallet/WalletTicketCard.tsx src/domain/ticketing/hooks/useTicketWalletActions.ts src/domain/ticketing/index.ts src/domain/ticketing/ports/ticketingPort.ts src/domain/ticketing/types/ticketing.ts src/domain/ticketing/utils/transferLinkUrl.test.ts src/domain/ticketing/utils/transferLinkUrl.ts src/domain/user/components/UsernameForm.tsx src/domain/user/components/UsernameOnboardingDialog.tsx src/domain/user/components/UsernameSettingsView.tsx src/domain/user/index.ts src/shared/i18n/usernameResources.ts src/ui/components/Dialog.tsx` (todos verdes). Não precisa rodar a suíte inteira.
- `npm run test:rules` (as regras mudaram).

ENTREGA: responda no formato do AGENTS.md §16.3.

LIMPEZA (obrigatória, ao terminar de implementar): apague todos os arquivos de public/assets/aistudio/, inclusive o deste prompt. São cópias dos textos colados no chat, salvas automaticamente pelo AI Studio, e public/ vai para o site publicado. Se a pasta ficar vazia, apague a pasta também.
~~~~

### Configurações manuais (você faz, fora do AI Studio, depois de aplicar este prompt)

1. Publique as regras e os índices do Firestore: `firebase deploy --only firestore:rules,firestore:indexes`.
