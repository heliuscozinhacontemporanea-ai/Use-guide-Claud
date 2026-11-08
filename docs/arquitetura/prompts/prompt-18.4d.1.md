# Prompt 18.4d.1 — Dívidas do CNPJ, multa, desconto no repasse e bloqueio (D16)

> Lote 17, gerado do commit de referência `df37496` da branch `claude/agents-md-v2`. Aplique depois do 18.4c. Cole o bloco abaixo no agente do AI Studio, inteiro, de uma vez.

---

## Prompt 18.4d.1 — Dívidas do CNPJ, multa, desconto no repasse e bloqueio (D16)

Primeira parte do 18.4d (só backend). As telas vêm no 18.4e (parceiro) e no 18.4f (comprador e admin).

~~~~text
Siga o AGENTS.md. NÃO altere o AGENTS.md. O app ainda não foi liberado para usuários: nenhum código de compatibilidade ou transição (§2.2 item 8).

IMPORTANTE: aplique os diffs abaixo EXATAMENTE, inclusive os arquivos novos. Não reescreva os arquivos do seu jeito. Arquivo tocado sai sem avisos do lint e formatado (AGENTS.md §13). Nenhuma dependência nova.

DECISÕES D14 e D16 (docs/arquitetura/decisoes.md; este prompt grava a D16 no registro) e AGENTS.md §8.7.

O QUE MUDA:
1) Domínio payment (folha): coleção accountDebts (regra allow read, write: if false, com teste; índices accountKey+status+createdAt e accountKey+createdAt desc). DebtService: createDebt idempotente por motivo e referência, vence em 24 h; hasOverdueDebt; offsetFromPayout (desconta dívida vencida do repasse, das mais antigas para as mais novas, uma vez por entrada); startPayment (cartão ou Pix na plataforma, metadata só com IDs, dívida de outro CNPJ responde 404); markPaid; waive (admin).
2) Multa de 20% do valor vendido sem as taxas de serviço, arredondada para baixo, no cancelamento pelo proprietário de sessão de evento e de horário de reserva, antes dos reembolsos. Admin cancelando não gera multa automática.
3) Repasse: a dívida vencida sai do repasse antes da transferência (offsetMinor na entrada; se consumir tudo, libera sem transferir). Reembolso depois do repasse vira dívida pela diferença. Contestação encerrada: ganha, ou perdida com check-in do ingresso, a plataforma arca e o repasse volta à fila; perdida sem prova cancela a entrada ou, se já repassada, vira dívida.
4) Bloqueio: com dívida vencida, assertReady recusa novas vendas do CNPJ com SELLER_ACCOUNT_BLOCKED (422).
5) Webhook: payment_intent.succeeded com metadata.referenceType = account_debt quita a dívida.
6) Rotas: GET /api/payment-accounts/debts (CNPJs do parceiro logado), POST /api/payment-accounts/debts/:debtId/payment (token com checkRevoked) e POST /api/payment-accounts/debts/:debtId/waive (só admin, com log de auditoria).
7) docs/arquitetura/debitos.md: B29 resolvido.

ARQUIVOS (crie, altere ou apague exatamente estes):
- docs/arquitetura/debitos.md (alterar)
- docs/arquitetura/decisoes.md (alterar)
- firestore.indexes.json (alterar)
- firestore.rules (alterar)
- firestore.rules.security.test.ts (alterar)
- server/application/usecases/bookings/bookingApplicationUseCases.test.ts (alterar)
- server/application/usecases/bookings/cancelSlotByPartnerApplicationUseCase.ts (alterar)
- server/application/usecases/cancelEventOccurrenceAndRefundApplicationUseCase.ts (alterar)
- server/application/usecases/eventLifecycleOrchestration.test.ts (alterar)
- server/application/usecases/paymentAccounts/listPartnerDebtsApplicationUseCase.ts (criar)
- server/application/usecases/paymentAccounts/paymentAccountApplicationUseCases.test.ts (alterar)
- server/application/usecases/paymentAccounts/startPartnerDebtPaymentApplicationUseCase.ts (criar)
- server/application/usecases/payouts/chargeCancellationPenaltyApplicationUseCase.test.ts (criar)
- server/application/usecases/payouts/chargeCancellationPenaltyApplicationUseCase.ts (criar)
- server/application/usecases/payouts/disputeOutcomeApplicationUseCase.ts (criar)
- server/application/usecases/reconcileStripeWebhookEventApplicationUseCase.ts (alterar)
- server/application/usecases/ticketingPaymentOrchestration.test.ts (alterar)
- server/domain/payment/adapters/firestoreAccountDebtAdapter.ts (criar)
- server/domain/payment/adapters/inMemoryAccountDebtAdapter.ts (criar)
- server/domain/payment/factory.ts (alterar)
- server/domain/payment/index.ts (alterar)
- server/domain/payment/ports/accountDebtRepositoryPort.ts (criar)
- server/domain/payment/services/debtService.test.ts (criar)
- server/domain/payment/services/debtService.ts (criar)
- server/domain/payment/services/paymentAccountService.test.ts (alterar)
- server/domain/payment/services/paymentAccountService.ts (alterar)
- server/domain/payment/services/payoutService.test.ts (alterar)
- server/domain/payment/services/payoutService.ts (alterar)
- server/domain/payment/types/accountDebt.ts (criar)
- server/domain/payment/types/payoutEntry.ts (alterar)
- server/domain/payment/usecases/closePayoutDisputeUseCase.ts (alterar)
- server/domain/payment/usecases/createAccountDebtUseCase.ts (criar)
- server/domain/payment/usecases/getPayoutEntryForReferenceUseCase.ts (criar)
- server/domain/payment/usecases/listAccountDebtsUseCase.ts (criar)
- server/domain/payment/usecases/markAccountDebtPaidUseCase.ts (criar)
- server/domain/payment/usecases/startAccountDebtPaymentUseCase.ts (criar)
- server/domain/payment/usecases/waiveAccountDebtUseCase.ts (criar)
- server/domain/payment/utils/debtRules.ts (criar)
- server/domain/ticketing/index.ts (alterar)
- server/domain/ticketing/services/checkInService.ts (alterar)
- server/domain/ticketing/usecases/hasCheckedInTicketForOrderUseCase.ts (criar)
- server/interfaces/http/paymentAccounts/paymentAccountController.ts (alterar)
- server/interfaces/http/paymentAccounts/paymentAccountDebtController.test.ts (criar)
- server/interfaces/http/paymentAccounts/paymentAccountRoutes.ts (alterar)
- server/interfaces/http/paymentAccounts/schemas/paymentAccountSchemas.ts (alterar)

Aplique as mudanças abaixo EXATAMENTE como estão (formato unified diff: linhas com "-" saem, linhas com "+" entram; as demais são contexto para localizar o trecho). Não reformate outros trechos dos arquivos.

=== docs/arquitetura/debitos.md — diff ===
@@ -20,7 +20,6 @@
 | B25 | `src/index.css`: o tema claro ainda depende de sobrescritas globais com `!important` (`:root.light .text-white`, `.bg-white/5`, `.border-white/10`…) para as telas que usam cores fixas; `biome-ignore-all lint/complexity/noImportantStyles` no topo do arquivo | §11.1 (tokens, nunca `text-white` fixo em superfície que muda) e §13 (sem avisos) | médio — cor nova sem token pode sair ilegível no claro; as sobrescritas valem para o app todo | cada tela tocada passa a usar os tokens `--ug-*` (`text-ink`, `bg-surface`, `border-line`, `text-warn`…); quando nenhuma usar mais as classes fixas, as sobrescritas e o `biome-ignore-all` saem |
 | B26 | Avisos de conta financeira no painel de ingressos (`usePartnerMerchantAccount`) e de reservas (`PartnerBookingsComposition`): consideram pronto quando **algum** CNPJ da conta está pronto para receber, não o CNPJ do evento ou da oferta | D14 (conta por documento) | baixo — só o aviso na tela; a venda e a publicação conferem a conta do CNPJ certo no backend (`assertListingCanSellUseCase` + `assertPaymentAccountReadyUseCase`) | Prompt 18.4e: aviso por estabelecimento; `PartnerEventTicketingManager` (1111 linhas) dividido ao tocar |
 | B28 | `bookings/components/partner/OfferTextFields.tsx` (abas pt-BR/en/fr com tradução à mão) e editor de evento do parceiro (texto só em português) | D5 e AGENTS.md §12.6 (editar no idioma ativo, tradução automática) | médio — visitante em inglês ou francês vê o português, e o parceiro digita traduções que a D5 proíbe | 19.1: `LocalizedText`, `MachineTranslationPort` e outbox; o editor mostra o idioma de Configurações e o salvo vira o original |
-| B29 | `server/domain/payment/services/payoutService.ts` (`applyRefund` e `closeDispute` ignoram entrada já `released`) | D14 (reembolso ou contestação depois do repasse vira reversão da transferência ou dívida do CNPJ) | baixo — raro, porque o repasse só sai 48 h depois do fim do serviço; quando acontece, a plataforma arca com o valor | 18.4d: `accountDebts` e reversão de transferência; reembolso pendente na hora da liberação também entra nessa conta |
 
 ## Resolvidos
 
@@ -28,6 +27,7 @@
 |---|---|
 | B22 | Prompt 18.4a (D14): cada CNPJ aprovado vende pela própria conta Stripe Express (`paymentAccounts/{accountKey}`, `accountKey` = índice cego do CNPJ); `verificationOwners` e o "documento de vendas da conta" saíram; a conta é criada com o CNPJ da verificação pré-preenchido para o Stripe conferir a empresa |
 | B27 | Prompt 18.4c (D14): a cobrança é feita na plataforma, sem destino (separate charges and transfers); o reembolso sai do saldo da plataforma e o repasse (`payoutEntries`) é recalculado pelo valor que o proprietário fica, com a taxa de serviço fora dele. |
+| B29 | Prompt 18.4d.1 (D16): reembolso depois do repasse vira dívida do CNPJ (`post_release_refund`) pela diferença; contestação perdida sem prova depois do repasse vira dívida (`dispute_lost`). Dívida vencida é descontada dos repasses seguintes e bloqueia novas vendas do CNPJ. |
 | B24 | Prompt 18.3b: excluir o estabelecimento cancela na hora a assinatura dele no Stripe (`planSubscriptions/{itemId}`); excluir a conta cancela todas as assinaturas vivas dela antes de apagar os planos |
 | B23 | Prompt 18.3.0b (D12, P0): a conta do parceiro deixou de ter documento — o cadastro envia só `termsAccepted`; `partners/{uid}.cpfCnpj`, `cpfCnpjClean` e a coleção `partnerDocumentKeys` saíram do código, das regras e dos testes (resolve também o débito do §7.7); o status `pending` da conta saiu (só `active` e `suspended`); CPF/CNPJ existe apenas, cifrado e com índice cego, na verificação de cada estabelecimento (18.3.0a); `PartnersModal` dividido (529 → 257 linhas), com as condições de cada etapa em `utils/signupStepGates.ts` |
 | Erro no modal de detalhe e métricas zeradas — Prompt 18.2.3 | decisão de 2026-10-19 (opção B): `/api/insights/track` aceita visitante sem login (o token só é anexado quando há usuário); cada item grava dois contadores por dia (`viewsSignedIn`, `viewsAnonymous`) em `interactionStats`, sem uid nem IP; repetição em 30 min não soma (guarda `interactionGuards` com chave HMAC de uid/IP e TTL em `expiresAt`); o relatório mostra o total e a divisão em percentual; `/api/insights/stats/:colecao/:id` exige login e checa o dono no backend (antes o cliente chamava sem token e recebia sempre zero); `ReportsView` dividido e traduzido (sai de B16); `trust proxy` com número de proxies de `TRUST_PROXY_HOPS` (§7.4); handler global de erros do `server.ts` deixou de devolver `err.message` (§7.10 A05); `src/shared/lib/insights.ts` (sem uso, `shared → domain`) removido |

=== docs/arquitetura/decisoes.md — diff ===
@@ -25,6 +25,7 @@
 | D13 | Troca de período do plano na próxima renovação | ✅ Aprovada | 2026-10-24 |
 | D14 | Repasse por documento, retenção até o serviço, taxas e cancelamentos | ✅ Aprovada | 2026-10-24 |
 | D15 | Termos com aceite registrado e idioma do editor de conteúdo | ✅ Aprovada | 2026-10-25 |
