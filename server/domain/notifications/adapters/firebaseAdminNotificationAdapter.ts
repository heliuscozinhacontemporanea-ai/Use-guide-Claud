import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { adminDb } from '../../../infrastructure/firebase/adminClient';
import type { NotificationRepositoryPort } from '../ports/notificationRepositoryPort';
import type { NewNotification, NotificationPreferences } from '../types/notificationTypes';

const NOTIFICATIONS = 'notifications';
const PREFERENCES = 'notificationPreferences';
const OUTBOX = 'notificationOutbox';
const SALE_TYPES = ['sale_ticket', 'sale_booking'];

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

/** Entrada do push (§5.6): mesma escrita do aviso, mesmo id. */
function toOutbox(data: Omit<NewNotification, 'dedupeKey'>): Record<string, unknown> {
  return {
    recipientUid: data.recipientUid,
    type: data.type,
    params: data.params ?? {},
    link: data.link ?? null,
    attempts: 0,
    notBefore: Timestamp.now(),
    createdAt: FieldValue.serverTimestamp(),
  };
}

export class FirebaseAdminNotificationAdapter implements NotificationRepositoryPort {
  async create(notification: NewNotification, expiresAt: Date): Promise<boolean> {
    const { dedupeKey, ...data } = notification;
    const ref = dedupeKey
      ? adminDb.collection(NOTIFICATIONS).doc(dedupeKey)
      : adminDb.collection(NOTIFICATIONS).doc();
    const batch = adminDb.batch();
    // `create` falha se o documento já existe: o mesmo aviso nunca sai duas vezes.
    batch.create(ref, toDocument(data, expiresAt));
    batch.create(adminDb.collection(OUTBOX).doc(ref.id), toOutbox(data));
    try {
      await batch.commit();
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
      const ref = adminDb.collection(NOTIFICATIONS).doc();
      writer.set(ref, toDocument({ ...data, recipientUid }, expiresAt));
      writer.set(adminDb.collection(OUTBOX).doc(ref.id), toOutbox({ ...data, recipientUid }));
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

  async listDailySalesRecipients(): Promise<string[]> {
    const snap = await adminDb.collection(PREFERENCES).where('salesAlerts', '==', 'daily').get();
    return snap.docs.map((doc) => doc.id);
  }

  async countSalesSince(uid: string, since: Date): Promise<number> {
    const snap = await adminDb
      .collection(NOTIFICATIONS)
      .where('recipientUid', '==', uid)
      .where('type', 'in', SALE_TYPES)
      .where('createdAt', '>=', Timestamp.fromDate(since))
      .count()
      .get();
    return snap.data().count;
  }
}
