import { useCallback, useRef, useState } from 'react';
import { confirmPlanPaymentReturnUseCase } from '../application/usecases/confirmPlanPaymentReturnUseCase';
import { createPlanPaymentIntentUseCase } from '../application/usecases/createPlanPaymentIntentUseCase';
import type { PaidPlanId } from '../types/payment';
import { getPaymentErrorMessage } from '../utils/paymentErrorMessage';

interface UsePaymentProps {
  itemId: string;
  planId: PaidPlanId;
  onSuccess?: (paymentId: string) => void;
}

export function usePayment({ itemId, planId, onSuccess }: UsePaymentProps) {
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
        itemId,
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
      setError(getPaymentErrorMessage(err));
      setStatus('failed');
    } finally {
      setLoading(false);
    }
  }, [itemId, planId, onSuccess]);

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
          setError(getPaymentErrorMessage(new Error('PAYMENT_FAILED')));
        } else {
          setStatus('processing');
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Aguardando confirmação final do pagamento.');
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
