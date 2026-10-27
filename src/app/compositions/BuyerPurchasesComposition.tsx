import { useState } from 'react';
import { BookingPurchaseDetails, useBookingPurchases } from '../../domain/bookings';
import { MySaleClaimsProvider, SaleClaimAction } from '../../domain/payment';
import { TicketPurchaseDetails, useTicketPurchases } from '../../domain/ticketing';
import { PurchaseHistoryView } from '../../ui/components/purchases/PurchaseHistoryView';
import type { PurchaseEntry } from '../../ui/components/purchases/purchaseEntry';
import { BUTTON_SECONDARY } from '../../ui/styles/controls';
import { useTranslation } from 'react-i18next';

interface BuyerPurchasesCompositionProps {
  onBack: () => void;
  onOpenTickets: () => void;
  onOpenBookings: () => void;
}

/**
 * Configurações › Compras: junta pedidos de ingresso e reservas num histórico só. Cada domínio
 * monta as próprias linhas e a folha de detalhes; o "Relatar problema" vem do payment (D16, 2A).
 */
export function BuyerPurchasesComposition(props: BuyerPurchasesCompositionProps) {
  return (
    <MySaleClaimsProvider>
      <BuyerPurchases {...props} />
    </MySaleClaimsProvider>
  );
}

function BuyerPurchases({ onBack, onOpenTickets, onOpenBookings }: BuyerPurchasesCompositionProps) {
  const { t } = useTranslation();
  const tickets = useTicketPurchases();
  const bookings = useBookingPurchases();
  const [open, setOpen] = useState<PurchaseEntry | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const idOf = (prefix: string) =>
    open?.key.startsWith(prefix) ? open.key.slice(prefix.length) : null;
  const close = () => setOpen(null);

  return (
    <PurchaseHistoryView
      entries={[...tickets.entries, ...bookings.entries]}
      loading={tickets.loading || bookings.loading}
      error={tickets.error ?? bookings.error}
      notice={notice ?? tickets.actions.feedback?.message}
      onRetry={() => {
        void tickets.reload();
        void bookings.reload();
      }}
      onBack={onBack}
      onOpen={(entry) => {
        setNotice(null);
        tickets.actions.setFeedback(null);
        setOpen(entry);
      }}
      footer={
        !bookings.loading &&
        bookings.hasMore && (
          <button
            type="button"
            onClick={() => void bookings.loadMore()}
            className={BUTTON_SECONDARY}
          >
            {t('bookings.buyer.loadMore')}
          </button>
        )
      }
    >
      <TicketPurchaseDetails
        source={tickets}
        orderId={idOf('ticket:')}
        onClose={close}
        onViewTickets={onOpenTickets}
        renderClaimAction={(sale) => <SaleClaimAction sale={sale} />}
      />
      <BookingPurchaseDetails
        source={bookings}
        bookingId={idOf('booking:')}
        onClose={close}
        onViewBooking={onOpenBookings}
        onNotice={setNotice}
        renderClaimAction={(sale) => <SaleClaimAction sale={sale} />}
      />
    </PurchaseHistoryView>
  );
}
