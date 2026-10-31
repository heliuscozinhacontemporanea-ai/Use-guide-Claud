import { adminDb } from '../../../infrastructure/firebase/adminClient';
import {
  TicketOrderPersistenceMapper,
  TicketPersistenceMapper,
  TicketTransferPersistenceMapper,
} from '../dtos/ticketingPersistenceMappers';
import { TicketingDomainError } from '../errors/ticketingDomainError';
import type { Ticket, TicketStatus, TicketTransfer } from '../types/ticketingTypes';

/** Ingressos: leitura, status, transferência e troca de sessão. Coleções só de backend; o cliente lê pela API (§6.2). */
export class FirestoreTicketStore {
  async getTicketById(ticketId: string): Promise<Ticket | null> {
    const snap = await adminDb.collection('tickets').doc(ticketId).get();
    if (!snap.exists) return null;
    return TicketPersistenceMapper.toDomain(
      snap.id,
      (snap.data() || {}) as Record<string, unknown>
    );
  }

  async getTicketByQrTokenHash(qrTokenHash: string): Promise<Ticket | null> {
    const snap = await adminDb
      .collection('tickets')
      .where('qrTokenHash', '==', qrTokenHash)
      .limit(1)
      .get();
    const doc = snap.docs[0];
    if (!doc) return null;
    return TicketPersistenceMapper.toDomain(doc.id, (doc.data() || {}) as Record<string, unknown>);
  }

  async listTicketsByOrderId(orderId: string): Promise<Ticket[]> {
    const snap = await adminDb.collection('tickets').where('orderId', '==', orderId).get();
    return snap.docs.map((doc) =>
      TicketPersistenceMapper.toDomain(doc.id, (doc.data() || {}) as Record<string, unknown>)
    );
  }

  async listTicketsByOwnerUserId(ownerUserId: string): Promise<Ticket[]> {
    const snap = await adminDb.collection('tickets').where('ownerUserId', '==', ownerUserId).get();
    return snap.docs
      .map((doc) =>
        TicketPersistenceMapper.toDomain(doc.id, (doc.data() || {}) as Record<string, unknown>)
      )
      .sort((a, b) => new Date(b.issuedAt).getTime() - new Date(a.issuedAt).getTime());
  }

  async listTicketsByOccurrenceId(occurrenceId: string): Promise<Ticket[]> {
    const snap = await adminDb
      .collection('tickets')
      .where('occurrenceId', '==', occurrenceId)
      .get();
    return snap.docs.map((doc) =>
      TicketPersistenceMapper.toDomain(doc.id, (doc.data() || {}) as Record<string, unknown>)
    );
  }

  async listTicketsByEventListingId(eventListingId: string): Promise<Ticket[]> {
    const snap = await adminDb
      .collection('tickets')
      .where('eventListingId', '==', eventListingId)
      .get();
    return snap.docs.map((doc) =>
      TicketPersistenceMapper.toDomain(doc.id, (doc.data() || {}) as Record<string, unknown>)
    );
  }

  async updateTicketStatus(
    ticketId: string,
    status: TicketStatus,
    extra?: Partial<Ticket>
  ): Promise<Ticket> {
    const ref = adminDb.collection('tickets').doc(ticketId);
    const payload: Record<string, unknown> = {
      ...(extra || {}),
      status,
      // A lista sem internet da portaria baixa só o que mudou desde a última vez (D21).
      updatedAt: new Date().toISOString(),
    };
    delete payload.id;
    await ref.update(payload);
    const snap = await ref.get();
    return TicketPersistenceMapper.toDomain(
      snap.id,
      (snap.data() || {}) as Record<string, unknown>
    );
  }

