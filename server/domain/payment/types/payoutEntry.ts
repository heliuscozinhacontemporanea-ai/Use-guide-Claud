/**
 * `payoutEntries/{id}`: repasse de uma venda à conta do CNPJ (D14). O dinheiro fica no saldo da plataforma
 * até `releaseAt` (fim do serviço + 48 h) e só então vira transferência. Classe interna (financeiro).
 */
export type PayoutEntryStatus = 'pending' | 'on_hold' | 'released' | 'canceled';

/** Contestação no Stripe e reclamação do comprador (D16) podem reter a mesma venda ao mesmo tempo. */
export type PayoutHoldReason = 'dispute' | 'claim';

export interface PayoutRefundApplied {
  amountMinor: number;
  /** Parte do reembolso que era taxa de serviço (fica fora do valor do proprietário). */
  serviceFeeMinor: number;
  at: string;
}

export interface PayoutEntry {
  id: string;
  /** Quem vendeu o quê ('ticket_order', 'booking'); o payment não interpreta o valor. */
  referenceType: string;
  referenceId: string;
  accountKey: string;
  paymentIntentId: string;
  chargeId: string;
  grossMinor: number;
  serviceFeeMinor: number;
  /** Taxa da plataforma sobre o valor do serviço, sem a taxa de serviço, na compra. */
  platformFeeMinor: number;
  partnerAmountMinor: number;
  serviceEndsAt: string;
  releaseAt: string;
  status: PayoutEntryStatus;
  /** Retenções ativas; `on_hold` enquanto houver alguma, `pending` quando a última sai. */
  holdReasons?: PayoutHoldReason[];
  /** Reembolsos já descontados, por chave do reembolso: repetir o mesmo não desconta de novo. */
  refunds: Record<string, PayoutRefundApplied>;
  transferId?: string;
  /** Parte do repasse usada para quitar dívidas vencidas do CNPJ (D14). */
  offsetMinor?: number;
  releasedAt?: string;
  canceledReason?: 'fully_refunded' | 'dispute_lost';
  createdAt: string;
  updatedAt: string;
}
