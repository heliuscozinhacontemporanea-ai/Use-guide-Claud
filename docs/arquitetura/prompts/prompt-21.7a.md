# Prompt 21.7a — @usuário e transferência de ingresso pelo @

> Lote 18, gerado dos commits de referência `86c0985..e9d5a13` da branch `claude/agents-md-v2`. Aplique na ordem do lote (A7, 21.1 a 21.7d), um por vez. Cole o bloco abaixo no agente do AI Studio, inteiro, de uma vez.

---

## Prompt 21.7a — @usuário e transferência de ingresso pelo @

Primeiro prompt da D21.

~~~~text
Siga o AGENTS.md. O app ainda não foi liberado para usuários: nenhum código de compatibilidade ou transição (§2.2 item 8). As regras de negócio estão nas decisões D20 e D21 de docs/arquitetura/decisoes.md (aplicadas pelo prompt A7).

IMPORTANTE: aplique os diffs abaixo EXATAMENTE, inclusive os arquivos novos. Não reescreva os arquivos do seu jeito. Arquivo tocado sai sem avisos do lint e formatado (AGENTS.md §13). Não altere firebase.json, functions/, AGENTS.md, docs/ nem .env.

O QUE MUDA:
1) Toda conta pode ter um @ único (3–30 caracteres: a–z, 0–9, ponto e sublinhado, nomes bloqueados), sugerido a partir do nome; troca a cada 30 dias e o anterior fica reservado por 14 dias (coleção usernames, em transação).
2) Configurações › Nome de usuário.
3) Transferência só pelo @, com confirmação de foto, nome e @; destinatário com e-mail verificado, nunca a si mesmo; o ingresso vai para a carteira dele, que recebe aviso (antes, ficava na conta de quem transferiu).
4) Busca do @ e transferência com limite por pessoa num limitador genérico no Firestore (rateLimits).
5) Exclusão de conta reserva o @ por 14 dias.

ARQUIVOS (crie, altere ou apague exatamente estes):
- firestore.rules (alterar)
- server.ts (alterar)
- server/application/usecases/deleteUserAccountApplicationUseCase.test.ts (alterar)
- server/application/usecases/deleteUserAccountApplicationUseCase.ts (alterar)
- server/application/usecases/ticketing/transferTicketToUsernameApplicationUseCase.test.ts (criar)
- server/application/usecases/ticketing/transferTicketToUsernameApplicationUseCase.ts (criar)
- server/domain/ticketing/controllers/ticketingController.ts (alterar)
- server/domain/ticketing/routes/ticketingRoutes.ts (alterar)
- server/domain/ticketing/schemas/ticketingSchema.ts (alterar)
- server/domain/users/adapters/firestoreUserAdapter.test.ts (alterar)
- server/domain/users/adapters/firestoreUsernameAdapter.ts (criar)
- server/domain/users/controllers/usernameController.ts (criar)
- server/domain/users/dtos/userDto.ts (alterar)
- server/domain/users/errors/usernameError.ts (criar)
- server/domain/users/factory.ts (alterar)
- server/domain/users/index.ts (alterar)
- server/domain/users/ports/usernamePort.ts (criar)
- server/domain/users/routes/userRoutes.ts (alterar)
- server/domain/users/schemas/usernameSchema.ts (criar)
- server/domain/users/services/userService.test.ts (alterar)
- server/domain/users/services/usernameService.test.ts (criar)
- server/domain/users/services/usernameService.ts (criar)
- server/domain/users/usecases/claimUsernameUseCase.ts (criar)
- server/domain/users/usecases/findUserByUsernameUseCase.ts (criar)
- server/domain/users/usecases/releaseUsernamesUseCase.ts (criar)
- server/domain/users/usecases/resolveUsernameOwnerUseCase.ts (criar)
- server/domain/users/usecases/suggestUsernameUseCase.ts (criar)
- server/domain/users/utils/username.ts (criar)
- server/infrastructure/firebase/firestoreRateLimiter.ts (criar)
- server/infrastructure/http/rateLimitByUser.ts (criar)
- server/interfaces/http/ticketTransfers/ticketTransferController.ts (criar)
- server/interfaces/http/ticketTransfers/ticketTransferRoutes.ts (criar)
- server/interfaces/http/ticketTransfers/ticketTransferSchema.ts (criar)
- src/app/menu/SideMenu.tsx (alterar)
- src/app/menu/menuViews.ts (alterar)
- src/domain/ticketing/adapters/httpTicketingAdapter.ts (alterar)
- src/domain/ticketing/application/usecases/transferTicketUseCase.ts (alterar)
- src/domain/ticketing/components/UserTicketsHistoryView.tsx (alterar)
- src/domain/ticketing/components/wallet/TransferTicketForm.tsx (alterar)
- src/domain/ticketing/hooks/useTicketWalletActions.ts (alterar)
- src/domain/ticketing/hooks/useUserTickets.ts (alterar)
- src/domain/ticketing/ports/ticketingPort.ts (alterar)
- src/domain/user/adapters/apiUserAdapter.ts (alterar)
- src/domain/user/application/usecases/claimUsernameUseCase.ts (criar)
- src/domain/user/application/usecases/findUserByUsernameUseCase.ts (criar)
- src/domain/user/application/usecases/suggestUsernameUseCase.ts (criar)
- src/domain/user/components/SettingsView.tsx (alterar)
- src/domain/user/components/UsernameSettingsView.tsx (criar)
- src/domain/user/hooks/useUsername.ts (criar)
- src/domain/user/index.ts (alterar)
- src/domain/user/ports/userPort.ts (alterar)
- src/domain/user/types/user.ts (alterar)
- src/domain/user/utils/username.test.ts (criar)
- src/domain/user/utils/username.ts (criar)
- src/shared/i18n/resources.ts (alterar)
- src/shared/i18n/ticketWalletResources.ts (alterar)
- src/shared/i18n/usernameResources.ts (criar)

Aplique as mudanças abaixo EXATAMENTE como estão (formato unified diff: linhas com "-" saem, linhas com "+" entram; as demais são contexto para localizar o trecho). Não reformate outros trechos dos arquivos.

=== firestore.rules — diff ===
@@ -146,6 +146,12 @@ service cloud.firestore {
       allow read: if true;
       allow create, update, delete: if false;
     }
