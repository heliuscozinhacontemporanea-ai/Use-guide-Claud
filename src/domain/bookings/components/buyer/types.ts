import type { ReactNode } from 'react';

/** Props neutras do Payment Element, montado pela composição (o domínio não importa o payment). */
export interface PaymentElementSlotProps {
  clientSecret: string;
  bookingId: string;
  submitLabel: string;
  onSucceeded: () => void;
  onFailed: (message: string) => void;
}

export type RenderPaymentElement = (props: PaymentElementSlotProps) => ReactNode;
