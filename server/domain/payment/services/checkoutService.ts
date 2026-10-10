import type { TransactionRepositoryPort } from '../ports/transactionRepositoryPort';
import type { StripePaymentService } from './stripePaymentService';

export class CheckoutService {
  constructor(
    private readonly stripePaymentService: StripePaymentService,
    private readonly transactionRepository: TransactionRepositoryPort
  ) {}

  async createPlanPaymentIntent(params: {
    buyerId: string;
    planId: string;
    planName: string;
    amountMinor: number;
    idempotencyKey: string;
  }) {
    return this.stripePaymentService.createPlanPaymentIntent(params);
  }

  async getTransactionStatus(transactionId: string) {
    return this.transactionRepository.getTransaction(transactionId);
  }
}
