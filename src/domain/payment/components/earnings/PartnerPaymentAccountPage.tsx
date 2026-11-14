import { useTranslation } from 'react-i18next';
import { ListError, ListLoading } from '../../../../ui/components/ListState';
import { PaymentAccountWorkspace } from '../accounts/PaymentAccountWorkspace';
import { usePaymentAccounts } from './usePaymentAccounts';

/** Uma conta de recebimento (um CNPJ), aberta por cima das contas (D33): cadastro e saldos no Stripe. */
export function PartnerPaymentAccountPage({ accountKey }: { accountKey: string }) {
  const { t } = useTranslation();
  const { accounts, error, loading, reload } = usePaymentAccounts();
  const entry = accounts?.find((account) => account.accountKey === accountKey) ?? null;

  if (loading && !accounts) return <ListLoading label={t('paymentAccounts.loading')} />;
  if (error || !entry) {
    return (
      <ListError message={t(error ?? 'paymentAccounts.empty')} onRetry={() => void reload()} />
    );
  }
  return <PaymentAccountWorkspace entry={entry} onOnboardingExit={() => void reload()} />;
}
