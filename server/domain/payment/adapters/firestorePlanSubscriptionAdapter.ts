import { adminDb } from '../../../infrastructure/firebase/adminClient';
import type {
  PlanSubscriptionRecord,
  PlanSubscriptionRepositoryPort,
} from '../ports/planSubscriptionRepositoryPort';

const COLLECTION = 'planSubscriptions';

function toRecord(itemId: string, data: Partial<PlanSubscriptionRecord>): PlanSubscriptionRecord {
  return {
    itemId,
    partnerId: String(data.partnerId ?? ''),
    stripeCustomerId: String(data.stripeCustomerId ?? ''),
    stripeSubscriptionId: data.stripeSubscriptionId ?? null,
    planId: String(data.planId ?? ''),
    status: data.status ?? 'incomplete',
    currentPeriodEnd: data.currentPeriodEnd ?? null,
    cancelAtPeriodEnd: data.cancelAtPeriodEnd === true,
    updatedAt: String(data.updatedAt ?? ''),
  };
}

export class FirestorePlanSubscriptionAdapter implements PlanSubscriptionRepositoryPort {
  async get(itemId: string): Promise<PlanSubscriptionRecord | null> {
    const snapshot = await adminDb.collection(COLLECTION).doc(itemId).get();
    return snapshot.exists ? toRecord(itemId, snapshot.data() ?? {}) : null;
  }

  async save(record: PlanSubscriptionRecord): Promise<void> {
    await adminDb.collection(COLLECTION).doc(record.itemId).set(record);
  }

  async listByPartner(partnerId: string): Promise<PlanSubscriptionRecord[]> {
    const snapshot = await adminDb.collection(COLLECTION).where('partnerId', '==', partnerId).get();
    return snapshot.docs.map((doc) => toRecord(doc.id, doc.data()));
  }
}
