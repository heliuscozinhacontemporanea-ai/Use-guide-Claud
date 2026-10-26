/**
 * Espelho de server/shared/kernel/cancellationPolicy.ts para exibir as políticas e prever o reembolso.
 * O valor que vale é o calculado no backend; o teste de paridade garante que as regras são iguais.
 */
export const EVENT_CANCELLATION_POLICIES = ['flexible', 'moderate', 'strict', 'none'] as const;
export const BOOKING_CANCELLATION_POLICIES = ['flexible', 'moderate', 'strict', 'none'] as const;
export const TRANSFER_CANCELLATION_POLICIES = ['transfer_flexible', 'transfer_standard'] as const;

export type EventCancellationPolicy = (typeof EVENT_CANCELLATION_POLICIES)[number];
export type BookingCancellationPolicy =
  | (typeof BOOKING_CANCELLATION_POLICIES)[number]
  | (typeof TRANSFER_CANCELLATION_POLICIES)[number];
export type CancellationPolicyId = EventCancellationPolicy | BookingCancellationPolicy;

/** Eventos, reservas (passeio, aluguel, entrada) e translados têm listas próprias. */
export type CancellationPolicyFamily = 'event' | 'booking' | 'transfer';

interface RefundTier {
  /** A partir de quantas horas antes do início vale o percentual. */
  hoursBefore: number;
  percent: number;
}

// Da mais flexível para a mais rígida: a ordem define o que é "mais flexível" ao trocar de política.
const POLICY_TIERS: Record<CancellationPolicyFamily, Record<string, RefundTier[]>> = {
  event: {
    flexible: [{ hoursBefore: 24, percent: 100 }],
    moderate: [{ hoursBefore: 7 * 24, percent: 100 }],
    strict: [{ hoursBefore: 30 * 24, percent: 100 }],
    none: [],
  },
  booking: {
    flexible: [{ hoursBefore: 24, percent: 100 }],
    moderate: [
      { hoursBefore: 5 * 24, percent: 100 },
      { hoursBefore: 24, percent: 50 },
    ],
    strict: [{ hoursBefore: 7 * 24, percent: 50 }],
    none: [],
  },
  // Código Civil art. 740: o transportador retém no máximo 5% quando o passageiro avisa a tempo.
  transfer: {
    transfer_flexible: [{ hoursBefore: 24, percent: 100 }],
    transfer_standard: [{ hoursBefore: 24, percent: 95 }],
  },
};

/** Direito de arrependimento (CDC art. 49): 7 dias da compra, até 48 h antes do início (D14). */
export const WITHDRAWAL_DAYS = 7;

/** Depois do aviso de reagendamento, o comprador tem 7 dias para pedir reembolso integral (D16, 4A). */
export const RESCHEDULE_REFUND_DAYS = 7;
export const WITHDRAWAL_MIN_HOURS_BEFORE_START = 48;

const HOUR_MS = 60 * 60 * 1000;

export function policiesOf(family: CancellationPolicyFamily): string[] {
  return Object.keys(POLICY_TIERS[family]);
}

export function isCancellationPolicyAllowed(
  family: CancellationPolicyFamily,
  policy: string
): policy is CancellationPolicyId {
  return Object.hasOwn(POLICY_TIERS[family], policy);
}

/** Depois de publicar, a política só muda para uma igual ou mais flexível (D14). */
export function canChangeCancellationPolicy(
  family: CancellationPolicyFamily,
  from: string,
  to: string
): boolean {
  const order = policiesOf(family);
  const fromIndex = order.indexOf(from);
  const toIndex = order.indexOf(to);
  return toIndex !== -1 && (fromIndex === -1 || toIndex <= fromIndex);
}

export interface BuyerRefund {
  reason: 'withdrawal' | 'reschedule' | 'policy' | 'none';
  percent: number;
  refundMinor: number;
  serviceFeeRefundMinor: number;
}

/**
 * Quanto volta ao comprador que cancela. `paidMinor` é o valor do serviço (sem a taxa de serviço), que só
 * volta no arrependimento e no reagendamento. Depois do início (ou no-show) não há reembolso.
 * `rescheduledAt` é o aviso da nova data: até 7 dias depois dele, volta tudo, sem multa ao proprietário.
 */
export function calculateBuyerRefund(params: {
  family: CancellationPolicyFamily;
  policy: CancellationPolicyId;
  purchasedAt: string;
  startsAt: string;
  now: Date;
  paidMinor: number;
  serviceFeeMinor: number;
  rescheduledAt?: string;
}): BuyerRefund {
  const nowMs = params.now.getTime();
  const startsAtMs = new Date(params.startsAt).getTime();
  const hoursUntilStart = (startsAtMs - nowMs) / HOUR_MS;
  if (hoursUntilStart <= 0) {
    return { reason: 'none', percent: 0, refundMinor: 0, serviceFeeRefundMinor: 0 };
  }
  const daysSinceReschedule = params.rescheduledAt
    ? (nowMs - new Date(params.rescheduledAt).getTime()) / (24 * HOUR_MS)
    : Number.POSITIVE_INFINITY;
  if (daysSinceReschedule >= 0 && daysSinceReschedule <= RESCHEDULE_REFUND_DAYS) {
    return {
      reason: 'reschedule',
      percent: 100,
      refundMinor: params.paidMinor,
      serviceFeeRefundMinor: params.serviceFeeMinor,
    };
  }
  const daysSincePurchase = (nowMs - new Date(params.purchasedAt).getTime()) / (24 * HOUR_MS);
  if (
    daysSincePurchase <= WITHDRAWAL_DAYS &&
    hoursUntilStart >= WITHDRAWAL_MIN_HOURS_BEFORE_START
  ) {
    return {
      reason: 'withdrawal',
      percent: 100,
      refundMinor: params.paidMinor,
      serviceFeeRefundMinor: params.serviceFeeMinor,
    };
  }
  const tiers = POLICY_TIERS[params.family][params.policy] ?? [];
  const percent = tiers.find((tier) => hoursUntilStart >= tier.hoursBefore)?.percent ?? 0;
  return {
    reason: percent > 0 ? 'policy' : 'none',
    percent,
    // Arredonda para baixo: nunca devolve mais do que o percentual da política.
    refundMinor: Math.floor((params.paidMinor * percent) / 100),
    serviceFeeRefundMinor: 0,
  };
}
