import { beforeEach, describe, expect, it, vi } from 'vitest';
import { activatePartnerTrialApplicationUseCase } from './activatePartnerTrialApplicationUseCase';
import { updateOwnerVerificationUseCase } from '../../domain/guide';
import {
  activatePartnerTrialUseCase,
  getPartnerProfileUseCase,
  restorePartnerTrialStateUseCase,
  type PartnerProfileDocument,
} from '../../domain/partners';

vi.mock('../../domain/partners', () => ({
  getPartnerProfileUseCase: vi.fn(),
  activatePartnerTrialUseCase: vi.fn(),
  restorePartnerTrialStateUseCase: vi.fn(),
}));

vi.mock('../../domain/guide', () => ({
  updateOwnerVerificationUseCase: vi.fn(),
}));

vi.mock('../../domain/events', () => ({
  updateEventsOwnerVerificationUseCase: vi.fn(),
}));

describe('activatePartnerTrialApplicationUseCase', () => {
  const actor = {
    uid: 'partner-123',
    admin: false,
  };

  const mockPreviousProfile: PartnerProfileDocument = {
    id: 'partner-123',
    category: 'restaurant',
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

  it('trial sucesso: ativa trial no partner e atualiza itens no guide', async () => {
    vi.mocked(getPartnerProfileUseCase).mockResolvedValueOnce(mockPreviousProfile);
    const mockVerifiedUntil = '2026-10-05T18:00:00.000Z';
    vi.mocked(activatePartnerTrialUseCase).mockResolvedValueOnce(mockVerifiedUntil);
    vi.mocked(updateOwnerVerificationUseCase).mockResolvedValueOnce(undefined);

    await activatePartnerTrialApplicationUseCase(actor, 'partner-123');

    expect(getPartnerProfileUseCase).toHaveBeenCalledWith('partner-123');
    expect(activatePartnerTrialUseCase).toHaveBeenCalledWith(actor, 'partner-123');
    expect(updateOwnerVerificationUseCase).toHaveBeenCalledWith('partner-123', {
      isVerified: true,
      verifiedUntil: mockVerifiedUntil,
      verificationType: 'trial',
      isVerificationSuspended: false,
    });
    expect(restorePartnerTrialStateUseCase).not.toHaveBeenCalled();
  });

  it('trial + Guide failure -> estado Partner restaurado verificando todas as propriedades', async () => {
    vi.mocked(getPartnerProfileUseCase).mockResolvedValueOnce(mockPreviousProfile);
    const mockVerifiedUntil = '2026-10-05T18:00:00.000Z';
    vi.mocked(activatePartnerTrialUseCase).mockResolvedValueOnce(mockVerifiedUntil);
    const guideError = new Error('Falha ao atualizar itens do Guide');
    vi.mocked(updateOwnerVerificationUseCase).mockRejectedValueOnce(guideError);
    vi.mocked(restorePartnerTrialStateUseCase).mockResolvedValueOnce(undefined);

    await expect(activatePartnerTrialApplicationUseCase(actor, 'partner-123')).rejects.toThrow(
      guideError
    );

    expect(restorePartnerTrialStateUseCase).toHaveBeenCalledWith('partner-123', {
      hasUsedTrial: false,
      isVerified: false,
      verifiedUntil: null,
      verificationType: null,
      isVerificationSuspended: false,
    });
  });

  it('Partner inexistente -> erro antes de ativar trial', async () => {
    vi.mocked(getPartnerProfileUseCase).mockResolvedValueOnce(null);

    await expect(
      activatePartnerTrialApplicationUseCase(actor, 'partner-inexistente')
    ).rejects.toThrow('Perfil de parceiro não encontrado.');

    expect(activatePartnerTrialUseCase).not.toHaveBeenCalled();
    expect(updateOwnerVerificationUseCase).not.toHaveBeenCalled();
    expect(restorePartnerTrialStateUseCase).not.toHaveBeenCalled();
  });
});
