# Prompt 18.3b.1 — Correção do 18.3b

> Gerado da diferença entre o zip do AI Studio de 2026-10-24 (importado em `0fec4b9`) e o commit de referência `faba4ec` da branch `claude/agents-md-v2`. Aplique antes do 18.3.1. Cole o bloco abaixo no agente do AI Studio, inteiro, de uma vez.

---

## Prompt 18.3b.1 — Correção do 18.3b (cobrança por estabelecimento)

O 18.3.0d, o 18.3a e o 18.3c vieram iguais à referência. O 18.3b funciona, mas 17 arquivos foram reescritos em vez de seguir o diff.

~~~~text
Siga o AGENTS.md. NÃO altere o AGENTS.md. O app ainda não foi liberado para usuários: nenhum código de compatibilidade ou transição (§2.2 item 8).

CONTEXTO: o 18.3b foi aplicado com reescritas próprias em 17 arquivos. O comportamento ficou parecido, mas o código não é o da referência, e os próximos prompts partem dela:
- assertListingPlanPurchasableApplicationUseCase recebe só o uid (a referência recebe o ator) e devolve currentPaidUntil em vez de currentPlanUntil; startPartnerPlanSubscriptionApplicationUseCase e paymentController seguem essa troca;
- deleteUserAccountApplicationUseCase ganhou a dependência cancelPlanSubscriptions; na referência o cancelamento fica dentro de deleteListingPlans;
- firestorePlanSubscriptionAdapter com limit(50) e casts; paymentSchema com mensagens próprias; index.ts com exports reordenados;
- comentários do porquê removidos (AGENTS.md §14) em portas, adapter e casos de uso;
- paymentController e outros arquivos tocados fora da formatação do Biome (5 arquivos com erro em `npx biome format`, AGENTS.md §13);
- testes renomeados ou reescritos; texto do B24 no debitos.md reescrito e fora de ordem.

IMPORTANTE: aplique os diffs abaixo EXATAMENTE. Não reescreva os arquivos do seu jeito e não mexa em nenhum outro arquivo. Os diffs partem do estado atual do projeto; o resultado tem de ficar idêntico à referência. Nenhuma dependência nova.

ARQUIVOS (crie, altere ou apague exatamente estes):
- docs/arquitetura/debitos.md (alterar)
- firestore.rules.security.test.ts (alterar)
- server/application/usecases/deletePartnerItemApplicationUseCase.test.ts (alterar)
- server/application/usecases/deletePartnerItemApplicationUseCase.ts (alterar)
- server/application/usecases/deleteUserAccountApplicationUseCase.ts (alterar)
- server/application/usecases/listingPlans/assertListingPlanPurchasableApplicationUseCase.test.ts (alterar)
- server/application/usecases/listingPlans/assertListingPlanPurchasableApplicationUseCase.ts (alterar)
- server/application/usecases/startPartnerPlanSubscriptionApplicationUseCase.test.ts (alterar)
- server/application/usecases/startPartnerPlanSubscriptionApplicationUseCase.ts (alterar)
- server/domain/payment/adapters/firestorePlanSubscriptionAdapter.ts (alterar)
- server/domain/payment/controllers/paymentController.test.ts (alterar)
- server/domain/payment/controllers/paymentController.ts (alterar)
- server/domain/payment/index.ts (alterar)
- server/domain/payment/ports/billingGatewayPort.ts (alterar)
- server/domain/payment/ports/planSubscriptionRepositoryPort.ts (alterar)
- server/domain/payment/schemas/paymentSchema.test.ts (alterar)
- server/domain/payment/schemas/paymentSchema.ts (alterar)

Aplique as mudanças abaixo EXATAMENTE como estão (formato unified diff: linhas com "-" saem, linhas com "+" entram; as demais são contexto para localizar o trecho). Não reformate outros trechos dos arquivos.

=== docs/arquitetura/debitos.md — diff ===
@@ -23,8 +23,8 @@
 
 | ID | Resolução |
 |---|---|
+| B24 | Prompt 18.3b: excluir o estabelecimento cancela na hora a assinatura dele no Stripe (`planSubscriptions/{itemId}`); excluir a conta cancela todas as assinaturas vivas dela antes de apagar os planos |
 | B23 | Prompt 18.3.0b (D12, P0): a conta do parceiro deixou de ter documento — o cadastro envia só `termsAccepted`; `partners/{uid}.cpfCnpj`, `cpfCnpjClean` e a coleção `partnerDocumentKeys` saíram do código, das regras e dos testes (resolve também o débito do §7.7); o status `pending` da conta saiu (só `active` e `suspended`); CPF/CNPJ existe apenas, cifrado e com índice cego, na verificação de cada estabelecimento (18.3.0a); `PartnersModal` dividido (529 → 257 linhas), com as condições de cada etapa em `utils/signupStepGates.ts` |
