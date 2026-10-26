import type { AccountDebt, AccountDebtStatus } from '../types/accountDebt';

export interface AccountDebtRepositoryPort {
  /** Cria só se ainda não existir; devolve a dívida gravada. */
  createIfAbsent(debt: AccountDebt): Promise<AccountDebt>;
  get(id: string): Promise<AccountDebt | null>;
  /** Dívidas `open` do CNPJ, mais antigas primeiro. */
  listOpenByAccountKey(accountKey: string): Promise<AccountDebt[]>;
  listByAccountKeys(accountKeys: string[], limit: number): Promise<AccountDebt[]>;
  /** Dívidas no status, mais antigas primeiro; `cursor` é o id da última da página anterior. */
  listByStatus(status: AccountDebtStatus, limit: number, cursor?: string): Promise<AccountDebt[]>;
  /** Lê, aplica a mudança e grava na mesma transação; `null` deixa como está. */
  update(
    id: string,
    change: (current: AccountDebt) => AccountDebt | null
  ): Promise<AccountDebt | null>;
}