  async transferTicketAtomic(params: {
    ticketId: string;
    fromUserId: string;
    toUserId?: string;
    recipientEmail: string;
    recipientName?: string;
    newQrTokenHash: string;
  }): Promise<{
    oldTicket: Ticket;
    newTicket: Ticket;
    transfer: TicketTransfer;
  }> {
    return adminDb.runTransaction(async (tx) => {
      const oldTicketRef = adminDb.collection('tickets').doc(params.ticketId);
      const oldSnap = await tx.get(oldTicketRef);
      if (!oldSnap.exists) {
        throw new TicketingDomainError('NOT_FOUND', 'Ingresso não encontrado.');
      }
      const oldTicket = TicketPersistenceMapper.toDomain(
        oldSnap.id,
        (oldSnap.data() || {}) as Record<string, unknown>
      );

      if (oldTicket.ownerUserId !== params.fromUserId) {
        throw new TicketingDomainError(
          'FORBIDDEN',
          'Apenas o titular atual pode transferir este ingresso.'
        );
      }

      if (oldTicket.status !== 'issued') {
        throw new TicketingDomainError(
          'UNPROCESSABLE_ENTITY',
          'Apenas ingressos emitidos e não utilizados podem ser transferidos.'
        );
      }

      const nowIso = new Date().toISOString();
      const expiresAtIso = new Date(Date.now() + 72 * 3600 * 1000).toISOString();
      const nextQrVersion = (oldTicket.qrVersion || 1) + 1;

      tx.update(oldTicketRef, {
        status: 'transferred',
        transferredAt: nowIso,
        qrVersion: nextQrVersion,
        updatedAt: nowIso,
      });

      const newTicketRef = adminDb.collection('tickets').doc();
      const newTicketDoc: Record<string, unknown> = {
        orderId: oldTicket.orderId,
        eventListingId: oldTicket.eventListingId,
        occurrenceId: oldTicket.occurrenceId,
        ticketTypeId: oldTicket.ticketTypeId,
        ownerUserId: params.toUserId || params.fromUserId,
        holderName: params.recipientName || params.recipientEmail.split('@')[0],
        holderEmail: params.recipientEmail,
        qrTokenHash: params.newQrTokenHash,
        qrVersion: nextQrVersion,
        status: 'issued',
        issuedAt: nowIso,
        updatedAt: nowIso,
        ...(oldTicket.ticketTypeSnapshot
          ? { ticketTypeSnapshot: oldTicket.ticketTypeSnapshot }
          : {}),
        ...(oldTicket.eventSnapshot ? { eventSnapshot: oldTicket.eventSnapshot } : {}),
      };
      tx.set(newTicketRef, newTicketDoc);

      const transferRef = adminDb.collection('ticketTransfers').doc();
      const transferDoc: Record<string, unknown> = {
        ticketId: oldTicket.id,
        newTicketId: newTicketRef.id,
        fromUserId: params.fromUserId,
        ...(params.toUserId ? { toUserId: params.toUserId } : {}),
        recipientEmail: params.recipientEmail,
        ...(params.recipientName ? { recipientName: params.recipientName } : {}),
        status: 'completed',
        expiresAt: expiresAtIso,
        createdAt: nowIso,
        completedAt: nowIso,
      };
      tx.set(transferRef, transferDoc);

      return {
        oldTicket: {
          ...oldTicket,
          status: 'transferred',
          transferredAt: nowIso,
          qrVersion: nextQrVersion,
        },
        newTicket: TicketPersistenceMapper.toDomain(newTicketRef.id, newTicketDoc),
        transfer: TicketTransferPersistenceMapper.toDomain(transferRef.id, transferDoc),
      };
    });
  }

