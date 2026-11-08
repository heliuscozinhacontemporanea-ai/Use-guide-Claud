import type { SaleClaimRepositoryPort } from '../ports/saleClaimRepositoryPort';
import type { SaleClaim } from '../types/saleClaim';

/** Usado só por testes (AGENTS.md §2.2 item 7). */
export class InMemorySaleClaimAdapter implements SaleClaimRepositoryPort {
  readonly rows = new Map<string, SaleClaim>();

  async createIfAbsent(claim: SaleClaim): Promise<SaleClaim> {
    const existing = this.rows.get(claim.id);
    if (existing) return existing;
    this.rows.set(claim.id, claim);
    return claim;
  }

  async get(id: string): Promise<SaleClaim | null> {
    return this.rows.get(id) ?? null;
  }

  async listByBuyer(buyerUid: string, limit: number): Promise<SaleClaim[]> {
    return [...this.rows.values()]
      .filter((claim) => claim.buyerUid === buyerUid)
      .sort((a, b) => b.openedAt.localeCompare(a.openedAt))
      .slice(0, limit);
  }

  async listPending(limit: number, cursor?: string): Promise<SaleClaim[]> {
    const pending = [...this.rows.values()]
      .filter((claim) => claim.status === 'open' || claim.status === 'refund_pending')
      .sort((a, b) => a.decideBy.localeCompare(b.decideBy));
    const start = cursor ? pending.findIndex((claim) => claim.id === cursor) + 1 : 0;
    return pending.slice(start, start + limit);
  }

  async listExpired(nowIso: string, limit: number): Promise<SaleClaim[]> {
    return [...this.rows.values()]
      .filter((claim) => claim.status === 'open' && claim.decideBy <= nowIso)
      .slice(0, limit);
  }

  async update(
    id: string,
    change: (current: SaleClaim) => SaleClaim | null
  ): Promise<SaleClaim | null> {
    const current = this.rows.get(id);
    if (!current) return null;
    const next = change(current);
    if (next) this.rows.set(id, next);
    return next ?? current;
  }
}
