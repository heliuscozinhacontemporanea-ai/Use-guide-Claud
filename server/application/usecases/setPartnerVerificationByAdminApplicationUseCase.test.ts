import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../domain/partners', async () => {
  const actual = await vi.importActual<
    typeof import('../../domain/partners/utils/adminVerification')
  >('../../domain/partners/utils/adminVerification');
  return {
    getPartnerProfileUseCase: vi.fn(),
    resolveAdminVerification: actual.resolveAdminVerification,
    PartnerDomainError: class PartnerDomainError extends Error {},
  };
});
vi.mock('./applyPartnerVerification', () => ({ applyPartnerVerification: vi.fn() }));

import { getPartnerProfileUseCase } from '../../domain/partners';
import { applyPartnerVerification } from './applyPartnerVerification';
import { setPartnerVerificationByAdminApplicationUseCase } from './setPartnerVerificationByAdminApplicationUseCase';

describe('setPartnerVerificationByAdminApplicationUseCase', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('com plano anual em vigor, retirar o selo mantém tipo e validade do plano', async () => {
    const previous = {
      id: 'p1',
      isVerified: true,
      verifiedUntil: '2027-06-01T00:00:00.000Z',
      verificationType: 'annual',
      isVerificationSuspended: false,
    };
    vi.mocked(getPartnerProfileUseCase).mockResolvedValue(previous as never);

    await setPartnerVerificationByAdminApplicationUseCase(
      'p1',
      false,
      new Date('2026-10-12T00:00:00.000Z')
    );

    expect(applyPartnerVerification).toHaveBeenCalledWith(
      'p1',
      {
        isVerified: true,
        verifiedUntil: '2027-06-01T00:00:00.000Z',
        verificationType: 'annual',
        isVerificationSuspended: true,
      },
      previous
    );
  });

  it('parceiro inexistente: não grava nada', async () => {
    vi.mocked(getPartnerProfileUseCase).mockResolvedValue(null);
    await expect(setPartnerVerificationByAdminApplicationUseCase('x', true)).rejects.toThrow();
    expect(applyPartnerVerification).not.toHaveBeenCalled();
  });
});
