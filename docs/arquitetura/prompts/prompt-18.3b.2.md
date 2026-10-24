# Prompt 18.3b.2 — Troca de período do plano na próxima renovação (backend)

> Lote 15, gerado do commit de referência `e261e1d` da branch `claude/agents-md-v2`. Aplique depois do 18.3b.1 e antes do 18.3.1a. Cole o bloco abaixo no agente do AI Studio, inteiro, de uma vez.

---

## Prompt 18.3b.2 — Troca de período do plano na próxima renovação (D13, backend)

Decisão D13 (2026-10-24).

~~~~text
Siga o AGENTS.md. NÃO altere o AGENTS.md. O app ainda não foi liberado para usuários: nenhum código de compatibilidade ou transição (§2.2 item 8).

IMPORTANTE: aplique os diffs abaixo EXATAMENTE, inclusive os arquivos novos. Não reescreva os arquivos do seu jeito. Arquivo tocado sai sem avisos do lint e formatado (AGENTS.md §13). Nenhuma dependência nova.

DECISÃO D13 (docs/arquitetura/decisoes.md, adicionada por este prompt): mensal, semestral e anual dão os mesmos benefícios; a troca de período vale a partir da próxima renovação, sem proração, crédito ou reembolso, com o mesmo cartão.

O QUE MUDA:
1) Domínio payment:
   - BillingGatewayPort: schedulePriceChange e releaseSchedule; SubscriptionSnapshot com scheduleId;
   - StripeBillingGatewayAdapter: subscription schedule criado da assinatura (from_subscription), fase atual repetida inteira e fase seguinte no novo preço e com a metadata do novo plano (end_behavior release); cancelar a renovação e o cancelamento imediato soltam o agendamento antes;
   - BillingService.schedulePlanChange: escolher o período atual desfaz a troca; com a renovação cancelada, a troca a retoma; past_due recusa com SUBSCRIPTION_PAST_DUE (409); o sync tira a troca do registro quando o novo período entra ou o agendamento some;
   - planSubscriptions/{itemId} ganha pendingPlanId e pendingChangeAt; schedulePlanSubscriptionChangeUseCase.
2) Aplicação: changePartnerPlanSubscriptionApplicationUseCase (dono e verificação do estabelecimento; valor e intervalo do catálogo); paidPlanForBilling.ts reaproveitado também pelo startPartnerPlanSubscriptionApplicationUseCase.
3) HTTP: POST /api/payment/plans/subscription/change { itemId, planId, idempotencyKey } (checkRevoked); a resposta da assinatura inclui pendingPlanId e pendingChangeAt.
4) decisoes.md: D13.

ARQUIVOS (crie, altere ou apague exatamente estes):
- docs/arquitetura/decisoes.md (alterar)
- server/application/usecases/changePartnerPlanSubscriptionApplicationUseCase.test.ts (criar)
- server/application/usecases/changePartnerPlanSubscriptionApplicationUseCase.ts (criar)
- server/application/usecases/paidPlanForBilling.ts (criar)
- server/application/usecases/reconcilePlanSubscriptionWebhookApplicationUseCase.test.ts (alterar)
- server/application/usecases/startPartnerPlanSubscriptionApplicationUseCase.ts (alterar)
- server/domain/payment/adapters/firestorePlanSubscriptionAdapter.ts (alterar)
- server/domain/payment/adapters/stripeBillingGatewayAdapter.ts (alterar)
- server/domain/payment/index.ts (alterar)
- server/domain/payment/ports/billingGatewayPort.ts (alterar)
- server/domain/payment/ports/planSubscriptionRepositoryPort.ts (alterar)
- server/domain/payment/services/billingService.test.ts (alterar)
- server/domain/payment/services/billingService.ts (alterar)
- server/domain/payment/usecases/billing/schedulePlanSubscriptionChangeUseCase.ts (criar)
- server/interfaces/http/billing/billingController.test.ts (alterar)
- server/interfaces/http/billing/billingController.ts (alterar)
- server/interfaces/http/billing/billingRoutes.ts (alterar)
- server/interfaces/http/billing/schemas/billingSchemas.ts (alterar)

Aplique as mudanças abaixo EXATAMENTE como estão (formato unified diff: linhas com "-" saem, linhas com "+" entram; as demais são contexto para localizar o trecho). Não reformate outros trechos dos arquivos.

=== docs/arquitetura/decisoes.md — diff ===
@@ -22,6 +22,7 @@
 | D10 | Idioma na primeira visita (navegador) | ✅ Aprovada | 2026-10-19 |
 | D11 | Plano "Use Guide Verificado", selo e destaque por estabelecimento | ✅ Aprovada | 2026-10-19 |
 | D12 | Verificação e documento por estabelecimento; venda só com verificação | ✅ Aprovada | 2026-10-19 |
+| D13 | Troca de período do plano na próxima renovação | ✅ Aprovada | 2026-10-24 |
 
 ---
 
