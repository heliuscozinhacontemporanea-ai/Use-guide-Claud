import { FirebaseAdminTransactionAdapter } from './adapters/firebaseAdminTransactionAdapter';
import { FirestoreAccountDebtAdapter } from './adapters/firestoreAccountDebtAdapter';
import { FirestorePaymentAccountAdapter } from './adapters/firestorePaymentAccountAdapter';
import { FirestorePayoutEntryAdapter } from './adapters/firestorePayoutEntryAdapter';
import { FirestorePlanSubscriptionAdapter } from './adapters/firestorePlanSubscriptionAdapter';
import { StripeBillingGatewayAdapter } from './adapters/stripeBillingGatewayAdapter';
import { StripeConnectMarketplaceAdapter } from './adapters/stripeConnectMarketplaceAdapter';
import { StripePaymentGatewayAdapter } from './adapters/stripePaymentGatewayAdapter';
import { StripePayoutTransferAdapter } from './adapters/stripePayoutTransferAdapter';
import type { MarketplaceAccountPort } from './ports/marketplaceAccountPort';
import type { PaymentGatewayPort } from './ports/paymentGatewayPort';
import type { TransactionRepositoryPort } from './ports/transactionRepositoryPort';
import { BillingService } from './services/billingService';
import { CheckoutService } from './services/checkoutService';
import { DebtService } from './services/debtService';
import { PaymentAccountService } from './services/paymentAccountService';
import { PayoutService } from './services/payoutService';
import { StripePaymentService } from './services/stripePaymentService';

export const paymentGatewayAdapter: PaymentGatewayPort = new StripePaymentGatewayAdapter();
export const marketplaceAccountAdapter: MarketplaceAccountPort =
  new StripeConnectMarketplaceAdapter();
export const transactionRepository: TransactionRepositoryPort =
  new FirebaseAdminTransactionAdapter();

export const debtService = new DebtService(
  new FirestoreAccountDebtAdapter(),
  paymentGatewayAdapter
);

export const paymentAccountService = new PaymentAccountService(
  new FirestorePaymentAccountAdapter(),
  marketplaceAccountAdapter,
  debtService
);

export const stripePaymentService = new StripePaymentService(
  paymentGatewayAdapter,
  transactionRepository,
  paymentAccountService
);

export const payoutService = new PayoutService(
  new FirestorePayoutEntryAdapter(),
  new StripePayoutTransferAdapter(),
  paymentAccountService,
  debtService
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
