import { beforeEach, describe, expect, it, vi } from 'vitest';

const m = vi.hoisted(() => ({ checkIns: vi.fn(), tickets: vi.fn(), profile: vi.fn() }));
vi.mock('../../../domain/ticketing', () => ({
  listEventCheckInsForPartnerOrAdminUseCase: m.checkIns,
  listEventTicketsForPartnerOrAdminUseCase: m.tickets,
}));
vi.mock('../../../domain/users', () => ({ getUserPublicProfileUseCase: m.profile }));

import { listPartnerSessionEntriesApplicationUseCase } from './listPartnerSessionEntriesApplicationUseCase';

describe('listPartnerSessionEntriesApplicationUseCase', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    m.checkIns.mockResolvedValue([
      {
        id: 'c1',
        ticketId: 't1',
        occurrenceId: 's1',
        checkedInAt: '2026-12-20T23:10:00.000Z',
        checkedInBy: 'owner',
        source: 'online',
      },
      {
        id: 'c2',
        ticketId: 't2',
        occurrenceId: 's1',
        checkedInAt: '2026-12-20T23:40:00.000Z',
        checkedInBy: 'equipe',
        source: 'offline',
        method: 'qr',
      },
      {
        id: 'c3',
        ticketId: 't3',
        occurrenceId: 'outra',
        checkedInAt: '2026-12-21T23:00:00.000Z',
        source: 'online',
      },
    ]);
    m.tickets.mockResolvedValue([
      {
        id: 't1',
        ownerUserId: 'u1',
        holderEmail: 'segredo@x.com',
        holderName: 'Nome Completo',
        ticketTypeSnapshot: { name: 'Pista' },
      },
      { id: 't2', ownerUserId: 'u2', courtesyId: 'cc1', ticketTypeSnapshot: { name: 'Cortesia' } },
    ]);
    m.profile.mockImplementation(async (uid: string) => ({
      displayName: uid === 'u1' ? 'Ana Souza' : null,
      username: uid === 'equipe' ? 'bia.portaria' : null,
    }));
  });

  it('só a sessão pedida, do mais recente ao mais antigo, com nome público e sem dados do titular', async () => {
    const entries = await listPartnerSessionEntriesApplicationUseCase('owner', 'ev1', 's1');
    expect(entries).toEqual([
      {
        id: 'c2',
        name: null,
        ticketType: 'Cortesia',
        courtesy: true,
        at: '2026-12-20T23:40:00.000Z',
        source: 'offline',
        method: 'qr',
        releasedByOwner: false,
        releasedByUsername: 'bia.portaria',
      },
      {
        id: 'c1',
        name: 'Ana Souza',
        ticketType: 'Pista',
        courtesy: false,
        at: '2026-12-20T23:10:00.000Z',
        source: 'online',
        method: null,
        releasedByOwner: true,
        releasedByUsername: null,
      },
    ]);
    expect(JSON.stringify(entries)).not.toMatch(/segredo|Nome Completo/);
    expect(m.checkIns).toHaveBeenCalledWith(
      expect.objectContaining({ uid: 'owner', admin: false }),
      'ev1'
    );
  });

  it('evento de outro dono: o erro do ticketing sobe antes de ler ingressos e nomes', async () => {
    m.checkIns.mockRejectedValueOnce(Object.assign(new Error('x'), { code: 'FORBIDDEN' }));
    await expect(
      listPartnerSessionEntriesApplicationUseCase('owner', 'ev-x', 's1')
    ).rejects.toThrow();
    expect(m.tickets).not.toHaveBeenCalled();
    expect(m.profile).not.toHaveBeenCalled();
  });
});