@@ -167,3 +168,16 @@ Referências: Receita Federal (IN RFB nº 2.119/2022: cada estabelecimento tem C
   * Os arquivos ficam em pasta privada do Storage, com nome gerado pelo servidor, e são apagados quando o estabelecimento ou a conta é excluído.
 * **Repasse** (P8, opção A): uma conta Stripe por documento, no Prompt 18.4. Até lá, só vende o estabelecimento cujo documento é o da conta Stripe do parceiro.
 * **Ordem** (P9): 18.3.0 (documento, criptografia e verificação por estabelecimento) → 18.3 (plano e selo, backend) → 18.3.1 (telas) → 18.4 (Stripe por documento) → 19.x (tradução).
+
+## D13 — Troca de período do plano na próxima renovação (2026-10-24)
+
+Mensal, semestral e anual do "Use Guide Verificado" dão os mesmos benefícios (D11); muda só o ciclo de cobrança. Por isso a troca de período (upgrade ou downgrade) é uma troca de ciclo, sem benefício a liberar na hora.
+
+* **Opção A (aprovada):** o parceiro escolhe o novo período no diálogo do plano do estabelecimento. O período atual segue até o fim, e a próxima cobrança já sai no novo período e no novo valor.
+* **Sem proração, crédito ou reembolso.** O cartão salvo é o mesmo; não há novo checkout.
+* **Como:** *subscription schedule* do Stripe criado a partir da assinatura (`from_subscription`), com a fase atual e uma fase seguinte no novo preço e com a metadata do novo plano; `end_behavior: release`. O webhook `invoice.paid` da renovação ativa o plano novo pela metadata, como já faz (D11).
+* **Regras:** escolher o período atual desfaz a troca; cancelar a renovação também desfaz a troca; trocar com a renovação cancelada retoma a renovação; com pagamento atrasado (`past_due`) a troca é recusada até a forma de pagamento ser atualizada. O valor vem sempre do catálogo no backend (§8.5).
+* **Registro:** `planSubscriptions/{itemId}` guarda `pendingPlanId` e `pendingChangeAt` até o novo período entrar.
+* **Descartadas:** B (troca imediata com proração) e C (troca pelo portal do Stripe).
+* **Prompts:** 18.3b.2 (backend) e 18.3.1a (telas).
+

=== server/application/usecases/changePartnerPlanSubscriptionApplicationUseCase.test.ts — ARQUIVO NOVO, conteúdo completo ===
import { beforeEach, describe, expect, it, vi } from 'vitest';

const m = vi.hoisted(() => ({ assertPurchasable: vi.fn(), schedule: vi.fn(), getPlan: vi.fn() }));

vi.mock('../../domain/admin', () => ({ getSubscriptionPlanByIdUseCase: m.getPlan }));
vi.mock('../../domain/partners', () => ({
  isPaidListingPlanType: (value: string) =>
    value === 'monthly' || value === 'semi-annual' || value === 'annual',
}));
vi.mock('../../domain/payment', async () => {
  const { PaymentDomainError } = await import('../../domain/payment/services/stripePaymentService');
  return { PaymentDomainError, schedulePlanSubscriptionChangeUseCase: m.schedule };
});
vi.mock('./listingPlans/assertListingPlanPurchasableApplicationUseCase', () => ({
  assertListingPlanPurchasableApplicationUseCase: m.assertPurchasable,
}));

import { changePartnerPlanSubscriptionApplicationUseCase } from './changePartnerPlanSubscriptionApplicationUseCase';

const ACTOR = { uid: 'p1' };
const INPUT = { itemId: 'item-1', planId: 'annual', idempotencyKey: 'key-12345' };

describe('changePartnerPlanSubscriptionApplicationUseCase (D13)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    m.assertPurchasable.mockResolvedValue({ currentPlanUntil: null });
    m.getPlan.mockResolvedValue({ id: 'annual', name: 'Anual', priceMinor: 49900, isActive: true });
    m.schedule.mockResolvedValue({ pendingPlanId: 'annual' });
  });

  it('valor e intervalo do catálogo; confere dono e verificação do estabelecimento', async () => {
    await changePartnerPlanSubscriptionApplicationUseCase(ACTOR, INPUT);
    expect(m.assertPurchasable).toHaveBeenCalledWith(ACTOR, 'item-1');
    expect(m.schedule).toHaveBeenCalledWith({
      itemId: 'item-1',
      partnerId: 'p1',
      planId: 'annual',
      planName: 'Anual',
      amountMinor: 49900,
      interval: 'year',
      intervalCount: 1,
      idempotencyKey: 'key-12345',
    });
  });

  it('plano inativo não troca', async () => {
    m.getPlan.mockResolvedValue({
      id: 'annual',
      name: 'Anual',
      priceMinor: 49900,
      isActive: false,
    });
    await expect(
      changePartnerPlanSubscriptionApplicationUseCase(ACTOR, INPUT)
    ).rejects.toMatchObject({ code: 'PLAN_INACTIVE' });
    expect(m.schedule).not.toHaveBeenCalled();
  });

  it('teste grátis não é período de cobrança', async () => {
    await expect(
      changePartnerPlanSubscriptionApplicationUseCase(ACTOR, { ...INPUT, planId: 'trial' })
    ).rejects.toMatchObject({ code: 'VALIDATION_ERROR' });
  });
});

=== server/application/usecases/changePartnerPlanSubscriptionApplicationUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import {
  type PlanSubscriptionRecord,
  schedulePlanSubscriptionChangeUseCase,
} from '../../domain/payment';
import { assertListingPlanPurchasableApplicationUseCase } from './listingPlans/assertListingPlanPurchasableApplicationUseCase';
import { loadPaidPlanForBilling } from './paidPlanForBilling';

/**
 * Troca do período da assinatura do estabelecimento na próxima renovação (D13). Os benefícios
 * são os mesmos em todos os períodos; muda só o ciclo e o valor da próxima cobrança.
 */
export async function changePartnerPlanSubscriptionApplicationUseCase(
  actor: { uid: string },
  input: { itemId: string; planId: string; idempotencyKey: string }
): Promise<PlanSubscriptionRecord> {
  const plan = await loadPaidPlanForBilling(input.planId);
  await assertListingPlanPurchasableApplicationUseCase(actor, input.itemId);
  return schedulePlanSubscriptionChangeUseCase({
    itemId: input.itemId,
    partnerId: actor.uid,
    ...plan,
    idempotencyKey: input.idempotencyKey,
  });
}

=== server/application/usecases/paidPlanForBilling.ts — ARQUIVO NOVO, conteúdo completo ===
import { getSubscriptionPlanByIdUseCase } from '../../domain/admin';
import { PaymentDomainError } from '../../domain/payment';
import { isPaidPlanId, type PaidPlanId } from './activatePaidPlanApplicationUseCase';

