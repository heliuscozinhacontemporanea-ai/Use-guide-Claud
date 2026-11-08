import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ConfirmDialog } from '../../../ui/components/ConfirmDialog';
import { Dialog } from '../../../ui/components/Dialog';
import { StatusText } from '../../../ui/components/StatusText';
import { BUTTON_PRIMARY, BUTTON_SECONDARY } from '../../../ui/styles/controls';
import { deletePromoCodeUseCase } from '../application/usecases/deletePromoCodeUseCase';
import { updatePromoCodeLimitsUseCase } from '../application/usecases/updatePromoCodeLimitsUseCase';
import type { PartnerPromoCode } from '../types/promoCode';
import { promoCodeErrorKey } from '../utils/promoCodeErrorKey';
import { PROMO_TONE, promoDiscountText, promoPeriodText, promoUsesText } from '../utils/promoText';

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-4 py-3 space-y-0.5">
      <dt className="text-[13px] text-ink/70">{label}</dt>
      <dd className="text-[15px] text-ink break-words whitespace-pre-line">{value}</dd>
    </div>
  );
}

/** Folha do cupom: como ele funciona, editar, pausar ou reativar e excluir (só sem uso). */
export function PromoCodeSheet({
  promo,
  onClose,
  onEdit,
  onChanged,
}: {
  promo: PartnerPromoCode | null;
  onClose: () => void;
  onEdit: (promo: PartnerPromoCode) => void;
  onChanged: () => void;
}) {
  const { t, i18n } = useTranslation();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const run = async (action: () => Promise<void>) => {
    setBusy(true);
    setError(null);
    try {
      await action();
      onChanged();
    } catch (err: unknown) {
      setError(t(promoCodeErrorKey(err)));
    } finally {
      setBusy(false);
    }
  };

  const paused = promo?.status === 'paused';
  const canToggle = promo && (promo.status === 'active' || promo.status === 'scheduled' || paused);
  const limits = promo
    ? [
        promo.onePerAccount && t('promoCodes.sheet.onePerAccount'),
        promo.maxTicketsPerOrder !== null &&
          t('promoCodes.sheet.maxTickets', { count: promo.maxTicketsPerOrder }),
      ].filter((item): item is string => Boolean(item))
    : [];
  const period = promo ? promoPeriodText(promo, t, i18n.language) : null;

  return (
    <Dialog
      open={promo !== null}
      onOpenChange={(next) => {
        if (!next) {
          setError(null);
          onClose();
        }
      }}
      title={promo?.code ?? ''}
      description={promo ? promoDiscountText(promo, t, i18n.language) : undefined}
    >
      {promo && (
        <div className="space-y-4">
          <p>
            <StatusText tone={PROMO_TONE[promo.status]}>
              {t(`promoCodes.status.${promo.status}`)}
            </StatusText>
          </p>
          <dl className="rounded-2xl bg-sheet-card border border-sheet-card-line divide-y divide-line">
            <Row
              label={t('promoCodes.sheet.appliesTo')}
              value={promo.targets
                .map((target) =>
                  [
                    target.title ?? t('promoCodes.unknownTarget'),
                    target.optionIds
                      ? target.optionNames.join(', ')
                      : t(
                          target.kind === 'event'
                            ? 'promoCodes.allOptions'
                            : 'promoCodes.allPriceOptions'
                        ),
                  ].join(' · ')
                )
                .join('\n')}
            />
            <Row label={t('promoCodes.sheet.uses')} value={promoUsesText(promo, t)} />
            {limits.length > 0 && (
              <Row label={t('promoCodes.sheet.limits')} value={limits.join(' · ')} />
            )}
            {period && <Row label={t('promoCodes.sheet.period')} value={period} />}
          </dl>
          {promo.locked && (
            <p className="px-1 text-[14px] text-ink/70">{t('promoCodes.sheet.lockedHint')}</p>
          )}
          {error && (
            <p role="alert">
              <StatusText tone="danger">{error}</StatusText>
            </p>
          )}
          <div className="space-y-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => onEdit(promo)}
              className={`${BUTTON_PRIMARY} w-full`}
            >
              {t(promo.locked ? 'promoCodes.sheet.editLimits' : 'promoCodes.sheet.edit')}
            </button>
            {canToggle && (
              <button
                type="button"
                disabled={busy}
                onClick={() =>
                  void run(() => updatePromoCodeLimitsUseCase(promo.id, { isActive: paused }))
                }
                className={`${BUTTON_SECONDARY} w-full`}
              >
                {t(paused ? 'promoCodes.sheet.resume' : 'promoCodes.sheet.pause')}
              </button>
            )}
            {!promo.locked && (
              <button
                type="button"
                disabled={busy}
                onClick={() => setConfirmDelete(true)}
                className="press w-full min-h-11 rounded-xl text-[15px] font-semibold text-danger focus-visible:ring-2 focus-visible:ring-teal-400/50"
              >
                {t('promoCodes.sheet.delete')}
              </button>
            )}
          </div>
        </div>
      )}
      <ConfirmDialog
        data={
          confirmDelete && promo
            ? {
                tone: 'danger',
                title: t('promoCodes.sheet.deleteTitle', { code: promo.code }),
                message: t('promoCodes.sheet.deleteMessage'),
                confirmLabel: t('promoCodes.sheet.delete'),
                onCancel: () => setConfirmDelete(false),
                onConfirm: () => {
                  setConfirmDelete(false);
                  void run(() => deletePromoCodeUseCase(promo.id));
                },
              }
            : null
        }
      />
    </Dialog>
  );
}
