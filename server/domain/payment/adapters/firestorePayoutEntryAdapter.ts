import { adminDb } from '../../../infrastructure/firebase/adminClient';
import type { PayoutEntryRepositoryPort } from '../ports/payoutEntryRepositoryPort';
import type { PayoutEntry } from '../types/payoutEntry';

const ENTRIES = 'payoutEntries';

/** Coleção só de backend (`allow read, write: if false`, AGENTS.md §6.2). */
export class FirestorePayoutEntryAdapter implements PayoutEntryRepositoryPort {
  async createIfAbsent(entry: PayoutEntry): Promise<PayoutEntry> {
    const ref = adminDb.collection(ENTRIES).doc(entry.id);
    return adminDb.runTransaction(async (tx) => {
      const snapshot = await tx.get(ref);
      if (snapshot.exists) return snapshot.data() as PayoutEntry;
      tx.set(ref, entry);
      return entry;
    });
  }

  async get(id: string): Promise<PayoutEntry | null> {
    const snapshot = await adminDb.collection(ENTRIES).doc(id).get();
    return snapshot.exists ? (snapshot.data() as PayoutEntry) : null;
  }

  async listByAccountKeys(
    accountKeys: string[],
    limit: number,
    cursor?: string
  ): Promise<PayoutEntry[]> {
    if (accountKeys.length === 0) return [];
    // `in` aceita até 30 valores; um parceiro tem bem menos CNPJs que isso.
    let query = adminDb
      .collection(ENTRIES)
      .where('accountKey', 'in', accountKeys.slice(0, 30))
      .orderBy('createdAt', 'desc')
      .limit(limit);
    if (cursor) {
      const last = await adminDb.collection(ENTRIES).doc(cursor).get();
      if (last.exists) query = query.startAfter(last);
    }
    const snapshot = await query.get();
    return snapshot.docs.map((doc) => doc.data() as PayoutEntry);
  }

  async getByPaymentIntentId(paymentIntentId: string): Promise<PayoutEntry | null> {
    const snapshot = await adminDb
      .collection(ENTRIES)
      .where('paymentIntentId', '==', paymentIntentId)
      .limit(1)
      .get();
    return (snapshot.docs[0]?.data() as PayoutEntry | undefined) ?? null;
  }

  async listDue(nowIso: string, limit: number): Promise<PayoutEntry[]> {
    const snapshot = await adminDb
      .collection(ENTRIES)
      .where('status', '==', 'pending')
      .where('releaseAt', '<=', nowIso)
      .orderBy('releaseAt', 'asc')
      .limit(limit)
      .get();
    return snapshot.docs.map((doc) => doc.data() as PayoutEntry);
  }

  async update(
    id: string,
    change: (current: PayoutEntry) => PayoutEntry | null
  ): Promise<PayoutEntry | null> {
    const ref = adminDb.collection(ENTRIES).doc(id);
    return adminDb.runTransaction(async (tx) => {
      const snapshot = await tx.get(ref);
      if (!snapshot.exists) return null;
      const current = snapshot.data() as PayoutEntry;
      const next = change(current);
      if (!next) return current;
      tx.set(ref, next);
      return next;
    });
  }
}
