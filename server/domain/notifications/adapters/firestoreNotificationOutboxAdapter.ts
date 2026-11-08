import { Timestamp } from 'firebase-admin/firestore';
import { adminDb } from '../../../infrastructure/firebase/adminClient';
import type { NotificationOutboxPort, OutboxEntry } from '../ports/pushPorts';
import type { NotificationType } from '../types/notificationTypes';

const OUTBOX = 'notificationOutbox';

export class FirestoreNotificationOutboxAdapter implements NotificationOutboxPort {
  async claimDue(now: Date, limit: number, leaseMs: number): Promise<OutboxEntry[]> {
    const snap = await adminDb
      .collection(OUTBOX)
      .where('notBefore', '<=', Timestamp.fromDate(now))
      .orderBy('notBefore')
      .limit(limit)
      .get();
    const claimed: OutboxEntry[] = [];
    for (const doc of snap.docs) {
      const entry = await adminDb.runTransaction(async (tx) => {
        const fresh = await tx.get(doc.ref);
        const notBefore = fresh.get('notBefore') as Timestamp | undefined;
        if (!fresh.exists || !notBefore || notBefore.toMillis() > now.getTime()) return null;
        tx.update(doc.ref, {
          notBefore: Timestamp.fromMillis(now.getTime() + leaseMs),
        });
        const data = fresh.data() ?? {};
        return {
          id: fresh.id,
          recipientUid: String(data.recipientUid ?? ''),
          type: data.type as NotificationType,
          params: (data.params ?? {}) as OutboxEntry['params'],
          link: (data.link ?? null) as OutboxEntry['link'],
          attempts: Number(data.attempts ?? 0),
        };
      });
      if (entry) claimed.push(entry);
    }
    return claimed;
  }

  async enqueue(entry: Omit<OutboxEntry, 'attempts'>, notBefore: Date): Promise<boolean> {
    try {
      await adminDb
        .collection(OUTBOX)
        .doc(entry.id)
        .create({
          recipientUid: entry.recipientUid,
          type: entry.type,
          params: entry.params,
          link: entry.link,
          attempts: 0,
          notBefore: Timestamp.fromDate(notBefore),
          createdAt: Timestamp.now(),
        });
      return true;
    } catch (error) {
      if ((error as { code?: number }).code === 6) return false;
      throw error;
    }
  }

  async complete(id: string): Promise<void> {
    await adminDb.collection(OUTBOX).doc(id).delete();
  }

  async defer(id: string, notBefore: Date): Promise<void> {
    await adminDb
      .collection(OUTBOX)
      .doc(id)
      .update({ notBefore: Timestamp.fromDate(notBefore) });
  }

  async retryLater(id: string, attempts: number, notBefore: Date): Promise<void> {
    await adminDb
      .collection(OUTBOX)
      .doc(id)
      .update({ attempts, notBefore: Timestamp.fromDate(notBefore) });
  }

  async deleteAllForUser(uid: string): Promise<void> {
    const snap = await adminDb.collection(OUTBOX).where('recipientUid', '==', uid).get();
    const writer = adminDb.bulkWriter();
    for (const doc of snap.docs) writer.delete(doc.ref);
    await writer.close();
  }
}
