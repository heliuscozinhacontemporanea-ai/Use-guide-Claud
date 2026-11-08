import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../../domain/partners', () => ({
  getPartnerProfileUseCase: vi.fn(),
  listOwnerSalesDocumentsUseCase: vi.fn(),
}));
vi.mock('../../../domain/payment', () => ({
  getPaymentAccountOwnersUseCase: vi.fn(),
  listOpenAccountDebtsForAdminUseCase: vi.fn(),
}));

import { getPartnerProfileUseCase, listOwnerSalesDocumentsUseCase } from '../../../domain/partners';
import {
  getPaymentAccountOwnersUseCase,
  listOpenAccountDebtsForAdminUseCase,
} from '../../../domain/payment';
import { describeSellerAccountsApplicationUseCase } from './describeSellerAccountsApplicationUseCase';
import { listAdminAccountDebtsApplicationUseCase } from './listAdminAccountDebtsApplicationUseCase';

const KEY_A = 'a'.repeat(43);
const KEY_B = 'b'.repeat(43);

describe('filas financeiras do admin: quem vende por cada CNPJ (D16)', () => {
  beforeEach(() => {
    vi.mocked(getPaymentAccountOwnersUseCase).mockResolvedValue({ [KEY_A]: 'owner-1' });
    vi.mocked(getPartnerProfileUseCase).mockResolvedValue({
      id: 'owner-1',
      status: 'active',
      businesses: [
        { businessId: 'bar1', businessName: 'Bar da Duna', type: 'item' },
        { businessId: 'pousada1', businessName: 'Pousada Vento', type: 'item' },
      ],
      hasUsedTrial: false,
      termsAccepted: true,
    });
    vi.mocked(listOwnerSalesDocumentsUseCase).mockResolvedValue([
      { accountKey: KEY_A, maskedDocument: '**.***.***/0001-81', itemIds: ['bar1'] },
      { accountKey: KEY_B, maskedDocument: '**.***.***/0001-61', itemIds: ['pousada1'] },
    ]);
  });

  it('nome dos estabelecimentos do CNPJ e documento mascarado; sem conta, vazio', async () => {
    const sellers = await describeSellerAccountsApplicationUseCase([KEY_A, KEY_B, KEY_A]);
    expect(sellers[KEY_A]).toEqual({
      sellerName: 'Bar da Duna',
      maskedDocument: '**.***.***/0001-81',
    });
    expect(sellers[KEY_B]).toEqual({ sellerName: null, maskedDocument: null });
    expect(getPartnerProfileUseCase).toHaveBeenCalledTimes(1);
  });

  it('dívidas em aberto saem com o vendedor de cada uma', async () => {
    vi.mocked(listOpenAccountDebtsForAdminUseCase).mockResolvedValue({
      data: [
        {
          id: 'debt-1',
          accountKey: KEY_A,
          reason: 'cancellation_penalty',
          referenceType: 'booking_slot',
          amountMinor: 2000,
          remainingMinor: 2000,
          status: 'open',
          dueAt: '2026-10-27T12:00:00.000Z',
          overdue: false,
          createdAt: '2026-10-26T12:00:00.000Z',
        },
      ],
      nextCursor: 'debt-1',
    });
    const page = await listAdminAccountDebtsApplicationUseCase(1);
    expect(page.nextCursor).toBe('debt-1');
    expect(page.data[0]).toMatchObject({ id: 'debt-1', sellerName: 'Bar da Duna' });
  });
});
