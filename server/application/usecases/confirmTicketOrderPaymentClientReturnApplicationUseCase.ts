import {
  PaymentDomainError,
  retrievePaymentIntentUseCase,
  updatePaymentTransactionStatusUseCase,
} from '../../domain/payment';
import {
  confirmTicketOrderPaymentUseCase,
  getTicketOrderUseCase,
  markTicketOrderPaymentFailedUseCase,
  TicketingDomainError,
  type Ticket,
  type TicketOrder,
} from '../../domain/ticketing';
import { OrchestrationActor } from './orchestrationActor';

export async function confirmTicketOrderPaymentClientReturnApplicationUseCase(
  actor: OrchestrationActor,
  params: {
    orderId: string;
    paymentIntentId: string;
  }
): Promise<{
  order: TicketOrder;
  tickets: Ticket[];
}> {
  const { order } = await getTicketOrderUseCase(actor, params.orderId);
  if (order.buyerId !== actor.uid && actor.admin !== true) {
    throw new TicketingDomainError('FORBIDDEN', 'Acesso negado a este pedido.');
  }

  if (order.status === 'paid') {
    const fresh = await getTicketOrderUseCase(actor, order.id);
    return {
      order: fresh.order,
      tickets: fresh.tickets,
    };
  }

  const pi = await retrievePaymentIntentUseCase(params.paymentIntentId);
  if (pi.metadata?.orderId && pi.metadata.orderId !== order.id) {
    throw new PaymentDomainError('FORBIDDEN', 'PaymentIntent não pertence ao pedido informado.');
  }

  if (pi.status === 'succeeded') {
    await updatePaymentTransactionStatusUseCase(pi.id, 'succeeded');
    const confirmed = await confirmTicketOrderPaymentUseCase({
      orderId: order.id,
      paymentId: pi.id,
      paymentIntentId: pi.id,
    });
    return {
      order: confirmed.order,
      tickets: confirmed.tickets,
    };
  }

  if (pi.status === 'Canceled' || pi.status === 'canceled') {
    await updatePaymentTransactionStatusUseCase(pi.id, 'canceled');
    await markTicketOrderPaymentFailedUseCase({
      orderId: order.id,
      paymentIntentId: pi.id,
    });
  }

  const current = await getTicketOrderUseCase(actor, order.id);
  return {
    order: current.order,
    tickets: current.tickets,
  };
}
