/**
 * Critério único de "conta pronta para vender": o mesmo para publicar oferta, vender ingresso e
 * para o painel do parceiro, que recebe o resultado pronto em `readyForSales`.
 */
export function isSellerAccountReady(account: {
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  detailsSubmitted: boolean;
  status: string;
}): boolean {
  return (
    account.chargesEnabled &&
    account.payoutsEnabled &&
    account.detailsSubmitted &&
    account.status === 'enabled'
  );
}
