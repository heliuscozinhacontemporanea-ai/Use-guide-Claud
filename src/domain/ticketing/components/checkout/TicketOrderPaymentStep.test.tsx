import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { i18n } from '../../../../shared/i18n';
import type { TicketCheckoutState } from '../../hooks/useTicketCheckout';
import type { TicketOrder } from '../../types/ticketing';
import { TicketOrderPaymentStep } from './TicketOrderPaymentStep';

vi.mock('../../../payment', () => ({ StripePaymentElement: () => null }));

const ORDER = {
  id: 'ord_12345678',
  status: 'pending_payment',
  subtotalMinor: 10000,
  discountMinor: 0,
  serviceFeeMinor: 600,
  totalMinor: 10600,
  salesPolicySnapshot: {
    cancellationPolicy: 'moderate',
    serviceFeeMode: 'pass_to_buyer',
    allowTicketTransfer: true,
    ticketTransferCutoffHours: 4,
  },
} as TicketOrder;

const CHECKOUT = {
  countdown: { minutes: 9, seconds: 5, isExpired: false, isWarning: false, remainingMs: 545000 },
  clientSecret: 'cs_test',
  paymentProcessing: false,
  setError: vi.fn(),
  confirmPayment: vi.fn(),
  reset: vi.fn(),
} as unknown as TicketCheckoutState;

describe('TicketOrderPaymentStep', () => {
  afterEach(async () => {
    await i18n.changeLanguage('pt-BR');
  });

  it('destaca a taxa de serviço e a política gravada, numa linha, antes do pagamento', async () => {
    await i18n.changeLanguage('fr');
    render(<TicketOrderPaymentStep order={ORDER} checkout={CHECKOUT} />);
    expect(screen.getByText('Frais de service')).toBeTruthy();
    expect(screen.getByText(/^6,00/)).toBeTruthy();
    expect(screen.getByText(/Politique de cette commande \(Modérée\)/)).toBeTruthy();
    expect(screen.getByText(/jusqu’à 7 jours avant le début/)).toBeTruthy();
  });
});
