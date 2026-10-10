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

  it('aceita verificationType=trial', async () => {
    await updatePartnerVerificationUseCase(
      'partner-1',
      true,
      '2027-01-01T00:00:00.000Z',
      'trial'
    );

    expect(updatePartnerVerification).toHaveBeenCalledWith(
      'partner-1',
      true,
      '2027-01-01T00:00:00.000Z',
      'trial'
    );
  });

  it('aceita verificationType=monthly', async () => {
    await updatePartnerVerificationUseCase(
      'partner-1',
      true,
      '2027-01-01T00:00:00.000Z',
      'monthly'
    );

    expect(updatePartnerVerification).toHaveBeenCalledWith(
      'partner-1',
      true,
      '2027-01-01T00:00:00.000Z',
      'monthly'
    );
  });

  it('aceita verificationType=semi-annual', async () => {
    await updatePartnerVerificationUseCase(
      'partner-1',
      true,
      '2027-01-01T00:00:00.000Z',
      'semi-annual'
    );

    expect(updatePartnerVerification).toHaveBeenCalledWith(
      'partner-1',
      true,
      '2027-01-01T00:00:00.000Z',
      'semi-annual'
    );
  });

  it('aceita verificationType=annual', async () => {
    await updatePartnerVerificationUseCase(
      'partner-1',
      true,
      '2027-01-01T00:00:00.000Z',
      'annual'
    );

    expect(updatePartnerVerification).toHaveBeenCalledWith(
      'partner-1',
      true,
      '2027-01-01T00:00:00.000Z',
      'annual'
    );
  });

  it('aceita estado não verificado somente com verificationType=null', async () => {
    await updatePartnerVerificationUseCase(
      'partner-1',
      false,
      null,
      null
    );

    expect(updatePartnerVerification).toHaveBeenCalledWith(
      'partner-1',
      false,
      null,
      null
    );
  });

  it('rejeita estado não verificado com verificationType preenchido', async () => {
    await expect(
      updatePartnerVerificationUseCase(
        'partner-1',
        false,
        null,
        'annual'
      )
    ).rejects.toThrow(
      'verificationType deve ser null quando isVerified=false.'
    );

    expect(updatePartnerVerification).not.toHaveBeenCalled();
  });

  it('rejeita verificationType inválido', async () => {
    await expect(
      updatePartnerVerificationUseCase(
        'partner-1',
        true,
        '2027-01-01T00:00:00.000Z',
        'weekly' as never
      )
    ).rejects.toThrow();
  });
});
