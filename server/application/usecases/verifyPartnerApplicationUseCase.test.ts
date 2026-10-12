import { beforeEach, describe, expect, it, vi } from 'vitest';
import { verifyPartnerApplicationUseCase } from './verifyPartnerApplicationUseCase';
import { updateOwnerVerificationUseCase } from '../../domain/guide';
import {
  getPartnerProfileUseCase,
  updatePartnerVerificationProfileUseCase,
  type PartnerProfileDocument,
} from '../../domain/partners';

vi.mock('../../domain/partners', () => ({
  getPartnerProfileUseCase: vi.fn(),
  updatePartnerVerificationProfileUseCase: vi.fn(),
}));

vi.mock('../../domain/guide', () => ({
  updateOwnerVerificationUseCase: vi.fn(),
}));

vi.mock('../../domain/events', () => ({
  updateEventsOwnerVerificationUseCase: vi.fn(),
}));

describe('verifyPartnerApplicationUseCase', () => {
  const mockPreviousProfile: PartnerProfileDocument = {
    id: 'partner-123',
    status: 'active',
    businesses: [],
    isVerified: false,
    verifiedUntil: null,
    verificationType: null,
    isVerificationSuspended: false,
    hasUsedTrial: false,
    termsAccepted: true,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Partner update + Guide update = sucesso', async () => {
    vi.mocked(getPartnerProfileUseCase).mockResolvedValueOnce(mockPreviousProfile);
    vi.mocked(updatePartnerVerificationProfileUseCase).mockResolvedValueOnce(undefined);
    vi.mocked(updateOwnerVerificationUseCase).mockResolvedValueOnce(undefined);

    await verifyPartnerApplicationUseCase(
      'partner-123',
      true,
      '2026-12-31T23:59:59.000Z',
      'annual'
    );

    expect(getPartnerProfileUseCase).toHaveBeenCalledWith('partner-123');
    expect(updatePartnerVerificationProfileUseCase).toHaveBeenCalledWith('partner-123', {
      isVerified: true,
      verifiedUntil: '2026-12-31T23:59:59.000Z',
      verificationType: 'annual',
      isVerificationSuspended: false,
    });
    expect(updateOwnerVerificationUseCase).toHaveBeenCalledWith('partner-123', {
      isVerified: true,
      verifiedUntil: '2026-12-31T23:59:59.000Z',
      verificationType: 'annual',
      isVerificationSuspended: false,
    });
  });

  it('Partner update + Guide failure -> Partner restaura estado anterior', async () => {
    vi.mocked(getPartnerProfileUseCase).mockResolvedValueOnce(mockPreviousProfile);
    vi.mocked(updatePartnerVerificationProfileUseCase).mockResolvedValue(undefined);
    const guideError = new Error('Falha ao atualizar itens do Guide');
    vi.mocked(updateOwnerVerificationUseCase).mockRejectedValueOnce(guideError);

    await expect(
      verifyPartnerApplicationUseCase('partner-123', true, '2026-12-31T23:59:59.000Z', 'annual')
    ).rejects.toThrow(guideError);

    expect(updatePartnerVerificationProfileUseCase).toHaveBeenCalledTimes(2);

    expect(updatePartnerVerificationProfileUseCase).toHaveBeenNthCalledWith(1, 'partner-123', {
      isVerified: true,
      verifiedUntil: '2026-12-31T23:59:59.000Z',
      verificationType: 'annual',
      isVerificationSuspended: false,
    });

    expect(updatePartnerVerificationProfileUseCase).toHaveBeenNthCalledWith(2, 'partner-123', {
      isVerified: false,
      verifiedUntil: null,
      verificationType: null,
      isVerificationSuspended: false,
    });
  });

  it('Partner inexistente -> erro', async () => {
    vi.mocked(getPartnerProfileUseCase).mockResolvedValueOnce(null);

    await expect(
      verifyPartnerApplicationUseCase(
        'partner-inexistente',
        true,
        '2026-12-31T23:59:59.000Z',
        'annual'
      )
    ).rejects.toThrow('Perfil de parceiro não encontrado.');

    expect(updatePartnerVerificationProfileUseCase).not.toHaveBeenCalled();
    expect(updateOwnerVerificationUseCase).not.toHaveBeenCalled();
  });
});
