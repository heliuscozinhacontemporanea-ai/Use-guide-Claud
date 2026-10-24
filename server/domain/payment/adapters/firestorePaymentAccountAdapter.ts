import type { DocumentData } from 'firebase-admin/firestore';
import { adminDb } from '../../../infrastructure/firebase/adminClient';
import type { PaymentAccountRepositoryPort } from '../ports/paymentAccountRepositoryPort';
import type { PaymentAccountRecord } from '../types/paymentAccount';

const ACCOUNTS = 'paymentAccounts';

function toRecord(data: DocumentData): PaymentAccountRecord {
  return data as PaymentAccountRecord;
}

/** Coleção só de backend (`allow read, write: if false`): o parceiro vê o status pela API (§6.2). */
export class FirestorePaymentAccountAdapter implements PaymentAccountRepositoryPort {
  async get(accountKey: string): Promise<PaymentAccountRecord | null> {
    const snapshot = await adminDb.collection(ACCOUNTS).doc(accountKey).get();
    return snapshot.exists ? toRecord(snapshot.data() as DocumentData) : null;
  }

  async getByStripeAccountId(stripeAccountId: string): Promise<PaymentAccountRecord | null> {
    const snapshot = await adminDb
      .collection(ACCOUNTS)
      .where('stripeAccountId', '==', stripeAccountId)
      .limit(1)
      .get();
    const doc = snapshot.docs[0];
    return doc ? toRecord(doc.data()) : null;
  }

  async listByOwner(ownerUid: string): Promise<PaymentAccountRecord[]> {
    const snapshot = await adminDb.collection(ACCOUNTS).where('ownerUid', '==', ownerUid).get();
    return snapshot.docs.map((doc) => toRecord(doc.data()));
  }

  async save(record: PaymentAccountRecord): Promise<void> {
    await adminDb.collection(ACCOUNTS).doc(record.accountKey).set(record);
  }
}
