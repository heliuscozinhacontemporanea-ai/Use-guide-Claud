import type { PayoutEntryView } from '../../types/receivables';

export type PayoutStatusKey =
  | 'pending'
  | 'claim'
  | 'dispute'
  | 'released'
  | 'fully_refunded'
  | 'dispute_lost';

const TONE: Record<PayoutStatusKey, string> = {
  pending: 'bg-info-soft text-info border-info-line',
  claim: 'bg-warn-soft text-warn border-warn-line',
  dispute: 'bg-warn-soft text-warn border-warn-line',
  released: 'bg-success-soft text-success border-success-line',
  fully_refunded: 'bg-surface text-ink/70 border-line',
  dispute_lost: 'bg-danger-soft text-danger border-danger-line',
};

export function payoutStatusKey(entry: PayoutEntryView): PayoutStatusKey {
  if (entry.status === 'released') return 'released';
  if (entry.status === 'canceled') {
    return entry.canceledReason === 'dispute_lost' ? 'dispute_lost' : 'fully_refunded';
  }
  if (entry.status === 'on_hold') {
    return entry.holdReasons.includes('claim') ? 'claim' : 'dispute';
  }
  return 'pending';
}

export function payoutStatusTone(key: PayoutStatusKey): string {
  return TONE[key];
}
