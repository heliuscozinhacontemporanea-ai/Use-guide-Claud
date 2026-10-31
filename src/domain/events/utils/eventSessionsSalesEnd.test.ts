import { describe, expect, it } from 'vitest';
import { defaultSalesEndsAt, newEventSessionDraft, withStartsAt } from './eventSessions';

describe('fim das vendas da sessão (D21)', () => {
  it('nova sessão sugere 2 h antes do início', () => {
    const draft = newEventSessionDraft(new Date('2026-12-20T23:00:00.000Z'));
    expect(draft.salesEndsAt).toBe('2026-12-20T21:00:00.000Z');
  });

  it('no padrão, acompanha o novo início; escolhido pelo parceiro, fica', () => {
    const draft = newEventSessionDraft(new Date('2026-12-20T23:00:00.000Z'));
    expect(withStartsAt(draft, '2026-12-21T01:00:00.000Z').salesEndsAt).toBe(
      defaultSalesEndsAt('2026-12-21T01:00:00.000Z')
    );
    const custom = { ...draft, salesEndsAt: '2026-12-20T22:30:00.000Z' };
    expect(withStartsAt(custom, '2026-12-21T01:00:00.000Z').salesEndsAt).toBe(
      '2026-12-20T22:30:00.000Z'
    );
  });
});
