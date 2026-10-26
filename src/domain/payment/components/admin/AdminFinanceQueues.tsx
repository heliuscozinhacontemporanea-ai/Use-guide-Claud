import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AdminDebtQueue } from './AdminDebtQueue';
import { ForceMajeureQueue } from './ForceMajeureQueue';
import { SaleClaimQueue } from './SaleClaimQueue';

type FinanceTab = 'claims' | 'forceMajeure' | 'debts';
const TABS: FinanceTab[] = ['claims', 'forceMajeure', 'debts'];

/** Filas financeiras do admin (D16): reclamações, força maior e dívidas dos CNPJs. */
export function AdminFinanceQueues() {
  const { t } = useTranslation();
  const [tab, setTab] = useState<FinanceTab>('claims');
  const [notice, setNotice] = useState<{ message: string; error: boolean } | null>(null);
  const show = (message: string, error = false) => setNotice({ message, error });
  return (
    <section className="space-y-4" aria-labelledby="admin-finance-title">
      <h2 id="admin-finance-title" className="text-xl font-display font-bold text-ink">
        {t('adminFinance.title')}
      </h2>
      <div className="flex flex-wrap gap-2" role="group" aria-label={t('adminFinance.tabsLabel')}>
        {TABS.map((value) => (
          <button
            key={value}
            type="button"
            aria-pressed={tab === value}
            onClick={() => {
              setTab(value);
              setNotice(null);
            }}
            className={`press min-h-11 px-4 rounded-xl text-xs font-bold focus-visible:ring-2 focus-visible:ring-teal-400/50 ${
              tab === value
                ? 'bg-teal-400 text-slate-950'
                : 'bg-surface border border-line text-ink hover:bg-accent-soft'
            }`}
          >
            {t(`adminFinance.tabs.${value}`)}
          </button>
        ))}
      </div>
      {notice && (
        <p
          role={notice.error ? 'alert' : 'status'}
          className={`p-3 rounded-xl border text-xs ${
            notice.error
              ? 'bg-danger-soft border-danger-line text-danger'
              : 'bg-success-soft border-success-line text-success'
          }`}
        >
          {notice.message}
        </p>
      )}
      {tab === 'claims' ? (
        <SaleClaimQueue onNotice={show} />
      ) : tab === 'forceMajeure' ? (
        <ForceMajeureQueue onNotice={show} />
      ) : (
        <AdminDebtQueue onNotice={show} />
      )}
    </section>
  );
}
