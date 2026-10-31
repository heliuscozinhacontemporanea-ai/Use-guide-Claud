# Prompt 21.7c — Modo portaria com economia de bateria e devolução de ingresso

> Lote 18, gerado dos commits de referência `ec9e4e2..f29204b` da branch `claude/agents-md-v2`. Aplique na ordem do lote (A7, 21.1 a 21.7d), um por vez. Cole o bloco abaixo no agente do AI Studio, inteiro, de uma vez.

---

## Prompt 21.7c — Modo portaria com economia de bateria e devolução de ingresso

Telas aprovadas em 2026-10-31.

~~~~text
Siga o AGENTS.md. O app ainda não foi liberado para usuários: nenhum código de compatibilidade ou transição (§2.2 item 8). As regras de negócio estão nas decisões D20 e D21 de docs/arquitetura/decisoes.md (aplicadas pelo prompt A7).

IMPORTANTE: aplique os diffs abaixo EXATAMENTE, inclusive os arquivos novos. Não reescreva os arquivos do seu jeito. Arquivo tocado sai sem avisos do lint e formatado (AGENTS.md §13). Não altere firebase.json, functions/, AGENTS.md, docs/ nem .env.

O QUE MUDA:
1) Modo portaria em tela cheia para eventos e entradas de atração: câmera sempre aberta, check-in a cada QR, tela verde ou vermelha até "Próximo", "Inserir código" sempre à mão e destacado depois de 8 s sem leitura.
2) Leitor: 720p, recorte quadrado do centro (80%), velocidade máxima com uso, 4 tentativas/s depois de 10 s parado e espera depois de 60 s; desliga em segundo plano; o mesmo QR em até 5 s é ignorado; lanterna sob demanda.
3) Tela acesa (Wake Lock), vibração no Android, tela escura fixa e aviso de bateria baixa onde o navegador informa.
4) Moldura quadrada do tamanho do recorte, barra fina que sobe e desce (parada com movimento reduzido) e desfoque fora da moldura.
5) Folha do código: "Código Token" e "Código que aparece abaixo do QR Code".
6) Ingresso recebido só volta para quem comprou: "Devolver para @…" na carteira, rota POST /api/ticket-transfers/return e aviso a quem comprou.

ARQUIVOS (crie, altere ou apague exatamente estes):
- server/application/usecases/ticketing/returnTicketToBuyerApplicationUseCase.ts (criar)
- server/application/usecases/ticketing/transferTicketToUsernameApplicationUseCase.test.ts (alterar)
- server/application/usecases/ticketing/transferTicketToUsernameApplicationUseCase.ts (alterar)
- server/domain/ticketing/adapters/firestoreTicketStore.ts (alterar)
- server/domain/ticketing/controllers/ticketingController.ts (alterar)
- server/domain/ticketing/dtos/ticketingPersistenceMappers.ts (alterar)
- server/domain/ticketing/errors/ticketingDomainError.ts (alterar)
- server/domain/ticketing/ports/ticketingPort.ts (alterar)
- server/domain/ticketing/services/ticketHolderService.ts (alterar)
- server/domain/ticketing/services/ticketingServices.test.ts (alterar)
- server/domain/ticketing/types/ticketingTypes.ts (alterar)
- server/interfaces/http/ticketTransfers/ticketTransferController.ts (alterar)
- server/interfaces/http/ticketTransfers/ticketTransferRoutes.ts (alterar)
- server/interfaces/http/ticketTransfers/ticketTransferSchema.ts (alterar)
- src/domain/bookings/components/partner/SlotCheckInSheet.tsx (alterar)
- src/domain/bookings/hooks/useSlotCheckIn.ts (alterar)
- src/domain/events/components/EventSessionsField.tsx (alterar)
- src/domain/ticketing/adapters/httpTicketingAdapter.ts (alterar)
- src/domain/ticketing/application/usecases/returnTicketToBuyerUseCase.ts (criar)
- src/domain/ticketing/components/PartnerEventTicketingManager.tsx (alterar)
- src/domain/ticketing/components/UserTicketsHistoryView.tsx (alterar)
- src/domain/ticketing/components/manager/CheckInTab.tsx (alterar)
- src/domain/ticketing/components/manager/TicketGateCard.tsx (alterar)
- src/domain/ticketing/components/wallet/TransferTicketForm.tsx (alterar)
- src/domain/ticketing/components/wallet/WalletTicketCard.tsx (alterar)
- src/domain/ticketing/hooks/useTicketGate.ts (alterar)
- src/domain/ticketing/hooks/useTicketWalletActions.ts (alterar)
- src/domain/ticketing/hooks/useUserTickets.ts (alterar)
- src/domain/ticketing/ports/ticketingPort.ts (alterar)
- src/domain/ticketing/types/ticketing.ts (alterar)
- src/index.css (alterar)
- src/shared/i18n/gateModeResources.ts (criar)
- src/shared/i18n/resources.ts (alterar)
- src/shared/i18n/ticketGateResources.ts (alterar)
- src/shared/i18n/ticketWalletResources.ts (alterar)
- src/shared/i18n/usernameResources.ts (alterar)
- src/ui/components/GateModeScreen.test.tsx (criar)
- src/ui/components/GateModeScreen.tsx (criar)
- src/ui/hooks/useLowBattery.ts (criar)
- src/ui/hooks/useQrScanner.ts (alterar)
- src/ui/hooks/useScreenWakeLock.ts (criar)

Aplique as mudanças abaixo EXATAMENTE como estão (formato unified diff: linhas com "-" saem, linhas com "+" entram; as demais são contexto para localizar o trecho). Não reformate outros trechos dos arquivos.

=== server/application/usecases/ticketing/returnTicketToBuyerApplicationUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { createNotificationUseCase } from '../../../domain/notifications';
import { type TicketingActorContext, transferTicketUseCase } from '../../../domain/ticketing';

/** Ingresso recebido por transferência volta para quem comprou, que recebe aviso (D21). */
export async function returnTicketToBuyerApplicationUseCase(
  actor: TicketingActorContext,
  ticketId: string
): Promise<{ ticketId: string }> {
  const { newTicket } = await transferTicketUseCase(actor, { ticketId, returnToBuyer: true });
  // Aviso não pode desfazer a devolução já gravada.
  await createNotificationUseCase({
    recipientPartnerId: newTicket.ownerUserId,
    type: 'admin_message',
    title: 'Ingresso devolvido',
    message: newTicket.eventSnapshot?.title
      ? `O ingresso para ${newTicket.eventSnapshot.title} voltou para a sua carteira.`
      : 'Um ingresso voltou para a sua carteira.',
  }).catch(() => undefined);
  return { ticketId: newTicket.id };
}

=== server/application/usecases/ticketing/transferTicketToUsernameApplicationUseCase.test.ts — diff ===
@@ -1,6 +1,13 @@
 import { beforeEach, describe, expect, it, vi } from 'vitest';
 
