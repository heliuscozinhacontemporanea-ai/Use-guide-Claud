# Prompt 18.4d.3a — Força maior na multa de cancelamento (D16)

> Lote 17, gerado do commit de referência `cd796c0` da branch `claude/agents-md-v2`. Aplique depois do 18.4d.2. Cole o bloco abaixo no agente do AI Studio, inteiro, de uma vez.

---

## Prompt 18.4d.3a — Força maior na multa de cancelamento (D16)

Terceira parte do 18.4d (só backend). As telas vêm no 18.4e (parceiro) e no 18.4f (admin).

~~~~text
Siga o AGENTS.md. NÃO altere o AGENTS.md. O app ainda não foi liberado para usuários: nenhum código de compatibilidade ou transição (§2.2 item 8).

IMPORTANTE: aplique os diffs abaixo EXATAMENTE, inclusive os arquivos novos. Não reescreva os arquivos do seu jeito. Arquivo tocado sai sem avisos do lint e formatado (AGENTS.md §13). Nenhuma dependência nova.

DECISÃO D16 item 3A (docs/arquitetura/decisoes.md): o proprietário declara o motivo e anexa prova (PDF ou foto, caminho privado); o admin aprova. Até a decisão, a multa fica suspensa; recusada, passa a valer com prazo de 24 h.

O QUE MUDA:
1) Dívida: novo status suspended (não vence, não é descontada dos repasses, não bloqueia vendas e não pode ser cobrada) e campo forceMajeure (motivo, caminho da prova, status pending | approved | rejected, quem declarou e quem decidiu). O motivo é texto confidencial e nunca vai para log.
2) DebtService: declareForceMajeure (só multa de cancelamento, aberta, antes do vencimento, uma vez; dívida de outro CNPJ responde 404), listForceMajeureReviews, getForceMajeureProofPath e decideForceMajeure (aprovada = perdoada; recusada = volta a open com vencimento em 24 h). O perdão manual do admin também vale para multa suspensa.
3) A prova usa o envio que já existe (POST /api/media/verification-files) e precisa estar na pasta privada do próprio parceiro.
4) Rotas: POST /api/payment-accounts/debts/:debtId/force-majeure (parceiro, token com checkRevoked); GET /api/admin/account-debts/force-majeure, GET /api/admin/account-debts/:debtId/force-majeure/proof (o arquivo sai pelo backend, com no-store e log de auditoria) e POST /api/admin/account-debts/:debtId/force-majeure/decision (só admin, com log de auditoria).
5) Índice novo: accountDebts (status, createdAt).

ARQUIVOS (crie, altere ou apague exatamente estes):
- firestore.indexes.json (alterar)
- server.ts (alterar)
- server/application/usecases/paymentAccounts/declarePartnerForceMajeureApplicationUseCase.ts (criar)
- server/application/usecases/paymentAccounts/readForceMajeureProofApplicationUseCase.ts (criar)
- server/domain/payment/adapters/firestoreAccountDebtAdapter.ts (alterar)
- server/domain/payment/adapters/inMemoryAccountDebtAdapter.ts (alterar)
- server/domain/payment/index.ts (alterar)
- server/domain/payment/ports/accountDebtRepositoryPort.ts (alterar)
- server/domain/payment/services/debtService.test.ts (alterar)
- server/domain/payment/services/debtService.ts (alterar)
- server/domain/payment/types/accountDebt.ts (alterar)
- server/domain/payment/usecases/decideForceMajeureUseCase.ts (criar)
- server/domain/payment/usecases/declareForceMajeureUseCase.ts (criar)
- server/domain/payment/usecases/getForceMajeureProofPathUseCase.ts (criar)
- server/domain/payment/usecases/listForceMajeureReviewsUseCase.ts (criar)
- server/interfaces/http/paymentAccounts/forceMajeureController.test.ts (criar)
- server/interfaces/http/paymentAccounts/forceMajeureController.ts (criar)
- server/interfaces/http/paymentAccounts/paymentAccountRoutes.ts (alterar)
- server/interfaces/http/paymentAccounts/schemas/paymentAccountSchemas.ts (alterar)

Aplique as mudanças abaixo EXATAMENTE como estão (formato unified diff: linhas com "-" saem, linhas com "+" entram; as demais são contexto para localizar o trecho). Não reformate outros trechos dos arquivos.

=== firestore.indexes.json — diff ===
@@ -387,6 +387,20 @@
           "order": "ASCENDING"
         }
       ]
