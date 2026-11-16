import { describe, expect, it, vi } from 'vitest';

const m = vi.hoisted(() => ({ events: vi.fn(), history: vi.fn(), deleteOrArchive: vi.fn() }));
vi.mock('../../../domain/events', () => ({
  listOwnerEventListingsUseCase: m.events,
  deleteOrArchiveEventListingUseCase: m.deleteOrArchive,
}));
vi.mock('../hasEventCommercialHistoryApplicationUseCase', () => ({
  hasEventCommercialHistoryApplicationUseCase: m.history,
}));

import { closeOwnerEventsApplicationUseCase } from './closeOwnerEventsApplicationUseCase';

describe('closeOwnerEventsApplicationUseCase', () => {
  it('evento com vendas no histórico fica arquivado; sem vendas, é apagado; arquivado fica como está', async () => {
    m.events.mockResolvedValue([
      { id: 'com-vendas', status: 'published' },
      { id: 'sem-vendas', status: 'draft' },
      { id: 'ja-arquivado', status: 'archived' },
    ]);
    m.history.mockImplementation(async (_actor: unknown, id: string) => id === 'com-vendas');
    await closeOwnerEventsApplicationUseCase('owner-1');
    const actor = { uid: 'owner-1', admin: false };
    expect(m.deleteOrArchive).toHaveBeenCalledWith(actor, 'com-vendas', true);
    expect(m.deleteOrArchive).toHaveBeenCalledWith(actor, 'sem-vendas', false);
    expect(m.deleteOrArchive).not.toHaveBeenCalledWith(actor, 'ja-arquivado', expect.anything());
  });

  it('se a leitura de vendas falhar, para em vez de apagar', async () => {
    m.deleteOrArchive.mockClear();
    m.events.mockResolvedValue([{ id: 'ev-1', status: 'published' }]);
    m.history.mockRejectedValue(new Error('firestore fora'));
    await expect(closeOwnerEventsApplicationUseCase('owner-1')).rejects.toThrow();
    expect(m.deleteOrArchive).not.toHaveBeenCalled();
  });
});
