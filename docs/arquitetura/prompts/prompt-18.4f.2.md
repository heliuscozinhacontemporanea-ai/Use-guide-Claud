# Prompt 18.4f.2 — Filas financeiras do admin: reclamações, força maior e dívidas (D16)

> Lote 17, gerado do commits de referência `f350024` e `5e415b2` da branch `claude/agents-md-v2`. Aplique depois do 18.4f.1. Cole o bloco abaixo no agente do AI Studio, inteiro, de uma vez.

---

## Prompt 18.4f.2 — Filas financeiras do admin: reclamações, força maior e dívidas (D16)

Última parte das telas do comprador e do admin (18.4f). Telas conferidas por prints e aprovadas em 2026-10-27.

~~~~text
Siga o AGENTS.md. NÃO altere o AGENTS.md. O app ainda não foi liberado para usuários: nenhum código de compatibilidade ou transição (§2.2 item 8).

IMPORTANTE: aplique os diffs abaixo EXATAMENTE, inclusive os arquivos novos. Não reescreva os arquivos do seu jeito. Arquivo tocado sai sem avisos do lint e formatado (AGENTS.md §13). Telas nos dois temas, com folha inferior no celular (§11.1, §11.11), e textos nos 3 idiomas (§12). Nenhuma dependência nova.

O QUE MUDA:
1) Backend, domínio payment: AccountDebtRepositoryPort.listSuspended vira listByStatus(status, limit, cursor) (Firestore e in-memory); DebtService.listOpenForAdmin com cursor; PaymentAccountService.getOwners; casos de uso listOpenAccountDebtsForAdminUseCase e getPaymentAccountOwnersUseCase. A fila de reclamações do admin passa a trazer title, accountKey, serviceEndsAt e maxPartialRefundMinor (teto do parcial, sem a taxa de serviço, que só volta no integral).
2) Backend, application: describeSellerAccountsApplicationUseCase (nomes dos estabelecimentos que vendem pelo CNPJ e documento mascarado; o CNPJ nunca sai em texto puro) e as filas listAdminSaleClaimsApplicationUseCase, listAdminForceMajeureReviewsApplicationUseCase e listAdminAccountDebtsApplicationUseCase.
3) Rotas: GET /api/admin/account-debts (dívidas em aberto, ?limit=&cursor=) e o perdão de dívida sai de /api/payment-accounts/debts/:debtId/waive para POST /api/admin/account-debts/:debtId/waive, no novo AdminAccountDebtController (só admin, token revogado recusado, log de auditoria). As filas de reclamações e de força maior passam a usar os casos de uso de aplicação.
4) App, domínio payment: AdminFinanceQueues (componente público) com as abas Reclamações (decidir: liberar, reembolso integral, parcial até o teto, e multa de 20% só com motivo "Não aconteceu" e reembolso integral), Força maior (abrir comprovante, aprovar ou recusar com confirmação) e Dívidas (perdoar com confirmação). Adaptador, porta, casos de uso e o hook useAdminFinanceQueue.
5) Admin: aba Financeiro no AdminNavigation, montada pelo slot renderFinanceQueues do AdminPanel; a composição AdminPanelComposition passa AdminFinanceQueues (AGENTS.md §5.2). A tela de acesso negado do AdminPanel vai para AdminAccessDenied.tsx.
6) Textos novos no namespace adminFinance (src/shared/i18n/adminFinanceResources.ts).
7) docs/arquitetura/debitos.md: B32 (demais abas do painel admin com texto fixo e cores do tema escuro).

ARQUIVOS (crie, altere ou apague exatamente estes):
- docs/arquitetura/debitos.md (alterar)
- server/application/usecases/paymentAccounts/adminFinanceQueues.test.ts (criar)
- server/application/usecases/paymentAccounts/describeSellerAccountsApplicationUseCase.ts (criar)
- server/application/usecases/paymentAccounts/listAdminAccountDebtsApplicationUseCase.ts (criar)
- server/application/usecases/paymentAccounts/listAdminForceMajeureReviewsApplicationUseCase.ts (criar)
- server/application/usecases/paymentAccounts/sellerAccountSummary.ts (criar)
- server/application/usecases/payouts/listAdminSaleClaimsApplicationUseCase.ts (criar)
- server/domain/payment/adapters/firestoreAccountDebtAdapter.ts (alterar)
- server/domain/payment/adapters/inMemoryAccountDebtAdapter.ts (alterar)
- server/domain/payment/index.ts (alterar)
- server/domain/payment/ports/accountDebtRepositoryPort.ts (alterar)
- server/domain/payment/services/debtService.test.ts (alterar)
- server/domain/payment/services/debtService.ts (alterar)
- server/domain/payment/services/paymentAccountService.ts (alterar)
- server/domain/payment/services/saleClaimService.test.ts (alterar)
- server/domain/payment/services/saleClaimService.ts (alterar)
- server/domain/payment/types/saleClaim.ts (alterar)
- server/domain/payment/usecases/getPaymentAccountOwnersUseCase.ts (criar)
- server/domain/payment/usecases/listOpenAccountDebtsForAdminUseCase.ts (criar)
- server/interfaces/http/paymentAccounts/adminAccountDebtController.test.ts (criar)
- server/interfaces/http/paymentAccounts/adminAccountDebtController.ts (criar)
- server/interfaces/http/paymentAccounts/forceMajeureController.ts (alterar)
- server/interfaces/http/paymentAccounts/paymentAccountController.ts (alterar)
- server/interfaces/http/paymentAccounts/paymentAccountDebtController.test.ts (alterar)
- server/interfaces/http/paymentAccounts/paymentAccountRoutes.ts (alterar)
- server/interfaces/http/paymentAccounts/schemas/paymentAccountSchemas.ts (alterar)
- server/interfaces/http/saleClaims/saleClaimController.test.ts (alterar)
- server/interfaces/http/saleClaims/saleClaimController.ts (alterar)
- src/app/compositions/AdminPanelComposition.tsx (alterar)
- src/domain/admin/components/AdminPanel.tsx (alterar)
- src/domain/admin/components/subcomponents/AdminAccessDenied.tsx (criar)
- src/domain/admin/components/subcomponents/AdminNavigation.tsx (alterar)
- src/domain/payment/api/apiAdminFinanceAdapter.ts (criar)
- src/domain/payment/application/usecases/decideForceMajeureUseCase.ts (criar)
- src/domain/payment/application/usecases/decideSaleClaimUseCase.ts (criar)
- src/domain/payment/application/usecases/listAdminAccountDebtsUseCase.ts (criar)
- src/domain/payment/application/usecases/listAdminSaleClaimsUseCase.ts (criar)
- src/domain/payment/application/usecases/listForceMajeureReviewsUseCase.ts (criar)
- src/domain/payment/application/usecases/readForceMajeureProofUseCase.ts (criar)
- src/domain/payment/application/usecases/waiveAccountDebtUseCase.ts (criar)
- src/domain/payment/components/admin/AdminDebtCard.tsx (criar)
- src/domain/payment/components/admin/AdminDebtQueue.tsx (criar)
- src/domain/payment/components/admin/AdminFinanceQueues.tsx (criar)
- src/domain/payment/components/admin/AdminQueueFrame.tsx (criar)
- src/domain/payment/components/admin/ForceMajeureQueue.tsx (criar)
- src/domain/payment/components/admin/ForceMajeureReviewCard.tsx (criar)
- src/domain/payment/components/admin/SaleClaimDecisionDialog.tsx (criar)
- src/domain/payment/components/admin/SaleClaimQueue.tsx (criar)
- src/domain/payment/components/admin/SaleClaimQueueCard.tsx (criar)
- src/domain/payment/components/admin/SellerLine.tsx (criar)
- src/domain/payment/components/admin/adminFinance.test.tsx (criar)
- src/domain/payment/components/admin/adminFinanceStyles.ts (criar)
- src/domain/payment/factory.ts (alterar)
- src/domain/payment/hooks/useAdminFinanceQueue.ts (criar)
- src/domain/payment/index.ts (alterar)
- src/domain/payment/ports/adminFinanceApiPort.ts (criar)
- src/domain/payment/types/adminFinance.ts (criar)
- src/domain/payment/utils/adminFinanceErrors.ts (criar)
- src/shared/i18n/adminFinanceResources.ts (criar)
- src/shared/i18n/resources.ts (alterar)

Aplique as mudanças abaixo EXATAMENTE como estão (formato unified diff: linhas com "-" saem, linhas com "+" entram; as demais são contexto para localizar o trecho). Não reformate outros trechos dos arquivos.

=== docs/arquitetura/debitos.md — diff ===
@@ -21,6 +21,7 @@
 | B28 | `bookings/components/partner/OfferTextFields.tsx` (abas pt-BR/en/fr com tradução à mão) e editor de evento do parceiro (texto só em português) | D5 e AGENTS.md §12.6 (editar no idioma ativo, tradução automática) | médio — visitante em inglês ou francês vê o português, e o parceiro digita traduções que a D5 proíbe | 19.1: `LocalizedText`, `MachineTranslationPort` e outbox; o editor mostra o idioma de Configurações e o salvo vira o original |
 | B30 | `server/domain/payment/services/saleClaimService.ts` e `server/interfaces/http/saleClaims/`: o reembolso decidido numa reclamação não muda o status do pedido de ingresso nem da reserva; e a abertura de reclamação não tem rate limit (o app ainda não tem rate limit com armazenamento compartilhado) | §11.8 (o comprador vê o estado real da compra) e §7.4 (rate limit em rotas de pagamento) | baixo — uma reclamação por venda e só do próprio comprador; desde o 18.4f.1 a carteira e Minhas reservas mostram o status da reclamação ao lado do status da compra | atualizar o status do pedido e da reserva no reembolso da reclamação; rate limit junto com o das outras rotas de pagamento |
 | B31 | `src/domain/ticketing/components/manager/*` (abas do painel de ingressos: vendas, participantes, check-in, reembolsos; lotes e barra de abas já com tokens no 18.4e.3) e `hooks/useTicketLotForm.ts`, `hooks/useOfflineCheckIn.ts` | §12 (texto fixo em português, sem `useTranslation`) e §11.1 (cores fixas do tema escuro, `text-white`, `bg-black/40`) | médio — no tema claro dependem das sobrescritas globais (B25) e em `en`/`fr` aparecem em português | 19.x: chaves no namespace do ingresso e tokens `--ug-*`, aba por aba; a divisão do 18.4e.3.0 deixou cada aba num arquivo |
+| B32 | `src/domain/admin/components/AdminPanel.tsx`, `AdminDispatcher.tsx`, `subcomponents/*` (abas Relatórios, Parceiros, Guia Local, Agenda, Planos e Avisos, navegação e acesso negado) | §12 (texto fixo em português) e §11.1 (cores fixas do tema escuro, `bg-[#020508]`, `text-white/50`) | médio — painel só de admin, mas no tema claro depende das sobrescritas globais (B25) e em `en`/`fr` aparece em português | 19.x: namespace `admin` e tokens `--ug-*`; as abas Verificações e Financeiro já seguem o padrão |
 
 ## Resolvidos

=== server/application/usecases/paymentAccounts/adminFinanceQueues.test.ts — ARQUIVO NOVO, conteúdo completo ===
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../../domain/partners', () => ({
  getPartnerProfileUseCase: vi.fn(),
  listOwnerSalesDocumentsUseCase: vi.fn(),
}));
vi.mock('../../../domain/payment', () => ({
  getPaymentAccountOwnersUseCase: vi.fn(),
  listOpenAccountDebtsForAdminUseCase: vi.fn(),
}));

import { getPartnerProfileUseCase, listOwnerSalesDocumentsUseCase } from '../../../domain/partners';
import {
  getPaymentAccountOwnersUseCase,
  listOpenAccountDebtsForAdminUseCase,
} from '../../../domain/payment';
import { describeSellerAccountsApplicationUseCase } from './describeSellerAccountsApplicationUseCase';
import { listAdminAccountDebtsApplicationUseCase } from './listAdminAccountDebtsApplicationUseCase';

const KEY_A = 'a'.repeat(43);
const KEY_B = 'b'.repeat(43);

describe('filas financeiras do admin: quem vende por cada CNPJ (D16)', () => {
  beforeEach(() => {
    vi.mocked(getPaymentAccountOwnersUseCase).mockResolvedValue({ [KEY_A]: 'owner-1' });
    vi.mocked(getPartnerProfileUseCase).mockResolvedValue({
      id: 'owner-1',
      status: 'active',
      businesses: [
        { businessId: 'bar1', businessName: 'Bar da Duna', type: 'item' },
        { businessId: 'pousada1', businessName: 'Pousada Vento', type: 'item' },
      ],
      hasUsedTrial: false,
      termsAccepted: true,
    });
    vi.mocked(listOwnerSalesDocumentsUseCase).mockResolvedValue([
      { accountKey: KEY_A, maskedDocument: '**.***.***/0001-81', itemIds: ['bar1'] },
      { accountKey: KEY_B, maskedDocument: '**.***.***/0001-61', itemIds: ['pousada1'] },
    ]);
  });

  it('nome dos estabelecimentos do CNPJ e documento mascarado; sem conta, vazio', async () => {
    const sellers = await describeSellerAccountsApplicationUseCase([KEY_A, KEY_B, KEY_A]);
    expect(sellers[KEY_A]).toEqual({
      sellerName: 'Bar da Duna',
      maskedDocument: '**.***.***/0001-81',
    });
    expect(sellers[KEY_B]).toEqual({ sellerName: null, maskedDocument: null });
    expect(getPartnerProfileUseCase).toHaveBeenCalledTimes(1);
  });

  it('dívidas em aberto saem com o vendedor de cada uma', async () => {
    vi.mocked(listOpenAccountDebtsForAdminUseCase).mockResolvedValue({
      data: [
        {
          id: 'debt-1',
          accountKey: KEY_A,
          reason: 'cancellation_penalty',
          referenceType: 'booking_slot',
          amountMinor: 2000,
          remainingMinor: 2000,
          status: 'open',
          dueAt: '2026-10-27T12:00:00.000Z',
          overdue: false,
          createdAt: '2026-10-26T12:00:00.000Z',
        },
      ],
      nextCursor: 'debt-1',
    });
    const page = await listAdminAccountDebtsApplicationUseCase(1);
    expect(page.nextCursor).toBe('debt-1');
    expect(page.data[0]).toMatchObject({ id: 'debt-1', sellerName: 'Bar da Duna' });
  });
});

=== server/application/usecases/paymentAccounts/describeSellerAccountsApplicationUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { getPartnerProfileUseCase, listOwnerSalesDocumentsUseCase } from '../../../domain/partners';
import { getPaymentAccountOwnersUseCase } from '../../../domain/payment';
import type { SellerAccountSummary } from './sellerAccountSummary';

/** Vendedor de cada CNPJ para as filas do admin (D16). */
export async function describeSellerAccountsApplicationUseCase(
  accountKeys: string[]
): Promise<Record<string, SellerAccountSummary>> {
  const owners = await getPaymentAccountOwnersUseCase(accountKeys);
  const ownerUids = [...new Set(Object.values(owners))];
  const byOwner = new Map(
    await Promise.all(
      ownerUids.map(
        async (uid) =>
          [
            uid,
            await Promise.all([
              getPartnerProfileUseCase(uid).catch(() => null),
              listOwnerSalesDocumentsUseCase(uid).catch(() => []),
            ]),
          ] as const
      )
    )
  );
  return Object.fromEntries(
    [...new Set(accountKeys)].map((key): [string, SellerAccountSummary] => {
      const found = owners[key] ? byOwner.get(owners[key]) : undefined;
      const document = found?.[1].find((entry) => entry.accountKey === key);
      // Os estabelecimentos que vendem por este CNPJ, pelo nome que o parceiro vinculou.
      const names = (found?.[0]?.businesses ?? [])
        .filter((business) => document?.itemIds.includes(business.businessId))
        .map((business) => business.businessName);
      const summary: SellerAccountSummary = {
        sellerName: names.length > 0 ? names.join(', ') : null,
        maskedDocument: document?.maskedDocument ?? null,
      };
      return [key, summary];
    })
  );
}

