import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../../domain/ticketing', () => ({
  claimTicketTransferLinkUseCase: vi.fn(),
  releaseTicketTransferLinkUseCase: vi.fn().mockResolvedValue(undefined),
  transferTicketUseCase: vi.fn(),
}));
vi.mock('../../../domain/users', () => ({
  getUserProfileUseCase: vi.fn().mockResolvedValue({
    email: 'bruno@exemplo.com',
    firstName: 'Bruno',
    lastName: 'Lima',
    username: 'bruno',
  }),
  resolveUsernameOwnerUseCase: vi.fn(),
}));
vi.mock('../../../domain/notifications', () => ({
  createNotificationUseCase: vi.fn().mockResolvedValue(true),
}));

import {
  claimTicketTransferLinkUseCase,
  releaseTicketTransferLinkUseCase,
  transferTicketUseCase,
} from '../../../domain/ticketing';
import { acceptTicketTransferLinkApplicationUseCase } from './acceptTicketTransferLinkApplicationUseCase';

const LINK = {
  id: 'lnk_1',
  ticketId: 'tkt_1',
  fromUserId: 'buyer',
  receivedFrom: { username: 'ana', displayName: 'Ana Souza' },
};

describe('aceite do link de transferência (D21)', () => {
  beforeEach(() => {
    vi.mocked(claimTicketTransferLinkUseCase).mockResolvedValue(LINK as never);
  });

  it('transfere em nome de quem gerou o link para quem aceitou', async () => {
    vi.mocked(transferTicketUseCase).mockResolvedValue({ newTicket: { id: 'tkt_2' } } as never);
    await expect(
      acceptTicketTransferLinkApplicationUseCase(
        { uid: 'bruno', emailVerified: true },
        'lnk_1',
        't'
      )
    ).resolves.toEqual({ ticketId: 'tkt_2' });
    expect(transferTicketUseCase).toHaveBeenCalledWith(
      { uid: 'buyer', admin: false },
      expect.objectContaining({ toUserId: 'bruno', receivedFrom: LINK.receivedFrom })
    );
  });

  it('sem e-mail verificado recusa; transferência que falha devolve o link', async () => {
    await expect(
      acceptTicketTransferLinkApplicationUseCase(
        { uid: 'bruno', emailVerified: false },
        'lnk_1',
        't'
      )
    ).rejects.toMatchObject({ code: 'RECIPIENT_NOT_VERIFIED' });
    vi.mocked(transferTicketUseCase).mockRejectedValue(new Error('prazo'));
    await expect(
      acceptTicketTransferLinkApplicationUseCase(
        { uid: 'bruno', emailVerified: true },
        'lnk_1',
        't'
      )
    ).rejects.toThrow('prazo');
    expect(releaseTicketTransferLinkUseCase).toHaveBeenCalledWith('lnk_1');
  });
});
