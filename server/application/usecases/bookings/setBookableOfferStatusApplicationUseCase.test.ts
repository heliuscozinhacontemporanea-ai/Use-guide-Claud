import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../../domain/bookings', async () => {
  const { BookingDomainError } = await import('../../../domain/bookings/errors/bookingDomainError');
  return { BookingDomainError, setBookableOfferStatusUseCase: vi.fn() };
});
vi.mock('../../../domain/payment', () => ({ assertPartnerReadyForPaidEventUseCase: vi.fn() }));
vi.mock('../isPartnerSuspended', () => ({ isPartnerSuspended: vi.fn() }));

import { setBookableOfferStatusUseCase } from '../../../domain/bookings';
import { assertPartnerReadyForPaidEventUseCase } from '../../../domain/payment';
import { isPartnerSuspended } from '../isPartnerSuspended';
import { setBookableOfferStatusApplicationUseCase } from './setBookableOfferStatusApplicationUseCase';

const ACTOR = { uid: 'p1', admin: false };
const OFFER = { id: 'o1', partnerId: 'p1' };

/** Executa a verificação que o domínio chama antes de publicar. */
async function runPublishGuard() {
  const call = vi.mocked(setBookableOfferStatusUseCase).mock.calls[0];
  const guard = call?.[3];
  if (!guard) throw new Error('guard ausente');
  return guard(OFFER as never);
}

describe('setBookableOfferStatusApplicationUseCase', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(isPartnerSuspended).mockResolvedValue(false);
  });

  it('publica quando o parceiro está ativo e o Stripe está pronto', async () => {
    await setBookableOfferStatusApplicationUseCase(ACTOR, 'o1', 'published');
    await runPublishGuard();
    expect(assertPartnerReadyForPaidEventUseCase).toHaveBeenCalledWith('p1');
  });

  it('Stripe não pronto: a publicação é recusada', async () => {
    vi.mocked(assertPartnerReadyForPaidEventUseCase).mockRejectedValue(
      Object.assign(new Error('Conclua a configuração financeira.'), {
        code: 'SELLER_ACCOUNT_NOT_ELIGIBLE',
      })
    );
    await setBookableOfferStatusApplicationUseCase(ACTOR, 'o1', 'published');
    await expect(runPublishGuard()).rejects.toMatchObject({ code: 'SELLER_ACCOUNT_NOT_ELIGIBLE' });
  });

  it('parceiro suspenso: a publicação é recusada antes de consultar o Stripe', async () => {
    vi.mocked(isPartnerSuspended).mockResolvedValue(true);
    await setBookableOfferStatusApplicationUseCase(ACTOR, 'o1', 'published');
    await expect(runPublishGuard()).rejects.toMatchObject({ code: 'PARTNER_SUSPENDED' });
    expect(assertPartnerReadyForPaidEventUseCase).not.toHaveBeenCalled();
  });
});
