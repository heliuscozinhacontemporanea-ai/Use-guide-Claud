import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../factory', () => ({ ticketOrderService: { createTicketOrder: vi.fn() } }));

import { ticketOrderService } from '../factory';
import { createTicketOrderUseCase } from './createTicketOrderUseCase';

const INPUT = {} as Parameters<typeof createTicketOrderUseCase>[1];

describe('createTicketOrderUseCase', () => {
  beforeEach(() => vi.clearAllMocks());

  it('exige e-mail confirmado para comprar ingresso', async () => {
    await expect(
      createTicketOrderUseCase({ uid: 'u1', emailVerified: false }, INPUT)
    ).rejects.toMatchObject({ code: 'EMAIL_NOT_VERIFIED' });
    await expect(createTicketOrderUseCase({ uid: 'u1' }, INPUT)).rejects.toMatchObject({
      code: 'EMAIL_NOT_VERIFIED',
    });
    expect(ticketOrderService.createTicketOrder).not.toHaveBeenCalled();
  });

  it('cria o pedido para quem confirmou o e-mail', async () => {
    vi.mocked(ticketOrderService.createTicketOrder).mockResolvedValue({} as never);
    await createTicketOrderUseCase({ uid: 'u1', emailVerified: true }, INPUT);
    expect(ticketOrderService.createTicketOrder).toHaveBeenCalledTimes(1);
  });
});
