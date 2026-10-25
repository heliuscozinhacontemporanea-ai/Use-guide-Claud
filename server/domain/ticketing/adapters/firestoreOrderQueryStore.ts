import { adminDb } from '../../../infrastructure/firebase/adminClient';
import {
  TicketOrderItemPersistenceMapper,
  TicketOrderPersistenceMapper,
} from '../dtos/ticketingPersistenceMappers';
import type { TicketOrder, TicketOrderItem, TicketOrderStatus } from '../types/ticketingTypes';

/** Leitura e status dos pedidos. Coleções só de backend; o cliente lê pela API (§6.2). */
export class FirestoreOrderQueryStore {
  async getOrderById(orderId: string): Promise<TicketOrder | null> {
    const snap = await adminDb.collection('ticketOrders').doc(orderId).get();
    if (!snap.exists) return null;
    return TicketOrderPersistenceMapper.toDomain(
      snap.id,
      (snap.data() || {}) as Record<string, unknown>
    );
  }

  async getOrderByIdempotencyKey(
    buyerId: string,
    idempotencyKey: string
  ): Promise<TicketOrder | null> {
    const snap = await adminDb
      .collection('ticketOrders')
      .where('buyerId', '==', buyerId)
      .where('idempotencyKey', '==', idempotencyKey)
      .limit(1)
      .get();
    const doc = snap.docs[0];
    if (!doc) return null;
    return TicketOrderPersistenceMapper.toDomain(
      doc.id,
      (doc.data() || {}) as Record<string, unknown>
    );
  }

  async listOrderItemsByOrderId(orderId: string): Promise<TicketOrderItem[]> {
    const snap = await adminDb.collection('ticketOrderItems').where('orderId', '==', orderId).get();
    return snap.docs.map((doc) =>
      TicketOrderItemPersistenceMapper.toDomain(
        doc.id,
        (doc.data() || {}) as Record<string, unknown>
      )
    );
  }

  async listOrdersByBuyerId(buyerId: string): Promise<TicketOrder[]> {
    const snap = await adminDb.collection('ticketOrders').where('buyerId', '==', buyerId).get();
    return snap.docs
      .map((doc) =>
        TicketOrderPersistenceMapper.toDomain(doc.id, (doc.data() || {}) as Record<string, unknown>)
      )
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async listOrdersByOccurrenceId(occurrenceId: string): Promise<TicketOrder[]> {
    const snap = await adminDb
      .collection('ticketOrders')
      .where('occurrenceId', '==', occurrenceId)
      .get();
    return snap.docs
      .map((doc) =>
        TicketOrderPersistenceMapper.toDomain(doc.id, (doc.data() || {}) as Record<string, unknown>)
      )
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async listOrdersByEventListingId(eventListingId: string): Promise<TicketOrder[]> {
    const snap = await adminDb
      .collection('ticketOrders')
      .where('eventListingId', '==', eventListingId)
      .get();
    return snap.docs
      .map((doc) =>
        TicketOrderPersistenceMapper.toDomain(doc.id, (doc.data() || {}) as Record<string, unknown>)
      )
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async listExpiredPendingOrders(nowIso: string): Promise<TicketOrder[]> {
    const snap = await adminDb
      .collection('ticketOrders')
      .where('status', '==', 'pending_payment')
      .get();
    const nowMs = new Date(nowIso).getTime();
    return snap.docs
      .map((doc) =>
        TicketOrderPersistenceMapper.toDomain(doc.id, (doc.data() || {}) as Record<string, unknown>)
      )
      .filter((o) => o.expiresAt && new Date(o.expiresAt).getTime() <= nowMs);
  }

  async updateOrderStatus(
    orderId: string,
    status: TicketOrderStatus,
    extra?: Partial<TicketOrder>
  ): Promise<TicketOrder> {
    const ref = adminDb.collection('ticketOrders').doc(orderId);
    const payload: Record<string, unknown> = {
      ...(extra || {}),
      status,
      updatedAt: new Date().toISOString(),
    };
    delete payload.id;
    await ref.update(payload);
    const snap = await ref.get();
    return TicketOrderPersistenceMapper.toDomain(
      snap.id,
      (snap.data() || {}) as Record<string, unknown>
    );
  }
}
