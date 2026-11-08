import type { PaymentMethod } from '../ports/paymentGatewayPort';
import type { PayoutEntry, PayoutHoldReason } from '../types/payoutEntry';

const HOUR_MS = 60 * 60 * 1000;

/** Janela de reclamação depois do fim do serviço, antes do repasse (D14). */
export const PAYOUT_CLAIM_WINDOW_HOURS = 48;

/** Pix só quando o serviço acontece até 80 dias depois da compra: o reembolso de Pix vale até 90 dias (D14). */
export const PIX_MAX_DAYS_BEFORE_SERVICE = 80;

/** Prazo do admin para decidir a reclamação; sem decisão, o repasse é liberado (D14). */
export const CLAIM_DECISION_DAYS = 5;

export function computeClaimDeadline(openedAt: Date): string {
  return new Date(openedAt.getTime() + CLAIM_DECISION_DAYS * 24 * HOUR_MS).toISOString();
}

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

/** Acrescenta uma retenção; `null` quando não muda nada (já retida assim, liberada ou cancelada). */
export function withHold(entry: PayoutEntry, reason: PayoutHoldReason): PayoutEntry | null {
  if (entry.status !== 'pending' && entry.status !== 'on_hold') return null;
  const holds = entry.holdReasons ?? [];
  if (holds.includes(reason)) return null;
  return { ...entry, status: 'on_hold', holdReasons: [...holds, reason] };
}

/** Tira uma retenção; sem nenhuma, a entrada volta à fila do job. */
export function withoutHold(entry: PayoutEntry, reason: PayoutHoldReason): PayoutEntry | null {
  const holds = entry.holdReasons ?? [];
  if (entry.status !== 'on_hold' || !holds.includes(reason)) return null;
  const rest = holds.filter((hold) => hold !== reason);
  const { holdReasons: _previous, ...base } = entry;
  return rest.length > 0
    ? { ...base, status: 'on_hold', holdReasons: rest }
    : { ...base, status: 'pending' };
}
