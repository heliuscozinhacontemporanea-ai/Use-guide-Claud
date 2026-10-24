import { FirebaseAdminTransactionAdapter } from './adapters/firebaseAdminTransactionAdapter';
import { FirestorePaymentAccountAdapter } from './adapters/firestorePaymentAccountAdapter';
import { FirestorePlanSubscriptionAdapter } from './adapters/firestorePlanSubscriptionAdapter';
import { StripeBillingGatewayAdapter } from './adapters/stripeBillingGatewayAdapter';
import { StripeConnectMarketplaceAdapter } from './adapters/stripeConnectMarketplaceAdapter';
import { StripePaymentGatewayAdapter } from './adapters/stripePaymentGatewayAdapter';
import type { MarketplaceAccountPort } from './ports/marketplaceAccountPort';
import type { PaymentGatewayPort } from './ports/paymentGatewayPort';
import type { TransactionRepositoryPort } from './ports/transactionRepositoryPort';
import { BillingService } from './services/billingService';
import { CheckoutService } from './services/checkoutService';
import { PaymentAccountService } from './services/paymentAccountService';
import { StripePaymentService } from './services/stripePaymentService';

export const paymentGatewayAdapter: PaymentGatewayPort = new StripePaymentGatewayAdapter();
export const marketplaceAccountAdapter: MarketplaceAccountPort =
  new StripeConnectMarketplaceAdapter();
export const transactionRepository: TransactionRepositoryPort =
  new FirebaseAdminTransactionAdapter();

export const paymentAccountService = new PaymentAccountService(
  new FirestorePaymentAccountAdapter(),
  marketplaceAccountAdapter
);

export const stripePaymentService = new StripePaymentService(
  paymentGatewayAdapter,
  transactionRepository,
  paymentAccountService
);

export const checkoutService = new CheckoutService(stripePaymentService, transactionRepository);

let billingService: BillingService | null = null;

export function getBillingService(): BillingService {
  billingService ??= new BillingService(
    new StripeBillingGatewayAdapter(),
    new FirestorePlanSubscriptionAdapter()
  );
  return billingService;
}
