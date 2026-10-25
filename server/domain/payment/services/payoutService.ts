import type { PayoutEntryRepositoryPort } from '../ports/payoutEntryRepositoryPort';
import type { PayoutTransferPort } from '../ports/payoutTransferPort';
import type { PayoutEntry } from '../types/payoutEntry';
import { computeReleaseAt, partnerAmountAfterRefunds } from '../utils/payoutRules';

export interface RecordSaleInput {
  referenceType: string;
  referenceId: string;
  accountKey: string;
  paymentIntentId: string;
  chargeId: string;
  grossMinor: number;
  serviceFeeMinor: number;
  platformFeeMinor: number;
  serviceEndsAt: string;
}

export interface ReleaseSummary {
  released: number;
  /** Conta do CNPJ ainda sem repasses habilitados: a entrada espera a próxima rodada. */
  waitingAccount: number;
  failed: number;
}

/** Consulta só o que o repasse precisa da conta do CNPJ (evita depender do serviço inteiro). */
export interface PayoutDestinationLookup {
  getPayoutDestination(accountKey: string): Promise<string | null>;
}

function entryIdFor(referenceType: string, referenceId: string): string {
  return `po_${referenceType}_${referenceId}`;
}

/** Repasses por venda (D14): retidos até o fim do serviço + 48 h e transferidos pelo job. */
export class PayoutService {
  constructor(
    private readonly entries: PayoutEntryRepositoryPort,
    private readonly transfers: PayoutTransferPort,
    private readonly accounts: PayoutDestinationLookup,
    private readonly now: () => Date = () => new Date()
  ) {}

  /** Chamado pelo webhook de pagamento confirmado; repetir não cria outra entrada. */
  async recordSale(input: RecordSaleInput): Promise<PayoutEntry> {
    const nowIso = this.now().toISOString();
    const amounts = partnerAmountAfterRefunds({ ...input, refundedServiceMinor: 0 });
    return this.entries.createIfAbsent({
      id: entryIdFor(input.referenceType, input.referenceId),
      referenceType: input.referenceType,
      referenceId: input.referenceId,
      accountKey: input.accountKey,
      paymentIntentId: input.paymentIntentId,
      chargeId: input.chargeId,
      grossMinor: input.grossMinor,
      serviceFeeMinor: input.serviceFeeMinor,
      platformFeeMinor: input.platformFeeMinor,
      partnerAmountMinor: amounts.partnerAmountMinor,
      serviceEndsAt: input.serviceEndsAt,
      releaseAt: computeReleaseAt(input.serviceEndsAt),
      status: 'pending',
      refunds: {},
      createdAt: nowIso,
      updatedAt: nowIso,
    });
  }

  /**
   * Desconta um reembolso concluído antes do repasse. A chave identifica o reembolso: o mesmo reembolso
   * chega pela resposta do Stripe e pelo webhook, e só conta uma vez.
   */
  async applyRefund(params: {
    referenceType: string;
    referenceId: string;
    refundKey: string;
    amountMinor: number;
    serviceFeeMinor: number;
  }): Promise<PayoutEntry | null> {
    const id = entryIdFor(params.referenceType, params.referenceId);
    return this.entries.update(id, (entry) => {
      if (entry.refunds[params.refundKey] || entry.status === 'released') return null;
      const refunds = {
        ...entry.refunds,
        [params.refundKey]: {
          amountMinor: params.amountMinor,
          serviceFeeMinor: Math.min(params.serviceFeeMinor, params.amountMinor),
          at: this.now().toISOString(),
        },
      };
      const refundedMinor = Object.values(refunds).reduce((sum, r) => sum + r.amountMinor, 0);
      const refundedServiceMinor = Object.values(refunds).reduce(
        (sum, r) => sum + (r.amountMinor - r.serviceFeeMinor),
        0
      );
      const { partnerAmountMinor } = partnerAmountAfterRefunds({ ...entry, refundedServiceMinor });
      const fullyRefunded = refundedMinor >= entry.grossMinor;
      return {
        ...entry,
        refunds,
        partnerAmountMinor,
        ...(fullyRefunded
          ? { status: 'canceled' as const, canceledReason: 'fully_refunded' as const }
          : {}),
        updatedAt: this.now().toISOString(),
      };
    });
  }

  /** Contestação aberta: o repasse espera a decisão (D14). */
  async holdForDispute(paymentIntentId: string): Promise<PayoutEntry | null> {
    const entry = await this.entries.getByPaymentIntentId(paymentIntentId);
    if (!entry) return null;
    return this.entries.update(entry.id, (current) =>
      current.status === 'pending'
        ? {
            ...current,
            status: 'on_hold',
            holdReason: 'dispute',
            updatedAt: this.now().toISOString(),
          }
        : null
    );
  }

  /** Contestação encerrada: ganha, o repasse volta à fila; perdida, o proprietário não recebe a venda. */
  async closeDispute(paymentIntentId: string, won: boolean): Promise<PayoutEntry | null> {
    const entry = await this.entries.getByPaymentIntentId(paymentIntentId);
    if (!entry) return null;
    return this.entries.update(entry.id, (current) => {
      if (current.status !== 'on_hold' || current.holdReason !== 'dispute') return null;
      const { holdReason: _released, ...rest } = current;
      return won
        ? { ...rest, status: 'pending', updatedAt: this.now().toISOString() }
        : {
            ...rest,
            status: 'canceled',
            canceledReason: 'dispute_lost',
            partnerAmountMinor: 0,
            updatedAt: this.now().toISOString(),
          };
    });
  }

  /** Job de hora em hora: idempotente, pode rodar de novo sem transferir duas vezes. */
  async releaseDue(limit = 200): Promise<ReleaseSummary> {
    const summary: ReleaseSummary = { released: 0, waitingAccount: 0, failed: 0 };
    const due = await this.entries.listDue(this.now().toISOString(), limit);
    for (const entry of due) {
      try {
        const destination = await this.accounts.getPayoutDestination(entry.accountKey);
        if (!destination) {
          summary.waitingAccount += 1;
          continue;
        }
        const transfer =
          entry.partnerAmountMinor > 0
            ? await this.transfers.createTransfer({
                amountMinor: entry.partnerAmountMinor,
                destinationAccountId: destination,
                sourceChargeId: entry.chargeId,
                transferGroup: entry.referenceId,
                // Mesma chave em toda rodada: o Stripe devolve a transferência já criada.
                idempotencyKey: `tr_${entry.id}`,
                metadata: {
                  referenceType: entry.referenceType,
                  referenceId: entry.referenceId,
                  payoutEntryId: entry.id,
                },
              })
            : null;
        await this.entries.update(entry.id, (current) =>
          current.status === 'pending'
            ? {
                ...current,
                status: 'released',
                ...(transfer ? { transferId: transfer.transferId } : {}),
                releasedAt: this.now().toISOString(),
                updatedAt: this.now().toISOString(),
              }
            : null
        );
        summary.released += 1;
      } catch (error) {
        // Uma entrada com problema não pode travar as outras; a próxima rodada tenta de novo.
        summary.failed += 1;
        console.error('[PayoutService.releaseDue]', {
          entryId: entry.id,
          name: error instanceof Error ? error.name : 'UnknownError',
        });
      }
    }
    return summary;
  }
}
