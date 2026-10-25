import { describe, expect, it } from 'vitest';
import * as frontend from '../../../src/shared/constants/legalTerms';
import { BUYER_TERMS_VERSION, PARTNER_TERMS_VERSION } from './legalTerms';

describe('paridade das versões dos termos', () => {
  it('frontend e backend pedem a mesma versão', () => {
    expect(frontend.BUYER_TERMS_VERSION).toBe(BUYER_TERMS_VERSION);
    expect(frontend.PARTNER_TERMS_VERSION).toBe(PARTNER_TERMS_VERSION);
  });
});
