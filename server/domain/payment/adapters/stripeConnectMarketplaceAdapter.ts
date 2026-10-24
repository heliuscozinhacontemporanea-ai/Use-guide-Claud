import Stripe from 'stripe';
import type {
  ConnectedAccountStatus,
  CreateConnectedAccountInput,
  MarketplaceAccountPort,
} from '../ports/marketplaceAccountPort';

function deriveAccountStatus(account: Stripe.Account): ConnectedAccountStatus['status'] {
  if (account.requirements?.disabled_reason) {
    if (account.charges_enabled && account.payouts_enabled) {
      return 'enabled';
    }
    if (account.details_submitted) {
      return 'restricted';
    }
    return 'disabled';
  }
  if (account.charges_enabled && account.payouts_enabled) {
    return 'enabled';
  }
  if (account.details_submitted) {
    return 'restricted';
  }
  return 'pending';
}

export class StripeConnectMarketplaceAdapter implements MarketplaceAccountPort {
  private stripeClient: Stripe | null = null;
  private readonly explicitSecretKey?: string;

  constructor(secretKey?: string) {
    this.explicitSecretKey = secretKey;
  }

  private get stripe(): Stripe {
    if (!this.stripeClient) {
      const secretKey = this.explicitSecretKey || process.env.STRIPE_SECRET_KEY;
      if (!secretKey) {
        throw new Error('STRIPE_SECRET_KEY não configurada.');
      }
      this.stripeClient = new Stripe(secretKey);
    }
    return this.stripeClient;
  }

  async createConnectedAccount(input: CreateConnectedAccountInput): Promise<{ accountId: string }> {
    const account = await this.stripe.accounts.create(
      {
        country: 'BR',
        business_type: 'company',
        company: { tax_id: input.companyTaxId },
        ...(input.email ? { email: input.email } : {}),
        controller: {
          fees: {
            payer: 'application',
          },
          losses: {
            payments: 'application',
          },
          stripe_dashboard: {
            type: 'express',
          },
        },
        capabilities: {
          card_payments: {
            requested: true,
          },
          transfers: {
            requested: true,
          },
        },
        metadata: {
          accountKey: input.accountKey,
          ownerUid: input.ownerUid,
        },
      },
      { idempotencyKey: `acct_${input.accountKey}` }
    );

    return {
      accountId: account.id,
    };
  }

  async createAccountSession(accountId: string): Promise<{ clientSecret: string }> {
    const session = await this.stripe.accountSessions.create({
      account: accountId,
      components: {
        account_onboarding: {
          enabled: true,
        },
        account_management: {
          enabled: true,
        },
        payments: {
          enabled: true,
        },
        payouts: {
          enabled: true,
        },
        balances: {
          enabled: true,
        },
      },
    });

    return {
      clientSecret: session.client_secret,
    };
  }

  async getAccountStatus(accountId: string): Promise<ConnectedAccountStatus> {
    const account = await this.stripe.accounts.retrieve(accountId);
    if ('deleted' in account && account.deleted) {
      return {
        accountId,
        chargesEnabled: false,
        payoutsEnabled: false,
        detailsSubmitted: false,
        requirementsCurrentlyDue: [],
        requirementsPastDue: [],
        status: 'disabled',
      };
    }

    return {
      accountId: account.id,
      chargesEnabled: Boolean(account.charges_enabled),
      payoutsEnabled: Boolean(account.payouts_enabled),
      detailsSubmitted: Boolean(account.details_submitted),
      requirementsCurrentlyDue: account.requirements?.currently_due ?? [],
      requirementsPastDue: account.requirements?.past_due ?? [],
      status: deriveAccountStatus(account),
    };
  }
}
