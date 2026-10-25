import {
  cancellationPenaltyMinor,
  createAccountDebtUseCase,
  getPayoutEntryForReferenceUseCase,
} from '../../../domain/payment';

export interface CanceledSale {
  referenceType: 'ticket_order' | 'booking';
  referenceId: string;
}

/**
 * Multa do cancelamento pelo proprietário (D14): 20% do valor vendido, sem as taxas de serviço, por CNPJ.
 * Calculada antes dos reembolsos, a partir dos repasses ainda não cancelados; vence em 24 h. Repetir o
 * mesmo cancelamento não gera outra multa.
 */
export async function chargeCancellationPenaltyApplicationUseCase(params: {
  referenceType: 'event_occurrence' | 'booking_slot';
  referenceId: string;
  sales: CanceledSale[];
}): Promise<number> {
  const soldByAccount = new Map<string, number>();
  for (const sale of params.sales) {
    const entry = await getPayoutEntryForReferenceUseCase(sale.referenceType, sale.referenceId);
    if (!entry || entry.status === 'canceled') continue;
    const refundedService = Object.values(entry.refunds).reduce(
      (sum, refund) => sum + (refund.amountMinor - refund.serviceFeeMinor),
      0
    );
    const sold = Math.max(0, entry.grossMinor - entry.serviceFeeMinor - refundedService);
    soldByAccount.set(entry.accountKey, (soldByAccount.get(entry.accountKey) ?? 0) + sold);
  }
  let total = 0;
  for (const [accountKey, sold] of soldByAccount) {
    const debt = await createAccountDebtUseCase({
      accountKey,
      reason: 'cancellation_penalty',
      referenceType: params.referenceType,
      // Com a conta na chave, repetir depois de reembolsos parciais não gera uma segunda multa.
      referenceId: `${params.referenceId}_${accountKey}`,
      amountMinor: cancellationPenaltyMinor(sold),
    });
    total += debt?.amountMinor ?? 0;
  }
  return total;
}
