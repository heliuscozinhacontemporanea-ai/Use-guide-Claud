import { MyBookingsView } from '../../domain/bookings';
import { MySaleClaimsProvider, SaleClaimAction } from '../../domain/payment';

/** Reservas do comprador com "Relatar problema" do payment em cada reserva (D16, 2A). */
export function BuyerBookingsComposition({ onBack }: { onBack: () => void }) {
  return (
    <MySaleClaimsProvider>
      <MyBookingsView
        onBack={onBack}
        renderClaimAction={(sale) => <SaleClaimAction sale={sale} />}
      />
    </MySaleClaimsProvider>
  );
}
