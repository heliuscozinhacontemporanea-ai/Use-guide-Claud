import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { i18n } from '../../../../shared/i18n';
import type { BookingSummary } from '../../types/bookings';
import { showsArrivalNotice } from '../../utils/arrivalNotice';

const m = vi.hoisted(() => ({ respond: vi.fn() }));
vi.mock('../../application/usecases/respondToArrivalUseCase', () => ({
  respondToArrivalUseCase: m.respond,
}));
vi.mock('./BookingCheckInPass', () => ({ BookingCheckInPass: () => <p>código PASS</p> }));

import { ArrivalNoticeCard } from './ArrivalNoticeCard';

const START = '2026-11-08T12:00:00.000Z';

function booking(overrides: Partial<BookingSummary> = {}): BookingSummary {
  return {
    id: 'bk1',
    offerId: 'of1',
    slotId: 'sl1',
    guideItemId: 'it1',
    kind: 'tour',
    status: 'confirmed',
    lines: [{ priceOptionId: 'adult', quantity: 2, unitAmountMinor: 18000 }],
    participantsCount: 2,
    totalMinor: 36000,
    expiresAt: null,
    offer: {
      title: 'Passeio de buggy ao Preá',
      startsAt: START,
      durationMinutes: 120,
      meetingPoint: 'Praça Principal',
      cancellationPolicy: 'moderate',
    },
    cancellation: null,
    rescheduledAt: null,
    pickupAddress: null,
    checkIns: [],
    businessName: 'Buggy do Preá',
    sellingUnit: 'person',
    groupMaxPeople: null,
    requiresParticipantNames: false,
    arrivedAt: '2026-11-08T11:52:00.000Z',
    serviceStartedAt: null,
    arrivalResponse: null,
    providerAbsence: null,
    serviceConfirmation: null,
    createdAt: '2026-10-01T12:00:00.000Z',
    ...overrides,
  };
}

describe('aviso "chegou" (p45, p46)', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('pt-BR');
    vi.clearAllMocks();
    m.respond.mockResolvedValue(booking());
  });

  it('aparece depois do "Cheguei" e some com o código, com "Não vou mais" e no fim', () => {
    const now = new Date('2026-11-08T12:05:00.000Z');
    expect(showsArrivalNotice(booking(), now)).toBe(true);
    expect(showsArrivalNotice(booking({ arrivedAt: null }), now)).toBe(false);
    expect(
      showsArrivalNotice(booking({ checkIns: [{ unit: 0, at: START, method: 'code' }] }), now)
    ).toBe(false);
    expect(
      showsArrivalNotice(booking({ arrivalResponse: { response: 'not_going', at: START } }), now)
    ).toBe(false);
    expect(showsArrivalNotice(booking(), new Date('2026-11-08T14:01:00.000Z'))).toBe(false);
  });

  it('"Estou chegando" responde e "Seu código" abre o código', async () => {
    const onChanged = vi.fn();
    render(<ArrivalNoticeCard booking={booking()} onChanged={onChanged} />);
    expect(screen.getByText('Buggy do Preá chegou')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Estou chegando' }));
    await waitFor(() => expect(onChanged).toHaveBeenCalled());
    expect(m.respond).toHaveBeenCalledWith('bk1', 'coming');
    fireEvent.click(screen.getByRole('button', { name: 'Seu código' }));
    expect(screen.getByText('código PASS')).toBeTruthy();
  });

  it('"Não vou mais" só vai depois da folha que diz que é ausência', async () => {
    render(<ArrivalNoticeCard booking={booking()} onChanged={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: 'Não vou mais' }));
    expect(m.respond).not.toHaveBeenCalled();
    expect(screen.getByText(/conta como ausência e não há reembolso/)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Avisar que não vou' }));
    await waitFor(() => expect(m.respond).toHaveBeenCalledWith('bk1', 'not_going'));
  });
});