-vi.mock('../../../domain/users', () => ({ resolveUsernameOwnerUseCase: vi.fn() }));
+vi.mock('../../../domain/users', () => ({
+  resolveUsernameOwnerUseCase: vi.fn(),
+  getUserProfileUseCase: vi.fn().mockResolvedValue({
+    username: 'ana',
+    firstName: 'Ana',
+    lastName: 'Souza',
+  }),
+}));
 vi.mock('../../../domain/ticketing', () => ({ transferTicketUseCase: vi.fn() }));
 vi.mock('../../../domain/notifications', () => ({
   createNotificationUseCase: vi.fn().mockResolvedValue(true),
@@ -36,7 +43,13 @@ describe('transferência pelo @ (D21)', () => {
     );
     expect(transferTicketUseCase).toHaveBeenCalledWith(
       { uid: 'u1', admin: false },
-      { ticketId: 'tkt_1', toUserId: 'u2', recipientEmail: 'bruno@exemplo.com', recipientName: 'Bruno Lima' }
+      {
+        ticketId: 'tkt_1',
+        toUserId: 'u2',
+        recipientEmail: 'bruno@exemplo.com',
+        recipientName: 'Bruno Lima',
+        receivedFrom: { username: 'ana', displayName: 'Ana Souza' },
+      }
     );
     expect(result).toEqual({
       ticketId: 'tkt_new',

=== server/application/usecases/ticketing/transferTicketToUsernameApplicationUseCase.ts — diff ===
@@ -1,6 +1,6 @@
 import { createNotificationUseCase } from '../../../domain/notifications';
 import { type TicketingActorContext, transferTicketUseCase } from '../../../domain/ticketing';
-import { resolveUsernameOwnerUseCase } from '../../../domain/users';
+import { getUserProfileUseCase, resolveUsernameOwnerUseCase } from '../../../domain/users';
 
 export type TicketTransferErrorCode = 'TRANSFER_TO_SELF' | 'RECIPIENT_NOT_VERIFIED';
 
@@ -33,11 +33,15 @@ export async function transferTicketToUsernameApplicationUseCase(
       'Esta conta ainda não confirmou o e-mail e não pode receber ingressos.'
     );
   }
+  // O destinatário vê de quem recebeu e só pode devolver para essa pessoa (D21).
+  const sender = await getUserProfileUseCase(actor.uid);
+  const senderName = `${sender?.firstName ?? ''} ${sender?.lastName ?? ''}`.trim();
   const { newTicket } = await transferTicketUseCase(actor, {
     ticketId,
     toUserId: recipient.uid,
     recipientEmail: recipient.email,
     recipientName: recipient.displayName ?? recipient.username,
+    receivedFrom: { username: sender?.username ?? null, displayName: senderName || null },
   });
   // Aviso não pode desfazer a transferência já gravada.
   await createNotificationUseCase({

=== server/domain/ticketing/adapters/firestoreTicketStore.ts — diff ===
@@ -93,6 +93,7 @@ export class FirestoreTicketStore {
     recipientEmail: string;
     recipientName?: string;
     newQrTokenHash: string;
+    receivedFrom?: Ticket['receivedFrom'];
   }): Promise<{
     oldTicket: Ticket;
     newTicket: Ticket;
@@ -152,6 +153,7 @@ export class FirestoreTicketStore {
           ? { ticketTypeSnapshot: oldTicket.ticketTypeSnapshot }
           : {}),
         ...(oldTicket.eventSnapshot ? { eventSnapshot: oldTicket.eventSnapshot } : {}),
+        ...(params.receivedFrom ? { receivedFrom: params.receivedFrom } : {}),
       };
       tx.set(newTicketRef, newTicketDoc);

=== server/domain/ticketing/controllers/ticketingController.ts — diff ===
@@ -65,6 +65,8 @@ function handleTicketingError(res: Response, error: unknown): Response {
         return res.status(422).json({ error: error.message });
       case 'TOO_MANY_REQUESTS':
         return res.status(429).json({ error: error.message });
+      case 'TRANSFER_ONLY_TO_BUYER':
+        return res.status(422).json({ error: error.message });
       case 'SERVICE_UNAVAILABLE':
         return res.status(503).json({ error: error.message });
     }

=== server/domain/ticketing/dtos/ticketingPersistenceMappers.ts — diff ===
@@ -211,6 +211,20 @@ export class TicketPersistenceMapper {
       qrVersion:
         typeof raw.qrVersion === 'number' && raw.qrVersion >= 1 ? Math.trunc(raw.qrVersion) : 1,
       ...(typeof raw.qrSwappedAt === 'string' ? { qrSwappedAt: raw.qrSwappedAt } : {}),
+      ...(raw.receivedFrom && typeof raw.receivedFrom === 'object'
+        ? {
+            receivedFrom: {
+              username:
+                typeof (raw.receivedFrom as { username?: unknown }).username === 'string'
+                  ? String((raw.receivedFrom as { username: string }).username)
+                  : null,
+              displayName:
+                typeof (raw.receivedFrom as { displayName?: unknown }).displayName === 'string'
+                  ? String((raw.receivedFrom as { displayName: string }).displayName)
+                  : null,
+            },
+          }
+        : {}),
       ...(typeof raw.updatedAt === 'string' ? { updatedAt: raw.updatedAt } : {}),
       status:
         raw.status === 'reserved' ||

=== server/domain/ticketing/errors/ticketingDomainError.ts — diff ===
@@ -5,6 +5,7 @@ export type TicketingErrorCode =
   | 'CONFLICT'
   | 'UNPROCESSABLE_ENTITY'
   | 'TOO_MANY_REQUESTS'
+  | 'TRANSFER_ONLY_TO_BUYER'
   | 'SERVICE_UNAVAILABLE';
 
 export class TicketingDomainError extends Error {

=== server/domain/ticketing/ports/ticketingPort.ts — diff ===
@@ -213,6 +213,7 @@ export interface TicketingPort {
     recipientEmail: string;
     recipientName?: string;
     newQrTokenHash: string;
+    receivedFrom?: Ticket['receivedFrom'];
   }): Promise<{
     oldTicket: Ticket;
     newTicket: Ticket;

=== server/domain/ticketing/services/ticketHolderService.ts — diff ===
@@ -5,7 +5,12 @@ import {
 } from '../../events';
 import { TicketingDomainError } from '../errors/ticketingDomainError';
 import type { TicketingPort } from '../ports/ticketingPort';
-import { type EventWaitlistEntry, type Ticket, type TicketTransfer } from '../types/ticketingTypes';
+import type {
+  EventWaitlistEntry,
+  Ticket,
+  TicketOrder,
+  TicketTransfer,
+} from '../types/ticketingTypes';
 import { generateOpaqueTicketQrToken } from '../utils/qrToken';
 import {
   assertCanManageOccurrence,
@@ -27,9 +32,13 @@ export class TicketHolderService {
     actor: TicketingActorContext,
     params: {
       ticketId: string;
-      recipientEmail: string;
+      recipientEmail?: string;
       recipientName?: string;
       toUserId?: string;
+      /** De quem o destinatário recebeu, para ele saber a quem devolver (D21). */
+      receivedFrom?: Ticket['receivedFrom'];
+      /** Devolução: o ingresso recebido volta para quem comprou (D21). */
+      returnToBuyer?: boolean;
     }
   ): Promise<{
     oldTicket: Ticket;
@@ -83,14 +92,16 @@ export class TicketHolderService {
       }
     }
 
+    const recipient = this.resolveRecipient(ticket, order, params);
     const { rawQrToken, qrTokenHash } = generateOpaqueTicketQrToken();
     const res = await this.port.transferTicketAtomic({
       ticketId: params.ticketId,
       fromUserId: actor.uid,
-      toUserId: params.toUserId,
-      recipientEmail: params.recipientEmail.trim(),
-      recipientName: params.recipientName?.trim(),
+      toUserId: recipient.toUserId,
+      recipientEmail: recipient.email,
+      recipientName: recipient.name,
       newQrTokenHash: qrTokenHash,
+      ...(recipient.receivedFrom ? { receivedFrom: recipient.receivedFrom } : {}),
     });
 
     await createEventAuditLogUseCase({
@@ -102,7 +113,7 @@ export class TicketHolderService {
       before: { oldTicketId: res.oldTicket.id, fromUserId: actor.uid },
       after: {
         newTicketId: res.newTicket.id,
-        recipientEmail: params.recipientEmail,
+        toUserId: recipient.toUserId,
       },
     });
 
@@ -169,4 +180,50 @@ export class TicketHolderService {
       quantity: input.quantity,
     });
   }
+
+  /**
+   * Ingresso comprado vai para quem o comprador escolher; ingresso recebido só volta para quem
+   * comprou (D21), com o e-mail e o nome do pedido, sem o "recebido de".
+   */
+  private resolveRecipient(
+    ticket: Ticket,
+    order: TicketOrder | null,
+    params: {
+      toUserId?: string;
+      recipientEmail?: string;
+      recipientName?: string;
+      receivedFrom?: Ticket['receivedFrom'];
+      returnToBuyer?: boolean;
+    }
+  ): { toUserId: string; email: string; name?: string; receivedFrom?: Ticket['receivedFrom'] } {
+    const received = !!order && ticket.ownerUserId !== order.buyerId;
+    if (params.returnToBuyer) {
+      if (!received || !order?.buyerSnapshot.email) {
+        throw new TicketingDomainError(
+          'UNPROCESSABLE_ENTITY',
+          'Este ingresso não foi recebido por transferência.'
+        );
+      }
+      return {
+        toUserId: order.buyerId,
+        email: order.buyerSnapshot.email,
+        name: order.buyerSnapshot.name || undefined,
+      };
+    }
+    if (received) {
+      throw new TicketingDomainError(
+        'TRANSFER_ONLY_TO_BUYER',
+        'Ingresso recebido só pode ser devolvido para quem comprou.'
+      );
+    }
+    if (!params.toUserId || !params.recipientEmail?.trim()) {
+      throw new TicketingDomainError('INVALID_ARGUMENT', 'Destinatário obrigatório.');
+    }
+    return {
+      toUserId: params.toUserId,
+      email: params.recipientEmail.trim(),
+      name: params.recipientName?.trim(),
+      receivedFrom: params.receivedFrom,
+    };
+  }
 }

=== server/domain/ticketing/services/ticketingServices.test.ts — diff ===
@@ -496,4 +496,80 @@ describe('serviços de ticketing', () => {
     expect(res.newTicket.status).toBe('issued');
     expect(res.newTicket.qrTokenHash).not.toBe(res.oldTicket.qrTokenHash);
   });
+
+  it('ingresso recebido só volta para quem comprou (D21)', async () => {
+    const received = {
+      id: 'tkt_recv',
+      orderId: 'ord_1',
+      eventListingId: 'evt_1',
+      occurrenceId: 'occ_1',
+      ticketTypeId: 'tt_1',
+      ownerUserId: 'user_to',
+      holderName: 'User To',
+      holderEmail: 'to@example.com',
+      qrTokenHash: 'h',
+      qrVersion: 2,
+      status: 'issued' as const,
+      issuedAt: '2026-10-05T00:00:00.000Z',
+    };
+    const order = {
+      id: 'ord_1',
+      buyerId: 'user_buyer',
+      buyerSnapshot: { name: 'Buyer', email: 'buyer@example.com' },
+      salesPolicySnapshot: { allowTicketTransfer: true, ticketTransferCutoffHours: 4 },
+    };
+    vi.mocked(mockPort.getTicketById).mockResolvedValue(received);
+    vi.mocked(mockPort.getOrderById).mockResolvedValue(order as never);
+    vi.mocked(mockPort.transferTicketAtomic).mockResolvedValue({
+      oldTicket: { ...received, status: 'transferred' },
+      newTicket: { ...received, id: 'tkt_back', ownerUserId: 'user_buyer' },
+    } as never);
+
+    await expect(
+      services.holders.transferTicket(
+        { uid: 'user_to' },
+        { ticketId: 'tkt_recv', toUserId: 'user_x', recipientEmail: 'x@example.com' }
+      )
+    ).rejects.toMatchObject({ code: 'TRANSFER_ONLY_TO_BUYER' });
+
+    await services.holders.transferTicket(
+      { uid: 'user_to' },
+      { ticketId: 'tkt_recv', returnToBuyer: true }
+    );
+    expect(mockPort.transferTicketAtomic).toHaveBeenLastCalledWith(
+      expect.objectContaining({ toUserId: 'user_buyer', recipientEmail: 'buyer@example.com' })
+    );
+    expect(vi.mocked(mockPort.transferTicketAtomic).mock.lastCall?.[0]).not.toHaveProperty(
+      'receivedFrom'
+    );
+  });
+
+  it('quem comprou não usa "devolver": transfere para quem quiser', async () => {
+    vi.mocked(mockPort.getTicketById).mockResolvedValue({
+      id: 'tkt_own',
+      orderId: 'ord_1',
+      eventListingId: 'evt_1',
+      occurrenceId: 'occ_1',
+      ticketTypeId: 'tt_1',
+      ownerUserId: 'user_buyer',
+      holderName: 'Buyer',
+      holderEmail: 'buyer@example.com',
+      qrTokenHash: 'h',
+      qrVersion: 1,
+      status: 'issued',
+      issuedAt: '2026-10-05T00:00:00.000Z',
+    });
+    vi.mocked(mockPort.getOrderById).mockResolvedValue({
+      id: 'ord_1',
+      buyerId: 'user_buyer',
+      buyerSnapshot: { name: 'Buyer', email: 'buyer@example.com' },
+      salesPolicySnapshot: { allowTicketTransfer: true, ticketTransferCutoffHours: 4 },
+    } as never);
+    await expect(
+      services.holders.transferTicket(
+        { uid: 'user_buyer' },
+        { ticketId: 'tkt_own', returnToBuyer: true }
+      )
+    ).rejects.toMatchObject({ code: 'UNPROCESSABLE_ENTITY' });
+  });
 });

=== server/domain/ticketing/types/ticketingTypes.ts — diff ===
@@ -178,6 +178,8 @@ export interface Ticket {
   checkedInBy?: string;
   /** "Problema com o QR Code?": o titular trocou o QR, que só pode ser trocado uma vez (D21). */
   qrSwappedAt?: string;
+  /** Ingresso recebido por transferência: de quem veio (@ e nome públicos). Só volta para quem comprou (D21). */
+  receivedFrom?: { username: string | null; displayName: string | null };
   /** Última mudança: a lista sem internet da portaria baixa só o que mudou (D21). */
   updatedAt?: string;
   transferredAt?: string;

=== server/interfaces/http/ticketTransfers/ticketTransferController.ts — ARQUIVO REESCRITO, substitua todo o conteúdo por este ===
import type { Response } from 'express';
import {
  TicketTransferError,
  transferTicketToUsernameApplicationUseCase,
} from '../../../application/usecases/ticketing/transferTicketToUsernameApplicationUseCase';
import { returnTicketToBuyerApplicationUseCase } from '../../../application/usecases/ticketing/returnTicketToBuyerApplicationUseCase';
import { TicketingDomainError } from '../../../domain/ticketing';
import { UsernameError } from '../../../domain/users';
import type { AuthenticatedRequest } from '../../../infrastructure/auth/authenticatedRequest';
import { ticketReturnSchema, ticketTransferSchema } from './ticketTransferSchema';

const TICKETING_STATUS: Record<TicketingDomainError['code'], number> = {
  INVALID_ARGUMENT: 400,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  TRANSFER_ONLY_TO_BUYER: 422,
  SERVICE_UNAVAILABLE: 503,
};

function sendError(res: Response, status: number, code: string, message: string): Response {
  return res.status(status).json({ error: { code, message } });
}

function sendTransferError(res: Response, error: unknown, operation: string): Response {
  if (error instanceof UsernameError) {
    return sendError(
      res,
      error.code === 'USERNAME_NOT_FOUND' ? 404 : 400,
      error.code,
      error.message
    );
  }
  if (error instanceof TicketTransferError) {
    return sendError(res, 422, error.code, error.message);
  }
  if (error instanceof TicketingDomainError) {
    return sendError(res, TICKETING_STATUS[error.code], error.code, error.message);
  }
  console.error(`[ticketTransfer.${operation}]`, error instanceof Error ? error.name : 'unknown');
  return sendError(res, 500, 'INTERNAL_ERROR', 'Não foi possível transferir o ingresso.');
}

export class TicketTransferController {
  static async transfer(req: AuthenticatedRequest, res: Response): Promise<Response> {
    const uid = req.user?.uid;
    if (!uid) return sendError(res, 401, 'UNAUTHENTICATED', 'Faça login.');
    const parsed = ticketTransferSchema.safeParse(req.body);
    if (!parsed.success) return sendError(res, 400, 'VALIDATION_ERROR', 'Dados inválidos.');
    try {
      const result = await transferTicketToUsernameApplicationUseCase(
        { uid, admin: req.user?.admin === true },
        parsed.data.ticketId,
        parsed.data.username
      );
      return res.status(200).json(result);
    } catch (error) {
      return sendTransferError(res, error, 'transfer');
    }
  }

  static async returnToBuyer(req: AuthenticatedRequest, res: Response): Promise<Response> {
    const uid = req.user?.uid;
    if (!uid) return sendError(res, 401, 'UNAUTHENTICATED', 'Faça login.');
    const parsed = ticketReturnSchema.safeParse(req.body);
    if (!parsed.success) return sendError(res, 400, 'VALIDATION_ERROR', 'Dados inválidos.');
    try {
      const result = await returnTicketToBuyerApplicationUseCase(
        { uid, admin: req.user?.admin === true },
        parsed.data.ticketId
      );
      return res.status(200).json(result);
    } catch (error) {
      return sendTransferError(res, error, 'returnToBuyer');
    }
  }
}

=== server/interfaces/http/ticketTransfers/ticketTransferRoutes.ts — diff ===
@@ -16,3 +16,9 @@ ticketTransferRouter.post(
   rateLimitByUser('ticket-transfer', 20, 60 * 60_000),
   TicketTransferController.transfer
 );
+ticketTransferRouter.post(
+  '/return',
+  verifyAuthTokenStrict,
+  rateLimitByUser('ticket-transfer', 20, 60 * 60_000),
+  TicketTransferController.returnToBuyer
+);

=== server/interfaces/http/ticketTransfers/ticketTransferSchema.ts — diff ===
@@ -6,3 +6,7 @@ export const ticketTransferSchema = z
     username: z.string().trim().min(3).max(31),
   })
   .strict();
+
+export const ticketReturnSchema = z
+  .object({ ticketId: z.string().trim().min(1).max(128) })
+  .strict();

=== src/domain/bookings/components/partner/SlotCheckInSheet.tsx — diff ===
@@ -1,8 +1,9 @@
-import { Camera } from 'lucide-react';
+import { Camera, ScanLine } from 'lucide-react';
 import { useCallback, useState } from 'react';
 import { useTranslation } from 'react-i18next';
 import { CodeBoxesInput } from '../../../../ui/components/CodeBoxesInput';
 import { Dialog } from '../../../../ui/components/Dialog';
+import { GateModeScreen, type GateOutcome } from '../../../../ui/components/GateModeScreen';
 import { StatusText } from '../../../../ui/components/StatusText';
 import { cn } from '../../../../shared/utils/cn';
 import { useQrScanner } from '../../../../ui/hooks/useQrScanner';
@@ -31,7 +32,24 @@ export function SlotCheckInSheet({
   const length = codeLengthFor(kind);
   const prefix = checkInPrefix(kind);
   const [code, setCode] = useState('');
-  const { submit, sending, result, pending } = useSlotCheckIn(offerId, slot.id, kind, onCheckedIn);
+  const { submit, evaluate, sending, result, pending } = useSlotCheckIn(
+    offerId,
+    slot.id,
+    kind,
+    onCheckedIn
+  );
+  const [gateMode, setGateMode] = useState(false);
+  const toOutcome = (outcome: Awaited<ReturnType<typeof evaluate>>): GateOutcome => ({
+    tone: outcome.tone,
+    headline: t(
+      outcome.tone === 'success'
+        ? 'gateMode.allowed'
+        : outcome.tone === 'warn'
+          ? 'gateMode.attention'
+          : 'gateMode.denied'
+    ),
+    detail: outcome.message,
+  });
 
   const onQr = useCallback(
     (qrToken: string) => {
@@ -52,6 +70,31 @@ export function SlotCheckInSheet({
       title={`${t(entry ? 'serviceProof.partner.entrySheetTitle' : 'serviceProof.partner.sheetTitle')} · ${formatSlotTime(slot.startsAt, i18n.language)}`}
     >
       <div className="space-y-5">
+        {entry && (
+          <button
+            type="button"
+            onClick={() => {
+              scanner.stop();
+              setGateMode(true);
+            }}
+            className={`${BUTTON_PRIMARY} w-full inline-flex items-center justify-center gap-2`}
+          >
+            <ScanLine size={18} aria-hidden="true" />
+            {t('gateMode.open')}
+          </button>
+        )}
+        {entry && gateMode && (
+          <GateModeScreen
+            title={`${t('serviceProof.partner.entrySheetTitle')} · ${formatSlotTime(slot.startsAt, i18n.language)}`}
+            online={typeof navigator === 'undefined' || navigator.onLine}
+            codePrefix={prefix}
+            codeLength={length}
+            codeAlphabet={CHECK_IN_ALPHABET}
+            onQr={async (qrToken) => toOutcome(await evaluate({ qrToken }))}
+            onCode={async (code) => toOutcome(await evaluate({ code }))}
+            onClose={() => setGateMode(false)}
+          />
+        )}
         {entry && (
           <div className="space-y-2">
             {/* O vídeo fica montado: a câmera liga nele assim que a permissão sai. */}
@@ -132,7 +175,7 @@ export function SlotCheckInSheet({
           type="button"
           onClick={() => void confirm()}
           disabled={sending || code.length !== length}
-          className={`${BUTTON_PRIMARY} w-full`}
+          className={`${entry ? BUTTON_SECONDARY : BUTTON_PRIMARY} w-full`}
         >
           {t('serviceProof.partner.submit')}
         </button>

=== src/domain/bookings/hooks/useSlotCheckIn.ts — diff ===
@@ -105,26 +105,22 @@ export function useSlotCheckIn(
     return () => window.removeEventListener('online', onOnline);
   }, [entry, offerId, sync]);
 
-  const submit = useCallback(
-    async (input: { code?: string; qrToken?: string }) => {
-      setSending(true);
-      setResult(null);
+  // Resultado de uma leitura sem tocar no estado da folha: o modo portaria mostra em tela cheia (D21).
+  const evaluate = useCallback(
+    async (input: { code?: string; qrToken?: string }): Promise<CheckInResult> => {
       try {
         const checkIn = await send(input);
-        setResult(describe(checkIn));
         onCheckedIn?.(checkIn.booking);
-        return true;
+        return describe(checkIn);
       } catch (error: unknown) {
         if (!isNetworkFailure(error)) {
-          setResult({ tone: 'danger', message: getBookingErrorMessage(error) });
-          return false;
+          return { tone: 'danger', message: getBookingErrorMessage(error) };
         }
         const offline = input.qrToken
           ? await verifyEntryPassOffline(offerId, slotId, input.qrToken)
           : 'unsupported';
         if (offline === 'invalid') {
-          setResult({ tone: 'danger', message: t('serviceProof.partner.offlineInvalid') });
-          return false;
+          return { tone: 'danger', message: t('serviceProof.partner.offlineInvalid') };
         }
         pendingCheckIns.add({
           offerId,
@@ -133,21 +129,40 @@ export function useSlotCheckIn(
           payload: { ...input, capturedAt: new Date().toISOString() },
         });
         setPending(pendingCheckIns.list(offerId).length);
-        setResult({
+        return {
           tone: offline === 'valid' ? 'success' : 'warn',
           message: t(
             offline === 'valid'
               ? 'serviceProof.partner.offlineValid'
               : 'serviceProof.partner.savedOffline'
           ),
-        });
-        return true;
+        };
+      }
+    },
+    [describe, entry, offerId, onCheckedIn, send, slotId, t]
+  );
+
+  const submit = useCallback(
+    async (input: { code?: string; qrToken?: string }) => {
+      setSending(true);
+      setResult(null);
+      try {
+        const outcome = await evaluate(input);
+        setResult(outcome);
+        return outcome.tone !== 'danger';
       } finally {
         setSending(false);
       }
     },
-    [describe, entry, offerId, onCheckedIn, send, slotId, t]
+    [evaluate]
   );
 
-  return { submit, sending, result, pending, clearResult: () => setResult(null) };
+  return {
+    submit,
+    evaluate,
+    sending,
+    result,
+    pending,
+    clearResult: () => setResult(null),
+  };
 }

=== src/domain/events/components/EventSessionsField.tsx — diff ===
@@ -49,7 +49,7 @@ export function EventSessionsField({ sessions, onChange, loadState }: EventSessi
         <button
           type="button"
           onClick={() => onChange([...sessions, newEventSessionDraft()])}
-          className="press min-h-11 px-4 rounded-xl bg-accent-soft text-accent text-[13px] font-semibold inline-flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-teal-400/50"
+          className="press shrink-0 whitespace-nowrap min-h-11 px-4 rounded-xl bg-accent-soft text-accent text-[13px] font-semibold inline-flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-teal-400/50"
         >
           <Plus size={16} aria-hidden="true" /> {t('eventSessions.add')}
         </button>

=== src/domain/ticketing/adapters/httpTicketingAdapter.ts — diff ===
@@ -233,6 +233,21 @@ export class HttpTicketingAdapter implements TicketingPort {
     return parseJsonOrThrow<OfflineCheckInChanges>(res, 'Não foi possível atualizar a lista.');
   }
 
+  async returnTicketToBuyer(ticketId: string): Promise<{ ticketId: string }> {
+    const res = await firebaseApiFetch(
+      '/api/ticket-transfers/return',
+      {
+        method: 'POST',
+        headers: { 'Content-Type': 'application/json' },
+        body: JSON.stringify({ ticketId }),
+      },
+      { requireAuth: true }
+    );
+    const body = await res.json().catch(() => ({}));
+    if (!res.ok) throw new Error(body?.error?.code || 'INTERNAL_ERROR');
+    return body;
+  }
+
   async swapTicketQr(ticketId: string): Promise<TicketQrPass> {
     const res = await firebaseApiFetch(
       `/api/ticketing/tickets/${encodeURIComponent(ticketId)}/qr/swap`,

=== src/domain/ticketing/application/usecases/returnTicketToBuyerUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { ticketingAdapter } from '../../factory';

export function returnTicketToBuyerUseCase(ticketId: string) {
  return ticketingAdapter.returnTicketToBuyer(ticketId);
}

=== src/domain/ticketing/components/PartnerEventTicketingManager.tsx — diff ===
@@ -1,5 +1,7 @@
 import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
 import { type ReactNode, useEffect, useState } from 'react';
+import { useTranslation } from 'react-i18next';
+import { formatBusinessDateTime } from '../../../shared/utils/businessDateTime';
 import { type EventOccurrence, useEventOccurrences } from '../../events';
 import { usePartnerEventSales } from '../hooks/usePartnerEventSales';
 import { useTicketLotForm } from '../hooks/useTicketLotForm';
@@ -63,6 +65,7 @@ export function PartnerEventTicketingManager({
 
   const lotForm = useTicketLotForm({ selectedOccurrenceId, reloadLots, setFeedback });
 
+  const { i18n } = useTranslation();
   const selectedOccurrence = occurrences.find((occ) => occ.id === selectedOccurrenceId);
   const paidOrders = orders.filter(
     (order) =>
@@ -159,6 +162,11 @@ export function PartnerEventTicketingManager({
       ) : activeTab === 'checkin' ? (
         <CheckInTab
           occurrenceId={selectedOccurrenceId}
+          sessionLabel={
+            selectedOccurrence
+              ? formatBusinessDateTime(selectedOccurrence.startsAt, i18n.language)
+              : ''
+          }
           checkIns={checkIns}
           performCheckIn={performCheckIn}
           reloadSales={reloadSales}

=== src/domain/ticketing/components/UserTicketsHistoryView.tsx — diff ===
@@ -129,6 +129,7 @@ export function UserTicketsHistoryView({ onBack }: UserTicketsHistoryViewProps =
         <TransferTicketForm
           ticket={actions.transferTicket}
           onSubmit={actions.submitTransfer}
+          onReturn={actions.submitReturn}
           onCancel={() => actions.setTransferTicket(null)}
         />
       )}

=== src/domain/ticketing/components/manager/CheckInTab.tsx — diff ===
@@ -1,20 +1,29 @@
+import { ScanLine } from 'lucide-react';
+import { useState } from 'react';
 import { useTranslation } from 'react-i18next';
+import { CHECK_IN_ALPHABET } from '../../../../shared/constants/checkInCode';
 import { formatBusinessDateTime } from '../../../../shared/utils/businessDateTime';
+import { GateModeScreen, type GateOutcome } from '../../../../ui/components/GateModeScreen';
+import { BUTTON_PRIMARY } from '../../../../ui/styles/controls';
 import { useOfflineTicketSession } from '../../hooks/useOfflineTicketSession';
 import type { usePartnerEventSales } from '../../hooks/usePartnerEventSales';
 import { useTicketGate } from '../../hooks/useTicketGate';
 import type { EventCheckIn } from '../../types/ticketing';
+import { TICKET_CODE_LENGTH, TICKET_CODE_PREFIX } from '../../utils/ticketCode';
 import { OfflineSessionCard } from './OfflineSessionCard';
 import { TicketGateCard } from './TicketGateCard';
 
 /** Aba de check-in do evento: portaria, sessão sem internet e entradas já feitas. */
 export function CheckInTab({
   occurrenceId,
+  sessionLabel,
   checkIns,
   performCheckIn,
   reloadSales,
 }: {
   occurrenceId: string;
+  /** Nome do evento e horário da sessão, no topo do modo portaria. */
+  sessionLabel: string;
   checkIns: EventCheckIn[];
   performCheckIn: ReturnType<typeof usePartnerEventSales>['performCheckIn'];
   reloadSales: () => Promise<void> | void;
@@ -30,9 +39,44 @@ export function CheckInTab({
     },
     onOfflineRecorded: session.refresh,
   });
+  const [gateMode, setGateMode] = useState(false);
+
+  const toOutcome = (result: Awaited<ReturnType<typeof gate.evaluate>>): GateOutcome => ({
+    tone: result.tone,
+    headline: t(
+      result.tone === 'success'
+        ? 'gateMode.allowed'
+        : result.tone === 'warn'
+          ? 'gateMode.attention'
+          : 'gateMode.denied'
+    ),
+    detail: result.detail ?? result.message,
+  });
 
   return (
     <div className="space-y-4">
+      <button
+        type="button"
+        onClick={() => setGateMode(true)}
+        disabled={!occurrenceId}
+        className={`${BUTTON_PRIMARY} w-full inline-flex items-center justify-center gap-2`}
+      >
+        <ScanLine size={18} aria-hidden="true" />
+        {t('gateMode.open')}
+      </button>
+      {gateMode && (
+        <GateModeScreen
+          title={sessionLabel}
+          stats={t('ticketGate.entries', { count: checkIns.length })}
+          online={session.isOnline}
+          codePrefix={TICKET_CODE_PREFIX}
+          codeLength={TICKET_CODE_LENGTH}
+          codeAlphabet={CHECK_IN_ALPHABET}
+          onQr={async (qrToken) => toOutcome(await gate.evaluate({ qrToken }))}
+          onCode={async (code) => toOutcome(await gate.evaluate({ code }))}
+          onClose={() => setGateMode(false)}
+        />
+      )}
       <TicketGateCard gate={gate} />
       <OfflineSessionCard session={session} />
       {checkIns.length > 0 && (

=== src/domain/ticketing/components/manager/TicketGateCard.tsx — diff ===
@@ -6,7 +6,7 @@ import { cn } from '../../../../shared/utils/cn';
 import { CodeBoxesInput } from '../../../../ui/components/CodeBoxesInput';
 import { StatusText } from '../../../../ui/components/StatusText';
 import { useQrScanner } from '../../../../ui/hooks/useQrScanner';
-import { BUTTON_PRIMARY, BUTTON_SECONDARY } from '../../../../ui/styles/controls';
+import { BUTTON_SECONDARY } from '../../../../ui/styles/controls';
 import type { useTicketGate } from '../../hooks/useTicketGate';
 import { TICKET_CODE_LENGTH, TICKET_CODE_PREFIX } from '../../utils/ticketCode';
 
@@ -83,7 +83,7 @@ export function TicketGateCard({ gate }: { gate: ReturnType<typeof useTicketGate
         type="button"
         onClick={() => void confirm()}
         disabled={sending || code.length !== TICKET_CODE_LENGTH}
-        className={`${BUTTON_PRIMARY} w-full`}
+        className={`${BUTTON_SECONDARY} w-full`}
       >
         {t('ticketGate.submit')}
       </button>

=== src/domain/ticketing/components/wallet/TransferTicketForm.tsx — diff ===
@@ -11,16 +11,24 @@ const KNOWN_ERRORS = [
   'TRANSFER_TO_SELF',
   'RECIPIENT_NOT_VERIFIED',
   'RATE_LIMITED',
+  'TRANSFER_ONLY_TO_BUYER',
 ];
 
 interface TransferTicketFormProps {
   ticket: Ticket;
   onSubmit: (username: string) => Promise<void>;
+  /** Ingresso recebido: só volta para quem comprou (D21). */
+  onReturn: () => Promise<void>;
   onCancel: () => void;
 }
 
 /** Transferência pelo @ (D21): procura a conta, mostra foto, nome e @ e só então transfere. */
-export function TransferTicketForm({ ticket, onSubmit, onCancel }: TransferTicketFormProps) {
+export function TransferTicketForm({
+  ticket,
+  onSubmit,
+  onReturn,
+  onCancel,
+}: TransferTicketFormProps) {
   const { t } = useTranslation();
   const inputId = useId();
   const [value, setValue] = useState('');
@@ -59,6 +67,49 @@ export function TransferTicketForm({ ticket, onSubmit, onCancel }: TransferTicke
     }
   };
 
+  const giveBack = async () => {
+    setBusy(true);
+    setError(null);
+    try {
+      await onReturn();
+    } catch (err: unknown) {
+      fail(err);
+    } finally {
+      setBusy(false);
+    }
+  };
+
+  const sender = ticket.receivedFrom;
+  if (sender) {
+    const senderLabel = sender.username ? `@${sender.username}` : (sender.displayName ?? '');
+    return (
+      <section className="p-4 rounded-[20px] bg-surface border border-accent-line space-y-4">
+        <h4 className="text-sm font-semibold text-ink">{t('username.transfer.returnTitle')}</h4>
+        <p className="text-[13px] text-ink/70">
+          {t('username.transfer.returnHint', { name: senderLabel })}
+        </p>
+        {error && (
+          <p role="alert">
+            <StatusText tone="danger">{error}</StatusText>
+          </p>
+        )}
+        <button
+          type="button"
+          disabled={busy}
+          onClick={() => void giveBack()}
+          className={`${BUTTON_PRIMARY} w-full`}
+        >
+          {t('username.transfer.returnConfirm', { name: senderLabel })}
+        </button>
+        <div className="flex justify-center">
+          <TextButton tone="ink" onClick={onCancel}>
+            {t('common.cancel')}
+          </TextButton>
+        </div>
+      </section>
+    );
+  }
+
   return (
     <section className="p-4 rounded-[20px] bg-surface border border-accent-line space-y-4">
       <h4 className="text-sm font-semibold text-ink">

=== src/domain/ticketing/components/wallet/WalletTicketCard.tsx — diff ===
@@ -131,7 +131,11 @@ export function WalletTicketCard({
               className={cn(ACTION, 'flex-1 bg-accent-soft border border-accent-line text-accent')}
             >
               <Send size={14} aria-hidden="true" />
-              {t('ticketWallet.actions.transfer')}
+              {t(
+                ticket.receivedFrom
+                  ? 'ticketWallet.actions.return'
+                  : 'ticketWallet.actions.transfer'
+              )}
             </button>
           )}
         </div>

=== src/domain/ticketing/hooks/useTicketGate.ts — diff ===
@@ -6,6 +6,8 @@ import { verifyAndConsumeOfflineQrToken } from '../utils/offlineTicketVerifier';
 export interface GateResult {
   tone: 'success' | 'warn' | 'danger';
   message: string;
+  /** Nome e tipo do ingresso, em destaque na tela verde do modo portaria. */
+  detail?: string;
 }
 
 type GateInput = { qrToken: string } | { code: string };
@@ -53,38 +55,44 @@ export function useTicketGate({
     [occurrenceId, onOfflineRecorded, t]
   );
 
-  const submit = useCallback(
-    async (input: GateInput): Promise<boolean> => {
-      if (!occurrenceId) return false;
-      setSending(true);
-      setResult(null);
+  // Resultado de uma leitura, sem tocar no estado: o modo portaria mostra em tela cheia (D21).
+  const evaluate = useCallback(
+    async (input: GateInput): Promise<GateResult> => {
       try {
         const { ticket } = await performCheckIn(occurrenceId, input);
-        setResult({
+        const name = ticket.holderName || t('ticketGate.holderFallback');
+        const type = ticket.ticketTypeSnapshot?.name || t('ticketCheckout.issued.defaultType');
+        return {
           tone: 'success',
-          message: t('ticketGate.success', {
-            name: ticket.holderName || t('ticketGate.holderFallback'),
-            type: ticket.ticketTypeSnapshot?.name || t('ticketCheckout.issued.defaultType'),
-          }),
-        });
-        return true;
+          message: t('ticketGate.success', { name, type }),
+          detail: `${name} · ${type}`,
+        };
       } catch (error: unknown) {
-        if (isNetworkFailure(error)) {
-          const outcome = await offline(input);
-          setResult(outcome);
-          return outcome.tone === 'success';
-        }
-        setResult({
+        if (isNetworkFailure(error)) return offline(input);
+        return {
           tone: 'danger',
           message: error instanceof Error && error.message ? error.message : t('ticketGate.failed'),
-        });
-        return false;
+        };
+      }
+    },
+    [occurrenceId, offline, performCheckIn, t]
+  );
+
+  const submit = useCallback(
+    async (input: GateInput): Promise<boolean> => {
+      if (!occurrenceId) return false;
+      setSending(true);
+      setResult(null);
+      try {
+        const outcome = await evaluate(input);
+        setResult(outcome);
+        return outcome.tone === 'success';
       } finally {
         setSending(false);
       }
     },
-    [occurrenceId, offline, performCheckIn, t]
+    [evaluate, occurrenceId]
   );
 
-  return { submit, sending, result };
+  return { submit, evaluate, sending, result };
 }

=== src/domain/ticketing/hooks/useTicketWalletActions.ts — diff ===
@@ -81,6 +81,19 @@ export function useTicketWalletActions(wallet: WalletData) {
     setFeedback({ type: 'success', message: t('username.transfer.done', { username }) });
   };
 
+  const submitReturn = async () => {
+    if (!transferTicket) return;
+    const sender = transferTicket.receivedFrom;
+    await wallet.returnToBuyer(transferTicket.id);
+    setTransferTicket(null);
+    setFeedback({
+      type: 'success',
+      message: t('username.transfer.returned', {
+        name: sender?.username ? `@${sender.username}` : (sender?.displayName ?? ''),
+      }),
+    });
+  };
+
   const requestRefund = (order: TicketOrder) =>
     run(async () => {
       await wallet.requestRefund(order.id, 'buyer_wallet');
@@ -114,6 +127,7 @@ export function useTicketWalletActions(wallet: WalletData) {
     transferTicket,
     setTransferTicket,
     submitTransfer,
+    submitReturn,
     requestRefund,
     resumingOrder,
     setResumingOrder,

=== src/domain/ticketing/hooks/useUserTickets.ts — diff ===
@@ -2,6 +2,7 @@ import { useCallback, useEffect, useState } from 'react';
 import { getTicketQrTokenUseCase } from '../application/usecases/getTicketQrTokenUseCase';
 import { listUserOrdersUseCase } from '../application/usecases/listUserOrdersUseCase';
 import { listUserTicketsUseCase } from '../application/usecases/listUserTicketsUseCase';
+import { returnTicketToBuyerUseCase } from '../application/usecases/returnTicketToBuyerUseCase';
 import { swapTicketQrUseCase } from '../application/usecases/swapTicketQrUseCase';
 import { requestTicketRefundUseCase } from '../application/usecases/requestTicketRefundUseCase';
 import { transferTicketUseCase } from '../application/usecases/transferTicketUseCase';
@@ -50,6 +51,16 @@ export function useUserTicketsAndOrders(enabled = true) {
     [reload]
   );
 
+  const returnToBuyer = useCallback(
+    async (ticketId: string) => {
+      setError(null);
+      const res = await returnTicketToBuyerUseCase(ticketId);
+      await reload();
+      return res;
+    },
+    [reload]
+  );
+
   const requestRefund = useCallback(
     async (orderId: string, reason: string, ticketId?: string) => {
       setError(null);
@@ -85,6 +96,7 @@ export function useUserTicketsAndOrders(enabled = true) {
     error,
     reload,
     transferTicket,
+    returnToBuyer,
     requestRefund,
     getSignedQrToken,
     swapSignedQrToken,

=== src/domain/ticketing/ports/ticketingPort.ts — diff ===
@@ -110,6 +110,8 @@ export interface TicketingPort {
     ticketId: string,
     username: string
   ): Promise<{ ticketId: string; recipient: { username: string; displayName: string | null } }>;
+  /** Devolve o ingresso recebido para quem comprou (D21). */
+  returnTicketToBuyer(ticketId: string): Promise<{ ticketId: string }>;
   checkInTicket(input: {
     occurrenceId: string;
     ticketId?: string;

=== src/domain/ticketing/types/ticketing.ts — diff ===
@@ -162,6 +162,8 @@ export interface Ticket {
   qrVersion: number;
   /** O titular já usou "Problema com o QR Code?" (só uma vez por ingresso, D21). */
   qrSwappedAt?: string;
+  /** Recebido por transferência: de quem veio. Só pode voltar para essa pessoa (D21). */
+  receivedFrom?: { username: string | null; displayName: string | null };
   status: TicketStatus;
   ticketTypeSnapshot?: {
     name: string;

=== src/index.css — diff ===
@@ -22,6 +22,18 @@
   --animate-pulse-slow: pulse-slow 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
 
   /* Transições de app nativo: entrada e saída curtas, curva de desaceleração (iOS/Material). */
+  /* Barra fina que sobe e desce dentro da moldura do leitor (modo portaria, D21). */
+  @keyframes scan-line {
+    0%,
+    100% {
+      top: 4%;
+    }
+    50% {
+      top: 96%;
+    }
+  }
+  --animate-scan-line: scan-line 2.4s ease-in-out infinite;
+
   @keyframes fade-in {
     from {
       opacity: 0;
@@ -198,6 +210,23 @@
   --ug-seal-soft: rgba(59, 130, 246, 0.12);
 }
 
+/* Modo portaria (D21): sempre escuro, mesmo no tema claro, para gastar menos bateria em telas OLED. */
+.ug-force-dark {
+  --ug-app: #0d0e10;
+  --ug-ink: #ffffff;
+  --ug-surface: #1e2024;
+  --ug-surface-solid: #1e2024;
+  --ug-line: rgba(255, 255, 255, 0.08);
+  --ug-accent: #5eead4;
+  --ug-accent-soft: rgba(20, 184, 166, 0.12);
+  --ug-accent-line: rgba(20, 184, 166, 0.35);
+  --ug-warn: #fcd34d;
+  --ug-warn-soft: rgba(245, 158, 11, 0.1);
+  --ug-success: #6ee7b7;
+  --ug-danger: #fda4af;
+  color-scheme: dark;
+}
+
 /* Tema claro em tons de linho: fundo, superfícies e tinta quentes, sem branco puro. */
 :root.light {
   --glass-bg: rgba(35, 29, 22, 0.04);

=== src/shared/i18n/gateModeResources.ts — ARQUIVO NOVO, conteúdo completo ===
/** Textos do modo portaria (D21), comum a eventos e entradas de atração. pt-BR é a fonte. */
export interface GateModeTranslation {
  open: string;
  online: string;
  offline: string;
  close: string;
  lowBattery: string;
  aim: string;
  opening: string;
  standby: string;
  cameraDenied: string;
  unsupported: string;
  resume: string;
  enterCode: string;
  torch: string;
  next: string;
  codeTitle: string;
  codeLabel: string;
  character: string;
  confirmCode: string;
  failed: string;
  allowed: string;
  denied: string;
  attention: string;
}

export const gateModePtBR: GateModeTranslation = {
  open: 'Abrir modo portaria',
  online: 'Com internet',
  offline: 'Sem internet',
  close: 'Sair do modo portaria',
  lowBattery: 'Bateria baixa. Ligue o carregador para não parar a portaria.',
  aim: 'Aponte para o QR Code dentro da moldura',
  opening: 'Abrindo a câmera…',
  standby: 'Câmera em espera para poupar bateria.',
  cameraDenied: 'Sem acesso à câmera. Use “Inserir código”.',
  unsupported: 'Não foi possível abrir o leitor. Use “Inserir código”.',
  resume: 'Toque para continuar',
  enterCode: 'Inserir código',
  torch: 'Lanterna',
  next: 'Próximo',
  codeTitle: 'Código Token',
  codeLabel: 'Código que aparece abaixo do QR Code',
  character: 'Caractere {{n}} de {{total}}',
  confirmCode: 'Confirmar',
  failed: 'Não foi possível validar. Tente de novo.',
  allowed: 'Entrada liberada',
  denied: 'Entrada recusada',
  attention: 'Atenção',
};

export const gateModeEn: GateModeTranslation = {
  open: 'Open entrance mode',
  online: 'Online',
  offline: 'Offline',
  close: 'Leave entrance mode',
  lowBattery: 'Low battery. Plug in the charger so the entrance does not stop.',
  aim: 'Point at the QR code inside the frame',
  opening: 'Opening the camera…',
  standby: 'Camera on standby to save battery.',
  cameraDenied: 'No camera access. Use “Enter code”.',
  unsupported: 'The reader could not open. Use “Enter code”.',
  resume: 'Tap to continue',
  enterCode: 'Enter code',
  torch: 'Flashlight',
  next: 'Next',
  codeTitle: 'Token code',
  codeLabel: 'Code shown below the QR code',
  character: 'Character {{n}} of {{total}}',
  confirmCode: 'Confirm',
  failed: 'Could not validate. Try again.',
  allowed: 'Entry allowed',
  denied: 'Entry refused',
  attention: 'Attention',
};

export const gateModeFr: GateModeTranslation = {
  open: 'Ouvrir le mode accueil',
  online: 'En ligne',
  offline: 'Hors ligne',
  close: 'Quitter le mode accueil',
  lowBattery: 'Batterie faible. Branchez le chargeur pour ne pas arrêter l’accueil.',
  aim: 'Visez le QR code dans le cadre',
  opening: 'Ouverture de la caméra…',
  standby: 'Caméra en veille pour économiser la batterie.',
  cameraDenied: 'Pas d’accès à la caméra. Utilisez « Saisir le code ».',
  unsupported: 'Le lecteur n’a pas pu s’ouvrir. Utilisez « Saisir le code ».',
  resume: 'Touchez pour continuer',
  enterCode: 'Saisir le code',
  torch: 'Lampe',
  next: 'Suivant',
  codeTitle: 'Code jeton',
  codeLabel: 'Code affiché sous le QR code',
  character: 'Caractère {{n}} sur {{total}}',
  confirmCode: 'Confirmer',
  failed: 'Impossible de valider. Réessayez.',
  allowed: 'Entrée autorisée',
  denied: 'Entrée refusée',
  attention: 'Attention',
};

=== src/shared/i18n/resources.ts — diff ===
@@ -122,6 +122,12 @@ import {
   eventSessionsFr,
   eventSessionsPtBR,
 } from './eventSessionsResources';
+import {
+  type GateModeTranslation,
+  gateModeEn,
+  gateModeFr,
+  gateModePtBR,
+} from './gateModeResources';
 import { type LegalTranslation, legalEn, legalFr, legalPtBR } from './legalResources';
 import {
   type VerificationTranslation,
@@ -152,6 +158,7 @@ export interface TranslationResource {
   ticketGate: TicketGateTranslation;
   username: UsernameTranslation;
   eventSessions: EventSessionsTranslation;
+  gateMode: GateModeTranslation;
   legal: LegalTranslation;
   verification: VerificationTranslation;
   common: {
@@ -386,6 +393,7 @@ const ptBR: TranslationResource = {
   ticketGate: ticketGatePtBR,
   username: usernamePtBR,
   eventSessions: eventSessionsPtBR,
+  gateMode: gateModePtBR,
   legal: legalPtBR,
   verification: verificationPtBR,
   common: {
@@ -680,6 +688,7 @@ const en: TranslationResource = {
   ticketGate: ticketGateEn,
   username: usernameEn,
   eventSessions: eventSessionsEn,
+  gateMode: gateModeEn,
   legal: legalEn,
   verification: verificationEn,
   common: {
@@ -968,6 +977,7 @@ const fr: TranslationResource = {
   ticketGate: ticketGateFr,
   username: usernameFr,
   eventSessions: eventSessionsFr,
+  gateMode: gateModeFr,
   legal: legalFr,
   verification: verificationFr,
   common: {

=== src/shared/i18n/ticketGateResources.ts — diff ===
@@ -45,6 +45,8 @@ export interface TicketGateTranslation {
   syncedConflicts_one: string;
   syncedConflicts_other: string;
   recent: string;
+  entries_one: string;
+  entries_other: string;
   ticketRef: string;
   method: { online: string; offline: string };
 }
@@ -97,6 +99,8 @@ export const ticketGatePtBR: TicketGateTranslation = {
   syncedConflicts_one: '{{count}} entrada já tinha sido feita em outro aparelho.',
   syncedConflicts_other: '{{count}} entradas já tinham sido feitas em outro aparelho.',
   recent: 'Entradas feitas',
+  entries_one: '{{count}} entrada',
+  entries_other: '{{count}} entradas',
   ticketRef: 'Ingresso #{{id}}',
   method: { online: 'com internet', offline: 'enviada depois' },
 };
@@ -147,6 +151,8 @@ export const ticketGateEn: TicketGateTranslation = {
   syncedConflicts_one: '{{count}} entry had already been made on another device.',
   syncedConflicts_other: '{{count}} entries had already been made on another device.',
   recent: 'Entries made',
+  entries_one: '{{count}} entry',
+  entries_other: '{{count}} entries',
   ticketRef: 'Ticket #{{id}}',
   method: { online: 'online', offline: 'sent later' },
 };
@@ -199,6 +205,8 @@ export const ticketGateFr: TicketGateTranslation = {
   syncedConflicts_one: '{{count}} entrée avait déjà été faite sur un autre appareil.',
   syncedConflicts_other: '{{count}} entrées avaient déjà été faites sur un autre appareil.',
   recent: 'Entrées faites',
+  entries_one: '{{count}} entrée',
+  entries_other: '{{count}} entrées',
   ticketRef: 'Billet #{{id}}',
   method: { online: 'en ligne', offline: 'envoyée ensuite' },
 };

=== src/shared/i18n/ticketWalletResources.ts — diff ===
@@ -23,7 +23,7 @@ export interface TicketWalletTranslation {
   order: string;
   ticketCount_one: string;
   ticketCount_other: string;
-  actions: { showQr: string; transfer: string };
+  actions: { showQr: string; transfer: string; return: string };
   swap: { action: string; title: string; message: string; confirm: string };
   ticketStatus: Record<TicketStatusKey, string>;
   resume: { title: string; close: string };
@@ -59,6 +59,7 @@ export const ticketWalletPtBR: TicketWalletTranslation = {
   actions: {
     showQr: 'Ver QR',
     transfer: 'Transferir',
+    return: 'Devolver',
   },
   swap: {
     action: 'Problema com o QR Code?',
@@ -115,6 +116,7 @@ export const ticketWalletEn: TicketWalletTranslation = {
   actions: {
     showQr: 'Show QR',
     transfer: 'Transfer',
+    return: 'Give back',
   },
   swap: {
     action: 'Problem with the QR code?',
@@ -172,6 +174,7 @@ export const ticketWalletFr: TicketWalletTranslation = {
   actions: {
     showQr: 'Voir le QR',
     transfer: 'Transférer',
+    return: 'Rendre',
   },
   swap: {
     action: 'Un problème avec le QR code ?',

=== src/shared/i18n/usernameResources.ts — diff ===
@@ -26,7 +26,12 @@ export interface UsernameTranslation {
     other: string;
     hint: string;
     done: string;
+    returnTitle: string;
+    returnHint: string;
+    returnConfirm: string;
+    returned: string;
     errors: {
+      TRANSFER_ONLY_TO_BUYER: string;
       USERNAME_NOT_FOUND: string;
       TRANSFER_TO_SELF: string;
       RECIPIENT_NOT_VERIFIED: string;
@@ -38,7 +43,8 @@ export interface UsernameTranslation {
 
 export const usernamePtBR: UsernameTranslation = {
   title: 'Nome de usuário',
-  intro: 'É assim que outras pessoas encontram você para transferir ingressos.',
+  intro:
+    'Seu nome de usuário identifica você no Use Guide. Outras pessoas podem usá-lo para encontrar sua conta, por exemplo ao enviar um ingresso.',
   label: 'Seu @',
   rules: 'De 3 a 30 letras, números, ponto ou sublinhado. Sem espaços nem acentos.',
   save: 'Salvar',
@@ -64,7 +70,13 @@ export const usernamePtBR: UsernameTranslation = {
     other: 'Procurar outra pessoa',
     hint: 'O ingresso sai da sua carteira, e o QR Code atual deixa de valer.',
     done: 'Ingresso transferido para @{{username}}.',
+    returnTitle: 'Devolver ingresso',
+    returnHint:
+      'Você recebeu este ingresso de {{name}}. Ingresso recebido só pode voltar para quem comprou.',
+    returnConfirm: 'Devolver para {{name}}',
+    returned: 'Ingresso devolvido para {{name}}.',
     errors: {
+      TRANSFER_ONLY_TO_BUYER: 'Ingresso recebido só pode ser devolvido para quem comprou.',
       USERNAME_NOT_FOUND: 'Nenhuma conta com este @. Peça para a pessoa conferir em Configurações.',
       TRANSFER_TO_SELF: 'Este ingresso já é seu.',
       RECIPIENT_NOT_VERIFIED:
@@ -77,7 +89,8 @@ export const usernamePtBR: UsernameTranslation = {
 
 export const usernameEn: UsernameTranslation = {
   title: 'Username',
-  intro: 'This is how other people find you to transfer tickets.',
+  intro:
+    'Your username identifies you on Use Guide. Other people can use it to find your account, for example when sending you a ticket.',
   label: 'Your @',
   rules: '3 to 30 letters, numbers, dot or underscore. No spaces or accents.',
   save: 'Save',
@@ -102,7 +115,13 @@ export const usernameEn: UsernameTranslation = {
     other: 'Search someone else',
     hint: 'The ticket leaves your wallet and the current QR code stops working.',
     done: 'Ticket transferred to @{{username}}.',
+    returnTitle: 'Give the ticket back',
+    returnHint:
+      'You received this ticket from {{name}}. A received ticket can only go back to the buyer.',
+    returnConfirm: 'Give back to {{name}}',
+    returned: 'Ticket given back to {{name}}.',
     errors: {
+      TRANSFER_ONLY_TO_BUYER: 'A received ticket can only be given back to the buyer.',
       USERNAME_NOT_FOUND: 'No account with this @. Ask the person to check it in Settings.',
       TRANSFER_TO_SELF: 'This ticket is already yours.',
       RECIPIENT_NOT_VERIFIED:
@@ -115,7 +134,8 @@ export const usernameEn: UsernameTranslation = {
 
 export const usernameFr: UsernameTranslation = {
   title: 'Nom d’utilisateur',
-  intro: 'C’est ainsi que les autres vous trouvent pour vous transférer des billets.',
+  intro:
+    'Votre nom d’utilisateur vous identifie sur Use Guide. D’autres personnes peuvent l’utiliser pour trouver votre compte, par exemple pour vous envoyer un billet.',
   label: 'Votre @',
   rules: 'De 3 à 30 lettres, chiffres, point ou tiret bas. Sans espaces ni accents.',
   save: 'Enregistrer',
@@ -141,7 +161,13 @@ export const usernameFr: UsernameTranslation = {
     other: 'Chercher une autre personne',
     hint: 'Le billet quitte votre portefeuille et le QR code actuel ne fonctionne plus.',
     done: 'Billet transféré à @{{username}}.',
+    returnTitle: 'Rendre le billet',
+    returnHint:
+      'Vous avez reçu ce billet de {{name}}. Un billet reçu ne peut revenir qu’à la personne qui l’a acheté.',
+    returnConfirm: 'Rendre à {{name}}',
+    returned: 'Billet rendu à {{name}}.',
     errors: {
+      TRANSFER_ONLY_TO_BUYER: 'Un billet reçu ne peut être rendu qu’à la personne qui l’a acheté.',
       USERNAME_NOT_FOUND:
         'Aucun compte avec ce @. Demandez à la personne de le vérifier dans Réglages.',
       TRANSFER_TO_SELF: 'Ce billet est déjà à vous.',

=== src/ui/components/GateModeScreen.test.tsx — ARQUIVO NOVO, conteúdo completo ===
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { i18n } from '../../shared/i18n';
import { GateModeScreen } from './GateModeScreen';

describe('modo portaria (D21)', () => {
  beforeAll(async () => {
    await i18n.changeLanguage('pt-BR');
  });

  it('código digitado mostra o resultado até "Próximo" e volta para a leitura', async () => {
    const onCode = vi.fn().mockResolvedValue({
      tone: 'danger',
      headline: 'Entrada recusada',
      detail: 'Este ingresso já entrou às 21:14.',
    });
    render(
      <GateModeScreen
        title="Luau"
        online
        codePrefix="INGR"
        codeLength={8}
        codeAlphabet="23456789ABCDEFGHJKMNPQRSTUVWXYZ"
        onQr={vi.fn()}
        onCode={onCode}
        onClose={vi.fn()}
      />
    );
    // Sem câmera no ambiente de teste: a tela orienta a usar o código.
    expect(await screen.findByText(/Use “Inserir código”/)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Inserir código' }));
    const boxes = await screen.findAllByRole('textbox');
    fireEvent.paste(boxes[0] as HTMLElement, {
      clipboardData: { getData: () => 'INGR:K7M4QXAB' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar' }));
    await waitFor(() => expect(onCode).toHaveBeenCalledWith('K7M4QXAB'));
    expect(await screen.findByText('Entrada recusada')).toBeTruthy();
    expect(screen.getAllByRole('button', { name: 'Inserir código' })).toHaveLength(2);
    fireEvent.click(screen.getByRole('button', { name: 'Próximo' }));
    expect(screen.queryByText('Entrada recusada')).toBeNull();
  });
});

=== src/ui/components/GateModeScreen.tsx — ARQUIVO NOVO, conteúdo completo ===
import { BatteryLow, Check, Flashlight, Keyboard, Wifi, WifiOff, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Z_INDEX } from '../../shared/constants/zIndex';
import { cn } from '../../shared/utils/cn';
import { useLowBattery } from '../hooks/useLowBattery';
import { useQrScanner } from '../hooks/useQrScanner';
import { useScreenWakeLock } from '../hooks/useScreenWakeLock';
import { BUTTON_PRIMARY, BUTTON_SECONDARY } from '../styles/controls';
import { CodeBoxesInput } from './CodeBoxesInput';
import { Dialog } from './Dialog';

/** Resultado de uma leitura: fica na tela até a equipe tocar em "Próximo". */
export interface GateOutcome {
  tone: 'success' | 'danger' | 'warn';
  headline: string;
  detail?: string;
}

export interface GateModeScreenProps {
  title: string;
  /** Ex.: "312 de 450 entraram". */
  stats?: string;
  online: boolean;
  codePrefix: string;
  codeLength: number;
  codeAlphabet: string;
  onQr: (token: string) => Promise<GateOutcome>;
  onCode: (code: string) => Promise<GateOutcome>;
  onClose: () => void;
}

// Mesmo recorte do leitor (useQrScanner): 80% do lado menor da área da câmera.
const FRAME_SIZE = 'min(80cqw, 80cqh)';

// Sem leitura por 8 s, o botão do código ganha destaque (D21).
const CODE_HINT_AFTER_MS = 8_000;

const OUTCOME_STYLE: Record<GateOutcome['tone'], string> = {
  success: 'bg-[#047857] text-[#ffffff]',
  danger: 'bg-[#be123c] text-[#ffffff]',
  warn: 'bg-[#f59e0b] text-[#0d0e10]',
};

function vibrate(tone: GateOutcome['tone']) {
  // O iPhone não vibra pelo navegador; no Android, curto no verde e duplo no vermelho.
  navigator.vibrate?.(tone === 'success' ? 120 : [90, 60, 90]);
}

/**
 * Modo portaria (D21): câmera sempre aberta, check-in a cada QR lido e tela verde ou vermelha até
 * "Próximo"; "Inserir código" sempre à mão. Tela escura fixa e acesa, com as economias do leitor.
 */
export function GateModeScreen({
  title,
  stats,
  online,
  codePrefix,
  codeLength,
  codeAlphabet,
  onQr,
  onCode,
  onClose,
}: GateModeScreenProps) {
  const { t } = useTranslation();
  const [outcome, setOutcome] = useState<GateOutcome | null>(null);
  const [busy, setBusy] = useState(false);
  const [codeOpen, setCodeOpen] = useState(false);
  const [code, setCode] = useState('');
  const [codeHint, setCodeHint] = useState(false);
  const nextRef = useRef<HTMLButtonElement | null>(null);
  const lowBattery = useLowBattery(true);
  useScreenWakeLock(true);

  const show = useCallback((result: GateOutcome) => {
    vibrate(result.tone);
    setOutcome(result);
  }, []);

  const onDetected = useCallback(
    (token: string) => {
      setBusy(true);
      void onQr(token)
        .then(show)
        .catch(() => show({ tone: 'danger', headline: t('gateMode.failed') }))
        .finally(() => setBusy(false));
    },
    [onQr, show, t]
  );
  const scanner = useQrScanner(onDetected, {
    continuous: true,
    paused: busy || codeOpen || outcome !== null,
  });
  const { start, stop } = scanner;

  useEffect(() => {
    void start();
    return stop;
  }, [start, stop]);

  useEffect(() => {
    if (outcome) {
      nextRef.current?.focus();
      return;
    }
    setCodeHint(false);
    const timer = window.setTimeout(() => setCodeHint(true), CODE_HINT_AFTER_MS);
    return () => window.clearTimeout(timer);
  }, [outcome]);

  const submitCode = async () => {
    setBusy(true);
    try {
      const result = await onCode(code);
      setCodeOpen(false);
      setCode('');
      show(result);
    } catch {
      setCodeOpen(false);
      show({ tone: 'danger', headline: t('gateMode.failed') });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="ug-force-dark fixed inset-0 bg-app text-ink flex flex-col pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]"
      style={{ zIndex: Z_INDEX.modalNested }}
    >
      <header className="flex items-center gap-3 px-4 py-3">
        <div className="flex-1 min-w-0">
          <p className="text-[15px] font-semibold truncate">{title}</p>
          <p className="text-[13px] text-ink/70 flex items-center gap-1.5">
            {online ? (
              <Wifi size={14} aria-hidden="true" />
            ) : (
              <WifiOff size={14} className="text-warn" aria-hidden="true" />
            )}
            <span>{t(online ? 'gateMode.online' : 'gateMode.offline')}</span>
            {stats && <span>· {stats}</span>}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label={t('gateMode.close')}
          className="press w-11 h-11 rounded-xl bg-surface flex items-center justify-center focus-visible:ring-2 focus-visible:ring-teal-400/50"
        >
          <X size={20} aria-hidden="true" />
        </button>
      </header>

      {lowBattery && (
        <p className="mx-4 mb-2 px-3 py-2 rounded-xl bg-warn-soft text-warn text-[13px] flex items-center gap-2">
          <BatteryLow size={16} aria-hidden="true" />
          {t('gateMode.lowBattery')}
        </p>
      )}

      <div
        className="relative flex-1 min-h-0 mx-4 rounded-3xl overflow-hidden bg-surface"
        style={{ containerType: 'size' }}
      >
        <video
          ref={scanner.videoRef}
          muted
          playsInline
          className={cn(
            'absolute inset-0 w-full h-full object-cover',
            scanner.state !== 'scanning' && 'invisible'
          )}
        />
        {scanner.state === 'scanning' && (
          // Moldura quadrada do tamanho que o leitor recorta (80% do lado menor); fora dela, desfoque.
          <div
            className="absolute inset-0 grid pointer-events-none"
            style={{
              gridTemplateColumns: `1fr ${FRAME_SIZE} 1fr`,
              gridTemplateRows: `1fr ${FRAME_SIZE} 1fr`,
            }}
            aria-hidden="true"
          >
            {[0, 1, 2, 3, 5, 6, 7, 8].map((cell) => (
              <div
                key={cell}
                className="backdrop-blur-md bg-[#000000]/40"
                style={{ gridRow: Math.floor(cell / 3) + 1, gridColumn: (cell % 3) + 1 }}
              />
            ))}
            <div className="relative row-start-2 col-start-2 rounded-2xl border-2 border-accent overflow-hidden">
              <span className="absolute inset-x-3 h-0.5 rounded-full bg-accent shadow-[0_0_12px_2px] shadow-accent/70 animate-scan-line motion-reduce:animate-none motion-reduce:top-1/2" />
            </div>
          </div>
        )}
        {scanner.state === 'scanning' && (
          <p className="absolute bottom-3 inset-x-3 text-center text-[13px] text-ink">
            {t('gateMode.aim')}
          </p>
        )}
        {scanner.state !== 'scanning' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center">
            <p className="text-[15px] text-ink/80">
              {t(
                scanner.state === 'standby'
                  ? 'gateMode.standby'
                  : scanner.state === 'denied'
                    ? 'gateMode.cameraDenied'
                    : scanner.state === 'unsupported'
                      ? 'gateMode.unsupported'
                      : 'gateMode.opening'
              )}
            </p>
            {(scanner.state === 'standby' || scanner.state === 'idle') && (
              <button type="button" onClick={() => void start()} className={BUTTON_PRIMARY}>
                {t('gateMode.resume')}
              </button>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 p-4">
        <button
          type="button"
          onClick={() => setCodeOpen(true)}
          className={cn(
            BUTTON_SECONDARY,
            'flex-1 inline-flex items-center justify-center gap-2',
            codeHint && 'border-accent-line bg-accent-soft text-accent'
          )}
        >
          <Keyboard size={18} aria-hidden="true" />
          {t('gateMode.enterCode')}
        </button>
        {scanner.torchAvailable && (
          <button
            type="button"
            onClick={() => void scanner.toggleTorch()}
            aria-pressed={scanner.torchOn}
            aria-label={t('gateMode.torch')}
            className={cn(
              'press w-12 h-12 rounded-xl flex items-center justify-center focus-visible:ring-2 focus-visible:ring-teal-400/50',
              scanner.torchOn ? 'bg-ink text-app' : 'bg-surface text-ink'
            )}
          >
            <Flashlight size={20} aria-hidden="true" />
          </button>
        )}
      </div>

      {outcome && (
        <div
          role="alert"
          className={cn(
            'absolute inset-0 flex flex-col p-6 pt-[calc(env(safe-area-inset-top)+24px)] pb-[calc(env(safe-area-inset-bottom)+24px)]',
            OUTCOME_STYLE[outcome.tone]
          )}
        >
          <div className="flex-1 flex flex-col items-center justify-center text-center gap-4">
            <span className="w-24 h-24 rounded-full bg-[#ffffff]/20 flex items-center justify-center">
              {outcome.tone === 'success' ? (
                <Check size={56} strokeWidth={3} aria-hidden="true" />
              ) : (
                <X size={56} strokeWidth={3} aria-hidden="true" />
              )}
            </span>
            <p className="text-[28px] font-display font-bold leading-tight">{outcome.headline}</p>
            {outcome.detail && <p className="text-[17px] leading-snug">{outcome.detail}</p>}
          </div>
          <div className="space-y-3">
            <button
              ref={nextRef}
              type="button"
              onClick={() => setOutcome(null)}
              className="press w-full min-h-14 rounded-2xl bg-[#ffffff] text-[#0d0e10] text-[17px] font-bold focus-visible:ring-4 focus-visible:ring-[#ffffff]/50"
            >
              {t('gateMode.next')}
            </button>
            {outcome.tone !== 'success' && (
              <button
                type="button"
                onClick={() => {
                  setOutcome(null);
                  setCodeOpen(true);
                }}
                className="press w-full min-h-12 rounded-2xl border-2 border-current text-[15px] font-semibold"
              >
                {t('gateMode.enterCode')}
              </button>
            )}
          </div>
        </div>
      )}

      {codeOpen && (
        <Dialog
          open
          nested
          onOpenChange={(open) => !open && setCodeOpen(false)}
          title={t('gateMode.codeTitle')}
          className="ug-force-dark"
        >
          <form
            className="space-y-5"
            noValidate
            onSubmit={(event) => {
              event.preventDefault();
              void submitCode();
            }}
          >
            <CodeBoxesInput
              prefix={codePrefix}
              length={codeLength}
              alphabet={codeAlphabet}
              value={code}
              onChange={setCode}
              label={t('gateMode.codeLabel')}
              boxLabel={(index) => t('gateMode.character', { n: index + 1, total: codeLength })}
              disabled={busy}
            />
            <button
              type="submit"
              disabled={busy || code.length !== codeLength}
              className={`${BUTTON_PRIMARY} w-full`}
            >
              {t('gateMode.confirmCode')}
            </button>
          </form>
        </Dialog>
      )}
    </div>
  );
}

=== src/ui/hooks/useLowBattery.ts — ARQUIVO NOVO, conteúdo completo ===
import { useEffect, useState } from 'react';

type BatteryManager = EventTarget & { level: number; charging: boolean };
type BatteryNavigator = Navigator & { getBattery?: () => Promise<BatteryManager> };

const LOW_LEVEL = 0.2;

/**
 * Bateria em 20% ou menos e sem carregar. Só o Chrome Android informa a bateria; nos outros
 * navegadores fica sempre false.
 */
export function useLowBattery(active: boolean): boolean {
  const [low, setLow] = useState(false);
  useEffect(() => {
    const getBattery = (navigator as BatteryNavigator).getBattery;
    if (!active || !getBattery) return;
    let battery: BatteryManager | null = null;
    const update = () => setLow(!!battery && !battery.charging && battery.level <= LOW_LEVEL);
    void getBattery
      .call(navigator)
      .then((manager) => {
        battery = manager;
        update();
        manager.addEventListener('levelchange', update);
        manager.addEventListener('chargingchange', update);
      })
      .catch(() => undefined);
    return () => {
      battery?.removeEventListener('levelchange', update);
      battery?.removeEventListener('chargingchange', update);
    };
  }, [active]);
  return low;
}

=== src/ui/hooks/useQrScanner.ts — ARQUIVO REESCRITO, substitua todo o conteúdo por este ===
import { useCallback, useEffect, useRef, useState } from 'react';

export type QrScannerState = 'idle' | 'loading' | 'scanning' | 'standby' | 'unsupported' | 'denied';

type ReadQr = (frame: ImageData) => Promise<string | null>;

export interface QrScannerOptions {
  /** Continua lendo depois de cada QR (modo portaria); sem isso, desliga ao ler o primeiro. */
  continuous?: boolean;
  /** Enquanto true, a câmera fica ligada mas nada é decodificado (tela de resultado aberta). */
  paused?: boolean;
}

// Lado maior do quadro enviado ao leitor, igual ao teste de velocidade da D20.
const MAX_FRAME_SIDE = 720;
// Só o centro (onde fica a mira): menos pixels por quadro e leitura mais rápida.
const CENTER_FRACTION = 0.8;
// Bateria sem perder velocidade (D21): cada quadro com uso; parado, 4 por segundo; depois, espera.
const SLOW_AFTER_MS = 10_000;
const SLOW_INTERVAL_MS = 250;
const STANDBY_AFTER_MS = 60_000;
// A câmera relê o mesmo QR enquanto ele continua na frente dela.
const SAME_VALUE_IGNORE_MS = 5_000;

let readerPromise: Promise<ReadQr> | null = null;

/**
 * Carrega o `zxing-wasm` só quando a portaria abre o leitor (D20). O `.wasm` sai do próprio
 * domínio: o padrão da biblioteca buscaria no jsDelivr, que a CSP não libera.
 */
function loadReader(): Promise<ReadQr> {
  readerPromise ??= Promise.all([
    import('zxing-wasm/reader'),
    import('zxing-wasm/reader/zxing_reader.wasm?url'),
  ])
    .then(([zxing, wasm]) => {
      zxing.prepareZXingModule({
        overrides: {
          locateFile: (path: string, prefix: string) =>
            path.endsWith('.wasm') ? wasm.default : prefix + path,
        },
      });
      return async (frame: ImageData) => {
        const [result] = await zxing.readBarcodes(frame, {
          formats: ['QRCode'],
          tryHarder: true,
          maxNumberOfSymbols: 1,
        });
        return result?.isValid ? result.text : null;
      };
    })
    .catch((error: unknown) => {
      readerPromise = null;
      throw error;
    });
  return readerPromise;
}

type TorchCapabilities = { torch?: boolean };

// O mesmo id pode ser de requestAnimationFrame ou de setTimeout, conforme o ritmo da leitura.
function clearTimer(timer: { current: number | null }) {
  if (timer.current !== null) {
    cancelAnimationFrame(timer.current);
    clearTimeout(timer.current);
  }
  timer.current = null;
}

/** Leitura de QR pela câmera em qualquer navegador, com o leitor `zxing-wasm` (D20, D21). */
export function useQrScanner(
  onDetected: (value: string) => void,
  { continuous = false, paused = false }: QrScannerOptions = {}
) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<number | null>(null);
  const activityRef = useRef(0);
  const lastValueRef = useRef<{ value: string; at: number } | null>(null);
  const pausedRef = useRef(paused);
  const onDetectedRef = useRef(onDetected);
  const [state, setState] = useState<QrScannerState>('idle');
  const [torchAvailable, setTorchAvailable] = useState(false);
  const [torchOn, setTorchOn] = useState(false);

  onDetectedRef.current = onDetected;
  useEffect(() => {
    pausedRef.current = paused;
    // Voltar da tela de resultado conta como uso: a leitura volta à velocidade máxima.
    if (!paused) activityRef.current = Date.now();
  }, [paused]);

  const releaseCamera = useCallback(() => {
    clearTimer(timerRef);
    for (const track of streamRef.current?.getTracks() ?? []) track.stop();
    streamRef.current = null;
    setTorchOn(false);
  }, []);

  const stop = useCallback(() => {
    releaseCamera();
    setState((current) =>
      current === 'scanning' || current === 'loading' || current === 'standby' ? 'idle' : current
    );
  }, [releaseCamera]);

  const standby = useCallback(() => {
    releaseCamera();
    setState('standby');
  }, [releaseCamera]);

  const start = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setState('unsupported');
      return;
    }
    setState('loading');
    let read: ReadQr;
    try {
      read = await loadReader();
    } catch {
      setState('unsupported');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;
      const track = stream.getVideoTracks()[0];
      // `torch` não está nos tipos do DOM; Chrome Android informa quando a lanterna existe.
      const capabilities = track?.getCapabilities?.() as TorchCapabilities | undefined;
      setTorchAvailable(Boolean(capabilities?.torch));
      setState('scanning');
      const video = videoRef.current;
      if (!video) return;
      video.srcObject = stream;
      await video.play();
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d', { willReadFrequently: true });
      if (!context) {
        stop();
        setState('unsupported');
        return;
      }
      activityRef.current = Date.now();

      const schedule = () => {
        const idleFor = Date.now() - activityRef.current;
        if (continuous && idleFor >= STANDBY_AFTER_MS) {
          standby();
          return;
        }
        timerRef.current =
          idleFor >= SLOW_AFTER_MS || pausedRef.current
            ? window.setTimeout(() => void tick(), SLOW_INTERVAL_MS)
            : requestAnimationFrame(() => void tick());
      };

      const tick = async () => {
        if (!streamRef.current) return;
        if (pausedRef.current) {
          activityRef.current = Date.now();
          schedule();
          return;
        }
        const side = Math.min(video.videoWidth, video.videoHeight) * CENTER_FRACTION;
        const scale = Math.min(1, MAX_FRAME_SIDE / Math.max(side, 1));
        canvas.width = Math.round(side * scale);
        canvas.height = canvas.width;
        let value: string | null = null;
        if (canvas.width > 0) {
          context.drawImage(
            video,
            (video.videoWidth - side) / 2,
            (video.videoHeight - side) / 2,
            side,
            side,
            0,
            0,
            canvas.width,
            canvas.height
          );
          value = await read(context.getImageData(0, 0, canvas.width, canvas.height)).catch(
            () => null
          );
        }
        if (value && streamRef.current) {
          const now = Date.now();
          const repeated =
            lastValueRef.current?.value === value &&
            now - lastValueRef.current.at < SAME_VALUE_IGNORE_MS;
          lastValueRef.current = { value, at: now };
          if (!repeated) {
            activityRef.current = now;
            if (!continuous) {
              stop();
              onDetectedRef.current(value);
              return;
            }
            onDetectedRef.current(value);
          }
        }
        schedule();
      };
      void tick();
    } catch {
      stop();
      setState('denied');
    }
  }, [continuous, standby, stop]);

  const toggleTorch = useCallback(async () => {
    const track = streamRef.current?.getVideoTracks()[0];
    if (!track) return;
    const next = !torchOn;
    await track
      .applyConstraints({ advanced: [{ torch: next } as MediaTrackConstraintSet] })
      .then(() => setTorchOn(next))
      .catch(() => setTorchAvailable(false));
  }, [torchOn]);

  // Fora da tela (outro app, tela bloqueada), a câmera desliga e espera o toque para voltar.
  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden && streamRef.current) standby();
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, [standby]);

  useEffect(() => stop, [stop]);

  return { videoRef, state, start, stop, torchAvailable, torchOn, toggleTorch };
}

=== src/ui/hooks/useScreenWakeLock.ts — ARQUIVO NOVO, conteúdo completo ===
import { useEffect } from 'react';

type WakeLockSentinel = { release: () => Promise<void> };
type WakeLockNavigator = Navigator & {
  wakeLock?: { request: (type: 'screen') => Promise<WakeLockSentinel> };
};

/**
 * Mantém a tela acesa enquanto `active` (modo portaria, D21). O navegador solta a trava quando a
 * página some; ela é pedida de novo ao voltar. Sem suporte, não faz nada.
 * Referência: https://developer.mozilla.org/docs/Web/API/Screen_Wake_Lock_API
 */
export function useScreenWakeLock(active: boolean) {
  useEffect(() => {
    const wakeLock = (navigator as WakeLockNavigator).wakeLock;
    if (!active || !wakeLock) return;
    let sentinel: WakeLockSentinel | null = null;
    const request = () => {
      if (document.visibilityState !== 'visible') return;
      void wakeLock
        .request('screen')
        .then((lock) => {
          sentinel = lock;
        })
        .catch(() => undefined);
    };
    request();
    document.addEventListener('visibilitychange', request);
    return () => {
      document.removeEventListener('visibilitychange', request);
      void sentinel?.release().catch(() => undefined);
    };
  }, [active]);
}

VERIFICAÇÃO (obrigatória):
- `npm run typecheck`, `npx biome lint .` (0 erros; arquivos tocados sem avisos), `npm run build`;
- testes ligados aos arquivos deste prompt: `npx vitest related --run server/application/usecases/ticketing/returnTicketToBuyerApplicationUseCase.ts server/application/usecases/ticketing/transferTicketToUsernameApplicationUseCase.test.ts server/application/usecases/ticketing/transferTicketToUsernameApplicationUseCase.ts server/domain/ticketing/adapters/firestoreTicketStore.ts server/domain/ticketing/controllers/ticketingController.ts server/domain/ticketing/dtos/ticketingPersistenceMappers.ts server/domain/ticketing/errors/ticketingDomainError.ts server/domain/ticketing/ports/ticketingPort.ts server/domain/ticketing/services/ticketHolderService.ts server/domain/ticketing/services/ticketingServices.test.ts server/domain/ticketing/types/ticketingTypes.ts server/interfaces/http/ticketTransfers/ticketTransferController.ts server/interfaces/http/ticketTransfers/ticketTransferRoutes.ts server/interfaces/http/ticketTransfers/ticketTransferSchema.ts src/domain/bookings/components/partner/SlotCheckInSheet.tsx src/domain/bookings/hooks/useSlotCheckIn.ts src/domain/events/components/EventSessionsField.tsx src/domain/ticketing/adapters/httpTicketingAdapter.ts src/domain/ticketing/application/usecases/returnTicketToBuyerUseCase.ts src/domain/ticketing/components/PartnerEventTicketingManager.tsx src/domain/ticketing/components/UserTicketsHistoryView.tsx src/domain/ticketing/components/manager/CheckInTab.tsx src/domain/ticketing/components/manager/TicketGateCard.tsx src/domain/ticketing/components/wallet/TransferTicketForm.tsx src/domain/ticketing/components/wallet/WalletTicketCard.tsx src/domain/ticketing/hooks/useTicketGate.ts src/domain/ticketing/hooks/useTicketWalletActions.ts src/domain/ticketing/hooks/useUserTickets.ts src/domain/ticketing/ports/ticketingPort.ts src/domain/ticketing/types/ticketing.ts src/shared/i18n/gateModeResources.ts src/shared/i18n/resources.ts src/shared/i18n/ticketGateResources.ts src/shared/i18n/ticketWalletResources.ts src/shared/i18n/usernameResources.ts src/ui/components/GateModeScreen.test.tsx src/ui/components/GateModeScreen.tsx src/ui/hooks/useLowBattery.ts src/ui/hooks/useQrScanner.ts src/ui/hooks/useScreenWakeLock.ts` (todos verdes). Não precisa rodar a suíte inteira.

ENTREGA: responda no formato do AGENTS.md §16.3.

LIMPEZA (obrigatória, ao terminar de implementar): apague todos os arquivos de public/assets/aistudio/, inclusive o deste prompt. São cópias dos textos colados no chat, salvas automaticamente pelo AI Studio, e public/ vai para o site publicado. Se a pasta ficar vazia, apague a pasta também.
~~~~

### Configurações manuais (você faz, fora do AI Studio, depois de aplicar este prompt)

Nenhuma.
