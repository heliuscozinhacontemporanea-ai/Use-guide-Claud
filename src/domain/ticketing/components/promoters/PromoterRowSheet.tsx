import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { formatMoneyMinor } from '../../../../shared/utils/money';
import { ConfirmDialog } from '../../../../ui/components/ConfirmDialog';
import { Dialog } from '../../../../ui/components/Dialog';
import { StatusText } from '../../../../ui/components/StatusText';
import { BUTTON_SECONDARY } from '../../../../ui/styles/controls';
import { endPromoterUseCase } from '../../application/usecases/endPromoterUseCase';
import type { PromoterRow } from '../../types/promoter';
import { promoterEarningText } from '../../utils/promoterEarningText';
import { promoterErrorKey } from '../../utils/promoterErrorKey';

/** Detalhe do divulgador: combinado, vendido e a pagar, e "Encerrar divulgação" (D27). */
export function PromoterRowSheet({
  row,
  onClose,
  onEnded,
}: {
  row: PromoterRow | null;
  onClose: () => void;
  onEnded: () => void;
}) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language;
  const [asking, setAsking] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const end = async () => {
    if (!row) return;
    setBusy(true);
    setError(null);
    try {
      await endPromoterUseCase(row.id);
      setAsking(false);
      onEnded();
    } catch (err: unknown) {
      setAsking(false);
      setError(t(promoterErrorKey(err)));
    } finally {
      setBusy(false);
    }
  };

  const lines: Array<[string, string]> = row
    ? [
        [t('promoters.row.earning'), promoterEarningText(t, row.earning, locale)],
        [
          t('promoters.row.sold'),
          t('promoters.rowSales', {
            count: row.tickets,
            amount: formatMoneyMinor(row.soldMinor, locale),
          }),
        ],
        [t('promoters.row.owed'), formatMoneyMinor(row.owedMinor, locale)],
      ]
    : [];

  return (
    <>
      <Dialog
        open={row !== null && !asking}
        onOpenChange={(open) => !open && onClose()}
        title={row?.promoter.username ? `@${row.promoter.username}` : t('promoters.tab')}
        description={row?.promoter.displayName ?? undefined}
      >
        {row && (
          <div className="space-y-4">
            {row.status !== 'active' && (
              <StatusText tone={row.status === 'invited' ? 'info' : 'muted'}>
                {t(`promoters.status.${row.status === 'invited' ? 'invited' : 'ended'}`)}
              </StatusText>
            )}
            <dl className="rounded-2xl bg-sheet-card border border-sheet-card-line divide-y divide-line">
              {lines.map(([label, value]) => (
                <div key={label} className="flex justify-between gap-3 px-4 py-3">
                  <dt className="text-[15px] text-ink/70">{label}</dt>
                  <dd className="text-[15px] text-ink text-right">{value}</dd>
                </div>
              ))}
            </dl>
            {error && (
              <p role="alert">
                <StatusText tone="danger">{error}</StatusText>
              </p>
            )}
            {(row.status === 'active' || row.status === 'invited') && (
              <button
                type="button"
                disabled={busy}
                onClick={() => setAsking(true)}
                className={`${BUTTON_SECONDARY} w-full text-danger`}
              >
                {t('promoters.row.end')}
              </button>
            )}
          </div>
        )}
      </Dialog>
      <ConfirmDialog
        data={
          asking
            ? {
                title: t('promoters.row.endTitle'),
                message: t('promoters.row.endMessage'),
                confirmLabel: t('promoters.row.endConfirm'),
                cancelLabel: t('promoters.row.keep'),
                tone: 'danger',
                onCancel: () => setAsking(false),
                onConfirm: () => void end(),
              }
            : null
        }
      />
    </>
  );
}