=== server/application/usecases/paymentAccounts/listAdminAccountDebtsApplicationUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { type AccountDebtView, listOpenAccountDebtsForAdminUseCase } from '../../../domain/payment';
import { describeSellerAccountsApplicationUseCase } from './describeSellerAccountsApplicationUseCase';
import { type SellerAccountSummary, sellerOf } from './sellerAccountSummary';

export type AdminAccountDebtView = AccountDebtView & SellerAccountSummary;

/** Dívidas em aberto com o vendedor de cada uma; quem chama garante o papel de admin. */
export async function listAdminAccountDebtsApplicationUseCase(
  limit: number,
  cursor?: string
): Promise<{ data: AdminAccountDebtView[]; nextCursor: string | null }> {
  const page = await listOpenAccountDebtsForAdminUseCase(limit, cursor);
  const sellers = await describeSellerAccountsApplicationUseCase(
    page.data.map((debt) => debt.accountKey)
  );
  return {
    data: page.data.map((debt) => ({ ...debt, ...sellerOf(sellers, debt.accountKey) })),
    nextCursor: page.nextCursor,
  };
}

=== server/application/usecases/paymentAccounts/listAdminForceMajeureReviewsApplicationUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import {
  type ForceMajeureReviewView,
  listForceMajeureReviewsUseCase,
} from '../../../domain/payment';
import { describeSellerAccountsApplicationUseCase } from './describeSellerAccountsApplicationUseCase';
import { type SellerAccountSummary, sellerOf } from './sellerAccountSummary';

export type AdminForceMajeureReviewView = ForceMajeureReviewView & SellerAccountSummary;

/** Fila de força maior com o vendedor de cada multa; quem chama garante o papel de admin. */
export async function listAdminForceMajeureReviewsApplicationUseCase(
  limit = 50
): Promise<AdminForceMajeureReviewView[]> {
  const reviews = await listForceMajeureReviewsUseCase(limit);
  const sellers = await describeSellerAccountsApplicationUseCase(
    reviews.map((review) => review.accountKey)
  );
  return reviews.map((review) => ({ ...review, ...sellerOf(sellers, review.accountKey) }));
}

=== server/application/usecases/paymentAccounts/sellerAccountSummary.ts — ARQUIVO NOVO, conteúdo completo ===
/** Quem vende por um CNPJ, para as filas do admin (D16). Só o documento mascarado sai daqui. */
export interface SellerAccountSummary {
  sellerName: string | null;
  maskedDocument: string | null;
}

const UNKNOWN: SellerAccountSummary = { sellerName: null, maskedDocument: null };

export function sellerOf(
  sellers: Record<string, SellerAccountSummary>,
  accountKey: string | undefined
): SellerAccountSummary {
  return (accountKey && sellers[accountKey]) || UNKNOWN;
}

=== server/application/usecases/payouts/listAdminSaleClaimsApplicationUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { type AdminSaleClaimView, listPendingSaleClaimsUseCase } from '../../../domain/payment';
import { describeSellerAccountsApplicationUseCase } from '../paymentAccounts/describeSellerAccountsApplicationUseCase';
import { type SellerAccountSummary, sellerOf } from '../paymentAccounts/sellerAccountSummary';

export type AdminSaleClaimQueueView = AdminSaleClaimView & SellerAccountSummary;

/** Fila de reclamações com o vendedor de cada venda; quem chama garante o papel de admin. */
export async function listAdminSaleClaimsApplicationUseCase(
  limit: number,
  cursor?: string
): Promise<{ data: AdminSaleClaimQueueView[]; nextCursor: string | null }> {
  const page = await listPendingSaleClaimsUseCase(limit, cursor);
  const keys = page.data.flatMap((claim) => (claim.accountKey ? [claim.accountKey] : []));
  const sellers = await describeSellerAccountsApplicationUseCase(keys);
  return {
    data: page.data.map((claim) => ({
      ...claim,
      ...sellerOf(sellers, claim.accountKey),
    })),
    nextCursor: page.nextCursor,
  };
}

=== server/domain/payment/adapters/firestoreAccountDebtAdapter.ts — diff ===
@@ -1,6 +1,6 @@
 import { adminDb } from '../../../infrastructure/firebase/adminClient';
 import type { AccountDebtRepositoryPort } from '../ports/accountDebtRepositoryPort';
-import type { AccountDebt } from '../types/accountDebt';
+import type { AccountDebt, AccountDebtStatus } from '../types/accountDebt';
 
 const DEBTS = 'accountDebts';
 
@@ -44,13 +44,21 @@ export class FirestoreAccountDebtAdapter implements AccountDebtRepositoryPort {
     return snapshot.docs.map((doc) => doc.data() as AccountDebt);
   }
 
-  async listSuspended(limit: number): Promise<AccountDebt[]> {
-    const snapshot = await adminDb
+  async listByStatus(
+    status: AccountDebtStatus,
+    limit: number,
+    cursor?: string
+  ): Promise<AccountDebt[]> {
+    let query = adminDb
       .collection(DEBTS)
-      .where('status', '==', 'suspended')
+      .where('status', '==', status)
       .orderBy('createdAt', 'asc')
-      .limit(limit)
-      .get();
+      .limit(limit);
+    if (cursor) {
+      const last = await adminDb.collection(DEBTS).doc(cursor).get();
+      if (last.exists) query = query.startAfter(last);
+    }
+    const snapshot = await query.get();
     return snapshot.docs.map((doc) => doc.data() as AccountDebt);
   }

=== server/domain/payment/adapters/inMemoryAccountDebtAdapter.ts — diff ===
@@ -1,5 +1,5 @@
 import type { AccountDebtRepositoryPort } from '../ports/accountDebtRepositoryPort';
-import type { AccountDebt } from '../types/accountDebt';
+import type { AccountDebt, AccountDebtStatus } from '../types/accountDebt';
 
 /** Usado só por testes (AGENTS.md §2.2 item 7). */
 export class InMemoryAccountDebtAdapter implements AccountDebtRepositoryPort {
@@ -29,11 +29,16 @@ export class InMemoryAccountDebtAdapter implements AccountDebtRepositoryPort {
       .slice(0, limit);
   }
 
-  async listSuspended(limit: number): Promise<AccountDebt[]> {
-    return [...this.rows.values()]
-      .filter((debt) => debt.status === 'suspended')
-      .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
-      .slice(0, limit);
+  async listByStatus(
+    status: AccountDebtStatus,
+    limit: number,
+    cursor?: string
+  ): Promise<AccountDebt[]> {
+    const rows = [...this.rows.values()]
+      .filter((debt) => debt.status === status)
+      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
+    const start = cursor ? rows.findIndex((debt) => debt.id === cursor) + 1 : 0;
+    return rows.slice(start, start + limit);
   }
 
   async update(

=== server/domain/payment/index.ts — diff ===
@@ -11,6 +11,7 @@ export { updatePaymentTransactionStatusUseCase } from './usecases/updatePaymentT
 export { assertPaymentAccountReadyUseCase } from './usecases/assertPaymentAccountReadyUseCase';
 export { createPaymentAccountSessionUseCase } from './usecases/createPaymentAccountSessionUseCase';
 export { listOwnerPaymentAccountsUseCase } from './usecases/listOwnerPaymentAccountsUseCase';
+export { getPaymentAccountOwnersUseCase } from './usecases/getPaymentAccountOwnersUseCase';
 export { syncPaymentAccountFromWebhookUseCase } from './usecases/syncPaymentAccountFromWebhookUseCase';
 
 export { createMarketplacePaymentIntentUseCase } from './usecases/createMarketplacePaymentIntentUseCase';
@@ -24,6 +25,7 @@ export { releaseDuePayoutsUseCase } from './usecases/releaseDuePayoutsUseCase';
 export { getPayoutEntryForReferenceUseCase } from './usecases/getPayoutEntryForReferenceUseCase';
 export { createAccountDebtUseCase } from './usecases/createAccountDebtUseCase';
 export { listAccountDebtsUseCase } from './usecases/listAccountDebtsUseCase';
+export { listOpenAccountDebtsForAdminUseCase } from './usecases/listOpenAccountDebtsForAdminUseCase';
 export { startAccountDebtPaymentUseCase } from './usecases/startAccountDebtPaymentUseCase';
 export { markAccountDebtPaidUseCase } from './usecases/markAccountDebtPaidUseCase';
 export { waiveAccountDebtUseCase } from './usecases/waiveAccountDebtUseCase';

=== server/domain/payment/ports/accountDebtRepositoryPort.ts — ARQUIVO REESCRITO, substitua todo o conteúdo por este ===
import type { AccountDebt, AccountDebtStatus } from '../types/accountDebt';

export interface AccountDebtRepositoryPort {
  /** Cria só se ainda não existir; devolve a dívida gravada. */
  createIfAbsent(debt: AccountDebt): Promise<AccountDebt>;
  get(id: string): Promise<AccountDebt | null>;
  /** Dívidas `open` do CNPJ, mais antigas primeiro. */
  listOpenByAccountKey(accountKey: string): Promise<AccountDebt[]>;
  listByAccountKeys(accountKeys: string[], limit: number): Promise<AccountDebt[]>;
  /** Dívidas no status, mais antigas primeiro; `cursor` é o id da última da página anterior. */
  listByStatus(status: AccountDebtStatus, limit: number, cursor?: string): Promise<AccountDebt[]>;
  /** Lê, aplica a mudança e grava na mesma transação; `null` deixa como está. */
  update(
    id: string,
    change: (current: AccountDebt) => AccountDebt | null
  ): Promise<AccountDebt | null>;
}

=== server/domain/payment/services/debtService.test.ts — diff ===
@@ -172,4 +172,24 @@ describe('DebtService (D16)', () => {
       expect(debt.forceMajeure?.status).toBe('rejected');
     });
   });
+
+  it('admin vê as dívidas em aberto, das mais antigas, por página', async () => {
+    const { service, clock } = setup();
+    for (const id of ['occ-1', 'occ-2', 'occ-3']) {
+      await service.createDebt({ ...PENALTY, referenceId: id });
+      clock.value = new Date(clock.value.getTime() + 60_000);
+    }
+    const first = await service.listOpenForAdmin(2);
+    expect(first.data.map((debt) => debt.id)).toEqual([
+      'debt_cancellation_penalty_event_occurrence_occ-1',
+      'debt_cancellation_penalty_event_occurrence_occ-2',
+    ]);
+    const second = await service.listOpenForAdmin(2, first.nextCursor ?? undefined);
+    expect(second.data.map((debt) => debt.id)).toEqual([
+      'debt_cancellation_penalty_event_occurrence_occ-3',
+    ]);
+    expect(second.nextCursor).toBeNull();
+    await service.waive(first.data[0]?.id ?? '', 'admin-1');
+    expect((await service.listOpenForAdmin(10)).data).toHaveLength(2);
+  });
 });

