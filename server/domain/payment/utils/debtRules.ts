import type { AccountDebt } from '../types/accountDebt';

/** Multa do cancelamento pelo proprietário: 20% do valor vendido, sem as taxas de serviço (D14). */
export const CANCELLATION_PENALTY_BPS = 2000;

/** Prazo para pagar antes do desconto nos repasses e do bloqueio de vendas (D14). */
export const DEBT_DUE_HOURS = 24;

export function cancellationPenaltyMinor(soldServiceValueMinor: number): number {
  // Arredonda para baixo, a favor do proprietário.
  return Math.floor((Math.max(0, soldServiceValueMinor) * CANCELLATION_PENALTY_BPS) / 10_000);
}

export function debtDueAt(now: Date): string {
  return new Date(now.getTime() + DEBT_DUE_HOURS * 60 * 60 * 1000).toISOString();
}

export function remainingDebtMinor(debt: AccountDebt): number {
  const offset = Object.values(debt.offsets).reduce((sum, value) => sum + value, 0);
  return Math.max(0, debt.amountMinor - offset);
}

export function isDebtOverdue(debt: AccountDebt, now: Date): boolean {
  return debt.status === 'open' && remainingDebtMinor(debt) > 0 && debt.dueAt <= now.toISOString();
}
