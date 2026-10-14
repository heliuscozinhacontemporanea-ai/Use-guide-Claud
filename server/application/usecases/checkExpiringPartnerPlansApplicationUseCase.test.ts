import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  getAllPartnersUseCase: vi.fn(),
  createNotificationUseCase: vi.fn(),
}));

vi.mock('../../domain/partners', () => ({
  getAllPartnersUseCase: mocks.getAllPartnersUseCase,
}));

vi.mock('../../domain/notifications', () => ({
  createNotificationUseCase: mocks.createNotificationUseCase,
}));

import { checkExpiringPartnerPlansApplicationUseCase } from './checkExpiringPartnerPlansApplicationUseCase';

describe('checkExpiringPartnerPlansApplicationUseCase', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('notifica apenas parceiros verificados que vencem nos próximos 3 dias com ID determinístico', async () => {
    const now = new Date('2026-10-12T09:00:00.000Z');
    mocks.getAllPartnersUseCase.mockResolvedValue([
      {
        id: 'partner-expiring',
        isVerified: true,
        isVerificationSuspended: false,
        verifiedUntil: '2026-10-14T09:00:00.000Z',
      },
      {
        id: 'partner-far',
        isVerified: true,
        isVerificationSuspended: false,
        verifiedUntil: '2026-11-20T09:00:00.000Z',
      },
      {
        id: 'partner-expired',
        isVerified: true,
        isVerificationSuspended: false,
        verifiedUntil: '2026-10-10T09:00:00.000Z',
      },
      {
        id: 'partner-unverified',
        isVerified: false,
        isVerificationSuspended: false,
        verifiedUntil: '2026-10-13T09:00:00.000Z',
      },
    ]);
    mocks.createNotificationUseCase.mockResolvedValue(true);

    const notified = await checkExpiringPartnerPlansApplicationUseCase(now);

    expect(notified).toBe(1);
    expect(mocks.createNotificationUseCase).toHaveBeenCalledTimes(1);
    expect(mocks.createNotificationUseCase).toHaveBeenCalledWith({
      id: 'plan_expiring_partner-expiring_2d_2026-10-14',
      recipientPartnerId: 'partner-expiring',
      type: 'plan_expiring',
      title: 'Seu plano está expirando',
      message:
        'Sua assinatura expira em 2 dias. Renove para manter seu selo de verificação ativo.',
    });
  });

  it('não contabiliza quando a notificação já foi enviada ou está desativada pelo parceiro', async () => {
    const now = new Date('2026-10-12T09:00:00.000Z');
    mocks.getAllPartnersUseCase.mockResolvedValue([
      {
        id: 'partner-1',
        isVerified: true,
        isVerificationSuspended: false,
        verifiedUntil: '2026-10-13T09:00:00.000Z',
      },
    ]);
    mocks.createNotificationUseCase.mockResolvedValue(false);

    const notified = await checkExpiringPartnerPlansApplicationUseCase(now);
    expect(notified).toBe(0);
  });
});
