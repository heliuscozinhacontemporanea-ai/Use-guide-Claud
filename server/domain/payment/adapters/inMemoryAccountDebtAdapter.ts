import type { AccountDebtRepositoryPort } from '../ports/accountDebtRepositoryPort';
import type { AccountDebt, AccountDebtStatus } from '../types/accountDebt';

/** Usado só por testes (AGENTS.md §2.2 item 7). */
export class InMemoryAccountDebtAdapter implements AccountDebtRepositoryPort {
  readonly rows = new Map<string, AccountDebt>();

  async createIfAbsent(debt: AccountDebt): Promise<AccountDebt> {
    const existing = this.rows.get(debt.id);
    if (existing) return existing;
    this.rows.set(debt.id, debt);
    return debt;
  }

  async get(id: string): Promise<AccountDebt | null> {
    return this.rows.get(id) ?? null;
  }

  async listOpenByAccountKey(accountKey: string): Promise<AccountDebt[]> {
    return [...this.rows.values()]
      .filter((debt) => debt.accountKey === accountKey && debt.status === 'open')
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }

  async listByAccountKeys(accountKeys: string[], limit: number): Promise<AccountDebt[]> {
    return [...this.rows.values()]
      .filter((debt) => accountKeys.includes(debt.accountKey))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, limit);
  }

  async listByStatus(
    status: AccountDebtStatus,
    limit: number,
    cursor?: string
  ): Promise<AccountDebt[]> {
    const rows = [...this.rows.values()]
      .filter((debt) => debt.status === status)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    const start = cursor ? rows.findIndex((debt) => debt.id === cursor) + 1 : 0;
    return rows.slice(start, start + limit);
  }

  async update(
    id: string,
    change: (current: AccountDebt) => AccountDebt | null
  ): Promise<AccountDebt | null> {
    const current = this.rows.get(id);
    if (!current) return null;
    const next = change(current);
    if (next) this.rows.set(id, next);
    return next ?? current;
  }
}
