import type { DocumentReference, Transaction } from 'firebase-admin/firestore';
import { adminDb } from '../../../infrastructure/firebase/adminClient';
import { CourtesyError } from '../errors/courtesyError';
import type {
  ClaimCourtesyLinkInput,
  CourtesyStorePort,
  IssueCourtesyInput,
} from '../ports/courtesyStorePort';
import {
  type CourtesyGuest,
  type CourtesyTicketDraft,
  courtesyTicketTypeId,
  type EventCourtesy,
} from '../types/courtesyTypes';

// Coleções só do backend (rules `if false`); o organizador lê pela API (§6.2).
const COURTESIES = 'eventCourtesies';
// Trava de uma cortesia por pessoa por evento: ID fixo, criado na mesma transação.
const GUEST_LOCKS = 'eventCourtesyGuests';

function str(value: unknown): string | null {
  return typeof value === 'string' && value ? value : null;
}

function toGuest(raw: unknown): CourtesyGuest | null {
  if (!raw || typeof raw !== 'object') return null;
  const guest = raw as Record<string, unknown>;
  const uid = str(guest.uid);
  return uid ? { uid, username: str(guest.username), displayName: str(guest.displayName) } : null;
}

function toCourtesy(id: string, raw: Record<string, unknown>): EventCourtesy {
  return {
    id,
    eventListingId: String(raw.eventListingId ?? ''),
    occurrenceId: String(raw.occurrenceId ?? ''),
    invitedBy: String(raw.invitedBy ?? ''),
    channel: raw.channel === 'link' ? 'link' : 'username',
    status: raw.status === 'pending_link' || raw.status === 'canceled' ? raw.status : 'issued',
    guest: toGuest(raw.guest),
    ticketId: str(raw.ticketId),
    linkTokenHash: str(raw.linkTokenHash),
    linkExpiresAt: str(raw.linkExpiresAt),
    createdAt: String(raw.createdAt ?? ''),
    updatedAt: String(raw.updatedAt ?? ''),
    claimedAt: str(raw.claimedAt),
    canceledAt: str(raw.canceledAt),
  };
}

function lockRef(eventListingId: string, uid: string): DocumentReference {
  return adminDb.collection(GUEST_LOCKS).doc(`${eventListingId}__${uid}`);
}

async function assertGuestFree(tx: Transaction, ref: DocumentReference): Promise<void> {
  if ((await tx.get(ref)).exists) {
    throw new CourtesyError('COURTESY_ALREADY_GIVEN', 'Esta pessoa já tem cortesia neste evento.');
  }
}

function writeTicket(
  tx: Transaction,
  params: {
    courtesyId: string;
    eventListingId: string;
    occurrenceId: string;
    guest: CourtesyGuest;
    ticket: CourtesyTicketDraft;
    nowIso: string;
  }
): string {
  const ref = adminDb.collection('tickets').doc();
  // O ID da cortesia ocupa o lugar do pedido: não há pedido, pagamento nem reembolso.
  tx.set(ref, {
    orderId: params.courtesyId,
    courtesyId: params.courtesyId,
    eventListingId: params.eventListingId,
    occurrenceId: params.occurrenceId,
    ticketTypeId: courtesyTicketTypeId(params.occurrenceId),
    ownerUserId: params.guest.uid,
    holderName: params.ticket.holderName,
    holderEmail: params.ticket.holderEmail,
    qrTokenHash: params.ticket.qrTokenHash,
    qrVersion: 1,
    status: 'issued',
    issuedAt: params.nowIso,
    updatedAt: params.nowIso,
    ticketTypeSnapshot: { name: 'Cortesia', kind: 'courtesy', unitPriceMinor: 0 },
    eventSnapshot: params.ticket.eventSnapshot,
  });
  return ref.id;
}

/** Cortesias em Firestore (D27), com o lugar contado no lote oculto da sessão. */
export class FirestoreCourtesyStore implements CourtesyStorePort {
  issue(input: IssueCourtesyInput): Promise<EventCourtesy> {
    return adminDb.runTransaction(async (tx) => {
      const types = await tx.get(
        adminDb.collection('ticketTypes').where('occurrenceId', '==', input.occurrenceId)
      );
      const lock = input.guest ? lockRef(input.eventListingId, input.guest.uid) : null;
      if (lock) await assertGuestFree(tx, lock);

      let committed = 0;
      let courtesySold = 0;
      const typeId = courtesyTicketTypeId(input.occurrenceId);
      for (const doc of types.docs) {
        const data = doc.data();
        const sold = Number(data.soldCount ?? 0);
        committed += sold + Number(data.reservedCount ?? 0);
        if (doc.id === typeId) courtesySold = sold;
      }
      if (committed + 1 > input.occurrenceCapacity) {
        throw new CourtesyError('COURTESY_SOLD_OUT', 'Não há mais lugares nesta sessão.');
      }

      const typeRef = adminDb.collection('ticketTypes').doc(typeId);
      // Pausado: o lote nunca aparece nem é vendido; só conta o lugar na capacidade.
      tx.set(
        typeRef,
        {
          occurrenceId: input.occurrenceId,
          eventListingId: input.eventListingId,
          name: 'Cortesia',
          kind: 'courtesy',
          priceMinor: 0,
          currency: 'BRL',
          quantity: input.occurrenceCapacity,
          soldCount: courtesySold + 1,
          reservedCount: 0,
          minPerOrder: 1,
          maxPerOrder: 1,
          status: 'paused',
          visibility: 'hidden',
          sortOrder: 9999,
          updatedAt: input.nowIso,
          ...(types.docs.some((doc) => doc.id === typeId) ? {} : { createdAt: input.nowIso }),
        },
        { merge: true }
      );

      const ref = adminDb.collection(COURTESIES).doc();
      const ticketId =
        input.guest && input.ticket
          ? writeTicket(tx, {
              courtesyId: ref.id,
              eventListingId: input.eventListingId,
              occurrenceId: input.occurrenceId,
              guest: input.guest,
              ticket: input.ticket,
              nowIso: input.nowIso,
            })
          : null;
      if (lock) tx.set(lock, { courtesyId: ref.id, createdAt: input.nowIso });

      const doc = {
        eventListingId: input.eventListingId,
        occurrenceId: input.occurrenceId,
        invitedBy: input.invitedBy,
        channel: input.channel,
        status: input.guest ? 'issued' : 'pending_link',
        guest: input.guest,
        ticketId,
        linkTokenHash: input.linkTokenHash,
        linkExpiresAt: input.linkExpiresAt,
        createdAt: input.nowIso,
        updatedAt: input.nowIso,
        claimedAt: input.guest ? input.nowIso : null,
        canceledAt: null,
      };
      tx.set(ref, doc);
      return toCourtesy(ref.id, doc);
    });
  }

