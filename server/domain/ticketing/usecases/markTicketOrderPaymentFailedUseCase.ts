import { ticketingService } from '../factory';
import type { TicketOrder } from '../types/ticketingTypes';

export async function markTicketOrderPaymentFailedUseCase(params: {
  orderId: string;
  paymentId?: string;
  paymentIntentId?: string;
}): Promise<TicketOrder> {
  return ticketingService.updateOrderPaymentState({
    orderId: params.orderId,
    status: 'payment_failed',
    paymentId: params.paymentId,
    paymentIntentId: params.paymentIntentId,
  });
}
