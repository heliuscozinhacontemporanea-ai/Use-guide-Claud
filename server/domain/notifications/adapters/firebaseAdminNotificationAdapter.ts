import { adminDb } from '../../../infrastructure/firebase/adminClient';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import {
  NotificationRepositoryPort,
  CreateNotificationInput,
} from '../ports/notificationRepositoryPort';
import { NotificationSettingsPatch } from '../dtos/UpdateNotificationSettingsDTO';
import {
  NotificationNotFoundError,
  NotificationForbiddenError,
} from '../errors/notificationErrors';

export class FirebaseAdminNotificationAdapter implements NotificationRepositoryPort {
  async createNotification(input: CreateNotificationInput): Promise<void> {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    const docRef = adminDb.collection('notifications').doc();
    await docRef.set({
      ...input,
      relatedItemCollection: input.relatedItemCollection ?? input.itemCollection ?? null,
      read: false,
      createdAt: FieldValue.serverTimestamp(),
      expiresAt: Timestamp.fromDate(expiresAt),
    });
  }

  async createBulkNotifications(
    recipientPartnerIds: string[],
    data: Omit<CreateNotificationInput, 'recipientPartnerId'>
  ): Promise<void> {
    if (recipientPartnerIds.length === 0) return;

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    const bulkWriter = adminDb.bulkWriter();

    for (const partnerId of recipientPartnerIds) {
      const docRef = adminDb.collection('notifications').doc();
      bulkWriter.set(docRef, {
        ...data,
        relatedItemCollection: data.relatedItemCollection ?? data.itemCollection ?? null,
        recipientPartnerId: partnerId,
        read: false,
        createdAt: FieldValue.serverTimestamp(),
        expiresAt: Timestamp.fromDate(expiresAt),
      });
    }

    await bulkWriter.close();
  }

  async markAsRead(notificationId: string, recipientId: string): Promise<void> {
    const docRef = adminDb.collection('notifications').doc(notificationId);
    const snap = await docRef.get();
    if (!snap.exists) {
      throw new NotificationNotFoundError();
    }
    const data = snap.data();
    if (data?.recipientPartnerId !== recipientId) {
      throw new NotificationForbiddenError();
    }
    await docRef.update({
      read: true,
      readAt: FieldValue.serverTimestamp(),
    });
  }

  async markAllAsRead(recipientId: string): Promise<void> {
    const snap = await adminDb
      .collection('notifications')
      .where('recipientPartnerId', '==', recipientId)
      .where('read', '==', false)
      .get();

    if (snap.empty) return;

    const bulkWriter = adminDb.bulkWriter();
    snap.docs.forEach((doc) => {
      bulkWriter.update(doc.ref, {
        read: true,
        readAt: FieldValue.serverTimestamp(),
      });
    });
    await bulkWriter.close();
  }

  async isNotificationTypeEnabled(
    partnerId: string,
    type: 'review' | 'plan_expiring'
  ): Promise<boolean> {
    const docRef = adminDb.collection('partnerNotificationSettings').doc(partnerId);
    const doc = await docRef.get();

    if (!doc.exists) {
      return true; // Enabled by default
    }

    const settings = doc.data();
    if (!settings) return true;

    if (type === 'review') {
      return settings.reviewNotifications !== false;
    }
    if (type === 'plan_expiring') {
      return settings.planExpiringNotifications !== false;
    }

    return true;
  }

  async getSettings(partnerId: string): Promise<Record<string, unknown>> {
    const docRef = adminDb.collection('partnerNotificationSettings').doc(partnerId);
    const doc = await docRef.get();
    if (!doc.exists) {
      return {
        partnerId,
        reviewNotifications: true,
        planExpiringNotifications: true,
      };
    }
    return doc.data() || {};
  }

  async updateSettings(partnerId: string, settings: NotificationSettingsPatch): Promise<void> {
    const docRef = adminDb.collection('partnerNotificationSettings').doc(partnerId);
    const safeData: Record<string, unknown> = { partnerId };
    if (settings.reviewNotifications !== undefined) {
      safeData.reviewNotifications = settings.reviewNotifications;
    }
    if (settings.planExpiringNotifications !== undefined) {
      safeData.planExpiringNotifications = settings.planExpiringNotifications;
    }
    await docRef.set(safeData, { merge: true });
  }
}
