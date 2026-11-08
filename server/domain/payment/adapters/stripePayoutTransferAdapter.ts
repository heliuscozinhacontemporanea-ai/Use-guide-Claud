import Stripe from 'stripe';
import type { CreatePayoutTransferInput, PayoutTransferPort } from '../ports/payoutTransferPort';

export class StripePayoutTransferAdapter implements PayoutTransferPort {
  private stripeClient: Stripe | null = null;

  private get stripe(): Stripe {
    if (!this.stripeClient) {
      const secretKey = process.env.STRIPE_SECRET_KEY;
      if (!secretKey) throw new Error('STRIPE_SECRET_KEY não configurada.');
      this.stripeClient = new Stripe(secretKey);
    }
    return this.stripeClient;
  }

  async createTransfer(input: CreatePayoutTransferInput): Promise<{ transferId: string }> {
    // `source_transaction` faz a transferência esperar o dinheiro da cobrança ficar disponível.
    // Referência: https://docs.stripe.com/connect/separate-charges-and-transfers#transfer-availability
    const transfer = await this.stripe.transfers.create(
      {
        amount: input.amountMinor,
        currency: 'brl',
        destination: input.destinationAccountId,
        source_transaction: input.sourceChargeId,
        transfer_group: input.transferGroup,
        metadata: input.metadata,
      },
      { idempotencyKey: input.idempotencyKey }
    );
    return { transferId: transfer.id };
  }
}
