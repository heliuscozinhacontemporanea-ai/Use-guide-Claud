import { stripePaymentService } from '../factory';

export async function updatePaymentTransactionStatusUseCase(
  paymentIntentId: string,
  status: string,
  statusDetail?: string
): Promise<boolean> {
  return stripePaymentService.updateTransactionStatus(paymentIntentId, status, statusDetail);
}
