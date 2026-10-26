import { saleClaimService } from '../factory';

/** Webhook `refund.updated` de um reembolso de reclamação. */
export async function settleSaleClaimRefundUseCase(
  claimId: string,
  providerRefundId: string,
  providerStatus: string
): Promise<void> {
  if (providerStatus === 'succeeded') {
    await saleClaimService.completeRefund(claimId, providerRefundId);
  } else if (providerStatus === 'failed' || providerStatus === 'canceled') {
    await saleClaimService.failRefund(claimId);
  }
  // 'pending' e 'requires_action' não são reembolso aprovado (AGENTS.md §8.6 item 6).
}