-| B24 | Prompt 18.3b (D11): assinatura por estabelecimento em `planSubscriptions/{itemId}` (a conta mantém um único cliente no Stripe); excluir o estabelecimento cancela na hora a assinatura dele (`cancelListingPlanSubscriptionUseCase`), e excluir a conta cancela todas as assinaturas vivas dos estabelecimentos dela (`cancelPartnerPlanSubscriptionsUseCase`) |
 | Erro no modal de detalhe e métricas zeradas — Prompt 18.2.3 | decisão de 2026-10-19 (opção B): `/api/insights/track` aceita visitante sem login (o token só é anexado quando há usuário); cada item grava dois contadores por dia (`viewsSignedIn`, `viewsAnonymous`) em `interactionStats`, sem uid nem IP; repetição em 30 min não soma (guarda `interactionGuards` com chave HMAC de uid/IP e TTL em `expiresAt`); o relatório mostra o total e a divisão em percentual; `/api/insights/stats/:colecao/:id` exige login e checa o dono no backend (antes o cliente chamava sem token e recebia sempre zero); `ReportsView` dividido e traduzido (sai de B16); `trust proxy` com número de proxies de `TRUST_PROXY_HOPS` (§7.4); handler global de erros do `server.ts` deixou de devolver `err.message` (§7.10 A05); `src/shared/lib/insights.ts` (sem uso, `shared → domain`) removido |
 | B19 | Prompt 18.2.2 (decisão de 2026-10-19): o contato do evento fica só nos campos do topo (`phone`, `websiteLink`, `instagramLink`, `bookingLink`), como nos itens do guia; o objeto `contact` deixou de ser lido e gravado; `eventsService` dividido em `EventsService` (anúncios) e `EventOccurrencesService` (sessões), com as regras de acesso em `eventAccess.ts` |
 | Sessões do evento no editor — Prompt 18.2.1 | `EventSessionsField` e `saveEventSessionsUseCase` (events) usados pelo parceiro e pelo admin (decisão de 2026-10-19, opção A): o parceiro passa a editar datas, horários e capacidade; a data do evento é derivada das sessões; o editor do admin deixa de importar o gerenciador de ingressos de outro domínio (§5.2); `PartnerEventForm` dividido em seções (634 → 67 linhas) e modal em `PartnerEventEditor` (`PartnerPanel` abaixo de 400 linhas); o editor de evento não fecha ao clicar fora; botões do editor de evento com nome acessível |

=== firestore.rules.security.test.ts — diff ===
@@ -244,7 +244,7 @@ describe('Firestore Rules — Security Suite', () => {
       await assertFails(getDoc(doc(db, 'transactions/tx-2')));
     });
 
