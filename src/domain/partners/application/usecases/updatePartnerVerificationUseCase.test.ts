import { beforeEach, describe, expect, it, vi } from 'vitest';
import { updatePartnerVerificationUseCase } from './updatePartnerVerificationUseCase';

const { updatePartnerVerification } = vi.hoisted(() => ({
  updatePartnerVerification: vi.fn(),
}));

vi.mock('../../factory', () => ({
  partnerAdapter: {
    updatePartnerVerification,
  },
}));

describe('updatePartnerVerificationUseCase', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('envia só a decisão do admin (conceder ou retirar o selo)', async () => {
    await updatePartnerVerificationUseCase('partner-1', true);
    expect(updatePartnerVerification).toHaveBeenCalledWith('partner-1', true);

    await updatePartnerVerificationUseCase('partner-1', false);
    expect(updatePartnerVerification).toHaveBeenLastCalledWith('partner-1', false);
  });

  it('rejeita parceiro sem ID', async () => {
    await expect(updatePartnerVerificationUseCase('', true)).rejects.toThrow();
    expect(updatePartnerVerification).not.toHaveBeenCalled();
  });
});
