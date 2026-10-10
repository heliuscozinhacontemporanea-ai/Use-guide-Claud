import type {
  PersistedSubscriptionPlanUpdate,
  SubscriptionPlan,
} from '../types/subscriptionPlan';

export interface AdminPlansPort {
  updatePlan(
    planId: string,
    data: PersistedSubscriptionPlanUpdate
  ): Promise<void>;
  getPlans(): Promise<SubscriptionPlan[]>;
  getPlanById(planId: string): Promise<SubscriptionPlan | null>;
}
