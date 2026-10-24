import { describe, expect, it } from 'vitest';
import type { ListingPlanView } from '../types/listingPlan';
import { formatPlanDate, listingPlanChipStatus } from './listingPlanStatus';

const SEAL_ON = {
  isVerified: true,
  verifiedUntil: '2026-12-01T00:00:00.000Z',
  verificationType: 'annual' as const,
  isVerificationSuspended: false,
};
const view = (patch: Partial<ListingPlanView>): ListingPlanView => ({
  itemId: 'item-1',
  planType: 'annual',
  planUntil: '2026-12-01T00:00:00.000Z',
  planActive: true,
  sealSuspended: false,
  seal: SEAL_ON,
  trialAvailable: false,
  ...patch,
});

describe('listingPlanChipStatus (D11)', () => {
  it('sem plano em vigor', () => {
    expect(listingPlanChipStatus(view({ planActive: false }))).toBe('none');
  });

  it('selo retirado pela equipe vence o tipo do plano', () => {
    expect(listingPlanChipStatus(view({ sealSuspended: true }))).toBe('suspended');
  });

  it('plano ativo sem verificação aprovada ainda não mostra o selo', () => {
    expect(listingPlanChipStatus(view({ seal: { ...SEAL_ON, isVerified: false } }))).toBe(
      'pendingSeal'
    );
  });

  it('separa teste grátis, selo da equipe e plano pago', () => {
    expect(listingPlanChipStatus(view({ planType: 'trial' }))).toBe('trial');
    expect(listingPlanChipStatus(view({ planType: 'admin' }))).toBe('admin');
    expect(listingPlanChipStatus(view({ planType: 'monthly' }))).toBe('active');
  });
});

describe('formatPlanDate', () => {
  it('usa o fuso America/Fortaleza', () => {
    expect(formatPlanDate('2026-12-01T02:00:00.000Z', 'pt-BR')).toContain('30');
  });
});
