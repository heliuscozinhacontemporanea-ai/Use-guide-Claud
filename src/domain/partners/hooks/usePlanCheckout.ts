import { useRef, useState } from 'react';
import type { PaidPlanSelection } from '../components/plan/ListingPlanDialog';

/**
 * Checkout do plano de um estabelecimento. O modal mostra a própria tela de sucesso; os selos e o
 * perfil são relidos só quando o parceiro fecha.
 */
export function usePlanCheckout(onPlanPurchased?: () => void) {
  // Troca a chave dos selos de plano para relerem o estado depois do trial ou da compra.
  const [planVersion, setPlanVersion] = useState(0);
  const [open, setOpen] = useState(false);
  const [selection, setSelection] = useState<PaidPlanSelection>({
    itemId: '',
    planId: 'monthly',
    itemName: '',
    amountMinor: 0,
  });
  const purchased = useRef(false);

  return {
    planVersion,
    bumpPlanVersion: () => setPlanVersion((version) => version + 1),
    open,
    selection,
    start: (next: PaidPlanSelection) => {
      setSelection(next);
      setOpen(true);
    },
    onSuccess: () => {
      purchased.current = true;
    },
    onClose: () => {
      setOpen(false);
      if (purchased.current) {
        purchased.current = false;
        setPlanVersion((version) => version + 1);
        onPlanPurchased?.();
      }
    },
  };
}