const BILLING_INTERVAL: Record<PaidPlanId, { interval: 'month' | 'year'; intervalCount: number }> =
  {
    monthly: { interval: 'month', intervalCount: 1 },
    'semi-annual': { interval: 'month', intervalCount: 6 },
    annual: { interval: 'year', intervalCount: 1 },
  };

export interface PaidPlanForBilling {
  planId: PaidPlanId;
  planName: string;
  amountMinor: number;
  interval: 'month' | 'year';
  intervalCount: number;
}

/** Período pago do catálogo do admin: valor e intervalo saem do backend, nunca do cliente (§8.5). */
export async function loadPaidPlanForBilling(planId: string): Promise<PaidPlanForBilling> {
  if (!isPaidPlanId(planId)) {
    throw new PaymentDomainError('VALIDATION_ERROR', 'Plano inválido.', 400);
  }
  const plan = await getSubscriptionPlanByIdUseCase(planId);
  if (!plan || plan.isActive === false) {
    throw new PaymentDomainError('PLAN_INACTIVE', 'Plano indisponível.', 422);
  }
  return {
    planId,
    planName: plan.name,
    amountMinor: plan.priceMinor,
    ...BILLING_INTERVAL[planId],
  };
}

=== server/application/usecases/reconcilePlanSubscriptionWebhookApplicationUseCase.test.ts — diff ===
@@ -22,6 +22,7 @@ const PLAN_SNAPSHOT = {
   status: 'active' as const,
   currentPeriodEnd: '2026-11-10T12:00:00.000Z',
   cancelAtPeriodEnd: false,
+  scheduleId: null,
   metadata: {
     referenceType: 'plan_subscription',
     partnerId: 'p1',

=== server/application/usecases/startPartnerPlanSubscriptionApplicationUseCase.ts — diff ===
@@ -1,32 +1,17 @@
-import { getSubscriptionPlanByIdUseCase } from '../../domain/admin';
 import {
   type BillingLocale,
-  PaymentDomainError,
   type StartPlanSubscriptionResult,
   startPlanSubscriptionUseCase,
 } from '../../domain/payment';
-import { isPaidPlanId, type PaidPlanId } from './activatePaidPlanApplicationUseCase';
 import { assertListingPlanPurchasableApplicationUseCase } from './listingPlans/assertListingPlanPurchasableApplicationUseCase';
-
-const BILLING_INTERVAL: Record<PaidPlanId, { interval: 'month' | 'year'; intervalCount: number }> =
-  {
-    monthly: { interval: 'month', intervalCount: 1 },
-    'semi-annual': { interval: 'month', intervalCount: 6 },
-    annual: { interval: 'year', intervalCount: 1 },
-  };
+import { loadPaidPlanForBilling } from './paidPlanForBilling';
 
 /** Assinatura no cartão do plano de um estabelecimento (D2, D11). O Pix avulso segue no PaymentIntent. */
 export async function startPartnerPlanSubscriptionApplicationUseCase(
   actor: { uid: string; email?: string },
   input: { itemId: string; planId: string; locale: BillingLocale; idempotencyKey: string }
 ): Promise<StartPlanSubscriptionResult> {
-  if (!isPaidPlanId(input.planId)) {
-    throw new PaymentDomainError('VALIDATION_ERROR', 'Plano inválido.', 400);
-  }
-  const plan = await getSubscriptionPlanByIdUseCase(input.planId);
-  if (!plan || plan.isActive === false) {
-    throw new PaymentDomainError('PLAN_INACTIVE', 'Plano indisponível.', 422);
-  }
+  const plan = await loadPaidPlanForBilling(input.planId);
   const { currentPlanUntil } = await assertListingPlanPurchasableApplicationUseCase(
     actor,
     input.itemId
@@ -37,10 +22,7 @@ export async function startPartnerPlanSubscriptionApplicationUseCase(
     partnerId: actor.uid,
     email: actor.email,
     locale: input.locale,
-    planId: input.planId,
-    planName: plan.name,
-    amountMinor: plan.priceMinor,
-    ...BILLING_INTERVAL[input.planId],
+    ...plan,
     currentVerifiedUntil: currentPlanUntil,
     idempotencyKey: input.idempotencyKey,
   });

=== server/domain/payment/adapters/firestorePlanSubscriptionAdapter.ts — diff ===
@@ -16,6 +16,8 @@ function toRecord(itemId: string, data: Partial<PlanSubscriptionRecord>): PlanSu
     status: data.status ?? 'incomplete',
     currentPeriodEnd: data.currentPeriodEnd ?? null,
     cancelAtPeriodEnd: data.cancelAtPeriodEnd === true,
+    pendingPlanId: data.pendingPlanId ?? null,
+    pendingChangeAt: data.pendingChangeAt ?? null,
     updatedAt: String(data.updatedAt ?? ''),
   };
 }

=== server/domain/payment/adapters/stripeBillingGatewayAdapter.ts — diff ===
@@ -23,10 +23,21 @@ function toSnapshot(subscription: Stripe.Subscription): SubscriptionSnapshot {
     status: subscription.status as ProviderSubscriptionStatus,
     currentPeriodEnd: toIso(periodEnd),
     cancelAtPeriodEnd: subscription.cancel_at_period_end,
+    scheduleId: scheduleIdOf(subscription),
     metadata: { ...(subscription.metadata ?? {}) },
   };
 }
 
