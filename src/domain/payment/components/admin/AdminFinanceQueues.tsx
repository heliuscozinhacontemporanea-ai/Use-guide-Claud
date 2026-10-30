import { type ReactNode, useState } from 'react';
import type { AdminSaleClaim } from '../../types/adminFinance';
import { useTranslation } from 'react-i18next';
import { SegmentedControl } from '../../../../ui/components/SegmentedControl';
import { AdminDebtQueue } from './AdminDebtQueue';
import { ForceMajeureQueue } from './ForceMajeureQueue';
import { SaleClaimQueue } from './SaleClaimQueue';

type FinanceTab = 'claims' | 'forceMajeure' | 'debts';
const TABS: FinanceTab[] = ['claims', 'forceMajeure', 'debts'];

/** Filas financeiras do admin (D16): reclamações, força maior e dívidas dos CNPJs. */
export function AdminFinanceQueues({
  renderClaimEvidence,
}: {
  /** Slot da composição para as provas do serviço na reclamação (D20). */
  renderClaimEvidence?: (claim: AdminSaleClaim) => ReactNode;
} = {}) {
  const { t } = useTranslation();
  const [tab, setTab] = useState<FinanceTab>('claims');
  const [notice, setNotice] = useState<{ message: string; error: boolean } | null>(null);
  const show = (message: string, error = false) => setNotice({ message, error });
  return (
    <section className="space-y-4" aria-labelledby="admin-finance-title">
      <h2 id="admin-finance-title" className="text-[22px] font-display font-bold text-ink">
        {t('adminFinance.title')}
      </h2>
      <SegmentedControl
        label={t('adminFinance.tabsLabel')}
        value={tab}
        onChange={(value) => {
          setTab(value);
          setNotice(null);
        }}
        options={TABS.map((value) => ({ value, label: t(`adminFinance.tabs.${value}`) }))}
      />
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
        <SaleClaimQueue onNotice={show} renderEvidence={renderClaimEvidence} />
      ) : tab === 'forceMajeure' ? (
        <ForceMajeureQueue onNotice={show} />
      ) : (
        <AdminDebtQueue onNotice={show} />
      )}
    </section>
  );
}
