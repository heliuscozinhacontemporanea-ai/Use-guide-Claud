import type {
  SubscriptionPlan,
} from '../types/admin';

export interface AdminPlansPort {
  getActivePlans(): Promise<SubscriptionPlan[]>;
  getAllPlans(): Promise<SubscriptionPlan[]>;
  updatePlan(
    planId: string,
    data: {
      name?: string;
      price?: number;
      period?: string;
      description?: string;
      isActive?: boolean;
    }
  ): Promise<void>;
}