+function scheduleIdOf(subscription: Stripe.Subscription): string | null {
+  const schedule = subscription.schedule;
+  if (!schedule) return null;
+  return typeof schedule === 'string' ? schedule : schedule.id;
+}
+
+function priceIdOf(price: string | Stripe.Price | Stripe.DeletedPrice): string {
+  return typeof price === 'string' ? price : price.id;
+}
+
 export class StripeBillingGatewayAdapter implements BillingGatewayPort {
   private stripeClient: Stripe | null = null;
 
@@ -158,12 +169,76 @@ export class StripeBillingGatewayAdapter implements BillingGatewayPort {
     subscriptionId: string,
     cancel: boolean
   ): Promise<SubscriptionSnapshot> {
+    // Cancelar a renovação desfaz a troca agendada: a fase seguinte deixaria de existir.
+    if (cancel) await this.releaseSchedule(subscriptionId);
     return toSnapshot(
       await this.stripe.subscriptions.update(subscriptionId, { cancel_at_period_end: cancel })
     );
   }
 
+  // Referência: https://docs.stripe.com/billing/subscriptions/subscription-schedules#changing-subscriptions
+  async schedulePriceChange(params: {
+    subscriptionId: string;
+    priceId: string;
+    metadata: Record<string, string>;
+    idempotencyKey: string;
+  }): Promise<SubscriptionSnapshot> {
+    const subscription = await this.stripe.subscriptions.retrieve(params.subscriptionId);
+    const scheduleId =
+      scheduleIdOf(subscription) ??
+      (
+        await this.stripe.subscriptionSchedules.create(
+          { from_subscription: params.subscriptionId },
+          { idempotencyKey: `${params.idempotencyKey}_schedule` }
+        )
+      ).id;
+    const schedule = await this.stripe.subscriptionSchedules.retrieve(scheduleId);
+    const nowSeconds = Math.floor(Date.now() / 1000);
+    const current =
+      schedule.phases.find(
+        (phase) => phase.start_date <= nowSeconds && phase.end_date > nowSeconds
+      ) ?? schedule.phases[0];
+    if (!current) {
+      throw new Error('Agendamento da assinatura sem fase atual.');
+    }
+    // O Stripe apaga o que não for repetido na atualização: a fase atual volta inteira.
+    await this.stripe.subscriptionSchedules.update(
+      scheduleId,
+      {
+        end_behavior: 'release',
+        phases: [
+          {
+            start_date: current.start_date,
+            end_date: current.end_date,
+            items: current.items.map((item) => ({
+              price: priceIdOf(item.price),
+              quantity: item.quantity ?? 1,
+            })),
+            metadata: current.metadata ?? subscription.metadata ?? {},
+            ...(current.trial_end ? { trial_end: current.trial_end } : {}),
+          },
+          {
+            items: [{ price: params.priceId, quantity: 1 }],
+            metadata: params.metadata,
+            proration_behavior: 'none',
+          },
+        ],
+      },
+      { idempotencyKey: params.idempotencyKey }
+    );
+    return this.getSubscription(params.subscriptionId);
+  }
+
+  async releaseSchedule(subscriptionId: string): Promise<SubscriptionSnapshot> {
+    const subscription = await this.stripe.subscriptions.retrieve(subscriptionId);
+    const scheduleId = scheduleIdOf(subscription);
+    if (!scheduleId) return toSnapshot(subscription);
+    await this.stripe.subscriptionSchedules.release(scheduleId);
+    return this.getSubscription(subscriptionId);
+  }
+
   async cancelNow(subscriptionId: string): Promise<SubscriptionSnapshot> {
+    await this.releaseSchedule(subscriptionId);
     return toSnapshot(await this.stripe.subscriptions.cancel(subscriptionId));
   }

=== server/domain/payment/index.ts — diff ===
@@ -20,12 +20,14 @@ export { createBillingPortalSessionUseCase } from './usecases/billing/createBill
 export { getListingPlanSubscriptionUseCase } from './usecases/billing/getListingPlanSubscriptionUseCase';
 export { cancelListingPlanSubscriptionUseCase } from './usecases/billing/cancelListingPlanSubscriptionUseCase';
 export { cancelPartnerPlanSubscriptionsUseCase } from './usecases/billing/cancelPartnerPlanSubscriptionsUseCase';
+export { schedulePlanSubscriptionChangeUseCase } from './usecases/billing/schedulePlanSubscriptionChangeUseCase';
 export { setPlanSubscriptionCancelAtPeriodEndUseCase } from './usecases/billing/setPlanSubscriptionCancelAtPeriodEndUseCase';
 export { startPlanSubscriptionUseCase } from './usecases/billing/startPlanSubscriptionUseCase';
 export { syncPlanSubscriptionUseCase } from './usecases/billing/syncPlanSubscriptionUseCase';
 
 export { PaymentDomainError } from './services/stripePaymentService';
 export type {
+  SchedulePlanChangeInput,
   StartPlanSubscriptionInput,
   StartPlanSubscriptionResult,
 } from './services/billingService';

=== server/domain/payment/ports/billingGatewayPort.ts — diff ===
@@ -16,6 +16,8 @@ export interface SubscriptionSnapshot {
   status: ProviderSubscriptionStatus;
   currentPeriodEnd: string | null;
   cancelAtPeriodEnd: boolean;
+  /** Agendamento de troca de preço ligado à assinatura, se houver. */
+  scheduleId: string | null;
   metadata: Record<string, string>;
 }
 
@@ -53,6 +55,18 @@ export interface BillingGatewayPort {
   }): Promise<CreateSubscriptionResult>;
   getSubscription(subscriptionId: string): Promise<SubscriptionSnapshot>;
   setCancelAtPeriodEnd(subscriptionId: string, cancel: boolean): Promise<SubscriptionSnapshot>;
