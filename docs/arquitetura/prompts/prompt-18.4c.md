# Prompt 18.4c — Cobrança na plataforma e repasse depois do serviço (D14)

> Lote 17, gerado do commit de referência `e80e9b1` da branch `claude/agents-md-v2`. Aplique depois do C16. Cole o bloco abaixo no agente do AI Studio, inteiro, de uma vez.

---

## Prompt 18.4c — Cobrança na plataforma e repasse depois do serviço (D14)

Terceira etapa do 18.4 (desenho em docs/arquitetura/06-repasse-design.md, na branch de referência).

~~~~text
Siga o AGENTS.md. NÃO altere o AGENTS.md. O app ainda não foi liberado para usuários: nenhum código de compatibilidade ou transição (§2.2 item 8); pagamentos de teste feitos antes deste prompt podem ser recriados.

IMPORTANTE: aplique os diffs abaixo EXATAMENTE, inclusive os arquivos novos e as remoções. Não reescreva os arquivos do seu jeito. Arquivo tocado sai sem avisos do lint e formatado (AGENTS.md §13). Nenhuma dependência nova.

DECISÃO D14 e AGENTS.md §8.1 (docs/arquitetura/decisoes.md): a plataforma é o merchant of record, cobra na própria conta e só transfere ao CNPJ 48 h depois do fim do serviço.

O QUE MUDA:
1) Cobrança na plataforma: o PaymentIntent de ingresso e de reserva sai sem transfer_data nem application_fee, com transfer_group = ID do pedido e a accountKey do CNPJ na metadata (só IDs, §8.5). A conta do CNPJ continua conferida antes de cobrar (§8.1). Os métodos continuam dinâmicos (§8.3); quando o serviço começa mais de 80 dias depois da compra, o Pix sai (excluded_payment_method_types), porque o reembolso de Pix só vale até 90 dias.
2) Reembolsos: saem do saldo da plataforma; reverse_transfer e refund_application_fee deixam de existir no port e nos chamadores. O reembolso de ingresso grava serviceFeeMinor (a parte que é taxa de serviço).
3) Repasse (domínio payment, folha): coleção payoutEntries (regra allow read, write: if false, com teste; índice status + releaseAt), PayoutService com recordSale (no payment_intent.succeeded, idempotente), applyRefund (reembolso concluído recalcula a parte do proprietário; a taxa da plataforma incide sobre o que ele fica, para baixo; a mesma chave de reembolso só conta uma vez), holdForDispute / closeDispute (contestação segura; ganha volta à fila; perdida cancela) e releaseDue (transferência com source_transaction = latest_charge e idempotência tr_<entrada>; conta sem repasses habilitados espera a próxima rodada). Novo PayoutTransferPort com adapter Stripe.
4) Aplicação: o webhook registra o repasse de ingresso e de reserva, desconta os reembolsos concluídos (na resposta do Stripe e no refund.updated) e trata charge.dispute.created / charge.dispute.closed antes dos fluxos de cada produto.
5) Job: POST /internal/payouts/release (X-Internal-Job-Key), para o Cloud Scheduler de hora em hora.
6) docs/arquitetura/debitos.md: B27 resolvido; B29 (reembolso ou contestação depois do repasse) fica para o 18.4d.

ARQUIVOS (crie, altere ou apague exatamente estes):
- docs/arquitetura/debitos.md (alterar)
- firestore.indexes.json (alterar)
- firestore.rules (alterar)
- firestore.rules.security.test.ts (alterar)
- server.ts (alterar)
- server/application/usecases/bookings/bookingApplicationUseCases.test.ts (alterar)
- server/application/usecases/bookings/cancelBookingByBuyerApplicationUseCase.ts (alterar)
- server/application/usecases/bookings/cancelSlotByPartnerApplicationUseCase.ts (alterar)
- server/application/usecases/bookings/createBookingApplicationUseCase.ts (alterar)
- server/application/usecases/bookings/reconcileBookingWebhookApplicationUseCase.test.ts (alterar)
- server/application/usecases/bookings/reconcileBookingWebhookApplicationUseCase.ts (alterar)
- server/application/usecases/createTicketOrderPaymentIntentApplicationUseCase.ts (alterar)
- server/application/usecases/eventLifecycleOrchestration.test.ts (alterar)
- server/application/usecases/payouts/applyTicketRefundToPayoutApplicationUseCase.ts (criar)
- server/application/usecases/payouts/recordPaidSalePayoutApplicationUseCase.ts (criar)
- server/application/usecases/processTicketRefundApplicationUseCase.ts (alterar)
- server/application/usecases/reconcileStripeWebhookEventApplicationUseCase.ts (alterar)
- server/application/usecases/ticketingPaymentOrchestration.test.ts (alterar)
- server/domain/payment/adapters/firebaseAdminTransactionAdapter.ts (alterar)
- server/domain/payment/adapters/firestorePayoutEntryAdapter.ts (criar)
- server/domain/payment/adapters/stripePaymentGatewayAdapter.ts (alterar)
- server/domain/payment/adapters/stripePayoutTransferAdapter.ts (criar)
- server/domain/payment/factory.ts (alterar)
- server/domain/payment/index.ts (alterar)
- server/domain/payment/ports/paymentGatewayPort.ts (alterar)
- server/domain/payment/ports/payoutEntryRepositoryPort.ts (criar)
- server/domain/payment/ports/payoutTransferPort.ts (criar)
- server/domain/payment/ports/transactionRepositoryPort.ts (alterar)
- server/domain/payment/services/paymentAccountService.ts (alterar)
- server/domain/payment/services/payoutService.test.ts (criar)
- server/domain/payment/services/payoutService.ts (criar)
- server/domain/payment/services/stripePaymentService.marketplace.test.ts (alterar)
- server/domain/payment/services/stripePaymentService.ts (alterar)
- server/domain/payment/types/payoutEntry.ts (criar)
- server/domain/payment/usecases/applyPayoutRefundUseCase.ts (criar)
- server/domain/payment/usecases/closePayoutDisputeUseCase.ts (criar)
- server/domain/payment/usecases/createMarketplacePaymentIntentUseCase.ts (alterar)
- server/domain/payment/usecases/createPaymentForTicketOrderUseCase.ts (alterar)
- server/domain/payment/usecases/holdPayoutForDisputeUseCase.ts (criar)
- server/domain/payment/usecases/processProviderRefundUseCase.ts (alterar)
- server/domain/payment/usecases/recordSalePayoutUseCase.ts (criar)
- server/domain/payment/usecases/releaseDuePayoutsUseCase.ts (criar)
- server/domain/payment/utils/payoutRules.test.ts (criar)
- server/domain/payment/utils/payoutRules.ts (criar)
- server/domain/ticketing/adapters/firestoreRefundStore.ts (alterar)
- server/domain/ticketing/dtos/ticketingPersistenceMappers.ts (alterar)
- server/domain/ticketing/ports/ticketingPort.ts (alterar)
- server/domain/ticketing/services/ticketRefundService.ts (alterar)
- server/domain/ticketing/types/ticketingTypes.ts (alterar)
- server/interfaces/http/payouts/internalPayoutsController.ts (criar)

Aplique as mudanças abaixo EXATAMENTE como estão (formato unified diff: linhas com "-" saem, linhas com "+" entram; as demais são contexto para localizar o trecho). Não reformate outros trechos dos arquivos.

=== docs/arquitetura/debitos.md — diff ===
@@ -19,14 +19,15 @@
 | B21 | `package-lock.json`: `npm audit --omit=dev` aponta 10 vulnerabilidades (1 crítica, 7 altas) em `firebase`, `@firebase/firestore`, `@grpc/grpc-js`, `gaxios`, `proxy-addr`, `uuid` e outras | §7.4 e §7.10 A06 (sem high/critical para merge) | alto — já existiam antes do Prompt 18.3.0a; a dependência nova (`@google-cloud/kms` 6.2.1) não acrescentou nenhuma | prompt próprio de atualização de dependências, testando cada salto de versão |
 | B25 | `src/index.css`: o tema claro ainda depende de sobrescritas globais com `!important` (`:root.light .text-white`, `.bg-white/5`, `.border-white/10`…) para as telas que usam cores fixas; `biome-ignore-all lint/complexity/noImportantStyles` no topo do arquivo | §11.1 (tokens, nunca `text-white` fixo em superfície que muda) e §13 (sem avisos) | médio — cor nova sem token pode sair ilegível no claro; as sobrescritas valem para o app todo | cada tela tocada passa a usar os tokens `--ug-*` (`text-ink`, `bg-surface`, `border-line`, `text-warn`…); quando nenhuma usar mais as classes fixas, as sobrescritas e o `biome-ignore-all` saem |
 | B26 | Avisos de conta financeira no painel de ingressos (`usePartnerMerchantAccount`) e de reservas (`PartnerBookingsComposition`): consideram pronto quando **algum** CNPJ da conta está pronto para receber, não o CNPJ do evento ou da oferta | D14 (conta por documento) | baixo — só o aviso na tela; a venda e a publicação conferem a conta do CNPJ certo no backend (`assertListingCanSellUseCase` + `assertPaymentAccountReadyUseCase`) | Prompt 18.4e: aviso por estabelecimento; `PartnerEventTicketingManager` (1111 linhas) dividido ao tocar |
-| B27 | `createTicketOrderPaymentIntentApplicationUseCase` e `processProviderRefundUseCase` (cobrança com destino até o 18.4c) | D14 (taxa de serviço não volta fora do arrependimento) | baixo — num reembolso parcial o Stripe devolve à plataforma parte proporcional do `application_fee`, que inclui a taxa de serviço; a plataforma deixa de reter essa parte | 18.4c: cobrança na plataforma com transferência separada; o repasse é calculado pelo valor que o proprietário fica |
 | B28 | `bookings/components/partner/OfferTextFields.tsx` (abas pt-BR/en/fr com tradução à mão) e editor de evento do parceiro (texto só em português) | D5 e AGENTS.md §12.6 (editar no idioma ativo, tradução automática) | médio — visitante em inglês ou francês vê o português, e o parceiro digita traduções que a D5 proíbe | 19.1: `LocalizedText`, `MachineTranslationPort` e outbox; o editor mostra o idioma de Configurações e o salvo vira o original |
+| B29 | `server/domain/payment/services/payoutService.ts` (`applyRefund` e `closeDispute` ignoram entrada já `released`) | D14 (reembolso ou contestação depois do repasse vira reversão da transferência ou dívida do CNPJ) | baixo — raro, porque o repasse só sai 48 h depois do fim do serviço; quando acontece, a plataforma arca com o valor | 18.4d: `accountDebts` e reversão de transferência; reembolso pendente na hora da liberação também entra nessa conta |
 
 ## Resolvidos
 
 | ID | Resolução |
 |---|---|
 | B22 | Prompt 18.4a (D14): cada CNPJ aprovado vende pela própria conta Stripe Express (`paymentAccounts/{accountKey}`, `accountKey` = índice cego do CNPJ); `verificationOwners` e o "documento de vendas da conta" saíram; a conta é criada com o CNPJ da verificação pré-preenchido para o Stripe conferir a empresa |
+| B27 | Prompt 18.4c (D14): a cobrança é feita na plataforma, sem destino (separate charges and transfers); o reembolso sai do saldo da plataforma e o repasse (`payoutEntries`) é recalculado pelo valor que o proprietário fica, com a taxa de serviço fora dele. |
 | B24 | Prompt 18.3b: excluir o estabelecimento cancela na hora a assinatura dele no Stripe (`planSubscriptions/{itemId}`); excluir a conta cancela todas as assinaturas vivas dela antes de apagar os planos |
 | B23 | Prompt 18.3.0b (D12, P0): a conta do parceiro deixou de ter documento — o cadastro envia só `termsAccepted`; `partners/{uid}.cpfCnpj`, `cpfCnpjClean` e a coleção `partnerDocumentKeys` saíram do código, das regras e dos testes (resolve também o débito do §7.7); o status `pending` da conta saiu (só `active` e `suspended`); CPF/CNPJ existe apenas, cifrado e com índice cego, na verificação de cada estabelecimento (18.3.0a); `PartnersModal` dividido (529 → 257 linhas), com as condições de cada etapa em `utils/signupStepGates.ts` |
 | Erro no modal de detalhe e métricas zeradas — Prompt 18.2.3 | decisão de 2026-10-19 (opção B): `/api/insights/track` aceita visitante sem login (o token só é anexado quando há usuário); cada item grava dois contadores por dia (`viewsSignedIn`, `viewsAnonymous`) em `interactionStats`, sem uid nem IP; repetição em 30 min não soma (guarda `interactionGuards` com chave HMAC de uid/IP e TTL em `expiresAt`); o relatório mostra o total e a divisão em percentual; `/api/insights/stats/:colecao/:id` exige login e checa o dono no backend (antes o cliente chamava sem token e recebia sempre zero); `ReportsView` dividido e traduzido (sai de B16); `trust proxy` com número de proxies de `TRUST_PROXY_HOPS` (§7.4); handler global de erros do `server.ts` deixou de devolver `err.message` (§7.10 A05); `src/shared/lib/insights.ts` (sem uso, `shared → domain`) removido |

