import { AlertCircle, Clock, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function CheckoutLoading() {
  const { t } = useTranslation();
  return (
    <div
      className="py-10 flex flex-col items-center justify-center gap-3 text-white/70"
      role="status"
    >
      <RefreshCw size={22} className="animate-spin text-accent" />
      <span className="text-xs font-medium">{t('payment.checkout.preparing')}</span>
    </div>
  );
}

export function CheckoutPending({ title, description }: { title: string; description: string }) {
  return (
    <div
      className="p-4 rounded-2xl bg-warn-soft border border-warn-line text-xs text-warn flex items-center gap-3"
      role="status"
    >
      <Clock size={18} className="text-warn shrink-0 animate-pulse" />
      <div>
        <p className="font-bold">{title}</p>
        <p className="text-white/60 mt-0.5">{description}</p>
      </div>
    </div>
  );
}

export function CheckoutError({ message, onRetry }: { message: string; onRetry?: () => void }) {
  const { t } = useTranslation();
  return (
    <div
      className="p-3.5 rounded-xl bg-danger-soft border border-danger-line text-xs text-danger flex items-start gap-2.5"
      role="alert"
    >
      <AlertCircle size={16} className="text-danger shrink-0 mt-0.5" />
      <div className="flex-1 space-y-2">
        <p>{message}</p>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="press min-h-11 px-3 rounded-lg bg-white/10 hover:bg-white/15 text-white font-semibold text-xs inline-flex items-center gap-1.5 cursor-pointer focus-visible:ring-2 focus-visible:ring-teal-400/50"
          >
            <RefreshCw size={13} />
            <span>{t('payment.checkout.retry')}</span>
          </button>
        )}
      </div>
    </div>
  );
}
