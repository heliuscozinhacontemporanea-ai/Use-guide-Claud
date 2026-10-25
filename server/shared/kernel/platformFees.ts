/** Quem paga a taxa de serviço do ingresso (D14): o comprador, ou o organizador, que absorve. */
export type ServiceFeeMode = 'pass_to_buyer' | 'absorb';

export interface PlatformFeeConfig {
  bookingsBps: number;
  ticketsBps: number;
  ticketsAbsorbedBps: number;
  ticketServiceFeeMinor: number;
}

const BPS_VARS = {
  bookingsBps: 'BOOKINGS_PLATFORM_FEE_BPS',
  ticketsBps: 'TICKETS_PLATFORM_FEE_BPS',
  ticketsAbsorbedBps: 'TICKETS_ABSORBED_FEE_BPS',
} as const;
const SERVICE_FEE_VAR = 'TICKET_SERVICE_FEE_MINOR';
const MAX_BPS = 10_000;
const MAX_SERVICE_FEE_MINOR = 100_000;

/** Falta ou erro na configuração de taxas: a venda para com 503 em vez de cobrar uma taxa inventada. */
export class PlatformFeeConfigError extends Error {
  readonly code = 'PLATFORM_FEE_NOT_CONFIGURED';
  constructor(variable: string) {
    super(`${variable} ausente ou inválida.`);
    this.name = 'PlatformFeeConfigError';
  }
}

function readInteger(env: Record<string, string | undefined>, name: string, max: number): number {
  const raw = env[name]?.trim() ?? '';
  const value = Number(raw);
  if (raw === '' || !Number.isInteger(value) || value < 0 || value > max) {
    throw new PlatformFeeConfigError(name);
  }
  return value;
}

/**
 * Taxas da plataforma por tipo de produto (D14, AGENTS.md §8.1), em pontos-base e centavos.
 * Sem valor padrão no código: a configuração vem só das variáveis de ambiente (§2.2.1).
 */
export function resolvePlatformFeeConfig(
  env: Record<string, string | undefined> = process.env
): PlatformFeeConfig {
  return {
    bookingsBps: readInteger(env, BPS_VARS.bookingsBps, MAX_BPS),
    ticketsBps: readInteger(env, BPS_VARS.ticketsBps, MAX_BPS),
    ticketsAbsorbedBps: readInteger(env, BPS_VARS.ticketsAbsorbedBps, MAX_BPS),
    ticketServiceFeeMinor: readInteger(env, SERVICE_FEE_VAR, MAX_SERVICE_FEE_MINOR),
  };
}

// Arredonda para baixo: a diferença de centavo fica com o proprietário, nunca com a plataforma.
function applyBps(amountMinor: number, bps: number): number {
  return Math.floor((amountMinor * bps) / MAX_BPS);
}

/** Passeio, aluguel, translado e entrada: taxa sobre o subtotal, descontada do proprietário. */
export function bookingPlatformFeeMinor(subtotalMinor: number, config: PlatformFeeConfig): number {
  return applyBps(subtotalMinor, config.bookingsBps);
}

/**
 * Ingressos: taxa da plataforma sobre o valor líquido e, se o organizador repassa, taxa de serviço por
 * ingresso pago, paga pelo comprador. Ingresso gratuito não tem taxa de serviço.
 */
export function ticketOrderFees(
  params: { netSubtotalMinor: number; paidTicketCount: number; mode: ServiceFeeMode },
  config: PlatformFeeConfig
): { platformFeeMinor: number; serviceFeeMinor: number } {
  if (params.mode === 'absorb') {
    return {
      platformFeeMinor: applyBps(params.netSubtotalMinor, config.ticketsAbsorbedBps),
      serviceFeeMinor: 0,
    };
  }
  return {
    platformFeeMinor: applyBps(params.netSubtotalMinor, config.ticketsBps),
    serviceFeeMinor: config.ticketServiceFeeMinor * params.paidTicketCount,
  };
}
