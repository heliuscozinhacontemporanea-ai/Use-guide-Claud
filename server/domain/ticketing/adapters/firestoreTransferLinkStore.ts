import { FieldValue } from 'firebase-admin/firestore';
import { adminDb } from '../../../infrastructure/firebase/adminClient';
import { TicketingDomainError } from '../errors/ticketingDomainError';
import type { TicketTransferLink } from '../types/ticketingTypes';

const LINKS = 'ticketTransferLinks';

function toLink(id: string, raw: Record<string, unknown>): TicketTransferLink {
  const from = (raw.receivedFrom ?? {}) as { username?: unknown; displayName?: unknown };
  return {
    id,
    ticketId: String(raw.ticketId ?? ''),
    fromUserId: String(raw.fromUserId ?? ''),
    tokenHash: String(raw.tokenHash ?? ''),
    status: raw.status === 'accepted' || raw.status === 'canceled' ? raw.status : 'pending',
    expiresAt: String(raw.expiresAt ?? ''),
    createdAt: String(raw.createdAt ?? ''),
    receivedFrom: {
      username: typeof from.username === 'string' ? from.username : null,
      displayName: typeof from.displayName === 'string' ? from.displayName : null,
    },
    ...(typeof raw.acceptedBy === 'string' ? { acceptedBy: raw.acceptedBy } : {}),
    ...(typeof raw.acceptedAt === 'string' ? { acceptedAt: raw.acceptedAt } : {}),
  };
}

/** Links de transferência (D21): coleção só do backend; o código do link fica só como HMAC. */
export class FirestoreTransferLinkStore {
  async createTransferLink(link: Omit<TicketTransferLink, 'id'>): Promise<TicketTransferLink> {
    const pending = await adminDb
      .collection(LINKS)
      .where('ticketId', '==', link.ticketId)
      .where('status', '==', 'pending')
      .get();
    const ref = adminDb.collection(LINKS).doc();
    await adminDb.runTransaction(async (tx) => {
      for (const doc of pending.docs) tx.update(doc.ref, { status: 'canceled' });
      tx.set(ref, link);
      tx.update(adminDb.collection('tickets').doc(link.ticketId), {
        transferLinkExpiresAt: link.expiresAt,
        updatedAt: link.createdAt,
      });
    });
    return { ...link, id: ref.id };
  }

  async getTransferLink(linkId: string): Promise<TicketTransferLink | null> {
    const snap = await adminDb.collection(LINKS).doc(linkId).get();
    return snap.exists ? toLink(snap.id, (snap.data() ?? {}) as Record<string, unknown>) : null;
  }

  async claimTransferLink(
    linkId: string,
    acceptorUid: string,
    nowIso: string
  ): Promise<TicketTransferLink> {
    return adminDb.runTransaction(async (tx) => {
      const ref = adminDb.collection(LINKS).doc(linkId);
      const snap = await tx.get(ref);
      if (!snap.exists) {
        throw new TicketingDomainError('TRANSFER_LINK_INVALID', 'Link de transferência inválido.');
      }
      const link = toLink(snap.id, (snap.data() ?? {}) as Record<string, unknown>);
      if (link.status !== 'pending') {
        throw new TicketingDomainError(
          'TRANSFER_LINK_INVALID',
          'Este link já foi usado ou cancelado.'
        );
      }
      if (link.expiresAt <= nowIso) {
        throw new TicketingDomainError('TRANSFER_LINK_EXPIRED', 'Este link venceu.');
      }
      tx.update(ref, { status: 'accepted', acceptedBy: acceptorUid, acceptedAt: nowIso });
      return { ...link, status: 'accepted', acceptedBy: acceptorUid, acceptedAt: nowIso };
    });
  }

  async releaseTransferLink(linkId: string): Promise<void> {
    await adminDb.collection(LINKS).doc(linkId).update({
      status: 'pending',
      acceptedBy: FieldValue.delete(),
      acceptedAt: FieldValue.delete(),
    });
  }

  async cancelTransferLinksForTicket(ticketId: string, ownerUid: string): Promise<void> {
    const pending = await adminDb
      .collection(LINKS)
      .where('ticketId', '==', ticketId)
      .where('fromUserId', '==', ownerUid)
      .where('status', '==', 'pending')
      .get();
    const batch = adminDb.batch();
    for (const doc of pending.docs) batch.update(doc.ref, { status: 'canceled' });
    batch.update(adminDb.collection('tickets').doc(ticketId), {
      transferLinkExpiresAt: FieldValue.delete(),
      updatedAt: new Date().toISOString(),
    });
    await batch.commit();
  }
}
