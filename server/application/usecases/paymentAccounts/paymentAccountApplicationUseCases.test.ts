import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../../domain/partners', () => ({
  listOwnerSalesDocumentsUseCase: vi.fn(),
  getOwnerSalesDocumentUseCase: vi.fn(),
  assertPartnerTermsAcceptedUseCase: vi.fn(),
}));
vi.mock('../../../domain/payment', () => ({
  listOwnerPaymentAccountsUseCase: vi.fn(),
  createPaymentAccountSessionUseCase: vi.fn(),
}));

import {
  assertPartnerTermsAcceptedUseCase,
  getOwnerSalesDocumentUseCase,
  listOwnerSalesDocumentsUseCase,
} from '../../../domain/partners';
import {
  createPaymentAccountSessionUseCase,
  listOwnerPaymentAccountsUseCase,
} from '../../../domain/payment';
import { listPartnerPaymentAccountsApplicationUseCase } from './listPartnerPaymentAccountsApplicationUseCase';
import { startPaymentAccountSessionApplicationUseCase } from './startPaymentAccountSessionApplicationUseCase';

const READY_VIEW = {
  accountKey: 'key-1',
  status: 'enabled' as const,
  chargesEnabled: true,
  payoutsEnabled: true,
  detailsSubmitted: true,
  requirementsDueCount: 0,
  readyForSales: true,
};

describe('contas de recebimento por CNPJ (D14)', () => {
  beforeEach(() => vi.clearAllMocks());

  it('lista um cartão por CNPJ aprovado, com a conta quando já existe', async () => {
    vi.mocked(listOwnerSalesDocumentsUseCase).mockResolvedValue([
      { accountKey: 'key-1', maskedDocument: '**.***.***/0001-81', itemIds: ['item-1'] },
      { accountKey: 'key-2', maskedDocument: '**.***.***/0001-61', itemIds: ['item-2'] },
    ]);
    vi.mocked(listOwnerPaymentAccountsUseCase).mockResolvedValue([READY_VIEW]);
    const result = await listPartnerPaymentAccountsApplicationUseCase('owner-1');
    expect(result).toEqual([
      {
        accountKey: 'key-1',
        maskedDocument: '**.***.***/0001-81',
        itemIds: ['item-1'],
        account: READY_VIEW,
      },
      {
        accountKey: 'key-2',
        maskedDocument: '**.***.***/0001-61',
        itemIds: ['item-2'],
        account: null,
      },
    ]);
  });

  it('a sessão usa o CNPJ da verificação do próprio parceiro', async () => {
    vi.mocked(getOwnerSalesDocumentUseCase).mockResolvedValue('11222333000181');
    vi.mocked(createPaymentAccountSessionUseCase).mockResolvedValue({ clientSecret: 'cs' });
    await startPaymentAccountSessionApplicationUseCase(
      { uid: 'owner-1', email: 'dono@pousada.test' },
      'key-1'
    );
    expect(getOwnerSalesDocumentUseCase).toHaveBeenCalledWith('owner-1', 'key-1');
    expect(createPaymentAccountSessionUseCase).toHaveBeenCalledWith({
      accountKey: 'key-1',
      ownerUid: 'owner-1',
      email: 'dono@pousada.test',
      companyTaxId: '11222333000181',
    });
  });

  it('CNPJ de outro parceiro: nenhuma conta é criada', async () => {
    vi.mocked(getOwnerSalesDocumentUseCase).mockRejectedValue(
      Object.assign(new Error('Documento de vendas não encontrado.'), { code: 'NOT_FOUND' })
    );
    await expect(
      startPaymentAccountSessionApplicationUseCase({ uid: 'intruso', email: '' }, 'key-1')
    ).rejects.toMatchObject({ code: 'NOT_FOUND' });
    expect(createPaymentAccountSessionUseCase).not.toHaveBeenCalled();
  });

  it('sem os termos do parceiro aceitos, não abre o cadastro no Stripe (D15)', async () => {
    vi.mocked(assertPartnerTermsAcceptedUseCase).mockRejectedValueOnce(new Error('terms'));
    await expect(
      startPaymentAccountSessionApplicationUseCase({ uid: 'owner-1', email: 'a@b.c' }, 'key-1')
    ).rejects.toThrow('terms');
    expect(createPaymentAccountSessionUseCase).not.toHaveBeenCalled();
  });
});
