export interface CreateConnectedAccountInput {
  partnerId: string;
  email: string;
  country: 'BR';
}

export interface ConnectedAccountStatus {
  accountId: string;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  detailsSubmitted: boolean;
  requirementsCurrentlyDue: string[];
  requirementsPastDue: string[];
  status: 'pending' | 'restricted' | 'enabled' | 'disabled';
}

export interface StripeConnectedAccountRecord {
  partnerId: string;
  stripeAccountId: string;
  status: 'pending' | 'restricted' | 'enabled' | 'disabled';
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  detailsSubmitted: boolean;
  requirementsCurrentlyDue: string[];
  requirementsPastDue: string[];
  createdAt: string;
  updatedAt: string;
}

export interface MarketplaceAccountPort {
  createConnectedAccount(
    input: CreateConnectedAccountInput
  ): Promise<{
    accountId: string;
  }>;
  createAccountSession(
    accountId: string
  ): Promise<{
    clientSecret: string;
  }>;
  getAccountStatus(accountId: string): Promise<ConnectedAccountStatus>;
}
