/** Extrato e dívidas do parceiro (D14, D16), como a API devolve. */
export type PayoutEntryStatus = 'pending' | 'on_hold' | 'released' | 'canceled';
export type PayoutHoldReason = 'dispute' | 'claim';

export interface PayoutEntryView {
  id: string;
  referenceType: 'ticket_order' | 'booking' | string;
  referenceId: string;
  title: string | null;
  accountKey: string;
  grossMinor: number;
  refundedMinor: number;
  partnerAmountMinor: number;
  offsetMinor: number;
  status: PayoutEntryStatus;
  holdReasons: PayoutHoldReason[];
  serviceEndsAt: string;
  releaseAt: string;
  releasedAt: string | null;
  canceledReason: 'fully_refunded' | 'dispute_lost' | null;
  createdAt: string;
}

export interface PayoutPage {
  data: PayoutEntryView[];
  nextCursor: string | null;
}

export type AccountDebtReason = 'cancellation_penalty' | 'dispute_lost' | 'post_release_refund';
export type AccountDebtStatus = 'open' | 'suspended' | 'paid' | 'waived';
export type ForceMajeureStatus = 'pending' | 'approved' | 'rejected';

export interface AccountDebtView {
  id: string;
  accountKey: string;
  reason: AccountDebtReason;
  referenceType: string;
  amountMinor: number;
  remainingMinor: number;
  status: AccountDebtStatus;
  dueAt: string;
  overdue: boolean;
  forceMajeureStatus?: ForceMajeureStatus;
  createdAt: string;
}
