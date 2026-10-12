import { BookingOfferPanel } from '../../domain/bookings';
import { useAuthContext } from '../../domain/auth/context/AuthContext';
import { StripePaymentElement } from '../../domain/payment';
import { useLocalizedRouting } from '../../shared/hooks/useLocalizedRouting';
import { useUI } from '../../shared/stores/useUIStore';

/** Liga o painel de reserva (bookings) ao login (auth) e ao Payment Element (payment). */
export function ItemBookingComposition({ guideItemId }: { guideItemId: string }) {
  const { user } = useAuthContext();
  const { openLoginModal } = useUI();
  const { goTo } = useLocalizedRouting();

  return (
    <BookingOfferPanel
      guideItemId={guideItemId}
      isAuthenticated={Boolean(user)}
      onRequireLogin={openLoginModal}
      onViewMyBookings={() => goTo('bookings')}
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
