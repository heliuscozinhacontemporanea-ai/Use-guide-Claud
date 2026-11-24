import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useUI } from '../../../../shared/stores/useUIStore';
import { formatBusinessDate } from '../../../../shared/utils/businessDateTime';
import { BUTTON_PRIMARY, BUTTON_SECONDARY } from '../../../../ui/styles/controls';
import type { AdminListingClaim } from '../../types/listingClaim';
import type { VerificationFileKind } from '../../types/listingVerification';

const KNOWN_ERRORS = new Set([
  'LISTING_NOT_CLAIMABLE',
  'DOCUMENT_IN_USE',
  'CNPJ_ALREADY_USED',
  'LISTING_IN_USE',
  'NOT_PENDING',
]);

/** Pedido de "Sou o dono" na fila do admin (D35, telas 10 e 11). */
export function ListingClaimCard({
  claim,
  onReview,
  onReturn,
  onOpenFile,
}: {
  claim: AdminListingClaim;
  onReview: (decision: 'approve' | 'reject', reason: string | null) => Promise<void>;
  onReturn: () => Promise<void>;
  onOpenFile: (kind: VerificationFileKind) => void;
}) {
  const { t, i18n } = useTranslation();
  const { showToast, confirmAction } = useUI();
  const reasonId = useId();
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const date = (iso: string) =>
    formatBusinessDate(iso, i18n.language, { day: '2-digit', month: '2-digit', year: 'numeric' });
  const role = (value: AdminListingClaim['holderRole']) => t(`claims.admin.holder.${value}`);

  const run = async (action: () => Promise<void>, done: string) => {
    setBusy(true);
    try {
      await action();
      showToast(t(done), 'success');
    } catch (err) {
      const code = err instanceof Error ? err.message : '';
      showToast(
        t(KNOWN_ERRORS.has(code) ? `claims.errors.${code}` : 'claims.errors.failed'),
        'error'
      );
    } finally {
      setBusy(false);
    }
  };

  const approve = async () => {
    const ok = await confirmAction(
      `${t('claims.admin.confirmTitle', { name: claim.claimantName })}\n\n${t('claims.admin.confirmText', { listing: claim.listing.name })}`,
      { confirmLabel: t('claims.admin.approve') }
    );
    if (ok) await run(() => onReview('approve', null), 'claims.admin.approvedToast');
  };

  const giveBack = async () => {
    const ok = await confirmAction(
      t('claims.admin.returnConfirm', { listing: claim.listing.name, name: claim.claimantName }),
      { tone: 'danger', confirmLabel: t('claims.admin.return') }
    );
    if (ok) await run(onReturn, 'claims.admin.returnedToast');
  };

  return (
    <article className="space-y-3 p-4 rounded-card bg-surface border border-line">
      <span className="inline-block px-2.5 py-1 rounded-full bg-partner-soft text-caption font-semibold uppercase tracking-wide text-partner">
        {t('claims.admin.tag')}
      </span>
      <div className="space-y-1">
        <h3 className="text-body font-semibold text-ink">{claim.listing.name}</h3>
        <p className="text-meta text-ink-muted">
          {t('claims.admin.place', {
            category: t(`listingDetail.typeLabel.${claim.listing.category}`),
            city: claim.listing.city ?? '',
          })}
        </p>
        <p className="text-meta text-ink">
          {t('claims.admin.sentBy', { name: claim.claimantName, date: date(claim.submittedAt) })}
        </p>
        <p className="text-meta text-ink-muted">
          {role(claim.holderRole)} · {claim.documentType.toUpperCase()} {claim.maskedDocument}
        </p>
      </div>
      <div className="flex flex-col items-start">
        {claim.filesSent.map((kind) => (
          <button
            key={kind}
            type="button"
            onClick={() => onOpenFile(kind)}
            className="min-h-11 text-meta font-semibold text-partner underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400/50 rounded"
          >
            {t('claims.admin.open', { file: t(`verification.files.${kind}`) })}
          </button>
        ))}
      </div>
      {claim.otherClaims.map((other) => (
        <p
          key={`${other.claimantName}-${other.submittedAt}`}
          className="p-3 rounded-xl bg-warn-soft border border-warn-line text-meta text-warn"
        >
          {t('claims.admin.other', {
            name: other.claimantName,
            role: role(other.holderRole),
            date: date(other.submittedAt),
          })}
        </p>
      ))}
      {claim.rejectionReason ? (
        <p className="text-meta text-ink-muted">
          {t('claims.panel.rejectedText', { reason: claim.rejectionReason })}
        </p>
      ) : null}
      {claim.status === 'pending' ? (
        rejecting ? (
          <div className="space-y-2">
            <label htmlFor={reasonId} className="block text-meta font-semibold text-ink">
              {t('verification.admin.rejectReason')}
            </label>
            <textarea
              id={reasonId}
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              maxLength={500}
              rows={3}
              className="w-full rounded-xl bg-surface border border-line p-3 text-meta text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400/50"
            />
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                disabled={busy}
                onClick={() => setRejecting(false)}
                className={`${BUTTON_SECONDARY} min-h-11`}
              >
                {t('verification.admin.cancel')}
              </button>
              <button
                type="button"
                disabled={busy || reason.trim().length < 5}
                onClick={() =>
                  void run(() => onReview('reject', reason.trim()), 'claims.admin.rejectedToast')
                }
                className={`${BUTTON_PRIMARY} min-h-11`}
              >
                {t('claims.admin.reject')}
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => setRejecting(true)}
              className={`${BUTTON_SECONDARY} min-h-11`}
            >
              {t('claims.admin.reject')}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => void approve()}
              className={`${BUTTON_PRIMARY} min-h-11`}
            >
              {t('claims.admin.approve')}
            </button>
          </div>
        )
      ) : claim.status === 'approved' ? (
        <button
          type="button"
          disabled={busy}
          onClick={() => void giveBack()}
          className={`${BUTTON_SECONDARY} w-full min-h-11`}
        >
          {t('claims.admin.return')}
        </button>
      ) : null}
    </article>
  );
}
