import { useTranslation } from 'react-i18next';
import { formatMoneyMinor } from '../../../../shared/utils/money';
import type { AdminAccountDebt } from '../../types/adminFinance';
import { formatFortalezaDateTime } from '../../utils/receivablesFormat';
import { debtStatusKey, debtStatusTone } from '../receivables/debtStatus';
import { CARD, DANGER_BUTTON } from './adminFinanceStyles';
import { SellerLine } from './SellerLine';

export function AdminDebtCard({
  debt,
  busy,
  onWaive,
}: {
  debt: AdminAccountDebt;
  busy: boolean;
  onWaive: (debt: AdminAccountDebt) => void;
}) {
  const { t, i18n } = useTranslation();
  const status = debtStatusKey(debt);
  const money = (value: number) => formatMoneyMinor(value, i18n.language);
  return (
    <li className={CARD}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0 space-y-1">
          <p className="text-sm font-bold text-ink">
            {t(`receivables.debts.reason.${debt.reason}`)}
          </p>
          <SellerLine seller={debt} />
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
        <div className="flex items-center justify-between gap-3">
          <dt className="text-ink/70">{t('receivables.debts.remaining')}</dt>
          <dd className="font-bold text-ink">{money(debt.remainingMinor)}</dd>
        </div>
      </dl>
      <p className={`text-[11px] ${debt.overdue ? 'text-danger' : 'text-ink/70'}`}>
        {t(debt.overdue ? 'adminFinance.debts.overdueSince' : 'adminFinance.debts.dueOn', {
          date: formatFortalezaDateTime(debt.dueAt, i18n.language),
        })}
      </p>
      <button type="button" disabled={busy} onClick={() => onWaive(debt)} className={DANGER_BUTTON}>
        {t('adminFinance.debts.waive')}
      </button>
    </li>
  );
}
