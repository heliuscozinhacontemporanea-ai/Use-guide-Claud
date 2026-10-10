import { queryDocumentsUseCase } from '../../database';
import { firebaseApiFetch } from '../../../shared/infrastructure/firebase/firebaseApiFetch';
import type { AdminPlansPort } from '../ports/adminPlansPort';
import type { SubscriptionPlan } from '../types/admin';

const PLAN_ORDER: Record<SubscriptionPlan['id'], number> = {
  trial: 1,
  monthly: 2,
  'semi-annual': 3,
  annual: 4,
};

function mapPlanRecord(id: string, data: Record<string, unknown>): SubscriptionPlan {
  return {
    id: id as SubscriptionPlan['id'],
    name: typeof data.name === 'string' ? data.name : '',
    price: typeof data.price === 'number' && Number.isFinite(data.price) ? data.price : 0,
    period: typeof data.period === 'string' ? data.period : '',
    monthlyEquivalent:
      typeof data.monthlyEquivalent === 'number' && Number.isFinite(data.monthlyEquivalent)
        ? data.monthlyEquivalent
        : null,
    savingLabel: typeof data.savingLabel === 'string' ? data.savingLabel : null,
    description: typeof data.description === 'string' ? data.description : '',
    badge: typeof data.badge === 'string' ? data.badge : undefined,
    isActive: typeof data.isActive === 'boolean' ? data.isActive : true,
  };
}

export class FirestoreAdminPlansAdapter implements AdminPlansPort {
  async getActivePlans(): Promise<SubscriptionPlan[]> {
    const docs = await queryDocumentsUseCase<Record<string, unknown>>('subscriptionPlans', [
      { field: 'isActive', op: '==', value: true },
    ]);
    return docs
      .map((doc) => mapPlanRecord(String(doc.id ?? ''), doc))
      .sort((a, b) => (PLAN_ORDER[a.id] ?? 99) - (PLAN_ORDER[b.id] ?? 99));
  }

  async getAllPlans(): Promise<SubscriptionPlan[]> {
    const docs = await queryDocumentsUseCase<Record<string, unknown>>('subscriptionPlans');
    return docs
      .map((doc) => mapPlanRecord(String(doc.id ?? ''), doc))
      .sort((a, b) => (PLAN_ORDER[a.id] ?? 99) - (PLAN_ORDER[b.id] ?? 99));
  }

  async updatePlan(
    planId: string,
    data: {
      name?: string;
      price?: number;
      period?: string;
      description?: string;
      isActive?: boolean;
    }
  ): Promise<void> {
    const response = await firebaseApiFetch(
      `/api/admin/plans/${encodeURIComponent(planId)}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      },
      {
        requireAuth: true,
        requireAppCheck: true,
      }
    );

    if (!response.ok) {
      const body = await response.json().catch(() => null);
      throw new Error(
        typeof body?.error === 'string'
          ? body.error
          : 'Erro ao atualizar plano'
      );
    }
  }
}
