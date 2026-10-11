import { adminDb } from '../../../infrastructure/firebase/adminClient';
import type {
  PlanSubscriptionRecord,
  PlanSubscriptionRepositoryPort,
} from '../ports/planSubscriptionRepositoryPort';

const COLLECTION = 'partnerSubscriptions';

export class FirestorePlanSubscriptionAdapter implements PlanSubscriptionRepositoryPort {
  async get(partnerId: string): Promise<PlanSubscriptionRecord | null> {
    const snapshot = await adminDb.collection(COLLECTION).doc(partnerId).get();
    if (!snapshot.exists) return null;
    const data = snapshot.data() as Partial<PlanSubscriptionRecord>;
    return {
      partnerId,
      stripeCustomerId: String(data.stripeCustomerId ?? ''),
      stripeSubscriptionId: data.stripeSubscriptionId ?? null,
      planId: String(data.planId ?? ''),
      status: data.status ?? 'incomplete',
      currentPeriodEnd: data.currentPeriodEnd ?? null,
      cancelAtPeriodEnd: data.cancelAtPeriodEnd === true,
      updatedAt: String(data.updatedAt ?? ''),
    };
  }

  async save(record: PlanSubscriptionRecord): Promise<void> {
    await adminDb.collection(COLLECTION).doc(record.partnerId).set(record);
  }
}
