/** Reclamação do comprador (D16, 2A), como a API devolve. */
export const SALE_CLAIM_REASONS = [
  'did_not_happen',
  'not_as_described',
  'changed_without_notice',
  'safety_issue',
  'other',
] as const;

export type SaleClaimReason = (typeof SALE_CLAIM_REASONS)[number];

export type SaleClaimStatus = 'open' | 'refund_pending' | 'refunded' | 'released' | 'expired';

export interface BuyerSaleClaim {
  id: string;
  referenceType: 'ticket_order' | 'booking' | string;
  referenceId: string;
  reason: SaleClaimReason;
  status: SaleClaimStatus;
  openedAt: string;
  decideBy: string;
  refundAmountMinor?: number;
}

/** A venda sobre a qual o comprador pode reclamar; as datas vêm do pedido ou da reserva. */
export interface ClaimableSale {
  referenceType: 'ticket_order' | 'booking';
  referenceId: string;
  serviceStartsAt: string;
  serviceEndsAt: string;
}
