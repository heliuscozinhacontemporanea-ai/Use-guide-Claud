import type {
  ConnectedAccountStatus,
  MarketplaceAccountPort,
} from '../ports/marketplaceAccountPort';
import type { PaymentAccountRepositoryPort } from '../ports/paymentAccountRepositoryPort';
import type { PaymentAccountRecord, PaymentAccountView } from '../types/paymentAccount';
import { isSellerAccountReady } from '../utils/sellerReadiness';
import { PaymentDomainError } from './stripePaymentService';

export interface EnsurePaymentAccountInput {
  accountKey: string;
  ownerUid: string;
  email: string;
  companyTaxId: string;
}

/** Uma conta Stripe Express por CNPJ (D14): criação, cadastro, status e checagem antes de vender. */
export class PaymentAccountService {
  constructor(
    private readonly repository: PaymentAccountRepositoryPort,
    private readonly marketplace: MarketplaceAccountPort,
    private readonly now: () => Date = () => new Date()
  ) {}

  async createSession(input: EnsurePaymentAccountInput): Promise<{ clientSecret: string }> {
    const record = await this.ensure(input);
    return this.marketplace.createAccountSession(record.stripeAccountId);
  }

  /** Status atualizado no Stripe de cada conta do parceiro (o webhook pode chegar depois do cadastro). */
  async listForOwner(ownerUid: string): Promise<PaymentAccountView[]> {
    const records = await this.repository.listByOwner(ownerUid);
    const synced = await Promise.all(records.map((record) => this.sync(record)));
    return synced.map(toView);
  }

  async assertReady(accountKey: string): Promise<PaymentAccountRecord> {
    const existing = await this.repository.get(accountKey);
    const record = existing ? await this.sync(existing) : null;
    if (!record || !isSellerAccountReady(record)) {
      throw new PaymentDomainError(
        'SELLER_ACCOUNT_NOT_ELIGIBLE',
        'Vendas online indisponíveis. Conclua a configuração financeira deste CNPJ.',
        422
      );
    }
    return record;
  }

  async syncFromWebhook(stripeAccountId: string): Promise<void> {
    const record = await this.repository.getByStripeAccountId(stripeAccountId);
    if (record) await this.sync(record);
  }

  private async ensure(input: EnsurePaymentAccountInput): Promise<PaymentAccountRecord> {
    const existing = await this.repository.get(input.accountKey);
    if (existing) {
      // O CNPJ pertence a uma conta só (D12); um dono diferente aqui é dado inconsistente.
      if (existing.ownerUid !== input.ownerUid) {
        throw new PaymentDomainError('FORBIDDEN', 'Conta de recebimento de outro parceiro.', 403);
      }
      return existing;
    }
    const created = await this.marketplace.createConnectedAccount({
      accountKey: input.accountKey,
      ownerUid: input.ownerUid,
      email: input.email,
      companyTaxId: input.companyTaxId,
      country: 'BR',
    });
    const nowIso = this.now().toISOString();
    const status = await this.marketplace.getAccountStatus(created.accountId);
    const record = withStatus(
      {
        accountKey: input.accountKey,
        ownerUid: input.ownerUid,
        stripeAccountId: created.accountId,
        createdAt: nowIso,
      },
      status,
      nowIso
    );
    await this.repository.save(record);
    return record;
  }

  private async sync(record: PaymentAccountRecord): Promise<PaymentAccountRecord> {
    const status = await this.marketplace.getAccountStatus(record.stripeAccountId);
    const synced = withStatus(record, status, this.now().toISOString());
    await this.repository.save(synced);
    return synced;
  }
}

function withStatus(
  base: Pick<PaymentAccountRecord, 'accountKey' | 'ownerUid' | 'stripeAccountId' | 'createdAt'>,
  status: ConnectedAccountStatus,
  updatedAt: string
): PaymentAccountRecord {
  return {
    accountKey: base.accountKey,
    ownerUid: base.ownerUid,
    stripeAccountId: base.stripeAccountId,
    status: status.status,
    chargesEnabled: status.chargesEnabled,
    payoutsEnabled: status.payoutsEnabled,
    detailsSubmitted: status.detailsSubmitted,
    requirementsCurrentlyDue: status.requirementsCurrentlyDue,
    requirementsPastDue: status.requirementsPastDue,
    createdAt: base.createdAt,
    updatedAt,
  };
}

function toView(record: PaymentAccountRecord): PaymentAccountView {
  return {
    accountKey: record.accountKey,
    status: record.status,
    chargesEnabled: record.chargesEnabled,
    payoutsEnabled: record.payoutsEnabled,
    detailsSubmitted: record.detailsSubmitted,
    requirementsDueCount:
      record.requirementsCurrentlyDue.length + record.requirementsPastDue.length,
    readyForSales: isSellerAccountReady(record),
  };
}
