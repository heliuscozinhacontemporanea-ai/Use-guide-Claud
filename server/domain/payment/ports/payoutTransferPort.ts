export interface CreatePayoutTransferInput {
  amountMinor: number;
  destinationAccountId: string;
  /** Cobrança de origem: a transferência só executa quando esse dinheiro está disponível. */
  sourceChargeId: string;
  transferGroup: string;
  idempotencyKey: string;
  metadata: Record<string, string>;
}

export interface PayoutTransferPort {
  createTransfer(input: CreatePayoutTransferInput): Promise<{ transferId: string }>;
}
