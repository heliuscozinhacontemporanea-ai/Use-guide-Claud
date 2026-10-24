export interface CreateConnectedAccountInput {
  accountKey: string;
  ownerUid: string;
  email: string;
  /** CNPJ do estabelecimento verificado: o Stripe confere no cadastro que a conta é dessa empresa. */
  companyTaxId: string;
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

export interface MarketplaceAccountPort {
  createConnectedAccount(input: CreateConnectedAccountInput): Promise<{
    accountId: string;
  }>;
  createAccountSession(accountId: string): Promise<{
    clientSecret: string;
  }>;
  getAccountStatus(accountId: string): Promise<ConnectedAccountStatus>;
}
