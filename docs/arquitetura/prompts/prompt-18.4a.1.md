# Prompt 18.4a.1 — Conta Stripe Express por CNPJ (D14) · Parte 1 de 2 — backend

> Lote 16, gerado do commit de referência `6946ecf` da branch `claude/agents-md-v2`. Aplique depois do A5. Cole o bloco abaixo no agente do AI Studio, inteiro, de uma vez.

---

## Prompt 18.4a.1 — Conta Stripe Express por CNPJ (D14) · Parte 1 de 2 — backend

Primeira parte do 18.4 (docs/arquitetura/06-repasse-design.md).

~~~~text
Siga o AGENTS.md. NÃO altere o AGENTS.md. O app ainda não foi liberado para usuários: nenhum código de compatibilidade ou transição (§2.2 item 8); as coleções antigas saem direto e os dados de teste podem ser recriados.

IMPORTANTE: aplique os diffs abaixo EXATAMENTE, inclusive os arquivos novos e as remoções. Não reescreva os arquivos do seu jeito. Arquivo tocado sai sem avisos do lint e formatado (AGENTS.md §13). Nenhuma dependência nova. Este prompt ainda NÃO muda o tipo de cobrança (continua destination charge, agora para a conta do CNPJ); a cobrança na plataforma com transferência depois do serviço vem no 18.4c.

DECISÃO D14 (docs/arquitetura/decisoes.md): cada CNPJ verificado recebe na própria conta Stripe Express; cada estabelecimento vende pela conta do seu CNPJ. Resolve o débito B22 (antes só o primeiro CNPJ da conta vendia).

Esta é a PARTE 1 de 2: backend, regras e testes. Envie a parte 2 (frontend) logo em seguida: até lá o painel do parceiro ainda chama as rotas antigas /api/payment/connect/*, que saem nesta parte.

O QUE MUDA:
1) Domínio partners:
   - assertListingCanSellUseCase passa a devolver { accountKey } (o índice cego do CNPJ da verificação aprovada; perfil de produtor usa o do estabelecimento de origem);
   - novos UseCases listOwnerSalesDocumentsUseCase (CNPJs aprovados do parceiro e os cadastros de cada um) e getOwnerSalesDocumentUseCase (CNPJ descriptografado do próprio parceiro, só no backend);
   - saem o erro SALES_DOCUMENT_MISMATCH, getSalesDocumentIndex e a coleção verificationOwners (regra removida); o repositório ganha listByOwner.
2) Domínio payment (backend):
   - nova coleção paymentAccounts/{accountKey} (regra allow read, write: if false, com teste), PaymentAccountRepositoryPort + FirestorePaymentAccountAdapter e PaymentAccountService (sessão do cadastro, lista com status atualizado no Stripe, checagem antes de vender, webhook account.updated);
   - a conta Express é criada como empresa (business_type company) com o CNPJ pré-preenchido em company.tax_id, metadata só com IDs e idempotência acct_<accountKey>;
   - UseCases novos: createPaymentAccountSessionUseCase, listOwnerPaymentAccountsUseCase, assertPaymentAccountReadyUseCase, syncPaymentAccountFromWebhookUseCase; saem os 5 UseCases por parceiro (ensurePartnerConnectedAccount, getPartnerConnectAccountStatus, createPartnerConnectAccountSession, assertPartnerReadyForPaidEvent, syncConnectedAccountFromWebhook), a coleção paymentConnectedAccounts e as rotas /api/payment/connect/*;
   - createPaymentForTicketOrderUseCase e createMarketplacePaymentIntentUseCase recebem sellerAccountKey.
3) Aplicação e HTTP: GET /api/payment-accounts (um cartão por CNPJ; admin pode passar ?ownerUid) e POST /api/payment-accounts/session { accountKey } (token não revogado; o CNPJ vem da verificação, nunca do cliente); ingresso, reserva e publicação de oferta usam a conta do CNPJ do estabelecimento.
4) docs/arquitetura/debitos.md: B22 resolvido; novo B26 (avisos de conta por estabelecimento no 18.4e).

ARQUIVOS (crie, altere ou apague exatamente estes):
- docs/arquitetura/debitos.md (alterar)
- firestore.rules (alterar)
- firestore.rules.security.test.ts (alterar)
- server.ts (alterar)
- server/application/usecases/bookings/bookingApplicationUseCases.test.ts (alterar)
- server/application/usecases/bookings/createBookingApplicationUseCase.ts (alterar)
- server/application/usecases/bookings/setBookableOfferStatusApplicationUseCase.test.ts (alterar)
- server/application/usecases/bookings/setBookableOfferStatusApplicationUseCase.ts (alterar)
- server/application/usecases/createTicketOrderPaymentIntentApplicationUseCase.test.ts (alterar)
- server/application/usecases/createTicketOrderPaymentIntentApplicationUseCase.ts (alterar)
- server/application/usecases/paymentAccounts/listPartnerPaymentAccountsApplicationUseCase.ts (criar)
- server/application/usecases/paymentAccounts/paymentAccountApplicationUseCases.test.ts (criar)
- server/application/usecases/paymentAccounts/startPaymentAccountSessionApplicationUseCase.ts (criar)
- server/application/usecases/reconcileStripeWebhookEventApplicationUseCase.ts (alterar)
- server/domain/partners/adapters/firestoreListingVerificationAdapter.ts (alterar)
- server/domain/partners/errors/listingVerificationError.ts (alterar)
- server/domain/partners/index.ts (alterar)
- server/domain/partners/ports/listingVerificationRepositoryPort.ts (alterar)
- server/domain/partners/services/listingVerificationService.test.ts (alterar)
- server/domain/partners/services/listingVerificationService.ts (alterar)
- server/domain/partners/types/listingVerification.ts (alterar)
- server/domain/partners/usecases/assertListingCanSellUseCase.ts (alterar)
- server/domain/partners/usecases/getOwnerSalesDocumentUseCase.ts (criar)
- server/domain/partners/usecases/listOwnerSalesDocumentsUseCase.ts (criar)
- server/domain/payment/adapters/firebaseAdminTransactionAdapter.ts (alterar)
- server/domain/payment/adapters/firestorePaymentAccountAdapter.ts (criar)
- server/domain/payment/adapters/stripeConnectMarketplaceAdapter.ts (alterar)
- server/domain/payment/controllers/paymentController.ts (alterar)
- server/domain/payment/factory.ts (alterar)
- server/domain/payment/index.ts (alterar)
- server/domain/payment/ports/marketplaceAccountPort.ts (alterar)
- server/domain/payment/ports/paymentAccountRepositoryPort.ts (criar)
- server/domain/payment/ports/transactionRepositoryPort.ts (alterar)
- server/domain/payment/routes/paymentRoutes.ts (alterar)
- server/domain/payment/services/paymentAccountService.test.ts (criar)
- server/domain/payment/services/paymentAccountService.ts (criar)
- server/domain/payment/services/stripePaymentService.marketplace.test.ts (alterar)
- server/domain/payment/services/stripePaymentService.ts (alterar)
- server/domain/payment/types/paymentAccount.ts (criar)
- server/domain/payment/usecases/assertPartnerReadyForPaidEventUseCase.ts (apagar)
- server/domain/payment/usecases/assertPaymentAccountReadyUseCase.ts (criar)
- server/domain/payment/usecases/createMarketplacePaymentIntentUseCase.ts (alterar)
- server/domain/payment/usecases/createPartnerConnectAccountSessionUseCase.ts (apagar)
- server/domain/payment/usecases/createPaymentAccountSessionUseCase.ts (criar)
- server/domain/payment/usecases/createPaymentForTicketOrderUseCase.ts (alterar)
- server/domain/payment/usecases/ensurePartnerConnectedAccountUseCase.ts (apagar)
- server/domain/payment/usecases/getPartnerConnectAccountStatusUseCase.ts (apagar)
- server/domain/payment/usecases/listOwnerPaymentAccountsUseCase.ts (criar)
- server/domain/payment/usecases/syncConnectedAccountFromWebhookUseCase.ts (apagar)
- server/domain/payment/usecases/syncPaymentAccountFromWebhookUseCase.ts (criar)
- server/interfaces/http/paymentAccounts/paymentAccountController.test.ts (criar)
- server/interfaces/http/paymentAccounts/paymentAccountController.ts (criar)
- server/interfaces/http/paymentAccounts/paymentAccountRoutes.ts (criar)
- server/interfaces/http/paymentAccounts/schemas/paymentAccountSchemas.ts (criar)

Aplique as mudanças abaixo EXATAMENTE como estão (formato unified diff: linhas com "-" saem, linhas com "+" entram; as demais são contexto para localizar o trecho). Não reformate outros trechos dos arquivos.

=== docs/arquitetura/debitos.md — diff ===
@@ -17,13 +17,14 @@
 | B18 | Painel admin — itens da auditoria de 2026-10-12 ainda abertos | §6.2, §6.4, §8, §11.7, §11.8 | médio | preço de planos em reais (Prompt 17.1); preço de item gravado como texto; catálogo e planos lidos direto do Firestore (deveria ser API, com limite); relatórios em branco antes de carregar e média 0.0 sem avaliações; card de eventos conta rascunhos; duas entradas (`/admin` e `?admin=1`); visitante sem login redirecionado sem aviso; tabs sem `role="tablist"` |
 | B20 | `operationalInfoSchema` duplicado em `server/domain/guide/schemas/guideSchema.ts` e `server/domain/partners/schemas/partnerContentSchema.ts` | §5.3 | baixo — as duas cópias precisam mudar juntas | rotas de conteúdo do parceiro passarem a validar com o schema publicado pelo `guide` (Published Language) |
 | B21 | `package-lock.json`: `npm audit --omit=dev` aponta 10 vulnerabilidades (1 crítica, 7 altas) em `firebase`, `@firebase/firestore`, `@grpc/grpc-js`, `gaxios`, `proxy-addr`, `uuid` e outras | §7.4 e §7.10 A06 (sem high/critical para merge) | alto — já existiam antes do Prompt 18.3.0a; a dependência nova (`@google-cloud/kms` 6.2.1) não acrescentou nenhuma | prompt próprio de atualização de dependências, testando cada salto de versão |
-| B22 | `listingVerificationService.assertCanSell`: até o Prompt 18.4, só o primeiro CNPJ aprovado de cada conta vende (`SALES_DOCUMENT_MISMATCH`) | D12 (P8): repasse por documento | médio — conta com dois CNPJs só vende por um deles | Prompt 18.4: conta Stripe por documento |
 | B25 | `src/index.css`: o tema claro ainda depende de sobrescritas globais com `!important` (`:root.light .text-white`, `.bg-white/5`, `.border-white/10`…) para as telas que usam cores fixas; `biome-ignore-all lint/complexity/noImportantStyles` no topo do arquivo | §11.1 (tokens, nunca `text-white` fixo em superfície que muda) e §13 (sem avisos) | médio — cor nova sem token pode sair ilegível no claro; as sobrescritas valem para o app todo | cada tela tocada passa a usar os tokens `--ug-*` (`text-ink`, `bg-surface`, `border-line`, `text-warn`…); quando nenhuma usar mais as classes fixas, as sobrescritas e o `biome-ignore-all` saem |
+| B26 | Avisos de conta financeira no painel de ingressos (`usePartnerMerchantAccount`) e de reservas (`PartnerBookingsComposition`): consideram pronto quando **algum** CNPJ da conta está pronto para receber, não o CNPJ do evento ou da oferta | D14 (conta por documento) | baixo — só o aviso na tela; a venda e a publicação conferem a conta do CNPJ certo no backend (`assertListingCanSellUseCase` + `assertPaymentAccountReadyUseCase`) | Prompt 18.4e: aviso por estabelecimento; `PartnerEventTicketingManager` (1111 linhas) dividido ao tocar |
 
 ## Resolvidos
 
 | ID | Resolução |
 |---|---|
+| B22 | Prompt 18.4a (D14): cada CNPJ aprovado vende pela própria conta Stripe Express (`paymentAccounts/{accountKey}`, `accountKey` = índice cego do CNPJ); `verificationOwners` e o "documento de vendas da conta" saíram; a conta é criada com o CNPJ da verificação pré-preenchido para o Stripe conferir a empresa |
 | B24 | Prompt 18.3b: excluir o estabelecimento cancela na hora a assinatura dele no Stripe (`planSubscriptions/{itemId}`); excluir a conta cancela todas as assinaturas vivas dela antes de apagar os planos |
 | B23 | Prompt 18.3.0b (D12, P0): a conta do parceiro deixou de ter documento — o cadastro envia só `termsAccepted`; `partners/{uid}.cpfCnpj`, `cpfCnpjClean` e a coleção `partnerDocumentKeys` saíram do código, das regras e dos testes (resolve também o débito do §7.7); o status `pending` da conta saiu (só `active` e `suspended`); CPF/CNPJ existe apenas, cifrado e com índice cego, na verificação de cada estabelecimento (18.3.0a); `PartnersModal` dividido (529 → 257 linhas), com as condições de cada etapa em `utils/signupStepGates.ts` |
 | Erro no modal de detalhe e métricas zeradas — Prompt 18.2.3 | decisão de 2026-10-19 (opção B): `/api/insights/track` aceita visitante sem login (o token só é anexado quando há usuário); cada item grava dois contadores por dia (`viewsSignedIn`, `viewsAnonymous`) em `interactionStats`, sem uid nem IP; repetição em 30 min não soma (guarda `interactionGuards` com chave HMAC de uid/IP e TTL em `expiresAt`); o relatório mostra o total e a divisão em percentual; `/api/insights/stats/:colecao/:id` exige login e checa o dono no backend (antes o cliente chamava sem token e recebia sempre zero); `ReportsView` dividido e traduzido (sai de B16); `trust proxy` com número de proxies de `TRUST_PROXY_HOPS` (§7.4); handler global de erros do `server.ts` deixou de devolver `err.message` (§7.10 A05); `src/shared/lib/insights.ts` (sem uso, `shared → domain`) removido |

=== firestore.rules — diff ===
@@ -62,7 +62,8 @@ service cloud.firestore {
     match /eventWaitlistEntries/{entryId} {
       allow read, write: if false;
     }
-    match /paymentConnectedAccounts/{partnerId} {
+    // Conta Stripe de cada CNPJ (D14): só backend; o parceiro vê o status pela API.
+    match /paymentAccounts/{accountKey} {
       allow read, write: if false;
     }
     match /planSubscriptions/{itemId} {
@@ -153,9 +154,6 @@ service cloud.firestore {
     match /verificationDocuments/{documentIndex} {
       allow read, write: if false;
     }
-    match /verificationOwners/{ownerId} {
-      allow read, write: if false;
-    }
     // Plano de cada estabelecimento (D11): só backend; o cliente lê a cópia pública do selo no item.
     match /listingPlans/{itemId} {
       allow read, write: if false;

=== firestore.rules.security.test.ts — diff ===
@@ -345,15 +345,22 @@ describe('Firestore Rules — Security Suite', () => {
       await assertFails(deleteDoc(doc(db, 'transactions/tx-1')));
     });
 
-    it('verificação (D12): listingVerifications, verificationDocuments e verificationOwners negados até para o dono e admin', async () => {
+    it('verificação (D12): listingVerifications e verificationDocuments negados até para o dono e admin', async () => {
       const adminDb = testEnv.authenticatedContext('admin-user', { admin: true }).firestore();
       const ownerDb = testEnv.authenticatedContext('partner-1').firestore();
       for (const db of [adminDb, ownerDb]) {
         await assertFails(getDoc(doc(db, 'listingVerifications/item-1')));
         await assertFails(getDoc(doc(db, 'verificationDocuments/idx-1')));
-        await assertFails(getDoc(doc(db, 'verificationOwners/partner-1')));
         await assertFails(setDoc(doc(db, 'listingVerifications/item-1'), { status: 'approved' }));
-        await assertFails(setDoc(doc(db, 'verificationOwners/partner-1'), { salesDocumentIndex: 'x' }));
+      }
+    });
+
+    it('conta de recebimento (D14): paymentAccounts negado até para o dono e admin', async () => {
+      const adminDb = testEnv.authenticatedContext('admin-user', { admin: true }).firestore();
+      const ownerDb = testEnv.authenticatedContext('partner-1').firestore();
+      for (const db of [adminDb, ownerDb]) {
+        await assertFails(getDoc(doc(db, 'paymentAccounts/idx-1')));
+        await assertFails(setDoc(doc(db, 'paymentAccounts/idx-1'), { ownerUid: 'partner-1' }));
       }
     });

=== server.ts — diff ===
@@ -23,6 +23,7 @@ import billingRouter from './server/interfaces/http/billing/billingRoutes';
 import listingVerificationRouter from './server/interfaces/http/listingVerifications/listingVerificationRoutes';
 import listingStatsRouter from './server/interfaces/http/insights/listingStatsRoutes';
 import listingPlanRouter from './server/interfaces/http/listingPlans/listingPlanRoutes';
+import paymentAccountRouter from './server/interfaces/http/paymentAccounts/paymentAccountRoutes';
 import {
   bookingsRouter,
   partnerOffersRouter,
@@ -192,6 +193,7 @@ async function startServer() {
   // 5. Normal routes
   app.use('/api/bookings', bookingsRouter);
   app.use('/api/payment/plans', billingRouter);
+  app.use('/api/payment-accounts', paymentAccountRouter);
   app.use('/api/payment', paymentRouter);
   app.use('/api/weather', climaWindRouter);
   app.use('/api/notifications', notificationRouter);

=== server/application/usecases/bookings/bookingApplicationUseCases.test.ts — diff ===
@@ -56,7 +56,10 @@ const INPUT = {
 const BUYER = { uid: 'buyer-1', admin: false, emailVerified: true };
 
 describe('createBookingApplicationUseCase', () => {
-  beforeEach(() => vi.clearAllMocks());
+  beforeEach(() => {
+    vi.clearAllMocks();
+    vi.mocked(assertListingCanSellUseCase).mockResolvedValue({ accountKey: 'key-cnpj-1' });
+  });
 
   it('e-mail não verificado → EMAIL_NOT_VERIFIED, sem reservar vaga', async () => {
     await expect(
@@ -76,6 +79,7 @@ describe('createBookingApplicationUseCase', () => {
         referenceType: 'booking',
         referenceId: 'bk_1',
         sellerPartnerId: 'p1',
+        sellerAccountKey: 'key-cnpj-1',
         totalMinor: 20000,
         platformFeeMinor: 2000,
         idempotencyKey: 'pi_booking_bk_1',

=== server/application/usecases/bookings/createBookingApplicationUseCase.ts — diff ===
@@ -47,12 +47,13 @@ export async function createBookingApplicationUseCase(
       );
     }
     // Rechecado na compra: a verificação pode ter sido revista depois de a oferta ser publicada.
-    await assertListingCanSellUseCase(booking.guideItemId);
+    const { accountKey } = await assertListingCanSellUseCase(booking.guideItemId);
     const payment = await createMarketplacePaymentIntentUseCase({
       referenceType: 'booking',
       referenceId: booking.id,
       buyerId: buyer.uid,
       sellerPartnerId: booking.sellerPartnerId,
+      sellerAccountKey: accountKey,
       description: `Use Guide — ${booking.offerSnapshot.title}`,
       totalMinor: booking.totalMinor,
       platformFeeMinor: booking.platformFeeMinor,

=== server/application/usecases/bookings/setBookableOfferStatusApplicationUseCase.test.ts — diff ===
@@ -4,13 +4,15 @@ vi.mock('../../../domain/bookings', async () => {
   const { BookingDomainError } = await import('../../../domain/bookings/errors/bookingDomainError');
   return { BookingDomainError, setBookableOfferStatusUseCase: vi.fn() };
 });
-vi.mock('../../../domain/payment', () => ({ assertPartnerReadyForPaidEventUseCase: vi.fn() }));
+vi.mock('../../../domain/payment', () => ({ assertPaymentAccountReadyUseCase: vi.fn() }));
 vi.mock('../isPartnerSuspended', () => ({ isPartnerSuspended: vi.fn() }));
-vi.mock('../../../domain/partners', () => ({ assertListingCanSellUseCase: vi.fn() }));
+vi.mock('../../../domain/partners', () => ({
+  assertListingCanSellUseCase: vi.fn().mockResolvedValue({ accountKey: 'key-cnpj-1' }),
+}));
 
 import { setBookableOfferStatusUseCase } from '../../../domain/bookings';
 import { assertListingCanSellUseCase } from '../../../domain/partners';
-import { assertPartnerReadyForPaidEventUseCase } from '../../../domain/payment';
+import { assertPaymentAccountReadyUseCase } from '../../../domain/payment';
 import { isPartnerSuspended } from '../isPartnerSuspended';
 import { setBookableOfferStatusApplicationUseCase } from './setBookableOfferStatusApplicationUseCase';
 
@@ -29,12 +31,13 @@ describe('setBookableOfferStatusApplicationUseCase', () => {
   beforeEach(() => {
     vi.clearAllMocks();
     vi.mocked(isPartnerSuspended).mockResolvedValue(false);
+    vi.mocked(assertListingCanSellUseCase).mockResolvedValue({ accountKey: 'key-cnpj-1' });
   });
 
-  it('publica quando o parceiro está ativo e o Stripe está pronto', async () => {
+  it('publica quando o parceiro está ativo e a conta do CNPJ está pronta (D14)', async () => {
     await setBookableOfferStatusApplicationUseCase(ACTOR, 'o1', 'published');
     await runPublishGuard();
-    expect(assertPartnerReadyForPaidEventUseCase).toHaveBeenCalledWith('p1');
+    expect(assertPaymentAccountReadyUseCase).toHaveBeenCalledWith('key-cnpj-1');
     expect(assertListingCanSellUseCase).toHaveBeenCalledWith('item-1');
   });
 
@@ -44,11 +47,11 @@ describe('setBookableOfferStatusApplicationUseCase', () => {
     );
     await setBookableOfferStatusApplicationUseCase(ACTOR, 'o1', 'published');
     await expect(runPublishGuard()).rejects.toMatchObject({ code: 'LISTING_NOT_VERIFIED' });
-    expect(assertPartnerReadyForPaidEventUseCase).not.toHaveBeenCalled();
+    expect(assertPaymentAccountReadyUseCase).not.toHaveBeenCalled();
   });
 
   it('Stripe não pronto: a publicação é recusada', async () => {
-    vi.mocked(assertPartnerReadyForPaidEventUseCase).mockRejectedValue(
+    vi.mocked(assertPaymentAccountReadyUseCase).mockRejectedValue(
       Object.assign(new Error('Conclua a configuração financeira.'), {
         code: 'SELLER_ACCOUNT_NOT_ELIGIBLE',
       })
@@ -61,6 +64,6 @@ describe('setBookableOfferStatusApplicationUseCase', () => {
     vi.mocked(isPartnerSuspended).mockResolvedValue(true);
     await setBookableOfferStatusApplicationUseCase(ACTOR, 'o1', 'published');
     await expect(runPublishGuard()).rejects.toMatchObject({ code: 'PARTNER_SUSPENDED' });
-    expect(assertPartnerReadyForPaidEventUseCase).not.toHaveBeenCalled();
+    expect(assertPaymentAccountReadyUseCase).not.toHaveBeenCalled();
   });
 });

=== server/application/usecases/bookings/setBookableOfferStatusApplicationUseCase.ts — diff ===
@@ -6,12 +6,12 @@ import {
   setBookableOfferStatusUseCase,
 } from '../../../domain/bookings';
 import { assertListingCanSellUseCase } from '../../../domain/partners';
-import { assertPartnerReadyForPaidEventUseCase } from '../../../domain/payment';
+import { assertPaymentAccountReadyUseCase } from '../../../domain/payment';
 import { isPartnerSuspended } from '../isPartnerSuspended';
 
 /**
- * Publicar exige parceiro ativo, estabelecimento verificado com CNPJ (D12) e conta Stripe pronta para
- * vender (D8): sem isso o turista veria uma oferta pública cujo pagamento falha.
+ * Publicar exige parceiro ativo, estabelecimento verificado com CNPJ (D12) e a conta Stripe desse CNPJ
+ * pronta para receber (D14): sem isso o turista veria uma oferta pública cujo pagamento falha.
  */
 export async function setBookableOfferStatusApplicationUseCase(
   actor: BookingActor,
@@ -25,7 +25,7 @@ export async function setBookableOfferStatusApplicationUseCase(
         'Conta de parceiro suspensa: não é possível publicar ofertas.'
       );
     }
