import type { AccountDebtView } from '../../types/receivables';

export type DebtStatusKey = 'open' | 'overdue' | 'suspended' | 'paid' | 'waived' | 'rejected';

const TONE: Record<DebtStatusKey, string> = {
  open: 'bg-warn-soft text-warn border-warn-line',
  overdue: 'bg-danger-soft text-danger border-danger-line',
  suspended: 'bg-info-soft text-info border-info-line',
  paid: 'bg-success-soft text-success border-success-line',
  waived: 'bg-success-soft text-success border-success-line',
  rejected: 'bg-danger-soft text-danger border-danger-line',
};

export function debtStatusKey(debt: AccountDebtView): DebtStatusKey {
  if (debt.status === 'open') {
    if (debt.overdue) return 'overdue';
    return debt.forceMajeureStatus === 'rejected' ? 'rejected' : 'open';
  }
  return debt.status;
}

export function debtStatusTone(key: DebtStatusKey): string {
  return TONE[key];
}

/** Mesmas condições do backend; o servidor confere de novo. */
export function canPayDebt(debt: AccountDebtView): boolean {
  return debt.status === 'open' && debt.remainingMinor > 0;
}

export function canDeclareForceMajeure(debt: AccountDebtView, now: Date): boolean {
  return (
    debt.reason === 'cancellation_penalty' &&
    debt.status === 'open' &&
    !debt.forceMajeureStatus &&
    new Date(debt.dueAt).getTime() > now.getTime()
  );
}
