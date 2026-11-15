import { beforeEach, describe, expect, it, vi } from 'vitest';

const m = vi.hoisted(() => ({
  create: vi.fn(),
  remove: vi.fn(),
  list: vi.fn(),
  link: vi.fn(),
  tour: vi.fn(),
}));

vi.mock('../../domain/guide', () => ({
  createGuideItemUseCase: m.create,
  deleteGuideItemUseCase: m.remove,
  listOwnerGuideItemsUseCase: m.list,
}));
vi.mock('../../domain/partners', () => ({
  linkBusinessUseCase: m.link,
  recordPartnerPanelTourUseCase: m.tour,
}));

import { createPartnerItemApplicationUseCase } from './createPartnerItemApplicationUseCase';

const partner = { uid: 'partner-1', role: 'partner' as const, admin: false };
const input = {
  name: 'Pousada Brisa',
  category: 'hotel' as const,
  description: '',
  image: '',
  images: [],
  location: '',
};

describe('createPartnerItemApplicationUseCase', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    m.create.mockResolvedValue('item-1');
  });

  it('primeiro anúncio da conta (cadastro novo): o tour fica como visto', async () => {
    m.list.mockResolvedValue([{ id: 'item-1' }]);
    await expect(createPartnerItemApplicationUseCase(partner, input)).resolves.toBe('item-1');
    expect(m.tour).toHaveBeenCalledWith('partner-1', 'done');
  });

  it('parceiro que já tinha anúncio: o tour não muda', async () => {
    m.list.mockResolvedValue([{ id: 'item-0' }, { id: 'item-1' }]);
    await createPartnerItemApplicationUseCase(partner, input);
    expect(m.tour).not.toHaveBeenCalled();
  });

  it('falha ao marcar o tour não desfaz o anúncio', async () => {
    m.list.mockResolvedValue([{ id: 'item-1' }]);
    m.tour.mockRejectedValue(new Error('boom'));
    await expect(createPartnerItemApplicationUseCase(partner, input)).resolves.toBe('item-1');
    expect(m.remove).not.toHaveBeenCalled();
  });

  it('falha ao vincular o negócio desfaz o anúncio e não mexe no tour', async () => {
    m.link.mockRejectedValue(new Error('link'));
    await expect(createPartnerItemApplicationUseCase(partner, input)).rejects.toThrow('link');
    expect(m.remove).toHaveBeenCalledWith(partner, 'item-1');
    expect(m.tour).not.toHaveBeenCalled();
  });
});