-    await assertListingCanSellUseCase(offer.guideItemId);
-    await assertPartnerReadyForPaidEventUseCase(offer.partnerId);
+    const { accountKey } = await assertListingCanSellUseCase(offer.guideItemId);
+    await assertPaymentAccountReadyUseCase(accountKey);
   });
 }

=== server/application/usecases/createTicketOrderPaymentIntentApplicationUseCase.test.ts — diff ===
@@ -46,6 +46,7 @@ const ORDER = {
 describe('createTicketOrderPaymentIntentApplicationUseCase (D12)', () => {
   beforeEach(() => {
     vi.clearAllMocks();
+    mocks.assertCanSell.mockResolvedValue({ accountKey: 'key-cnpj-1' });
     mocks.getOrder.mockResolvedValue({ order: ORDER });
     mocks.getListing.mockResolvedValue({
       id: 'ev-1',
@@ -66,7 +67,9 @@ describe('createTicketOrderPaymentIntentApplicationUseCase (D12)', () => {
       { orderId: 'ord-1', idempotencyKey: 'k-12345678' }
     );
     expect(mocks.assertCanSell).toHaveBeenCalledWith('item-1');
-    expect(mocks.createPayment).toHaveBeenCalled();
+    expect(mocks.createPayment).toHaveBeenCalledWith(
+      expect.objectContaining({ sellerAccountKey: 'key-cnpj-1' })
+    );
   });
 
   it('estabelecimento não verificado: não cria o pagamento', async () => {

=== server/application/usecases/createTicketOrderPaymentIntentApplicationUseCase.ts — diff ===
@@ -81,8 +81,11 @@ export async function createTicketOrderPaymentIntentApplicationUseCase(
   }
 
   // Ingresso pago só de evento cujo estabelecimento ou perfil de produtor foi verificado (D12).
+  let sellerAccountKey: string;
   try {
-    await assertListingCanSellUseCase(listing.establishmentId ?? '');
+    ({ accountKey: sellerAccountKey } = await assertListingCanSellUseCase(
+      listing.establishmentId ?? ''
+    ));
   } catch (error) {
     if (error instanceof ListingVerificationError) {
       throw new TicketingDomainError(
@@ -97,6 +100,7 @@ export async function createTicketOrderPaymentIntentApplicationUseCase(
     orderId: order.id,
     buyerId: order.buyerId,
     sellerPartnerId: partnerId,
+    sellerAccountKey,
     eventListingId: order.eventListingId,
     occurrenceId: order.occurrenceId,
     eventTitle: order.eventSnapshot?.title || listing.title,

=== server/application/usecases/paymentAccounts/listPartnerPaymentAccountsApplicationUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { listOwnerSalesDocumentsUseCase } from '../../../domain/partners';
import { listOwnerPaymentAccountsUseCase, type PaymentAccountView } from '../../../domain/payment';

export interface PartnerPaymentAccount {
  accountKey: string;
  maskedDocument: string;
  itemIds: string[];
  /** `null` enquanto o parceiro não começou o cadastro no Stripe deste CNPJ. */
  account: PaymentAccountView | null;
}

/** Um cartão por CNPJ aprovado do parceiro, com a conta Stripe dele quando já existe (D14). */
export async function listPartnerPaymentAccountsApplicationUseCase(
  ownerUid: string
): Promise<PartnerPaymentAccount[]> {
  const [documents, accounts] = await Promise.all([
    listOwnerSalesDocumentsUseCase(ownerUid),
    listOwnerPaymentAccountsUseCase(ownerUid),
  ]);
  const byKey = new Map(accounts.map((account) => [account.accountKey, account]));
  return documents.map((document) => ({
    accountKey: document.accountKey,
    maskedDocument: document.maskedDocument,
    itemIds: document.itemIds,
    account: byKey.get(document.accountKey) ?? null,
  }));
}

=== server/application/usecases/paymentAccounts/paymentAccountApplicationUseCases.test.ts — ARQUIVO NOVO, conteúdo completo ===
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../../domain/partners', () => ({
  listOwnerSalesDocumentsUseCase: vi.fn(),
  getOwnerSalesDocumentUseCase: vi.fn(),
}));
vi.mock('../../../domain/payment', () => ({
  listOwnerPaymentAccountsUseCase: vi.fn(),
  createPaymentAccountSessionUseCase: vi.fn(),
}));

import {
  getOwnerSalesDocumentUseCase,
  listOwnerSalesDocumentsUseCase,
} from '../../../domain/partners';
import {
  createPaymentAccountSessionUseCase,
  listOwnerPaymentAccountsUseCase,
} from '../../../domain/payment';
import { listPartnerPaymentAccountsApplicationUseCase } from './listPartnerPaymentAccountsApplicationUseCase';
import { startPaymentAccountSessionApplicationUseCase } from './startPaymentAccountSessionApplicationUseCase';

const READY_VIEW = {
  accountKey: 'key-1',
  status: 'enabled' as const,
  chargesEnabled: true,
  payoutsEnabled: true,
  detailsSubmitted: true,
  requirementsDueCount: 0,
  readyForSales: true,
};

describe('contas de recebimento por CNPJ (D14)', () => {
  beforeEach(() => vi.clearAllMocks());

  it('lista um cartão por CNPJ aprovado, com a conta quando já existe', async () => {
    vi.mocked(listOwnerSalesDocumentsUseCase).mockResolvedValue([
      { accountKey: 'key-1', maskedDocument: '**.***.***/0001-81', itemIds: ['item-1'] },
      { accountKey: 'key-2', maskedDocument: '**.***.***/0001-61', itemIds: ['item-2'] },
    ]);
    vi.mocked(listOwnerPaymentAccountsUseCase).mockResolvedValue([READY_VIEW]);
    const result = await listPartnerPaymentAccountsApplicationUseCase('owner-1');
    expect(result).toEqual([
      {
        accountKey: 'key-1',
        maskedDocument: '**.***.***/0001-81',
        itemIds: ['item-1'],
        account: READY_VIEW,
      },
      {
        accountKey: 'key-2',
        maskedDocument: '**.***.***/0001-61',
        itemIds: ['item-2'],
        account: null,
      },
    ]);
  });

  it('a sessão usa o CNPJ da verificação do próprio parceiro', async () => {
    vi.mocked(getOwnerSalesDocumentUseCase).mockResolvedValue('11222333000181');
    vi.mocked(createPaymentAccountSessionUseCase).mockResolvedValue({ clientSecret: 'cs' });
    await startPaymentAccountSessionApplicationUseCase(
      { uid: 'owner-1', email: 'dono@pousada.test' },
      'key-1'
    );
    expect(getOwnerSalesDocumentUseCase).toHaveBeenCalledWith('owner-1', 'key-1');
    expect(createPaymentAccountSessionUseCase).toHaveBeenCalledWith({
      accountKey: 'key-1',
      ownerUid: 'owner-1',
      email: 'dono@pousada.test',
      companyTaxId: '11222333000181',
    });
  });

  it('CNPJ de outro parceiro: nenhuma conta é criada', async () => {
    vi.mocked(getOwnerSalesDocumentUseCase).mockRejectedValue(
      Object.assign(new Error('Documento de vendas não encontrado.'), { code: 'NOT_FOUND' })
    );
    await expect(
      startPaymentAccountSessionApplicationUseCase({ uid: 'intruso', email: '' }, 'key-1')
    ).rejects.toMatchObject({ code: 'NOT_FOUND' });
    expect(createPaymentAccountSessionUseCase).not.toHaveBeenCalled();
  });
});

=== server/application/usecases/paymentAccounts/startPaymentAccountSessionApplicationUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { getOwnerSalesDocumentUseCase } from '../../../domain/partners';
import { createPaymentAccountSessionUseCase } from '../../../domain/payment';

/**
 * Abre o cadastro no Stripe da conta de um CNPJ do próprio parceiro. O CNPJ vem da verificação aprovada
 * (nunca do cliente) e vai pré-preenchido para o Stripe conferir que a conta é dessa empresa (D14).
 */
export async function startPaymentAccountSessionApplicationUseCase(
  owner: { uid: string; email: string },
  accountKey: string
): Promise<{ clientSecret: string }> {
  const companyTaxId = await getOwnerSalesDocumentUseCase(owner.uid, accountKey);
  return createPaymentAccountSessionUseCase({
    accountKey,
    ownerUid: owner.uid,
    email: owner.email,
    companyTaxId,
  });
}

=== server/application/usecases/reconcileStripeWebhookEventApplicationUseCase.ts — diff ===
@@ -1,6 +1,6 @@
 import { createNotificationUseCase } from '../../domain/notifications';
 import {
-  syncConnectedAccountFromWebhookUseCase,
+  syncPaymentAccountFromWebhookUseCase,
   updatePaymentTransactionStatusUseCase,
   type VerifiedWebhookEvent,
 } from '../../domain/payment';
@@ -29,7 +29,7 @@ export async function reconcileStripeWebhookEventApplicationUseCase(
   if (event.type === 'account.updated') {
     const stripeAccountId = String(obj.id || event.account || '');
     if (stripeAccountId) {
-      await syncConnectedAccountFromWebhookUseCase(stripeAccountId);
+      await syncPaymentAccountFromWebhookUseCase(stripeAccountId);
     }
     return { processed: true, eventType: event.type };
   }

=== server/domain/partners/adapters/firestoreListingVerificationAdapter.ts — diff ===
@@ -13,7 +13,6 @@ import type {
 
 const VERIFICATIONS = 'listingVerifications';
 const DOCUMENTS = 'verificationDocuments';
-const OWNERS = 'verificationOwners';
 
 function toRecord(data: DocumentData): ListingVerificationRecord {
   return data as ListingVerificationRecord;
@@ -77,23 +76,13 @@ export class FirestoreListingVerificationAdapter implements ListingVerificationR
 
   async saveReview(record: ListingVerificationRecord): Promise<void> {
     await adminDb.runTransaction(async (transaction) => {
-      const ownerRef = adminDb.collection(OWNERS).doc(record.ownerId);
-      const ownerSnapshot = await transaction.get(ownerRef);
       transaction.set(adminDb.collection(VERIFICATIONS).doc(record.itemId), record);
       if (record.status !== 'approved' || !record.documentIndex) return;
-
       transaction.set(
         adminDb.collection(DOCUMENTS).doc(record.documentIndex),
         { verifiedAt: record.reviewedAt },
         { merge: true }
       );
-      if (record.documentType === 'cnpj' && !ownerSnapshot.get('salesDocumentIndex')) {
-        transaction.set(
-          ownerRef,
-          { ownerId: record.ownerId, salesDocumentIndex: record.documentIndex },
-          { merge: true }
-        );
-      }
     });
   }
 
@@ -127,10 +116,9 @@ export class FirestoreListingVerificationAdapter implements ListingVerificationR
     return snapshot.docs.map((doc) => doc.id);
   }
 
-  async getSalesDocumentIndex(ownerId: string): Promise<string | null> {
-    const snapshot = await adminDb.collection(OWNERS).doc(ownerId).get();
-    const value = snapshot.get('salesDocumentIndex');
-    return typeof value === 'string' ? value : null;
+  async listByOwner(ownerId: string): Promise<ListingVerificationRecord[]> {
+    const snapshot = await adminDb.collection(VERIFICATIONS).where('ownerId', '==', ownerId).get();
+    return snapshot.docs.map((doc) => toRecord(doc.data()));
   }
 
   async delete(itemId: string): Promise<ListingVerificationRecord | null> {
@@ -152,7 +140,6 @@ export class FirestoreListingVerificationAdapter implements ListingVerificationR
     ]);
     const batch = adminDb.batch();
     for (const doc of [...records.docs, ...entries.docs]) batch.delete(doc.ref);
-    batch.delete(adminDb.collection(OWNERS).doc(ownerId));
     await batch.commit();
     return records.docs.map((doc) => toRecord(doc.data()));
   }

=== server/domain/partners/errors/listingVerificationError.ts — diff ===
@@ -7,8 +7,7 @@ export type ListingVerificationErrorCode =
   | 'ALREADY_VERIFIED'
   | 'NOT_PENDING'
   | 'LISTING_NOT_VERIFIED'
-  | 'CPF_CANNOT_SELL'
-  | 'SALES_DOCUMENT_MISMATCH';
+  | 'CPF_CANNOT_SELL';
 
 const STATUS: Record<ListingVerificationErrorCode, number> = {
   VALIDATION_ERROR: 400,
@@ -20,7 +19,6 @@ const STATUS: Record<ListingVerificationErrorCode, number> = {
   NOT_PENDING: 409,
   LISTING_NOT_VERIFIED: 422,
   CPF_CANNOT_SELL: 422,
-  SALES_DOCUMENT_MISMATCH: 422,
 };
 
 export class ListingVerificationError extends Error {

=== server/domain/partners/index.ts — diff ===
@@ -14,6 +14,8 @@ export { listListingVerificationsUseCase } from './usecases/listListingVerificat
 export { getListingVerificationFilePathUseCase } from './usecases/getListingVerificationFilePathUseCase';
 export { getListingVerificationStatusUseCase } from './usecases/getListingVerificationStatusUseCase';
 export { assertListingCanSellUseCase } from './usecases/assertListingCanSellUseCase';
+export { listOwnerSalesDocumentsUseCase } from './usecases/listOwnerSalesDocumentsUseCase';
+export { getOwnerSalesDocumentUseCase } from './usecases/getOwnerSalesDocumentUseCase';
 export { deleteListingVerificationUseCase } from './usecases/deleteListingVerificationUseCase';
 export { deleteOwnerListingVerificationsUseCase } from './usecases/deleteOwnerListingVerificationsUseCase';
 export { listLinkedListingIdsUseCase } from './usecases/listLinkedListingIdsUseCase';
@@ -46,11 +48,13 @@ export type {
 export type {
   ListingDocumentType,
   ListingHolderRole,
+  ListingSalesAccount,
   ListingVerificationFiles,
   ListingVerificationStatus,
   ListingVerificationView,
   SubmitListingVerificationInput,
   VerificationDecision,
+  OwnerSalesDocument,
   VerificationListing,
 } from './types/listingVerification';

=== server/domain/partners/ports/listingVerificationRepositoryPort.ts — diff ===
@@ -17,14 +17,14 @@ export interface ListingVerificationRepositoryPort {
    * usado por outro estabelecimento; libera o CNPJ anterior quando o estabelecimento troca de documento.
    */
   saveSubmission(record: ListingVerificationRecord): Promise<void>;
-  /** Aprovação marca o documento como conferido e, no primeiro CNPJ aprovado, fixa o documento de vendas da conta. */
+  /** Aprovação marca o documento como conferido. */
   saveReview(record: ListingVerificationRecord): Promise<void>;
   listByStatus(
     status: ListingVerificationStatus,
     limit: number,
     cursor: string | null
   ): Promise<ListingVerificationPage>;
-  getSalesDocumentIndex(ownerId: string): Promise<string | null>;
+  listByOwner(ownerId: string): Promise<ListingVerificationRecord[]>;
   /** Perfis de produtor que usam o documento deste estabelecimento (modo `linked`). */
   listLinkedItemIds(sourceItemId: string): Promise<string[]>;
   /** Apaga o registro e libera o CNPJ; devolve o registro apagado (para remover os arquivos). */

=== server/domain/partners/services/listingVerificationService.test.ts — diff ===
@@ -15,7 +15,6 @@ const CPF = '529.982.247-25';
 class InMemoryRepository implements ListingVerificationRepositoryPort {
   records = new Map<string, ListingVerificationRecord>();
   entries = new Map<string, VerificationDocumentEntry>();
-  salesDocuments = new Map<string, string>();
 
   async get(itemId: string) {
     return this.records.get(itemId) ?? null;
@@ -45,9 +44,6 @@ class InMemoryRepository implements ListingVerificationRepositoryPort {
     if (record.status === 'approved' && record.documentIndex) {
       const entry = this.entries.get(record.documentIndex);
       if (entry) entry.verifiedAt = record.reviewedAt;
-      if (record.documentType === 'cnpj' && !this.salesDocuments.has(record.ownerId)) {
-        this.salesDocuments.set(record.ownerId, record.documentIndex);
-      }
     }
   }
   async listByStatus(status: string) {
@@ -61,8 +57,8 @@ class InMemoryRepository implements ListingVerificationRepositoryPort {
       .filter((r) => r.sourceItemId === sourceItemId)
       .map((r) => r.itemId);
   }
-  async getSalesDocumentIndex(ownerId: string) {
-    return this.salesDocuments.get(ownerId) ?? null;
+  async listByOwner(ownerId: string) {
+    return [...this.records.values()].filter((r) => r.ownerId === ownerId);
   }
   async delete(itemId: string) {
     const record = this.records.get(itemId) ?? null;
@@ -271,7 +267,8 @@ describe('ListingVerificationService (D12)', () => {
     it('libera CNPJ aprovado', async () => {
       await submitCnpj();
       await service.review(admin, 'item-1', 'approve', null);
-      await expect(service.assertCanSell('item-1')).resolves.toBeUndefined();
+      const sale = await service.assertCanSell('item-1');
+      expect(sale.accountKey).toEqual(expect.any(String));
     });
 
     it('CPF não vende', async () => {
@@ -293,13 +290,40 @@ describe('ListingVerificationService (D12)', () => {
       });
     });
 
-    it('até o 18.4, só o primeiro CNPJ aprovado da conta vende', async () => {
+    it('cada CNPJ aprovado vende pela própria conta (D14)', async () => {
       await submitCnpj(pousada, CNPJ);
       await service.review(admin, 'item-1', 'approve', null);
       await submitCnpj(restaurante, CNPJ_2);
       await service.review(admin, 'item-2', 'approve', null);
-      await expect(service.assertCanSell('item-2')).rejects.toMatchObject({
-        code: 'SALES_DOCUMENT_MISMATCH',
+      const first = await service.assertCanSell('item-1');
+      const second = await service.assertCanSell('item-2');
+      expect(first.accountKey).not.toBe(second.accountKey);
+    });
+  });
+
+  describe('documentos de vendas (D14)', () => {
+    it('lista só CNPJs aprovados, com o perfil de produtor junto do estabelecimento de origem', async () => {
+      await submitCnpj(pousada, CNPJ);
+      await service.review(admin, 'item-1', 'approve', null);
+      await submitCnpj(restaurante, CNPJ_2);
+      await service.submit(owner, produtor, { mode: 'linked', sourceItemId: 'item-1' }, pousada);
+      const documents = await service.listSalesDocuments('owner-1');
+      expect(documents).toHaveLength(1);
+      expect(documents[0]?.itemIds.sort()).toEqual(['item-1', 'item-3']);
+      expect(documents[0]?.maskedDocument).not.toContain(CNPJ.slice(0, 8));
+      expect(await service.listSalesDocuments('owner-2')).toEqual([]);
+    });
+
+    it('devolve o CNPJ só para o dono do documento aprovado', async () => {
+      await submitCnpj(pousada, CNPJ);
+      await service.review(admin, 'item-1', 'approve', null);
+      const [document] = await service.listSalesDocuments('owner-1');
+      const accountKey = document?.accountKey ?? '';
+      await expect(service.getSalesDocument('owner-1', accountKey)).resolves.toEqual(
+        expect.any(String)
+      );
+      await expect(service.getSalesDocument('owner-2', accountKey)).rejects.toMatchObject({
+        code: 'NOT_FOUND',
       });
     });
   });

=== server/domain/partners/services/listingVerificationService.ts — diff ===
@@ -9,7 +9,9 @@ import type {
   ListingVerificationFiles,
   ListingVerificationRecord,
   ListingVerificationStatus,
+  ListingSalesAccount,
   ListingVerificationView,
+  OwnerSalesDocument,
   SubmitListingVerificationInput,
   VerificationDecision,
   VerificationListing,
@@ -139,10 +141,10 @@ export class ListingVerificationService {
   }
 
   /**
-   * Venda exige estabelecimento verificado com CNPJ (D12). Até o Prompt 18.4 (conta Stripe por documento),
-   * só vende o CNPJ fixado como documento de vendas da conta, para o dinheiro não cair em outra empresa.
+   * Venda exige estabelecimento verificado com CNPJ (D12). Devolve a conta de recebimento do documento:
+   * cada CNPJ recebe na própria conta Stripe (D14).
    */
-  async assertCanSell(itemId: string): Promise<void> {
+  async assertCanSell(itemId: string): Promise<ListingSalesAccount> {
     const stored = await this.repository.get(itemId);
     const record = stored ? await this.resolve(stored) : null;
     if (record?.status !== 'approved') {
@@ -151,19 +153,56 @@ export class ListingVerificationService {
         'O estabelecimento precisa ser verificado pelo Use Guide antes de vender.'
       );
     }
-    if (record.documentType !== 'cnpj') {
+    if (record.documentType !== 'cnpj' || !record.documentIndex) {
       throw new ListingVerificationError(
         'CPF_CANNOT_SELL',
         'Para vender é preciso cadastrar o estabelecimento com CNPJ (MEI serve).'
       );
     }
-    const salesDocument = await this.repository.getSalesDocumentIndex(record.ownerId);
-    if (salesDocument && salesDocument !== record.documentIndex) {
-      throw new ListingVerificationError(
-        'SALES_DOCUMENT_MISMATCH',
-        'Por enquanto só um CNPJ por conta pode vender.'
-      );
+    return { accountKey: record.documentIndex };
+  }
+
+  /** CNPJs aprovados da conta, cada um com os cadastros (e perfis de produtor) que vendem por ele. */
+  async listSalesDocuments(ownerId: string): Promise<OwnerSalesDocument[]> {
+    const records = await Promise.all(
+      (await this.repository.listByOwner(ownerId)).map((record) => this.resolve(record))
+    );
+    const byAccount = new Map<string, OwnerSalesDocument>();
+    for (const record of records) {
+      if (record.status !== 'approved' || record.documentType !== 'cnpj') continue;
+      if (!record.documentIndex || !record.maskedDocument) continue;
+      const entry = byAccount.get(record.documentIndex) ?? {
+        accountKey: record.documentIndex,
+        maskedDocument: record.maskedDocument,
+        itemIds: [],
+      };
+      entry.itemIds.push(record.itemId);
+      byAccount.set(record.documentIndex, entry);
+    }
+    return [...byAccount.values()];
+  }
+
+  /**
+   * CNPJ em texto puro, só para pré-preencher a conta Stripe do próprio documento (o Stripe confere o
+   * CNPJ no cadastro). Nunca sai do backend.
+   */
+  async getSalesDocument(ownerId: string, accountKey: string): Promise<string> {
+    const records = await this.repository.listByOwner(ownerId);
+    const record = records.find(
+      (candidate) =>
+        candidate.mode === 'document' &&
+        candidate.status === 'approved' &&
+        candidate.documentType === 'cnpj' &&
+        candidate.documentIndex === accountKey &&
+        candidate.document
+    );
+    if (!record?.document) {
+      throw new ListingVerificationError('NOT_FOUND', 'Documento de vendas não encontrado.');
     }
+    return this.encryption.decrypt(record.document, {
+      documentId: record.itemId,
+      field: 'document',
+    });
   }
 
   /** Perfis de produtor ligados a este estabelecimento: herdam a verificação dele. */

=== server/domain/partners/types/listingVerification.ts — diff ===
@@ -76,3 +76,14 @@ export interface ListingVerificationView {
 }
 
 export type VerificationDecision = 'approve' | 'reject';
+
+/** Conta de recebimento de quem vende: `accountKey` é o índice cego do CNPJ (D14). */
+export interface ListingSalesAccount {
+  accountKey: string;
+}
+
+export interface OwnerSalesDocument {
+  accountKey: string;
+  maskedDocument: string;
+  itemIds: string[];
+}

=== server/domain/partners/usecases/assertListingCanSellUseCase.ts — diff ===
@@ -1,6 +1,10 @@
 import { getListingVerificationService } from '../factory';
+import type { ListingSalesAccount } from '../types/listingVerification';
 
-/** Lança `ListingVerificationError` (422) quando o estabelecimento ainda não pode vender (D12). */
-export function assertListingCanSellUseCase(itemId: string): Promise<void> {
+/**
+ * Lança `ListingVerificationError` (422) quando o estabelecimento ainda não pode vender (D12); devolve a
+ * conta de recebimento do CNPJ dele (D14).
+ */
+export function assertListingCanSellUseCase(itemId: string): Promise<ListingSalesAccount> {
   return getListingVerificationService().assertCanSell(itemId);
 }

=== server/domain/partners/usecases/getOwnerSalesDocumentUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { getListingVerificationService } from '../factory';

/** CNPJ descriptografado do próprio parceiro, só para pré-preencher a conta Stripe do documento (D14). */
export function getOwnerSalesDocumentUseCase(ownerId: string, accountKey: string): Promise<string> {
  return getListingVerificationService().getSalesDocument(ownerId, accountKey);
}

=== server/domain/partners/usecases/listOwnerSalesDocumentsUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { getListingVerificationService } from '../factory';
import type { OwnerSalesDocument } from '../types/listingVerification';

/** CNPJs aprovados do parceiro e os cadastros que vendem por cada um (D14). */
export function listOwnerSalesDocumentsUseCase(ownerId: string): Promise<OwnerSalesDocument[]> {
  return getListingVerificationService().listSalesDocuments(ownerId);
}

=== server/domain/payment/adapters/firebaseAdminTransactionAdapter.ts — diff ===
@@ -1,5 +1,4 @@
 import { adminDb } from '../../../infrastructure/firebase/adminClient';
-import type { StripeConnectedAccountRecord } from '../ports/marketplaceAccountPort';
 import type { PaymentStatus, PaymentTransaction } from '../ports/paymentGatewayPort';
 import type {
   TransactionRecord,
@@ -7,26 +6,20 @@ import type {
   WebhookEventClaimResult,
 } from '../ports/transactionRepositoryPort';
 
-function mapDocToTransactionRecord(
-  id: string,
-  data: Record<string, unknown>
-): TransactionRecord {
+function mapDocToTransactionRecord(id: string, data: Record<string, unknown>): TransactionRecord {
   return {
     id,
     userId: typeof data.userId === 'string' ? data.userId : null,
     referenceType:
       typeof data.referenceType === 'string' && data.referenceType ? data.referenceType : undefined,
     referenceId: typeof data.referenceId === 'string' ? data.referenceId : null,
-    providerPaymentId:
-      typeof data.providerPaymentId === 'string' ? data.providerPaymentId : null,
+    providerPaymentId: typeof data.providerPaymentId === 'string' ? data.providerPaymentId : null,
     connectedAccountId:
       typeof data.connectedAccountId === 'string' ? data.connectedAccountId : null,
     amount: typeof data.amount === 'number' ? data.amount : null,
     amountMinor: typeof data.amountMinor === 'number' ? data.amountMinor : null,
-    platformFeeMinor:
-      typeof data.platformFeeMinor === 'number' ? data.platformFeeMinor : null,
-    paymentMethod:
-      typeof data.paymentMethod === 'string' ? data.paymentMethod : null,
+    platformFeeMinor: typeof data.platformFeeMinor === 'number' ? data.platformFeeMinor : null,
+    paymentMethod: typeof data.paymentMethod === 'string' ? data.paymentMethod : null,
     status: typeof data.status === 'string' ? data.status : null,
     createdAt: data.createdAt,
     updatedAt: data.updatedAt,
@@ -37,40 +30,6 @@ function mapDocToTransactionRecord(
   };
 }
 
-function mapDocToConnectedAccountRecord(
-  partnerId: string,
-  data: Record<string, unknown>
-): StripeConnectedAccountRecord {
-  const rawStatus = String(data.status || 'pending');
-  const status: StripeConnectedAccountRecord['status'] =
-    rawStatus === 'restricted' ||
-    rawStatus === 'enabled' ||
-    rawStatus === 'disabled'
-      ? rawStatus
-      : 'pending';
-
-  return {
-    partnerId,
-    stripeAccountId: String(data.stripeAccountId || data.connectedAccountId || ''),
-    status,
-    chargesEnabled: Boolean(data.chargesEnabled),
-    payoutsEnabled: Boolean(data.payoutsEnabled),
-    detailsSubmitted: Boolean(data.detailsSubmitted),
-    requirementsCurrentlyDue: Array.isArray(data.requirementsCurrentlyDue)
-      ? data.requirementsCurrentlyDue.filter(
-          (item): item is string => typeof item === 'string'
-        )
-      : [],
-    requirementsPastDue: Array.isArray(data.requirementsPastDue)
-      ? data.requirementsPastDue.filter(
-          (item): item is string => typeof item === 'string'
-        )
-      : [],
-    createdAt: String(data.createdAt || new Date().toISOString()),
-    updatedAt: String(data.updatedAt || new Date().toISOString()),
-  };
-}
-
 export class FirebaseAdminTransactionAdapter implements TransactionRepositoryPort {
   async updateTransactionStatus(
     transactionId: string,
@@ -81,9 +40,7 @@ export class FirebaseAdminTransactionAdapter implements TransactionRepositoryPor
     const docRef = adminDb.collection('transactions').doc(transactionId);
     const docSnap = await docRef.get();
 
-    const paymentTxRef = adminDb
-      .collection('paymentTransactions')
-      .doc(transactionId);
+    const paymentTxRef = adminDb.collection('paymentTransactions').doc(transactionId);
     const paymentTxSnap = await paymentTxRef.get();
 
     if (paymentTxSnap.exists) {
@@ -111,10 +68,7 @@ export class FirebaseAdminTransactionAdapter implements TransactionRepositoryPor
   }
 
   async getTransaction(transactionId: string): Promise<TransactionRecord | null> {
-    const snapshot = await adminDb
-      .collection('transactions')
-      .doc(transactionId)
-      .get();
+    const snapshot = await adminDb.collection('transactions').doc(transactionId).get();
     if (!snapshot.exists) {
       return null;
     }
@@ -124,9 +78,7 @@ export class FirebaseAdminTransactionAdapter implements TransactionRepositoryPor
     );
   }
 
-  async getTransactionByIdempotencyKey(
-    idempotencyKey: string
-  ): Promise<TransactionRecord | null> {
+  async getTransactionByIdempotencyKey(idempotencyKey: string): Promise<TransactionRecord | null> {
     const snapshot = await adminDb
       .collection('transactions')
       .where('idempotencyKey', '==', idempotencyKey)
@@ -139,10 +91,7 @@ export class FirebaseAdminTransactionAdapter implements TransactionRepositoryPor
     if (!doc) {
       return null;
     }
-    return mapDocToTransactionRecord(
-      doc.id,
-      (doc.data() ?? {}) as Record<string, unknown>
-    );
+    return mapDocToTransactionRecord(doc.id, (doc.data() ?? {}) as Record<string, unknown>);
   }
 
   async saveTransactionRecord(record: {
@@ -166,9 +115,7 @@ export class FirebaseAdminTransactionAdapter implements TransactionRepositoryPor
       referenceId: record.referenceId,
       provider: 'stripe',
       providerPaymentId: record.providerPaymentId,
-      ...(record.connectedAccountId
-        ? { connectedAccountId: record.connectedAccountId }
-        : {}),
+      ...(record.connectedAccountId ? { connectedAccountId: record.connectedAccountId } : {}),
       amountMinor: record.amountMinor,
       platformFeeMinor: record.platformFeeMinor,
       currency: 'BRL',
@@ -193,9 +140,7 @@ export class FirebaseAdminTransactionAdapter implements TransactionRepositoryPor
           referenceId: record.referenceId,
           provider: 'stripe',
           providerPaymentId: record.providerPaymentId,
-          ...(record.connectedAccountId
-            ? { connectedAccountId: record.connectedAccountId }
-            : {}),
+          ...(record.connectedAccountId ? { connectedAccountId: record.connectedAccountId } : {}),
           amount: record.amountMinor / 100,
           amountMinor: record.amountMinor,
           platformFeeMinor: record.platformFeeMinor,
@@ -212,46 +157,6 @@ export class FirebaseAdminTransactionAdapter implements TransactionRepositoryPor
     return paymentTransaction;
   }
 
-  async getConnectedAccountRecord(
-    partnerId: string
-  ): Promise<StripeConnectedAccountRecord | null> {
-    const snap = await adminDb
-      .collection('paymentConnectedAccounts')
-      .doc(partnerId)
-      .get();
-    if (!snap.exists) return null;
-    return mapDocToConnectedAccountRecord(
-      snap.id,
-      (snap.data() || {}) as Record<string, unknown>
-    );
-  }
-
-  async getConnectedAccountRecordByStripeAccountId(
-    stripeAccountId: string
-  ): Promise<StripeConnectedAccountRecord | null> {
-    const snap = await adminDb
-      .collection('paymentConnectedAccounts')
-      .where('stripeAccountId', '==', stripeAccountId)
-      .limit(1)
-      .get();
-    if (snap.empty) return null;
-    const doc = snap.docs[0];
-    if (!doc) return null;
-    return mapDocToConnectedAccountRecord(
-      doc.id,
-      (doc.data() || {}) as Record<string, unknown>
-    );
-  }
-
-  async saveConnectedAccountRecord(
-    record: StripeConnectedAccountRecord
-  ): Promise<void> {
-    await adminDb
-      .collection('paymentConnectedAccounts')
-      .doc(record.partnerId)
-      .set(record, { merge: true });
-  }
-
   async claimWebhookEvent(params: {
     eventId: string;
     eventType: string;
@@ -290,21 +195,27 @@ export class FirebaseAdminTransactionAdapter implements TransactionRepositoryPor
 
   async completeWebhookEvent(eventId: string): Promise<void> {
     const now = new Date().toISOString();
-    await adminDb.collection('stripeWebhookEvents').doc(eventId).set(
-      { status: 'processed', processedAt: now, updatedAt: now, leaseExpiresAt: null },
-      { merge: true }
-    );
+    await adminDb
+      .collection('stripeWebhookEvents')
+      .doc(eventId)
+      .set(
+        { status: 'processed', processedAt: now, updatedAt: now, leaseExpiresAt: null },
+        { merge: true }
+      );
   }
 
   async releaseWebhookEvent(eventId: string, errorMessage: string): Promise<void> {
-    await adminDb.collection('stripeWebhookEvents').doc(eventId).set(
-      {
-        status: 'failed',
-        lastError: errorMessage.slice(0, 500),
-        updatedAt: new Date().toISOString(),
-        leaseExpiresAt: null,
-      },
-      { merge: true }
-    );
+    await adminDb
+      .collection('stripeWebhookEvents')
+      .doc(eventId)
+      .set(
+        {
+          status: 'failed',
+          lastError: errorMessage.slice(0, 500),
+          updatedAt: new Date().toISOString(),
+          leaseExpiresAt: null,
+        },
+        { merge: true }
+      );
   }
 }

=== server/domain/payment/adapters/firestorePaymentAccountAdapter.ts — ARQUIVO NOVO, conteúdo completo ===
import type { DocumentData } from 'firebase-admin/firestore';
import { adminDb } from '../../../infrastructure/firebase/adminClient';
import type { PaymentAccountRepositoryPort } from '../ports/paymentAccountRepositoryPort';
import type { PaymentAccountRecord } from '../types/paymentAccount';

const ACCOUNTS = 'paymentAccounts';

function toRecord(data: DocumentData): PaymentAccountRecord {
  return data as PaymentAccountRecord;
}

/** Coleção só de backend (`allow read, write: if false`): o parceiro vê o status pela API (§6.2). */
export class FirestorePaymentAccountAdapter implements PaymentAccountRepositoryPort {
  async get(accountKey: string): Promise<PaymentAccountRecord | null> {
    const snapshot = await adminDb.collection(ACCOUNTS).doc(accountKey).get();
    return snapshot.exists ? toRecord(snapshot.data() as DocumentData) : null;
  }

  async getByStripeAccountId(stripeAccountId: string): Promise<PaymentAccountRecord | null> {
    const snapshot = await adminDb
      .collection(ACCOUNTS)
      .where('stripeAccountId', '==', stripeAccountId)
      .limit(1)
      .get();
    const doc = snapshot.docs[0];
    return doc ? toRecord(doc.data()) : null;
  }

  async listByOwner(ownerUid: string): Promise<PaymentAccountRecord[]> {
    const snapshot = await adminDb.collection(ACCOUNTS).where('ownerUid', '==', ownerUid).get();
    return snapshot.docs.map((doc) => toRecord(doc.data()));
  }

  async save(record: PaymentAccountRecord): Promise<void> {
    await adminDb.collection(ACCOUNTS).doc(record.accountKey).set(record);
  }
}

=== server/domain/payment/adapters/stripeConnectMarketplaceAdapter.ts — diff ===
@@ -5,9 +5,7 @@ import type {
   MarketplaceAccountPort,
 } from '../ports/marketplaceAccountPort';
 
-function deriveAccountStatus(
-  account: Stripe.Account
-): ConnectedAccountStatus['status'] {
+function deriveAccountStatus(account: Stripe.Account): ConnectedAccountStatus['status'] {
   if (account.requirements?.disabled_reason) {
     if (account.charges_enabled && account.payouts_enabled) {
       return 'enabled';
@@ -45,44 +43,46 @@ export class StripeConnectMarketplaceAdapter implements MarketplaceAccountPort {
     return this.stripeClient;
   }
 
-  async createConnectedAccount(
-    input: CreateConnectedAccountInput
-  ): Promise<{ accountId: string }> {
-    const account = await this.stripe.accounts.create({
-      country: 'BR',
-      ...(input.email ? { email: input.email } : {}),
-      controller: {
-        fees: {
-          payer: 'application',
+  async createConnectedAccount(input: CreateConnectedAccountInput): Promise<{ accountId: string }> {
+    const account = await this.stripe.accounts.create(
+      {
+        country: 'BR',
+        business_type: 'company',
+        company: { tax_id: input.companyTaxId },
+        ...(input.email ? { email: input.email } : {}),
+        controller: {
+          fees: {
+            payer: 'application',
+          },
+          losses: {
+            payments: 'application',
+          },
+          stripe_dashboard: {
+            type: 'express',
+          },
         },
-        losses: {
-          payments: 'application',
+        capabilities: {
+          card_payments: {
+            requested: true,
+          },
+          transfers: {
+            requested: true,
+          },
         },
-        stripe_dashboard: {
-          type: 'express',
+        metadata: {
+          accountKey: input.accountKey,
+          ownerUid: input.ownerUid,
         },
       },
-      capabilities: {
-        card_payments: {
-          requested: true,
-        },
-        transfers: {
-          requested: true,
-        },
-      },
-      metadata: {
-        partnerId: input.partnerId,
-      },
-    });
+      { idempotencyKey: `acct_${input.accountKey}` }
+    );
 
     return {
       accountId: account.id,
     };
   }
 
-  async createAccountSession(
-    accountId: string
-  ): Promise<{ clientSecret: string }> {
+  async createAccountSession(accountId: string): Promise<{ clientSecret: string }> {
     const session = await this.stripe.accountSessions.create({
       account: accountId,
       components: {

=== server/domain/payment/controllers/paymentController.ts — diff ===
@@ -6,9 +6,6 @@ import { reconcileStripeWebhookEventApplicationUseCase } from '../../../applicat
 import type { AuthenticatedRequest } from '../../../infrastructure/auth/authenticatedRequest';
 import { ConfirmPlanPaymentSchema, CreatePlanPaymentIntentSchema } from '../schemas/paymentSchema';
 import { PaymentDomainError } from '../services/stripePaymentService';
-import { createPartnerConnectAccountSessionUseCase } from '../usecases/createPartnerConnectAccountSessionUseCase';
-import { ensurePartnerConnectedAccountUseCase } from '../usecases/ensurePartnerConnectedAccountUseCase';
-import { getPartnerConnectAccountStatusUseCase } from '../usecases/getPartnerConnectAccountStatusUseCase';
 import { claimStripeWebhookEventUseCase } from '../usecases/claimStripeWebhookEventUseCase';
 import { completeStripeWebhookEventUseCase } from '../usecases/completeStripeWebhookEventUseCase';
 import { constructStripeWebhookEventUseCase } from '../usecases/constructStripeWebhookEventUseCase';
@@ -83,88 +80,6 @@ export class PaymentController {
     }
   }
 
-  static async createConnectedAccount(req: AuthenticatedRequest, res: Response): Promise<Response> {
-    try {
-      if (!req.user?.uid) {
-        return res.status(401).json({ error: 'Não autenticado.' });
-      }
-
-      const record = await ensurePartnerConnectedAccountUseCase({
-        partnerId: req.user.uid,
-        email: req.user.email || '',
-      });
-
-      return res.status(200).json({
-        connected: record.chargesEnabled && record.payoutsEnabled && record.detailsSubmitted,
-        accountId: record.stripeAccountId,
-        chargesEnabled: record.chargesEnabled,
-        payoutsEnabled: record.payoutsEnabled,
-        detailsSubmitted: record.detailsSubmitted,
-        status: record.status,
-      });
-    } catch (error: unknown) {
-      console.error('[PaymentController.createConnectedAccount]', {
-        partnerId: req.user?.uid,
-        message: error instanceof Error ? error.message : 'Erro desconhecido',
-      });
-      return res.status(503).json({
-        error: 'Não foi possível iniciar a configuração financeira no momento.',
-      });
-    }
-  }
-
-  static async createConnectAccountSession(
-    req: AuthenticatedRequest,
-    res: Response
-  ): Promise<Response> {
-    try {
-      if (!req.user?.uid) {
-        return res.status(401).json({ error: 'Não autenticado.' });
-      }
-
-      const session = await createPartnerConnectAccountSessionUseCase({
-        partnerId: req.user.uid,
-        email: req.user.email || '',
-      });
-
-      return res.status(200).json({
-        clientSecret: session.clientSecret,
-      });
-    } catch (error: unknown) {
-      console.error('[PaymentController.createConnectAccountSession]', {
-        partnerId: req.user?.uid,
-        message: error instanceof Error ? error.message : 'Erro desconhecido',
-      });
-      return res.status(503).json({
-        error: 'Não foi possível iniciar a configuração financeira no momento.',
-      });
-    }
-  }
-
-  static async getConnectStatus(req: AuthenticatedRequest, res: Response): Promise<Response> {
-    try {
-      if (!req.user?.uid) {
-        return res.status(401).json({ error: 'Não autenticado.' });
-      }
-
-      const targetPartnerId =
-        req.user.admin === true && typeof req.query.partnerId === 'string'
-          ? req.query.partnerId
-          : req.user.uid;
-
-      const status = await getPartnerConnectAccountStatusUseCase(targetPartnerId);
-      return res.status(200).json(status);
-    } catch (error: unknown) {
-      console.error('[PaymentController.getConnectStatus]', {
-        partnerId: req.user?.uid,
-        message: error instanceof Error ? error.message : 'Erro desconhecido',
-      });
-      return res.status(503).json({
-        error: 'Não foi possível consultar a configuração financeira no momento.',
-      });
-    }
-  }
-
   static async confirmPlanPayment(req: AuthenticatedRequest, res: Response): Promise<Response> {
     if (!req.user?.uid) {
       return res

=== server/domain/payment/factory.ts — diff ===
@@ -1,4 +1,5 @@
 import { FirebaseAdminTransactionAdapter } from './adapters/firebaseAdminTransactionAdapter';
+import { FirestorePaymentAccountAdapter } from './adapters/firestorePaymentAccountAdapter';
 import { FirestorePlanSubscriptionAdapter } from './adapters/firestorePlanSubscriptionAdapter';
 import { StripeBillingGatewayAdapter } from './adapters/stripeBillingGatewayAdapter';
 import { StripeConnectMarketplaceAdapter } from './adapters/stripeConnectMarketplaceAdapter';
@@ -8,25 +9,27 @@ import type { PaymentGatewayPort } from './ports/paymentGatewayPort';
 import type { TransactionRepositoryPort } from './ports/transactionRepositoryPort';
 import { BillingService } from './services/billingService';
 import { CheckoutService } from './services/checkoutService';
+import { PaymentAccountService } from './services/paymentAccountService';
 import { StripePaymentService } from './services/stripePaymentService';
 
-export const paymentGatewayAdapter: PaymentGatewayPort =
-  new StripePaymentGatewayAdapter();
+export const paymentGatewayAdapter: PaymentGatewayPort = new StripePaymentGatewayAdapter();
 export const marketplaceAccountAdapter: MarketplaceAccountPort =
   new StripeConnectMarketplaceAdapter();
 export const transactionRepository: TransactionRepositoryPort =
   new FirebaseAdminTransactionAdapter();
 
+export const paymentAccountService = new PaymentAccountService(
+  new FirestorePaymentAccountAdapter(),
+  marketplaceAccountAdapter
+);
+
 export const stripePaymentService = new StripePaymentService(
   paymentGatewayAdapter,
-  marketplaceAccountAdapter,
-  transactionRepository
+  transactionRepository,
+  paymentAccountService
 );
 
-export const checkoutService = new CheckoutService(
-  stripePaymentService,
-  transactionRepository
-);
+export const checkoutService = new CheckoutService(stripePaymentService, transactionRepository);
 
 let billingService: BillingService | null = null;

=== server/domain/payment/index.ts — diff ===
@@ -8,11 +8,10 @@ export { releaseStripeWebhookEventUseCase } from './usecases/releaseStripeWebhoo
 export { retrievePaymentIntentUseCase } from './usecases/retrievePaymentIntentUseCase';
 export { updatePaymentTransactionStatusUseCase } from './usecases/updatePaymentTransactionStatusUseCase';
 
-export { assertPartnerReadyForPaidEventUseCase } from './usecases/assertPartnerReadyForPaidEventUseCase';
-export { createPartnerConnectAccountSessionUseCase } from './usecases/createPartnerConnectAccountSessionUseCase';
-export { ensurePartnerConnectedAccountUseCase } from './usecases/ensurePartnerConnectedAccountUseCase';
-export { getPartnerConnectAccountStatusUseCase } from './usecases/getPartnerConnectAccountStatusUseCase';
-export { syncConnectedAccountFromWebhookUseCase } from './usecases/syncConnectedAccountFromWebhookUseCase';
+export { assertPaymentAccountReadyUseCase } from './usecases/assertPaymentAccountReadyUseCase';
+export { createPaymentAccountSessionUseCase } from './usecases/createPaymentAccountSessionUseCase';
+export { listOwnerPaymentAccountsUseCase } from './usecases/listOwnerPaymentAccountsUseCase';
+export { syncPaymentAccountFromWebhookUseCase } from './usecases/syncPaymentAccountFromWebhookUseCase';
 
 export { createMarketplacePaymentIntentUseCase } from './usecases/createMarketplacePaymentIntentUseCase';
 export { getPaymentReferenceUseCase } from './usecases/getPaymentReferenceUseCase';
@@ -38,12 +37,9 @@ export type {
 } from './ports/billingGatewayPort';
 export type { PlanSubscriptionRecord } from './ports/planSubscriptionRepositoryPort';
 
-export type {
-  ConnectedAccountStatus,
-  CreateConnectedAccountInput,
-  MarketplaceAccountPort,
-  StripeConnectedAccountRecord,
-} from './ports/marketplaceAccountPort';
+export type { ConnectedAccountStatus } from './ports/marketplaceAccountPort';
+export type { PaymentAccountView } from './types/paymentAccount';
+export type { EnsurePaymentAccountInput } from './services/paymentAccountService';
 export type {
   CreatePaymentIntentResult,
   PaymentGatewayPort,

=== server/domain/payment/ports/marketplaceAccountPort.ts — diff ===
@@ -1,6 +1,9 @@
 export interface CreateConnectedAccountInput {
-  partnerId: string;
+  accountKey: string;
+  ownerUid: string;
   email: string;
+  /** CNPJ do estabelecimento verificado: o Stripe confere no cadastro que a conta é dessa empresa. */
+  companyTaxId: string;
   country: 'BR';
 }
 
@@ -14,28 +17,11 @@ export interface ConnectedAccountStatus {
   status: 'pending' | 'restricted' | 'enabled' | 'disabled';
 }
 
-export interface StripeConnectedAccountRecord {
-  partnerId: string;
-  stripeAccountId: string;
-  status: 'pending' | 'restricted' | 'enabled' | 'disabled';
-  chargesEnabled: boolean;
-  payoutsEnabled: boolean;
-  detailsSubmitted: boolean;
-  requirementsCurrentlyDue: string[];
-  requirementsPastDue: string[];
-  createdAt: string;
-  updatedAt: string;
-}
-
 export interface MarketplaceAccountPort {
-  createConnectedAccount(
-    input: CreateConnectedAccountInput
-  ): Promise<{
+  createConnectedAccount(input: CreateConnectedAccountInput): Promise<{
     accountId: string;
   }>;
-  createAccountSession(
-    accountId: string
-  ): Promise<{
+  createAccountSession(accountId: string): Promise<{
     clientSecret: string;
   }>;
   getAccountStatus(accountId: string): Promise<ConnectedAccountStatus>;

=== server/domain/payment/ports/paymentAccountRepositoryPort.ts — ARQUIVO NOVO, conteúdo completo ===
import type { PaymentAccountRecord } from '../types/paymentAccount';

export interface PaymentAccountRepositoryPort {
  get(accountKey: string): Promise<PaymentAccountRecord | null>;
  getByStripeAccountId(stripeAccountId: string): Promise<PaymentAccountRecord | null>;
  listByOwner(ownerUid: string): Promise<PaymentAccountRecord[]>;
  save(record: PaymentAccountRecord): Promise<void>;
}

=== server/domain/payment/ports/transactionRepositoryPort.ts — diff ===
@@ -1,4 +1,3 @@
-import type { StripeConnectedAccountRecord } from './marketplaceAccountPort';
 import type { PaymentStatus, PaymentTransaction } from './paymentGatewayPort';
 
 export interface TransactionRecord {
@@ -27,9 +26,7 @@ export interface TransactionRepositoryPort {
     statusDetail?: string
   ): Promise<boolean>;
   getTransaction(transactionId: string): Promise<TransactionRecord | null>;
-  getTransactionByIdempotencyKey(
-    idempotencyKey: string
-  ): Promise<TransactionRecord | null>;
+  getTransactionByIdempotencyKey(idempotencyKey: string): Promise<TransactionRecord | null>;
   saveTransactionRecord(record: {
     transactionId: string;
     idempotencyKey: string;
@@ -44,15 +41,6 @@ export interface TransactionRepositoryPort {
     status: PaymentStatus | string;
     paymentResult?: Record<string, unknown>;
   }): Promise<PaymentTransaction>;
-  getConnectedAccountRecord(
-    partnerId: string
-  ): Promise<StripeConnectedAccountRecord | null>;
-  getConnectedAccountRecordByStripeAccountId(
-    stripeAccountId: string
-  ): Promise<StripeConnectedAccountRecord | null>;
-  saveConnectedAccountRecord(
-    record: StripeConnectedAccountRecord
-  ): Promise<void>;
   claimWebhookEvent(params: {
     eventId: string;
     eventType: string;

=== server/domain/payment/routes/paymentRoutes.ts — diff ===
@@ -4,26 +4,7 @@ import { PaymentController } from '../controllers/paymentController';
 
 const router = Router();
 
-router.post(
-  '/plans/intents',
-  verifyAuthToken,
-  PaymentController.createPlanPaymentIntent
-);
+router.post('/plans/intents', verifyAuthToken, PaymentController.createPlanPaymentIntent);
 router.post('/plans/intents/confirm', verifyAuthToken, PaymentController.confirmPlanPayment);
-router.post(
-  '/connect/account',
-  verifyAuthToken,
-  PaymentController.createConnectedAccount
-);
-router.post(
-  '/connect/account-session',
-  verifyAuthToken,
-  PaymentController.createConnectAccountSession
-);
-router.get(
-  '/connect/status',
-  verifyAuthToken,
-  PaymentController.getConnectStatus
-);
 
 export default router;

=== server/domain/payment/services/paymentAccountService.test.ts — ARQUIVO NOVO, conteúdo completo ===
import { describe, expect, it, vi } from 'vitest';
import type {
  ConnectedAccountStatus,
  MarketplaceAccountPort,
} from '../ports/marketplaceAccountPort';
import type { PaymentAccountRepositoryPort } from '../ports/paymentAccountRepositoryPort';
import type { PaymentAccountRecord } from '../types/paymentAccount';
import { PaymentAccountService } from './paymentAccountService';

class InMemoryAccounts implements PaymentAccountRepositoryPort {
  records = new Map<string, PaymentAccountRecord>();
  async get(accountKey: string) {
    return this.records.get(accountKey) ?? null;
  }
  async getByStripeAccountId(stripeAccountId: string) {
    return [...this.records.values()].find((r) => r.stripeAccountId === stripeAccountId) ?? null;
  }
  async listByOwner(ownerUid: string) {
    return [...this.records.values()].filter((r) => r.ownerUid === ownerUid);
  }
  async save(record: PaymentAccountRecord) {
    this.records.set(record.accountKey, record);
  }
}

const ENABLED: Omit<ConnectedAccountStatus, 'accountId'> = {
  chargesEnabled: true,
  payoutsEnabled: true,
  detailsSubmitted: true,
  requirementsCurrentlyDue: [],
  requirementsPastDue: [],
  status: 'enabled',
};
const PENDING: Omit<ConnectedAccountStatus, 'accountId'> = {
  chargesEnabled: false,
  payoutsEnabled: false,
  detailsSubmitted: false,
  requirementsCurrentlyDue: ['company.tax_id', 'external_account'],
  requirementsPastDue: [],
  status: 'pending',
};

function setup(status = PENDING) {
  const repository = new InMemoryAccounts();
  let created = 0;
  const marketplace = {
    createConnectedAccount: vi.fn(async () => ({ accountId: `acct_${++created}` })),
    createAccountSession: vi.fn(async (accountId: string) => ({ clientSecret: `cs_${accountId}` })),
    getAccountStatus: vi.fn(async (accountId: string) => ({ accountId, ...status })),
  } satisfies MarketplaceAccountPort;
  const service = new PaymentAccountService(
    repository,
    marketplace,
    () => new Date('2026-10-25T12:00:00.000Z')
  );
  return { repository, marketplace, service };
}

const INPUT = {
  accountKey: 'key-cnpj-1',
  ownerUid: 'owner-1',
  email: 'dono@pousada.test',
  companyTaxId: '11222333000181',
};

describe('PaymentAccountService (D14)', () => {
  it('cria uma conta por CNPJ, com o CNPJ pré-preenchido, e reaproveita na segunda sessão', async () => {
    const { marketplace, service, repository } = setup();
    await expect(service.createSession(INPUT)).resolves.toEqual({ clientSecret: 'cs_acct_1' });
    await service.createSession(INPUT);
    expect(marketplace.createConnectedAccount).toHaveBeenCalledTimes(1);
    expect(marketplace.createConnectedAccount).toHaveBeenCalledWith(
      expect.objectContaining({ accountKey: 'key-cnpj-1', companyTaxId: '11222333000181' })
    );
    expect(repository.records.get('key-cnpj-1')).toMatchObject({
      ownerUid: 'owner-1',
      stripeAccountId: 'acct_1',
    });
  });

  it('dois CNPJs do mesmo parceiro têm contas separadas', async () => {
    const { service } = setup();
    await service.createSession(INPUT);
    await service.createSession({ ...INPUT, accountKey: 'key-cnpj-2' });
    const accounts = await service.listForOwner('owner-1');
    expect(accounts.map((account) => account.accountKey).sort()).toEqual([
      'key-cnpj-1',
      'key-cnpj-2',
    ]);
  });

  it('conta de outro dono é recusada', async () => {
    const { service } = setup();
    await service.createSession(INPUT);
    await expect(service.createSession({ ...INPUT, ownerUid: 'owner-2' })).rejects.toMatchObject({
      code: 'FORBIDDEN',
    });
  });

  it('a lista não expõe o ID da conta Stripe e conta as pendências', async () => {
    const { service } = setup();
    await service.createSession(INPUT);
    const [view] = await service.listForOwner('owner-1');
    expect(view).toEqual({
      accountKey: 'key-cnpj-1',
      status: 'pending',
      chargesEnabled: false,
      payoutsEnabled: false,
      detailsSubmitted: false,
      requirementsDueCount: 2,
      readyForSales: false,
    });
  });

  it('venda exige a conta do CNPJ pronta', async () => {
    const pending = setup();
    await expect(pending.service.assertReady('key-cnpj-1')).rejects.toMatchObject({
      code: 'SELLER_ACCOUNT_NOT_ELIGIBLE',
    });
    await pending.service.createSession(INPUT);
    await expect(pending.service.assertReady('key-cnpj-1')).rejects.toMatchObject({
      code: 'SELLER_ACCOUNT_NOT_ELIGIBLE',
    });

    const ready = setup(ENABLED);
    await ready.service.createSession(INPUT);
    await expect(ready.service.assertReady('key-cnpj-1')).resolves.toMatchObject({
      stripeAccountId: 'acct_1',
    });
  });

  it('webhook atualiza a conta certa e ignora conta desconhecida', async () => {
    const { service, marketplace, repository } = setup();
    await service.createSession(INPUT);
    marketplace.getAccountStatus.mockImplementation(async (accountId: string) => ({
      accountId,
      ...ENABLED,
    }));
    await service.syncFromWebhook('acct_1');
    await service.syncFromWebhook('acct_desconhecida');
    expect(repository.records.get('key-cnpj-1')?.status).toBe('enabled');
    expect(repository.records.size).toBe(1);
  });
});

=== server/domain/payment/services/paymentAccountService.ts — ARQUIVO NOVO, conteúdo completo ===
import type {
  ConnectedAccountStatus,
  MarketplaceAccountPort,
} from '../ports/marketplaceAccountPort';
import type { PaymentAccountRepositoryPort } from '../ports/paymentAccountRepositoryPort';
import type { PaymentAccountRecord, PaymentAccountView } from '../types/paymentAccount';
import { isSellerAccountReady } from '../utils/sellerReadiness';
import { PaymentDomainError } from './stripePaymentService';

export interface EnsurePaymentAccountInput {
  accountKey: string;
  ownerUid: string;
  email: string;
  companyTaxId: string;
}

/** Uma conta Stripe Express por CNPJ (D14): criação, cadastro, status e checagem antes de vender. */
export class PaymentAccountService {
  constructor(
    private readonly repository: PaymentAccountRepositoryPort,
    private readonly marketplace: MarketplaceAccountPort,
    private readonly now: () => Date = () => new Date()
  ) {}

  async createSession(input: EnsurePaymentAccountInput): Promise<{ clientSecret: string }> {
    const record = await this.ensure(input);
    return this.marketplace.createAccountSession(record.stripeAccountId);
  }

  /** Status atualizado no Stripe de cada conta do parceiro (o webhook pode chegar depois do cadastro). */
  async listForOwner(ownerUid: string): Promise<PaymentAccountView[]> {
    const records = await this.repository.listByOwner(ownerUid);
    const synced = await Promise.all(records.map((record) => this.sync(record)));
    return synced.map(toView);
  }

  async assertReady(accountKey: string): Promise<PaymentAccountRecord> {
    const existing = await this.repository.get(accountKey);
    const record = existing ? await this.sync(existing) : null;
    if (!record || !isSellerAccountReady(record)) {
      throw new PaymentDomainError(
        'SELLER_ACCOUNT_NOT_ELIGIBLE',
        'Vendas online indisponíveis. Conclua a configuração financeira deste CNPJ.',
        422
      );
    }
    return record;
  }

  async syncFromWebhook(stripeAccountId: string): Promise<void> {
    const record = await this.repository.getByStripeAccountId(stripeAccountId);
    if (record) await this.sync(record);
  }

  private async ensure(input: EnsurePaymentAccountInput): Promise<PaymentAccountRecord> {
    const existing = await this.repository.get(input.accountKey);
    if (existing) {
      // O CNPJ pertence a uma conta só (D12); um dono diferente aqui é dado inconsistente.
      if (existing.ownerUid !== input.ownerUid) {
        throw new PaymentDomainError('FORBIDDEN', 'Conta de recebimento de outro parceiro.', 403);
      }
      return existing;
    }
    const created = await this.marketplace.createConnectedAccount({
      accountKey: input.accountKey,
      ownerUid: input.ownerUid,
      email: input.email,
      companyTaxId: input.companyTaxId,
      country: 'BR',
    });
    const nowIso = this.now().toISOString();
    const status = await this.marketplace.getAccountStatus(created.accountId);
    const record = withStatus(
      {
        accountKey: input.accountKey,
        ownerUid: input.ownerUid,
        stripeAccountId: created.accountId,
        createdAt: nowIso,
      },
      status,
      nowIso
    );
    await this.repository.save(record);
    return record;
  }

  private async sync(record: PaymentAccountRecord): Promise<PaymentAccountRecord> {
    const status = await this.marketplace.getAccountStatus(record.stripeAccountId);
    const synced = withStatus(record, status, this.now().toISOString());
    await this.repository.save(synced);
    return synced;
  }
}

function withStatus(
  base: Pick<PaymentAccountRecord, 'accountKey' | 'ownerUid' | 'stripeAccountId' | 'createdAt'>,
  status: ConnectedAccountStatus,
  updatedAt: string
): PaymentAccountRecord {
  return {
    accountKey: base.accountKey,
    ownerUid: base.ownerUid,
    stripeAccountId: base.stripeAccountId,
    status: status.status,
    chargesEnabled: status.chargesEnabled,
    payoutsEnabled: status.payoutsEnabled,
    detailsSubmitted: status.detailsSubmitted,
    requirementsCurrentlyDue: status.requirementsCurrentlyDue,
    requirementsPastDue: status.requirementsPastDue,
    createdAt: base.createdAt,
    updatedAt,
  };
}

function toView(record: PaymentAccountRecord): PaymentAccountView {
  return {
    accountKey: record.accountKey,
    status: record.status,
    chargesEnabled: record.chargesEnabled,
    payoutsEnabled: record.payoutsEnabled,
    detailsSubmitted: record.detailsSubmitted,
    requirementsDueCount:
      record.requirementsCurrentlyDue.length + record.requirementsPastDue.length,
    readyForSales: isSellerAccountReady(record),
  };
}

=== server/domain/payment/services/stripePaymentService.marketplace.test.ts — diff ===
@@ -1,5 +1,4 @@
 import { describe, expect, it, vi } from 'vitest';
-import type { MarketplaceAccountPort } from '../ports/marketplaceAccountPort';
 import type { PaymentGatewayPort } from '../ports/paymentGatewayPort';
 import type { TransactionRepositoryPort } from '../ports/transactionRepositoryPort';
 import { StripePaymentService } from './stripePaymentService';
@@ -12,29 +11,22 @@ function setup(existingTx: unknown = null) {
       status: 'pending',
     }),
   } as unknown as PaymentGatewayPort;
-  const account = {
-    getAccountStatus: vi.fn().mockResolvedValue({
-      accountId: 'acct_1',
-      status: 'enabled',
-      chargesEnabled: true,
-      payoutsEnabled: true,
-      detailsSubmitted: true,
-      requirementsCurrentlyDue: [],
-      requirementsPastDue: [],
-    }),
-  } as unknown as MarketplaceAccountPort;
+  const accounts = {
+    assertReady: vi.fn().mockResolvedValue({ accountKey: 'key-cnpj-1', stripeAccountId: 'acct_1' }),
+  };
   const repo = {
     getTransactionByIdempotencyKey: vi.fn().mockResolvedValue(existingTx),
-    getConnectedAccountRecord: vi
-      .fn()
-      .mockResolvedValue({ partnerId: 'p1', stripeAccountId: 'acct_1', createdAt: '' }),
-    saveConnectedAccountRecord: vi.fn().mockResolvedValue(undefined),
     saveTransactionRecord: vi.fn().mockResolvedValue({ id: 'pi_1' }),
     getTransaction: vi
       .fn()
       .mockResolvedValue({ id: 'pi_1', referenceType: 'booking', referenceId: 'bk_1' }),
   } as unknown as TransactionRepositoryPort;
-  return { service: new StripePaymentService(gateway, account, repo), gateway, repo };
+  return {
+    service: new StripePaymentService(gateway, repo, accounts),
+    gateway,
+    repo,
+    accounts,
+  };
 }
 
 const PARAMS = {
@@ -42,6 +34,7 @@ const PARAMS = {
   referenceId: 'bk_1',
   buyerId: 'buyer-1',
   sellerPartnerId: 'p1',
+  sellerAccountKey: 'key-cnpj-1',
   description: 'Use Guide — Passeio',
   totalMinor: 20000,
   platformFeeMinor: 2000,
@@ -49,9 +42,10 @@ const PARAMS = {
 };
 
 describe('StripePaymentService — vendas de marketplace', () => {
-  it('cria destination charge com taxa e metadata só com IDs', async () => {
-    const { service, gateway, repo } = setup();
+  it('cria destination charge para a conta do CNPJ, com taxa e metadata só com IDs', async () => {
+    const { service, gateway, repo, accounts } = setup();
     const result = await service.createMarketplacePaymentIntent(PARAMS);
+    expect(accounts.assertReady).toHaveBeenCalledWith('key-cnpj-1');
     expect(gateway.createPaymentIntent).toHaveBeenCalledWith(
       expect.objectContaining({
         amountMinor: 20000,
@@ -86,6 +80,7 @@ describe('StripePaymentService — vendas de marketplace', () => {
       orderId: 'order-1',
       buyerId: 'buyer-1',
       sellerPartnerId: 'p1',
+      sellerAccountKey: 'key-cnpj-1',
       eventListingId: 'event-1',
       occurrenceId: 'occ-1',
       eventTitle: 'Show',

=== server/domain/payment/services/stripePaymentService.ts — diff ===
@@ -1,8 +1,3 @@
-import type {
-  ConnectedAccountStatus,
-  MarketplaceAccountPort,
-  StripeConnectedAccountRecord,
-} from '../ports/marketplaceAccountPort';
 import type {
   CreatePaymentIntentResult,
   PaymentGatewayPort,
@@ -10,7 +5,7 @@ import type {
   VerifiedWebhookEvent,
 } from '../ports/paymentGatewayPort';
 import type { TransactionRepositoryPort } from '../ports/transactionRepositoryPort';
-import { isSellerAccountReady } from '../utils/sellerReadiness';
+import type { PaymentAccountService } from './paymentAccountService';
 
 export class PaymentDomainError extends Error {
   constructor(
@@ -26,157 +21,15 @@ export class PaymentDomainError extends Error {
 export class StripePaymentService {
   constructor(
     private readonly paymentGateway: PaymentGatewayPort,
-    private readonly marketplaceAccount: MarketplaceAccountPort,
-    private readonly transactionRepo: TransactionRepositoryPort
+    private readonly transactionRepo: TransactionRepositoryPort,
+    private readonly paymentAccounts: Pick<PaymentAccountService, 'assertReady'>
   ) {}
 
-  async ensureConnectedAccount(params: {
-    partnerId: string;
-    email: string;
-  }): Promise<StripeConnectedAccountRecord> {
-    const existing = await this.transactionRepo.getConnectedAccountRecord(params.partnerId);
-    const nowIso = new Date().toISOString();
-
-    if (existing?.stripeAccountId) {
-      const status = await this.marketplaceAccount.getAccountStatus(existing.stripeAccountId);
-      const updated: StripeConnectedAccountRecord = {
-        partnerId: params.partnerId,
-        stripeAccountId: status.accountId,
-        status: status.status,
-        chargesEnabled: status.chargesEnabled,
-        payoutsEnabled: status.payoutsEnabled,
-        detailsSubmitted: status.detailsSubmitted,
-        requirementsCurrentlyDue: status.requirementsCurrentlyDue,
-        requirementsPastDue: status.requirementsPastDue,
-        createdAt: existing.createdAt,
-        updatedAt: nowIso,
-      };
-      await this.transactionRepo.saveConnectedAccountRecord(updated);
-      return updated;
-    }
-
-    const created = await this.marketplaceAccount.createConnectedAccount({
-      partnerId: params.partnerId,
-      email: params.email,
-      country: 'BR',
-    });
-
-    const status = await this.marketplaceAccount.getAccountStatus(created.accountId);
-
-    const record: StripeConnectedAccountRecord = {
-      partnerId: params.partnerId,
-      stripeAccountId: created.accountId,
-      status: status.status,
-      chargesEnabled: status.chargesEnabled,
-      payoutsEnabled: status.payoutsEnabled,
-      detailsSubmitted: status.detailsSubmitted,
-      requirementsCurrentlyDue: status.requirementsCurrentlyDue,
-      requirementsPastDue: status.requirementsPastDue,
-      createdAt: nowIso,
-      updatedAt: nowIso,
-    };
-
-    await this.transactionRepo.saveConnectedAccountRecord(record);
-    return record;
-  }
-
-  async createAccountSession(params: {
-    partnerId: string;
-    email: string;
-  }): Promise<{ clientSecret: string }> {
-    const record = await this.ensureConnectedAccount(params);
-    return this.marketplaceAccount.createAccountSession(record.stripeAccountId);
-  }
-
-  async getPartnerAccountStatus(partnerId: string): Promise<{
-    connected: boolean;
-    accountId?: string;
-    chargesEnabled: boolean;
-    payoutsEnabled: boolean;
-    detailsSubmitted: boolean;
-    status: ConnectedAccountStatus['status'];
-    readyForSales: boolean;
-  }> {
-    const existing = await this.transactionRepo.getConnectedAccountRecord(partnerId);
-    if (!existing?.stripeAccountId) {
-      return {
-        connected: false,
-        chargesEnabled: false,
-        payoutsEnabled: false,
-        detailsSubmitted: false,
-        status: 'pending',
-        readyForSales: false,
-      };
-    }
-
-    const status = await this.marketplaceAccount.getAccountStatus(existing.stripeAccountId);
-    const nowIso = new Date().toISOString();
-
-    await this.transactionRepo.saveConnectedAccountRecord({
-      partnerId,
-      stripeAccountId: status.accountId,
-      status: status.status,
-      chargesEnabled: status.chargesEnabled,
-      payoutsEnabled: status.payoutsEnabled,
-      detailsSubmitted: status.detailsSubmitted,
-      requirementsCurrentlyDue: status.requirementsCurrentlyDue,
-      requirementsPastDue: status.requirementsPastDue,
-      createdAt: existing.createdAt,
-      updatedAt: nowIso,
-    });
-
-    return {
-      connected: status.chargesEnabled && status.payoutsEnabled && status.detailsSubmitted,
-      accountId: status.accountId,
-      chargesEnabled: status.chargesEnabled,
-      payoutsEnabled: status.payoutsEnabled,
-      detailsSubmitted: status.detailsSubmitted,
-      status: status.status,
-      readyForSales: isSellerAccountReady(status),
-    };
-  }
-
-  async assertPartnerReadyForPaidEvent(partnerId: string): Promise<StripeConnectedAccountRecord> {
-    const existing = await this.transactionRepo.getConnectedAccountRecord(partnerId);
-    if (!existing?.stripeAccountId) {
-      throw new PaymentDomainError(
-        'SELLER_ACCOUNT_NOT_ELIGIBLE',
-        'Vendas online indisponíveis. Conclua a configuração financeira.',
-        422
-      );
-    }
-
-    const status = await this.marketplaceAccount.getAccountStatus(existing.stripeAccountId);
-    const nowIso = new Date().toISOString();
-    const synced: StripeConnectedAccountRecord = {
-      partnerId,
-      stripeAccountId: status.accountId,
-      status: status.status,
-      chargesEnabled: status.chargesEnabled,
-      payoutsEnabled: status.payoutsEnabled,
-      detailsSubmitted: status.detailsSubmitted,
-      requirementsCurrentlyDue: status.requirementsCurrentlyDue,
-      requirementsPastDue: status.requirementsPastDue,
-      createdAt: existing.createdAt,
-      updatedAt: nowIso,
-    };
-    await this.transactionRepo.saveConnectedAccountRecord(synced);
-
-    if (!isSellerAccountReady(synced)) {
-      throw new PaymentDomainError(
-        'SELLER_ACCOUNT_NOT_ELIGIBLE',
-        'Vendas online indisponíveis. Conclua a configuração financeira.',
-        422
-      );
-    }
-
-    return synced;
-  }
-
   async createTicketOrderPaymentIntent(params: {
     orderId: string;
     buyerId: string;
     sellerPartnerId: string;
+    sellerAccountKey: string;
     eventListingId: string;
     occurrenceId: string;
     eventTitle: string;
@@ -189,6 +42,7 @@ export class StripePaymentService {
       referenceId: params.orderId,
       buyerId: params.buyerId,
       sellerPartnerId: params.sellerPartnerId,
+      sellerAccountKey: params.sellerAccountKey,
       description: `Use Guide — ${params.eventTitle}`,
       totalMinor: params.totalMinor,
       platformFeeMinor: params.platformFeeMinor,
@@ -208,6 +62,7 @@ export class StripePaymentService {
     referenceId: string;
     buyerId: string;
     sellerPartnerId: string;
+    sellerAccountKey: string;
     description: string;
     totalMinor: number;
     platformFeeMinor: number;
@@ -230,6 +85,8 @@ export class StripePaymentService {
     referenceId: string;
     buyerId: string;
     sellerPartnerId: string;
+    /** Conta Stripe do CNPJ do estabelecimento que vende (D14). */
+    sellerAccountKey: string;
     description: string;
     totalMinor: number;
     platformFeeMinor: number;
@@ -252,7 +109,7 @@ export class StripePaymentService {
       };
     }
 
-    const sellerAccount = await this.assertPartnerReadyForPaidEvent(params.sellerPartnerId);
+    const sellerAccount = await this.paymentAccounts.assertReady(params.sellerAccountKey);
 
     const result = await this.paymentGateway.createPaymentIntent({
       orderId: params.referenceId,
@@ -408,23 +265,4 @@ export class StripePaymentService {
   ): Promise<boolean> {
     return this.transactionRepo.updateTransactionStatus(paymentIntentId, status, statusDetail);
   }
-
-  async syncConnectedAccountFromWebhook(stripeAccountId: string): Promise<void> {
-    const existing =
-      await this.transactionRepo.getConnectedAccountRecordByStripeAccountId(stripeAccountId);
-    if (!existing) return;
-    const status = await this.marketplaceAccount.getAccountStatus(stripeAccountId);
-    await this.transactionRepo.saveConnectedAccountRecord({
-      partnerId: existing.partnerId,
-      stripeAccountId,
-      status: status.status,
-      chargesEnabled: status.chargesEnabled,
-      payoutsEnabled: status.payoutsEnabled,
-      detailsSubmitted: status.detailsSubmitted,
-      requirementsCurrentlyDue: status.requirementsCurrentlyDue,
-      requirementsPastDue: status.requirementsPastDue,
-      createdAt: existing.createdAt,
-      updatedAt: new Date().toISOString(),
-    });
-  }
 }

=== server/domain/payment/types/paymentAccount.ts — ARQUIVO NOVO, conteúdo completo ===
import type { ConnectedAccountStatus } from '../ports/marketplaceAccountPort';

/**
 * `paymentAccounts/{accountKey}`: conta Stripe Express de um CNPJ (D14). `accountKey` é o índice cego do
 * documento (HMAC), nunca o CNPJ.
 */
export interface PaymentAccountRecord {
  accountKey: string;
  ownerUid: string;
  stripeAccountId: string;
  status: ConnectedAccountStatus['status'];
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  detailsSubmitted: boolean;
  requirementsCurrentlyDue: string[];
  requirementsPastDue: string[];
  createdAt: string;
  updatedAt: string;
}

/** O que o parceiro vê de cada conta (sem IDs do Stripe). */
export interface PaymentAccountView {
  accountKey: string;
  status: ConnectedAccountStatus['status'];
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  detailsSubmitted: boolean;
  requirementsDueCount: number;
  readyForSales: boolean;
}

=== server/domain/payment/usecases/assertPartnerReadyForPaidEventUseCase.ts — APAGUE este arquivo ===

=== server/domain/payment/usecases/assertPaymentAccountReadyUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { paymentAccountService } from '../factory';

/** Lança `PaymentDomainError` (422) se a conta do CNPJ não pode receber (D14). */
export async function assertPaymentAccountReadyUseCase(accountKey: string): Promise<void> {
  await paymentAccountService.assertReady(accountKey);
}

=== server/domain/payment/usecases/createMarketplacePaymentIntentUseCase.ts — diff ===
@@ -7,6 +7,7 @@ export async function createMarketplacePaymentIntentUseCase(params: {
   referenceId: string;
   buyerId: string;
   sellerPartnerId: string;
+  sellerAccountKey: string;
   description: string;
   totalMinor: number;
   platformFeeMinor: number;

=== server/domain/payment/usecases/createPartnerConnectAccountSessionUseCase.ts — APAGUE este arquivo ===

=== server/domain/payment/usecases/createPaymentAccountSessionUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { paymentAccountService } from '../factory';
import type { EnsurePaymentAccountInput } from '../services/paymentAccountService';

/** Cria a conta Stripe do CNPJ, se ainda não existir, e abre a sessão do cadastro embutido (D14). */
export function createPaymentAccountSessionUseCase(
  input: EnsurePaymentAccountInput
): Promise<{ clientSecret: string }> {
  return paymentAccountService.createSession(input);
}

=== server/domain/payment/usecases/createPaymentForTicketOrderUseCase.ts — diff ===
@@ -5,6 +5,7 @@ export async function createPaymentForTicketOrderUseCase(params: {
   orderId: string;
   buyerId: string;
   sellerPartnerId: string;
+  sellerAccountKey: string;
   eventListingId: string;
   occurrenceId: string;
   eventTitle: string;

=== server/domain/payment/usecases/ensurePartnerConnectedAccountUseCase.ts — APAGUE este arquivo ===

=== server/domain/payment/usecases/getPartnerConnectAccountStatusUseCase.ts — APAGUE este arquivo ===

=== server/domain/payment/usecases/listOwnerPaymentAccountsUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { paymentAccountService } from '../factory';
import type { PaymentAccountView } from '../types/paymentAccount';

export function listOwnerPaymentAccountsUseCase(ownerUid: string): Promise<PaymentAccountView[]> {
  return paymentAccountService.listForOwner(ownerUid);
}

=== server/domain/payment/usecases/syncConnectedAccountFromWebhookUseCase.ts — APAGUE este arquivo ===

=== server/domain/payment/usecases/syncPaymentAccountFromWebhookUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { paymentAccountService } from '../factory';

export function syncPaymentAccountFromWebhookUseCase(stripeAccountId: string): Promise<void> {
  return paymentAccountService.syncFromWebhook(stripeAccountId);
}

=== server/interfaces/http/paymentAccounts/paymentAccountController.test.ts — ARQUIVO NOVO, conteúdo completo ===
import type { Response } from 'express';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { AuthenticatedRequest } from '../../../infrastructure/auth/authenticatedRequest';

const m = vi.hoisted(() => ({ list: vi.fn(), session: vi.fn() }));

vi.mock(
  '../../../application/usecases/paymentAccounts/listPartnerPaymentAccountsApplicationUseCase',
  () => ({ listPartnerPaymentAccountsApplicationUseCase: m.list })
);
vi.mock(
  '../../../application/usecases/paymentAccounts/startPaymentAccountSessionApplicationUseCase',
  () => ({ startPaymentAccountSessionApplicationUseCase: m.session })
);

import { ListingVerificationError } from '../../../domain/partners/errors/listingVerificationError';
import { PaymentAccountController } from './paymentAccountController';

function response() {
  const res = { status: vi.fn(), json: vi.fn() };
  res.status.mockReturnValue(res);
  res.json.mockReturnValue(res);
  return res;
}

const OWNER = { uid: 'owner-1', admin: false, email: 'dono@pousada.test' };
const ADMIN = { uid: 'admin-1', admin: true, email: 'admin@useguide.test' };
const KEY = 'a'.repeat(43);

function request(overrides: Partial<AuthenticatedRequest>): AuthenticatedRequest {
  return { query: {}, body: {}, user: OWNER, ...overrides } as never;
}

describe('PaymentAccountController (D14)', () => {
  beforeEach(() => vi.clearAllMocks());

  it('sem login: 401', async () => {
    const res = response();
    await PaymentAccountController.list(request({ user: undefined }), res as unknown as Response);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('parceiro só vê as próprias contas, mesmo pedindo as de outro', async () => {
    m.list.mockResolvedValue([]);
    const res = response();
    await PaymentAccountController.list(
      request({ query: { ownerUid: 'owner-2' } as never }),
      res as unknown as Response
    );
    expect(m.list).toHaveBeenCalledWith('owner-1');
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('admin consulta as contas de um parceiro', async () => {
    m.list.mockResolvedValue([]);
    const res = response();
    await PaymentAccountController.list(
      request({ user: ADMIN as never, query: { ownerUid: 'owner-2' } as never }),
      res as unknown as Response
    );
    expect(m.list).toHaveBeenCalledWith('owner-2');
  });

  it('accountKey inválida ou campo extra: 400 sem criar conta', async () => {
    for (const body of [{ accountKey: '../x' }, { accountKey: KEY, ownerUid: 'owner-2' }]) {
      const res = response();
      await PaymentAccountController.createSession(request({ body }), res as unknown as Response);
      expect(res.status).toHaveBeenCalledWith(400);
    }
    expect(m.session).not.toHaveBeenCalled();
  });

  it('sessão sempre em nome de quem está logado', async () => {
    m.session.mockResolvedValue({ clientSecret: 'cs' });
    const res = response();
    await PaymentAccountController.createSession(
      request({ body: { accountKey: KEY } }),
      res as unknown as Response
    );
    expect(m.session).toHaveBeenCalledWith({ uid: 'owner-1', email: 'dono@pousada.test' }, KEY);
    expect(res.json).toHaveBeenCalledWith({ data: { clientSecret: 'cs' } });
  });

  it('CNPJ de outro parceiro (IDOR): 404 com código estável', async () => {
    m.session.mockRejectedValue(
      new ListingVerificationError('NOT_FOUND', 'Documento de vendas não encontrado.')
    );
    const res = response();
    await PaymentAccountController.createSession(
      request({ body: { accountKey: KEY } }),
      res as unknown as Response
    );
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      error: { code: 'NOT_FOUND', message: 'Documento de vendas não encontrado.' },
    });
  });

  it('erro inesperado: 503 sem detalhe interno', async () => {
    m.list.mockRejectedValue(new Error('StripeConnectionError: chave sk_test_xxx'));
    const res = response();
    await PaymentAccountController.list(request({}), res as unknown as Response);
    expect(res.status).toHaveBeenCalledWith(503);
    expect(JSON.stringify(res.json.mock.calls)).not.toContain('sk_test');
  });
});

=== server/interfaces/http/paymentAccounts/paymentAccountController.ts — ARQUIVO NOVO, conteúdo completo ===
import type { Response } from 'express';
import { listPartnerPaymentAccountsApplicationUseCase } from '../../../application/usecases/paymentAccounts/listPartnerPaymentAccountsApplicationUseCase';
import { startPaymentAccountSessionApplicationUseCase } from '../../../application/usecases/paymentAccounts/startPaymentAccountSessionApplicationUseCase';
import { ListingVerificationError } from '../../../domain/partners';
import { PaymentDomainError } from '../../../domain/payment';
import type { AuthenticatedRequest } from '../../../infrastructure/auth/authenticatedRequest';
import {
  ListPaymentAccountsQuerySchema,
  PaymentAccountSessionSchema,
} from './schemas/paymentAccountSchemas';

function sendError(res: Response, status: number, code: string, message: string): Response {
  return res.status(status).json({ error: { code, message } });
}

function handleError(res: Response, error: unknown, operation: string): Response {
  if (error instanceof ListingVerificationError || error instanceof PaymentDomainError) {
    return sendError(res, error.statusCode, error.code, error.message);
  }
  console.error(`[PaymentAccountController.${operation}]`, {
    name: error instanceof Error ? error.name : 'UnknownError',
  });
  // 503: a falha mais comum aqui é o Stripe indisponível ou sem configuração (AGENTS.md §2.2.5).
  return sendError(
    res,
    503,
    'PAYMENT_ACCOUNT_UNAVAILABLE',
    'Não foi possível consultar a configuração financeira no momento.'
  );
}

export class PaymentAccountController {
  static async list(req: AuthenticatedRequest, res: Response): Promise<Response> {
    if (!req.user?.uid) return sendError(res, 401, 'UNAUTHENTICATED', 'Não autenticado.');
    const query = ListPaymentAccountsQuerySchema.safeParse(req.query);
    if (!query.success) return sendError(res, 400, 'VALIDATION_ERROR', 'Consulta inválida.');
    const ownerUid =
      req.user.admin === true && query.data.ownerUid ? query.data.ownerUid : req.user.uid;
    try {
      return res
        .status(200)
        .json({ data: await listPartnerPaymentAccountsApplicationUseCase(ownerUid) });
    } catch (error) {
      return handleError(res, error, 'list');
    }
  }

  static async createSession(req: AuthenticatedRequest, res: Response): Promise<Response> {
    if (!req.user?.uid) return sendError(res, 401, 'UNAUTHENTICATED', 'Não autenticado.');
    const body = PaymentAccountSessionSchema.safeParse(req.body);
    if (!body.success) return sendError(res, 400, 'VALIDATION_ERROR', 'Conta inválida.');
    try {
      const session = await startPaymentAccountSessionApplicationUseCase(
        { uid: req.user.uid, email: req.user.email ?? '' },
        body.data.accountKey
      );
      return res.status(200).json({ data: session });
    } catch (error) {
      return handleError(res, error, 'createSession');
    }
  }
}

=== server/interfaces/http/paymentAccounts/paymentAccountRoutes.ts — ARQUIVO NOVO, conteúdo completo ===
import { type NextFunction, type Response, Router } from 'express';
import type { AuthenticatedRequest } from '../../../infrastructure/auth/authenticatedRequest';
import { verifyAuthToken } from '../../../infrastructure/auth/authMiddleware';
import { PaymentAccountController } from './paymentAccountController';

// Abrir o cadastro financeiro é operação de pagamento: token revogado é recusado (AGENTS.md §7.3 item 3).
function verifyAuthTokenStrict(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  return verifyAuthToken(req, res, next, { checkRevoked: true });
}

const router = Router();

router.get('/', verifyAuthToken, PaymentAccountController.list);
router.post('/session', verifyAuthTokenStrict, PaymentAccountController.createSession);

export default router;

=== server/interfaces/http/paymentAccounts/schemas/paymentAccountSchemas.ts — ARQUIVO NOVO, conteúdo completo ===
import { z } from 'zod';

// `accountKey` é o índice cego do CNPJ: HMAC-SHA-256 em base64url (43 caracteres).
export const PaymentAccountSessionSchema = z
  .object({ accountKey: z.string().regex(/^[\w-]{43}$/) })
  .strict();

export const ListPaymentAccountsQuerySchema = z
  .object({
    ownerUid: z
      .string()
      .min(1)
      .max(128)
      .regex(/^[\w-]+$/)
      .optional(),
  })
  .strict();

VERIFICAÇÃO (obrigatória):
- `npm run typecheck`, `npx biome lint .` (0 erros; arquivos tocados sem avisos), `npm run build`;
- `npm run test:rules` (firestore.rules mudou);
- testes ligados aos arquivos deste prompt: `npx vitest related --run firestore.rules.security.test.ts server.ts server/application/usecases/bookings/bookingApplicationUseCases.test.ts server/application/usecases/bookings/createBookingApplicationUseCase.ts server/application/usecases/bookings/setBookableOfferStatusApplicationUseCase.test.ts server/application/usecases/bookings/setBookableOfferStatusApplicationUseCase.ts server/application/usecases/createTicketOrderPaymentIntentApplicationUseCase.test.ts server/application/usecases/createTicketOrderPaymentIntentApplicationUseCase.ts server/application/usecases/paymentAccounts/listPartnerPaymentAccountsApplicationUseCase.ts server/application/usecases/paymentAccounts/paymentAccountApplicationUseCases.test.ts server/application/usecases/paymentAccounts/startPaymentAccountSessionApplicationUseCase.ts server/application/usecases/reconcileStripeWebhookEventApplicationUseCase.ts server/domain/partners/adapters/firestoreListingVerificationAdapter.ts server/domain/partners/errors/listingVerificationError.ts server/domain/partners/index.ts server/domain/partners/ports/listingVerificationRepositoryPort.ts server/domain/partners/services/listingVerificationService.test.ts server/domain/partners/services/listingVerificationService.ts server/domain/partners/types/listingVerification.ts server/domain/partners/usecases/assertListingCanSellUseCase.ts server/domain/partners/usecases/getOwnerSalesDocumentUseCase.ts server/domain/partners/usecases/listOwnerSalesDocumentsUseCase.ts server/domain/payment/adapters/firebaseAdminTransactionAdapter.ts server/domain/payment/adapters/firestorePaymentAccountAdapter.ts server/domain/payment/adapters/stripeConnectMarketplaceAdapter.ts server/domain/payment/controllers/paymentController.ts server/domain/payment/factory.ts server/domain/payment/index.ts server/domain/payment/ports/marketplaceAccountPort.ts server/domain/payment/ports/paymentAccountRepositoryPort.ts server/domain/payment/ports/transactionRepositoryPort.ts server/domain/payment/routes/paymentRoutes.ts server/domain/payment/services/paymentAccountService.test.ts server/domain/payment/services/paymentAccountService.ts server/domain/payment/services/stripePaymentService.marketplace.test.ts server/domain/payment/services/stripePaymentService.ts server/domain/payment/types/paymentAccount.ts server/domain/payment/usecases/assertPaymentAccountReadyUseCase.ts server/domain/payment/usecases/createMarketplacePaymentIntentUseCase.ts server/domain/payment/usecases/createPaymentAccountSessionUseCase.ts server/domain/payment/usecases/createPaymentForTicketOrderUseCase.ts server/domain/payment/usecases/listOwnerPaymentAccountsUseCase.ts server/domain/payment/usecases/syncPaymentAccountFromWebhookUseCase.ts server/interfaces/http/paymentAccounts/paymentAccountController.test.ts server/interfaces/http/paymentAccounts/paymentAccountController.ts server/interfaces/http/paymentAccounts/paymentAccountRoutes.ts server/interfaces/http/paymentAccounts/schemas/paymentAccountSchemas.ts` (todos verdes). Não precisa rodar a suíte inteira.
- o painel de recebimentos só volta a funcionar depois da parte 2.

LIMPEZA (obrigatória, ao terminar de implementar): apague todos os arquivos de public/assets/aistudio/, inclusive o deste prompt. São cópias dos textos colados no chat, salvas automaticamente pelo AI Studio, e public/ vai para o site publicado. Se a pasta ficar vazia, apague a pasta também.
~~~~
