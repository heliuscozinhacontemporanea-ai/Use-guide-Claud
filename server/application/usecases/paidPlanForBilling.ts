import { getSubscriptionPlanByIdUseCase } from '../../domain/admin';
import { PaymentDomainError } from '../../domain/payment';
import { isPaidPlanId, type PaidPlanId } from './activatePaidPlanApplicationUseCase';

const BILLING_INTERVAL: Record<PaidPlanId, { interval: 'month' | 'year'; intervalCount: number }> =
  {
    monthly: { interval: 'month', intervalCount: 1 },
    'semi-annual': { interval: 'month', intervalCount: 6 },
    annual: { interval: 'year', intervalCount: 1 },
  };

export interface PaidPlanForBilling {
  planId: PaidPlanId;
  planName: string;
  amountMinor: number;
  interval: 'month' | 'year';
  intervalCount: number;
}

/** Período pago do catálogo do admin: valor e intervalo saem do backend, nunca do cliente (§8.5). */
export async function loadPaidPlanForBilling(planId: string): Promise<PaidPlanForBilling> {
  if (!isPaidPlanId(planId)) {
    throw new PaymentDomainError('VALIDATION_ERROR', 'Plano inválido.', 400);
  }
  const plan = await getSubscriptionPlanByIdUseCase(planId);
  if (!plan || plan.isActive === false) {
    throw new PaymentDomainError('PLAN_INACTIVE', 'Plano indisponível.', 422);
  }
  return {
    planId,
    planName: plan.name,
    amountMinor: plan.priceMinor,
    ...BILLING_INTERVAL[planId],
  };
}
