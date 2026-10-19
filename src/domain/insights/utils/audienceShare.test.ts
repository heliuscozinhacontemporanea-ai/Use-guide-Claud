import { describe, expect, it } from 'vitest';
import { audienceShare } from './audienceShare';

describe('audienceShare', () => {
  it('devolve null sem visualizações', () => {
    expect(audienceShare({ viewsSignedIn: 0, viewsAnonymous: 0 })).toBeNull();
  });

  it('divide as visualizações entre com conta e visitantes', () => {
    expect(audienceShare({ viewsSignedIn: 3, viewsAnonymous: 1 })).toEqual({
      signedIn: 0.75,
      anonymous: 0.25,
    });
  });

  it('soma 100% mesmo quando só há visitantes', () => {
    expect(audienceShare({ viewsSignedIn: 0, viewsAnonymous: 5 })).toEqual({
      signedIn: 0,
      anonymous: 1,
    });
  });
});
