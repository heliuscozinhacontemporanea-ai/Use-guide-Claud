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
  return <p className="py-6 text-center text-sm text-white/60">{message}</p>;
}

export function ListError({ message, onRetry }: { message: string; onRetry: () => void }) {
  const { t } = useTranslation();
  return (
    <div
      role="alert"
      className="flex flex-wrap items-center gap-3 p-3 rounded-xl bg-red-500/10 border border-red-500/25"
    >
      <AlertCircle size={16} className="text-red-400 shrink-0" aria-hidden="true" />
      <p className="flex-1 text-xs text-red-200">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="min-h-11 px-3 rounded-lg bg-white/10 hover:bg-white/15 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer focus-visible:ring-2 focus-visible:ring-teal-400/50"
      >
        <RefreshCw size={13} aria-hidden="true" />
        {t('bookings.partner.retry')}
      </button>
    </div>
  );
}

export const BUTTON_PRIMARY =
  'min-h-11 px-4 rounded-xl bg-teal-400 hover:bg-teal-300 text-slate-950 text-sm font-bold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-teal-400/50 focus-visible:outline-none';
export const BUTTON_SECONDARY =
  'min-h-11 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-teal-400/50 focus-visible:outline-none';
export const INPUT =
  'w-full min-h-11 px-3 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus-visible:ring-2 focus-visible:ring-teal-400/50 focus-visible:outline-none';
