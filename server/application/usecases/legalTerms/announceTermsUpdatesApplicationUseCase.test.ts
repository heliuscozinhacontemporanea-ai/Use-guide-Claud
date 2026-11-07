import { beforeEach, describe, expect, it, vi } from 'vitest';

const m = vi.hoisted(() => ({
  broadcast: vi.fn(),
  getCampaign: vi.fn(),
  saveCampaign: vi.fn(),
  partnerIds: vi.fn(),
  userPage: vi.fn(),
}));
vi.mock('../../../domain/notifications', () => ({
  broadcastNotificationUseCase: m.broadcast,
  getNotificationCampaignUseCase: m.getCampaign,
  saveNotificationCampaignUseCase: m.saveCampaign,
}));
vi.mock('../../../domain/partners', () => ({ getAllPartnerIdsUseCase: m.partnerIds }));
vi.mock('../../../domain/users', () => ({ listUserIdsPageUseCase: m.userPage }));
vi.mock('../../../shared/kernel/legalTerms', () => ({
  TERMS_RELEASES: [
    { audience: 'partner', version: 'p2', major: true, effectiveAt: '2026-11-22T03:00:00.000Z' },
    { audience: 'buyer', version: 'b2', major: true, effectiveAt: '2026-11-22T03:00:00.000Z' },
    { audience: 'buyer', version: 'b1', major: false, effectiveAt: '2026-11-01T03:00:00.000Z' },
  ],
}));

import { announceTermsUpdatesApplicationUseCase } from './announceTermsUpdatesApplicationUseCase';

const NOW = new Date('2026-11-07T15:00:00.000Z');

describe('aviso de mudança grande nos termos', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    m.getCampaign.mockResolvedValue(null);
    m.broadcast.mockImplementation(async (ids: string[]) => ids.length);
    m.partnerIds.mockResolvedValue(['p1', 'p2']);
    m.userPage
      .mockResolvedValueOnce({ ids: ['u1', 'u2'], nextCursor: 'u2' })
      .mockResolvedValueOnce({ ids: ['u3'], nextCursor: null });
  });

  it('avisa parceiros e todas as contas uma vez por versão grande; redação não avisa', async () => {
    expect(await announceTermsUpdatesApplicationUseCase(NOW)).toEqual({ sent: 5 });
    expect(m.broadcast).toHaveBeenCalledWith(['p1', 'p2'], {
      type: 'terms_updated_partner',
      link: { screen: 'partner_terms' },
    });
    expect(m.broadcast).toHaveBeenCalledWith(['u3'], {
      type: 'terms_updated_buyer',
      link: { screen: 'terms' },
    });
    expect(m.saveCampaign).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'terms_buyer_b2', status: 'done', sent: 3 })
    );
    expect(m.getCampaign).not.toHaveBeenCalledWith('terms_buyer_b1');
  });

  it('campanha já concluída não envia de novo', async () => {
    m.getCampaign.mockResolvedValue({ status: 'done' });
    expect(await announceTermsUpdatesApplicationUseCase(NOW)).toEqual({ sent: 0 });
    expect(m.broadcast).not.toHaveBeenCalled();
  });
});