+  /**
+   * Troca o preço na próxima renovação (D13): o período atual segue igual e a fase seguinte já
+   * começa no novo preço e com a nova metadata, sem proração e sem pedir o cartão de novo.
+   */
+  schedulePriceChange(params: {
+    subscriptionId: string;
+    priceId: string;
+    metadata: Record<string, string>;
+    idempotencyKey: string;
+  }): Promise<SubscriptionSnapshot>;
+  /** Desfaz a troca agendada; a assinatura continua no preço atual. */
+  releaseSchedule(subscriptionId: string): Promise<SubscriptionSnapshot>;
   /** Cancela na hora, sem cobrança proporcional: usado quando o estabelecimento ou a conta é excluído. */
   cancelNow(subscriptionId: string): Promise<SubscriptionSnapshot>;
   createBillingPortalSession(params: {

=== server/domain/payment/ports/planSubscriptionRepositoryPort.ts — diff ===
@@ -10,6 +10,9 @@ export interface PlanSubscriptionRecord {
   status: ProviderSubscriptionStatus;
   currentPeriodEnd: string | null;
   cancelAtPeriodEnd: boolean;
+  /** Período escolhido para a próxima renovação (D13); `null` sem troca agendada. */
+  pendingPlanId: string | null;
+  pendingChangeAt: string | null;
   updatedAt: string;
 }

=== server/domain/payment/services/billingService.test.ts — diff ===
@@ -29,8 +29,11 @@ function createGateway(overrides: Partial<BillingGatewayPort> = {}): BillingGate
       status: 'canceled',
       currentPeriodEnd: null,
       cancelAtPeriodEnd: false,
+      scheduleId: null,
       metadata: {},
     }),
+    schedulePriceChange: vi.fn(),
+    releaseSchedule: vi.fn(),
     createBillingPortalSession: vi.fn().mockResolvedValue({ url: 'https://billing.stripe.com/x' }),
     ...overrides,
   };
@@ -57,6 +60,8 @@ function buildRecord(overrides: Partial<PlanSubscriptionRecord> = {}): PlanSubsc
     status: 'active',
     currentPeriodEnd: '2026-11-10T12:00:00.000Z',
     cancelAtPeriodEnd: false,
+    pendingPlanId: null,
+    pendingChangeAt: null,
     updatedAt: '2026-10-10T12:00:00.000Z',
     ...overrides,
   };
@@ -88,6 +93,7 @@ function snapshot(overrides: Partial<SubscriptionSnapshot> = {}): SubscriptionSn
     status: 'active',
     currentPeriodEnd: '2026-11-10T12:00:00.000Z',
     cancelAtPeriodEnd: false,
+    scheduleId: null,
     metadata: {
       referenceType: 'plan_subscription',
       partnerId: 'p1',
@@ -301,3 +307,121 @@ describe('BillingService: um cliente por conta e cancelamento nas exclusões (B2
     expect(gateway.cancelNow).toHaveBeenCalledWith('sub_1');
   });
 });
+
+describe('BillingService.schedulePlanChange (D13)', () => {
+  const CHANGE = {
+    itemId: 'item-1',
+    partnerId: 'p1',
+    planId: 'annual',
+    planName: 'Anual',
+    amountMinor: 49900,
+    interval: 'year' as const,
+    intervalCount: 1,
+    idempotencyKey: 'key-12345',
+  };
+
+  it('agenda o novo preço para a renovação, com a metadata do plano novo', async () => {
+    const repository = createRepository(buildRecord());
+    const gateway = createGateway({
+      ensureRecurringPrice: vi.fn().mockResolvedValue('price_annual'),
+      schedulePriceChange: vi.fn().mockResolvedValue(snapshot({ scheduleId: 'sub_sched_1' })),
+    });
+    const record = await new BillingService(gateway, repository, () => NOW).schedulePlanChange(
+      CHANGE
+    );
+    expect(gateway.ensureRecurringPrice).toHaveBeenCalledWith(
+      expect.objectContaining({
+        lookupKey: 'plan_annual_49900',
+        interval: 'year',
+        intervalCount: 1,
+      })
+    );
+    expect(gateway.schedulePriceChange).toHaveBeenCalledWith({
+      subscriptionId: 'sub_1',
+      priceId: 'price_annual',
+      metadata: {
+        referenceType: 'plan_subscription',
+        partnerId: 'p1',
+        planId: 'annual',
+        itemId: 'item-1',
+      },
+      idempotencyKey: 'sub_change_item-1_key-12345',
+    });
+    expect(record).toMatchObject({
+      planId: 'monthly',
+      pendingPlanId: 'annual',
+      pendingChangeAt: '2026-11-10T12:00:00.000Z',
+    });
+    expect(repository.save).toHaveBeenCalledWith(record);
+  });
+
+  it('escolher o período atual desfaz a troca agendada', async () => {
+    const repository = createRepository(buildRecord({ pendingPlanId: 'annual' }));
+    const gateway = createGateway({ releaseSchedule: vi.fn().mockResolvedValue(snapshot()) });
+    const record = await new BillingService(gateway, repository, () => NOW).schedulePlanChange({
+      ...CHANGE,
+      planId: 'monthly',
+    });
+    expect(gateway.releaseSchedule).toHaveBeenCalledWith('sub_1');
+    expect(gateway.schedulePriceChange).not.toHaveBeenCalled();
+    expect(record.pendingPlanId).toBeNull();
+  });
+
+  it('com a renovação cancelada, a troca retoma a renovação', async () => {
+    const repository = createRepository(buildRecord({ cancelAtPeriodEnd: true }));
+    const gateway = createGateway({
+      setCancelAtPeriodEnd: vi.fn().mockResolvedValue(snapshot()),
+      schedulePriceChange: vi.fn().mockResolvedValue(snapshot({ scheduleId: 'sub_sched_1' })),
+    });
+    await new BillingService(gateway, repository, () => NOW).schedulePlanChange(CHANGE);
+    expect(gateway.setCancelAtPeriodEnd).toHaveBeenCalledWith('sub_1', false);
+  });
+
+  it('pagamento atrasado ou assinatura de outra conta não trocam', async () => {
+    const pastDue = new BillingService(
+      createGateway(),
+      createRepository(buildRecord({ status: 'past_due' })),
+      () => NOW
+    );
+    await expect(pastDue.schedulePlanChange(CHANGE)).rejects.toMatchObject({
+      code: 'SUBSCRIPTION_PAST_DUE',
+      statusCode: 409,
+    });
+    const otherAccount = new BillingService(
+      createGateway(),
+      createRepository(buildRecord({ partnerId: 'p2' })),
+      () => NOW
+    );
+    await expect(otherAccount.schedulePlanChange(CHANGE)).rejects.toMatchObject({
+      code: 'SUBSCRIPTION_NOT_FOUND',
+    });
+  });
+
+  it('a troca sai do registro quando o novo período entra ou o agendamento some', async () => {
+    const repository = createRepository(
+      buildRecord({ pendingPlanId: 'annual', pendingChangeAt: '2026-11-10T12:00:00.000Z' })
+    );
+    const applied = snapshot({
+      scheduleId: null,
+      metadata: { ...snapshot().metadata, planId: 'annual' },
+    });
+    const gateway = createGateway({ getSubscription: vi.fn().mockResolvedValue(applied) });
+    await new BillingService(gateway, repository, () => NOW).syncSubscription('sub_1');
+    expect(repository.save).toHaveBeenCalledWith(
+      expect.objectContaining({ planId: 'annual', pendingPlanId: null, pendingChangeAt: null })
+    );
+  });
+
+  it('sync mantém a troca enquanto o agendamento existe', async () => {
+    const repository = createRepository(
+      buildRecord({ pendingPlanId: 'annual', pendingChangeAt: '2026-11-10T12:00:00.000Z' })
+    );
+    const gateway = createGateway({
+      getSubscription: vi.fn().mockResolvedValue(snapshot({ scheduleId: 'sub_sched_1' })),
+    });
+    await new BillingService(gateway, repository, () => NOW).syncSubscription('sub_1');
+    expect(repository.save).toHaveBeenCalledWith(
+      expect.objectContaining({ planId: 'monthly', pendingPlanId: 'annual' })
+    );
+  });
+});

