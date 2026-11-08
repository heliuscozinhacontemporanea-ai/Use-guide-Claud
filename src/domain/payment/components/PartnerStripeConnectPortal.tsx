import { AlertTriangle, Loader2, RefreshCw } from 'lucide-react';
import { type ReactNode, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { GlassCard } from '../../../ui/components/GlassCard';
import { getPartnerTermsUseCase } from '../application/usecases/getPartnerTermsUseCase';
import { listPaymentAccountsUseCase } from '../application/usecases/listPaymentAccountsUseCase';
import { usePartnerDebts } from '../hooks/usePartnerDebts';
import type { PartnerPaymentAccount, PartnerTermsView } from '../types/payment';
import { PartnerTermsCard } from './accounts/PartnerTermsCard';
import { PaymentAccountCard } from './accounts/PaymentAccountCard';
import { PaymentAccountWorkspace } from './accounts/PaymentAccountWorkspace';
import { accountErrorKey } from './accounts/paymentAccountStatus';
import { DebtList } from './receivables/DebtList';
import { PayoutStatement } from './receivables/PayoutStatement';
import { type ReceivablesTab, ReceivablesTabs } from './receivables/ReceivablesTabs';

/** Recebimentos do parceiro: conta Stripe por CNPJ (D14), extrato por venda e dívidas (D16). */
function Frame({ bare, children }: { bare: boolean; children: ReactNode }) {
  return bare ? (
    <div className="space-y-4">{children}</div>
  ) : (
    <GlassCard className="p-5 space-y-4">{children}</GlassCard>
  );
}

/** `bare`: sem cartão nem título, para abrir dentro de uma folha que já tem os dois. */
export function PartnerStripeConnectPortal({ bare = false }: { bare?: boolean } = {}) {
  const { t } = useTranslation();
  const [accounts, setAccounts] = useState<PartnerPaymentAccount[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [openKey, setOpenKey] = useState<string | null>(null);
  const [terms, setTerms] = useState<PartnerTermsView | null>(null);
  const [tab, setTab] = useState<ReceivablesTab>('accounts');
  const debtsState = usePartnerDebts();
  const pendingDebts = debtsState.debts.filter((debt) => debt.status === 'open').length;
  const blocked = debtsState.debts.some((debt) => debt.overdue);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [list, currentTerms] = await Promise.all([
        listPaymentAccountsUseCase(),
        getPartnerTermsUseCase(),
      ]);
      setAccounts(list);
      setTerms(currentTerms);
    } catch (err) {
      setError(accountErrorKey(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const open = accounts?.find((entry) => entry.accountKey === openKey) ?? null;
  const refreshButton = (
    <button
      type="button"
      onClick={() => {
        void load();
        void debtsState.reload();
      }}
      aria-label={t('paymentAccounts.refresh')}
      className="press w-11 h-11 shrink-0 rounded-xl border border-line text-ink flex items-center justify-center hover:bg-accent-soft focus-visible:ring-2 focus-visible:ring-teal-400/50"
    >
      <RefreshCw size={16} aria-hidden="true" />
    </button>
  );

  return (
    <Frame bare={bare}>
      {!bare && (
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-ink">{t('paymentAccounts.title')}</h4>
            <p className="text-xs text-ink/70">{t('paymentAccounts.subtitle')}</p>
          </div>
          {refreshButton}
        </div>
      )}

      {blocked && (
        <p
          role="alert"
          className="flex items-start gap-2 p-3 rounded-xl bg-danger-soft border border-danger-line text-xs text-danger"
        >
          <AlertTriangle size={16} className="shrink-0 mt-0.5" aria-hidden="true" />
          {t('receivables.blockedBanner')}
        </p>
      )}

      {!open && (
        <div className="flex items-start justify-between gap-2">
          <ReceivablesTabs value={tab} onChange={setTab} pendingDebts={pendingDebts} />
          {/* Na folha o título é dela: o botão de atualizar sobe para a linha das abas. */}
          {bare && refreshButton}
        </div>
      )}

      {terms && !open && tab === 'accounts' && (
        <PartnerTermsCard terms={terms} onAccepted={setTerms} />
      )}

      {loading && !accounts ? (
        <p className="flex items-center gap-2 text-xs text-ink/70" role="status">
          <Loader2 size={16} className="animate-spin text-accent" aria-hidden="true" />
          {t('paymentAccounts.loading')}
        </p>
      ) : error ? (
        <div
          role="alert"
          className="flex flex-wrap items-center gap-3 p-3 rounded-xl bg-danger-soft border border-danger-line"
        >
          <p className="text-xs text-danger">{t(error)}</p>
          <button
            type="button"
            onClick={() => void load()}
            className="press min-h-11 px-4 rounded-xl border border-line text-xs font-bold text-ink focus-visible:ring-2 focus-visible:ring-teal-400/50"
          >
            {t('paymentAccounts.retry')}
          </button>
        </div>
      ) : tab === 'statement' && !open ? (
        <PayoutStatement accounts={accounts ?? []} />
      ) : tab === 'debts' && !open ? (
        <DebtList accounts={accounts ?? []} debtsState={debtsState} />
      ) : open ? (
        <PaymentAccountWorkspace
          entry={open}
          onBack={() => setOpenKey(null)}
          onOnboardingExit={() => void load()}
        />
      ) : accounts && accounts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {accounts.map((entry) => (
            <PaymentAccountCard
              key={entry.accountKey}
              entry={entry}
              onOpen={(selected) => setOpenKey(selected.accountKey)}
              startBlocked={!terms?.accepted}
            />
          ))}
        </div>
      ) : (
        <p className="py-8 text-center text-xs text-ink/70 border-2 border-dashed border-line rounded-2xl">
          {t('paymentAccounts.empty')}
        </p>
      )}
    </Frame>
  );
}
