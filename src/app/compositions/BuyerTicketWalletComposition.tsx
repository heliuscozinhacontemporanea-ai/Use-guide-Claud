import { MySaleClaimsProvider, SaleClaimAction } from '../../domain/payment';
import { UserTicketsHistoryView } from '../../domain/ticketing';

/** Carteira de ingressos com "Relatar problema" do payment em cada pedido (D16, 2A). */
export function BuyerTicketWalletComposition({ onBack }: { onBack: () => void }) {
  return (
    <MySaleClaimsProvider>
      <UserTicketsHistoryView
        onBack={onBack}
        renderClaimAction={(sale) => <SaleClaimAction sale={sale} />}
      />
    </MySaleClaimsProvider>
  );
}
