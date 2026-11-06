import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  formatBusinessDateTime,
  formatSessionLabel,
} from '../../../../shared/utils/businessDateTime';
import { ConfirmDialog } from '../../../../ui/components/ConfirmDialog';
import { Dialog } from '../../../../ui/components/Dialog';
import { StatusText } from '../../../../ui/components/StatusText';
import { BUTTON_SECONDARY } from '../../../../ui/styles/controls';
import { cancelCourtesyUseCase } from '../../application/usecases/cancelCourtesyUseCase';
import type { CourtesyRow } from '../../types/courtesy';
import { courtesyErrorKey } from '../../utils/courtesyErrorKey';
import { COURTESY_TONE } from '../../utils/courtesyRowView';

/** Detalhe de um convidado: sessão, quando foi enviada e "Cancelar cortesia" até a pessoa entrar. */
export function CourtesyRowSheet({
  row,
  sessionStartsAt,
  statusText,
  onClose,
  onCanceled,
}: {
  row: CourtesyRow | null;
  sessionStartsAt: string | null;
  statusText: string;
  onClose: () => void;
  onCanceled: () => void;
}) {
  const { t, i18n } = useTranslation();
  const [asking, setAsking] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cancelable =
    row?.status === 'in_wallet' || row?.status === 'link_pending' || row?.status === 'link_expired';
  const title = row?.guest?.username
    ? `@${row.guest.username}`
    : row?.channel === 'link'
      ? t('courtesy.row.titleLink')
      : t('courtesy.row.titleGuest');

  const cancel = async () => {
    if (!row) return;
    setBusy(true);
    setError(null);
    try {
      await cancelCourtesyUseCase(row.id);
      setAsking(false);
      onCanceled();
    } catch (err: unknown) {
      setAsking(false);
      setError(t(courtesyErrorKey(err)));
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Dialog
        open={row !== null && !asking}
        onOpenChange={(open) => !open && onClose()}
        title={title}
        description={row?.guest?.displayName ?? undefined}
      >
        {row && (
          <div className="space-y-4">
            <StatusText tone={COURTESY_TONE[row.status]}>{statusText}</StatusText>
            <dl className="rounded-2xl bg-sheet-card border border-sheet-card-line divide-y divide-line">
              {sessionStartsAt && (
                <div className="flex justify-between gap-3 px-4 py-3">
                  <dt className="text-[15px] text-ink/70">{t('courtesy.row.session')}</dt>
                  <dd className="text-[15px] text-ink text-right">
                    {formatSessionLabel(sessionStartsAt, i18n.language)}
                  </dd>
                </div>
              )}
              <div className="flex justify-between gap-3 px-4 py-3">
                <dt className="text-[15px] text-ink/70">{t('courtesy.row.invitedAt')}</dt>
                <dd className="text-[15px] text-ink text-right">
                  {formatBusinessDateTime(row.createdAt, i18n.language)}
                </dd>
              </div>
            </dl>
            {row.status === 'checked_in' && (
              <p className="text-[13px] text-ink/70">{t('courtesy.row.cannotCancel')}</p>
            )}
            {error && (
              <p role="alert">
                <StatusText tone="danger">{error}</StatusText>
              </p>
            )}
            {cancelable && (
              <button
                type="button"
                disabled={busy}
                onClick={() => setAsking(true)}
                className={`${BUTTON_SECONDARY} w-full text-danger`}
              >
                {t('courtesy.row.cancel')}
              </button>
            )}
          </div>
        )}
      </Dialog>
      <ConfirmDialog
        data={
          asking
            ? {
                title: t('courtesy.row.cancelTitle'),
                message: t('courtesy.row.cancelMessage'),
                confirmLabel: t('courtesy.row.cancelConfirm'),
                cancelLabel: t('courtesy.row.keep'),
                tone: 'danger',
                onCancel: () => setAsking(false),
                onConfirm: () => void cancel(),
              }
            : null
        }
      />
    </>
  );
}
