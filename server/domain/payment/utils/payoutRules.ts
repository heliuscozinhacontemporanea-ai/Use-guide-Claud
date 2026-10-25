import type { PaymentMethod } from '../ports/paymentGatewayPort';

const HOUR_MS = 60 * 60 * 1000;

/** Janela de reclamação depois do fim do serviço, antes do repasse (D14). */
export const PAYOUT_CLAIM_WINDOW_HOURS = 48;

/** Pix só quando o serviço acontece até 80 dias depois da compra: o reembolso de Pix vale até 90 dias (D14). */
export const PIX_MAX_DAYS_BEFORE_SERVICE = 80;

export function computeReleaseAt(serviceEndsAt: string): string {
  return new Date(
    new Date(serviceEndsAt).getTime() + PAYOUT_CLAIM_WINDOW_HOURS * HOUR_MS
  ).toISOString();
}

export function paymentMethodsForService(serviceStartsAt: string, now: Date): PaymentMethod[] {
  const days = (new Date(serviceStartsAt).getTime() - now.getTime()) / (24 * HOUR_MS);
  return days <= PIX_MAX_DAYS_BEFORE_SERVICE ? ['card', 'pix'] : ['card'];
}

/**
 * Quanto o proprietário recebe depois dos reembolsos: a taxa da plataforma incide sobre o valor que ele
 * fica (D14), na mesma proporção da compra, arredondada para baixo a favor dele.
 */
export function partnerAmountAfterRefunds(params: {
  grossMinor: number;
  serviceFeeMinor: number;
  platformFeeMinor: number;
  refundedServiceMinor: number;
}): { platformFeeMinor: number; partnerAmountMinor: number } {
  const serviceValueMinor = Math.max(0, params.grossMinor - params.serviceFeeMinor);
  const keptMinor = Math.max(0, serviceValueMinor - params.refundedServiceMinor);
  if (serviceValueMinor === 0 || keptMinor === 0) {
    return { platformFeeMinor: 0, partnerAmountMinor: 0 };
  }
  const platformFeeMinor = Math.floor((params.platformFeeMinor * keptMinor) / serviceValueMinor);
  return { platformFeeMinor, partnerAmountMinor: keptMinor - platformFeeMinor };
}