=== server/domain/payment/services/billingService.ts — diff ===
@@ -35,6 +35,18 @@ export interface StartPlanSubscriptionInput {
   idempotencyKey: string;
 }
 
+/** Troca de período na próxima renovação (D13): o preço vem do catálogo, nunca do cliente. */
+export interface SchedulePlanChangeInput {
+  itemId: string;
+  partnerId: string;
+  planId: string;
+  planName: string;
+  amountMinor: number;
+  interval: 'month' | 'year';
+  intervalCount: number;
+  idempotencyKey: string;
+}
+
 export interface StartPlanSubscriptionResult {
   subscriptionId: string;
   status: ProviderSubscriptionStatus;
@@ -102,6 +114,8 @@ export class BillingService {
       status: created.status,
       currentPeriodEnd: created.currentPeriodEnd,
       cancelAtPeriodEnd: false,
+      pendingPlanId: null,
+      pendingChangeAt: null,
       updatedAt: this.now().toISOString(),
     });
 
@@ -147,16 +161,63 @@ export class BillingService {
     partnerId: string,
     cancel: boolean
   ): Promise<PlanSubscriptionRecord> {
-    const existing = await this.getListingSubscription(itemId, partnerId);
-    if (!existing?.stripeSubscriptionId || !LIVE_STATUSES.has(existing.status)) {
-      throw new PaymentDomainError('SUBSCRIPTION_NOT_FOUND', 'Nenhuma assinatura ativa.', 404);
-    }
+    const existing = await this.requireLiveSubscription(itemId, partnerId);
     const snapshot = await this.gateway.setCancelAtPeriodEnd(existing.stripeSubscriptionId, cancel);
     const record = this.toRecord(itemId, partnerId, snapshot, existing);
     await this.repository.save(record);
     return record;
   }
 
+  /**
+   * Troca de período na próxima renovação (D13). Escolher o período atual desfaz a troca agendada.
+   * Com a renovação cancelada, a troca a retoma: o parceiro escolheu continuar em outro período.
+   */
+  async schedulePlanChange(input: SchedulePlanChangeInput): Promise<PlanSubscriptionRecord> {
+    if (!Number.isInteger(input.amountMinor) || input.amountMinor <= 0) {
+      throw new PaymentDomainError('INVALID_AMOUNT', 'Valor do plano inválido.', 422);
+    }
+    const existing = await this.requireLiveSubscription(input.itemId, input.partnerId);
+    if (existing.status === 'past_due') {
+      throw new PaymentDomainError(
+        'SUBSCRIPTION_PAST_DUE',
+        'Atualize a forma de pagamento antes de trocar o período.',
+        409
+      );
+    }
+    const subscriptionId = existing.stripeSubscriptionId;
+
+    if (input.planId === existing.planId) {
+      const snapshot = await this.gateway.releaseSchedule(subscriptionId);
+      return this.saveSnapshot(existing, snapshot, null);
+    }
+
+    if (existing.cancelAtPeriodEnd) {
+      await this.gateway.setCancelAtPeriodEnd(subscriptionId, false);
+    }
+    const priceId = await this.gateway.ensureRecurringPrice({
+      lookupKey: `plan_${input.planId}_${input.amountMinor}`,
+      amountMinor: input.amountMinor,
+      interval: input.interval,
+      intervalCount: input.intervalCount,
+      nickname: input.planName,
+    });
+    const snapshot = await this.gateway.schedulePriceChange({
+      subscriptionId,
+      priceId,
+      metadata: {
+        referenceType: 'plan_subscription',
+        partnerId: input.partnerId,
+        planId: input.planId,
+        itemId: input.itemId,
+      },
+      idempotencyKey: `sub_change_${input.itemId}_${input.idempotencyKey}`,
+    });
+    return this.saveSnapshot(existing, snapshot, {
+      planId: input.planId,
+      changeAt: snapshot.currentPeriodEnd,
+    });
+  }
+
   /** Estabelecimento excluído: a assinatura dele para de cobrar na hora. */
   async cancelForListing(itemId: string): Promise<void> {
     const existing = await this.repository.get(itemId);
@@ -187,6 +248,31 @@ export class BillingService {
     });
   }
 
