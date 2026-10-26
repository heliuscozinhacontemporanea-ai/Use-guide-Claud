import { ApiPaymentAdapter } from './api/apiPaymentAdapter';
import { ApiReceivablesAdapter } from './api/apiReceivablesAdapter';
import { PaymentApiPort } from './ports/paymentApiPort';
import type { ReceivablesApiPort } from './ports/receivablesApiPort';

export const paymentApiAdapter: PaymentApiPort = new ApiPaymentAdapter();
export const receivablesApiAdapter: ReceivablesApiPort = new ApiReceivablesAdapter();
