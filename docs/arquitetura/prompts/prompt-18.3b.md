# Prompt 18.3b — Cobrança do plano por estabelecimento (backend)

> Lote 14, gerado do commit de referência `cd31a44` da branch `claude/agents-md-v2`. Aplique depois do 18.3a. Cole o bloco abaixo no agente do AI Studio, inteiro, de uma vez.

---

## Prompt 18.3b — Cobrança do plano por estabelecimento (D11, backend)

Decisão D11 (2026-10-19), detalhes de 2026-10-21.

~~~~text
Siga o AGENTS.md. NÃO altere o AGENTS.md. O app ainda não foi liberado para usuários: nenhum código de compatibilidade ou transição (§2.2 item 8). Dados de teste de plano e selo podem ser apagados e recriados.

IMPORTANTE: aplique os diffs abaixo EXATAMENTE, inclusive os arquivos novos e as remoções. Não reescreva os arquivos do seu jeito. Arquivo tocado sai sem avisos do lint (AGENTS.md §13). Nenhuma dependência nova.

DECISÃO D11 (docs/arquitetura/decisoes.md): plano "Use Guide Verificado", selo e destaque por estabelecimento. O selo só aparece com plano ativo do estabelecimento E verificação aprovada pelo admin (D12).

ATENÇÃO: este prompt é só o BACKEND. As telas passam a usar as rotas novas no 18.3.1. Até lá, ativar trial, comprar plano e o selo do admin pelo painel deixam de funcionar; isso é esperado.

O QUE MUDA:
1) Domínio payment:
   - assinatura em planSubscriptions/{itemId} (antes partnerSubscriptions/{partnerId}): uma por estabelecimento, um cliente Stripe por conta;
   - metadata com itemId; chave de idempotência sub_<itemId>_<chave>;
   - leitura, cancelamento e retomada por itemId, só do próprio parceiro;
   - cancelNow no gateway (cancelamento imediato) para as exclusões.
2) Pix avulso: CreatePlanPaymentIntentSchema exige itemId; a metadata e a transação levam itemId.
3) Aplicação:
   - assertListingPlanPurchasableApplicationUseCase: o estabelecimento é do comprador e já foi verificado; devolve a validade do plano em vigor, que vira período de teste na assinatura;
   - o erro sai como PaymentDomainError, porque payment não conhece partners (AGENTS.md §5.4).
4) HTTP /api/payment/plans:
   - POST /subscriptions com itemId;
   - GET /subscription?itemId=;
   - /subscription/cancel e /resume com { itemId };
   - a resposta da assinatura inclui itemId.
5) Excluir o estabelecimento cancela a assinatura dele; excluir a conta cancela todas (débito B24 resolvido).
6) firestore.rules: a regra de partnerSubscriptions passa a ser de planSubscriptions, com teste.

ARQUIVOS (crie, altere ou apague exatamente estes):
- docs/arquitetura/debitos.md (alterar)
- firestore.rules (alterar)
- firestore.rules.security.test.ts (alterar)
- server/application/usecases/deletePartnerItemApplicationUseCase.test.ts (alterar)
- server/application/usecases/deletePartnerItemApplicationUseCase.ts (alterar)
- server/application/usecases/deleteUserAccountApplicationUseCase.ts (alterar)
- server/application/usecases/listingPlans/assertListingPlanPurchasableApplicationUseCase.test.ts (criar)
- server/application/usecases/listingPlans/assertListingPlanPurchasableApplicationUseCase.ts (criar)
- server/application/usecases/startPartnerPlanSubscriptionApplicationUseCase.test.ts (alterar)
- server/application/usecases/startPartnerPlanSubscriptionApplicationUseCase.ts (alterar)
- server/domain/payment/adapters/firestorePlanSubscriptionAdapter.ts (alterar)
- server/domain/payment/adapters/stripeBillingGatewayAdapter.ts (alterar)
- server/domain/payment/controllers/paymentController.test.ts (alterar)
- server/domain/payment/controllers/paymentController.ts (alterar)
- server/domain/payment/index.ts (alterar)
- server/domain/payment/ports/billingGatewayPort.ts (alterar)
- server/domain/payment/ports/planSubscriptionRepositoryPort.ts (alterar)
- server/domain/payment/schemas/paymentSchema.test.ts (alterar)
- server/domain/payment/schemas/paymentSchema.ts (alterar)
- server/domain/payment/services/billingService.test.ts (alterar)
- server/domain/payment/services/billingService.ts (alterar)
- server/domain/payment/services/checkoutService.ts (alterar)
- server/domain/payment/services/stripePaymentService.ts (alterar)
- server/domain/payment/usecases/billing/cancelListingPlanSubscriptionUseCase.ts (criar)
- server/domain/payment/usecases/billing/cancelPartnerPlanSubscriptionsUseCase.ts (criar)
- server/domain/payment/usecases/billing/getListingPlanSubscriptionUseCase.ts (criar)
- server/domain/payment/usecases/billing/getPartnerPlanSubscriptionUseCase.ts (apagar)
- server/domain/payment/usecases/billing/setPlanSubscriptionCancelAtPeriodEndUseCase.ts (alterar)
- server/domain/payment/usecases/createPlanPaymentIntentUseCase.ts (alterar)
- server/interfaces/http/billing/billingController.test.ts (alterar)
- server/interfaces/http/billing/billingController.ts (alterar)
- server/interfaces/http/billing/schemas/billingSchemas.test.ts (alterar)
- server/interfaces/http/billing/schemas/billingSchemas.ts (alterar)

Aplique as mudanças abaixo EXATAMENTE como estão (formato unified diff: linhas com "-" saem, linhas com "+" entram; as demais são contexto para localizar o trecho). Não reformate outros trechos dos arquivos.

=== docs/arquitetura/debitos.md — diff ===
@@ -23,8 +23,8 @@
 
 | ID | Resolução |
 |---|---|
+| B24 | Prompt 18.3b: excluir o estabelecimento cancela na hora a assinatura dele no Stripe (`planSubscriptions/{itemId}`); excluir a conta cancela todas as assinaturas vivas dela antes de apagar os planos |
 | B23 | Prompt 18.3.0b (D12, P0): a conta do parceiro deixou de ter documento — o cadastro envia só `termsAccepted`; `partners/{uid}.cpfCnpj`, `cpfCnpjClean` e a coleção `partnerDocumentKeys` saíram do código, das regras e dos testes (resolve também o débito do §7.7); o status `pending` da conta saiu (só `active` e `suspended`); CPF/CNPJ existe apenas, cifrado e com índice cego, na verificação de cada estabelecimento (18.3.0a); `PartnersModal` dividido (529 → 257 linhas), com as condições de cada etapa em `utils/signupStepGates.ts` |
-| B24 | Excluir a conta ou o estabelecimento não cancela a assinatura do plano no Stripe (`partnerSubscriptions` hoje; `planSubscriptions` no 18.3b) | §7.5 e §8 (cobrança sem serviço) | alto — o cartão continua sendo cobrado | Prompt 18.3b: cancelar a assinatura do estabelecimento ao excluir o item ou a conta |
 | Erro no modal de detalhe e métricas zeradas — Prompt 18.2.3 | decisão de 2026-10-19 (opção B): `/api/insights/track` aceita visitante sem login (o token só é anexado quando há usuário); cada item grava dois contadores por dia (`viewsSignedIn`, `viewsAnonymous`) em `interactionStats`, sem uid nem IP; repetição em 30 min não soma (guarda `interactionGuards` com chave HMAC de uid/IP e TTL em `expiresAt`); o relatório mostra o total e a divisão em percentual; `/api/insights/stats/:colecao/:id` exige login e checa o dono no backend (antes o cliente chamava sem token e recebia sempre zero); `ReportsView` dividido e traduzido (sai de B16); `trust proxy` com número de proxies de `TRUST_PROXY_HOPS` (§7.4); handler global de erros do `server.ts` deixou de devolver `err.message` (§7.10 A05); `src/shared/lib/insights.ts` (sem uso, `shared → domain`) removido |
 | B19 | Prompt 18.2.2 (decisão de 2026-10-19): o contato do evento fica só nos campos do topo (`phone`, `websiteLink`, `instagramLink`, `bookingLink`), como nos itens do guia; o objeto `contact` deixou de ser lido e gravado; `eventsService` dividido em `EventsService` (anúncios) e `EventOccurrencesService` (sessões), com as regras de acesso em `eventAccess.ts` |
 | Sessões do evento no editor — Prompt 18.2.1 | `EventSessionsField` e `saveEventSessionsUseCase` (events) usados pelo parceiro e pelo admin (decisão de 2026-10-19, opção A): o parceiro passa a editar datas, horários e capacidade; a data do evento é derivada das sessões; o editor do admin deixa de importar o gerenciador de ingressos de outro domínio (§5.2); `PartnerEventForm` dividido em seções (634 → 67 linhas) e modal em `PartnerEventEditor` (`PartnerPanel` abaixo de 400 linhas); o editor de evento não fecha ao clicar fora; botões do editor de evento com nome acessível |

