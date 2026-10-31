import { adminDb } from '../../../infrastructure/firebase/adminClient';
import {
  InventoryReservationPersistenceMapper,
  TicketOrderPersistenceMapper,
  TicketPersistenceMapper,
  TicketTypePersistenceMapper,
} from '../dtos/ticketingPersistenceMappers';
import { OrderNotFoundError } from '../errors/ticketingDomainError';
import type { Ticket, TicketOrder, TicketType } from '../types/ticketingTypes';

/** Confirmação do pagamento (emite os ingressos) e expiração do pedido (libera o estoque), em transação. Coleções só de backend; o cliente lê pela API (§6.2). */
export class FirestoreOrderPaymentStore {
  async confirmOrderPaymentAndIssueTicketsAtomic(params: {
    orderId: string;
    paymentId?: string;
    paymentIntentId?: string;
    ticketsToIssue: Array<{
      orderItemId: string;
      ticketTypeId: string;
      holderName: string;
      holderEmail: string;
      qrTokenHash: string;
      ticketTypeSnapshot: {
        name: string;
        kind: TicketType['kind'];
        unitPriceMinor: number;
        effectivePaidMinor?: number;
      };
    }>;
  }): Promise<{
    order: TicketOrder;
    tickets: Ticket[];
    alreadyPaid: boolean;
  }> {
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

      const existingTicketsSnap = await tx.get(
        adminDb.collection('tickets').where('orderId', '==', params.orderId)
      );

      if (order.status === 'paid' && !existingTicketsSnap.empty) {
        return {
          order,
          tickets: existingTicketsSnap.docs.map((doc) =>
            TicketPersistenceMapper.toDomain(doc.id, (doc.data() || {}) as Record<string, unknown>)
          ),
          alreadyPaid: true,
        };
      }

      const reservationsSnap = await tx.get(
        adminDb
          .collection('inventoryReservations')
          .where('orderId', '==', params.orderId)
          .where('status', '==', 'active')
      );

      const nowIso = new Date().toISOString();

      for (const resDoc of reservationsSnap.docs) {
        const res = InventoryReservationPersistenceMapper.toDomain(
          resDoc.id,
          (resDoc.data() || {}) as Record<string, unknown>
        );
        const typeRef = adminDb.collection('ticketTypes').doc(res.ticketTypeId);
        const typeSnap = await tx.get(typeRef);
        if (typeSnap.exists) {
          const tData = TicketTypePersistenceMapper.toDomain(
            typeSnap.id,
            (typeSnap.data() || {}) as Record<string, unknown>
          );
          tx.update(typeRef, {
            reservedCount: Math.max(0, tData.reservedCount - res.quantity),
            soldCount: tData.soldCount + res.quantity,
            updatedAt: nowIso,
          });
        }
        tx.update(resDoc.ref, {
          status: 'consumed',
          releasedAt: nowIso,
        });
      }

      const orderPatch: Record<string, unknown> = {
        status: 'paid',
        paidAt: nowIso,
        updatedAt: nowIso,
        ...(params.paymentId ? { paymentId: params.paymentId } : {}),
        ...(params.paymentIntentId ? { paymentIntentId: params.paymentIntentId } : {}),
      };
      tx.update(orderRef, orderPatch);

      const issuedTickets: Ticket[] = [];
      for (const tInput of params.ticketsToIssue) {
        const ticketRef = adminDb.collection('tickets').doc();
        const ticketDoc: Record<string, unknown> = {
          orderId: order.id,
          eventListingId: order.eventListingId,
          occurrenceId: order.occurrenceId,
          ticketTypeId: tInput.ticketTypeId,
          ownerUserId: order.buyerId,
          holderName: tInput.holderName,
          holderEmail: tInput.holderEmail,
          qrTokenHash: tInput.qrTokenHash,
          qrVersion: 1,
          status: 'issued',
          issuedAt: nowIso,
          updatedAt: nowIso,
          ticketTypeSnapshot: tInput.ticketTypeSnapshot,
          ...(order.eventSnapshot ? { eventSnapshot: order.eventSnapshot } : {}),
        };
        tx.set(ticketRef, ticketDoc);
        issuedTickets.push(TicketPersistenceMapper.toDomain(ticketRef.id, ticketDoc));
      }

      return {
        order: {
          ...order,
          status: 'paid',
          paidAt: nowIso,
          paymentId: params.paymentId || order.paymentId,
          paymentIntentId: params.paymentIntentId || order.paymentIntentId,
        },
        tickets: issuedTickets,
        alreadyPaid: false,
      };
    });
  }

  async expireOrderAndReleaseInventoryAtomic(orderId: string): Promise<{
    order: TicketOrder | null;
    releasedQuantity: number;
    alreadyReleased: boolean;
  }> {
    return adminDb.runTransaction(async (tx) => {
      const orderRef = adminDb.collection('ticketOrders').doc(orderId);
      const orderSnap = await tx.get(orderRef);
      if (!orderSnap.exists) {
        return { order: null, releasedQuantity: 0, alreadyReleased: true };
      }
      const order = TicketOrderPersistenceMapper.toDomain(
        orderSnap.id,
        (orderSnap.data() || {}) as Record<string, unknown>
      );

      if (
        order.status !== 'pending_payment' &&
        order.status !== 'payment_failed' &&
        order.status !== 'payment_processing'
      ) {
        return { order, releasedQuantity: 0, alreadyReleased: true };
      }

      const reservationsSnap = await tx.get(
        adminDb
          .collection('inventoryReservations')
          .where('orderId', '==', orderId)
          .where('status', '==', 'active')
      );

      const nowIso = new Date().toISOString();
      let releasedQuantity = 0;

      for (const resDoc of reservationsSnap.docs) {
        const res = InventoryReservationPersistenceMapper.toDomain(
          resDoc.id,
          (resDoc.data() || {}) as Record<string, unknown>
        );
        const typeRef = adminDb.collection('ticketTypes').doc(res.ticketTypeId);
        const typeSnap = await tx.get(typeRef);
        if (typeSnap.exists) {
          const tData = TicketTypePersistenceMapper.toDomain(
            typeSnap.id,
            (typeSnap.data() || {}) as Record<string, unknown>
          );
          tx.update(typeRef, {
            reservedCount: Math.max(0, tData.reservedCount - res.quantity),
            updatedAt: nowIso,
          });
        }
        tx.update(resDoc.ref, {
          status: 'released',
          releasedAt: nowIso,
        });
        releasedQuantity += res.quantity;
      }

      tx.update(orderRef, {
        status: 'expired',
        expiredAt: nowIso,
        updatedAt: nowIso,
      });

      return {
        order: { ...order, status: 'expired', expiredAt: nowIso },
        releasedQuantity,
        alreadyReleased: false,
      };
    });
  }
}
