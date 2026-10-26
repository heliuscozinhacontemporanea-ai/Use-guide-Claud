/**
 * `accountDebts/{id}`: dívida de um CNPJ com a plataforma (D14, D16). Classe interna (financeiro).
 * Vence em 24 h; vencida, bloqueia novas vendas do CNPJ e é descontada dos repasses.
 */
export type AccountDebtReason = 'cancellation_penalty' | 'dispute_lost' | 'post_release_refund';

/** `suspended`: multa com força maior em análise; não vence, não é descontada e não bloqueia (D16, 3A). */
export type AccountDebtStatus = 'open' | 'suspended' | 'paid' | 'waived';

export type ForceMajeureStatus = 'pending' | 'approved' | 'rejected';

/** Declaração do proprietário (D16, 3A). `reason` é texto livre: confidencial, nunca vai para log. */
export interface ForceMajeureDeclaration {
  reason: string;
  /** Arquivo na pasta privada do parceiro; só o admin abre, pelo backend. */
  proofPath: string;
  status: ForceMajeureStatus;
  declaredBy: string;
  declaredAt: string;
  decidedBy?: string;
  decidedAt?: string;
}

export interface AccountDebt {
  id: string;
  accountKey: string;
  reason: AccountDebtReason;
  /** O que gerou a dívida ('event_occurrence', 'booking_slot', 'sale_claim', 'ticket_order', 'booking'). */
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
  forceMajeure?: ForceMajeureDeclaration;
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
  forceMajeureStatus?: ForceMajeureStatus;
  createdAt: string;
}

/** Fila do admin: inclui o motivo declarado; a prova é aberta por rota própria. */
export interface ForceMajeureReviewView extends AccountDebtView {
  forceMajeureReason: string;
  declaredAt: string;
}
