import { describe, expect, it, vi } from 'vitest';
import { openGuideStep } from './openGuideStep';

const targets = () => ({
  items: [{ id: 'buggy', name: 'Buggy do Preá', category: 'tour' }],
  verify: vi.fn(),
  openAccounts: vi.fn(),
  openPlace: vi.fn(),
  openNewOffer: vi.fn(),
  openSlots: vi.fn(),
  newEvent: vi.fn(),
});

describe('openGuideStep (F3)', () => {
  it('"Primeira oferta" abre a nova oferta do estabelecimento', () => {
    const to = targets();
    openGuideStep({ id: 'offer', done: false, itemId: 'buggy' }, to);
    expect(to.openNewOffer).toHaveBeenCalledWith(to.items[0]);
    expect(to.openPlace).not.toHaveBeenCalled();
  });

  it('"Horários" abre os horários da oferta; sem oferta, a página do estabelecimento', () => {
    const to = targets();
    openGuideStep({ id: 'slots', done: false, itemId: 'buggy', offerId: 'o1' }, to);
    expect(to.openSlots).toHaveBeenCalledWith('o1');
    openGuideStep({ id: 'slots', done: false, itemId: 'buggy' }, to);
    expect(to.openPlace).toHaveBeenCalledWith(to.items[0]);
  });

  it('verificar, conta e evento seguem para as telas de sempre', () => {
    const to = targets();
    openGuideStep({ id: 'verify', done: false, itemId: 'buggy' }, to);
    openGuideStep({ id: 'account', done: false, itemId: 'buggy' }, to);
    openGuideStep({ id: 'event', done: false, itemId: 'outro' }, to);
    expect(to.verify).toHaveBeenCalledWith({
      id: 'buggy',
      name: 'Buggy do Preá',
      category: 'tour',
    });
    expect(to.openAccounts).toHaveBeenCalled();
    expect(to.newEvent).toHaveBeenCalled();
  });
});
