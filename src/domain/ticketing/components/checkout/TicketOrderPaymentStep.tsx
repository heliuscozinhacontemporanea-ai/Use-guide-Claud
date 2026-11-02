import { Clock, Loader2, ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '../../../../shared/utils/cn';
import { formatMoneyMinor } from '../../../../shared/utils/money';
import { GlassCard } from '../../../../ui/components/GlassCard';
import { StripePaymentElement } from '../../../payment';
import type { TicketCheckoutState } from '../../hooks/useTicketCheckout';
import type { TicketOrder } from '../../types/ticketing';
import { SalesPolicyNotice } from './SalesPolicyNotice';

interface TicketOrderPaymentStepProps {
  order: TicketOrder;
  checkout: TicketCheckoutState;
}

/** Reserva criada: resumo com a taxa de serviço destacada, prazo e pagamento (AGENTS.md §8.7). */
export function TicketOrderPaymentStep({ order, checkout }: TicketOrderPaymentStepProps) {
  const { t, i18n } = useTranslation();
  const money = (minor: number) => formatMoneyMinor(minor, i18n.language);
  const { countdown, clientSecret, paymentProcessing } = checkout;
  const clock = `${String(countdown.minutes).padStart(2, '0')}:${String(countdown.seconds).padStart(2, '0')}`;
  const serviceFeeMinor = order.serviceFeeMinor ?? 0;

  return (
    <GlassCard className="p-4 space-y-4 border-accent-line">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div>
          <p className="text-xs font-bold text-accent uppercase tracking-wider">
            {t('ticketCheckout.payment.reservation', { id: order.id.slice(0, 8) })}
          </p>
          <p className="text-base font-black text-ink">
            {t('ticketCheckout.payment.total', { amount: money(order.totalMinor) })}
          </p>
        </div>
        <p
          role="timer"
          className={cn(
            'px-3 py-1.5 rounded-full border text-xs font-bold flex items-center gap-1.5',
            countdown.isExpired
              ? 'bg-danger-soft border-danger-line text-danger'
              : countdown.isWarning
                ? 'bg-warn-soft border-warn-line text-warn motion-safe:animate-pulse'
                : 'bg-accent-soft border-accent-line text-accent'
          )}
        >
          <Clock size={14} aria-hidden="true" />
          {countdown.isExpired
            ? t('ticketCheckout.payment.expired')
            : t('ticketCheckout.payment.remaining', { time: clock })}
        </p>
      </div>

      <dl className="p-3 rounded-xl bg-surface border border-line space-y-1.5 text-xs">
        <div className="flex justify-between text-ink/70">
          <dt>{t('ticketCheckout.payment.subtotal')}</dt>
          <dd>{money(order.subtotalMinor)}</dd>
        </div>
        {order.discountMinor > 0 && (
          <div className="flex justify-between text-success">
            <dt>{t('ticketCheckout.payment.discount')}</dt>
            <dd>- {money(order.discountMinor)}</dd>
          </div>
        )}
        {serviceFeeMinor > 0 && (
          <div className="flex justify-between text-ink/70">
            <dt>{t('salesPolicy.serviceFee.line')}</dt>
            <dd>{money(serviceFeeMinor)}</dd>
          </div>
        )}
        <div className="flex justify-between font-bold text-ink pt-1 border-t border-line">
          <dt>{t('ticketCheckout.payment.finalTotal')}</dt>
          <dd className="text-accent">{money(order.totalMinor)}</dd>
        </div>
      </dl>

      {order.salesPolicySnapshot && (
        <SalesPolicyNotice policy={order.salesPolicySnapshot} applied />
      )}

      {paymentProcessing && (
        <p
          role="status"
          className="p-3.5 rounded-xl bg-accent-soft border border-accent-line text-xs text-accent flex items-center gap-2.5"
        >
          <Loader2 size={16} className="animate-spin shrink-0" aria-hidden="true" />
          {t('ticketCheckout.payment.processing')}
        </p>
      )}

      {clientSecret && !countdown.isExpired ? (
        <StripePaymentElement
          clientSecret={clientSecret}
          orderId={order.id}
          disabled={countdown.isExpired || paymentProcessing}
          submitLabel={t('ticketCheckout.payment.pay', { amount: money(order.totalMinor) })}
          onError={(message) => checkout.setError(message)}
          onSuccess={(paymentIntentId) => void checkout.confirmPayment(paymentIntentId)}
        />
      ) : countdown.isExpired ? (
        <button
          type="button"
          onClick={checkout.reset}
          className="w-full min-h-11 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold text-ink cursor-pointer focus-visible:ring-2 focus-visible:ring-teal-400/50"
        >
          {t('ticketCheckout.payment.newReservation')}
        </button>
      ) : (
        <p
          role="status"
          className="py-6 flex items-center justify-center gap-2 text-xs text-ink/70"
        >
          <Loader2 size={16} className="animate-spin text-teal-400" aria-hidden="true" />
          {t('ticketCheckout.payment.loadingStripe')}
        </p>
      )}

      <p className="flex items-center justify-center gap-1.5 text-xs text-ink/70">
        <ShieldCheck size={14} className="text-teal-400" aria-hidden="true" />
        {t('ticketCheckout.payment.secure')}
      </p>
    </GlassCard>
  );
}
