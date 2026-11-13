import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog } from '../../../../ui/components/Dialog';
import { StatusText } from '../../../../ui/components/StatusText';
import { TextButton } from '../../../../ui/components/TextButton';
import { BUTTON_PRIMARY } from '../../../../ui/styles/controls';
import { respondGateInviteUseCase } from '../../application/usecases/respondGateInviteUseCase';
import type { MyGate } from '../../types/gateStaff';
import { gateStaffErrorKey } from '../../utils/gateStaffErrorKey';

/** Convite para a portaria (C1): quem convidou, o que a pessoa vai fazer e Aceitar ou Recusar. */
export function GateInviteSheet({
  gate,
  when,
  onClose,
  onAnswered,
}: {
  gate: MyGate | null;
  /** Primeira sessão já formatada, com "e mais N" quando há outras. */
  when: string;
  onClose: () => void;
  onAnswered: (accepted: boolean) => void;
}) {
  const { t } = useTranslation();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  if (!gate) return null;

  const answer = async (accept: boolean) => {
    setBusy(true);
    setError(null);
    try {
      await respondGateInviteUseCase(gate.memberId, accept);
      onAnswered(accept);
    } catch (err: unknown) {
      setError(t(gateStaffErrorKey(err)));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog
      open
      onOpenChange={(open) => !open && onClose()}
      title={t('gateStaff.mine.inviteTitle')}
      description={
        gate.business
          ? t('gateStaff.mine.inviteFrom', { business: gate.business, event: gate.title })
          : t('gateStaff.mine.inviteGeneric', { event: gate.title })
      }
    >
      <div className="space-y-4">
        <ul className="rounded-2xl bg-sheet-card border border-sheet-card-line px-4 py-3 space-y-1.5 text-[14px] text-ink/80">
          <li className="font-semibold text-ink first-letter:uppercase">{when}</li>
          <li>{t('gateStaff.mine.inviteScan')}</li>
          <li>{t('gateStaff.mine.inviteWhen')}</li>
          <li>{t('gateStaff.mine.inviteLog')}</li>
        </ul>
        {error && (
          <p role="alert">
            <StatusText tone="danger">{error}</StatusText>
          </p>
        )}
        <button
          type="button"
          disabled={busy}
          onClick={() => void answer(true)}
          className={`${BUTTON_PRIMARY} w-full`}
        >
          {t('gateStaff.mine.accept')}
        </button>
        <div className="flex justify-center">
          <TextButton tone="ink" disabled={busy} onClick={() => void answer(false)}>
            {t('gateStaff.mine.decline')}
          </TextButton>
        </div>
      </div>
    </Dialog>
  );
}
