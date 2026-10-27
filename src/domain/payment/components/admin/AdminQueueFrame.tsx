import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { adminFinanceErrorKey } from '../../utils/adminFinanceErrors';
import { ListEmpty, ListError, ListLoading } from '../../../../ui/components/ListState';
import { BUTTON_SECONDARY } from '../../../../ui/styles/controls';

/** Carregando, erro, vazio e "carregar mais" de uma fila do admin (AGENTS.md §11.8). */
export function AdminQueueFrame({
  hint,
  loading,
  error,
  empty,
  emptyMessage,
  hasMore,
  onRetry,
  onLoadMore,
  children,
}: {
  hint: string;
  loading: boolean;
  error: string | null;
  empty: boolean;
  emptyMessage: string;
  hasMore: boolean;
  onRetry: () => void;
  onLoadMore: () => void;
  children: ReactNode;
}) {
  const { t } = useTranslation();
  return (
    <div className="space-y-3">
      <p className="text-[13px] text-ink/70">{hint}</p>
      {error ? (
        <ListError message={t(adminFinanceErrorKey(error))} onRetry={onRetry} />
      ) : loading && empty ? (
        <ListLoading label={t('adminFinance.loading')} />
      ) : empty ? (
        <ListEmpty message={emptyMessage} />
      ) : (
        <ul className="rounded-[20px] bg-surface border border-line divide-y divide-line overflow-hidden">
          {children}
        </ul>
      )}
      {hasMore && !error && (
        <button
          type="button"
          disabled={loading}
          onClick={onLoadMore}
          className={`${BUTTON_SECONDARY} w-full`}
        >
          {t('adminFinance.loadMore')}
        </button>
      )}
    </div>
  );
}
