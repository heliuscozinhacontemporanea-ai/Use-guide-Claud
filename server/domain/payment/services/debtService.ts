import type { AccountDebtRepositoryPort } from '../ports/accountDebtRepositoryPort';
import type { PaymentGatewayPort } from '../ports/paymentGatewayPort';
import type { AccountDebt, AccountDebtReason, AccountDebtView } from '../types/accountDebt';
import { debtDueAt, isDebtOverdue, remainingDebtMinor } from '../utils/debtRules';
import { PaymentDomainError } from './stripePaymentService';

export interface CreateDebtInput {
  accountKey: string;
  reason: AccountDebtReason;
  referenceType: string;
  referenceId: string;
  amountMinor: number;
}

function toView(debt: AccountDebt, now: Date): AccountDebtView {
  return {
    id: debt.id,
    accountKey: debt.accountKey,
    reason: debt.reason,
    referenceType: debt.referenceType,
    amountMinor: debt.amountMinor,
    remainingMinor: debt.status === 'open' ? remainingDebtMinor(debt) : 0,
    status: debt.status,
    dueAt: debt.dueAt,
    overdue: isDebtOverdue(debt, now),
    createdAt: debt.createdAt,
  };
}

/** Dívidas do CNPJ com a plataforma (D14, D16): multa, contestação perdida e reembolso depois do repasse. */
export class DebtService {
  constructor(
    private readonly debts: AccountDebtRepositoryPort,
    private readonly gateway: Pick<PaymentGatewayPort, 'createPaymentIntent'>,
    private readonly now: () => Date = () => new Date()
  ) {}

  /** Idempotente por motivo e referência: o mesmo cancelamento não gera duas multas. */
  async createDebt(input: CreateDebtInput): Promise<AccountDebt | null> {
    if (input.amountMinor <= 0) return null;
    const nowDate = this.now();
    return this.debts.createIfAbsent({
      id: `debt_${input.reason}_${input.referenceType}_${input.referenceId}`,
      ...input,
      offsets: {},
      status: 'open',
      dueAt: debtDueAt(nowDate),
      createdAt: nowDate.toISOString(),
      updatedAt: nowDate.toISOString(),
    });
  }

  async listForAccounts(accountKeys: string[]): Promise<AccountDebtView[]> {
    const nowDate = this.now();
    const debts = await this.debts.listByAccountKeys(accountKeys, 100);
    return debts.map((debt) => toView(debt, nowDate));
  }

  /** Dívida vencida e não paga bloqueia novas vendas do CNPJ (D16, 6A). */
  async hasOverdueDebt(accountKey: string): Promise<boolean> {
    const nowDate = this.now();
    const open = await this.debts.listOpenByAccountKey(accountKey);
    return open.some((debt) => isDebtOverdue(debt, nowDate));
  }

  /**
   * Desconta dívidas vencidas de um repasse, das mais antigas para as mais novas. Cada desconto fica
   * gravado na dívida pela entrada: rodar de novo devolve o mesmo total, sem descontar duas vezes.
   */
  async offsetFromPayout(params: {
    accountKey: string;
    payoutEntryId: string;
    availableMinor: number;
  }): Promise<number> {
    const nowDate = this.now();
    let available = params.availableMinor;
    let offsetTotal = 0;
    const open = await this.debts.listOpenByAccountKey(params.accountKey);
    for (const debt of open) {
      const alreadyFromEntry = debt.offsets[params.payoutEntryId];
      if (alreadyFromEntry !== undefined) {
        offsetTotal += alreadyFromEntry;
        available -= alreadyFromEntry;
        continue;
      }
      if (available <= 0 || !isDebtOverdue(debt, nowDate)) continue;
      const updated = await this.debts.update(debt.id, (current) => {
        if (current.status !== 'open' || current.offsets[params.payoutEntryId] !== undefined) {
          return null;
        }
        const take = Math.min(available, remainingDebtMinor(current));
        if (take <= 0) return null;
        const offsets = { ...current.offsets, [params.payoutEntryId]: take };
        const settled = take >= remainingDebtMinor(current);
        return {
          ...current,
          offsets,
          ...(settled ? { status: 'paid' as const, paidAt: nowDate.toISOString() } : {}),
          updatedAt: nowDate.toISOString(),
        };
      });
      const taken = updated?.offsets[params.payoutEntryId] ?? 0;
      offsetTotal += taken;
      available -= taken;
    }
    return offsetTotal;
  }

  /** Cobrança da dívida no cartão ou Pix, na plataforma e sem transferência (D14). */
  async startPayment(debtId: string, accountKeys: string[]): Promise<{ clientSecret: string }> {
    const debt = await this.debts.get(debtId);
    // Dívida de outro CNPJ responde como inexistente (proteção contra IDOR, AGENTS.md §7.10).
    if (!debt || !accountKeys.includes(debt.accountKey)) {
      throw new PaymentDomainError('NOT_FOUND', 'Dívida não encontrada.', 404);
    }
    const remaining = debt.status === 'open' ? remainingDebtMinor(debt) : 0;
    if (remaining <= 0) {
      throw new PaymentDomainError('DEBT_ALREADY_SETTLED', 'Esta dívida já foi quitada.', 409);
    }
    const intent = await this.gateway.createPaymentIntent({
      orderId: debt.id,
      amountMinor: remaining,
      currency: 'BRL',
      description: 'Use Guide — dívida do parceiro',
      paymentMethodTypes: ['card', 'pix'],
      metadata: {
        referenceType: 'account_debt',
        referenceId: debt.id,
        accountKey: debt.accountKey,
      },
      // O valor faz parte da chave: depois de um desconto no repasse, a cobrança é outra.
      idempotencyKey: `pi_debt_${debt.id}_${remaining}`,
    });
    await this.debts.update(debt.id, (current) => ({
      ...current,
      paymentIntentId: intent.paymentIntentId,
      updatedAt: this.now().toISOString(),
    }));
    return { clientSecret: intent.clientSecret };
  }

  /** Webhook do pagamento da dívida. */
  async markPaid(debtId: string, paymentIntentId: string): Promise<AccountDebt | null> {
    return this.debts.update(debtId, (current) =>
      current.status === 'open'
        ? {
            ...current,
            status: 'paid',
            paymentIntentId,
            paidAt: this.now().toISOString(),
            updatedAt: this.now().toISOString(),
          }
        : null
    );
  }

  /** Admin perdoa a dívida (ex.: prova de serviço apresentada fora do app, D16 5A). */
  async waive(debtId: string, adminUid: string): Promise<AccountDebt> {
    let settled = false;
    const updated = await this.debts.update(debtId, (current) => {
      settled = current.status !== 'open';
      return settled
        ? null
        : { ...current, status: 'waived', waivedBy: adminUid, updatedAt: this.now().toISOString() };
    });
    if (!updated) throw new PaymentDomainError('NOT_FOUND', 'Dívida não encontrada.', 404);
    if (settled) {
      throw new PaymentDomainError('DEBT_ALREADY_SETTLED', 'Esta dívida já foi quitada.', 409);
    }
    return updated;
  }
}
