# Prompt 18.4d.2 — Reclamações do comprador (D16)

> Lote 17, gerado do commit de referência `a2c644f` da branch `claude/agents-md-v2`. Aplique depois do 18.4d.1. Cole o bloco abaixo no agente do AI Studio, inteiro, de uma vez.

---

## Prompt 18.4d.2 — Reclamações do comprador (D16)

Segunda parte do 18.4d (só backend). As telas vêm no 18.4f (comprador e admin).

~~~~text
Siga o AGENTS.md. NÃO altere o AGENTS.md. O app ainda não foi liberado para usuários: nenhum código de compatibilidade ou transição (§2.2 item 8).

IMPORTANTE: aplique os diffs abaixo EXATAMENTE, inclusive os arquivos novos. Não reescreva os arquivos do seu jeito. Arquivo tocado sai sem avisos do lint e formatado (AGENTS.md §13). Nenhuma dependência nova.

DECISÕES D14 (reclamação suspende o repasse por até 5 dias) e D16 item 2A (motivos em lista fechada, até 48 h depois do fim do serviço), em docs/arquitetura/decisoes.md.

O QUE MUDA:
1) Repasse: o campo holdReason vira holdReasons (lista: dispute, claim). Contestação e reclamação podem reter a mesma venda; o fim de uma não solta a outra. Novo PayoutService.setHold.
2) Domínio payment (folha): coleção saleClaims (regra allow read, write: if false, com teste; índices buyerUid + openedAt desc e status + decideBy). SaleClaimService: open (do início do serviço até 48 h depois do fim; uma por venda; retém o repasse; prazo de decisão de 5 dias); decide do admin (release, refund_full com a taxa de serviço, ou refund_partial só do valor do proprietário; o repasse fica retido até o reembolso concluir; cada tentativa usa outra chave de idempotência); completeRefund e failRefund pelo webhook; expireDue (sem decisão em 5 dias, o repasse é liberado), rodando no job /internal/payouts/release antes da liberação.
3) Aplicação: openSaleClaimApplicationUseCase confere que quem reclama é o comprador (pedido de outra pessoa responde 404), pega as datas da sessão ou da reserva e avisa o parceiro sem o texto do comprador. decideSaleClaimApplicationUseCase aceita chargePenalty (cancelamento silencioso: só com did_not_happen e reembolso integral), que cobra a multa de 20% antes do reembolso.
4) Webhook: refund.updated com metadata.referenceType = claim_refund vai para a reclamação.
5) Rotas: POST /api/sale-claims (201; token com checkRevoked), GET /api/sale-claims/mine, GET /api/admin/sale-claims?limit=&cursor= (só admin) e POST /api/admin/sale-claims/:claimId/decision (só admin, token com checkRevoked, log de auditoria sem o texto do comprador).
6) docs/arquitetura/debitos.md: novo B30 (o reembolso da reclamação não muda o status do pedido ou da reserva; sem rate limit na abertura).

ARQUIVOS (crie, altere ou apague exatamente estes):
- docs/arquitetura/debitos.md (alterar)
- firestore.indexes.json (alterar)
- firestore.rules (alterar)
- firestore.rules.security.test.ts (alterar)
- server.ts (alterar)
- server/application/usecases/payouts/chargeCancellationPenaltyApplicationUseCase.ts (alterar)
- server/application/usecases/payouts/decideSaleClaimApplicationUseCase.ts (criar)
- server/application/usecases/payouts/openSaleClaimApplicationUseCase.ts (criar)
- server/application/usecases/payouts/saleClaimApplicationUseCases.test.ts (criar)
- server/application/usecases/reconcileStripeWebhookEventApplicationUseCase.ts (alterar)
- server/application/usecases/ticketingPaymentOrchestration.test.ts (alterar)
- server/domain/payment/adapters/firestoreSaleClaimAdapter.ts (criar)
- server/domain/payment/adapters/inMemorySaleClaimAdapter.ts (criar)
- server/domain/payment/factory.ts (alterar)
- server/domain/payment/index.ts (alterar)
- server/domain/payment/ports/saleClaimRepositoryPort.ts (criar)
- server/domain/payment/services/payoutService.ts (alterar)
- server/domain/payment/services/saleClaimService.test.ts (criar)
- server/domain/payment/services/saleClaimService.ts (criar)
- server/domain/payment/types/accountDebt.ts (alterar)
- server/domain/payment/types/payoutEntry.ts (alterar)
- server/domain/payment/types/saleClaim.ts (criar)
- server/domain/payment/usecases/decideSaleClaimUseCase.ts (criar)
- server/domain/payment/usecases/getSaleClaimUseCase.ts (criar)
- server/domain/payment/usecases/listMySaleClaimsUseCase.ts (criar)
- server/domain/payment/usecases/listPendingSaleClaimsUseCase.ts (criar)
- server/domain/payment/usecases/openSaleClaimUseCase.ts (criar)
- server/domain/payment/usecases/releaseDuePayoutsUseCase.ts (alterar)
- server/domain/payment/usecases/settleSaleClaimRefundUseCase.ts (criar)
- server/domain/payment/utils/payoutRules.ts (alterar)
- server/interfaces/http/saleClaims/saleClaimController.test.ts (criar)
- server/interfaces/http/saleClaims/saleClaimController.ts (criar)
- server/interfaces/http/saleClaims/saleClaimRoutes.ts (criar)
- server/interfaces/http/saleClaims/schemas/saleClaimSchemas.ts (criar)

Aplique as mudanças abaixo EXATAMENTE como estão (formato unified diff: linhas com "-" saem, linhas com "+" entram; as demais são contexto para localizar o trecho). Não reformate outros trechos dos arquivos.

=== docs/arquitetura/debitos.md — diff ===
@@ -20,6 +20,7 @@
 | B25 | `src/index.css`: o tema claro ainda depende de sobrescritas globais com `!important` (`:root.light .text-white`, `.bg-white/5`, `.border-white/10`…) para as telas que usam cores fixas; `biome-ignore-all lint/complexity/noImportantStyles` no topo do arquivo | §11.1 (tokens, nunca `text-white` fixo em superfície que muda) e §13 (sem avisos) | médio — cor nova sem token pode sair ilegível no claro; as sobrescritas valem para o app todo | cada tela tocada passa a usar os tokens `--ug-*` (`text-ink`, `bg-surface`, `border-line`, `text-warn`…); quando nenhuma usar mais as classes fixas, as sobrescritas e o `biome-ignore-all` saem |
 | B26 | Avisos de conta financeira no painel de ingressos (`usePartnerMerchantAccount`) e de reservas (`PartnerBookingsComposition`): consideram pronto quando **algum** CNPJ da conta está pronto para receber, não o CNPJ do evento ou da oferta | D14 (conta por documento) | baixo — só o aviso na tela; a venda e a publicação conferem a conta do CNPJ certo no backend (`assertListingCanSellUseCase` + `assertPaymentAccountReadyUseCase`) | Prompt 18.4e: aviso por estabelecimento; `PartnerEventTicketingManager` (1111 linhas) dividido ao tocar |
 | B28 | `bookings/components/partner/OfferTextFields.tsx` (abas pt-BR/en/fr com tradução à mão) e editor de evento do parceiro (texto só em português) | D5 e AGENTS.md §12.6 (editar no idioma ativo, tradução automática) | médio — visitante em inglês ou francês vê o português, e o parceiro digita traduções que a D5 proíbe | 19.1: `LocalizedText`, `MachineTranslationPort` e outbox; o editor mostra o idioma de Configurações e o salvo vira o original |
+| B30 | `server/domain/payment/services/saleClaimService.ts` e `server/interfaces/http/saleClaims/`: o reembolso decidido numa reclamação não muda o status do pedido de ingresso nem da reserva; e a abertura de reclamação não tem rate limit (o app ainda não tem rate limit com armazenamento compartilhado) | §11.8 (o comprador vê o estado real da compra) e §7.4 (rate limit em rotas de pagamento) | baixo — uma reclamação por venda e só do próprio comprador; a carteira mostra "pago" depois do reembolso até a tela do 18.4f mostrar o status da reclamação | 18.4f: a carteira e Minhas reservas mostram o status da reclamação; rate limit junto com o das outras rotas de pagamento |
 
 ## Resolvidos

=== firestore.indexes.json — diff ===
@@ -359,6 +359,34 @@
           "order": "DESCENDING"
         }
       ]
