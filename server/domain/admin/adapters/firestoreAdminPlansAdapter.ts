import { FieldValue } from 'firebase-admin/firestore';
import { adminDb } from '../../../infrastructure/firebase/adminClient';
import { AdminDomainError } from '../errors/adminDomainError';
import type {
  PersistedSubscriptionPlanUpdate,
  SubscriptionPlan,
} from '../types/subscriptionPlan';
import type { AdminPlansPort } from '../ports/adminPlansPort';

function mapSubscriptionPlan(
  id: string,
  data: FirebaseFirestore.DocumentData
): SubscriptionPlan {
  return {
    id: id as SubscriptionPlan['id'],
    name: typeof data.name === 'string' ? data.name : '',
    priceMinor: Number.isInteger(data.priceMinor) ? data.priceMinor : 0,
    period: typeof data.period === 'string' ? data.period : '',
    monthlyEquivalentMinor: Number.isInteger(data.monthlyEquivalentMinor)
      ? data.monthlyEquivalentMinor
      : null,
    savingLabel:
      typeof data.savingLabel === 'string'
        ? data.savingLabel
        : null,
    description:
      typeof data.description === 'string'
        ? data.description
        : '',
    badge:
      typeof data.badge === 'string'
        ? data.badge
        : undefined,
    isActive: data.isActive !== false,
  };
}

export class FirestoreAdminPlansAdapter implements AdminPlansPort {
  async updatePlan(
    planId: string,
    data: PersistedSubscriptionPlanUpdate
  ): Promise<void> {
    if (!planId.trim()) {
      throw new AdminDomainError(
        'INVALID_ID',
        'ID do plano é obrigatório'
      );
    }
    try {
      await adminDb
        .collection('subscriptionPlans')
        .doc(planId)
        .update({
          ...data,
          updatedAt: FieldValue.serverTimestamp(),
        });
    } catch (error: unknown) {
      const firestoreError = error as { code?: number | string };
      if (
        firestoreError.code === 5 ||
        firestoreError.code === 'not-found'
      ) {
        throw new AdminDomainError(
          'NOT_FOUND',
          'Plano não encontrado'
        );
      }
      throw error;
    }
  }

  async getPlans(): Promise<SubscriptionPlan[]> {
    const snapshot = await adminDb
      .collection('subscriptionPlans')
      .get();
    return snapshot.docs.map((doc) =>
      mapSubscriptionPlan(doc.id, doc.data())
    );
  }

  async getPlanById(
    planId: string
  ): Promise<SubscriptionPlan | null> {
    if (!planId.trim()) {
      return null;
    }
    const doc = await adminDb
      .collection('subscriptionPlans')
      .doc(planId)
      .get();
    if (!doc.exists) {
      return null;
    }
    return mapSubscriptionPlan(
      doc.id,
      doc.data() ?? {}
    );
  }
}