+  private async requireLiveSubscription(
+    itemId: string,
+    partnerId: string
+  ): Promise<PlanSubscriptionRecord & { stripeSubscriptionId: string }> {
+    const existing = await this.getListingSubscription(itemId, partnerId);
+    if (!existing?.stripeSubscriptionId || !LIVE_STATUSES.has(existing.status)) {
+      throw new PaymentDomainError('SUBSCRIPTION_NOT_FOUND', 'Nenhuma assinatura ativa.', 404);
+    }
+    return { ...existing, stripeSubscriptionId: existing.stripeSubscriptionId };
+  }
+
+  private async saveSnapshot(
+    existing: PlanSubscriptionRecord,
+    snapshot: SubscriptionSnapshot,
+    pending: { planId: string; changeAt: string | null } | null
+  ): Promise<PlanSubscriptionRecord> {
+    const record: PlanSubscriptionRecord = {
+      ...this.toRecord(existing.itemId, existing.partnerId, snapshot, existing),
+      pendingPlanId: pending?.planId ?? null,
+      pendingChangeAt: pending?.changeAt ?? null,
+    };
+    await this.repository.save(record);
+    return record;
+  }
+
   private async findCustomerId(partnerId: string): Promise<string | null> {
     const records = await this.repository.listByPartner(partnerId);
     return records.find((record) => record.stripeCustomerId)?.stripeCustomerId ?? null;
@@ -222,7 +308,22 @@ export class BillingService {
       status: snapshot.status,
       currentPeriodEnd: snapshot.currentPeriodEnd,
       cancelAtPeriodEnd: snapshot.cancelAtPeriodEnd,
+      ...this.pendingAfterSync(snapshot, existing),
       updatedAt: this.now().toISOString(),
     };
   }
+
+  /** A troca sai do registro quando o agendamento some ou quando o novo período já entrou. */
+  private pendingAfterSync(
+    snapshot: SubscriptionSnapshot,
+    existing: PlanSubscriptionRecord | null
+  ): Pick<PlanSubscriptionRecord, 'pendingPlanId' | 'pendingChangeAt'> {
+    const stillPending =
+      Boolean(existing?.pendingPlanId) &&
+      snapshot.scheduleId !== null &&
+      snapshot.metadata.planId !== existing?.pendingPlanId;
+    return stillPending && existing
+      ? { pendingPlanId: existing.pendingPlanId, pendingChangeAt: existing.pendingChangeAt }
+      : { pendingPlanId: null, pendingChangeAt: null };
+  }
 }

=== server/domain/payment/usecases/billing/schedulePlanSubscriptionChangeUseCase.ts — ARQUIVO NOVO, conteúdo completo ===
import { getBillingService } from '../../factory';
import type { PlanSubscriptionRecord } from '../../ports/planSubscriptionRepositoryPort';
import type { SchedulePlanChangeInput } from '../../services/billingService';

export async function schedulePlanSubscriptionChangeUseCase(
  input: SchedulePlanChangeInput
): Promise<PlanSubscriptionRecord> {
  return getBillingService().schedulePlanChange(input);
}

=== server/interfaces/http/billing/billingController.test.ts — diff ===
@@ -4,6 +4,9 @@ import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
 vi.mock('../../../application/usecases/startPartnerPlanSubscriptionApplicationUseCase', () => ({
   startPartnerPlanSubscriptionApplicationUseCase: vi.fn(),
 }));
+vi.mock('../../../application/usecases/changePartnerPlanSubscriptionApplicationUseCase', () => ({
+  changePartnerPlanSubscriptionApplicationUseCase: vi.fn(),
+}));
 vi.mock('../../../domain/payment', async () => {
   const { PaymentDomainError } = await import(
     '../../../domain/payment/services/stripePaymentService'
@@ -16,6 +19,7 @@ vi.mock('../../../domain/payment', async () => {
   };
 });
 
+import { changePartnerPlanSubscriptionApplicationUseCase } from '../../../application/usecases/changePartnerPlanSubscriptionApplicationUseCase';
 import { startPartnerPlanSubscriptionApplicationUseCase } from '../../../application/usecases/startPartnerPlanSubscriptionApplicationUseCase';
 import {
   createBillingPortalSessionUseCase,
@@ -120,6 +124,8 @@ describe('BillingController', () => {
       status: 'active',
       currentPeriodEnd: '2026-11-10T12:00:00.000Z',
       cancelAtPeriodEnd: false,
+      pendingPlanId: 'annual',
+      pendingChangeAt: '2026-11-10T12:00:00.000Z',
       updatedAt: '2026-10-10T12:00:00.000Z',
     });
     const { res, status, json } = createResponse();
@@ -134,6 +140,8 @@ describe('BillingController', () => {
         status: 'active',
         currentPeriodEnd: '2026-11-10T12:00:00.000Z',
         cancelAtPeriodEnd: false,
+        pendingPlanId: 'annual',
+        pendingChangeAt: '2026-11-10T12:00:00.000Z',
       },
     });
     expect(JSON.stringify(body)).not.toContain('cus_secret');
@@ -168,4 +176,42 @@ describe('BillingController', () => {
     expect(status).toHaveBeenCalledWith(503);
     expect(createBillingPortalSessionUseCase).not.toHaveBeenCalled();
   });
+
+  it('troca de período: só itemId, período e chave; o valor vem do servidor (D13)', async () => {
+    const { res, status } = createResponse();
+    await BillingController.changePlan(
+      request({ itemId: 'item-1', planId: 'annual', idempotencyKey: 'key-12345', amountMinor: 1 }),
+      res
+    );
+    expect(status).toHaveBeenCalledWith(400);
+    expect(changePartnerPlanSubscriptionApplicationUseCase).not.toHaveBeenCalled();
+  });
+
+  it('troca de período devolve a troca agendada sem o ID do cliente', async () => {
+    vi.mocked(changePartnerPlanSubscriptionApplicationUseCase).mockResolvedValue({
+      itemId: 'item-1',
+      partnerId: 'p1',
+      stripeCustomerId: 'cus_secret',
+      stripeSubscriptionId: 'sub_1',
+      planId: 'monthly',
+      status: 'active',
+      currentPeriodEnd: '2026-11-10T12:00:00.000Z',
+      cancelAtPeriodEnd: false,
+      pendingPlanId: 'annual',
+      pendingChangeAt: '2026-11-10T12:00:00.000Z',
+      updatedAt: '2026-10-10T12:00:00.000Z',
+    });
+    const { res, status, json } = createResponse();
+    await BillingController.changePlan(
+      request({ itemId: 'item-1', planId: 'annual', idempotencyKey: 'key-12345' }),
+      res
+    );
+    expect(changePartnerPlanSubscriptionApplicationUseCase).toHaveBeenCalledWith(
+      { uid: 'p1' },
+      { itemId: 'item-1', planId: 'annual', idempotencyKey: 'key-12345' }
+    );
+    expect(status).toHaveBeenCalledWith(200);
+    expect(json.mock.calls[0]?.[0].subscription.pendingPlanId).toBe('annual');
+    expect(JSON.stringify(json.mock.calls[0]?.[0])).not.toContain('cus_secret');
+  });
 });

