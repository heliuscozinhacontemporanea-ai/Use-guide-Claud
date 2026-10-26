/**
 * `saleClaims/{id}`: reclamação do comprador sobre uma venda (D16, 2A). Retém o repasse até a decisão do
 * admin, por no máximo 5 dias. Classe confidencial: `details` é texto livre do comprador e nunca vai
 * para log.
 */
export const SALE_CLAIM_REASONS = [
  'did_not_happen',
  'not_as_described',
  'changed_without_notice',
  'safety_issue',
  'other',
] as const;

export type SaleClaimReason = (typeof SALE_CLAIM_REASONS)[number];

export type SaleClaimStatus = 'open' | 'refund_pending' | 'refunded' | 'released' | 'expired';

export type SaleClaimOutcome = 'release' | 'refund_full' | 'refund_partial';

export interface SaleClaim {
  id: string;
  /** Venda reclamada ('ticket_order', 'booking'); o payment não interpreta o valor. */
  referenceType: string;
  referenceId: string;
  payoutEntryId: string;
  buyerUid: string;
  reason: SaleClaimReason;
  details?: string;
  status: SaleClaimStatus;
  openedAt: string;
  decideBy: string;
  decidedBy?: string;
  decidedAt?: string;
  refundAmountMinor?: number;
  /** Parte do reembolso que é taxa de serviço (só no reembolso integral). */
  refundServiceFeeMinor?: number;
  providerRefundId?: string;
  /** Cada decisão de reembolso é uma tentativa: depois de uma recusa, a próxima usa outra chave no Stripe. */
  refundAttempts?: number;
  updatedAt: string;
}

/** O que o comprador vê da própria reclamação. */
export interface BuyerSaleClaimView {
  id: string;
  referenceType: string;
  referenceId: string;
  reason: SaleClaimReason;
  status: SaleClaimStatus;
  openedAt: string;
  decideBy: string;
  refundAmountMinor?: number;
}

/** Fila do admin: inclui o texto do comprador e os valores da venda para decidir. */
export interface AdminSaleClaimView extends BuyerSaleClaimView {
  buyerUid: string;
  details?: string;
  grossMinor: number;
  refundableMinor: number;
}
