import { ChevronRight } from 'lucide-react';
import { type ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { formatBusinessDate, formatBusinessDateTime } from '../../../shared/utils/businessDateTime';
import { formatMoneyMinor } from '../../../shared/utils/money';
import { cn } from '../../../shared/utils/cn';
import { BackButton } from '../BackButton';
import { ListEmpty, ListError, ListLoading } from '../ListState';
import { SegmentedControl } from '../SegmentedControl';
import { StatusText } from '../StatusText';
import { TextButton } from '../TextButton';
import type { PurchaseEntry, PurchaseSection } from './purchaseEntry';

interface PurchaseHistoryViewProps {
  entries: PurchaseEntry[];
  loading: boolean;
  error: string | null;
  notice?: string | null;
  onRetry: () => void;
  onBack: () => void;
  onOpen: (entry: PurchaseEntry) => void;
  /** Pagamento em andamento e folhas de detalhe, montados pela composição; ficam no topo. */
  children?: ReactNode;
  /** Fim da lista, como "carregar mais". */
  footer?: ReactNode;
}

function monthOf(iso: string, locale: string) {
  const label = formatBusinessDate(iso, locale, { month: 'long', year: 'numeric' });
  return label.charAt(0).toLocaleUpperCase(locale) + label.slice(1);
}

/** Histórico de compras (D17): Finalizadas, Pendentes e Canceladas, agrupadas pelo mês da compra. */
export function PurchaseHistoryView({
  entries,
  loading,
  error,
  notice,
  onRetry,
  onBack,
  onOpen,
  children,
  footer,
}: PurchaseHistoryViewProps) {
  const { t, i18n } = useTranslation();
  const [section, setSection] = useState<PurchaseSection>('done');
  const pendingCount = entries.filter((entry) => entry.section === 'pending').length;
  const shown = entries
    .filter((entry) => entry.section === section)
    .sort((a, b) => b.purchasedAt.localeCompare(a.purchasedAt));
  const months = [...new Set(shown.map((entry) => monthOf(entry.purchasedAt, i18n.language)))];

  return (
    <section className="w-full space-y-5">
      <div className="flex items-center gap-2">
        <BackButton label={t('purchases.back')} onClick={onBack} />
        <h2 className="text-[22px] font-display font-bold text-ink">{t('purchases.title')}</h2>
      </div>
      <SegmentedControl
        label={t('purchases.tabsLabel')}
        value={section}
        onChange={setSection}
        options={[
          { value: 'done', label: t('purchases.tabs.done') },
          {
            value: 'pending',
            label:
              pendingCount > 0
                ? t('purchases.tabs.pendingCount', { count: pendingCount })
                : t('purchases.tabs.pending'),
          },
          { value: 'canceled', label: t('purchases.tabs.canceled') },
        ]}
      />
      {notice && (
        <p role="status" className="text-sm text-accent">
          {notice}
        </p>
      )}
      {children}
      {error && <ListError message={error} onRetry={onRetry} />}
      {loading && entries.length === 0 && <ListLoading label={t('purchases.loading')} />}
      {!error && !loading && shown.length === 0 && (
        <ListEmpty message={t(`purchases.empty.${section}`)} />
      )}
      {months.map((month) => (
        <section key={month} className="space-y-2">
          <h3 className="text-[13px] font-semibold text-ink/70 px-1">{month}</h3>
          <ul className="rounded-[20px] bg-surface border border-line divide-y divide-line overflow-hidden">
            {shown
              .filter((entry) => monthOf(entry.purchasedAt, i18n.language) === month)
              .map((entry) => (
                <PurchaseRow key={entry.key} entry={entry} onOpen={() => onOpen(entry)} />
              ))}
          </ul>
        </section>
      ))}
      {footer}
    </section>
  );
}

function PurchaseRow({ entry, onOpen }: { entry: PurchaseEntry; onOpen: () => void }) {
  const { i18n } = useTranslation();
  return (
    <li>
      <button
        type="button"
        onClick={onOpen}
        className="w-full px-4 py-3.5 flex gap-3 text-left hover:bg-ink/[0.03] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-teal-400/50 focus-visible:outline-none"
      >
        <span className="w-10 h-10 shrink-0 rounded-xl bg-accent-soft text-accent flex items-center justify-center">
          {entry.icon}
        </span>
        <span className="flex-1 min-w-0">
          <span className="flex items-start justify-between gap-3">
            <span className="text-[15px] font-semibold text-ink leading-snug break-words">
              {entry.title}
            </span>
            <span
              className={cn(
                'text-sm font-semibold tabular-nums shrink-0',
                entry.struck ? 'text-ink/50 [:root.light_&]:text-ink/65 line-through' : 'text-ink'
              )}
            >
              {formatMoneyMinor(entry.amountMinor, i18n.language)}
            </span>
          </span>
          <span className="block text-[13px] text-ink/50 [:root.light_&]:text-ink/65">
            #{entry.code} · {formatBusinessDateTime(entry.purchasedAt, i18n.language)}
          </span>
          <span className="block text-[13px] text-ink/70">{entry.serviceLine}</span>
          <span className="mt-1 flex items-center justify-between gap-3">
            <StatusText tone={entry.status.tone}>{entry.status.text}</StatusText>
            {!entry.quickAction && (
              <ChevronRight size={16} className="text-ink/40 shrink-0" aria-hidden="true" />
            )}
          </span>
        </span>
      </button>
      {entry.quickAction && (
        <div className="px-4 pb-3 -mt-2 flex justify-end">
          <TextButton
            tone="accent"
            disabled={entry.quickAction.disabled}
            onClick={entry.quickAction.onClick}
          >
            {entry.quickAction.label}
          </TextButton>
        </div>
      )}
    </li>
  );
}
