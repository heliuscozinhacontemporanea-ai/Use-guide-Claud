import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog } from '../../../../ui/components/Dialog';
import { RadioCardGroup } from '../../../../ui/components/RadioCardGroup';
import { BUTTON_PRIMARY, INPUT } from '../../../../ui/styles/controls';
import { REVIEW_REPORT_REASONS, type ReviewReportReason } from '../../types/reviewReport';

interface ReportResponseSheetProps {
  place: string;
  onClose: () => void;
  /** Lança com o código do backend em caso de erro. */
  onSubmit: (reason: ReviewReportReason, details?: string) => Promise<void>;
}

const KNOWN_ERRORS = ['REPORT_LIMIT_REACHED', 'ALREADY_REPORTED', 'NO_RESPONSE_TO_REPORT'];

/** Folha para denunciar a resposta do estabelecimento (D19). */
export function ReportResponseSheet({ place, onClose, onSubmit }: ReportResponseSheetProps) {
  const { t } = useTranslation();
  const [reason, setReason] = useState<ReviewReportReason | undefined>(undefined);
  const [details, setDetails] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (!reason) return;
    setSending(true);
    setError(null);
    try {
      await onSubmit(reason, details.trim() || undefined);
    } catch (err: unknown) {
      const code = err instanceof Error ? err.message : '';
      setError(
        t(
          KNOWN_ERRORS.includes(code)
            ? `reviewReports.errors.${code}`
            : 'reviewReports.errors.generic'
        )
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      title={t('reviewReports.sheet.title')}
      description={t('reviewReports.sheet.description', { place })}
    >
      <div className="space-y-4">
        <RadioCardGroup
          name="review-report-reason"
          legend={t('reviewReports.sheet.reasonLegend')}
          value={reason}
          onChange={setReason}
          options={REVIEW_REPORT_REASONS.map((value) => ({
            value,
            title: t(`reviewReports.reasons.${value}`),
          }))}
        />
        <label className="block">
          <span className="sr-only">{t('reviewReports.sheet.detailsLabel')}</span>
          <textarea
            value={details}
            onChange={(event) => setDetails(event.target.value)}
            maxLength={500}
            rows={3}
            placeholder={t('reviewReports.sheet.detailsLabel')}
            className={`${INPUT} min-h-20 py-2.5 placeholder:text-ink/50`}
          />
        </label>
        {error && (
          <p role="alert" className="text-xs text-danger">
            {error}
          </p>
        )}
        <button
          type="button"
          disabled={!reason || sending}
          onClick={() => void submit()}
          className={`${BUTTON_PRIMARY} w-full min-h-12`}
        >
          {sending ? t('reviewReports.sheet.sending') : t('reviewReports.sheet.submit')}
        </button>
      </div>
    </Dialog>
  );
}
