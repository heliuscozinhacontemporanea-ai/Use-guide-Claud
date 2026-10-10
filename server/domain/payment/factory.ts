import { FirebaseAdminTransactionAdapter } from './adapters/firebaseAdminTransactionAdapter';
import { StripeConnectMarketplaceAdapter } from './adapters/stripeConnectMarketplaceAdapter';
import { StripePaymentGatewayAdapter } from './adapters/stripePaymentGatewayAdapter';
import type { MarketplaceAccountPort } from './ports/marketplaceAccountPort';
import type { PaymentGatewayPort } from './ports/paymentGatewayPort';
import type { TransactionRepositoryPort } from './ports/transactionRepositoryPort';
import { CheckoutService } from './services/checkoutService';
import { StripePaymentService } from './services/stripePaymentService';

export const paymentGatewayAdapter: PaymentGatewayPort =
  new StripePaymentGatewayAdapter();
export const marketplaceAccountAdapter: MarketplaceAccountPort =
  new StripeConnectMarketplaceAdapter();
export const transactionRepository: TransactionRepositoryPort =
  new FirebaseAdminTransactionAdapter();

export const stripePaymentService = new StripePaymentService(
  paymentGatewayAdapter,
  marketplaceAccountAdapter,
  transactionRepository
);

export const checkoutService = new CheckoutService(
  stripePaymentService,
  transactionRepository
);
