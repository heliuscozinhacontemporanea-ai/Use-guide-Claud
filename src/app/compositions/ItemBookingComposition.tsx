import { BookingOfferPanel } from '../../domain/bookings';
import { useAuthContext } from '../../domain/auth/context/AuthContext';
import { StripePaymentElement } from '../../domain/payment';
import { useUI } from '../../shared/stores/useUIStore';
import { useSideMenu } from '../menu/useSideMenu';

/** Liga o painel de reserva (bookings) ao login (auth) e ao Payment Element (payment). */
export function ItemBookingComposition({ guideItemId }: { guideItemId: string }) {
  const { user } = useAuthContext();
  const { openLoginModal } = useUI();
  const { openMenu } = useSideMenu();

  return (
    <BookingOfferPanel
      guideItemId={guideItemId}
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
