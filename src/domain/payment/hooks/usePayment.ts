import { useCallback, useRef, useState } from 'react';
import {
  confirmPlanPaymentReturnUseCase,
  createPlanPaymentIntentUseCase,
} from '../application/usecases/paymentUseCases';
import type { PaidPlanId } from '../types/payment';

interface UsePaymentProps {
  planId: PaidPlanId;
  onSuccess?: (paymentId: string) => void;
}

export function usePayment({ planId, onSuccess }: UsePaymentProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'ready' | 'processing' | 'succeeded' | 'failed'>(
    'idle'
  );
  const idempotencyKeyRef = useRef<string>(crypto.randomUUID());

  const initializePlanPayment = useCallback(async () => {
    if (!planId) return;
    setLoading(true);
    setError(null);
    try {
      const response = await createPlanPaymentIntentUseCase({
        planId,
        idempotencyKey: idempotencyKeyRef.current,
      });
      setClientSecret(response.clientSecret);
      setPaymentIntentId(response.paymentIntentId);
      setStatus(response.status === 'succeeded' ? 'succeeded' : 'ready');
      if (response.status === 'succeeded') {
        onSuccess?.(response.paymentIntentId);
      }
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : 'Não foi possível iniciar o pagamento via Stripe.'
      );
      setStatus('failed');
    } finally {
      setLoading(false);
    }
  }, [planId, onSuccess]);

  const confirmPaymentOnBackend = useCallback(
    async (resolvedPaymentIntentId?: string) => {
      const targetId = resolvedPaymentIntentId || paymentIntentId;
      if (!targetId) return;
      setStatus('processing');
      try {
        const res = await confirmPlanPaymentReturnUseCase({
          paymentIntentId: targetId,
        });
        if (res.status === 'succeeded') {
          setStatus('succeeded');
          onSuccess?.(targetId);
        } else if (res.status === 'failed' || res.status === 'canceled') {
          setStatus('failed');
          setError('O pagamento não foi aprovado.');
        } else {
          setStatus('processing');
        }
      } catch (err: unknown) {
        setError(
          err instanceof Error
            ? err.message
            : 'Aguardando confirmação final do pagamento.'
        );
      }
    },
    [paymentIntentId, onSuccess]
  );

  const resetAttempt = useCallback(() => {
    idempotencyKeyRef.current = crypto.randomUUID();
    setClientSecret(null);
    setPaymentIntentId(null);
    setError(null);
    setStatus('idle');
  }, []);

  return {
    loading,
    error,
    setError,
    clientSecret,
    paymentIntentId,
    status,
    initializePlanPayment,
    confirmPaymentOnBackend,
    resetAttempt,
  };
}
