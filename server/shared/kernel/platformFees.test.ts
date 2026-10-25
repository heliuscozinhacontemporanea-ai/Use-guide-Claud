import { describe, expect, it } from 'vitest';
import {
  bookingPlatformFeeMinor,
  PlatformFeeConfigError,
  resolvePlatformFeeConfig,
  ticketOrderFees,
} from './platformFees';

const ENV = {
  BOOKINGS_PLATFORM_FEE_BPS: '1500',
  TICKETS_PLATFORM_FEE_BPS: '1000',
  TICKETS_ABSORBED_FEE_BPS: '1250',
  TICKET_SERVICE_FEE_MINOR: '300',
};
const CONFIG = resolvePlatformFeeConfig(ENV);

describe('taxas da plataforma (D14)', () => {
  it('lê a configuração em pontos-base e centavos', () => {
    expect(CONFIG).toEqual({
      bookingsBps: 1500,
      ticketsBps: 1000,
      ticketsAbsorbedBps: 1250,
      ticketServiceFeeMinor: 300,
    });
  });

  it('sem configuração ou com valor inválido, falha em vez de cobrar uma taxa padrão', () => {
    for (const env of [
      {},
      { ...ENV, TICKETS_PLATFORM_FEE_BPS: '' },
      { ...ENV, BOOKINGS_PLATFORM_FEE_BPS: '15%' },
      { ...ENV, TICKETS_ABSORBED_FEE_BPS: '12.5' },
      { ...ENV, TICKETS_PLATFORM_FEE_BPS: '10001' },
      { ...ENV, TICKET_SERVICE_FEE_MINOR: '-1' },
    ]) {
      expect(() => resolvePlatformFeeConfig(env)).toThrow(PlatformFeeConfigError);
    }
  });

  it('reserva: 15% do subtotal, arredondado a favor do proprietário', () => {
    expect(bookingPlatformFeeMinor(20000, CONFIG)).toBe(3000);
    expect(bookingPlatformFeeMinor(999, CONFIG)).toBe(149);
  });

  it('ingresso com taxa repassada: 10% do organizador e R$ 3,00 por ingresso pago do comprador', () => {
    expect(
      ticketOrderFees(
        { netSubtotalMinor: 10000, paidTicketCount: 2, mode: 'pass_to_buyer' },
        CONFIG
      )
    ).toEqual({ platformFeeMinor: 1000, serviceFeeMinor: 600 });
  });

  it('ingresso com taxa absorvida: 12,5% e nada para o comprador', () => {
    expect(
      ticketOrderFees({ netSubtotalMinor: 10000, paidTicketCount: 2, mode: 'absorb' }, CONFIG)
    ).toEqual({ platformFeeMinor: 1250, serviceFeeMinor: 0 });
  });

  it('ingresso gratuito não tem taxa de serviço', () => {
    expect(
      ticketOrderFees({ netSubtotalMinor: 0, paidTicketCount: 0, mode: 'pass_to_buyer' }, CONFIG)
    ).toEqual({ platformFeeMinor: 0, serviceFeeMinor: 0 });
  });
});
