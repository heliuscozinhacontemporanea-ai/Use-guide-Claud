import { AlertCircle, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Skeleton } from '../../../../ui/components/Skeleton';

export function ListLoading({ label }: { label: string }) {
  return (
    <div role="status" className="space-y-2">
      <Skeleton className="h-14 w-full" />
      <Skeleton className="h-14 w-full" />
      <span className="sr-only">{label}</span>
    </div>
  );
}

export function ListEmpty({ message }: { message: string }) {
  return <p className="py-6 text-center text-sm text-ink/70">{message}</p>;
}

export function ListError({ message, onRetry }: { message: string; onRetry: () => void }) {
  const { t } = useTranslation();
  return (
    <div
      role="alert"
      className="flex flex-wrap items-center gap-3 p-3 rounded-xl bg-danger-soft border border-danger-line"
    >
      <AlertCircle size={16} className="text-danger shrink-0" aria-hidden="true" />
      <p className="flex-1 text-xs text-danger">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="press min-h-11 px-3 rounded-lg bg-surface border border-line hover:bg-accent-soft text-ink text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer focus-visible:ring-2 focus-visible:ring-teal-400/50"
      >
        <RefreshCw size={13} aria-hidden="true" />
        {t('bookings.partner.retry')}
      </button>
    </div>
  );
}

export const BUTTON_PRIMARY =
  'press min-h-11 px-4 rounded-xl bg-teal-400 hover:bg-teal-300 text-slate-950 text-sm font-bold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-teal-400/50 focus-visible:outline-none';
export const BUTTON_SECONDARY =
  'press min-h-11 px-3 rounded-xl bg-surface border border-line hover:bg-accent-soft text-ink text-xs font-semibold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-teal-400/50 focus-visible:outline-none';
export const INPUT =
  'w-full min-h-11 px-3 rounded-xl bg-surface border border-line text-sm text-ink focus-visible:ring-2 focus-visible:ring-teal-400/50 focus-visible:outline-none';
