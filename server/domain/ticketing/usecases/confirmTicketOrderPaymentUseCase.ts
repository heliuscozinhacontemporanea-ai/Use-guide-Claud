import { ticketOrderService } from '../factory';
import type { Ticket, TicketOrder } from '../types/ticketingTypes';

export async function confirmTicketOrderPaymentUseCase(params: {
  orderId: string;
  paymentId?: string;
  paymentIntentId?: string;
}): Promise<{ order: TicketOrder; tickets: Ticket[]; alreadyPaid: boolean }> {
  return ticketOrderService.confirmTicketOrderPayment(params);
}