=== server/domain/payment/services/debtService.ts — diff ===
@@ -225,7 +225,7 @@ export class DebtService {
   /** Fila do admin, das declarações mais antigas para as mais novas. */
   async listForceMajeureReviews(limit: number): Promise<ForceMajeureReviewView[]> {
     const nowDate = this.now();
-    const debts = await this.debts.listSuspended(limit);
+    const debts = await this.debts.listByStatus('suspended', limit);
     return debts.flatMap((debt) =>
       debt.forceMajeure
         ? [
@@ -239,6 +239,20 @@ export class DebtService {
     );
   }
 
+  /** Dívidas em aberto para o admin, das mais antigas para as mais novas. */
+  async listOpenForAdmin(
+    limit: number,
+    cursor?: string
+  ): Promise<{ data: AccountDebtView[]; nextCursor: string | null }> {
+    const nowDate = this.now();
+    const debts = await this.debts.listByStatus('open', limit, cursor);
+    const last = debts[debts.length - 1];
+    return {
+      data: debts.map((debt) => toView(debt, nowDate)),
+      nextCursor: debts.length === limit && last ? last.id : null,
+    };
+  }
+
   /** Caminho da prova, para o admin abrir pelo backend; `null` sem declaração. */
   async getForceMajeureProofPath(debtId: string): Promise<string | null> {
     return (await this.debts.get(debtId))?.forceMajeure?.proofPath ?? null;

=== server/domain/payment/services/paymentAccountService.ts — diff ===
@@ -36,6 +36,16 @@ export class PaymentAccountService {
     return synced.map(toView);
   }
 
+  /** Dono de cada conta, para o admin identificar o vendedor; contas sem cadastro ficam de fora. */
+  async getOwners(accountKeys: string[]): Promise<Record<string, string>> {
+    const records = await Promise.all(
+      [...new Set(accountKeys)].map((key) => this.repository.get(key))
+    );
+    return Object.fromEntries(
+      records.flatMap((record) => (record ? [[record.accountKey, record.ownerUid]] : []))
+    );
+  }
+
   async assertReady(accountKey: string): Promise<PaymentAccountRecord> {
     const existing = await this.repository.get(accountKey);
     const record = existing ? await this.sync(existing) : null;

=== server/domain/payment/services/saleClaimService.test.ts — diff ===
@@ -70,7 +70,13 @@ describe('SaleClaimService (D16 2A)', () => {
     expect(mine).not.toHaveProperty('details');
     expect(await service.listForBuyer('buyer-2')).toEqual([]);
     const { data, nextCursor } = await service.listPendingForAdmin(10);
-    expect(data[0]).toMatchObject({ details: 'O local estava fechado.', refundableMinor: 10600 });
+    // O parcial não devolve a taxa de serviço; ela só volta no reembolso integral.
+    expect(data[0]).toMatchObject({
+      details: 'O local estava fechado.',
+      refundableMinor: 10600,
+      maxPartialRefundMinor: 10000,
+      accountKey: expect.any(String),
+    });
     expect(nextCursor).toBeNull();
   });

=== server/domain/payment/services/saleClaimService.ts — diff ===
@@ -44,6 +44,15 @@ function refundableMinor(entry: PayoutEntry): number {
   return Math.max(0, entry.grossMinor - refundedTotals(entry).amountMinor);
 }
 
+/** Teto do reembolso parcial: a taxa de serviço só volta no reembolso integral. */
+function maxPartialRefund(entry: PayoutEntry): number {
+  const remainingServiceFee = Math.max(
+    0,
+    entry.serviceFeeMinor - refundedTotals(entry).serviceFeeMinor
+  );
+  return Math.max(0, refundableMinor(entry) - remainingServiceFee);
+}
+
 function toBuyerView(claim: SaleClaim): BuyerSaleClaimView {
   return {
     id: claim.id,
@@ -141,8 +150,11 @@ export class SaleClaimService {
           ...toBuyerView(claim),
           buyerUid: claim.buyerUid,
           ...(claim.details ? { details: claim.details } : {}),
+          ...(entry?.title ? { title: entry.title } : {}),
+          ...(entry ? { accountKey: entry.accountKey, serviceEndsAt: entry.serviceEndsAt } : {}),
           grossMinor: entry?.grossMinor ?? 0,
           refundableMinor: entry ? refundableMinor(entry) : 0,
+          maxPartialRefundMinor: entry ? maxPartialRefund(entry) : 0,
         };
       })
     );
@@ -174,12 +186,11 @@ export class SaleClaimService {
 
     const entry = await this.payouts.getForReference(claim.referenceType, claim.referenceId);
     if (!entry) throw new PaymentDomainError('NOT_FOUND', 'Venda não encontrada.', 404);
-    const refunded = refundedTotals(entry);
-    const remainingServiceFee = Math.max(0, entry.serviceFeeMinor - refunded.serviceFeeMinor);
     const remaining = refundableMinor(entry);
+    const remainingServiceFee = remaining - maxPartialRefund(entry);
     const full = decision.outcome === 'refund_full';
     const amountMinor = full ? remaining : (decision.amountMinor ?? 0);
-    if (amountMinor <= 0 || amountMinor > (full ? remaining : remaining - remainingServiceFee)) {
+    if (amountMinor <= 0 || amountMinor > (full ? remaining : maxPartialRefund(entry))) {
       throw new PaymentDomainError(
         'INVALID_REFUND_AMOUNT',
         'Valor de reembolso fora do que ainda pode voltar ao comprador.',

=== server/domain/payment/types/saleClaim.ts — diff ===
@@ -56,6 +56,13 @@ export interface BuyerSaleClaimView {
 export interface AdminSaleClaimView extends BuyerSaleClaimView {
   buyerUid: string;
   details?: string;
+  /** Nome do evento ou da oferta, da venda; ausente se a venda não foi encontrada. */
+  title?: string;
+  /** CNPJ que vendeu (índice cego), para a composição mostrar quem é. */
+  accountKey?: string;
+  serviceEndsAt?: string;
   grossMinor: number;
   refundableMinor: number;
+  /** Teto do reembolso parcial: o que resta sem a taxa de serviço, que só volta no integral. */
+  maxPartialRefundMinor: number;
 }

=== server/domain/payment/usecases/getPaymentAccountOwnersUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { paymentAccountService } from '../factory';

/** Uid do dono de cada conta por `accountKey`; quem chama garante o papel de admin. */
export function getPaymentAccountOwnersUseCase(
  accountKeys: string[]
): Promise<Record<string, string>> {
  return paymentAccountService.getOwners(accountKeys);
}

=== server/domain/payment/usecases/listOpenAccountDebtsForAdminUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { debtService } from '../factory';
import type { AccountDebtView } from '../types/accountDebt';

/** Quem chama garante o papel de admin. */
export function listOpenAccountDebtsForAdminUseCase(
  limit: number,
  cursor?: string
): Promise<{ data: AccountDebtView[]; nextCursor: string | null }> {
  return debtService.listOpenForAdmin(limit, cursor);
}

=== server/interfaces/http/paymentAccounts/adminAccountDebtController.test.ts — ARQUIVO NOVO, conteúdo completo ===
import type { Response } from 'express';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { AuthenticatedRequest } from '../../../infrastructure/auth/authenticatedRequest';

const m = vi.hoisted(() => ({ list: vi.fn(), waive: vi.fn() }));

vi.mock(
  '../../../application/usecases/paymentAccounts/listAdminAccountDebtsApplicationUseCase',
  () => ({ listAdminAccountDebtsApplicationUseCase: m.list })
);
vi.mock('../../../domain/payment', async () => {
  const { PaymentDomainError } = await import(
    '../../../domain/payment/services/stripePaymentService'
  );
  return { PaymentDomainError, waiveAccountDebtUseCase: m.waive };
});

import { PaymentDomainError } from '../../../domain/payment/services/stripePaymentService';
import { AdminAccountDebtController } from './adminAccountDebtController';

function response() {
  const res = { status: vi.fn(), json: vi.fn() };
  res.status.mockReturnValue(res);
  res.json.mockReturnValue(res);
  return res;
}

const OWNER = { uid: 'owner-1', admin: false };
const ADMIN = { uid: 'admin-1', admin: true };

function request(overrides: Partial<AuthenticatedRequest>): AuthenticatedRequest {
  return { query: {}, body: {}, params: {}, user: OWNER, ...overrides } as never;
}

describe('AdminAccountDebtController (D16)', () => {
  beforeEach(() => vi.clearAllMocks());

  it('lista de dívidas é só do admin, com consulta validada', async () => {
    const denied = response();
    await AdminAccountDebtController.listOpen(request({}), denied as unknown as Response);
    expect(denied.status).toHaveBeenCalledWith(403);
    const invalid = response();
    await AdminAccountDebtController.listOpen(
      request({ user: ADMIN as never, query: { extra: '1' } as never }),
      invalid as unknown as Response
    );
    expect(invalid.status).toHaveBeenCalledWith(400);
    m.list.mockResolvedValue({ data: [], nextCursor: null });
    const ok = response();
    await AdminAccountDebtController.listOpen(
      request({ user: ADMIN as never, query: { limit: '20' } as never }),
      ok as unknown as Response
    );
    expect(m.list).toHaveBeenCalledWith(20, undefined);
    expect(ok.json).toHaveBeenCalledWith({ data: [], nextCursor: null });
  });

  it('perdoar é só do admin; dívida quitada responde o code do domínio', async () => {
    const res = response();
    await AdminAccountDebtController.waive(
      request({ params: { debtId: 'debt_x' } as never }),
      res as unknown as Response
    );
    expect(res.status).toHaveBeenCalledWith(403);
    expect(m.waive).not.toHaveBeenCalled();
    m.waive.mockResolvedValue({ id: 'debt_x', status: 'waived' });
    const ok = response();
    await AdminAccountDebtController.waive(
      request({ user: ADMIN as never, params: { debtId: 'debt_x' } as never }),
      ok as unknown as Response
    );
    expect(m.waive).toHaveBeenCalledWith('debt_x', 'admin-1');
    expect(ok.json).toHaveBeenCalledWith({ data: { id: 'debt_x', status: 'waived' } });
    m.waive.mockRejectedValue(
      new PaymentDomainError('DEBT_ALREADY_SETTLED', 'Esta dívida já foi quitada.', 409)
    );
    const settled = response();
    await AdminAccountDebtController.waive(
      request({ user: ADMIN as never, params: { debtId: 'debt_x' } as never }),
      settled as unknown as Response
    );
    expect(settled.status).toHaveBeenCalledWith(409);
  });
});

=== server/interfaces/http/paymentAccounts/adminAccountDebtController.ts — ARQUIVO NOVO, conteúdo completo ===
import type { Response } from 'express';
import { listAdminAccountDebtsApplicationUseCase } from '../../../application/usecases/paymentAccounts/listAdminAccountDebtsApplicationUseCase';
import { PaymentDomainError, waiveAccountDebtUseCase } from '../../../domain/payment';
import type { AuthenticatedRequest } from '../../../infrastructure/auth/authenticatedRequest';
import {
  AccountDebtParamsSchema,
  ListAdminAccountDebtsQuerySchema,
} from './schemas/paymentAccountSchemas';

function sendError(res: Response, status: number, code: string, message: string): Response {
  return res.status(status).json({ error: { code, message } });
}

function handleError(res: Response, error: unknown, operation: string): Response {
  if (error instanceof PaymentDomainError) {
    return sendError(res, error.statusCode, error.code, error.message);
  }
  console.error(`[AdminAccountDebtController.${operation}]`, {
    name: error instanceof Error ? error.name : 'UnknownError',
  });
  return sendError(
    res,
    503,
    'ACCOUNT_DEBT_UNAVAILABLE',
    'Não foi possível concluir a operação no momento.'
  );
}

/** Dívidas dos CNPJs com a plataforma, vistas pelo admin (D16). */
export class AdminAccountDebtController {
  static async listOpen(req: AuthenticatedRequest, res: Response): Promise<Response> {
    if (!req.user?.uid) return sendError(res, 401, 'UNAUTHENTICATED', 'Não autenticado.');
    if (req.user.admin !== true) return sendError(res, 403, 'FORBIDDEN', 'Acesso restrito.');
    const query = ListAdminAccountDebtsQuerySchema.safeParse(req.query);
    if (!query.success) return sendError(res, 400, 'VALIDATION_ERROR', 'Consulta inválida.');
    try {
      const page = await listAdminAccountDebtsApplicationUseCase(
        query.data.limit,
        query.data.cursor
      );
      return res.status(200).json(page);
    } catch (error) {
      return handleError(res, error, 'listOpen');
    }
  }

  static async waive(req: AuthenticatedRequest, res: Response): Promise<Response> {
    if (!req.user?.uid) return sendError(res, 401, 'UNAUTHENTICATED', 'Não autenticado.');
    if (req.user.admin !== true) return sendError(res, 403, 'FORBIDDEN', 'Acesso restrito.');
    const params = AccountDebtParamsSchema.safeParse(req.params);
    if (!params.success) return sendError(res, 400, 'VALIDATION_ERROR', 'Dívida inválida.');
    try {
      const debt = await waiveAccountDebtUseCase(params.data.debtId, req.user.uid);
      console.info('[audit] account_debt_waived', { debtId: debt.id, adminUid: req.user.uid });
      return res.status(200).json({ data: { id: debt.id, status: debt.status } });
    } catch (error) {
      return handleError(res, error, 'waive');
    }
  }
}

=== server/interfaces/http/paymentAccounts/forceMajeureController.ts — diff ===
@@ -1,11 +1,8 @@
 import type { Response } from 'express';
 import { declarePartnerForceMajeureApplicationUseCase } from '../../../application/usecases/paymentAccounts/declarePartnerForceMajeureApplicationUseCase';
+import { listAdminForceMajeureReviewsApplicationUseCase } from '../../../application/usecases/paymentAccounts/listAdminForceMajeureReviewsApplicationUseCase';
 import { readForceMajeureProofApplicationUseCase } from '../../../application/usecases/paymentAccounts/readForceMajeureProofApplicationUseCase';
-import {
-  decideForceMajeureUseCase,
-  listForceMajeureReviewsUseCase,
-  PaymentDomainError,
-} from '../../../domain/payment';
+import { decideForceMajeureUseCase, PaymentDomainError } from '../../../domain/payment';
 import type { AuthenticatedRequest } from '../../../infrastructure/auth/authenticatedRequest';
 import {
   AccountDebtParamsSchema,
@@ -57,7 +54,9 @@ export class ForceMajeureController {
     if (!req.user?.uid) return sendError(res, 401, 'UNAUTHENTICATED', 'Não autenticado.');
     if (req.user.admin !== true) return sendError(res, 403, 'FORBIDDEN', 'Acesso restrito.');
     try {
-      return res.status(200).json({ data: await listForceMajeureReviewsUseCase(50) });
+      return res
+        .status(200)
+        .json({ data: await listAdminForceMajeureReviewsApplicationUseCase(50) });
     } catch (error) {
       return handleError(res, error, 'listReviews');
     }

=== server/interfaces/http/paymentAccounts/paymentAccountController.ts — diff ===
@@ -7,7 +7,7 @@ import { startPartnerDebtPaymentApplicationUseCase } from '../../../application/
 import { acceptPartnerTermsApplicationUseCase } from '../../../application/usecases/paymentAccounts/acceptPartnerTermsApplicationUseCase';
 import { getPartnerTermsApplicationUseCase } from '../../../application/usecases/paymentAccounts/getPartnerTermsApplicationUseCase';
 import { ListingVerificationError, PartnerDomainError } from '../../../domain/partners';
-import { PaymentDomainError, waiveAccountDebtUseCase } from '../../../domain/payment';
+import { PaymentDomainError } from '../../../domain/payment';
 import type { AuthenticatedRequest } from '../../../infrastructure/auth/authenticatedRequest';
 import {
   AcceptPartnerTermsSchema,
@@ -115,20 +115,6 @@ export class PaymentAccountController {
     }
   }
 
-  static async waiveDebt(req: AuthenticatedRequest, res: Response): Promise<Response> {
-    if (!req.user?.uid) return sendError(res, 401, 'UNAUTHENTICATED', 'Não autenticado.');
-    if (req.user.admin !== true) return sendError(res, 403, 'FORBIDDEN', 'Acesso restrito.');
-    const params = AccountDebtParamsSchema.safeParse(req.params);
-    if (!params.success) return sendError(res, 400, 'VALIDATION_ERROR', 'Dívida inválida.');
-    try {
-      const debt = await waiveAccountDebtUseCase(params.data.debtId, req.user.uid);
-      console.info('[audit] account_debt_waived', { debtId: debt.id, adminUid: req.user.uid });
-      return res.status(200).json({ data: { id: debt.id, status: debt.status } });
-    } catch (error) {
-      return handleError(res, error, 'waiveDebt');
-    }
-  }
-
   static async createSession(req: AuthenticatedRequest, res: Response): Promise<Response> {
     if (!req.user?.uid) return sendError(res, 401, 'UNAUTHENTICATED', 'Não autenticado.');
     const body = PaymentAccountSessionSchema.safeParse(req.body);

=== server/interfaces/http/paymentAccounts/paymentAccountDebtController.test.ts — diff ===
@@ -2,7 +2,7 @@ import type { Response } from 'express';
 import { beforeEach, describe, expect, it, vi } from 'vitest';
 import type { AuthenticatedRequest } from '../../../infrastructure/auth/authenticatedRequest';
 
-const m = vi.hoisted(() => ({ list: vi.fn(), pay: vi.fn(), waive: vi.fn() }));
+const m = vi.hoisted(() => ({ list: vi.fn(), pay: vi.fn() }));
 
 vi.mock('../../../application/usecases/paymentAccounts/listPartnerDebtsApplicationUseCase', () => ({
   listPartnerDebtsApplicationUseCase: m.list,
@@ -15,7 +15,7 @@ vi.mock('../../../domain/payment', async () => {
   const { PaymentDomainError } = await import(
     '../../../domain/payment/services/stripePaymentService'
   );
-  return { PaymentDomainError, waiveAccountDebtUseCase: m.waive };
+  return { PaymentDomainError };
 });
 
 import { PaymentDomainError } from '../../../domain/payment/services/stripePaymentService';
@@ -29,7 +29,6 @@ function response() {
 }
 
 const OWNER = { uid: 'owner-1', admin: false };
-const ADMIN = { uid: 'admin-1', admin: true };
 
 function request(overrides: Partial<AuthenticatedRequest>): AuthenticatedRequest {
   return { query: {}, body: {}, params: {}, user: OWNER, ...overrides } as never;
@@ -62,22 +61,4 @@ describe('PaymentAccountController — dívidas (D16)', () => {
     expect(m.pay).toHaveBeenCalledWith('owner-1', 'debt_x');
     expect(res.status).toHaveBeenCalledWith(404);
   });
-
-  it('perdoar é só do admin', async () => {
-    const res = response();
-    await PaymentAccountController.waiveDebt(
-      request({ params: { debtId: 'debt_x' } as never }),
-      res as unknown as Response
-    );
-    expect(res.status).toHaveBeenCalledWith(403);
-    expect(m.waive).not.toHaveBeenCalled();
-    m.waive.mockResolvedValue({ id: 'debt_x', status: 'waived' });
-    const ok = response();
-    await PaymentAccountController.waiveDebt(
-      request({ user: ADMIN as never, params: { debtId: 'debt_x' } as never }),
-      ok as unknown as Response
-    );
-    expect(m.waive).toHaveBeenCalledWith('debt_x', 'admin-1');
-    expect(ok.json).toHaveBeenCalledWith({ data: { id: 'debt_x', status: 'waived' } });
-  });
 });

=== server/interfaces/http/paymentAccounts/paymentAccountRoutes.ts — diff ===
@@ -1,6 +1,7 @@
 import { type NextFunction, type Response, Router } from 'express';
 import type { AuthenticatedRequest } from '../../../infrastructure/auth/authenticatedRequest';
 import { verifyAuthToken } from '../../../infrastructure/auth/authMiddleware';
+import { AdminAccountDebtController } from './adminAccountDebtController';
 import { ForceMajeureController } from './forceMajeureController';
 import { PaymentAccountController } from './paymentAccountController';
 
@@ -16,15 +17,20 @@ router.post('/session', verifyAuthTokenStrict, PaymentAccountController.createSe
 router.get('/payouts', verifyAuthToken, PaymentAccountController.listPayouts);
 router.get('/debts', verifyAuthToken, PaymentAccountController.listDebts);
 router.post('/debts/:debtId/payment', verifyAuthTokenStrict, PaymentAccountController.payDebt);
-router.post('/debts/:debtId/waive', verifyAuthTokenStrict, PaymentAccountController.waiveDebt);
 router.post('/debts/:debtId/force-majeure', verifyAuthTokenStrict, ForceMajeureController.declare);
 router.get('/terms', verifyAuthToken, PaymentAccountController.getTerms);
 router.post('/terms', verifyAuthTokenStrict, PaymentAccountController.acceptTerms);
 
 export default router;
 
-/** Fila de força maior do admin (D16, 3A), montada em `/api/admin/account-debts`. */
+/** Dívidas e fila de força maior do admin (D16), montadas em `/api/admin/account-debts`. */
 export const adminAccountDebtRouter = Router();
+adminAccountDebtRouter.get('/', verifyAuthToken, AdminAccountDebtController.listOpen);
+adminAccountDebtRouter.post(
+  '/:debtId/waive',
+  verifyAuthTokenStrict,
+  AdminAccountDebtController.waive
+);
 adminAccountDebtRouter.get('/force-majeure', verifyAuthToken, ForceMajeureController.listReviews);
 adminAccountDebtRouter.get(
   '/:debtId/force-majeure/proof',

=== server/interfaces/http/paymentAccounts/schemas/paymentAccountSchemas.ts — diff ===
@@ -58,3 +58,15 @@ export const ListPayoutsQuerySchema = z
       .optional(),
   })
   .strict();
+
+export const ListAdminAccountDebtsQuerySchema = z
+  .object({
+    limit: z.coerce.number().int().min(1).max(100).default(50),
+    cursor: z
+      .string()
+      .min(1)
+      .max(200)
+      .regex(/^[\w-]+$/)
+      .optional(),
+  })
+  .strict();

=== server/interfaces/http/saleClaims/saleClaimController.test.ts — diff ===
@@ -10,6 +10,9 @@ vi.mock('../../../application/usecases/payouts/openSaleClaimApplicationUseCase',
 vi.mock('../../../application/usecases/payouts/decideSaleClaimApplicationUseCase', () => ({
   decideSaleClaimApplicationUseCase: m.decide,
 }));
+vi.mock('../../../application/usecases/payouts/listAdminSaleClaimsApplicationUseCase', () => ({
+  listAdminSaleClaimsApplicationUseCase: m.pending,
+}));
 vi.mock('../../../domain/payment', async () => {
   const { PaymentDomainError } = await import(
     '../../../domain/payment/services/stripePaymentService'
@@ -17,7 +20,6 @@ vi.mock('../../../domain/payment', async () => {
   return {
     PaymentDomainError,
     listMySaleClaimsUseCase: m.mine,
-    listPendingSaleClaimsUseCase: m.pending,
   };
 });

=== server/interfaces/http/saleClaims/saleClaimController.ts — diff ===
@@ -1,11 +1,8 @@
 import type { Response } from 'express';
 import { decideSaleClaimApplicationUseCase } from '../../../application/usecases/payouts/decideSaleClaimApplicationUseCase';
+import { listAdminSaleClaimsApplicationUseCase } from '../../../application/usecases/payouts/listAdminSaleClaimsApplicationUseCase';
 import { openSaleClaimApplicationUseCase } from '../../../application/usecases/payouts/openSaleClaimApplicationUseCase';
-import {
-  listMySaleClaimsUseCase,
-  listPendingSaleClaimsUseCase,
-  PaymentDomainError,
-} from '../../../domain/payment';
+import { listMySaleClaimsUseCase, PaymentDomainError } from '../../../domain/payment';
 import type { AuthenticatedRequest } from '../../../infrastructure/auth/authenticatedRequest';
 import {
   DecideSaleClaimSchema,
@@ -65,7 +62,7 @@ export class SaleClaimController {
     const query = ListSaleClaimsQuerySchema.safeParse(req.query);
     if (!query.success) return sendError(res, 400, 'VALIDATION_ERROR', 'Consulta inválida.');
     try {
-      const page = await listPendingSaleClaimsUseCase(query.data.limit, query.data.cursor);
+      const page = await listAdminSaleClaimsApplicationUseCase(query.data.limit, query.data.cursor);
       return res.status(200).json(page);
     } catch (error) {
       return handleError(res, error, 'listPending');

=== src/app/compositions/AdminPanelComposition.tsx — diff ===
@@ -16,6 +16,7 @@ import {
   type PartnerContentItemInput,
   type PartnerContentRecord,
 } from '../../domain/partners';
+import { AdminFinanceQueues } from '../../domain/payment';
 import { PartnerEventTicketingManager } from '../../domain/ticketing';
 
 // Cadastros novos que o admin pode criar pelo editor do parceiro (o servidor permite só estes ao admin).
@@ -83,7 +84,8 @@ function AdminListingEditor({ item, onClose }: AdminListingEditorProps) {
 
 /**
  * Painel admin com os editores compartilhados: cadastro (o mesmo do parceiro, decisão D9), fila de
- * verificação dos estabelecimentos (D12), selo por estabelecimento (D11), sessões do evento e gerenciador de ingressos.
+ * verificação dos estabelecimentos (D12), selo por estabelecimento (D11), filas financeiras (D16), sessões do evento e
+ * gerenciador de ingressos.
  */
 export function AdminPanelComposition() {
   return (
@@ -91,6 +93,7 @@ export function AdminPanelComposition() {
       renderListingEditor={(props) => <AdminListingEditor {...props} />}
       renderVerificationQueue={() => <ListingVerificationQueue />}
       renderListingSeal={(item) => <AdminListingSealControl itemId={item.id} name={item.name} />}
+      renderFinanceQueues={() => <AdminFinanceQueues />}
       renderSessionsField={(props) => <EventSessionsField {...props} />}
       renderTicketingManager={(eventListingId) => (
         <PartnerEventTicketingManager eventListingId={eventListingId} asAdmin />

=== src/domain/admin/components/AdminPanel.tsx — diff ===
@@ -2,7 +2,7 @@ import { type ReactNode, useMemo, useState } from 'react';
 import { UserRole } from '../../auth/types/auth';
 import { motion, AnimatePresence } from 'motion/react';
 import { useAuthContext } from '../../auth/context/AuthContext';
-import { ChevronLeft, RefreshCw, X } from 'lucide-react';
+import { ChevronLeft, RefreshCw } from 'lucide-react';
 import { useUI } from '../../../shared/stores/useUIStore';
 import { useLocalizedRouting } from '../../../shared/hooks/useLocalizedRouting';
 
@@ -40,6 +40,7 @@ import { AdminEditorModal, type AdminEditorSaveData } from './subcomponents/Admi
 import type { AdminEventSlots } from './subcomponents/AdminEditorEventFields';
 import { AdminPlansView } from './subcomponents/AdminPlansView';
 import { AdminNotificationsView } from './subcomponents/AdminNotificationsView';
+import { AdminAccessDenied } from './subcomponents/AdminAccessDenied';
 
 function newRecord(category: 'tips' | 'event'): GuideItem {
   return {
@@ -69,12 +70,15 @@ export interface AdminPanelProps extends AdminEventSlots {
   renderVerificationQueue?: () => ReactNode;
   /** Selo de cada estabelecimento (D11, domínio partners), montado pela composição. */
   renderListingSeal?: (item: GuideItem) => ReactNode;
+  /** Filas financeiras (D16, domínio payment), montadas pela composição. */
+  renderFinanceQueues?: () => ReactNode;
 }
 
 export function AdminPanel({
   renderListingEditor,
   renderVerificationQueue,
   renderListingSeal,
+  renderFinanceQueues,
   renderSessionsField,
   renderTicketingManager,
 }: AdminPanelProps = {}) {
@@ -213,27 +217,7 @@ export function AdminPanel({
   }
 
   if (!user || !isAdminUser) {
-    return (
-      <div
-        className="min-h-screen flex flex-col items-center justify-center bg-slate-950 p-6 text-center"
-        id="denied-access-screen"
-      >
-        <div className="w-20 h-20 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500 mb-6 border border-rose-500/20">
-          <X size={40} />
-        </div>
-        <h2 className="text-2xl font-display font-extrabold mb-2">Acesso Restrito</h2>
-        <p className="text-white/50 mb-8 max-w-xs text-sm">
-          Você precisa estar autenticado com uma conta de administrador.
-        </p>
-        <button
-          type="button"
-          onClick={() => goTo('explore')}
-          className="min-h-[44px] px-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-white/10 transition-all focus-visible:ring-2 focus-visible:ring-teal-400/50"
-        >
-          Voltar para o Início
-        </button>
-      </div>
-    );
+    return <AdminAccessDenied onBack={() => goTo('explore')} />;
   }
 
   return (
@@ -274,6 +258,7 @@ export function AdminPanel({
           activeTab={activeTab}
           onSelectTab={setActiveTab}
           showVerifications={Boolean(renderVerificationQueue)}
+          showFinance={Boolean(renderFinanceQueues)}
         />
 
         <AnimatePresence mode="wait">
@@ -308,6 +293,8 @@ export function AdminPanel({
               )
             ) : activeTab === 'verifications' ? (
               renderVerificationQueue?.()
+            ) : activeTab === 'finance' ? (
+              renderFinanceQueues?.()
             ) : activeTab === 'plans' ? (
               <AdminPlansView />
             ) : activeTab === 'notifications' ? (

=== src/domain/admin/components/subcomponents/AdminAccessDenied.tsx — ARQUIVO NOVO, conteúdo completo ===
import { X } from 'lucide-react';

export function AdminAccessDenied({ onBack }: { onBack: () => void }) {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center bg-slate-950 p-6 text-center"
      id="denied-access-screen"
    >
      <div className="w-20 h-20 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500 mb-6 border border-rose-500/20">
        <X size={40} />
      </div>
      <h2 className="text-2xl font-display font-extrabold mb-2">Acesso Restrito</h2>
      <p className="text-white/50 mb-8 max-w-xs text-sm">
        Você precisa estar autenticado com uma conta de administrador.
      </p>
      <button
        type="button"
        onClick={onBack}
        className="min-h-[44px] px-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-white/10 transition-all focus-visible:ring-2 focus-visible:ring-teal-400/50"
      >
        Voltar para o Início
      </button>
    </div>
  );
}

=== src/domain/admin/components/subcomponents/AdminNavigation.tsx — diff ===
@@ -1,5 +1,14 @@
 import { motion } from 'motion/react';
-import { Award, Bell, Calendar, Database, Layers, ShieldCheck, Users } from 'lucide-react';
+import {
+  Award,
+  Bell,
+  Calendar,
+  Database,
+  Landmark,
+  Layers,
+  ShieldCheck,
+  Users,
+} from 'lucide-react';
 import { useTranslation } from 'react-i18next';
 import { cn } from '../../../../shared/utils/cn';
 
@@ -9,6 +18,7 @@ export type AdminTabId =
   | 'reports'
   | 'partners'
   | 'verifications'
+  | 'finance'
   | 'plans'
   | 'notifications';
 
@@ -17,6 +27,8 @@ interface AdminNavigationProps {
   onSelectTab: (tab: AdminTabId) => void;
   /** A fila de verificação vem de outro domínio; a aba só aparece quando a composição a monta. */
   showVerifications?: boolean;
+  /** As filas financeiras vêm do payment; a aba só aparece quando a composição as monta. */
+  showFinance?: boolean;
 }
 
 const ADMIN_TABS = [
@@ -41,6 +53,13 @@ const ADMIN_TABS = [
     color: 'bg-emerald-500',
     shadow: 'shadow-emerald-500/40',
   },
+  {
+    id: 'finance' as const,
+    label: '',
+    icon: Landmark,
+    color: 'bg-cyan-400',
+    shadow: 'shadow-cyan-400/40',
+  },
   {
     id: 'items' as const,
     label: 'Guia Local',
@@ -75,10 +94,19 @@ export function AdminNavigation({
   activeTab,
   onSelectTab,
   showVerifications = false,
+  showFinance = false,
 }: AdminNavigationProps) {
   const { t } = useTranslation();
-  const tabs = ADMIN_TABS.filter((tab) => tab.id !== 'verifications' || showVerifications).map(
-    (tab) => (tab.id === 'verifications' ? { ...tab, label: t('verification.admin.tab') } : tab)
+  const shown = { verifications: showVerifications, finance: showFinance } as Partial<
+    Record<AdminTabId, boolean>
+  >;
+  // Abas de outros domínios têm rótulo traduzido; as demais ainda são texto fixo (débito B32).
+  const labels: Partial<Record<AdminTabId, string>> = {
+    verifications: t('verification.admin.tab'),
+    finance: t('adminFinance.title'),
+  };
+  const tabs = ADMIN_TABS.filter((tab) => shown[tab.id] ?? true).map((tab) =>
+    labels[tab.id] ? { ...tab, label: labels[tab.id] as string } : tab
   );
   return (
     <motion.div

=== src/domain/payment/api/apiAdminFinanceAdapter.ts — ARQUIVO NOVO, conteúdo completo ===
import { firebaseApiFetch } from '../../../shared/infrastructure/firebase/firebaseApiFetch';
import type { AdminFinanceApiPort } from '../ports/adminFinanceApiPort';
import type {
  AdminAccountDebt,
  AdminForceMajeureReview,
  AdminPage,
  AdminSaleClaim,
  SaleClaimDecisionInput,
} from '../types/adminFinance';

const API_OPTIONS = { requireAuth: true, requireAppCheck: true } as const;

/** Lança Error com o `code` estável do backend (AGENTS.md §10.2); a UI traduz pelo código. */
async function okOrThrow(response: Response): Promise<Response> {
  if (response.ok) return response;
  const data = await response.json().catch(() => ({}));
  throw new Error(typeof data?.error?.code === 'string' ? data.error.code : 'UNAVAILABLE');
}

async function getJson<T>(path: string): Promise<T> {
  const response = await firebaseApiFetch(path, { method: 'GET' }, API_OPTIONS);
  return (await okOrThrow(response)).json() as Promise<T>;
}

async function post(path: string, body: unknown): Promise<void> {
  const response = await firebaseApiFetch(
    path,
    { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) },
    API_OPTIONS
  );
  await okOrThrow(response);
}

function page(path: string, cursor?: string): string {
  const params = new URLSearchParams({ limit: '30' });
  if (cursor) params.set('cursor', cursor);
  return `${path}?${params.toString()}`;
}

const debtPath = (debtId: string) => `/api/admin/account-debts/${encodeURIComponent(debtId)}`;

export class ApiAdminFinanceAdapter implements AdminFinanceApiPort {
  listSaleClaims(cursor?: string): Promise<AdminPage<AdminSaleClaim>> {
    return getJson(page('/api/admin/sale-claims', cursor));
  }

  decideSaleClaim(claimId: string, decision: SaleClaimDecisionInput): Promise<void> {
    return post(`/api/admin/sale-claims/${encodeURIComponent(claimId)}/decision`, decision);
  }

  async listForceMajeureReviews(): Promise<AdminForceMajeureReview[]> {
    return (
      await getJson<{ data: AdminForceMajeureReview[] }>('/api/admin/account-debts/force-majeure')
    ).data;
  }

  async readForceMajeureProof(debtId: string): Promise<Blob> {
    const response = await firebaseApiFetch(
      `${debtPath(debtId)}/force-majeure/proof`,
      { method: 'GET' },
      API_OPTIONS
    );
    return (await okOrThrow(response)).blob();
  }

  decideForceMajeure(debtId: string, approve: boolean): Promise<void> {
    return post(`${debtPath(debtId)}/force-majeure/decision`, { approve });
  }

  listAccountDebts(cursor?: string): Promise<AdminPage<AdminAccountDebt>> {
    return getJson(page('/api/admin/account-debts', cursor));
  }

  waiveAccountDebt(debtId: string): Promise<void> {
    return post(`${debtPath(debtId)}/waive`, {});
  }
}

=== src/domain/payment/application/usecases/decideForceMajeureUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { adminFinanceApiAdapter } from '../../factory';

/** Aprovada, a multa é perdoada; recusada, volta a valer com 24 h para pagar (D16, 3A). */
export function decideForceMajeureUseCase(debtId: string, approve: boolean): Promise<void> {
  return adminFinanceApiAdapter.decideForceMajeure(debtId, approve);
}

=== src/domain/payment/application/usecases/decideSaleClaimUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { adminFinanceApiAdapter } from '../../factory';
import type { SaleClaimDecisionInput } from '../../types/adminFinance';

/** O backend recalcula o teto do reembolso e só aceita a multa no serviço que não aconteceu. */
export function decideSaleClaimUseCase(
  claimId: string,
  decision: SaleClaimDecisionInput
): Promise<void> {
  return adminFinanceApiAdapter.decideSaleClaim(claimId, decision);
}

=== src/domain/payment/application/usecases/listAdminAccountDebtsUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { adminFinanceApiAdapter } from '../../factory';
import type { AdminAccountDebt, AdminPage } from '../../types/adminFinance';

export function listAdminAccountDebtsUseCase(
  cursor?: string
): Promise<AdminPage<AdminAccountDebt>> {
  return adminFinanceApiAdapter.listAccountDebts(cursor);
}

=== src/domain/payment/application/usecases/listAdminSaleClaimsUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { adminFinanceApiAdapter } from '../../factory';
import type { AdminPage, AdminSaleClaim } from '../../types/adminFinance';

export function listAdminSaleClaimsUseCase(cursor?: string): Promise<AdminPage<AdminSaleClaim>> {
  return adminFinanceApiAdapter.listSaleClaims(cursor);
}

=== src/domain/payment/application/usecases/listForceMajeureReviewsUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { adminFinanceApiAdapter } from '../../factory';
import type { AdminForceMajeureReview } from '../../types/adminFinance';

export function listForceMajeureReviewsUseCase(): Promise<AdminForceMajeureReview[]> {
  return adminFinanceApiAdapter.listForceMajeureReviews();
}

=== src/domain/payment/application/usecases/readForceMajeureProofUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { adminFinanceApiAdapter } from '../../factory';

/** A prova fica em pasta privada; só o admin a recebe, pelo backend. */
export function readForceMajeureProofUseCase(debtId: string): Promise<Blob> {
  return adminFinanceApiAdapter.readForceMajeureProof(debtId);
}

=== src/domain/payment/application/usecases/waiveAccountDebtUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { adminFinanceApiAdapter } from '../../factory';

export function waiveAccountDebtUseCase(debtId: string): Promise<void> {
  return adminFinanceApiAdapter.waiveAccountDebt(debtId);
}

=== src/domain/payment/components/admin/AdminDebtCard.tsx — ARQUIVO NOVO, conteúdo completo ===
import { useTranslation } from 'react-i18next';
import { formatMoneyMinor } from '../../../../shared/utils/money';
import type { AdminAccountDebt } from '../../types/adminFinance';
import { formatFortalezaDateTime } from '../../utils/receivablesFormat';
import { debtStatusKey, debtStatusTone } from '../receivables/debtStatus';
import { CARD, DANGER_BUTTON } from './adminFinanceStyles';
import { SellerLine } from './SellerLine';

export function AdminDebtCard({
  debt,
  busy,
  onWaive,
}: {
  debt: AdminAccountDebt;
  busy: boolean;
  onWaive: (debt: AdminAccountDebt) => void;
}) {
  const { t, i18n } = useTranslation();
  const status = debtStatusKey(debt);
  const money = (value: number) => formatMoneyMinor(value, i18n.language);
  return (
    <li className={CARD}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0 space-y-1">
          <p className="text-sm font-bold text-ink">
            {t(`receivables.debts.reason.${debt.reason}`)}
          </p>
          <SellerLine seller={debt} />
        </div>
        <span
          className={`shrink-0 max-w-[45%] px-2.5 py-1 rounded-full border text-[11px] font-bold text-center ${debtStatusTone(status)}`}
        >
          {t(`receivables.debts.status.${status}`)}
        </span>
      </div>
      <dl className="space-y-1 text-xs">
        <div className="flex items-center justify-between gap-3">
          <dt className="text-ink/70">{t('receivables.debts.amount')}</dt>
          <dd className="text-ink">{money(debt.amountMinor)}</dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-ink/70">{t('receivables.debts.remaining')}</dt>
          <dd className="font-bold text-ink">{money(debt.remainingMinor)}</dd>
        </div>
      </dl>
      <p className={`text-[11px] ${debt.overdue ? 'text-danger' : 'text-ink/70'}`}>
        {t(debt.overdue ? 'adminFinance.debts.overdueSince' : 'adminFinance.debts.dueOn', {
          date: formatFortalezaDateTime(debt.dueAt, i18n.language),
        })}
      </p>
      <button type="button" disabled={busy} onClick={() => onWaive(debt)} className={DANGER_BUTTON}>
        {t('adminFinance.debts.waive')}
      </button>
    </li>
  );
}

=== src/domain/payment/components/admin/AdminDebtQueue.tsx — ARQUIVO NOVO, conteúdo completo ===
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { formatMoneyMinor } from '../../../../shared/utils/money';
import { ConfirmDialog, type ConfirmDialogData } from '../../../../ui/components/ConfirmDialog';
import { listAdminAccountDebtsUseCase } from '../../application/usecases/listAdminAccountDebtsUseCase';
import { waiveAccountDebtUseCase } from '../../application/usecases/waiveAccountDebtUseCase';
import { useAdminFinanceQueue } from '../../hooks/useAdminFinanceQueue';
import type { AdminAccountDebt } from '../../types/adminFinance';
import { adminFinanceErrorKey, errorCodeOf } from '../../utils/adminFinanceErrors';
import { AdminDebtCard } from './AdminDebtCard';
import { AdminQueueFrame } from './AdminQueueFrame';

export function AdminDebtQueue({
  onNotice,
}: {
  onNotice: (message: string, error?: boolean) => void;
}) {
  const { t, i18n } = useTranslation();
  const queue = useAdminFinanceQueue(listAdminAccountDebtsUseCase);
  const [confirm, setConfirm] = useState<ConfirmDialogData | null>(null);
  const [busy, setBusy] = useState(false);

  const waive = (debt: AdminAccountDebt) =>
    setConfirm({
      message: t('adminFinance.debts.waiveConfirm', {
        amount: formatMoneyMinor(debt.remainingMinor, i18n.language),
      }),
      tone: 'danger',
      confirmLabel: t('adminFinance.debts.waive'),
      onCancel: () => setConfirm(null),
      onConfirm: async () => {
        setConfirm(null);
        setBusy(true);
        try {
          await waiveAccountDebtUseCase(debt.id);
          onNotice(t('adminFinance.debts.waived'));
          await queue.reload();
        } catch (err) {
          onNotice(t(adminFinanceErrorKey(errorCodeOf(err))), true);
        } finally {
          setBusy(false);
        }
      },
    });

  return (
    <>
      <AdminQueueFrame
        hint={t('adminFinance.debts.hint')}
        loading={queue.loading}
        error={queue.error}
        empty={queue.data.length === 0}
        emptyMessage={t('adminFinance.debts.empty')}
        hasMore={queue.hasMore}
        onRetry={() => void queue.reload()}
        onLoadMore={() => void queue.loadMore()}
      >
        {queue.data.map((debt) => (
          <AdminDebtCard key={debt.id} debt={debt} busy={busy} onWaive={waive} />
        ))}
      </AdminQueueFrame>
      <ConfirmDialog data={confirm} />
    </>
  );
}

=== src/domain/payment/components/admin/AdminFinanceQueues.tsx — ARQUIVO NOVO, conteúdo completo ===
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AdminDebtQueue } from './AdminDebtQueue';
import { ForceMajeureQueue } from './ForceMajeureQueue';
import { SaleClaimQueue } from './SaleClaimQueue';

type FinanceTab = 'claims' | 'forceMajeure' | 'debts';
const TABS: FinanceTab[] = ['claims', 'forceMajeure', 'debts'];

/** Filas financeiras do admin (D16): reclamações, força maior e dívidas dos CNPJs. */
export function AdminFinanceQueues() {
  const { t } = useTranslation();
  const [tab, setTab] = useState<FinanceTab>('claims');
  const [notice, setNotice] = useState<{ message: string; error: boolean } | null>(null);
  const show = (message: string, error = false) => setNotice({ message, error });
  return (
    <section className="space-y-4" aria-labelledby="admin-finance-title">
      <h2 id="admin-finance-title" className="text-xl font-display font-bold text-ink">
        {t('adminFinance.title')}
      </h2>
      <div className="flex flex-wrap gap-2" role="group" aria-label={t('adminFinance.tabsLabel')}>
        {TABS.map((value) => (
          <button
            key={value}
            type="button"
            aria-pressed={tab === value}
            onClick={() => {
              setTab(value);
              setNotice(null);
            }}
            className={`press min-h-11 px-4 rounded-xl text-xs font-bold focus-visible:ring-2 focus-visible:ring-teal-400/50 ${
              tab === value
                ? 'bg-teal-400 text-slate-950'
                : 'bg-surface border border-line text-ink hover:bg-accent-soft'
            }`}
          >
            {t(`adminFinance.tabs.${value}`)}
          </button>
        ))}
      </div>
      {notice && (
        <p
          role={notice.error ? 'alert' : 'status'}
          className={`p-3 rounded-xl border text-xs ${
            notice.error
              ? 'bg-danger-soft border-danger-line text-danger'
              : 'bg-success-soft border-success-line text-success'
          }`}
        >
          {notice.message}
        </p>
      )}
      {tab === 'claims' ? (
        <SaleClaimQueue onNotice={show} />
      ) : tab === 'forceMajeure' ? (
        <ForceMajeureQueue onNotice={show} />
      ) : (
        <AdminDebtQueue onNotice={show} />
      )}
    </section>
  );
}

=== src/domain/payment/components/admin/AdminQueueFrame.tsx — ARQUIVO NOVO, conteúdo completo ===
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { adminFinanceErrorKey } from '../../utils/adminFinanceErrors';
import {
  ReceivablesEmpty,
  ReceivablesError,
  ReceivablesLoading,
} from '../receivables/ReceivablesState';
import { SECONDARY_BUTTON } from './adminFinanceStyles';

/** Carregando, erro, vazio e "carregar mais" de uma fila do admin (AGENTS.md §11.8). */
export function AdminQueueFrame({
  hint,
  loading,
  error,
  empty,
  emptyMessage,
  hasMore,
  onRetry,
  onLoadMore,
  children,
}: {
  hint: string;
  loading: boolean;
  error: string | null;
  empty: boolean;
  emptyMessage: string;
  hasMore: boolean;
  onRetry: () => void;
  onLoadMore: () => void;
  children: ReactNode;
}) {
  const { t } = useTranslation();
  return (
    <div className="space-y-3">
      <p className="text-xs text-ink/70">{hint}</p>
      {error ? (
        <ReceivablesError messageKey={adminFinanceErrorKey(error)} onRetry={onRetry} />
      ) : loading && empty ? (
        <ReceivablesLoading label={t('adminFinance.loading')} />
      ) : empty ? (
        <ReceivablesEmpty message={emptyMessage} />
      ) : (
        <ul className="grid grid-cols-1 lg:grid-cols-2 gap-3">{children}</ul>
      )}
      {hasMore && !error && (
        <button
          type="button"
          disabled={loading}
          onClick={onLoadMore}
          className={`${SECONDARY_BUTTON} w-full`}
        >
          {t('adminFinance.loadMore')}
        </button>
      )}
    </div>
  );
}

=== src/domain/payment/components/admin/ForceMajeureQueue.tsx — ARQUIVO NOVO, conteúdo completo ===
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ConfirmDialog, type ConfirmDialogData } from '../../../../ui/components/ConfirmDialog';
import { decideForceMajeureUseCase } from '../../application/usecases/decideForceMajeureUseCase';
import { listForceMajeureReviewsUseCase } from '../../application/usecases/listForceMajeureReviewsUseCase';
import { readForceMajeureProofUseCase } from '../../application/usecases/readForceMajeureProofUseCase';
import { useAdminFinanceQueue } from '../../hooks/useAdminFinanceQueue';
import type { AdminForceMajeureReview } from '../../types/adminFinance';
import { adminFinanceErrorKey, errorCodeOf } from '../../utils/adminFinanceErrors';
import { AdminQueueFrame } from './AdminQueueFrame';
import { ForceMajeureReviewCard } from './ForceMajeureReviewCard';

const OBJECT_URL_TTL_MS = 60_000;

async function listAll() {
  return { data: await listForceMajeureReviewsUseCase(), nextCursor: null };
}

export function ForceMajeureQueue({
  onNotice,
}: {
  onNotice: (message: string, error?: boolean) => void;
}) {
  const { t } = useTranslation();
  const queue = useAdminFinanceQueue(listAll);
  const [confirm, setConfirm] = useState<ConfirmDialogData | null>(null);
  const [busy, setBusy] = useState(false);

  const openProof = async (review: AdminForceMajeureReview) => {
    try {
      const url = URL.createObjectURL(await readForceMajeureProofUseCase(review.id));
      window.open(url, '_blank', 'noopener,noreferrer');
      setTimeout(() => URL.revokeObjectURL(url), OBJECT_URL_TTL_MS);
    } catch (err) {
      onNotice(t(adminFinanceErrorKey(errorCodeOf(err))), true);
    }
  };

  const decide = (review: AdminForceMajeureReview, approve: boolean) =>
    setConfirm({
      message: t(
        approve
          ? 'adminFinance.forceMajeure.approveConfirm'
          : 'adminFinance.forceMajeure.rejectConfirm'
      ),
      tone: approve ? 'positive' : 'danger',
      confirmLabel: t(
        approve ? 'adminFinance.forceMajeure.approve' : 'adminFinance.forceMajeure.reject'
      ),
      onCancel: () => setConfirm(null),
      onConfirm: async () => {
        setConfirm(null);
        setBusy(true);
        try {
          await decideForceMajeureUseCase(review.id, approve);
          onNotice(
            t(approve ? 'adminFinance.forceMajeure.approved' : 'adminFinance.forceMajeure.rejected')
          );
          await queue.reload();
        } catch (err) {
          onNotice(t(adminFinanceErrorKey(errorCodeOf(err))), true);
        } finally {
          setBusy(false);
        }
      },
    });

  return (
    <>
      <AdminQueueFrame
        hint={t('adminFinance.forceMajeure.hint')}
        loading={queue.loading}
        error={queue.error}
        empty={queue.data.length === 0}
        emptyMessage={t('adminFinance.forceMajeure.empty')}
        hasMore={false}
        onRetry={() => void queue.reload()}
        onLoadMore={() => undefined}
      >
        {queue.data.map((review) => (
          <ForceMajeureReviewCard
            key={review.id}
            review={review}
            busy={busy}
            onOpenProof={(entry) => void openProof(entry)}
            onDecide={decide}
          />
        ))}
      </AdminQueueFrame>
      <ConfirmDialog data={confirm} />
    </>
  );
}

=== src/domain/payment/components/admin/ForceMajeureReviewCard.tsx — ARQUIVO NOVO, conteúdo completo ===
import { FileText } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { formatMoneyMinor } from '../../../../shared/utils/money';
import type { AdminForceMajeureReview } from '../../types/adminFinance';
import { formatFortalezaDateTime } from '../../utils/receivablesFormat';
import { CARD, DANGER_BUTTON, PRIMARY_BUTTON, SECONDARY_BUTTON } from './adminFinanceStyles';
import { SellerLine } from './SellerLine';

export function ForceMajeureReviewCard({
  review,
  busy,
  onOpenProof,
  onDecide,
}: {
  review: AdminForceMajeureReview;
  busy: boolean;
  onOpenProof: (review: AdminForceMajeureReview) => void;
  onDecide: (review: AdminForceMajeureReview, approve: boolean) => void;
}) {
  const { t, i18n } = useTranslation();
  return (
    <li className={CARD}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0 space-y-1">
          <p className="text-sm font-bold text-ink">
            {t(`receivables.debts.reason.${review.reason}`)}
          </p>
          <SellerLine seller={review} />
        </div>
        <span className="shrink-0 px-2.5 py-1 rounded-full border text-[11px] font-bold bg-info-soft text-info border-info-line">
          {formatMoneyMinor(review.remainingMinor, i18n.language)}
        </span>
      </div>
      <blockquote className="px-3 py-2 rounded-xl bg-app/40 border-l-2 border-line text-xs text-ink/80 whitespace-pre-line break-words">
        {review.forceMajeureReason}
      </blockquote>
      <p className="text-[11px] text-ink/70">
        {t('adminFinance.forceMajeure.declaredAt', {
          date: formatFortalezaDateTime(review.declaredAt, i18n.language),
        })}
      </p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onOpenProof(review)}
          className={`${SECONDARY_BUTTON} flex items-center gap-1.5`}
        >
          <FileText size={14} aria-hidden="true" />
          {t('adminFinance.forceMajeure.openProof')}
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => onDecide(review, true)}
          className={PRIMARY_BUTTON}
        >
          {t('adminFinance.forceMajeure.approve')}
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => onDecide(review, false)}
          className={DANGER_BUTTON}
        >
          {t('adminFinance.forceMajeure.reject')}
        </button>
      </div>
    </li>
  );
}

=== src/domain/payment/components/admin/SaleClaimDecisionDialog.tsx — ARQUIVO NOVO, conteúdo completo ===
import { Loader2 } from 'lucide-react';
import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { formatMoneyMinor } from '../../../../shared/utils/money';
import { Dialog } from '../../../../ui/components/Dialog';
import { decideSaleClaimUseCase } from '../../application/usecases/decideSaleClaimUseCase';
import type { AdminSaleClaim, SaleClaimOutcome } from '../../types/adminFinance';
import { adminFinanceErrorKey, errorCodeOf } from '../../utils/adminFinanceErrors';
import { PRIMARY_BUTTON } from './adminFinanceStyles';

const OUTCOMES: SaleClaimOutcome[] = ['release', 'refund_full', 'refund_partial'];

const OPTION =
  'press min-h-11 px-3 py-2.5 rounded-xl border border-line bg-surface flex items-start gap-3 text-sm text-ink cursor-pointer has-[:checked]:border-accent-line has-[:checked]:bg-accent-soft focus-within:ring-2 focus-within:ring-teal-400/50';

/** Decisão do admin (D16, 2A); o backend recalcula os valores e confere a multa. */
export function SaleClaimDecisionDialog({
  claim,
  onClose,
  onDecided,
}: {
  claim: AdminSaleClaim | null;
  onClose: () => void;
  onDecided: (message: string) => void;
}) {
  const { t, i18n } = useTranslation();
  const id = useId();
  const [outcome, setOutcome] = useState<SaleClaimOutcome | null>(null);
  const [partialMinor, setPartialMinor] = useState(0);
  const [chargePenalty, setChargePenalty] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const money = (value: number) => formatMoneyMinor(value, i18n.language);
  // A multa do cancelamento silencioso só vale quando o serviço não aconteceu (D16).
  const penaltyAllowed = claim?.reason === 'did_not_happen' && outcome === 'refund_full';

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!claim) return;
    if (!outcome) return setError(t('adminFinance.claims.outcomeRequired'));
    if (
      outcome === 'refund_partial' &&
      (partialMinor <= 0 || partialMinor > claim.maxPartialRefundMinor)
    ) {
      return setError(
        t('adminFinance.claims.partialInvalid', { max: money(claim.maxPartialRefundMinor) })
      );
    }
    setSending(true);
    setError(null);
    try {
      await decideSaleClaimUseCase(claim.id, {
        outcome,
        ...(outcome === 'refund_partial' ? { amountMinor: partialMinor } : {}),
        ...(penaltyAllowed && chargePenalty ? { chargePenalty: true } : {}),
      });
      onDecided(t(`adminFinance.claims.decided.${outcome}`));
    } catch (err) {
      setError(t(adminFinanceErrorKey(errorCodeOf(err))));
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog
      open={claim !== null}
      onOpenChange={(open) => !open && onClose()}
      title={t('adminFinance.claims.decideTitle')}
      description={t('adminFinance.claims.decideDescription')}
    >
      {claim && (
        <form onSubmit={submit} className="space-y-4" noValidate>
          <fieldset className="space-y-2">
            <legend className="text-xs font-bold text-ink mb-1.5">
              {t('adminFinance.claims.outcomeLabel')}
            </legend>
            {OUTCOMES.map((value) => (
              <label key={value} className={OPTION}>
                <input
                  type="radio"
                  name={`${id}-outcome`}
                  value={value}
                  checked={outcome === value}
                  onChange={() => {
                    setOutcome(value);
                    setError(null);
                  }}
                  className="w-4 h-4 mt-0.5 accent-teal-500"
                />
                <span className="space-y-0.5">
                  <span className="block font-bold">
                    {t(`adminFinance.claims.outcome.${value}`, {
                      amount: money(claim.refundableMinor),
                    })}
                  </span>
                  <span className="block text-xs text-ink/70">
                    {t(`adminFinance.claims.outcomeHint.${value}`, {
                      max: money(claim.maxPartialRefundMinor),
                    })}
                  </span>
                </span>
              </label>
            ))}
          </fieldset>
          {outcome === 'refund_partial' && (
            <div className="space-y-1.5">
              <label htmlFor={`${id}-amount`} className="text-xs font-bold text-ink">
                {t('adminFinance.claims.partialLabel')}
              </label>
              <input
                id={`${id}-amount`}
                inputMode="numeric"
                value={partialMinor > 0 ? money(partialMinor) : ''}
                onChange={(event) => {
                  const digits = event.target.value.replace(/\D/g, '').slice(0, 9);
                  setPartialMinor(digits ? Number.parseInt(digits, 10) : 0);
                }}
                className="w-full min-h-11 px-3 rounded-xl bg-surface border border-line text-sm text-ink focus-visible:ring-2 focus-visible:ring-teal-400/50"
              />
            </div>
          )}
          {penaltyAllowed && (
            <label className={OPTION}>
              <input
                type="checkbox"
                checked={chargePenalty}
                onChange={(event) => setChargePenalty(event.target.checked)}
                className="w-4 h-4 mt-0.5 accent-teal-500"
              />
              <span className="space-y-0.5">
                <span className="block font-bold">{t('adminFinance.claims.penaltyLabel')}</span>
                <span className="block text-xs text-ink/70">
                  {t('adminFinance.claims.penaltyHint')}
                </span>
              </span>
            </label>
          )}
          {error && (
            <p
              role="alert"
              className="p-3 rounded-xl bg-danger-soft border border-danger-line text-xs text-danger"
            >
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={sending}
            className={`${PRIMARY_BUTTON} w-full min-h-12 text-sm flex items-center justify-center gap-2`}
          >
            {sending && <Loader2 size={16} className="animate-spin" aria-hidden="true" />}
            {t(sending ? 'adminFinance.sending' : 'adminFinance.claims.submit')}
          </button>
        </form>
      )}
    </Dialog>
  );
}

=== src/domain/payment/components/admin/SaleClaimQueue.tsx — ARQUIVO NOVO, conteúdo completo ===
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { listAdminSaleClaimsUseCase } from '../../application/usecases/listAdminSaleClaimsUseCase';
import { useAdminFinanceQueue } from '../../hooks/useAdminFinanceQueue';
import type { AdminSaleClaim } from '../../types/adminFinance';
import { AdminQueueFrame } from './AdminQueueFrame';
import { SaleClaimDecisionDialog } from './SaleClaimDecisionDialog';
import { SaleClaimQueueCard } from './SaleClaimQueueCard';

export function SaleClaimQueue({
  onNotice,
}: {
  onNotice: (message: string, error?: boolean) => void;
}) {
  const { t } = useTranslation();
  const queue = useAdminFinanceQueue(listAdminSaleClaimsUseCase);
  const [deciding, setDeciding] = useState<AdminSaleClaim | null>(null);
  return (
    <>
      <AdminQueueFrame
        hint={t('adminFinance.claims.hint')}
        loading={queue.loading}
        error={queue.error}
        empty={queue.data.length === 0}
        emptyMessage={t('adminFinance.claims.empty')}
        hasMore={queue.hasMore}
        onRetry={() => void queue.reload()}
        onLoadMore={() => void queue.loadMore()}
      >
        {queue.data.map((claim) => (
          <SaleClaimQueueCard key={claim.id} claim={claim} onDecide={setDeciding} />
        ))}
      </AdminQueueFrame>
      <SaleClaimDecisionDialog
        key={deciding?.id ?? 'none'}
        claim={deciding}
        onClose={() => setDeciding(null)}
        onDecided={(message) => {
          setDeciding(null);
          onNotice(message);
          void queue.reload();
        }}
      />
    </>
  );
}

=== src/domain/payment/components/admin/SaleClaimQueueCard.tsx — ARQUIVO NOVO, conteúdo completo ===
import { useTranslation } from 'react-i18next';
import { formatMoneyMinor } from '../../../../shared/utils/money';
import type { AdminSaleClaim } from '../../types/adminFinance';
import { formatFortalezaDateTime } from '../../utils/receivablesFormat';
import { CARD, PRIMARY_BUTTON } from './adminFinanceStyles';
import { SellerLine } from './SellerLine';

export function SaleClaimQueueCard({
  claim,
  onDecide,
}: {
  claim: AdminSaleClaim;
  onDecide: (claim: AdminSaleClaim) => void;
}) {
  const { t, i18n } = useTranslation();
  const date = (iso: string) => formatFortalezaDateTime(iso, i18n.language);
  const money = (value: number) => formatMoneyMinor(value, i18n.language);
  const pending = claim.status === 'refund_pending';
  return (
    <li className={CARD}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0 space-y-1">
          <p className="text-sm font-bold text-ink break-words">
            {claim.title ?? t(`adminFinance.claims.fallbackTitle.${claim.referenceType}`)}
          </p>
          <SellerLine seller={claim} />
        </div>
        <span
          className={`shrink-0 max-w-[45%] px-2.5 py-1 rounded-full border text-[11px] font-bold text-center ${
            pending
              ? 'bg-info-soft text-info border-info-line'
              : 'bg-warn-soft text-warn border-warn-line'
          }`}
        >
          {t(pending ? 'adminFinance.claims.refundPending' : 'adminFinance.claims.open')}
        </span>
      </div>
      <p className="text-xs font-bold text-ink">{t(`saleClaims.reason.${claim.reason}`)}</p>
      {claim.details && (
        <blockquote className="px-3 py-2 rounded-xl bg-app/40 border-l-2 border-line text-xs text-ink/80 whitespace-pre-line break-words">
          {claim.details}
        </blockquote>
      )}
      <dl className="space-y-1 text-xs">
        <div className="flex items-center justify-between gap-3">
          <dt className="text-ink/70">{t('adminFinance.claims.paid')}</dt>
          <dd className="text-ink">{money(claim.grossMinor)}</dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-ink/70">{t('adminFinance.claims.refundable')}</dt>
          <dd className="font-bold text-ink">{money(claim.refundableMinor)}</dd>
        </div>
        {claim.serviceEndsAt && (
          <div className="flex items-center justify-between gap-3">
            <dt className="text-ink/70">{t('adminFinance.claims.serviceEnd')}</dt>
            <dd className="text-ink">{date(claim.serviceEndsAt)}</dd>
          </div>
        )}
        <div className="flex items-center justify-between gap-3">
          <dt className="text-ink/70">{t('adminFinance.claims.openedAt')}</dt>
          <dd className="text-ink">{date(claim.openedAt)}</dd>
        </div>
      </dl>
      {pending ? (
        <p className="text-[11px] text-ink/70">{t('adminFinance.claims.refundPendingHint')}</p>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-[11px] text-warn">
            {t('adminFinance.claims.decideBy', { date: date(claim.decideBy) })}
          </p>
          <button type="button" onClick={() => onDecide(claim)} className={PRIMARY_BUTTON}>
            {t('adminFinance.claims.decide')}
          </button>
        </div>
      )}
    </li>
  );
}

=== src/domain/payment/components/admin/SellerLine.tsx — ARQUIVO NOVO, conteúdo completo ===
import { Store } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { SellerSummary } from '../../types/adminFinance';

export function SellerLine({ seller }: { seller: SellerSummary }) {
  const { t } = useTranslation();
  return (
    <p className="flex items-start gap-1.5 text-xs text-ink/70">
      <Store size={13} className="shrink-0 mt-0.5" aria-hidden="true" />
      <span className="min-w-0 break-words">
        {seller.sellerName ?? t('adminFinance.unknownSeller')}
        {seller.maskedDocument && <span className="font-mono"> · {seller.maskedDocument}</span>}
      </span>
    </p>
  );
}

=== src/domain/payment/components/admin/adminFinance.test.tsx — ARQUIVO NOVO, conteúdo completo ===
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { i18n } from '../../../../shared/i18n';

const m = vi.hoisted(() => ({ decide: vi.fn(), debts: vi.fn(), waive: vi.fn() }));
vi.mock('../../application/usecases/decideSaleClaimUseCase', () => ({
  decideSaleClaimUseCase: m.decide,
}));
vi.mock('../../application/usecases/listAdminAccountDebtsUseCase', () => ({
  listAdminAccountDebtsUseCase: m.debts,
}));
vi.mock('../../application/usecases/waiveAccountDebtUseCase', () => ({
  waiveAccountDebtUseCase: m.waive,
}));

import type { AdminAccountDebt, AdminSaleClaim } from '../../types/adminFinance';
import { AdminDebtQueue } from './AdminDebtQueue';
import { SaleClaimDecisionDialog } from './SaleClaimDecisionDialog';

const CLAIM: AdminSaleClaim = {
  id: 'booking_b1',
  referenceType: 'booking',
  referenceId: 'b1',
  reason: 'did_not_happen',
  status: 'open',
  openedAt: '2026-10-26T10:00:00.000Z',
  decideBy: '2026-10-31T10:00:00.000Z',
  buyerUid: 'buyer-1',
  title: 'Passeio de buggy',
  grossMinor: 10600,
  refundableMinor: 10600,
  maxPartialRefundMinor: 10000,
  sellerName: 'Buggy do Preá',
  maskedDocument: '**.***.***/0001-81',
};

const DEBT: AdminAccountDebt = {
  id: 'debt-1',
  accountKey: 'key-1',
  reason: 'cancellation_penalty',
  referenceType: 'booking_slot',
  amountMinor: 2000,
  remainingMinor: 2000,
  status: 'open',
  dueAt: '2026-10-27T12:00:00.000Z',
  overdue: true,
  createdAt: '2026-10-26T12:00:00.000Z',
  sellerName: 'Buggy do Preá',
  maskedDocument: '**.***.***/0001-81',
};

function renderDialog(claim: AdminSaleClaim = CLAIM) {
  const onDecided = vi.fn();
  render(<SaleClaimDecisionDialog claim={claim} onClose={vi.fn()} onDecided={onDecided} />);
  return onDecided;
}

describe('filas financeiras do admin (D16)', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    await i18n.changeLanguage('pt-BR');
  });

  it('multa só no serviço que não aconteceu com reembolso integral', async () => {
    m.decide.mockResolvedValue(undefined);
    const onDecided = renderDialog();
    expect(screen.queryByText('Cobrar multa de 20% do parceiro')).toBeNull();
    fireEvent.click(screen.getByLabelText(/Reembolso integral/));
    fireEvent.click(screen.getByLabelText(/Cobrar multa de 20% do parceiro/));
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar decisão' }));
    await waitFor(() =>
      expect(m.decide).toHaveBeenCalledWith('booking_b1', {
        outcome: 'refund_full',
        chargePenalty: true,
      })
    );
    expect(onDecided).toHaveBeenCalledWith('Reembolso integral pedido ao meio de pagamento.');
  });

  it('outro motivo: sem a opção de multa', () => {
    renderDialog({ ...CLAIM, reason: 'not_as_described' });
    fireEvent.click(screen.getByLabelText(/Reembolso integral/));
    expect(screen.queryByText('Cobrar multa de 20% do parceiro')).toBeNull();
  });

  it('parcial acima do teto é recusado antes de enviar', async () => {
    renderDialog();
    fireEvent.click(screen.getByLabelText(/Reembolso parcial/));
    fireEvent.change(screen.getByLabelText('Valor do reembolso'), {
      target: { value: '10001' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar decisão' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Informe um valor de até');
    expect(m.decide).not.toHaveBeenCalled();
    fireEvent.change(screen.getByLabelText('Valor do reembolso'), { target: { value: '5000' } });
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar decisão' }));
    await waitFor(() =>
      expect(m.decide).toHaveBeenCalledWith('booking_b1', {
        outcome: 'refund_partial',
        amountMinor: 5000,
      })
    );
  });

  it('erro da decisão pelo code', async () => {
    m.decide.mockRejectedValue(new Error('CLAIM_ALREADY_DECIDED'));
    renderDialog();
    fireEvent.click(screen.getByLabelText(/Liberar o repasse/));
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar decisão' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Esta reclamação já foi decidida.');
  });

  it('perdoar dívida pede confirmação e recarrega a lista', async () => {
    m.debts.mockResolvedValueOnce({ data: [DEBT], nextCursor: null });
    m.debts.mockResolvedValueOnce({ data: [], nextCursor: null });
    m.waive.mockResolvedValue(undefined);
    const onNotice = vi.fn();
    render(<AdminDebtQueue onNotice={onNotice} />);
    expect(await screen.findByText(/Buggy do Preá/)).toBeInTheDocument();
    expect(screen.getByText(/Vendas do CNPJ pausadas/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Perdoar dívida' }));
    const dialog = await screen.findByRole('dialog');
    fireEvent.click(within(dialog).getByRole('button', { name: 'Perdoar dívida' }));
    await waitFor(() => expect(m.waive).toHaveBeenCalledWith('debt-1'));
    expect(onNotice).toHaveBeenCalledWith('Dívida perdoada.');
    expect(await screen.findByText('Nenhuma dívida em aberto.')).toBeInTheDocument();
  });
});

=== src/domain/payment/components/admin/adminFinanceStyles.ts — ARQUIVO NOVO, conteúdo completo ===
export const PRIMARY_BUTTON =
  'press min-h-11 px-4 rounded-xl bg-teal-400 hover:bg-teal-300 disabled:opacity-50 text-slate-950 text-xs font-bold focus-visible:ring-2 focus-visible:ring-teal-400/50';
export const SECONDARY_BUTTON =
  'press min-h-11 px-4 rounded-xl border border-line text-xs font-bold text-ink hover:bg-accent-soft disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-teal-400/50';
export const DANGER_BUTTON =
  'press min-h-11 px-4 rounded-xl border border-danger-line bg-danger-soft text-xs font-bold text-danger disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-teal-400/50';
export const CARD = 'p-4 rounded-2xl bg-surface border border-line space-y-3';

=== src/domain/payment/factory.ts — ARQUIVO REESCRITO, substitua todo o conteúdo por este ===
import { ApiAdminFinanceAdapter } from './api/apiAdminFinanceAdapter';
import { ApiPaymentAdapter } from './api/apiPaymentAdapter';
import { ApiReceivablesAdapter } from './api/apiReceivablesAdapter';
import type { AdminFinanceApiPort } from './ports/adminFinanceApiPort';
import { PaymentApiPort } from './ports/paymentApiPort';
import type { ReceivablesApiPort } from './ports/receivablesApiPort';

export const paymentApiAdapter: PaymentApiPort = new ApiPaymentAdapter();
export const receivablesApiAdapter: ReceivablesApiPort = new ApiReceivablesAdapter();
export const adminFinanceApiAdapter: AdminFinanceApiPort = new ApiAdminFinanceAdapter();

=== src/domain/payment/hooks/useAdminFinanceQueue.ts — ARQUIVO NOVO, conteúdo completo ===
import { useCallback, useEffect, useRef, useState } from 'react';
import type { AdminPage } from '../types/adminFinance';

/** Fila paginada do admin: carrega a primeira página e acrescenta as seguintes pelo cursor. */
export function useAdminFinanceQueue<T>(fetchPage: (cursor?: string) => Promise<AdminPage<T>>) {
  const [data, setData] = useState<T[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchRef = useRef(fetchPage);
  fetchRef.current = fetchPage;

  const load = useCallback(async (cursor?: string) => {
    setLoading(true);
    setError(null);
    try {
      const page = await fetchRef.current(cursor);
      setData((current) => (cursor ? [...current, ...page.data] : page.data));
      setNextCursor(page.nextCursor);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'UNAVAILABLE');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return {
    data,
    loading,
    error,
    hasMore: nextCursor !== null,
    reload: () => load(),
    loadMore: () => (nextCursor ? load(nextCursor) : Promise.resolve()),
  };
}

=== src/domain/payment/index.ts — diff ===
@@ -5,6 +5,7 @@ export { PartnerStripeConnectPortal } from './components/PartnerStripeConnectPor
 export { PaymentAccountNotice } from './components/PaymentAccountNotice';
 export { MySaleClaimsProvider } from './components/claims/MySaleClaimsProvider';
 export { SaleClaimAction } from './components/claims/SaleClaimAction';
+export { AdminFinanceQueues } from './components/admin/AdminFinanceQueues';
 export { confirmPlanPaymentReturnUseCase } from './application/usecases/confirmPlanPaymentReturnUseCase';
 export { createPlanPaymentIntentUseCase } from './application/usecases/createPlanPaymentIntentUseCase';
 export { listPaymentAccountsUseCase } from './application/usecases/listPaymentAccountsUseCase';

=== src/domain/payment/ports/adminFinanceApiPort.ts — ARQUIVO NOVO, conteúdo completo ===
import type {
  AdminAccountDebt,
  AdminForceMajeureReview,
  AdminPage,
  AdminSaleClaim,
  SaleClaimDecisionInput,
} from '../types/adminFinance';

/** Filas financeiras do admin (D16); o backend confere o papel em cada rota. */
export interface AdminFinanceApiPort {
  listSaleClaims(cursor?: string): Promise<AdminPage<AdminSaleClaim>>;
  decideSaleClaim(claimId: string, decision: SaleClaimDecisionInput): Promise<void>;
  listForceMajeureReviews(): Promise<AdminForceMajeureReview[]>;
  readForceMajeureProof(debtId: string): Promise<Blob>;
  decideForceMajeure(debtId: string, approve: boolean): Promise<void>;
  listAccountDebts(cursor?: string): Promise<AdminPage<AdminAccountDebt>>;
  waiveAccountDebt(debtId: string): Promise<void>;
}

=== src/domain/payment/types/adminFinance.ts — ARQUIVO NOVO, conteúdo completo ===
import type { AccountDebtView } from './receivables';
import type { BuyerSaleClaim } from './saleClaims';

/** Quem vende por um CNPJ; o documento vem mascarado do backend. */
export interface SellerSummary {
  sellerName: string | null;
  maskedDocument: string | null;
}

export interface AdminSaleClaim extends BuyerSaleClaim, SellerSummary {
  buyerUid: string;
  details?: string;
  title?: string;
  serviceEndsAt?: string;
  grossMinor: number;
  refundableMinor: number;
  /** Teto do reembolso parcial; a taxa de serviço só volta no integral. */
  maxPartialRefundMinor: number;
}

export type SaleClaimOutcome = 'release' | 'refund_full' | 'refund_partial';

export interface SaleClaimDecisionInput {
  outcome: SaleClaimOutcome;
  amountMinor?: number;
  chargePenalty?: boolean;
}

export interface AdminForceMajeureReview extends AccountDebtView, SellerSummary {
  forceMajeureReason: string;
  declaredAt: string;
}

export type AdminAccountDebt = AccountDebtView & SellerSummary;

export interface AdminPage<T> {
  data: T[];
  nextCursor: string | null;
}

=== src/domain/payment/utils/adminFinanceErrors.ts — ARQUIVO NOVO, conteúdo completo ===
const KNOWN_ERRORS = [
  'NOT_FOUND',
  'FORBIDDEN',
  'CLAIM_ALREADY_DECIDED',
  'CLAIM_REFUND_FAILED',
  'INVALID_REFUND_AMOUNT',
  'PENALTY_NOT_ALLOWED',
  'FORCE_MAJEURE_NOT_PENDING',
  'DEBT_ALREADY_SETTLED',
];

/** Erros chegam pelo `code` da API (AGENTS.md §12.5); o texto vem das traduções. */
export function adminFinanceErrorKey(code: string): string {
  return `adminFinance.errors.${KNOWN_ERRORS.includes(code) ? code : 'UNAVAILABLE'}`;
}

export function errorCodeOf(error: unknown): string {
  return error instanceof Error ? error.message : 'UNAVAILABLE';
}

=== src/shared/i18n/adminFinanceResources.ts — ARQUIVO NOVO, conteúdo completo ===
/** Textos das filas financeiras do admin (D16). pt-BR é a fonte. */
export interface AdminFinanceTranslation {
  title: string;
  tabsLabel: string;
  tabs: {
    claims: string;
    forceMajeure: string;
    debts: string;
  };
  loading: string;
  loadMore: string;
  sending: string;
  unknownSeller: string;
  claims: {
    hint: string;
    empty: string;
    open: string;
    refundPending: string;
    refundPendingHint: string;
    fallbackTitle: {
      ticket_order: string;
      booking: string;
    };
    paid: string;
    refundable: string;
    serviceEnd: string;
    openedAt: string;
    decideBy: string;
    decide: string;
    decideTitle: string;
    decideDescription: string;
    outcomeLabel: string;
    outcomeRequired: string;
    outcome: {
      release: string;
      refund_full: string;
      refund_partial: string;
    };
    outcomeHint: {
      release: string;
      refund_full: string;
      refund_partial: string;
    };
    partialLabel: string;
    partialInvalid: string;
    penaltyLabel: string;
    penaltyHint: string;
    submit: string;
    decided: {
      release: string;
      refund_full: string;
      refund_partial: string;
    };
  };
  forceMajeure: {
    hint: string;
    empty: string;
    declaredAt: string;
    openProof: string;
    approve: string;
    reject: string;
    approveConfirm: string;
    rejectConfirm: string;
    approved: string;
    rejected: string;
  };
  debts: {
    hint: string;
    empty: string;
    dueOn: string;
    overdueSince: string;
    waive: string;
    waiveConfirm: string;
    waived: string;
  };
  errors: {
    NOT_FOUND: string;
    FORBIDDEN: string;
    CLAIM_ALREADY_DECIDED: string;
    CLAIM_REFUND_FAILED: string;
    INVALID_REFUND_AMOUNT: string;
    PENALTY_NOT_ALLOWED: string;
    FORCE_MAJEURE_NOT_PENDING: string;
    DEBT_ALREADY_SETTLED: string;
    UNAVAILABLE: string;
  };
}

export const adminFinancePtBR: AdminFinanceTranslation = {
  title: 'Financeiro',
  tabsLabel: 'Filas financeiras',
  tabs: {
    claims: 'Reclamações',
    forceMajeure: 'Força maior',
    debts: 'Dívidas',
  },
  loading: 'Carregando…',
  loadMore: 'Carregar mais',
  sending: 'Enviando…',
  unknownSeller: 'Vendedor não identificado',
  claims: {
    hint: 'Compras com problema relatado pelo comprador. O repasse fica retido até a decisão; sem decisão no prazo, é liberado.',
    empty: 'Nenhuma reclamação para decidir.',
    open: 'Para decidir',
    refundPending: 'Reembolso em andamento',
    refundPendingHint: 'O meio de pagamento ainda está processando o reembolso.',
    fallbackTitle: {
      ticket_order: 'Pedido de ingresso',
      booking: 'Reserva',
    },
    paid: 'Pago pelo comprador',
    refundable: 'Ainda pode voltar',
    serviceEnd: 'Fim do serviço',
    openedAt: 'Relatado em',
    decideBy: 'Decidir até {{date}}',
    decide: 'Decidir',
    decideTitle: 'Decidir reclamação',
    decideDescription:
      'A decisão é final. O reembolso sai do saldo da plataforma antes do repasse.',
    outcomeLabel: 'Decisão',
    outcomeRequired: 'Escolha a decisão.',
    outcome: {
      release: 'Liberar o repasse',
      refund_full: 'Reembolso integral ({{amount}})',
      refund_partial: 'Reembolso parcial',
    },
    outcomeHint: {
      release: 'O problema não procede. O parceiro recebe normalmente.',
      refund_full: 'Devolve tudo o que resta, inclusive a taxa de serviço.',
      refund_partial: 'Até {{max}}, sem a taxa de serviço. Sai do valor do parceiro.',
    },
    partialLabel: 'Valor do reembolso',
    partialInvalid: 'Informe um valor de até {{max}}.',
    penaltyLabel: 'Cobrar multa de 20% do parceiro',
    penaltyHint:
      'O serviço não aconteceu: vale como cancelamento pelo proprietário, com 24 h para pagar.',
    submit: 'Confirmar decisão',
    decided: {
      release: 'Repasse liberado.',
      refund_full: 'Reembolso integral pedido ao meio de pagamento.',
      refund_partial: 'Reembolso parcial pedido ao meio de pagamento.',
    },
  },
  forceMajeure: {
    hint: 'Multas de cancelamento com força maior declarada. Enquanto em análise, a multa fica suspensa.',
    empty: 'Nenhuma declaração para analisar.',
    declaredAt: 'Declarada em {{date}}',
    openProof: 'Abrir comprovante',
    approve: 'Aprovar',
    reject: 'Recusar',
    approveConfirm: 'Aprovar a força maior? A multa é perdoada.',
    rejectConfirm: 'Recusar a força maior? A multa volta a valer, com 24 h para pagar.',
    approved: 'Força maior aprovada. Multa perdoada.',
    rejected: 'Força maior recusada. A multa volta a valer.',
  },
  debts: {
    hint: 'Dívidas em aberto dos CNPJs. Vencida, a dívida pausa as vendas do CNPJ e é descontada dos repasses.',
    empty: 'Nenhuma dívida em aberto.',
    dueOn: 'Vence em {{date}}',
    overdueSince: 'Vencida desde {{date}}. Vendas do CNPJ pausadas.',
    waive: 'Perdoar dívida',
    waiveConfirm:
      'Perdoar {{amount}}? A dívida deixa de ser cobrada e as vendas do CNPJ voltam se não houver outra vencida.',
    waived: 'Dívida perdoada.',
  },
  errors: {
    NOT_FOUND: 'Registro não encontrado. Atualize a lista.',
    FORBIDDEN: 'Acesso restrito ao admin.',
    CLAIM_ALREADY_DECIDED: 'Esta reclamação já foi decidida.',
    CLAIM_REFUND_FAILED: 'O meio de pagamento recusou o reembolso. Tente de novo.',
    INVALID_REFUND_AMOUNT: 'Valor fora do que ainda pode voltar ao comprador.',
    PENALTY_NOT_ALLOWED: 'A multa vale só para serviço que não aconteceu, com reembolso integral.',
    FORCE_MAJEURE_NOT_PENDING: 'Esta declaração já foi analisada.',
    DEBT_ALREADY_SETTLED: 'Esta dívida já foi quitada.',
    UNAVAILABLE: 'Não foi possível concluir agora. Tente de novo.',
  },
};

export const adminFinanceEn: AdminFinanceTranslation = {
  title: 'Finance',
  tabsLabel: 'Finance queues',
  tabs: {
    claims: 'Claims',
    forceMajeure: 'Force majeure',
    debts: 'Debts',
  },
  loading: 'Loading…',
  loadMore: 'Load more',
  sending: 'Sending…',
  unknownSeller: 'Seller not identified',
  claims: {
    hint: 'Purchases with a problem reported by the buyer. The payout is held until the decision; with no decision in time, it is released.',
    empty: 'No claims to decide.',
    open: 'To decide',
    refundPending: 'Refund in progress',
    refundPendingHint: 'The payment method is still processing the refund.',
    fallbackTitle: {
      ticket_order: 'Ticket order',
      booking: 'Booking',
    },
    paid: 'Paid by the buyer',
    refundable: 'Still refundable',
    serviceEnd: 'Service end',
    openedAt: 'Reported on',
    decideBy: 'Decide by {{date}}',
    decide: 'Decide',
    decideTitle: 'Decide claim',
    decideDescription:
      'The decision is final. The refund comes from the platform balance before the payout.',
    outcomeLabel: 'Decision',
    outcomeRequired: 'Choose the decision.',
    outcome: {
      release: 'Release the payout',
      refund_full: 'Full refund ({{amount}})',
      refund_partial: 'Partial refund',
    },
    outcomeHint: {
      release: 'The problem is not upheld. The partner is paid as usual.',
      refund_full: 'Returns everything left, service fee included.',
      refund_partial: 'Up to {{max}}, without the service fee. Comes from the partner’s amount.',
    },
    partialLabel: 'Refund amount',
    partialInvalid: 'Enter an amount up to {{max}}.',
    penaltyLabel: 'Charge the partner a 20% penalty',
    penaltyHint:
      'The service didn’t happen: it counts as a cancellation by the owner, with 24 h to pay.',
    submit: 'Confirm decision',
    decided: {
      release: 'Payout released.',
      refund_full: 'Full refund requested from the payment method.',
      refund_partial: 'Partial refund requested from the payment method.',
    },
  },
  forceMajeure: {
    hint: 'Cancellation penalties with declared force majeure. While under review, the penalty is suspended.',
    empty: 'No declarations to review.',
    declaredAt: 'Declared on {{date}}',
    openProof: 'Open proof',
    approve: 'Approve',
    reject: 'Reject',
    approveConfirm: 'Approve the force majeure? The penalty is waived.',
    rejectConfirm: 'Reject the force majeure? The penalty applies again, with 24 h to pay.',
    approved: 'Force majeure approved. Penalty waived.',
    rejected: 'Force majeure rejected. The penalty applies again.',
  },
  debts: {
    hint: 'Open debts of each CNPJ. Once overdue, the debt pauses the CNPJ’s sales and is deducted from payouts.',
    empty: 'No open debts.',
    dueOn: 'Due on {{date}}',
    overdueSince: 'Overdue since {{date}}. The CNPJ’s sales are paused.',
    waive: 'Waive debt',
    waiveConfirm:
      'Waive {{amount}}? The debt is no longer charged and the CNPJ’s sales resume if no other is overdue.',
    waived: 'Debt waived.',
  },
  errors: {
    NOT_FOUND: 'Record not found. Refresh the list.',
    FORBIDDEN: 'Admin access only.',
    CLAIM_ALREADY_DECIDED: 'This claim was already decided.',
    CLAIM_REFUND_FAILED: 'The payment method declined the refund. Try again.',
    INVALID_REFUND_AMOUNT: 'Amount outside what can still go back to the buyer.',
    PENALTY_NOT_ALLOWED:
      'The penalty only applies to a service that didn’t happen, with a full refund.',
    FORCE_MAJEURE_NOT_PENDING: 'This declaration was already reviewed.',
    DEBT_ALREADY_SETTLED: 'This debt is already settled.',
    UNAVAILABLE: 'Couldn’t finish now. Try again.',
  },
};

export const adminFinanceFr: AdminFinanceTranslation = {
  title: 'Finances',
  tabsLabel: 'Files financières',
  tabs: {
    claims: 'Réclamations',
    forceMajeure: 'Force majeure',
    debts: 'Dettes',
  },
  loading: 'Chargement…',
  loadMore: 'Charger plus',
  sending: 'Envoi…',
  unknownSeller: 'Vendeur non identifié',
  claims: {
    hint: 'Achats avec un problème signalé par l’acheteur. Le versement est retenu jusqu’à la décision ; sans décision dans le délai, il est libéré.',
    empty: 'Aucune réclamation à traiter.',
    open: 'À traiter',
    refundPending: 'Remboursement en cours',
    refundPendingHint: 'Le moyen de paiement traite encore le remboursement.',
    fallbackTitle: {
      ticket_order: 'Commande de billets',
      booking: 'Réservation',
    },
    paid: 'Payé par l’acheteur',
    refundable: 'Encore remboursable',
    serviceEnd: 'Fin du service',
    openedAt: 'Signalé le',
    decideBy: 'Décider avant le {{date}}',
    decide: 'Décider',
    decideTitle: 'Traiter la réclamation',
    decideDescription:
      'La décision est définitive. Le remboursement est prélevé sur le solde de la plateforme avant le versement.',
    outcomeLabel: 'Décision',
    outcomeRequired: 'Choisissez la décision.',
    outcome: {
      release: 'Libérer le versement',
      refund_full: 'Remboursement intégral ({{amount}})',
      refund_partial: 'Remboursement partiel',
    },
    outcomeHint: {
      release: 'Le problème n’est pas retenu. Le partenaire est payé normalement.',
      refund_full: 'Rembourse tout ce qui reste, frais de service compris.',
      refund_partial:
        'Jusqu’à {{max}}, sans les frais de service. Prélevé sur le montant du partenaire.',
    },
    partialLabel: 'Montant du remboursement',
    partialInvalid: 'Indiquez un montant jusqu’à {{max}}.',
    penaltyLabel: 'Facturer une pénalité de 20 % au partenaire',
    penaltyHint:
      'Le service n’a pas eu lieu : cela compte comme une annulation par le propriétaire, avec 24 h pour payer.',
    submit: 'Confirmer la décision',
    decided: {
      release: 'Versement libéré.',
      refund_full: 'Remboursement intégral demandé au moyen de paiement.',
      refund_partial: 'Remboursement partiel demandé au moyen de paiement.',
    },
  },
  forceMajeure: {
    hint: 'Pénalités d’annulation avec force majeure déclarée. Pendant l’examen, la pénalité est suspendue.',
    empty: 'Aucune déclaration à examiner.',
    declaredAt: 'Déclarée le {{date}}',
    openProof: 'Ouvrir le justificatif',
    approve: 'Approuver',
    reject: 'Refuser',
    approveConfirm: 'Approuver la force majeure ? La pénalité est annulée.',
    rejectConfirm:
      'Refuser la force majeure ? La pénalité s’applique à nouveau, avec 24 h pour payer.',
    approved: 'Force majeure approuvée. Pénalité annulée.',
    rejected: 'Force majeure refusée. La pénalité s’applique à nouveau.',
  },
  debts: {
    hint: 'Dettes ouvertes des CNPJ. Échue, la dette suspend les ventes du CNPJ et est déduite des versements.',
    empty: 'Aucune dette ouverte.',
    dueOn: 'Échéance le {{date}}',
    overdueSince: 'Échue depuis le {{date}}. Ventes du CNPJ suspendues.',
    waive: 'Annuler la dette',
    waiveConfirm:
      'Annuler {{amount}} ? La dette n’est plus réclamée et les ventes du CNPJ reprennent s’il n’y en a pas d’autre échue.',
    waived: 'Dette annulée.',
  },
  errors: {
    NOT_FOUND: 'Enregistrement introuvable. Actualisez la liste.',
    FORBIDDEN: 'Accès réservé à l’admin.',
    CLAIM_ALREADY_DECIDED: 'Cette réclamation a déjà été traitée.',
    CLAIM_REFUND_FAILED: 'Le moyen de paiement a refusé le remboursement. Réessayez.',
    INVALID_REFUND_AMOUNT: 'Montant hors de ce qui peut encore revenir à l’acheteur.',
    PENALTY_NOT_ALLOWED:
      'La pénalité ne s’applique qu’à un service qui n’a pas eu lieu, avec remboursement intégral.',
    FORCE_MAJEURE_NOT_PENDING: 'Cette déclaration a déjà été examinée.',
    DEBT_ALREADY_SETTLED: 'Cette dette est déjà réglée.',
    UNAVAILABLE: 'Impossible de terminer maintenant. Réessayez.',
  },
};

=== src/shared/i18n/resources.ts — diff ===
@@ -28,6 +28,12 @@ import {
   receivablesFr,
   receivablesPtBR,
 } from './receivablesResources';
+import {
+  type AdminFinanceTranslation,
+  adminFinanceEn,
+  adminFinanceFr,
+  adminFinancePtBR,
+} from './adminFinanceResources';
 import {
   saleClaimsEn,
   saleClaimsFr,
@@ -80,6 +86,7 @@ export interface TranslationResource {
   paymentAccounts: PaymentAccountsTranslation;
   receivables: ReceivablesTranslation;
   saleClaims: SaleClaimsTranslation;
+  adminFinance: AdminFinanceTranslation;
   ticketSessions: TicketSessionsTranslation;
   salesPolicy: SalesPolicyTranslation;
   ticketCheckout: TicketCheckoutTranslation;
@@ -309,6 +316,7 @@ const ptBR: TranslationResource = {
   paymentAccounts: paymentAccountsPtBR,
   receivables: receivablesPtBR,
   saleClaims: saleClaimsPtBR,
+  adminFinance: adminFinancePtBR,
   ticketSessions: ticketSessionsPtBR,
   salesPolicy: salesPolicyPtBR,
   ticketCheckout: ticketCheckoutPtBR,
@@ -589,6 +597,7 @@ const en: TranslationResource = {
   paymentAccounts: paymentAccountsEn,
   receivables: receivablesEn,
   saleClaims: saleClaimsEn,
+  adminFinance: adminFinanceEn,
   ticketSessions: ticketSessionsEn,
   salesPolicy: salesPolicyEn,
   ticketCheckout: ticketCheckoutEn,
@@ -863,6 +872,7 @@ const fr: TranslationResource = {
   paymentAccounts: paymentAccountsFr,
   receivables: receivablesFr,
   saleClaims: saleClaimsFr,
+  adminFinance: adminFinanceFr,
   ticketSessions: ticketSessionsFr,
   salesPolicy: salesPolicyFr,
   ticketCheckout: ticketCheckoutFr,

VERIFICAÇÃO (obrigatória):
- `npm run typecheck`, `npx biome lint .` (0 erros; arquivos tocados sem avisos), `npm run build`;
- testes ligados aos arquivos deste prompt: `npx vitest related --run server/application/usecases/paymentAccounts/adminFinanceQueues.test.ts server/application/usecases/paymentAccounts/describeSellerAccountsApplicationUseCase.ts server/application/usecases/paymentAccounts/listAdminAccountDebtsApplicationUseCase.ts server/application/usecases/paymentAccounts/listAdminForceMajeureReviewsApplicationUseCase.ts server/application/usecases/paymentAccounts/sellerAccountSummary.ts server/application/usecases/payouts/listAdminSaleClaimsApplicationUseCase.ts server/domain/payment/adapters/firestoreAccountDebtAdapter.ts server/domain/payment/adapters/inMemoryAccountDebtAdapter.ts server/domain/payment/index.ts server/domain/payment/ports/accountDebtRepositoryPort.ts server/domain/payment/services/debtService.test.ts server/domain/payment/services/debtService.ts server/domain/payment/services/paymentAccountService.ts server/domain/payment/services/saleClaimService.test.ts server/domain/payment/services/saleClaimService.ts server/domain/payment/types/saleClaim.ts server/domain/payment/usecases/getPaymentAccountOwnersUseCase.ts server/domain/payment/usecases/listOpenAccountDebtsForAdminUseCase.ts server/interfaces/http/paymentAccounts/adminAccountDebtController.test.ts server/interfaces/http/paymentAccounts/adminAccountDebtController.ts server/interfaces/http/paymentAccounts/forceMajeureController.ts server/interfaces/http/paymentAccounts/paymentAccountController.ts server/interfaces/http/paymentAccounts/paymentAccountDebtController.test.ts server/interfaces/http/paymentAccounts/paymentAccountRoutes.ts server/interfaces/http/paymentAccounts/schemas/paymentAccountSchemas.ts server/interfaces/http/saleClaims/saleClaimController.test.ts server/interfaces/http/saleClaims/saleClaimController.ts src/app/compositions/AdminPanelComposition.tsx src/domain/admin/components/AdminPanel.tsx src/domain/admin/components/subcomponents/AdminAccessDenied.tsx src/domain/admin/components/subcomponents/AdminNavigation.tsx src/domain/payment/api/apiAdminFinanceAdapter.ts src/domain/payment/application/usecases/decideForceMajeureUseCase.ts src/domain/payment/application/usecases/decideSaleClaimUseCase.ts src/domain/payment/application/usecases/listAdminAccountDebtsUseCase.ts src/domain/payment/application/usecases/listAdminSaleClaimsUseCase.ts src/domain/payment/application/usecases/listForceMajeureReviewsUseCase.ts src/domain/payment/application/usecases/readForceMajeureProofUseCase.ts src/domain/payment/application/usecases/waiveAccountDebtUseCase.ts src/domain/payment/components/admin/AdminDebtCard.tsx src/domain/payment/components/admin/AdminDebtQueue.tsx src/domain/payment/components/admin/AdminFinanceQueues.tsx src/domain/payment/components/admin/AdminQueueFrame.tsx src/domain/payment/components/admin/ForceMajeureQueue.tsx src/domain/payment/components/admin/ForceMajeureReviewCard.tsx src/domain/payment/components/admin/SaleClaimDecisionDialog.tsx src/domain/payment/components/admin/SaleClaimQueue.tsx src/domain/payment/components/admin/SaleClaimQueueCard.tsx src/domain/payment/components/admin/SellerLine.tsx src/domain/payment/components/admin/adminFinance.test.tsx src/domain/payment/components/admin/adminFinanceStyles.ts src/domain/payment/factory.ts src/domain/payment/hooks/useAdminFinanceQueue.ts src/domain/payment/index.ts src/domain/payment/ports/adminFinanceApiPort.ts src/domain/payment/types/adminFinance.ts src/domain/payment/utils/adminFinanceErrors.ts src/shared/i18n/adminFinanceResources.ts src/shared/i18n/resources.ts` (todos verdes). Não precisa rodar a suíte inteira.
- entre no painel admin nos temas claro e escuro e abra a aba Financeiro: as três filas, o diálogo de decisão e as confirmações.

LIMPEZA (obrigatória, ao terminar de implementar): apague todos os arquivos de public/assets/aistudio/, inclusive o deste prompt. São cópias dos textos colados no chat, salvas automaticamente pelo AI Studio, e public/ vai para o site publicado. Se a pasta ficar vazia, apague a pasta também.
~~~~

### Configurações manuais (você faz, fora do AI Studio, depois de aplicar este prompt)

Nenhuma.
