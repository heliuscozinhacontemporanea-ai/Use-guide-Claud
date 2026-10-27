import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { formatBusinessDay } from '../../../../shared/utils/businessDateTime';
import { ConfirmDialog, type ConfirmDialogData } from '../../../../ui/components/ConfirmDialog';
import { ListEmpty, ListError, ListLoading } from '../../../../ui/components/ListState';
import { StatusText } from '../../../../ui/components/StatusText';
import { TextButton } from '../../../../ui/components/TextButton';
import { BUTTON_DANGER, BUTTON_SECONDARY } from '../../../../ui/styles/controls';
import { useReviewModerationQueue } from '../../hooks/useReviewModerationQueue';
import type { ModerationReviewReport, ReviewReportOutcome } from '../../types/reviewReport';
import { StarRating } from '../StarRating';

/** Aba Moderação do admin (D19): denúncias de respostas, as mais antigas primeiro. */
export function ReviewModerationQueue() {
  const { t, i18n } = useTranslation();
  const queue = useReviewModerationQueue();
  const [confirm, setConfirm] = useState<ConfirmDialogData | null>(null);
  const [notice, setNotice] = useState<{ tone: 'ok' | 'error'; text: string } | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const decide = async (report: ModerationReviewReport, outcome: ReviewReportOutcome) => {
    setBusy(report.id);
    setNotice(null);
    try {
      await queue.decide(report.id, outcome);
      setNotice({
        tone: 'ok',
        text: t(
          outcome === 'upheld' ? 'reviewReports.admin.upheld' : 'reviewReports.admin.dismissed'
        ),
      });
    } catch (err: unknown) {
      const code = err instanceof Error ? err.message : '';
      setNotice({
        tone: 'error',
        text: t(
          code === 'ALREADY_DECIDED'
            ? 'reviewReports.admin.errors.ALREADY_DECIDED'
            : 'reviewReports.admin.errors.decide'
        ),
      });
    } finally {
      setBusy(null);
    }
  };

  const askUphold = (report: ModerationReviewReport) =>
    setConfirm({
      message: t('reviewReports.admin.upholdConfirm'),
      confirmLabel: t('reviewReports.admin.uphold'),
      onCancel: () => setConfirm(null),
      onConfirm: () => {
        setConfirm(null);
        void decide(report, 'upheld');
      },
    });

  return (
    <section className="space-y-4">
      <h2 className="text-[22px] font-display font-bold text-ink">
        {t('reviewReports.admin.title')}
      </h2>
      {notice && (
        <p
          role={notice.tone === 'error' ? 'alert' : 'status'}
          className={notice.tone === 'error' ? 'text-sm text-danger' : 'text-sm text-accent'}
        >
          {notice.text}
        </p>
      )}
      {queue.error && (
        <ListError
          message={t('reviewReports.admin.errors.load')}
          onRetry={() => void queue.reload()}
        />
      )}
      {!queue.error && !queue.loading && queue.data.length === 0 && (
        <ListEmpty message={t('reviewReports.admin.empty')} />
      )}
      {queue.data.length > 0 && (
        <ul className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {queue.data.map((report) => (
            <li
              key={report.id}
              className="p-4 rounded-[20px] bg-surface border border-line space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <p className="text-[15px] font-semibold text-ink break-words">
                  {report.placeName ?? t('reviewReports.admin.unknownPlace')}
                </p>
                <StatusText tone="warn">
                  {t('reviewReports.admin.decideBy', {
                    date: formatBusinessDay(report.decideBy, i18n.language),
                  })}
                </StatusText>
              </div>
              <div>
                <p className="flex items-center gap-2 text-[13px] text-ink/70">
                  {t('reviewReports.admin.review', { rating: report.reviewRating })}
                  <StarRating rating={report.reviewRating} size={12} />
                </p>
                <p className="text-sm text-ink/80 break-words">{report.reviewComment}</p>
              </div>
              <div className="p-3 rounded-2xl bg-danger-soft border border-danger-line">
                <p className="text-[13px] font-semibold text-ink">
                  {t('reviewReports.admin.response')}
                </p>
                <p className="text-[13px] text-ink/80 break-words">{report.responseText}</p>
              </div>
              <p className="text-[13px] text-ink/80">
                {t('reviewReports.admin.reason', {
                  reason: t(`reviewReports.reasons.${report.reason}`),
                })}
              </p>
              {report.details && (
                <p className="text-[13px] text-ink/70 break-words">
                  {t('reviewReports.admin.details', { details: report.details })}
                </p>
              )}
              <div className="flex flex-wrap items-center justify-end gap-3 pt-1">
                <TextButton
                  disabled={busy === report.id}
                  onClick={() => void decide(report, 'dismissed')}
                >
                  {t('reviewReports.admin.dismiss')}
                </TextButton>
                <button
                  type="button"
                  disabled={busy === report.id}
                  onClick={() => askUphold(report)}
                  className={BUTTON_DANGER}
                >
                  {t('reviewReports.admin.uphold')}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
      {queue.loading && <ListLoading label={t('reviewReports.admin.loading')} />}
      {!queue.loading && queue.hasMore && (
        <button type="button" onClick={() => void queue.loadMore()} className={BUTTON_SECONDARY}>
          {t('reviewReports.admin.loadMore')}
        </button>
      )}
      <ConfirmDialog data={confirm} />
    </section>
  );
}
