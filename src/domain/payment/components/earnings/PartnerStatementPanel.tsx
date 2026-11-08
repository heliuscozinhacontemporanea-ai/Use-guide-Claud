import { useTranslation } from 'react-i18next';
import { ListError, ListLoading } from '../../../../ui/components/ListState';
import { PayoutStatement } from '../receivables/PayoutStatement';
import { usePaymentAccounts } from './usePaymentAccounts';

/** Extrato por venda (aba Extrato de Ganhos), com o filtro por CNPJ que já existia. */
export function PartnerStatementPanel() {
  const { t } = useTranslation();
  const { accounts, loading, error, reload } = usePaymentAccounts();
  if (loading && !accounts) return <ListLoading label={t('paymentAccounts.loading')} />;
  if (error) return <ListError message={t(error)} onRetry={() => void reload()} />;
  return <PayoutStatement accounts={accounts ?? []} />;
}
