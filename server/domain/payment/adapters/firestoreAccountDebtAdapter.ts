import { adminDb } from '../../../infrastructure/firebase/adminClient';
import type { AccountDebtRepositoryPort } from '../ports/accountDebtRepositoryPort';
import type { AccountDebt } from '../types/accountDebt';

const DEBTS = 'accountDebts';

/** Coleção só de backend (`allow read, write: if false`, AGENTS.md §6.2). */
export class FirestoreAccountDebtAdapter implements AccountDebtRepositoryPort {
  async createIfAbsent(debt: AccountDebt): Promise<AccountDebt> {
    const ref = adminDb.collection(DEBTS).doc(debt.id);
    return adminDb.runTransaction(async (tx) => {
      const snapshot = await tx.get(ref);
      if (snapshot.exists) return snapshot.data() as AccountDebt;
      tx.set(ref, debt);
      return debt;
    });
  }

  async get(id: string): Promise<AccountDebt | null> {
    const snapshot = await adminDb.collection(DEBTS).doc(id).get();
    return snapshot.exists ? (snapshot.data() as AccountDebt) : null;
  }

  async listOpenByAccountKey(accountKey: string): Promise<AccountDebt[]> {
    const snapshot = await adminDb
      .collection(DEBTS)
      .where('accountKey', '==', accountKey)
      .where('status', '==', 'open')
      .orderBy('createdAt', 'asc')
      .limit(50)
      .get();
    return snapshot.docs.map((doc) => doc.data() as AccountDebt);
  }

  async listByAccountKeys(accountKeys: string[], limit: number): Promise<AccountDebt[]> {
    if (accountKeys.length === 0) return [];
    // `in` aceita até 30 valores; um parceiro tem bem menos CNPJs que isso.
    const snapshot = await adminDb
      .collection(DEBTS)
      .where('accountKey', 'in', accountKeys.slice(0, 30))
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .get();
    return snapshot.docs.map((doc) => doc.data() as AccountDebt);
  }

  async listSuspended(limit: number): Promise<AccountDebt[]> {
    const snapshot = await adminDb
      .collection(DEBTS)
      .where('status', '==', 'suspended')
      .orderBy('createdAt', 'asc')
      .limit(limit)
      .get();
    return snapshot.docs.map((doc) => doc.data() as AccountDebt);
  }

  async update(
    id: string,
    change: (current: AccountDebt) => AccountDebt | null
  ): Promise<AccountDebt | null> {
    const ref = adminDb.collection(DEBTS).doc(id);
    return adminDb.runTransaction(async (tx) => {
      const snapshot = await tx.get(ref);
      if (!snapshot.exists) return null;
      const current = snapshot.data() as AccountDebt;
      const next = change(current);
      if (!next) return current;
      tx.set(ref, next);
      return next;
    });
  }
}
