import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog } from '../../../../ui/components/Dialog';
import { RadioCardGroup } from '../../../../ui/components/RadioCardGroup';
import { BUTTON_PRIMARY } from '../../../../ui/styles/controls';
import type { NoCodeReason } from '../../types/bookings';

const REASONS: NoCodeReason[] = ['no_phone', 'refused', 'other'];

/** "Cliente sem código": vale para toda a reserva, por conta e risco do parceiro, até o cliente confirmar (D20). */
export function NoCodeCheckInDialog({
  onClose,
  onConfirm,
}: {
  onClose: () => void;
  onConfirm: (reason: NoCodeReason) => Promise<void>;
}) {
  const { t } = useTranslation();
  const [reason, setReason] = useState<NoCodeReason>('no_phone');
  const [sending, setSending] = useState(false);

  const confirm = async () => {
    setSending(true);
    try {
      await onConfirm(reason);
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog
      open
      onOpenChange={(open) => !open && onClose()}
      title={t('serviceProof.partner.noCode')}
      description={t('serviceProof.partner.noCodeMessage')}
    >
      <div className="space-y-5">
        <RadioCardGroup
          name="no-code-reason"
          legend={t('serviceProof.partner.noCodeReason')}
          options={REASONS.map((value) => ({
            value,
            title: t(`serviceProof.partner.reasons.${value}`),
          }))}
          value={reason}
          onChange={setReason}
        />
        <button
          type="button"
          onClick={() => void confirm()}
          disabled={sending}
          className={`${BUTTON_PRIMARY} w-full`}
        >
          {t('serviceProof.partner.noCodeConfirm')}
        </button>
      </div>
    </Dialog>
  );
}
