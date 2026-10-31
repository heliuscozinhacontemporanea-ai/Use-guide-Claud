import { Camera, ScanLine } from 'lucide-react';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CodeBoxesInput } from '../../../../ui/components/CodeBoxesInput';
import { Dialog } from '../../../../ui/components/Dialog';
import { GateModeScreen, type GateOutcome } from '../../../../ui/components/GateModeScreen';
import { StatusText } from '../../../../ui/components/StatusText';
import { cn } from '../../../../shared/utils/cn';
import { useQrScanner } from '../../../../ui/hooks/useQrScanner';
import { BUTTON_PRIMARY, BUTTON_SECONDARY } from '../../../../ui/styles/controls';
import { useSlotCheckIn } from '../../hooks/useSlotCheckIn';
import type { BookingSummary, OfferKind, PartnerSlot } from '../../types/bookings';
import { CHECK_IN_ALPHABET, checkInPrefix, codeLengthFor } from '../../utils/checkInPrefix';
import { formatSlotTime } from '../../utils/dates';

/** Check-in do horário pelo código do cliente, ou portaria da entrada pelo QR e código (D20). */
export function SlotCheckInSheet({
  offerId,
  kind,
  slot,
  onClose,
  onCheckedIn,
}: {
  offerId: string;
  kind: OfferKind;
  slot: PartnerSlot;
  onClose: () => void;
  onCheckedIn?: (booking: BookingSummary) => void;
}) {
  const { t, i18n } = useTranslation();
  const entry = kind === 'private_entry';
  const length = codeLengthFor(kind);
  const prefix = checkInPrefix(kind);
  const [code, setCode] = useState('');
  const { submit, evaluate, sending, result, pending } = useSlotCheckIn(
    offerId,
    slot.id,
    kind,
    onCheckedIn
  );
  const [gateMode, setGateMode] = useState(false);
  const toOutcome = (outcome: Awaited<ReturnType<typeof evaluate>>): GateOutcome => ({
    tone: outcome.tone,
    headline: t(
      outcome.tone === 'success'
        ? 'gateMode.allowed'
        : outcome.tone === 'warn'
          ? 'gateMode.attention'
          : 'gateMode.denied'
    ),
    detail: outcome.message,
  });

  const onQr = useCallback(
    (qrToken: string) => {
      void submit({ qrToken });
    },
    [submit]
  );
  const scanner = useQrScanner(onQr);

  const confirm = async () => {
    if (await submit({ code })) setCode('');
  };

  return (
    <Dialog
      open
      onOpenChange={(open) => !open && onClose()}
      title={`${t(entry ? 'serviceProof.partner.entrySheetTitle' : 'serviceProof.partner.sheetTitle')} · ${formatSlotTime(slot.startsAt, i18n.language)}`}
    >
      <div className="space-y-5">
        {entry && (
          <button
            type="button"
            onClick={() => {
              scanner.stop();
              setGateMode(true);
            }}
            className={`${BUTTON_PRIMARY} w-full inline-flex items-center justify-center gap-2`}
          >
            <ScanLine size={18} aria-hidden="true" />
            {t('gateMode.open')}
          </button>
        )}
        {entry && gateMode && (
          <GateModeScreen
            title={`${t('serviceProof.partner.entrySheetTitle')} · ${formatSlotTime(slot.startsAt, i18n.language)}`}
            online={typeof navigator === 'undefined' || navigator.onLine}
            codePrefix={prefix}
            codeLength={length}
            codeAlphabet={CHECK_IN_ALPHABET}
            onQr={async (qrToken) => toOutcome(await evaluate({ qrToken }))}
            onCode={async (code) => toOutcome(await evaluate({ code }))}
            onClose={() => setGateMode(false)}
          />
        )}
        {entry && (
          <div className="space-y-2">
            {/* O vídeo fica montado: a câmera liga nele assim que a permissão sai. */}
            <video
              ref={scanner.videoRef}
              muted
              playsInline
              className={cn(
                'w-full aspect-square rounded-2xl bg-ink/10 object-cover',
                scanner.state !== 'scanning' && 'hidden'
              )}
            />
            {scanner.state === 'scanning' ? (
              <>
                <p className="text-[13px] text-ink/70 text-center">
                  {t('serviceProof.partner.scanning')}
                </p>
                <button
                  type="button"
                  onClick={scanner.stop}
                  className={`${BUTTON_SECONDARY} w-full`}
                >
                  {t('serviceProof.partner.stopScan')}
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => void scanner.start()}
                disabled={sending || scanner.state === 'loading'}
                className={`${BUTTON_SECONDARY} w-full inline-flex items-center justify-center gap-2`}
              >
                <Camera size={16} aria-hidden="true" />
                {t(
                  scanner.state === 'loading'
                    ? 'serviceProof.partner.scanLoading'
                    : 'serviceProof.partner.scan'
                )}
              </button>
            )}
            {(scanner.state === 'unsupported' || scanner.state === 'denied') && (
              <p className="text-[13px] text-warn">
                {t(
                  scanner.state === 'denied'
                    ? 'serviceProof.partner.cameraDenied'
                    : 'serviceProof.partner.scanUnsupported'
                )}
              </p>
            )}
          </div>
        )}

        <CodeBoxesInput
          prefix={prefix}
          length={length}
          alphabet={CHECK_IN_ALPHABET}
          value={code}
          onChange={setCode}
          label={t(
            entry ? 'serviceProof.partner.entryCodeLabel' : 'serviceProof.partner.codeLabel'
          )}
          boxLabel={(index) => t('serviceProof.partner.character', { n: index + 1, total: length })}
          disabled={sending}
        />

        {result && (
          <p role="status">
            <StatusText tone={result.tone}>{result.message}</StatusText>
          </p>
        )}
        {pending > 0 && (
          <p className="text-[13px] text-warn">
            {t('serviceProof.partner.pending', { count: pending })}
          </p>
        )}

        <button
          type="button"
          onClick={() => void confirm()}
          disabled={sending || code.length !== length}
          className={`${entry ? BUTTON_SECONDARY : BUTTON_PRIMARY} w-full`}
        >
          {t('serviceProof.partner.submit')}
        </button>
      </div>
    </Dialog>
  );
}
