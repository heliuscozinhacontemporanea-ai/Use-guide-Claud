import type { PartnerPaymentAccount } from '../../types/payment';

export type AccountStatusKey = 'ready' | 'pending' | 'restricted' | 'disabled' | 'notStarted';

const TONE: Record<AccountStatusKey, string> = {
  ready: 'bg-success-soft text-success border-success-line',
  pending: 'bg-warn-soft text-warn border-warn-line',
  restricted: 'bg-info-soft text-info border-info-line',
  disabled: 'bg-danger-soft text-danger border-danger-line',
  notStarted: 'bg-surface text-ink/70 border-line',
};

export function accountStatusKey(entry: PartnerPaymentAccount): AccountStatusKey {
  if (!entry.account) return 'notStarted';
  if (entry.account.readyForSales) return 'ready';
  if (entry.account.status === 'disabled') return 'disabled';
  if (entry.account.status === 'restricted') return 'restricted';
  return 'pending';
}

export function accountStatusTone(key: AccountStatusKey): string {
  return TONE[key];
}

/** Erros da API chegam pelo `code` (AGENTS.md §12.5); o texto vem das traduções. */
export function accountErrorKey(error: unknown): string {
  const code = error instanceof Error ? error.message : '';
  const known = ['NOT_FOUND', 'FORBIDDEN', 'VALIDATION_ERROR'];
  return `paymentAccounts.errors.${known.includes(code) ? code : 'PAYMENT_ACCOUNT_UNAVAILABLE'}`;
}
