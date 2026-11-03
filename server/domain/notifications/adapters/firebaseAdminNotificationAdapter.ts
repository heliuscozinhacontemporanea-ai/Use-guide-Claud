import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { adminDb } from '../../../infrastructure/firebase/adminClient';
import type { NotificationRepositoryPort } from '../ports/notificationRepositoryPort';
import type { NewNotification, NotificationPreferences } from '../types/notificationTypes';

const NOTIFICATIONS = 'notifications';
const PREFERENCES = 'notificationPreferences';

function toDocument(
  data: Omit<NewNotification, 'dedupeKey'>,
  expiresAt: Date
): Record<string, unknown> {
  return {
    recipientUid: data.recipientUid,
    type: data.type,
    params: data.params ?? {},
    link: data.link ?? null,
    read: false,
    createdAt: FieldValue.serverTimestamp(),
    expiresAt: Timestamp.fromDate(expiresAt),
  };
}

export class FirebaseAdminNotificationAdapter implements NotificationRepositoryPort {
  async create(notification: NewNotification, expiresAt: Date): Promise<boolean> {
    const collection = adminDb.collection(NOTIFICATIONS);
    const { dedupeKey, ...data } = notification;
    if (!dedupeKey) {
      await collection.doc().set(toDocument(data, expiresAt));
      return true;
    }
    try {
      // `create` falha se o documento já existe: o mesmo aviso nunca sai duas vezes.
      await collection.doc(dedupeKey).create(toDocument(data, expiresAt));
      return true;
    } catch (error) {
      if ((error as { code?: number }).code === 6) return false;
      throw error;
    }
  }

  async createMany(
    recipientUids: string[],
    data: Omit<NewNotification, 'recipientUid' | 'dedupeKey'>,
    expiresAt: Date
  ): Promise<void> {
    const writer = adminDb.bulkWriter();
    for (const recipientUid of recipientUids) {
      writer.set(
        adminDb.collection(NOTIFICATIONS).doc(),
        toDocument({ ...data, recipientUid }, expiresAt)
      );
    }
    await writer.close();
  }

  async markAsRead(notificationId: string, recipientUid: string): Promise<boolean> {
    const ref = adminDb.collection(NOTIFICATIONS).doc(notificationId);
    const snap = await ref.get();
    if (!snap.exists || snap.get('recipientUid') !== recipientUid) return false;
    await ref.update({ read: true, readAt: FieldValue.serverTimestamp() });
    return true;
  }

  async markAllAsRead(recipientUid: string): Promise<void> {
    const snap = await adminDb
      .collection(NOTIFICATIONS)
      .where('recipientUid', '==', recipientUid)
      .where('read', '==', false)
      .get();
    if (snap.empty) return;
    const writer = adminDb.bulkWriter();
    for (const doc of snap.docs) {
      writer.update(doc.ref, { read: true, readAt: FieldValue.serverTimestamp() });
    }
    await writer.close();
  }

  async getPreferences(uid: string): Promise<Partial<NotificationPreferences> | null> {
    const snap = await adminDb.collection(PREFERENCES).doc(uid).get();
    if (!snap.exists) return null;
    const data = snap.data() ?? {};
    const preferences: Partial<NotificationPreferences> = {};
    if (typeof data.reviewRequests === 'boolean') preferences.reviewRequests = data.reviewRequests;
    if (typeof data.news === 'boolean') preferences.news = data.news;
    if (data.salesAlerts === 'each' || data.salesAlerts === 'daily') {
      preferences.salesAlerts = data.salesAlerts;
    }
    return preferences;
  }

  async savePreferences(uid: string, preferences: NotificationPreferences): Promise<void> {
    await adminDb
      .collection(PREFERENCES)
      .doc(uid)
      .set({ ...preferences, updatedAt: FieldValue.serverTimestamp() });
  }

  async deleteAllForUser(uid: string): Promise<void> {
    const snap = await adminDb.collection(NOTIFICATIONS).where('recipientUid', '==', uid).get();
    const writer = adminDb.bulkWriter();
    for (const doc of snap.docs) writer.delete(doc.ref);
    writer.delete(adminDb.collection(PREFERENCES).doc(uid));
    await writer.close();
  }
}
