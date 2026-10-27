import { useTranslation } from 'react-i18next';
import { BUTTON_PRIMARY, BUTTON_SECONDARY } from '../../../../ui/styles/controls';
import { formatMoneyMinor } from '../../../../shared/utils/money';
import type { AccountDebtView } from '../../types/receivables';
import { canDeclareForceMajeure, canPayDebt, debtStatusKey, debtStatusTone } from './debtStatus';
import { formatBusinessDateTime } from '../../../../shared/utils/businessDateTime';

export function DebtCard({
  debt,
  maskedDocument,
  now,
  onPay,
  onDeclare,
}: {
  debt: AccountDebtView;
  maskedDocument?: string;
  now: Date;
  onPay: (debt: AccountDebtView) => void;
  onDeclare: (debt: AccountDebtView) => void;
}) {
  const { t, i18n } = useTranslation();
  const status = debtStatusKey(debt);
  const money = (value: number) => formatMoneyMinor(value, i18n.language);
  const showPay = canPayDebt(debt);
  const showDeclare = canDeclareForceMajeure(debt, now);

  return (
    <li className="p-4 rounded-2xl bg-surface border border-line space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0 space-y-0.5">
          <p className="text-sm font-bold text-ink">
            {t(`receivables.debts.reason.${debt.reason}`)}
          </p>
          {maskedDocument && (
            <p className="text-xs text-ink/70 font-mono break-all">{maskedDocument}</p>
          )}
        </div>
        <span
          className={`shrink-0 max-w-[45%] px-2.5 py-1 rounded-full border text-[11px] font-bold text-center ${debtStatusTone(status)}`}
        >
          {t(`receivables.debts.status.${status}`)}
        </span>
      </div>
      <dl className="space-y-1 text-xs">
        <div className="flex items-center justify-between gap-3">
          <dt className="text-ink/70">{t('receivables.debts.amount')}</dt>
          <dd className="text-ink">{money(debt.amountMinor)}</dd>
        </div>
        {debt.remainingMinor > 0 && debt.remainingMinor !== debt.amountMinor && (
          <div className="flex items-center justify-between gap-3">
            <dt className="text-ink/70">{t('receivables.debts.remaining')}</dt>
            <dd className="font-bold text-ink">{money(debt.remainingMinor)}</dd>
          </div>
        )}
      </dl>
      {(status === 'open' || status === 'overdue' || status === 'rejected') && (
        <p className={`text-[11px] ${status === 'overdue' ? 'text-danger' : 'text-ink/70'}`}>
          {status === 'overdue'
            ? t('receivables.debts.overdueExplain')
            : t('receivables.debts.dueOn', {
                date: formatBusinessDateTime(debt.dueAt, i18n.language),
              })}
        </p>
      )}
      {(showPay || showDeclare) && (
        <div className="flex flex-wrap gap-2">
          {showPay && (
            <button type="button" onClick={() => onPay(debt)} className={BUTTON_PRIMARY}>
              {t('receivables.debts.pay')}
            </button>
          )}
          {showDeclare && (
            <button type="button" onClick={() => onDeclare(debt)} className={BUTTON_SECONDARY}>
              {t('receivables.debts.declare')}
            </button>
          )}
        </div>
      )}
    </li>
  );
}
