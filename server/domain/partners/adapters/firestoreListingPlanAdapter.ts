import { FieldValue } from 'firebase-admin/firestore';
import { adminDb } from '../../../infrastructure/firebase/adminClient';
import { ListingPlanError } from '../errors/listingPlanError';
import type { ListingPlanRepositoryPort } from '../ports/listingPlanRepositoryPort';
import type { ListingPlanRecord } from '../types/listingPlan';

const PLANS = 'listingPlans';
const PARTNERS = 'partners';

/** `listingPlans` é só de backend (`allow read, write: if false`); o cliente lê a cópia pública no item. */
export class FirestoreListingPlanAdapter implements ListingPlanRepositoryPort {
  async get(itemId: string): Promise<ListingPlanRecord | null> {
    const snapshot = await adminDb.collection(PLANS).doc(itemId).get();
    return snapshot.exists ? (snapshot.data() as ListingPlanRecord) : null;
  }

  async save(record: ListingPlanRecord): Promise<void> {
    await adminDb.collection(PLANS).doc(record.itemId).set(record);
  }

  async activateTrial(record: ListingPlanRecord): Promise<void> {
    const partnerRef = adminDb.collection(PARTNERS).doc(record.ownerId);
    await adminDb.runTransaction(async (transaction) => {
      const partner = await transaction.get(partnerRef);
      // Rechecado na transação: dois pedidos simultâneos não podem usar o trial duas vezes.
      if (partner.get('hasUsedTrial') === true) {
        throw new ListingPlanError('TRIAL_ALREADY_USED', 'O período de testes já foi usado.');
      }
      transaction.set(
        partnerRef,
        { hasUsedTrial: true, updatedAt: FieldValue.serverTimestamp() },
        { merge: true }
      );
      transaction.set(adminDb.collection(PLANS).doc(record.itemId), record);
    });
  }

  async hasUsedTrial(ownerId: string): Promise<boolean> {
    const snapshot = await adminDb.collection(PARTNERS).doc(ownerId).get();
    return snapshot.get('hasUsedTrial') === true;
  }

  async isOwnerSuspended(ownerId: string): Promise<boolean> {
    const snapshot = await adminDb.collection(PARTNERS).doc(ownerId).get();
    return snapshot.get('status') === 'suspended';
  }

  async setSealActive(itemId: string, sealActive: boolean): Promise<void> {
    const ref = adminDb.collection(PLANS).doc(itemId);
    const snapshot = await ref.get();
    if (snapshot.exists) await ref.update({ sealActive });
  }

  async listExpiredWithSeal(nowIso: string, limit: number): Promise<ListingPlanRecord[]> {
    const snapshot = await adminDb
      .collection(PLANS)
      .where('sealActive', '==', true)
      .where('planUntil', '<=', nowIso)
      .orderBy('planUntil', 'asc')
      .limit(limit)
      .get();
    return snapshot.docs.map((doc) => doc.data() as ListingPlanRecord);
  }

  async listActive(nowIso: string, limit: number): Promise<ListingPlanRecord[]> {
    const snapshot = await adminDb
      .collection(PLANS)
      .where('planUntil', '>', nowIso)
      .orderBy('planUntil', 'asc')
      .limit(limit)
      .get();
    return snapshot.docs.map((doc) => doc.data() as ListingPlanRecord);
  }

  async listExpiringWithSeal(
    fromIso: string,
    toIso: string,
    limit: number
  ): Promise<ListingPlanRecord[]> {
    const snapshot = await adminDb
      .collection(PLANS)
      .where('sealActive', '==', true)
      .where('planUntil', '>', fromIso)
      .where('planUntil', '<=', toIso)
      .orderBy('planUntil', 'asc')
      .limit(limit)
      .get();
    return snapshot.docs.map((doc) => doc.data() as ListingPlanRecord);
  }

  async delete(itemId: string): Promise<void> {
    await adminDb.collection(PLANS).doc(itemId).delete();
  }

  async deleteByOwner(ownerId: string): Promise<void> {
    const snapshot = await adminDb.collection(PLANS).where('ownerId', '==', ownerId).get();
    const batch = adminDb.batch();
    for (const doc of snapshot.docs) batch.delete(doc.ref);
    await batch.commit();
  }
}