+| D16 | Dívidas, reclamações, força maior e reagendamento | ✅ Aprovada | 2026-10-25 |
 
 ---
 
@@ -231,3 +232,16 @@ Objetivo: proteger os dois lados, o consumidor (o dinheiro só sai depois do ser
 * **Validação jurídica** dos textos antes das chaves `sk_live_`, como na D14.
 * **Prompt:** 18.4b.3.
 
+## D16 — Dívidas, reclamações, força maior e reagendamento (2026-10-25)
+
+Detalha o que a D14 deixou para o 18.4d.
+
+* **Divisão (1A):** 18.4d.1 dívidas e multa (`accountDebts`, multa do cancelamento pelo proprietário, pagamento, desconto nos repasses, bloqueio, contestação perdida sem prova, reembolso depois do repasse — B29); 18.4d.2 reclamações do comprador; 18.4d.3 força maior e reagendamento. As telas vêm no 18.4e (parceiro) e no 18.4f (comprador e admin), com prints para conferência.
+* **Motivos da reclamação (2A):** lista fechada — "Não aconteceu", "Muito diferente do anunciado", "Cancelado ou remarcado sem aviso", "Problema de segurança", "Outro" (texto curto, fora dos logs). Prazo: até 48 h depois do fim do serviço.
+* **Força maior (3A):** o proprietário declara o motivo e anexa prova (PDF ou foto, caminho privado); o admin aprova. Até a decisão, a multa fica suspensa; recusada, passa a valer com prazo de 24 h.
+* **Reagendamento (4A):** o ingresso ou a reserva vale na nova data; o comprador pode pedir reembolso integral, inclusive a taxa de serviço, em até 7 dias depois do aviso; sem resposta, vale a nova data.
+* **Contestação perdida em reserva (5A):** sem check-in no app, vira dívida do CNPJ; o admin pode perdoar quando o parceiro mostrar prova do serviço feita fora do app.
+* **Bloqueio por dívida (6A):** dívida vencida bloqueia só novas vendas de todos os estabelecimentos do CNPJ; o que já foi vendido continua valendo e os repasses pendentes quitam a dívida.
+* **Detalhes de implementação:** multa = 20% do valor vendido sem as taxas de serviço, para baixo; vence 24 h depois do cancelamento; desconto nos repasses começa no vencimento, dos repasses mais antigos primeiro. Contestação perdida com check-in fica com a plataforma (o repasse segue); sem check-in, o proprietário perde o repasse da venda ou, se já recebeu, a parte dele vira dívida. Reembolso depois do repasse vira dívida com prazo de 24 h.
+* **Prompts:** 18.4d.1, 18.4d.2, 18.4d.3.
+

=== firestore.indexes.json — diff ===
@@ -327,6 +327,38 @@
           "order": "ASCENDING"
         }
       ]
