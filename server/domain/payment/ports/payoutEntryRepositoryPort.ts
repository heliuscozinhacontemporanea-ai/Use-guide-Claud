import type { PayoutEntry } from '../types/payoutEntry';

export interface PayoutEntryRepositoryPort {
  /** Cria só se ainda não existir; devolve a entrada gravada. */
  createIfAbsent(entry: PayoutEntry): Promise<PayoutEntry>;
  get(id: string): Promise<PayoutEntry | null>;
  getByPaymentIntentId(paymentIntentId: string): Promise<PayoutEntry | null>;
  /** Entradas `pending` com `releaseAt` até `nowIso`, mais antigas primeiro. */
  listDue(nowIso: string, limit: number): Promise<PayoutEntry[]>;
  /** Extrato dos CNPJs, mais recentes primeiro; `cursor` é o ID da última entrada da página. */
  listByAccountKeys(accountKeys: string[], limit: number, cursor?: string): Promise<PayoutEntry[]>;
  /** Lê, aplica a mudança e grava na mesma transação; `null` deixa como está. */
  update(
    id: string,
    change: (current: PayoutEntry) => PayoutEntry | null
  ): Promise<PayoutEntry | null>;
}
