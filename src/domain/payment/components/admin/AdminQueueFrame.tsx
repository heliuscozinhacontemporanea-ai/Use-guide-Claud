import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { adminFinanceErrorKey } from '../../utils/adminFinanceErrors';
import {
  ReceivablesEmpty,
  ReceivablesError,
  ReceivablesLoading,
} from '../receivables/ReceivablesState';
import { SECONDARY_BUTTON } from './adminFinanceStyles';

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
      <p className="text-xs text-ink/70">{hint}</p>
      {error ? (
        <ReceivablesError messageKey={adminFinanceErrorKey(error)} onRetry={onRetry} />
      ) : loading && empty ? (
        <ReceivablesLoading label={t('adminFinance.loading')} />
      ) : empty ? (
        <ReceivablesEmpty message={emptyMessage} />
      ) : (
        <ul className="grid grid-cols-1 lg:grid-cols-2 gap-3">{children}</ul>
      )}
      {hasMore && !error && (
        <button
          type="button"
          disabled={loading}
          onClick={onLoadMore}
          className={`${SECONDARY_BUTTON} w-full`}
        >
          {t('adminFinance.loadMore')}
        </button>
      )}
    </div>
  );
}
