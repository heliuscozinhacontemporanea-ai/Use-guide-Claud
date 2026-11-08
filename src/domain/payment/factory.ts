import { ApiAdminFinanceAdapter } from './api/apiAdminFinanceAdapter';
import { ApiPaymentAdapter } from './api/apiPaymentAdapter';
import { ApiReceivablesAdapter } from './api/apiReceivablesAdapter';
import type { AdminFinanceApiPort } from './ports/adminFinanceApiPort';
import { PaymentApiPort } from './ports/paymentApiPort';
import type { ReceivablesApiPort } from './ports/receivablesApiPort';

export const paymentApiAdapter: PaymentApiPort = new ApiPaymentAdapter();
export const receivablesApiAdapter: ReceivablesApiPort = new ApiReceivablesAdapter();
export const adminFinanceApiAdapter: AdminFinanceApiPort = new ApiAdminFinanceAdapter();
