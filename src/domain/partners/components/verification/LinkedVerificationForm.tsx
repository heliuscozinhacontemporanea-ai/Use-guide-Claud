import { Loader2 } from 'lucide-react';
import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { VerificationListingOption } from './verificationListingOption';

interface LinkedVerificationFormProps {
  sources: VerificationListingOption[];
  initialSourceId: string | null;
  submitting: boolean;
  onSubmit: (sourceItemId: string) => Promise<void>;
}

export function LinkedVerificationForm({
  sources,
  initialSourceId,
  submitting,
  onSubmit,
}: LinkedVerificationFormProps) {
  const { t } = useTranslation();
  const selectId = useId();
  const [sourceId, setSourceId] = useState(initialSourceId ?? '');
  const [error, setError] = useState<string | null>(null);

  if (sources.length === 0) {
    return <p className="text-sm text-white/70">{t('verification.form.noSource')}</p>;
  }

  return (
    <form
      noValidate
      className="space-y-4"
      onSubmit={async (event) => {
        event.preventDefault();
        if (!sourceId) {
          setError(t('verification.validation.sourceRequired'));
          return;
        }
        setError(null);
        await onSubmit(sourceId);
      }}
    >
      <p className="text-sm text-white/70">{t('verification.form.linkedText')}</p>
      <div className="space-y-1.5">
        <label htmlFor={selectId} className="block text-xs font-semibold text-white/80">
          {t('verification.form.source')}
        </label>
        <select
          id={selectId}
          value={sourceId}
          onChange={(event) => setSourceId(event.target.value)}
          className="w-full min-h-[44px] bg-white/5 border border-white/10 rounded-2xl px-4 text-sm text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400/50"
        >
          <option value="">{t('verification.form.sourcePlaceholder')}</option>
          {sources.map((source) => (
            <option key={source.id} value={source.id}>
              {source.name}
            </option>
          ))}
        </select>
        {error && <p className="text-xs text-danger">{error}</p>}
      </div>
      <button
        type="submit"
        disabled={submitting}
        className="press w-full min-h-[48px] flex items-center justify-center gap-2 rounded-2xl bg-teal-500 text-black text-xs font-bold hover:bg-teal-400 disabled:opacity-60 focus-visible:ring-2 focus-visible:ring-teal-400/50"
      >
        {submitting && <Loader2 size={14} className="animate-spin" aria-hidden="true" />}
        {submitting ? t('verification.form.submitting') : t('verification.form.submit')}
      </button>
    </form>
  );
}
