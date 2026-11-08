import { FieldValue } from 'firebase-admin/firestore';
import type { DocumentReference, WriteBatch } from 'firebase-admin/firestore';
import { adminDb } from '../../../infrastructure/firebase/adminClient';

// Limite do Firestore por lote de escrita.
const BATCH_LIMIT = 500;

async function writeInBatches(
  refs: DocumentReference[],
  apply: (batch: WriteBatch, ref: DocumentReference) => void
): Promise<void> {
  for (let start = 0; start < refs.length; start += BATCH_LIMIT) {
    const batch = adminDb.batch();
    for (const ref of refs.slice(start, start + BATCH_LIMIT)) apply(batch, ref);
    await batch.commit();
  }
}

async function refsWhere(collection: string, field: string, uid: string) {
  const snap = await adminDb.collection(collection).where(field, '==', uid).get();
  return snap.docs.map((doc) => doc.ref);
}

/** Exclusão de conta no ticketing (§7.5): tira o dado pessoal e mantém o registro financeiro. */
export class FirestoreTicketPrivacyStore {
  async anonymizeUser(uid: string): Promise<{
    orders: number;
    tickets: number;
    transfers: number;
    waitlist: number;
  }> {
    const at = new Date().toISOString();
    const [orders, tickets, transfers, waitlist, links] = await Promise.all([
      refsWhere('ticketOrders', 'buyerId', uid),
      refsWhere('tickets', 'ownerUserId', uid),
      refsWhere('ticketTransfers', 'toUserId', uid),
      refsWhere('eventWaitlistEntries', 'userId', uid),
      refsWhere('ticketTransferLinks', 'fromUserId', uid),
    ]);
    await writeInBatches(orders, (batch, ref) =>
      batch.update(ref, { buyerSnapshot: { name: '', email: '' }, anonymizedAt: at })
    );
    await writeInBatches(tickets, (batch, ref) =>
      batch.update(ref, { holderName: '', holderEmail: '', anonymizedAt: at })
    );
    await writeInBatches(transfers, (batch, ref) =>
      batch.update(ref, {
        recipientEmail: '',
        recipientName: FieldValue.delete(),
        anonymizedAt: at,
      })
    );
    await writeInBatches(waitlist, (batch, ref) => batch.delete(ref));
    // Links guardam o @ e o nome de quem enviou: sem uso depois da exclusão (D21).
    await writeInBatches(links, (batch, ref) => batch.delete(ref));
    return {
      orders: orders.length,
      tickets: tickets.length,
      transfers: transfers.length,
      waitlist: waitlist.length,
    };
  }
}
