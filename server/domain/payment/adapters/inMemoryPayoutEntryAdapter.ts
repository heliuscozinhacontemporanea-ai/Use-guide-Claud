import type { PayoutEntryRepositoryPort } from '../ports/payoutEntryRepositoryPort';
import type { PayoutEntry } from '../types/payoutEntry';

/** Usado só por testes (AGENTS.md §2.2 item 7). */
export class InMemoryPayoutEntryAdapter implements PayoutEntryRepositoryPort {
  readonly rows = new Map<string, PayoutEntry>();

  async createIfAbsent(entry: PayoutEntry): Promise<PayoutEntry> {
    const existing = this.rows.get(entry.id);
    if (existing) return existing;
    this.rows.set(entry.id, entry);
    return entry;
  }

  async get(id: string): Promise<PayoutEntry | null> {
    return this.rows.get(id) ?? null;
  }

  async getByPaymentIntentId(paymentIntentId: string): Promise<PayoutEntry | null> {
    return (
      [...this.rows.values()].find((entry) => entry.paymentIntentId === paymentIntentId) ?? null
    );
  }

  async listDue(nowIso: string, limit: number): Promise<PayoutEntry[]> {
    return [...this.rows.values()]
      .filter((entry) => entry.status === 'pending' && entry.releaseAt <= nowIso)
      .sort((a, b) => a.releaseAt.localeCompare(b.releaseAt))
      .slice(0, limit);
  }

  async listByAccountKeys(
    accountKeys: string[],
    limit: number,
    cursor?: string
  ): Promise<PayoutEntry[]> {
    const entries = [...this.rows.values()]
      .filter((entry) => accountKeys.includes(entry.accountKey))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    const start = cursor ? entries.findIndex((entry) => entry.id === cursor) + 1 : 0;
    return entries.slice(start, start + limit);
  }

  async update(
    id: string,
    change: (current: PayoutEntry) => PayoutEntry | null
  ): Promise<PayoutEntry | null> {
    const current = this.rows.get(id);
    if (!current) return null;
    const next = change(current);
    if (next) this.rows.set(id, next);
    return next ?? current;
  }
}