=== firestore.rules — diff ===
@@ -65,7 +65,7 @@ service cloud.firestore {
     match /paymentConnectedAccounts/{partnerId} {
       allow read, write: if false;
     }
-    match /partnerSubscriptions/{partnerId} {
+    match /planSubscriptions/{itemId} {
       allow read, write: if false;
     }
     match /bookableOffers/{offerId} {

=== firestore.rules.security.test.ts — diff ===
@@ -244,10 +244,10 @@ describe('Firestore Rules — Security Suite', () => {
       await assertFails(getDoc(doc(db, 'transactions/tx-2')));
     });
 
-    it('partner → own partnerSubscriptions read and write denied (server-only)', async () => {
+    it('partner → planSubscriptions do próprio estabelecimento negado (só backend, D11)', async () => {
       const db = testEnv.authenticatedContext('partner-1').firestore();
-      await assertFails(getDoc(doc(db, 'partnerSubscriptions/partner-1')));
-      await assertFails(setDoc(doc(db, 'partnerSubscriptions/partner-1'), { status: 'active' }));
+      await assertFails(getDoc(doc(db, 'planSubscriptions/item-1')));
+      await assertFails(setDoc(doc(db, 'planSubscriptions/item-1'), { status: 'active' }));
     });
 
     it('admin with admin=true claim → partners read allowed', async () => {

=== server/application/usecases/deletePartnerItemApplicationUseCase.test.ts — diff ===
@@ -25,6 +25,10 @@ vi.mock('../../domain/partners', () => ({
   deleteListingPlanUseCase: vi.fn(),
 }));
 
+vi.mock('../../domain/payment', () => ({
+  cancelListingPlanSubscriptionUseCase: vi.fn(),
+}));
+
 vi.mock('../../domain/media', () => ({
   deleteVerificationFileUseCase: vi.fn().mockResolvedValue(undefined),
 }));

=== server/application/usecases/deletePartnerItemApplicationUseCase.ts — diff ===
@@ -6,6 +6,7 @@ import {
   linkBusinessUseCase,
   unlinkBusinessUseCase,
 } from '../../domain/partners';
+import { cancelListingPlanSubscriptionUseCase } from '../../domain/payment';
 import { deleteVerificationFiles } from './listingVerification/deleteVerificationFiles';
 
 function isNotFoundError(error: unknown): boolean {
@@ -65,5 +66,7 @@ export async function deletePartnerItemApplicationUseCase(
 
   // Documento e arquivos de verificação saem junto com o estabelecimento (LGPD, §7.5).
   await deleteVerificationFiles(await deleteListingVerificationUseCase(id));
+  // O plano sai junto: a assinatura do estabelecimento para de cobrar na hora (B24).
+  await cancelListingPlanSubscriptionUseCase(id);
   await deleteListingPlanUseCase(id);
 }

=== server/application/usecases/deleteUserAccountApplicationUseCase.ts — diff ===
@@ -5,6 +5,7 @@ import {
   deleteOwnerListingVerificationsUseCase,
   deletePartnerProfileUseCase,
 } from '../../domain/partners';
+import { cancelPartnerPlanSubscriptionsUseCase } from '../../domain/payment';
 import { deleteReviewsByUserUseCase } from '../../domain/reviews';
 import { deleteUserAccountUseCase } from '../../domain/users';
 import { deleteVerificationFiles } from './listingVerification/deleteVerificationFiles';
@@ -16,7 +17,7 @@ export interface UserDeletionCoordinatorDependencies {
   deleteEventsByOwner?: (uid: string) => Promise<void>;
   /** Verificações, documentos cifrados e arquivos enviados (D12). */
   deleteListingVerifications?: (uid: string) => Promise<void>;
-  /** Planos dos estabelecimentos (D11). */
+  /** Planos dos estabelecimentos (D11): cancela as assinaturas no Stripe e apaga os planos. */
   deleteListingPlans?: (uid: string) => Promise<void>;
   deleteUserAccount: (uid: string) => Promise<void>;
 }
@@ -30,7 +31,10 @@ export async function deleteUserAccountApplicationUseCase(
     deleteEventsByOwner: (id) => deleteEventsByOwnerUseCase(id),
     deleteListingVerifications: async (id) =>
       deleteVerificationFiles(await deleteOwnerListingVerificationsUseCase(id)),
-    deleteListingPlans: (id) => deleteOwnerListingPlansUseCase(id),
+    deleteListingPlans: async (id) => {
+      await cancelPartnerPlanSubscriptionsUseCase(id);
+      await deleteOwnerListingPlansUseCase(id);
+    },
     deleteUserAccount: (id) => deleteUserAccountUseCase(id),
   }
 ): Promise<void> {

=== server/application/usecases/listingPlans/assertListingPlanPurchasableApplicationUseCase.test.ts — ARQUIVO NOVO, conteúdo completo ===
import { beforeEach, describe, expect, it, vi } from 'vitest';

const m = vi.hoisted(() => ({ load: vi.fn(), status: vi.fn(), assert: vi.fn(), until: vi.fn() }));

vi.mock('../../../domain/partners', async () => {
  const { ListingPlanError } = await import('../../../domain/partners/errors/listingPlanError');
  return {
    ListingPlanError,
    assertListingPlanPurchasableUseCase: m.assert,
    getListingPlanUntilUseCase: m.until,
    getListingVerificationStatusUseCase: m.status,
  };
});
vi.mock('./loadPlanListing', () => ({ loadPlanListing: m.load }));

import { ListingPlanError } from '../../../domain/partners/errors/listingPlanError';
import { PaymentDomainError } from '../../../domain/payment';
import { assertListingPlanPurchasableApplicationUseCase } from './assertListingPlanPurchasableApplicationUseCase';

describe('assertListingPlanPurchasableApplicationUseCase', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    m.load.mockResolvedValue({ id: 'item-1', ownerId: 'p1' });
    m.status.mockResolvedValue('approved');
  });

  it('devolve a validade do plano em vigor para não cobrar duas vezes', async () => {
    m.until.mockResolvedValue('2026-12-01T00:00:00.000Z');
    await expect(
      assertListingPlanPurchasableApplicationUseCase({ uid: 'p1' }, 'item-1')
    ).resolves.toEqual({ currentPlanUntil: '2026-12-01T00:00:00.000Z' });
  });

  it('erro do plano sai como PaymentDomainError com o mesmo código e status', async () => {
    m.assert.mockRejectedValue(
      new ListingPlanError('LISTING_PENDING_VERIFICATION', 'Verifique antes.')
    );
    const error = await assertListingPlanPurchasableApplicationUseCase(
      { uid: 'p1' },
      'item-1'
    ).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(PaymentDomainError);
    expect(error).toMatchObject({ code: 'LISTING_PENDING_VERIFICATION', statusCode: 422 });
    expect(m.until).not.toHaveBeenCalled();
  });
});

=== server/application/usecases/listingPlans/assertListingPlanPurchasableApplicationUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import {
  assertListingPlanPurchasableUseCase,
  getListingPlanUntilUseCase,
  getListingVerificationStatusUseCase,
  ListingPlanError,
} from '../../../domain/partners';
import { PaymentDomainError } from '../../../domain/payment';
import { loadPlanListing } from './loadPlanListing';

/**
 * Antes de cobrar o plano: o estabelecimento é do comprador e já foi verificado (D11). Devolve a
 * validade do plano em vigor, para a assinatura não cobrar de novo o período já pago. O erro sai
 * como `PaymentDomainError` porque `payment` é folha e não conhece `partners` (AGENTS.md §5.4).
 */
export async function assertListingPlanPurchasableApplicationUseCase(
  actor: { uid: string; admin?: boolean },
  itemId: string
): Promise<{ currentPlanUntil: string | null }> {
  try {
    const listing = await loadPlanListing(itemId);
    const verification = await getListingVerificationStatusUseCase(itemId);
    await assertListingPlanPurchasableUseCase(actor, listing, verification);
  } catch (error) {
    if (error instanceof ListingPlanError) {
      throw new PaymentDomainError(error.code, error.message, error.statusCode);
    }
    throw error;
  }
  return { currentPlanUntil: await getListingPlanUntilUseCase(itemId) };
}

=== server/application/usecases/startPartnerPlanSubscriptionApplicationUseCase.test.ts — diff ===
@@ -1,8 +1,9 @@
 import { beforeEach, describe, expect, it, vi } from 'vitest';
 
+const m = vi.hoisted(() => ({ assertPurchasable: vi.fn() }));
+
 vi.mock('../../domain/admin', () => ({ getSubscriptionPlanByIdUseCase: vi.fn() }));
 vi.mock('../../domain/partners', () => ({
-  getPartnerProfileUseCase: vi.fn(),
   isPaidListingPlanType: (value: string) =>
     value === 'monthly' || value === 'semi-annual' || value === 'annual',
 }));
@@ -10,13 +11,22 @@ vi.mock('../../domain/payment', async () => {
   const { PaymentDomainError } = await import('../../domain/payment/services/stripePaymentService');
   return { PaymentDomainError, startPlanSubscriptionUseCase: vi.fn().mockResolvedValue({}) };
 });
+vi.mock('./listingPlans/assertListingPlanPurchasableApplicationUseCase', () => ({
+  assertListingPlanPurchasableApplicationUseCase: m.assertPurchasable,
+}));
 
 import { getSubscriptionPlanByIdUseCase } from '../../domain/admin';
-import { getPartnerProfileUseCase } from '../../domain/partners';
 import { startPlanSubscriptionUseCase } from '../../domain/payment';
+import { PaymentDomainError } from '../../domain/payment/services/stripePaymentService';
 import { startPartnerPlanSubscriptionApplicationUseCase } from './startPartnerPlanSubscriptionApplicationUseCase';
 
 const ACTOR = { uid: 'p1', email: 'p1@example.com' };
+const INPUT = {
+  itemId: 'item-1',
+  planId: 'semi-annual',
+  locale: 'pt-BR' as const,
+  idempotencyKey: 'key-12345',
+};
 
 function mockPlan(overrides: Record<string, unknown> = {}) {
   vi.mocked(getSubscriptionPlanByIdUseCase).mockResolvedValue({
@@ -28,53 +38,43 @@ function mockPlan(overrides: Record<string, unknown> = {}) {
   } as never);
 }
 
-describe('startPartnerPlanSubscriptionApplicationUseCase', () => {
-  beforeEach(() => vi.clearAllMocks());
+describe('startPartnerPlanSubscriptionApplicationUseCase (D11)', () => {
+  beforeEach(() => {
+    vi.clearAllMocks();
+    m.assertPurchasable.mockResolvedValue({ currentPlanUntil: null });
+  });
 
   it('recusa plano que não é pago', async () => {
     await expect(
-      startPartnerPlanSubscriptionApplicationUseCase(ACTOR, {
-        planId: 'trial',
-        locale: 'pt-BR',
-        idempotencyKey: 'key-12345',
-      })
+      startPartnerPlanSubscriptionApplicationUseCase(ACTOR, { ...INPUT, planId: 'trial' })
     ).rejects.toMatchObject({ code: 'VALIDATION_ERROR' });
   });
 
   it('recusa plano inativo', async () => {
     mockPlan({ isActive: false });
     await expect(
-      startPartnerPlanSubscriptionApplicationUseCase(ACTOR, {
-        planId: 'semi-annual',
-        locale: 'pt-BR',
-        idempotencyKey: 'key-12345',
-      })
+      startPartnerPlanSubscriptionApplicationUseCase(ACTOR, INPUT)
     ).rejects.toMatchObject({ code: 'PLAN_INACTIVE' });
   });
 
-  it('recusa usuário sem cadastro de parceiro', async () => {
+  it('estabelecimento sem verificação não assina', async () => {
     mockPlan();
-    vi.mocked(getPartnerProfileUseCase).mockResolvedValue(null as never);
+    m.assertPurchasable.mockRejectedValue(
+      new PaymentDomainError('LISTING_PENDING_VERIFICATION', 'Verifique antes.', 422)
+    );
     await expect(
-      startPartnerPlanSubscriptionApplicationUseCase(ACTOR, {
-        planId: 'semi-annual',
-        locale: 'pt-BR',
-        idempotencyKey: 'key-12345',
-      })
-    ).rejects.toMatchObject({ code: 'FORBIDDEN', statusCode: 403 });
+      startPartnerPlanSubscriptionApplicationUseCase(ACTOR, INPUT)
+    ).rejects.toMatchObject({ code: 'LISTING_PENDING_VERIFICATION', statusCode: 422 });
+    expect(startPlanSubscriptionUseCase).not.toHaveBeenCalled();
   });
 
-  it('calcula o valor em centavos e o intervalo no backend', async () => {
+  it('valor e intervalo no backend; período já pago do estabelecimento vira teste', async () => {
     mockPlan();
-    vi.mocked(getPartnerProfileUseCase).mockResolvedValue({
-      verifiedUntil: '2026-12-01T00:00:00.000Z',
-    } as never);
-    await startPartnerPlanSubscriptionApplicationUseCase(ACTOR, {
-      planId: 'semi-annual',
-      locale: 'en',
-      idempotencyKey: 'key-12345',
-    });
+    m.assertPurchasable.mockResolvedValue({ currentPlanUntil: '2026-12-01T00:00:00.000Z' });
+    await startPartnerPlanSubscriptionApplicationUseCase(ACTOR, { ...INPUT, locale: 'en' });
+    expect(m.assertPurchasable).toHaveBeenCalledWith(ACTOR, 'item-1');
     expect(startPlanSubscriptionUseCase).toHaveBeenCalledWith({
+      itemId: 'item-1',
       partnerId: 'p1',
       email: 'p1@example.com',
       locale: 'en',
@@ -83,7 +83,7 @@ describe('startPartnerPlanSubscriptionApplicationUseCase', () => {
       amountMinor: 24990,
       interval: 'month',
       intervalCount: 6,
-      currentVerifiedUntil: null,
+      currentVerifiedUntil: '2026-12-01T00:00:00.000Z',
       idempotencyKey: 'key-12345',
     });
   });

=== server/application/usecases/startPartnerPlanSubscriptionApplicationUseCase.ts — diff ===
@@ -1,5 +1,4 @@
 import { getSubscriptionPlanByIdUseCase } from '../../domain/admin';
-import { getPartnerProfileUseCase } from '../../domain/partners';
 import {
   type BillingLocale,
   PaymentDomainError,
@@ -7,6 +6,7 @@ import {
   startPlanSubscriptionUseCase,
 } from '../../domain/payment';
 import { isPaidPlanId, type PaidPlanId } from './activatePaidPlanApplicationUseCase';
+import { assertListingPlanPurchasableApplicationUseCase } from './listingPlans/assertListingPlanPurchasableApplicationUseCase';
 
 const BILLING_INTERVAL: Record<PaidPlanId, { interval: 'month' | 'year'; intervalCount: number }> =
   {
@@ -15,10 +15,10 @@ const BILLING_INTERVAL: Record<PaidPlanId, { interval: 'month' | 'year'; interva
     annual: { interval: 'year', intervalCount: 1 },
   };
 
-/** Assinatura no cartão com renovação automática (decisão D2). O Pix avulso continua no fluxo de PaymentIntent. */
+/** Assinatura no cartão do plano de um estabelecimento (D2, D11). O Pix avulso segue no PaymentIntent. */
 export async function startPartnerPlanSubscriptionApplicationUseCase(
   actor: { uid: string; email?: string },
-  input: { planId: string; locale: BillingLocale; idempotencyKey: string }
+  input: { itemId: string; planId: string; locale: BillingLocale; idempotencyKey: string }
 ): Promise<StartPlanSubscriptionResult> {
   if (!isPaidPlanId(input.planId)) {
     throw new PaymentDomainError('VALIDATION_ERROR', 'Plano inválido.', 400);
@@ -27,12 +27,13 @@ export async function startPartnerPlanSubscriptionApplicationUseCase(
   if (!plan || plan.isActive === false) {
     throw new PaymentDomainError('PLAN_INACTIVE', 'Plano indisponível.', 422);
   }
-  const profile = await getPartnerProfileUseCase(actor.uid);
-  if (!profile) {
-    throw new PaymentDomainError('FORBIDDEN', 'Cadastro de parceiro não encontrado.', 403);
-  }
+  const { currentPlanUntil } = await assertListingPlanPurchasableApplicationUseCase(
+    actor,
+    input.itemId
+  );
 
   return startPlanSubscriptionUseCase({
+    itemId: input.itemId,
     partnerId: actor.uid,
     email: actor.email,
     locale: input.locale,
@@ -40,7 +41,7 @@ export async function startPartnerPlanSubscriptionApplicationUseCase(
     planName: plan.name,
     amountMinor: plan.priceMinor,
     ...BILLING_INTERVAL[input.planId],
-    currentVerifiedUntil: null,
+    currentVerifiedUntil: currentPlanUntil,
     idempotencyKey: input.idempotencyKey,
   });
 }

=== server/domain/payment/adapters/firestorePlanSubscriptionAdapter.ts — diff ===
@@ -4,26 +4,34 @@ import type {
   PlanSubscriptionRepositoryPort,
 } from '../ports/planSubscriptionRepositoryPort';
 
-const COLLECTION = 'partnerSubscriptions';
+const COLLECTION = 'planSubscriptions';
+
+function toRecord(itemId: string, data: Partial<PlanSubscriptionRecord>): PlanSubscriptionRecord {
+  return {
+    itemId,
+    partnerId: String(data.partnerId ?? ''),
+    stripeCustomerId: String(data.stripeCustomerId ?? ''),
+    stripeSubscriptionId: data.stripeSubscriptionId ?? null,
+    planId: String(data.planId ?? ''),
+    status: data.status ?? 'incomplete',
+    currentPeriodEnd: data.currentPeriodEnd ?? null,
+    cancelAtPeriodEnd: data.cancelAtPeriodEnd === true,
+    updatedAt: String(data.updatedAt ?? ''),
+  };
+}
 
 export class FirestorePlanSubscriptionAdapter implements PlanSubscriptionRepositoryPort {
-  async get(partnerId: string): Promise<PlanSubscriptionRecord | null> {
-    const snapshot = await adminDb.collection(COLLECTION).doc(partnerId).get();
-    if (!snapshot.exists) return null;
-    const data = snapshot.data() as Partial<PlanSubscriptionRecord>;
-    return {
-      partnerId,
-      stripeCustomerId: String(data.stripeCustomerId ?? ''),
-      stripeSubscriptionId: data.stripeSubscriptionId ?? null,
-      planId: String(data.planId ?? ''),
-      status: data.status ?? 'incomplete',
-      currentPeriodEnd: data.currentPeriodEnd ?? null,
-      cancelAtPeriodEnd: data.cancelAtPeriodEnd === true,
-      updatedAt: String(data.updatedAt ?? ''),
-    };
+  async get(itemId: string): Promise<PlanSubscriptionRecord | null> {
+    const snapshot = await adminDb.collection(COLLECTION).doc(itemId).get();
+    return snapshot.exists ? toRecord(itemId, snapshot.data() ?? {}) : null;
   }
 
   async save(record: PlanSubscriptionRecord): Promise<void> {
-    await adminDb.collection(COLLECTION).doc(record.partnerId).set(record);
+    await adminDb.collection(COLLECTION).doc(record.itemId).set(record);
+  }
+
+  async listByPartner(partnerId: string): Promise<PlanSubscriptionRecord[]> {
+    const snapshot = await adminDb.collection(COLLECTION).where('partnerId', '==', partnerId).get();
+    return snapshot.docs.map((doc) => toRecord(doc.id, doc.data()));
   }
 }

=== server/domain/payment/adapters/stripeBillingGatewayAdapter.ts — diff ===
@@ -163,6 +163,10 @@ export class StripeBillingGatewayAdapter implements BillingGatewayPort {
     );
   }
 
+  async cancelNow(subscriptionId: string): Promise<SubscriptionSnapshot> {
+    return toSnapshot(await this.stripe.subscriptions.cancel(subscriptionId));
+  }
+
   async createBillingPortalSession(params: {
     customerId: string;
     returnUrl: string;

=== server/domain/payment/controllers/paymentController.test.ts — diff ===
@@ -1,5 +1,5 @@
 import { describe, it, expect, vi, beforeEach } from 'vitest';
-import type { Request } from 'express';
+import type { Request, Response } from 'express';
 import { PaymentController } from './paymentController';
 import { getPlanForPaymentApplicationUseCase } from '../../../application/usecases/getPlanForPaymentApplicationUseCase';
 import { reconcileStripeWebhookEventApplicationUseCase } from '../../../application/usecases/reconcileStripeWebhookEventApplicationUseCase';
@@ -15,25 +15,47 @@ vi.mock('../../../application/usecases/getPlanForPaymentApplicationUseCase', ()
   getPlanForPaymentApplicationUseCase: vi.fn(),
 }));
 
-vi.mock('../../../application/usecases/reconcileStripeWebhookEventApplicationUseCase', () => ({ reconcileStripeWebhookEventApplicationUseCase: vi.fn() }));
+vi.mock('../../../application/usecases/reconcileStripeWebhookEventApplicationUseCase', () => ({
+  reconcileStripeWebhookEventApplicationUseCase: vi.fn(),
+}));
 
-vi.mock('../usecases/createPlanPaymentIntentUseCase', () => ({ createPlanPaymentIntentUseCase: vi.fn() }));
-vi.mock('../usecases/constructStripeWebhookEventUseCase', () => ({ constructStripeWebhookEventUseCase: vi.fn() }));
-vi.mock('../usecases/claimStripeWebhookEventUseCase', () => ({ claimStripeWebhookEventUseCase: vi.fn() }));
-vi.mock('../usecases/completeStripeWebhookEventUseCase', () => ({ completeStripeWebhookEventUseCase: vi.fn() }));
-vi.mock('../usecases/releaseStripeWebhookEventUseCase', () => ({ releaseStripeWebhookEventUseCase: vi.fn() }));
-vi.mock('../usecases/retrievePaymentIntentUseCase', () => ({ retrievePaymentIntentUseCase: vi.fn() }));
+vi.mock('../usecases/createPlanPaymentIntentUseCase', () => ({
+  createPlanPaymentIntentUseCase: vi.fn(),
+}));
+vi.mock(
+  '../../../application/usecases/listingPlans/assertListingPlanPurchasableApplicationUseCase',
+  () => ({
+    assertListingPlanPurchasableApplicationUseCase: vi
+      .fn()
+      .mockResolvedValue({ currentPlanUntil: null }),
+  })
+);
+vi.mock('../usecases/constructStripeWebhookEventUseCase', () => ({
+  constructStripeWebhookEventUseCase: vi.fn(),
+}));
+vi.mock('../usecases/claimStripeWebhookEventUseCase', () => ({
+  claimStripeWebhookEventUseCase: vi.fn(),
+}));
+vi.mock('../usecases/completeStripeWebhookEventUseCase', () => ({
+  completeStripeWebhookEventUseCase: vi.fn(),
+}));
+vi.mock('../usecases/releaseStripeWebhookEventUseCase', () => ({
+  releaseStripeWebhookEventUseCase: vi.fn(),
+}));
+vi.mock('../usecases/retrievePaymentIntentUseCase', () => ({
+  retrievePaymentIntentUseCase: vi.fn(),
+}));
 
 describe('PaymentController', () => {
   let req: Partial<AuthenticatedRequest>;
-  let res: any;
+  let res: Response & { status: ReturnType<typeof vi.fn>; json: ReturnType<typeof vi.fn> };
 
   beforeEach(() => {
     vi.clearAllMocks();
     res = {
       status: vi.fn().mockReturnThis(),
       json: vi.fn().mockReturnThis(),
-    };
+    } as unknown as typeof res;
   });
 
   it('rejects unauthenticated request with 401', async () => {
@@ -73,6 +95,7 @@ describe('PaymentController', () => {
         authTime: 1700000000,
       },
       body: {
+        itemId: 'item-1',
         planId: 'monthly',
         idempotencyKey: 'unique-key-12345',
       },
@@ -83,7 +106,7 @@ describe('PaymentController', () => {
       name: 'Plano Profissional',
       priceMinor: 9900,
       isActive: true,
-    } as any);
+    } as never);
     vi.mocked(createPlanPaymentIntentUseCase).mockResolvedValueOnce({
       paymentIntentId: 'pi_123',
       clientSecret: 'pi_123_secret_abc',
@@ -96,6 +119,7 @@ describe('PaymentController', () => {
     expect(createPlanPaymentIntentUseCase).toHaveBeenCalledWith(
       expect.objectContaining({
         buyerId: 'user-123',
+        itemId: 'item-1',
         planId: 'monthly',
         planName: 'Plano Profissional',
         amountMinor: 9900,
@@ -221,7 +245,7 @@ describe('PaymentController', () => {
         status: 'succeeded',
         amountMinor: 9900,
         metadata: { partnerId: 'outro', referenceType: 'plan_payment' },
-      } as any);
+      } as never);
       await PaymentController.confirmPlanPayment(
         { user, body: { paymentIntentId: 'pi_abc' } } as AuthenticatedRequest,
         res
@@ -235,7 +259,7 @@ describe('PaymentController', () => {
         status: 'succeeded',
         amountMinor: 9900,
         metadata: { partnerId: 'partner-1', referenceType: 'plan_payment' },
-      } as any);
+      } as never);
       await PaymentController.confirmPlanPayment(
         { user, body: { paymentIntentId: 'pi_abc' } } as AuthenticatedRequest,
         res

=== server/domain/payment/controllers/paymentController.ts — diff ===
@@ -1,6 +1,7 @@
 import { randomUUID } from 'crypto';
 import type { Request, Response } from 'express';
 import { getPlanForPaymentApplicationUseCase } from '../../../application/usecases/getPlanForPaymentApplicationUseCase';
+import { assertListingPlanPurchasableApplicationUseCase } from '../../../application/usecases/listingPlans/assertListingPlanPurchasableApplicationUseCase';
 import { reconcileStripeWebhookEventApplicationUseCase } from '../../../application/usecases/reconcileStripeWebhookEventApplicationUseCase';
 import type { AuthenticatedRequest } from '../../../infrastructure/auth/authenticatedRequest';
 import { ConfirmPlanPaymentSchema, CreatePlanPaymentIntentSchema } from '../schemas/paymentSchema';
@@ -36,7 +37,7 @@ export class PaymentController {
         });
       }
 
-      const { planId, idempotencyKey } = parsed.data;
+      const { itemId, planId, idempotencyKey } = parsed.data;
       const plan = await getPlanForPaymentApplicationUseCase(planId);
       if (!plan) {
         return res.status(400).json({ error: 'Plano inexistente.' });
@@ -47,13 +48,15 @@ export class PaymentController {
 
       const amountMinor = plan.priceMinor;
       if (amountMinor <= 0) {
-        return res
-          .status(400)
-          .json({ error: 'Plano gratuito não requer pagamento via Stripe.' });
+        return res.status(400).json({ error: 'Plano gratuito não requer pagamento via Stripe.' });
       }
 
+      // Plano é do estabelecimento verificado e do próprio comprador (D11).
+      await assertListingPlanPurchasableApplicationUseCase({ uid: req.user.uid }, itemId);
+
       const result = await createPlanPaymentIntentUseCase({
         buyerId: req.user.uid,
+        itemId,
         planId: plan.id,
         planName: plan.name,
         amountMinor,
@@ -80,10 +83,7 @@ export class PaymentController {
     }
   }
 
-  static async createConnectedAccount(
-    req: AuthenticatedRequest,
-    res: Response
-  ): Promise<Response> {
+  static async createConnectedAccount(req: AuthenticatedRequest, res: Response): Promise<Response> {
     try {
       if (!req.user?.uid) {
         return res.status(401).json({ error: 'Não autenticado.' });
@@ -95,10 +95,7 @@ export class PaymentController {
       });
 
       return res.status(200).json({
-        connected:
-          record.chargesEnabled &&
-          record.payoutsEnabled &&
-          record.detailsSubmitted,
+        connected: record.chargesEnabled && record.payoutsEnabled && record.detailsSubmitted,
         accountId: record.stripeAccountId,
         chargesEnabled: record.chargesEnabled,
         payoutsEnabled: record.payoutsEnabled,
@@ -111,8 +108,7 @@ export class PaymentController {
         message: error instanceof Error ? error.message : 'Erro desconhecido',
       });
       return res.status(503).json({
-        error:
-          'Não foi possível iniciar a configuração financeira no momento.',
+        error: 'Não foi possível iniciar a configuração financeira no momento.',
       });
     }
   }
@@ -140,16 +136,12 @@ export class PaymentController {
         message: error instanceof Error ? error.message : 'Erro desconhecido',
       });
       return res.status(503).json({
-        error:
-          'Não foi possível iniciar a configuração financeira no momento.',
+        error: 'Não foi possível iniciar a configuração financeira no momento.',
       });
     }
   }
 
-  static async getConnectStatus(
-    req: AuthenticatedRequest,
-    res: Response
-  ): Promise<Response> {
+  static async getConnectStatus(req: AuthenticatedRequest, res: Response): Promise<Response> {
     try {
       if (!req.user?.uid) {
         return res.status(401).json({ error: 'Não autenticado.' });
@@ -168,8 +160,7 @@ export class PaymentController {
         message: error instanceof Error ? error.message : 'Erro desconhecido',
       });
       return res.status(503).json({
-        error:
-          'Não foi possível consultar a configuração financeira no momento.',
+        error: 'Não foi possível consultar a configuração financeira no momento.',
       });
     }
   }

=== server/domain/payment/index.ts — diff ===
@@ -17,7 +17,9 @@ export { syncConnectedAccountFromWebhookUseCase } from './usecases/syncConnected
 export { createMarketplacePaymentIntentUseCase } from './usecases/createMarketplacePaymentIntentUseCase';
 export { getPaymentReferenceUseCase } from './usecases/getPaymentReferenceUseCase';
 export { createBillingPortalSessionUseCase } from './usecases/billing/createBillingPortalSessionUseCase';
-export { getPartnerPlanSubscriptionUseCase } from './usecases/billing/getPartnerPlanSubscriptionUseCase';
+export { getListingPlanSubscriptionUseCase } from './usecases/billing/getListingPlanSubscriptionUseCase';
+export { cancelListingPlanSubscriptionUseCase } from './usecases/billing/cancelListingPlanSubscriptionUseCase';
+export { cancelPartnerPlanSubscriptionsUseCase } from './usecases/billing/cancelPartnerPlanSubscriptionsUseCase';
 export { setPlanSubscriptionCancelAtPeriodEndUseCase } from './usecases/billing/setPlanSubscriptionCancelAtPeriodEndUseCase';
 export { startPlanSubscriptionUseCase } from './usecases/billing/startPlanSubscriptionUseCase';
 export { syncPlanSubscriptionUseCase } from './usecases/billing/syncPlanSubscriptionUseCase';
@@ -46,4 +48,3 @@ export type {
   RefundPaymentResult,
   VerifiedWebhookEvent,
 } from './ports/paymentGatewayPort';
-

=== server/domain/payment/ports/billingGatewayPort.ts — diff ===
@@ -53,6 +53,8 @@ export interface BillingGatewayPort {
   }): Promise<CreateSubscriptionResult>;
   getSubscription(subscriptionId: string): Promise<SubscriptionSnapshot>;
   setCancelAtPeriodEnd(subscriptionId: string, cancel: boolean): Promise<SubscriptionSnapshot>;
+  /** Cancela na hora, sem cobrança proporcional: usado quando o estabelecimento ou a conta é excluído. */
+  cancelNow(subscriptionId: string): Promise<SubscriptionSnapshot>;
   createBillingPortalSession(params: {
     customerId: string;
     returnUrl: string;

=== server/domain/payment/ports/planSubscriptionRepositoryPort.ts — diff ===
@@ -1,7 +1,8 @@
 import type { ProviderSubscriptionStatus } from './billingGatewayPort';
 
-/** Coleção interna `partnerSubscriptions/{partnerId}` (só backend). */
+/** Coleção interna `planSubscriptions/{itemId}` (só backend): uma assinatura por estabelecimento (D11). */
 export interface PlanSubscriptionRecord {
+  itemId: string;
   partnerId: string;
   stripeCustomerId: string;
   stripeSubscriptionId: string | null;
@@ -13,6 +14,7 @@ export interface PlanSubscriptionRecord {
 }
 
 export interface PlanSubscriptionRepositoryPort {
-  get(partnerId: string): Promise<PlanSubscriptionRecord | null>;
+  get(itemId: string): Promise<PlanSubscriptionRecord | null>;
   save(record: PlanSubscriptionRecord): Promise<void>;
+  listByPartner(partnerId: string): Promise<PlanSubscriptionRecord[]>;
 }

=== server/domain/payment/schemas/paymentSchema.test.ts — diff ===
@@ -1,11 +1,9 @@
 import { describe, expect, it } from 'vitest';
-import {
-  CreatePlanPaymentIntentSchema,
-  CreateTicketPaymentIntentSchema,
-} from './paymentSchema';
+import { CreatePlanPaymentIntentSchema, CreateTicketPaymentIntentSchema } from './paymentSchema';
 
 describe('Payment Schemas - Mass Assignment Protection and Strictness', () => {
   const validPlanPayload = {
+    itemId: 'item-1',
     planId: 'monthly',
     idempotencyKey: 'idemp-key-12345',
   };

=== server/domain/payment/schemas/paymentSchema.ts — diff ===
@@ -2,6 +2,11 @@ import { z } from 'zod';
 
 export const CreatePlanPaymentIntentSchema = z
   .object({
+    itemId: z
+      .string()
+      .min(1)
+      .max(128)
+      .regex(/^[\w-]+$/),
     planId: z.enum(['monthly', 'semi-annual', 'annual']),
     idempotencyKey: z
       .string()
@@ -11,12 +16,15 @@ export const CreatePlanPaymentIntentSchema = z
   })
   .strict();
 
-export type CreatePlanPaymentIntentDTO = z.infer<
-  typeof CreatePlanPaymentIntentSchema
->;
+export type CreatePlanPaymentIntentDTO = z.infer<typeof CreatePlanPaymentIntentSchema>;
 
 export const ConfirmPlanPaymentSchema = z
-  .object({ paymentIntentId: z.string().trim().regex(/^pi_[A-Za-z0-9]+$/) })
+  .object({
+    paymentIntentId: z
+      .string()
+      .trim()
+      .regex(/^pi_[A-Za-z0-9]+$/),
+  })
   .strict();
 
 export const CreateTicketPaymentIntentSchema = z
@@ -30,7 +38,4 @@ export const CreateTicketPaymentIntentSchema = z
   })
   .strict();
 
-export type CreateTicketPaymentIntentDTO = z.infer<
-  typeof CreateTicketPaymentIntentSchema
->;
-
+export type CreateTicketPaymentIntentDTO = z.infer<typeof CreateTicketPaymentIntentSchema>;

=== server/domain/payment/services/billingService.test.ts — diff ===
@@ -23,19 +23,33 @@ function createGateway(overrides: Partial<BillingGatewayPort> = {}): BillingGate
     }),
     getSubscription: vi.fn(),
     setCancelAtPeriodEnd: vi.fn(),
+    cancelNow: vi.fn().mockResolvedValue({
+      subscriptionId: 'sub_1',
+      customerId: 'cus_1',
+      status: 'canceled',
+      currentPeriodEnd: null,
+      cancelAtPeriodEnd: false,
+      metadata: {},
+    }),
     createBillingPortalSession: vi.fn().mockResolvedValue({ url: 'https://billing.stripe.com/x' }),
     ...overrides,
   };
 }
 
 function createRepository(
-  record: PlanSubscriptionRecord | null = null
+  record: PlanSubscriptionRecord | null = null,
+  byPartner: PlanSubscriptionRecord[] = record ? [record] : []
 ): PlanSubscriptionRepositoryPort {
-  return { get: vi.fn().mockResolvedValue(record), save: vi.fn().mockResolvedValue(undefined) };
+  return {
+    get: vi.fn().mockResolvedValue(record),
+    save: vi.fn().mockResolvedValue(undefined),
+    listByPartner: vi.fn().mockResolvedValue(byPartner),
+  };
 }
 
 function buildRecord(overrides: Partial<PlanSubscriptionRecord> = {}): PlanSubscriptionRecord {
   return {
+    itemId: 'item-1',
     partnerId: 'p1',
     stripeCustomerId: 'cus_1',
     stripeSubscriptionId: 'sub_1',
@@ -52,6 +66,7 @@ function buildInput(
   overrides: Partial<StartPlanSubscriptionInput> = {}
 ): StartPlanSubscriptionInput {
   return {
+    itemId: 'item-1',
     partnerId: 'p1',
     email: 'parceiro@example.com',
     locale: 'pt-BR',
@@ -73,7 +88,12 @@ function snapshot(overrides: Partial<SubscriptionSnapshot> = {}): SubscriptionSn
     status: 'active',
     currentPeriodEnd: '2026-11-10T12:00:00.000Z',
     cancelAtPeriodEnd: false,
-    metadata: { referenceType: 'plan_subscription', partnerId: 'p1', planId: 'monthly' },
+    metadata: {
+      referenceType: 'plan_subscription',
+      partnerId: 'p1',
+      planId: 'monthly',
+      itemId: 'item-1',
+    },
     ...overrides,
   };
 }
@@ -100,7 +120,7 @@ describe('BillingService.startPlanSubscription', () => {
     );
   });
 
-  it('usa lookupKey por plano e valor, metadata só com IDs e chave idempotente do parceiro', async () => {
+  it('usa lookupKey por plano e valor, metadata só com IDs e chave idempotente do estabelecimento', async () => {
     const gateway = createGateway();
     const repository = createRepository();
     const service = new BillingService(gateway, repository, () => NOW);
@@ -117,11 +137,17 @@ describe('BillingService.startPlanSubscription', () => {
       customerId: 'cus_1',
       priceId: 'price_1',
       trialEndUnixSeconds: null,
-      metadata: { referenceType: 'plan_subscription', partnerId: 'p1', planId: 'monthly' },
-      idempotencyKey: 'sub_p1_key-12345',
+      metadata: {
+        referenceType: 'plan_subscription',
+        partnerId: 'p1',
+        planId: 'monthly',
+        itemId: 'item-1',
+      },
+      idempotencyKey: 'sub_item-1_key-12345',
     });
     expect(repository.save).toHaveBeenCalledWith(
       expect.objectContaining({
+        itemId: 'item-1',
         partnerId: 'p1',
         stripeSubscriptionId: 'sub_1',
         status: 'incomplete',
@@ -190,7 +216,7 @@ describe('BillingService.syncSubscription', () => {
     expect(repository.save).not.toHaveBeenCalled();
   });
 
-  it('ignora assinatura sem partnerId na metadata', async () => {
+  it('ignora assinatura sem partnerId ou itemId na metadata', async () => {
     const repository = createRepository();
     const gateway = createGateway({
       getSubscription: vi.fn().mockResolvedValue(snapshot({ metadata: {} })),
@@ -203,7 +229,7 @@ describe('BillingService.syncSubscription', () => {
 describe('BillingService.setCancelAtPeriodEnd e portal', () => {
   it('sem assinatura ativa → 404', async () => {
     const service = new BillingService(createGateway(), createRepository(), () => NOW);
-    await expect(service.setCancelAtPeriodEnd('p1', true)).rejects.toMatchObject({
+    await expect(service.setCancelAtPeriodEnd('item-1', 'p1', true)).rejects.toMatchObject({
       code: 'SUBSCRIPTION_NOT_FOUND',
       statusCode: 404,
     });
@@ -215,6 +241,7 @@ describe('BillingService.setCancelAtPeriodEnd e portal', () => {
     });
     const repository = createRepository(buildRecord());
     const record = await new BillingService(gateway, repository, () => NOW).setCancelAtPeriodEnd(
+      'item-1',
       'p1',
       true
     );
@@ -235,4 +262,42 @@ describe('BillingService.setCancelAtPeriodEnd e portal', () => {
       locale: 'fr',
     });
   });
+
+  it('assinatura de outra conta é tratada como inexistente', async () => {
+    const service = new BillingService(createGateway(), createRepository(buildRecord()), () => NOW);
+    expect(await service.getListingSubscription('item-1', 'intruso')).toBeNull();
+    await expect(service.setCancelAtPeriodEnd('item-1', 'intruso', true)).rejects.toMatchObject({
+      code: 'SUBSCRIPTION_NOT_FOUND',
+    });
+  });
+});
+
+describe('BillingService: um cliente por conta e cancelamento nas exclusões (B24)', () => {
+  it('estabelecimento novo reaproveita o cliente Stripe da conta', async () => {
+    const gateway = createGateway();
+    const repository = createRepository(null, [buildRecord({ itemId: 'item-9' })]);
+    await new BillingService(gateway, repository, () => NOW).startPlanSubscription(buildInput());
+    expect(gateway.ensureCustomer).toHaveBeenCalledWith(
+      expect.objectContaining({ existingCustomerId: 'cus_1', partnerId: 'p1' })
+    );
+  });
+
+  it('excluir o estabelecimento cancela na hora só a assinatura viva dele', async () => {
+    const gateway = createGateway();
+    const repository = createRepository(buildRecord());
+    await new BillingService(gateway, repository, () => NOW).cancelForListing('item-1');
+    expect(gateway.cancelNow).toHaveBeenCalledWith('sub_1');
+    expect(repository.save).toHaveBeenCalledWith(expect.objectContaining({ status: 'canceled' }));
+  });
+
+  it('excluir a conta cancela todas as assinaturas vivas e ignora as encerradas', async () => {
+    const gateway = createGateway();
+    const repository = createRepository(null, [
+      buildRecord({ itemId: 'item-1', stripeSubscriptionId: 'sub_1' }),
+      buildRecord({ itemId: 'item-2', stripeSubscriptionId: 'sub_2', status: 'canceled' }),
+    ]);
+    await new BillingService(gateway, repository, () => NOW).cancelForPartner('p1');
+    expect(gateway.cancelNow).toHaveBeenCalledTimes(1);
+    expect(gateway.cancelNow).toHaveBeenCalledWith('sub_1');
+  });
 });

=== server/domain/payment/services/billingService.ts — diff ===
@@ -20,6 +20,8 @@ const LIVE_STATUSES: ReadonlySet<ProviderSubscriptionStatus> = new Set([
 const MIN_TRIAL_MS = 48 * 60 * 60 * 1000;
 
 export interface StartPlanSubscriptionInput {
+  /** Estabelecimento ou perfil de produtor dono do plano (D11). */
+  itemId: string;
   partnerId: string;
   email?: string;
   locale: BillingLocale;
@@ -53,17 +55,19 @@ export class BillingService {
     if (!Number.isInteger(input.amountMinor) || input.amountMinor <= 0) {
       throw new PaymentDomainError('INVALID_AMOUNT', 'Valor do plano inválido.', 422);
     }
-    const existing = await this.repository.get(input.partnerId);
+    const existing = await this.repository.get(input.itemId);
     if (existing && LIVE_STATUSES.has(existing.status)) {
       throw new PaymentDomainError(
         'SUBSCRIPTION_ALREADY_ACTIVE',
-        'Você já tem uma assinatura ativa.',
+        'Este estabelecimento já tem uma assinatura ativa.',
         409
       );
     }
 
+    // Um cliente no Stripe por conta, para todas as assinaturas dos estabelecimentos dela.
     const customerId = await this.gateway.ensureCustomer({
-      existingCustomerId: existing?.stripeCustomerId || null,
+      existingCustomerId:
+        existing?.stripeCustomerId || (await this.findCustomerId(input.partnerId)),
       partnerId: input.partnerId,
       email: input.email,
       locale: input.locale,
@@ -84,11 +88,13 @@ export class BillingService {
         referenceType: 'plan_subscription',
         partnerId: input.partnerId,
         planId: input.planId,
+        itemId: input.itemId,
       },
-      idempotencyKey: `sub_${input.partnerId}_${input.idempotencyKey}`,
+      idempotencyKey: `sub_${input.itemId}_${input.idempotencyKey}`,
     });
 
     await this.repository.save({
+      itemId: input.itemId,
       partnerId: input.partnerId,
       stripeCustomerId: customerId,
       stripeSubscriptionId: created.subscriptionId,
@@ -107,14 +113,14 @@ export class BillingService {
     };
   }
 
-  /** Relê a assinatura no provedor (fonte da verdade) e atualiza o registro do parceiro. */
+  /** Relê a assinatura no provedor (fonte da verdade) e atualiza o registro do estabelecimento. */
   async syncSubscription(subscriptionId: string): Promise<SubscriptionSnapshot> {
     const snapshot = await this.gateway.getSubscription(subscriptionId);
-    const partnerId = snapshot.metadata.partnerId;
-    if (!partnerId) {
+    const { partnerId, itemId } = snapshot.metadata;
+    if (!partnerId || !itemId) {
       return snapshot;
     }
-    const existing = await this.repository.get(partnerId);
+    const existing = await this.repository.get(itemId);
     // Uma tentativa antiga que expirou não pode sobrescrever a assinatura vigente.
     if (
       existing?.stripeSubscriptionId &&
@@ -123,41 +129,75 @@ export class BillingService {
     ) {
       return snapshot;
     }
-    await this.repository.save(this.toRecord(partnerId, snapshot, existing));
+    await this.repository.save(this.toRecord(itemId, partnerId, snapshot, existing));
     return snapshot;
   }
 
-  async getPartnerSubscription(partnerId: string): Promise<PlanSubscriptionRecord | null> {
-    return this.repository.get(partnerId);
+  /** Assinatura do estabelecimento; de outra conta é tratada como inexistente (IDOR, §7.10). */
+  async getListingSubscription(
+    itemId: string,
+    partnerId: string
+  ): Promise<PlanSubscriptionRecord | null> {
+    const record = await this.repository.get(itemId);
+    return record?.partnerId === partnerId ? record : null;
   }
 
-  async setCancelAtPeriodEnd(partnerId: string, cancel: boolean): Promise<PlanSubscriptionRecord> {
-    const existing = await this.repository.get(partnerId);
+  async setCancelAtPeriodEnd(
+    itemId: string,
+    partnerId: string,
+    cancel: boolean
+  ): Promise<PlanSubscriptionRecord> {
+    const existing = await this.getListingSubscription(itemId, partnerId);
     if (!existing?.stripeSubscriptionId || !LIVE_STATUSES.has(existing.status)) {
       throw new PaymentDomainError('SUBSCRIPTION_NOT_FOUND', 'Nenhuma assinatura ativa.', 404);
     }
     const snapshot = await this.gateway.setCancelAtPeriodEnd(existing.stripeSubscriptionId, cancel);
-    const record = this.toRecord(partnerId, snapshot, existing);
+    const record = this.toRecord(itemId, partnerId, snapshot, existing);
     await this.repository.save(record);
     return record;
   }
 
+  /** Estabelecimento excluído: a assinatura dele para de cobrar na hora. */
+  async cancelForListing(itemId: string): Promise<void> {
+    const existing = await this.repository.get(itemId);
+    if (!existing) return;
+    await this.cancelRecord(existing);
+  }
+
+  /** Conta excluída: todas as assinaturas dos estabelecimentos dela param de cobrar. */
+  async cancelForPartner(partnerId: string): Promise<void> {
+    for (const record of await this.repository.listByPartner(partnerId)) {
+      await this.cancelRecord(record);
+    }
+  }
+
   async createPortalSession(
     partnerId: string,
     returnUrl: string,
     locale: BillingLocale
   ): Promise<{ url: string }> {
-    const existing = await this.repository.get(partnerId);
-    if (!existing?.stripeCustomerId) {
+    const customerId = await this.findCustomerId(partnerId);
+    if (!customerId) {
       throw new PaymentDomainError('SUBSCRIPTION_NOT_FOUND', 'Nenhuma assinatura encontrada.', 404);
     }
     return this.gateway.createBillingPortalSession({
-      customerId: existing.stripeCustomerId,
+      customerId,
       returnUrl,
       locale,
     });
   }
 
+  private async findCustomerId(partnerId: string): Promise<string | null> {
+    const records = await this.repository.listByPartner(partnerId);
+    return records.find((record) => record.stripeCustomerId)?.stripeCustomerId ?? null;
+  }
+
+  private async cancelRecord(record: PlanSubscriptionRecord): Promise<void> {
+    if (!record.stripeSubscriptionId || !LIVE_STATUSES.has(record.status)) return;
+    const snapshot = await this.gateway.cancelNow(record.stripeSubscriptionId);
+    await this.repository.save(this.toRecord(record.itemId, record.partnerId, snapshot, record));
+  }
+
   private resolveTrialEnd(currentVerifiedUntil: string | null): number | null {
     if (!currentVerifiedUntil) return null;
     const paidUntil = new Date(currentVerifiedUntil).getTime();
@@ -168,11 +208,13 @@ export class BillingService {
   }
 
   private toRecord(
+    itemId: string,
     partnerId: string,
     snapshot: SubscriptionSnapshot,
     existing: PlanSubscriptionRecord | null
   ): PlanSubscriptionRecord {
     return {
+      itemId,
       partnerId,
       stripeCustomerId: snapshot.customerId,
       stripeSubscriptionId: snapshot.subscriptionId,

=== server/domain/payment/services/checkoutService.ts — diff ===
@@ -9,6 +9,7 @@ export class CheckoutService {
 
   async createPlanPaymentIntent(params: {
     buyerId: string;
+    itemId: string;
     planId: string;
     planName: string;
     amountMinor: number;

=== server/domain/payment/services/stripePaymentService.ts — diff ===
@@ -34,15 +34,11 @@ export class StripePaymentService {
     partnerId: string;
     email: string;
   }): Promise<StripeConnectedAccountRecord> {
-    const existing = await this.transactionRepo.getConnectedAccountRecord(
-      params.partnerId
-    );
+    const existing = await this.transactionRepo.getConnectedAccountRecord(params.partnerId);
     const nowIso = new Date().toISOString();
 
     if (existing?.stripeAccountId) {
-      const status = await this.marketplaceAccount.getAccountStatus(
-        existing.stripeAccountId
-      );
+      const status = await this.marketplaceAccount.getAccountStatus(existing.stripeAccountId);
       const updated: StripeConnectedAccountRecord = {
         partnerId: params.partnerId,
         stripeAccountId: status.accountId,
@@ -65,9 +61,7 @@ export class StripePaymentService {
       country: 'BR',
     });
 
-    const status = await this.marketplaceAccount.getAccountStatus(
-      created.accountId
-    );
+    const status = await this.marketplaceAccount.getAccountStatus(created.accountId);
 
     const record: StripeConnectedAccountRecord = {
       partnerId: params.partnerId,
@@ -103,9 +97,8 @@ export class StripePaymentService {
     status: ConnectedAccountStatus['status'];
     readyForSales: boolean;
   }> {
-    const existing =
-      await this.transactionRepo.getConnectedAccountRecord(partnerId);
-    if (!existing || !existing.stripeAccountId) {
+    const existing = await this.transactionRepo.getConnectedAccountRecord(partnerId);
+    if (!existing?.stripeAccountId) {
       return {
         connected: false,
         chargesEnabled: false,
@@ -116,9 +109,7 @@ export class StripePaymentService {
       };
     }
 
-    const status = await this.marketplaceAccount.getAccountStatus(
-      existing.stripeAccountId
-    );
+    const status = await this.marketplaceAccount.getAccountStatus(existing.stripeAccountId);
     const nowIso = new Date().toISOString();
 
     await this.transactionRepo.saveConnectedAccountRecord({
@@ -145,12 +136,9 @@ export class StripePaymentService {
     };
   }
 
-  async assertPartnerReadyForPaidEvent(
-    partnerId: string
-  ): Promise<StripeConnectedAccountRecord> {
-    const existing =
-      await this.transactionRepo.getConnectedAccountRecord(partnerId);
-    if (!existing || !existing.stripeAccountId) {
+  async assertPartnerReadyForPaidEvent(partnerId: string): Promise<StripeConnectedAccountRecord> {
+    const existing = await this.transactionRepo.getConnectedAccountRecord(partnerId);
+    if (!existing?.stripeAccountId) {
       throw new PaymentDomainError(
         'SELLER_ACCOUNT_NOT_ELIGIBLE',
         'Vendas online indisponíveis. Conclua a configuração financeira.',
@@ -158,9 +146,7 @@ export class StripePaymentService {
       );
     }
 
-    const status = await this.marketplaceAccount.getAccountStatus(
-      existing.stripeAccountId
-    );
+    const status = await this.marketplaceAccount.getAccountStatus(existing.stripeAccountId);
     const nowIso = new Date().toISOString();
     const synced: StripeConnectedAccountRecord = {
       partnerId,
@@ -313,18 +299,18 @@ export class StripePaymentService {
 
   async createPlanPaymentIntent(params: {
     buyerId: string;
+    /** Estabelecimento que recebe o plano (D11). */
+    itemId: string;
     planId: string;
     planName: string;
     amountMinor: number;
     idempotencyKey: string;
   }): Promise<CreatePaymentIntentResult & { transactionId: string }> {
-    const existingTx =
-      await this.transactionRepo.getTransactionByIdempotencyKey(
-        params.idempotencyKey
-      );
+    const existingTx = await this.transactionRepo.getTransactionByIdempotencyKey(
+      params.idempotencyKey
+    );
     if (
-      existingTx &&
-      existingTx.providerPaymentId &&
+      existingTx?.providerPaymentId &&
       existingTx.paymentDetail &&
       typeof existingTx.paymentDetail.clientSecret === 'string'
     ) {
@@ -347,6 +333,7 @@ export class StripePaymentService {
         referenceType: 'plan_payment',
         planId: params.planId,
         partnerId: params.buyerId,
+        itemId: params.itemId,
       },
       idempotencyKey: params.idempotencyKey,
     });
@@ -366,6 +353,7 @@ export class StripePaymentService {
         paymentIntentId: result.paymentIntentId,
         clientSecret: result.clientSecret,
         planId: params.planId,
+        itemId: params.itemId,
       },
     });
 
@@ -397,10 +385,7 @@ export class StripePaymentService {
     return this.paymentGateway.retrievePaymentIntent(paymentIntentId);
   }
 
-  constructWebhookEvent(
-    payload: string | Buffer,
-    signature: string
-  ): VerifiedWebhookEvent {
+  constructWebhookEvent(payload: string | Buffer, signature: string): VerifiedWebhookEvent {
     return this.paymentGateway.constructWebhookEvent(payload, signature);
   }
 
@@ -421,18 +406,12 @@ export class StripePaymentService {
     status: string,
     statusDetail?: string
   ): Promise<boolean> {
-    return this.transactionRepo.updateTransactionStatus(
-      paymentIntentId,
-      status,
-      statusDetail
-    );
+    return this.transactionRepo.updateTransactionStatus(paymentIntentId, status, statusDetail);
   }
 
   async syncConnectedAccountFromWebhook(stripeAccountId: string): Promise<void> {
     const existing =
-      await this.transactionRepo.getConnectedAccountRecordByStripeAccountId(
-        stripeAccountId
-      );
+      await this.transactionRepo.getConnectedAccountRecordByStripeAccountId(stripeAccountId);
     if (!existing) return;
     const status = await this.marketplaceAccount.getAccountStatus(stripeAccountId);
     await this.transactionRepo.saveConnectedAccountRecord({

=== server/domain/payment/usecases/billing/cancelListingPlanSubscriptionUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { getBillingService } from '../../factory';

export async function cancelListingPlanSubscriptionUseCase(itemId: string): Promise<void> {
  return getBillingService().cancelForListing(itemId);
}

=== server/domain/payment/usecases/billing/cancelPartnerPlanSubscriptionsUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { getBillingService } from '../../factory';

export async function cancelPartnerPlanSubscriptionsUseCase(partnerId: string): Promise<void> {
  return getBillingService().cancelForPartner(partnerId);
}

=== server/domain/payment/usecases/billing/getListingPlanSubscriptionUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { getBillingService } from '../../factory';
import type { PlanSubscriptionRecord } from '../../ports/planSubscriptionRepositoryPort';

export async function getListingPlanSubscriptionUseCase(
  itemId: string,
  partnerId: string
): Promise<PlanSubscriptionRecord | null> {
  return getBillingService().getListingSubscription(itemId, partnerId);
}

=== server/domain/payment/usecases/billing/getPartnerPlanSubscriptionUseCase.ts — APAGUE este arquivo ===

=== server/domain/payment/usecases/billing/setPlanSubscriptionCancelAtPeriodEndUseCase.ts — diff ===
@@ -2,8 +2,9 @@ import { getBillingService } from '../../factory';
 import type { PlanSubscriptionRecord } from '../../ports/planSubscriptionRepositoryPort';
 
 export async function setPlanSubscriptionCancelAtPeriodEndUseCase(
+  itemId: string,
   partnerId: string,
   cancel: boolean
 ): Promise<PlanSubscriptionRecord> {
-  return getBillingService().setCancelAtPeriodEnd(partnerId, cancel);
+  return getBillingService().setCancelAtPeriodEnd(itemId, partnerId, cancel);
 }

=== server/domain/payment/usecases/createPlanPaymentIntentUseCase.ts — diff ===
@@ -3,6 +3,7 @@ import type { CreatePaymentIntentResult } from '../ports/paymentGatewayPort';
 
 export async function createPlanPaymentIntentUseCase(params: {
   buyerId: string;
+  itemId: string;
   planId: string;
   planName: string;
   amountMinor: number;

=== server/interfaces/http/billing/billingController.test.ts — diff ===
@@ -11,7 +11,7 @@ vi.mock('../../../domain/payment', async () => {
   return {
     PaymentDomainError,
     createBillingPortalSessionUseCase: vi.fn(),
-    getPartnerPlanSubscriptionUseCase: vi.fn(),
+    getListingPlanSubscriptionUseCase: vi.fn(),
     setPlanSubscriptionCancelAtPeriodEndUseCase: vi.fn(),
   };
 });
@@ -19,7 +19,7 @@ vi.mock('../../../domain/payment', async () => {
 import { startPartnerPlanSubscriptionApplicationUseCase } from '../../../application/usecases/startPartnerPlanSubscriptionApplicationUseCase';
 import {
   createBillingPortalSessionUseCase,
-  getPartnerPlanSubscriptionUseCase,
+  getListingPlanSubscriptionUseCase,
   PaymentDomainError,
 } from '../../../domain/payment';
 import type { AuthenticatedRequest } from '../../../infrastructure/auth/authenticatedRequest';
@@ -31,11 +31,20 @@ function createResponse() {
   return { res: { status } as unknown as Response, status, json };
 }
 
-function request(body: unknown, uid: string | null = 'p1') {
-  return { body, user: uid ? { uid, email: 'p1@example.com' } : undefined } as AuthenticatedRequest;
+function request(body: unknown, uid: string | null = 'p1', query: unknown = {}) {
+  return {
+    body,
+    query,
+    user: uid ? { uid, email: 'p1@example.com' } : undefined,
+  } as AuthenticatedRequest;
 }
 
-const VALID_BODY = { planId: 'monthly', locale: 'pt-BR', idempotencyKey: 'key-12345' };
+const VALID_BODY = {
+  itemId: 'item-1',
+  planId: 'monthly',
+  locale: 'pt-BR',
+  idempotencyKey: 'key-12345',
+};
 
 describe('BillingController', () => {
   beforeEach(() => vi.clearAllMocks());
@@ -102,7 +111,8 @@ describe('BillingController', () => {
   });
 
   it('GET não devolve o ID do cliente no Stripe', async () => {
-    vi.mocked(getPartnerPlanSubscriptionUseCase).mockResolvedValue({
+    vi.mocked(getListingPlanSubscriptionUseCase).mockResolvedValue({
+      itemId: 'item-1',
       partnerId: 'p1',
       stripeCustomerId: 'cus_secret',
       stripeSubscriptionId: 'sub_1',
@@ -113,11 +123,13 @@ describe('BillingController', () => {
       updatedAt: '2026-10-10T12:00:00.000Z',
     });
     const { res, status, json } = createResponse();
-    await BillingController.getSubscription(request(undefined), res);
+    await BillingController.getSubscription(request(undefined, 'p1', { itemId: 'item-1' }), res);
+    expect(getListingPlanSubscriptionUseCase).toHaveBeenCalledWith('item-1', 'p1');
     expect(status).toHaveBeenCalledWith(200);
     const body = json.mock.calls[0]?.[0];
     expect(body).toEqual({
       subscription: {
+        itemId: 'item-1',
         planId: 'monthly',
         status: 'active',
         currentPeriodEnd: '2026-11-10T12:00:00.000Z',
@@ -127,6 +139,13 @@ describe('BillingController', () => {
     expect(JSON.stringify(body)).not.toContain('cus_secret');
   });
 
+  it('GET sem itemId: 400', async () => {
+    const { res, status } = createResponse();
+    await BillingController.getSubscription(request(undefined), res);
+    expect(status).toHaveBeenCalledWith(400);
+    expect(getListingPlanSubscriptionUseCase).not.toHaveBeenCalled();
+  });
+
   it('portal usa APP_URL do servidor, nunca do cliente', async () => {
     vi.stubEnv('APP_URL', 'https://useguide.com.br/');
     vi.mocked(createBillingPortalSessionUseCase).mockResolvedValue({

=== server/interfaces/http/billing/billingController.ts — diff ===
@@ -2,13 +2,17 @@ import type { Response } from 'express';
 import { startPartnerPlanSubscriptionApplicationUseCase } from '../../../application/usecases/startPartnerPlanSubscriptionApplicationUseCase';
 import {
   createBillingPortalSessionUseCase,
-  getPartnerPlanSubscriptionUseCase,
+  getListingPlanSubscriptionUseCase,
   PaymentDomainError,
   type PlanSubscriptionRecord,
   setPlanSubscriptionCancelAtPeriodEndUseCase,
 } from '../../../domain/payment';
 import type { AuthenticatedRequest } from '../../../infrastructure/auth/authenticatedRequest';
-import { BillingPortalSchema, StartPlanSubscriptionSchema } from './schemas/billingSchemas';
+import {
+  BillingPortalSchema,
+  ListingSubscriptionSchema,
+  StartPlanSubscriptionSchema,
+} from './schemas/billingSchemas';
 
 function sendError(res: Response, status: number, code: string, message: string): Response {
   return res.status(status).json({ error: { code, message } });
@@ -28,6 +32,7 @@ function handleError(res: Response, operation: string, error: unknown): Response
 function toPublicSubscription(record: PlanSubscriptionRecord | null) {
   if (!record) return null;
   return {
+    itemId: record.itemId,
     planId: record.planId,
     status: record.status,
     currentPeriodEnd: record.currentPeriodEnd,
@@ -59,8 +64,12 @@ export class BillingController {
     if (!req.user?.uid) {
       return sendError(res, 401, 'UNAUTHENTICATED', 'Não autenticado.');
     }
+    const parsed = ListingSubscriptionSchema.safeParse(req.query);
+    if (!parsed.success) {
+      return sendError(res, 400, 'VALIDATION_ERROR', 'Estabelecimento inválido.');
+    }
     try {
-      const record = await getPartnerPlanSubscriptionUseCase(req.user.uid);
+      const record = await getListingPlanSubscriptionUseCase(parsed.data.itemId, req.user.uid);
       return res.status(200).json({ subscription: toPublicSubscription(record) });
     } catch (error: unknown) {
       return handleError(res, 'getSubscription', error);
@@ -107,8 +116,16 @@ export class BillingController {
     if (!req.user?.uid) {
       return sendError(res, 401, 'UNAUTHENTICATED', 'Não autenticado.');
     }
+    const parsed = ListingSubscriptionSchema.safeParse(req.body);
+    if (!parsed.success) {
+      return sendError(res, 400, 'VALIDATION_ERROR', 'Estabelecimento inválido.');
+    }
     try {
-      const record = await setPlanSubscriptionCancelAtPeriodEndUseCase(req.user.uid, cancel);
+      const record = await setPlanSubscriptionCancelAtPeriodEndUseCase(
+        parsed.data.itemId,
+        req.user.uid,
+        cancel
+      );
       return res.status(200).json({ subscription: toPublicSubscription(record) });
     } catch (error: unknown) {
       return handleError(res, 'setCancelAtPeriodEnd', error);

=== server/interfaces/http/billing/schemas/billingSchemas.test.ts — diff ===
@@ -2,7 +2,7 @@ import { describe, expect, it } from 'vitest';
 import { BillingPortalSchema, StartPlanSubscriptionSchema } from './billingSchemas';
 
 describe('StartPlanSubscriptionSchema', () => {
-  const valid = { planId: 'annual', locale: 'fr', idempotencyKey: 'key-12345' };
+  const valid = { itemId: 'item-1', planId: 'annual', locale: 'fr', idempotencyKey: 'key-12345' };
 
   it('aceita entrada válida', () => {
     expect(StartPlanSubscriptionSchema.safeParse(valid).success).toBe(true);

=== server/interfaces/http/billing/schemas/billingSchemas.ts — diff ===
@@ -1,13 +1,23 @@
 import { z } from 'zod';
 
+const ITEM_ID = z
+  .string()
+  .min(1)
+  .max(128)
+  .regex(/^[\w-]+$/);
+
 export const StartPlanSubscriptionSchema = z
   .object({
+    itemId: ITEM_ID,
     planId: z.enum(['monthly', 'semi-annual', 'annual']),
     locale: z.enum(['pt-BR', 'en', 'fr']),
     idempotencyKey: z.string().min(8).max(150),
   })
   .strict();
 
+/** Assinatura de um estabelecimento: `?itemId=` na leitura, `{ itemId }` em cancelar e retomar. */
+export const ListingSubscriptionSchema = z.object({ itemId: ITEM_ID }).strict();
+
 export const BillingPortalSchema = z
   .object({
     locale: z.enum(['pt-BR', 'en', 'fr']),

VERIFICAÇÃO (obrigatória):
- `npm run typecheck`, `npx biome lint .` (0 erros; arquivos tocados sem avisos), `npm test` → 168 arquivos, 900 testes, `npm run build`;
- `npm run test:rules` → 4 arquivos, 62 testes.

FIREBASE: publique as regras. A coleção antiga partnerSubscriptions só tem dados de teste e pode ser apagada.

Responda no formato do AGENTS.md §16.3.

LIMPEZA (obrigatória, ao terminar de implementar): apague todos os arquivos de public/assets/aistudio/, inclusive o deste prompt. São cópias dos textos colados no chat, salvas automaticamente pelo AI Studio, e public/ vai para o site publicado. Se a pasta ficar vazia, apague a pasta também.
~~~~
