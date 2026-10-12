import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import type { StripeElementsOptions } from '@stripe/stripe-js';
import { Loader2, Lock } from 'lucide-react';
import { normalizeLocale, DEFAULT_LOCALE } from '../../../../shared/i18n';
import { stripePromise } from '../stripePromise';

interface StripePaymentElementProps {
  clientSecret: string;
  orderId: string;
  /** `setup` salva o cartão sem cobrar agora (assinatura em período já pago). */
  intentType?: 'payment' | 'setup';
  /** Página de retorno do Stripe: pedido de ingresso (padrão), plano do parceiro ou reserva (`orderId` = ID da reserva). */
  returnKind?: 'ticket_order' | 'plan' | 'booking';
  submitLabel?: string;
  disabled?: boolean;
  onPending?: () => void;
  onSuccess?: (intentId?: string) => void;
  onError?: (message: string) => void;
}

function PaymentForm({
  orderId,
  intentType = 'payment',
  returnKind = 'ticket_order',
  submitLabel,
  disabled = false,
  onPending,
  onSuccess,
  onError,
}: Omit<StripePaymentElementProps, 'clientSecret'>) {
  const { t } = useTranslation();
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!stripe || !elements || disabled || submitting) {
      return;
    }
    setSubmitting(true);
    const returnQuery =
      returnKind === 'plan'
        ? 'kind=plan'
        : returnKind === 'booking'
          ? `bookingId=${encodeURIComponent(orderId)}`
          : `orderId=${encodeURIComponent(orderId)}`;
    const confirmParams = {
      return_url: `${window.location.origin}/checkout/result?${returnQuery}`,
    };
    try {
      if (intentType === 'setup') {
        const result = await stripe.confirmSetup({
          elements,
          confirmParams,
          redirect: 'if_required',
        });
        if (result.error) {
          onError?.(result.error.message || t('payment.element.paymentFailed'));
          return;
        }
        onPending?.();
        onSuccess?.(result.setupIntent?.id);
        return;
      }
      const result = await stripe.confirmPayment({
        elements,
        confirmParams,
        redirect: 'if_required',
      });
      if (result.error) {
        onError?.(result.error.message || t('payment.element.paymentFailed'));
        return;
      }
      onPending?.();
      // A confirmação final é do webhook (AGENTS.md §8.4); aqui só avisamos a tela.
      onSuccess?.(result.paymentIntent?.id);
    } catch {
      onError?.(t('payment.element.confirmFailed'));
    } finally {
      setSubmitting(false);
    }
  };

  const label =
    submitLabel ??
    (intentType === 'setup' ? t('payment.element.saveCard') : t('payment.element.payNow'));

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-4 rounded-2xl bg-slate-950/60 border border-white/10">
        <PaymentElement />
      </div>
      <button
        type="submit"
        disabled={!stripe || !elements || disabled || submitting}
        className="w-full min-h-12 px-4 rounded-xl bg-teal-400 hover:bg-teal-300 text-slate-950 font-black tracking-wider text-sm flex justify-center items-center gap-2 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer focus-visible:ring-2 focus-visible:ring-teal-400/50 shadow-[0_10px_25px_-5px_rgba(45,212,191,0.25)]"
      >
        {submitting ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            <span>{t('payment.element.processing')}</span>
          </>
        ) : (
          <>
            <Lock size={15} />
            <span>{label}</span>
          </>
        )}
      </button>
    </form>
  );
}

export function StripePaymentElement({ clientSecret, ...formProps }: StripePaymentElementProps) {
  const { t, i18n } = useTranslation();

  if (!stripePromise) {
    return (
      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200">
        {t('payment.element.unavailable')}
      </div>
    );
  }

  const options: StripeElementsOptions = {
    clientSecret,
    locale: normalizeLocale(i18n.language) ?? DEFAULT_LOCALE,
    appearance: {
      theme: 'night',
      variables: {
        colorPrimary: '#2dd4bf',
        colorBackground: '#090d16',
        colorText: '#f8fafc',
        colorDanger: '#f87171',
        borderRadius: '12px',
      },
    },
  };

  return (
    <Elements key={clientSecret} stripe={stripePromise} options={options}>
      <PaymentForm {...formProps} />
    </Elements>
  );
}
