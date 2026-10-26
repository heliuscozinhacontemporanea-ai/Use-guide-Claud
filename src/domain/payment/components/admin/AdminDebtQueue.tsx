import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { formatMoneyMinor } from '../../../../shared/utils/money';
import { ConfirmDialog, type ConfirmDialogData } from '../../../../ui/components/ConfirmDialog';
import { listAdminAccountDebtsUseCase } from '../../application/usecases/listAdminAccountDebtsUseCase';
import { waiveAccountDebtUseCase } from '../../application/usecases/waiveAccountDebtUseCase';
import { useAdminFinanceQueue } from '../../hooks/useAdminFinanceQueue';
import type { AdminAccountDebt } from '../../types/adminFinance';
import { adminFinanceErrorKey, errorCodeOf } from '../../utils/adminFinanceErrors';
import { AdminDebtCard } from './AdminDebtCard';
import { AdminQueueFrame } from './AdminQueueFrame';

export function AdminDebtQueue({
  onNotice,
}: {
  onNotice: (message: string, error?: boolean) => void;
}) {
  const { t, i18n } = useTranslation();
  const queue = useAdminFinanceQueue(listAdminAccountDebtsUseCase);
  const [confirm, setConfirm] = useState<ConfirmDialogData | null>(null);
  const [busy, setBusy] = useState(false);

  const waive = (debt: AdminAccountDebt) =>
    setConfirm({
      message: t('adminFinance.debts.waiveConfirm', {
        amount: formatMoneyMinor(debt.remainingMinor, i18n.language),
      }),
      tone: 'danger',
      confirmLabel: t('adminFinance.debts.waive'),
      onCancel: () => setConfirm(null),
      onConfirm: async () => {
        setConfirm(null);
        setBusy(true);
        try {
          await waiveAccountDebtUseCase(debt.id);
          onNotice(t('adminFinance.debts.waived'));
          await queue.reload();
        } catch (err) {
          onNotice(t(adminFinanceErrorKey(errorCodeOf(err))), true);
        } finally {
          setBusy(false);
        }
      },
    });

  return (
    <>
      <AdminQueueFrame
        hint={t('adminFinance.debts.hint')}
        loading={queue.loading}
        error={queue.error}
        empty={queue.data.length === 0}
        emptyMessage={t('adminFinance.debts.empty')}
        hasMore={queue.hasMore}
        onRetry={() => void queue.reload()}
        onLoadMore={() => void queue.loadMore()}
      >
        {queue.data.map((debt) => (
          <AdminDebtCard key={debt.id} debt={debt} busy={busy} onWaive={waive} />
        ))}
      </AdminQueueFrame>
      <ConfirmDialog data={confirm} />
    </>
  );
}
