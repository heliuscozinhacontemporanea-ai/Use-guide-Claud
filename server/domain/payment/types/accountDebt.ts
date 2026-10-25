/**
 * `accountDebts/{id}`: dívida de um CNPJ com a plataforma (D14, D16). Classe interna (financeiro).
 * Vence em 24 h; vencida, bloqueia novas vendas do CNPJ e é descontada dos repasses.
 */
export type AccountDebtReason = 'cancellation_penalty' | 'dispute_lost' | 'post_release_refund';

export type AccountDebtStatus = 'open' | 'paid' | 'waived';

export interface AccountDebt {
  id: string;
  accountKey: string;
  reason: AccountDebtReason;
  /** O que gerou a dívida ('event_occurrence', 'booking_slot', 'ticket_order', 'booking'). */
  referenceType: string;
  referenceId: string;
  amountMinor: number;
  /** Descontos já feitos em repasses, por entrada de repasse: repetir a liberação não desconta de novo. */
  offsets: Record<string, number>;
  status: AccountDebtStatus;
  dueAt: string;
  paymentIntentId?: string;
  paidAt?: string;
  waivedBy?: string;
  createdAt: string;
  updatedAt: string;
}

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
  createdAt: string;
}
