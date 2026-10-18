import { describe, expect, it } from 'vitest';
import { isSellerAccountReady } from './sellerReadiness';

const READY = {
  chargesEnabled: true,
  payoutsEnabled: true,
  detailsSubmitted: true,
  status: 'enabled',
};

describe('isSellerAccountReady', () => {
  it('pronta só com cobrança, repasse, dados enviados e status enabled', () => {
    expect(isSellerAccountReady(READY)).toBe(true);
    expect(isSellerAccountReady({ ...READY, chargesEnabled: false })).toBe(false);
    expect(isSellerAccountReady({ ...READY, payoutsEnabled: false })).toBe(false);
    expect(isSellerAccountReady({ ...READY, detailsSubmitted: false })).toBe(false);
    expect(isSellerAccountReady({ ...READY, status: 'restricted' })).toBe(false);
  });
});
