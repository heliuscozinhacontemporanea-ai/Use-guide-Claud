import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../../domain/users', () => ({
  resolveUsernameOwnerUseCase: vi.fn(),
  getUserProfileUseCase: vi.fn().mockResolvedValue({
    username: 'ana',
    firstName: 'Ana',
    lastName: 'Souza',
  }),
}));
vi.mock('../../../domain/ticketing', () => ({ transferTicketUseCase: vi.fn() }));
vi.mock('../../../domain/notifications', () => ({
  createNotificationUseCase: vi.fn().mockResolvedValue(true),
}));

import { createNotificationUseCase } from '../../../domain/notifications';
import { transferTicketUseCase } from '../../../domain/ticketing';
import { resolveUsernameOwnerUseCase } from '../../../domain/users';
import { transferTicketToUsernameApplicationUseCase } from './transferTicketToUsernameApplicationUseCase';

const OWNER = {
  uid: 'u2',
  username: 'bruno',
  displayName: 'Bruno Lima',
  photoURL: null,
  email: 'bruno@exemplo.com',
  emailVerified: true,
};

describe('transferência pelo @ (D21)', () => {
  beforeEach(() => {
    vi.mocked(resolveUsernameOwnerUseCase).mockResolvedValue(OWNER);
    vi.mocked(transferTicketUseCase).mockResolvedValue({
      newTicket: { id: 'tkt_new', eventSnapshot: { title: 'Luau' } },
    } as never);
  });

  it('transfere para a conta do @ com o e-mail dela e avisa o destinatário', async () => {
    const result = await transferTicketToUsernameApplicationUseCase(
      { uid: 'u1', admin: false },
      'tkt_1',
      '@bruno'
    );
    expect(transferTicketUseCase).toHaveBeenCalledWith(
      { uid: 'u1', admin: false },
      {
        ticketId: 'tkt_1',
        toUserId: 'u2',
        recipientEmail: 'bruno@exemplo.com',
        recipientName: 'Bruno Lima',
        receivedFrom: { username: 'ana', displayName: 'Ana Souza' },
      }
    );
    expect(result).toEqual({
      ticketId: 'tkt_new',
      recipient: { username: 'bruno', displayName: 'Bruno Lima' },
    });
    expect(JSON.stringify(result)).not.toContain('@exemplo.com');
    expect(createNotificationUseCase).toHaveBeenCalledWith(
      expect.objectContaining({ recipientPartnerId: 'u2' })
    );
  });

  it('recusa transferir para si mesmo e para conta sem e-mail verificado', async () => {
    await expect(
      transferTicketToUsernameApplicationUseCase({ uid: 'u2', admin: false }, 'tkt_1', 'bruno')
    ).rejects.toMatchObject({ code: 'TRANSFER_TO_SELF' });
    vi.mocked(resolveUsernameOwnerUseCase).mockResolvedValue({ ...OWNER, emailVerified: false });
    await expect(
      transferTicketToUsernameApplicationUseCase({ uid: 'u1', admin: false }, 'tkt_1', 'bruno')
    ).rejects.toMatchObject({ code: 'RECIPIENT_NOT_VERIFIED' });
  });
});
