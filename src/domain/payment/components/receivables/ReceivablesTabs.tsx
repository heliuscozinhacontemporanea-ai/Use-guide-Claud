import { useTranslation } from 'react-i18next';

export type ReceivablesTab = 'accounts' | 'statement' | 'debts';

const TABS: ReceivablesTab[] = ['accounts', 'statement', 'debts'];

export function ReceivablesTabs({
  value,
  onChange,
  pendingDebts,
}: {
  value: ReceivablesTab;
  onChange: (tab: ReceivablesTab) => void;
  /** Dívidas que pedem ação (em aberto ou vencidas). */
  pendingDebts: number;
}) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label={t('receivables.tabs.label')}>
      {TABS.map((tab) => (
        <button
          key={tab}
          type="button"
          aria-pressed={value === tab}
          onClick={() => onChange(tab)}
          className={`press min-h-11 px-4 rounded-xl text-xs font-bold flex items-center gap-2 focus-visible:ring-2 focus-visible:ring-teal-400/50 ${
            value === tab
              ? 'bg-teal-400 text-slate-950'
              : 'bg-surface border border-line text-ink hover:bg-accent-soft'
          }`}
        >
          {t(`receivables.tabs.${tab}`)}
          {tab === 'debts' && pendingDebts > 0 && (
            <span className="min-w-5 h-5 px-1.5 rounded-full bg-danger text-white text-[11px] font-bold flex items-center justify-center">
              {pendingDebts}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
