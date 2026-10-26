# Prompt 18.4e.1 — Extrato e dívidas em Recebimentos (D14, D16)

> Lote 17, gerado do commit de referência `7c2dbc8` da branch `claude/agents-md-v2`. Aplique depois do 18.4d.3b. Cole o bloco abaixo no agente do AI Studio, inteiro, de uma vez.

---

## Prompt 18.4e.1 — Extrato e dívidas em Recebimentos (D14, D16)

Primeira parte das telas do parceiro (18.4e). Telas conferidas por prints e aprovadas em 2026-10-26.

~~~~text
Siga o AGENTS.md. NÃO altere o AGENTS.md. O app ainda não foi liberado para usuários: nenhum código de compatibilidade ou transição (§2.2 item 8).

IMPORTANTE: aplique os diffs abaixo EXATAMENTE, inclusive os arquivos novos. Não reescreva os arquivos do seu jeito. Arquivo tocado sai sem avisos do lint e formatado (AGENTS.md §13). Telas nos dois temas, com folha inferior no celular (§11.1, §11.11), e textos nos 3 idiomas (§12). Nenhuma dependência nova.

O QUE MUDA:
1) Backend: GET /api/payment-accounts/payouts?accountKey=&limit=&cursor= devolve o extrato por venda dos CNPJs do parceiro logado (CNPJ de outra pessoa responde 404), por allowlist, sem IDs do Stripe, paginado por cursor. Cada linha traz venda, taxa de serviço paga pelo comprador, reembolsos, taxa da plataforma, valor do proprietário, desconto por dívidas, status, retenções e datas. O repasse passa a guardar o nome do evento ou da oferta (title) no webhook de pagamento. Índice novo: payoutEntries (accountKey, createdAt desc).
2) Recebimentos (PartnerStripeConnectPortal): abas Contas | Extrato | Dívidas, com contador de dívidas em aberto e aviso de vendas pausadas quando há dívida vencida.
3) Extrato: filtro por CNPJ, status (aguardando liberação, retido por reclamação ou contestação, repassado, reembolsado, contestação perdida), valores e data prevista ou do repasse, Carregar mais.
4) Dívidas: motivo, CNPJ, valor, quanto falta, vencimento e status; Pagar (folha com o Payment Element do Stripe, cartão ou Pix; return_url kind=debt com página própria em /checkout/result) e Declarar força maior (motivo de 10 a 500 caracteres e prova PDF ou foto, enviada por POST /api/media/verification-files para a pasta privada do parceiro).
5) O Payment Element passa a seguir o tema claro ou escuro do app (novo useResolvedTheme em ThemeContext, que não exige o provider).
6) Textos novos no namespace receivables (src/shared/i18n/receivablesResources.ts) e em pages (debtPaymentTitle, debtPaymentDescription).

ARQUIVOS (crie, altere ou apague exatamente estes):
- firestore.indexes.json (alterar)
- server/application/usecases/bookings/reconcileBookingWebhookApplicationUseCase.test.ts (alterar)
- server/application/usecases/bookings/reconcileBookingWebhookApplicationUseCase.ts (alterar)
- server/application/usecases/paymentAccounts/listPartnerPayoutsApplicationUseCase.ts (criar)
- server/application/usecases/paymentAccounts/paymentAccountApplicationUseCases.test.ts (alterar)
- server/application/usecases/payouts/recordPaidSalePayoutApplicationUseCase.ts (alterar)
- server/application/usecases/reconcileStripeWebhookEventApplicationUseCase.ts (alterar)
- server/application/usecases/ticketingPaymentOrchestration.test.ts (alterar)
- server/domain/payment/adapters/firestorePayoutEntryAdapter.ts (alterar)
- server/domain/payment/adapters/inMemoryPayoutEntryAdapter.ts (criar)
- server/domain/payment/index.ts (alterar)
- server/domain/payment/ports/payoutEntryRepositoryPort.ts (alterar)
- server/domain/payment/services/payoutService.test.ts (alterar)
- server/domain/payment/services/payoutService.ts (alterar)
- server/domain/payment/services/saleClaimService.test.ts (alterar)
- server/domain/payment/types/payoutEntry.ts (alterar)
- server/domain/payment/usecases/listPayoutEntriesUseCase.ts (criar)
- server/interfaces/http/paymentAccounts/paymentAccountController.ts (alterar)
- server/interfaces/http/paymentAccounts/paymentAccountRoutes.ts (alterar)
- server/interfaces/http/paymentAccounts/schemas/paymentAccountSchemas.ts (alterar)
- src/app/compositions/CheckoutResultComposition.tsx (alterar)
- src/domain/payment/adapters/ui/StripePaymentElement.tsx (alterar)
- src/domain/payment/api/apiReceivablesAdapter.ts (criar)
- src/domain/payment/application/usecases/declareForceMajeureUseCase.ts (criar)
- src/domain/payment/application/usecases/listDebtsUseCase.ts (criar)
- src/domain/payment/application/usecases/listPayoutsUseCase.ts (criar)
- src/domain/payment/application/usecases/startDebtPaymentUseCase.ts (criar)
- src/domain/payment/components/PartnerStripeConnectPortal.test.tsx (alterar)
- src/domain/payment/components/PartnerStripeConnectPortal.tsx (alterar)
- src/domain/payment/components/receivables/DebtCard.tsx (criar)
- src/domain/payment/components/receivables/DebtList.tsx (criar)
- src/domain/payment/components/receivables/DebtPaymentDialog.tsx (criar)
- src/domain/payment/components/receivables/ForceMajeureDialog.tsx (criar)
- src/domain/payment/components/receivables/PayoutEntryRow.tsx (criar)
- src/domain/payment/components/receivables/PayoutStatement.tsx (criar)
- src/domain/payment/components/receivables/ReceivablesState.tsx (criar)
- src/domain/payment/components/receivables/ReceivablesTabs.tsx (criar)
- src/domain/payment/components/receivables/debtStatus.ts (criar)
- src/domain/payment/components/receivables/payoutStatus.ts (criar)
- src/domain/payment/components/receivables/receivables.test.tsx (criar)
- src/domain/payment/factory.ts (alterar)
- src/domain/payment/hooks/usePartnerDebts.ts (criar)
- src/domain/payment/hooks/usePartnerPayouts.ts (criar)
- src/domain/payment/ports/receivablesApiPort.ts (criar)
- src/domain/payment/types/receivables.ts (criar)
- src/domain/payment/utils/receivablesFormat.ts (criar)
- src/shared/context/ThemeContext.tsx (alterar)
- src/shared/i18n/receivablesResources.ts (criar)
- src/shared/i18n/resources.ts (alterar)

Aplique as mudanças abaixo EXATAMENTE como estão (formato unified diff: linhas com "-" saem, linhas com "+" entram; as demais são contexto para localizar o trecho). Não reformate outros trechos dos arquivos.

=== firestore.indexes.json — diff ===
@@ -401,6 +401,20 @@
           "order": "ASCENDING"
         }
       ]
