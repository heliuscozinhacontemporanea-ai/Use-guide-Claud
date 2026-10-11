import { Clock, SearchX } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckoutResultView } from '../../domain/ticketing';
import { useLocalizedRouting } from '../../shared/hooks/useLocalizedRouting';
import { MessagePage } from '../../ui/components/MessagePage';

/** Retorno do Stripe (`return_url`) quando o método de pagamento exige redirecionamento. */
export function CheckoutResultComposition() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { goTo } = useLocalizedRouting();
  const [searchParams] = useSearchParams();
  const kind = searchParams.get('kind');
  const orderId = searchParams.get('orderId');
  const paymentIntentId = searchParams.get('payment_intent') ?? undefined;

  if (kind === 'plan') {
    // Plano é confirmado só pelo webhook (AGENTS.md §8.4); aqui apenas orientamos o parceiro.
    return (
      <MessagePage
        icon={Clock}
        title={t('pages.planPaymentTitle')}
        description={t('pages.planPaymentDescription')}
        actionLabel={t('pages.openPartnerArea')}
        onAction={() => navigate('/?partner=1')}
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
      />
    </div>
  );
}
