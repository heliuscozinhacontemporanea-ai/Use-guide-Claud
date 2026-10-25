import { recordSalePayoutUseCase } from '../../../domain/payment';

export interface PaidSale {
  referenceType: 'ticket_order' | 'booking';
  referenceId: string;
  grossMinor: number;
  serviceFeeMinor: number;
  platformFeeMinor: number;
  serviceEndsAt: string;
}

/**
 * Registra o repasse de uma venda confirmada pelo webhook (D14). A conta do CNPJ vem da metadata do
 * pagamento (gravada na cobrança) e a cobrança de origem, do `latest_charge`.
 */
export async function recordPaidSalePayoutApplicationUseCase(
  paymentIntent: Record<string, unknown>,
  sale: PaidSale
): Promise<void> {
  const metadata = (paymentIntent.metadata as Record<string, string> | undefined) ?? {};
  const chargeId =
    typeof paymentIntent.latest_charge === 'string' ? paymentIntent.latest_charge : '';
  const paymentIntentId = String(paymentIntent.id || '');
  if (!metadata.accountKey || !chargeId || !paymentIntentId) {
    // Sem a conta ou a cobrança não dá para repassar; o erro volta ao Stripe, que reenvia o evento.
    throw new Error('Pagamento confirmado sem accountKey ou latest_charge para o repasse.');
  }
  await recordSalePayoutUseCase({
    ...sale,
    accountKey: metadata.accountKey,
    paymentIntentId,
    chargeId,
  });
}
