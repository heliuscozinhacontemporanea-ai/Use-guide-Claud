import { ticketOrderService } from '../factory';
import type { TicketOrder } from '../types/ticketingTypes';

export async function markTicketOrderPaymentFailedUseCase(params: {
  orderId: string;
  paymentId?: string;
  paymentIntentId?: string;
}): Promise<TicketOrder> {
  return ticketOrderService.updateOrderPaymentState({
    orderId: params.orderId,
    status: 'payment_failed',
    paymentId: params.paymentId,
    paymentIntentId: params.paymentIntentId,
  });
}
