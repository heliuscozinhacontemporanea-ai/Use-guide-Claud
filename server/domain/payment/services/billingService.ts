import type {
  BillingGatewayPort,
  BillingLocale,
  ProviderSubscriptionStatus,
  SubscriptionSnapshot,
} from '../ports/billingGatewayPort';
import type {
  PlanSubscriptionRecord,
  PlanSubscriptionRepositoryPort,
} from '../ports/planSubscriptionRepositoryPort';
import { PaymentDomainError } from './stripePaymentService';

const LIVE_STATUSES: ReadonlySet<ProviderSubscriptionStatus> = new Set([
  'active',
  'trialing',
  'past_due',
]);

// O Stripe exige trial_end pelo menos 48 h no futuro.
const MIN_TRIAL_MS = 48 * 60 * 60 * 1000;

export interface StartPlanSubscriptionInput {
  /** Estabelecimento ou perfil de produtor dono do plano (D11). */
  itemId: string;
  partnerId: string;
  email?: string;
  locale: BillingLocale;
  planId: string;
  planName: string;
  amountMinor: number;
  interval: 'month' | 'year';
  intervalCount: number;
  /** Fim do período já pago (plano avulso ou teste); vira período de teste para não cobrar duas vezes. */
  currentVerifiedUntil: string | null;
  idempotencyKey: string;
}

/** Troca de período na próxima renovação (D13): o preço vem do catálogo, nunca do cliente. */
export interface SchedulePlanChangeInput {
  itemId: string;
  partnerId: string;
  planId: string;
  planName: string;
  amountMinor: number;
  interval: 'month' | 'year';
  intervalCount: number;
  idempotencyKey: string;
}

export interface StartPlanSubscriptionResult {
  subscriptionId: string;
  status: ProviderSubscriptionStatus;
  clientSecret: string | null;
  intentType: 'payment' | 'setup' | null;
}

export class BillingService {
  constructor(
    private readonly gateway: BillingGatewayPort,
    private readonly repository: PlanSubscriptionRepositoryPort,
    private readonly now: () => Date = () => new Date()
  ) {}

  async startPlanSubscription(
    input: StartPlanSubscriptionInput
  ): Promise<StartPlanSubscriptionResult> {
    if (!Number.isInteger(input.amountMinor) || input.amountMinor <= 0) {
      throw new PaymentDomainError('INVALID_AMOUNT', 'Valor do plano inválido.', 422);
    }
    const existing = await this.repository.get(input.itemId);
    if (existing && LIVE_STATUSES.has(existing.status)) {
      throw new PaymentDomainError(
        'SUBSCRIPTION_ALREADY_ACTIVE',
        'Este estabelecimento já tem uma assinatura ativa.',
        409
      );
    }

    // Um cliente no Stripe por conta, para todas as assinaturas dos estabelecimentos dela.
    const customerId = await this.gateway.ensureCustomer({
      existingCustomerId:
        existing?.stripeCustomerId || (await this.findCustomerId(input.partnerId)),
      partnerId: input.partnerId,
      email: input.email,
      locale: input.locale,
    });
    const priceId = await this.gateway.ensureRecurringPrice({
      lookupKey: `plan_${input.planId}_${input.amountMinor}`,
      amountMinor: input.amountMinor,
      interval: input.interval,
      intervalCount: input.intervalCount,
      nickname: input.planName,
    });

    const created = await this.gateway.createSubscription({
      customerId,
      priceId,
      trialEndUnixSeconds: this.resolveTrialEnd(input.currentVerifiedUntil),
      metadata: {
        referenceType: 'plan_subscription',
        partnerId: input.partnerId,
        planId: input.planId,
        itemId: input.itemId,
      },
      idempotencyKey: `sub_${input.itemId}_${input.idempotencyKey}`,
    });

    await this.repository.save({
      itemId: input.itemId,
      partnerId: input.partnerId,
      stripeCustomerId: customerId,
      stripeSubscriptionId: created.subscriptionId,
      planId: input.planId,
      status: created.status,
      currentPeriodEnd: created.currentPeriodEnd,
      cancelAtPeriodEnd: false,
      pendingPlanId: null,
      pendingChangeAt: null,
      updatedAt: this.now().toISOString(),
    });

    return {
      subscriptionId: created.subscriptionId,
      status: created.status,
      clientSecret: created.clientSecret,
      intentType: created.intentType,
    };
  }