+    },
+    {
+      "collectionGroup": "saleClaims",
+      "queryScope": "COLLECTION",
+      "fields": [
+        {
+          "fieldPath": "buyerUid",
+          "order": "ASCENDING"
+        },
+        {
+          "fieldPath": "openedAt",
+          "order": "DESCENDING"
+        }
+      ]
+    },
+    {
+      "collectionGroup": "saleClaims",
+      "queryScope": "COLLECTION",
+      "fields": [
+        {
+          "fieldPath": "status",
+          "order": "ASCENDING"
+        },
+        {
+          "fieldPath": "decideBy",
+          "order": "ASCENDING"
+        }
+      ]
     }
   ],
   "fieldOverrides": [

=== firestore.rules — diff ===
@@ -74,6 +74,10 @@ service cloud.firestore {
     match /accountDebts/{debtId} {
       allow read, write: if false;
     }
+    // Reclamação do comprador (D16): confidencial, só backend.
+    match /saleClaims/{claimId} {
+      allow read, write: if false;
+    }
     match /planSubscriptions/{itemId} {
       allow read, write: if false;
     }

=== firestore.rules.security.test.ts — diff ===
@@ -382,6 +382,15 @@ describe('Firestore Rules — Security Suite', () => {
       }
     });
 
+    it('reclamação (D16): saleClaims negado até para o comprador e admin', async () => {
+      const adminDb = testEnv.authenticatedContext('admin-user', { admin: true }).firestore();
+      const buyerDb = testEnv.authenticatedContext('buyer-1').firestore();
+      for (const db of [adminDb, buyerDb]) {
+        await assertFails(getDoc(doc(db, 'saleClaims/claim_booking_bk-1')));
+        await assertFails(setDoc(doc(db, 'saleClaims/claim_booking_bk-1'), { buyerUid: 'buyer-1' }));
+      }
+    });
+
     it('plano (D11): listingPlans negado até para o dono e admin', async () => {
       const adminDb = testEnv.authenticatedContext('admin-user', { admin: true }).firestore();
       const ownerDb = testEnv.authenticatedContext('partner-1').firestore();

=== server.ts — diff ===
@@ -24,6 +24,10 @@ import listingVerificationRouter from './server/interfaces/http/listingVerificat
 import listingStatsRouter from './server/interfaces/http/insights/listingStatsRoutes';
 import listingPlanRouter from './server/interfaces/http/listingPlans/listingPlanRoutes';
 import paymentAccountRouter from './server/interfaces/http/paymentAccounts/paymentAccountRoutes';
+import {
+  adminSaleClaimRouter,
+  saleClaimRouter,
+} from './server/interfaces/http/saleClaims/saleClaimRoutes';
 import {
   bookingsRouter,
   partnerOffersRouter,
@@ -196,6 +200,8 @@ async function startServer() {
   app.use('/api/bookings', bookingsRouter);
   app.use('/api/payment/plans', billingRouter);
   app.use('/api/payment-accounts', paymentAccountRouter);
+  app.use('/api/sale-claims', saleClaimRouter);
+  app.use('/api/admin/sale-claims', adminSaleClaimRouter);
   app.use('/api/payment', paymentRouter);
   app.use('/api/weather', climaWindRouter);
   app.use('/api/notifications', notificationRouter);

=== server/application/usecases/payouts/chargeCancellationPenaltyApplicationUseCase.ts — diff ===
@@ -15,7 +15,7 @@ export interface CanceledSale {
  * mesmo cancelamento não gera outra multa.
  */
 export async function chargeCancellationPenaltyApplicationUseCase(params: {
-  referenceType: 'event_occurrence' | 'booking_slot';
+  referenceType: 'event_occurrence' | 'booking_slot' | 'sale_claim';
   referenceId: string;
   sales: CanceledSale[];
 }): Promise<number> {

=== server/application/usecases/payouts/decideSaleClaimApplicationUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import {
  decideSaleClaimUseCase,
  getSaleClaimUseCase,
  PaymentDomainError,
  type SaleClaim,
  type SaleClaimDecision,
} from '../../../domain/payment';
import { chargeCancellationPenaltyApplicationUseCase } from './chargeCancellationPenaltyApplicationUseCase';

/**
 * Decisão do admin sobre a reclamação (D16). `chargePenalty` vale para o cancelamento silencioso: o serviço
 * não aconteceu e o CNPJ paga a mesma multa de 20% do cancelamento pelo proprietário (D14).
 */
export async function decideSaleClaimApplicationUseCase(
  adminUid: string,
  claimId: string,
  decision: SaleClaimDecision & { chargePenalty?: boolean }
): Promise<SaleClaim> {
  if (decision.chargePenalty) {
    const claim = await getSaleClaimUseCase(claimId);
    if (!claim) throw new PaymentDomainError('NOT_FOUND', 'Reclamação não encontrada.', 404);
    if (claim.reason !== 'did_not_happen' || decision.outcome !== 'refund_full') {
      throw new PaymentDomainError(
        'PENALTY_NOT_ALLOWED',
        'A multa vale só para serviço que não aconteceu, com reembolso integral.',
        422
      );
    }
    if (claim.status !== 'open') {
      throw new PaymentDomainError(
        'CLAIM_ALREADY_DECIDED',
        'Esta reclamação já foi decidida.',
        409
      );
    }
    // Antes do reembolso, que zera o valor vendido; repetir a decisão não gera outra multa.
    await chargeCancellationPenaltyApplicationUseCase({
      referenceType: 'sale_claim',
      referenceId: claim.id,
      sales: [
        {
          referenceType: claim.referenceType === 'booking' ? 'booking' : 'ticket_order',
          referenceId: claim.referenceId,
        },
      ],
    });
  }
  return decideSaleClaimUseCase(claimId, adminUid, {
    outcome: decision.outcome,
    ...(decision.amountMinor !== undefined ? { amountMinor: decision.amountMinor } : {}),
  });
}

=== server/application/usecases/payouts/openSaleClaimApplicationUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { getBookingUseCase } from '../../../domain/bookings';
import { getEventListingByIdUseCase } from '../../../domain/events';
import { createNotificationUseCase } from '../../../domain/notifications';
import {
  type BuyerSaleClaimView,
  openSaleClaimUseCase,
  PaymentDomainError,
  type SaleClaimReason,
} from '../../../domain/payment';
import { getTicketOrderUseCase } from '../../../domain/ticketing';
import type { OrchestrationActor } from '../orchestrationActor';

export interface OpenSaleClaimRequest {
  referenceType: 'ticket_order' | 'booking';
  referenceId: string;
  reason: SaleClaimReason;
  details?: string;
}

interface ClaimedSale {
  startsAt: string;
  endsAt: string;
  sellerPartnerId?: string;
}

const NOT_FOUND = () => new PaymentDomainError('NOT_FOUND', 'Compra não encontrada.', 404);

async function ticketSale(actor: OrchestrationActor, orderId: string): Promise<ClaimedSale> {
  const found = await getTicketOrderUseCase(actor, orderId).catch(() => null);
  const order = found?.order;
  // Só o comprador reclama; pedido de outra pessoa responde como inexistente (AGENTS.md §7.10).
  if (!order || order.buyerId !== actor.uid || !order.eventSnapshot) throw NOT_FOUND();
  if (order.status !== 'paid' && order.status !== 'partially_refunded') {
    throw new PaymentDomainError('CLAIM_NOT_ALLOWED', 'Esta compra não tem valor a reclamar.', 422);
  }
  const listing = await getEventListingByIdUseCase(order.eventListingId);
  return {
    startsAt: order.eventSnapshot.startsAt,
    endsAt: order.eventSnapshot.endsAt || order.eventSnapshot.startsAt,
    sellerPartnerId: listing?.ownerId,
  };
}

async function bookingSale(actor: OrchestrationActor, bookingId: string): Promise<ClaimedSale> {
  const booking = await getBookingUseCase(bookingId);
  if (!booking || booking.buyerId !== actor.uid) throw NOT_FOUND();
  // `no_show` entra: o comprador pode contestar a falta que o parceiro marcou.
  if (!['confirmed', 'completed', 'no_show'].includes(booking.status)) {
    throw new PaymentDomainError('CLAIM_NOT_ALLOWED', 'Esta compra não tem valor a reclamar.', 422);
  }
  const { startsAt, durationMinutes } = booking.offerSnapshot;
  return {
    startsAt,
    endsAt: new Date(new Date(startsAt).getTime() + (durationMinutes ?? 0) * 60_000).toISOString(),
    sellerPartnerId: booking.sellerPartnerId,
  };
}

/** O comprador relata um problema na venda (D16, 2A); o repasse fica retido até a decisão do admin. */
export async function openSaleClaimApplicationUseCase(
  actor: OrchestrationActor,
  request: OpenSaleClaimRequest
): Promise<BuyerSaleClaimView> {
  const sale =
    request.referenceType === 'ticket_order'
      ? await ticketSale(actor, request.referenceId)
      : await bookingSale(actor, request.referenceId);
  const claim = await openSaleClaimUseCase({
    referenceType: request.referenceType,
    referenceId: request.referenceId,
    buyerUid: actor.uid,
    reason: request.reason,
    ...(request.details ? { details: request.details } : {}),
    serviceStartsAt: sale.startsAt,
    serviceEndsAt: sale.endsAt,
  });
  if (sale.sellerPartnerId) {
    // Sem o texto do comprador: o parceiro vê só que o repasse desta venda está em análise.
    await createNotificationUseCase({
      recipientPartnerId: sale.sellerPartnerId,
      type: 'admin_message',
      title: 'Reclamação em análise',
      message:
        'Um comprador relatou um problema. O repasse desta venda fica retido até a decisão, em até 5 dias.',
    }).catch(() => undefined);
  }
  return {
    id: claim.id,
    referenceType: claim.referenceType,
    referenceId: claim.referenceId,
    reason: claim.reason,
    status: claim.status,
    openedAt: claim.openedAt,
    decideBy: claim.decideBy,
  };
}

=== server/application/usecases/payouts/saleClaimApplicationUseCases.test.ts — ARQUIVO NOVO, conteúdo completo ===
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../../domain/bookings', () => ({ getBookingUseCase: vi.fn() }));
vi.mock('../../../domain/events', () => ({
  getEventListingByIdUseCase: vi.fn().mockResolvedValue({ ownerId: 'partner-1' }),
}));
vi.mock('../../../domain/notifications', () => ({
  createNotificationUseCase: vi.fn().mockResolvedValue(undefined),
}));
vi.mock('../../../domain/ticketing', () => ({ getTicketOrderUseCase: vi.fn() }));
vi.mock('../../../domain/payment', async () => {
  const { PaymentDomainError } = await import(
    '../../../domain/payment/services/stripePaymentService'
  );
  return {
    PaymentDomainError,
    openSaleClaimUseCase: vi.fn(async (input: Record<string, unknown>) => ({
      ...input,
      id: 'claim_x',
      status: 'open',
      openedAt: 'a',
      decideBy: 'b',
    })),
    getSaleClaimUseCase: vi.fn(),
    decideSaleClaimUseCase: vi.fn().mockResolvedValue({ id: 'claim_x', status: 'refunded' }),
  };
});
vi.mock('./chargeCancellationPenaltyApplicationUseCase', () => ({
  chargeCancellationPenaltyApplicationUseCase: vi.fn().mockResolvedValue(2000),
}));

import { getBookingUseCase } from '../../../domain/bookings';
import { createNotificationUseCase } from '../../../domain/notifications';
import {
  decideSaleClaimUseCase,
  getSaleClaimUseCase,
  openSaleClaimUseCase,
} from '../../../domain/payment';
import { getTicketOrderUseCase } from '../../../domain/ticketing';
import { chargeCancellationPenaltyApplicationUseCase } from './chargeCancellationPenaltyApplicationUseCase';
import { decideSaleClaimApplicationUseCase } from './decideSaleClaimApplicationUseCase';
import { openSaleClaimApplicationUseCase } from './openSaleClaimApplicationUseCase';

const BUYER = { uid: 'buyer-1' };
const ORDER = {
  id: 'ord_1',
  buyerId: 'buyer-1',
  status: 'paid',
  eventListingId: 'ev-1',
  eventSnapshot: {
    title: 'Show',
    startsAt: '2026-12-20T22:00:00.000Z',
    endsAt: '2026-12-21T03:00:00.000Z',
  },
};

describe('openSaleClaimApplicationUseCase (D16)', () => {
  beforeEach(() => vi.clearAllMocks());

  it('ingresso: datas da sessão, e o parceiro é avisado sem o texto do comprador', async () => {
    vi.mocked(getTicketOrderUseCase).mockResolvedValue({ order: ORDER } as never);
    await openSaleClaimApplicationUseCase(BUYER, {
      referenceType: 'ticket_order',
      referenceId: 'ord_1',
      reason: 'other',
      details: 'texto privado',
    });
    expect(openSaleClaimUseCase).toHaveBeenCalledWith(
      expect.objectContaining({
        buyerUid: 'buyer-1',
        serviceStartsAt: ORDER.eventSnapshot.startsAt,
        serviceEndsAt: ORDER.eventSnapshot.endsAt,
      })
    );
    expect(createNotificationUseCase).toHaveBeenCalledWith(
      expect.objectContaining({ recipientPartnerId: 'partner-1' })
    );
    expect(JSON.stringify(vi.mocked(createNotificationUseCase).mock.calls)).not.toContain(
      'texto privado'
    );
  });

  it('pedido de outra pessoa (IDOR), mesmo do dono do evento: 404', async () => {
    vi.mocked(getTicketOrderUseCase).mockResolvedValue({
      order: { ...ORDER, buyerId: 'buyer-2' },
    } as never);
    await expect(
      openSaleClaimApplicationUseCase(BUYER, {
        referenceType: 'ticket_order',
        referenceId: 'ord_1',
        reason: 'did_not_happen',
      })
    ).rejects.toMatchObject({ code: 'NOT_FOUND', statusCode: 404 });
    expect(openSaleClaimUseCase).not.toHaveBeenCalled();
  });

  it('reserva: fim = início + duração; pendente de pagamento não reclama', async () => {
    const booking = {
      id: 'bk_1',
      buyerId: 'buyer-1',
      sellerPartnerId: 'partner-2',
      status: 'completed',
      offerSnapshot: { startsAt: '2026-12-20T12:00:00.000Z', durationMinutes: 90 },
    };
    vi.mocked(getBookingUseCase).mockResolvedValue(booking as never);
    await openSaleClaimApplicationUseCase(BUYER, {
      referenceType: 'booking',
      referenceId: 'bk_1',
      reason: 'not_as_described',
    });
    expect(openSaleClaimUseCase).toHaveBeenCalledWith(
      expect.objectContaining({ serviceEndsAt: '2026-12-20T13:30:00.000Z' })
    );
    vi.mocked(getBookingUseCase).mockResolvedValue({
      ...booking,
      status: 'pending_payment',
    } as never);
    await expect(
      openSaleClaimApplicationUseCase(BUYER, {
        referenceType: 'booking',
        referenceId: 'bk_1',
        reason: 'not_as_described',
      })
    ).rejects.toMatchObject({ code: 'CLAIM_NOT_ALLOWED' });
  });
});

describe('decideSaleClaimApplicationUseCase (D16)', () => {
  beforeEach(() => vi.clearAllMocks());

  const CLAIM = {
    id: 'claim_x',
    reason: 'did_not_happen',
    status: 'open',
    referenceType: 'booking',
    referenceId: 'bk_1',
  };

  it('multa do cancelamento silencioso antes do reembolso integral', async () => {
    vi.mocked(getSaleClaimUseCase).mockResolvedValue(CLAIM as never);
    await decideSaleClaimApplicationUseCase('admin-1', 'claim_x', {
      outcome: 'refund_full',
      chargePenalty: true,
    });
    expect(chargeCancellationPenaltyApplicationUseCase).toHaveBeenCalledWith({
      referenceType: 'sale_claim',
      referenceId: 'claim_x',
      sales: [{ referenceType: 'booking', referenceId: 'bk_1' }],
    });
    expect(
      vi.mocked(chargeCancellationPenaltyApplicationUseCase).mock.invocationCallOrder[0]
    ).toBeLessThan(vi.mocked(decideSaleClaimUseCase).mock.invocationCallOrder[0] ?? 0);
    expect(decideSaleClaimUseCase).toHaveBeenCalledWith('claim_x', 'admin-1', {
      outcome: 'refund_full',
    });
  });

  it('multa só com "não aconteceu" e reembolso integral', async () => {
    vi.mocked(getSaleClaimUseCase).mockResolvedValue({
      ...CLAIM,
      reason: 'not_as_described',
    } as never);
    await expect(
      decideSaleClaimApplicationUseCase('admin-1', 'claim_x', {
        outcome: 'refund_full',
        chargePenalty: true,
      })
    ).rejects.toMatchObject({ code: 'PENALTY_NOT_ALLOWED' });
    expect(chargeCancellationPenaltyApplicationUseCase).not.toHaveBeenCalled();
    expect(decideSaleClaimUseCase).not.toHaveBeenCalled();
  });
});

=== server/application/usecases/reconcileStripeWebhookEventApplicationUseCase.ts — diff ===
@@ -3,6 +3,7 @@ import {
   closePayoutDisputeUseCase,
   holdPayoutForDisputeUseCase,
   markAccountDebtPaidUseCase,
+  settleSaleClaimRefundUseCase,
   syncPaymentAccountFromWebhookUseCase,
   updatePaymentTransactionStatusUseCase,
   type VerifiedWebhookEvent,
@@ -131,6 +132,14 @@ export async function reconcileStripeWebhookEventApplicationUseCase(
   if (event.type === 'refund.updated' || event.type === 'refund.created') {
     const refundMetadata = (obj.metadata as Record<string, string> | undefined) || {};
     const providerStatus = String(obj.status || '');
+    if (refundMetadata.referenceType === 'claim_refund' && refundMetadata.claimId) {
+      await settleSaleClaimRefundUseCase(
+        refundMetadata.claimId,
+        String(obj.id || ''),
+        providerStatus
+      );
+      return { processed: true, eventType: event.type };
+    }
     if (refundMetadata.refundId) {
       if (providerStatus === 'succeeded') {
         const refund = await finalizeTicketRefundStatusUseCase(

=== server/application/usecases/ticketingPaymentOrchestration.test.ts — diff ===
@@ -10,6 +10,7 @@ vi.mock('../../domain/payment', () => ({
   closePayoutDisputeUseCase: vi.fn(),
   holdPayoutForDisputeUseCase: vi.fn(),
   markAccountDebtPaidUseCase: vi.fn(),
+  settleSaleClaimRefundUseCase: vi.fn(),
   recordSalePayoutUseCase: vi.fn(),
   createPaymentForTicketOrderUseCase: vi.fn(),
   getPaymentReferenceUseCase: vi.fn().mockResolvedValue(null),
@@ -38,6 +39,7 @@ import {
   markAccountDebtPaidUseCase,
   processProviderRefundUseCase,
   recordSalePayoutUseCase,
+  settleSaleClaimRefundUseCase,
   updatePaymentTransactionStatusUseCase,
 } from '../../domain/payment';
 import {
@@ -207,6 +209,21 @@ describe('ticketingPaymentOrchestrationUseCases — repasse (D14)', () => {
     expect(confirmTicketOrderPaymentUseCase).not.toHaveBeenCalled();
   });
 
+  it('reembolso de reclamação vai para a reclamação, não para o pedido (D16)', async () => {
+    await reconcileStripeWebhookEventApplicationUseCase({
+      id: 'evt_claim',
+      type: 'refund.updated',
+      created: 1,
+      dataObject: {
+        id: 're_1',
+        status: 'succeeded',
+        metadata: { referenceType: 'claim_refund', claimId: 'claim_x' },
+      },
+    });
+    expect(settleSaleClaimRefundUseCase).toHaveBeenCalledWith('claim_x', 're_1', 'succeeded');
+    expect(finalizeTicketRefundStatusUseCase).not.toHaveBeenCalled();
+  });
+
   it('contestação perdida: com check-in a plataforma arca, sem check-in o CNPJ paga (D16)', async () => {
     vi.mocked(getPaymentReferenceUseCase).mockResolvedValue({
       referenceType: 'ticket_order',

=== server/domain/payment/adapters/firestoreSaleClaimAdapter.ts — ARQUIVO NOVO, conteúdo completo ===
import { adminDb } from '../../../infrastructure/firebase/adminClient';
import type { SaleClaimRepositoryPort } from '../ports/saleClaimRepositoryPort';
import type { SaleClaim } from '../types/saleClaim';

const CLAIMS = 'saleClaims';

/** Coleção só de backend (`allow read, write: if false`, AGENTS.md §6.2). */
export class FirestoreSaleClaimAdapter implements SaleClaimRepositoryPort {
  async createIfAbsent(claim: SaleClaim): Promise<SaleClaim> {
    const ref = adminDb.collection(CLAIMS).doc(claim.id);
    return adminDb.runTransaction(async (tx) => {
      const snapshot = await tx.get(ref);
      if (snapshot.exists) return snapshot.data() as SaleClaim;
      tx.set(ref, claim);
      return claim;
    });
  }

  async get(id: string): Promise<SaleClaim | null> {
    const snapshot = await adminDb.collection(CLAIMS).doc(id).get();
    return snapshot.exists ? (snapshot.data() as SaleClaim) : null;
  }

  async listByBuyer(buyerUid: string, limit: number): Promise<SaleClaim[]> {
    const snapshot = await adminDb
      .collection(CLAIMS)
      .where('buyerUid', '==', buyerUid)
      .orderBy('openedAt', 'desc')
      .limit(limit)
      .get();
    return snapshot.docs.map((doc) => doc.data() as SaleClaim);
  }

  async listPending(limit: number, cursor?: string): Promise<SaleClaim[]> {
    let query = adminDb
      .collection(CLAIMS)
      .where('status', 'in', ['open', 'refund_pending'])
      .orderBy('decideBy', 'asc')
      .limit(limit);
    if (cursor) {
      const last = await adminDb.collection(CLAIMS).doc(cursor).get();
      if (last.exists) query = query.startAfter(last);
    }
    const snapshot = await query.get();
    return snapshot.docs.map((doc) => doc.data() as SaleClaim);
  }

  async listExpired(nowIso: string, limit: number): Promise<SaleClaim[]> {
    const snapshot = await adminDb
      .collection(CLAIMS)
      .where('status', '==', 'open')
      .where('decideBy', '<=', nowIso)
      .orderBy('decideBy', 'asc')
      .limit(limit)
      .get();
    return snapshot.docs.map((doc) => doc.data() as SaleClaim);
  }

  async update(
    id: string,
    change: (current: SaleClaim) => SaleClaim | null
  ): Promise<SaleClaim | null> {
    const ref = adminDb.collection(CLAIMS).doc(id);
    return adminDb.runTransaction(async (tx) => {
      const snapshot = await tx.get(ref);
      if (!snapshot.exists) return null;
      const current = snapshot.data() as SaleClaim;
      const next = change(current);
      if (!next) return current;
      tx.set(ref, next);
      return next;
    });
  }
}

=== server/domain/payment/adapters/inMemorySaleClaimAdapter.ts — ARQUIVO NOVO, conteúdo completo ===
import type { SaleClaimRepositoryPort } from '../ports/saleClaimRepositoryPort';
import type { SaleClaim } from '../types/saleClaim';

/** Usado só por testes (AGENTS.md §2.2 item 7). */
export class InMemorySaleClaimAdapter implements SaleClaimRepositoryPort {
  readonly rows = new Map<string, SaleClaim>();

  async createIfAbsent(claim: SaleClaim): Promise<SaleClaim> {
    const existing = this.rows.get(claim.id);
    if (existing) return existing;
    this.rows.set(claim.id, claim);
    return claim;
  }

  async get(id: string): Promise<SaleClaim | null> {
    return this.rows.get(id) ?? null;
  }

  async listByBuyer(buyerUid: string, limit: number): Promise<SaleClaim[]> {
    return [...this.rows.values()]
      .filter((claim) => claim.buyerUid === buyerUid)
      .sort((a, b) => b.openedAt.localeCompare(a.openedAt))
      .slice(0, limit);
  }

  async listPending(limit: number, cursor?: string): Promise<SaleClaim[]> {
    const pending = [...this.rows.values()]
      .filter((claim) => claim.status === 'open' || claim.status === 'refund_pending')
      .sort((a, b) => a.decideBy.localeCompare(b.decideBy));
    const start = cursor ? pending.findIndex((claim) => claim.id === cursor) + 1 : 0;
    return pending.slice(start, start + limit);
  }

  async listExpired(nowIso: string, limit: number): Promise<SaleClaim[]> {
    return [...this.rows.values()]
      .filter((claim) => claim.status === 'open' && claim.decideBy <= nowIso)
      .slice(0, limit);
  }

  async update(
    id: string,
    change: (current: SaleClaim) => SaleClaim | null
  ): Promise<SaleClaim | null> {
    const current = this.rows.get(id);
    if (!current) return null;
    const next = change(current);
    if (next) this.rows.set(id, next);
    return next ?? current;
  }
}

=== server/domain/payment/factory.ts — diff ===
@@ -2,6 +2,7 @@ import { FirebaseAdminTransactionAdapter } from './adapters/firebaseAdminTransac
 import { FirestoreAccountDebtAdapter } from './adapters/firestoreAccountDebtAdapter';
 import { FirestorePaymentAccountAdapter } from './adapters/firestorePaymentAccountAdapter';
 import { FirestorePayoutEntryAdapter } from './adapters/firestorePayoutEntryAdapter';
+import { FirestoreSaleClaimAdapter } from './adapters/firestoreSaleClaimAdapter';
 import { FirestorePlanSubscriptionAdapter } from './adapters/firestorePlanSubscriptionAdapter';
 import { StripeBillingGatewayAdapter } from './adapters/stripeBillingGatewayAdapter';
 import { StripeConnectMarketplaceAdapter } from './adapters/stripeConnectMarketplaceAdapter';
@@ -15,6 +16,7 @@ import { CheckoutService } from './services/checkoutService';
 import { DebtService } from './services/debtService';
 import { PaymentAccountService } from './services/paymentAccountService';
 import { PayoutService } from './services/payoutService';
+import { SaleClaimService } from './services/saleClaimService';
 import { StripePaymentService } from './services/stripePaymentService';
 
 export const paymentGatewayAdapter: PaymentGatewayPort = new StripePaymentGatewayAdapter();
@@ -47,6 +49,12 @@ export const payoutService = new PayoutService(
   debtService
 );
 
+export const saleClaimService = new SaleClaimService(
+  new FirestoreSaleClaimAdapter(),
+  payoutService,
+  paymentGatewayAdapter
+);
+
 export const checkoutService = new CheckoutService(stripePaymentService, transactionRepository);
 
 let billingService: BillingService | null = null;

=== server/domain/payment/index.ts — diff ===
@@ -26,6 +26,13 @@ export { startAccountDebtPaymentUseCase } from './usecases/startAccountDebtPayme
 export { markAccountDebtPaidUseCase } from './usecases/markAccountDebtPaidUseCase';
 export { waiveAccountDebtUseCase } from './usecases/waiveAccountDebtUseCase';
 export { cancellationPenaltyMinor } from './utils/debtRules';
+export { openSaleClaimUseCase } from './usecases/openSaleClaimUseCase';
+export { getSaleClaimUseCase } from './usecases/getSaleClaimUseCase';
+export { listMySaleClaimsUseCase } from './usecases/listMySaleClaimsUseCase';
+export { listPendingSaleClaimsUseCase } from './usecases/listPendingSaleClaimsUseCase';
+export { decideSaleClaimUseCase } from './usecases/decideSaleClaimUseCase';
+export { settleSaleClaimRefundUseCase } from './usecases/settleSaleClaimRefundUseCase';
+export { SALE_CLAIM_REASONS } from './types/saleClaim';
 export { getPaymentReferenceUseCase } from './usecases/getPaymentReferenceUseCase';
 export { createBillingPortalSessionUseCase } from './usecases/billing/createBillingPortalSessionUseCase';
 export { getListingPlanSubscriptionUseCase } from './usecases/billing/getListingPlanSubscriptionUseCase';
@@ -55,6 +62,15 @@ export type { PayoutEntry, PayoutEntryStatus } from './types/payoutEntry';
 export type { DisputeOutcome, RecordSaleInput, ReleaseSummary } from './services/payoutService';
 export type { AccountDebt, AccountDebtReason, AccountDebtView } from './types/accountDebt';
 export type { CreateDebtInput } from './services/debtService';
+export type { OpenSaleClaimInput, SaleClaimDecision } from './services/saleClaimService';
+export type {
+  AdminSaleClaimView,
+  BuyerSaleClaimView,
+  SaleClaim,
+  SaleClaimOutcome,
+  SaleClaimReason,
+  SaleClaimStatus,
+} from './types/saleClaim';
 export type { EnsurePaymentAccountInput } from './services/paymentAccountService';
 export type {
   CreatePaymentIntentResult,

=== server/domain/payment/ports/saleClaimRepositoryPort.ts — ARQUIVO NOVO, conteúdo completo ===
import type { SaleClaim } from '../types/saleClaim';

export interface SaleClaimRepositoryPort {
  /** Cria só se ainda não existir; devolve a reclamação gravada. */
  createIfAbsent(claim: SaleClaim): Promise<SaleClaim>;
  get(id: string): Promise<SaleClaim | null>;
  listByBuyer(buyerUid: string, limit: number): Promise<SaleClaim[]>;
  /** Abertas ou com reembolso em andamento, pelo prazo de decisão; `cursor` é o ID da última da página. */
  listPending(limit: number, cursor?: string): Promise<SaleClaim[]>;
  /** Abertas com `decideBy` até `nowIso`. */
  listExpired(nowIso: string, limit: number): Promise<SaleClaim[]>;
  /** Lê, aplica a mudança e grava na mesma transação; `null` deixa como está. */
  update(id: string, change: (current: SaleClaim) => SaleClaim | null): Promise<SaleClaim | null>;
}

=== server/domain/payment/services/payoutService.ts — diff ===
@@ -2,7 +2,13 @@ import type { PayoutEntryRepositoryPort } from '../ports/payoutEntryRepositoryPo
 import type { PayoutTransferPort } from '../ports/payoutTransferPort';
 import type { PayoutEntry } from '../types/payoutEntry';
 import type { DebtService } from './debtService';
-import { computeReleaseAt, partnerAmountAfterRefunds } from '../utils/payoutRules';
+import type { PayoutHoldReason } from '../types/payoutEntry';
+import {
+  computeReleaseAt,
+  partnerAmountAfterRefunds,
+  withHold,
+  withoutHold,
+} from '../utils/payoutRules';
 
 export interface RecordSaleInput {
   referenceType: string;
@@ -133,17 +139,19 @@ export class PayoutService {
   /** Contestação aberta: o repasse espera a decisão (D14). */
   async holdForDispute(paymentIntentId: string): Promise<PayoutEntry | null> {
     const entry = await this.entries.getByPaymentIntentId(paymentIntentId);
-    if (!entry) return null;
-    return this.entries.update(entry.id, (current) =>
-      current.status === 'pending'
-        ? {
-            ...current,
-            status: 'on_hold',
-            holdReason: 'dispute',
-            updatedAt: this.now().toISOString(),
-          }
-        : null
-    );
+    return entry ? this.setHold(entry.id, 'dispute', true) : null;
+  }
+
+  /** Retém ou solta a venda por um motivo; as outras retenções continuam valendo. */
+  async setHold(
+    entryId: string,
+    reason: PayoutHoldReason,
+    hold: boolean
+  ): Promise<PayoutEntry | null> {
+    return this.entries.update(entryId, (current) => {
+      const next = hold ? withHold(current, reason) : withoutHold(current, reason);
+      return next ? { ...next, updatedAt: this.now().toISOString() } : null;
+    });
   }
 
   /**
@@ -169,18 +177,17 @@ export class PayoutService {
       }
       return entry;
     }
+    if (outcome !== 'lost_partner_pays') return this.setHold(entry.id, 'dispute', false);
     return this.entries.update(entry.id, (current) => {
-      if (current.status !== 'on_hold' || current.holdReason !== 'dispute') return null;
-      const { holdReason: _released, ...rest } = current;
-      return outcome === 'lost_partner_pays'
-        ? {
-            ...rest,
-            status: 'canceled',
-            canceledReason: 'dispute_lost',
-            partnerAmountMinor: 0,
-            updatedAt: this.now().toISOString(),
-          }
-        : { ...rest, status: 'pending', updatedAt: this.now().toISOString() };
+      if (!current.holdReasons?.includes('dispute')) return null;
+      const { holdReasons: _released, ...rest } = current;
+      return {
+        ...rest,
+        status: 'canceled',
+        canceledReason: 'dispute_lost',
+        partnerAmountMinor: 0,
+        updatedAt: this.now().toISOString(),
+      };
     });
   }

=== server/domain/payment/services/saleClaimService.test.ts — ARQUIVO NOVO, conteúdo completo ===
import { describe, expect, it, vi } from 'vitest';
import { InMemorySaleClaimAdapter } from '../adapters/inMemorySaleClaimAdapter';
import type { PayoutEntryRepositoryPort } from '../ports/payoutEntryRepositoryPort';
import type { PayoutEntry } from '../types/payoutEntry';
import { PayoutService } from './payoutService';
import { type OpenSaleClaimInput, SaleClaimService } from './saleClaimService';

function memoryEntries(): PayoutEntryRepositoryPort & { rows: Map<string, PayoutEntry> } {
  const rows = new Map<string, PayoutEntry>();
  return {
    rows,
    async createIfAbsent(entry) {
      if (!rows.has(entry.id)) rows.set(entry.id, entry);
      return rows.get(entry.id) as PayoutEntry;
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

const ENTRY_ID = 'po_ticket_order_ord_1';

const CLAIM: OpenSaleClaimInput = {
  referenceType: 'ticket_order',
  referenceId: 'ord_1',
  buyerUid: 'buyer-1',
  reason: 'did_not_happen',
  details: 'O local estava fechado.',
  serviceStartsAt: '2026-12-20T22:00:00.000Z',
  serviceEndsAt: '2026-12-21T03:00:00.000Z',
};

async function setup(now = '2026-12-21T10:00:00.000Z', refundStatus = 'succeeded') {
  const entries = memoryEntries();
  const clock = { value: new Date(now) };
  const transfers = { createTransfer: vi.fn().mockResolvedValue({ transferId: 'tr_1' }) };
  const debts = { offsetFromPayout: vi.fn().mockResolvedValue(0), createDebt: vi.fn() };
  const payouts = new PayoutService(
    entries,
    transfers,
    { getPayoutDestination: vi.fn().mockResolvedValue('acct_1') },
    debts,
    () => clock.value
  );
  await payouts.recordSale({
    referenceType: 'ticket_order',
    referenceId: 'ord_1',
    accountKey: 'key-1',
    paymentIntentId: 'pi_1',
    chargeId: 'ch_1',
    grossMinor: 10600,
    serviceFeeMinor: 600,
    platformFeeMinor: 1000,
    serviceEndsAt: CLAIM.serviceEndsAt,
  });
  const gateway = {
    refundPayment: vi.fn().mockResolvedValue({ providerRefundId: 're_1', status: refundStatus }),
  };
  const claims = new InMemorySaleClaimAdapter();
  const service = new SaleClaimService(claims, payouts, gateway, () => clock.value);
  return { entries, clock, transfers, gateway, claims, service, payouts };
}

describe('SaleClaimService (D16 2A)', () => {
  it('só do início do serviço até 48 h depois do fim', async () => {
    const early = await setup('2026-12-20T21:00:00.000Z');
    await expect(early.service.open(CLAIM)).rejects.toMatchObject({ code: 'CLAIM_TOO_EARLY' });
    const late = await setup('2026-12-23T03:00:01.000Z');
    await expect(late.service.open(CLAIM)).rejects.toMatchObject({ code: 'CLAIM_WINDOW_CLOSED' });
  });

  it('abre uma por venda, retém o repasse e decide em até 5 dias', async () => {
    const { service, entries } = await setup();
    const claim = await service.open(CLAIM);
    expect(claim).toMatchObject({ status: 'open', decideBy: '2026-12-26T10:00:00.000Z' });
    expect(entries.rows.get(ENTRY_ID)).toMatchObject({ status: 'on_hold', holdReasons: ['claim'] });
    await expect(service.open(CLAIM)).rejects.toMatchObject({ code: 'CLAIM_ALREADY_EXISTS' });
  });

  it('o comprador não vê o próprio texto na lista; o admin vê, com o valor reembolsável', async () => {
    const { service } = await setup();
    await service.open(CLAIM);
    const [mine] = await service.listForBuyer('buyer-1');
    expect(mine).not.toHaveProperty('details');
    expect(await service.listForBuyer('buyer-2')).toEqual([]);
    const { data, nextCursor } = await service.listPendingForAdmin(10);
    expect(data[0]).toMatchObject({ details: 'O local estava fechado.', refundableMinor: 10600 });
    expect(nextCursor).toBeNull();
  });

  it('liberar devolve a venda à fila do repasse', async () => {
    const { service, entries, clock, payouts, transfers } = await setup();
    const claim = await service.open(CLAIM);
    clock.value = new Date('2026-12-23T04:00:00.000Z');
    expect((await payouts.releaseDue()).released).toBe(0);
    await service.decide(claim.id, 'admin-1', { outcome: 'release' });
    expect(entries.rows.get(ENTRY_ID)?.status).toBe('pending');
    expect((await payouts.releaseDue()).released).toBe(1);
    expect(transfers.createTransfer).toHaveBeenCalledTimes(1);
    await expect(service.decide(claim.id, 'admin-1', { outcome: 'release' })).rejects.toMatchObject(
      {
        code: 'CLAIM_ALREADY_DECIDED',
      }
    );
  });

  it('reembolso integral devolve tudo, com a taxa de serviço, e cancela o repasse', async () => {
    const { service, entries, gateway } = await setup();
    const claim = await service.open(CLAIM);
    const decided = await service.decide(claim.id, 'admin-1', { outcome: 'refund_full' });
    expect(gateway.refundPayment).toHaveBeenCalledWith({
      paymentIntentId: 'pi_1',
      amountMinor: 10600,
      idempotencyKey: `refund_claim_${claim.id}_1`,
      metadata: { referenceType: 'claim_refund', claimId: claim.id },
    });
    expect(decided).toMatchObject({ status: 'refunded', refundServiceFeeMinor: 600 });
    expect(entries.rows.get(ENTRY_ID)).toMatchObject({
      status: 'canceled',
      canceledReason: 'fully_refunded',
    });
    await service.completeRefund(claim.id, 're_1');
    expect(Object.keys(entries.rows.get(ENTRY_ID)?.refunds ?? {})).toEqual(['re_1']);
  });

  it('reembolso parcial sai só do valor do proprietário', async () => {
    const { service, entries } = await setup();
    const claim = await service.open(CLAIM);
    await expect(
      service.decide(claim.id, 'admin-1', { outcome: 'refund_partial', amountMinor: 10001 })
    ).rejects.toMatchObject({ code: 'INVALID_REFUND_AMOUNT' });
    await service.decide(claim.id, 'admin-1', { outcome: 'refund_partial', amountMinor: 5000 });
    expect(entries.rows.get(ENTRY_ID)).toMatchObject({
      status: 'pending',
      partnerAmountMinor: 4500,
    });
  });

  it('Pix pendente: o repasse espera o webhook; recusado, volta para o admin', async () => {
    const { service, entries, gateway } = await setup(undefined, 'pending');
    const claim = await service.open(CLAIM);
    await service.decide(claim.id, 'admin-1', { outcome: 'refund_full' });
    expect(entries.rows.get(ENTRY_ID)?.status).toBe('on_hold');
    await service.failRefund(claim.id);
    expect((await service.get(claim.id))?.status).toBe('open');
    await service.decide(claim.id, 'admin-1', { outcome: 'refund_full' });
    expect(gateway.refundPayment).toHaveBeenLastCalledWith(
      expect.objectContaining({ idempotencyKey: `refund_claim_${claim.id}_2` })
    );
    await service.completeRefund(claim.id, 're_1');
    expect((await service.get(claim.id))?.status).toBe('refunded');
    expect(entries.rows.get(ENTRY_ID)?.status).toBe('canceled');
  });

  it('sem decisão em 5 dias, a reclamação expira e o repasse sai', async () => {
    const { service, entries, clock } = await setup();
    const claim = await service.open(CLAIM);
    clock.value = new Date('2026-12-26T09:59:00.000Z');
    expect(await service.expireDue()).toBe(0);
    clock.value = new Date('2026-12-26T10:00:00.000Z');
    expect(await service.expireDue()).toBe(1);
    expect((await service.get(claim.id))?.status).toBe('expired');
    expect(entries.rows.get(ENTRY_ID)?.status).toBe('pending');
  });

  it('reclamação e contestação juntas: o fim de uma não solta a outra', async () => {
    const { service, entries, payouts } = await setup();
    const claim = await service.open(CLAIM);
    await payouts.holdForDispute('pi_1');
    await service.decide(claim.id, 'admin-1', { outcome: 'release' });
    expect(entries.rows.get(ENTRY_ID)).toMatchObject({
      status: 'on_hold',
      holdReasons: ['dispute'],
    });
    await payouts.closeDispute('pi_1', 'won');
    expect(entries.rows.get(ENTRY_ID)?.status).toBe('pending');
  });
});

=== server/domain/payment/services/saleClaimService.ts — ARQUIVO NOVO, conteúdo completo ===
import type { PaymentGatewayPort } from '../ports/paymentGatewayPort';
import type { SaleClaimRepositoryPort } from '../ports/saleClaimRepositoryPort';
import type { PayoutEntry } from '../types/payoutEntry';
import type {
  AdminSaleClaimView,
  BuyerSaleClaimView,
  SaleClaim,
  SaleClaimOutcome,
  SaleClaimReason,
} from '../types/saleClaim';
import { computeClaimDeadline, computeReleaseAt } from '../utils/payoutRules';
import type { PayoutService } from './payoutService';
import { PaymentDomainError } from './stripePaymentService';

export interface OpenSaleClaimInput {
  referenceType: string;
  referenceId: string;
  buyerUid: string;
  reason: SaleClaimReason;
  details?: string;
  serviceStartsAt: string;
  serviceEndsAt: string;
}

export interface SaleClaimDecision {
  outcome: SaleClaimOutcome;
  /** Só no reembolso parcial: sai do valor do proprietário, sem a taxa de serviço. */
  amountMinor?: number;
}

type ClaimPayouts = Pick<PayoutService, 'getForReference' | 'setHold' | 'applyRefund'>;

function refundedTotals(entry: PayoutEntry): { amountMinor: number; serviceFeeMinor: number } {
  return Object.values(entry.refunds).reduce(
    (sum, refund) => ({
      amountMinor: sum.amountMinor + refund.amountMinor,
      serviceFeeMinor: sum.serviceFeeMinor + refund.serviceFeeMinor,
    }),
    { amountMinor: 0, serviceFeeMinor: 0 }
  );
}

function refundableMinor(entry: PayoutEntry): number {
  return Math.max(0, entry.grossMinor - refundedTotals(entry).amountMinor);
}

function toBuyerView(claim: SaleClaim): BuyerSaleClaimView {
  return {
    id: claim.id,
    referenceType: claim.referenceType,
    referenceId: claim.referenceId,
    reason: claim.reason,
    status: claim.status,
    openedAt: claim.openedAt,
    decideBy: claim.decideBy,
    ...(claim.refundAmountMinor !== undefined
      ? { refundAmountMinor: claim.refundAmountMinor }
      : {}),
  };
}

/** Reclamações do comprador (D14, D16 2A): retêm o repasse da venda até a decisão do admin. */
export class SaleClaimService {
  constructor(
    private readonly claims: SaleClaimRepositoryPort,
    private readonly payouts: ClaimPayouts,
    private readonly gateway: Pick<PaymentGatewayPort, 'refundPayment'>,
    private readonly now: () => Date = () => new Date()
  ) {}

  /** Do início do serviço até 48 h depois do fim; uma reclamação por venda. */
  async open(input: OpenSaleClaimInput): Promise<SaleClaim> {
    const nowDate = this.now();
    const nowIso = nowDate.toISOString();
    if (nowIso < input.serviceStartsAt) {
      throw new PaymentDomainError(
        'CLAIM_TOO_EARLY',
        'Antes do início, use o cancelamento da compra.',
        422
      );
    }
    const entry = await this.payouts.getForReference(input.referenceType, input.referenceId);
    if (nowIso > computeReleaseAt(input.serviceEndsAt) || entry?.status === 'released') {
      throw new PaymentDomainError(
        'CLAIM_WINDOW_CLOSED',
        'O prazo para relatar um problema era de 48 h depois do fim do serviço.',
        422
      );
    }
    if (!entry || entry.status === 'canceled') {
      throw new PaymentDomainError(
        'CLAIM_NOT_ALLOWED',
        'Esta compra não tem valor a reclamar.',
        422
      );
    }
    const id = `claim_${input.referenceType}_${input.referenceId}`;
    if (await this.claims.get(id)) {
      throw new PaymentDomainError(
        'CLAIM_ALREADY_EXISTS',
        'Já existe uma reclamação para esta compra.',
        409
      );
    }
    const claim = await this.claims.createIfAbsent({
      id,
      referenceType: input.referenceType,
      referenceId: input.referenceId,
      payoutEntryId: entry.id,
      buyerUid: input.buyerUid,
      reason: input.reason,
      ...(input.details ? { details: input.details } : {}),
      status: 'open',
      openedAt: nowIso,
      decideBy: computeClaimDeadline(nowDate),
      updatedAt: nowIso,
    });
    await this.payouts.setHold(entry.id, 'claim', true);
    return claim;
  }

  get(claimId: string): Promise<SaleClaim | null> {
    return this.claims.get(claimId);
  }

  async listForBuyer(buyerUid: string): Promise<BuyerSaleClaimView[]> {
    const claims = await this.claims.listByBuyer(buyerUid, 50);
    return claims.map(toBuyerView);
  }

  /** Fila do admin, pelo prazo de decisão mais próximo. */
  async listPendingForAdmin(
    limit: number,
    cursor?: string
  ): Promise<{ data: AdminSaleClaimView[]; nextCursor: string | null }> {
    const claims = await this.claims.listPending(limit, cursor);
    const data = await Promise.all(
      claims.map(async (claim) => {
        const entry = await this.payouts.getForReference(claim.referenceType, claim.referenceId);
        return {
          ...toBuyerView(claim),
          buyerUid: claim.buyerUid,
          ...(claim.details ? { details: claim.details } : {}),
          grossMinor: entry?.grossMinor ?? 0,
          refundableMinor: entry ? refundableMinor(entry) : 0,
        };
      })
    );
    const last = claims[claims.length - 1];
    return { data, nextCursor: claims.length === limit && last ? last.id : null };
  }

  /**
   * Decisão do admin. Liberar devolve a venda à fila do repasse. Reembolso integral devolve tudo o que
   * resta, inclusive a taxa de serviço; o parcial sai só do valor do proprietário. O repasse fica retido
   * até o reembolso concluir, para não transferir o que vai voltar ao comprador.
   */
  async decide(claimId: string, adminUid: string, decision: SaleClaimDecision): Promise<SaleClaim> {
    const claim = await this.claims.get(claimId);
    if (!claim) throw new PaymentDomainError('NOT_FOUND', 'Reclamação não encontrada.', 404);
    if (claim.status !== 'open') {
      throw new PaymentDomainError(
        'CLAIM_ALREADY_DECIDED',
        'Esta reclamação já foi decidida.',
        409
      );
    }
    const nowIso = this.now().toISOString();
    if (decision.outcome === 'release') {
      const released = await this.finish(claim.id, 'released', { decidedBy: adminUid });
      await this.payouts.setHold(claim.payoutEntryId, 'claim', false);
      return released;
    }

    const entry = await this.payouts.getForReference(claim.referenceType, claim.referenceId);
    if (!entry) throw new PaymentDomainError('NOT_FOUND', 'Venda não encontrada.', 404);
    const refunded = refundedTotals(entry);
    const remainingServiceFee = Math.max(0, entry.serviceFeeMinor - refunded.serviceFeeMinor);
    const remaining = refundableMinor(entry);
    const full = decision.outcome === 'refund_full';
    const amountMinor = full ? remaining : (decision.amountMinor ?? 0);
    if (amountMinor <= 0 || amountMinor > (full ? remaining : remaining - remainingServiceFee)) {
      throw new PaymentDomainError(
        'INVALID_REFUND_AMOUNT',
        'Valor de reembolso fora do que ainda pode voltar ao comprador.',
        422
      );
    }
    const serviceFeeMinor = full ? remainingServiceFee : 0;
    const pending = await this.claims.update(claim.id, (current) =>
      current.status === 'open'
        ? {
            ...current,
            status: 'refund_pending',
            refundAttempts: (current.refundAttempts ?? 0) + 1,
            refundAmountMinor: amountMinor,
            refundServiceFeeMinor: serviceFeeMinor,
            decidedBy: adminUid,
            decidedAt: nowIso,
            updatedAt: nowIso,
          }
        : null
    );
    const result = await this.gateway
      .refundPayment({
        paymentIntentId: entry.paymentIntentId,
        amountMinor,
        // Repetir a mesma tentativa não reembolsa duas vezes; uma nova decisão usa outra chave.
        idempotencyKey: `refund_claim_${claim.id}_${pending?.refundAttempts ?? 1}`,
        metadata: { referenceType: 'claim_refund', claimId: claim.id },
      })
      .catch(async (error: unknown) => {
        await this.failRefund(claim.id);
        throw error;
      });
    if (result.status === 'failed') {
      await this.failRefund(claim.id);
      throw new PaymentDomainError(
        'CLAIM_REFUND_FAILED',
        'O reembolso foi recusado pelo meio de pagamento.',
        503
      );
    }
    if (result.providerRefundId) {
      await this.claims.update(claim.id, (current) => ({
        ...current,
        providerRefundId: result.providerRefundId ?? undefined,
        updatedAt: this.now().toISOString(),
      }));
    }
    if (result.status === 'succeeded' && result.providerRefundId) {
      return this.completeRefund(claim.id, result.providerRefundId);
    }
    return (await this.claims.get(claim.id)) ?? claim;
  }

  /** Reembolso concluído (resposta do Stripe ou `refund.updated`); repetir não desconta duas vezes. */
  async completeRefund(claimId: string, providerRefundId: string): Promise<SaleClaim> {
    const claim = await this.claims.get(claimId);
    if (!claim) throw new PaymentDomainError('NOT_FOUND', 'Reclamação não encontrada.', 404);
    if (claim.status !== 'refund_pending' && claim.status !== 'refunded') return claim;
    // O desconto no repasse vem antes da mudança de status: se falhar, o webhook tenta de novo.
    await this.payouts.applyRefund({
      referenceType: claim.referenceType,
      referenceId: claim.referenceId,
      refundKey: providerRefundId,
      amountMinor: claim.refundAmountMinor ?? 0,
      serviceFeeMinor: claim.refundServiceFeeMinor ?? 0,
    });
    const done = await this.finish(claim.id, 'refunded', { providerRefundId });
    await this.payouts.setHold(claim.payoutEntryId, 'claim', false);
    return done;
  }

  /** Reembolso recusado: a reclamação volta para o admin decidir de novo, ainda retendo o repasse. */
  async failRefund(claimId: string): Promise<void> {
    await this.claims.update(claimId, (current) =>
      current.status === 'refund_pending'
        ? { ...current, status: 'open', updatedAt: this.now().toISOString() }
        : null
    );
  }

  /** Job de hora em hora: sem decisão em 5 dias, o repasse é liberado (D14). */
  async expireDue(limit = 100): Promise<number> {
    const nowIso = this.now().toISOString();
    const expired = await this.claims.listExpired(nowIso, limit);
    let count = 0;
    for (const claim of expired) {
      const updated = await this.claims.update(claim.id, (current) =>
        current.status === 'open' ? { ...current, status: 'expired', updatedAt: nowIso } : null
      );
      if (updated?.status !== 'expired') continue;
      await this.payouts.setHold(claim.payoutEntryId, 'claim', false);
      count += 1;
    }
    return count;
  }

  private async finish(
    claimId: string,
    status: 'released' | 'refunded',
    extra: Partial<Pick<SaleClaim, 'decidedBy' | 'providerRefundId'>>
  ): Promise<SaleClaim> {
    const nowIso = this.now().toISOString();
    const updated = await this.claims.update(claimId, (current) =>
      current.status === status
        ? null
        : {
            ...current,
            ...extra,
            status,
            ...(extra.decidedBy ? { decidedAt: nowIso } : {}),
            updatedAt: nowIso,
          }
    );
    if (!updated) throw new PaymentDomainError('NOT_FOUND', 'Reclamação não encontrada.', 404);
    return updated;
  }
}

=== server/domain/payment/types/accountDebt.ts — diff ===
@@ -10,7 +10,7 @@ export interface AccountDebt {
   id: string;
   accountKey: string;
   reason: AccountDebtReason;
-  /** O que gerou a dívida ('event_occurrence', 'booking_slot', 'ticket_order', 'booking'). */
+  /** O que gerou a dívida ('event_occurrence', 'booking_slot', 'sale_claim', 'ticket_order', 'booking'). */
   referenceType: string;
   referenceId: string;
   amountMinor: number;

=== server/domain/payment/types/payoutEntry.ts — diff ===
@@ -4,7 +4,8 @@
  */
 export type PayoutEntryStatus = 'pending' | 'on_hold' | 'released' | 'canceled';
 
-export type PayoutHoldReason = 'dispute';
+/** Contestação no Stripe e reclamação do comprador (D16) podem reter a mesma venda ao mesmo tempo. */
+export type PayoutHoldReason = 'dispute' | 'claim';
 
 export interface PayoutRefundApplied {
   amountMinor: number;
@@ -29,7 +30,8 @@ export interface PayoutEntry {
   serviceEndsAt: string;
   releaseAt: string;
   status: PayoutEntryStatus;
-  holdReason?: PayoutHoldReason;
+  /** Retenções ativas; `on_hold` enquanto houver alguma, `pending` quando a última sai. */
+  holdReasons?: PayoutHoldReason[];
   /** Reembolsos já descontados, por chave do reembolso: repetir o mesmo não desconta de novo. */
   refunds: Record<string, PayoutRefundApplied>;
   transferId?: string;

=== server/domain/payment/types/saleClaim.ts — ARQUIVO NOVO, conteúdo completo ===
/**
 * `saleClaims/{id}`: reclamação do comprador sobre uma venda (D16, 2A). Retém o repasse até a decisão do
 * admin, por no máximo 5 dias. Classe confidencial: `details` é texto livre do comprador e nunca vai
 * para log.
 */
export const SALE_CLAIM_REASONS = [
  'did_not_happen',
  'not_as_described',
  'changed_without_notice',
  'safety_issue',
  'other',
] as const;

export type SaleClaimReason = (typeof SALE_CLAIM_REASONS)[number];

export type SaleClaimStatus = 'open' | 'refund_pending' | 'refunded' | 'released' | 'expired';

export type SaleClaimOutcome = 'release' | 'refund_full' | 'refund_partial';

export interface SaleClaim {
  id: string;
  /** Venda reclamada ('ticket_order', 'booking'); o payment não interpreta o valor. */
  referenceType: string;
  referenceId: string;
  payoutEntryId: string;
  buyerUid: string;
  reason: SaleClaimReason;
  details?: string;
  status: SaleClaimStatus;
  openedAt: string;
  decideBy: string;
  decidedBy?: string;
  decidedAt?: string;
  refundAmountMinor?: number;
  /** Parte do reembolso que é taxa de serviço (só no reembolso integral). */
  refundServiceFeeMinor?: number;
  providerRefundId?: string;
  /** Cada decisão de reembolso é uma tentativa: depois de uma recusa, a próxima usa outra chave no Stripe. */
  refundAttempts?: number;
  updatedAt: string;
}

/** O que o comprador vê da própria reclamação. */
export interface BuyerSaleClaimView {
  id: string;
  referenceType: string;
  referenceId: string;
  reason: SaleClaimReason;
  status: SaleClaimStatus;
  openedAt: string;
  decideBy: string;
  refundAmountMinor?: number;
}

/** Fila do admin: inclui o texto do comprador e os valores da venda para decidir. */
export interface AdminSaleClaimView extends BuyerSaleClaimView {
  buyerUid: string;
  details?: string;
  grossMinor: number;
  refundableMinor: number;
}

=== server/domain/payment/usecases/decideSaleClaimUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { saleClaimService } from '../factory';
import type { SaleClaimDecision } from '../services/saleClaimService';
import type { SaleClaim } from '../types/saleClaim';

/** Quem chama garante o papel de admin. */
export function decideSaleClaimUseCase(
  claimId: string,
  adminUid: string,
  decision: SaleClaimDecision
): Promise<SaleClaim> {
  return saleClaimService.decide(claimId, adminUid, decision);
}

=== server/domain/payment/usecases/getSaleClaimUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { saleClaimService } from '../factory';
import type { SaleClaim } from '../types/saleClaim';

export function getSaleClaimUseCase(claimId: string): Promise<SaleClaim | null> {
  return saleClaimService.get(claimId);
}

=== server/domain/payment/usecases/listMySaleClaimsUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { saleClaimService } from '../factory';
import type { BuyerSaleClaimView } from '../types/saleClaim';

export function listMySaleClaimsUseCase(buyerUid: string): Promise<BuyerSaleClaimView[]> {
  return saleClaimService.listForBuyer(buyerUid);
}

=== server/domain/payment/usecases/listPendingSaleClaimsUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { saleClaimService } from '../factory';
import type { AdminSaleClaimView } from '../types/saleClaim';

/** Fila do admin; quem chama garante o papel de admin. */
export function listPendingSaleClaimsUseCase(
  limit: number,
  cursor?: string
): Promise<{ data: AdminSaleClaimView[]; nextCursor: string | null }> {
  return saleClaimService.listPendingForAdmin(limit, cursor);
}

=== server/domain/payment/usecases/openSaleClaimUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { saleClaimService } from '../factory';
import type { OpenSaleClaimInput } from '../services/saleClaimService';
import type { SaleClaim } from '../types/saleClaim';

/** Quem chama confere que o comprador é dono da venda e informa as datas do serviço. */
export function openSaleClaimUseCase(input: OpenSaleClaimInput): Promise<SaleClaim> {
  return saleClaimService.open(input);
}

=== server/domain/payment/usecases/releaseDuePayoutsUseCase.ts — ARQUIVO REESCRITO, substitua todo o conteúdo por este ===
import { payoutService, saleClaimService } from '../factory';
import type { ReleaseSummary } from '../services/payoutService';

/** Job de hora em hora (D14): encerra as reclamações sem decisão em 5 dias e transfere os repasses vencidos. */
export async function releaseDuePayoutsUseCase(
  limit = 200
): Promise<ReleaseSummary & { expiredClaims: number }> {
  const expiredClaims = await saleClaimService.expireDue();
  return { ...(await payoutService.releaseDue(limit)), expiredClaims };
}

=== server/domain/payment/usecases/settleSaleClaimRefundUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { saleClaimService } from '../factory';

/** Webhook `refund.updated` de um reembolso de reclamação. */
export async function settleSaleClaimRefundUseCase(
  claimId: string,
  providerRefundId: string,
  providerStatus: string
): Promise<void> {
  if (providerStatus === 'succeeded') {
    await saleClaimService.completeRefund(claimId, providerRefundId);
  } else if (providerStatus === 'failed' || providerStatus === 'canceled') {
    await saleClaimService.failRefund(claimId);
  }
  // 'pending' e 'requires_action' não são reembolso aprovado (AGENTS.md §8.6 item 6).
}

=== server/domain/payment/utils/payoutRules.ts — diff ===
@@ -1,4 +1,5 @@
 import type { PaymentMethod } from '../ports/paymentGatewayPort';
+import type { PayoutEntry, PayoutHoldReason } from '../types/payoutEntry';
 
 const HOUR_MS = 60 * 60 * 1000;
 
@@ -8,6 +9,13 @@ export const PAYOUT_CLAIM_WINDOW_HOURS = 48;
 /** Pix só quando o serviço acontece até 80 dias depois da compra: o reembolso de Pix vale até 90 dias (D14). */
 export const PIX_MAX_DAYS_BEFORE_SERVICE = 80;
 
+/** Prazo do admin para decidir a reclamação; sem decisão, o repasse é liberado (D14). */
+export const CLAIM_DECISION_DAYS = 5;
+
+export function computeClaimDeadline(openedAt: Date): string {
+  return new Date(openedAt.getTime() + CLAIM_DECISION_DAYS * 24 * HOUR_MS).toISOString();
+}
+
 export function computeReleaseAt(serviceEndsAt: string): string {
   return new Date(
     new Date(serviceEndsAt).getTime() + PAYOUT_CLAIM_WINDOW_HOURS * HOUR_MS
@@ -37,3 +45,22 @@ export function partnerAmountAfterRefunds(params: {
   const platformFeeMinor = Math.floor((params.platformFeeMinor * keptMinor) / serviceValueMinor);
   return { platformFeeMinor, partnerAmountMinor: keptMinor - platformFeeMinor };
 }
+
+/** Acrescenta uma retenção; `null` quando não muda nada (já retida assim, liberada ou cancelada). */
+export function withHold(entry: PayoutEntry, reason: PayoutHoldReason): PayoutEntry | null {
+  if (entry.status !== 'pending' && entry.status !== 'on_hold') return null;
+  const holds = entry.holdReasons ?? [];
+  if (holds.includes(reason)) return null;
+  return { ...entry, status: 'on_hold', holdReasons: [...holds, reason] };
+}
+
+/** Tira uma retenção; sem nenhuma, a entrada volta à fila do job. */
+export function withoutHold(entry: PayoutEntry, reason: PayoutHoldReason): PayoutEntry | null {
+  const holds = entry.holdReasons ?? [];
+  if (entry.status !== 'on_hold' || !holds.includes(reason)) return null;
+  const rest = holds.filter((hold) => hold !== reason);
+  const { holdReasons: _previous, ...base } = entry;
+  return rest.length > 0
+    ? { ...base, status: 'on_hold', holdReasons: rest }
+    : { ...base, status: 'pending' };
+}

=== server/interfaces/http/saleClaims/saleClaimController.test.ts — ARQUIVO NOVO, conteúdo completo ===
import type { Response } from 'express';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { AuthenticatedRequest } from '../../../infrastructure/auth/authenticatedRequest';

const m = vi.hoisted(() => ({ open: vi.fn(), decide: vi.fn(), mine: vi.fn(), pending: vi.fn() }));

vi.mock('../../../application/usecases/payouts/openSaleClaimApplicationUseCase', () => ({
  openSaleClaimApplicationUseCase: m.open,
}));
vi.mock('../../../application/usecases/payouts/decideSaleClaimApplicationUseCase', () => ({
  decideSaleClaimApplicationUseCase: m.decide,
}));
vi.mock('../../../domain/payment', async () => {
  const { PaymentDomainError } = await import(
    '../../../domain/payment/services/stripePaymentService'
  );
  return {
    PaymentDomainError,
    listMySaleClaimsUseCase: m.mine,
    listPendingSaleClaimsUseCase: m.pending,
  };
});

import { PaymentDomainError } from '../../../domain/payment/services/stripePaymentService';
import { SALE_CLAIM_REASONS } from '../../../domain/payment/types/saleClaim';
import { SALE_CLAIM_REASON_VALUES } from './schemas/saleClaimSchemas';
import { SaleClaimController } from './saleClaimController';

function response() {
  const res = { status: vi.fn(), json: vi.fn() };
  res.status.mockReturnValue(res);
  res.json.mockReturnValue(res);
  return res;
}

const BUYER = { uid: 'buyer-1', admin: false };
const ADMIN = { uid: 'admin-1', admin: true };
const VALID = { referenceType: 'booking', referenceId: 'bk_1', reason: 'did_not_happen' };

function request(overrides: Partial<AuthenticatedRequest>): AuthenticatedRequest {
  return { query: {}, body: {}, params: {}, user: BUYER, ...overrides } as never;
}

describe('SaleClaimController (D16)', () => {
  beforeEach(() => vi.clearAllMocks());

  it('motivos do schema iguais aos do domínio', () => {
    expect([...SALE_CLAIM_REASON_VALUES]).toEqual([...SALE_CLAIM_REASONS]);
  });

  it('abrir: sem login 401; motivo fora da lista ou campo extra 400', async () => {
    const anonymous = response();
    await SaleClaimController.open(
      request({ user: undefined, body: VALID }),
      anonymous as unknown as Response
    );
    expect(anonymous.status).toHaveBeenCalledWith(401);
    for (const body of [
      { ...VALID, reason: 'refund_me' },
      { ...VALID, buyerUid: 'buyer-2' },
      { ...VALID, details: 'x'.repeat(501) },
    ]) {
      const res = response();
      await SaleClaimController.open(request({ body }), res as unknown as Response);
      expect(res.status).toHaveBeenCalledWith(400);
    }
    expect(m.open).not.toHaveBeenCalled();
  });

  it('abrir: 201, sempre em nome de quem está logado', async () => {
    m.open.mockResolvedValue({ id: 'claim_x' });
    const res = response();
    await SaleClaimController.open(request({ body: VALID }), res as unknown as Response);
    expect(m.open).toHaveBeenCalledWith({ uid: 'buyer-1', admin: false }, VALID);
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it('erro do domínio mantém código e status; erro inesperado vira 503 sem detalhe', async () => {
    m.open.mockRejectedValueOnce(
      new PaymentDomainError('CLAIM_WINDOW_CLOSED', 'Prazo encerrado.', 422)
    );
    const closed = response();
    await SaleClaimController.open(request({ body: VALID }), closed as unknown as Response);
    expect(closed.status).toHaveBeenCalledWith(422);
    m.open.mockRejectedValueOnce(new Error('StripeAPIError sk_test_123'));
    const broken = response();
    await SaleClaimController.open(request({ body: VALID }), broken as unknown as Response);
    expect(broken.status).toHaveBeenCalledWith(503);
    expect(JSON.stringify(broken.json.mock.calls)).not.toContain('sk_test');
  });

  it('fila e decisão: só admin', async () => {
    for (const handler of [SaleClaimController.listPending, SaleClaimController.decide]) {
      const res = response();
      await handler(
        request({ params: { claimId: 'claim_x' } as never, body: { outcome: 'release' } }),
        res as unknown as Response
      );
      expect(res.status).toHaveBeenCalledWith(403);
    }
    expect(m.pending).not.toHaveBeenCalled();
    expect(m.decide).not.toHaveBeenCalled();
  });

  it('decisão: parcial exige valor; integral não aceita valor', async () => {
    for (const body of [
      { outcome: 'refund_partial' },
      { outcome: 'refund_full', amountMinor: 100 },
      { outcome: 'release', amountMinor: 100 },
    ]) {
      const res = response();
      await SaleClaimController.decide(
        request({ user: ADMIN as never, params: { claimId: 'claim_x' } as never, body }),
        res as unknown as Response
      );
      expect(res.status).toHaveBeenCalledWith(400);
    }
    m.decide.mockResolvedValue({ id: 'claim_x', status: 'refund_pending', refundAmountMinor: 500 });
    const ok = response();
    await SaleClaimController.decide(
      request({
        user: ADMIN as never,
        params: { claimId: 'claim_x' } as never,
        body: { outcome: 'refund_partial', amountMinor: 500 },
      }),
      ok as unknown as Response
    );
    expect(m.decide).toHaveBeenCalledWith('admin-1', 'claim_x', {
      outcome: 'refund_partial',
      amountMinor: 500,
    });
    expect(ok.json).toHaveBeenCalledWith({
      data: { id: 'claim_x', status: 'refund_pending', refundAmountMinor: 500 },
    });
  });

  it('fila do admin paginada por cursor', async () => {
    m.pending.mockResolvedValue({ data: [], nextCursor: null });
    const res = response();
    await SaleClaimController.listPending(
      request({ user: ADMIN as never, query: { limit: '20', cursor: 'claim_a' } as never }),
      res as unknown as Response
    );
    expect(m.pending).toHaveBeenCalledWith(20, 'claim_a');
    expect(res.json).toHaveBeenCalledWith({ data: [], nextCursor: null });
  });
});

=== server/interfaces/http/saleClaims/saleClaimController.ts — ARQUIVO NOVO, conteúdo completo ===
import type { Response } from 'express';
import { decideSaleClaimApplicationUseCase } from '../../../application/usecases/payouts/decideSaleClaimApplicationUseCase';
import { openSaleClaimApplicationUseCase } from '../../../application/usecases/payouts/openSaleClaimApplicationUseCase';
import {
  listMySaleClaimsUseCase,
  listPendingSaleClaimsUseCase,
  PaymentDomainError,
} from '../../../domain/payment';
import type { AuthenticatedRequest } from '../../../infrastructure/auth/authenticatedRequest';
import {
  DecideSaleClaimSchema,
  ListSaleClaimsQuerySchema,
  OpenSaleClaimSchema,
  SaleClaimParamsSchema,
} from './schemas/saleClaimSchemas';

function sendError(res: Response, status: number, code: string, message: string): Response {
  return res.status(status).json({ error: { code, message } });
}

function handleError(res: Response, error: unknown, operation: string): Response {
  if (error instanceof PaymentDomainError) {
    return sendError(res, error.statusCode, error.code, error.message);
  }
  console.error(`[SaleClaimController.${operation}]`, {
    name: error instanceof Error ? error.name : 'UnknownError',
  });
  // 503: a falha mais comum aqui é o Stripe indisponível no reembolso (AGENTS.md §2.2.5).
  return sendError(
    res,
    503,
    'SALE_CLAIM_UNAVAILABLE',
    'Não foi possível concluir a operação no momento.'
  );
}

export class SaleClaimController {
  static async open(req: AuthenticatedRequest, res: Response): Promise<Response> {
    if (!req.user?.uid) return sendError(res, 401, 'UNAUTHENTICATED', 'Não autenticado.');
    const body = OpenSaleClaimSchema.safeParse(req.body);
    if (!body.success) return sendError(res, 400, 'VALIDATION_ERROR', 'Reclamação inválida.');
    try {
      const claim = await openSaleClaimApplicationUseCase(
        { uid: req.user.uid, admin: req.user.admin === true },
        { ...body.data, details: body.data.details || undefined }
      );
      return res.status(201).json({ data: claim });
    } catch (error) {
      return handleError(res, error, 'open');
    }
  }

  static async listMine(req: AuthenticatedRequest, res: Response): Promise<Response> {
    if (!req.user?.uid) return sendError(res, 401, 'UNAUTHENTICATED', 'Não autenticado.');
    try {
      return res.status(200).json({ data: await listMySaleClaimsUseCase(req.user.uid) });
    } catch (error) {
      return handleError(res, error, 'listMine');
    }
  }

  static async listPending(req: AuthenticatedRequest, res: Response): Promise<Response> {
    if (!req.user?.uid) return sendError(res, 401, 'UNAUTHENTICATED', 'Não autenticado.');
    if (req.user.admin !== true) return sendError(res, 403, 'FORBIDDEN', 'Acesso restrito.');
    const query = ListSaleClaimsQuerySchema.safeParse(req.query);
    if (!query.success) return sendError(res, 400, 'VALIDATION_ERROR', 'Consulta inválida.');
    try {
      const page = await listPendingSaleClaimsUseCase(query.data.limit, query.data.cursor);
      return res.status(200).json(page);
    } catch (error) {
      return handleError(res, error, 'listPending');
    }
  }

  static async decide(req: AuthenticatedRequest, res: Response): Promise<Response> {
    if (!req.user?.uid) return sendError(res, 401, 'UNAUTHENTICATED', 'Não autenticado.');
    if (req.user.admin !== true) return sendError(res, 403, 'FORBIDDEN', 'Acesso restrito.');
    const params = SaleClaimParamsSchema.safeParse(req.params);
    const body = DecideSaleClaimSchema.safeParse(req.body);
    if (!params.success || !body.success) {
      return sendError(res, 400, 'VALIDATION_ERROR', 'Decisão inválida.');
    }
    try {
      const claim = await decideSaleClaimApplicationUseCase(
        req.user.uid,
        params.data.claimId,
        body.data
      );
      console.info('[audit] sale_claim_decided', {
        claimId: claim.id,
        adminUid: req.user.uid,
        outcome: body.data.outcome,
        chargePenalty: body.data.chargePenalty === true,
      });
      return res.status(200).json({
        data: {
          id: claim.id,
          status: claim.status,
          ...(claim.refundAmountMinor !== undefined
            ? { refundAmountMinor: claim.refundAmountMinor }
            : {}),
        },
      });
    } catch (error) {
      return handleError(res, error, 'decide');
    }
  }
}

=== server/interfaces/http/saleClaims/saleClaimRoutes.ts — ARQUIVO NOVO, conteúdo completo ===
import { type NextFunction, type Response, Router } from 'express';
import type { AuthenticatedRequest } from '../../../infrastructure/auth/authenticatedRequest';
import { verifyAuthToken } from '../../../infrastructure/auth/authMiddleware';
import { SaleClaimController } from './saleClaimController';

// Abrir e decidir reclamações mexe com repasse e reembolso: token revogado é recusado (AGENTS.md §7.3).
function verifyAuthTokenStrict(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  return verifyAuthToken(req, res, next, { checkRevoked: true });
}

export const saleClaimRouter = Router();
saleClaimRouter.post('/', verifyAuthTokenStrict, SaleClaimController.open);
saleClaimRouter.get('/mine', verifyAuthToken, SaleClaimController.listMine);

export const adminSaleClaimRouter = Router();
adminSaleClaimRouter.get('/', verifyAuthToken, SaleClaimController.listPending);
adminSaleClaimRouter.post('/:claimId/decision', verifyAuthTokenStrict, SaleClaimController.decide);

=== server/interfaces/http/saleClaims/schemas/saleClaimSchemas.ts — ARQUIVO NOVO, conteúdo completo ===
import { z } from 'zod';

const ID = z
  .string()
  .min(1)
  .max(200)
  .regex(/^[\w-]+$/);

// Mesma lista fechada de `SALE_CLAIM_REASONS` (D16, 2A); o teste do controller confere a paridade.
export const SALE_CLAIM_REASON_VALUES = [
  'did_not_happen',
  'not_as_described',
  'changed_without_notice',
  'safety_issue',
  'other',
] as const;

export const OpenSaleClaimSchema = z
  .object({
    referenceType: z.enum(['ticket_order', 'booking']),
    referenceId: ID,
    reason: z.enum(SALE_CLAIM_REASON_VALUES),
    details: z.string().trim().max(500).optional(),
  })
  .strict();

export const SaleClaimParamsSchema = z.object({ claimId: ID }).strict();

export const ListSaleClaimsQuerySchema = z
  .object({
    limit: z.coerce.number().int().min(1).max(100).default(50),
    cursor: ID.optional(),
  })
  .strict();

export const DecideSaleClaimSchema = z
  .object({
    outcome: z.enum(['release', 'refund_full', 'refund_partial']),
    amountMinor: z.number().int().positive().optional(),
    chargePenalty: z.boolean().optional(),
  })
  .strict()
  .refine((value) => (value.outcome === 'refund_partial') === (value.amountMinor !== undefined), {
    message: 'amountMinor só no reembolso parcial, e obrigatório nele.',
  });

VERIFICAÇÃO (obrigatória):
- `npm run typecheck`, `npx biome lint .` (0 erros; arquivos tocados sem avisos), `npm run build`;
- `npm run test:rules` (firestore.rules mudou);
- testes ligados aos arquivos deste prompt: `npx vitest related --run firestore.rules.security.test.ts server.ts server/application/usecases/payouts/chargeCancellationPenaltyApplicationUseCase.ts server/application/usecases/payouts/decideSaleClaimApplicationUseCase.ts server/application/usecases/payouts/openSaleClaimApplicationUseCase.ts server/application/usecases/payouts/saleClaimApplicationUseCases.test.ts server/application/usecases/reconcileStripeWebhookEventApplicationUseCase.ts server/application/usecases/ticketingPaymentOrchestration.test.ts server/domain/payment/adapters/firestoreSaleClaimAdapter.ts server/domain/payment/adapters/inMemorySaleClaimAdapter.ts server/domain/payment/factory.ts server/domain/payment/index.ts server/domain/payment/ports/saleClaimRepositoryPort.ts server/domain/payment/services/payoutService.ts server/domain/payment/services/saleClaimService.test.ts server/domain/payment/services/saleClaimService.ts server/domain/payment/types/accountDebt.ts server/domain/payment/types/payoutEntry.ts server/domain/payment/types/saleClaim.ts server/domain/payment/usecases/decideSaleClaimUseCase.ts server/domain/payment/usecases/getSaleClaimUseCase.ts server/domain/payment/usecases/listMySaleClaimsUseCase.ts server/domain/payment/usecases/listPendingSaleClaimsUseCase.ts server/domain/payment/usecases/openSaleClaimUseCase.ts server/domain/payment/usecases/releaseDuePayoutsUseCase.ts server/domain/payment/usecases/settleSaleClaimRefundUseCase.ts server/domain/payment/utils/payoutRules.ts server/interfaces/http/saleClaims/saleClaimController.test.ts server/interfaces/http/saleClaims/saleClaimController.ts server/interfaces/http/saleClaims/saleClaimRoutes.ts server/interfaces/http/saleClaims/schemas/saleClaimSchemas.ts` (todos verdes). Não precisa rodar a suíte inteira.

LIMPEZA (obrigatória, ao terminar de implementar): apague todos os arquivos de public/assets/aistudio/, inclusive o deste prompt. São cópias dos textos colados no chat, salvas automaticamente pelo AI Studio, e public/ vai para o site publicado. Se a pasta ficar vazia, apague a pasta também.
~~~~

### Configurações manuais (você faz, fora do AI Studio, depois de aplicar este prompt)

1. Publique as regras e os índices do Firestore: `firebase deploy --only firestore:rules,firestore:indexes`. Espere os índices novos ficarem "Ativado" no Console do Firebase (Firestore → Índices) antes de testar. Índices novos: saleClaims (buyerUid, openedAt decrescente) e saleClaims (status, decideBy).
2. Stripe Dashboard → Desenvolvedores → Webhooks → endpoint do Use Guide: confirme que refund.updated está assinado (o reembolso de reclamação por Pix só conclui por ele).
3. Nenhuma variável de ambiente nova e nenhuma Function nova: as reclamações vencidas são encerradas pelo mesmo job de hora em hora do 18.4c.1.
