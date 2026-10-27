import { Flag } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BackButton } from '../../../../ui/components/BackButton';
import { ConfirmDialog, type ConfirmDialogData } from '../../../../ui/components/ConfirmDialog';
import { StatusText } from '../../../../ui/components/StatusText';
import { formatBusinessDay } from '../../../../shared/utils/businessDateTime';
import { ListEmpty, ListError, ListLoading } from '../../../../ui/components/ListState';
import { BUTTON_SECONDARY } from '../../../../ui/styles/controls';
import { useMyReviewReports } from '../../hooks/useMyReviewReports';
import type { MyReviewsSource } from '../../hooks/useMyReviews';
import type { MyReviewReport } from '../../types/reviewReport';
import type { FirestoreReview } from '../../types/review';
import { EditReviewSheet } from './EditReviewSheet';
import { MyReviewCard } from './MyReviewCard';
import { ReportResponseSheet } from './ReportResponseSheet';

interface MyReviewsViewProps {
  source: MyReviewsSource;
  onBack: () => void;
  /** Nome do lugar ou evento, vindo do guia pela composição; `undefined` se não está mais no guia. */
  titleOf: (review: FirestoreReview) => string | undefined;
}

const REPORT_TONE = { open: 'warn', upheld: 'success', dismissed: 'muted' } as const;

/** Minhas avaliações (D19): um cartão por avaliação; editar, denunciar a resposta e excluir no menu "…". */
export function MyReviewsView({ source, onBack, titleOf }: MyReviewsViewProps) {
  const { t, i18n } = useTranslation();
  const { data, loading, error, hasMore, reload, loadMore, remove, save } = source;
  const reports = useMyReviewReports();
  const [editing, setEditing] = useState<FirestoreReview | null>(null);
  const [reporting, setReporting] = useState<FirestoreReview | null>(null);
  const [confirm, setConfirm] = useState<ConfirmDialogData | null>(null);
  const [notice, setNotice] = useState<{ tone: 'ok' | 'error'; text: string } | null>(null);
  const title = (review: FirestoreReview) => titleOf(review) ?? t('myReviews.unknownPlace');

  // Denúncia aberta ou recusada para a resposta atual: o backend recusaria outra igual.
  const canReport = (review: FirestoreReview, latest?: MyReviewReport) =>
    Boolean(review.partnerResponse) && (!latest || latest.status === 'upheld');

  const reportFooter = (latest?: MyReviewReport) =>
    latest && (
      <StatusText tone={REPORT_TONE[latest.status]}>
        {t(`reviewReports.status.${latest.status}`, {
          date: formatBusinessDay(latest.decideBy, i18n.language),
        })}
      </StatusText>
    );

  const askDelete = (review: FirestoreReview) =>
    setConfirm({
      message: t('myReviews.deleteConfirm'),
      confirmLabel: t('myReviews.delete'),
      onCancel: () => setConfirm(null),
      onConfirm: async () => {
        setConfirm(null);
        try {
          await remove(review.id);
          setNotice({ tone: 'ok', text: t('myReviews.deleted') });
        } catch {
          setNotice({ tone: 'error', text: t('myReviews.errors.delete') });
        }
      },
    });

  return (
    <section className="w-full space-y-5">
      <div className="flex items-center gap-2">
        <BackButton label={t('myReviews.back')} onClick={onBack} />
        <h2 className="text-[22px] font-display font-bold text-ink">{t('myReviews.title')}</h2>
      </div>
      {notice && (
        <p
          role={notice.tone === 'error' ? 'alert' : 'status'}
          className={notice.tone === 'error' ? 'text-sm text-danger' : 'text-sm text-accent'}
        >
          {notice.text}
        </p>
      )}
      {error && <ListError message={error} onRetry={() => void reload()} />}
      {!error && !loading && data.length === 0 && <ListEmpty message={t('myReviews.empty')} />}
      {data.length > 0 && (
        <ul className="space-y-3">
          {data.map((review) => {
            const latest = reports.latestFor(review.id);
            return (
              <MyReviewCard
                key={review.id}
                review={review}
                title={title(review)}
                onEdit={() => {
                  setNotice(null);
                  setEditing(review);
                }}
                onDelete={() => askDelete(review)}
                extraMenuItems={
                  canReport(review, latest)
                    ? [
                        {
                          label: t('reviewReports.action'),
                          icon: <Flag size={16} aria-hidden="true" />,
                          onClick: () => {
                            setNotice(null);
                            setReporting(review);
                          },
                        },
                      ]
                    : []
                }
                footer={reportFooter(latest)}
              />
            );
          })}
        </ul>
      )}
      {loading && <ListLoading label={t('myReviews.loading')} />}
      {!loading && hasMore && (
        <button type="button" onClick={() => void loadMore()} className={BUTTON_SECONDARY}>
          {t('myReviews.loadMore')}
        </button>
      )}
      {editing && (
        <EditReviewSheet
          review={editing}
          title={title(editing)}
          onClose={() => setEditing(null)}
          onSave={async (rating, comment) => {
            try {
              await save(editing, rating, comment);
              setEditing(null);
              setNotice({ tone: 'ok', text: t('myReviews.saved') });
            } catch {
              setEditing(null);
              setNotice({ tone: 'error', text: t('myReviews.errors.save') });
            }
          }}
        />
      )}
      {reporting && (
        <ReportResponseSheet
          place={title(reporting)}
          onClose={() => setReporting(null)}
          onSubmit={async (reason, details) => {
            await reports.report(reporting.id, reason, details);
            setReporting(null);
            setNotice({ tone: 'ok', text: t('reviewReports.sent') });
          }}
        />
      )}
      <ConfirmDialog data={confirm} />
    </section>
  );
}
