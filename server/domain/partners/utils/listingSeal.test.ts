import { describe, expect, it } from 'vitest';
import { computeListingSeal, EMPTY_PLAN, isSealVisible, resolveAdminPlan } from './listingSeal';

const now = new Date('2026-10-21T12:00:00Z');
const future = '2026-11-21T12:00:00.000Z';
const past = '2026-10-01T12:00:00.000Z';
const paid = { planType: 'monthly' as const, planUntil: future, sealSuspended: false };

describe('computeListingSeal (D11)', () => {
  it('selo só com plano ativo e verificação aprovada', () => {
    expect(isSealVisible(computeListingSeal(paid, 'approved', now))).toBe(true);
    expect(computeListingSeal(paid, 'pending', now).isVerified).toBe(false);
    expect(computeListingSeal(paid, 'not_submitted', now).isVerified).toBe(false);
    expect(computeListingSeal({ ...paid, planUntil: past }, 'approved', now).isVerified).toBe(
      false
    );
  });

  it('selo suspenso pelo admin fica marcado e invisível', () => {
    const seal = computeListingSeal({ ...paid, sealSuspended: true }, 'approved', now);
    expect(seal).toMatchObject({ isVerified: true, isVerificationSuspended: true });
    expect(isSealVisible(seal)).toBe(false);
  });
});

describe('resolveAdminPlan (D8 por estabelecimento)', () => {
  it('com plano pago só liga ou desliga a suspensão', () => {
    expect(resolveAdminPlan(paid, false, now)).toEqual({ ...paid, sealSuspended: true });
    expect(resolveAdminPlan({ ...paid, sealSuspended: true }, true, now)).toEqual(paid);
  });

  it('sem plano concede o selo admin por um ano ou remove', () => {
    const granted = resolveAdminPlan(EMPTY_PLAN, true, now);
    expect(granted.planType).toBe('admin');
    expect(granted.planUntil).toBe('2027-10-21T12:00:00.000Z');
    expect(resolveAdminPlan(granted, false, now)).toEqual(EMPTY_PLAN);
  });
});