+    match /usernames/{username} {
+      allow read, write: if false;
+    }
+    match /rateLimits/{limitId} {
+      allow read, write: if false;
+    }
     match /favorites/{favoriteId} {
       allow read:
         if isAuthenticated()

=== server.ts — diff ===
@@ -34,6 +34,7 @@ import {
   adminSaleClaimRouter,
   saleClaimRouter,
 } from './server/interfaces/http/saleClaims/saleClaimRoutes';
+import { ticketTransferRouter } from './server/interfaces/http/ticketTransfers/ticketTransferRoutes';
 import {
   bookingsRouter,
   partnerOffersRouter,
@@ -209,6 +210,7 @@ async function startServer() {
   app.use('/api/payment/plans', billingRouter);
   app.use('/api/payment-accounts', paymentAccountRouter);
   app.use('/api/sale-claims', saleClaimRouter);
+  app.use('/api/ticket-transfers', ticketTransferRouter);
   app.use('/api/admin/sale-claims', adminSaleClaimRouter);
   app.use('/api/admin/account-debts', adminAccountDebtRouter);
   app.use('/api/payment', paymentRouter);

=== server/application/usecases/deleteUserAccountApplicationUseCase.test.ts — diff ===
@@ -11,7 +11,10 @@ vi.mock('../../domain/partners', () => ({
 }));
 vi.mock('../../domain/payment', () => ({ cancelPartnerPlanSubscriptionsUseCase: vi.fn() }));
 vi.mock('../../domain/reviews', () => ({ deleteReviewsByUserUseCase: vi.fn() }));
-vi.mock('../../domain/users', () => ({ deleteUserAccountUseCase: vi.fn() }));
+vi.mock('../../domain/users', () => ({
+  releaseUsernamesUseCase: vi.fn(),
+  deleteUserAccountUseCase: vi.fn(),
+}));
 vi.mock('./listingVerification/deleteVerificationFiles', () => ({
   deleteVerificationFiles: vi.fn(),
 }));

=== server/application/usecases/deleteUserAccountApplicationUseCase.ts — diff ===
@@ -9,7 +9,7 @@ import {
 import { cancelPartnerPlanSubscriptionsUseCase } from '../../domain/payment';
 import { deleteReviewsByUserUseCase } from '../../domain/reviews';
 import { anonymizeTicketingUserUseCase } from '../../domain/ticketing';
-import { deleteUserAccountUseCase } from '../../domain/users';
+import { deleteUserAccountUseCase, releaseUsernamesUseCase } from '../../domain/users';
 import { deleteVerificationFiles } from './listingVerification/deleteVerificationFiles';
 
 export interface UserDeletionCoordinatorDependencies {
@@ -25,6 +25,8 @@ export interface UserDeletionCoordinatorDependencies {
   anonymizeBuyerBookings?: (uid: string) => Promise<void>;
   /** Pedidos, ingressos, transferências e lista de espera: sai nome e e-mail, fica o registro (§7.5). */
   anonymizeTicketing?: (uid: string) => Promise<void>;
+  /** O @ fica reservado por 14 dias e depois é liberado (D21). */
+  releaseUsernames?: (uid: string) => Promise<void>;
   deleteUserAccount: (uid: string) => Promise<void>;
 }
 
@@ -47,6 +49,7 @@ export async function deleteUserAccountApplicationUseCase(
     anonymizeTicketing: async (id) => {
       await anonymizeTicketingUserUseCase(id);
     },
+    releaseUsernames: (id) => releaseUsernamesUseCase(id),
     deleteUserAccount: (id) => deleteUserAccountUseCase(id),
   }
 ): Promise<void> {
@@ -71,6 +74,9 @@ export async function deleteUserAccountApplicationUseCase(
   if (deps.anonymizeTicketing) {
     await deps.anonymizeTicketing(uid);
   }
+  if (deps.releaseUsernames) {
+    await deps.releaseUsernames(uid);
+  }
   await deps.deletePartnerProfile(uid);
   await deps.deleteUserAccount(uid);
 }

=== server/application/usecases/ticketing/transferTicketToUsernameApplicationUseCase.test.ts — ARQUIVO NOVO, conteúdo completo ===
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../../domain/users', () => ({ resolveUsernameOwnerUseCase: vi.fn() }));
vi.mock('../../../domain/ticketing', () => ({ transferTicketUseCase: vi.fn() }));
vi.mock('../../../domain/notifications', () => ({
  createNotificationUseCase: vi.fn().mockResolvedValue(true),
}));

import { createNotificationUseCase } from '../../../domain/notifications';
import { transferTicketUseCase } from '../../../domain/ticketing';
import { resolveUsernameOwnerUseCase } from '../../../domain/users';
import { transferTicketToUsernameApplicationUseCase } from './transferTicketToUsernameApplicationUseCase';

const OWNER = {
  uid: 'u2',
  username: 'bruno',
  displayName: 'Bruno Lima',
  photoURL: null,
  email: 'bruno@exemplo.com',
  emailVerified: true,
};

describe('transferência pelo @ (D21)', () => {
  beforeEach(() => {
    vi.mocked(resolveUsernameOwnerUseCase).mockResolvedValue(OWNER);
    vi.mocked(transferTicketUseCase).mockResolvedValue({
      newTicket: { id: 'tkt_new', eventSnapshot: { title: 'Luau' } },
    } as never);
  });

  it('transfere para a conta do @ com o e-mail dela e avisa o destinatário', async () => {
    const result = await transferTicketToUsernameApplicationUseCase(
      { uid: 'u1', admin: false },
      'tkt_1',
      '@bruno'
    );
    expect(transferTicketUseCase).toHaveBeenCalledWith(
      { uid: 'u1', admin: false },
      { ticketId: 'tkt_1', toUserId: 'u2', recipientEmail: 'bruno@exemplo.com', recipientName: 'Bruno Lima' }
    );
    expect(result).toEqual({
      ticketId: 'tkt_new',
      recipient: { username: 'bruno', displayName: 'Bruno Lima' },
    });
    expect(JSON.stringify(result)).not.toContain('@exemplo.com');
    expect(createNotificationUseCase).toHaveBeenCalledWith(
      expect.objectContaining({ recipientPartnerId: 'u2' })
    );
  });

  it('recusa transferir para si mesmo e para conta sem e-mail verificado', async () => {
    await expect(
      transferTicketToUsernameApplicationUseCase({ uid: 'u2', admin: false }, 'tkt_1', 'bruno')
    ).rejects.toMatchObject({ code: 'TRANSFER_TO_SELF' });
    vi.mocked(resolveUsernameOwnerUseCase).mockResolvedValue({ ...OWNER, emailVerified: false });
    await expect(
      transferTicketToUsernameApplicationUseCase({ uid: 'u1', admin: false }, 'tkt_1', 'bruno')
    ).rejects.toMatchObject({ code: 'RECIPIENT_NOT_VERIFIED' });
  });
});

=== server/application/usecases/ticketing/transferTicketToUsernameApplicationUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { createNotificationUseCase } from '../../../domain/notifications';
import { type TicketingActorContext, transferTicketUseCase } from '../../../domain/ticketing';
import { resolveUsernameOwnerUseCase } from '../../../domain/users';

export type TicketTransferErrorCode = 'TRANSFER_TO_SELF' | 'RECIPIENT_NOT_VERIFIED';

export class TicketTransferError extends Error {
  constructor(
    public readonly code: TicketTransferErrorCode,
    message: string
  ) {
    super(message);
    this.name = 'TicketTransferError';
  }
}

/**
 * Transfere o ingresso para a conta dona do @ (D21): só para outra conta, com e-mail verificado.
 * O e-mail do destinatário vem da conta, nunca do cliente (§7.3), e não volta na resposta.
 */
export async function transferTicketToUsernameApplicationUseCase(
  actor: TicketingActorContext,
  ticketId: string,
  username: string
): Promise<{ ticketId: string; recipient: { username: string; displayName: string | null } }> {
  const recipient = await resolveUsernameOwnerUseCase(username);
  if (recipient.uid === actor.uid) {
    throw new TicketTransferError('TRANSFER_TO_SELF', 'O ingresso já é seu.');
  }
  if (!recipient.emailVerified) {
    throw new TicketTransferError(
      'RECIPIENT_NOT_VERIFIED',
      'Esta conta ainda não confirmou o e-mail e não pode receber ingressos.'
    );
  }
  const { newTicket } = await transferTicketUseCase(actor, {
    ticketId,
    toUserId: recipient.uid,
    recipientEmail: recipient.email,
    recipientName: recipient.displayName ?? recipient.username,
  });
  // Aviso não pode desfazer a transferência já gravada.
  await createNotificationUseCase({
    recipientPartnerId: recipient.uid,
    type: 'admin_message',
    title: 'Você recebeu um ingresso',
    message: newTicket.eventSnapshot?.title
      ? `Um ingresso para ${newTicket.eventSnapshot.title} está na sua carteira.`
      : 'Um ingresso está na sua carteira.',
  }).catch(() => undefined);
  return {
    ticketId: newTicket.id,
    recipient: { username: recipient.username, displayName: recipient.displayName },
  };
}

=== server/domain/ticketing/controllers/ticketingController.ts — diff ===
@@ -16,7 +16,6 @@ import {
   payTicketOrderSchema,
   requestTicketRefundSchema,
   syncOfflineCheckInsSchema,
-  transferTicketSchema,
   updateTicketTypeSchema,
 } from '../schemas/ticketingSchema';
 import { archiveTicketTypeUseCase } from '../usecases/archiveTicketTypeUseCase';
@@ -40,7 +39,6 @@ import { listUserTicketOrdersUseCase } from '../usecases/listUserTicketOrdersUse
 import { listUserTicketsUseCase } from '../usecases/listUserTicketsUseCase';
 import { reissueTicketQrTokenUseCase } from '../usecases/reissueTicketQrTokenUseCase';
 import { syncOfflineCheckInsUseCase } from '../usecases/syncOfflineCheckInsUseCase';
-import { transferTicketUseCase } from '../usecases/transferTicketUseCase';
 import { updateTicketTypeUseCase } from '../usecases/updateTicketTypeUseCase';
 
 function getActor(req: AuthenticatedRequest) {
@@ -319,24 +317,6 @@ export class TicketingController {
     }
   }
 
-  static async transferTicket(req: AuthenticatedRequest, res: Response) {
-    try {
-      if (!req.user) return res.status(401).json({ error: 'Não autenticado.' });
-      const parsed = transferTicketSchema.safeParse(req.body);
-      if (!parsed.success) {
-        return res.status(400).json({ error: 'Dados inválidos.', details: parsed.error.flatten() });
-      }
-      const ticketId = String(req.params.id || '');
-      const result = await transferTicketUseCase(getActor(req), {
-        ticketId,
-        ...parsed.data,
-      });
-      return res.status(200).json({ status: 'success', data: result });
-    } catch (error) {
-      return handleTicketingError(res, error);
-    }
-  }
-
   static async checkInTicket(req: AuthenticatedRequest, res: Response) {
     try {
       if (!req.user) return res.status(401).json({ error: 'Não autenticado.' });

=== server/domain/ticketing/routes/ticketingRoutes.ts — diff ===
@@ -56,7 +56,6 @@ router.post('/orders/:id/refund', verifyAuthToken, TicketingController.requestRe
 router.get('/tickets', verifyAuthToken, TicketingController.listUserTickets);
 router.get('/tickets/:id/qr', verifyAuthToken, TicketingController.getTicketQrToken);
 router.post('/tickets/:id/qr/reissue', verifyAuthToken, TicketingController.reissueTicketQrToken);
-router.post('/tickets/:id/transfer', verifyAuthToken, TicketingController.transferTicket);
 
 router.post('/check-in', verifyAuthToken, TicketingController.checkInTicket);
 router.post(

=== server/domain/ticketing/schemas/ticketingSchema.ts — diff ===
@@ -115,14 +115,6 @@ export const requestTicketRefundSchema = z
   })
   .strict();
 
-export const transferTicketSchema = z
-  .object({
-    recipientEmail: z.string().email(),
-    recipientName: z.string().trim().min(1).max(120).optional(),
-    toUserId: z.string().trim().min(1).optional(),
-  })
-  .strict();
-
 export const checkInTicketSchema = z
   .object({
     occurrenceId: z.string().trim().min(1),

=== server/domain/users/adapters/firestoreUserAdapter.test.ts — diff ===
@@ -98,6 +98,8 @@ describe('FirestoreUserAdapter', () => {
         photoURL: '',
         role: 'user',
         preferredLocale: null,
+        username: null,
+        usernameChangedAt: null,
         createdAt: '',
         updatedAt: '',
       });

=== server/domain/users/adapters/firestoreUsernameAdapter.ts — ARQUIVO NOVO, conteúdo completo ===
import { adminAuth, adminDb } from '../../../infrastructure/firebase/adminClient';
import { UsernameError } from '../errors/usernameError';
import type { UsernameOwner, UsernamePort } from '../ports/usernamePort';

const USERNAMES = 'usernames';
// Dono simbólico do @ de conta excluída: fica reservado até `releasedAt` e depois é liberado.
const DELETED_OWNER = 'deleted';

interface Reservation {
  uid: string;
  releasedAt?: string;
}

function readReservation(data: unknown): Reservation | null {
  const value = data as Partial<Reservation> | undefined;
  return value && typeof value.uid === 'string' ? (value as Reservation) : null;
}

function isFree(reservation: Reservation | null, uid: string, nowIso: string): boolean {
  if (!reservation || reservation.uid === uid) return true;
  return typeof reservation.releasedAt === 'string' && reservation.releasedAt <= nowIso;
}

/** @usuário no Firestore: `usernames/{nome}` garante a unicidade (só o backend escreve, §6.1). */
export class FirestoreUsernameAdapter implements UsernamePort {
  async getCurrent(uid: string): Promise<{ username: string | null; changedAt: string | null }> {
    const data = (await adminDb.collection('users').doc(uid).get()).data() ?? {};
    return {
      username: typeof data.username === 'string' ? data.username : null,
      changedAt: typeof data.usernameChangedAt === 'string' ? data.usernameChangedAt : null,
    };
  }

  async isAvailable(username: string, uid: string, nowIso: string): Promise<boolean> {
    const snap = await adminDb.collection(USERNAMES).doc(username).get();
    return isFree(readReservation(snap.data()), uid, nowIso);
  }

  async claim(uid: string, username: string, nowIso: string, releaseAtIso: string): Promise<void> {
    await adminDb.runTransaction(async (tx) => {
      const userRef = adminDb.collection('users').doc(uid);
      const targetRef = adminDb.collection(USERNAMES).doc(username);
      const [userSnap, targetSnap] = await Promise.all([tx.get(userRef), tx.get(targetRef)]);
      if (!isFree(readReservation(targetSnap.data()), uid, nowIso)) {
        throw new UsernameError('USERNAME_TAKEN', 'Este nome de usuário já está em uso.');
      }
      const previous = userSnap.data()?.username;
      if (typeof previous === 'string' && previous !== username) {
        // O @ anterior fica com a conta por 14 dias, para ninguém se passar por ela logo depois.
        tx.set(adminDb.collection(USERNAMES).doc(previous), { uid, releasedAt: releaseAtIso });
      }
      tx.set(targetRef, { uid, createdAt: nowIso });
      tx.set(userRef, { username, usernameChangedAt: nowIso, updatedAt: nowIso }, { merge: true });
      tx.set(
        adminDb.collection('publicProfiles').doc(uid),
        { uid, username, updatedAt: nowIso },
        { merge: true }
      );
    });
  }

  async findOwner(username: string): Promise<UsernameOwner | null> {
    const reservation = readReservation(
      (await adminDb.collection(USERNAMES).doc(username).get()).data()
    );
    if (!reservation || reservation.releasedAt || reservation.uid === DELETED_OWNER) return null;
    const [profileSnap, authUser] = await Promise.all([
      adminDb.collection('publicProfiles').doc(reservation.uid).get(),
      adminAuth.getUser(reservation.uid).catch(() => null),
    ]);
    if (!authUser) return null;
    const profile = profileSnap.data() ?? {};
    return {
      uid: reservation.uid,
      username,
      displayName: typeof profile.displayName === 'string' ? profile.displayName : null,
      photoURL: typeof profile.photoURL === 'string' ? profile.photoURL : null,
      email: authUser.email ?? '',
      emailVerified: authUser.emailVerified,
    };
  }

  async releaseAll(uid: string, releaseAtIso: string): Promise<void> {
    const snap = await adminDb.collection(USERNAMES).where('uid', '==', uid).get();
    const batch = adminDb.batch();
    for (const doc of snap.docs) {
      batch.set(doc.ref, { uid: DELETED_OWNER, releasedAt: releaseAtIso });
    }
    if (!snap.empty) await batch.commit();
  }
}

=== server/domain/users/controllers/usernameController.ts — ARQUIVO NOVO, conteúdo completo ===
import type { Response } from 'express';
import type { AuthenticatedRequest } from '../../../infrastructure/auth/authMiddleware';
import { UsernameError } from '../errors/usernameError';
import { usernameSchema } from '../schemas/usernameSchema';
import { claimUsernameUseCase } from '../usecases/claimUsernameUseCase';
import { findUserByUsernameUseCase } from '../usecases/findUserByUsernameUseCase';
import { suggestUsernameUseCase } from '../usecases/suggestUsernameUseCase';

const STATUS: Record<UsernameError['code'], number> = {
  USERNAME_INVALID: 400,
  USERNAME_TAKEN: 409,
  USERNAME_CHANGE_TOO_SOON: 422,
  USERNAME_NOT_FOUND: 404,
};

function sendError(res: Response, error: unknown, operation: string): Response {
  if (error instanceof UsernameError) {
    return res
      .status(STATUS[error.code])
      .json({ error: { code: error.code, message: error.message } });
  }
  console.error(`[username.${operation}]`, error instanceof Error ? error.name : 'unknown');
  return res
    .status(500)
    .json({ error: { code: 'INTERNAL_ERROR', message: 'Erro ao processar o nome de usuário.' } });
}

function unauthenticated(res: Response): Response {
  return res.status(401).json({ error: { code: 'UNAUTHENTICATED', message: 'Faça login.' } });
}

export class UsernameController {
  static async suggest(req: AuthenticatedRequest, res: Response) {
    const uid = req.user?.uid;
    if (!uid) return unauthenticated(res);
    const name = typeof req.query.name === 'string' ? req.query.name.slice(0, 120) : '';
    try {
      return res.status(200).json({ username: await suggestUsernameUseCase(uid, name) });
    } catch (error) {
      return sendError(res, error, 'suggest');
    }
  }

  static async claim(req: AuthenticatedRequest, res: Response) {
    const uid = req.user?.uid;
    if (!uid) return unauthenticated(res);
    const parsed = usernameSchema.safeParse(req.body);
    if (!parsed.success) {
      return res
        .status(400)
        .json({ error: { code: 'VALIDATION_ERROR', message: 'Nome de usuário inválido.' } });
    }
    try {
      return res
        .status(200)
        .json({ username: await claimUsernameUseCase(uid, parsed.data.username) });
    } catch (error) {
      return sendError(res, error, 'claim');
    }
  }

  static async find(req: AuthenticatedRequest, res: Response) {
    if (!req.user?.uid) return unauthenticated(res);
    try {
      return res
        .status(200)
        .json(await findUserByUsernameUseCase(String(req.params.username ?? '')));
    } catch (error) {
      return sendError(res, error, 'find');
    }
  }
}

=== server/domain/users/dtos/userDto.ts — diff ===
@@ -10,6 +10,9 @@ export interface PrivateUserProfileDto {
   photoURL?: string;
   role: UserRole;
   preferredLocale: Locale | null;
+  /** @usuário (D21); null até a conta escolher. */
+  username: string | null;
+  usernameChangedAt: string | null;
   createdAt?: string;
   updatedAt?: string;
 }
@@ -36,6 +39,8 @@ export function toPrivateUserProfileDto(raw: unknown, uid: string): PrivateUserP
     photoURL: typeof data.photoURL === 'string' ? data.photoURL : '',
     role,
     preferredLocale: SUPPORTED_LOCALES.find((locale) => locale === data.preferredLocale) ?? null,
+    username: typeof data.username === 'string' ? data.username : null,
+    usernameChangedAt: typeof data.usernameChangedAt === 'string' ? data.usernameChangedAt : null,
     createdAt: typeof data.createdAt === 'string' ? data.createdAt : '',
     updatedAt: typeof data.updatedAt === 'string' ? data.updatedAt : '',
   };

=== server/domain/users/errors/usernameError.ts — ARQUIVO NOVO, conteúdo completo ===
export type UsernameErrorCode =
  | 'USERNAME_INVALID'
  | 'USERNAME_TAKEN'
  | 'USERNAME_CHANGE_TOO_SOON'
  | 'USERNAME_NOT_FOUND';

/** Erros do @usuário com `code` estável (§10.2). */
export class UsernameError extends Error {
  constructor(
    public readonly code: UsernameErrorCode,
    message: string
  ) {
    super(message);
    this.name = 'UsernameError';
  }
}

=== server/domain/users/factory.ts — ARQUIVO REESCRITO, substitua todo o conteúdo por este ===
import { UserService } from './services/userService';
import { FirestoreUserAdapter } from './adapters/firestoreUserAdapter';
import { FirestoreUsernameAdapter } from './adapters/firestoreUsernameAdapter';
import { UsernameService } from './services/usernameService';

const userAdapter = new FirestoreUserAdapter();
export const userService = new UserService(userAdapter);
export const usernameService = new UsernameService(new FirestoreUsernameAdapter());

=== server/domain/users/index.ts — diff ===
@@ -10,3 +10,11 @@ export { getUserProfileUseCase } from './usecases/getUserProfileUseCase';
 export { getUserProfilesBatchUseCase } from './usecases/getUserProfilesBatchUseCase';
 
 export type { UserProfileDto } from './dtos/userDto';
+export { claimUsernameUseCase } from './usecases/claimUsernameUseCase';
+export { findUserByUsernameUseCase } from './usecases/findUserByUsernameUseCase';
+export { releaseUsernamesUseCase } from './usecases/releaseUsernamesUseCase';
+export { resolveUsernameOwnerUseCase } from './usecases/resolveUsernameOwnerUseCase';
+export { suggestUsernameUseCase } from './usecases/suggestUsernameUseCase';
+export { UsernameError } from './errors/usernameError';
+export type { UsernameOwner } from './ports/usernamePort';
+export type { UsernameProfile } from './services/usernameService';

=== server/domain/users/ports/usernamePort.ts — ARQUIVO NOVO, conteúdo completo ===
/** Conta encontrada pelo @; `email` e `emailVerified` só circulam no servidor (transferência). */
export interface UsernameOwner {
  uid: string;
  username: string;
  displayName: string | null;
  photoURL: string | null;
  email: string;
  emailVerified: boolean;
}

export interface UsernamePort {
  /** @ atual da conta e quando foi trocado pela última vez. */
  getCurrent(uid: string): Promise<{ username: string | null; changedAt: string | null }>;
  /** Livre: nunca usado, da própria conta ou com a reserva de 14 dias vencida. */
  isAvailable(username: string, uid: string, nowIso: string): Promise<boolean>;
  /**
   * Grava o @ numa transação: reserva `usernames/{nome}`, guarda o anterior até `releaseAtIso` e
   * atualiza a conta e o perfil público. Lança USERNAME_TAKEN se outra conta pegou antes.
   */
  claim(uid: string, username: string, nowIso: string, releaseAtIso: string): Promise<void>;
  findOwner(username: string): Promise<UsernameOwner | null>;
  /** Exclusão de conta: o @ fica reservado até `releaseAtIso`, sem dono. */
  releaseAll(uid: string, releaseAtIso: string): Promise<void>;
}

=== server/domain/users/routes/userRoutes.ts — diff ===
@@ -1,5 +1,7 @@
 import express, { Router } from 'express';
+import { rateLimitByUser } from '../../../infrastructure/http/rateLimitByUser';
 import { UserController } from '../controllers/userController';
+import { UsernameController } from '../controllers/usernameController';
 import {
   verifyAuthToken,
   requireRecentAuthentication,
@@ -16,6 +18,15 @@ router.post(
   express.json({ limit: '6mb' }),
   UserController.uploadPhoto
 );
+router.get('/me/username-suggestion', verifyAuthToken, UsernameController.suggest);
+router.put('/me/username', verifyAuthToken, UsernameController.claim);
+// A busca do @ revela quem tem conta: limite por pessoa contra varredura (D21, §7.4).
+router.get(
+  '/by-username/:username',
+  verifyAuthToken,
+  rateLimitByUser('username-lookup', 30, 10 * 60_000),
+  UsernameController.find
+);
 router.delete('/me', verifyAuthToken, requireRecentAuthentication, UserController.deleteAccount);
 
 export default router;

=== server/domain/users/schemas/usernameSchema.ts — ARQUIVO NOVO, conteúdo completo ===
import { z } from 'zod';

/** Formato fino fica no serviço (normalizeUsername); aqui só tamanho e campos permitidos. */
export const usernameSchema = z.object({ username: z.string().trim().min(3).max(31) }).strict();

=== server/domain/users/services/userService.test.ts — diff ===
@@ -35,6 +35,8 @@ describe('UserService', () => {
         phone: '11999999999',
         role: 'user' as UserRole,
         preferredLocale: null,
+        username: null,
+        usernameChangedAt: null,
       };
       vi.mocked(userPortMock.getUserProfile).mockResolvedValueOnce(mockProfile);
 
@@ -59,6 +61,8 @@ describe('UserService', () => {
         phone: '11988888888',
         role: 'user' as UserRole,
         preferredLocale: null,
+        username: null,
+        usernameChangedAt: null,
       };
       vi.mocked(userPortMock.updateUserProfile).mockResolvedValueOnce(updatedProfile);

=== server/domain/users/services/usernameService.test.ts — ARQUIVO NOVO, conteúdo completo ===
import { describe, expect, it } from 'vitest';
import type { UsernameOwner, UsernamePort } from '../ports/usernamePort';
import { normalizeUsername, usernameBaseFromName } from '../utils/username';
import { UsernameService } from './usernameService';

class InMemoryUsernames implements UsernamePort {
  reservations = new Map<string, { uid: string; releasedAt?: string }>();
  users = new Map<string, { username: string | null; changedAt: string | null }>();

  async getCurrent(uid: string) {
    return this.users.get(uid) ?? { username: null, changedAt: null };
  }
  async isAvailable(username: string, uid: string, nowIso: string) {
    const found = this.reservations.get(username);
    return !found || found.uid === uid || (!!found.releasedAt && found.releasedAt <= nowIso);
  }
  async claim(uid: string, username: string, nowIso: string, releaseAtIso: string) {
    const previous = this.users.get(uid)?.username;
    if (previous) this.reservations.set(previous, { uid, releasedAt: releaseAtIso });
    this.reservations.set(username, { uid });
    this.users.set(uid, { username, changedAt: nowIso });
  }
  async findOwner(username: string): Promise<UsernameOwner | null> {
    const found = this.reservations.get(username);
    if (!found || found.releasedAt) return null;
    return {
      uid: found.uid,
      username,
      displayName: 'Ana Souza',
      photoURL: null,
      email: 'ana@exemplo.com',
      emailVerified: true,
    };
  }
  async releaseAll(uid: string, releaseAtIso: string) {
    for (const [name, value] of this.reservations) {
      if (value.uid === uid)
        this.reservations.set(name, { uid: 'deleted', releasedAt: releaseAtIso });
    }
  }
}

function setup(nowIso = '2026-11-01T12:00:00.000Z') {
  const port = new InMemoryUsernames();
  let now = new Date(nowIso);
  const service = new UsernameService(
    port,
    () => now,
    () => 0.5
  );
  return { port, service, setNow: (iso: string) => (now = new Date(iso)) };
}

describe('@usuário (D21)', () => {
  it('normaliza e recusa formatos inválidos e nomes bloqueados', () => {
    expect(normalizeUsername('@Ana.Souza')).toBe('ana.souza');
    expect(normalizeUsername('ab')).toBeNull();
    expect(normalizeUsername('.ana')).toBeNull();
    expect(normalizeUsername('ana..souza')).toBeNull();
    expect(normalizeUsername('ana souza')).toBeNull();
    expect(normalizeUsername('suporte')).toBeNull();
    expect(normalizeUsername('useguide_oficial')).toBeNull();
    expect(usernameBaseFromName('Ana Sôuza')).toBe('anasouza');
  });

  it('sugere a partir do nome e acrescenta números quando já existe', async () => {
    const { service, port } = setup();
    expect(await service.suggest('u1', 'Ana Souza')).toBe('anasouza');
    port.reservations.set('anasouza', { uid: 'u9' });
    expect(await service.suggest('u1', 'Ana Souza')).toBe('anasouza550');
  });

  it('o @ é único; troca uma vez a cada 30 dias; o antigo fica reservado 14 dias', async () => {
    const { service, port, setNow } = setup();
    await service.claim('u1', 'ana');
    await expect(service.claim('u2', 'ANA')).rejects.toMatchObject({ code: 'USERNAME_TAKEN' });
    setNow('2026-11-20T12:00:00.000Z');
    await expect(service.claim('u1', 'ana.s')).rejects.toMatchObject({
      code: 'USERNAME_CHANGE_TOO_SOON',
    });
    setNow('2026-12-02T12:00:00.000Z');
    await service.claim('u1', 'ana.s');
    await expect(service.claim('u2', 'ana')).rejects.toMatchObject({ code: 'USERNAME_TAKEN' });
    expect(port.reservations.get('ana')?.releasedAt).toBe('2026-12-16T12:00:00.000Z');
    setNow('2026-12-17T12:00:00.000Z');
    await expect(service.claim('u2', 'ana')).resolves.toBe('ana');
  });

  it('busca devolve só o perfil público; @ antigo ou de conta excluída não é achado', async () => {
    const { service } = setup();
    await service.claim('u1', 'ana');
    expect(await service.findProfile('@ana')).toEqual({
      username: 'ana',
      displayName: 'Ana Souza',
      photoURL: null,
    });
    await service.releaseAll('u1');
    await expect(service.findProfile('ana')).rejects.toMatchObject({ code: 'USERNAME_NOT_FOUND' });
  });
});

=== server/domain/users/services/usernameService.ts — ARQUIVO NOVO, conteúdo completo ===
import { UsernameError } from '../errors/usernameError';
import type { UsernameOwner, UsernamePort } from '../ports/usernamePort';
import {
  USERNAME_CHANGE_INTERVAL_DAYS,
  USERNAME_RELEASE_DAYS,
  normalizeUsername,
  usernameBaseFromName,
} from '../utils/username';

const DAY_MS = 24 * 60 * 60_000;
const SUGGESTION_ATTEMPTS = 8;

/** Perfil público do @, sem e-mail: é o que a tela mostra para confirmar a transferência. */
export interface UsernameProfile {
  username: string;
  displayName: string | null;
  photoURL: string | null;
}

/** @usuário (D21): sugestão, escolha, troca a cada 30 dias e busca. */
export class UsernameService {
  constructor(
    private readonly port: UsernamePort,
    private readonly now: () => Date = () => new Date(),
    private readonly random: () => number = Math.random
  ) {}

  async suggest(uid: string, name: string): Promise<string> {
    const base = usernameBaseFromName(name);
    const nowIso = this.now().toISOString();
    for (let attempt = 0; attempt < SUGGESTION_ATTEMPTS; attempt += 1) {
      const candidate =
        attempt === 0 ? base : `${base}${Math.floor(this.random() * 900 + 100)}`.slice(0, 30);
      const normalized = normalizeUsername(candidate);
      if (normalized && (await this.port.isAvailable(normalized, uid, nowIso))) return normalized;
    }
    return `${base.slice(0, 20)}${Date.now().toString(36).slice(-6)}`;
  }

  async claim(uid: string, rawUsername: string): Promise<string> {
    const username = normalizeUsername(rawUsername);
    if (!username) throw new UsernameError('USERNAME_INVALID', 'Nome de usuário inválido.');
    const now = this.now();
    const current = await this.port.getCurrent(uid);
    if (current.username === username) return username;
    if (
      current.username &&
      current.changedAt &&
      now.getTime() - new Date(current.changedAt).getTime() < USERNAME_CHANGE_INTERVAL_DAYS * DAY_MS
    ) {
      throw new UsernameError(
        'USERNAME_CHANGE_TOO_SOON',
        'O nome de usuário só pode ser trocado uma vez a cada 30 dias.'
      );
    }
    const nowIso = now.toISOString();
    if (!(await this.port.isAvailable(username, uid, nowIso))) {
      throw new UsernameError('USERNAME_TAKEN', 'Este nome de usuário já está em uso.');
    }
    await this.port.claim(
      uid,
      username,
      nowIso,
      new Date(now.getTime() + USERNAME_RELEASE_DAYS * DAY_MS).toISOString()
    );
    return username;
  }

  async findProfile(rawUsername: string): Promise<UsernameProfile> {
    const { username, displayName, photoURL } = await this.findOwner(rawUsername);
    return { username, displayName, photoURL };
  }

  async findOwner(rawUsername: string): Promise<UsernameOwner> {
    const username = normalizeUsername(rawUsername);
    const owner = username ? await this.port.findOwner(username) : null;
    if (!owner) throw new UsernameError('USERNAME_NOT_FOUND', 'Usuário não encontrado.');
    return owner;
  }

  async releaseAll(uid: string): Promise<void> {
    const releaseAt = new Date(this.now().getTime() + USERNAME_RELEASE_DAYS * DAY_MS);
    await this.port.releaseAll(uid, releaseAt.toISOString());
  }
}

=== server/domain/users/usecases/claimUsernameUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { usernameService } from '../factory';

/** Escolhe ou troca o @ da conta (troca uma vez a cada 30 dias, D21). */
export function claimUsernameUseCase(uid: string, username: string): Promise<string> {
  return usernameService.claim(uid, username);
}

=== server/domain/users/usecases/findUserByUsernameUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { usernameService } from '../factory';
import type { UsernameProfile } from '../services/usernameService';

/** Perfil público do @ (foto, nome e @), para confirmar quem recebe uma transferência. */
export function findUserByUsernameUseCase(username: string): Promise<UsernameProfile> {
  return usernameService.findProfile(username);
}

=== server/domain/users/usecases/releaseUsernamesUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { usernameService } from '../factory';

/** Exclusão de conta: o @ fica reservado por 14 dias e depois é liberado (D21). */
export function releaseUsernamesUseCase(uid: string): Promise<void> {
  return usernameService.releaseAll(uid);
}

=== server/domain/users/usecases/resolveUsernameOwnerUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { usernameService } from '../factory';
import type { UsernameOwner } from '../ports/usernamePort';

/** Conta dona do @, com e-mail e verificação, só para uso no servidor (transferência, D21). */
export function resolveUsernameOwnerUseCase(username: string): Promise<UsernameOwner> {
  return usernameService.findOwner(username);
}

=== server/domain/users/usecases/suggestUsernameUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { usernameService } from '../factory';

/** Sugestão de @ a partir do nome, já conferida como livre (D21). */
export function suggestUsernameUseCase(uid: string, name: string): Promise<string> {
  return usernameService.suggest(uid, name);
}

=== server/domain/users/utils/username.ts — ARQUIVO NOVO, conteúdo completo ===
/** Nome de usuário (D21): 3 a 30 caracteres a–z, 0–9, ponto e sublinhado; sem ponto no início, no fim ou repetido. */
const USERNAME_PATTERN = /^(?!\.)(?!.*\.\.)(?!.*\.$)[a-z0-9._]{3,30}$/;

// Nomes que se passariam pela plataforma ou por funções do app.
const BLOCKED = new Set([
  'admin',
  'administrador',
  'root',
  'suporte',
  'support',
  'ajuda',
  'help',
  'useguide',
  'use.guide',
  'use_guide',
  'oficial',
  'official',
  'staff',
  'equipe',
  'moderador',
  'sistema',
  'system',
  'api',
  'www',
]);

export const USERNAME_CHANGE_INTERVAL_DAYS = 30;
export const USERNAME_RELEASE_DAYS = 14;

/** Aceita `@` na frente e maiúsculas; devolve o nome comparável ou null se não for válido. */
export function normalizeUsername(input: string): string | null {
  const value = input.trim().replace(/^@/, '').toLowerCase();
  if (!USERNAME_PATTERN.test(value)) return null;
  return BLOCKED.has(value) || value.startsWith('useguide') ? null : value;
}

/** Base da sugestão a partir do nome, sem acentos nem espaços (ex.: "Ana Souza" → "anasouza"). */
export function usernameBaseFromName(name: string): string {
  const base = name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .slice(0, 24);
  return base.length >= 3 ? base : `viajante${base}`.slice(0, 24);
}

=== server/infrastructure/firebase/firestoreRateLimiter.ts — ARQUIVO NOVO, conteúdo completo ===
import crypto from 'crypto';
import { adminDb } from './adminClient';

const RATE_LIMITS = 'rateLimits';

/**
 * Janela fixa num documento por chave, atualizado em transação (Cloud Run não guarda estado em
 * memória, §2.3). A chave vira hash para nunca gravar uid ou IP em texto (§7.5).
 * Devolve false quando o limite da janela já foi atingido.
 */
export async function consumeRateLimit(
  key: string,
  limit: number,
  windowMs: number,
  nowMs = Date.now()
): Promise<boolean> {
  const id = crypto.createHash('sha256').update(key).digest('hex');
  const ref = adminDb.collection(RATE_LIMITS).doc(id);
  return adminDb.runTransaction(async (tx) => {
    const data = (await tx.get(ref)).data();
    const windowStart = typeof data?.windowStart === 'number' ? data.windowStart : 0;
    const fresh = nowMs - windowStart >= windowMs;
    const count = fresh ? 0 : typeof data?.count === 'number' ? data.count : 0;
    if (count >= limit) return false;
    tx.set(ref, {
      windowStart: fresh ? nowMs : windowStart,
      count: count + 1,
      // Campo para a política de TTL do Firestore apagar janelas antigas.
      expiresAt: new Date((fresh ? nowMs : windowStart) + windowMs * 2),
    });
    return true;
  });
}

=== server/infrastructure/http/rateLimitByUser.ts — ARQUIVO NOVO, conteúdo completo ===
import type { NextFunction, Request, Response } from 'express';
import { consumeRateLimit } from '../firebase/firestoreRateLimiter';

/**
 * Limite por conta (AGENTS.md §7.4) para rotas autenticadas. Usar depois de `verifyAuthToken`.
 * Falha do armazenamento deixa passar: o limite protege contra varredura, não é autorização.
 */
export function rateLimitByUser(name: string, limit: number, windowMs: number) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const uid = (req as Request & { user?: { uid?: string } }).user?.uid;
    if (!uid) return next();
    const allowed = await consumeRateLimit(`${name}:${uid}`, limit, windowMs).catch(() => true);
    if (allowed) return next();
    return res.status(429).json({
      error: { code: 'RATE_LIMITED', message: 'Muitas tentativas. Tente de novo em alguns minutos.' },
    });
  };
}

=== server/interfaces/http/ticketTransfers/ticketTransferController.ts — ARQUIVO NOVO, conteúdo completo ===
import type { Response } from 'express';
import {
  TicketTransferError,
  transferTicketToUsernameApplicationUseCase,
} from '../../../application/usecases/ticketing/transferTicketToUsernameApplicationUseCase';
import { TicketingDomainError } from '../../../domain/ticketing';
import { UsernameError } from '../../../domain/users';
import type { AuthenticatedRequest } from '../../../infrastructure/auth/authenticatedRequest';
import { ticketTransferSchema } from './ticketTransferSchema';

const TICKETING_STATUS: Record<TicketingDomainError['code'], number> = {
  INVALID_ARGUMENT: 400,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  SERVICE_UNAVAILABLE: 503,
};

function sendError(res: Response, status: number, code: string, message: string): Response {
  return res.status(status).json({ error: { code, message } });
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
      if (error instanceof UsernameError) {
        return sendError(res, error.code === 'USERNAME_NOT_FOUND' ? 404 : 400, error.code, error.message);
      }
      if (error instanceof TicketTransferError) {
        return sendError(res, 422, error.code, error.message);
      }
      if (error instanceof TicketingDomainError) {
        return sendError(res, TICKETING_STATUS[error.code], error.code, error.message);
      }
      console.error('[ticketTransfer.transfer]', error instanceof Error ? error.name : 'unknown');
      return sendError(res, 500, 'INTERNAL_ERROR', 'Não foi possível transferir o ingresso.');
    }
  }
}

=== server/interfaces/http/ticketTransfers/ticketTransferRoutes.ts — ARQUIVO NOVO, conteúdo completo ===
import { type NextFunction, type Response, Router } from 'express';
import type { AuthenticatedRequest } from '../../../infrastructure/auth/authenticatedRequest';
import { verifyAuthToken } from '../../../infrastructure/auth/authMiddleware';
import { rateLimitByUser } from '../../../infrastructure/http/rateLimitByUser';
import { TicketTransferController } from './ticketTransferController';

// Transferir tira o ingresso da conta: token revogado é recusado (AGENTS.md §7.3).
function verifyAuthTokenStrict(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  return verifyAuthToken(req, res, next, { checkRevoked: true });
}

export const ticketTransferRouter = Router();
ticketTransferRouter.post(
  '/',
  verifyAuthTokenStrict,
  rateLimitByUser('ticket-transfer', 20, 60 * 60_000),
  TicketTransferController.transfer
);

=== server/interfaces/http/ticketTransfers/ticketTransferSchema.ts — ARQUIVO NOVO, conteúdo completo ===
import { z } from 'zod';

export const ticketTransferSchema = z
  .object({
    ticketId: z.string().trim().min(1).max(128),
    username: z.string().trim().min(3).max(31),
  })
  .strict();

=== src/app/menu/SideMenu.tsx — diff ===
@@ -12,6 +12,7 @@ import {
   ImageCropperView,
   MainMenuView,
   AccountView,
+  UsernameSettingsView,
   SettingsView,
   LanguageSettingsView,
   AppearanceSettingsView,
@@ -36,6 +37,7 @@ interface SideMenuProps {
 /** Telas que ocupam a altura toda do menu e rolam por dentro. */
 const FULL_HEIGHT_VIEWS: readonly MenuView[] = [
   'settings',
+  'username',
   'language',
   'appearance',
   'support',
@@ -45,6 +47,7 @@ const FULL_HEIGHT_VIEWS: readonly MenuView[] = [
 const SETTINGS_VIEWS: readonly MenuView[] = [
   'settings',
   'purchases',
+  'username',
   'language',
   'appearance',
   'support',
@@ -152,8 +155,11 @@ export function SideMenu({ onPartnersOpen, onAdminOpen }: SideMenuProps) {
             onOpenSupport={() => showView('support')}
             onOpenAbout={() => showView('about')}
             onOpenPurchases={user ? () => showView('purchases') : undefined}
+            onOpenUsername={user ? () => showView('username') : undefined}
           />
         );
+      case 'username':
+        return <UsernameSettingsView onBack={goBack} />;
       case 'purchases':
         return (
           <BuyerPurchasesComposition

=== src/app/menu/menuViews.ts — diff ===
@@ -12,6 +12,7 @@ export const MENU_VIEWS = [
   'reviews',
   'settings',
   'purchases',
+  'username',
   'language',
   'appearance',
   'support',
@@ -31,6 +32,7 @@ const PARENT_VIEW: Record<Exclude<MenuView, 'main'>, MenuView> = {
   reviews: 'main',
   settings: 'main',
   purchases: 'settings',
+  username: 'settings',
   language: 'settings',
   appearance: 'settings',
   support: 'settings',
@@ -46,6 +48,7 @@ const PRIVATE_VIEWS: readonly MenuView[] = [
   'favorites',
   'reviews',
   'purchases',
+  'username',
 ];
 
 function isMenuView(value: string): value is MenuView {

=== src/domain/ticketing/adapters/httpTicketingAdapter.ts — diff ===
@@ -251,26 +251,21 @@ export class HttpTicketingAdapter implements TicketingPort {
 
   async transferTicket(
     ticketId: string,
-    input: { recipientEmail: string; recipientName?: string }
-  ): Promise<{
-    oldTicket: Ticket;
-    newTicket: Ticket;
-    newRawQrToken: string;
-  }> {
+    username: string
+  ): Promise<{ ticketId: string; recipient: { username: string; displayName: string | null } }> {
     const res = await firebaseApiFetch(
-      `/api/ticketing/tickets/${encodeURIComponent(ticketId)}/transfer`,
+      '/api/ticket-transfers',
       {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
-        body: JSON.stringify(input),
+        body: JSON.stringify({ ticketId, username: username.replace(/^@/, '').toLowerCase() }),
       },
       { requireAuth: true }
     );
-    return parseJsonOrThrow<{
-      oldTicket: Ticket;
-      newTicket: Ticket;
-      newRawQrToken: string;
-    }>(res, 'Não foi possível transferir o ingresso.');
+    const body = await res.json().catch(() => ({}));
+    // Erro com `code` estável: a carteira traduz pela chave (§12.5).
+    if (!res.ok) throw new Error(body?.error?.code || 'INTERNAL_ERROR');
+    return body;
   }
 
   async checkInTicket(input: {

=== src/domain/ticketing/application/usecases/transferTicketUseCase.ts — ARQUIVO REESCRITO, substitua todo o conteúdo por este ===
import { ticketingAdapter } from '../../factory';
import type { TicketingPort } from '../../ports/ticketingPort';

export function transferTicketUseCase(
  ticketId: string,
  username: Parameters<TicketingPort['transferTicket']>[1]
) {
  return ticketingAdapter.transferTicket(ticketId, username);
}

=== src/domain/ticketing/components/UserTicketsHistoryView.tsx — diff ===
@@ -128,8 +128,7 @@ export function UserTicketsHistoryView({ onBack }: UserTicketsHistoryViewProps =
       {actions.transferTicket && (
         <TransferTicketForm
           ticket={actions.transferTicket}
-          busy={actions.busy}
-          onSubmit={(recipient) => void actions.submitTransfer(recipient)}
+          onSubmit={actions.submitTransfer}
           onCancel={() => actions.setTransferTicket(null)}
         />
       )}

=== src/domain/ticketing/components/wallet/TransferTicketForm.tsx — ARQUIVO REESCRITO, substitua todo o conteúdo por este ===
import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StatusText } from '../../../../ui/components/StatusText';
import { TextButton } from '../../../../ui/components/TextButton';
import { BUTTON_PRIMARY, BUTTON_SECONDARY } from '../../../../ui/styles/controls';
import { findUserByUsernameUseCase, type UsernameProfile } from '../../../user';
import type { Ticket } from '../../types/ticketing';

const KNOWN_ERRORS = [
  'USERNAME_NOT_FOUND',
  'TRANSFER_TO_SELF',
  'RECIPIENT_NOT_VERIFIED',
  'RATE_LIMITED',
];

interface TransferTicketFormProps {
  ticket: Ticket;
  onSubmit: (username: string) => Promise<void>;
  onCancel: () => void;
}

/** Transferência pelo @ (D21): procura a conta, mostra foto, nome e @ e só então transfere. */
export function TransferTicketForm({ ticket, onSubmit, onCancel }: TransferTicketFormProps) {
  const { t } = useTranslation();
  const inputId = useId();
  const [value, setValue] = useState('');
  const [recipient, setRecipient] = useState<UsernameProfile | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fail = (err: unknown) => {
    const code =
      err instanceof Error && KNOWN_ERRORS.includes(err.message) ? err.message : 'failed';
    setError(t(`username.transfer.errors.${code}`));
  };

  const search = async () => {
    setBusy(true);
    setError(null);
    try {
      setRecipient(await findUserByUsernameUseCase(value));
    } catch (err: unknown) {
      fail(err);
    } finally {
      setBusy(false);
    }
  };

  const confirm = async () => {
    if (!recipient) return;
    setBusy(true);
    setError(null);
    try {
      await onSubmit(recipient.username);
    } catch (err: unknown) {
      fail(err);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="p-4 rounded-[20px] bg-surface border border-accent-line space-y-4">
      <h4 className="text-sm font-semibold text-ink">
        {t('username.transfer.title')}
        <span className="text-ink/70">
          {' '}
          · {ticket.eventSnapshot?.title ?? ticket.id.slice(0, 8)}
        </span>
      </h4>

      {recipient ? (
        <div className="space-y-3">
          <p className="text-[13px] font-semibold text-ink/80">
            {t('username.transfer.confirmTitle')}
          </p>
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-ink/[0.04]">
            {recipient.photoURL ? (
              <img
                src={recipient.photoURL}
                alt=""
                width={48}
                height={48}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <span
                className="w-12 h-12 rounded-full bg-accent-soft text-accent flex items-center justify-center text-lg font-bold"
                aria-hidden="true"
              >
                {(recipient.displayName ?? recipient.username).charAt(0).toUpperCase()}
              </span>
            )}
            <div className="min-w-0">
              <p className="text-[15px] font-semibold text-ink truncate">
                {recipient.displayName ?? recipient.username}
              </p>
              <p className="text-[13px] text-ink/70 truncate">@{recipient.username}</p>
            </div>
          </div>
          <p className="text-[13px] text-ink/70">{t('username.transfer.hint')}</p>
          {error && (
            <p role="alert">
              <StatusText tone="danger">{error}</StatusText>
            </p>
          )}
          <button
            type="button"
            disabled={busy}
            onClick={() => void confirm()}
            className={`${BUTTON_PRIMARY} w-full`}
          >
            {t('username.transfer.confirm', { username: recipient.username })}
          </button>
          <div className="flex flex-wrap justify-center gap-x-4">
            <TextButton tone="ink" onClick={() => setRecipient(null)}>
              {t('username.transfer.other')}
            </TextButton>
            <TextButton tone="ink" onClick={onCancel}>
              {t('common.cancel')}
            </TextButton>
          </div>
        </div>
      ) : (
        <form
          className="space-y-3"
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            void search();
          }}
        >
          <label htmlFor={inputId} className="block text-[13px] font-semibold text-ink/80">
            {t('username.transfer.label')}
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
              className="flex-1 min-w-0 min-h-11 px-1 bg-transparent text-sm text-ink focus:outline-none"
            />
          </div>
          {error && (
            <p role="alert">
              <StatusText tone="danger">{error}</StatusText>
            </p>
          )}
          <div className="flex flex-wrap items-center justify-end gap-2">
            <button type="button" onClick={onCancel} className={BUTTON_SECONDARY}>
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={busy || value.replace(/^@/, '').trim().length < 3}
              className={BUTTON_PRIMARY}
            >
              {t('username.transfer.search')}
            </button>
          </div>
        </form>
      )}
    </section>
  );
}

=== src/domain/ticketing/hooks/useTicketWalletActions.ts — diff ===
@@ -73,13 +73,13 @@ export function useTicketWalletActions(wallet: WalletData) {
       setFeedback({ type: 'success', message: t('ticketWallet.feedback.qrReissued') });
     }, 'ticketWallet.errors.qrReissue');
 
-  const submitTransfer = (recipient: { email: string; name?: string }) =>
-    run(async () => {
-      if (!transferTicket) return;
-      await wallet.transferTicket(transferTicket.id, recipient.email, recipient.name);
-      setTransferTicket(null);
-      setFeedback({ type: 'success', message: t('ticketWallet.feedback.transferred') });
-    }, 'ticketWallet.errors.transfer');
+  // Erros com código ficam no formulário, que mostra o motivo traduzido junto do @.
+  const submitTransfer = async (username: string) => {
+    if (!transferTicket) return;
+    await wallet.transferTicket(transferTicket.id, username);
+    setTransferTicket(null);
+    setFeedback({ type: 'success', message: t('username.transfer.done', { username }) });
+  };
 
   const requestRefund = (order: TicketOrder) =>
     run(async () => {

=== src/domain/ticketing/hooks/useUserTickets.ts — diff ===
@@ -30,9 +30,7 @@ export function useUserTicketsAndOrders(enabled = true) {
       setOrders(loadedOrders);
     } catch (err) {
       console.error('[useUserTicketsAndOrders]', err);
-      setError(
-        err instanceof Error ? err.message : 'Não foi possível carregar seus ingressos.'
-      );
+      setError(err instanceof Error ? err.message : 'Não foi possível carregar seus ingressos.');
     } finally {
       setLoading(false);
     }
@@ -43,9 +41,9 @@ export function useUserTicketsAndOrders(enabled = true) {
   }, [reload]);
 
   const transferTicket = useCallback(
-    async (ticketId: string, recipientEmail: string, recipientName?: string) => {
+    async (ticketId: string, username: string) => {
       setError(null);
-      const res = await transferTicketUseCase(ticketId, { recipientEmail, recipientName });
+      const res = await transferTicketUseCase(ticketId, username);
       await reload();
       return res;
     },

=== src/domain/ticketing/ports/ticketingPort.ts — diff ===
@@ -102,14 +102,11 @@ export interface TicketingPort {
     orderId: string,
     input: { ticketId?: string; reason: string; idempotencyKey: string }
   ): Promise<Refund>;
+  /** Transfere para a conta dona do @ (D21); erro vira `Error(code)`. */
   transferTicket(
     ticketId: string,
-    input: { recipientEmail: string; recipientName?: string }
-  ): Promise<{
-    oldTicket: Ticket;
-    newTicket: Ticket;
-    newRawQrToken: string;
-  }>;
+    username: string
+  ): Promise<{ ticketId: string; recipient: { username: string; displayName: string | null } }>;
   checkInTicket(input: {
     occurrenceId: string;
     ticketId?: string;

=== src/domain/user/adapters/apiUserAdapter.ts — diff ===
@@ -1,6 +1,6 @@
 import { UserPort } from '../ports/userPort';
 import type { Locale } from '../../../shared/i18n';
-import { UserProfile, UserData } from '../types/user';
+import { UserProfile, UserData, UsernameProfile } from '../types/user';
 import { firebaseApiFetch } from '../../../shared/infrastructure/firebase/firebaseApiFetch';
 
 export class ApiUserAdapter implements UserPort {
@@ -74,4 +74,42 @@ export class ApiUserAdapter implements UserPort {
       throw new Error(errorData.error || 'Falha ao excluir conta via API');
     }
   }
+
+  async suggestUsername(name: string): Promise<string> {
+    const response = await firebaseApiFetch(
+      `/api/users/me/username-suggestion?name=${encodeURIComponent(name)}`,
+      {},
+      { requireAuth: true }
+    );
+    return (await readJson<{ username: string }>(response)).username;
+  }
+
+  async claimUsername(username: string): Promise<string> {
+    const response = await firebaseApiFetch(
+      '/api/users/me/username',
+      {
+        method: 'PUT',
+        headers: { 'Content-Type': 'application/json' },
+        body: JSON.stringify({ username }),
+      },
+      { requireAuth: true }
+    );
+    return (await readJson<{ username: string }>(response)).username;
+  }
+
+  async findByUsername(username: string): Promise<UsernameProfile> {
+    const response = await firebaseApiFetch(
+      `/api/users/by-username/${encodeURIComponent(username.replace(/^@/, '').toLowerCase())}`,
+      {},
+      { requireAuth: true }
+    );
+    return readJson<UsernameProfile>(response);
+  }
+}
+
+/** Erro vira `Error(code)` para a tela traduzir (§12.5). */
+async function readJson<T>(response: Response): Promise<T> {
+  const body = await response.json().catch(() => ({}));
+  if (!response.ok) throw new Error(body?.error?.code || 'INTERNAL_ERROR');
+  return body as T;
 }

=== src/domain/user/application/usecases/claimUsernameUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { userAdapter } from '../../factory';

export function claimUsernameUseCase(username: string): Promise<string> {
  return userAdapter.claimUsername(username);
}

=== src/domain/user/application/usecases/findUserByUsernameUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { userAdapter } from '../../factory';
import type { UsernameProfile } from '../../types/user';

/** Perfil público do @ (D21); outros domínios usam para confirmar uma transferência. */
export function findUserByUsernameUseCase(username: string): Promise<UsernameProfile> {
  return userAdapter.findByUsername(username);
}

=== src/domain/user/application/usecases/suggestUsernameUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { userAdapter } from '../../factory';

export function suggestUsernameUseCase(name: string): Promise<string> {
  return userAdapter.suggestUsername(name);
}

=== src/domain/user/components/SettingsView.tsx — diff ===
@@ -1,4 +1,5 @@
 import {
+  AtSign,
   ChevronRight,
   HelpCircle,
   Info,
@@ -22,6 +23,8 @@ interface SettingsViewProps {
   onOpenAbout: () => void;
   /** Só com login: o histórico de compras é da conta. */
   onOpenPurchases?: () => void;
+  /** Só com login: o @ que outras pessoas usam para transferir ingressos (D21). */
+  onOpenUsername?: () => void;
 }
 
 function SettingsRow({
@@ -58,6 +61,7 @@ export function SettingsView({
   onOpenSupport,
   onOpenAbout,
   onOpenPurchases,
+  onOpenUsername,
 }: SettingsViewProps) {
   const { t } = useTranslation();
   const { theme } = useTheme();
@@ -73,6 +77,9 @@ export function SettingsView({
       </div>
 
       <ul className="rounded-[20px] bg-surface border border-line divide-y divide-line overflow-hidden">
+        {onOpenUsername && (
+          <SettingsRow icon={AtSign} label={t('username.title')} onClick={onOpenUsername} />
+        )}
         {onOpenPurchases && (
           <SettingsRow
             icon={ShoppingBag}

=== src/domain/user/components/UsernameSettingsView.tsx — ARQUIVO NOVO, conteúdo completo ===
import { useEffect, useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { formatBusinessDate } from '../../../shared/utils/businessDateTime';
import { BackButton } from '../../../ui/components/BackButton';
import { StatusText } from '../../../ui/components/StatusText';
import { TextButton } from '../../../ui/components/TextButton';
import { BUTTON_PRIMARY } from '../../../ui/styles/controls';
import { useUsername } from '../hooks/useUsername';
import {
  isUsernameFormatValid,
  nextUsernameChangeAt,
  normalizeUsernameInput,
} from '../utils/username';

const KNOWN_ERRORS = ['USERNAME_INVALID', 'USERNAME_TAKEN', 'USERNAME_CHANGE_TOO_SOON'];

/** Configurações › Nome de usuário: o @ que outras pessoas usam para transferir ingressos (D21). */
export function UsernameSettingsView({ onBack }: { onBack: () => void }) {
  const { t, i18n } = useTranslation();
  const inputId = useId();
  const { current, changedAt, suggestion, loading, error, reload, save } = useUsername();
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
    } catch (err: unknown) {
      const code =
        err instanceof Error && KNOWN_ERRORS.includes(err.message) ? err.message : 'failed';
      setResult({ tone: 'danger', message: t(`username.errors.${code}`) });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-5">
        <BackButton label={t('settings.back')} onClick={onBack} />
        <h2 className="text-[22px] font-display font-bold text-ink">{t('username.title')}</h2>
      </div>

      {loading ? (
        <div className="h-28 rounded-[20px] bg-ink/[0.04] animate-pulse motion-reduce:animate-none" />
      ) : error ? (
        <div className="flex items-center justify-between gap-2 text-[13px] text-ink/70">
          <span>{t('username.loadError')}</span>
          <TextButton tone="accent" onClick={() => void reload()}>
            {t('username.retry')}
          </TextButton>
        </div>
      ) : (
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
      )}
    </div>
  );
}

=== src/domain/user/hooks/useUsername.ts — ARQUIVO NOVO, conteúdo completo ===
import { useCallback, useEffect, useState } from 'react';
import { claimUsernameUseCase } from '../application/usecases/claimUsernameUseCase';
import { getCurrentUserUseCase } from '../application/usecases/getCurrentUserUseCase';
import { suggestUsernameUseCase } from '../application/usecases/suggestUsernameUseCase';

/** @ da conta: o atual ou, se ainda não tem, uma sugestão a partir do nome (D21). */
export function useUsername() {
  const [current, setCurrent] = useState<string | null>(null);
  const [changedAt, setChangedAt] = useState<string | null>(null);
  const [suggestion, setSuggestion] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const profile = await getCurrentUserUseCase();
      setCurrent(profile?.username ?? null);
      setChangedAt(profile?.usernameChangedAt ?? null);
      if (!profile?.username) {
        const name = `${profile?.firstName ?? ''} ${profile?.lastName ?? ''}`.trim();
        setSuggestion(await suggestUsernameUseCase(name));
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const save = useCallback(async (username: string) => {
    const saved = await claimUsernameUseCase(username);
    setCurrent(saved);
    setChangedAt(new Date().toISOString());
    return saved;
  }, []);

  return { current, changedAt, suggestion, loading, error, reload: load, save };
}

=== src/domain/user/index.ts — diff ===
@@ -26,6 +26,9 @@ export { useUserProfile } from './hooks/useUserProfile';
 export { useUserPhoto } from './hooks/useUserPhoto';
 
 export { AccountView } from './components/AccountView';
+export { UsernameSettingsView } from './components/UsernameSettingsView';
+export { findUserByUsernameUseCase } from './application/usecases/findUserByUsernameUseCase';
+export type { UsernameProfile } from './types/user';
 export { ChangePasswordView } from './components/ChangePasswordView';
 export { ImageCropperView } from './components/ImageCropperView';
 export { MainMenuView } from './components/MainMenuView';

=== src/domain/user/ports/userPort.ts — ARQUIVO REESCRITO, substitua todo o conteúdo por este ===
import type { Locale } from '../../../shared/i18n';
import { UserProfile, UserData, UsernameProfile } from '../types/user';

export interface UserPort {
  getCurrentUser(): Promise<UserProfile | null>;
  updateCurrentUser(data: UserData): Promise<UserProfile>;
  updatePreferredLocale(locale: Locale): Promise<void>;
  deleteCurrentUser(): Promise<void>;
  suggestUsername(name: string): Promise<string>;
  claimUsername(username: string): Promise<string>;
  findByUsername(username: string): Promise<UsernameProfile>;
}

=== src/domain/user/types/user.ts — diff ===
@@ -13,10 +13,20 @@ export interface UserProfile {
   role?: UserRole;
   /** Idioma escolhido pela pessoa; `null` enquanto ela não escolheu (decisão D10). */
   preferredLocale?: Locale | null;
+  /** @usuário (D21); null até a conta escolher. */
+  username?: string | null;
+  usernameChangedAt?: string | null;
   createdAt?: string | Date;
   updatedAt?: string | Date;
 }
 
+/** Perfil público achado pelo @, para confirmar quem recebe uma transferência. */
+export interface UsernameProfile {
+  username: string;
+  displayName: string | null;
+  photoURL: string | null;
+}
+
 export interface UserData {
   firstName: string;
   lastName: string;

=== src/domain/user/utils/username.test.ts — ARQUIVO NOVO, conteúdo completo ===
import { describe, expect, it } from 'vitest';
import { isUsernameFormatValid, nextUsernameChangeAt, normalizeUsernameInput } from './username';

describe('@usuário na tela (D21)', () => {
  it('normaliza e confere o formato antes de enviar', () => {
    expect(normalizeUsernameInput(' @Ana.Souza ')).toBe('ana.souza');
    expect(isUsernameFormatValid('@ana_souza')).toBe(true);
    expect(isUsernameFormatValid('an')).toBe(false);
    expect(isUsernameFormatValid('ana souza')).toBe(false);
    expect(isUsernameFormatValid('ana.')).toBe(false);
  });

  it('troca de novo só 30 dias depois da última', () => {
    const now = new Date('2026-11-20T12:00:00.000Z');
    expect(nextUsernameChangeAt('ana', '2026-11-01T12:00:00.000Z', now)?.toISOString()).toBe(
      '2026-12-01T12:00:00.000Z'
    );
    expect(nextUsernameChangeAt('ana', '2026-10-01T12:00:00.000Z', now)).toBeNull();
    expect(nextUsernameChangeAt(null, null, now)).toBeNull();
  });
});

=== src/domain/user/utils/username.ts — ARQUIVO NOVO, conteúdo completo ===
/** Mesmas regras do backend (D21): a tela avisa antes de enviar; quem decide é o servidor. */
const USERNAME_PATTERN = /^(?!\.)(?!.*\.\.)(?!.*\.$)[a-z0-9._]{3,30}$/;
const CHANGE_INTERVAL_MS = 30 * 24 * 60 * 60_000;

export function normalizeUsernameInput(value: string): string {
  return value.trim().replace(/^@/, '').toLowerCase();
}

export function isUsernameFormatValid(value: string): boolean {
  return USERNAME_PATTERN.test(normalizeUsernameInput(value));
}

/** Data a partir da qual o @ pode ser trocado de novo; null se já pode. */
export function nextUsernameChangeAt(
  username: string | null | undefined,
  changedAt: string | null | undefined,
  now: Date
): Date | null {
  if (!username || !changedAt) return null;
  const next = new Date(new Date(changedAt).getTime() + CHANGE_INTERVAL_MS);
  return next > now ? next : null;
}

=== src/shared/i18n/resources.ts — diff ===
@@ -110,6 +110,12 @@ import {
   ticketGateFr,
   ticketGatePtBR,
 } from './ticketGateResources';
+import {
+  type UsernameTranslation,
+  usernameEn,
+  usernameFr,
+  usernamePtBR,
+} from './usernameResources';
 import { type LegalTranslation, legalEn, legalFr, legalPtBR } from './legalResources';
 import {
   type VerificationTranslation,
@@ -138,6 +144,7 @@ export interface TranslationResource {
   ticketCheckout: TicketCheckoutTranslation;
   ticketWallet: TicketWalletTranslation;
   ticketGate: TicketGateTranslation;
+  username: UsernameTranslation;
   legal: LegalTranslation;
   verification: VerificationTranslation;
   common: {
@@ -370,6 +377,7 @@ const ptBR: TranslationResource = {
   ticketCheckout: ticketCheckoutPtBR,
   ticketWallet: ticketWalletPtBR,
   ticketGate: ticketGatePtBR,
+  username: usernamePtBR,
   legal: legalPtBR,
   verification: verificationPtBR,
   common: {
@@ -662,6 +670,7 @@ const en: TranslationResource = {
   ticketCheckout: ticketCheckoutEn,
   ticketWallet: ticketWalletEn,
   ticketGate: ticketGateEn,
+  username: usernameEn,
   legal: legalEn,
   verification: verificationEn,
   common: {
@@ -948,6 +957,7 @@ const fr: TranslationResource = {
   ticketCheckout: ticketCheckoutFr,
   ticketWallet: ticketWalletFr,
   ticketGate: ticketGateFr,
+  username: usernameFr,
   legal: legalFr,
   verification: verificationFr,
   common: {

=== src/shared/i18n/ticketWalletResources.ts — diff ===
@@ -25,16 +25,14 @@ export interface TicketWalletTranslation {
   ticketCount_other: string;
   actions: { showQr: string; reissueQr: string; transfer: string };
   ticketStatus: Record<TicketStatusKey, string>;
-  transfer: { title: string; name: string; email: string; confirm: string };
   resume: { title: string; close: string };
   feedback: {
     qrReissued: string;
-    transferred: string;
     refundRequested: string;
     alreadyPaid: string;
     paid: string;
   };
-  errors: { qr: string; qrReissue: string; transfer: string; refund: string; resume: string };
+  errors: { qr: string; qrReissue: string; refund: string; resume: string };
 }
 
 export const ticketWalletPtBR: TicketWalletTranslation = {
@@ -73,16 +71,9 @@ export const ticketWalletPtBR: TicketWalletTranslation = {
     invalidated: 'Inválido',
     expired: 'Expirado',
   },
-  transfer: {
-    title: 'Transferir ingresso #{{id}}',
-    name: 'Nome do novo titular',
-    email: 'E-mail do novo titular',
-    confirm: 'Confirmar transferência',
-  },
   resume: { title: 'Concluir pagamento do pedido #{{id}}', close: 'Fechar' },
   feedback: {
     qrReissued: 'Novo QR Code emitido. O anterior deixou de valer.',
-    transferred: 'Ingresso transferido. O novo titular recebeu um QR Code novo.',
     refundRequested: 'Reembolso solicitado. Você recebe pelo mesmo meio de pagamento.',
     alreadyPaid: 'Seu pagamento já estava confirmado. Ingressos atualizados.',
     paid: 'Pagamento confirmado e ingressos emitidos!',
@@ -90,7 +81,6 @@ export const ticketWalletPtBR: TicketWalletTranslation = {
   errors: {
     qr: 'Não foi possível gerar o QR Code.',
     qrReissue: 'Não foi possível emitir um novo QR Code.',
-    transfer: 'Não foi possível transferir o ingresso.',
     refund: 'Não foi possível pedir o reembolso.',
     resume: 'Não foi possível retomar o pagamento deste pedido.',
   },
@@ -131,16 +121,9 @@ export const ticketWalletEn: TicketWalletTranslation = {
     invalidated: 'Invalid',
     expired: 'Expired',
   },
-  transfer: {
-    title: 'Transfer ticket #{{id}}',
-    name: 'New holder name',
-    email: 'New holder email',
-    confirm: 'Confirm transfer',
-  },
   resume: { title: 'Complete payment for order #{{id}}', close: 'Close' },
   feedback: {
     qrReissued: 'New QR code issued. The previous one is no longer valid.',
-    transferred: 'Ticket transferred. The new holder received a new QR code.',
     refundRequested: 'Refund requested. You will receive it through the same payment method.',
     alreadyPaid: 'Your payment was already confirmed. Tickets updated.',
     paid: 'Payment confirmed and tickets issued!',
@@ -148,7 +131,6 @@ export const ticketWalletEn: TicketWalletTranslation = {
   errors: {
     qr: 'Could not generate the QR code.',
     qrReissue: 'Could not issue a new QR code.',
-    transfer: 'Could not transfer the ticket.',
     refund: 'Could not request the refund.',
     resume: 'Could not resume payment for this order.',
   },
@@ -190,16 +172,9 @@ export const ticketWalletFr: TicketWalletTranslation = {
     invalidated: 'Invalide',
     expired: 'Expiré',
   },
-  transfer: {
-    title: 'Transférer le billet n° {{id}}',
-    name: 'Nom du nouveau titulaire',
-    email: 'E-mail du nouveau titulaire',
-    confirm: 'Confirmer le transfert',
-  },
   resume: { title: 'Finaliser le paiement de la commande n° {{id}}', close: 'Fermer' },
   feedback: {
     qrReissued: 'Nouveau QR code émis. L’ancien n’est plus valable.',
-    transferred: 'Billet transféré. Le nouveau titulaire a reçu un nouveau QR code.',
     refundRequested: 'Remboursement demandé. Vous le recevrez par le même moyen de paiement.',
     alreadyPaid: 'Votre paiement était déjà confirmé. Billets mis à jour.',
     paid: 'Paiement confirmé et billets émis !',
@@ -207,7 +182,6 @@ export const ticketWalletFr: TicketWalletTranslation = {
   errors: {
     qr: 'Impossible de générer le QR code.',
     qrReissue: 'Impossible d’émettre un nouveau QR code.',
-    transfer: 'Impossible de transférer le billet.',
     refund: 'Impossible de demander le remboursement.',
     resume: 'Impossible de reprendre le paiement de cette commande.',
   },

=== src/shared/i18n/usernameResources.ts — ARQUIVO NOVO, conteúdo completo ===
/** Textos do @usuário e da transferência pelo @ (D21). pt-BR é a fonte. */
export interface UsernameTranslation {
  title: string;
  intro: string;
  label: string;
  rules: string;
  save: string;
  change: string;
  changeWarning: string;
  lockedUntil: string;
  saved: string;
  loadError: string;
  retry: string;
  errors: {
    USERNAME_INVALID: string;
    USERNAME_TAKEN: string;
    USERNAME_CHANGE_TOO_SOON: string;
    failed: string;
  };
  transfer: {
    title: string;
    label: string;
    search: string;
    confirmTitle: string;
    confirm: string;
    other: string;
    hint: string;
    done: string;
    errors: {
      USERNAME_NOT_FOUND: string;
      TRANSFER_TO_SELF: string;
      RECIPIENT_NOT_VERIFIED: string;
      RATE_LIMITED: string;
      failed: string;
    };
  };
}

export const usernamePtBR: UsernameTranslation = {
  title: 'Nome de usuário',
  intro: 'É assim que outras pessoas encontram você para transferir ingressos.',
  label: 'Seu @',
  rules: 'De 3 a 30 letras, números, ponto ou sublinhado. Sem espaços nem acentos.',
  save: 'Salvar',
  change: 'Trocar @',
  changeWarning:
    'Você pode trocar uma vez a cada 30 dias. O @ anterior fica guardado com você por 14 dias.',
  lockedUntil: 'Você poderá trocar de novo a partir de {{date}}.',
  saved: 'Pronto: agora você é @{{username}}.',
  loadError: 'Não foi possível carregar seu nome de usuário.',
  retry: 'Tentar de novo',
  errors: {
    USERNAME_INVALID: 'Este @ não é permitido. Use letras, números, ponto ou sublinhado.',
    USERNAME_TAKEN: 'Este @ já está em uso. Escolha outro.',
    USERNAME_CHANGE_TOO_SOON: 'Você trocou de @ há menos de 30 dias.',
    failed: 'Não foi possível salvar. Tente de novo.',
  },
  transfer: {
    title: 'Transferir ingresso',
    label: '@ de quem vai receber',
    search: 'Procurar',
    confirmTitle: 'Confira quem vai receber',
    confirm: 'Transferir para @{{username}}',
    other: 'Procurar outra pessoa',
    hint: 'O ingresso sai da sua carteira, e o QR Code atual deixa de valer.',
    done: 'Ingresso transferido para @{{username}}.',
    errors: {
      USERNAME_NOT_FOUND: 'Nenhuma conta com este @. Peça para a pessoa conferir em Configurações.',
      TRANSFER_TO_SELF: 'Este ingresso já é seu.',
      RECIPIENT_NOT_VERIFIED:
        'Esta conta ainda não confirmou o e-mail e não pode receber ingressos.',
      RATE_LIMITED: 'Muitas buscas seguidas. Tente de novo em alguns minutos.',
      failed: 'Não foi possível transferir. Tente de novo.',
    },
  },
};

export const usernameEn: UsernameTranslation = {
  title: 'Username',
  intro: 'This is how other people find you to transfer tickets.',
  label: 'Your @',
  rules: '3 to 30 letters, numbers, dot or underscore. No spaces or accents.',
  save: 'Save',
  change: 'Change @',
  changeWarning: 'You can change it once every 30 days. Your previous @ stays yours for 14 days.',
  lockedUntil: 'You can change it again from {{date}}.',
  saved: 'Done: you are now @{{username}}.',
  loadError: 'Could not load your username.',
  retry: 'Try again',
  errors: {
    USERNAME_INVALID: 'This @ is not allowed. Use letters, numbers, dot or underscore.',
    USERNAME_TAKEN: 'This @ is already taken. Choose another one.',
    USERNAME_CHANGE_TOO_SOON: 'You changed your @ less than 30 days ago.',
    failed: 'Could not save. Try again.',
  },
  transfer: {
    title: 'Transfer ticket',
    label: 'Recipient’s @',
    search: 'Search',
    confirmTitle: 'Check who will receive it',
    confirm: 'Transfer to @{{username}}',
    other: 'Search someone else',
    hint: 'The ticket leaves your wallet and the current QR code stops working.',
    done: 'Ticket transferred to @{{username}}.',
    errors: {
      USERNAME_NOT_FOUND: 'No account with this @. Ask the person to check it in Settings.',
      TRANSFER_TO_SELF: 'This ticket is already yours.',
      RECIPIENT_NOT_VERIFIED:
        'This account has not confirmed its email and cannot receive tickets.',
      RATE_LIMITED: 'Too many searches in a row. Try again in a few minutes.',
      failed: 'Could not transfer. Try again.',
    },
  },
};

export const usernameFr: UsernameTranslation = {
  title: 'Nom d’utilisateur',
  intro: 'C’est ainsi que les autres vous trouvent pour vous transférer des billets.',
  label: 'Votre @',
  rules: 'De 3 à 30 lettres, chiffres, point ou tiret bas. Sans espaces ni accents.',
  save: 'Enregistrer',
  change: 'Changer de @',
  changeWarning:
    'Vous pouvez le changer une fois tous les 30 jours. L’ancien @ reste à vous pendant 14 jours.',
  lockedUntil: 'Vous pourrez le changer à nouveau à partir du {{date}}.',
  saved: 'C’est fait : vous êtes maintenant @{{username}}.',
  loadError: 'Impossible de charger votre nom d’utilisateur.',
  retry: 'Réessayer',
  errors: {
    USERNAME_INVALID: 'Ce @ n’est pas autorisé. Utilisez lettres, chiffres, point ou tiret bas.',
    USERNAME_TAKEN: 'Ce @ est déjà pris. Choisissez-en un autre.',
    USERNAME_CHANGE_TOO_SOON: 'Vous avez changé de @ il y a moins de 30 jours.',
    failed: 'Impossible d’enregistrer. Réessayez.',
  },
  transfer: {
    title: 'Transférer le billet',
    label: '@ du destinataire',
    search: 'Rechercher',
    confirmTitle: 'Vérifiez qui va le recevoir',
    confirm: 'Transférer à @{{username}}',
    other: 'Chercher une autre personne',
    hint: 'Le billet quitte votre portefeuille et le QR code actuel ne fonctionne plus.',
    done: 'Billet transféré à @{{username}}.',
    errors: {
      USERNAME_NOT_FOUND:
        'Aucun compte avec ce @. Demandez à la personne de le vérifier dans Réglages.',
      TRANSFER_TO_SELF: 'Ce billet est déjà à vous.',
      RECIPIENT_NOT_VERIFIED:
        'Ce compte n’a pas confirmé son e-mail et ne peut pas recevoir de billets.',
      RATE_LIMITED: 'Trop de recherches d’affilée. Réessayez dans quelques minutes.',
      failed: 'Impossible de transférer. Réessayez.',
    },
  },
};

VERIFICAÇÃO (obrigatória):
- `npm run typecheck`, `npx biome lint .` (0 erros; arquivos tocados sem avisos), `npm run build`;
- testes ligados aos arquivos deste prompt: `npx vitest related --run server.ts server/application/usecases/deleteUserAccountApplicationUseCase.test.ts server/application/usecases/deleteUserAccountApplicationUseCase.ts server/application/usecases/ticketing/transferTicketToUsernameApplicationUseCase.test.ts server/application/usecases/ticketing/transferTicketToUsernameApplicationUseCase.ts server/domain/ticketing/controllers/ticketingController.ts server/domain/ticketing/routes/ticketingRoutes.ts server/domain/ticketing/schemas/ticketingSchema.ts server/domain/users/adapters/firestoreUserAdapter.test.ts server/domain/users/adapters/firestoreUsernameAdapter.ts server/domain/users/controllers/usernameController.ts server/domain/users/dtos/userDto.ts server/domain/users/errors/usernameError.ts server/domain/users/factory.ts server/domain/users/index.ts server/domain/users/ports/usernamePort.ts server/domain/users/routes/userRoutes.ts server/domain/users/schemas/usernameSchema.ts server/domain/users/services/userService.test.ts server/domain/users/services/usernameService.test.ts server/domain/users/services/usernameService.ts server/domain/users/usecases/claimUsernameUseCase.ts server/domain/users/usecases/findUserByUsernameUseCase.ts server/domain/users/usecases/releaseUsernamesUseCase.ts server/domain/users/usecases/resolveUsernameOwnerUseCase.ts server/domain/users/usecases/suggestUsernameUseCase.ts server/domain/users/utils/username.ts server/infrastructure/firebase/firestoreRateLimiter.ts server/infrastructure/http/rateLimitByUser.ts server/interfaces/http/ticketTransfers/ticketTransferController.ts server/interfaces/http/ticketTransfers/ticketTransferRoutes.ts server/interfaces/http/ticketTransfers/ticketTransferSchema.ts src/app/menu/SideMenu.tsx src/app/menu/menuViews.ts src/domain/ticketing/adapters/httpTicketingAdapter.ts src/domain/ticketing/application/usecases/transferTicketUseCase.ts src/domain/ticketing/components/UserTicketsHistoryView.tsx src/domain/ticketing/components/wallet/TransferTicketForm.tsx src/domain/ticketing/hooks/useTicketWalletActions.ts src/domain/ticketing/hooks/useUserTickets.ts src/domain/ticketing/ports/ticketingPort.ts src/domain/user/adapters/apiUserAdapter.ts src/domain/user/application/usecases/claimUsernameUseCase.ts src/domain/user/application/usecases/findUserByUsernameUseCase.ts src/domain/user/application/usecases/suggestUsernameUseCase.ts src/domain/user/components/SettingsView.tsx src/domain/user/components/UsernameSettingsView.tsx src/domain/user/hooks/useUsername.ts src/domain/user/index.ts src/domain/user/ports/userPort.ts src/domain/user/types/user.ts src/domain/user/utils/username.test.ts src/domain/user/utils/username.ts src/shared/i18n/resources.ts src/shared/i18n/ticketWalletResources.ts src/shared/i18n/usernameResources.ts` (todos verdes). Não precisa rodar a suíte inteira.
- `npm run test:rules` (as regras mudaram).

ENTREGA: responda no formato do AGENTS.md §16.3.

LIMPEZA (obrigatória, ao terminar de implementar): apague todos os arquivos de public/assets/aistudio/, inclusive o deste prompt. São cópias dos textos colados no chat, salvas automaticamente pelo AI Studio, e public/ vai para o site publicado. Se a pasta ficar vazia, apague a pasta também.
~~~~

### Configurações manuais (você faz, fora do AI Studio, depois de aplicar este prompt)

1. Publique as regras e os índices do Firestore: `firebase deploy --only firestore:rules,firestore:indexes`.
2. Opcional, para limpar documentos vencidos: no console do Firestore › TTL, crie uma política na coleção `rateLimits` com o campo `expiresAt`.