  async moveOrdersAndTicketsToOccurrenceAtomic(params: {
    fromOccurrenceId: string;
    toOccurrenceId: string;
    newStartsAt: string;
    newEndsAt: string;
  }): Promise<{ movedOrdersCount: number; movedTicketsCount: number }> {
    return adminDb.runTransaction(async (tx) => {
      const ordersSnap = await tx.get(
        adminDb.collection('ticketOrders').where('occurrenceId', '==', params.fromOccurrenceId)
      );
      const ticketsSnap = await tx.get(
        adminDb.collection('tickets').where('occurrenceId', '==', params.fromOccurrenceId)
      );

      const nowIso = new Date().toISOString();
      let movedOrdersCount = 0;
      let movedTicketsCount = 0;

      for (const orderDoc of ordersSnap.docs) {
        const order = TicketOrderPersistenceMapper.toDomain(
          orderDoc.id,
          (orderDoc.data() || {}) as Record<string, unknown>
        );
        if (
          order.status === 'paid' ||
          order.status === 'partially_refunded' ||
          order.status === 'pending_payment'
        ) {
          tx.update(orderDoc.ref, {
            occurrenceId: params.toOccurrenceId,
            rescheduledAt: nowIso,
            ...(order.eventSnapshot
              ? {
                  eventSnapshot: {
                    ...order.eventSnapshot,
                    startsAt: params.newStartsAt,
                    endsAt: params.newEndsAt,
                  },
                }
              : {}),
            updatedAt: nowIso,
          });
          movedOrdersCount += 1;
        }
      }

      for (const ticketDoc of ticketsSnap.docs) {
        const ticket = TicketPersistenceMapper.toDomain(
          ticketDoc.id,
          (ticketDoc.data() || {}) as Record<string, unknown>
        );
        if (ticket.status === 'issued' || ticket.status === 'reserved') {
          tx.update(ticketDoc.ref, {
            occurrenceId: params.toOccurrenceId,
            updatedAt: nowIso,
            ...(ticket.eventSnapshot
              ? {
                  eventSnapshot: {
                    ...ticket.eventSnapshot,
                    startsAt: params.newStartsAt,
                    endsAt: params.newEndsAt,
                  },
                }
              : {}),
          });
          movedTicketsCount += 1;
        }
      }

      return { movedOrdersCount, movedTicketsCount };
    });
  }

  async listTicketsChangedSince(
    occurrenceId: string,
    sinceIso: string,
    limit: number
  ): Promise<Ticket[]> {
    const snap = await adminDb
      .collection('tickets')
      .where('occurrenceId', '==', occurrenceId)
      .where('updatedAt', '>', sinceIso)
      .orderBy('updatedAt')
      .limit(limit)
      .get();
    return snap.docs.map((doc) =>
      TicketPersistenceMapper.toDomain(doc.id, (doc.data() || {}) as Record<string, unknown>)
    );
  }

  async swapTicketQr(ticketId: string, ownerUid: string, nowIso: string): Promise<Ticket> {
    return adminDb.runTransaction(async (tx) => {
      const ref = adminDb.collection('tickets').doc(ticketId);
      const snap = await tx.get(ref);
      if (!snap.exists) throw new TicketingDomainError('NOT_FOUND', 'Ingresso não encontrado.');
      const ticket = TicketPersistenceMapper.toDomain(
        snap.id,
        (snap.data() || {}) as Record<string, unknown>
      );
      if (ticket.ownerUserId !== ownerUid) {
        throw new TicketingDomainError('FORBIDDEN', 'Apenas o titular pode trocar o QR Code.');
      }
      if (ticket.status !== 'issued') {
        throw new TicketingDomainError(
          'UNPROCESSABLE_ENTITY',
          'Só é possível trocar o QR Code de um ingresso que ainda não foi usado.'
        );
      }
      if (ticket.qrSwappedAt) {
        throw new TicketingDomainError(
          'UNPROCESSABLE_ENTITY',
          'O QR Code deste ingresso já foi trocado uma vez.'
        );
      }
      const qrVersion = (ticket.qrVersion || 1) + 1;
      tx.update(ref, { qrVersion, qrSwappedAt: nowIso, updatedAt: nowIso });
      return { ...ticket, qrVersion, qrSwappedAt: nowIso, updatedAt: nowIso };
    });
  }
}