  /** Relê a assinatura no provedor (fonte da verdade) e atualiza o registro do estabelecimento. */
  async syncSubscription(subscriptionId: string): Promise<SubscriptionSnapshot> {
    const snapshot = await this.gateway.getSubscription(subscriptionId);
    const { partnerId, itemId } = snapshot.metadata;
    if (!partnerId || !itemId) {
      return snapshot;
    }
    const existing = await this.repository.get(itemId);
    // Uma tentativa antiga que expirou não pode sobrescrever a assinatura vigente.
    if (
      existing?.stripeSubscriptionId &&
      existing.stripeSubscriptionId !== snapshot.subscriptionId &&
      LIVE_STATUSES.has(existing.status)
    ) {
      return snapshot;
    }
    await this.repository.save(this.toRecord(itemId, partnerId, snapshot, existing));
    return snapshot;
  }

  /** Assinatura do estabelecimento; de outra conta é tratada como inexistente (IDOR, §7.10). */
  async getListingSubscription(
    itemId: string,
    partnerId: string
  ): Promise<PlanSubscriptionRecord | null> {
    const record = await this.repository.get(itemId);
    return record?.partnerId === partnerId ? record : null;
  }

  async setCancelAtPeriodEnd(
    itemId: string,
    partnerId: string,
    cancel: boolean
  ): Promise<PlanSubscriptionRecord> {
    const existing = await this.requireLiveSubscription(itemId, partnerId);
    const snapshot = await this.gateway.setCancelAtPeriodEnd(existing.stripeSubscriptionId, cancel);
    const record = this.toRecord(itemId, partnerId, snapshot, existing);
    await this.repository.save(record);
    return record;
  }

  /**
   * Troca de período na próxima renovação (D13). Escolher o período atual desfaz a troca agendada.
   * Com a renovação cancelada, a troca a retoma: o parceiro escolheu continuar em outro período.
   */
  async schedulePlanChange(input: SchedulePlanChangeInput): Promise<PlanSubscriptionRecord> {
    if (!Number.isInteger(input.amountMinor) || input.amountMinor <= 0) {
      throw new PaymentDomainError('INVALID_AMOUNT', 'Valor do plano inválido.', 422);
    }
    const existing = await this.requireLiveSubscription(input.itemId, input.partnerId);
    if (existing.status === 'past_due') {
      throw new PaymentDomainError(
        'SUBSCRIPTION_PAST_DUE',
        'Atualize a forma de pagamento antes de trocar o período.',
        409
      );
    }
    const subscriptionId = existing.stripeSubscriptionId;

    if (input.planId === existing.planId) {
      const snapshot = await this.gateway.releaseSchedule(subscriptionId);
      return this.saveSnapshot(existing, snapshot, null);
    }

    if (existing.cancelAtPeriodEnd) {
      await this.gateway.setCancelAtPeriodEnd(subscriptionId, false);
    }
    const priceId = await this.gateway.ensureRecurringPrice({
      lookupKey: `plan_${input.planId}_${input.amountMinor}`,
      amountMinor: input.amountMinor,
      interval: input.interval,
      intervalCount: input.intervalCount,
      nickname: input.planName,
    });
    const snapshot = await this.gateway.schedulePriceChange({
      subscriptionId,
      priceId,
      metadata: {
        referenceType: 'plan_subscription',
        partnerId: input.partnerId,
        planId: input.planId,
        itemId: input.itemId,
      },
      idempotencyKey: `sub_change_${input.itemId}_${input.idempotencyKey}`,
    });
    return this.saveSnapshot(existing, snapshot, {
      planId: input.planId,
      changeAt: snapshot.currentPeriodEnd,
    });
  }

  /** Estabelecimento excluído: a assinatura dele para de cobrar na hora. */
  async cancelForListing(itemId: string): Promise<void> {
    const existing = await this.repository.get(itemId);
    if (!existing) return;
    await this.cancelRecord(existing);
  }

