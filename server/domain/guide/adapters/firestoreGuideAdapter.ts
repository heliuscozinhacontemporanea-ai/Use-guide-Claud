import { FieldValue } from 'firebase-admin/firestore';
import { adminDb } from '../../../infrastructure/firebase/adminClient';
import { GuideItemContact, GuidePort, GuideVerificationUpdate } from '../ports/guidePort';
import { GuideCreateItemInput, GuideItemRecord, GuideUpdateItemInput } from '../types/guideTypes';

// Só o servidor lê (rules `if false`): telefone de anúncio que vende pelo app (C2/B37).
const CONTACTS = 'itemContacts';

export class FirestoreGuideAdapter implements GuidePort {
  async createItem(
    data: GuideCreateItemInput & {
      ownerId: string;
      id?: string;
    }
  ): Promise<string> {
    const { id, ...fields } = data;
    const reference = id ? adminDb.collection('items').doc(id) : adminDb.collection('items').doc();
    await reference.set({
      ...fields,
      rating: 0,
      reviewCount: 0,
      isVerified: false,
      verifiedUntil: null,
      verificationType: null,
      isVerificationSuspended: false,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
    return reference.id;
  }

  async getItemById(id: string): Promise<GuideItemRecord | null> {
    const snapshot = await adminDb.collection('items').doc(id).get();
    if (!snapshot.exists) {
      return null;
    }
    return {
      id: snapshot.id,
      ...(snapshot.data() as Omit<GuideItemRecord, 'id'>),
    };
  }

  async updateItem(id: string, data: GuideUpdateItemInput): Promise<void> {
    await adminDb
      .collection('items')
      .doc(id)
      .update({
        ...data,
        updatedAt: FieldValue.serverTimestamp(),
      });
  }

  async deleteItem(id: string): Promise<void> {
    await adminDb.collection('items').doc(id).delete();
    await adminDb.collection(CONTACTS).doc(id).delete();
  }

  async updateItemVerification(
    itemId: string,
    verification: GuideVerificationUpdate
  ): Promise<void> {
    const ref = adminDb.collection('items').doc(itemId);
    const snapshot = await ref.get();
    if (snapshot.exists) await ref.update({ ...verification });
  }

  async updateReviewAggregate(
    resourceType: 'items',
    resourceId: string,
    rating: number,
    reviewCount: number
  ): Promise<void> {
    const docRef = adminDb.collection(resourceType).doc(resourceId);
    await docRef.update({
      rating,
      reviewCount,
      updatedAt: FieldValue.serverTimestamp(),
    });
  }

  async deleteResourcesByOwner(ownerId: string): Promise<void> {
    const itemsSnapshot = await adminDb.collection('items').where('ownerId', '==', ownerId).get();
    if (itemsSnapshot.empty) {
      return;
    }

    const batch = adminDb.batch();
    itemsSnapshot.forEach((doc) => {
      batch.delete(doc.ref);
      batch.delete(adminDb.collection(CONTACTS).doc(doc.id));
    });
    await batch.commit();
  }

  async getItemContact(itemId: string): Promise<GuideItemContact | null> {
    const snapshot = await adminDb.collection(CONTACTS).doc(itemId).get();
    return snapshot.exists ? (snapshot.data() as GuideItemContact) : null;
  }

  async setItemContact(itemId: string, contact: GuideItemContact): Promise<void> {
    await adminDb
      .collection(CONTACTS)
      .doc(itemId)
      .set({ ...contact, updatedAt: FieldValue.serverTimestamp() });
  }

  async deleteItemContact(itemId: string): Promise<void> {
    await adminDb.collection(CONTACTS).doc(itemId).delete();
  }

  async listItemsByOwner(ownerId: string): Promise<GuideItemRecord[]> {
    const snapshot = await adminDb.collection('items').where('ownerId', '==', ownerId).get();
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<GuideItemRecord, 'id'>),
    }));
  }

  async getAllItems(): Promise<GuideItemRecord[]> {
    const snapshot = await adminDb.collection('items').get();
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<GuideItemRecord, 'id'>),
    }));
  }
}
