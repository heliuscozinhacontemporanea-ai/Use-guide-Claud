import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { formatMoneyMinor } from '../../../../shared/utils/money';
import { Dialog } from '../../../../ui/components/Dialog';
import { StripePaymentElement } from '../../adapters/ui/StripePaymentElement';
import { startDebtPaymentUseCase } from '../../application/usecases/startDebtPaymentUseCase';
import type { AccountDebtView } from '../../types/receivables';
import { receivablesErrorKey } from '../../utils/receivablesFormat';
import { ListLoading } from '../../../../ui/components/ListState';

export function DebtPaymentDialog({
  debt,
  onClose,
  onPaid,
}: {
  debt: AccountDebtView | null;
  onClose: () => void;
  onPaid: () => void;
}) {
  const { t, i18n } = useTranslation();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setClientSecret(null);
    setError(null);
    if (!debt) return;
    let active = true;
    startDebtPaymentUseCase(debt.id)
      .then((result) => active && setClientSecret(result.clientSecret))
      .catch((err) => active && setError(t(receivablesErrorKey(err))));
    return () => {
      active = false;
    };
  }, [debt, t]);

  return (
    <Dialog
      open={debt !== null}
      onOpenChange={(open) => !open && onClose()}
      title={t('receivables.payDialog.title')}
      description={t('receivables.payDialog.description')}
    >
      {error ? (
        <p
          role="alert"
          className="p-3 rounded-xl bg-danger-soft border border-danger-line text-xs text-danger"
        >
          {error}
        </p>
      ) : debt && clientSecret ? (
        <StripePaymentElement
          clientSecret={clientSecret}
          orderId={debt.id}
          returnKind="debt"
          submitLabel={t('receivables.payDialog.submit', {
            amount: formatMoneyMinor(debt.remainingMinor, i18n.language),
          })}
          onSuccess={onPaid}
          onError={setError}
        />
      ) : (
        <ListLoading label={t('receivables.payDialog.loading')} />
      )}
    </Dialog>
  );
}
