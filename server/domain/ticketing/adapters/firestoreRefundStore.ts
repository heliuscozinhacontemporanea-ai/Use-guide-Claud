import { adminDb } from '../../../infrastructure/firebase/adminClient';
import {
  RefundPersistenceMapper,
  TicketOrderPersistenceMapper,
  TicketPersistenceMapper,
  TicketTypePersistenceMapper,
} from '../dtos/ticketingPersistenceMappers';
import {
  OrderNotFoundError,
  RefundNotAllowedError,
  TicketingDomainError,
} from '../errors/ticketingDomainError';
import type { Refund, RefundStatus } from '../types/ticketingTypes';

/** Reembolsos. Coleções só de backend; o cliente lê pela API (§6.2). */
export class FirestoreRefundStore {
  async createRefundAtomic(params: {
    orderId: string;
    ticketId?: string;
    amountMinor: number;
    serviceFeeMinor: number;
    requestedBy: Refund['requestedBy'];
    reason: string;
    idempotencyKey: string;
  }): Promise<{ refund: Refund; isReplay: boolean }> {
    const existingSnap = await adminDb
      .collection('ticketRefunds')
      .where('orderId', '==', params.orderId)
      .where('idempotencyKey', '==', params.idempotencyKey)
      .limit(1)
      .get();
    const existingDoc = existingSnap.docs[0];
    if (existingDoc) {
      return {
        refund: RefundPersistenceMapper.toDomain(
          existingDoc.id,
          (existingDoc.data() || {}) as Record<string, unknown>
        ),
        isReplay: true,
      };
    }

    return adminDb.runTransaction(async (tx) => {
      const orderRef = adminDb.collection('ticketOrders').doc(params.orderId);
      const orderSnap = await tx.get(orderRef);
      if (!orderSnap.exists) {
        throw new OrderNotFoundError();
      }
      const order = TicketOrderPersistenceMapper.toDomain(
        orderSnap.id,
        (orderSnap.data() || {}) as Record<string, unknown>
      );

      if (order.status === 'refunded') {
        throw new RefundNotAllowedError('Este pedido já foi reembolsado.');
      }

      const ticketsSnap = await tx.get(
        adminDb.collection('tickets').where('orderId', '==', params.orderId)
      );
      const tickets = ticketsSnap.docs.map((doc) => ({
        ref: doc.ref,
        domain: TicketPersistenceMapper.toDomain(
          doc.id,
          (doc.data() || {}) as Record<string, unknown>
        ),
      }));

      for (const { ref, domain } of tickets) {
        if (params.ticketId && domain.id !== params.ticketId) continue;
        if (domain.status === 'checked_in') {
          throw new RefundNotAllowedError(
            'Ingresso já utilizado no check-in não pode ser reembolsado.'
          );
        }
        if (domain.status === 'refunded' || domain.status === 'refund_pending') {
          throw new RefundNotAllowedError(
            'Reembolso já solicitado ou concluído para este ingresso.'
          );
        }
        tx.update(ref, {
          status: order.totalMinor === 0 ? 'refunded' : 'refund_pending',
          updatedAt: new Date().toISOString(),
        });
      }

      const nowIso = new Date().toISOString();
      const refundRef = adminDb.collection('ticketRefunds').doc();
      const initialStatus: RefundStatus = order.totalMinor === 0 ? 'approved' : 'pending_provider';
      const refundDoc: Record<string, unknown> = {
        orderId: params.orderId,
        eventListingId: order.eventListingId,
        ...(params.ticketId ? { ticketId: params.ticketId } : {}),
        amountMinor: params.amountMinor,
        serviceFeeMinor: params.serviceFeeMinor,
        requestedBy: params.requestedBy,
        reason: params.reason,
        status: initialStatus,
        provider: 'stripe',
        providerRefundId: null,
        idempotencyKey: params.idempotencyKey,
        createdAt: nowIso,
        ...(order.totalMinor === 0 ? { completedAt: nowIso } : {}),
      };
      tx.set(refundRef, refundDoc);

      if (order.totalMinor === 0) {
        tx.update(orderRef, {
          status: 'refunded',
          updatedAt: nowIso,
        });
      }

      return {
        refund: RefundPersistenceMapper.toDomain(refundRef.id, refundDoc),
        isReplay: false,
      };
    });
  }

