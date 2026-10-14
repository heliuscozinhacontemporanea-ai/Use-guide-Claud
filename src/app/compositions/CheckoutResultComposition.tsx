import { Clock, SearchX } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { BookingResultView } from '../../domain/bookings';
import { CheckoutResultView } from '../../domain/ticketing';
import { useLocalizedRouting } from '../../shared/hooks/useLocalizedRouting';
import { MessagePage } from '../../ui/components/MessagePage';
import { menuParamFor } from '../menu/menuViews';

/** Retorno do Stripe (`return_url`) quando o método de pagamento exige redirecionamento. */
export function CheckoutResultComposition() {
  const { t } = useTranslation();
  const { goTo } = useLocalizedRouting();
  const [searchParams] = useSearchParams();
  const kind = searchParams.get('kind');
  const orderId = searchParams.get('orderId');
  const bookingId = searchParams.get('bookingId');
  const paymentIntentId = searchParams.get('payment_intent') ?? undefined;

  if (kind === 'plan') {
    // Plano é confirmado só pelo webhook (AGENTS.md §8.4); aqui apenas orientamos o parceiro.
    return (
      <MessagePage
        icon={Clock}
        title={t('pages.planPaymentTitle')}
        description={t('pages.planPaymentDescription')}
        actionLabel={t('pages.openPartnerArea')}
        onAction={() => goTo('explore', '?partner=1')}
      />
    );
  }

  if (bookingId) {
    return (
      <BookingResultView
        bookingId={bookingId}
        onViewMyBookings={() => goTo('explore', `?menu=${menuParamFor('bookings')}`)}
      />
    );
  }

  if (!orderId) {
    return (
      <MessagePage
        icon={SearchX}
        title={t('pages.notFoundTitle')}
        description={t('pages.checkoutResultMissing')}
        actionLabel={t('pages.backHome')}
        onAction={() => goTo('explore')}
      />
    );
  }

  return (
    <div className="px-4 pb-32">
      <CheckoutResultView
        orderId={orderId}
        paymentIntentId={paymentIntentId}
        onBackHome={() => goTo('explore')}
        onNavigateToWallet={() => goTo('explore', `?menu=${menuParamFor('tickets')}`)}
      />
    </div>
  );
}
