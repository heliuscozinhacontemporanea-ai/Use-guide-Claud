import { describe, expect, it } from 'vitest';
import type { PartnerVerificationData } from '../types/partnerTypes';
import { resolveAdminVerification } from './adminVerification';

const NOW = new Date('2026-10-12T12:00:00.000Z');
const NONE: PartnerVerificationData = {
  isVerified: false,
  verifiedUntil: null,
  verificationType: null,
  isVerificationSuspended: false,
};
const PAID: PartnerVerificationData = {
  isVerified: true,
  verifiedUntil: '2027-04-12T12:00:00.000Z',
  verificationType: 'semi-annual',
  isVerificationSuspended: false,
};

describe('resolveAdminVerification', () => {
  it('conceder sem plano: selo do admin por um ano', () => {
    expect(resolveAdminVerification(NONE, true, NOW)).toEqual({
      isVerified: true,
      verifiedUntil: '2027-10-12T12:00:00.000Z',
      verificationType: 'admin',
      isVerificationSuspended: false,
    });
  });

  it('conceder com plano pago em vigor: o plano fica igual', () => {
    expect(resolveAdminVerification(PAID, true, NOW)).toEqual(PAID);
  });

  it('retirar com plano pago em vigor: só suspende o selo, sem tocar no plano', () => {
    expect(resolveAdminVerification(PAID, false, NOW)).toEqual({
      ...PAID,
      isVerificationSuspended: true,
    });
  });

  it('conceder de novo depois de suspender: o selo volta e o plano continua', () => {
    const suspended = { ...PAID, isVerificationSuspended: true };
    expect(resolveAdminVerification(suspended, true, NOW)).toEqual(PAID);
  });

  it('retirar selo do admin: remove por completo', () => {
    const adminSeal = resolveAdminVerification(NONE, true, NOW);
    expect(resolveAdminVerification(adminSeal, false, NOW)).toEqual(NONE);
  });

  it('plano vencido não conta como plano em vigor', () => {
    const expired = { ...PAID, verifiedUntil: '2026-01-01T00:00:00.000Z' };
    expect(resolveAdminVerification(expired, true, NOW).verificationType).toBe('admin');
  });
});
