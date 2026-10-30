import type { PayoutEntryRepositoryPort } from '../ports/payoutEntryRepositoryPort';
import type { PayoutTransferPort } from '../ports/payoutTransferPort';
import type { PayoutEntry } from '../types/payoutEntry';
import type { DebtService } from './debtService';
import type { PayoutEntryView, PayoutHoldReason } from '../types/payoutEntry';
import {
  computeReleaseAt,
  partnerAmountAfterRefunds,
  withHold,
  withoutHold,
} from '../utils/payoutRules';

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
  title?: string;
  /** Retenções desde a criação (ex.: `service_proof`), para não haver momento em que o repasse saia. */
  holdReasons?: PayoutHoldReason[];
}

export interface ReleaseSummary {
  released: number;
  /** Conta do CNPJ ainda sem repasses habilitados: a entrada espera a próxima rodada. */
  waitingAccount: number;
  failed: number;
}

/** Contestação encerrada, do ponto de vista do repasse (D14, D16). */
export type DisputeOutcome = 'won' | 'lost_platform_absorbs' | 'lost_partner_pays';

/** Consulta só o que o repasse precisa da conta do CNPJ (evita depender do serviço inteiro). */
export interface PayoutDestinationLookup {
  getPayoutDestination(accountKey: string): Promise<string | null>;
}

