import { AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Dialog } from '../../../../ui/components/Dialog';
import type { PartnerSlot } from '../../types/bookings';
import { formatSlotDateTime } from '../../utils/dates';
import { BUTTON_PRIMARY, BUTTON_SECONDARY } from '../shared/ListState';

const BUTTON_DANGER =
  'press min-h-11 px-4 rounded-xl bg-danger-soft border border-danger-line text-danger text-xs font-bold cursor-pointer focus-visible:ring-2 focus-visible:ring-teal-400/50';

/**
 * Cancelar com vagas vendidas gera multa de 20% para o CNPJ (D14); a tela mostra a multa e oferece
 * remarcar primeiro, que não tem multa (D16, 4A).
 */
export function SlotCancelDialog({
  slot,
  onClose,
  onConfirm,
  onReschedule,
}: {
  slot: PartnerSlot | null;
  onClose: () => void;
  onConfirm: (slot: PartnerSlot) => void;
  onReschedule: (slot: PartnerSlot) => void;
}) {
  const { t, i18n } = useTranslation();
  const sold = slot?.capacitySold ?? 0;

  return (
    <Dialog
      open={slot !== null}
      onOpenChange={(open) => !open && onClose()}
      title={t('bookings.slots.cancelTitle')}
      description={slot ? formatSlotDateTime(slot.startsAt, i18n.language) : undefined}
    >
      {slot && (
        <div className="space-y-4">
          {sold > 0 ? (
            <>
              <p className="text-sm text-ink">
                {t('bookings.slots.cancelWithSales', { count: sold })}
              </p>
              <p className="flex items-start gap-2 p-3 rounded-xl bg-danger-soft border border-danger-line text-xs text-danger">
                <AlertTriangle size={16} className="shrink-0 mt-0.5" aria-hidden="true" />
                {t('bookings.slots.cancelPenalty')}
              </p>
              <p className="text-xs text-ink/70">{t('bookings.slots.cancelForceMajeure')}</p>
            </>
          ) : (
            <p className="text-sm text-ink">{t('bookings.slots.cancelNoSales')}</p>
          )}
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
            <button type="button" onClick={onClose} className={BUTTON_SECONDARY}>
              {t('bookings.slots.back')}
            </button>
            <button type="button" onClick={() => onConfirm(slot)} className={BUTTON_DANGER}>
              {t('bookings.slots.cancelAnyway')}
            </button>
            {sold > 0 && (
              <button type="button" onClick={() => onReschedule(slot)} className={BUTTON_PRIMARY}>
                {t('bookings.slots.rescheduleInstead')}
              </button>
            )}
          </div>
        </div>
      )}
    </Dialog>
  );
}
