import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { formatMoneyMinor } from '../../../../shared/utils/money';
import { ConfirmDialog, type ConfirmDialogData } from '../../../../ui/components/ConfirmDialog';
import { StatusText } from '../../../../ui/components/StatusText';
import { TextButton } from '../../../../ui/components/TextButton';
import { listAdminAccountDebtsUseCase } from '../../application/usecases/listAdminAccountDebtsUseCase';
import { waiveAccountDebtUseCase } from '../../application/usecases/waiveAccountDebtUseCase';
import { useAdminFinanceQueue } from '../../hooks/useAdminFinanceQueue';
import type { AdminAccountDebt } from '../../types/adminFinance';
import { adminFinanceErrorKey, errorCodeOf } from '../../utils/adminFinanceErrors';
import { formatFortalezaDay } from '../../utils/receivablesFormat';
import { AdminQueueFrame } from './AdminQueueFrame';
import { QueueRow } from './QueueRow';

export function AdminDebtQueue({
  onNotice,
}: {
  onNotice: (message: string, error?: boolean) => void;
}) {
  const { t, i18n } = useTranslation();
  const queue = useAdminFinanceQueue(listAdminAccountDebtsUseCase);
  const [confirm, setConfirm] = useState<ConfirmDialogData | null>(null);
  const [busy, setBusy] = useState(false);
  const money = (value: number) => formatMoneyMinor(value, i18n.language);

  const waive = (debt: AdminAccountDebt) =>
    setConfirm({
      message: t('adminFinance.debts.waiveConfirm', { amount: money(debt.remainingMinor) }),
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
          <QueueRow
            key={debt.id}
            title={t(`adminFinance.debts.reason.${debt.reason}`)}
            subtitle={[debt.sellerName ?? t('adminFinance.unknownSeller'), debt.maskedDocument]
              .filter(Boolean)
              .join(' · ')}
            status={
              <StatusText tone={debt.overdue ? 'danger' : 'muted'}>
                {t(debt.overdue ? 'adminFinance.debts.overdueSince' : 'adminFinance.debts.dueOn', {
                  date: formatFortalezaDay(debt.dueAt, i18n.language),
                })}
              </StatusText>
            }
            amount={money(debt.remainingMinor)}
            action={
              <TextButton tone="danger" disabled={busy} onClick={() => waive(debt)}>
                {t('adminFinance.debts.waiveShort')}
              </TextButton>
            }
          />
        ))}
      </AdminQueueFrame>
      <ConfirmDialog data={confirm} />
    </>
  );
}
