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
    const existing = await this.repository.get(input.partnerId);
    if (existing && LIVE_STATUSES.has(existing.status)) {
      throw new PaymentDomainError(
        'SUBSCRIPTION_ALREADY_ACTIVE',
        'Você já tem uma assinatura ativa.',
        409
      );
    }

    const customerId = await this.gateway.ensureCustomer({
      existingCustomerId: existing?.stripeCustomerId || null,
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
      },
      idempotencyKey: `sub_${input.partnerId}_${input.idempotencyKey}`,
    });

    await this.repository.save({
      partnerId: input.partnerId,
      stripeCustomerId: customerId,
      stripeSubscriptionId: created.subscriptionId,
      planId: input.planId,
      status: created.status,
      currentPeriodEnd: created.currentPeriodEnd,
      cancelAtPeriodEnd: false,
      updatedAt: this.now().toISOString(),
    });

    return {
      subscriptionId: created.subscriptionId,
      status: created.status,
      clientSecret: created.clientSecret,
      intentType: created.intentType,
    };
  }

  /** Relê a assinatura no provedor (fonte da verdade) e atualiza o registro do parceiro. */
  async syncSubscription(subscriptionId: string): Promise<SubscriptionSnapshot> {
    const snapshot = await this.gateway.getSubscription(subscriptionId);
    const partnerId = snapshot.metadata.partnerId;
    if (!partnerId) {
      return snapshot;
    }
    const existing = await this.repository.get(partnerId);
    // Uma tentativa antiga que expirou não pode sobrescrever a assinatura vigente.
    if (
      existing?.stripeSubscriptionId &&
      existing.stripeSubscriptionId !== snapshot.subscriptionId &&
      LIVE_STATUSES.has(existing.status)
    ) {
      return snapshot;
    }
    await this.repository.save(this.toRecord(partnerId, snapshot, existing));
    return snapshot;
  }

  async getPartnerSubscription(partnerId: string): Promise<PlanSubscriptionRecord | null> {
    return this.repository.get(partnerId);
  }

  async setCancelAtPeriodEnd(partnerId: string, cancel: boolean): Promise<PlanSubscriptionRecord> {
    const existing = await this.repository.get(partnerId);
    if (!existing?.stripeSubscriptionId || !LIVE_STATUSES.has(existing.status)) {
      throw new PaymentDomainError('SUBSCRIPTION_NOT_FOUND', 'Nenhuma assinatura ativa.', 404);
    }
    const snapshot = await this.gateway.setCancelAtPeriodEnd(existing.stripeSubscriptionId, cancel);
    const record = this.toRecord(partnerId, snapshot, existing);
    await this.repository.save(record);
    return record;
  }

  async createPortalSession(
    partnerId: string,
    returnUrl: string,
    locale: BillingLocale
  ): Promise<{ url: string }> {
    const existing = await this.repository.get(partnerId);
    if (!existing?.stripeCustomerId) {
      throw new PaymentDomainError('SUBSCRIPTION_NOT_FOUND', 'Nenhuma assinatura encontrada.', 404);
    }
    return this.gateway.createBillingPortalSession({
      customerId: existing.stripeCustomerId,
      returnUrl,
      locale,
    });
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
    partnerId: string,
    snapshot: SubscriptionSnapshot,
    existing: PlanSubscriptionRecord | null
  ): PlanSubscriptionRecord {
    return {
      partnerId,
      stripeCustomerId: snapshot.customerId,
      stripeSubscriptionId: snapshot.subscriptionId,
      planId: snapshot.metadata.planId || existing?.planId || '',
      status: snapshot.status,
      currentPeriodEnd: snapshot.currentPeriodEnd,
      cancelAtPeriodEnd: snapshot.cancelAtPeriodEnd,
      updatedAt: this.now().toISOString(),
    };
  }
}
