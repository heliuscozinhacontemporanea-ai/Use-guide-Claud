import Stripe from 'stripe';
import type {
  BillingGatewayPort,
  BillingLocale,
  CreateSubscriptionResult,
  ProviderSubscriptionStatus,
  SubscriptionSnapshot,
} from '../ports/billingGatewayPort';

const PLAN_PRODUCT_ID = 'use_guide_partner_plan';

function toIso(unixSeconds: number | null | undefined): string | null {
  return unixSeconds ? new Date(unixSeconds * 1000).toISOString() : null;
}

function toSnapshot(subscription: Stripe.Subscription): SubscriptionSnapshot {
  // Desde a API 2025-03-31 o fim do período fica no item da assinatura, não na assinatura.
  const periodEnd = subscription.items.data[0]?.current_period_end ?? null;
  return {
    subscriptionId: subscription.id,
    customerId:
      typeof subscription.customer === 'string' ? subscription.customer : subscription.customer.id,
    status: subscription.status as ProviderSubscriptionStatus,
    currentPeriodEnd: toIso(periodEnd),
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
    scheduleId: scheduleIdOf(subscription),
    metadata: { ...(subscription.metadata ?? {}) },
  };
}

function scheduleIdOf(subscription: Stripe.Subscription): string | null {
  const schedule = subscription.schedule;
  if (!schedule) return null;
  return typeof schedule === 'string' ? schedule : schedule.id;
}

function priceIdOf(price: string | Stripe.Price | Stripe.DeletedPrice): string {
  return typeof price === 'string' ? price : price.id;
}

export class StripeBillingGatewayAdapter implements BillingGatewayPort {
  private stripeClient: Stripe | null = null;

  private get stripe(): Stripe {
    if (!this.stripeClient) {
      const secretKey = process.env.STRIPE_SECRET_KEY;
      if (!secretKey) {
        throw new Error('STRIPE_SECRET_KEY não configurada.');
      }
      this.stripeClient = new Stripe(secretKey);
    }
    return this.stripeClient;
  }

  async ensureCustomer(params: {
    existingCustomerId: string | null;
    partnerId: string;
    email?: string;
    locale: BillingLocale;
  }): Promise<string> {
    if (params.existingCustomerId) {
      return params.existingCustomerId;
    }
    const customer = await this.stripe.customers.create(
      {
        ...(params.email ? { email: params.email } : {}),
        preferred_locales: [params.locale],
        metadata: { partnerId: params.partnerId },
      },
      { idempotencyKey: `customer_partner_${params.partnerId}` }
    );
    return customer.id;
  }

  async ensureRecurringPrice(params: {
    lookupKey: string;
    amountMinor: number;
    interval: 'month' | 'year';
    intervalCount: number;
    nickname: string;
  }): Promise<string> {
    const existing = await this.stripe.prices.list({
      lookup_keys: [params.lookupKey],
      active: true,
      limit: 1,
    });
    if (existing.data[0]) {
      return existing.data[0].id;
    }
    await this.ensurePlanProduct();
    const price = await this.stripe.prices.create(
      {
        product: PLAN_PRODUCT_ID,
        currency: 'brl',
        unit_amount: params.amountMinor,
        recurring: { interval: params.interval, interval_count: params.intervalCount },
        lookup_key: params.lookupKey,
        nickname: params.nickname,
      },
      { idempotencyKey: `price_${params.lookupKey}` }
    );
    return price.id;
  }

  private async ensurePlanProduct(): Promise<void> {
    try {
      await this.stripe.products.retrieve(PLAN_PRODUCT_ID);
    } catch (error) {
      if (!(error instanceof Stripe.errors.StripeInvalidRequestError) || error.statusCode !== 404) {
        throw error;
      }
      await this.stripe.products.create(
        { id: PLAN_PRODUCT_ID, name: 'Use Guide — Plano Parceiro' },
        { idempotencyKey: `product_${PLAN_PRODUCT_ID}` }
      );
    }
  }

