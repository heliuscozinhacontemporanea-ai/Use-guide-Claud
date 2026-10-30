import type { AccountDebtView } from './receivables';
import type { BuyerSaleClaim } from './saleClaims';

/** Quem vende por um CNPJ; o documento vem mascarado do backend. */
export interface SellerSummary {
  sellerName: string | null;
  maskedDocument: string | null;
}

export interface AdminSaleClaim extends BuyerSaleClaim, SellerSummary {
  buyerUid: string;
  details?: string;
  title?: string;
  serviceEndsAt?: string;
  grossMinor: number;
  refundableMinor: number;
  /** Teto do reembolso parcial; a taxa de serviço só volta no integral. */
  maxPartialRefundMinor: number;
  /** Provas do serviço da venda (D20); quem sabe ler é a composição, não o payment. */
  serviceEvidence?: unknown;
}

export type SaleClaimOutcome = 'release' | 'refund_full' | 'refund_partial';

export interface SaleClaimDecisionInput {
  outcome: SaleClaimOutcome;
  amountMinor?: number;
  chargePenalty?: boolean;
}

export interface AdminForceMajeureReview extends AccountDebtView, SellerSummary {
  forceMajeureReason: string;
  declaredAt: string;
}

export type AdminAccountDebt = AccountDebtView & SellerSummary;

export interface AdminPage<T> {
  data: T[];
  nextCursor: string | null;
}
