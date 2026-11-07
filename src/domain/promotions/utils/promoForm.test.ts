import { describe, expect, it } from 'vitest';
import { draftFromPromo, inputFromDraft } from './promoForm';

describe('promoForm', () => {
  it('monta o cupom com datas em hora de Fortaleza e só os campos do tipo escolhido', () => {
    const draft = {
      ...draftFromPromo(null, 'ev1'),
      code: 'verao10',
      percent: '15',
      limitUses: true,
      maxUses: '50',
      limitTickets: true,
      maxTickets: '2',
      endsAt: '2026-12-31T23:59',
    };
    expect(inputFromDraft(draft)).toEqual({
      input: {
        code: 'VERAO10',
        type: 'percentage',
        percentage: 15,
        valueMinor: null,
        targets: [{ kind: 'event', id: 'ev1', optionIds: null }],
        maxUses: 50,
        onePerAccount: true,
        maxTicketsPerOrder: 2,
        startsAt: null,
        endsAt: '2027-01-01T02:59:00.000Z',
      },
    });
    const fixed = inputFromDraft({ ...draft, type: 'fixed', valueMinor: 2000 });
    expect(fixed).toMatchObject({
      input: { percentage: null, valueMinor: 2000, maxTicketsPerOrder: null },
    });
  });

  it('aponta o primeiro problema', () => {
    const base = { ...draftFromPromo(null, 'ev1'), code: 'VERAO10' };
    const cases: Array<[Partial<typeof base>, string]> = [
      [{ code: 'AB' }, 'code'],
      [{ percent: '91' }, 'percent'],
      [{ type: 'fixed', valueMinor: 0 }, 'value'],
      [{ targets: {} }, 'targets'],
      [{ targets: { ev1: [] } }, 'options'],
      [{ limitUses: true, maxUses: '0' }, 'maxUses'],
      [{ startsAt: '2026-12-02T10:00', endsAt: '2026-12-01T10:00' }, 'period'],
    ];
    for (const [patch, error] of cases) {
      expect(inputFromDraft({ ...base, ...patch })).toEqual({ error });
    }
    // Cupom usado 30 vezes: o limite não pode ficar abaixo disso.
    expect(inputFromDraft({ ...base, limitUses: true, maxUses: '20' }, 30)).toEqual({
      error: 'maxUses',
    });
  });
});
