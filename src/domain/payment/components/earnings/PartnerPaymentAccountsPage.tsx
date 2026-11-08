import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BackButton } from '../../../../ui/components/BackButton';
import { ListEmpty, ListError, ListLoading } from '../../../../ui/components/ListState';
import { ListCard, ListRowButton } from '../../../../ui/components/ListRows';
import type { StatusTone } from '../../../../ui/components/StatusText';
import { PartnerTermsCard } from '../accounts/PartnerTermsCard';
import { PaymentAccountWorkspace } from '../accounts/PaymentAccountWorkspace';
import { type AccountStatusKey, accountStatusKey } from '../accounts/paymentAccountStatus';
import { usePaymentAccounts } from './usePaymentAccounts';

const TONE: Record<AccountStatusKey, StatusTone> = {
  ready: 'success',
  pending: 'warn',
  restricted: 'info',
  disabled: 'danger',
  notStarted: 'muted',
};

/** Contas de recebimento (p22): uma por CNPJ; o toque abre o cadastro e o saldo no Stripe. */
export function PartnerPaymentAccountsPage({
  onBack,
  nameFor,
}: {
  onBack: () => void;
  /** Nome do estabelecimento dos itens de um CNPJ, dado pela composição. */
  nameFor: (itemIds: string[]) => string | null;
}) {
  const { t } = useTranslation();
  const { accounts, terms, setTerms, error, loading, reload } = usePaymentAccounts();
  const [openKey, setOpenKey] = useState<string | null>(null);
  const open = accounts?.find((entry) => entry.accountKey === openKey) ?? null;

  if (open) {
    return (
      <PaymentAccountWorkspace
        entry={open}
        onBack={() => setOpenKey(null)}
        onOnboardingExit={() => void reload()}
      />
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <BackButton label={t('partnerPanel.tabs.earnings')} onClick={onBack} />
        <h2 className="text-[24px] font-display font-bold text-ink">
          {t('paymentAccounts.page.title')}
        </h2>
      </div>
      <p className="px-1 text-[15px] text-ink/70">{t('paymentAccounts.page.intro')}</p>
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
            return (
              <ListRowButton
                key={entry.accountKey}
                title={nameFor(entry.itemIds) ?? entry.maskedDocument}
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
                onClick={() => !blocked && setOpenKey(entry.accountKey)}
              />
            );
          })}
        </ListCard>
      )}
    </div>
  );
}