  async createSubscription(params: {
    customerId: string;
    priceId: string;
    trialEndUnixSeconds: number | null;
    metadata: Record<string, string>;
    idempotencyKey: string;
  }): Promise<CreateSubscriptionResult> {
    const subscription = await this.stripe.subscriptions.create(
      {
        customer: params.customerId,
        items: [{ price: params.priceId }],
        payment_behavior: 'default_incomplete',
        payment_settings: {
          save_default_payment_method: 'on_subscription',
          payment_method_types: ['card'],
        },
        ...(params.trialEndUnixSeconds ? { trial_end: params.trialEndUnixSeconds } : {}),
        metadata: params.metadata,
        expand: ['latest_invoice.confirmation_secret', 'pending_setup_intent'],
      },
      { idempotencyKey: params.idempotencyKey }
    );

    // Referência: https://docs.stripe.com/billing/subscriptions/build-subscriptions
    // Com cobrança imediata o segredo vem da fatura; com período de teste, do SetupIntent.
    const invoice =
      typeof subscription.latest_invoice === 'object' ? subscription.latest_invoice : null;
    const paymentSecret = invoice?.confirmation_secret?.client_secret ?? null;
    const setupIntent =
      typeof subscription.pending_setup_intent === 'object'
        ? subscription.pending_setup_intent
        : null;
    const setupSecret = setupIntent?.client_secret ?? null;
    const snapshot = toSnapshot(subscription);

    return {
      subscriptionId: snapshot.subscriptionId,
      customerId: snapshot.customerId,
      status: snapshot.status,
      currentPeriodEnd: snapshot.currentPeriodEnd,
      clientSecret: paymentSecret ?? setupSecret,
      intentType: paymentSecret ? 'payment' : setupSecret ? 'setup' : null,
    };
  }

  async getSubscription(subscriptionId: string): Promise<SubscriptionSnapshot> {
    return toSnapshot(await this.stripe.subscriptions.retrieve(subscriptionId));
  }

  async setCancelAtPeriodEnd(
    subscriptionId: string,
    cancel: boolean
  ): Promise<SubscriptionSnapshot> {
    // Cancelar a renovação desfaz a troca agendada: a fase seguinte deixaria de existir.
    if (cancel) await this.releaseSchedule(subscriptionId);
    return toSnapshot(
      await this.stripe.subscriptions.update(subscriptionId, { cancel_at_period_end: cancel })
    );
  }

  // Referência: https://docs.stripe.com/billing/subscriptions/subscription-schedules#changing-subscriptions
  async schedulePriceChange(params: {
    subscriptionId: string;
    priceId: string;
    metadata: Record<string, string>;
    idempotencyKey: string;
  }): Promise<SubscriptionSnapshot> {
    const subscription = await this.stripe.subscriptions.retrieve(params.subscriptionId);
    const scheduleId =
      scheduleIdOf(subscription) ??
      (
        await this.stripe.subscriptionSchedules.create(
          { from_subscription: params.subscriptionId },
          { idempotencyKey: `${params.idempotencyKey}_schedule` }
        )
      ).id;
    const schedule = await this.stripe.subscriptionSchedules.retrieve(scheduleId);
    const nowSeconds = Math.floor(Date.now() / 1000);
    const current =
      schedule.phases.find(
        (phase) => phase.start_date <= nowSeconds && phase.end_date > nowSeconds
      ) ?? schedule.phases[0];
    if (!current) {
      throw new Error('Agendamento da assinatura sem fase atual.');
    }
    // O Stripe apaga o que não for repetido na atualização: a fase atual volta inteira.
    await this.stripe.subscriptionSchedules.update(
      scheduleId,
      {
        end_behavior: 'release',
        phases: [
          {
            start_date: current.start_date,
            end_date: current.end_date,
            items: current.items.map((item) => ({
              price: priceIdOf(item.price),
              quantity: item.quantity ?? 1,
            })),
            metadata: current.metadata ?? subscription.metadata ?? {},
            ...(current.trial_end ? { trial_end: current.trial_end } : {}),
          },
          {
            items: [{ price: params.priceId, quantity: 1 }],
            metadata: params.metadata,
            proration_behavior: 'none',
          },
        ],
      },
      { idempotencyKey: params.idempotencyKey }
    );
    return this.getSubscription(params.subscriptionId);
  }

  async releaseSchedule(subscriptionId: string): Promise<SubscriptionSnapshot> {
    const subscription = await this.stripe.subscriptions.retrieve(subscriptionId);
    const scheduleId = scheduleIdOf(subscription);
    if (!scheduleId) return toSnapshot(subscription);
    await this.stripe.subscriptionSchedules.release(scheduleId);
    return this.getSubscription(subscriptionId);
  }

  async cancelNow(subscriptionId: string): Promise<SubscriptionSnapshot> {
    await this.releaseSchedule(subscriptionId);
    return toSnapshot(await this.stripe.subscriptions.cancel(subscriptionId));
  }

  async createBillingPortalSession(params: {
    customerId: string;
    returnUrl: string;
    locale: BillingLocale;
  }): Promise<{ url: string }> {
    const session = await this.stripe.billingPortal.sessions.create({
      customer: params.customerId,
      return_url: params.returnUrl,
      locale: params.locale,
    });
    return { url: session.url };
  }
}
