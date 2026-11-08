import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../../domain/notifications', () => ({
  createNotificationUseCase: vi.fn().mockResolvedValue(true),
}));
vi.mock('../../../domain/bookings', () => ({
  listConfirmedBookingsStartingBetweenUseCase: vi.fn().mockResolvedValue([]),
  expireOverdueBookingsUseCase: vi.fn(),
}));
vi.mock('../../../domain/ticketing', () => ({
  listIssuedTicketsStartingBetweenUseCase: vi.fn().mockResolvedValue([]),
  listCheckedInTicketsEndedBetweenUseCase: vi.fn().mockResolvedValue([]),
  expireAllOverdueOrdersUseCase: vi.fn(),
}));
vi.mock('../../../domain/users', () => ({ claimUsernameUseCase: vi.fn() }));

import {
  expireOverdueBookingsUseCase,
  listConfirmedBookingsStartingBetweenUseCase,
} from '../../../domain/bookings';
import { createNotificationUseCase } from '../../../domain/notifications';
import {
  expireAllOverdueOrdersUseCase,
  listCheckedInTicketsEndedBetweenUseCase,
  listIssuedTicketsStartingBetweenUseCase,
} from '../../../domain/ticketing';
import { claimUsernameUseCase } from '../../../domain/users';
import { claimUsernameApplicationUseCase } from './claimUsernameApplicationUseCase';
import { expireUnpaidBookingsApplicationUseCase } from './expireUnpaidBookingsApplicationUseCase';
import { expireUnpaidTicketOrdersApplicationUseCase } from './expireUnpaidTicketOrdersApplicationUseCase';
import { sendServiceRemindersApplicationUseCase } from './sendServiceRemindersApplicationUseCase';

const NOW = new Date('2026-11-03T15:00:00.000Z');
const ticket = (id: string, owner: string) => ({
  id,
  ownerUserId: owner,
  occurrenceId: 'occ-1',
  eventSnapshot: { title: 'Luau na Duna', startsAt: '2026-11-04T15:00:00.000Z', endsAt: '' },
});

describe('avisos novos (D25)', () => {
  beforeEach(() => vi.clearAllMocks());

  it('lembrete da véspera: um aviso por pessoa e sessão, com a quantidade de ingressos', async () => {
    vi.mocked(listIssuedTicketsStartingBetweenUseCase).mockImplementation(async (from) =>
      from === '2026-11-04T14:00:00.000Z'
        ? ([ticket('t1', 'ana'), ticket('t2', 'ana'), ticket('t3', 'bia')] as never)
        : []
    );
    const result = await sendServiceRemindersApplicationUseCase(NOW);
    expect(result.dayBefore).toBe(2);
    expect(createNotificationUseCase).toHaveBeenCalledWith(
      expect.objectContaining({
        recipientUid: 'ana',
        type: 'ticket_reminder_day',
        params: expect.objectContaining({ count: 2, event: 'Luau na Duna' }),
        dedupeKey: 'ticket_reminder_day_ana_occ-1',
      })
    );
  });

  it('lembrete de 2 h da reserva e convite para avaliar quem entrou no evento', async () => {
    vi.mocked(listConfirmedBookingsStartingBetweenUseCase).mockImplementation(async (from) =>
      from === '2026-11-03T15:30:00.000Z'
        ? ([
            {
              id: 'b1',
              buyerId: 'caio',
              offerSnapshot: { title: 'Buggy', startsAt: '2026-11-03T16:30:00.000Z' },
            },
          ] as never)
        : []
    );
    vi.mocked(listCheckedInTicketsEndedBetweenUseCase).mockResolvedValue([
      ticket('t9', 'duda'),
    ] as never);
    const result = await sendServiceRemindersApplicationUseCase(NOW);
    expect(result).toMatchObject({ soon: 1, reviewInvites: 1 });
    expect(createNotificationUseCase).toHaveBeenCalledWith(
      expect.objectContaining({ recipientUid: 'caio', type: 'booking_reminder_soon' })
    );
    expect(createNotificationUseCase).toHaveBeenCalledWith(
      expect.objectContaining({ recipientUid: 'duda', type: 'review_request' })
    );
  });

  it('compra não concluída avisa só quem chegou ao pagamento', async () => {
    vi.mocked(expireAllOverdueOrdersUseCase).mockResolvedValue({
      expiredCount: 2,
      expired: [
        { id: 'o1', buyerId: 'ana', paymentIntentId: 'pi_1', eventSnapshot: { title: 'Luau' } },
        { id: 'o2', buyerId: 'bia' },
      ] as never,
    });
    vi.mocked(expireOverdueBookingsUseCase).mockResolvedValue([
      { id: 'b1', buyerId: 'caio', paymentIntentId: 'pi_2', offerSnapshot: { title: 'Buggy' } },
    ] as never);
    await expireUnpaidTicketOrdersApplicationUseCase();
    await expireUnpaidBookingsApplicationUseCase();
    expect(createNotificationUseCase).toHaveBeenCalledTimes(2);
    expect(createNotificationUseCase).toHaveBeenCalledWith(
      expect.objectContaining({ recipientUid: 'ana', type: 'purchase_expired' })
    );
  });

  it('troca do @ avisa; a primeira escolha não', async () => {
    vi.mocked(claimUsernameUseCase).mockResolvedValueOnce({ username: 'ana', previous: null });
    await claimUsernameApplicationUseCase('u1', 'ana');
    expect(createNotificationUseCase).not.toHaveBeenCalled();
    vi.mocked(claimUsernameUseCase).mockResolvedValueOnce({ username: 'ana.s', previous: 'ana' });
    await claimUsernameApplicationUseCase('u1', 'ana.s');
    expect(createNotificationUseCase).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'account_username_changed', params: { username: 'ana.s' } })
    );
  });
});
