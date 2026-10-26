import { Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const RETRY_BUTTON =
  'press min-h-11 px-4 rounded-xl border border-line text-xs font-bold text-ink focus-visible:ring-2 focus-visible:ring-teal-400/50';

export function ReceivablesLoading({ label }: { label: string }) {
  return (
    <p className="flex items-center gap-2 text-xs text-ink/70" role="status">
      <Loader2 size={16} className="animate-spin text-accent" aria-hidden="true" />
      {label}
    </p>
  );
}

export function ReceivablesError({
  messageKey,
  onRetry,
}: {
  messageKey: string;
  onRetry: () => void;
}) {
  const { t } = useTranslation();
  return (
    <div
      role="alert"
      className="flex flex-wrap items-center gap-3 p-3 rounded-xl bg-danger-soft border border-danger-line"
    >
      <p className="text-xs text-danger">{t(messageKey)}</p>
      <button type="button" onClick={onRetry} className={RETRY_BUTTON}>
        {t('paymentAccounts.retry')}
      </button>
    </div>
  );
}

export function ReceivablesEmpty({ message }: { message: string }) {
  return (
    <p className="py-8 text-center text-xs text-ink/70 border-2 border-dashed border-line rounded-2xl">
      {message}
    </p>
  );
}
