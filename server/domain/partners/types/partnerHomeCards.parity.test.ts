import { describe, expect, it } from 'vitest';
import * as app from '../../../../src/domain/partners/types/partnerHomeCards';
import * as server from './partnerHomeCards';

describe('cartões do Início (D27)', () => {
  it('são os mesmos no app e no servidor', () => {
    expect([...app.PARTNER_HOME_CARD_IDS]).toEqual([...server.PARTNER_HOME_CARD_IDS]);
    expect(Object.keys(app.PARTNER_HOME_CARD_SIZE).sort()).toEqual(
      [...server.PARTNER_HOME_CARD_IDS].sort()
    );
  });
});
