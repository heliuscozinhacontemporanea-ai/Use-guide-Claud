import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getAdminPartnersUseCase } from './getAdminPartnersUseCase';

const mocks = vi.hoisted(() => ({
  getAllPartnersUseCase: vi.fn(),
  getUserProfilesBatchUseCase: vi.fn(),
}));

vi.mock('../../domain/partners', () => ({
  getAllPartnersUseCase: mocks.getAllPartnersUseCase,
}));

vi.mock('../../domain/users', () => ({
  getUserProfilesBatchUseCase: mocks.getUserProfilesBatchUseCase,
}));

describe('getAdminPartnersUseCase (anti-N+1)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('resolve múltiplos parceiros com uma única chamada em lote ao domínio de usuários', async () => {
    mocks.getAllPartnersUseCase.mockResolvedValue([
      {
        id: 'partner-1',
        status: 'active',
        isVerified: true,
        businesses: [{ businessId: 'b-1', businessName: 'Pousada A', type: 'item' }],
      },
      {
        id: 'partner-2',
        status: 'suspended',
        isVerified: false,
        businesses: [{ businessId: 'b-2', businessName: 'Restaurante B', type: 'item' }],
      },
    ]);

    mocks.getUserProfilesBatchUseCase.mockResolvedValue({
      'partner-1': {
        uid: 'partner-1',
        firstName: 'Ana',
        lastName: 'Silva',
        email: 'ana@jeri.com',
      },
      'partner-2': {
        uid: 'partner-2',
        firstName: 'Bruno',
        lastName: 'Costa',
        email: 'bruno@jeri.com',
      },
    });

    const result = await getAdminPartnersUseCase();

    expect(mocks.getUserProfilesBatchUseCase).toHaveBeenCalledTimes(1);
    expect(mocks.getUserProfilesBatchUseCase).toHaveBeenCalledWith(['partner-1', 'partner-2']);
    expect(result).toHaveLength(2);
    expect(result[0]).toMatchObject({
      id: 'partner-1',
      businessName: 'Pousada A',
      firstName: 'Ana',
      lastName: 'Silva',
      email: 'ana@jeri.com',
    });
    expect(result[1]).toMatchObject({
      id: 'partner-2',
      businessName: 'Restaurante B',
      firstName: 'Bruno',
      lastName: 'Costa',
      email: 'bruno@jeri.com',
    });
  });

  it('não expõe campos internos do parceiro ao painel admin', async () => {
    mocks.getAllPartnersUseCase.mockResolvedValue([
      {
        id: 'partner-1',
        category: 'hotel',
        status: 'active',
        isVerified: true,
        verifiedUntil: null,
        verificationType: null,
        hasUsedTrial: true,
        termsAccepted: true,
        businesses: [],
      },
    ]);
    mocks.getUserProfilesBatchUseCase.mockResolvedValue({});

    const result = await getAdminPartnersUseCase();

    expect(result).toHaveLength(1);
    expect(result[0]).not.toHaveProperty('hasUsedTrial');
    expect(result[0]).not.toHaveProperty('termsAccepted');
    expect(Object.keys(result[0] ?? {}).sort()).toEqual(
      [
        'businessName',
        'email',
        'firstName',
        'id',
        'isVerificationSuspended',
        'isVerified',
        'lastName',
        'listingsCount',
        'status',
        'verificationType',
        'verifiedUntil',
      ].sort()
    );
  });
});