+    },
+    {
+      "collectionGroup": "payoutEntries",
+      "queryScope": "COLLECTION",
+      "fields": [
+        {
+          "fieldPath": "accountKey",
+          "order": "ASCENDING"
+        },
+        {
+          "fieldPath": "createdAt",
+          "order": "DESCENDING"
+        }
+      ]
     }
   ],
   "fieldOverrides": [

=== server/application/usecases/bookings/reconcileBookingWebhookApplicationUseCase.test.ts — diff ===
@@ -76,6 +76,7 @@ describe('reconcileBookingWebhookApplicationUseCase', () => {
       serviceFeeMinor: 0,
       platformFeeMinor: 4500,
       serviceEndsAt: '2026-11-10T16:00:00.000Z',
+      title: 'Passeio',
     });
     expect(createNotificationUseCase).toHaveBeenCalledWith(
       expect.objectContaining({ recipientPartnerId: 'p1' })

=== server/application/usecases/bookings/reconcileBookingWebhookApplicationUseCase.ts — diff ===
@@ -38,6 +38,7 @@ async function handlePaymentSucceeded(
       grossMinor: booking.totalMinor,
       serviceFeeMinor: 0,
       platformFeeMinor: booking.platformFeeMinor,
+      title: booking.offerSnapshot.title,
       serviceEndsAt: serviceEndsAt(
         booking.offerSnapshot.startsAt,
         booking.offerSnapshot.durationMinutes

=== server/application/usecases/paymentAccounts/listPartnerPayoutsApplicationUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { listOwnerSalesDocumentsUseCase } from '../../../domain/partners';
import {
  listPayoutEntriesUseCase,
  PaymentDomainError,
  type PayoutEntryView,
} from '../../../domain/payment';

/** Extrato por venda dos CNPJs do parceiro (D14); filtrar por um CNPJ de outra pessoa responde 404. */
export async function listPartnerPayoutsApplicationUseCase(
  ownerUid: string,
  query: { accountKey?: string; limit: number; cursor?: string }
): Promise<{ data: PayoutEntryView[]; nextCursor: string | null }> {
  const keys = (await listOwnerSalesDocumentsUseCase(ownerUid)).map(
    (document) => document.accountKey
  );
  if (query.accountKey && !keys.includes(query.accountKey)) {
    throw new PaymentDomainError('NOT_FOUND', 'Conta de recebimento não encontrada.', 404);
  }
  return listPayoutEntriesUseCase(
    query.accountKey ? [query.accountKey] : keys,
    query.limit,
    query.cursor
  );
}

=== server/application/usecases/paymentAccounts/paymentAccountApplicationUseCases.test.ts — diff ===
@@ -5,7 +5,10 @@ vi.mock('../../../domain/partners', () => ({
   getOwnerSalesDocumentUseCase: vi.fn(),
   assertPartnerTermsAcceptedUseCase: vi.fn(),
 }));
-vi.mock('../../../domain/payment', () => ({
+vi.mock('../../../domain/payment', async () => ({
+  PaymentDomainError: (await import('../../../domain/payment/services/stripePaymentService'))
+    .PaymentDomainError,
+  listPayoutEntriesUseCase: vi.fn().mockResolvedValue({ data: [], nextCursor: null }),
   listOwnerPaymentAccountsUseCase: vi.fn(),
   createPaymentAccountSessionUseCase: vi.fn(),
   listAccountDebtsUseCase: vi.fn().mockResolvedValue([]),
@@ -21,8 +24,10 @@ import {
   createPaymentAccountSessionUseCase,
   listAccountDebtsUseCase,
   listOwnerPaymentAccountsUseCase,
+  listPayoutEntriesUseCase,
   startAccountDebtPaymentUseCase,
 } from '../../../domain/payment';
+import { listPartnerPayoutsApplicationUseCase } from './listPartnerPayoutsApplicationUseCase';
 import { listPartnerDebtsApplicationUseCase } from './listPartnerDebtsApplicationUseCase';
 import { startPartnerDebtPaymentApplicationUseCase } from './startPartnerDebtPaymentApplicationUseCase';
 import { listPartnerPaymentAccountsApplicationUseCase } from './listPartnerPaymentAccountsApplicationUseCase';
@@ -113,3 +118,25 @@ describe('dívidas do parceiro (D16)', () => {
     expect(startAccountDebtPaymentUseCase).toHaveBeenCalledWith('debt_x', ['key-1']);
   });
 });
+
+describe('extrato do parceiro (D14)', () => {
+  beforeEach(() => vi.clearAllMocks());
+
+  it('todos os CNPJs do parceiro, ou um só; CNPJ de outra pessoa responde 404', async () => {
+    vi.mocked(listOwnerSalesDocumentsUseCase).mockResolvedValue([
+      { accountKey: 'key-1', maskedDocument: '', itemIds: [] },
+      { accountKey: 'key-2', maskedDocument: '', itemIds: [] },
+    ]);
+    await listPartnerPayoutsApplicationUseCase('owner-1', { limit: 30 });
+    expect(listPayoutEntriesUseCase).toHaveBeenLastCalledWith(['key-1', 'key-2'], 30, undefined);
+    await listPartnerPayoutsApplicationUseCase('owner-1', {
+      accountKey: 'key-2',
+      limit: 10,
+      cursor: 'c',
+    });
+    expect(listPayoutEntriesUseCase).toHaveBeenLastCalledWith(['key-2'], 10, 'c');
+    await expect(
+      listPartnerPayoutsApplicationUseCase('owner-1', { accountKey: 'key-9', limit: 10 })
+    ).rejects.toMatchObject({ code: 'NOT_FOUND', statusCode: 404 });
+  });
+});

=== server/application/usecases/payouts/recordPaidSalePayoutApplicationUseCase.ts — diff ===
@@ -7,6 +7,7 @@ export interface PaidSale {
   serviceFeeMinor: number;
   platformFeeMinor: number;
   serviceEndsAt: string;
+  title?: string;
 }
 
 /**

=== server/application/usecases/reconcileStripeWebhookEventApplicationUseCase.ts — diff ===
@@ -82,6 +82,7 @@ export async function reconcileStripeWebhookEventApplicationUseCase(
         serviceFeeMinor: order.serviceFeeMinor,
         platformFeeMinor: order.platformFeeMinor,
         serviceEndsAt: order.eventSnapshot?.endsAt || order.eventSnapshot?.startsAt || '',
+        title: order.eventSnapshot?.title,
       });
 
       const targetPartnerId = metadata.partnerId || metadata.sellerPartnerId;

=== server/application/usecases/ticketingPaymentOrchestration.test.ts — diff ===
@@ -192,6 +192,7 @@ describe('ticketingPaymentOrchestrationUseCases — repasse (D14)', () => {
       serviceFeeMinor: 600,
       platformFeeMinor: 1000,
       serviceEndsAt: '2026-12-21T03:00:00.000Z',
+      title: 'Show',
     });
   });

=== server/domain/payment/adapters/firestorePayoutEntryAdapter.ts — diff ===
@@ -21,6 +21,26 @@ export class FirestorePayoutEntryAdapter implements PayoutEntryRepositoryPort {
     return snapshot.exists ? (snapshot.data() as PayoutEntry) : null;
   }
 
+  async listByAccountKeys(
+    accountKeys: string[],
+    limit: number,
+    cursor?: string
+  ): Promise<PayoutEntry[]> {
+    if (accountKeys.length === 0) return [];
+    // `in` aceita até 30 valores; um parceiro tem bem menos CNPJs que isso.
+    let query = adminDb
+      .collection(ENTRIES)
+      .where('accountKey', 'in', accountKeys.slice(0, 30))
+      .orderBy('createdAt', 'desc')
+      .limit(limit);
+    if (cursor) {
+      const last = await adminDb.collection(ENTRIES).doc(cursor).get();
+      if (last.exists) query = query.startAfter(last);
+    }
+    const snapshot = await query.get();
+    return snapshot.docs.map((doc) => doc.data() as PayoutEntry);
+  }
+
   async getByPaymentIntentId(paymentIntentId: string): Promise<PayoutEntry | null> {
     const snapshot = await adminDb
       .collection(ENTRIES)

=== server/domain/payment/adapters/inMemoryPayoutEntryAdapter.ts — ARQUIVO NOVO, conteúdo completo ===
import type { PayoutEntryRepositoryPort } from '../ports/payoutEntryRepositoryPort';
import type { PayoutEntry } from '../types/payoutEntry';

/** Usado só por testes (AGENTS.md §2.2 item 7). */
export class InMemoryPayoutEntryAdapter implements PayoutEntryRepositoryPort {
  readonly rows = new Map<string, PayoutEntry>();

  async createIfAbsent(entry: PayoutEntry): Promise<PayoutEntry> {
    const existing = this.rows.get(entry.id);
    if (existing) return existing;
    this.rows.set(entry.id, entry);
    return entry;
  }

  async get(id: string): Promise<PayoutEntry | null> {
    return this.rows.get(id) ?? null;
  }

  async getByPaymentIntentId(paymentIntentId: string): Promise<PayoutEntry | null> {
    return (
      [...this.rows.values()].find((entry) => entry.paymentIntentId === paymentIntentId) ?? null
    );
  }

  async listDue(nowIso: string, limit: number): Promise<PayoutEntry[]> {
    return [...this.rows.values()]
      .filter((entry) => entry.status === 'pending' && entry.releaseAt <= nowIso)
      .sort((a, b) => a.releaseAt.localeCompare(b.releaseAt))
      .slice(0, limit);
  }

  async listByAccountKeys(
    accountKeys: string[],
    limit: number,
    cursor?: string
  ): Promise<PayoutEntry[]> {
    const entries = [...this.rows.values()]
      .filter((entry) => accountKeys.includes(entry.accountKey))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    const start = cursor ? entries.findIndex((entry) => entry.id === cursor) + 1 : 0;
    return entries.slice(start, start + limit);
  }

  async update(
    id: string,
    change: (current: PayoutEntry) => PayoutEntry | null
  ): Promise<PayoutEntry | null> {
    const current = this.rows.get(id);
    if (!current) return null;
    const next = change(current);
    if (next) this.rows.set(id, next);
    return next ?? current;
  }
}

=== server/domain/payment/index.ts — diff ===
@@ -19,6 +19,7 @@ export { applyPayoutRefundUseCase } from './usecases/applyPayoutRefundUseCase';
 export { holdPayoutForDisputeUseCase } from './usecases/holdPayoutForDisputeUseCase';
 export { closePayoutDisputeUseCase } from './usecases/closePayoutDisputeUseCase';
 export { reschedulePayoutUseCase } from './usecases/reschedulePayoutUseCase';
+export { listPayoutEntriesUseCase } from './usecases/listPayoutEntriesUseCase';
 export { releaseDuePayoutsUseCase } from './usecases/releaseDuePayoutsUseCase';
 export { getPayoutEntryForReferenceUseCase } from './usecases/getPayoutEntryForReferenceUseCase';
 export { createAccountDebtUseCase } from './usecases/createAccountDebtUseCase';
@@ -63,7 +64,7 @@ export type { PlanSubscriptionRecord } from './ports/planSubscriptionRepositoryP
 
 export type { ConnectedAccountStatus } from './ports/marketplaceAccountPort';
 export type { PaymentAccountView } from './types/paymentAccount';
-export type { PayoutEntry, PayoutEntryStatus } from './types/payoutEntry';
+export type { PayoutEntry, PayoutEntryStatus, PayoutEntryView } from './types/payoutEntry';
 export type { DisputeOutcome, RecordSaleInput, ReleaseSummary } from './services/payoutService';
 export type {
   AccountDebt,

=== server/domain/payment/ports/payoutEntryRepositoryPort.ts — diff ===
@@ -7,6 +7,8 @@ export interface PayoutEntryRepositoryPort {
   getByPaymentIntentId(paymentIntentId: string): Promise<PayoutEntry | null>;
   /** Entradas `pending` com `releaseAt` até `nowIso`, mais antigas primeiro. */
   listDue(nowIso: string, limit: number): Promise<PayoutEntry[]>;
+  /** Extrato dos CNPJs, mais recentes primeiro; `cursor` é o ID da última entrada da página. */
+  listByAccountKeys(accountKeys: string[], limit: number, cursor?: string): Promise<PayoutEntry[]>;
   /** Lê, aplica a mudança e grava na mesma transação; `null` deixa como está. */
   update(
     id: string,

=== server/domain/payment/services/payoutService.test.ts — diff ===
@@ -1,41 +1,9 @@
 import { describe, expect, it, vi } from 'vitest';
+import { InMemoryPayoutEntryAdapter } from '../adapters/inMemoryPayoutEntryAdapter';
 import { InMemoryAccountDebtAdapter } from '../adapters/inMemoryAccountDebtAdapter';
-import type { PayoutEntryRepositoryPort } from '../ports/payoutEntryRepositoryPort';
-import type { PayoutEntry } from '../types/payoutEntry';
 import { DebtService } from './debtService';
 import { PayoutService, type RecordSaleInput } from './payoutService';
 
-function memoryRepository(): PayoutEntryRepositoryPort & { rows: Map<string, PayoutEntry> } {
-  const rows = new Map<string, PayoutEntry>();
-  return {
-    rows,
-    async createIfAbsent(entry) {
-      const existing = rows.get(entry.id);
-      if (existing) return existing;
-      rows.set(entry.id, entry);
-      return entry;
-    },
-    async get(id) {
-      return rows.get(id) ?? null;
-    },
-    async getByPaymentIntentId(id) {
-      return [...rows.values()].find((entry) => entry.paymentIntentId === id) ?? null;
-    },
-    async listDue(nowIso, limit) {
-      return [...rows.values()]
-        .filter((entry) => entry.status === 'pending' && entry.releaseAt <= nowIso)
-        .slice(0, limit);
-    },
-    async update(id, change) {
-      const current = rows.get(id);
-      if (!current) return null;
-      const next = change(current);
-      if (next) rows.set(id, next);
-      return next ?? current;
-    },
-  };
-}
-
 const SALE: RecordSaleInput = {
   referenceType: 'ticket_order',
   referenceId: 'ord_1',
@@ -49,7 +17,7 @@ const SALE: RecordSaleInput = {
 };
 
 function setup(now = '2026-12-23T04:00:00.000Z', destination: string | null = 'acct_1') {
-  const repo = memoryRepository();
+  const repo = new InMemoryPayoutEntryAdapter();
   const transfers = { createTransfer: vi.fn().mockResolvedValue({ transferId: 'tr_1' }) };
   const accounts = { getPayoutDestination: vi.fn().mockResolvedValue(destination) };
   const clock = { value: new Date(now) };
@@ -205,4 +173,30 @@ describe('PayoutService (D14)', () => {
     });
     expect((await service.releaseDue()).released).toBe(0);
   });
+
+  it('extrato: só os CNPJs pedidos, mais recentes primeiro, sem IDs do Stripe', async () => {
+    const { service, clock } = setup('2026-12-01T00:00:00.000Z');
+    await service.recordSale({ ...SALE, title: 'Festival' });
+    clock.value = new Date('2026-12-02T00:00:00.000Z');
+    await service.recordSale({ ...SALE, referenceId: 'ord_2', paymentIntentId: 'pi_2' });
+    await service.recordSale({
+      ...SALE,
+      referenceId: 'ord_3',
+      paymentIntentId: 'pi_3',
+      accountKey: 'key-2',
+    });
+    const first = await service.listForAccounts(['key-1'], 1);
+    expect(first.data.map((entry) => entry.referenceId)).toEqual(['ord_2']);
+    expect(first.nextCursor).toBe('po_ticket_order_ord_2');
+    const second = await service.listForAccounts(['key-1'], 1, first.nextCursor ?? undefined);
+    expect(second.data[0]).toMatchObject({ referenceId: 'ord_1', title: 'Festival' });
+    expect(JSON.stringify(second.data)).not.toMatch(/pi_|ch_|chargeId|paymentIntentId/);
+    // 106,00 = 6,00 de taxa de serviço + 10,00 de taxa da plataforma + 90,00 do proprietário.
+    expect(second.data[0]).toMatchObject({
+      grossMinor: 10600,
+      serviceFeeMinor: 600,
+      platformFeeMinor: 1000,
+      partnerAmountMinor: 9000,
+    });
+  });
 });

=== server/domain/payment/services/payoutService.ts — diff ===
@@ -2,7 +2,7 @@ import type { PayoutEntryRepositoryPort } from '../ports/payoutEntryRepositoryPo
 import type { PayoutTransferPort } from '../ports/payoutTransferPort';
 import type { PayoutEntry } from '../types/payoutEntry';
 import type { DebtService } from './debtService';
-import type { PayoutHoldReason } from '../types/payoutEntry';
+import type { PayoutEntryView, PayoutHoldReason } from '../types/payoutEntry';
 import {
   computeReleaseAt,
   partnerAmountAfterRefunds,
@@ -20,6 +20,7 @@ export interface RecordSaleInput {
   serviceFeeMinor: number;
   platformFeeMinor: number;
   serviceEndsAt: string;
+  title?: string;
 }
 
 export interface ReleaseSummary {
@@ -37,6 +38,38 @@ export interface PayoutDestinationLookup {
   getPayoutDestination(accountKey: string): Promise<string | null>;
 }
 
+function toEntryView(entry: PayoutEntry): PayoutEntryView {
+  const refunds = Object.values(entry.refunds);
+  const refundedMinor = refunds.reduce((sum, refund) => sum + refund.amountMinor, 0);
+  const refundedServiceFee = refunds.reduce((sum, refund) => sum + refund.serviceFeeMinor, 0);
+  const serviceFeeMinor = Math.max(0, entry.serviceFeeMinor - refundedServiceFee);
+  // O que sobra depois da taxa de serviço, dos reembolsos e da parte do proprietário é a taxa da plataforma.
+  const platformFeeMinor = Math.max(
+    0,
+    entry.grossMinor - serviceFeeMinor - refundedMinor - entry.partnerAmountMinor
+  );
+  return {
+    id: entry.id,
+    referenceType: entry.referenceType,
+    referenceId: entry.referenceId,
+    title: entry.title ?? null,
+    accountKey: entry.accountKey,
+    grossMinor: entry.grossMinor,
+    serviceFeeMinor,
+    refundedMinor,
+    platformFeeMinor,
+    partnerAmountMinor: entry.partnerAmountMinor,
+    offsetMinor: entry.offsetMinor ?? 0,
+    status: entry.status,
+    holdReasons: entry.holdReasons ?? [],
+    serviceEndsAt: entry.serviceEndsAt,
+    releaseAt: entry.releaseAt,
+    releasedAt: entry.releasedAt ?? null,
+    canceledReason: entry.canceledReason ?? null,
+    createdAt: entry.createdAt,
+  };
+}
+
 function entryIdFor(referenceType: string, referenceId: string): string {
   return `po_${referenceType}_${referenceId}`;
 }
@@ -55,6 +88,20 @@ export class PayoutService {
     return this.entries.get(entryIdFor(referenceType, referenceId));
   }
 
+  /** Extrato do parceiro, paginado por cursor (AGENTS.md §6.4). */
+  async listForAccounts(
+    accountKeys: string[],
+    limit: number,
+    cursor?: string
+  ): Promise<{ data: PayoutEntryView[]; nextCursor: string | null }> {
+    const entries = await this.entries.listByAccountKeys(accountKeys, limit, cursor);
+    const last = entries[entries.length - 1];
+    return {
+      data: entries.map(toEntryView),
+      nextCursor: entries.length === limit && last ? last.id : null,
+    };
+  }
+
   /** Chamado pelo webhook de pagamento confirmado; repetir não cria outra entrada. */
   async recordSale(input: RecordSaleInput): Promise<PayoutEntry> {
     const nowIso = this.now().toISOString();
@@ -63,6 +110,7 @@ export class PayoutService {
       id: entryIdFor(input.referenceType, input.referenceId),
       referenceType: input.referenceType,
       referenceId: input.referenceId,
+      ...(input.title ? { title: input.title.slice(0, 160) } : {}),
       accountKey: input.accountKey,
       paymentIntentId: input.paymentIntentId,
       chargeId: input.chargeId,

=== server/domain/payment/services/saleClaimService.test.ts — diff ===
@@ -1,39 +1,9 @@
 import { describe, expect, it, vi } from 'vitest';
+import { InMemoryPayoutEntryAdapter } from '../adapters/inMemoryPayoutEntryAdapter';
 import { InMemorySaleClaimAdapter } from '../adapters/inMemorySaleClaimAdapter';
-import type { PayoutEntryRepositoryPort } from '../ports/payoutEntryRepositoryPort';
-import type { PayoutEntry } from '../types/payoutEntry';
 import { PayoutService } from './payoutService';
 import { type OpenSaleClaimInput, SaleClaimService } from './saleClaimService';
 
-function memoryEntries(): PayoutEntryRepositoryPort & { rows: Map<string, PayoutEntry> } {
-  const rows = new Map<string, PayoutEntry>();
-  return {
-    rows,
-    async createIfAbsent(entry) {
-      if (!rows.has(entry.id)) rows.set(entry.id, entry);
-      return rows.get(entry.id) as PayoutEntry;
-    },
-    async get(id) {
-      return rows.get(id) ?? null;
-    },
-    async getByPaymentIntentId(id) {
-      return [...rows.values()].find((entry) => entry.paymentIntentId === id) ?? null;
-    },
-    async listDue(nowIso, limit) {
-      return [...rows.values()]
-        .filter((entry) => entry.status === 'pending' && entry.releaseAt <= nowIso)
-        .slice(0, limit);
-    },
-    async update(id, change) {
-      const current = rows.get(id);
-      if (!current) return null;
-      const next = change(current);
-      if (next) rows.set(id, next);
-      return next ?? current;
-    },
-  };
-}
-
 const ENTRY_ID = 'po_ticket_order_ord_1';
 
 const CLAIM: OpenSaleClaimInput = {
@@ -47,7 +17,7 @@ const CLAIM: OpenSaleClaimInput = {
 };
 
 async function setup(now = '2026-12-21T10:00:00.000Z', refundStatus = 'succeeded') {
-  const entries = memoryEntries();
+  const entries = new InMemoryPayoutEntryAdapter();
   const clock = { value: new Date(now) };
   const transfers = { createTransfer: vi.fn().mockResolvedValue({ transferId: 'tr_1' }) };
   const debts = { offsetFromPayout: vi.fn().mockResolvedValue(0), createDebt: vi.fn() };

=== server/domain/payment/types/payoutEntry.ts — diff ===
@@ -19,6 +19,8 @@ export interface PayoutEntry {
   /** Quem vendeu o quê ('ticket_order', 'booking'); o payment não interpreta o valor. */
   referenceType: string;
   referenceId: string;
+  /** Nome do evento ou da oferta na compra, para o extrato do parceiro (classe pública). */
+  title?: string;
   accountKey: string;
   paymentIntentId: string;
   chargeId: string;
@@ -42,3 +44,27 @@ export interface PayoutEntry {
   createdAt: string;
   updatedAt: string;
 }
+
+/** Linha do extrato do parceiro: por allowlist, sem IDs do Stripe (AGENTS.md §7.9 regra 4). */
+export interface PayoutEntryView {
+  id: string;
+  referenceType: string;
+  referenceId: string;
+  title: string | null;
+  accountKey: string;
+  grossMinor: number;
+  /** Taxa de serviço paga pelo comprador que ainda não voltou para ele; não sai do valor do proprietário. */
+  serviceFeeMinor: number;
+  refundedMinor: number;
+  /** Taxa da plataforma sobre o que o proprietário fica (D14). */
+  platformFeeMinor: number;
+  partnerAmountMinor: number;
+  offsetMinor: number;
+  status: PayoutEntryStatus;
+  holdReasons: PayoutHoldReason[];
+  serviceEndsAt: string;
+  releaseAt: string;
+  releasedAt: string | null;
+  canceledReason: PayoutEntry['canceledReason'] | null;
+  createdAt: string;
+}

=== server/domain/payment/usecases/listPayoutEntriesUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { payoutService } from '../factory';
import type { PayoutEntryView } from '../types/payoutEntry';

/** `accountKeys` são os CNPJs do parceiro logado; quem chama garante isso. */
export function listPayoutEntriesUseCase(
  accountKeys: string[],
  limit: number,
  cursor?: string
): Promise<{ data: PayoutEntryView[]; nextCursor: string | null }> {
  return payoutService.listForAccounts(accountKeys, limit, cursor);
}

=== server/interfaces/http/paymentAccounts/paymentAccountController.ts — diff ===
@@ -1,6 +1,7 @@
 import type { Response } from 'express';
 import { listPartnerPaymentAccountsApplicationUseCase } from '../../../application/usecases/paymentAccounts/listPartnerPaymentAccountsApplicationUseCase';
 import { startPaymentAccountSessionApplicationUseCase } from '../../../application/usecases/paymentAccounts/startPaymentAccountSessionApplicationUseCase';
+import { listPartnerPayoutsApplicationUseCase } from '../../../application/usecases/paymentAccounts/listPartnerPayoutsApplicationUseCase';
 import { listPartnerDebtsApplicationUseCase } from '../../../application/usecases/paymentAccounts/listPartnerDebtsApplicationUseCase';
 import { startPartnerDebtPaymentApplicationUseCase } from '../../../application/usecases/paymentAccounts/startPartnerDebtPaymentApplicationUseCase';
 import { acceptPartnerTermsApplicationUseCase } from '../../../application/usecases/paymentAccounts/acceptPartnerTermsApplicationUseCase';
@@ -12,6 +13,7 @@ import {
   AcceptPartnerTermsSchema,
   AccountDebtParamsSchema,
   ListPaymentAccountsQuerySchema,
+  ListPayoutsQuerySchema,
   PaymentAccountSessionSchema,
 } from './schemas/paymentAccountSchemas';
 
@@ -76,6 +78,19 @@ export class PaymentAccountController {
     }
   }
 
+  static async listPayouts(req: AuthenticatedRequest, res: Response): Promise<Response> {
+    if (!req.user?.uid) return sendError(res, 401, 'UNAUTHENTICATED', 'Não autenticado.');
+    const query = ListPayoutsQuerySchema.safeParse(req.query);
+    if (!query.success) return sendError(res, 400, 'VALIDATION_ERROR', 'Consulta inválida.');
+    try {
+      return res
+        .status(200)
+        .json(await listPartnerPayoutsApplicationUseCase(req.user.uid, query.data));
+    } catch (error) {
+      return handleError(res, error, 'listPayouts');
+    }
+  }
+
   static async listDebts(req: AuthenticatedRequest, res: Response): Promise<Response> {
     if (!req.user?.uid) return sendError(res, 401, 'UNAUTHENTICATED', 'Não autenticado.');
     try {

=== server/interfaces/http/paymentAccounts/paymentAccountRoutes.ts — diff ===
@@ -13,6 +13,7 @@ const router = Router();
 
 router.get('/', verifyAuthToken, PaymentAccountController.list);
 router.post('/session', verifyAuthTokenStrict, PaymentAccountController.createSession);
+router.get('/payouts', verifyAuthToken, PaymentAccountController.listPayouts);
 router.get('/debts', verifyAuthToken, PaymentAccountController.listDebts);
 router.post('/debts/:debtId/payment', verifyAuthTokenStrict, PaymentAccountController.payDebt);
 router.post('/debts/:debtId/waive', verifyAuthTokenStrict, PaymentAccountController.waiveDebt);

=== server/interfaces/http/paymentAccounts/schemas/paymentAccountSchemas.ts — diff ===
@@ -43,3 +43,18 @@ export const DeclareForceMajeureSchema = z
   .strict();
 
 export const DecideForceMajeureSchema = z.object({ approve: z.boolean() }).strict();
+
+export const ListPayoutsQuerySchema = z
+  .object({
+    accountKey: z
+      .string()
+      .regex(/^[\w-]{43}$/)
+      .optional(),
+    limit: z.coerce.number().int().min(1).max(100).default(30),
+    cursor: z
+      .string()
+      .max(200)
+      .regex(/^[\w-]+$/)
+      .optional(),
+  })
+  .strict();

=== src/app/compositions/CheckoutResultComposition.tsx — diff ===
@@ -17,6 +17,19 @@ export function CheckoutResultComposition() {
   const bookingId = searchParams.get('bookingId');
   const paymentIntentId = searchParams.get('payment_intent') ?? undefined;
 
+  if (kind === 'debt') {
+    // A dívida é quitada só pelo webhook (AGENTS.md §8.4); aqui apenas orientamos o parceiro.
+    return (
+      <MessagePage
+        icon={Clock}
+        title={t('pages.debtPaymentTitle')}
+        description={t('pages.debtPaymentDescription')}
+        actionLabel={t('pages.openPartnerArea')}
+        onAction={() => goTo('explore', '?partner=1')}
+      />
+    );
+  }
+
   if (kind === 'plan') {
     // Plano é confirmado só pelo webhook (AGENTS.md §8.4); aqui apenas orientamos o parceiro.
     return (

=== src/domain/payment/adapters/ui/StripePaymentElement.tsx — diff ===
@@ -3,6 +3,7 @@ import { useTranslation } from 'react-i18next';
 import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
 import type { StripeElementsOptions } from '@stripe/stripe-js';
 import { Loader2, Lock } from 'lucide-react';
+import { useResolvedTheme } from '../../../../shared/context/ThemeContext';
 import { normalizeLocale, DEFAULT_LOCALE } from '../../../../shared/i18n';
 import { stripePromise } from '../stripePromise';
 
@@ -11,8 +12,8 @@ interface StripePaymentElementProps {
   orderId: string;
   /** `setup` salva o cartão sem cobrar agora (assinatura em período já pago). */
   intentType?: 'payment' | 'setup';
-  /** Página de retorno do Stripe: pedido de ingresso (padrão), plano do parceiro ou reserva (`orderId` = ID da reserva). */
-  returnKind?: 'ticket_order' | 'plan' | 'booking';
+  /** Página de retorno do Stripe: pedido de ingresso (padrão), plano, reserva (`orderId` = ID da reserva) ou dívida do parceiro. */
+  returnKind?: 'ticket_order' | 'plan' | 'booking' | 'debt';
   submitLabel?: string;
   disabled?: boolean;
   onPending?: () => void;
@@ -42,8 +43,8 @@ function PaymentForm({
     }
     setSubmitting(true);
     const returnQuery =
-      returnKind === 'plan'
-        ? 'kind=plan'
+      returnKind === 'plan' || returnKind === 'debt'
+        ? `kind=${returnKind}`
         : returnKind === 'booking'
           ? `bookingId=${encodeURIComponent(orderId)}`
           : `orderId=${encodeURIComponent(orderId)}`;
@@ -90,7 +91,7 @@ function PaymentForm({
 
   return (
     <form onSubmit={handleSubmit} className="space-y-4">
-      <div className="p-4 rounded-2xl bg-slate-950/60 border border-white/10">
+      <div className="p-4 rounded-2xl bg-surface border border-line">
         <PaymentElement />
       </div>
       <button
@@ -116,10 +117,11 @@ function PaymentForm({
 
 export function StripePaymentElement({ clientSecret, ...formProps }: StripePaymentElementProps) {
   const { t, i18n } = useTranslation();
+  const theme = useResolvedTheme();
 
   if (!stripePromise) {
     return (
-      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200">
+      <div className="p-4 rounded-2xl bg-warn-soft border border-warn-line text-xs text-warn">
         {t('payment.element.unavailable')}
       </div>
     );
@@ -128,16 +130,29 @@ export function StripePaymentElement({ clientSecret, ...formProps }: StripePayme
   const options: StripeElementsOptions = {
     clientSecret,
     locale: normalizeLocale(i18n.language) ?? DEFAULT_LOCALE,
-    appearance: {
-      theme: 'night',
-      variables: {
-        colorPrimary: '#2dd4bf',
-        colorBackground: '#090d16',
-        colorText: '#f8fafc',
-        colorDanger: '#f87171',
-        borderRadius: '12px',
-      },
-    },
+    // O Stripe não lê as variáveis CSS do app: as cores repetem os tokens `--ug-*` de cada tema.
+    appearance:
+      theme === 'light'
+        ? {
+            theme: 'stripe',
+            variables: {
+              colorPrimary: '#0f766e',
+              colorBackground: '#faf6ee',
+              colorText: '#231d16',
+              colorDanger: '#9f1239',
+              borderRadius: '12px',
+            },
+          }
+        : {
+            theme: 'night',
+            variables: {
+              colorPrimary: '#2dd4bf',
+              colorBackground: '#090d16',
+              colorText: '#f8fafc',
+              colorDanger: '#f87171',
+              borderRadius: '12px',
+            },
+          },
   };
 
   return (

=== src/domain/payment/api/apiReceivablesAdapter.ts — ARQUIVO NOVO, conteúdo completo ===
import { firebaseApiFetch } from '../../../shared/infrastructure/firebase/firebaseApiFetch';
import type { ReceivablesApiPort } from '../ports/receivablesApiPort';
import type { AccountDebtView, PayoutPage } from '../types/receivables';

const API_OPTIONS = { requireAuth: true, requireAppCheck: true } as const;

/** Lança Error com o `code` estável do backend (AGENTS.md §10.2); a UI traduz pelo código. */
async function readJsonOrThrow<T>(response: Response): Promise<T> {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(
      typeof data?.error?.code === 'string' ? data.error.code : 'PAYMENT_ACCOUNT_UNAVAILABLE'
    );
  }
  return data as T;
}

function postJson(path: string, body: unknown) {
  return firebaseApiFetch(
    path,
    { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) },
    API_OPTIONS
  );
}

export class ApiReceivablesAdapter implements ReceivablesApiPort {
  async listPayouts(query: {
    accountKey?: string;
    cursor?: string;
    limit?: number;
  }): Promise<PayoutPage> {
    const params = new URLSearchParams();
    if (query.accountKey) params.set('accountKey', query.accountKey);
    if (query.cursor) params.set('cursor', query.cursor);
    params.set('limit', String(query.limit ?? 30));
    const response = await firebaseApiFetch(
      `/api/payment-accounts/payouts?${params.toString()}`,
      { method: 'GET' },
      API_OPTIONS
    );
    return readJsonOrThrow<PayoutPage>(response);
  }

  async listDebts(): Promise<AccountDebtView[]> {
    const response = await firebaseApiFetch(
      '/api/payment-accounts/debts',
      { method: 'GET' },
      API_OPTIONS
    );
    return (await readJsonOrThrow<{ data: AccountDebtView[] }>(response)).data;
  }

  async startDebtPayment(debtId: string): Promise<{ clientSecret: string }> {
    const response = await postJson(
      `/api/payment-accounts/debts/${encodeURIComponent(debtId)}/payment`,
      {}
    );
    return (await readJsonOrThrow<{ data: { clientSecret: string } }>(response)).data;
  }

  async declareForceMajeure(
    debtId: string,
    declaration: { reason: string; proofPath: string }
  ): Promise<AccountDebtView> {
    const response = await postJson(
      `/api/payment-accounts/debts/${encodeURIComponent(debtId)}/force-majeure`,
      declaration
    );
    return (await readJsonOrThrow<{ data: AccountDebtView }>(response)).data;
  }
}

=== src/domain/payment/application/usecases/declareForceMajeureUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { uploadVerificationFileUseCase } from '../../../media';
import { receivablesApiAdapter } from '../../factory';
import type { AccountDebtView } from '../../types/receivables';

/** A prova vai para a pasta privada do parceiro antes da declaração (D16, 3A). */
export async function declareForceMajeureUseCase(
  debtId: string,
  declaration: { reason: string; proof: File }
): Promise<AccountDebtView> {
  const { fileId } = await uploadVerificationFileUseCase(declaration.proof);
  return receivablesApiAdapter.declareForceMajeure(debtId, {
    reason: declaration.reason.trim(),
    proofPath: fileId,
  });
}

=== src/domain/payment/application/usecases/listDebtsUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { receivablesApiAdapter } from '../../factory';
import type { AccountDebtView } from '../../types/receivables';

export function listDebtsUseCase(): Promise<AccountDebtView[]> {
  return receivablesApiAdapter.listDebts();
}

=== src/domain/payment/application/usecases/listPayoutsUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { receivablesApiAdapter } from '../../factory';
import type { PayoutPage } from '../../types/receivables';

export function listPayoutsUseCase(query: {
  accountKey?: string;
  cursor?: string;
}): Promise<PayoutPage> {
  return receivablesApiAdapter.listPayouts(query);
}

=== src/domain/payment/application/usecases/startDebtPaymentUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { receivablesApiAdapter } from '../../factory';

export function startDebtPaymentUseCase(debtId: string): Promise<{ clientSecret: string }> {
  return receivablesApiAdapter.startDebtPayment(debtId);
}

=== src/domain/payment/components/PartnerStripeConnectPortal.test.tsx — diff ===
@@ -7,6 +7,8 @@ const m = vi.hoisted(() => ({
   embed: vi.fn(),
   terms: vi.fn(),
   accept: vi.fn(),
+  debts: vi.fn(),
+  payouts: vi.fn(),
 }));
 vi.mock('../application/usecases/getPartnerTermsUseCase', () => ({
   getPartnerTermsUseCase: m.terms,
@@ -17,6 +19,12 @@ vi.mock('../application/usecases/acceptPartnerTermsUseCase', () => ({
 vi.mock('../application/usecases/listPaymentAccountsUseCase', () => ({
   listPaymentAccountsUseCase: m.list,
 }));
+vi.mock('../application/usecases/listDebtsUseCase', () => ({
+  listDebtsUseCase: m.debts,
+}));
+vi.mock('../application/usecases/listPayoutsUseCase', () => ({
+  listPayoutsUseCase: m.payouts,
+}));
 vi.mock('../application/usecases/createPaymentAccountSessionUseCase', () => ({
   createPaymentAccountSessionUseCase: vi.fn(),
 }));
@@ -71,6 +79,8 @@ describe('PartnerStripeConnectPortal (D14)', () => {
     vi.stubEnv('VITE_STRIPE_PUBLISHABLE_KEY', 'pk_test_x');
     await i18n.changeLanguage('pt-BR');
     m.terms.mockResolvedValue(ACCEPTED_TERMS);
+    m.debts.mockResolvedValue([]);
+    m.payouts.mockResolvedValue({ data: [], nextCursor: null });
   });
 
   it('mostra um cartão por CNPJ com o status de cada conta', async () => {
@@ -125,4 +135,66 @@ describe('PartnerStripeConnectPortal (D14)', () => {
     expect(await screen.findByText(/Termos do parceiro aceitos em/)).toBeTruthy();
     expect((start as HTMLButtonElement).disabled).toBe(false);
   });
+
+  it('dívida vencida: aviso de vendas pausadas e contador na aba Dívidas (D16)', async () => {
+    m.list.mockResolvedValue([READY]);
+    m.debts.mockResolvedValue([
+      {
+        id: 'debt-1',
+        accountKey: 'key-1',
+        reason: 'cancellation_penalty',
+        referenceType: 'event_occurrence',
+        amountMinor: 2000,
+        remainingMinor: 2000,
+        status: 'open',
+        dueAt: '2026-10-20T12:00:00.000Z',
+        overdue: true,
+        createdAt: '2026-10-19T12:00:00.000Z',
+      },
+    ]);
+    render(<PartnerStripeConnectPortal />);
+    expect(await screen.findByText(/Vendas pausadas/)).toBeTruthy();
+    fireEvent.click(screen.getByRole('button', { name: /Dívidas/ }));
+    expect(await screen.findByText('Multa de cancelamento (20% do vendido)')).toBeTruthy();
+    expect(screen.getByText('Vencida: as vendas deste CNPJ estão pausadas.')).toBeTruthy();
+    expect(screen.getByRole('button', { name: 'Pagar' })).toBeTruthy();
+    expect(screen.queryByRole('button', { name: 'Declarar força maior' })).toBeNull();
+  });
+
+  it('extrato: status e valores de cada venda', async () => {
+    m.list.mockResolvedValue([READY]);
+    m.payouts.mockResolvedValue({
+      data: [
+        {
+          id: 'po_1',
+          referenceType: 'ticket_order',
+          referenceId: 'ord_1',
+          title: 'Festival de Verão',
+          accountKey: 'key-1',
+          grossMinor: 10600,
+          serviceFeeMinor: 600,
+          refundedMinor: 0,
+          platformFeeMinor: 1000,
+          partnerAmountMinor: 9000,
+          offsetMinor: 0,
+          status: 'on_hold',
+          holdReasons: ['claim'],
+          serviceEndsAt: '2026-12-21T03:00:00.000Z',
+          releaseAt: '2026-12-23T03:00:00.000Z',
+          releasedAt: null,
+          canceledReason: null,
+          createdAt: '2026-12-01T00:00:00.000Z',
+        },
+      ],
+      nextCursor: null,
+    });
+    render(<PartnerStripeConnectPortal />);
+    await screen.findByText('**.***.***/0001-81');
+    fireEvent.click(screen.getByRole('button', { name: 'Extrato' }));
+    expect(await screen.findByText('Festival de Verão')).toBeTruthy();
+    expect(screen.getByText('Retido: reclamação em análise')).toBeTruthy();
+    expect(screen.getByText(/90,00/)).toBeTruthy();
+    expect(screen.getByText('Taxa da plataforma')).toBeTruthy();
+    expect(screen.getByText(/10,00/)).toBeTruthy();
+  });
 });

=== src/domain/payment/components/PartnerStripeConnectPortal.tsx — diff ===
@@ -1,16 +1,20 @@
-import { Loader2, RefreshCw } from 'lucide-react';
+import { AlertTriangle, Loader2, RefreshCw } from 'lucide-react';
 import { useCallback, useEffect, useState } from 'react';
 import { useTranslation } from 'react-i18next';
 import { GlassCard } from '../../../ui/components/GlassCard';
 import { getPartnerTermsUseCase } from '../application/usecases/getPartnerTermsUseCase';
 import { listPaymentAccountsUseCase } from '../application/usecases/listPaymentAccountsUseCase';
+import { usePartnerDebts } from '../hooks/usePartnerDebts';
 import type { PartnerPaymentAccount, PartnerTermsView } from '../types/payment';
 import { PartnerTermsCard } from './accounts/PartnerTermsCard';
 import { PaymentAccountCard } from './accounts/PaymentAccountCard';
 import { PaymentAccountWorkspace } from './accounts/PaymentAccountWorkspace';
 import { accountErrorKey } from './accounts/paymentAccountStatus';
+import { DebtList } from './receivables/DebtList';
+import { PayoutStatement } from './receivables/PayoutStatement';
+import { type ReceivablesTab, ReceivablesTabs } from './receivables/ReceivablesTabs';
 
-/** Recebimentos do parceiro: uma conta Stripe por CNPJ verificado (D14). */
+/** Recebimentos do parceiro: conta Stripe por CNPJ (D14), extrato por venda e dívidas (D16). */
 export function PartnerStripeConnectPortal() {
   const { t } = useTranslation();
   const [accounts, setAccounts] = useState<PartnerPaymentAccount[] | null>(null);
@@ -18,6 +22,10 @@ export function PartnerStripeConnectPortal() {
   const [loading, setLoading] = useState(true);
   const [openKey, setOpenKey] = useState<string | null>(null);
   const [terms, setTerms] = useState<PartnerTermsView | null>(null);
+  const [tab, setTab] = useState<ReceivablesTab>('accounts');
+  const debtsState = usePartnerDebts();
+  const pendingDebts = debtsState.debts.filter((debt) => debt.status === 'open').length;
+  const blocked = debtsState.debts.some((debt) => debt.overdue);
 
   const load = useCallback(async () => {
     setLoading(true);
@@ -51,7 +59,10 @@ export function PartnerStripeConnectPortal() {
         </div>
         <button
           type="button"
-          onClick={() => void load()}
+          onClick={() => {
+            void load();
+            void debtsState.reload();
+          }}
           aria-label={t('paymentAccounts.refresh')}
           className="press w-11 h-11 shrink-0 rounded-xl border border-line text-ink flex items-center justify-center hover:bg-accent-soft focus-visible:ring-2 focus-visible:ring-teal-400/50"
         >
@@ -59,7 +70,21 @@ export function PartnerStripeConnectPortal() {
         </button>
       </div>
 
-      {terms && !open && <PartnerTermsCard terms={terms} onAccepted={setTerms} />}
+      {blocked && (
+        <p
+          role="alert"
+          className="flex items-start gap-2 p-3 rounded-xl bg-danger-soft border border-danger-line text-xs text-danger"
+        >
+          <AlertTriangle size={16} className="shrink-0 mt-0.5" aria-hidden="true" />
+          {t('receivables.blockedBanner')}
+        </p>
+      )}
+
+      {!open && <ReceivablesTabs value={tab} onChange={setTab} pendingDebts={pendingDebts} />}
+
+      {terms && !open && tab === 'accounts' && (
+        <PartnerTermsCard terms={terms} onAccepted={setTerms} />
+      )}
 
       {loading && !accounts ? (
         <p className="flex items-center gap-2 text-xs text-ink/70" role="status">
@@ -80,6 +105,10 @@ export function PartnerStripeConnectPortal() {
             {t('paymentAccounts.retry')}
           </button>
         </div>
+      ) : tab === 'statement' && !open ? (
+        <PayoutStatement accounts={accounts ?? []} />
+      ) : tab === 'debts' && !open ? (
+        <DebtList accounts={accounts ?? []} debtsState={debtsState} />
       ) : open ? (
         <PaymentAccountWorkspace
           entry={open}

=== src/domain/payment/components/receivables/DebtCard.tsx — ARQUIVO NOVO, conteúdo completo ===
import { useTranslation } from 'react-i18next';
import { formatMoneyMinor } from '../../../../shared/utils/money';
import type { AccountDebtView } from '../../types/receivables';
import { formatFortalezaDateTime } from '../../utils/receivablesFormat';
import { canDeclareForceMajeure, canPayDebt, debtStatusKey, debtStatusTone } from './debtStatus';

const PRIMARY =
  'press min-h-11 px-4 rounded-xl bg-teal-400 hover:bg-teal-300 text-slate-950 text-xs font-bold focus-visible:ring-2 focus-visible:ring-teal-400/50';
const SECONDARY =
  'press min-h-11 px-4 rounded-xl border border-line text-xs font-bold text-ink hover:bg-accent-soft focus-visible:ring-2 focus-visible:ring-teal-400/50';

export function DebtCard({
  debt,
  maskedDocument,
  now,
  onPay,
  onDeclare,
}: {
  debt: AccountDebtView;
  maskedDocument?: string;
  now: Date;
  onPay: (debt: AccountDebtView) => void;
  onDeclare: (debt: AccountDebtView) => void;
}) {
  const { t, i18n } = useTranslation();
  const status = debtStatusKey(debt);
  const money = (value: number) => formatMoneyMinor(value, i18n.language);
  const showPay = canPayDebt(debt);
  const showDeclare = canDeclareForceMajeure(debt, now);

  return (
    <li className="p-4 rounded-2xl bg-surface border border-line space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0 space-y-0.5">
          <p className="text-sm font-bold text-ink">
            {t(`receivables.debts.reason.${debt.reason}`)}
          </p>
          {maskedDocument && (
            <p className="text-xs text-ink/70 font-mono break-all">{maskedDocument}</p>
          )}
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
        {debt.remainingMinor > 0 && debt.remainingMinor !== debt.amountMinor && (
          <div className="flex items-center justify-between gap-3">
            <dt className="text-ink/70">{t('receivables.debts.remaining')}</dt>
            <dd className="font-bold text-ink">{money(debt.remainingMinor)}</dd>
          </div>
        )}
      </dl>
      {(status === 'open' || status === 'overdue' || status === 'rejected') && (
        <p className={`text-[11px] ${status === 'overdue' ? 'text-danger' : 'text-ink/70'}`}>
          {status === 'overdue'
            ? t('receivables.debts.overdueExplain')
            : t('receivables.debts.dueOn', {
                date: formatFortalezaDateTime(debt.dueAt, i18n.language),
              })}
        </p>
      )}
      {(showPay || showDeclare) && (
        <div className="flex flex-wrap gap-2">
          {showPay && (
            <button type="button" onClick={() => onPay(debt)} className={PRIMARY}>
              {t('receivables.debts.pay')}
            </button>
          )}
          {showDeclare && (
            <button type="button" onClick={() => onDeclare(debt)} className={SECONDARY}>
              {t('receivables.debts.declare')}
            </button>
          )}
        </div>
      )}
    </li>
  );
}

=== src/domain/payment/components/receivables/DebtList.tsx — ARQUIVO NOVO, conteúdo completo ===
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { usePartnerDebts } from '../../hooks/usePartnerDebts';
import type { PartnerPaymentAccount } from '../../types/payment';
import type { AccountDebtView } from '../../types/receivables';
import { DebtCard } from './DebtCard';
import { DebtPaymentDialog } from './DebtPaymentDialog';
import { ForceMajeureDialog } from './ForceMajeureDialog';
import { ReceivablesEmpty, ReceivablesError, ReceivablesLoading } from './ReceivablesState';

export function DebtList({
  accounts,
  debtsState,
}: {
  accounts: PartnerPaymentAccount[];
  debtsState: ReturnType<typeof usePartnerDebts>;
}) {
  const { t } = useTranslation();
  const { debts, loading, error, reload } = debtsState;
  const [paying, setPaying] = useState<AccountDebtView | null>(null);
  const [declaring, setDeclaring] = useState<AccountDebtView | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const documentOf = (accountKey: string) =>
    accounts.find((account) => account.accountKey === accountKey)?.maskedDocument;
  const now = new Date();

  return (
    <section className="space-y-3" aria-label={t('receivables.debts.title')}>
      <div className="space-y-1">
        <h5 className="text-sm font-bold text-ink">{t('receivables.debts.title')}</h5>
        <p className="text-xs text-ink/70">{t('receivables.debts.hint')}</p>
      </div>
      {notice && (
        <p
          role="status"
          className="p-3 rounded-xl bg-success-soft border border-success-line text-xs text-success"
        >
          {notice}
        </p>
      )}
      {error ? (
        <ReceivablesError messageKey={error} onRetry={() => void reload()} />
      ) : loading && debts.length === 0 ? (
        <ReceivablesLoading label={t('receivables.debts.loading')} />
      ) : debts.length === 0 ? (
        <ReceivablesEmpty message={t('receivables.debts.empty')} />
      ) : (
        <ul className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {debts.map((debt) => (
            <DebtCard
              key={debt.id}
              debt={debt}
              maskedDocument={documentOf(debt.accountKey)}
              now={now}
              onPay={setPaying}
              onDeclare={setDeclaring}
            />
          ))}
        </ul>
      )}
      <DebtPaymentDialog
        debt={paying}
        onClose={() => setPaying(null)}
        onPaid={() => {
          setPaying(null);
          setNotice(t('receivables.payDialog.sent'));
          void reload();
        }}
      />
      {/* A chave recria o formulário vazio para cada multa. */}
      <ForceMajeureDialog
        key={declaring?.id ?? 'none'}
        debt={declaring}
        onClose={() => setDeclaring(null)}
        onDeclared={() => {
          setDeclaring(null);
          setNotice(t('receivables.forceMajeure.sent'));
          void reload();
        }}
      />
    </section>
  );
}

=== src/domain/payment/components/receivables/DebtPaymentDialog.tsx — ARQUIVO NOVO, conteúdo completo ===
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { formatMoneyMinor } from '../../../../shared/utils/money';
import { Dialog } from '../../../../ui/components/Dialog';
import { StripePaymentElement } from '../../adapters/ui/StripePaymentElement';
import { startDebtPaymentUseCase } from '../../application/usecases/startDebtPaymentUseCase';
import type { AccountDebtView } from '../../types/receivables';
import { receivablesErrorKey } from '../../utils/receivablesFormat';
import { ReceivablesLoading } from './ReceivablesState';

export function DebtPaymentDialog({
  debt,
  onClose,
  onPaid,
}: {
  debt: AccountDebtView | null;
  onClose: () => void;
  onPaid: () => void;
}) {
  const { t, i18n } = useTranslation();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setClientSecret(null);
    setError(null);
    if (!debt) return;
    let active = true;
    startDebtPaymentUseCase(debt.id)
      .then((result) => active && setClientSecret(result.clientSecret))
      .catch((err) => active && setError(t(receivablesErrorKey(err))));
    return () => {
      active = false;
    };
  }, [debt, t]);

  return (
    <Dialog
      open={debt !== null}
      onOpenChange={(open) => !open && onClose()}
      title={t('receivables.payDialog.title')}
      description={t('receivables.payDialog.description')}
    >
      {error ? (
        <p
          role="alert"
          className="p-3 rounded-xl bg-danger-soft border border-danger-line text-xs text-danger"
        >
          {error}
        </p>
      ) : debt && clientSecret ? (
        <StripePaymentElement
          clientSecret={clientSecret}
          orderId={debt.id}
          returnKind="debt"
          submitLabel={t('receivables.payDialog.submit', {
            amount: formatMoneyMinor(debt.remainingMinor, i18n.language),
          })}
          onSuccess={onPaid}
          onError={setError}
        />
      ) : (
        <ReceivablesLoading label={t('receivables.payDialog.loading')} />
      )}
    </Dialog>
  );
}

=== src/domain/payment/components/receivables/ForceMajeureDialog.tsx — ARQUIVO NOVO, conteúdo completo ===
import { Loader2, Paperclip } from 'lucide-react';
import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog } from '../../../../ui/components/Dialog';
import { declareForceMajeureUseCase } from '../../application/usecases/declareForceMajeureUseCase';
import type { AccountDebtView } from '../../types/receivables';
import { receivablesErrorKey } from '../../utils/receivablesFormat';

const MIN_REASON = 10;
const MAX_REASON = 500;

export function ForceMajeureDialog({
  debt,
  onClose,
  onDeclared,
}: {
  debt: AccountDebtView | null;
  onClose: () => void;
  onDeclared: () => void;
}) {
  const { t } = useTranslation();
  const id = useId();
  const [reason, setReason] = useState('');
  const [proof, setProof] = useState<File | null>(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!debt) return;
    if (reason.trim().length < MIN_REASON) {
      return setError(t('receivables.forceMajeure.reasonTooShort'));
    }
    if (!proof) return setError(t('receivables.forceMajeure.proofRequired'));
    setSending(true);
    setError(null);
    try {
      await declareForceMajeureUseCase(debt.id, { reason, proof });
      onDeclared();
    } catch (err) {
      setError(t(receivablesErrorKey(err)));
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog
      open={debt !== null}
      onOpenChange={(open) => !open && onClose()}
      title={t('receivables.forceMajeure.title')}
      description={t('receivables.forceMajeure.description')}
    >
      <form onSubmit={submit} className="space-y-4" noValidate>
        <div className="space-y-1.5">
          <label htmlFor={`${id}-reason`} className="text-xs font-bold text-ink">
            {t('receivables.forceMajeure.reasonLabel')}
          </label>
          <textarea
            id={`${id}-reason`}
            value={reason}
            maxLength={MAX_REASON}
            rows={4}
            onChange={(event) => setReason(event.target.value)}
            aria-describedby={`${id}-reason-hint`}
            className="w-full p-3 rounded-xl bg-surface border border-line text-sm text-ink focus-visible:ring-2 focus-visible:ring-teal-400/50"
          />
          <p id={`${id}-reason-hint`} className="text-[11px] text-ink/70">
            {t('receivables.forceMajeure.reasonHint')}
          </p>
        </div>
        <div className="space-y-1.5">
          <span className="block text-xs font-bold text-ink">
            {t('receivables.forceMajeure.proofLabel')}
          </span>
          <label
            htmlFor={`${id}-proof`}
            className="press min-h-11 px-4 rounded-xl border border-dashed border-line text-xs text-ink flex items-center gap-2 cursor-pointer hover:bg-accent-soft focus-within:ring-2 focus-within:ring-teal-400/50"
          >
            <Paperclip size={15} aria-hidden="true" />
            <span className="truncate">
              {proof?.name ?? t('receivables.forceMajeure.proofPick')}
            </span>
            <input
              id={`${id}-proof`}
              type="file"
              accept="application/pdf,image/jpeg,image/png,image/webp"
              className="sr-only"
              aria-describedby={`${id}-proof-hint`}
              onChange={(event) => setProof(event.target.files?.[0] ?? null)}
            />
          </label>
          <p id={`${id}-proof-hint`} className="text-[11px] text-ink/70">
            {t('receivables.forceMajeure.proofHint')}
          </p>
        </div>
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
          className="press w-full min-h-12 rounded-xl bg-teal-400 hover:bg-teal-300 disabled:opacity-50 text-slate-950 text-sm font-bold flex items-center justify-center gap-2 focus-visible:ring-2 focus-visible:ring-teal-400/50"
        >
          {sending && <Loader2 size={16} className="animate-spin" aria-hidden="true" />}
          {t(sending ? 'receivables.forceMajeure.sending' : 'receivables.forceMajeure.submit')}
        </button>
      </form>
    </Dialog>
  );
}

=== src/domain/payment/components/receivables/PayoutEntryRow.tsx — ARQUIVO NOVO, conteúdo completo ===
import { useTranslation } from 'react-i18next';
import { formatMoneyMinor } from '../../../../shared/utils/money';
import type { PayoutEntryView } from '../../types/receivables';
import { formatFortalezaDateTime } from '../../utils/receivablesFormat';
import { payoutStatusKey, payoutStatusTone } from './payoutStatus';

function AmountLine({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 text-xs">
      <dt className="text-ink/70">{label}</dt>
      <dd className={strong ? 'font-bold text-ink' : 'text-ink'}>{value}</dd>
    </div>
  );
}

export function PayoutEntryRow({ entry }: { entry: PayoutEntryView }) {
  const { t, i18n } = useTranslation();
  const money = (value: number) => formatMoneyMinor(value, i18n.language);
  const date = (iso: string) => formatFortalezaDateTime(iso, i18n.language);
  const status = payoutStatusKey(entry);
  const net = Math.max(0, entry.partnerAmountMinor - entry.offsetMinor);
  const title =
    entry.title ??
    t(
      entry.referenceType === 'booking'
        ? 'receivables.statement.fallbackBooking'
        : 'receivables.statement.fallbackTicket'
    );
  const settled = status === 'fully_refunded' || status === 'dispute_lost';

  return (
    <li className="p-4 rounded-2xl bg-surface border border-line space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0 space-y-0.5">
          <p className="text-sm font-bold text-ink break-words">{title}</p>
          <p className="text-xs text-ink/70">
            {t('receivables.statement.serviceEnd', { date: date(entry.serviceEndsAt) })}
          </p>
        </div>
        <span
          className={`shrink-0 max-w-[50%] px-2.5 py-1 rounded-full border text-[11px] font-bold text-center ${payoutStatusTone(status)}`}
        >
          {t(`receivables.statement.status.${status}`)}
        </span>
      </div>
      <dl className="space-y-1">
        <AmountLine label={t('receivables.statement.gross')} value={money(entry.grossMinor)} />
        {entry.serviceFeeMinor > 0 && (
          <AmountLine
            label={t('receivables.statement.serviceFee')}
            value={`− ${money(entry.serviceFeeMinor)}`}
          />
        )}
        {entry.refundedMinor > 0 && (
          <AmountLine
            label={t('receivables.statement.refunded')}
            value={`− ${money(entry.refundedMinor)}`}
          />
        )}
        {entry.platformFeeMinor > 0 && (
          <AmountLine
            label={t('receivables.statement.platformFee')}
            value={`− ${money(entry.platformFeeMinor)}`}
          />
        )}
        {entry.offsetMinor > 0 && (
          <AmountLine
            label={t('receivables.statement.offset')}
            value={`− ${money(entry.offsetMinor)}`}
          />
        )}
        {!settled && (
          <AmountLine
            label={t(
              status === 'released'
                ? 'receivables.statement.received'
                : 'receivables.statement.toReceive'
            )}
            value={money(net)}
            strong
          />
        )}
      </dl>
      {!settled && (
        <p className="text-[11px] text-ink/70">
          {entry.releasedAt
            ? t('receivables.statement.releasedOn', { date: date(entry.releasedAt) })
            : t('receivables.statement.releaseOn', { date: date(entry.releaseAt) })}
        </p>
      )}
    </li>
  );
}

=== src/domain/payment/components/receivables/PayoutStatement.tsx — ARQUIVO NOVO, conteúdo completo ===
import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { usePartnerPayouts } from '../../hooks/usePartnerPayouts';
import type { PartnerPaymentAccount } from '../../types/payment';
import { PayoutEntryRow } from './PayoutEntryRow';
import { ReceivablesEmpty, ReceivablesError, ReceivablesLoading } from './ReceivablesState';

export function PayoutStatement({ accounts }: { accounts: PartnerPaymentAccount[] }) {
  const { t } = useTranslation();
  const filterId = useId();
  const [accountKey, setAccountKey] = useState('');
  const { entries, loading, error, hasMore, reload, loadMore } = usePartnerPayouts(
    accountKey || undefined
  );

  return (
    <section className="space-y-3" aria-labelledby={`${filterId}-title`}>
      <div className="space-y-1">
        <h5 id={`${filterId}-title`} className="text-sm font-bold text-ink">
          {t('receivables.statement.title')}
        </h5>
        <p className="text-xs text-ink/70">{t('receivables.statement.hint')}</p>
      </div>
      {accounts.length > 1 && (
        <div className="flex flex-wrap items-center gap-2">
          <label htmlFor={filterId} className="text-xs font-bold text-ink/80">
            {t('receivables.statement.filterLabel')}
          </label>
          <select
            id={filterId}
            value={accountKey}
            onChange={(event) => setAccountKey(event.target.value)}
            className="min-h-11 px-3 rounded-xl bg-surface border border-line text-xs text-ink focus-visible:ring-2 focus-visible:ring-teal-400/50"
          >
            <option value="">{t('receivables.statement.allAccounts')}</option>
            {accounts.map((account) => (
              <option key={account.accountKey} value={account.accountKey}>
                {account.maskedDocument}
              </option>
            ))}
          </select>
        </div>
      )}
      {error ? (
        <ReceivablesError messageKey={error} onRetry={() => void reload()} />
      ) : loading && entries.length === 0 ? (
        <ReceivablesLoading label={t('receivables.statement.loading')} />
      ) : entries.length === 0 ? (
        <ReceivablesEmpty message={t('receivables.statement.empty')} />
      ) : (
        <>
          <ul className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {entries.map((entry) => (
              <PayoutEntryRow key={entry.id} entry={entry} />
            ))}
          </ul>
          {hasMore && (
            <button
              type="button"
              disabled={loading}
              onClick={() => void loadMore()}
              className="press w-full min-h-11 rounded-xl border border-line text-xs font-bold text-ink disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-teal-400/50"
            >
              {t('receivables.statement.loadMore')}
            </button>
          )}
        </>
      )}
    </section>
  );
}

=== src/domain/payment/components/receivables/ReceivablesState.tsx — ARQUIVO NOVO, conteúdo completo ===
import { Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const RETRY_BUTTON =
  'press min-h-11 px-4 rounded-xl border border-line text-xs font-bold text-ink focus-visible:ring-2 focus-visible:ring-teal-400/50';

export function ReceivablesLoading({ label }: { label: string }) {
  return (
    <p className="flex items-center gap-2 text-xs text-ink/70" role="status">
      <Loader2 size={16} className="animate-spin text-accent" aria-hidden="true" />
      {label}
    </p>
  );
}

export function ReceivablesError({
  messageKey,
  onRetry,
}: {
  messageKey: string;
  onRetry: () => void;
}) {
  const { t } = useTranslation();
  return (
    <div
      role="alert"
      className="flex flex-wrap items-center gap-3 p-3 rounded-xl bg-danger-soft border border-danger-line"
    >
      <p className="text-xs text-danger">{t(messageKey)}</p>
      <button type="button" onClick={onRetry} className={RETRY_BUTTON}>
        {t('paymentAccounts.retry')}
      </button>
    </div>
  );
}

export function ReceivablesEmpty({ message }: { message: string }) {
  return (
    <p className="py-8 text-center text-xs text-ink/70 border-2 border-dashed border-line rounded-2xl">
      {message}
    </p>
  );
}

=== src/domain/payment/components/receivables/ReceivablesTabs.tsx — ARQUIVO NOVO, conteúdo completo ===
import { useTranslation } from 'react-i18next';

export type ReceivablesTab = 'accounts' | 'statement' | 'debts';

const TABS: ReceivablesTab[] = ['accounts', 'statement', 'debts'];

export function ReceivablesTabs({
  value,
  onChange,
  pendingDebts,
}: {
  value: ReceivablesTab;
  onChange: (tab: ReceivablesTab) => void;
  /** Dívidas que pedem ação (em aberto ou vencidas). */
  pendingDebts: number;
}) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label={t('receivables.tabs.label')}>
      {TABS.map((tab) => (
        <button
          key={tab}
          type="button"
          aria-pressed={value === tab}
          onClick={() => onChange(tab)}
          className={`press min-h-11 px-4 rounded-xl text-xs font-bold flex items-center gap-2 focus-visible:ring-2 focus-visible:ring-teal-400/50 ${
            value === tab
              ? 'bg-teal-400 text-slate-950'
              : 'bg-surface border border-line text-ink hover:bg-accent-soft'
          }`}
        >
          {t(`receivables.tabs.${tab}`)}
          {tab === 'debts' && pendingDebts > 0 && (
            <span className="min-w-5 h-5 px-1.5 rounded-full bg-danger text-white text-[11px] font-bold flex items-center justify-center">
              {pendingDebts}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

=== src/domain/payment/components/receivables/debtStatus.ts — ARQUIVO NOVO, conteúdo completo ===
import type { AccountDebtView } from '../../types/receivables';

export type DebtStatusKey = 'open' | 'overdue' | 'suspended' | 'paid' | 'waived' | 'rejected';

const TONE: Record<DebtStatusKey, string> = {
  open: 'bg-warn-soft text-warn border-warn-line',
  overdue: 'bg-danger-soft text-danger border-danger-line',
  suspended: 'bg-info-soft text-info border-info-line',
  paid: 'bg-success-soft text-success border-success-line',
  waived: 'bg-success-soft text-success border-success-line',
  rejected: 'bg-danger-soft text-danger border-danger-line',
};

export function debtStatusKey(debt: AccountDebtView): DebtStatusKey {
  if (debt.status === 'open') {
    if (debt.overdue) return 'overdue';
    return debt.forceMajeureStatus === 'rejected' ? 'rejected' : 'open';
  }
  return debt.status;
}

export function debtStatusTone(key: DebtStatusKey): string {
  return TONE[key];
}

/** Mesmas condições do backend; o servidor confere de novo. */
export function canPayDebt(debt: AccountDebtView): boolean {
  return debt.status === 'open' && debt.remainingMinor > 0;
}

export function canDeclareForceMajeure(debt: AccountDebtView, now: Date): boolean {
  return (
    debt.reason === 'cancellation_penalty' &&
    debt.status === 'open' &&
    !debt.forceMajeureStatus &&
    new Date(debt.dueAt).getTime() > now.getTime()
  );
}

=== src/domain/payment/components/receivables/payoutStatus.ts — ARQUIVO NOVO, conteúdo completo ===
import type { PayoutEntryView } from '../../types/receivables';

export type PayoutStatusKey =
  | 'pending'
  | 'claim'
  | 'dispute'
  | 'released'
  | 'fully_refunded'
  | 'dispute_lost';

const TONE: Record<PayoutStatusKey, string> = {
  pending: 'bg-info-soft text-info border-info-line',
  claim: 'bg-warn-soft text-warn border-warn-line',
  dispute: 'bg-warn-soft text-warn border-warn-line',
  released: 'bg-success-soft text-success border-success-line',
  fully_refunded: 'bg-surface text-ink/70 border-line',
  dispute_lost: 'bg-danger-soft text-danger border-danger-line',
};

export function payoutStatusKey(entry: PayoutEntryView): PayoutStatusKey {
  if (entry.status === 'released') return 'released';
  if (entry.status === 'canceled') {
    return entry.canceledReason === 'dispute_lost' ? 'dispute_lost' : 'fully_refunded';
  }
  if (entry.status === 'on_hold') {
    return entry.holdReasons.includes('claim') ? 'claim' : 'dispute';
  }
  return 'pending';
}

export function payoutStatusTone(key: PayoutStatusKey): string {
  return TONE[key];
}

=== src/domain/payment/components/receivables/receivables.test.tsx — ARQUIVO NOVO, conteúdo completo ===
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { i18n } from '../../../../shared/i18n';

const m = vi.hoisted(() => ({ declare: vi.fn() }));
vi.mock('../../application/usecases/declareForceMajeureUseCase', () => ({
  declareForceMajeureUseCase: m.declare,
}));

import type { AccountDebtView } from '../../types/receivables';
import { canDeclareForceMajeure, canPayDebt, debtStatusKey } from './debtStatus';
import { ForceMajeureDialog } from './ForceMajeureDialog';
import { payoutStatusKey } from './payoutStatus';

const NOW = new Date('2026-10-26T12:00:00.000Z');
const DEBT: AccountDebtView = {
  id: 'debt-1',
  accountKey: 'key-1',
  reason: 'cancellation_penalty',
  referenceType: 'booking_slot',
  amountMinor: 2000,
  remainingMinor: 2000,
  status: 'open',
  dueAt: '2026-10-27T12:00:00.000Z',
  overdue: false,
  createdAt: '2026-10-26T11:00:00.000Z',
};

describe('regras de tela de dívidas e extrato (D16)', () => {
  it('força maior só na multa aberta, antes do vencimento e uma vez', () => {
    expect(canDeclareForceMajeure(DEBT, NOW)).toBe(true);
    expect(canDeclareForceMajeure({ ...DEBT, reason: 'dispute_lost' }, NOW)).toBe(false);
    expect(canDeclareForceMajeure({ ...DEBT, forceMajeureStatus: 'rejected' }, NOW)).toBe(false);
    expect(canDeclareForceMajeure(DEBT, new Date('2026-10-28T00:00:00.000Z'))).toBe(false);
  });

  it('multa suspensa não se paga; recusada volta a ser cobrada', () => {
    expect(canPayDebt({ ...DEBT, status: 'suspended' })).toBe(false);
    expect(debtStatusKey({ ...DEBT, status: 'suspended' })).toBe('suspended');
    const rejected = { ...DEBT, forceMajeureStatus: 'rejected' as const };
    expect(debtStatusKey(rejected)).toBe('rejected');
    expect(canPayDebt(rejected)).toBe(true);
  });

  it('status do extrato: reclamação vem antes da contestação', () => {
    const base = {
      status: 'on_hold' as const,
      holdReasons: ['dispute', 'claim'] as Array<'dispute' | 'claim'>,
      canceledReason: null,
    };
    expect(payoutStatusKey(base as never)).toBe('claim');
    expect(payoutStatusKey({ ...base, holdReasons: ['dispute'] } as never)).toBe('dispute');
    expect(
      payoutStatusKey({
        status: 'canceled',
        canceledReason: 'dispute_lost',
        holdReasons: [],
      } as never)
    ).toBe('dispute_lost');
  });
});

describe('ForceMajeureDialog (D16 3A)', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    await i18n.changeLanguage('pt-BR');
  });

  it('exige motivo de 10 caracteres e prova antes de enviar', async () => {
    const onDeclared = vi.fn();
    render(<ForceMajeureDialog debt={DEBT} onClose={vi.fn()} onDeclared={onDeclared} />);
    fireEvent.click(screen.getByRole('button', { name: 'Enviar para análise' }));
    expect(await screen.findByText(/pelo menos 10 caracteres/)).toBeTruthy();
    fireEvent.change(screen.getByLabelText('O que aconteceu'), {
      target: { value: 'Vento acima de 40 nós, travessia proibida.' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Enviar para análise' }));
    expect(await screen.findByText('Anexe uma prova.')).toBeTruthy();
    expect(m.declare).not.toHaveBeenCalled();

    const proof = new File(['%PDF'], 'prova.pdf', { type: 'application/pdf' });
    fireEvent.change(document.querySelector('input[type="file"]') as HTMLInputElement, {
      target: { files: [proof] },
    });
    m.declare.mockResolvedValue({ ...DEBT, status: 'suspended' });
    fireEvent.click(screen.getByRole('button', { name: 'Enviar para análise' }));
    await waitFor(() => expect(onDeclared).toHaveBeenCalled());
    expect(m.declare).toHaveBeenCalledWith('debt-1', {
      reason: 'Vento acima de 40 nós, travessia proibida.',
      proof,
    });
  });

  it('erro da API traduzido pelo código', async () => {
    m.declare.mockRejectedValue(new Error('FORCE_MAJEURE_TOO_LATE'));
    render(<ForceMajeureDialog debt={DEBT} onClose={vi.fn()} onDeclared={vi.fn()} />);
    fireEvent.change(screen.getByLabelText('O que aconteceu'), {
      target: { value: 'Interdição da praia pela prefeitura.' },
    });
    fireEvent.change(document.querySelector('input[type="file"]') as HTMLInputElement, {
      target: { files: [new File(['x'], 'foto.jpg', { type: 'image/jpeg' })] },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Enviar para análise' }));
    expect(await screen.findByText(/antes do vencimento da multa/)).toBeTruthy();
  });
});

=== src/domain/payment/factory.ts — ARQUIVO REESCRITO, substitua todo o conteúdo por este ===
import { ApiPaymentAdapter } from './api/apiPaymentAdapter';
import { ApiReceivablesAdapter } from './api/apiReceivablesAdapter';
import { PaymentApiPort } from './ports/paymentApiPort';
import type { ReceivablesApiPort } from './ports/receivablesApiPort';

export const paymentApiAdapter: PaymentApiPort = new ApiPaymentAdapter();
export const receivablesApiAdapter: ReceivablesApiPort = new ApiReceivablesAdapter();

=== src/domain/payment/hooks/usePartnerDebts.ts — ARQUIVO NOVO, conteúdo completo ===
import { useCallback, useEffect, useState } from 'react';
import { listDebtsUseCase } from '../application/usecases/listDebtsUseCase';
import type { AccountDebtView } from '../types/receivables';
import { receivablesErrorKey } from '../utils/receivablesFormat';

export function usePartnerDebts() {
  const [debts, setDebts] = useState<AccountDebtView[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setDebts(await listDebtsUseCase());
    } catch (err) {
      setError(receivablesErrorKey(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { debts, loading, error, reload };
}

=== src/domain/payment/hooks/usePartnerPayouts.ts — ARQUIVO NOVO, conteúdo completo ===
import { useCallback, useEffect, useState } from 'react';
import { listPayoutsUseCase } from '../application/usecases/listPayoutsUseCase';
import type { PayoutEntryView } from '../types/receivables';
import { receivablesErrorKey } from '../utils/receivablesFormat';

/** Extrato por venda, paginado por cursor; `accountKey` filtra um CNPJ. */
export function usePartnerPayouts(accountKey?: string) {
  const [entries, setEntries] = useState<PayoutEntryView[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (cursor?: string) => {
      setLoading(true);
      setError(null);
      try {
        const page = await listPayoutsUseCase({ accountKey, cursor });
        setEntries((current) => (cursor ? [...current, ...page.data] : page.data));
        setNextCursor(page.nextCursor);
      } catch (err) {
        setError(receivablesErrorKey(err));
      } finally {
        setLoading(false);
      }
    },
    [accountKey]
  );

  useEffect(() => {
    void load();
  }, [load]);

  return {
    entries,
    loading,
    error,
    hasMore: nextCursor !== null,
    reload: () => load(),
    loadMore: () => (nextCursor ? load(nextCursor) : Promise.resolve()),
  };
}

=== src/domain/payment/ports/receivablesApiPort.ts — ARQUIVO NOVO, conteúdo completo ===
import type { AccountDebtView, PayoutPage } from '../types/receivables';

export interface ReceivablesApiPort {
  listPayouts(query: { accountKey?: string; cursor?: string; limit?: number }): Promise<PayoutPage>;
  listDebts(): Promise<AccountDebtView[]>;
  startDebtPayment(debtId: string): Promise<{ clientSecret: string }>;
  declareForceMajeure(
    debtId: string,
    declaration: { reason: string; proofPath: string }
  ): Promise<AccountDebtView>;
}

=== src/domain/payment/types/receivables.ts — ARQUIVO NOVO, conteúdo completo ===
/** Extrato e dívidas do parceiro (D14, D16), como a API devolve. */
export type PayoutEntryStatus = 'pending' | 'on_hold' | 'released' | 'canceled';
export type PayoutHoldReason = 'dispute' | 'claim';

export interface PayoutEntryView {
  id: string;
  referenceType: 'ticket_order' | 'booking' | string;
  referenceId: string;
  title: string | null;
  accountKey: string;
  grossMinor: number;
  /** Taxa de serviço paga pelo comprador: não sai do valor do parceiro. */
  serviceFeeMinor: number;
  refundedMinor: number;
  platformFeeMinor: number;
  partnerAmountMinor: number;
  offsetMinor: number;
  status: PayoutEntryStatus;
  holdReasons: PayoutHoldReason[];
  serviceEndsAt: string;
  releaseAt: string;
  releasedAt: string | null;
  canceledReason: 'fully_refunded' | 'dispute_lost' | null;
  createdAt: string;
}

export interface PayoutPage {
  data: PayoutEntryView[];
  nextCursor: string | null;
}

export type AccountDebtReason = 'cancellation_penalty' | 'dispute_lost' | 'post_release_refund';
export type AccountDebtStatus = 'open' | 'suspended' | 'paid' | 'waived';
export type ForceMajeureStatus = 'pending' | 'approved' | 'rejected';

export interface AccountDebtView {
  id: string;
  accountKey: string;
  reason: AccountDebtReason;
  referenceType: string;
  amountMinor: number;
  remainingMinor: number;
  status: AccountDebtStatus;
  dueAt: string;
  overdue: boolean;
  forceMajeureStatus?: ForceMajeureStatus;
  createdAt: string;
}

=== src/domain/payment/utils/receivablesFormat.ts — ARQUIVO NOVO, conteúdo completo ===
/** Datas do repasse no fuso do negócio (AGENTS.md §1, §12.4). */
export function formatFortalezaDateTime(iso: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    timeZone: 'America/Fortaleza',
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));
}

const KNOWN_ERRORS = [
  'NOT_FOUND',
  'DEBT_ALREADY_SETTLED',
  'DEBT_SUSPENDED',
  'FORCE_MAJEURE_ALREADY_DECLARED',
  'FORCE_MAJEURE_TOO_LATE',
  'FORCE_MAJEURE_NOT_ALLOWED',
  'INVALID_PROOF_FILE',
  'IMAGE_TOO_LARGE',
  'INVALID_DOCUMENT_FILE',
];

/** Erros chegam pelo `code` da API (AGENTS.md §12.5); o texto vem das traduções. */
export function receivablesErrorKey(error: unknown): string {
  const code = error instanceof Error ? error.message : '';
  return `receivables.errors.${KNOWN_ERRORS.includes(code) ? code : 'UNAVAILABLE'}`;
}

=== src/shared/context/ThemeContext.tsx — diff ===
@@ -66,6 +66,11 @@ export function ThemeProvider({ children }: { children: React.ReactNode }) {
   );
 }
 
+/** Tema efetivo para componentes que também aparecem fora do provider (testes, prévias); padrão escuro. */
+export function useResolvedTheme(): 'light' | 'dark' {
+  return useContext(ThemeContext)?.resolvedTheme ?? 'dark';
+}
+
 export function useTheme() {
   const context = useContext(ThemeContext);
   if (!context) {

=== src/shared/i18n/receivablesResources.ts — ARQUIVO NOVO, conteúdo completo ===
/** Textos do extrato e das dívidas do parceiro (D14, D16). pt-BR é a fonte. */
export interface ReceivablesTranslation {
  tabs: { label: string; accounts: string; statement: string; debts: string };
  blockedBanner: string;
  statement: {
    title: string;
    hint: string;
    filterLabel: string;
    allAccounts: string;
    loading: string;
    empty: string;
    loadMore: string;
    fallbackTicket: string;
    fallbackBooking: string;
    serviceEnd: string;
    gross: string;
    serviceFee: string;
    refunded: string;
    platformFee: string;
    offset: string;
    toReceive: string;
    received: string;
    releaseOn: string;
    releasedOn: string;
    status: {
      pending: string;
      claim: string;
      dispute: string;
      released: string;
      fully_refunded: string;
      dispute_lost: string;
    };
  };
  debts: {
    title: string;
    hint: string;
    loading: string;
    empty: string;
    reason: {
      cancellation_penalty: string;
      dispute_lost: string;
      post_release_refund: string;
    };
    status: {
      open: string;
      overdue: string;
      suspended: string;
      paid: string;
      waived: string;
      rejected: string;
    };
    amount: string;
    remaining: string;
    dueOn: string;
    overdueExplain: string;
    pay: string;
    declare: string;
  };
  payDialog: {
    title: string;
    description: string;
    loading: string;
    submit: string;
    sent: string;
  };
  forceMajeure: {
    title: string;
    description: string;
    reasonLabel: string;
    reasonHint: string;
    proofLabel: string;
    proofHint: string;
    proofPick: string;
    submit: string;
    sending: string;
    sent: string;
    reasonTooShort: string;
    proofRequired: string;
  };
  errors: Record<
    | 'NOT_FOUND'
    | 'DEBT_ALREADY_SETTLED'
    | 'DEBT_SUSPENDED'
    | 'FORCE_MAJEURE_ALREADY_DECLARED'
    | 'FORCE_MAJEURE_TOO_LATE'
    | 'FORCE_MAJEURE_NOT_ALLOWED'
    | 'INVALID_PROOF_FILE'
    | 'IMAGE_TOO_LARGE'
    | 'INVALID_DOCUMENT_FILE'
    | 'UNAVAILABLE',
    string
  >;
}

export const receivablesPtBR: ReceivablesTranslation = {
  tabs: {
    label: 'Seções de recebimentos',
    accounts: 'Contas',
    statement: 'Extrato',
    debts: 'Dívidas',
  },
  blockedBanner:
    'Vendas pausadas: um CNPJ seu tem dívida vencida. Pague em Dívidas para voltar a vender; enquanto isso, os repasses pendentes quitam a dívida.',
  statement: {
    title: 'Extrato por venda',
    hint: 'O valor de cada venda é repassado 48 h depois do fim do serviço, se não houver reclamação.',
    filterLabel: 'CNPJ',
    allAccounts: 'Todos os CNPJs',
    loading: 'Carregando extrato…',
    empty: 'Nenhuma venda ainda.',
    loadMore: 'Carregar mais',
    fallbackTicket: 'Ingressos',
    fallbackBooking: 'Reserva',
    serviceEnd: 'Fim do serviço: {{date}}',
    gross: 'Venda',
    serviceFee: 'Taxa de serviço (paga pelo comprador)',
    refunded: 'Reembolsado',
    platformFee: 'Taxa da plataforma',
    offset: 'Descontado de dívidas',
    toReceive: 'A receber',
    received: 'Repassado',
    releaseOn: 'Previsão: {{date}}',
    releasedOn: 'Repassado em {{date}}',
    status: {
      pending: 'Aguardando liberação',
      claim: 'Retido: reclamação em análise',
      dispute: 'Retido: contestação no cartão',
      released: 'Repassado',
      fully_refunded: 'Reembolsado ao comprador',
      dispute_lost: 'Contestação perdida',
    },
  },
  debts: {
    title: 'Dívidas com a plataforma',
    hint: 'Pague no cartão ou Pix em até 24 h. Depois disso, a dívida é descontada dos repasses e as vendas do CNPJ ficam pausadas até quitar.',
    loading: 'Carregando dívidas…',
    empty: 'Nenhuma dívida. Tudo em dia.',
    reason: {
      cancellation_penalty: 'Multa de cancelamento (20% do vendido)',
      dispute_lost: 'Contestação perdida sem prova de uso',
      post_release_refund: 'Reembolso depois do repasse',
    },
    status: {
      open: 'Em aberto',
      overdue: 'Vencida',
      suspended: 'Força maior em análise',
      paid: 'Paga',
      waived: 'Perdoada',
      rejected: 'Força maior recusada',
    },
    amount: 'Valor',
    remaining: 'Falta pagar',
    dueOn: 'Vence em {{date}}',
    overdueExplain: 'Vencida: as vendas deste CNPJ estão pausadas.',
    pay: 'Pagar',
    declare: 'Declarar força maior',
  },
  payDialog: {
    title: 'Pagar dívida',
    description: 'Cartão ou Pix. A dívida é quitada assim que o Stripe confirmar o pagamento.',
    loading: 'Preparando o pagamento…',
    submit: 'Pagar {{amount}}',
    sent: 'Pagamento enviado. A dívida é quitada assim que o Stripe confirmar.',
  },
  forceMajeure: {
    title: 'Declarar força maior',
    description:
      'Use quando o cancelamento foi causado por algo fora do seu controle (ex.: vento acima do limite, interdição pelas autoridades). Até a análise, a multa fica suspensa. Aprovada, a multa é perdoada; recusada, volta a valer com 24 h para pagar.',
    reasonLabel: 'O que aconteceu',
    reasonHint: 'De 10 a 500 caracteres. Só a equipe da plataforma lê.',
    proofLabel: 'Prova',
    proofHint: 'PDF ou foto (JPEG, PNG ou WebP), até 6 MB. Fica numa pasta privada.',
    proofPick: 'Escolher arquivo',
    submit: 'Enviar para análise',
    sending: 'Enviando…',
    sent: 'Recebemos sua declaração. A multa fica suspensa até a análise.',
    reasonTooShort: 'Descreva o que aconteceu em pelo menos 10 caracteres.',
    proofRequired: 'Anexe uma prova.',
  },
  errors: {
    NOT_FOUND: 'Dívida não encontrada.',
    DEBT_ALREADY_SETTLED: 'Esta dívida já foi quitada.',
    DEBT_SUSPENDED: 'Esta multa está suspensa enquanto a força maior é analisada.',
    FORCE_MAJEURE_ALREADY_DECLARED: 'A força maior desta multa já foi declarada.',
    FORCE_MAJEURE_TOO_LATE: 'A força maior precisa ser declarada antes do vencimento da multa.',
    FORCE_MAJEURE_NOT_ALLOWED: 'Força maior vale só para a multa de cancelamento.',
    INVALID_PROOF_FILE: 'Arquivo de prova inválido. Envie de novo.',
    IMAGE_TOO_LARGE: 'Arquivo acima de 6 MB.',
    INVALID_DOCUMENT_FILE: 'Envie um PDF ou uma foto JPEG, PNG ou WebP.',
    UNAVAILABLE: 'Não foi possível concluir agora. Tente de novo.',
  },
};

export const receivablesEn: ReceivablesTranslation = {
  tabs: { label: 'Payout sections', accounts: 'Accounts', statement: 'Statement', debts: 'Debts' },
  blockedBanner:
    'Sales paused: one of your CNPJs has an overdue debt. Pay it under Debts to sell again; meanwhile, pending payouts settle the debt.',
  statement: {
    title: 'Statement by sale',
    hint: 'Each sale is paid out 48 h after the service ends, unless there is a complaint.',
    filterLabel: 'CNPJ',
    allAccounts: 'All CNPJs',
    loading: 'Loading statement…',
    empty: 'No sales yet.',
    loadMore: 'Load more',
    fallbackTicket: 'Tickets',
    fallbackBooking: 'Booking',
    serviceEnd: 'Service ends: {{date}}',
    gross: 'Sale',
    serviceFee: 'Service fee (paid by the buyer)',
    refunded: 'Refunded',
    platformFee: 'Platform fee',
    offset: 'Deducted for debts',
    toReceive: 'To receive',
    received: 'Paid out',
    releaseOn: 'Expected: {{date}}',
    releasedOn: 'Paid out on {{date}}',
    status: {
      pending: 'Awaiting release',
      claim: 'On hold: complaint under review',
      dispute: 'On hold: card dispute',
      released: 'Paid out',
      fully_refunded: 'Refunded to the buyer',
      dispute_lost: 'Dispute lost',
    },
  },
  debts: {
    title: 'Debts with the platform',
    hint: 'Pay by card or Pix within 24 h. After that, the debt is deducted from payouts and the CNPJ’s sales are paused until it is settled.',
    loading: 'Loading debts…',
    empty: 'No debts. All settled.',
    reason: {
      cancellation_penalty: 'Cancellation penalty (20% of sales)',
      dispute_lost: 'Dispute lost without proof of use',
      post_release_refund: 'Refund after payout',
    },
    status: {
      open: 'Open',
      overdue: 'Overdue',
      suspended: 'Force majeure under review',
      paid: 'Paid',
      waived: 'Waived',
      rejected: 'Force majeure rejected',
    },
    amount: 'Amount',
    remaining: 'Left to pay',
    dueOn: 'Due on {{date}}',
    overdueExplain: 'Overdue: sales for this CNPJ are paused.',
    pay: 'Pay',
    declare: 'Declare force majeure',
  },
  payDialog: {
    title: 'Pay debt',
    description: 'Card or Pix. The debt is settled as soon as Stripe confirms the payment.',
    loading: 'Preparing payment…',
    submit: 'Pay {{amount}}',
    sent: 'Payment sent. The debt is settled as soon as Stripe confirms.',
  },
  forceMajeure: {
    title: 'Declare force majeure',
    description:
      'Use it when the cancellation was caused by something beyond your control (e.g. wind above the limit, closure by the authorities). Until the review, the penalty is suspended. If approved, the penalty is waived; if rejected, it applies again with 24 h to pay.',
    reasonLabel: 'What happened',
    reasonHint: '10 to 500 characters. Only the platform team reads it.',
    proofLabel: 'Proof',
    proofHint: 'PDF or photo (JPEG, PNG or WebP), up to 6 MB. Kept in a private folder.',
    proofPick: 'Choose file',
    submit: 'Send for review',
    sending: 'Sending…',
    sent: 'We received your declaration. The penalty is suspended until the review.',
    reasonTooShort: 'Describe what happened in at least 10 characters.',
    proofRequired: 'Attach a proof.',
  },
  errors: {
    NOT_FOUND: 'Debt not found.',
    DEBT_ALREADY_SETTLED: 'This debt has already been settled.',
    DEBT_SUSPENDED: 'This penalty is suspended while the force majeure is reviewed.',
    FORCE_MAJEURE_ALREADY_DECLARED: 'Force majeure has already been declared for this penalty.',
    FORCE_MAJEURE_TOO_LATE: 'Force majeure must be declared before the penalty is due.',
    FORCE_MAJEURE_NOT_ALLOWED: 'Force majeure only applies to the cancellation penalty.',
    INVALID_PROOF_FILE: 'Invalid proof file. Please upload it again.',
    IMAGE_TOO_LARGE: 'File larger than 6 MB.',
    INVALID_DOCUMENT_FILE: 'Upload a PDF or a JPEG, PNG or WebP photo.',
    UNAVAILABLE: 'Could not complete this now. Please try again.',
  },
};

export const receivablesFr: ReceivablesTranslation = {
  tabs: {
    label: 'Sections des versements',
    accounts: 'Comptes',
    statement: 'Relevé',
    debts: 'Dettes',
  },
  blockedBanner:
    'Ventes suspendues : l’un de vos CNPJ a une dette échue. Payez-la dans Dettes pour vendre à nouveau ; en attendant, les versements en attente règlent la dette.',
  statement: {
    title: 'Relevé par vente',
    hint: 'Chaque vente est versée 48 h après la fin du service, sauf réclamation.',
    filterLabel: 'CNPJ',
    allAccounts: 'Tous les CNPJ',
    loading: 'Chargement du relevé…',
    empty: 'Aucune vente pour l’instant.',
    loadMore: 'Charger plus',
    fallbackTicket: 'Billets',
    fallbackBooking: 'Réservation',
    serviceEnd: 'Fin du service : {{date}}',
    gross: 'Vente',
    serviceFee: 'Frais de service (payés par l’acheteur)',
    refunded: 'Remboursé',
    platformFee: 'Commission de la plateforme',
    offset: 'Déduit pour dettes',
    toReceive: 'À recevoir',
    received: 'Versé',
    releaseOn: 'Prévu : {{date}}',
    releasedOn: 'Versé le {{date}}',
    status: {
      pending: 'En attente de déblocage',
      claim: 'Retenu : réclamation en cours',
      dispute: 'Retenu : contestation de carte',
      released: 'Versé',
      fully_refunded: 'Remboursé à l’acheteur',
      dispute_lost: 'Contestation perdue',
    },
  },
  debts: {
    title: 'Dettes envers la plateforme',
    hint: 'Payez par carte ou Pix sous 24 h. Ensuite, la dette est déduite des versements et les ventes du CNPJ sont suspendues jusqu’au règlement.',
    loading: 'Chargement des dettes…',
    empty: 'Aucune dette. Tout est réglé.',
    reason: {
      cancellation_penalty: 'Pénalité d’annulation (20 % des ventes)',
      dispute_lost: 'Contestation perdue sans preuve d’utilisation',
      post_release_refund: 'Remboursement après versement',
    },
    status: {
      open: 'Ouverte',
      overdue: 'Échue',
      suspended: 'Force majeure en cours d’examen',
      paid: 'Payée',
      waived: 'Annulée',
      rejected: 'Force majeure refusée',
    },
    amount: 'Montant',
    remaining: 'Reste à payer',
    dueOn: 'Échéance le {{date}}',
    overdueExplain: 'Échue : les ventes de ce CNPJ sont suspendues.',
    pay: 'Payer',
    declare: 'Déclarer une force majeure',
  },
  payDialog: {
    title: 'Payer la dette',
    description: 'Carte ou Pix. La dette est réglée dès que Stripe confirme le paiement.',
    loading: 'Préparation du paiement…',
    submit: 'Payer {{amount}}',
    sent: 'Paiement envoyé. La dette est réglée dès que Stripe confirme.',
  },
  forceMajeure: {
    title: 'Déclarer une force majeure',
    description:
      'À utiliser quand l’annulation est due à un événement hors de votre contrôle (ex. : vent au-dessus de la limite, fermeture par les autorités). Jusqu’à l’examen, la pénalité est suspendue. Acceptée, la pénalité est annulée ; refusée, elle s’applique à nouveau avec 24 h pour payer.',
    reasonLabel: 'Ce qui s’est passé',
    reasonHint: 'De 10 à 500 caractères. Seule l’équipe de la plateforme le lit.',
    proofLabel: 'Preuve',
    proofHint: 'PDF ou photo (JPEG, PNG ou WebP), jusqu’à 6 Mo. Conservée dans un dossier privé.',
    proofPick: 'Choisir un fichier',
    submit: 'Envoyer pour examen',
    sending: 'Envoi…',
    sent: 'Nous avons reçu votre déclaration. La pénalité est suspendue jusqu’à l’examen.',
    reasonTooShort: 'Décrivez ce qui s’est passé en au moins 10 caractères.',
    proofRequired: 'Joignez une preuve.',
  },
  errors: {
    NOT_FOUND: 'Dette introuvable.',
    DEBT_ALREADY_SETTLED: 'Cette dette a déjà été réglée.',
    DEBT_SUSPENDED: 'Cette pénalité est suspendue pendant l’examen de la force majeure.',
    FORCE_MAJEURE_ALREADY_DECLARED: 'La force majeure a déjà été déclarée pour cette pénalité.',
    FORCE_MAJEURE_TOO_LATE: 'La force majeure doit être déclarée avant l’échéance de la pénalité.',
    FORCE_MAJEURE_NOT_ALLOWED: 'La force majeure ne vaut que pour la pénalité d’annulation.',
    INVALID_PROOF_FILE: 'Fichier de preuve invalide. Renvoyez-le.',
    IMAGE_TOO_LARGE: 'Fichier de plus de 6 Mo.',
    INVALID_DOCUMENT_FILE: 'Envoyez un PDF ou une photo JPEG, PNG ou WebP.',
    UNAVAILABLE: 'Impossible de terminer maintenant. Réessayez.',
  },
};

=== src/shared/i18n/resources.ts — diff ===
@@ -22,6 +22,12 @@ import {
   paymentAccountsFr,
   paymentAccountsPtBR,
 } from './paymentAccountsResources';
+import {
+  type ReceivablesTranslation,
+  receivablesEn,
+  receivablesFr,
+  receivablesPtBR,
+} from './receivablesResources';
 import {
   type PartnersTranslation,
   partnersEn,
@@ -60,6 +66,7 @@ export interface TranslationResource {
   listingPlan: ListingPlanTranslation;
   partners: PartnersTranslation;
   paymentAccounts: PaymentAccountsTranslation;
+  receivables: ReceivablesTranslation;
   salesPolicy: SalesPolicyTranslation;
   ticketCheckout: TicketCheckoutTranslation;
   ticketWallet: TicketWalletTranslation;
@@ -242,6 +249,8 @@ export interface TranslationResource {
     checkoutResultMissing: string;
     planPaymentTitle: string;
     planPaymentDescription: string;
+    debtPaymentTitle: string;
+    debtPaymentDescription: string;
     openPartnerArea: string;
     partnerAreaTitle: string;
     partnerLoginRequired: string;
@@ -284,6 +293,7 @@ const ptBR: TranslationResource = {
   listingPlan: listingPlanPtBR,
   partners: partnersPtBR,
   paymentAccounts: paymentAccountsPtBR,
+  receivables: receivablesPtBR,
   salesPolicy: salesPolicyPtBR,
   ticketCheckout: ticketCheckoutPtBR,
   ticketWallet: ticketWalletPtBR,
@@ -510,6 +520,9 @@ const ptBR: TranslationResource = {
     checkoutResultMissing: 'Não encontramos o pedido deste pagamento.',
     planPaymentTitle: 'Pagamento do plano em processamento',
     planPaymentDescription: 'Assim que o Stripe confirmar, o selo aparece na sua área de parceiro.',
+    debtPaymentTitle: 'Pagamento da dívida em processamento',
+    debtPaymentDescription:
+      'Assim que o Stripe confirmar, a dívida aparece como paga em Recebimentos e as vendas voltam.',
     openPartnerArea: 'Abrir área do parceiro',
     partnerAreaTitle: 'Área do parceiro',
     partnerLoginRequired: 'Entre na sua conta de parceiro para abrir o painel.',
@@ -558,6 +571,7 @@ const en: TranslationResource = {
   listingPlan: listingPlanEn,
   partners: partnersEn,
   paymentAccounts: paymentAccountsEn,
+  receivables: receivablesEn,
   salesPolicy: salesPolicyEn,
   ticketCheckout: ticketCheckoutEn,
   ticketWallet: ticketWalletEn,
@@ -778,6 +792,9 @@ const en: TranslationResource = {
     checkoutResultMissing: 'We could not find the order for this payment.',
     planPaymentTitle: 'Plan payment processing',
     planPaymentDescription: 'As soon as Stripe confirms, the badge appears in your partner area.',
+    debtPaymentTitle: 'Debt payment processing',
+    debtPaymentDescription:
+      'As soon as Stripe confirms, the debt shows as paid under Payouts and sales resume.',
     openPartnerArea: 'Open partner area',
     partnerAreaTitle: 'Partner area',
     partnerLoginRequired: 'Sign in to your partner account to open the dashboard.',
@@ -826,6 +843,7 @@ const fr: TranslationResource = {
   listingPlan: listingPlanFr,
   partners: partnersFr,
   paymentAccounts: paymentAccountsFr,
+  receivables: receivablesFr,
   salesPolicy: salesPolicyFr,
   ticketCheckout: ticketCheckoutFr,
   ticketWallet: ticketWalletFr,
@@ -1054,6 +1072,9 @@ const fr: TranslationResource = {
     planPaymentDescription:
       'Dès que Stripe confirme, le badge apparaît dans votre espace partenaire.',
     openPartnerArea: 'Ouvrir l’espace partenaire',
+    debtPaymentTitle: 'Paiement de la dette en cours',
+    debtPaymentDescription:
+      'Dès que Stripe confirme, la dette apparaît comme payée dans Versements et les ventes reprennent.',
     partnerAreaTitle: 'Espace partenaire',
     partnerLoginRequired:
       'Connectez-vous à votre compte partenaire pour ouvrir le tableau de bord.',

VERIFICAÇÃO (obrigatória):
- `npm run typecheck`, `npx biome lint .` (0 erros; arquivos tocados sem avisos), `npm run build`;
- testes ligados aos arquivos deste prompt: `npx vitest related --run server/application/usecases/bookings/reconcileBookingWebhookApplicationUseCase.test.ts server/application/usecases/bookings/reconcileBookingWebhookApplicationUseCase.ts server/application/usecases/paymentAccounts/listPartnerPayoutsApplicationUseCase.ts server/application/usecases/paymentAccounts/paymentAccountApplicationUseCases.test.ts server/application/usecases/payouts/recordPaidSalePayoutApplicationUseCase.ts server/application/usecases/reconcileStripeWebhookEventApplicationUseCase.ts server/application/usecases/ticketingPaymentOrchestration.test.ts server/domain/payment/adapters/firestorePayoutEntryAdapter.ts server/domain/payment/adapters/inMemoryPayoutEntryAdapter.ts server/domain/payment/index.ts server/domain/payment/ports/payoutEntryRepositoryPort.ts server/domain/payment/services/payoutService.test.ts server/domain/payment/services/payoutService.ts server/domain/payment/services/saleClaimService.test.ts server/domain/payment/types/payoutEntry.ts server/domain/payment/usecases/listPayoutEntriesUseCase.ts server/interfaces/http/paymentAccounts/paymentAccountController.ts server/interfaces/http/paymentAccounts/paymentAccountRoutes.ts server/interfaces/http/paymentAccounts/schemas/paymentAccountSchemas.ts src/app/compositions/CheckoutResultComposition.tsx src/domain/payment/adapters/ui/StripePaymentElement.tsx src/domain/payment/api/apiReceivablesAdapter.ts src/domain/payment/application/usecases/declareForceMajeureUseCase.ts src/domain/payment/application/usecases/listDebtsUseCase.ts src/domain/payment/application/usecases/listPayoutsUseCase.ts src/domain/payment/application/usecases/startDebtPaymentUseCase.ts src/domain/payment/components/PartnerStripeConnectPortal.test.tsx src/domain/payment/components/PartnerStripeConnectPortal.tsx src/domain/payment/components/receivables/DebtCard.tsx src/domain/payment/components/receivables/DebtList.tsx src/domain/payment/components/receivables/DebtPaymentDialog.tsx src/domain/payment/components/receivables/ForceMajeureDialog.tsx src/domain/payment/components/receivables/PayoutEntryRow.tsx src/domain/payment/components/receivables/PayoutStatement.tsx src/domain/payment/components/receivables/ReceivablesState.tsx src/domain/payment/components/receivables/ReceivablesTabs.tsx src/domain/payment/components/receivables/debtStatus.ts src/domain/payment/components/receivables/payoutStatus.ts src/domain/payment/components/receivables/receivables.test.tsx src/domain/payment/factory.ts src/domain/payment/hooks/usePartnerDebts.ts src/domain/payment/hooks/usePartnerPayouts.ts src/domain/payment/ports/receivablesApiPort.ts src/domain/payment/types/receivables.ts src/domain/payment/utils/receivablesFormat.ts src/shared/context/ThemeContext.tsx src/shared/i18n/receivablesResources.ts src/shared/i18n/resources.ts` (todos verdes). Não precisa rodar a suíte inteira.
- abra Recebimentos no painel do parceiro, nos temas claro e escuro, e confira as abas Extrato e Dívidas.

LIMPEZA (obrigatória, ao terminar de implementar): apague todos os arquivos de public/assets/aistudio/, inclusive o deste prompt. São cópias dos textos colados no chat, salvas automaticamente pelo AI Studio, e public/ vai para o site publicado. Se a pasta ficar vazia, apague a pasta também.
~~~~

### Configurações manuais (você faz, fora do AI Studio, depois de aplicar este prompt)

1. Publique os índices do Firestore: `firebase deploy --only firestore:indexes`. Espere o índice novo payoutEntries (accountKey, createdAt decrescente) ficar "Ativado" no Console do Firebase (Firestore → Índices) antes de abrir o Extrato.
2. Nenhuma variável de ambiente nova, nenhuma regra nova e nada no Stripe.