+    },
+    {
+      "collectionGroup": "accountDebts",
+      "queryScope": "COLLECTION",
+      "fields": [
+        {
+          "fieldPath": "accountKey",
+          "order": "ASCENDING"
+        },
+        {
+          "fieldPath": "status",
+          "order": "ASCENDING"
+        },
+        {
+          "fieldPath": "createdAt",
+          "order": "ASCENDING"
+        }
+      ]
+    },
+    {
+      "collectionGroup": "accountDebts",
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

=== firestore.rules — diff ===
@@ -70,6 +70,10 @@ service cloud.firestore {
     match /payoutEntries/{entryId} {
       allow read, write: if false;
     }
+    // Dívida do CNPJ com a plataforma (D16): financeiro, só backend.
+    match /accountDebts/{debtId} {
+      allow read, write: if false;
+    }
     match /planSubscriptions/{itemId} {
       allow read, write: if false;
     }

=== firestore.rules.security.test.ts — diff ===
@@ -373,6 +373,15 @@ describe('Firestore Rules — Security Suite', () => {
       }
     });
 
+    it('dívida (D16): accountDebts negado até para o dono e admin', async () => {
+      const adminDb = testEnv.authenticatedContext('admin-user', { admin: true }).firestore();
+      const ownerDb = testEnv.authenticatedContext('partner-1').firestore();
+      for (const db of [adminDb, ownerDb]) {
+        await assertFails(getDoc(doc(db, 'accountDebts/debt-1')));
+        await assertFails(setDoc(doc(db, 'accountDebts/debt-1'), { status: 'waived' }));
+      }
+    });
+
     it('plano (D11): listingPlans negado até para o dono e admin', async () => {
       const adminDb = testEnv.authenticatedContext('admin-user', { admin: true }).firestore();
       const ownerDb = testEnv.authenticatedContext('partner-1').firestore();

=== server/application/usecases/bookings/bookingApplicationUseCases.test.ts — diff ===
@@ -15,6 +15,9 @@ vi.mock('../../../domain/payment', () => ({
   createMarketplacePaymentIntentUseCase: vi.fn(),
   processProviderRefundUseCase: vi.fn().mockResolvedValue({}),
 }));
+vi.mock('../payouts/chargeCancellationPenaltyApplicationUseCase', () => ({
+  chargeCancellationPenaltyApplicationUseCase: vi.fn().mockResolvedValue(0),
+}));
 vi.mock('../isPartnerSuspended', () => ({ isPartnerSuspended: vi.fn().mockResolvedValue(false) }));
 vi.mock('../../../domain/partners', () => ({ assertListingCanSellUseCase: vi.fn() }));
 
@@ -33,6 +36,7 @@ import { cancelBookingByBuyerApplicationUseCase } from './cancelBookingByBuyerAp
 import { cancelSlotByPartnerApplicationUseCase } from './cancelSlotByPartnerApplicationUseCase';
 import { createBookingApplicationUseCase } from './createBookingApplicationUseCase';
 import { isPartnerSuspended } from '../isPartnerSuspended';
+import { chargeCancellationPenaltyApplicationUseCase } from '../payouts/chargeCancellationPenaltyApplicationUseCase';
 import { assertListingCanSellUseCase } from '../../../domain/partners';
 
 const BOOKING = {
@@ -180,9 +184,9 @@ describe('cancelSlotByPartnerApplicationUseCase', () => {
 
   it('reembolsa por inteiro as reservas pagas e conta as falhas', async () => {
     vi.mocked(cancelSlotByPartnerUseCase).mockResolvedValue([
-      { id: 'bk_1' },
-      { id: 'bk_2' },
-      { id: 'bk_3' },
+      { id: 'bk_1', status: 'confirmed' },
+      { id: 'bk_2', status: 'pending_payment' },
+      { id: 'bk_3', status: 'confirmed' },
     ] as never);
     vi.mocked(cancelBookingForCanceledSlotUseCase)
       .mockResolvedValueOnce({
@@ -211,5 +215,25 @@ describe('cancelSlotByPartnerApplicationUseCase', () => {
         idempotencyKey: 'refund_slot_bk_1',
       })
     );
+    expect(chargeCancellationPenaltyApplicationUseCase).toHaveBeenCalledWith({
+      referenceType: 'booking_slot',
+      referenceId: 'slot-1',
+      sales: [
+        { referenceType: 'booking', referenceId: 'bk_1' },
+        { referenceType: 'booking', referenceId: 'bk_3' },
+      ],
+    });
+  });
+
+  it('admin cancelando não gera multa automática', async () => {
+    vi.mocked(cancelSlotByPartnerUseCase).mockResolvedValue([
+      { id: 'bk_1', status: 'confirmed' },
+    ] as never);
+    vi.mocked(cancelBookingForCanceledSlotUseCase).mockResolvedValueOnce({
+      id: 'bk_1',
+      cancellation: { refundAmountMinor: 0 },
+    } as never);
+    await cancelSlotByPartnerApplicationUseCase({ uid: 'a1', admin: true }, 'offer-1', 'slot-1');
+    expect(chargeCancellationPenaltyApplicationUseCase).not.toHaveBeenCalled();
   });
 });

=== server/application/usecases/bookings/cancelSlotByPartnerApplicationUseCase.ts — diff ===
@@ -4,10 +4,11 @@ import {
   cancelSlotByPartnerUseCase,
 } from '../../../domain/bookings';
 import { processProviderRefundUseCase } from '../../../domain/payment';
+import { chargeCancellationPenaltyApplicationUseCase } from '../payouts/chargeCancellationPenaltyApplicationUseCase';
 
 /**
- * Horário cancelado pelo parceiro: toda reserva paga é reembolsada por inteiro, com a taxa e o repasse
- * devolvidos (AGENTS.md §8.7). Repetir a chamada só refaz o que falhou (chaves idempotentes).
+ * Horário cancelado pelo parceiro: toda reserva paga é reembolsada por inteiro (AGENTS.md §8.7) e o CNPJ
+ * paga a multa de 20% do valor vendido (D14). Repetir a chamada só refaz o que falhou (chaves idempotentes).
  */
 export async function cancelSlotByPartnerApplicationUseCase(
   actor: BookingActor,
@@ -15,6 +16,16 @@ export async function cancelSlotByPartnerApplicationUseCase(
   slotId: string
 ): Promise<{ canceledBookings: number; refundsRequested: number; failedRefunds: number }> {
   const affected = await cancelSlotByPartnerUseCase(actor, offerId, slotId);
+  // As já canceladas entram numa repetição; a multa é idempotente e ignora repasse já cancelado.
+  const paid = affected.filter((booking) => booking.status !== 'pending_payment');
+  // Antes dos reembolsos, que reduzem o valor vendido; admin cancelando não gera multa automática.
+  if (!actor.admin && paid.length > 0) {
+    await chargeCancellationPenaltyApplicationUseCase({
+      referenceType: 'booking_slot',
+      referenceId: slotId,
+      sales: paid.map((booking) => ({ referenceType: 'booking', referenceId: booking.id })),
+    });
+  }
   let refundsRequested = 0;
   let failedRefunds = 0;
   for (const booking of affected) {

=== server/application/usecases/cancelEventOccurrenceAndRefundApplicationUseCase.ts — diff ===
@@ -5,6 +5,7 @@ import {
   type Refund,
   type TicketingActorContext,
 } from '../../domain/ticketing';
+import { chargeCancellationPenaltyApplicationUseCase } from './payouts/chargeCancellationPenaltyApplicationUseCase';
 import { processTicketRefundApplicationUseCase } from './processTicketRefundApplicationUseCase';
 
 export async function cancelEventOccurrenceAndRefundApplicationUseCase(
@@ -23,6 +24,19 @@ export async function cancelEventOccurrenceAndRefundApplicationUseCase(
       (order.status === 'paid' || order.status === 'partially_refunded')
   );
 
+  // Cancelamento pelo proprietário paga multa (D14); antes dos reembolsos, que reduzem o valor vendido.
+  // Admin cancelando (ex.: fraude) não gera multa automática.
+  if (actor.admin !== true && eligibleOrders.length > 0) {
+    await chargeCancellationPenaltyApplicationUseCase({
+      referenceType: 'event_occurrence',
+      referenceId: occurrenceId,
+      sales: eligibleOrders.map((order) => ({
+        referenceType: 'ticket_order',
+        referenceId: order.id,
+      })),
+    });
+  }
+
   const refundsInitiated: Refund[] = [];
   for (const order of eligibleOrders) {
     try {

=== server/application/usecases/eventLifecycleOrchestration.test.ts — diff ===
@@ -15,6 +15,7 @@ import {
   type Refund,
   type TicketOrder,
 } from '../../domain/ticketing';
+import { chargeCancellationPenaltyApplicationUseCase } from './payouts/chargeCancellationPenaltyApplicationUseCase';
 import { processTicketRefundApplicationUseCase } from './processTicketRefundApplicationUseCase';
 
 vi.mock('../../domain/events', () => ({
@@ -37,6 +38,10 @@ vi.mock('../../domain/ticketing', () => ({
   moveOrderToOccurrenceUseCase: vi.fn(),
 }));
 
+vi.mock('./payouts/chargeCancellationPenaltyApplicationUseCase', () => ({
+  chargeCancellationPenaltyApplicationUseCase: vi.fn().mockResolvedValue(0),
+}));
+
 vi.mock('./processTicketRefundApplicationUseCase', () => ({
   processTicketRefundApplicationUseCase: vi.fn(),
 }));
@@ -117,6 +122,11 @@ describe('eventLifecycleOrchestrationUseCases', () => {
 
     expect(result.occurrence.status).toBe('canceled');
     expect(result.refundsInitiated).toHaveLength(1);
+    expect(chargeCancellationPenaltyApplicationUseCase).toHaveBeenCalledWith({
+      referenceType: 'event_occurrence',
+      referenceId: 'occ-1',
+      sales: [{ referenceType: 'ticket_order', referenceId: 'ord-1' }],
+    });
     expect(processTicketRefundApplicationUseCase).toHaveBeenCalledWith(
       actor,
       expect.objectContaining({

=== server/application/usecases/paymentAccounts/listPartnerDebtsApplicationUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { listOwnerSalesDocumentsUseCase } from '../../../domain/partners';
import { type AccountDebtView, listAccountDebtsUseCase } from '../../../domain/payment';

/** Dívidas de todos os CNPJs do parceiro (D16), sem consultar o Stripe. */
export async function listPartnerDebtsApplicationUseCase(
  ownerUid: string
): Promise<AccountDebtView[]> {
  const documents = await listOwnerSalesDocumentsUseCase(ownerUid);
  return listAccountDebtsUseCase(documents.map((document) => document.accountKey));
}

=== server/application/usecases/paymentAccounts/paymentAccountApplicationUseCases.test.ts — diff ===
@@ -8,6 +8,8 @@ vi.mock('../../../domain/partners', () => ({
 vi.mock('../../../domain/payment', () => ({
   listOwnerPaymentAccountsUseCase: vi.fn(),
   createPaymentAccountSessionUseCase: vi.fn(),
+  listAccountDebtsUseCase: vi.fn().mockResolvedValue([]),
+  startAccountDebtPaymentUseCase: vi.fn().mockResolvedValue({ clientSecret: 'cs' }),
 }));
 
 import {
@@ -17,8 +19,12 @@ import {
 } from '../../../domain/partners';
 import {
   createPaymentAccountSessionUseCase,
+  listAccountDebtsUseCase,
   listOwnerPaymentAccountsUseCase,
+  startAccountDebtPaymentUseCase,
 } from '../../../domain/payment';
+import { listPartnerDebtsApplicationUseCase } from './listPartnerDebtsApplicationUseCase';
+import { startPartnerDebtPaymentApplicationUseCase } from './startPartnerDebtPaymentApplicationUseCase';
 import { listPartnerPaymentAccountsApplicationUseCase } from './listPartnerPaymentAccountsApplicationUseCase';
 import { startPaymentAccountSessionApplicationUseCase } from './startPaymentAccountSessionApplicationUseCase';
 
@@ -92,3 +98,18 @@ describe('contas de recebimento por CNPJ (D14)', () => {
     expect(createPaymentAccountSessionUseCase).not.toHaveBeenCalled();
   });
 });
+
+describe('dívidas do parceiro (D16)', () => {
+  beforeEach(() => vi.clearAllMocks());
+
+  it('lista e paga só com os CNPJs do próprio parceiro', async () => {
+    vi.mocked(listOwnerSalesDocumentsUseCase).mockResolvedValue([
+      { accountKey: 'key-1', maskedDocument: '**.***.***/0001-81', itemIds: [] },
+    ]);
+    await listPartnerDebtsApplicationUseCase('owner-1');
+    expect(listOwnerSalesDocumentsUseCase).toHaveBeenCalledWith('owner-1');
+    expect(listAccountDebtsUseCase).toHaveBeenCalledWith(['key-1']);
+    await startPartnerDebtPaymentApplicationUseCase('owner-1', 'debt_x');
+    expect(startAccountDebtPaymentUseCase).toHaveBeenCalledWith('debt_x', ['key-1']);
+  });
+});

=== server/application/usecases/paymentAccounts/startPartnerDebtPaymentApplicationUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { listOwnerSalesDocumentsUseCase } from '../../../domain/partners';
import { startAccountDebtPaymentUseCase } from '../../../domain/payment';

/** O parceiro só paga dívida de um CNPJ dele; a de outro responde 404 (AGENTS.md §7.10). */
export async function startPartnerDebtPaymentApplicationUseCase(
  ownerUid: string,
  debtId: string
): Promise<{ clientSecret: string }> {
  const documents = await listOwnerSalesDocumentsUseCase(ownerUid);
  return startAccountDebtPaymentUseCase(
    debtId,
    documents.map((document) => document.accountKey)
  );
}

=== server/application/usecases/payouts/chargeCancellationPenaltyApplicationUseCase.test.ts — ARQUIVO NOVO, conteúdo completo ===
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../../domain/payment', async () => {
  const { cancellationPenaltyMinor } = await import('../../../domain/payment/utils/debtRules');
  return {
    cancellationPenaltyMinor,
    createAccountDebtUseCase: vi.fn(async (input: { amountMinor: number }) => input),
    getPayoutEntryForReferenceUseCase: vi.fn(),
  };
});

import {
  createAccountDebtUseCase,
  getPayoutEntryForReferenceUseCase,
} from '../../../domain/payment';
import { chargeCancellationPenaltyApplicationUseCase } from './chargeCancellationPenaltyApplicationUseCase';

function entry(id: string, overrides: Record<string, unknown> = {}) {
  return {
    id,
    accountKey: 'key-1',
    status: 'pending',
    grossMinor: 10600,
    serviceFeeMinor: 600,
    refunds: {},
    ...overrides,
  };
}

describe('chargeCancellationPenaltyApplicationUseCase (D14, D16)', () => {
  beforeEach(() => vi.clearAllMocks());

  it('20% do vendido sem a taxa de serviço, descontando reembolsos e ignorando cancelados', async () => {
    vi.mocked(getPayoutEntryForReferenceUseCase).mockImplementation(async (_type, id) => {
      if (id === 'ord-1') return entry('po_1') as never;
      if (id === 'ord-2') {
        return entry('po_2', {
          refunds: { r1: { amountMinor: 5300, serviceFeeMinor: 300, at: '' } },
        }) as never;
      }
      if (id === 'ord-3') return entry('po_3', { status: 'canceled' }) as never;
      return null;
    });
    const total = await chargeCancellationPenaltyApplicationUseCase({
      referenceType: 'event_occurrence',
      referenceId: 'occ-1',
      sales: ['ord-1', 'ord-2', 'ord-3', 'ord-4'].map((referenceId) => ({
        referenceType: 'ticket_order' as const,
        referenceId,
      })),
    });
    // (10000 + 5000) × 20%
    expect(total).toBe(3000);
    expect(createAccountDebtUseCase).toHaveBeenCalledWith({
      accountKey: 'key-1',
      reason: 'cancellation_penalty',
      referenceType: 'event_occurrence',
      referenceId: 'occ-1_key-1',
      amountMinor: 3000,
    });
  });

  it('uma multa por CNPJ', async () => {
    vi.mocked(getPayoutEntryForReferenceUseCase).mockImplementation(
      async (_type, id) => entry(`po_${id}`, { accountKey: `key-${id}` }) as never
    );
    await chargeCancellationPenaltyApplicationUseCase({
      referenceType: 'booking_slot',
      referenceId: 'slot-1',
      sales: [
        { referenceType: 'booking', referenceId: 'a' },
        { referenceType: 'booking', referenceId: 'b' },
      ],
    });
    expect(createAccountDebtUseCase).toHaveBeenCalledTimes(2);
  });
});

=== server/application/usecases/payouts/chargeCancellationPenaltyApplicationUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import {
  cancellationPenaltyMinor,
  createAccountDebtUseCase,
  getPayoutEntryForReferenceUseCase,
} from '../../../domain/payment';

export interface CanceledSale {
  referenceType: 'ticket_order' | 'booking';
  referenceId: string;
}

/**
 * Multa do cancelamento pelo proprietário (D14): 20% do valor vendido, sem as taxas de serviço, por CNPJ.
 * Calculada antes dos reembolsos, a partir dos repasses ainda não cancelados; vence em 24 h. Repetir o
 * mesmo cancelamento não gera outra multa.
 */
export async function chargeCancellationPenaltyApplicationUseCase(params: {
  referenceType: 'event_occurrence' | 'booking_slot';
  referenceId: string;
  sales: CanceledSale[];
}): Promise<number> {
  const soldByAccount = new Map<string, number>();
  for (const sale of params.sales) {
    const entry = await getPayoutEntryForReferenceUseCase(sale.referenceType, sale.referenceId);
    if (!entry || entry.status === 'canceled') continue;
    const refundedService = Object.values(entry.refunds).reduce(
      (sum, refund) => sum + (refund.amountMinor - refund.serviceFeeMinor),
      0
    );
    const sold = Math.max(0, entry.grossMinor - entry.serviceFeeMinor - refundedService);
    soldByAccount.set(entry.accountKey, (soldByAccount.get(entry.accountKey) ?? 0) + sold);
  }
  let total = 0;
  for (const [accountKey, sold] of soldByAccount) {
    const debt = await createAccountDebtUseCase({
      accountKey,
      reason: 'cancellation_penalty',
      referenceType: params.referenceType,
      // Com a conta na chave, repetir depois de reembolsos parciais não gera uma segunda multa.
      referenceId: `${params.referenceId}_${accountKey}`,
      amountMinor: cancellationPenaltyMinor(sold),
    });
    total += debt?.amountMinor ?? 0;
  }
  return total;
}

=== server/application/usecases/payouts/disputeOutcomeApplicationUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { type DisputeOutcome, getPaymentReferenceUseCase } from '../../../domain/payment';
import { hasCheckedInTicketForOrderUseCase } from '../../../domain/ticketing';

/**
 * Quem arca com a contestação encerrada (D14, D16). `warning_closed` é consulta sem estorno. Perdida:
 * com check-in do ingresso, a plataforma arca; reserva não tem check-in no app e vira dívida, que o
 * admin pode perdoar com prova apresentada fora do app.
 */
export async function disputeOutcomeApplicationUseCase(
  paymentIntentId: string,
  stripeStatus: string
): Promise<DisputeOutcome> {
  if (stripeStatus === 'won' || stripeStatus === 'warning_closed') return 'won';
  const reference = await getPaymentReferenceUseCase(paymentIntentId);
  if (reference?.referenceType === 'ticket_order') {
    return (await hasCheckedInTicketForOrderUseCase(reference.referenceId))
      ? 'lost_platform_absorbs'
      : 'lost_partner_pays';
  }
  return 'lost_partner_pays';
}

=== server/application/usecases/reconcileStripeWebhookEventApplicationUseCase.ts — diff ===
@@ -2,6 +2,7 @@ import { createNotificationUseCase } from '../../domain/notifications';
 import {
   closePayoutDisputeUseCase,
   holdPayoutForDisputeUseCase,
+  markAccountDebtPaidUseCase,
   syncPaymentAccountFromWebhookUseCase,
   updatePaymentTransactionStatusUseCase,
   type VerifiedWebhookEvent,
@@ -15,6 +16,7 @@ import {
 import { activatePaidPlanApplicationUseCase } from './activatePaidPlanApplicationUseCase';
 import { reconcileBookingWebhookApplicationUseCase } from './bookings/reconcileBookingWebhookApplicationUseCase';
 import { applyTicketRefundToPayoutApplicationUseCase } from './payouts/applyTicketRefundToPayoutApplicationUseCase';
+import { disputeOutcomeApplicationUseCase } from './payouts/disputeOutcomeApplicationUseCase';
 import { recordPaidSalePayoutApplicationUseCase } from './payouts/recordPaidSalePayoutApplicationUseCase';
 import {
   PLAN_SUBSCRIPTION_WEBHOOK_EVENTS,
@@ -32,9 +34,10 @@ export async function reconcileStripeWebhookEventApplicationUseCase(
   }
   if (event.type === 'charge.dispute.closed') {
     if (obj.payment_intent) {
-      // `warning_closed`: consulta encerrada sem estorno, o dinheiro fica com a plataforma.
-      const won = obj.status === 'won' || obj.status === 'warning_closed';
-      await closePayoutDisputeUseCase(String(obj.payment_intent), won);
+      await closePayoutDisputeUseCase(
+        String(obj.payment_intent),
+        await disputeOutcomeApplicationUseCase(String(obj.payment_intent), String(obj.status || ''))
+      );
     }
     return { processed: true, eventType: event.type };
   }
@@ -54,6 +57,10 @@ export async function reconcileStripeWebhookEventApplicationUseCase(
   if (event.type === 'payment_intent.succeeded') {
     const paymentIntentId = String(obj.id || '');
     const metadata = (obj.metadata as Record<string, string> | undefined) || {};
+    if (metadata.referenceType === 'account_debt' && metadata.referenceId) {
+      await markAccountDebtPaidUseCase(metadata.referenceId, paymentIntentId);
+      return { processed: true, eventType: event.type };
+    }
     await updatePaymentTransactionStatusUseCase(paymentIntentId, 'succeeded');
 
     if (

=== server/application/usecases/ticketingPaymentOrchestration.test.ts — diff ===
@@ -9,6 +9,7 @@ vi.mock('../../domain/payment', () => ({
   applyPayoutRefundUseCase: vi.fn(),
   closePayoutDisputeUseCase: vi.fn(),
   holdPayoutForDisputeUseCase: vi.fn(),
+  markAccountDebtPaidUseCase: vi.fn(),
   recordSalePayoutUseCase: vi.fn(),
   createPaymentForTicketOrderUseCase: vi.fn(),
   getPaymentReferenceUseCase: vi.fn().mockResolvedValue(null),
@@ -22,6 +23,7 @@ vi.mock('../../domain/ticketing', () => ({
   confirmTicketOrderPaymentUseCase: vi.fn(),
   finalizeTicketRefundStatusUseCase: vi.fn(),
   getTicketOrderUseCase: vi.fn(),
+  hasCheckedInTicketForOrderUseCase: vi.fn(),
   markTicketOrderDisputedUseCase: vi.fn(),
   markTicketOrderPaymentFailedUseCase: vi.fn(),
   requestTicketRefundUseCase: vi.fn(),
@@ -31,7 +33,9 @@ vi.mock('../../domain/ticketing', () => ({
 import {
   applyPayoutRefundUseCase,
   closePayoutDisputeUseCase,
+  getPaymentReferenceUseCase,
   holdPayoutForDisputeUseCase,
+  markAccountDebtPaidUseCase,
   processProviderRefundUseCase,
   recordSalePayoutUseCase,
   updatePaymentTransactionStatusUseCase,
@@ -39,6 +43,7 @@ import {
 import {
   confirmTicketOrderPaymentUseCase,
   finalizeTicketRefundStatusUseCase,
+  hasCheckedInTicketForOrderUseCase,
   requestTicketRefundUseCase,
   type Refund,
   type TicketOrder,
@@ -188,6 +193,41 @@ describe('ticketingPaymentOrchestrationUseCases — repasse (D14)', () => {
     });
   });
 
+  it('pagamento de dívida do parceiro quita a dívida, sem tocar em pedido (D16)', async () => {
+    await reconcileStripeWebhookEventApplicationUseCase({
+      id: 'evt_debt',
+      type: 'payment_intent.succeeded',
+      created: 1,
+      dataObject: {
+        id: 'pi_debt',
+        metadata: { referenceType: 'account_debt', referenceId: 'debt_x' },
+      },
+    });
+    expect(markAccountDebtPaidUseCase).toHaveBeenCalledWith('debt_x', 'pi_debt');
+    expect(confirmTicketOrderPaymentUseCase).not.toHaveBeenCalled();
+  });
+
+  it('contestação perdida: com check-in a plataforma arca, sem check-in o CNPJ paga (D16)', async () => {
+    vi.mocked(getPaymentReferenceUseCase).mockResolvedValue({
+      referenceType: 'ticket_order',
+      referenceId: 'ord_1',
+    } as never);
+    for (const [checkedIn, outcome] of [
+      [true, 'lost_platform_absorbs'],
+      [false, 'lost_partner_pays'],
+    ] as const) {
+      vi.mocked(hasCheckedInTicketForOrderUseCase).mockResolvedValue(checkedIn);
+      await reconcileStripeWebhookEventApplicationUseCase({
+        id: `evt_lost_${checkedIn}`,
+        type: 'charge.dispute.closed',
+        created: 1,
+        dataObject: { payment_intent: 'pi_1', status: 'lost' },
+      });
+      expect(closePayoutDisputeUseCase).toHaveBeenLastCalledWith('pi_1', outcome);
+    }
+    vi.mocked(getPaymentReferenceUseCase).mockResolvedValue(null);
+  });
+
   it('contestação segura o repasse; encerrada ganha ou perdida avisa o repasse', async () => {
     await reconcileStripeWebhookEventApplicationUseCase({
       id: 'evt_d1',
@@ -197,9 +237,9 @@ describe('ticketingPaymentOrchestrationUseCases — repasse (D14)', () => {
     });
     expect(holdPayoutForDisputeUseCase).toHaveBeenCalledWith('pi_1');
     for (const [status, won] of [
-      ['won', true],
-      ['warning_closed', true],
-      ['lost', false],
+      ['won', 'won'],
+      ['warning_closed', 'won'],
+      ['lost', 'lost_partner_pays'],
     ] as const) {
       await reconcileStripeWebhookEventApplicationUseCase({
         id: `evt_${status}`,

=== server/domain/payment/adapters/firestoreAccountDebtAdapter.ts — ARQUIVO NOVO, conteúdo completo ===
import { adminDb } from '../../../infrastructure/firebase/adminClient';
import type { AccountDebtRepositoryPort } from '../ports/accountDebtRepositoryPort';
import type { AccountDebt } from '../types/accountDebt';

const DEBTS = 'accountDebts';

/** Coleção só de backend (`allow read, write: if false`, AGENTS.md §6.2). */
export class FirestoreAccountDebtAdapter implements AccountDebtRepositoryPort {
  async createIfAbsent(debt: AccountDebt): Promise<AccountDebt> {
    const ref = adminDb.collection(DEBTS).doc(debt.id);
    return adminDb.runTransaction(async (tx) => {
      const snapshot = await tx.get(ref);
      if (snapshot.exists) return snapshot.data() as AccountDebt;
      tx.set(ref, debt);
      return debt;
    });
  }

  async get(id: string): Promise<AccountDebt | null> {
    const snapshot = await adminDb.collection(DEBTS).doc(id).get();
    return snapshot.exists ? (snapshot.data() as AccountDebt) : null;
  }

  async listOpenByAccountKey(accountKey: string): Promise<AccountDebt[]> {
    const snapshot = await adminDb
      .collection(DEBTS)
      .where('accountKey', '==', accountKey)
      .where('status', '==', 'open')
      .orderBy('createdAt', 'asc')
      .limit(50)
      .get();
    return snapshot.docs.map((doc) => doc.data() as AccountDebt);
  }

  async listByAccountKeys(accountKeys: string[], limit: number): Promise<AccountDebt[]> {
    if (accountKeys.length === 0) return [];
    // `in` aceita até 30 valores; um parceiro tem bem menos CNPJs que isso.
    const snapshot = await adminDb
      .collection(DEBTS)
      .where('accountKey', 'in', accountKeys.slice(0, 30))
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .get();
    return snapshot.docs.map((doc) => doc.data() as AccountDebt);
  }

  async update(
    id: string,
    change: (current: AccountDebt) => AccountDebt | null
  ): Promise<AccountDebt | null> {
    const ref = adminDb.collection(DEBTS).doc(id);
    return adminDb.runTransaction(async (tx) => {
      const snapshot = await tx.get(ref);
      if (!snapshot.exists) return null;
      const current = snapshot.data() as AccountDebt;
      const next = change(current);
      if (!next) return current;
      tx.set(ref, next);
      return next;
    });
  }
}

=== server/domain/payment/adapters/inMemoryAccountDebtAdapter.ts — ARQUIVO NOVO, conteúdo completo ===
import type { AccountDebtRepositoryPort } from '../ports/accountDebtRepositoryPort';
import type { AccountDebt } from '../types/accountDebt';

/** Usado só por testes (AGENTS.md §2.2 item 7). */
export class InMemoryAccountDebtAdapter implements AccountDebtRepositoryPort {
  readonly rows = new Map<string, AccountDebt>();

  async createIfAbsent(debt: AccountDebt): Promise<AccountDebt> {
    const existing = this.rows.get(debt.id);
    if (existing) return existing;
    this.rows.set(debt.id, debt);
    return debt;
  }

  async get(id: string): Promise<AccountDebt | null> {
    return this.rows.get(id) ?? null;
  }

  async listOpenByAccountKey(accountKey: string): Promise<AccountDebt[]> {
    return [...this.rows.values()]
      .filter((debt) => debt.accountKey === accountKey && debt.status === 'open')
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }

  async listByAccountKeys(accountKeys: string[], limit: number): Promise<AccountDebt[]> {
    return [...this.rows.values()]
      .filter((debt) => accountKeys.includes(debt.accountKey))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, limit);
  }

  async update(
    id: string,
    change: (current: AccountDebt) => AccountDebt | null
  ): Promise<AccountDebt | null> {
    const current = this.rows.get(id);
    if (!current) return null;
    const next = change(current);
    if (next) this.rows.set(id, next);
    return next ?? current;
  }
}

=== server/domain/payment/factory.ts — diff ===
@@ -1,4 +1,5 @@
 import { FirebaseAdminTransactionAdapter } from './adapters/firebaseAdminTransactionAdapter';
+import { FirestoreAccountDebtAdapter } from './adapters/firestoreAccountDebtAdapter';
 import { FirestorePaymentAccountAdapter } from './adapters/firestorePaymentAccountAdapter';
 import { FirestorePayoutEntryAdapter } from './adapters/firestorePayoutEntryAdapter';
 import { FirestorePlanSubscriptionAdapter } from './adapters/firestorePlanSubscriptionAdapter';
@@ -11,6 +12,7 @@ import type { PaymentGatewayPort } from './ports/paymentGatewayPort';
 import type { TransactionRepositoryPort } from './ports/transactionRepositoryPort';
 import { BillingService } from './services/billingService';
 import { CheckoutService } from './services/checkoutService';
+import { DebtService } from './services/debtService';
 import { PaymentAccountService } from './services/paymentAccountService';
 import { PayoutService } from './services/payoutService';
 import { StripePaymentService } from './services/stripePaymentService';
@@ -21,9 +23,15 @@ export const marketplaceAccountAdapter: MarketplaceAccountPort =
 export const transactionRepository: TransactionRepositoryPort =
   new FirebaseAdminTransactionAdapter();
 
+export const debtService = new DebtService(
+  new FirestoreAccountDebtAdapter(),
+  paymentGatewayAdapter
+);
+
 export const paymentAccountService = new PaymentAccountService(
   new FirestorePaymentAccountAdapter(),
-  marketplaceAccountAdapter
+  marketplaceAccountAdapter,
+  debtService
 );
 
 export const stripePaymentService = new StripePaymentService(
@@ -35,7 +43,8 @@ export const stripePaymentService = new StripePaymentService(
 export const payoutService = new PayoutService(
   new FirestorePayoutEntryAdapter(),
   new StripePayoutTransferAdapter(),
-  paymentAccountService
+  paymentAccountService,
+  debtService
 );
 
 export const checkoutService = new CheckoutService(stripePaymentService, transactionRepository);

=== server/domain/payment/index.ts — diff ===
@@ -19,6 +19,13 @@ export { applyPayoutRefundUseCase } from './usecases/applyPayoutRefundUseCase';
 export { holdPayoutForDisputeUseCase } from './usecases/holdPayoutForDisputeUseCase';
 export { closePayoutDisputeUseCase } from './usecases/closePayoutDisputeUseCase';
 export { releaseDuePayoutsUseCase } from './usecases/releaseDuePayoutsUseCase';
+export { getPayoutEntryForReferenceUseCase } from './usecases/getPayoutEntryForReferenceUseCase';
+export { createAccountDebtUseCase } from './usecases/createAccountDebtUseCase';
+export { listAccountDebtsUseCase } from './usecases/listAccountDebtsUseCase';
+export { startAccountDebtPaymentUseCase } from './usecases/startAccountDebtPaymentUseCase';
+export { markAccountDebtPaidUseCase } from './usecases/markAccountDebtPaidUseCase';
+export { waiveAccountDebtUseCase } from './usecases/waiveAccountDebtUseCase';
+export { cancellationPenaltyMinor } from './utils/debtRules';
 export { getPaymentReferenceUseCase } from './usecases/getPaymentReferenceUseCase';
 export { createBillingPortalSessionUseCase } from './usecases/billing/createBillingPortalSessionUseCase';
 export { getListingPlanSubscriptionUseCase } from './usecases/billing/getListingPlanSubscriptionUseCase';
@@ -45,7 +52,9 @@ export type { PlanSubscriptionRecord } from './ports/planSubscriptionRepositoryP
 export type { ConnectedAccountStatus } from './ports/marketplaceAccountPort';
 export type { PaymentAccountView } from './types/paymentAccount';
 export type { PayoutEntry, PayoutEntryStatus } from './types/payoutEntry';
-export type { RecordSaleInput, ReleaseSummary } from './services/payoutService';
+export type { DisputeOutcome, RecordSaleInput, ReleaseSummary } from './services/payoutService';
+export type { AccountDebt, AccountDebtReason, AccountDebtView } from './types/accountDebt';
+export type { CreateDebtInput } from './services/debtService';
 export type { EnsurePaymentAccountInput } from './services/paymentAccountService';
 export type {
   CreatePaymentIntentResult,

=== server/domain/payment/ports/accountDebtRepositoryPort.ts — ARQUIVO NOVO, conteúdo completo ===
import type { AccountDebt } from '../types/accountDebt';

export interface AccountDebtRepositoryPort {
  /** Cria só se ainda não existir; devolve a dívida gravada. */
  createIfAbsent(debt: AccountDebt): Promise<AccountDebt>;
  get(id: string): Promise<AccountDebt | null>;
  /** Dívidas `open` do CNPJ, mais antigas primeiro. */
  listOpenByAccountKey(accountKey: string): Promise<AccountDebt[]>;
  listByAccountKeys(accountKeys: string[], limit: number): Promise<AccountDebt[]>;
  /** Lê, aplica a mudança e grava na mesma transação; `null` deixa como está. */
  update(
    id: string,
    change: (current: AccountDebt) => AccountDebt | null
  ): Promise<AccountDebt | null>;
}

=== server/domain/payment/services/debtService.test.ts — ARQUIVO NOVO, conteúdo completo ===
import { describe, expect, it, vi } from 'vitest';
import { InMemoryAccountDebtAdapter } from '../adapters/inMemoryAccountDebtAdapter';
import { cancellationPenaltyMinor } from '../utils/debtRules';
import { DebtService } from './debtService';

const PENALTY = {
  accountKey: 'key-1',
  reason: 'cancellation_penalty' as const,
  referenceType: 'event_occurrence',
  referenceId: 'occ-1',
  amountMinor: 2000,
};

function setup(now = '2026-10-25T12:00:00.000Z') {
  const repo = new InMemoryAccountDebtAdapter();
  const gateway = {
    createPaymentIntent: vi.fn().mockResolvedValue({
      paymentIntentId: 'pi_debt',
      clientSecret: 'cs_debt',
      status: 'requires_payment_method',
    }),
  };
  const clock = { value: new Date(now) };
  const service = new DebtService(repo, gateway, () => clock.value);
  return { repo, gateway, clock, service };
}

describe('DebtService (D16)', () => {
  it('multa de 20% arredondada para baixo', () => {
    expect(cancellationPenaltyMinor(10_000)).toBe(2000);
    expect(cancellationPenaltyMinor(1_999)).toBe(399);
    expect(cancellationPenaltyMinor(-5)).toBe(0);
  });

  it('a mesma referência gera uma dívida só, que vence em 24 h', async () => {
    const { service, repo } = setup();
    await service.createDebt(PENALTY);
    await service.createDebt(PENALTY);
    expect(repo.rows.size).toBe(1);
    expect([...repo.rows.values()][0]?.dueAt).toBe('2026-10-26T12:00:00.000Z');
    expect(await service.createDebt({ ...PENALTY, referenceId: 'occ-2', amountMinor: 0 })).toBe(
      null
    );
  });

  it('só bloqueia depois do vencimento', async () => {
    const { service, clock } = setup();
    await service.createDebt(PENALTY);
    expect(await service.hasOverdueDebt('key-1')).toBe(false);
    clock.value = new Date('2026-10-26T12:00:00.000Z');
    expect(await service.hasOverdueDebt('key-1')).toBe(true);
    expect(await service.hasOverdueDebt('key-2')).toBe(false);
  });

  it('desconta do repasse só a dívida vencida, uma vez por entrada', async () => {
    const { service, repo, clock } = setup();
    await service.createDebt(PENALTY);
    const before = { accountKey: 'key-1', payoutEntryId: 'po_1', availableMinor: 1500 };
    expect(await service.offsetFromPayout(before)).toBe(0);
    clock.value = new Date('2026-10-27T00:00:00.000Z');
    expect(await service.offsetFromPayout(before)).toBe(1500);
    expect(await service.offsetFromPayout(before)).toBe(1500);
    const debt = [...repo.rows.values()][0];
    expect(debt).toMatchObject({ status: 'open', offsets: { po_1: 1500 } });
    expect(
      await service.offsetFromPayout({ ...before, payoutEntryId: 'po_2', availableMinor: 9000 })
    ).toBe(500);
    expect([...repo.rows.values()][0]?.status).toBe('paid');
  });

  it('pagamento: dívida de outro CNPJ responde 404 e a cobrança leva só IDs', async () => {
    const { service, gateway } = setup();
    const debt = await service.createDebt(PENALTY);
    await expect(service.startPayment(debt?.id ?? '', ['key-2'])).rejects.toMatchObject({
      code: 'NOT_FOUND',
      statusCode: 404,
    });
    await expect(service.startPayment(debt?.id ?? '', ['key-1'])).resolves.toEqual({
      clientSecret: 'cs_debt',
    });
    expect(gateway.createPaymentIntent).toHaveBeenCalledWith(
      expect.objectContaining({
        amountMinor: 2000,
        metadata: { referenceType: 'account_debt', referenceId: debt?.id, accountKey: 'key-1' },
        idempotencyKey: `pi_debt_${debt?.id}_2000`,
      })
    );
  });

  it('paga pelo webhook não pode ser cobrada de novo; perdão só de dívida aberta', async () => {
    const { service } = setup();
    const debt = await service.createDebt(PENALTY);
    const id = debt?.id ?? '';
    await service.markPaid(id, 'pi_debt');
    await expect(service.startPayment(id, ['key-1'])).rejects.toMatchObject({
      code: 'DEBT_ALREADY_SETTLED',
    });
    await expect(service.waive(id, 'admin-1')).rejects.toMatchObject({
      code: 'DEBT_ALREADY_SETTLED',
    });
    await expect(service.waive('debt-inexistente', 'admin-1')).rejects.toMatchObject({
      code: 'NOT_FOUND',
    });
  });
});

=== server/domain/payment/services/debtService.ts — ARQUIVO NOVO, conteúdo completo ===
import type { AccountDebtRepositoryPort } from '../ports/accountDebtRepositoryPort';
import type { PaymentGatewayPort } from '../ports/paymentGatewayPort';
import type { AccountDebt, AccountDebtReason, AccountDebtView } from '../types/accountDebt';
import { debtDueAt, isDebtOverdue, remainingDebtMinor } from '../utils/debtRules';
import { PaymentDomainError } from './stripePaymentService';

export interface CreateDebtInput {
  accountKey: string;
  reason: AccountDebtReason;
  referenceType: string;
  referenceId: string;
  amountMinor: number;
}

function toView(debt: AccountDebt, now: Date): AccountDebtView {
  return {
    id: debt.id,
    accountKey: debt.accountKey,
    reason: debt.reason,
    referenceType: debt.referenceType,
    amountMinor: debt.amountMinor,
    remainingMinor: debt.status === 'open' ? remainingDebtMinor(debt) : 0,
    status: debt.status,
    dueAt: debt.dueAt,
    overdue: isDebtOverdue(debt, now),
    createdAt: debt.createdAt,
  };
}

/** Dívidas do CNPJ com a plataforma (D14, D16): multa, contestação perdida e reembolso depois do repasse. */
export class DebtService {
  constructor(
    private readonly debts: AccountDebtRepositoryPort,
    private readonly gateway: Pick<PaymentGatewayPort, 'createPaymentIntent'>,
    private readonly now: () => Date = () => new Date()
  ) {}

  /** Idempotente por motivo e referência: o mesmo cancelamento não gera duas multas. */
  async createDebt(input: CreateDebtInput): Promise<AccountDebt | null> {
    if (input.amountMinor <= 0) return null;
    const nowDate = this.now();
    return this.debts.createIfAbsent({
      id: `debt_${input.reason}_${input.referenceType}_${input.referenceId}`,
      ...input,
      offsets: {},
      status: 'open',
      dueAt: debtDueAt(nowDate),
      createdAt: nowDate.toISOString(),
      updatedAt: nowDate.toISOString(),
    });
  }

  async listForAccounts(accountKeys: string[]): Promise<AccountDebtView[]> {
    const nowDate = this.now();
    const debts = await this.debts.listByAccountKeys(accountKeys, 100);
    return debts.map((debt) => toView(debt, nowDate));
  }

  /** Dívida vencida e não paga bloqueia novas vendas do CNPJ (D16, 6A). */
  async hasOverdueDebt(accountKey: string): Promise<boolean> {
    const nowDate = this.now();
    const open = await this.debts.listOpenByAccountKey(accountKey);
    return open.some((debt) => isDebtOverdue(debt, nowDate));
  }

  /**
   * Desconta dívidas vencidas de um repasse, das mais antigas para as mais novas. Cada desconto fica
   * gravado na dívida pela entrada: rodar de novo devolve o mesmo total, sem descontar duas vezes.
   */
  async offsetFromPayout(params: {
    accountKey: string;
    payoutEntryId: string;
    availableMinor: number;
  }): Promise<number> {
    const nowDate = this.now();
    let available = params.availableMinor;
    let offsetTotal = 0;
    const open = await this.debts.listOpenByAccountKey(params.accountKey);
    for (const debt of open) {
      const alreadyFromEntry = debt.offsets[params.payoutEntryId];
      if (alreadyFromEntry !== undefined) {
        offsetTotal += alreadyFromEntry;
        available -= alreadyFromEntry;
        continue;
      }
      if (available <= 0 || !isDebtOverdue(debt, nowDate)) continue;
      const updated = await this.debts.update(debt.id, (current) => {
        if (current.status !== 'open' || current.offsets[params.payoutEntryId] !== undefined) {
          return null;
        }
        const take = Math.min(available, remainingDebtMinor(current));
        if (take <= 0) return null;
        const offsets = { ...current.offsets, [params.payoutEntryId]: take };
        const settled = take >= remainingDebtMinor(current);
        return {
          ...current,
          offsets,
          ...(settled ? { status: 'paid' as const, paidAt: nowDate.toISOString() } : {}),
          updatedAt: nowDate.toISOString(),
        };
      });
      const taken = updated?.offsets[params.payoutEntryId] ?? 0;
      offsetTotal += taken;
      available -= taken;
    }
    return offsetTotal;
  }

  /** Cobrança da dívida no cartão ou Pix, na plataforma e sem transferência (D14). */
  async startPayment(debtId: string, accountKeys: string[]): Promise<{ clientSecret: string }> {
    const debt = await this.debts.get(debtId);
    // Dívida de outro CNPJ responde como inexistente (proteção contra IDOR, AGENTS.md §7.10).
    if (!debt || !accountKeys.includes(debt.accountKey)) {
      throw new PaymentDomainError('NOT_FOUND', 'Dívida não encontrada.', 404);
    }
    const remaining = debt.status === 'open' ? remainingDebtMinor(debt) : 0;
    if (remaining <= 0) {
      throw new PaymentDomainError('DEBT_ALREADY_SETTLED', 'Esta dívida já foi quitada.', 409);
    }
    const intent = await this.gateway.createPaymentIntent({
      orderId: debt.id,
      amountMinor: remaining,
      currency: 'BRL',
      description: 'Use Guide — dívida do parceiro',
      paymentMethodTypes: ['card', 'pix'],
      metadata: {
        referenceType: 'account_debt',
        referenceId: debt.id,
        accountKey: debt.accountKey,
      },
      // O valor faz parte da chave: depois de um desconto no repasse, a cobrança é outra.
      idempotencyKey: `pi_debt_${debt.id}_${remaining}`,
    });
    await this.debts.update(debt.id, (current) => ({
      ...current,
      paymentIntentId: intent.paymentIntentId,
      updatedAt: this.now().toISOString(),
    }));
    return { clientSecret: intent.clientSecret };
  }

  /** Webhook do pagamento da dívida. */
  async markPaid(debtId: string, paymentIntentId: string): Promise<AccountDebt | null> {
    return this.debts.update(debtId, (current) =>
      current.status === 'open'
        ? {
            ...current,
            status: 'paid',
            paymentIntentId,
            paidAt: this.now().toISOString(),
            updatedAt: this.now().toISOString(),
          }
        : null
    );
  }

  /** Admin perdoa a dívida (ex.: prova de serviço apresentada fora do app, D16 5A). */
  async waive(debtId: string, adminUid: string): Promise<AccountDebt> {
    let settled = false;
    const updated = await this.debts.update(debtId, (current) => {
      settled = current.status !== 'open';
      return settled
        ? null
        : { ...current, status: 'waived', waivedBy: adminUid, updatedAt: this.now().toISOString() };
    });
    if (!updated) throw new PaymentDomainError('NOT_FOUND', 'Dívida não encontrada.', 404);
    if (settled) {
      throw new PaymentDomainError('DEBT_ALREADY_SETTLED', 'Esta dívida já foi quitada.', 409);
    }
    return updated;
  }
}

=== server/domain/payment/services/paymentAccountService.test.ts — diff ===
@@ -40,7 +40,7 @@ const PENDING: Omit<ConnectedAccountStatus, 'accountId'> = {
   status: 'pending',
 };
 
-function setup(status = PENDING) {
+function setup(status = PENDING, overdue = false) {
   const repository = new InMemoryAccounts();
   let created = 0;
   const marketplace = {
@@ -48,9 +48,11 @@ function setup(status = PENDING) {
     createAccountSession: vi.fn(async (accountId: string) => ({ clientSecret: `cs_${accountId}` })),
     getAccountStatus: vi.fn(async (accountId: string) => ({ accountId, ...status })),
   } satisfies MarketplaceAccountPort;
+  const debts = { hasOverdueDebt: vi.fn(async () => overdue) };
   const service = new PaymentAccountService(
     repository,
     marketplace,
+    debts,
     () => new Date('2026-10-25T12:00:00.000Z')
   );
   return { repository, marketplace, service };
@@ -129,6 +131,15 @@ describe('PaymentAccountService (D14)', () => {
     });
   });
 
+  it('dívida vencida bloqueia novas vendas do CNPJ (D16)', async () => {
+    const blocked = setup(ENABLED, true);
+    await blocked.service.createSession(INPUT);
+    await expect(blocked.service.assertReady('key-cnpj-1')).rejects.toMatchObject({
+      code: 'SELLER_ACCOUNT_BLOCKED',
+      statusCode: 422,
+    });
+  });
+
   it('webhook atualiza a conta certa e ignora conta desconhecida', async () => {
     const { service, marketplace, repository } = setup();
     await service.createSession(INPUT);

=== server/domain/payment/services/paymentAccountService.ts — diff ===
@@ -5,6 +5,7 @@ import type {
 import type { PaymentAccountRepositoryPort } from '../ports/paymentAccountRepositoryPort';
 import type { PaymentAccountRecord, PaymentAccountView } from '../types/paymentAccount';
 import { isSellerAccountReady } from '../utils/sellerReadiness';
+import type { DebtService } from './debtService';
 import { PaymentDomainError } from './stripePaymentService';
 
 export interface EnsurePaymentAccountInput {
@@ -19,6 +20,7 @@ export class PaymentAccountService {
   constructor(
     private readonly repository: PaymentAccountRepositoryPort,
     private readonly marketplace: MarketplaceAccountPort,
+    private readonly debts: Pick<DebtService, 'hasOverdueDebt'>,
     private readonly now: () => Date = () => new Date()
   ) {}
 
@@ -44,6 +46,14 @@ export class PaymentAccountService {
         422
       );
     }
+    // Dívida vencida bloqueia novas vendas de todos os estabelecimentos do CNPJ (D16, 6A).
+    if (await this.debts.hasOverdueDebt(accountKey)) {
+      throw new PaymentDomainError(
+        'SELLER_ACCOUNT_BLOCKED',
+        'Vendas pausadas: este CNPJ tem uma dívida vencida com a plataforma.',
+        422
+      );
+    }
     return record;
   }

=== server/domain/payment/services/payoutService.test.ts — diff ===
@@ -1,6 +1,8 @@
 import { describe, expect, it, vi } from 'vitest';
+import { InMemoryAccountDebtAdapter } from '../adapters/inMemoryAccountDebtAdapter';
 import type { PayoutEntryRepositoryPort } from '../ports/payoutEntryRepositoryPort';
 import type { PayoutEntry } from '../types/payoutEntry';
+import { DebtService } from './debtService';
 import { PayoutService, type RecordSaleInput } from './payoutService';
 
 function memoryRepository(): PayoutEntryRepositoryPort & { rows: Map<string, PayoutEntry> } {
@@ -51,8 +53,10 @@ function setup(now = '2026-12-23T04:00:00.000Z', destination: string | null = 'a
   const transfers = { createTransfer: vi.fn().mockResolvedValue({ transferId: 'tr_1' }) };
   const accounts = { getPayoutDestination: vi.fn().mockResolvedValue(destination) };
   const clock = { value: new Date(now) };
-  const service = new PayoutService(repo, transfers, accounts, () => clock.value);
-  return { repo, transfers, accounts, service, clock };
+  const debtRows = new InMemoryAccountDebtAdapter();
+  const debts = new DebtService(debtRows, { createPaymentIntent: vi.fn() }, () => clock.value);
+  const service = new PayoutService(repo, transfers, accounts, debts, () => clock.value);
+  return { repo, transfers, accounts, service, clock, debts, debtRows };
 }
 
 describe('PayoutService (D14)', () => {
@@ -107,18 +111,87 @@ describe('PayoutService (D14)', () => {
     });
   });
 
-  it('contestação segura o repasse; ganha volta à fila, perdida cancela', async () => {
+  it('contestação segura o repasse; ganha ou a plataforma arca volta à fila, sem prova cancela', async () => {
     const { service, repo } = setup();
     await service.recordSale(SALE);
     await service.holdForDispute('pi_1');
     expect((await service.releaseDue()).released).toBe(0);
-    await service.closeDispute('pi_1', true);
+    await service.closeDispute('pi_1', 'won');
     expect(repo.rows.get('po_ticket_order_ord_1')?.status).toBe('pending');
     await service.holdForDispute('pi_1');
-    await service.closeDispute('pi_1', false);
+    await service.closeDispute('pi_1', 'lost_platform_absorbs');
+    expect(repo.rows.get('po_ticket_order_ord_1')?.status).toBe('pending');
+    await service.holdForDispute('pi_1');
+    await service.closeDispute('pi_1', 'lost_partner_pays');
     expect(repo.rows.get('po_ticket_order_ord_1')).toMatchObject({
       status: 'canceled',
       canceledReason: 'dispute_lost',
+      partnerAmountMinor: 0,
+    });
+  });
+
+  it('contestação perdida sem prova depois do repasse vira dívida do CNPJ (D16)', async () => {
+    const { service, debtRows } = setup();
+    await service.recordSale(SALE);
+    await service.releaseDue();
+    await service.closeDispute('pi_1', 'lost_platform_absorbs');
+    expect(debtRows.rows.size).toBe(0);
+    await service.closeDispute('pi_1', 'lost_partner_pays');
+    expect([...debtRows.rows.values()]).toEqual([
+      expect.objectContaining({ reason: 'dispute_lost', accountKey: 'key-1', amountMinor: 9000 }),
+    ]);
+  });
+
+  it('reembolso depois do repasse vira dívida pela diferença (B29)', async () => {
+    const { service, repo, debtRows } = setup();
+    await service.recordSale(SALE);
+    await service.releaseDue();
+    const refund = { ...SALE, refundKey: 'ref_1', amountMinor: 5300, serviceFeeMinor: 300 };
+    await service.applyRefund(refund);
+    await service.applyRefund(refund);
+    expect(repo.rows.get('po_ticket_order_ord_1')).toMatchObject({
+      status: 'released',
+      partnerAmountMinor: 4500,
+    });
+    expect([...debtRows.rows.values()]).toEqual([
+      expect.objectContaining({ reason: 'post_release_refund', amountMinor: 4500 }),
+    ]);
+  });
+
+  it('dívida vencida sai do repasse e a transferência leva o resto', async () => {
+    const { service, transfers, debts, repo, clock } = setup('2026-12-20T00:00:00.000Z');
+    await debts.createDebt({
+      accountKey: 'key-1',
+      reason: 'cancellation_penalty',
+      referenceType: 'booking_slot',
+      referenceId: 'slot-1',
+      amountMinor: 2500,
+    });
+    await service.recordSale(SALE);
+    clock.value = new Date('2026-12-23T04:00:00.000Z');
+    await service.releaseDue();
+    expect(transfers.createTransfer).toHaveBeenCalledWith(
+      expect.objectContaining({ amountMinor: 6500 })
+    );
+    expect(repo.rows.get('po_ticket_order_ord_1')).toMatchObject({
+      status: 'released',
+      offsetMinor: 2500,
     });
   });
+
+  it('dívida que consome todo o repasse: libera sem transferir', async () => {
+    const { service, transfers, debts, repo, clock } = setup('2026-12-20T00:00:00.000Z');
+    await debts.createDebt({
+      accountKey: 'key-1',
+      reason: 'dispute_lost',
+      referenceType: 'ticket_order',
+      referenceId: 'ord_0',
+      amountMinor: 20000,
+    });
+    await service.recordSale(SALE);
+    clock.value = new Date('2026-12-23T04:00:00.000Z');
+    expect((await service.releaseDue()).released).toBe(1);
+    expect(transfers.createTransfer).not.toHaveBeenCalled();
+    expect(repo.rows.get('po_ticket_order_ord_1')?.offsetMinor).toBe(9000);
+  });
 });

=== server/domain/payment/services/payoutService.ts — diff ===
@@ -1,6 +1,7 @@
 import type { PayoutEntryRepositoryPort } from '../ports/payoutEntryRepositoryPort';
 import type { PayoutTransferPort } from '../ports/payoutTransferPort';
 import type { PayoutEntry } from '../types/payoutEntry';
+import type { DebtService } from './debtService';
 import { computeReleaseAt, partnerAmountAfterRefunds } from '../utils/payoutRules';
 
 export interface RecordSaleInput {
@@ -22,6 +23,9 @@ export interface ReleaseSummary {
   failed: number;
 }
 
+/** Contestação encerrada, do ponto de vista do repasse (D14, D16). */
+export type DisputeOutcome = 'won' | 'lost_platform_absorbs' | 'lost_partner_pays';
+
 /** Consulta só o que o repasse precisa da conta do CNPJ (evita depender do serviço inteiro). */
 export interface PayoutDestinationLookup {
   getPayoutDestination(accountKey: string): Promise<string | null>;
@@ -37,9 +41,14 @@ export class PayoutService {
     private readonly entries: PayoutEntryRepositoryPort,
     private readonly transfers: PayoutTransferPort,
     private readonly accounts: PayoutDestinationLookup,
+    private readonly debts: Pick<DebtService, 'offsetFromPayout' | 'createDebt'>,
     private readonly now: () => Date = () => new Date()
   ) {}
 
+  async getForReference(referenceType: string, referenceId: string): Promise<PayoutEntry | null> {
+    return this.entries.get(entryIdFor(referenceType, referenceId));
+  }
+
   /** Chamado pelo webhook de pagamento confirmado; repetir não cria outra entrada. */
   async recordSale(input: RecordSaleInput): Promise<PayoutEntry> {
     const nowIso = this.now().toISOString();
@@ -76,8 +85,9 @@ export class PayoutService {
     serviceFeeMinor: number;
   }): Promise<PayoutEntry | null> {
     const id = entryIdFor(params.referenceType, params.referenceId);
-    return this.entries.update(id, (entry) => {
-      if (entry.refunds[params.refundKey] || entry.status === 'released') return null;
+    let owedBack = 0;
+    const updated = await this.entries.update(id, (entry) => {
+      if (entry.refunds[params.refundKey]) return null;
       const refunds = {
         ...entry.refunds,
         [params.refundKey]: {
@@ -92,6 +102,11 @@ export class PayoutService {
         0
       );
       const { partnerAmountMinor } = partnerAmountAfterRefunds({ ...entry, refundedServiceMinor });
+      if (entry.status === 'released') {
+        // Já transferido: a diferença vira dívida do CNPJ (B29), e a entrada registra o reembolso.
+        owedBack = Math.max(0, entry.partnerAmountMinor - partnerAmountMinor);
+        return { ...entry, refunds, partnerAmountMinor, updatedAt: this.now().toISOString() };
+      }
       const fullyRefunded = refundedMinor >= entry.grossMinor;
       return {
         ...entry,
@@ -103,6 +118,16 @@ export class PayoutService {
         updatedAt: this.now().toISOString(),
       };
     });
+    if (updated && owedBack > 0) {
+      await this.debts.createDebt({
+        accountKey: updated.accountKey,
+        reason: 'post_release_refund',
+        referenceType: updated.referenceType,
+        referenceId: `${updated.referenceId}_${params.refundKey}`,
+        amountMinor: owedBack,
+      });
+    }
+    return updated;
   }
 
   /** Contestação aberta: o repasse espera a decisão (D14). */
@@ -121,22 +146,41 @@ export class PayoutService {
     );
   }
 
-  /** Contestação encerrada: ganha, o repasse volta à fila; perdida, o proprietário não recebe a venda. */
-  async closeDispute(paymentIntentId: string, won: boolean): Promise<PayoutEntry | null> {
+  /**
+   * Contestação encerrada. Ganha, ou perdida com prova de uso (a plataforma arca), o repasse volta à
+   * fila. Perdida sem prova: o proprietário não recebe a venda ou, se já recebeu, a parte dele vira
+   * dívida do CNPJ (D14, D16).
+   */
+  async closeDispute(
+    paymentIntentId: string,
+    outcome: DisputeOutcome
+  ): Promise<PayoutEntry | null> {
     const entry = await this.entries.getByPaymentIntentId(paymentIntentId);
     if (!entry) return null;
+    if (entry.status === 'released') {
+      if (outcome === 'lost_partner_pays') {
+        await this.debts.createDebt({
+          accountKey: entry.accountKey,
+          reason: 'dispute_lost',
+          referenceType: entry.referenceType,
+          referenceId: entry.referenceId,
+          amountMinor: entry.partnerAmountMinor,
+        });
+      }
+      return entry;
+    }
     return this.entries.update(entry.id, (current) => {
       if (current.status !== 'on_hold' || current.holdReason !== 'dispute') return null;
       const { holdReason: _released, ...rest } = current;
-      return won
-        ? { ...rest, status: 'pending', updatedAt: this.now().toISOString() }
-        : {
+      return outcome === 'lost_partner_pays'
+        ? {
             ...rest,
             status: 'canceled',
             canceledReason: 'dispute_lost',
             partnerAmountMinor: 0,
             updatedAt: this.now().toISOString(),
-          };
+          }
+        : { ...rest, status: 'pending', updatedAt: this.now().toISOString() };
     });
   }
 
@@ -151,10 +195,17 @@ export class PayoutService {
           summary.waitingAccount += 1;
           continue;
         }
+        // Dívida vencida do CNPJ sai do repasse antes da transferência (D14).
+        const offsetMinor = await this.debts.offsetFromPayout({
+          accountKey: entry.accountKey,
+          payoutEntryId: entry.id,
+          availableMinor: entry.partnerAmountMinor,
+        });
+        const transferMinor = entry.partnerAmountMinor - offsetMinor;
         const transfer =
-          entry.partnerAmountMinor > 0
+          transferMinor > 0
             ? await this.transfers.createTransfer({
-                amountMinor: entry.partnerAmountMinor,
+                amountMinor: transferMinor,
                 destinationAccountId: destination,
                 sourceChargeId: entry.chargeId,
                 transferGroup: entry.referenceId,
@@ -173,6 +224,7 @@ export class PayoutService {
                 ...current,
                 status: 'released',
                 ...(transfer ? { transferId: transfer.transferId } : {}),
+                ...(offsetMinor > 0 ? { offsetMinor } : {}),
                 releasedAt: this.now().toISOString(),
                 updatedAt: this.now().toISOString(),
               }

=== server/domain/payment/types/accountDebt.ts — ARQUIVO NOVO, conteúdo completo ===
/**
 * `accountDebts/{id}`: dívida de um CNPJ com a plataforma (D14, D16). Classe interna (financeiro).
 * Vence em 24 h; vencida, bloqueia novas vendas do CNPJ e é descontada dos repasses.
 */
export type AccountDebtReason = 'cancellation_penalty' | 'dispute_lost' | 'post_release_refund';

export type AccountDebtStatus = 'open' | 'paid' | 'waived';

export interface AccountDebt {
  id: string;
  accountKey: string;
  reason: AccountDebtReason;
  /** O que gerou a dívida ('event_occurrence', 'booking_slot', 'ticket_order', 'booking'). */
  referenceType: string;
  referenceId: string;
  amountMinor: number;
  /** Descontos já feitos em repasses, por entrada de repasse: repetir a liberação não desconta de novo. */
  offsets: Record<string, number>;
  status: AccountDebtStatus;
  dueAt: string;
  paymentIntentId?: string;
  paidAt?: string;
  waivedBy?: string;
  createdAt: string;
  updatedAt: string;
}

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
  createdAt: string;
}

=== server/domain/payment/types/payoutEntry.ts — diff ===
@@ -33,6 +33,8 @@ export interface PayoutEntry {
   /** Reembolsos já descontados, por chave do reembolso: repetir o mesmo não desconta de novo. */
   refunds: Record<string, PayoutRefundApplied>;
   transferId?: string;
+  /** Parte do repasse usada para quitar dívidas vencidas do CNPJ (D14). */
+  offsetMinor?: number;
   releasedAt?: string;
   canceledReason?: 'fully_refunded' | 'dispute_lost';
   createdAt: string;

=== server/domain/payment/usecases/closePayoutDisputeUseCase.ts — ARQUIVO REESCRITO, substitua todo o conteúdo por este ===
import { payoutService } from '../factory';
import type { DisputeOutcome } from '../services/payoutService';
import type { PayoutEntry } from '../types/payoutEntry';

export function closePayoutDisputeUseCase(
  paymentIntentId: string,
  outcome: DisputeOutcome
): Promise<PayoutEntry | null> {
  return payoutService.closeDispute(paymentIntentId, outcome);
}

=== server/domain/payment/usecases/createAccountDebtUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { debtService } from '../factory';
import type { CreateDebtInput } from '../services/debtService';
import type { AccountDebt } from '../types/accountDebt';

/** Cria a dívida do CNPJ (multa, contestação ou reembolso depois do repasse); repetir não duplica. */
export function createAccountDebtUseCase(input: CreateDebtInput): Promise<AccountDebt | null> {
  return debtService.createDebt(input);
}

=== server/domain/payment/usecases/getPayoutEntryForReferenceUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { payoutService } from '../factory';
import type { PayoutEntry } from '../types/payoutEntry';

export function getPayoutEntryForReferenceUseCase(
  referenceType: string,
  referenceId: string
): Promise<PayoutEntry | null> {
  return payoutService.getForReference(referenceType, referenceId);
}

=== server/domain/payment/usecases/listAccountDebtsUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { debtService } from '../factory';
import type { AccountDebtView } from '../types/accountDebt';

export function listAccountDebtsUseCase(accountKeys: string[]): Promise<AccountDebtView[]> {
  return debtService.listForAccounts(accountKeys);
}

=== server/domain/payment/usecases/markAccountDebtPaidUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { debtService } from '../factory';
import type { AccountDebt } from '../types/accountDebt';

export function markAccountDebtPaidUseCase(
  debtId: string,
  paymentIntentId: string
): Promise<AccountDebt | null> {
  return debtService.markPaid(debtId, paymentIntentId);
}

=== server/domain/payment/usecases/startAccountDebtPaymentUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { debtService } from '../factory';

/** `accountKeys` são os CNPJs do parceiro logado: dívida de outro CNPJ responde 404. */
export function startAccountDebtPaymentUseCase(
  debtId: string,
  accountKeys: string[]
): Promise<{ clientSecret: string }> {
  return debtService.startPayment(debtId, accountKeys);
}

=== server/domain/payment/usecases/waiveAccountDebtUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { debtService } from '../factory';
import type { AccountDebt } from '../types/accountDebt';

export function waiveAccountDebtUseCase(debtId: string, adminUid: string): Promise<AccountDebt> {
  return debtService.waive(debtId, adminUid);
}

=== server/domain/payment/utils/debtRules.ts — ARQUIVO NOVO, conteúdo completo ===
import type { AccountDebt } from '../types/accountDebt';

/** Multa do cancelamento pelo proprietário: 20% do valor vendido, sem as taxas de serviço (D14). */
export const CANCELLATION_PENALTY_BPS = 2000;

/** Prazo para pagar antes do desconto nos repasses e do bloqueio de vendas (D14). */
export const DEBT_DUE_HOURS = 24;

export function cancellationPenaltyMinor(soldServiceValueMinor: number): number {
  // Arredonda para baixo, a favor do proprietário.
  return Math.floor((Math.max(0, soldServiceValueMinor) * CANCELLATION_PENALTY_BPS) / 10_000);
}

export function debtDueAt(now: Date): string {
  return new Date(now.getTime() + DEBT_DUE_HOURS * 60 * 60 * 1000).toISOString();
}

export function remainingDebtMinor(debt: AccountDebt): number {
  const offset = Object.values(debt.offsets).reduce((sum, value) => sum + value, 0);
  return Math.max(0, debt.amountMinor - offset);
}

export function isDebtOverdue(debt: AccountDebt, now: Date): boolean {
  return debt.status === 'open' && remainingDebtMinor(debt) > 0 && debt.dueAt <= now.toISOString();
}

=== server/domain/ticketing/index.ts — diff ===
@@ -4,6 +4,7 @@ export { confirmTicketOrderPaymentUseCase } from './usecases/confirmTicketOrderP
 export { createEventPromoCodeUseCase } from './usecases/createEventPromoCodeUseCase';
 export { createOfflineCheckInSessionUseCase } from './usecases/createOfflineCheckInSessionUseCase';
 export { createTicketOrderUseCase } from './usecases/createTicketOrderUseCase';
+export { hasCheckedInTicketForOrderUseCase } from './usecases/hasCheckedInTicketForOrderUseCase';
 export { createTicketTypeUseCase } from './usecases/createTicketTypeUseCase';
 export { expireAllOverdueOrdersUseCase } from './usecases/expireAllOverdueOrdersUseCase';
 export { expireTicketOrderUseCase } from './usecases/expireTicketOrderUseCase';

=== server/domain/ticketing/services/checkInService.ts — diff ===
@@ -18,6 +18,12 @@ export class CheckInService {
     private readonly qrTokenPort?: TicketQrTokenPort
   ) {}
 
+  /** Prova de uso numa contestação: algum ingresso do pedido passou pelo check-in (D14). */
+  async orderHasCheckIn(orderId: string): Promise<boolean> {
+    const tickets = await this.port.listTicketsByOrderId(orderId);
+    return tickets.some((ticket) => ticket.status === 'checked_in');
+  }
+
   async generateTicketPresentationQr(
     actor: TicketingActorContext,
     ticketId: string

=== server/domain/ticketing/usecases/hasCheckedInTicketForOrderUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { checkInService } from '../factory';

export function hasCheckedInTicketForOrderUseCase(orderId: string): Promise<boolean> {
  return checkInService.orderHasCheckIn(orderId);
}

=== server/interfaces/http/paymentAccounts/paymentAccountController.ts — diff ===
@@ -1,13 +1,16 @@
 import type { Response } from 'express';
 import { listPartnerPaymentAccountsApplicationUseCase } from '../../../application/usecases/paymentAccounts/listPartnerPaymentAccountsApplicationUseCase';
 import { startPaymentAccountSessionApplicationUseCase } from '../../../application/usecases/paymentAccounts/startPaymentAccountSessionApplicationUseCase';
+import { listPartnerDebtsApplicationUseCase } from '../../../application/usecases/paymentAccounts/listPartnerDebtsApplicationUseCase';
+import { startPartnerDebtPaymentApplicationUseCase } from '../../../application/usecases/paymentAccounts/startPartnerDebtPaymentApplicationUseCase';
 import { acceptPartnerTermsApplicationUseCase } from '../../../application/usecases/paymentAccounts/acceptPartnerTermsApplicationUseCase';
 import { getPartnerTermsApplicationUseCase } from '../../../application/usecases/paymentAccounts/getPartnerTermsApplicationUseCase';
 import { ListingVerificationError, PartnerDomainError } from '../../../domain/partners';
-import { PaymentDomainError } from '../../../domain/payment';
+import { PaymentDomainError, waiveAccountDebtUseCase } from '../../../domain/payment';
 import type { AuthenticatedRequest } from '../../../infrastructure/auth/authenticatedRequest';
 import {
   AcceptPartnerTermsSchema,
+  AccountDebtParamsSchema,
   ListPaymentAccountsQuerySchema,
   PaymentAccountSessionSchema,
 } from './schemas/paymentAccountSchemas';
@@ -73,6 +76,44 @@ export class PaymentAccountController {
     }
   }
 
+  static async listDebts(req: AuthenticatedRequest, res: Response): Promise<Response> {
+    if (!req.user?.uid) return sendError(res, 401, 'UNAUTHENTICATED', 'Não autenticado.');
+    try {
+      return res.status(200).json({ data: await listPartnerDebtsApplicationUseCase(req.user.uid) });
+    } catch (error) {
+      return handleError(res, error, 'listDebts');
+    }
+  }
+
+  static async payDebt(req: AuthenticatedRequest, res: Response): Promise<Response> {
+    if (!req.user?.uid) return sendError(res, 401, 'UNAUTHENTICATED', 'Não autenticado.');
+    const params = AccountDebtParamsSchema.safeParse(req.params);
+    if (!params.success) return sendError(res, 400, 'VALIDATION_ERROR', 'Dívida inválida.');
+    try {
+      const payment = await startPartnerDebtPaymentApplicationUseCase(
+        req.user.uid,
+        params.data.debtId
+      );
+      return res.status(200).json({ data: payment });
+    } catch (error) {
+      return handleError(res, error, 'payDebt');
+    }
+  }
+
+  static async waiveDebt(req: AuthenticatedRequest, res: Response): Promise<Response> {
+    if (!req.user?.uid) return sendError(res, 401, 'UNAUTHENTICATED', 'Não autenticado.');
+    if (req.user.admin !== true) return sendError(res, 403, 'FORBIDDEN', 'Acesso restrito.');
+    const params = AccountDebtParamsSchema.safeParse(req.params);
+    if (!params.success) return sendError(res, 400, 'VALIDATION_ERROR', 'Dívida inválida.');
+    try {
+      const debt = await waiveAccountDebtUseCase(params.data.debtId, req.user.uid);
+      console.info('[audit] account_debt_waived', { debtId: debt.id, adminUid: req.user.uid });
+      return res.status(200).json({ data: { id: debt.id, status: debt.status } });
+    } catch (error) {
+      return handleError(res, error, 'waiveDebt');
+    }
+  }
+
   static async createSession(req: AuthenticatedRequest, res: Response): Promise<Response> {
     if (!req.user?.uid) return sendError(res, 401, 'UNAUTHENTICATED', 'Não autenticado.');
     const body = PaymentAccountSessionSchema.safeParse(req.body);

=== server/interfaces/http/paymentAccounts/paymentAccountDebtController.test.ts — ARQUIVO NOVO, conteúdo completo ===
import type { Response } from 'express';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { AuthenticatedRequest } from '../../../infrastructure/auth/authenticatedRequest';

const m = vi.hoisted(() => ({ list: vi.fn(), pay: vi.fn(), waive: vi.fn() }));

vi.mock('../../../application/usecases/paymentAccounts/listPartnerDebtsApplicationUseCase', () => ({
  listPartnerDebtsApplicationUseCase: m.list,
}));
vi.mock(
  '../../../application/usecases/paymentAccounts/startPartnerDebtPaymentApplicationUseCase',
  () => ({ startPartnerDebtPaymentApplicationUseCase: m.pay })
);
vi.mock('../../../domain/payment', async () => {
  const { PaymentDomainError } = await import(
    '../../../domain/payment/services/stripePaymentService'
  );
  return { PaymentDomainError, waiveAccountDebtUseCase: m.waive };
});

import { PaymentDomainError } from '../../../domain/payment/services/stripePaymentService';
import { PaymentAccountController } from './paymentAccountController';

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

describe('PaymentAccountController — dívidas (D16)', () => {
  beforeEach(() => vi.clearAllMocks());

  it('lista só as dívidas dos CNPJs de quem está logado', async () => {
    m.list.mockResolvedValue([]);
    const res = response();
    await PaymentAccountController.listDebts(request({}), res as unknown as Response);
    expect(m.list).toHaveBeenCalledWith('owner-1');
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('pagar: ID inválido 400; dívida de outro parceiro (IDOR) 404', async () => {
    const invalid = response();
    await PaymentAccountController.payDebt(
      request({ params: { debtId: '../x' } as never }),
      invalid as unknown as Response
    );
    expect(invalid.status).toHaveBeenCalledWith(400);
    m.pay.mockRejectedValue(new PaymentDomainError('NOT_FOUND', 'Dívida não encontrada.', 404));
    const res = response();
    await PaymentAccountController.payDebt(
      request({ params: { debtId: 'debt_x' } as never }),
      res as unknown as Response
    );
    expect(m.pay).toHaveBeenCalledWith('owner-1', 'debt_x');
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('perdoar é só do admin', async () => {
    const res = response();
    await PaymentAccountController.waiveDebt(
      request({ params: { debtId: 'debt_x' } as never }),
      res as unknown as Response
    );
    expect(res.status).toHaveBeenCalledWith(403);
    expect(m.waive).not.toHaveBeenCalled();
    m.waive.mockResolvedValue({ id: 'debt_x', status: 'waived' });
    const ok = response();
    await PaymentAccountController.waiveDebt(
      request({ user: ADMIN as never, params: { debtId: 'debt_x' } as never }),
      ok as unknown as Response
    );
    expect(m.waive).toHaveBeenCalledWith('debt_x', 'admin-1');
    expect(ok.json).toHaveBeenCalledWith({ data: { id: 'debt_x', status: 'waived' } });
  });
});

=== server/interfaces/http/paymentAccounts/paymentAccountRoutes.ts — diff ===
@@ -12,6 +12,9 @@ const router = Router();
 
 router.get('/', verifyAuthToken, PaymentAccountController.list);
 router.post('/session', verifyAuthTokenStrict, PaymentAccountController.createSession);
+router.get('/debts', verifyAuthToken, PaymentAccountController.listDebts);
+router.post('/debts/:debtId/payment', verifyAuthTokenStrict, PaymentAccountController.payDebt);
+router.post('/debts/:debtId/waive', verifyAuthTokenStrict, PaymentAccountController.waiveDebt);
 router.get('/terms', verifyAuthToken, PaymentAccountController.getTerms);
 router.post('/terms', verifyAuthTokenStrict, PaymentAccountController.acceptTerms);

=== server/interfaces/http/paymentAccounts/schemas/paymentAccountSchemas.ts — diff ===
@@ -9,6 +9,17 @@ export const AcceptPartnerTermsSchema = z
   .object({ version: z.string().trim().min(1).max(40) })
   .strict();
 
+// IDs de dívida são determinísticos (`debt_<motivo>_<tipo>_<referência>`).
+export const AccountDebtParamsSchema = z
+  .object({
+    debtId: z
+      .string()
+      .min(1)
+      .max(200)
+      .regex(/^[\w-]+$/),
+  })
+  .strict();
+
 export const ListPaymentAccountsQuerySchema = z
   .object({
     ownerUid: z

VERIFICAÇÃO (obrigatória):
- `npm run typecheck`, `npx biome lint .` (0 erros; arquivos tocados sem avisos), `npm run build`;
- `npm run test:rules` (firestore.rules mudou);
- testes ligados aos arquivos deste prompt: `npx vitest related --run firestore.rules.security.test.ts server/application/usecases/bookings/bookingApplicationUseCases.test.ts server/application/usecases/bookings/cancelSlotByPartnerApplicationUseCase.ts server/application/usecases/cancelEventOccurrenceAndRefundApplicationUseCase.ts server/application/usecases/eventLifecycleOrchestration.test.ts server/application/usecases/paymentAccounts/listPartnerDebtsApplicationUseCase.ts server/application/usecases/paymentAccounts/paymentAccountApplicationUseCases.test.ts server/application/usecases/paymentAccounts/startPartnerDebtPaymentApplicationUseCase.ts server/application/usecases/payouts/chargeCancellationPenaltyApplicationUseCase.test.ts server/application/usecases/payouts/chargeCancellationPenaltyApplicationUseCase.ts server/application/usecases/payouts/disputeOutcomeApplicationUseCase.ts server/application/usecases/reconcileStripeWebhookEventApplicationUseCase.ts server/application/usecases/ticketingPaymentOrchestration.test.ts server/domain/payment/adapters/firestoreAccountDebtAdapter.ts server/domain/payment/adapters/inMemoryAccountDebtAdapter.ts server/domain/payment/factory.ts server/domain/payment/index.ts server/domain/payment/ports/accountDebtRepositoryPort.ts server/domain/payment/services/debtService.test.ts server/domain/payment/services/debtService.ts server/domain/payment/services/paymentAccountService.test.ts server/domain/payment/services/paymentAccountService.ts server/domain/payment/services/payoutService.test.ts server/domain/payment/services/payoutService.ts server/domain/payment/types/accountDebt.ts server/domain/payment/types/payoutEntry.ts server/domain/payment/usecases/closePayoutDisputeUseCase.ts server/domain/payment/usecases/createAccountDebtUseCase.ts server/domain/payment/usecases/getPayoutEntryForReferenceUseCase.ts server/domain/payment/usecases/listAccountDebtsUseCase.ts server/domain/payment/usecases/markAccountDebtPaidUseCase.ts server/domain/payment/usecases/startAccountDebtPaymentUseCase.ts server/domain/payment/usecases/waiveAccountDebtUseCase.ts server/domain/payment/utils/debtRules.ts server/domain/ticketing/index.ts server/domain/ticketing/services/checkInService.ts server/domain/ticketing/usecases/hasCheckedInTicketForOrderUseCase.ts server/interfaces/http/paymentAccounts/paymentAccountController.ts server/interfaces/http/paymentAccounts/paymentAccountDebtController.test.ts server/interfaces/http/paymentAccounts/paymentAccountRoutes.ts server/interfaces/http/paymentAccounts/schemas/paymentAccountSchemas.ts` (todos verdes). Não precisa rodar a suíte inteira.

LIMPEZA (obrigatória, ao terminar de implementar): apague todos os arquivos de public/assets/aistudio/, inclusive o deste prompt. São cópias dos textos colados no chat, salvas automaticamente pelo AI Studio, e public/ vai para o site publicado. Se a pasta ficar vazia, apague a pasta também.
~~~~

### Configurações manuais (você faz, fora do AI Studio, depois de aplicar este prompt)

1. Publique as regras e os índices do Firestore: `firebase deploy --only firestore:rules,firestore:indexes`. Espere os índices novos ficarem "Ativado" no Console do Firebase (Firestore → Índices) antes de testar. Índices novos: accountDebts (accountKey, status, createdAt) e accountDebts (accountKey, createdAt decrescente).
2. Nenhuma variável de ambiente nova e nenhuma mudança no Stripe: o pagamento da dívida usa o evento payment_intent.succeeded, que já está assinado.
