import { AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { usePartnerDebts } from '../../hooks/usePartnerDebts';
import { DebtList } from '../receivables/DebtList';
import { usePaymentAccounts } from './usePaymentAccounts';

/** Dívidas (aba Dívidas de Ganhos): multa, pagamento e força maior, como já existiam (D16). */
export function PartnerDebtsPanel() {
  const { t } = useTranslation();
  const { accounts } = usePaymentAccounts();
  const debtsState = usePartnerDebts();
  const blocked = debtsState.debts.some((debt) => debt.overdue);
  return (
    <div className="space-y-4">
      {blocked && (
        <p
          role="alert"
          className="flex items-start gap-2 p-3 rounded-xl bg-danger-soft border border-danger-line text-[13px] text-danger"
        >
          <AlertTriangle size={16} className="shrink-0 mt-0.5" aria-hidden="true" />
          {t('receivables.blockedBanner')}
        </p>
      )}
      <DebtList accounts={accounts ?? []} debtsState={debtsState} />
    </div>
  );
}
