import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { usePartnerPayouts } from '../../hooks/usePartnerPayouts';
import type { PartnerPaymentAccount } from '../../types/payment';
import { PayoutEntryRow } from './PayoutEntryRow';
import { ListEmpty, ListError, ListLoading } from '../../../../ui/components/ListState';

export function PayoutStatement({ accounts }: { accounts: PartnerPaymentAccount[] }) {
  const { t } = useTranslation();
  const filterId = useId();
  const [accountKey, setAccountKey] = useState('');
  const { entries, loading, error, hasMore, reload, loadMore } = usePartnerPayouts(
    accountKey || undefined
  );

  return (
    <section className="space-y-3" aria-labelledby={`${filterId}-title`}>
      <div className="space-y-1">
        <h5 id={`${filterId}-title`} className="text-sm font-bold text-ink">
          {t('receivables.statement.title')}
        </h5>
        <p className="text-xs text-ink/70">{t('receivables.statement.hint')}</p>
      </div>
      {accounts.length > 1 && (
        <div className="flex flex-wrap items-center gap-2">
          <label htmlFor={filterId} className="text-xs font-bold text-ink/80">
            {t('receivables.statement.filterLabel')}
          </label>
          <select
            id={filterId}
            value={accountKey}
            onChange={(event) => setAccountKey(event.target.value)}
            className="min-h-11 px-3 rounded-xl bg-surface border border-line text-xs text-ink focus-visible:ring-2 focus-visible:ring-teal-400/50"
          >
            <option value="">{t('receivables.statement.allAccounts')}</option>
            {accounts.map((account) => (
              <option key={account.accountKey} value={account.accountKey}>
                {account.maskedDocument}
              </option>
            ))}
          </select>
        </div>
      )}
      {error ? (
        <ListError message={t(error)} onRetry={() => void reload()} />
      ) : loading && entries.length === 0 ? (
        <ListLoading label={t('receivables.statement.loading')} />
      ) : entries.length === 0 ? (
        <ListEmpty message={t('receivables.statement.empty')} />
      ) : (
        <>
          <ul className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {entries.map((entry) => (
              <PayoutEntryRow key={entry.id} entry={entry} />
            ))}
          </ul>
          {hasMore && (
            <button
              type="button"
              disabled={loading}
              onClick={() => void loadMore()}
              className="press w-full min-h-11 rounded-xl border border-line text-xs font-bold text-ink disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-teal-400/50"
            >
              {t('receivables.statement.loadMore')}
            </button>
          )}
        </>
      )}
    </section>
  );
}