+    },
+    {
+      "collectionGroup": "accountDebts",
+      "queryScope": "COLLECTION",
+      "fields": [
+        {
+          "fieldPath": "status",
+          "order": "ASCENDING"
+        },
+        {
+          "fieldPath": "createdAt",
+          "order": "ASCENDING"
+        }
+      ]
     }
   ],
   "fieldOverrides": [

=== server.ts — diff ===
@@ -23,7 +23,9 @@ import billingRouter from './server/interfaces/http/billing/billingRoutes';
 import listingVerificationRouter from './server/interfaces/http/listingVerifications/listingVerificationRoutes';
 import listingStatsRouter from './server/interfaces/http/insights/listingStatsRoutes';
 import listingPlanRouter from './server/interfaces/http/listingPlans/listingPlanRoutes';
-import paymentAccountRouter from './server/interfaces/http/paymentAccounts/paymentAccountRoutes';
+import paymentAccountRouter, {
+  adminAccountDebtRouter,
+} from './server/interfaces/http/paymentAccounts/paymentAccountRoutes';
 import {
   adminSaleClaimRouter,
   saleClaimRouter,
@@ -202,6 +204,7 @@ async function startServer() {
   app.use('/api/payment-accounts', paymentAccountRouter);
   app.use('/api/sale-claims', saleClaimRouter);
   app.use('/api/admin/sale-claims', adminSaleClaimRouter);
+  app.use('/api/admin/account-debts', adminAccountDebtRouter);
   app.use('/api/payment', paymentRouter);
   app.use('/api/weather', climaWindRouter);
   app.use('/api/notifications', notificationRouter);

=== server/application/usecases/paymentAccounts/declarePartnerForceMajeureApplicationUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { isOwnVerificationFileUseCase } from '../../../domain/media';
import { listOwnerSalesDocumentsUseCase } from '../../../domain/partners';
import {
  type AccountDebtView,
  declareForceMajeureUseCase,
  PaymentDomainError,
} from '../../../domain/payment';

/**
 * O proprietário declara força maior na multa de cancelamento (D16, 3A). A prova é enviada antes por
 * `POST /api/media/verification-files` e precisa estar na pasta privada dele.
 */
export async function declarePartnerForceMajeureApplicationUseCase(
  ownerUid: string,
  debtId: string,
  declaration: { reason: string; proofPath: string }
): Promise<AccountDebtView> {
  if (!isOwnVerificationFileUseCase(ownerUid, declaration.proofPath)) {
    throw new PaymentDomainError('INVALID_PROOF_FILE', 'Arquivo de prova inválido.', 400);
  }
  const documents = await listOwnerSalesDocumentsUseCase(ownerUid);
  return declareForceMajeureUseCase(
    debtId,
    documents.map((document) => document.accountKey),
    { ...declaration, declaredBy: ownerUid }
  );
}

=== server/application/usecases/paymentAccounts/readForceMajeureProofApplicationUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { readVerificationFileUseCase } from '../../../domain/media';
import { getForceMajeureProofPathUseCase } from '../../../domain/payment';

/** Admin abre a prova pelo backend: o arquivo nunca ganha URL pública nem assinada. */
export async function readForceMajeureProofApplicationUseCase(
  adminUid: string,
  debtId: string
): Promise<{ data: Buffer; contentType: string } | null> {
  const path = await getForceMajeureProofPathUseCase(debtId);
  if (!path) return null;
  // Auditoria (AGENTS.md §7.10 A09): quem abriu qual prova, sem dado pessoal no log.
  console.info('[audit] force_majeure_proof_read', { adminUid, debtId });
  return readVerificationFileUseCase(path);
}

=== server/domain/payment/adapters/firestoreAccountDebtAdapter.ts — diff ===
@@ -44,6 +44,16 @@ export class FirestoreAccountDebtAdapter implements AccountDebtRepositoryPort {
     return snapshot.docs.map((doc) => doc.data() as AccountDebt);
   }
 
+  async listSuspended(limit: number): Promise<AccountDebt[]> {
+    const snapshot = await adminDb
+      .collection(DEBTS)
+      .where('status', '==', 'suspended')
+      .orderBy('createdAt', 'asc')
+      .limit(limit)
+      .get();
+    return snapshot.docs.map((doc) => doc.data() as AccountDebt);
+  }
+
   async update(
     id: string,
     change: (current: AccountDebt) => AccountDebt | null

=== server/domain/payment/adapters/inMemoryAccountDebtAdapter.ts — diff ===
@@ -29,6 +29,13 @@ export class InMemoryAccountDebtAdapter implements AccountDebtRepositoryPort {
       .slice(0, limit);
   }
 
+  async listSuspended(limit: number): Promise<AccountDebt[]> {
+    return [...this.rows.values()]
+      .filter((debt) => debt.status === 'suspended')
+      .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
+      .slice(0, limit);
+  }
+
   async update(
     id: string,
     change: (current: AccountDebt) => AccountDebt | null

=== server/domain/payment/index.ts — diff ===
@@ -25,6 +25,10 @@ export { listAccountDebtsUseCase } from './usecases/listAccountDebtsUseCase';
 export { startAccountDebtPaymentUseCase } from './usecases/startAccountDebtPaymentUseCase';
 export { markAccountDebtPaidUseCase } from './usecases/markAccountDebtPaidUseCase';
 export { waiveAccountDebtUseCase } from './usecases/waiveAccountDebtUseCase';
+export { declareForceMajeureUseCase } from './usecases/declareForceMajeureUseCase';
+export { listForceMajeureReviewsUseCase } from './usecases/listForceMajeureReviewsUseCase';
+export { getForceMajeureProofPathUseCase } from './usecases/getForceMajeureProofPathUseCase';
+export { decideForceMajeureUseCase } from './usecases/decideForceMajeureUseCase';
 export { cancellationPenaltyMinor } from './utils/debtRules';
 export { openSaleClaimUseCase } from './usecases/openSaleClaimUseCase';
 export { getSaleClaimUseCase } from './usecases/getSaleClaimUseCase';
@@ -60,7 +64,13 @@ export type { ConnectedAccountStatus } from './ports/marketplaceAccountPort';
 export type { PaymentAccountView } from './types/paymentAccount';
 export type { PayoutEntry, PayoutEntryStatus } from './types/payoutEntry';
 export type { DisputeOutcome, RecordSaleInput, ReleaseSummary } from './services/payoutService';
-export type { AccountDebt, AccountDebtReason, AccountDebtView } from './types/accountDebt';
+export type {
+  AccountDebt,
+  AccountDebtReason,
+  AccountDebtView,
+  ForceMajeureReviewView,
+  ForceMajeureStatus,
+} from './types/accountDebt';
 export type { CreateDebtInput } from './services/debtService';
 export type { OpenSaleClaimInput, SaleClaimDecision } from './services/saleClaimService';
 export type {

=== server/domain/payment/ports/accountDebtRepositoryPort.ts — diff ===
@@ -7,6 +7,8 @@ export interface AccountDebtRepositoryPort {
   /** Dívidas `open` do CNPJ, mais antigas primeiro. */
   listOpenByAccountKey(accountKey: string): Promise<AccountDebt[]>;
   listByAccountKeys(accountKeys: string[], limit: number): Promise<AccountDebt[]>;
+  /** Multas com força maior em análise, mais antigas primeiro. */
+  listSuspended(limit: number): Promise<AccountDebt[]>;
   /** Lê, aplica a mudança e grava na mesma transação; `null` deixa como está. */
   update(
     id: string,

=== server/domain/payment/services/debtService.test.ts — diff ===
@@ -102,4 +102,74 @@ describe('DebtService (D16)', () => {
       code: 'NOT_FOUND',
     });
   });
+
+  describe('força maior (3A)', () => {
+    const DECLARATION = {
+      reason: 'Vento acima de 40 nós, travessia proibida pela Capitania.',
+      proofPath: 'verification/owner-1/prova.pdf',
+      declaredBy: 'owner-1',
+    };
+
+    it('suspende a multa: não vence, não bloqueia, não é descontada nem cobrada', async () => {
+      const { service, clock } = setup();
+      const debt = await service.createDebt(PENALTY);
+      const id = debt?.id ?? '';
+      await expect(service.declareForceMajeure(id, ['key-2'], DECLARATION)).rejects.toMatchObject({
+        code: 'NOT_FOUND',
+      });
+      const view = await service.declareForceMajeure(id, ['key-1'], DECLARATION);
+      expect(view).toMatchObject({ status: 'suspended', forceMajeureStatus: 'pending' });
+      await expect(service.declareForceMajeure(id, ['key-1'], DECLARATION)).rejects.toMatchObject({
+        code: 'FORCE_MAJEURE_ALREADY_DECLARED',
+      });
+      clock.value = new Date('2026-10-28T00:00:00.000Z');
+      expect(await service.hasOverdueDebt('key-1')).toBe(false);
+      expect(
+        await service.offsetFromPayout({
+          accountKey: 'key-1',
+          payoutEntryId: 'po_1',
+          availableMinor: 9000,
+        })
+      ).toBe(0);
+      await expect(service.startPayment(id, ['key-1'])).rejects.toMatchObject({
+        code: 'DEBT_SUSPENDED',
+      });
+      const [review] = await service.listForceMajeureReviews(10);
+      expect(review).toMatchObject({ id, forceMajeureReason: DECLARATION.reason });
+      expect(await service.getForceMajeureProofPath(id)).toBe(DECLARATION.proofPath);
+    });
+
+    it('só na multa de cancelamento e antes do vencimento', async () => {
+      const { service, clock } = setup();
+      const dispute = await service.createDebt({ ...PENALTY, reason: 'dispute_lost' });
+      await expect(
+        service.declareForceMajeure(dispute?.id ?? '', ['key-1'], DECLARATION)
+      ).rejects.toMatchObject({ code: 'FORCE_MAJEURE_NOT_ALLOWED' });
+      const penalty = await service.createDebt(PENALTY);
+      clock.value = new Date('2026-10-26T12:00:00.000Z');
+      await expect(
+        service.declareForceMajeure(penalty?.id ?? '', ['key-1'], DECLARATION)
+      ).rejects.toMatchObject({ code: 'FORCE_MAJEURE_TOO_LATE' });
+    });
+
+    it('aprovada perdoa a multa; recusada volta a valer com 24 h', async () => {
+      const approved = setup();
+      const first = await approved.service.createDebt(PENALTY);
+      await approved.service.declareForceMajeure(first?.id ?? '', ['key-1'], DECLARATION);
+      await expect(
+        approved.service.decideForceMajeure(first?.id ?? '', 'admin-1', true)
+      ).resolves.toMatchObject({ status: 'waived', waivedBy: 'admin-1' });
+      await expect(
+        approved.service.decideForceMajeure(first?.id ?? '', 'admin-1', false)
+      ).rejects.toMatchObject({ code: 'FORCE_MAJEURE_NOT_PENDING' });
+
+      const rejected = setup();
+      const second = await rejected.service.createDebt(PENALTY);
+      await rejected.service.declareForceMajeure(second?.id ?? '', ['key-1'], DECLARATION);
+      rejected.clock.value = new Date('2026-10-27T08:00:00.000Z');
+      const debt = await rejected.service.decideForceMajeure(second?.id ?? '', 'admin-1', false);
+      expect(debt).toMatchObject({ status: 'open', dueAt: '2026-10-28T08:00:00.000Z' });
+      expect(debt.forceMajeure?.status).toBe('rejected');
+    });
+  });
 });

=== server/domain/payment/services/debtService.ts — diff ===
@@ -1,6 +1,11 @@
 import type { AccountDebtRepositoryPort } from '../ports/accountDebtRepositoryPort';
 import type { PaymentGatewayPort } from '../ports/paymentGatewayPort';
-import type { AccountDebt, AccountDebtReason, AccountDebtView } from '../types/accountDebt';
+import type {
+  AccountDebt,
+  AccountDebtReason,
+  AccountDebtView,
+  ForceMajeureReviewView,
+} from '../types/accountDebt';
 import { debtDueAt, isDebtOverdue, remainingDebtMinor } from '../utils/debtRules';
 import { PaymentDomainError } from './stripePaymentService';
 
@@ -19,10 +24,12 @@ function toView(debt: AccountDebt, now: Date): AccountDebtView {
     reason: debt.reason,
     referenceType: debt.referenceType,
     amountMinor: debt.amountMinor,
-    remainingMinor: debt.status === 'open' ? remainingDebtMinor(debt) : 0,
+    remainingMinor:
+      debt.status === 'open' || debt.status === 'suspended' ? remainingDebtMinor(debt) : 0,
     status: debt.status,
     dueAt: debt.dueAt,
     overdue: isDebtOverdue(debt, now),
+    ...(debt.forceMajeure ? { forceMajeureStatus: debt.forceMajeure.status } : {}),
     createdAt: debt.createdAt,
   };
 }
@@ -113,6 +120,13 @@ export class DebtService {
     if (!debt || !accountKeys.includes(debt.accountKey)) {
       throw new PaymentDomainError('NOT_FOUND', 'Dívida não encontrada.', 404);
     }
+    if (debt.status === 'suspended') {
+      throw new PaymentDomainError(
+        'DEBT_SUSPENDED',
+        'Esta multa está suspensa enquanto a força maior é analisada.',
+        409
+      );
+    }
     const remaining = debt.status === 'open' ? remainingDebtMinor(debt) : 0;
     if (remaining <= 0) {
       throw new PaymentDomainError('DEBT_ALREADY_SETTLED', 'Esta dívida já foi quitada.', 409);
@@ -154,11 +168,126 @@ export class DebtService {
     );
   }
 
+  /**
+   * Força maior declarada pelo proprietário (D16, 3A): só na multa de cancelamento, antes do vencimento.
+   * Até a decisão do admin, a multa fica suspensa.
+   */
+  async declareForceMajeure(
+    debtId: string,
+    accountKeys: string[],
+    declaration: { reason: string; proofPath: string; declaredBy: string }
+  ): Promise<AccountDebtView> {
+    const debt = await this.debts.get(debtId);
+    if (!debt || !accountKeys.includes(debt.accountKey)) {
+      throw new PaymentDomainError('NOT_FOUND', 'Dívida não encontrada.', 404);
+    }
+    if (debt.reason !== 'cancellation_penalty') {
+      throw new PaymentDomainError(
+        'FORCE_MAJEURE_NOT_ALLOWED',
+        'Força maior vale só para a multa de cancelamento.',
+        422
+      );
+    }
+    if (debt.forceMajeure) {
+      throw new PaymentDomainError(
+        'FORCE_MAJEURE_ALREADY_DECLARED',
+        'A força maior desta multa já foi declarada.',
+        409
+      );
+    }
+    const nowDate = this.now();
+    if (debt.status !== 'open' || debt.dueAt <= nowDate.toISOString()) {
+      throw new PaymentDomainError(
+        'FORCE_MAJEURE_TOO_LATE',
+        'A força maior precisa ser declarada antes do vencimento da multa.',
+        422
+      );
+    }
+    const updated = await this.debts.update(debt.id, (current) =>
+      current.status === 'open' && !current.forceMajeure
+        ? {
+            ...current,
+            status: 'suspended',
+            forceMajeure: {
+              reason: declaration.reason,
+              proofPath: declaration.proofPath,
+              status: 'pending',
+              declaredBy: declaration.declaredBy,
+              declaredAt: nowDate.toISOString(),
+            },
+            updatedAt: nowDate.toISOString(),
+          }
+        : null
+    );
+    return toView(updated ?? debt, nowDate);
+  }
+
+  /** Fila do admin, das declarações mais antigas para as mais novas. */
+  async listForceMajeureReviews(limit: number): Promise<ForceMajeureReviewView[]> {
+    const nowDate = this.now();
+    const debts = await this.debts.listSuspended(limit);
+    return debts.flatMap((debt) =>
+      debt.forceMajeure
+        ? [
+            {
+              ...toView(debt, nowDate),
+              forceMajeureReason: debt.forceMajeure.reason,
+              declaredAt: debt.forceMajeure.declaredAt,
+            },
+          ]
+        : []
+    );
+  }
+
+  /** Caminho da prova, para o admin abrir pelo backend; `null` sem declaração. */
+  async getForceMajeureProofPath(debtId: string): Promise<string | null> {
+    return (await this.debts.get(debtId))?.forceMajeure?.proofPath ?? null;
+  }
+
+  /** Aprovada, a multa é perdoada; recusada, volta a valer com 24 h para pagar (D16, 3A). */
+  async decideForceMajeure(
+    debtId: string,
+    adminUid: string,
+    approve: boolean
+  ): Promise<AccountDebt> {
+    let pending = false;
+    const nowDate = this.now();
+    const nowIso = nowDate.toISOString();
+    const updated = await this.debts.update(debtId, (current) => {
+      pending = current.status === 'suspended' && current.forceMajeure?.status === 'pending';
+      if (!pending || !current.forceMajeure) return null;
+      const forceMajeure = {
+        ...current.forceMajeure,
+        status: approve ? ('approved' as const) : ('rejected' as const),
+        decidedBy: adminUid,
+        decidedAt: nowIso,
+      };
+      return approve
+        ? { ...current, status: 'waived', waivedBy: adminUid, forceMajeure, updatedAt: nowIso }
+        : {
+            ...current,
+            status: 'open',
+            dueAt: debtDueAt(nowDate),
+            forceMajeure,
+            updatedAt: nowIso,
+          };
+    });
+    if (!updated) throw new PaymentDomainError('NOT_FOUND', 'Dívida não encontrada.', 404);
+    if (!pending) {
+      throw new PaymentDomainError(
+        'FORCE_MAJEURE_NOT_PENDING',
+        'Não há força maior em análise nesta multa.',
+        409
+      );
+    }
+    return updated;
+  }
+
   /** Admin perdoa a dívida (ex.: prova de serviço apresentada fora do app, D16 5A). */
   async waive(debtId: string, adminUid: string): Promise<AccountDebt> {
     let settled = false;
     const updated = await this.debts.update(debtId, (current) => {
-      settled = current.status !== 'open';
+      settled = current.status !== 'open' && current.status !== 'suspended';
       return settled
         ? null
         : { ...current, status: 'waived', waivedBy: adminUid, updatedAt: this.now().toISOString() };

=== server/domain/payment/types/accountDebt.ts — diff ===
@@ -4,7 +4,22 @@
  */
 export type AccountDebtReason = 'cancellation_penalty' | 'dispute_lost' | 'post_release_refund';
 
-export type AccountDebtStatus = 'open' | 'paid' | 'waived';
+/** `suspended`: multa com força maior em análise; não vence, não é descontada e não bloqueia (D16, 3A). */
+export type AccountDebtStatus = 'open' | 'suspended' | 'paid' | 'waived';
+
+export type ForceMajeureStatus = 'pending' | 'approved' | 'rejected';
+
+/** Declaração do proprietário (D16, 3A). `reason` é texto livre: confidencial, nunca vai para log. */
+export interface ForceMajeureDeclaration {
+  reason: string;
+  /** Arquivo na pasta privada do parceiro; só o admin abre, pelo backend. */
+  proofPath: string;
+  status: ForceMajeureStatus;
+  declaredBy: string;
+  declaredAt: string;
+  decidedBy?: string;
+  decidedAt?: string;
+}
 
 export interface AccountDebt {
   id: string;
@@ -21,6 +36,7 @@ export interface AccountDebt {
   paymentIntentId?: string;
   paidAt?: string;
   waivedBy?: string;
+  forceMajeure?: ForceMajeureDeclaration;
   createdAt: string;
   updatedAt: string;
 }
@@ -35,5 +51,12 @@ export interface AccountDebtView {
   status: AccountDebtStatus;
   dueAt: string;
   overdue: boolean;
+  forceMajeureStatus?: ForceMajeureStatus;
   createdAt: string;
 }
+
+/** Fila do admin: inclui o motivo declarado; a prova é aberta por rota própria. */
+export interface ForceMajeureReviewView extends AccountDebtView {
+  forceMajeureReason: string;
+  declaredAt: string;
+}

=== server/domain/payment/usecases/decideForceMajeureUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { debtService } from '../factory';
import type { AccountDebt } from '../types/accountDebt';

/** Quem chama garante o papel de admin. */
export function decideForceMajeureUseCase(
  debtId: string,
  adminUid: string,
  approve: boolean
): Promise<AccountDebt> {
  return debtService.decideForceMajeure(debtId, adminUid, approve);
}

=== server/domain/payment/usecases/declareForceMajeureUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { debtService } from '../factory';
import type { AccountDebtView } from '../types/accountDebt';

/** `accountKeys` são os CNPJs do parceiro logado; quem chama confere que a prova é dele. */
export function declareForceMajeureUseCase(
  debtId: string,
  accountKeys: string[],
  declaration: { reason: string; proofPath: string; declaredBy: string }
): Promise<AccountDebtView> {
  return debtService.declareForceMajeure(debtId, accountKeys, declaration);
}

=== server/domain/payment/usecases/getForceMajeureProofPathUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { debtService } from '../factory';

/** Quem chama garante o papel de admin. */
export function getForceMajeureProofPathUseCase(debtId: string): Promise<string | null> {
  return debtService.getForceMajeureProofPath(debtId);
}

=== server/domain/payment/usecases/listForceMajeureReviewsUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { debtService } from '../factory';
import type { ForceMajeureReviewView } from '../types/accountDebt';

/** Quem chama garante o papel de admin. */
export function listForceMajeureReviewsUseCase(limit = 50): Promise<ForceMajeureReviewView[]> {
  return debtService.listForceMajeureReviews(limit);
}

=== server/interfaces/http/paymentAccounts/forceMajeureController.test.ts — ARQUIVO NOVO, conteúdo completo ===
import type { Response } from 'express';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { AuthenticatedRequest } from '../../../infrastructure/auth/authenticatedRequest';

const m = vi.hoisted(() => ({
  declare: vi.fn(),
  proof: vi.fn(),
  decide: vi.fn(),
  list: vi.fn(),
  isOwn: vi.fn(),
  documents: vi.fn(),
  declareDomain: vi.fn(),
}));

vi.mock('../../../domain/media', () => ({
  isOwnVerificationFileUseCase: m.isOwn,
  readVerificationFileUseCase: vi.fn(),
}));
vi.mock('../../../domain/partners', () => ({ listOwnerSalesDocumentsUseCase: m.documents }));
vi.mock('../../../domain/payment', async () => {
  const { PaymentDomainError } = await import(
    '../../../domain/payment/services/stripePaymentService'
  );
  return {
    PaymentDomainError,
    declareForceMajeureUseCase: m.declareDomain,
    decideForceMajeureUseCase: m.decide,
    listForceMajeureReviewsUseCase: m.list,
    getForceMajeureProofPathUseCase: vi.fn(),
  };
});

import { ForceMajeureController } from './forceMajeureController';

function response() {
  const res = { status: vi.fn(), json: vi.fn(), send: vi.fn(), setHeader: vi.fn() };
  res.status.mockReturnValue(res);
  res.json.mockReturnValue(res);
  return res;
}

const OWNER = { uid: 'owner-1', admin: false };
const ADMIN = { uid: 'admin-1', admin: true };
const BODY = {
  reason: 'Vento acima de 40 nós, travessia proibida.',
  proofPath: 'verification/owner-1/prova.pdf',
};

function request(overrides: Partial<AuthenticatedRequest>): AuthenticatedRequest {
  return {
    query: {},
    body: BODY,
    params: { debtId: 'debt_x' },
    user: OWNER,
    ...overrides,
  } as never;
}

describe('ForceMajeureController (D16 3A)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    m.documents.mockResolvedValue([{ accountKey: 'key-1' }]);
  });

  it('prova de outra conta: 400 sem declarar', async () => {
    m.isOwn.mockReturnValue(false);
    const res = response();
    await ForceMajeureController.declare(
      request({ body: { ...BODY, proofPath: 'verification/owner-2/x.pdf' } }),
      res as unknown as Response
    );
    expect(res.status).toHaveBeenCalledWith(400);
    expect(m.declareDomain).not.toHaveBeenCalled();
  });

  it('declara com os CNPJs de quem está logado', async () => {
    m.isOwn.mockReturnValue(true);
    m.declareDomain.mockResolvedValue({ id: 'debt_x', status: 'suspended' });
    const res = response();
    await ForceMajeureController.declare(request({}), res as unknown as Response);
    expect(m.isOwn).toHaveBeenCalledWith('owner-1', BODY.proofPath);
    expect(m.declareDomain).toHaveBeenCalledWith('debt_x', ['key-1'], {
      ...BODY,
      declaredBy: 'owner-1',
    });
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('motivo curto ou campo extra: 400', async () => {
    for (const body of [
      { ...BODY, reason: 'chuva' },
      { ...BODY, status: 'approved' },
    ]) {
      const res = response();
      await ForceMajeureController.declare(request({ body }), res as unknown as Response);
      expect(res.status).toHaveBeenCalledWith(400);
    }
  });

  it('fila, prova e decisão: só admin', async () => {
    for (const handler of [
      ForceMajeureController.listReviews,
      ForceMajeureController.readProof,
      ForceMajeureController.decide,
    ]) {
      const res = response();
      await handler(request({ body: { approve: true } }), res as unknown as Response);
      expect(res.status).toHaveBeenCalledWith(403);
    }
    m.decide.mockResolvedValue({ id: 'debt_x', status: 'waived', dueAt: 'd' });
    const ok = response();
    await ForceMajeureController.decide(
      request({ user: ADMIN as never, body: { approve: true } }),
      ok as unknown as Response
    );
    expect(m.decide).toHaveBeenCalledWith('debt_x', 'admin-1', true);
  });

  it('prova inexistente: 404', async () => {
    const res = response();
    await ForceMajeureController.readProof(
      request({ user: ADMIN as never }),
      res as unknown as Response
    );
    expect(res.status).toHaveBeenCalledWith(404);
  });
});

=== server/interfaces/http/paymentAccounts/forceMajeureController.ts — ARQUIVO NOVO, conteúdo completo ===
import type { Response } from 'express';
import { declarePartnerForceMajeureApplicationUseCase } from '../../../application/usecases/paymentAccounts/declarePartnerForceMajeureApplicationUseCase';
import { readForceMajeureProofApplicationUseCase } from '../../../application/usecases/paymentAccounts/readForceMajeureProofApplicationUseCase';
import {
  decideForceMajeureUseCase,
  listForceMajeureReviewsUseCase,
  PaymentDomainError,
} from '../../../domain/payment';
import type { AuthenticatedRequest } from '../../../infrastructure/auth/authenticatedRequest';
import {
  AccountDebtParamsSchema,
  DecideForceMajeureSchema,
  DeclareForceMajeureSchema,
} from './schemas/paymentAccountSchemas';

function sendError(res: Response, status: number, code: string, message: string): Response {
  return res.status(status).json({ error: { code, message } });
}

function handleError(res: Response, error: unknown, operation: string): Response {
  if (error instanceof PaymentDomainError) {
    return sendError(res, error.statusCode, error.code, error.message);
  }
  console.error(`[ForceMajeureController.${operation}]`, {
    name: error instanceof Error ? error.name : 'UnknownError',
  });
  return sendError(
    res,
    503,
    'FORCE_MAJEURE_UNAVAILABLE',
    'Não foi possível concluir a operação no momento.'
  );
}

/** Força maior na multa de cancelamento (D16, 3A): declaração do parceiro e decisão do admin. */
export class ForceMajeureController {
  static async declare(req: AuthenticatedRequest, res: Response): Promise<Response> {
    if (!req.user?.uid) return sendError(res, 401, 'UNAUTHENTICATED', 'Não autenticado.');
    const params = AccountDebtParamsSchema.safeParse(req.params);
    const body = DeclareForceMajeureSchema.safeParse(req.body);
    if (!params.success || !body.success) {
      return sendError(res, 400, 'VALIDATION_ERROR', 'Declaração inválida.');
    }
    try {
      const debt = await declarePartnerForceMajeureApplicationUseCase(
        req.user.uid,
        params.data.debtId,
        body.data
      );
      return res.status(200).json({ data: debt });
    } catch (error) {
      return handleError(res, error, 'declare');
    }
  }

  static async listReviews(req: AuthenticatedRequest, res: Response): Promise<Response> {
    if (!req.user?.uid) return sendError(res, 401, 'UNAUTHENTICATED', 'Não autenticado.');
    if (req.user.admin !== true) return sendError(res, 403, 'FORBIDDEN', 'Acesso restrito.');
    try {
      return res.status(200).json({ data: await listForceMajeureReviewsUseCase(50) });
    } catch (error) {
      return handleError(res, error, 'listReviews');
    }
  }

  static async readProof(req: AuthenticatedRequest, res: Response): Promise<Response> {
    if (!req.user?.uid) return sendError(res, 401, 'UNAUTHENTICATED', 'Não autenticado.');
    if (req.user.admin !== true) return sendError(res, 403, 'FORBIDDEN', 'Acesso restrito.');
    const params = AccountDebtParamsSchema.safeParse(req.params);
    if (!params.success) return sendError(res, 400, 'VALIDATION_ERROR', 'Dívida inválida.');
    try {
      const file = await readForceMajeureProofApplicationUseCase(req.user.uid, params.data.debtId);
      if (!file) return sendError(res, 404, 'NOT_FOUND', 'Prova não encontrada.');
      res.setHeader('Content-Type', file.contentType);
      res.setHeader('Cache-Control', 'private, no-store');
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('Content-Disposition', 'inline');
      return res.status(200).send(file.data);
    } catch (error) {
      return handleError(res, error, 'readProof');
    }
  }

  static async decide(req: AuthenticatedRequest, res: Response): Promise<Response> {
    if (!req.user?.uid) return sendError(res, 401, 'UNAUTHENTICATED', 'Não autenticado.');
    if (req.user.admin !== true) return sendError(res, 403, 'FORBIDDEN', 'Acesso restrito.');
    const params = AccountDebtParamsSchema.safeParse(req.params);
    const body = DecideForceMajeureSchema.safeParse(req.body);
    if (!params.success || !body.success) {
      return sendError(res, 400, 'VALIDATION_ERROR', 'Decisão inválida.');
    }
    try {
      const debt = await decideForceMajeureUseCase(
        params.data.debtId,
        req.user.uid,
        body.data.approve
      );
      console.info('[audit] force_majeure_decided', {
        debtId: debt.id,
        adminUid: req.user.uid,
        approve: body.data.approve,
      });
      return res
        .status(200)
        .json({ data: { id: debt.id, status: debt.status, dueAt: debt.dueAt } });
    } catch (error) {
      return handleError(res, error, 'decide');
    }
  }
}

=== server/interfaces/http/paymentAccounts/paymentAccountRoutes.ts — diff ===
@@ -1,6 +1,7 @@
 import { type NextFunction, type Response, Router } from 'express';
 import type { AuthenticatedRequest } from '../../../infrastructure/auth/authenticatedRequest';
 import { verifyAuthToken } from '../../../infrastructure/auth/authMiddleware';
+import { ForceMajeureController } from './forceMajeureController';
 import { PaymentAccountController } from './paymentAccountController';
 
 // Abrir o cadastro financeiro é operação de pagamento: token revogado é recusado (AGENTS.md §7.3 item 3).
@@ -15,7 +16,22 @@ router.post('/session', verifyAuthTokenStrict, PaymentAccountController.createSe
 router.get('/debts', verifyAuthToken, PaymentAccountController.listDebts);
 router.post('/debts/:debtId/payment', verifyAuthTokenStrict, PaymentAccountController.payDebt);
 router.post('/debts/:debtId/waive', verifyAuthTokenStrict, PaymentAccountController.waiveDebt);
+router.post('/debts/:debtId/force-majeure', verifyAuthTokenStrict, ForceMajeureController.declare);
 router.get('/terms', verifyAuthToken, PaymentAccountController.getTerms);
 router.post('/terms', verifyAuthTokenStrict, PaymentAccountController.acceptTerms);
 
 export default router;
+
+/** Fila de força maior do admin (D16, 3A), montada em `/api/admin/account-debts`. */
+export const adminAccountDebtRouter = Router();
+adminAccountDebtRouter.get('/force-majeure', verifyAuthToken, ForceMajeureController.listReviews);
+adminAccountDebtRouter.get(
+  '/:debtId/force-majeure/proof',
+  verifyAuthToken,
+  ForceMajeureController.readProof
+);
+adminAccountDebtRouter.post(
+  '/:debtId/force-majeure/decision',
+  verifyAuthTokenStrict,
+  ForceMajeureController.decide
+);

=== server/interfaces/http/paymentAccounts/schemas/paymentAccountSchemas.ts — diff ===
@@ -30,3 +30,16 @@ export const ListPaymentAccountsQuerySchema = z
       .optional(),
   })
   .strict();
+
+export const DeclareForceMajeureSchema = z
+  .object({
+    reason: z.string().trim().min(10).max(500),
+    proofPath: z
+      .string()
+      .min(1)
+      .max(300)
+      .regex(/^[\w/.-]+$/),
+  })
+  .strict();
+
+export const DecideForceMajeureSchema = z.object({ approve: z.boolean() }).strict();

VERIFICAÇÃO (obrigatória):
- `npm run typecheck`, `npx biome lint .` (0 erros; arquivos tocados sem avisos), `npm run build`;
- testes ligados aos arquivos deste prompt: `npx vitest related --run server.ts server/application/usecases/paymentAccounts/declarePartnerForceMajeureApplicationUseCase.ts server/application/usecases/paymentAccounts/readForceMajeureProofApplicationUseCase.ts server/domain/payment/adapters/firestoreAccountDebtAdapter.ts server/domain/payment/adapters/inMemoryAccountDebtAdapter.ts server/domain/payment/index.ts server/domain/payment/ports/accountDebtRepositoryPort.ts server/domain/payment/services/debtService.test.ts server/domain/payment/services/debtService.ts server/domain/payment/types/accountDebt.ts server/domain/payment/usecases/decideForceMajeureUseCase.ts server/domain/payment/usecases/declareForceMajeureUseCase.ts server/domain/payment/usecases/getForceMajeureProofPathUseCase.ts server/domain/payment/usecases/listForceMajeureReviewsUseCase.ts server/interfaces/http/paymentAccounts/forceMajeureController.test.ts server/interfaces/http/paymentAccounts/forceMajeureController.ts server/interfaces/http/paymentAccounts/paymentAccountRoutes.ts server/interfaces/http/paymentAccounts/schemas/paymentAccountSchemas.ts` (todos verdes). Não precisa rodar a suíte inteira.

LIMPEZA (obrigatória, ao terminar de implementar): apague todos os arquivos de public/assets/aistudio/, inclusive o deste prompt. São cópias dos textos colados no chat, salvas automaticamente pelo AI Studio, e public/ vai para o site publicado. Se a pasta ficar vazia, apague a pasta também.
~~~~

### Configurações manuais (você faz, fora do AI Studio, depois de aplicar este prompt)

1. Publique os índices do Firestore: `firebase deploy --only firestore:indexes`. Espere o índice novo accountDebts (status, createdAt) ficar "Ativado" no Console do Firebase (Firestore → Índices) antes de testar a fila do admin.
2. Nenhuma variável de ambiente nova, nenhuma regra nova e nada no Stripe.