=== server/interfaces/http/billing/billingController.ts — diff ===
@@ -1,4 +1,5 @@
 import type { Response } from 'express';
+import { changePartnerPlanSubscriptionApplicationUseCase } from '../../../application/usecases/changePartnerPlanSubscriptionApplicationUseCase';
 import { startPartnerPlanSubscriptionApplicationUseCase } from '../../../application/usecases/startPartnerPlanSubscriptionApplicationUseCase';
 import {
   createBillingPortalSessionUseCase,
@@ -10,6 +11,7 @@ import {
 import type { AuthenticatedRequest } from '../../../infrastructure/auth/authenticatedRequest';
 import {
   BillingPortalSchema,
+  ChangePlanSubscriptionSchema,
   ListingSubscriptionSchema,
   StartPlanSubscriptionSchema,
 } from './schemas/billingSchemas';
@@ -37,6 +39,8 @@ function toPublicSubscription(record: PlanSubscriptionRecord | null) {
     status: record.status,
     currentPeriodEnd: record.currentPeriodEnd,
     cancelAtPeriodEnd: record.cancelAtPeriodEnd,
+    pendingPlanId: record.pendingPlanId,
+    pendingChangeAt: record.pendingChangeAt,
   };
 }
 
@@ -76,6 +80,25 @@ export class BillingController {
     }
   }
 
+  static async changePlan(req: AuthenticatedRequest, res: Response): Promise<Response> {
+    if (!req.user?.uid) {
+      return sendError(res, 401, 'UNAUTHENTICATED', 'Não autenticado.');
+    }
+    const parsed = ChangePlanSubscriptionSchema.safeParse(req.body);
+    if (!parsed.success) {
+      return sendError(res, 400, 'VALIDATION_ERROR', 'Dados da troca de período inválidos.');
+    }
+    try {
+      const record = await changePartnerPlanSubscriptionApplicationUseCase(
+        { uid: req.user.uid },
+        parsed.data
+      );
+      return res.status(200).json({ subscription: toPublicSubscription(record) });
+    } catch (error: unknown) {
+      return handleError(res, 'changePlan', error);
+    }
+  }
+
   static async cancelAtPeriodEnd(req: AuthenticatedRequest, res: Response): Promise<Response> {
     return BillingController.setCancelAtPeriodEnd(req, res, true);
   }

=== server/interfaces/http/billing/billingRoutes.ts — diff ===
@@ -12,6 +12,7 @@ const router = Router();
 
 router.post('/subscriptions', verifyAuthTokenStrict, BillingController.startSubscription);
 router.get('/subscription', verifyAuthToken, BillingController.getSubscription);
+router.post('/subscription/change', verifyAuthTokenStrict, BillingController.changePlan);
 router.post('/subscription/cancel', verifyAuthTokenStrict, BillingController.cancelAtPeriodEnd);
 router.post('/subscription/resume', verifyAuthTokenStrict, BillingController.resume);
 router.post('/subscription/portal', verifyAuthTokenStrict, BillingController.createPortalSession);

=== server/interfaces/http/billing/schemas/billingSchemas.ts — diff ===
@@ -15,6 +15,15 @@ export const StartPlanSubscriptionSchema = z
   })
   .strict();
 
+/** Troca de período na próxima renovação (D13); o valor vem do catálogo no servidor. */
+export const ChangePlanSubscriptionSchema = z
+  .object({
+    itemId: ITEM_ID,
+    planId: z.enum(['monthly', 'semi-annual', 'annual']),
+    idempotencyKey: z.string().min(8).max(150),
+  })
+  .strict();
+
 /** Assinatura de um estabelecimento: `?itemId=` na leitura, `{ itemId }` em cancelar e retomar. */
 export const ListingSubscriptionSchema = z.object({ itemId: ITEM_ID }).strict();

VERIFICAÇÃO (obrigatória):
- `npm run typecheck`, `npx biome lint .` (0 erros; arquivos tocados sem avisos), `npm test` → 178 arquivos, 947 testes, `npm run build`.

STRIPE: nada a configurar. O evento customer.subscription.updated já é assinado e registra a troca no início do novo período.

Responda no formato do AGENTS.md §16.3.

LIMPEZA (obrigatória, ao terminar de implementar): apague todos os arquivos de public/assets/aistudio/, inclusive o deste prompt. São cópias dos textos colados no chat, salvas automaticamente pelo AI Studio, e public/ vai para o site publicado. Se a pasta ficar vazia, apague a pasta também.
~~~~