-    it('partner → own planSubscriptions read and write denied (server-only)', async () => {
+    it('partner → planSubscriptions do próprio estabelecimento negado (só backend, D11)', async () => {
       const db = testEnv.authenticatedContext('partner-1').firestore();
       await assertFails(getDoc(doc(db, 'planSubscriptions/item-1')));
       await assertFails(setDoc(doc(db, 'planSubscriptions/item-1'), { status: 'active' }));

=== server/application/usecases/deletePartnerItemApplicationUseCase.test.ts — diff ===
@@ -12,7 +12,6 @@ import {
   unlinkBusinessUseCase,
 } from '../../domain/partners';
 import { deleteVerificationFileUseCase } from '../../domain/media';
-import { cancelListingPlanSubscriptionUseCase } from '../../domain/payment';
 
 vi.mock('../../domain/guide', () => ({
   getItemByIdUseCase: vi.fn(),
@@ -26,12 +25,12 @@ vi.mock('../../domain/partners', () => ({
   deleteListingPlanUseCase: vi.fn(),
 }));
 
-vi.mock('../../domain/media', () => ({
-  deleteVerificationFileUseCase: vi.fn().mockResolvedValue(undefined),
+vi.mock('../../domain/payment', () => ({
+  cancelListingPlanSubscriptionUseCase: vi.fn(),
 }));
 
-vi.mock('../../domain/payment', () => ({
-  cancelListingPlanSubscriptionUseCase: vi.fn().mockResolvedValue(undefined),
+vi.mock('../../domain/media', () => ({
+  deleteVerificationFileUseCase: vi.fn().mockResolvedValue(undefined),
 }));
 
 describe('deletePartnerItemApplicationUseCase', () => {
@@ -69,7 +68,6 @@ describe('deletePartnerItemApplicationUseCase', () => {
     expect(linkBusinessUseCase).not.toHaveBeenCalled();
     expect(deleteListingVerificationUseCase).toHaveBeenCalledWith('item-100');
     expect(deleteVerificationFileUseCase).toHaveBeenCalledWith('verification/partner-B/c.pdf');
-    expect(cancelListingPlanSubscriptionUseCase).toHaveBeenCalledWith('item-100');
   });
 
   it('unlink falha + Guide não é apagado', async () => {

=== server/application/usecases/deletePartnerItemApplicationUseCase.ts — diff ===
@@ -66,6 +66,7 @@ export async function deletePartnerItemApplicationUseCase(
 
   // Documento e arquivos de verificação saem junto com o estabelecimento (LGPD, §7.5).
   await deleteVerificationFiles(await deleteListingVerificationUseCase(id));
+  // O plano sai junto: a assinatura do estabelecimento para de cobrar na hora (B24).
   await cancelListingPlanSubscriptionUseCase(id);
   await deleteListingPlanUseCase(id);
 }

=== server/application/usecases/deleteUserAccountApplicationUseCase.ts — diff ===
@@ -17,10 +17,8 @@ export interface UserDeletionCoordinatorDependencies {
   deleteEventsByOwner?: (uid: string) => Promise<void>;
   /** Verificações, documentos cifrados e arquivos enviados (D12). */
   deleteListingVerifications?: (uid: string) => Promise<void>;
-  /** Planos dos estabelecimentos (D11). */
+  /** Planos dos estabelecimentos (D11): cancela as assinaturas no Stripe e apaga os planos. */
   deleteListingPlans?: (uid: string) => Promise<void>;
-  /** Assinaturas ativas no Stripe (B24). */
-  cancelPlanSubscriptions?: (uid: string) => Promise<void>;
   deleteUserAccount: (uid: string) => Promise<void>;
 }
 
@@ -33,8 +31,10 @@ export async function deleteUserAccountApplicationUseCase(
     deleteEventsByOwner: (id) => deleteEventsByOwnerUseCase(id),
     deleteListingVerifications: async (id) =>
       deleteVerificationFiles(await deleteOwnerListingVerificationsUseCase(id)),
-    deleteListingPlans: (id) => deleteOwnerListingPlansUseCase(id),
-    cancelPlanSubscriptions: (id) => cancelPartnerPlanSubscriptionsUseCase(id),
+    deleteListingPlans: async (id) => {
+      await cancelPartnerPlanSubscriptionsUseCase(id);
+      await deleteOwnerListingPlansUseCase(id);
+    },
     deleteUserAccount: (id) => deleteUserAccountUseCase(id),
   }
 ): Promise<void> {
@@ -50,9 +50,6 @@ export async function deleteUserAccountApplicationUseCase(
   if (deps.deleteListingVerifications) {
     await deps.deleteListingVerifications(uid);
   }
-  if (deps.cancelPlanSubscriptions) {
-    await deps.cancelPlanSubscriptions(uid);
-  }
   if (deps.deleteListingPlans) {
     await deps.deleteListingPlans(uid);
   }

=== server/application/usecases/listingPlans/assertListingPlanPurchasableApplicationUseCase.test.ts — diff ===
@@ -1,64 +1,46 @@
 import { beforeEach, describe, expect, it, vi } from 'vitest';
 
+const m = vi.hoisted(() => ({ load: vi.fn(), status: vi.fn(), assert: vi.fn(), until: vi.fn() }));
+
 vi.mock('../../../domain/partners', async () => {
-  const actual = await vi.importActual<typeof import('../../../domain/partners')>(
-    '../../../domain/partners'
-  );
+  const { ListingPlanError } = await import('../../../domain/partners/errors/listingPlanError');
   return {
-    ...actual,
-    assertListingPlanPurchasableUseCase: vi.fn(),
-    getListingPlanUntilUseCase: vi.fn(),
-    getListingVerificationStatusUseCase: vi.fn(),
+    ListingPlanError,
+    assertListingPlanPurchasableUseCase: m.assert,
+    getListingPlanUntilUseCase: m.until,
+    getListingVerificationStatusUseCase: m.status,
   };
 });
-vi.mock('./loadPlanListing', () => ({ loadPlanListing: vi.fn() }));
+vi.mock('./loadPlanListing', () => ({ loadPlanListing: m.load }));
 
-import {
-  assertListingPlanPurchasableUseCase,
-  getListingPlanUntilUseCase,
-  getListingVerificationStatusUseCase,
-  ListingPlanError,
-} from '../../../domain/partners';
+import { ListingPlanError } from '../../../domain/partners/errors/listingPlanError';
 import { PaymentDomainError } from '../../../domain/payment';
 import { assertListingPlanPurchasableApplicationUseCase } from './assertListingPlanPurchasableApplicationUseCase';
-import { loadPlanListing } from './loadPlanListing';
 
 describe('assertListingPlanPurchasableApplicationUseCase', () => {
   beforeEach(() => {
     vi.clearAllMocks();
-    vi.mocked(loadPlanListing).mockResolvedValue({ id: 'item-1', ownerId: 'p1' });
-    vi.mocked(getListingVerificationStatusUseCase).mockResolvedValue('approved');
-    vi.mocked(getListingPlanUntilUseCase).mockResolvedValue('2026-12-01T00:00:00.000Z');
-  });
-
-  it('devolve o fim do período já pago quando o item é do dono e o documento está aprovado', async () => {
-    const result = await assertListingPlanPurchasableApplicationUseCase('p1', 'item-1');
-    expect(assertListingPlanPurchasableUseCase).toHaveBeenCalledWith(
-      { uid: 'p1' },
-      { id: 'item-1', ownerId: 'p1' },
-      'approved'
-    );
-    expect(result).toEqual({ currentPaidUntil: '2026-12-01T00:00:00.000Z' });
+    m.load.mockResolvedValue({ id: 'item-1', ownerId: 'p1' });
+    m.status.mockResolvedValue('approved');
   });
 
-  it('traduz LISTING_PENDING_VERIFICATION para 422', async () => {
-    vi.mocked(assertListingPlanPurchasableUseCase).mockRejectedValueOnce(
-      new ListingPlanError('LISTING_PENDING_VERIFICATION', 'Precisa verificar.')
-    );
+  it('devolve a validade do plano em vigor para não cobrar duas vezes', async () => {
+    m.until.mockResolvedValue('2026-12-01T00:00:00.000Z');
     await expect(
-      assertListingPlanPurchasableApplicationUseCase('p1', 'item-1')
-    ).rejects.toMatchObject({
-      code: 'LISTING_PENDING_VERIFICATION',
-      statusCode: 422,
-    } satisfies Partial<PaymentDomainError>);
+      assertListingPlanPurchasableApplicationUseCase({ uid: 'p1' }, 'item-1')
+    ).resolves.toEqual({ currentPlanUntil: '2026-12-01T00:00:00.000Z' });
   });
 
-  it('traduz item de outro dono para 403/404', async () => {
-    vi.mocked(assertListingPlanPurchasableUseCase).mockRejectedValueOnce(
-      new ListingPlanError('FORBIDDEN', 'Sem acesso.')
+  it('erro do plano sai como PaymentDomainError com o mesmo código e status', async () => {
+    m.assert.mockRejectedValue(
+      new ListingPlanError('LISTING_PENDING_VERIFICATION', 'Verifique antes.')
     );
-    await expect(
-      assertListingPlanPurchasableApplicationUseCase('intruso', 'item-1')
-    ).rejects.toMatchObject({ code: 'FORBIDDEN', statusCode: 403 });
+    const error = await assertListingPlanPurchasableApplicationUseCase(
+      { uid: 'p1' },
+      'item-1'
+    ).catch((e: unknown) => e);
+    expect(error).toBeInstanceOf(PaymentDomainError);
+    expect(error).toMatchObject({ code: 'LISTING_PENDING_VERIFICATION', statusCode: 422 });
+    expect(m.until).not.toHaveBeenCalled();
   });
 });

=== server/application/usecases/listingPlans/assertListingPlanPurchasableApplicationUseCase.ts — diff ===
@@ -7,22 +7,24 @@ import {
 import { PaymentDomainError } from '../../../domain/payment';
 import { loadPlanListing } from './loadPlanListing';
 
-/** Garante que o estabelecimento pertence ao parceiro, está ativo e tem documento aprovado (D11). */
+/**
+ * Antes de cobrar o plano: o estabelecimento é do comprador e já foi verificado (D11). Devolve a
+ * validade do plano em vigor, para a assinatura não cobrar de novo o período já pago. O erro sai
+ * como `PaymentDomainError` porque `payment` é folha e não conhece `partners` (AGENTS.md §5.4).
+ */
 export async function assertListingPlanPurchasableApplicationUseCase(
-  actorUid: string,
+  actor: { uid: string; admin?: boolean },
   itemId: string
-): Promise<{ currentPaidUntil: string | null }> {
+): Promise<{ currentPlanUntil: string | null }> {
   try {
-    const [listing, verification] = await Promise.all([
-      loadPlanListing(itemId),
-      getListingVerificationStatusUseCase(itemId),
-    ]);
-    await assertListingPlanPurchasableUseCase({ uid: actorUid }, listing, verification);
-    return { currentPaidUntil: await getListingPlanUntilUseCase(itemId) };
+    const listing = await loadPlanListing(itemId);
+    const verification = await getListingVerificationStatusUseCase(itemId);
+    await assertListingPlanPurchasableUseCase(actor, listing, verification);
   } catch (error) {
     if (error instanceof ListingPlanError) {
       throw new PaymentDomainError(error.code, error.message, error.statusCode);
     }
     throw error;
   }
+  return { currentPlanUntil: await getListingPlanUntilUseCase(itemId) };
 }

=== server/application/usecases/startPartnerPlanSubscriptionApplicationUseCase.test.ts — diff ===
@@ -1,5 +1,7 @@
 import { beforeEach, describe, expect, it, vi } from 'vitest';
 
+const m = vi.hoisted(() => ({ assertPurchasable: vi.fn() }));
+
 vi.mock('../../domain/admin', () => ({ getSubscriptionPlanByIdUseCase: vi.fn() }));
 vi.mock('../../domain/partners', () => ({
   isPaidListingPlanType: (value: string) =>
@@ -10,15 +12,21 @@ vi.mock('../../domain/payment', async () => {
   return { PaymentDomainError, startPlanSubscriptionUseCase: vi.fn().mockResolvedValue({}) };
 });
 vi.mock('./listingPlans/assertListingPlanPurchasableApplicationUseCase', () => ({
-  assertListingPlanPurchasableApplicationUseCase: vi.fn(),
+  assertListingPlanPurchasableApplicationUseCase: m.assertPurchasable,
 }));
 
 import { getSubscriptionPlanByIdUseCase } from '../../domain/admin';
-import { PaymentDomainError, startPlanSubscriptionUseCase } from '../../domain/payment';
-import { assertListingPlanPurchasableApplicationUseCase } from './listingPlans/assertListingPlanPurchasableApplicationUseCase';
+import { startPlanSubscriptionUseCase } from '../../domain/payment';
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
@@ -30,64 +38,41 @@ function mockPlan(overrides: Record<string, unknown> = {}) {
   } as never);
 }
 
-describe('startPartnerPlanSubscriptionApplicationUseCase', () => {
+describe('startPartnerPlanSubscriptionApplicationUseCase (D11)', () => {
   beforeEach(() => {
     vi.clearAllMocks();
-    vi.mocked(assertListingPlanPurchasableApplicationUseCase).mockResolvedValue({
-      currentPaidUntil: null,
-    });
+    m.assertPurchasable.mockResolvedValue({ currentPlanUntil: null });
   });
 
   it('recusa plano que não é pago', async () => {
     await expect(
-      startPartnerPlanSubscriptionApplicationUseCase(ACTOR, {
-        itemId: 'item-1',
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
-        itemId: 'item-1',
-        planId: 'semi-annual',
-        locale: 'pt-BR',
-        idempotencyKey: 'key-12345',
-      })
+      startPartnerPlanSubscriptionApplicationUseCase(ACTOR, INPUT)
     ).rejects.toMatchObject({ code: 'PLAN_INACTIVE' });
   });
 
-  it('recusa estabelecimento sem documento aprovado ou de outro dono', async () => {
+  it('estabelecimento sem verificação não assina', async () => {
     mockPlan();
-    vi.mocked(assertListingPlanPurchasableApplicationUseCase).mockRejectedValueOnce(
-      new PaymentDomainError('VERIFICATION_REQUIRED', 'Precisa verificar.', 422)
+    m.assertPurchasable.mockRejectedValue(
+      new PaymentDomainError('LISTING_PENDING_VERIFICATION', 'Verifique antes.', 422)
     );
     await expect(
-      startPartnerPlanSubscriptionApplicationUseCase(ACTOR, {
-        itemId: 'item-1',
-        planId: 'semi-annual',
-        locale: 'pt-BR',
-        idempotencyKey: 'key-12345',
-      })
-    ).rejects.toMatchObject({ code: 'VERIFICATION_REQUIRED', statusCode: 422 });
+      startPartnerPlanSubscriptionApplicationUseCase(ACTOR, INPUT)
+    ).rejects.toMatchObject({ code: 'LISTING_PENDING_VERIFICATION', statusCode: 422 });
+    expect(startPlanSubscriptionUseCase).not.toHaveBeenCalled();
   });
 
-  it('calcula o valor em centavos, o intervalo e reaproveita o período pago do estabelecimento', async () => {
+  it('valor e intervalo no backend; período já pago do estabelecimento vira teste', async () => {
     mockPlan();
-    vi.mocked(assertListingPlanPurchasableApplicationUseCase).mockResolvedValue({
-      currentPaidUntil: '2026-12-01T00:00:00.000Z',
-    });
-    await startPartnerPlanSubscriptionApplicationUseCase(ACTOR, {
-      itemId: 'item-1',
-      planId: 'semi-annual',
-      locale: 'en',
-      idempotencyKey: 'key-12345',
-    });
-    expect(assertListingPlanPurchasableApplicationUseCase).toHaveBeenCalledWith('p1', 'item-1');
+    m.assertPurchasable.mockResolvedValue({ currentPlanUntil: '2026-12-01T00:00:00.000Z' });
+    await startPartnerPlanSubscriptionApplicationUseCase(ACTOR, { ...INPUT, locale: 'en' });
+    expect(m.assertPurchasable).toHaveBeenCalledWith(ACTOR, 'item-1');
     expect(startPlanSubscriptionUseCase).toHaveBeenCalledWith({
       itemId: 'item-1',
       partnerId: 'p1',

=== server/application/usecases/startPartnerPlanSubscriptionApplicationUseCase.ts — diff ===
@@ -15,7 +15,7 @@ const BILLING_INTERVAL: Record<PaidPlanId, { interval: 'month' | 'year'; interva
     annual: { interval: 'year', intervalCount: 1 },
   };
 
-/** Assinatura no cartão por estabelecimento, com renovação automática (D2 e D11). */
+/** Assinatura no cartão do plano de um estabelecimento (D2, D11). O Pix avulso segue no PaymentIntent. */
 export async function startPartnerPlanSubscriptionApplicationUseCase(
   actor: { uid: string; email?: string },
   input: { itemId: string; planId: string; locale: BillingLocale; idempotencyKey: string }
@@ -27,8 +27,8 @@ export async function startPartnerPlanSubscriptionApplicationUseCase(
   if (!plan || plan.isActive === false) {
     throw new PaymentDomainError('PLAN_INACTIVE', 'Plano indisponível.', 422);
   }
-  const { currentPaidUntil } = await assertListingPlanPurchasableApplicationUseCase(
-    actor.uid,
+  const { currentPlanUntil } = await assertListingPlanPurchasableApplicationUseCase(
+    actor,
     input.itemId
   );
 
@@ -41,7 +41,7 @@ export async function startPartnerPlanSubscriptionApplicationUseCase(
     planName: plan.name,
     amountMinor: plan.priceMinor,
     ...BILLING_INTERVAL[input.planId],
-    currentVerifiedUntil: currentPaidUntil,
+    currentVerifiedUntil: currentPlanUntil,
     idempotencyKey: input.idempotencyKey,
   });
 }

=== server/domain/payment/adapters/firestorePlanSubscriptionAdapter.ts — diff ===
@@ -23,8 +23,7 @@ function toRecord(itemId: string, data: Partial<PlanSubscriptionRecord>): PlanSu
 export class FirestorePlanSubscriptionAdapter implements PlanSubscriptionRepositoryPort {
   async get(itemId: string): Promise<PlanSubscriptionRecord | null> {
     const snapshot = await adminDb.collection(COLLECTION).doc(itemId).get();
-    if (!snapshot.exists) return null;
-    return toRecord(itemId, snapshot.data() as Partial<PlanSubscriptionRecord>);
+    return snapshot.exists ? toRecord(itemId, snapshot.data() ?? {}) : null;
   }
 
   async save(record: PlanSubscriptionRecord): Promise<void> {
@@ -32,13 +31,7 @@ export class FirestorePlanSubscriptionAdapter implements PlanSubscriptionReposit
   }
 
   async listByPartner(partnerId: string): Promise<PlanSubscriptionRecord[]> {
-    const snapshot = await adminDb
-      .collection(COLLECTION)
-      .where('partnerId', '==', partnerId)
-      .limit(50)
-      .get();
-    return snapshot.docs.map((doc) =>
-      toRecord(doc.id, doc.data() as Partial<PlanSubscriptionRecord>)
-    );
+    const snapshot = await adminDb.collection(COLLECTION).where('partnerId', '==', partnerId).get();
+    return snapshot.docs.map((doc) => toRecord(doc.id, doc.data()));
   }
 }

=== server/domain/payment/controllers/paymentController.test.ts — diff ===
@@ -2,7 +2,6 @@ import { describe, it, expect, vi, beforeEach } from 'vitest';
 import type { Request, Response } from 'express';
 import { PaymentController } from './paymentController';
 import { getPlanForPaymentApplicationUseCase } from '../../../application/usecases/getPlanForPaymentApplicationUseCase';
-import { assertListingPlanPurchasableApplicationUseCase } from '../../../application/usecases/listingPlans/assertListingPlanPurchasableApplicationUseCase';
 import { reconcileStripeWebhookEventApplicationUseCase } from '../../../application/usecases/reconcileStripeWebhookEventApplicationUseCase';
 import { claimStripeWebhookEventUseCase } from '../usecases/claimStripeWebhookEventUseCase';
 import { completeStripeWebhookEventUseCase } from '../usecases/completeStripeWebhookEventUseCase';
@@ -15,30 +14,48 @@ import { AuthenticatedRequest } from '../../../infrastructure/auth/authenticated
 vi.mock('../../../application/usecases/getPlanForPaymentApplicationUseCase', () => ({
   getPlanForPaymentApplicationUseCase: vi.fn(),
 }));
+
+vi.mock('../../../application/usecases/reconcileStripeWebhookEventApplicationUseCase', () => ({
+  reconcileStripeWebhookEventApplicationUseCase: vi.fn(),
+}));
+
+vi.mock('../usecases/createPlanPaymentIntentUseCase', () => ({
+  createPlanPaymentIntentUseCase: vi.fn(),
+}));
 vi.mock(
   '../../../application/usecases/listingPlans/assertListingPlanPurchasableApplicationUseCase',
-  () => ({ assertListingPlanPurchasableApplicationUseCase: vi.fn() })
+  () => ({
+    assertListingPlanPurchasableApplicationUseCase: vi
+      .fn()
+      .mockResolvedValue({ currentPlanUntil: null }),
+  })
 );
-
-vi.mock('../../../application/usecases/reconcileStripeWebhookEventApplicationUseCase', () => ({ reconcileStripeWebhookEventApplicationUseCase: vi.fn() }));
-
-vi.mock('../usecases/createPlanPaymentIntentUseCase', () => ({ createPlanPaymentIntentUseCase: vi.fn() }));
-vi.mock('../usecases/constructStripeWebhookEventUseCase', () => ({ constructStripeWebhookEventUseCase: vi.fn() }));
-vi.mock('../usecases/claimStripeWebhookEventUseCase', () => ({ claimStripeWebhookEventUseCase: vi.fn() }));
-vi.mock('../usecases/completeStripeWebhookEventUseCase', () => ({ completeStripeWebhookEventUseCase: vi.fn() }));
-vi.mock('../usecases/releaseStripeWebhookEventUseCase', () => ({ releaseStripeWebhookEventUseCase: vi.fn() }));
-vi.mock('../usecases/retrievePaymentIntentUseCase', () => ({ retrievePaymentIntentUseCase: vi.fn() }));
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
-  let res: Response;
+  let res: Response & { status: ReturnType<typeof vi.fn>; json: ReturnType<typeof vi.fn> };
 
   beforeEach(() => {
     vi.clearAllMocks();
     res = {
       status: vi.fn().mockReturnThis(),
       json: vi.fn().mockReturnThis(),
-    } as unknown as Response;
+    } as unknown as typeof res;
   });
 
   it('rejects unauthenticated request with 401', async () => {
@@ -84,9 +101,6 @@ describe('PaymentController', () => {
       },
     };
 
-    vi.mocked(assertListingPlanPurchasableApplicationUseCase).mockResolvedValueOnce({
-      currentPaidUntil: null,
-    });
     vi.mocked(getPlanForPaymentApplicationUseCase).mockResolvedValueOnce({
       id: 'monthly',
       name: 'Plano Profissional',
@@ -102,10 +116,6 @@ describe('PaymentController', () => {
 
     await PaymentController.createPlanPaymentIntent(req as AuthenticatedRequest, res);
 
-    expect(assertListingPlanPurchasableApplicationUseCase).toHaveBeenCalledWith(
-      'user-123',
-      'item-1'
-    );
     expect(createPlanPaymentIntentUseCase).toHaveBeenCalledWith(
       expect.objectContaining({
         buyerId: 'user-123',

=== server/domain/payment/controllers/paymentController.ts — diff ===
@@ -48,11 +48,11 @@ export class PaymentController {
 
       const amountMinor = plan.priceMinor;
       if (amountMinor <= 0) {
-        return res
-          .status(400)
-          .json({ error: 'Plano gratuito não requer pagamento via Stripe.' });
+        return res.status(400).json({ error: 'Plano gratuito não requer pagamento via Stripe.' });
       }
-      await assertListingPlanPurchasableApplicationUseCase(req.user.uid, itemId);
+
+      // Plano é do estabelecimento verificado e do próprio comprador (D11).
+      await assertListingPlanPurchasableApplicationUseCase({ uid: req.user.uid }, itemId);
 
       const result = await createPlanPaymentIntentUseCase({
         buyerId: req.user.uid,
@@ -83,10 +83,7 @@ export class PaymentController {
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
@@ -98,10 +95,7 @@ export class PaymentController {
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
@@ -114,8 +108,7 @@ export class PaymentController {
         message: error instanceof Error ? error.message : 'Erro desconhecido',
       });
       return res.status(503).json({
-        error:
-          'Não foi possível iniciar a configuração financeira no momento.',
+        error: 'Não foi possível iniciar a configuração financeira no momento.',
       });
     }
   }
@@ -143,16 +136,12 @@ export class PaymentController {
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
@@ -171,8 +160,7 @@ export class PaymentController {
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
@@ -16,10 +16,10 @@ export { syncConnectedAccountFromWebhookUseCase } from './usecases/syncConnected
 
 export { createMarketplacePaymentIntentUseCase } from './usecases/createMarketplacePaymentIntentUseCase';
 export { getPaymentReferenceUseCase } from './usecases/getPaymentReferenceUseCase';
-export { cancelListingPlanSubscriptionUseCase } from './usecases/billing/cancelListingPlanSubscriptionUseCase';
-export { cancelPartnerPlanSubscriptionsUseCase } from './usecases/billing/cancelPartnerPlanSubscriptionsUseCase';
 export { createBillingPortalSessionUseCase } from './usecases/billing/createBillingPortalSessionUseCase';
 export { getListingPlanSubscriptionUseCase } from './usecases/billing/getListingPlanSubscriptionUseCase';
+export { cancelListingPlanSubscriptionUseCase } from './usecases/billing/cancelListingPlanSubscriptionUseCase';
+export { cancelPartnerPlanSubscriptionsUseCase } from './usecases/billing/cancelPartnerPlanSubscriptionsUseCase';
 export { setPlanSubscriptionCancelAtPeriodEndUseCase } from './usecases/billing/setPlanSubscriptionCancelAtPeriodEndUseCase';
 export { startPlanSubscriptionUseCase } from './usecases/billing/startPlanSubscriptionUseCase';
 export { syncPlanSubscriptionUseCase } from './usecases/billing/syncPlanSubscriptionUseCase';
@@ -48,4 +48,3 @@ export type {
   RefundPaymentResult,
   VerifiedWebhookEvent,
 } from './ports/paymentGatewayPort';
-

=== server/domain/payment/ports/billingGatewayPort.ts — diff ===
@@ -53,6 +53,7 @@ export interface BillingGatewayPort {
   }): Promise<CreateSubscriptionResult>;
   getSubscription(subscriptionId: string): Promise<SubscriptionSnapshot>;
   setCancelAtPeriodEnd(subscriptionId: string, cancel: boolean): Promise<SubscriptionSnapshot>;
+  /** Cancela na hora, sem cobrança proporcional: usado quando o estabelecimento ou a conta é excluído. */
   cancelNow(subscriptionId: string): Promise<SubscriptionSnapshot>;
   createBillingPortalSession(params: {
     customerId: string;

=== server/domain/payment/ports/planSubscriptionRepositoryPort.ts — diff ===
@@ -1,6 +1,6 @@
 import type { ProviderSubscriptionStatus } from './billingGatewayPort';
 
-/** Coleção interna `planSubscriptions/{itemId}` (D11, só backend). */
+/** Coleção interna `planSubscriptions/{itemId}` (só backend): uma assinatura por estabelecimento (D11). */
 export interface PlanSubscriptionRecord {
   itemId: string;
   partnerId: string;

=== server/domain/payment/schemas/paymentSchema.test.ts — diff ===
@@ -1,8 +1,5 @@
 import { describe, expect, it } from 'vitest';
-import {
-  CreatePlanPaymentIntentSchema,
-  CreateTicketPaymentIntentSchema,
-} from './paymentSchema';
+import { CreatePlanPaymentIntentSchema, CreateTicketPaymentIntentSchema } from './paymentSchema';
 
 describe('Payment Schemas - Mass Assignment Protection and Strictness', () => {
   const validPlanPayload = {

=== server/domain/payment/schemas/paymentSchema.ts — diff ===
@@ -4,10 +4,9 @@ export const CreatePlanPaymentIntentSchema = z
   .object({
     itemId: z
       .string()
-      .trim()
-      .min(1, 'itemId é obrigatório')
-      .max(128, 'itemId inválido')
-      .regex(/^[\w-]+$/, 'itemId inválido'),
+      .min(1)
+      .max(128)
+      .regex(/^[\w-]+$/),
     planId: z.enum(['monthly', 'semi-annual', 'annual']),
     idempotencyKey: z
       .string()
@@ -20,7 +19,12 @@ export const CreatePlanPaymentIntentSchema = z
 export type CreatePlanPaymentIntentDTO = z.infer<typeof CreatePlanPaymentIntentSchema>;
 
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

VERIFICAÇÃO (obrigatória):
- `npm run typecheck`, `npx biome lint .` (0 erros), `npx biome format` nos arquivos tocados sem erros, `npm test` → 173 arquivos, 920 testes, `npm run build`;
- `npm run test:rules` → 4 arquivos, 63 testes.

Responda no formato do AGENTS.md §16.3.

LIMPEZA (obrigatória, ao terminar de implementar): apague todos os arquivos de public/assets/aistudio/, inclusive o deste prompt. São cópias dos textos colados no chat, salvas automaticamente pelo AI Studio, e public/ vai para o site publicado. Se a pasta ficar vazia, apague a pasta também.
~~~~