function toEntryView(entry: PayoutEntry): PayoutEntryView {
  const refunds = Object.values(entry.refunds);
  const refundedMinor = refunds.reduce((sum, refund) => sum + refund.amountMinor, 0);
  const refundedServiceFee = refunds.reduce((sum, refund) => sum + refund.serviceFeeMinor, 0);
  const serviceFeeMinor = Math.max(0, entry.serviceFeeMinor - refundedServiceFee);
  // O que sobra depois da taxa de serviço, dos reembolsos e da parte do proprietário é a taxa da plataforma.
  const platformFeeMinor = Math.max(
    0,
    entry.grossMinor - serviceFeeMinor - refundedMinor - entry.partnerAmountMinor
  );
  return {
    id: entry.id,
    referenceType: entry.referenceType,
    referenceId: entry.referenceId,
    title: entry.title ?? null,
    accountKey: entry.accountKey,
    grossMinor: entry.grossMinor,
    serviceFeeMinor,
    refundedMinor,
    platformFeeMinor,
    partnerAmountMinor: entry.partnerAmountMinor,
    offsetMinor: entry.offsetMinor ?? 0,
    status: entry.status,
    holdReasons: entry.holdReasons ?? [],
    serviceEndsAt: entry.serviceEndsAt,
    releaseAt: entry.releaseAt,
    releasedAt: entry.releasedAt ?? null,
    canceledReason: entry.canceledReason ?? null,
    createdAt: entry.createdAt,
  };
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
    private readonly debts: Pick<DebtService, 'offsetFromPayout' | 'createDebt'>,
    private readonly now: () => Date = () => new Date()
  ) {}

  async getForReference(referenceType: string, referenceId: string): Promise<PayoutEntry | null> {
    return this.entries.get(entryIdFor(referenceType, referenceId));
  }

  /** Extrato do parceiro, paginado por cursor (AGENTS.md §6.4). */
  async listForAccounts(
    accountKeys: string[],
    limit: number,
    cursor?: string
  ): Promise<{ data: PayoutEntryView[]; nextCursor: string | null }> {
    const entries = await this.entries.listByAccountKeys(accountKeys, limit, cursor);
    const last = entries[entries.length - 1];
    return {
      data: entries.map(toEntryView),
      nextCursor: entries.length === limit && last ? last.id : null,
    };
  }

  /** Chamado pelo webhook de pagamento confirmado; repetir não cria outra entrada. */
  async recordSale(input: RecordSaleInput): Promise<PayoutEntry> {
    const nowIso = this.now().toISOString();
    const amounts = partnerAmountAfterRefunds({ ...input, refundedServiceMinor: 0 });
    return this.entries.createIfAbsent({
      id: entryIdFor(input.referenceType, input.referenceId),
      referenceType: input.referenceType,
      referenceId: input.referenceId,
      ...(input.title ? { title: input.title.slice(0, 160) } : {}),
      accountKey: input.accountKey,
      paymentIntentId: input.paymentIntentId,
      chargeId: input.chargeId,
      grossMinor: input.grossMinor,
      serviceFeeMinor: input.serviceFeeMinor,
      platformFeeMinor: input.platformFeeMinor,
      partnerAmountMinor: amounts.partnerAmountMinor,
      serviceEndsAt: input.serviceEndsAt,
      releaseAt: computeReleaseAt(input.serviceEndsAt),
      ...(input.holdReasons?.length
        ? { status: 'on_hold' as const, holdReasons: [...new Set(input.holdReasons)] }
        : { status: 'pending' as const }),
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
    let owedBack = 0;
    const updated = await this.entries.update(id, (entry) => {
      if (entry.refunds[params.refundKey]) return null;
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
      if (entry.status === 'released') {
        // Já transferido: a diferença vira dívida do CNPJ (B29), e a entrada registra o reembolso.
        owedBack = Math.max(0, entry.partnerAmountMinor - partnerAmountMinor);
        return { ...entry, refunds, partnerAmountMinor, updatedAt: this.now().toISOString() };
      }
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
    if (updated && owedBack > 0) {
      await this.debts.createDebt({
        accountKey: updated.accountKey,
        reason: 'post_release_refund',
        referenceType: updated.referenceType,
        referenceId: `${updated.referenceId}_${params.refundKey}`,
        amountMinor: owedBack,
      });
    }
    return updated;
  }

  /** Venda reagendada (D16, 4A): o repasse passa a sair 48 h depois do fim na nova data. */
  async reschedule(
    referenceType: string,
    referenceId: string,
    serviceEndsAt: string
  ): Promise<PayoutEntry | null> {
    return this.entries.update(entryIdFor(referenceType, referenceId), (current) =>
      current.status === 'pending' || current.status === 'on_hold'
        ? {
            ...current,
            serviceEndsAt,
            releaseAt: computeReleaseAt(serviceEndsAt),
            updatedAt: this.now().toISOString(),
          }
        : null
    );
  }

  /** Contestação aberta: o repasse espera a decisão (D14). */
  async holdForDispute(paymentIntentId: string): Promise<PayoutEntry | null> {
    const entry = await this.entries.getByPaymentIntentId(paymentIntentId);
    return entry ? this.setHold(entry.id, 'dispute', true) : null;
  }

  /** Solta uma retenção da venda pela referência; sem entrada ou sem essa retenção, não faz nada. */
  async releaseHold(
    referenceType: string,
    referenceId: string,
    reason: PayoutHoldReason
  ): Promise<PayoutEntry | null> {
    return this.setHold(entryIdFor(referenceType, referenceId), reason, false);
  }

  /** Retém ou solta a venda por um motivo; as outras retenções continuam valendo. */
  async setHold(
    entryId: string,
    reason: PayoutHoldReason,
    hold: boolean
  ): Promise<PayoutEntry | null> {
    return this.entries.update(entryId, (current) => {
      const next = hold ? withHold(current, reason) : withoutHold(current, reason);
      return next ? { ...next, updatedAt: this.now().toISOString() } : null;
    });
  }

  /**
   * Contestação encerrada. Ganha, ou perdida com prova de uso (a plataforma arca), o repasse volta à
   * fila. Perdida sem prova: o proprietário não recebe a venda ou, se já recebeu, a parte dele vira
   * dívida do CNPJ (D14, D16).
   */
  async closeDispute(
    paymentIntentId: string,
    outcome: DisputeOutcome
  ): Promise<PayoutEntry | null> {
    const entry = await this.entries.getByPaymentIntentId(paymentIntentId);
    if (!entry) return null;
    if (entry.status === 'released') {
      if (outcome === 'lost_partner_pays') {
        await this.debts.createDebt({
          accountKey: entry.accountKey,
          reason: 'dispute_lost',
          referenceType: entry.referenceType,
          referenceId: entry.referenceId,
          amountMinor: entry.partnerAmountMinor,
        });
      }
      return entry;
    }
    if (outcome !== 'lost_partner_pays') return this.setHold(entry.id, 'dispute', false);
    return this.entries.update(entry.id, (current) => {
      if (!current.holdReasons?.includes('dispute')) return null;
      const { holdReasons: _released, ...rest } = current;
      return {
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
        // Dívida vencida do CNPJ sai do repasse antes da transferência (D14).
        const offsetMinor = await this.debts.offsetFromPayout({
          accountKey: entry.accountKey,
          payoutEntryId: entry.id,
          availableMinor: entry.partnerAmountMinor,
        });
        const transferMinor = entry.partnerAmountMinor - offsetMinor;
        const transfer =
          transferMinor > 0
            ? await this.transfers.createTransfer({
                amountMinor: transferMinor,
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
                ...(offsetMinor > 0 ? { offsetMinor } : {}),
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
