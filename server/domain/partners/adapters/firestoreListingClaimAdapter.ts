import type { DocumentData } from 'firebase-admin/firestore';
import { adminDb } from '../../../infrastructure/firebase/adminClient';
import { ListingClaimError } from '../errors/listingClaimError';
import type {
  ListingClaimPage,
  ListingClaimRepositoryPort,
} from '../ports/listingClaimRepositoryPort';
import type { ListingClaimRecord, ListingClaimStatus } from '../types/listingClaim';

const CLAIMS = 'listingClaims';

function toRecord(data: DocumentData): ListingClaimRecord {
  return data as ListingClaimRecord;
}

/** Coleção só de backend (`allow read, write: if false`): o cliente lê pela API (§6.2). */
export class FirestoreListingClaimAdapter implements ListingClaimRepositoryPort {
  async get(claimId: string): Promise<ListingClaimRecord | null> {
    const snapshot = await adminDb.collection(CLAIMS).doc(claimId).get();
    return snapshot.exists ? toRecord(snapshot.data() as DocumentData) : null;
  }

  async save(record: ListingClaimRecord): Promise<void> {
    await adminDb.collection(CLAIMS).doc(record.claimId).set(record);
  }

  async saveReview(record: ListingClaimRecord): Promise<void> {
    await adminDb.collection(CLAIMS).doc(record.claimId).set(record);
  }

  async listByStatus(
    status: ListingClaimStatus,
    limit: number,
    cursor: string | null
  ): Promise<ListingClaimPage> {
    let query = adminDb
      .collection(CLAIMS)
      .where('status', '==', status)
      .orderBy('submittedAt', 'asc')
      .limit(limit + 1);
    if (cursor) {
      const cursorSnapshot = await adminDb.collection(CLAIMS).doc(cursor).get();
      if (cursorSnapshot.exists) query = query.startAfter(cursorSnapshot);
    }
    const snapshot = await query.get();
    const docs = snapshot.docs.slice(0, limit);
    return {
      data: docs.map((doc) => toRecord(doc.data())),
      nextCursor: snapshot.docs.length > limit ? (docs.at(-1)?.id ?? null) : null,
    };
  }

  async listByItem(itemId: string): Promise<ListingClaimRecord[]> {
    const snapshot = await adminDb.collection(CLAIMS).where('itemId', '==', itemId).get();
    return snapshot.docs.map((doc) => toRecord(doc.data()));
  }

  async listByClaimant(claimantId: string): Promise<ListingClaimRecord[]> {
    const snapshot = await adminDb.collection(CLAIMS).where('claimantId', '==', claimantId).get();
    return snapshot.docs.map((doc) => toRecord(doc.data()));
  }

  async approve(
    claimId: string,
    reviewedAt: string,
    reviewedBy: string,
    siblingReason: string
  ): Promise<ListingClaimRecord[]> {
    return adminDb.runTransaction(async (transaction) => {
      const ref = adminDb.collection(CLAIMS).doc(claimId);
      const snapshot = await transaction.get(ref);
      const record = snapshot.exists ? toRecord(snapshot.data() as DocumentData) : null;
      // Rechecado na transação: dois admins não aprovam dois pedidos do mesmo lugar.
      if (record?.status !== 'pending') {
        throw new ListingClaimError('NOT_PENDING', 'Este pedido já foi revisado.');
      }
      const siblings = await transaction.get(
        adminDb
          .collection(CLAIMS)
          .where('itemId', '==', record.itemId)
          .where('status', '==', 'pending')
      );
      const rejected: ListingClaimRecord[] = [];
      for (const doc of siblings.docs) {
        if (doc.id === claimId) continue;
        const sibling: ListingClaimRecord = {
          ...toRecord(doc.data()),
          status: 'rejected',
          rejectionReason: siblingReason,
          reviewedAt,
          reviewedBy,
        };
        transaction.set(doc.ref, sibling);
        rejected.push(sibling);
      }
      transaction.set(ref, { ...record, status: 'approved', reviewedAt, reviewedBy });
      return rejected;
    });
  }

  async deleteByClaimant(claimantId: string): Promise<ListingClaimRecord[]> {
    const snapshot = await adminDb.collection(CLAIMS).where('claimantId', '==', claimantId).get();
    const batch = adminDb.batch();
    for (const doc of snapshot.docs) batch.delete(doc.ref);
    await batch.commit();
    return snapshot.docs.map((doc) => toRecord(doc.data()));
  }
}
