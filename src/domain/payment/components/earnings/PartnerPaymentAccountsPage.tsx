import { useTranslation } from 'react-i18next';
import { ListEmpty, ListError, ListLoading } from '../../../../ui/components/ListState';
import { ListCard, ListRowButton } from '../../../../ui/components/ListRows';
import type { StatusTone } from '../../../../ui/components/StatusText';
import { PartnerTermsCard } from '../accounts/PartnerTermsCard';
import { type AccountStatusKey, accountStatusKey } from '../accounts/paymentAccountStatus';
import { usePaymentAccounts } from './usePaymentAccounts';

const TONE: Record<AccountStatusKey, StatusTone> = {
  ready: 'success',
  pending: 'warn',
  restricted: 'info',
  disabled: 'danger',
  notStarted: 'muted',
};

/**
 * Contas de recebimento (p22): uma por CNPJ. Abre por cima do painel (D33); o toque numa conta abre a
 * página dela (`PartnerPaymentAccountPage`), com o cadastro e o saldo no Stripe.
 */
export function PartnerPaymentAccountsPage({
  nameFor,
  onOpenAccount,
}: {
  /** Nome do estabelecimento dos itens de um CNPJ, dado pela composição. */
  nameFor: (itemIds: string[]) => string | null;
  onOpenAccount: (account: { key: string; title: string }) => void;
}) {
  const { t } = useTranslation();
  const { accounts, terms, setTerms, error, loading, reload } = usePaymentAccounts();

  return (
    <div className="space-y-5">
      <p className="px-1 text-body text-ink-muted">{t('paymentAccounts.page.intro')}</p>
      {terms && !terms.accepted && <PartnerTermsCard terms={terms} onAccepted={setTerms} />}
      {loading && !accounts ? (
        <ListLoading label={t('paymentAccounts.loading')} />
      ) : error ? (
        <ListError message={t(error)} onRetry={() => void reload()} />
      ) : !accounts || accounts.length === 0 ? (
        <ListEmpty message={t('paymentAccounts.empty')} />
      ) : (
        <ListCard>
          {accounts.map((entry) => {
            const status = accountStatusKey(entry);
            const due = entry.account?.requirementsDueCount ?? 0;
            // Sem o aceite dos termos, a conta nova não começa (D15).
            const blocked = status === 'notStarted' && !terms?.accepted;
            const title = nameFor(entry.itemIds) ?? entry.maskedDocument;
            return (
              <ListRowButton
                key={entry.accountKey}
                title={title}
                sub={`${entry.maskedDocument} · ${t('paymentAccounts.page.items', {
                  count: entry.itemIds.length,
                })}`}
                status={{
                  tone: TONE[status],
                  text:
                    status === 'pending' && due > 0
                      ? t('paymentAccounts.requirements', { count: due })
                      : t(`paymentAccounts.status.${status}`),
                }}
                onClick={() => !blocked && onOpenAccount({ key: entry.accountKey, title })}
              />
            );
          })}
        </ListCard>
      )}
    </div>
  );
}
