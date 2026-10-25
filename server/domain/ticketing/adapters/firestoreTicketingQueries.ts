import { adminDb } from '../../../infrastructure/firebase/adminClient';
import {
  TicketOrderItemPersistenceMapper,
  TicketOrderPersistenceMapper,
  TicketPersistenceMapper,
} from '../dtos/ticketingPersistenceMappers';
import type { Ticket, TicketOrder, TicketOrderItem } from '../types/ticketingTypes';

/** Consultas usadas por mais de um store do ticketing. */
export async function getOrderByIdempotencyKey(
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

export async function listOrderItemsByOrderId(orderId: string): Promise<TicketOrderItem[]> {
  const snap = await adminDb.collection('ticketOrderItems').where('orderId', '==', orderId).get();
  return snap.docs.map((doc) =>
    TicketOrderItemPersistenceMapper.toDomain(doc.id, (doc.data() || {}) as Record<string, unknown>)
  );
}

export async function listTicketsByOrderId(orderId: string): Promise<Ticket[]> {
  const snap = await adminDb.collection('tickets').where('orderId', '==', orderId).get();
  return snap.docs.map((doc) =>
    TicketPersistenceMapper.toDomain(doc.id, (doc.data() || {}) as Record<string, unknown>)
  );
}
