import { adminDb } from '../../../infrastructure/firebase/adminClient';
import type { PayoutEntryRepositoryPort } from '../ports/payoutEntryRepositoryPort';
import type { PayoutEntry } from '../types/payoutEntry';

const GET_MANY_BATCH = 100;
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

  async getMany(ids: string[]): Promise<PayoutEntry[]> {
    const entries: PayoutEntry[] = [];
    // getAll lê por ID, sem consulta nem índice; em lotes para não montar pedidos enormes.
    for (let start = 0; start < ids.length; start += GET_MANY_BATCH) {
      const refs = ids
        .slice(start, start + GET_MANY_BATCH)
        .map((id) => adminDb.collection(ENTRIES).doc(id));
      const snapshots = await adminDb.getAll(...refs);
      for (const snapshot of snapshots) {
        if (snapshot.exists) entries.push(snapshot.data() as PayoutEntry);
      }
    }
    return entries;
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

  async listOpenByAccountKeys(accountKeys: string[], limit: number): Promise<PayoutEntry[]> {
    if (accountKeys.length === 0) return [];
    // Uma consulta por status: `in` em dois campos multiplica as combinações e passa do limite de 30.
    const snapshots = await Promise.all(
      (['pending', 'on_hold'] as const).map((status) =>
        adminDb
          .collection(ENTRIES)
          .where('accountKey', 'in', accountKeys.slice(0, 30))
          .where('status', '==', status)
          .orderBy('releaseAt', 'asc')
          .limit(limit)
          .get()
      )
    );
    return snapshots
      .flatMap((snapshot) => snapshot.docs.map((doc) => doc.data() as PayoutEntry))
      .sort((a, b) => a.releaseAt.localeCompare(b.releaseAt))
      .slice(0, limit);
  }

  async listReleasedSince(
    accountKeys: string[],
    sinceIso: string,
    limit: number
  ): Promise<PayoutEntry[]> {
    if (accountKeys.length === 0) return [];
    const snapshot = await adminDb
      .collection(ENTRIES)
      .where('accountKey', 'in', accountKeys.slice(0, 30))
      .where('status', '==', 'released')
      .where('releasedAt', '>=', sinceIso)
      .orderBy('releasedAt', 'desc')
      .limit(limit)
      .get();
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
