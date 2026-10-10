import { ApiPaymentAdapter } from './api/apiPaymentAdapter';
import { PaymentApiPort } from './ports/paymentApiPort';

export const paymentApiAdapter: PaymentApiPort = new ApiPaymentAdapter();
