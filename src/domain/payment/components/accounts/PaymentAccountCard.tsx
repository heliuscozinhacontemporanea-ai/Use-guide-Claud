import { Building2, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { PartnerPaymentAccount } from '../../types/payment';
import { accountStatusKey, accountStatusTone } from './paymentAccountStatus';

export function PaymentAccountCard({
  entry,
  onOpen,
  startBlocked = false,
}: {
  entry: PartnerPaymentAccount;
  onOpen: (entry: PartnerPaymentAccount) => void;
  /** Sem o aceite dos termos do parceiro, a conta nova não começa (D15). */
  startBlocked?: boolean;
}) {
  const { t } = useTranslation();
  const status = accountStatusKey(entry);
  const dueCount = entry.account?.requirementsDueCount ?? 0;
  const action = status === 'notStarted' ? 'start' : status === 'ready' ? 'manage' : 'continue';

  return (
    <article className="p-4 rounded-2xl bg-surface border border-line space-y-3">
      <div className="flex items-start gap-3">
        <span className="w-11 h-11 shrink-0 rounded-xl bg-accent-soft text-accent flex items-center justify-center">
          <Building2 size={18} aria-hidden="true" />
        </span>
        <div className="min-w-0 space-y-1">
          <p className="text-sm font-bold text-ink font-mono break-all">{entry.maskedDocument}</p>
          <p className="text-xs text-ink/70">
            {t('paymentAccounts.listings', { count: entry.itemIds.length })}
          </p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={`px-2.5 py-1 rounded-full border text-[11px] font-bold ${accountStatusTone(status)}`}
        >
          {t(`paymentAccounts.status.${status}`)}
        </span>
        {dueCount > 0 && status !== 'ready' && (
          <span className="text-[11px] text-ink/70">
            {t('paymentAccounts.requirements', { count: dueCount })}
          </span>
        )}
      </div>
      <button
        type="button"
        onClick={() => onOpen(entry)}
        disabled={startBlocked && status === 'notStarted'}
        className="press w-full disabled:opacity-50 min-h-11 px-4 rounded-xl bg-teal-400 hover:bg-teal-300 text-slate-950 text-xs font-bold flex items-center justify-center gap-2 focus-visible:ring-2 focus-visible:ring-teal-400/50"
      >
        {t(`paymentAccounts.actions.${action}`)}
        <ChevronRight size={15} aria-hidden="true" />
      </button>
    </article>
  );
}
