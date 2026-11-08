import { payoutService } from '../factory';
import type { RecordSaleInput } from '../services/payoutService';
import type { PayoutEntry } from '../types/payoutEntry';

/** Registra o repasse pendente de uma venda paga (D14); repetir não cria outro. */
export function recordSalePayoutUseCase(input: RecordSaleInput): Promise<PayoutEntry> {
  return payoutService.recordSale(input);
}
