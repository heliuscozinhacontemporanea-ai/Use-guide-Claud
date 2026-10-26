/** Quem vende por um CNPJ, para as filas do admin (D16). Só o documento mascarado sai daqui. */
export interface SellerAccountSummary {
  sellerName: string | null;
  maskedDocument: string | null;
}

const UNKNOWN: SellerAccountSummary = { sellerName: null, maskedDocument: null };

export function sellerOf(
  sellers: Record<string, SellerAccountSummary>,
  accountKey: string | undefined
): SellerAccountSummary {
  return (accountKey && sellers[accountKey]) || UNKNOWN;
}