  claimLink(input: ClaimCourtesyLinkInput): Promise<EventCourtesy> {
    return adminDb.runTransaction(async (tx) => {
      const ref = adminDb.collection(COURTESIES).doc(input.courtesyId);
      const snap = await tx.get(ref);
      const current = snap.exists ? toCourtesy(snap.id, snap.data() ?? {}) : null;
      if (current?.status !== 'pending_link') {
        throw new CourtesyError('COURTESY_LINK_INVALID', 'Este convite já foi usado ou cancelado.');
      }
      const lock = lockRef(current.eventListingId, input.guest.uid);
      await assertGuestFree(tx, lock);

      const ticketId = writeTicket(tx, {
        courtesyId: current.id,
        eventListingId: current.eventListingId,
        occurrenceId: current.occurrenceId,
        guest: input.guest,
        ticket: input.ticket,
        nowIso: input.nowIso,
      });
      tx.set(lock, { courtesyId: current.id, createdAt: input.nowIso });
      // O código do link deixa de existir: depois de usado, não vale de novo.
      const patch = {
        status: 'issued',
        guest: input.guest,
        ticketId,
        linkTokenHash: null,
        claimedAt: input.nowIso,
        updatedAt: input.nowIso,
      };
      tx.update(ref, patch);
      return { ...current, ...patch, status: 'issued' };
    });
  }

  cancel(courtesyId: string, nowIso: string): Promise<EventCourtesy> {
    return adminDb.runTransaction(async (tx) => {
      const ref = adminDb.collection(COURTESIES).doc(courtesyId);
      const snap = await tx.get(ref);
      if (!snap.exists) {
        throw new CourtesyError('COURTESY_NOT_FOUND', 'Cortesia não encontrada.');
      }
      const current = toCourtesy(snap.id, snap.data() ?? {});
      if (current.status === 'canceled') return current;

      const typeRef = adminDb
        .collection('ticketTypes')
        .doc(courtesyTicketTypeId(current.occurrenceId));
      const typeSnap = await tx.get(typeRef);
      const ticketRef = current.ticketId
        ? adminDb.collection('tickets').doc(current.ticketId)
        : null;
      const ticketSnap = ticketRef ? await tx.get(ticketRef) : null;
      if (ticketSnap?.data()?.status === 'checked_in') {
        throw new CourtesyError('COURTESY_ALREADY_USED', 'A pessoa já entrou com esta cortesia.');
      }

      // Cancelar o ingresso muda o `updatedAt`: a lista sem internet da portaria baixa a mudança.
      if (ticketRef && ticketSnap?.exists) {
        tx.update(ticketRef, { status: 'canceled', updatedAt: nowIso });
      }
      if (current.guest) tx.delete(lockRef(current.eventListingId, current.guest.uid));
      if (typeSnap.exists) {
        const sold = Number(typeSnap.data()?.soldCount ?? 0);
        tx.update(typeRef, { soldCount: Math.max(0, sold - 1), updatedAt: nowIso });
      }
      const patch = {
        status: 'canceled',
        linkTokenHash: null,
        canceledAt: nowIso,
        updatedAt: nowIso,
      };
      tx.update(ref, patch);
      return { ...current, ...patch, status: 'canceled' };
    });
  }

  async get(courtesyId: string): Promise<EventCourtesy | null> {
    const snap = await adminDb.collection(COURTESIES).doc(courtesyId).get();
    return snap.exists ? toCourtesy(snap.id, snap.data() ?? {}) : null;
  }

  async listByEvent(eventListingId: string, limit: number): Promise<EventCourtesy[]> {
    const snap = await adminDb
      .collection(COURTESIES)
      .where('eventListingId', '==', eventListingId)
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .get();
    return snap.docs.map((doc) => toCourtesy(doc.id, doc.data()));
  }

  async countHeldByOccurrence(occurrenceId: string): Promise<number> {
    const snap = await adminDb
      .collection('ticketTypes')
      .doc(courtesyTicketTypeId(occurrenceId))
      .get();
    return snap.exists ? Number(snap.data()?.soldCount ?? 0) : 0;
  }

  async anonymizeGuest(uid: string): Promise<number> {
    const snap = await adminDb.collection(COURTESIES).where('guest.uid', '==', uid).get();
    if (snap.empty) return 0;
    const batch = adminDb.batch();
    for (const doc of snap.docs) {
      batch.update(doc.ref, { 'guest.username': null, 'guest.displayName': null });
    }
    await batch.commit();
    return snap.size;
  }
}
