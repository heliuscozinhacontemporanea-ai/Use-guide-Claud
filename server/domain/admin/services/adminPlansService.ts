import { AdminDomainError } from '../errors/adminDomainError';
import type {
  SubscriptionPlan,
  UpdateSubscriptionPlanInput,
} from '../types/subscriptionPlan';
import type { AdminPlansPort } from '../ports/adminPlansPort';

const BILLING_MONTHS_BY_PLAN: Partial<Record<SubscriptionPlan['id'], number>> = {
  'semi-annual': 6,
  annual: 12,
};

export class AdminPlansService {
  constructor(
    private readonly adminPlansPort: AdminPlansPort
  ) {}

  async updatePlan(
    planId: string,
    data: UpdateSubscriptionPlanInput
  ): Promise<void> {
    if (!planId.trim()) {
      throw new AdminDomainError(
        'INVALID_ID',
        'ID do plano é obrigatório'
      );
    }

    if (planId !== 'trial' && data.priceMinor !== undefined && data.priceMinor <= 0) {
      throw new AdminDomainError(
        'VALIDATION_ERROR',
        'Planos pagos exigem preço maior que zero'
      );
    }

    // O equivalente mensal é exibido ao parceiro e não é editável pelo admin: derivar do preço evita valor defasado.
    const months = BILLING_MONTHS_BY_PLAN[planId as SubscriptionPlan['id']];
    const derived =
      data.priceMinor !== undefined && months
        ? { monthlyEquivalentMinor: Math.round(data.priceMinor / months) }
        : {};

    await this.adminPlansPort.updatePlan(planId, { ...data, ...derived });
  }

  async getPlans(): Promise<SubscriptionPlan[]> {
    return this.adminPlansPort.getPlans();
  }

  async getPlanById(
    planId: string
  ): Promise<SubscriptionPlan | null> {
    if (!planId.trim()) {
      return null;
    }
    return this.adminPlansPort.getPlanById(planId);
  }
}