  async updateRefundStatus(
    refundId: string,
    status: RefundStatus,
    providerRefundId?: string | null
  ): Promise<Refund> {
    return adminDb.runTransaction(async (tx) => {
      const refundRef = adminDb.collection('ticketRefunds').doc(refundId);
      const refundSnap = await tx.get(refundRef);
      if (!refundSnap.exists) {
        throw new TicketingDomainError('NOT_FOUND', 'Solicitação de reembolso não encontrada.');
      }
      const refund = RefundPersistenceMapper.toDomain(
        refundSnap.id,
        (refundSnap.data() || {}) as Record<string, unknown>
      );

      // Idempotência: se o reembolso já atingiu estado aprovado ou já está no mesmo status
      // (com o mesmo providerRefundId), encerra sem duplicar efeitos colaterais (estoque/pedido).
      if (
        refund.status === 'approved' ||
        (refund.status === status &&
          (providerRefundId === undefined || providerRefundId === refund.providerRefundId))
      ) {
        return refund;
      }

      const nowIso = new Date().toISOString();
      const patch: Record<string, unknown> = {
        status,
        ...(providerRefundId !== undefined ? { providerRefundId } : {}),
        ...(status === 'approved' ? { completedAt: nowIso } : {}),
      };

      if (status === 'approved') {
        const orderRef = adminDb.collection('ticketOrders').doc(refund.orderId);
        const ticketsSnap = await tx.get(
          adminDb.collection('tickets').where('orderId', '==', refund.orderId)
        );

        const targetTicketDocs = ticketsSnap.docs.filter((doc) => {
          if (refund.ticketId && doc.id !== refund.ticketId) return false;
          const tData = TicketPersistenceMapper.toDomain(
            doc.id,
            (doc.data() || {}) as Record<string, unknown>
          );
          return tData.status !== 'refunded';
        });

        // Firestore exige todas as leituras antes de qualquer escrita na transação
        const decrementByTypeId = new Map<string, number>();
        for (const doc of targetTicketDocs) {
          const tData = TicketPersistenceMapper.toDomain(
            doc.id,
            (doc.data() || {}) as Record<string, unknown>
          );
          decrementByTypeId.set(
            tData.ticketTypeId,
            (decrementByTypeId.get(tData.ticketTypeId) || 0) + 1
          );
        }

        const typeUpdates: Array<{
          ref: FirebaseFirestore.DocumentReference;
          newSoldCount: number;
        }> = [];
        for (const [ticketTypeId, decrementCount] of decrementByTypeId.entries()) {
          const typeRef = adminDb.collection('ticketTypes').doc(ticketTypeId);
          const typeSnap = await tx.get(typeRef);
          if (typeSnap.exists) {
            const typeDomain = TicketTypePersistenceMapper.toDomain(
              typeSnap.id,
              (typeSnap.data() || {}) as Record<string, unknown>
            );
            typeUpdates.push({
              ref: typeRef,
              newSoldCount: Math.max(0, typeDomain.soldCount - decrementCount),
            });
          }
        }

        tx.update(refundRef, patch);
        tx.update(orderRef, {
          status: refund.ticketId ? 'partially_refunded' : 'refunded',
          updatedAt: nowIso,
        });

        for (const doc of targetTicketDocs) {
          tx.update(doc.ref, { status: 'refunded', updatedAt: nowIso });
        }

        for (const typeUpdate of typeUpdates) {
          tx.update(typeUpdate.ref, {
            soldCount: typeUpdate.newSoldCount,
            updatedAt: nowIso,
          });
        }
      } else if (status === 'failed') {
        const ticketsSnap = await tx.get(
          adminDb.collection('tickets').where('orderId', '==', refund.orderId)
        );
        const pendingTicketDocs = ticketsSnap.docs.filter((doc) => {
          if (refund.ticketId && doc.id !== refund.ticketId) return false;
          const tData = TicketPersistenceMapper.toDomain(
            doc.id,
            (doc.data() || {}) as Record<string, unknown>
          );
          return tData.status === 'refund_pending';
        });

        tx.update(refundRef, patch);
        for (const doc of pendingTicketDocs) {
          tx.update(doc.ref, { status: 'issued', updatedAt: new Date().toISOString() });
        }
      } else {
        tx.update(refundRef, patch);
      }

      return {
        ...refund,
        status,
        providerRefundId:
          providerRefundId !== undefined ? providerRefundId : refund.providerRefundId,
        completedAt: status === 'approved' ? nowIso : refund.completedAt,
      };
    });
  }

  async getRefundById(refundId: string): Promise<Refund | null> {
    const snap = await adminDb.collection('ticketRefunds').doc(refundId).get();
    if (!snap.exists) return null;
    return RefundPersistenceMapper.toDomain(
      snap.id,
      (snap.data() || {}) as Record<string, unknown>
    );
  }

  async listRefundsByOrderId(orderId: string): Promise<Refund[]> {
    const snap = await adminDb.collection('ticketRefunds').where('orderId', '==', orderId).get();
    return snap.docs.map((doc) =>
      RefundPersistenceMapper.toDomain(doc.id, (doc.data() || {}) as Record<string, unknown>)
    );
  }

  async listRefundsByEventListingId(eventListingId: string): Promise<Refund[]> {
    const snap = await adminDb
      .collection('ticketRefunds')
      .where('eventListingId', '==', eventListingId)
      .get();
    return snap.docs.map((doc) =>
      RefundPersistenceMapper.toDomain(doc.id, (doc.data() || {}) as Record<string, unknown>)
    );
  }
}
