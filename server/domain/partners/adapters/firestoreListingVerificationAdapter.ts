import type { DocumentData, Transaction } from 'firebase-admin/firestore';
import { adminDb } from '../../../infrastructure/firebase/adminClient';
import { ListingVerificationError } from '../errors/listingVerificationError';
import type {
  ListingVerificationPage,
  ListingVerificationRepositoryPort,
} from '../ports/listingVerificationRepositoryPort';
import type {
  ListingVerificationRecord,
  ListingVerificationStatus,
  VerificationDocumentEntry,
} from '../types/listingVerification';

const VERIFICATIONS = 'listingVerifications';
const DOCUMENTS = 'verificationDocuments';
const OWNERS = 'verificationOwners';

function toRecord(data: DocumentData): ListingVerificationRecord {
  return data as ListingVerificationRecord;
}

/** Coleções só de backend (`allow read, write: if false`): o cliente lê pela API (§6.2). */
export class FirestoreListingVerificationAdapter implements ListingVerificationRepositoryPort {
  async get(itemId: string): Promise<ListingVerificationRecord | null> {
    const snapshot = await adminDb.collection(VERIFICATIONS).doc(itemId).get();
    return snapshot.exists ? toRecord(snapshot.data() as DocumentData) : null;
  }

  async getDocumentEntry(documentIndex: string): Promise<VerificationDocumentEntry | null> {
    const snapshot = await adminDb.collection(DOCUMENTS).doc(documentIndex).get();
    return snapshot.exists ? (snapshot.data() as VerificationDocumentEntry) : null;
  }

  async saveSubmission(record: ListingVerificationRecord): Promise<void> {
    await adminDb.runTransaction(async (transaction) => {
      const recordRef = adminDb.collection(VERIFICATIONS).doc(record.itemId);
      const previousSnapshot = await transaction.get(recordRef);
      const previous = previousSnapshot.exists
        ? toRecord(previousSnapshot.data() as DocumentData)
        : null;

      let entry: VerificationDocumentEntry | null = null;
      const entryRef = record.documentIndex
        ? adminDb.collection(DOCUMENTS).doc(record.documentIndex)
        : null;
      if (entryRef) {
        const entrySnapshot = await transaction.get(entryRef);
        entry = entrySnapshot.exists ? (entrySnapshot.data() as VerificationDocumentEntry) : null;
        // Rechecado dentro da transação: dois envios simultâneos não podem reservar o mesmo documento.
        if (entry && entry.ownerId !== record.ownerId) {
          throw new ListingVerificationError(
            'DOCUMENT_IN_USE',
            'Este documento já está em outra conta.'
          );
        }
        if (record.documentType === 'cnpj' && entry?.itemId && entry.itemId !== record.itemId) {
          throw new ListingVerificationError(
            'CNPJ_ALREADY_USED',
            'Cada CNPJ vale para um estabelecimento. Filiais usam o CNPJ da filial.'
          );
        }
      }

      this.releasePreviousCnpj(transaction, previous, record.documentIndex);
      transaction.set(recordRef, record);
      if (entryRef && record.documentIndex && record.documentType) {
        transaction.set(entryRef, {
          documentIndex: record.documentIndex,
          ownerId: record.ownerId,
          documentType: record.documentType,
          itemId: record.documentType === 'cnpj' ? record.itemId : null,
          verifiedAt: entry?.verifiedAt ?? null,
        } satisfies VerificationDocumentEntry);
      }
    });
  }

  async saveReview(record: ListingVerificationRecord): Promise<void> {
    await adminDb.runTransaction(async (transaction) => {
      const ownerRef = adminDb.collection(OWNERS).doc(record.ownerId);
      const ownerSnapshot = await transaction.get(ownerRef);
      transaction.set(adminDb.collection(VERIFICATIONS).doc(record.itemId), record);
      if (record.status !== 'approved' || !record.documentIndex) return;

      transaction.set(
        adminDb.collection(DOCUMENTS).doc(record.documentIndex),
        { verifiedAt: record.reviewedAt },
        { merge: true }
      );
      if (record.documentType === 'cnpj' && !ownerSnapshot.get('salesDocumentIndex')) {
        transaction.set(
          ownerRef,
          { ownerId: record.ownerId, salesDocumentIndex: record.documentIndex },
          { merge: true }
        );
      }
    });
  }

  async listByStatus(
    status: ListingVerificationStatus,
    limit: number,
    cursor: string | null
  ): Promise<ListingVerificationPage> {
    let query = adminDb
      .collection(VERIFICATIONS)
      .where('status', '==', status)
      .orderBy('submittedAt', 'asc')
      .limit(limit + 1);
    if (cursor) {
      const cursorSnapshot = await adminDb.collection(VERIFICATIONS).doc(cursor).get();
      if (cursorSnapshot.exists) query = query.startAfter(cursorSnapshot);
    }
    const snapshot = await query.get();
    const docs = snapshot.docs.slice(0, limit);
    return {
      data: docs.map((doc) => toRecord(doc.data())),
      nextCursor: snapshot.docs.length > limit ? (docs.at(-1)?.id ?? null) : null,
    };
  }

  async listLinkedItemIds(sourceItemId: string): Promise<string[]> {
    const snapshot = await adminDb
      .collection(VERIFICATIONS)
      .where('sourceItemId', '==', sourceItemId)
      .get();
    return snapshot.docs.map((doc) => doc.id);
  }

  async getSalesDocumentIndex(ownerId: string): Promise<string | null> {
    const snapshot = await adminDb.collection(OWNERS).doc(ownerId).get();
    const value = snapshot.get('salesDocumentIndex');
    return typeof value === 'string' ? value : null;
  }

  async delete(itemId: string): Promise<ListingVerificationRecord | null> {
    return adminDb.runTransaction(async (transaction) => {
      const recordRef = adminDb.collection(VERIFICATIONS).doc(itemId);
      const snapshot = await transaction.get(recordRef);
      if (!snapshot.exists) return null;
      const record = toRecord(snapshot.data() as DocumentData);
      this.releasePreviousCnpj(transaction, record, null);
      transaction.delete(recordRef);
      return record;
    });
  }

  async deleteByOwner(ownerId: string): Promise<ListingVerificationRecord[]> {
    const [records, entries] = await Promise.all([
      adminDb.collection(VERIFICATIONS).where('ownerId', '==', ownerId).get(),
      adminDb.collection(DOCUMENTS).where('ownerId', '==', ownerId).get(),
    ]);
    const batch = adminDb.batch();
    for (const doc of [...records.docs, ...entries.docs]) batch.delete(doc.ref);
    batch.delete(adminDb.collection(OWNERS).doc(ownerId));
    await batch.commit();
    return records.docs.map((doc) => toRecord(doc.data()));
  }

  /** O CNPJ antigo volta a ficar livre; o CPF fica com a conta, porque outros estabelecimentos podem usá-lo. */
  private releasePreviousCnpj(
    transaction: Transaction,
    previous: ListingVerificationRecord | null,
    nextIndex: string | null
  ): void {
    if (previous?.documentType !== 'cnpj' || !previous.documentIndex) return;
    if (previous.documentIndex === nextIndex) return;
    transaction.delete(adminDb.collection(DOCUMENTS).doc(previous.documentIndex));
  }
}