=== firestore.indexes.json — diff ===
@@ -313,6 +313,20 @@
           "order": "ASCENDING"
         }
       ]
+    },
+    {
+      "collectionGroup": "payoutEntries",
+      "queryScope": "COLLECTION",
+      "fields": [
+        {
+          "fieldPath": "status",
+          "order": "ASCENDING"
+        },
+        {
+          "fieldPath": "releaseAt",
+          "order": "ASCENDING"
+        }
+      ]
     }
   ],
   "fieldOverrides": [

=== firestore.rules — diff ===
@@ -66,6 +66,10 @@ service cloud.firestore {
     match /paymentAccounts/{accountKey} {
       allow read, write: if false;
     }
+    // Repasse de cada venda (D14): financeiro, só backend.
+    match /payoutEntries/{entryId} {
+      allow read, write: if false;
+    }
     match /planSubscriptions/{itemId} {
       allow read, write: if false;
     }

=== firestore.rules.security.test.ts — diff ===
@@ -364,6 +364,15 @@ describe('Firestore Rules — Security Suite', () => {
       }
     });
 
+    it('repasse (D14): payoutEntries negado até para o dono e admin', async () => {
+      const adminDb = testEnv.authenticatedContext('admin-user', { admin: true }).firestore();
+      const ownerDb = testEnv.authenticatedContext('partner-1').firestore();
+      for (const db of [adminDb, ownerDb]) {
+        await assertFails(getDoc(doc(db, 'payoutEntries/po_booking_bk-1')));
+        await assertFails(setDoc(doc(db, 'payoutEntries/po_booking_bk-1'), { status: 'released' }));
+      }
+    });
+
     it('plano (D11): listingPlans negado até para o dono e admin', async () => {
       const adminDb = testEnv.authenticatedContext('admin-user', { admin: true }).firestore();
       const ownerDb = testEnv.authenticatedContext('partner-1').firestore();

=== server.ts — diff ===
@@ -29,6 +29,7 @@ import {
   partnerOffersRouter,
 } from './server/interfaces/http/bookings/bookingsRoutes';
 import { InternalBookingsController } from './server/interfaces/http/bookings/internalBookingsController';
+import { InternalPayoutsController } from './server/interfaces/http/payouts/internalPayoutsController';
 import { InternalPartnersController } from './server/interfaces/http/partners/internalPartnersController';
 import { verifyInternalJobKey } from './server/infrastructure/auth/internalJobAuth';
 import { resolveTrustProxyHops } from './server/infrastructure/config/trustProxy';
@@ -143,6 +144,7 @@ async function startServer() {
     TicketingController.expireOrdersInternalJob
   );
   app.post('/internal/bookings/expire', verifyInternalJobKey, InternalBookingsController.expire);
+  app.post('/internal/payouts/release', verifyInternalJobKey, InternalPayoutsController.release);
   app.post(
     '/internal/bookings/complete',
     verifyInternalJobKey,

=== server/application/usecases/bookings/bookingApplicationUseCases.test.ts — diff ===
@@ -135,7 +135,7 @@ describe('createBookingApplicationUseCase', () => {
 describe('cancelBookingByBuyerApplicationUseCase', () => {
   beforeEach(() => vi.clearAllMocks());
 
-  it('100% devolve também a taxa da plataforma', async () => {
+  it('reembolsa do saldo da plataforma, sem reverter transferência (D14)', async () => {
     vi.mocked(requestCancellationByBuyerUseCase).mockResolvedValue({
       booking: { ...BOOKING, status: 'canceled' },
       refundPercent: 100,
@@ -145,14 +145,12 @@ describe('cancelBookingByBuyerApplicationUseCase', () => {
     expect(processProviderRefundUseCase).toHaveBeenCalledWith({
       paymentIntentId: 'pi_1',
       amountMinor: 20000,
-      reverseTransfer: true,
-      refundApplicationFee: true,
       idempotencyKey: 'refund_booking_bk_1',
       metadata: { referenceType: 'booking_refund', bookingId: 'bk_1' },
     });
   });
 
-  it('50% não devolve a taxa', async () => {
+  it('50% devolve só a metade', async () => {
     vi.mocked(requestCancellationByBuyerUseCase).mockResolvedValue({
       booking: { ...BOOKING, status: 'canceled' },
       refundPercent: 50,
@@ -160,7 +158,7 @@ describe('cancelBookingByBuyerApplicationUseCase', () => {
     } as never);
     await cancelBookingByBuyerApplicationUseCase({ uid: 'buyer-1', admin: false }, 'bk_1', '');
     expect(processProviderRefundUseCase).toHaveBeenCalledWith(
-      expect.objectContaining({ amountMinor: 10000, refundApplicationFee: false })
+      expect.objectContaining({ amountMinor: 10000 })
     );
   });
 
@@ -210,8 +208,6 @@ describe('cancelSlotByPartnerApplicationUseCase', () => {
     expect(processProviderRefundUseCase).toHaveBeenCalledWith(
       expect.objectContaining({
         paymentIntentId: 'pi_1',
-        refundApplicationFee: true,
-        reverseTransfer: true,
         idempotencyKey: 'refund_slot_bk_1',
       })
     );

=== server/application/usecases/bookings/cancelBookingByBuyerApplicationUseCase.ts — diff ===
@@ -15,9 +15,6 @@ export async function cancelBookingByBuyerApplicationUseCase(
     await processProviderRefundUseCase({
       paymentIntentId: result.booking.paymentIntentId,
       amountMinor: result.refundAmountMinor,
-      reverseTransfer: true,
-      // Taxa da plataforma só volta no reembolso integral (cancelamento dentro do prazo gratuito).
-      refundApplicationFee: result.refundPercent === 100,
       idempotencyKey: `refund_booking_${bookingId}`,
       metadata: { referenceType: 'booking_refund', bookingId },
     });

=== server/application/usecases/bookings/cancelSlotByPartnerApplicationUseCase.ts — diff ===
@@ -25,8 +25,6 @@ export async function cancelSlotByPartnerApplicationUseCase(
       await processProviderRefundUseCase({
         paymentIntentId: canceled.paymentIntentId,
         amountMinor: refundAmountMinor,
-        reverseTransfer: true,
-        refundApplicationFee: true,
         idempotencyKey: `refund_slot_${canceled.id}`,
         metadata: { referenceType: 'booking_refund', bookingId: canceled.id },
       });

=== server/application/usecases/bookings/createBookingApplicationUseCase.ts — diff ===
@@ -39,7 +39,7 @@ function loadFeeConfig() {
   }
 }
 
-/** Reserva as vagas e cria o pagamento (destination charge). Quem confirma é o webhook. */
+/** Reserva as vagas e cria o pagamento na plataforma (D14). Quem confirma é o webhook. */
 export async function createBookingApplicationUseCase(
   buyer: BookingBuyer,
   input: CreatePendingBookingInput
@@ -70,6 +70,7 @@ export async function createBookingApplicationUseCase(
       sellerPartnerId: booking.sellerPartnerId,
       sellerAccountKey: accountKey,
       description: `Use Guide — ${booking.offerSnapshot.title}`,
+      serviceStartsAt: booking.offerSnapshot.startsAt,
       totalMinor: booking.totalMinor,
       platformFeeMinor: booking.platformFeeMinor,
       idempotencyKey: `pi_booking_${booking.id}`,

=== server/application/usecases/bookings/reconcileBookingWebhookApplicationUseCase.test.ts — diff ===
@@ -15,6 +15,8 @@ vi.mock('../../../domain/notifications', () => ({
   createNotificationUseCase: vi.fn().mockResolvedValue(undefined),
 }));
 vi.mock('../../../domain/payment', () => ({
+  applyPayoutRefundUseCase: vi.fn().mockResolvedValue(null),
+  recordSalePayoutUseCase: vi.fn().mockResolvedValue({}),
   getPaymentReferenceUseCase: vi.fn(),
   processProviderRefundUseCase: vi.fn().mockResolvedValue({}),
   updatePaymentTransactionStatusUseCase: vi.fn().mockResolvedValue(undefined),
@@ -28,7 +30,12 @@ import {
   markBookingRefundedUseCase,
 } from '../../../domain/bookings';
 import { createNotificationUseCase } from '../../../domain/notifications';
-import { getPaymentReferenceUseCase, processProviderRefundUseCase } from '../../../domain/payment';
+import {
+  applyPayoutRefundUseCase,
+  getPaymentReferenceUseCase,
+  processProviderRefundUseCase,
+  recordSalePayoutUseCase,
+} from '../../../domain/payment';
 import { reconcileBookingWebhookApplicationUseCase } from './reconcileBookingWebhookApplicationUseCase';
 
 function event(type: string, dataObject: Record<string, unknown>) {
@@ -37,20 +44,39 @@ function event(type: string, dataObject: Record<string, unknown>) {
 
 const SUCCEEDED = event('payment_intent.succeeded', {
   id: 'pi_1',
-  metadata: { referenceType: 'booking', referenceId: 'bk_1', partnerId: 'p1' },
+  latest_charge: 'ch_1',
+  metadata: { referenceType: 'booking', referenceId: 'bk_1', partnerId: 'p1', accountKey: 'key-1' },
 });
 
 describe('reconcileBookingWebhookApplicationUseCase', () => {
   beforeEach(() => vi.clearAllMocks());
 
-  it('pagamento aprovado confirma a reserva e avisa o parceiro', async () => {
+  it('pagamento aprovado confirma a reserva, registra o repasse e avisa o parceiro', async () => {
     vi.mocked(confirmBookingPaymentUseCase).mockResolvedValue({
+      id: 'bk_1',
       sellerPartnerId: 'p1',
       participantsCount: 2,
-      offerSnapshot: { title: 'Passeio' },
+      totalMinor: 30000,
+      platformFeeMinor: 4500,
+      offerSnapshot: {
+        title: 'Passeio',
+        startsAt: '2026-11-10T12:00:00.000Z',
+        durationMinutes: 240,
+      },
     } as never);
     await expect(reconcileBookingWebhookApplicationUseCase(SUCCEEDED)).resolves.toBe(true);
     expect(confirmBookingPaymentUseCase).toHaveBeenCalledWith('bk_1', 'pi_1');
+    expect(recordSalePayoutUseCase).toHaveBeenCalledWith({
+      referenceType: 'booking',
+      referenceId: 'bk_1',
+      accountKey: 'key-1',
+      paymentIntentId: 'pi_1',
+      chargeId: 'ch_1',
+      grossMinor: 30000,
+      serviceFeeMinor: 0,
+      platformFeeMinor: 4500,
+      serviceEndsAt: '2026-11-10T16:00:00.000Z',
+    });
     expect(createNotificationUseCase).toHaveBeenCalledWith(
       expect.objectContaining({ recipientPartnerId: 'p1' })
     );
@@ -64,11 +90,10 @@ describe('reconcileBookingWebhookApplicationUseCase', () => {
     expect(processProviderRefundUseCase).toHaveBeenCalledWith(
       expect.objectContaining({
         paymentIntentId: 'pi_1',
-        refundApplicationFee: true,
-        reverseTransfer: true,
         idempotencyKey: 'refund_late_bk_1',
       })
     );
+    expect(recordSalePayoutUseCase).not.toHaveBeenCalled();
   });
 
   it('erro inesperado sobe para o webhook responder 5xx', async () => {
@@ -87,14 +112,23 @@ describe('reconcileBookingWebhookApplicationUseCase', () => {
     expect(markBookingRefundedUseCase).not.toHaveBeenCalled();
   });
 
-  it('reembolso aprovado marca só reserva cancelada', async () => {
+  it('reembolso aprovado desconta o repasse e marca só reserva cancelada', async () => {
     const succeeded = event('refund.updated', {
+      id: 're_1',
+      amount: 15000,
       status: 'succeeded',
       metadata: { referenceType: 'booking_refund', bookingId: 'bk_1' },
     });
     vi.mocked(getBookingUseCase).mockResolvedValueOnce({ status: 'canceled' } as never);
     await reconcileBookingWebhookApplicationUseCase(succeeded);
     expect(markBookingRefundedUseCase).toHaveBeenCalledWith('bk_1');
+    expect(applyPayoutRefundUseCase).toHaveBeenCalledWith({
+      referenceType: 'booking',
+      referenceId: 'bk_1',
+      refundKey: 're_1',
+      amountMinor: 15000,
+      serviceFeeMinor: 0,
+    });
     vi.mocked(getBookingUseCase).mockResolvedValueOnce({ status: 'expired' } as never);
     await reconcileBookingWebhookApplicationUseCase(succeeded);
     expect(markBookingRefundedUseCase).toHaveBeenCalledTimes(1);

=== server/application/usecases/bookings/reconcileBookingWebhookApplicationUseCase.ts — diff ===
@@ -1,3 +1,4 @@
+import { recordPaidSalePayoutApplicationUseCase } from '../payouts/recordPaidSalePayoutApplicationUseCase';
 import {
   BookingDomainError,
   confirmBookingPaymentUseCase,
@@ -8,6 +9,7 @@ import {
 } from '../../../domain/bookings';
 import { createNotificationUseCase } from '../../../domain/notifications';
 import {
+  applyPayoutRefundUseCase,
   getPaymentReferenceUseCase,
   processProviderRefundUseCase,
   updatePaymentTransactionStatusUseCase,
@@ -18,10 +20,29 @@ function readMetadata(obj: Record<string, unknown>): Record<string, string> {
   return (obj.metadata as Record<string, string> | undefined) ?? {};
 }
 
-async function handlePaymentSucceeded(paymentIntentId: string, bookingId: string): Promise<void> {
+function serviceEndsAt(startsAt: string, durationMinutes: number | undefined): string {
+  return new Date(new Date(startsAt).getTime() + (durationMinutes ?? 0) * 60_000).toISOString();
+}
+
+async function handlePaymentSucceeded(
+  paymentIntent: Record<string, unknown>,
+  bookingId: string
+): Promise<void> {
+  const paymentIntentId = String(paymentIntent.id || '');
   await updatePaymentTransactionStatusUseCase(paymentIntentId, 'succeeded');
   try {
     const booking = await confirmBookingPaymentUseCase(bookingId, paymentIntentId);
+    await recordPaidSalePayoutApplicationUseCase(paymentIntent, {
+      referenceType: 'booking',
+      referenceId: booking.id,
+      grossMinor: booking.totalMinor,
+      serviceFeeMinor: 0,
+      platformFeeMinor: booking.platformFeeMinor,
+      serviceEndsAt: serviceEndsAt(
+        booking.offerSnapshot.startsAt,
+        booking.offerSnapshot.durationMinutes
+      ),
+    });
     await createNotificationUseCase({
       recipientPartnerId: booking.sellerPartnerId,
       type: 'admin_message',
@@ -35,16 +56,26 @@ async function handlePaymentSucceeded(paymentIntentId: string, bookingId: string
     // Pagamento chegou para uma reserva expirada sem vaga ou já cancelada: devolve tudo.
     await processProviderRefundUseCase({
       paymentIntentId,
-      reverseTransfer: true,
-      refundApplicationFee: true,
       idempotencyKey: `refund_late_${bookingId}`,
       metadata: { referenceType: 'booking_refund', bookingId },
     });
   }
 }
 
-async function handleRefundUpdate(bookingId: string, providerStatus: string): Promise<void> {
+async function handleRefundUpdate(
+  bookingId: string,
+  refund: Record<string, unknown>
+): Promise<void> {
+  const providerStatus = String(refund.status || '');
   if (providerStatus === 'succeeded') {
+    // Reserva sem taxa de serviço: o reembolso todo sai do valor do proprietário (D14).
+    await applyPayoutRefundUseCase({
+      referenceType: 'booking',
+      referenceId: bookingId,
+      refundKey: String(refund.id || ''),
+      amountMinor: typeof refund.amount === 'number' ? refund.amount : 0,
+      serviceFeeMinor: 0,
+    });
     const booking = await getBookingUseCase(bookingId);
     // Só a reserva cancelada vira "reembolsada"; o reembolso de pagamento tardio não muda o status.
     if (booking?.status === 'canceled') {
@@ -70,7 +101,7 @@ export async function reconcileBookingWebhookApplicationUseCase(
     if (metadata.referenceType !== 'booking' || !metadata.referenceId) return false;
     const paymentIntentId = String(obj.id || '');
     if (event.type === 'payment_intent.succeeded') {
-      await handlePaymentSucceeded(paymentIntentId, metadata.referenceId);
+      await handlePaymentSucceeded(obj, metadata.referenceId);
     } else {
       await updatePaymentTransactionStatusUseCase(paymentIntentId, 'failed');
       await markBookingPaymentFailedUseCase(metadata.referenceId);
@@ -80,7 +111,7 @@ export async function reconcileBookingWebhookApplicationUseCase(
 
   if (event.type === 'refund.updated' || event.type === 'refund.created') {
     if (metadata.referenceType !== 'booking_refund' || !metadata.bookingId) return false;
-    await handleRefundUpdate(metadata.bookingId, String(obj.status || ''));
+    await handleRefundUpdate(metadata.bookingId, obj);
     return true;
   }

=== server/application/usecases/createTicketOrderPaymentIntentApplicationUseCase.ts — diff ===
@@ -104,6 +104,7 @@ export async function createTicketOrderPaymentIntentApplicationUseCase(
     eventListingId: order.eventListingId,
     occurrenceId: order.occurrenceId,
     eventTitle: order.eventSnapshot?.title || listing.title,
+    serviceStartsAt: order.eventSnapshot?.startsAt ?? new Date().toISOString(),
     totalMinor: order.totalMinor,
     // A taxa de serviço do comprador também fica com a plataforma (D14).
     platformFeeMinor: order.platformFeeMinor + order.serviceFeeMinor,

=== server/application/usecases/eventLifecycleOrchestration.test.ts — diff ===
@@ -96,6 +96,7 @@ describe('eventLifecycleOrchestrationUseCases', () => {
       id: 'ref-1',
       orderId: 'ord-1',
       amountMinor: 10000,
+      serviceFeeMinor: 0,
       requestedBy: 'partner',
       reason: 'Chuva intensa',
       status: 'pending_provider',

=== server/application/usecases/payouts/applyTicketRefundToPayoutApplicationUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { applyPayoutRefundUseCase } from '../../../domain/payment';
import type { Refund } from '../../../domain/ticketing';

/** Reembolso de ingresso concluído desconta o repasse do pedido; chamado na resposta e no webhook. */
export async function applyTicketRefundToPayoutApplicationUseCase(refund: Refund): Promise<void> {
  if (refund.status !== 'approved' || refund.amountMinor <= 0) return;
  await applyPayoutRefundUseCase({
    referenceType: 'ticket_order',
    referenceId: refund.orderId,
    refundKey: refund.id,
    amountMinor: refund.amountMinor,
    serviceFeeMinor: refund.serviceFeeMinor,
  });
}

=== server/application/usecases/payouts/recordPaidSalePayoutApplicationUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { recordSalePayoutUseCase } from '../../../domain/payment';

export interface PaidSale {
  referenceType: 'ticket_order' | 'booking';
  referenceId: string;
  grossMinor: number;
  serviceFeeMinor: number;
  platformFeeMinor: number;
  serviceEndsAt: string;
}

/**
 * Registra o repasse de uma venda confirmada pelo webhook (D14). A conta do CNPJ vem da metadata do
 * pagamento (gravada na cobrança) e a cobrança de origem, do `latest_charge`.
 */
export async function recordPaidSalePayoutApplicationUseCase(
  paymentIntent: Record<string, unknown>,
  sale: PaidSale
): Promise<void> {
  const metadata = (paymentIntent.metadata as Record<string, string> | undefined) ?? {};
  const chargeId =
    typeof paymentIntent.latest_charge === 'string' ? paymentIntent.latest_charge : '';
  const paymentIntentId = String(paymentIntent.id || '');
  if (!metadata.accountKey || !chargeId || !paymentIntentId) {
    // Sem a conta ou a cobrança não dá para repassar; o erro volta ao Stripe, que reenvia o evento.
    throw new Error('Pagamento confirmado sem accountKey ou latest_charge para o repasse.');
  }
  await recordSalePayoutUseCase({
    ...sale,
    accountKey: metadata.accountKey,
    paymentIntentId,
    chargeId,
  });
}

=== server/application/usecases/processTicketRefundApplicationUseCase.ts — diff ===
@@ -5,6 +5,7 @@ import {
   type Refund,
 } from '../../domain/ticketing';
 import { OrchestrationActor } from './orchestrationActor';
+import { applyTicketRefundToPayoutApplicationUseCase } from './payouts/applyTicketRefundToPayoutApplicationUseCase';
 
 export async function processTicketRefundApplicationUseCase(
   actor: OrchestrationActor,
@@ -39,8 +40,6 @@ export async function processTicketRefundApplicationUseCase(
     const providerRes = await processProviderRefundUseCase({
       paymentIntentId,
       amountMinor: refund.amountMinor,
-      reverseTransfer: true,
-      refundApplicationFee: Boolean(params.isEventCanceledByOrganizer),
       idempotencyKey: `stripe_ref_${refund.id}_${params.idempotencyKey}`,
       metadata: { refundId: refund.id, orderId: params.orderId, referenceType: 'ticket_refund' },
     });
@@ -57,6 +56,8 @@ export async function processTicketRefundApplicationUseCase(
       finalStatus,
       providerRes.providerRefundId || undefined
     );
+    // Concluído na hora (cartão, em geral): desconta já; senão o webhook desconta ao concluir.
+    await applyTicketRefundToPayoutApplicationUseCase(finalized);
 
     return { refund: finalized, isReplay };
   } catch (error) {

=== server/application/usecases/reconcileStripeWebhookEventApplicationUseCase.ts — diff ===
@@ -1,5 +1,7 @@
 import { createNotificationUseCase } from '../../domain/notifications';
 import {
+  closePayoutDisputeUseCase,
+  holdPayoutForDisputeUseCase,
   syncPaymentAccountFromWebhookUseCase,
   updatePaymentTransactionStatusUseCase,
   type VerifiedWebhookEvent,
@@ -12,6 +14,8 @@ import {
 } from '../../domain/ticketing';
 import { activatePaidPlanApplicationUseCase } from './activatePaidPlanApplicationUseCase';
 import { reconcileBookingWebhookApplicationUseCase } from './bookings/reconcileBookingWebhookApplicationUseCase';
+import { applyTicketRefundToPayoutApplicationUseCase } from './payouts/applyTicketRefundToPayoutApplicationUseCase';
+import { recordPaidSalePayoutApplicationUseCase } from './payouts/recordPaidSalePayoutApplicationUseCase';
 import {
   PLAN_SUBSCRIPTION_WEBHOOK_EVENTS,
   reconcilePlanSubscriptionWebhookApplicationUseCase,
@@ -22,6 +26,19 @@ export async function reconcileStripeWebhookEventApplicationUseCase(
 ): Promise<{ processed: boolean; eventType: string }> {
   const obj = event.dataObject || {};
 
+  // Contestação segura o repasse de qualquer venda, antes do tratamento de cada produto (D14).
+  if (event.type === 'charge.dispute.created' && obj.payment_intent) {
+    await holdPayoutForDisputeUseCase(String(obj.payment_intent));
+  }
+  if (event.type === 'charge.dispute.closed') {
+    if (obj.payment_intent) {
+      // `warning_closed`: consulta encerrada sem estorno, o dinheiro fica com a plataforma.
+      const won = obj.status === 'won' || obj.status === 'warning_closed';
+      await closePayoutDisputeUseCase(String(obj.payment_intent), won);
+    }
+    return { processed: true, eventType: event.type };
+  }
+
   if (await reconcileBookingWebhookApplicationUseCase(event)) {
     return { processed: true, eventType: event.type };
   }
@@ -49,6 +66,15 @@ export async function reconcileStripeWebhookEventApplicationUseCase(
         paymentId: paymentIntentId,
         paymentIntentId,
       });
+      const { order } = confirmed;
+      await recordPaidSalePayoutApplicationUseCase(obj, {
+        referenceType: 'ticket_order',
+        referenceId: order.id,
+        grossMinor: order.totalMinor,
+        serviceFeeMinor: order.serviceFeeMinor,
+        platformFeeMinor: order.platformFeeMinor,
+        serviceEndsAt: order.eventSnapshot?.endsAt || order.eventSnapshot?.startsAt || '',
+      });
 
       const targetPartnerId = metadata.partnerId || metadata.sellerPartnerId;
       if (!confirmed.alreadyPaid && targetPartnerId) {
@@ -100,11 +126,12 @@ export async function reconcileStripeWebhookEventApplicationUseCase(
     const providerStatus = String(obj.status || '');
     if (refundMetadata.refundId) {
       if (providerStatus === 'succeeded') {
-        await finalizeTicketRefundStatusUseCase(
+        const refund = await finalizeTicketRefundStatusUseCase(
           refundMetadata.refundId,
           'approved',
           String(obj.id || '')
         );
+        await applyTicketRefundToPayoutApplicationUseCase(refund);
       } else if (providerStatus === 'failed' || providerStatus === 'canceled') {
         await finalizeTicketRefundStatusUseCase(
           refundMetadata.refundId,

=== server/application/usecases/ticketingPaymentOrchestration.test.ts — diff ===
@@ -6,7 +6,12 @@ vi.mock('./activatePaidPlanApplicationUseCase', () => ({
   activatePaidPlanApplicationUseCase: vi.fn(),
 }));
 vi.mock('../../domain/payment', () => ({
+  applyPayoutRefundUseCase: vi.fn(),
+  closePayoutDisputeUseCase: vi.fn(),
+  holdPayoutForDisputeUseCase: vi.fn(),
+  recordSalePayoutUseCase: vi.fn(),
   createPaymentForTicketOrderUseCase: vi.fn(),
+  getPaymentReferenceUseCase: vi.fn().mockResolvedValue(null),
   PaymentDomainError: class extends Error {},
   processProviderRefundUseCase: vi.fn(),
   retrievePaymentIntentUseCase: vi.fn(),
@@ -24,10 +29,15 @@ vi.mock('../../domain/ticketing', () => ({
 }));
 
 import {
+  applyPayoutRefundUseCase,
+  closePayoutDisputeUseCase,
+  holdPayoutForDisputeUseCase,
   processProviderRefundUseCase,
+  recordSalePayoutUseCase,
   updatePaymentTransactionStatusUseCase,
 } from '../../domain/payment';
 import {
+  confirmTicketOrderPaymentUseCase,
   finalizeTicketRefundStatusUseCase,
   requestTicketRefundUseCase,
   type Refund,
@@ -85,7 +95,14 @@ describe('ticketingPaymentOrchestrationUseCases — refunds', () => {
     expect(finalizeTicketRefundStatusUseCase).not.toHaveBeenCalled();
   });
 
-  it('refund.updated com status succeeded aprova o reembolso', async () => {
+  it('refund.updated com status succeeded aprova o reembolso e desconta o repasse', async () => {
+    vi.mocked(finalizeTicketRefundStatusUseCase).mockResolvedValue({
+      id: 'ref_1',
+      orderId: 'ord_1',
+      amountMinor: 5300,
+      serviceFeeMinor: 300,
+      status: 'approved',
+    } as Refund);
     await reconcileStripeWebhookEventApplicationUseCase({
       id: 'evt_2',
       type: 'refund.updated',
@@ -93,6 +110,13 @@ describe('ticketingPaymentOrchestrationUseCases — refunds', () => {
       dataObject: { id: 're_1', status: 'succeeded', metadata: { refundId: 'ref_1' } },
     });
     expect(finalizeTicketRefundStatusUseCase).toHaveBeenCalledWith('ref_1', 'approved', 're_1');
+    expect(applyPayoutRefundUseCase).toHaveBeenCalledWith({
+      referenceType: 'ticket_order',
+      referenceId: 'ord_1',
+      refundKey: 'ref_1',
+      amountMinor: 5300,
+      serviceFeeMinor: 300,
+    });
   });
 
   it('refund.updated com status failed marca como failed', async () => {
@@ -119,3 +143,71 @@ describe('ticketingPaymentOrchestrationUseCases — refunds', () => {
     expect(updatePaymentTransactionStatusUseCase).toHaveBeenCalledWith('pi_1', 'refunded');
   });
 });
+
+describe('ticketingPaymentOrchestrationUseCases — repasse (D14)', () => {
+  beforeEach(() => {
+    vi.clearAllMocks();
+  });
+
+  it('pagamento confirmado registra o repasse com a conta do CNPJ e a cobrança de origem', async () => {
+    vi.mocked(confirmTicketOrderPaymentUseCase).mockResolvedValue({
+      order: {
+        id: 'ord_1',
+        totalMinor: 10600,
+        serviceFeeMinor: 600,
+        platformFeeMinor: 1000,
+        eventSnapshot: {
+          title: 'Show',
+          startsAt: '2026-12-20T22:00:00.000Z',
+          endsAt: '2026-12-21T03:00:00.000Z',
+        },
+      } as TicketOrder,
+      tickets: [],
+      alreadyPaid: true,
+    });
+    await reconcileStripeWebhookEventApplicationUseCase({
+      id: 'evt_pi',
+      type: 'payment_intent.succeeded',
+      created: 1,
+      dataObject: {
+        id: 'pi_1',
+        latest_charge: 'ch_1',
+        metadata: { referenceType: 'ticket_order', referenceId: 'ord_1', accountKey: 'key-1' },
+      },
+    });
+    expect(recordSalePayoutUseCase).toHaveBeenCalledWith({
+      referenceType: 'ticket_order',
+      referenceId: 'ord_1',
+      accountKey: 'key-1',
+      paymentIntentId: 'pi_1',
+      chargeId: 'ch_1',
+      grossMinor: 10600,
+      serviceFeeMinor: 600,
+      platformFeeMinor: 1000,
+      serviceEndsAt: '2026-12-21T03:00:00.000Z',
+    });
+  });
+
+  it('contestação segura o repasse; encerrada ganha ou perdida avisa o repasse', async () => {
+    await reconcileStripeWebhookEventApplicationUseCase({
+      id: 'evt_d1',
+      type: 'charge.dispute.created',
+      created: 1,
+      dataObject: { payment_intent: 'pi_1', metadata: {} },
+    });
+    expect(holdPayoutForDisputeUseCase).toHaveBeenCalledWith('pi_1');
+    for (const [status, won] of [
+      ['won', true],
+      ['warning_closed', true],
+      ['lost', false],
+    ] as const) {
+      await reconcileStripeWebhookEventApplicationUseCase({
+        id: `evt_${status}`,
+        type: 'charge.dispute.closed',
+        created: 1,
+        dataObject: { payment_intent: 'pi_1', status },
+      });
+      expect(closePayoutDisputeUseCase).toHaveBeenLastCalledWith('pi_1', won);
+    }
+  });
+});

=== server/domain/payment/adapters/firebaseAdminTransactionAdapter.ts — diff ===
@@ -14,8 +14,7 @@ function mapDocToTransactionRecord(id: string, data: Record<string, unknown>): T
       typeof data.referenceType === 'string' && data.referenceType ? data.referenceType : undefined,
     referenceId: typeof data.referenceId === 'string' ? data.referenceId : null,
     providerPaymentId: typeof data.providerPaymentId === 'string' ? data.providerPaymentId : null,
-    connectedAccountId:
-      typeof data.connectedAccountId === 'string' ? data.connectedAccountId : null,
+    accountKey: typeof data.accountKey === 'string' ? data.accountKey : null,
     amount: typeof data.amount === 'number' ? data.amount : null,
     amountMinor: typeof data.amountMinor === 'number' ? data.amountMinor : null,
     platformFeeMinor: typeof data.platformFeeMinor === 'number' ? data.platformFeeMinor : null,
@@ -101,7 +100,7 @@ export class FirebaseAdminTransactionAdapter implements TransactionRepositoryPor
     referenceType: string;
     referenceId: string;
     providerPaymentId: string;
-    connectedAccountId?: string;
+    accountKey?: string;
     amountMinor: number;
     platformFeeMinor: number;
     paymentMethod: string;
@@ -115,7 +114,7 @@ export class FirebaseAdminTransactionAdapter implements TransactionRepositoryPor
       referenceId: record.referenceId,
       provider: 'stripe',
       providerPaymentId: record.providerPaymentId,
-      ...(record.connectedAccountId ? { connectedAccountId: record.connectedAccountId } : {}),
+      ...(record.accountKey ? { accountKey: record.accountKey } : {}),
       amountMinor: record.amountMinor,
       platformFeeMinor: record.platformFeeMinor,
       currency: 'BRL',
@@ -140,7 +139,7 @@ export class FirebaseAdminTransactionAdapter implements TransactionRepositoryPor
           referenceId: record.referenceId,
           provider: 'stripe',
           providerPaymentId: record.providerPaymentId,
-          ...(record.connectedAccountId ? { connectedAccountId: record.connectedAccountId } : {}),
+          ...(record.accountKey ? { accountKey: record.accountKey } : {}),
           amount: record.amountMinor / 100,
           amountMinor: record.amountMinor,
           platformFeeMinor: record.platformFeeMinor,

=== server/domain/payment/adapters/firestorePayoutEntryAdapter.ts — ARQUIVO NOVO, conteúdo completo ===
import { adminDb } from '../../../infrastructure/firebase/adminClient';
import type { PayoutEntryRepositoryPort } from '../ports/payoutEntryRepositoryPort';
import type { PayoutEntry } from '../types/payoutEntry';

const ENTRIES = 'payoutEntries';

/** Coleção só de backend (`allow read, write: if false`, AGENTS.md §6.2). */
export class FirestorePayoutEntryAdapter implements PayoutEntryRepositoryPort {
  async createIfAbsent(entry: PayoutEntry): Promise<PayoutEntry> {
    const ref = adminDb.collection(ENTRIES).doc(entry.id);
    return adminDb.runTransaction(async (tx) => {
      const snapshot = await tx.get(ref);
      if (snapshot.exists) return snapshot.data() as PayoutEntry;
      tx.set(ref, entry);
      return entry;
    });
  }

  async get(id: string): Promise<PayoutEntry | null> {
    const snapshot = await adminDb.collection(ENTRIES).doc(id).get();
    return snapshot.exists ? (snapshot.data() as PayoutEntry) : null;
  }

  async getByPaymentIntentId(paymentIntentId: string): Promise<PayoutEntry | null> {
    const snapshot = await adminDb
      .collection(ENTRIES)
      .where('paymentIntentId', '==', paymentIntentId)
      .limit(1)
      .get();
    return (snapshot.docs[0]?.data() as PayoutEntry | undefined) ?? null;
  }

  async listDue(nowIso: string, limit: number): Promise<PayoutEntry[]> {
    const snapshot = await adminDb
      .collection(ENTRIES)
      .where('status', '==', 'pending')
      .where('releaseAt', '<=', nowIso)
      .orderBy('releaseAt', 'asc')
      .limit(limit)
      .get();
    return snapshot.docs.map((doc) => doc.data() as PayoutEntry);
  }

  async update(
    id: string,
    change: (current: PayoutEntry) => PayoutEntry | null
  ): Promise<PayoutEntry | null> {
    const ref = adminDb.collection(ENTRIES).doc(id);
    return adminDb.runTransaction(async (tx) => {
      const snapshot = await tx.get(ref);
      if (!snapshot.exists) return null;
      const current = snapshot.data() as PayoutEntry;
      const next = change(current);
      if (!next) return current;
      tx.set(ref, next);
      return next;
    });
  }
}

=== server/domain/payment/adapters/stripePaymentGatewayAdapter.ts — diff ===
@@ -27,9 +27,7 @@ export class StripePaymentGatewayAdapter implements PaymentGatewayPort {
     return this.stripeClient;
   }
 
-  async createPaymentIntent(
-    input: CreatePaymentIntentInput
-  ): Promise<CreatePaymentIntentResult> {
+  async createPaymentIntent(input: CreatePaymentIntentInput): Promise<CreatePaymentIntentResult> {
     const params: Stripe.PaymentIntentCreateParams = {
       amount: input.amountMinor,
       currency: 'brl',
@@ -38,19 +36,13 @@ export class StripePaymentGatewayAdapter implements PaymentGatewayPort {
       },
       description: input.description,
       metadata: input.metadata,
-      ...(input.connectedAccountId
-        ? {
-            transfer_data: {
-              destination: input.connectedAccountId,
-            },
-          }
-        : {}),
+      ...(input.transferGroup ? { transfer_group: input.transferGroup } : {}),
+      // Mantém os métodos dinâmicos (AGENTS.md §8.3) e só tira o Pix quando ele não é aceito.
+      ...(input.paymentMethodTypes.includes('pix')
+        ? {}
+        : { excluded_payment_method_types: ['pix'] }),
     };
 
-    if (input.connectedAccountId && input.applicationFeeMinor > 0) {
-      params.application_fee_amount = input.applicationFeeMinor;
-    }
-
     const paymentIntent = await this.stripe.paymentIntents.create(params, {
       idempotencyKey: input.idempotencyKey,
     });
@@ -67,8 +59,7 @@ export class StripePaymentGatewayAdapter implements PaymentGatewayPort {
   }
 
   async retrievePaymentIntent(paymentIntentId: string) {
-    const paymentIntent =
-      await this.stripe.paymentIntents.retrieve(paymentIntentId);
+    const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);
     return {
       id: paymentIntent.id,
       status: paymentIntent.status,
@@ -87,8 +78,6 @@ export class StripePaymentGatewayAdapter implements PaymentGatewayPort {
               amount: input.amountMinor,
             }
           : {}),
-        reverse_transfer: input.reverseTransfer,
-        refund_application_fee: input.refundApplicationFee,
       },
       {
         idempotencyKey: input.idempotencyKey,
@@ -101,28 +90,20 @@ export class StripePaymentGatewayAdapter implements PaymentGatewayPort {
     };
   }
 
-  constructWebhookEvent(
-    payload: string | Buffer,
-    signature: string
-  ): VerifiedWebhookEvent {
+  constructWebhookEvent(payload: string | Buffer, signature: string): VerifiedWebhookEvent {
     const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
     if (!webhookSecret) {
       throw new Error('STRIPE_WEBHOOK_SECRET não configurada.');
     }
 
-    const event = this.stripe.webhooks.constructEvent(
-      payload,
-      signature,
-      webhookSecret
-    );
+    const event = this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
 
     return {
       id: event.id,
       type: event.type,
       account: event.account,
       created: event.created,
-      dataObject:
-        (event.data?.object as unknown as Record<string, unknown>) || {},
+      dataObject: (event.data?.object as unknown as Record<string, unknown>) || {},
     };
   }

=== server/domain/payment/adapters/stripePayoutTransferAdapter.ts — ARQUIVO NOVO, conteúdo completo ===
import Stripe from 'stripe';
import type { CreatePayoutTransferInput, PayoutTransferPort } from '../ports/payoutTransferPort';

export class StripePayoutTransferAdapter implements PayoutTransferPort {
  private stripeClient: Stripe | null = null;

  private get stripe(): Stripe {
    if (!this.stripeClient) {
      const secretKey = process.env.STRIPE_SECRET_KEY;
      if (!secretKey) throw new Error('STRIPE_SECRET_KEY não configurada.');
      this.stripeClient = new Stripe(secretKey);
    }
    return this.stripeClient;
  }

  async createTransfer(input: CreatePayoutTransferInput): Promise<{ transferId: string }> {
    // `source_transaction` faz a transferência esperar o dinheiro da cobrança ficar disponível.
    // Referência: https://docs.stripe.com/connect/separate-charges-and-transfers#transfer-availability
    const transfer = await this.stripe.transfers.create(
      {
        amount: input.amountMinor,
        currency: 'brl',
        destination: input.destinationAccountId,
        source_transaction: input.sourceChargeId,
        transfer_group: input.transferGroup,
        metadata: input.metadata,
      },
      { idempotencyKey: input.idempotencyKey }
    );
    return { transferId: transfer.id };
  }
}

=== server/domain/payment/factory.ts — diff ===
@@ -1,15 +1,18 @@
 import { FirebaseAdminTransactionAdapter } from './adapters/firebaseAdminTransactionAdapter';
 import { FirestorePaymentAccountAdapter } from './adapters/firestorePaymentAccountAdapter';
+import { FirestorePayoutEntryAdapter } from './adapters/firestorePayoutEntryAdapter';
 import { FirestorePlanSubscriptionAdapter } from './adapters/firestorePlanSubscriptionAdapter';
 import { StripeBillingGatewayAdapter } from './adapters/stripeBillingGatewayAdapter';
 import { StripeConnectMarketplaceAdapter } from './adapters/stripeConnectMarketplaceAdapter';
 import { StripePaymentGatewayAdapter } from './adapters/stripePaymentGatewayAdapter';
+import { StripePayoutTransferAdapter } from './adapters/stripePayoutTransferAdapter';
 import type { MarketplaceAccountPort } from './ports/marketplaceAccountPort';
 import type { PaymentGatewayPort } from './ports/paymentGatewayPort';
 import type { TransactionRepositoryPort } from './ports/transactionRepositoryPort';
 import { BillingService } from './services/billingService';
 import { CheckoutService } from './services/checkoutService';
 import { PaymentAccountService } from './services/paymentAccountService';
+import { PayoutService } from './services/payoutService';
 import { StripePaymentService } from './services/stripePaymentService';
 
 export const paymentGatewayAdapter: PaymentGatewayPort = new StripePaymentGatewayAdapter();
@@ -29,6 +32,12 @@ export const stripePaymentService = new StripePaymentService(
   paymentAccountService
 );
 
+export const payoutService = new PayoutService(
+  new FirestorePayoutEntryAdapter(),
+  new StripePayoutTransferAdapter(),
+  paymentAccountService
+);
+
 export const checkoutService = new CheckoutService(stripePaymentService, transactionRepository);
 
 let billingService: BillingService | null = null;

=== server/domain/payment/index.ts — diff ===
@@ -14,6 +14,11 @@ export { listOwnerPaymentAccountsUseCase } from './usecases/listOwnerPaymentAcco
 export { syncPaymentAccountFromWebhookUseCase } from './usecases/syncPaymentAccountFromWebhookUseCase';
 
 export { createMarketplacePaymentIntentUseCase } from './usecases/createMarketplacePaymentIntentUseCase';
+export { recordSalePayoutUseCase } from './usecases/recordSalePayoutUseCase';
+export { applyPayoutRefundUseCase } from './usecases/applyPayoutRefundUseCase';
+export { holdPayoutForDisputeUseCase } from './usecases/holdPayoutForDisputeUseCase';
+export { closePayoutDisputeUseCase } from './usecases/closePayoutDisputeUseCase';
+export { releaseDuePayoutsUseCase } from './usecases/releaseDuePayoutsUseCase';
 export { getPaymentReferenceUseCase } from './usecases/getPaymentReferenceUseCase';
 export { createBillingPortalSessionUseCase } from './usecases/billing/createBillingPortalSessionUseCase';
 export { getListingPlanSubscriptionUseCase } from './usecases/billing/getListingPlanSubscriptionUseCase';
@@ -39,6 +44,8 @@ export type { PlanSubscriptionRecord } from './ports/planSubscriptionRepositoryP
 
 export type { ConnectedAccountStatus } from './ports/marketplaceAccountPort';
 export type { PaymentAccountView } from './types/paymentAccount';
+export type { PayoutEntry, PayoutEntryStatus } from './types/payoutEntry';
+export type { RecordSaleInput, ReleaseSummary } from './services/payoutService';
 export type { EnsurePaymentAccountInput } from './services/paymentAccountService';
 export type {
   CreatePaymentIntentResult,

=== server/domain/payment/ports/paymentGatewayPort.ts — diff ===
@@ -26,7 +26,8 @@ export interface PaymentTransaction {
   referenceId: string;
   provider: 'stripe';
   providerPaymentId: string;
-  connectedAccountId?: string;
+  /** Índice cego do CNPJ que recebe o repasse (D14). */
+  accountKey?: string;
   amountMinor: number;
   platformFeeMinor: number;
   currency: 'BRL';
@@ -40,8 +41,9 @@ export interface CreatePaymentIntentInput {
   amountMinor: number;
   currency: 'BRL';
   description: string;
-  connectedAccountId?: string;
-  applicationFeeMinor: number;
+  /** Liga a cobrança às transferências do repasse (separate charges and transfers, D14). */
+  transferGroup?: string;
+  /** Métodos aceitos; sem Pix quando o serviço passa de 80 dias (D14). */
   paymentMethodTypes: PaymentMethod[];
   metadata: Record<string, string>;
   idempotencyKey: string;
@@ -56,8 +58,6 @@ export interface CreatePaymentIntentResult {
 export interface RefundPaymentInput {
   paymentIntentId: string;
   amountMinor?: number;
-  reverseTransfer: boolean;
-  refundApplicationFee: boolean;
   idempotencyKey: string;
   metadata?: Record<string, string>;
 }
@@ -76,9 +76,7 @@ export interface VerifiedWebhookEvent {
 }
 
 export interface PaymentGatewayPort {
-  createPaymentIntent(
-    input: CreatePaymentIntentInput
-  ): Promise<CreatePaymentIntentResult>;
+  createPaymentIntent(input: CreatePaymentIntentInput): Promise<CreatePaymentIntentResult>;
   refundPayment(input: RefundPaymentInput): Promise<RefundPaymentResult>;
   retrievePaymentIntent(paymentIntentId: string): Promise<{
     id: string;
@@ -86,8 +84,5 @@ export interface PaymentGatewayPort {
     amountMinor: number;
     metadata: Record<string, string>;
   }>;
-  constructWebhookEvent(
-    payload: string | Buffer,
-    signature: string
-  ): VerifiedWebhookEvent;
+  constructWebhookEvent(payload: string | Buffer, signature: string): VerifiedWebhookEvent;
 }

=== server/domain/payment/ports/payoutEntryRepositoryPort.ts — ARQUIVO NOVO, conteúdo completo ===
import type { PayoutEntry } from '../types/payoutEntry';

export interface PayoutEntryRepositoryPort {
  /** Cria só se ainda não existir; devolve a entrada gravada. */
  createIfAbsent(entry: PayoutEntry): Promise<PayoutEntry>;
  get(id: string): Promise<PayoutEntry | null>;
  getByPaymentIntentId(paymentIntentId: string): Promise<PayoutEntry | null>;
  /** Entradas `pending` com `releaseAt` até `nowIso`, mais antigas primeiro. */
  listDue(nowIso: string, limit: number): Promise<PayoutEntry[]>;
  /** Lê, aplica a mudança e grava na mesma transação; `null` deixa como está. */
  update(
    id: string,
    change: (current: PayoutEntry) => PayoutEntry | null
  ): Promise<PayoutEntry | null>;
}

=== server/domain/payment/ports/payoutTransferPort.ts — ARQUIVO NOVO, conteúdo completo ===
export interface CreatePayoutTransferInput {
  amountMinor: number;
  destinationAccountId: string;
  /** Cobrança de origem: a transferência só executa quando esse dinheiro está disponível. */
  sourceChargeId: string;
  transferGroup: string;
  idempotencyKey: string;
  metadata: Record<string, string>;
}

export interface PayoutTransferPort {
  createTransfer(input: CreatePayoutTransferInput): Promise<{ transferId: string }>;
}

=== server/domain/payment/ports/transactionRepositoryPort.ts — diff ===
@@ -6,7 +6,7 @@ export interface TransactionRecord {
   referenceType?: string;
   referenceId?: string | null;
   providerPaymentId?: string | null;
-  connectedAccountId?: string | null;
+  accountKey?: string | null;
   amount: number | null;
   amountMinor?: number | null;
   platformFeeMinor?: number | null;
@@ -34,7 +34,7 @@ export interface TransactionRepositoryPort {
     referenceType: string;
     referenceId: string;
     providerPaymentId: string;
-    connectedAccountId?: string;
+    accountKey?: string;
     amountMinor: number;
     platformFeeMinor: number;
     paymentMethod: string;

=== server/domain/payment/services/paymentAccountService.ts — diff ===
@@ -47,6 +47,13 @@ export class PaymentAccountService {
     return record;
   }
 
+  /** Conta Stripe que recebe o repasse, ou `null` enquanto o CNPJ não pode receber (D14). */
+  async getPayoutDestination(accountKey: string): Promise<string | null> {
+    // Sem consultar o Stripe a cada entrada: `account.updated` mantém o registro atualizado.
+    const record = await this.repository.get(accountKey);
+    return record?.payoutsEnabled ? record.stripeAccountId : null;
+  }
+
   async syncFromWebhook(stripeAccountId: string): Promise<void> {
     const record = await this.repository.getByStripeAccountId(stripeAccountId);
     if (record) await this.sync(record);

=== server/domain/payment/services/payoutService.test.ts — ARQUIVO NOVO, conteúdo completo ===
import { describe, expect, it, vi } from 'vitest';
import type { PayoutEntryRepositoryPort } from '../ports/payoutEntryRepositoryPort';
import type { PayoutEntry } from '../types/payoutEntry';
import { PayoutService, type RecordSaleInput } from './payoutService';

function memoryRepository(): PayoutEntryRepositoryPort & { rows: Map<string, PayoutEntry> } {
  const rows = new Map<string, PayoutEntry>();
  return {
    rows,
    async createIfAbsent(entry) {
      const existing = rows.get(entry.id);
      if (existing) return existing;
      rows.set(entry.id, entry);
      return entry;
    },
    async get(id) {
      return rows.get(id) ?? null;
    },
    async getByPaymentIntentId(id) {
      return [...rows.values()].find((entry) => entry.paymentIntentId === id) ?? null;
    },
    async listDue(nowIso, limit) {
      return [...rows.values()]
        .filter((entry) => entry.status === 'pending' && entry.releaseAt <= nowIso)
        .slice(0, limit);
    },
    async update(id, change) {
      const current = rows.get(id);
      if (!current) return null;
      const next = change(current);
      if (next) rows.set(id, next);
      return next ?? current;
    },
  };
}

const SALE: RecordSaleInput = {
  referenceType: 'ticket_order',
  referenceId: 'ord_1',
  accountKey: 'key-1',
  paymentIntentId: 'pi_1',
  chargeId: 'ch_1',
  grossMinor: 10600,
  serviceFeeMinor: 600,
  platformFeeMinor: 1000,
  serviceEndsAt: '2026-12-21T03:00:00.000Z',
};

function setup(now = '2026-12-23T04:00:00.000Z', destination: string | null = 'acct_1') {
  const repo = memoryRepository();
  const transfers = { createTransfer: vi.fn().mockResolvedValue({ transferId: 'tr_1' }) };
  const accounts = { getPayoutDestination: vi.fn().mockResolvedValue(destination) };
  const clock = { value: new Date(now) };
  const service = new PayoutService(repo, transfers, accounts, () => clock.value);
  return { repo, transfers, accounts, service, clock };
}

describe('PayoutService (D14)', () => {
  it('registra a venda uma vez, com liberação 48 h depois do fim', async () => {
    const { service, repo } = setup();
    const entry = await service.recordSale(SALE);
    await service.recordSale(SALE);
    expect(repo.rows.size).toBe(1);
    expect(entry).toMatchObject({
      status: 'pending',
      partnerAmountMinor: 9000,
      releaseAt: '2026-12-23T03:00:00.000Z',
    });
  });

  it('não libera antes do prazo; depois transfere com a cobrança de origem e idempotência', async () => {
    const { service, transfers, clock } = setup('2026-12-23T02:00:00.000Z');
    await service.recordSale(SALE);
    expect(await service.releaseDue()).toEqual({ released: 0, waitingAccount: 0, failed: 0 });
    clock.value = new Date('2026-12-23T04:00:00.000Z');
    expect((await service.releaseDue()).released).toBe(1);
    expect(transfers.createTransfer).toHaveBeenCalledWith(
      expect.objectContaining({
        amountMinor: 9000,
        destinationAccountId: 'acct_1',
        sourceChargeId: 'ch_1',
        idempotencyKey: 'tr_po_ticket_order_ord_1',
      })
    );
    expect((await service.releaseDue()).released).toBe(0);
  });

  it('conta sem repasses habilitados: a entrada espera', async () => {
    const { service, transfers } = setup(undefined, null);
    await service.recordSale(SALE);
    expect(await service.releaseDue()).toEqual({ released: 0, waitingAccount: 1, failed: 0 });
    expect(transfers.createTransfer).not.toHaveBeenCalled();
  });

  it('reembolso antes do repasse recalcula a parte do proprietário e conta uma vez', async () => {
    const { service, repo } = setup();
    await service.recordSale(SALE);
    const refund = { ...SALE, refundKey: 'ref_1', amountMinor: 5300, serviceFeeMinor: 300 };
    await service.applyRefund(refund);
    await service.applyRefund(refund);
    expect(repo.rows.get('po_ticket_order_ord_1')?.partnerAmountMinor).toBe(4500);
    await service.applyRefund({ ...refund, refundKey: 'ref_2' });
    expect(repo.rows.get('po_ticket_order_ord_1')).toMatchObject({
      status: 'canceled',
      canceledReason: 'fully_refunded',
      partnerAmountMinor: 0,
    });
  });

  it('contestação segura o repasse; ganha volta à fila, perdida cancela', async () => {
    const { service, repo } = setup();
    await service.recordSale(SALE);
    await service.holdForDispute('pi_1');
    expect((await service.releaseDue()).released).toBe(0);
    await service.closeDispute('pi_1', true);
    expect(repo.rows.get('po_ticket_order_ord_1')?.status).toBe('pending');
    await service.holdForDispute('pi_1');
    await service.closeDispute('pi_1', false);
    expect(repo.rows.get('po_ticket_order_ord_1')).toMatchObject({
      status: 'canceled',
      canceledReason: 'dispute_lost',
    });
  });
});

=== server/domain/payment/services/payoutService.ts — ARQUIVO NOVO, conteúdo completo ===
import type { PayoutEntryRepositoryPort } from '../ports/payoutEntryRepositoryPort';
import type { PayoutTransferPort } from '../ports/payoutTransferPort';
import type { PayoutEntry } from '../types/payoutEntry';
import { computeReleaseAt, partnerAmountAfterRefunds } from '../utils/payoutRules';

export interface RecordSaleInput {
  referenceType: string;
  referenceId: string;
  accountKey: string;
  paymentIntentId: string;
  chargeId: string;
  grossMinor: number;
  serviceFeeMinor: number;
  platformFeeMinor: number;
  serviceEndsAt: string;
}

export interface ReleaseSummary {
  released: number;
  /** Conta do CNPJ ainda sem repasses habilitados: a entrada espera a próxima rodada. */
  waitingAccount: number;
  failed: number;
}

/** Consulta só o que o repasse precisa da conta do CNPJ (evita depender do serviço inteiro). */
export interface PayoutDestinationLookup {
  getPayoutDestination(accountKey: string): Promise<string | null>;
}

function entryIdFor(referenceType: string, referenceId: string): string {
  return `po_${referenceType}_${referenceId}`;
}

/** Repasses por venda (D14): retidos até o fim do serviço + 48 h e transferidos pelo job. */
export class PayoutService {
  constructor(
    private readonly entries: PayoutEntryRepositoryPort,
    private readonly transfers: PayoutTransferPort,
    private readonly accounts: PayoutDestinationLookup,
    private readonly now: () => Date = () => new Date()
  ) {}

  /** Chamado pelo webhook de pagamento confirmado; repetir não cria outra entrada. */
  async recordSale(input: RecordSaleInput): Promise<PayoutEntry> {
    const nowIso = this.now().toISOString();
    const amounts = partnerAmountAfterRefunds({ ...input, refundedServiceMinor: 0 });
    return this.entries.createIfAbsent({
      id: entryIdFor(input.referenceType, input.referenceId),
      referenceType: input.referenceType,
      referenceId: input.referenceId,
      accountKey: input.accountKey,
      paymentIntentId: input.paymentIntentId,
      chargeId: input.chargeId,
      grossMinor: input.grossMinor,
      serviceFeeMinor: input.serviceFeeMinor,
      platformFeeMinor: input.platformFeeMinor,
      partnerAmountMinor: amounts.partnerAmountMinor,
      serviceEndsAt: input.serviceEndsAt,
      releaseAt: computeReleaseAt(input.serviceEndsAt),
      status: 'pending',
      refunds: {},
      createdAt: nowIso,
      updatedAt: nowIso,
    });
  }

  /**
   * Desconta um reembolso concluído antes do repasse. A chave identifica o reembolso: o mesmo reembolso
   * chega pela resposta do Stripe e pelo webhook, e só conta uma vez.
   */
  async applyRefund(params: {
    referenceType: string;
    referenceId: string;
    refundKey: string;
    amountMinor: number;
    serviceFeeMinor: number;
  }): Promise<PayoutEntry | null> {
    const id = entryIdFor(params.referenceType, params.referenceId);
    return this.entries.update(id, (entry) => {
      if (entry.refunds[params.refundKey] || entry.status === 'released') return null;
      const refunds = {
        ...entry.refunds,
        [params.refundKey]: {
          amountMinor: params.amountMinor,
          serviceFeeMinor: Math.min(params.serviceFeeMinor, params.amountMinor),
          at: this.now().toISOString(),
        },
      };
      const refundedMinor = Object.values(refunds).reduce((sum, r) => sum + r.amountMinor, 0);
      const refundedServiceMinor = Object.values(refunds).reduce(
        (sum, r) => sum + (r.amountMinor - r.serviceFeeMinor),
        0
      );
      const { partnerAmountMinor } = partnerAmountAfterRefunds({ ...entry, refundedServiceMinor });
      const fullyRefunded = refundedMinor >= entry.grossMinor;
      return {
        ...entry,
        refunds,
        partnerAmountMinor,
        ...(fullyRefunded
          ? { status: 'canceled' as const, canceledReason: 'fully_refunded' as const }
          : {}),
        updatedAt: this.now().toISOString(),
      };
    });
  }

  /** Contestação aberta: o repasse espera a decisão (D14). */
  async holdForDispute(paymentIntentId: string): Promise<PayoutEntry | null> {
    const entry = await this.entries.getByPaymentIntentId(paymentIntentId);
    if (!entry) return null;
    return this.entries.update(entry.id, (current) =>
      current.status === 'pending'
        ? {
            ...current,
            status: 'on_hold',
            holdReason: 'dispute',
            updatedAt: this.now().toISOString(),
          }
        : null
    );
  }

  /** Contestação encerrada: ganha, o repasse volta à fila; perdida, o proprietário não recebe a venda. */
  async closeDispute(paymentIntentId: string, won: boolean): Promise<PayoutEntry | null> {
    const entry = await this.entries.getByPaymentIntentId(paymentIntentId);
    if (!entry) return null;
    return this.entries.update(entry.id, (current) => {
      if (current.status !== 'on_hold' || current.holdReason !== 'dispute') return null;
      const { holdReason: _released, ...rest } = current;
      return won
        ? { ...rest, status: 'pending', updatedAt: this.now().toISOString() }
        : {
            ...rest,
            status: 'canceled',
            canceledReason: 'dispute_lost',
            partnerAmountMinor: 0,
            updatedAt: this.now().toISOString(),
          };
    });
  }

  /** Job de hora em hora: idempotente, pode rodar de novo sem transferir duas vezes. */
  async releaseDue(limit = 200): Promise<ReleaseSummary> {
    const summary: ReleaseSummary = { released: 0, waitingAccount: 0, failed: 0 };
    const due = await this.entries.listDue(this.now().toISOString(), limit);
    for (const entry of due) {
      try {
        const destination = await this.accounts.getPayoutDestination(entry.accountKey);
        if (!destination) {
          summary.waitingAccount += 1;
          continue;
        }
        const transfer =
          entry.partnerAmountMinor > 0
            ? await this.transfers.createTransfer({
                amountMinor: entry.partnerAmountMinor,
                destinationAccountId: destination,
                sourceChargeId: entry.chargeId,
                transferGroup: entry.referenceId,
                // Mesma chave em toda rodada: o Stripe devolve a transferência já criada.
                idempotencyKey: `tr_${entry.id}`,
                metadata: {
                  referenceType: entry.referenceType,
                  referenceId: entry.referenceId,
                  payoutEntryId: entry.id,
                },
              })
            : null;
        await this.entries.update(entry.id, (current) =>
          current.status === 'pending'
            ? {
                ...current,
                status: 'released',
                ...(transfer ? { transferId: transfer.transferId } : {}),
                releasedAt: this.now().toISOString(),
                updatedAt: this.now().toISOString(),
              }
            : null
        );
        summary.released += 1;
      } catch (error) {
        // Uma entrada com problema não pode travar as outras; a próxima rodada tenta de novo.
        summary.failed += 1;
        console.error('[PayoutService.releaseDue]', {
          entryId: entry.id,
          name: error instanceof Error ? error.name : 'UnknownError',
        });
      }
    }
    return summary;
  }
}

=== server/domain/payment/services/stripePaymentService.marketplace.test.ts — diff ===
@@ -3,6 +3,8 @@ import type { PaymentGatewayPort } from '../ports/paymentGatewayPort';
 import type { TransactionRepositoryPort } from '../ports/transactionRepositoryPort';
 import { StripePaymentService } from './stripePaymentService';
 
+const NOW = new Date('2026-10-25T12:00:00.000Z');
+
 function setup(existingTx: unknown = null) {
   const gateway = {
     createPaymentIntent: vi.fn().mockResolvedValue({
@@ -22,7 +24,7 @@ function setup(existingTx: unknown = null) {
       .mockResolvedValue({ id: 'pi_1', referenceType: 'booking', referenceId: 'bk_1' }),
   } as unknown as TransactionRepositoryPort;
   return {
-    service: new StripePaymentService(gateway, repo, accounts),
+    service: new StripePaymentService(gateway, repo, accounts, () => NOW),
     gateway,
     repo,
     accounts,
@@ -36,25 +38,33 @@ const PARAMS = {
   sellerPartnerId: 'p1',
   sellerAccountKey: 'key-cnpj-1',
   description: 'Use Guide — Passeio',
+  serviceStartsAt: '2026-11-10T12:00:00.000Z',
   totalMinor: 20000,
   platformFeeMinor: 2000,
   idempotencyKey: 'pi_booking_bk_1',
 };
 
 describe('StripePaymentService — vendas de marketplace', () => {
-  it('cria destination charge para a conta do CNPJ, com taxa e metadata só com IDs', async () => {
+  it('cobra na plataforma, sem destino, com o grupo do repasse e metadata só com IDs (D14)', async () => {
     const { service, gateway, repo, accounts } = setup();
     const result = await service.createMarketplacePaymentIntent(PARAMS);
     expect(accounts.assertReady).toHaveBeenCalledWith('key-cnpj-1');
     expect(gateway.createPaymentIntent).toHaveBeenCalledWith(
       expect.objectContaining({
         amountMinor: 20000,
-        applicationFeeMinor: 2000,
-        connectedAccountId: 'acct_1',
+        transferGroup: 'bk_1',
+        paymentMethodTypes: ['card', 'pix'],
         idempotencyKey: 'pi_booking_bk_1',
-        metadata: { referenceType: 'booking', referenceId: 'bk_1', partnerId: 'p1' },
+        metadata: {
+          referenceType: 'booking',
+          referenceId: 'bk_1',
+          partnerId: 'p1',
+          accountKey: 'key-cnpj-1',
+        },
       })
     );
+    const call = vi.mocked(gateway.createPaymentIntent).mock.calls[0]?.[0];
+    expect(call).not.toHaveProperty('connectedAccountId');
     expect(repo.saveTransactionRecord).toHaveBeenCalledWith(
       expect.objectContaining({ referenceType: 'booking', referenceId: 'bk_1' })
     );
@@ -84,6 +94,7 @@ describe('StripePaymentService — vendas de marketplace', () => {
       eventListingId: 'event-1',
       occurrenceId: 'occ-1',
       eventTitle: 'Show',
+      serviceStartsAt: '2027-03-01T22:00:00.000Z',
       totalMinor: 5000,
       platformFeeMinor: 500,
       idempotencyKey: 'pi_order_order-1',
@@ -91,6 +102,8 @@ describe('StripePaymentService — vendas de marketplace', () => {
     expect(gateway.createPaymentIntent).toHaveBeenCalledWith(
       expect.objectContaining({
         description: 'Use Guide — Show',
+        // Mais de 80 dias até o evento: sem Pix (o reembolso de Pix só vale até 90 dias).
+        paymentMethodTypes: ['card'],
         metadata: {
           referenceType: 'ticket_order',
           referenceId: 'order-1',
@@ -99,6 +112,7 @@ describe('StripePaymentService — vendas de marketplace', () => {
           eventListingId: 'event-1',
           occurrenceId: 'occ-1',
           partnerId: 'p1',
+          accountKey: 'key-cnpj-1',
         },
       })
     );

=== server/domain/payment/services/stripePaymentService.ts — diff ===
@@ -5,6 +5,7 @@ import type {
   VerifiedWebhookEvent,
 } from '../ports/paymentGatewayPort';
 import type { TransactionRepositoryPort } from '../ports/transactionRepositoryPort';
+import { paymentMethodsForService } from '../utils/payoutRules';
 import type { PaymentAccountService } from './paymentAccountService';
 
 export class PaymentDomainError extends Error {
@@ -22,7 +23,8 @@ export class StripePaymentService {
   constructor(
     private readonly paymentGateway: PaymentGatewayPort,
     private readonly transactionRepo: TransactionRepositoryPort,
-    private readonly paymentAccounts: Pick<PaymentAccountService, 'assertReady'>
+    private readonly paymentAccounts: Pick<PaymentAccountService, 'assertReady'>,
+    private readonly now: () => Date = () => new Date()
   ) {}
 
   async createTicketOrderPaymentIntent(params: {
@@ -33,17 +35,19 @@ export class StripePaymentService {
     eventListingId: string;
     occurrenceId: string;
     eventTitle: string;
+    serviceStartsAt: string;
     totalMinor: number;
     platformFeeMinor: number;
     idempotencyKey: string;
   }): Promise<CreatePaymentIntentResult & { transactionId: string }> {
-    return this.createDestinationChargeIntent({
+    return this.createPlatformChargeIntent({
       referenceType: 'ticket_order',
       referenceId: params.orderId,
       buyerId: params.buyerId,
       sellerPartnerId: params.sellerPartnerId,
       sellerAccountKey: params.sellerAccountKey,
       description: `Use Guide — ${params.eventTitle}`,
+      serviceStartsAt: params.serviceStartsAt,
       totalMinor: params.totalMinor,
       platformFeeMinor: params.platformFeeMinor,
       idempotencyKey: params.idempotencyKey,
@@ -56,7 +60,7 @@ export class StripePaymentService {
     });
   }
 
-  /** Venda de marketplace genérica (destination charge, decisão D1); o chamador define a referência. */
+  /** Venda de marketplace genérica (cobrança na plataforma, D1 e D14); o chamador define a referência. */
   async createMarketplacePaymentIntent(params: {
     referenceType: string;
     referenceId: string;
@@ -64,11 +68,12 @@ export class StripePaymentService {
     sellerPartnerId: string;
     sellerAccountKey: string;
     description: string;
+    serviceStartsAt: string;
     totalMinor: number;
     platformFeeMinor: number;
     idempotencyKey: string;
   }): Promise<CreatePaymentIntentResult & { transactionId: string }> {
-    return this.createDestinationChargeIntent({ ...params, extraMetadata: {} });
+    return this.createPlatformChargeIntent({ ...params, extraMetadata: {} });
   }
 
   /** Referência gravada na criação do pagamento (o objeto Dispute do Stripe não traz a metadata). */
@@ -80,7 +85,11 @@ export class StripePaymentService {
     return { referenceType: record.referenceType, referenceId: record.referenceId };
   }
 
-  private async createDestinationChargeIntent(params: {
+  /**
+   * Cobrança na plataforma, sem destino: o dinheiro fica no saldo do Use Guide e vai ao CNPJ pelo repasse,
+   * 48 h depois do fim do serviço (separate charges and transfers, D14).
+   */
+  private async createPlatformChargeIntent(params: {
     referenceType: string;
     referenceId: string;
     buyerId: string;
@@ -88,6 +97,7 @@ export class StripePaymentService {
     /** Conta Stripe do CNPJ do estabelecimento que vende (D14). */
     sellerAccountKey: string;
     description: string;
+    serviceStartsAt: string;
     totalMinor: number;
     platformFeeMinor: number;
     idempotencyKey: string;
@@ -109,21 +119,22 @@ export class StripePaymentService {
       };
     }
 
-    const sellerAccount = await this.paymentAccounts.assertReady(params.sellerAccountKey);
+    // Antes de cobrar, a conta do CNPJ precisa estar habilitada (AGENTS.md §8.1).
+    await this.paymentAccounts.assertReady(params.sellerAccountKey);
 
     const result = await this.paymentGateway.createPaymentIntent({
       orderId: params.referenceId,
       amountMinor: params.totalMinor,
       currency: 'BRL',
       description: params.description,
-      connectedAccountId: sellerAccount.stripeAccountId,
-      applicationFeeMinor: params.platformFeeMinor,
-      paymentMethodTypes: ['card', 'pix'],
+      transferGroup: params.referenceId,
+      paymentMethodTypes: paymentMethodsForService(params.serviceStartsAt, this.now()),
       metadata: {
         referenceType: params.referenceType,
         referenceId: params.referenceId,
         ...params.extraMetadata,
         partnerId: params.sellerPartnerId,
+        accountKey: params.sellerAccountKey,
       },
       idempotencyKey: params.idempotencyKey,
     });
@@ -135,7 +146,7 @@ export class StripePaymentService {
       referenceType: params.referenceType,
       referenceId: params.referenceId,
       providerPaymentId: result.paymentIntentId,
-      connectedAccountId: sellerAccount.stripeAccountId,
+      accountKey: params.sellerAccountKey,
       amountMinor: params.totalMinor,
       platformFeeMinor: params.platformFeeMinor,
       paymentMethod: 'stripe_payment_element',
@@ -184,7 +195,6 @@ export class StripePaymentService {
       amountMinor: params.amountMinor,
       currency: 'BRL',
       description: `Use Guide — Plano ${params.planName}`,
-      applicationFeeMinor: 0,
       paymentMethodTypes: ['card', 'pix'],
       metadata: {
         referenceType: 'plan_payment',
@@ -223,16 +233,12 @@ export class StripePaymentService {
   async refundPayment(params: {
     paymentIntentId: string;
     amountMinor?: number;
-    reverseTransfer?: boolean;
-    refundApplicationFee?: boolean;
     idempotencyKey: string;
     metadata?: Record<string, string>;
   }): Promise<RefundPaymentResult> {
     return this.paymentGateway.refundPayment({
       paymentIntentId: params.paymentIntentId,
       amountMinor: params.amountMinor,
-      reverseTransfer: params.reverseTransfer ?? true,
-      refundApplicationFee: params.refundApplicationFee ?? true,
       idempotencyKey: params.idempotencyKey,
       metadata: params.metadata,
     });

=== server/domain/payment/types/payoutEntry.ts — ARQUIVO NOVO, conteúdo completo ===
/**
 * `payoutEntries/{id}`: repasse de uma venda à conta do CNPJ (D14). O dinheiro fica no saldo da plataforma
 * até `releaseAt` (fim do serviço + 48 h) e só então vira transferência. Classe interna (financeiro).
 */
export type PayoutEntryStatus = 'pending' | 'on_hold' | 'released' | 'canceled';

export type PayoutHoldReason = 'dispute';

export interface PayoutRefundApplied {
  amountMinor: number;
  /** Parte do reembolso que era taxa de serviço (fica fora do valor do proprietário). */
  serviceFeeMinor: number;
  at: string;
}

export interface PayoutEntry {
  id: string;
  /** Quem vendeu o quê ('ticket_order', 'booking'); o payment não interpreta o valor. */
  referenceType: string;
  referenceId: string;
  accountKey: string;
  paymentIntentId: string;
  chargeId: string;
  grossMinor: number;
  serviceFeeMinor: number;
  /** Taxa da plataforma sobre o valor do serviço, sem a taxa de serviço, na compra. */
  platformFeeMinor: number;
  partnerAmountMinor: number;
  serviceEndsAt: string;
  releaseAt: string;
  status: PayoutEntryStatus;
  holdReason?: PayoutHoldReason;
  /** Reembolsos já descontados, por chave do reembolso: repetir o mesmo não desconta de novo. */
  refunds: Record<string, PayoutRefundApplied>;
  transferId?: string;
  releasedAt?: string;
  canceledReason?: 'fully_refunded' | 'dispute_lost';
  createdAt: string;
  updatedAt: string;
}

=== server/domain/payment/usecases/applyPayoutRefundUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { payoutService } from '../factory';
import type { PayoutEntry } from '../types/payoutEntry';

/** Desconta do repasse um reembolso concluído; a mesma `refundKey` só conta uma vez. */
export function applyPayoutRefundUseCase(params: {
  referenceType: string;
  referenceId: string;
  refundKey: string;
  amountMinor: number;
  serviceFeeMinor: number;
}): Promise<PayoutEntry | null> {
  return payoutService.applyRefund(params);
}

=== server/domain/payment/usecases/closePayoutDisputeUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { payoutService } from '../factory';
import type { PayoutEntry } from '../types/payoutEntry';

export function closePayoutDisputeUseCase(
  paymentIntentId: string,
  won: boolean
): Promise<PayoutEntry | null> {
  return payoutService.closeDispute(paymentIntentId, won);
}

=== server/domain/payment/usecases/createMarketplacePaymentIntentUseCase.ts — ARQUIVO REESCRITO, substitua todo o conteúdo por este ===
import { stripePaymentService } from '../factory';
import type { CreatePaymentIntentResult } from '../ports/paymentGatewayPort';

/**
 * Cobrança na plataforma para qualquer venda de parceiro (D14); `referenceType`/`referenceId` vão na metadata.
 * `serviceStartsAt` decide se o Pix é oferecido.
 */
export async function createMarketplacePaymentIntentUseCase(params: {
  referenceType: string;
  referenceId: string;
  buyerId: string;
  sellerPartnerId: string;
  sellerAccountKey: string;
  description: string;
  serviceStartsAt: string;
  totalMinor: number;
  platformFeeMinor: number;
  idempotencyKey: string;
}): Promise<CreatePaymentIntentResult & { transactionId: string }> {
  return stripePaymentService.createMarketplacePaymentIntent(params);
}

=== server/domain/payment/usecases/createPaymentForTicketOrderUseCase.ts — diff ===
@@ -9,6 +9,7 @@ export async function createPaymentForTicketOrderUseCase(params: {
   eventListingId: string;
   occurrenceId: string;
   eventTitle: string;
+  serviceStartsAt: string;
   totalMinor: number;
   platformFeeMinor: number;
   idempotencyKey: string;

=== server/domain/payment/usecases/holdPayoutForDisputeUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { payoutService } from '../factory';
import type { PayoutEntry } from '../types/payoutEntry';

export function holdPayoutForDisputeUseCase(paymentIntentId: string): Promise<PayoutEntry | null> {
  return payoutService.holdForDispute(paymentIntentId);
}

=== server/domain/payment/usecases/processProviderRefundUseCase.ts — diff ===
@@ -4,8 +4,6 @@ import type { RefundPaymentResult } from '../ports/paymentGatewayPort';
 export async function processProviderRefundUseCase(params: {
   paymentIntentId: string;
   amountMinor?: number;
-  reverseTransfer?: boolean;
-  refundApplicationFee?: boolean;
   idempotencyKey: string;
   metadata?: Record<string, string>;
 }): Promise<RefundPaymentResult> {

=== server/domain/payment/usecases/recordSalePayoutUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { payoutService } from '../factory';
import type { RecordSaleInput } from '../services/payoutService';
import type { PayoutEntry } from '../types/payoutEntry';

/** Registra o repasse pendente de uma venda paga (D14); repetir não cria outro. */
export function recordSalePayoutUseCase(input: RecordSaleInput): Promise<PayoutEntry> {
  return payoutService.recordSale(input);
}

=== server/domain/payment/usecases/releaseDuePayoutsUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { payoutService } from '../factory';
import type { ReleaseSummary } from '../services/payoutService';

/** Job de hora em hora (D14): transfere os repasses vencidos. */
export function releaseDuePayoutsUseCase(limit = 200): Promise<ReleaseSummary> {
  return payoutService.releaseDue(limit);
}

=== server/domain/payment/utils/payoutRules.test.ts — ARQUIVO NOVO, conteúdo completo ===
import { describe, expect, it } from 'vitest';
import {
  computeReleaseAt,
  partnerAmountAfterRefunds,
  paymentMethodsForService,
} from './payoutRules';

describe('regras do repasse (D14)', () => {
  it('libera 48 h depois do fim do serviço', () => {
    expect(computeReleaseAt('2026-12-20T03:00:00.000Z')).toBe('2026-12-22T03:00:00.000Z');
  });

  it('Pix só para serviço até 80 dias depois da compra', () => {
    const now = new Date('2026-10-25T12:00:00.000Z');
    expect(paymentMethodsForService('2027-01-13T12:00:00.000Z', now)).toEqual(['card', 'pix']);
    expect(paymentMethodsForService('2027-01-14T12:00:00.000Z', now)).toEqual(['card']);
  });

  it('sem reembolso o proprietário fica com o valor do serviço menos a taxa', () => {
    // 2 ingressos de R$ 50 + R$ 6 de taxa de serviço; taxa da plataforma de 10% = R$ 10.
    expect(
      partnerAmountAfterRefunds({
        grossMinor: 10600,
        serviceFeeMinor: 600,
        platformFeeMinor: 1000,
        refundedServiceMinor: 0,
      })
    ).toEqual({ platformFeeMinor: 1000, partnerAmountMinor: 9000 });
  });

  it('reembolso parcial: a taxa incide sobre o que o proprietário fica, para baixo', () => {
    expect(
      partnerAmountAfterRefunds({
        grossMinor: 10600,
        serviceFeeMinor: 600,
        platformFeeMinor: 1000,
        refundedServiceMinor: 3333,
      })
    ).toEqual({ platformFeeMinor: 666, partnerAmountMinor: 6001 });
    expect(
      partnerAmountAfterRefunds({
        grossMinor: 10600,
        serviceFeeMinor: 600,
        platformFeeMinor: 1000,
        refundedServiceMinor: 10000,
      })
    ).toEqual({ platformFeeMinor: 0, partnerAmountMinor: 0 });
  });
});

=== server/domain/payment/utils/payoutRules.ts — ARQUIVO NOVO, conteúdo completo ===
import type { PaymentMethod } from '../ports/paymentGatewayPort';

const HOUR_MS = 60 * 60 * 1000;

/** Janela de reclamação depois do fim do serviço, antes do repasse (D14). */
export const PAYOUT_CLAIM_WINDOW_HOURS = 48;

/** Pix só quando o serviço acontece até 80 dias depois da compra: o reembolso de Pix vale até 90 dias (D14). */
export const PIX_MAX_DAYS_BEFORE_SERVICE = 80;

export function computeReleaseAt(serviceEndsAt: string): string {
  return new Date(
    new Date(serviceEndsAt).getTime() + PAYOUT_CLAIM_WINDOW_HOURS * HOUR_MS
  ).toISOString();
}

export function paymentMethodsForService(serviceStartsAt: string, now: Date): PaymentMethod[] {
  const days = (new Date(serviceStartsAt).getTime() - now.getTime()) / (24 * HOUR_MS);
  return days <= PIX_MAX_DAYS_BEFORE_SERVICE ? ['card', 'pix'] : ['card'];
}

/**
 * Quanto o proprietário recebe depois dos reembolsos: a taxa da plataforma incide sobre o valor que ele
 * fica (D14), na mesma proporção da compra, arredondada para baixo a favor dele.
 */
export function partnerAmountAfterRefunds(params: {
  grossMinor: number;
  serviceFeeMinor: number;
  platformFeeMinor: number;
  refundedServiceMinor: number;
}): { platformFeeMinor: number; partnerAmountMinor: number } {
  const serviceValueMinor = Math.max(0, params.grossMinor - params.serviceFeeMinor);
  const keptMinor = Math.max(0, serviceValueMinor - params.refundedServiceMinor);
  if (serviceValueMinor === 0 || keptMinor === 0) {
    return { platformFeeMinor: 0, partnerAmountMinor: 0 };
  }
  const platformFeeMinor = Math.floor((params.platformFeeMinor * keptMinor) / serviceValueMinor);
  return { platformFeeMinor, partnerAmountMinor: keptMinor - platformFeeMinor };
}

=== server/domain/ticketing/adapters/firestoreRefundStore.ts — diff ===
@@ -18,6 +18,7 @@ export class FirestoreRefundStore {
     orderId: string;
     ticketId?: string;
     amountMinor: number;
+    serviceFeeMinor: number;
     requestedBy: Refund['requestedBy'];
     reason: string;
     idempotencyKey: string;
@@ -90,6 +91,7 @@ export class FirestoreRefundStore {
         eventListingId: order.eventListingId,
         ...(params.ticketId ? { ticketId: params.ticketId } : {}),
         amountMinor: params.amountMinor,
+        serviceFeeMinor: params.serviceFeeMinor,
         requestedBy: params.requestedBy,
         reason: params.reason,
         status: initialStatus,

=== server/domain/ticketing/dtos/ticketingPersistenceMappers.ts — diff ===
@@ -265,6 +265,8 @@ export class RefundPersistenceMapper {
       orderId: String(raw.orderId || ''),
       ticketId: typeof raw.ticketId === 'string' ? raw.ticketId : undefined,
       amountMinor: typeof raw.amountMinor === 'number' ? Math.trunc(raw.amountMinor) : 0,
+      serviceFeeMinor:
+        typeof raw.serviceFeeMinor === 'number' ? Math.trunc(raw.serviceFeeMinor) : 0,
       requestedBy:
         raw.requestedBy === 'partner' || raw.requestedBy === 'admin' || raw.requestedBy === 'system'
           ? raw.requestedBy

=== server/domain/ticketing/ports/ticketingPort.ts — diff ===
@@ -171,6 +171,7 @@ export interface TicketingPort {
     orderId: string;
     ticketId?: string;
     amountMinor: number;
+    serviceFeeMinor: number;
     requestedBy: Refund['requestedBy'];
     reason: string;
     idempotencyKey: string;

=== server/domain/ticketing/services/ticketRefundService.ts — diff ===
@@ -17,7 +17,12 @@ import { getAuditActorType, isActorAdmin, type TicketingActorContext } from './t
  * Cancelamento pelo próprio comprador (D14): arrependimento de 7 dias até 48 h antes do início, ou a política
  * gravada no pedido. A taxa de serviço só volta no arrependimento.
  */
-function buyerSelfServiceRefundMinor(order: TicketOrder, startsAt: string | undefined): number {
+interface RefundAmount {
+  amountMinor: number;
+  serviceFeeMinor: number;
+}
+
+function buyerSelfServiceRefund(order: TicketOrder, startsAt: string | undefined): RefundAmount {
   if (!startsAt) {
     throw new RefundNotAllowedError('Sessão do evento não encontrada para calcular o reembolso.');
   }
@@ -36,7 +41,7 @@ function buyerSelfServiceRefundMinor(order: TicketOrder, startsAt: string | unde
       'Pela política deste evento, o cancelamento agora não tem reembolso.'
     );
   }
-  return amountMinor;
+  return { amountMinor, serviceFeeMinor: refund.serviceFeeRefundMinor };
 }
 
 /** Reembolso pedido pelo comprador e conclusão pelo webhook. */
@@ -87,12 +92,12 @@ export class TicketRefundService {
       occurrence?.status === 'postponed' ||
       params.isEventCanceledByOrganizer === true;
 
-    const amountMinor = params.ticketId
-      ? await this.ticketRefundMinor(order, params.ticketId)
+    const { amountMinor, serviceFeeMinor } = params.ticketId
+      ? await this.ticketRefund(order, params.ticketId)
       : !isAdmin && !isPartnerOwner && !occurrenceCanceledOrPostponed
-        ? buyerSelfServiceRefundMinor(order, occurrence?.startsAt)
+        ? buyerSelfServiceRefund(order, occurrence?.startsAt)
         : // Cancelamento pelo organizador (ou pelo admin): reembolso integral, com a taxa de serviço (D14).
-          order.totalMinor;
+          { amountMinor: order.totalMinor, serviceFeeMinor: order.serviceFeeMinor };
 
     const requestedBy: Refund['requestedBy'] = isAdmin
       ? 'admin'
@@ -104,6 +109,7 @@ export class TicketRefundService {
       orderId: order.id,
       ticketId: params.ticketId,
       amountMinor,
+      serviceFeeMinor,
       requestedBy,
       reason: params.reason.trim(),
       idempotencyKey: params.idempotencyKey,
@@ -129,7 +135,7 @@ export class TicketRefundService {
   }
 
   /** Ingresso avulso (só organizador ou admin): o que foi pago por ele, com a parte da taxa de serviço. */
-  private async ticketRefundMinor(order: TicketOrder, ticketId: string): Promise<number> {
+  private async ticketRefund(order: TicketOrder, ticketId: string): Promise<RefundAmount> {
     const ticket = await this.port.getTicketById(ticketId);
     if (!ticket || ticket.orderId !== order.id) {
       throw new TicketingDomainError('NOT_FOUND', 'Ingresso não pertence a este pedido.');
@@ -143,7 +149,8 @@ export class TicketRefundService {
     }
     const paidMinor =
       ticket.ticketTypeSnapshot?.effectivePaidMinor ?? Math.floor(item.totalMinor / item.quantity);
-    return paidMinor + Math.floor(item.allocatedServiceFeeMinor / item.quantity);
+    const serviceFeeMinor = Math.floor(item.allocatedServiceFeeMinor / item.quantity);
+    return { amountMinor: paidMinor + serviceFeeMinor, serviceFeeMinor };
   }
 
   async finalizeRefundStatus(

=== server/domain/ticketing/types/ticketingTypes.ts — diff ===
@@ -196,6 +196,8 @@ export interface Refund {
   orderId: string;
   ticketId?: string;
   amountMinor: MoneyMinor;
+  /** Parte do reembolso que é taxa de serviço; o resto sai do valor do proprietário (D14). */
+  serviceFeeMinor: MoneyMinor;
   requestedBy: 'buyer' | 'partner' | 'admin' | 'system';
   reason: string;
   status: RefundStatus;

=== server/interfaces/http/payouts/internalPayoutsController.ts — ARQUIVO NOVO, conteúdo completo ===
import type { Request, Response } from 'express';
import { releaseDuePayoutsUseCase } from '../../../domain/payment';

/** Jobs internos do repasse (Cloud Scheduler, `X-Internal-Job-Key`). */
export class InternalPayoutsController {
  static async release(_req: Request, res: Response): Promise<Response> {
    try {
      return res.status(200).json({ data: await releaseDuePayoutsUseCase(200) });
    } catch (error) {
      console.error('[InternalPayoutsController.release]', {
        name: error instanceof Error ? error.name : 'UnknownError',
      });
      // 500 de propósito: o Scheduler registra a falha e a próxima rodada tenta de novo.
      return res
        .status(500)
        .json({ error: { code: 'PAYOUT_RELEASE_FAILED', message: 'Falha ao liberar repasses.' } });
    }
  }
}

VERIFICAÇÃO (obrigatória):
- `npm run typecheck`, `npx biome lint .` (0 erros; arquivos tocados sem avisos), `npm run build`;
- `npm run test:rules` (firestore.rules mudou);
- testes ligados aos arquivos deste prompt: `npx vitest related --run firestore.rules.security.test.ts server.ts server/application/usecases/bookings/bookingApplicationUseCases.test.ts server/application/usecases/bookings/cancelBookingByBuyerApplicationUseCase.ts server/application/usecases/bookings/cancelSlotByPartnerApplicationUseCase.ts server/application/usecases/bookings/createBookingApplicationUseCase.ts server/application/usecases/bookings/reconcileBookingWebhookApplicationUseCase.test.ts server/application/usecases/bookings/reconcileBookingWebhookApplicationUseCase.ts server/application/usecases/createTicketOrderPaymentIntentApplicationUseCase.ts server/application/usecases/eventLifecycleOrchestration.test.ts server/application/usecases/payouts/applyTicketRefundToPayoutApplicationUseCase.ts server/application/usecases/payouts/recordPaidSalePayoutApplicationUseCase.ts server/application/usecases/processTicketRefundApplicationUseCase.ts server/application/usecases/reconcileStripeWebhookEventApplicationUseCase.ts server/application/usecases/ticketingPaymentOrchestration.test.ts server/domain/payment/adapters/firebaseAdminTransactionAdapter.ts server/domain/payment/adapters/firestorePayoutEntryAdapter.ts server/domain/payment/adapters/stripePaymentGatewayAdapter.ts server/domain/payment/adapters/stripePayoutTransferAdapter.ts server/domain/payment/factory.ts server/domain/payment/index.ts server/domain/payment/ports/paymentGatewayPort.ts server/domain/payment/ports/payoutEntryRepositoryPort.ts server/domain/payment/ports/payoutTransferPort.ts server/domain/payment/ports/transactionRepositoryPort.ts server/domain/payment/services/paymentAccountService.ts server/domain/payment/services/payoutService.test.ts server/domain/payment/services/payoutService.ts server/domain/payment/services/stripePaymentService.marketplace.test.ts server/domain/payment/services/stripePaymentService.ts server/domain/payment/types/payoutEntry.ts server/domain/payment/usecases/applyPayoutRefundUseCase.ts server/domain/payment/usecases/closePayoutDisputeUseCase.ts server/domain/payment/usecases/createMarketplacePaymentIntentUseCase.ts server/domain/payment/usecases/createPaymentForTicketOrderUseCase.ts server/domain/payment/usecases/holdPayoutForDisputeUseCase.ts server/domain/payment/usecases/processProviderRefundUseCase.ts server/domain/payment/usecases/recordSalePayoutUseCase.ts server/domain/payment/usecases/releaseDuePayoutsUseCase.ts server/domain/payment/utils/payoutRules.test.ts server/domain/payment/utils/payoutRules.ts server/domain/ticketing/adapters/firestoreRefundStore.ts server/domain/ticketing/dtos/ticketingPersistenceMappers.ts server/domain/ticketing/ports/ticketingPort.ts server/domain/ticketing/services/ticketRefundService.ts server/domain/ticketing/types/ticketingTypes.ts server/interfaces/http/payouts/internalPayoutsController.ts` (todos verdes). Não precisa rodar a suíte inteira.
- confira em modo teste do Stripe: compra paga aparece no Dashboard como pagamento na plataforma (sem transferência) e gera um documento em payoutEntries com releaseAt = fim do serviço + 48 h.

LIMPEZA (obrigatória, ao terminar de implementar): apague todos os arquivos de public/assets/aistudio/, inclusive o deste prompt. São cópias dos textos colados no chat, salvas automaticamente pelo AI Studio, e public/ vai para o site publicado. Se a pasta ficar vazia, apague a pasta também.
~~~~
