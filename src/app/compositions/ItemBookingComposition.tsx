import type { ReactNode } from 'react';
import { useAuthContext } from '../../domain/auth/context/AuthContext';
import { BookingOfferPanel } from '../../domain/bookings';
import { StripePaymentElement } from '../../domain/payment';
import { useUI } from '../../shared/stores/useUIStore';
import { useSideMenu } from '../menu/useSideMenu';

/** Liga o painel de reserva (bookings) ao login (auth) e ao Payment Element (payment). */
export function ItemBookingComposition({
  guideItemId,
  between,
}: {
  guideItemId: string;
  /** Seções do anúncio entre a oferta e a política ("O que está incluído"). */
  between?: ReactNode;
}) {
  const { user } = useAuthContext();
  const { openLoginModal } = useUI();
  const { openMenu } = useSideMenu();

  return (
    <BookingOfferPanel
      guideItemId={guideItemId}
      between={between}
      isAuthenticated={Boolean(user)}
      onRequireLogin={openLoginModal}
      onViewMyBookings={() => openMenu('bookings', { closeItem: true })}
      renderPaymentElement={({ clientSecret, bookingId, submitLabel, onSucceeded, onFailed }) => (
        <StripePaymentElement
          clientSecret={clientSecret}
          orderId={bookingId}
          returnKind="booking"
          submitLabel={submitLabel}
          onSuccess={onSucceeded}
          onError={onFailed}
        />
      )}
    />
  );
}
