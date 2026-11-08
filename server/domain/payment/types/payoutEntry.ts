/**
 * `payoutEntries/{id}`: repasse de uma venda à conta do CNPJ (D14). O dinheiro fica no saldo da plataforma
 * até `releaseAt` (fim do serviço + 48 h) e só então vira transferência. Classe interna (financeiro).
 */
export type PayoutEntryStatus = 'pending' | 'on_hold' | 'released' | 'canceled';

/**
 * Contestação no Stripe e reclamação do comprador (D16) podem reter a mesma venda ao mesmo tempo.
 * `service_proof`: a venda espera a prova de que o serviço aconteceu (D20); quem a define é a camada
 * application, o payment só a respeita.
 */
export type PayoutHoldReason = 'dispute' | 'claim' | 'service_proof';

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
  /** Nome do evento ou da oferta na compra, para o extrato do parceiro (classe pública). */
  title?: string;
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

/** Linha do extrato do parceiro: por allowlist, sem IDs do Stripe (AGENTS.md §7.9 regra 4). */
export interface PayoutEntryView {
  id: string;
  referenceType: string;
  referenceId: string;
  title: string | null;
  accountKey: string;
  grossMinor: number;
  /** Taxa de serviço paga pelo comprador que ainda não voltou para ele; não sai do valor do proprietário. */
  serviceFeeMinor: number;
  refundedMinor: number;
  /** Taxa da plataforma sobre o que o proprietário fica (D14). */
  platformFeeMinor: number;
  partnerAmountMinor: number;
  offsetMinor: number;
  status: PayoutEntryStatus;
  holdReasons: PayoutHoldReason[];
  serviceEndsAt: string;
  releaseAt: string;
  releasedAt: string | null;
  canceledReason: PayoutEntry['canceledReason'] | null;
  createdAt: string;
}
