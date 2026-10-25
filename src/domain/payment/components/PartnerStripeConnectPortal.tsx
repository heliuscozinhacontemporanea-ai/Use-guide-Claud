import { Loader2, RefreshCw } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { GlassCard } from '../../../ui/components/GlassCard';
import { getPartnerTermsUseCase } from '../application/usecases/getPartnerTermsUseCase';
import { listPaymentAccountsUseCase } from '../application/usecases/listPaymentAccountsUseCase';
import type { PartnerPaymentAccount, PartnerTermsView } from '../types/payment';
import { PartnerTermsCard } from './accounts/PartnerTermsCard';
import { PaymentAccountCard } from './accounts/PaymentAccountCard';
import { PaymentAccountWorkspace } from './accounts/PaymentAccountWorkspace';
import { accountErrorKey } from './accounts/paymentAccountStatus';

/** Recebimentos do parceiro: uma conta Stripe por CNPJ verificado (D14). */
export function PartnerStripeConnectPortal() {
  const { t } = useTranslation();
  const [accounts, setAccounts] = useState<PartnerPaymentAccount[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [openKey, setOpenKey] = useState<string | null>(null);
  const [terms, setTerms] = useState<PartnerTermsView | null>(null);

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

  return (
    <GlassCard className="p-5 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-ink">{t('paymentAccounts.title')}</h4>
          <p className="text-xs text-ink/70">{t('paymentAccounts.subtitle')}</p>
        </div>
        <button
          type="button"
          onClick={() => void load()}
          aria-label={t('paymentAccounts.refresh')}
          className="press w-11 h-11 shrink-0 rounded-xl border border-line text-ink flex items-center justify-center hover:bg-accent-soft focus-visible:ring-2 focus-visible:ring-teal-400/50"
        >
          <RefreshCw size={16} aria-hidden="true" />
        </button>
      </div>

      {terms && !open && <PartnerTermsCard terms={terms} onAccepted={setTerms} />}

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
    </GlassCard>
  );
}
