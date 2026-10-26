import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { usePartnerDebts } from '../../hooks/usePartnerDebts';
import type { PartnerPaymentAccount } from '../../types/payment';
import type { AccountDebtView } from '../../types/receivables';
import { DebtCard } from './DebtCard';
import { DebtPaymentDialog } from './DebtPaymentDialog';
import { ForceMajeureDialog } from './ForceMajeureDialog';
import { ReceivablesEmpty, ReceivablesError, ReceivablesLoading } from './ReceivablesState';

export function DebtList({
  accounts,
  debtsState,
}: {
  accounts: PartnerPaymentAccount[];
  debtsState: ReturnType<typeof usePartnerDebts>;
}) {
  const { t } = useTranslation();
  const { debts, loading, error, reload } = debtsState;
  const [paying, setPaying] = useState<AccountDebtView | null>(null);
  const [declaring, setDeclaring] = useState<AccountDebtView | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const documentOf = (accountKey: string) =>
    accounts.find((account) => account.accountKey === accountKey)?.maskedDocument;
  const now = new Date();

  return (
    <section className="space-y-3" aria-label={t('receivables.debts.title')}>
      <div className="space-y-1">
        <h5 className="text-sm font-bold text-ink">{t('receivables.debts.title')}</h5>
        <p className="text-xs text-ink/70">{t('receivables.debts.hint')}</p>
      </div>
      {notice && (
        <p
          role="status"
          className="p-3 rounded-xl bg-success-soft border border-success-line text-xs text-success"
        >
          {notice}
        </p>
      )}
      {error ? (
        <ReceivablesError messageKey={error} onRetry={() => void reload()} />
      ) : loading && debts.length === 0 ? (
        <ReceivablesLoading label={t('receivables.debts.loading')} />
      ) : debts.length === 0 ? (
        <ReceivablesEmpty message={t('receivables.debts.empty')} />
      ) : (
        <ul className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {debts.map((debt) => (
            <DebtCard
              key={debt.id}
              debt={debt}
              maskedDocument={documentOf(debt.accountKey)}
              now={now}
              onPay={setPaying}
              onDeclare={setDeclaring}
            />
          ))}
        </ul>
      )}
      <DebtPaymentDialog
        debt={paying}
        onClose={() => setPaying(null)}
        onPaid={() => {
          setPaying(null);
          setNotice(t('receivables.payDialog.sent'));
          void reload();
        }}
      />
      {/* A chave recria o formulário vazio para cada multa. */}
      <ForceMajeureDialog
        key={declaring?.id ?? 'none'}
        debt={declaring}
        onClose={() => setDeclaring(null)}
        onDeclared={() => {
          setDeclaring(null);
          setNotice(t('receivables.forceMajeure.sent'));
          void reload();
        }}
      />
    </section>
  );
}
