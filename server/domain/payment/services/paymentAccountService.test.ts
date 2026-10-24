import { describe, expect, it, vi } from 'vitest';
import type {
  ConnectedAccountStatus,
  MarketplaceAccountPort,
} from '../ports/marketplaceAccountPort';
import type { PaymentAccountRepositoryPort } from '../ports/paymentAccountRepositoryPort';
import type { PaymentAccountRecord } from '../types/paymentAccount';
import { PaymentAccountService } from './paymentAccountService';

class InMemoryAccounts implements PaymentAccountRepositoryPort {
  records = new Map<string, PaymentAccountRecord>();
  async get(accountKey: string) {
    return this.records.get(accountKey) ?? null;
  }
  async getByStripeAccountId(stripeAccountId: string) {
    return [...this.records.values()].find((r) => r.stripeAccountId === stripeAccountId) ?? null;
  }
  async listByOwner(ownerUid: string) {
    return [...this.records.values()].filter((r) => r.ownerUid === ownerUid);
  }
  async save(record: PaymentAccountRecord) {
    this.records.set(record.accountKey, record);
  }
}

const ENABLED: Omit<ConnectedAccountStatus, 'accountId'> = {
  chargesEnabled: true,
  payoutsEnabled: true,
  detailsSubmitted: true,
  requirementsCurrentlyDue: [],
  requirementsPastDue: [],
  status: 'enabled',
};
const PENDING: Omit<ConnectedAccountStatus, 'accountId'> = {
  chargesEnabled: false,
  payoutsEnabled: false,
  detailsSubmitted: false,
  requirementsCurrentlyDue: ['company.tax_id', 'external_account'],
  requirementsPastDue: [],
  status: 'pending',
};

function setup(status = PENDING) {
  const repository = new InMemoryAccounts();
  let created = 0;
  const marketplace = {
    createConnectedAccount: vi.fn(async () => ({ accountId: `acct_${++created}` })),
    createAccountSession: vi.fn(async (accountId: string) => ({ clientSecret: `cs_${accountId}` })),
    getAccountStatus: vi.fn(async (accountId: string) => ({ accountId, ...status })),
  } satisfies MarketplaceAccountPort;
  const service = new PaymentAccountService(
    repository,
    marketplace,
    () => new Date('2026-10-25T12:00:00.000Z')
  );
  return { repository, marketplace, service };
}

const INPUT = {
  accountKey: 'key-cnpj-1',
  ownerUid: 'owner-1',
  email: 'dono@pousada.test',
  companyTaxId: '11222333000181',
};

describe('PaymentAccountService (D14)', () => {
  it('cria uma conta por CNPJ, com o CNPJ pré-preenchido, e reaproveita na segunda sessão', async () => {
    const { marketplace, service, repository } = setup();
    await expect(service.createSession(INPUT)).resolves.toEqual({ clientSecret: 'cs_acct_1' });
    await service.createSession(INPUT);
    expect(marketplace.createConnectedAccount).toHaveBeenCalledTimes(1);
    expect(marketplace.createConnectedAccount).toHaveBeenCalledWith(
      expect.objectContaining({ accountKey: 'key-cnpj-1', companyTaxId: '11222333000181' })
    );
    expect(repository.records.get('key-cnpj-1')).toMatchObject({
      ownerUid: 'owner-1',
      stripeAccountId: 'acct_1',
    });
  });

  it('dois CNPJs do mesmo parceiro têm contas separadas', async () => {
    const { service } = setup();
    await service.createSession(INPUT);
    await service.createSession({ ...INPUT, accountKey: 'key-cnpj-2' });
    const accounts = await service.listForOwner('owner-1');
    expect(accounts.map((account) => account.accountKey).sort()).toEqual([
      'key-cnpj-1',
      'key-cnpj-2',
    ]);
  });

  it('conta de outro dono é recusada', async () => {
    const { service } = setup();
    await service.createSession(INPUT);
    await expect(service.createSession({ ...INPUT, ownerUid: 'owner-2' })).rejects.toMatchObject({
      code: 'FORBIDDEN',
    });
  });

  it('a lista não expõe o ID da conta Stripe e conta as pendências', async () => {
    const { service } = setup();
    await service.createSession(INPUT);
    const [view] = await service.listForOwner('owner-1');
    expect(view).toEqual({
      accountKey: 'key-cnpj-1',
      status: 'pending',
      chargesEnabled: false,
      payoutsEnabled: false,
      detailsSubmitted: false,
      requirementsDueCount: 2,
      readyForSales: false,
    });
  });

  it('venda exige a conta do CNPJ pronta', async () => {
    const pending = setup();
    await expect(pending.service.assertReady('key-cnpj-1')).rejects.toMatchObject({
      code: 'SELLER_ACCOUNT_NOT_ELIGIBLE',
    });
    await pending.service.createSession(INPUT);
    await expect(pending.service.assertReady('key-cnpj-1')).rejects.toMatchObject({
      code: 'SELLER_ACCOUNT_NOT_ELIGIBLE',
    });

    const ready = setup(ENABLED);
    await ready.service.createSession(INPUT);
    await expect(ready.service.assertReady('key-cnpj-1')).resolves.toMatchObject({
      stripeAccountId: 'acct_1',
    });
  });

  it('webhook atualiza a conta certa e ignora conta desconhecida', async () => {
    const { service, marketplace, repository } = setup();
    await service.createSession(INPUT);
    marketplace.getAccountStatus.mockImplementation(async (accountId: string) => ({
      accountId,
      ...ENABLED,
    }));
    await service.syncFromWebhook('acct_1');
    await service.syncFromWebhook('acct_desconhecida');
    expect(repository.records.get('key-cnpj-1')?.status).toBe('enabled');
    expect(repository.records.size).toBe(1);
  });
});