  /** Conta excluída: todas as assinaturas dos estabelecimentos dela param de cobrar. */
  async cancelForPartner(partnerId: string): Promise<void> {
    for (const record of await this.repository.listByPartner(partnerId)) {
      await this.cancelRecord(record);
    }
  }

  async createPortalSession(
    partnerId: string,
    returnUrl: string,
    locale: BillingLocale
  ): Promise<{ url: string }> {
    const customerId = await this.findCustomerId(partnerId);
    if (!customerId) {
      throw new PaymentDomainError('SUBSCRIPTION_NOT_FOUND', 'Nenhuma assinatura encontrada.', 404);
    }
    return this.gateway.createBillingPortalSession({
      customerId,
      returnUrl,
      locale,
    });
  }

  private async requireLiveSubscription(
    itemId: string,
    partnerId: string
  ): Promise<PlanSubscriptionRecord & { stripeSubscriptionId: string }> {
    const existing = await this.getListingSubscription(itemId, partnerId);
    if (!existing?.stripeSubscriptionId || !LIVE_STATUSES.has(existing.status)) {
      throw new PaymentDomainError('SUBSCRIPTION_NOT_FOUND', 'Nenhuma assinatura ativa.', 404);
    }
    return { ...existing, stripeSubscriptionId: existing.stripeSubscriptionId };
  }

  private async saveSnapshot(
    existing: PlanSubscriptionRecord,
    snapshot: SubscriptionSnapshot,
    pending: { planId: string; changeAt: string | null } | null
  ): Promise<PlanSubscriptionRecord> {
    const record: PlanSubscriptionRecord = {
      ...this.toRecord(existing.itemId, existing.partnerId, snapshot, existing),
      pendingPlanId: pending?.planId ?? null,
      pendingChangeAt: pending?.changeAt ?? null,
    };
    await this.repository.save(record);
    return record;
  }

  private async findCustomerId(partnerId: string): Promise<string | null> {
    const records = await this.repository.listByPartner(partnerId);
    return records.find((record) => record.stripeCustomerId)?.stripeCustomerId ?? null;
  }

  private async cancelRecord(record: PlanSubscriptionRecord): Promise<void> {
    if (!record.stripeSubscriptionId || !LIVE_STATUSES.has(record.status)) return;
    const snapshot = await this.gateway.cancelNow(record.stripeSubscriptionId);
    await this.repository.save(this.toRecord(record.itemId, record.partnerId, snapshot, record));
  }

  private resolveTrialEnd(currentVerifiedUntil: string | null): number | null {
    if (!currentVerifiedUntil) return null;
    const paidUntil = new Date(currentVerifiedUntil).getTime();
    if (Number.isNaN(paidUntil) || paidUntil < this.now().getTime() + MIN_TRIAL_MS) {
      return null;
    }
    return Math.floor(paidUntil / 1000);
  }

  private toRecord(
    itemId: string,
    partnerId: string,
    snapshot: SubscriptionSnapshot,
    existing: PlanSubscriptionRecord | null
  ): PlanSubscriptionRecord {
    return {
      itemId,
      partnerId,
      stripeCustomerId: snapshot.customerId,
      stripeSubscriptionId: snapshot.subscriptionId,
      planId: snapshot.metadata.planId || existing?.planId || '',
      status: snapshot.status,
      currentPeriodEnd: snapshot.currentPeriodEnd,
      cancelAtPeriodEnd: snapshot.cancelAtPeriodEnd,
      ...this.pendingAfterSync(snapshot, existing),
      updatedAt: this.now().toISOString(),
    };
  }

  /** A troca sai do registro quando o agendamento some ou quando o novo período já entrou. */
  private pendingAfterSync(
    snapshot: SubscriptionSnapshot,
    existing: PlanSubscriptionRecord | null
  ): Pick<PlanSubscriptionRecord, 'pendingPlanId' | 'pendingChangeAt'> {
    const stillPending =
      Boolean(existing?.pendingPlanId) &&
      snapshot.scheduleId !== null &&
      snapshot.metadata.planId !== existing?.pendingPlanId;
    return stillPending && existing
      ? { pendingPlanId: existing.pendingPlanId, pendingChangeAt: existing.pendingChangeAt }
      : { pendingPlanId: null, pendingChangeAt: null };
  }
}
