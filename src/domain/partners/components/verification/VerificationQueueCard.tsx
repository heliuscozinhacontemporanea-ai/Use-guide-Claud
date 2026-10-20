import { Check, FileText, X } from 'lucide-react';
import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useUI } from '../../../../shared/stores/useUIStore';
import { GlassCard } from '../../../../ui/components/GlassCard';
import type {
  ListingVerificationQueueEntry,
  VerificationFileKind,
} from '../../types/listingVerification';

const MIN_REASON = 5;
const BUTTON =
  'min-h-[44px] inline-flex items-center gap-2 px-4 rounded-2xl text-xs font-semibold transition-colors disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-teal-400/50';

interface VerificationQueueCardProps {
  entry: ListingVerificationQueueEntry;
  onReview: (decision: 'approve' | 'reject', reason: string | null) => Promise<void>;
  onOpenFile: (kind: VerificationFileKind) => Promise<void>;
}

export function VerificationQueueCard({ entry, onReview, onOpenFile }: VerificationQueueCardProps) {
  const { t, i18n } = useTranslation();
  const { showToast, confirmAction } = useUI();
  const reasonId = useId();
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const formatDate = (iso: string) =>
    new Intl.DateTimeFormat(i18n.language, {
      dateStyle: 'short',
      timeStyle: 'short',
      timeZone: 'America/Fortaleza',
    }).format(new Date(iso));

  const review = async (decision: 'approve' | 'reject') => {
    setBusy(true);
    try {
      await onReview(decision, decision === 'reject' ? reason.trim() : null);
      showToast(
        t(decision === 'approve' ? 'verification.admin.approved' : 'verification.admin.rejected'),
        'success'
      );
    } catch (err: unknown) {
      showToast(
        err instanceof Error ? err.message : t('verification.errors.INTERNAL_ERROR'),
        'error'
      );
      setBusy(false);
    }
  };

  const openFile = async (kind: VerificationFileKind) => {
    try {
      await onOpenFile(kind);
    } catch {
      showToast(t('verification.admin.fileError'), 'error');
    }
  };

  return (
    <GlassCard className="p-5 space-y-4">
      <div className="space-y-1">
        <h3 className="text-sm font-bold text-white">{entry.listingName || entry.itemId}</h3>
        <p className="text-xs text-white/70">
          {t('verification.admin.sentBy', {
            name: entry.ownerName || t('verification.admin.ownerUnknown'),
          })}
        </p>
        {entry.submittedAt && (
          <p className="text-xs text-white/60">
            {t('verification.admin.submittedAt', { date: formatDate(entry.submittedAt) })}
          </p>
        )}
        {entry.reviewedAt && (
          <p className="text-xs text-white/60">
            {t('verification.admin.reviewedAt', { date: formatDate(entry.reviewedAt) })}
          </p>
        )}
      </div>

      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-white/80">
        <div>
          <dt className="sr-only">{t('verification.form.documentType')}</dt>
          <dd>
            {entry.documentType ? t(`verification.form.${entry.documentType}`) : ''}{' '}
            <span className="font-mono">{entry.maskedDocument}</span>
          </dd>
        </div>
        {entry.holderRole && (
          <div>
            <dt className="sr-only">{t('verification.form.holderRole')}</dt>
            <dd>
              {t(
                entry.holderRole === 'owner'
                  ? 'verification.admin.holderOwner'
                  : 'verification.admin.holderRepresentative'
              )}
            </dd>
          </div>
        )}
        {entry.cadastur && (
          <div>
            <dt className="sr-only">{t('verification.form.cadastur')}</dt>
            <dd>{t('verification.admin.cadastur', { number: entry.cadastur })}</dd>
          </div>
        )}
        {entry.rejectionReason && (
          <div className="sm:col-span-2">
            <dt className="sr-only">{t('verification.admin.rejectReason')}</dt>
            <dd>{t('verification.admin.reason', { reason: entry.rejectionReason })}</dd>
          </div>
        )}
      </dl>

      {entry.filesSent.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {entry.filesSent.map((kind) => (
            <button
              key={kind}
              type="button"
              onClick={() => void openFile(kind)}
              className={`${BUTTON} border border-white/10 bg-white/5 text-white hover:bg-white/10`}
            >
              <FileText size={14} aria-hidden="true" />
              {t('verification.admin.openFile', { file: t(`verification.files.${kind}`) })}
            </button>
          ))}
        </div>
      )}

      {entry.status === 'pending' &&
        (rejecting ? (
          <div className="space-y-2">
            <label htmlFor={reasonId} className="block text-xs font-semibold text-white/80">
              {t('verification.admin.rejectReason')}
            </label>
            <textarea
              id={reasonId}
              value={reason}
              maxLength={500}
              rows={3}
              onChange={(event) => setReason(event.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400/50 resize-none"
            />
            <p className="text-xs text-white/60">{t('verification.admin.rejectReasonHint')}</p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={busy || reason.trim().length < MIN_REASON}
                onClick={() => void review('reject')}
                className={`${BUTTON} bg-rose-500 text-white hover:bg-rose-400`}
              >
                {t('verification.admin.confirmReject')}
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => setRejecting(false)}
                className={`${BUTTON} border border-white/10 text-white hover:bg-white/10`}
              >
                {t('verification.admin.cancel')}
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={async () => {
                if (await confirmAction(t('verification.admin.approveConfirm'))) {
                  await review('approve');
                }
              }}
              className={`${BUTTON} bg-emerald-500 text-black hover:bg-emerald-400`}
            >
              <Check size={14} aria-hidden="true" />
              {t('verification.admin.approve')}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => setRejecting(true)}
              className={`${BUTTON} border border-rose-500/30 text-rose-300 hover:bg-rose-500/10`}
            >
              <X size={14} aria-hidden="true" />
              {t('verification.admin.reject')}
            </button>
          </div>
        ))}
    </GlassCard>
  );
}
