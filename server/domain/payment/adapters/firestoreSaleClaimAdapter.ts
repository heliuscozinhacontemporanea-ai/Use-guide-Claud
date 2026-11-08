import { adminDb } from '../../../infrastructure/firebase/adminClient';
import type { SaleClaimRepositoryPort } from '../ports/saleClaimRepositoryPort';
import type { SaleClaim } from '../types/saleClaim';

const CLAIMS = 'saleClaims';

/** Coleção só de backend (`allow read, write: if false`, AGENTS.md §6.2). */
export class FirestoreSaleClaimAdapter implements SaleClaimRepositoryPort {
  async createIfAbsent(claim: SaleClaim): Promise<SaleClaim> {
    const ref = adminDb.collection(CLAIMS).doc(claim.id);
    return adminDb.runTransaction(async (tx) => {
      const snapshot = await tx.get(ref);
      if (snapshot.exists) return snapshot.data() as SaleClaim;
      tx.set(ref, claim);
      return claim;
    });
  }

  async get(id: string): Promise<SaleClaim | null> {
    const snapshot = await adminDb.collection(CLAIMS).doc(id).get();
    return snapshot.exists ? (snapshot.data() as SaleClaim) : null;
  }

  async listByBuyer(buyerUid: string, limit: number): Promise<SaleClaim[]> {
    const snapshot = await adminDb
      .collection(CLAIMS)
      .where('buyerUid', '==', buyerUid)
      .orderBy('openedAt', 'desc')
      .limit(limit)
      .get();
    return snapshot.docs.map((doc) => doc.data() as SaleClaim);
  }

  async listPending(limit: number, cursor?: string): Promise<SaleClaim[]> {
    let query = adminDb
      .collection(CLAIMS)
      .where('status', 'in', ['open', 'refund_pending'])
      .orderBy('decideBy', 'asc')
      .limit(limit);
    if (cursor) {
      const last = await adminDb.collection(CLAIMS).doc(cursor).get();
      if (last.exists) query = query.startAfter(last);
    }
    const snapshot = await query.get();
    return snapshot.docs.map((doc) => doc.data() as SaleClaim);
  }

  async listExpired(nowIso: string, limit: number): Promise<SaleClaim[]> {
    const snapshot = await adminDb
      .collection(CLAIMS)
      .where('status', '==', 'open')
      .where('decideBy', '<=', nowIso)
      .orderBy('decideBy', 'asc')
      .limit(limit)
      .get();
    return snapshot.docs.map((doc) => doc.data() as SaleClaim);
  }

  async update(
    id: string,
    change: (current: SaleClaim) => SaleClaim | null
  ): Promise<SaleClaim | null> {
    const ref = adminDb.collection(CLAIMS).doc(id);
    return adminDb.runTransaction(async (tx) => {
      const snapshot = await tx.get(ref);
      if (!snapshot.exists) return null;
      const current = snapshot.data() as SaleClaim;
      const next = change(current);
      if (!next) return current;
      tx.set(ref, next);
      return next;
    });
  }
}
