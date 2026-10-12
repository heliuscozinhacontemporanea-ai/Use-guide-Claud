import { stripePaymentService } from '../factory';

export async function getPaymentReferenceUseCase(
  paymentIntentId: string
): Promise<{ referenceType: string; referenceId: string } | null> {
  return stripePaymentService.getPaymentReference(paymentIntentId);
}
