import { ticketingService } from '../factory';
import type { TicketOrder } from '../types/ticketingTypes';

export async function markTicketOrderDisputedUseCase(params: {
  orderId: string;
  paymentId?: string;
  paymentIntentId?: string;
}): Promise<TicketOrder> {
  return ticketingService.updateOrderPaymentState({
    orderId: params.orderId,
    status: 'chargeback',
    paymentId: params.paymentId,
    paymentIntentId: params.paymentIntentId,
  });
}
