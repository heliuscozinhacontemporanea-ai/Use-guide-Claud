import React, { useState } from 'react';
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from '@stripe/react-stripe-js';
import type { StripeElementsOptions } from '@stripe/stripe-js';
import { Loader2, Lock } from 'lucide-react';
import { stripePromise } from '../adapters/stripePromise';

interface StripePaymentElementProps {
  clientSecret: string;
  orderId: string;
  submitLabel?: string;
  disabled?: boolean;
  onPending?: () => void;
  onSuccess?: (paymentIntentId?: string) => void;
  onError?: (message: string) => void;
}

function PaymentForm({
  orderId,
  submitLabel = 'Pagar agora',
  disabled = false,
  onPending,
  onSuccess,
  onError,
}: Omit<StripePaymentElementProps, 'clientSecret'>) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!stripe || !elements || disabled || submitting) {
      return;
    }
    setSubmitting(true);
    try {
      const result = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url:
            `${window.location.origin}/checkout/result?orderId=` +
            encodeURIComponent(orderId),
        },
        redirect: 'if_required',
      });
      if (result.error) {
        onError?.(
          result.error.message || 'Não foi possível processar o pagamento.'
        );
        return;
      }
      onPending?.();
      // A confirmação final é feita pelo backend/webhook.
      onSuccess?.(result.paymentIntent?.id);
    } catch (err: unknown) {
      onError?.(
        err instanceof Error
          ? err.message
          : 'Não foi possível confirmar o pagamento.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-4 rounded-2xl bg-slate-950/60 border border-white/10">
        <PaymentElement />
      </div>
      <button
        type="submit"
        disabled={!stripe || !elements || disabled || submitting}
        className="w-full h-12 rounded-xl bg-teal-400 hover:bg-teal-300 text-slate-950 font-black tracking-wider text-sm flex justify-center items-center gap-2 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-[0_10px_25px_-5px_rgba(45,212,191,0.25)]"
      >
        {submitting ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            <span>PROCESSANDO PAGAMENTO...</span>
          </>
        ) : (
          <>
            <Lock size={15} />
            <span>{submitLabel}</span>
          </>
        )}
      </button>
    </form>
  );
}

export function StripePaymentElement({
  clientSecret,
  orderId,
  submitLabel,
  disabled,
  onPending,
  onSuccess,
  onError,
}: StripePaymentElementProps) {
  if (!stripePromise) {
    return (
      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200">
        Pagamentos online temporariamente indisponíveis (chave pública Stripe ausente).
      </div>
    );
  }

  const options: StripeElementsOptions = {
    clientSecret,
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
    <Elements stripe={stripePromise} options={options}>
      <PaymentForm
        orderId={orderId}
        submitLabel={submitLabel}
        disabled={disabled}
        onPending={onPending}
        onSuccess={onSuccess}
        onError={onError}
      />
    </Elements>
  );
}
