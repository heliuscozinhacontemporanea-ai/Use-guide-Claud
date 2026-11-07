import { adminDb } from '../../../infrastructure/firebase/adminClient';
import {
  TicketOrderPersistenceMapper,
  TicketPersistenceMapper,
} from '../dtos/ticketingPersistenceMappers';
import type { OrderReportPort } from '../ports/orderReportPort';
import type { Ticket, TicketOrder } from '../types/ticketingTypes';

// Limite do operador `in` do Firestore.
const IN_LIMIT = 30;

/** Pedidos e ingressos em lote, para Relatórios. Coleções só de backend (§6.2). */
export class FirestoreOrderReportStore implements OrderReportPort {
  async getOrders(orderIds: string[]): Promise<TicketOrder[]> {
    const out: TicketOrder[] = [];
    for (let i = 0; i < orderIds.length; i += 100) {
      const refs = orderIds
        .slice(i, i + 100)
        .map((id) => adminDb.collection('ticketOrders').doc(id));
      if (refs.length === 0) continue;
      for (const snapshot of await adminDb.getAll(...refs)) {
        if (snapshot.exists) {
          out.push(TicketOrderPersistenceMapper.toDomain(snapshot.id, snapshot.data() ?? {}));
        }
      }
    }
    return out;
  }

  async listTicketsByOrderIds(orderIds: string[]): Promise<Ticket[]> {
    const out: Ticket[] = [];
    for (let i = 0; i < orderIds.length; i += IN_LIMIT) {
      const chunk = orderIds.slice(i, i + IN_LIMIT);
      if (chunk.length === 0) continue;
      const snap = await adminDb.collection('tickets').where('orderId', 'in', chunk).get();
      for (const doc of snap.docs) out.push(TicketPersistenceMapper.toDomain(doc.id, doc.data()));
    }
    return out;
  }
}
