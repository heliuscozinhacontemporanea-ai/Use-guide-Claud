import type { SaleClaim } from '../types/saleClaim';

export interface SaleClaimRepositoryPort {
  /** Cria só se ainda não existir; devolve a reclamação gravada. */
  createIfAbsent(claim: SaleClaim): Promise<SaleClaim>;
  get(id: string): Promise<SaleClaim | null>;
  listByBuyer(buyerUid: string, limit: number): Promise<SaleClaim[]>;
  /** Abertas ou com reembolso em andamento, pelo prazo de decisão; `cursor` é o ID da última da página. */
  listPending(limit: number, cursor?: string): Promise<SaleClaim[]>;
  /** Abertas com `decideBy` até `nowIso`. */
  listExpired(nowIso: string, limit: number): Promise<SaleClaim[]>;
  /** Lê, aplica a mudança e grava na mesma transação; `null` deixa como está. */
  update(id: string, change: (current: SaleClaim) => SaleClaim | null): Promise<SaleClaim | null>;
}
