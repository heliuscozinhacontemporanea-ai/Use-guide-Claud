import { Camera } from 'lucide-react';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CHECK_IN_ALPHABET } from '../../../../shared/constants/checkInCode';
import { cn } from '../../../../shared/utils/cn';
import { CodeBoxesInput } from '../../../../ui/components/CodeBoxesInput';
import { StatusText } from '../../../../ui/components/StatusText';
import { useQrScanner } from '../../../../ui/hooks/useQrScanner';
import { BUTTON_SECONDARY } from '../../../../ui/styles/controls';
import type { useTicketGate } from '../../hooks/useTicketGate';
import { TICKET_CODE_LENGTH, TICKET_CODE_PREFIX } from '../../utils/ticketCode';

/** Portaria: ler o QR com a câmera ou digitar o código de 8 caracteres (D20). */
export function TicketGateCard({ gate }: { gate: ReturnType<typeof useTicketGate> }) {
  const { t } = useTranslation();
  const [code, setCode] = useState('');
  const { submit, sending, result } = gate;
  const onQr = useCallback((qrToken: string) => void submit({ qrToken }), [submit]);
  const scanner = useQrScanner(onQr);

  const confirm = async () => {
    if (await submit({ code })) setCode('');
  };

  return (
    <section className="p-4 rounded-[20px] bg-surface border border-line space-y-5">
      <div className="space-y-2">
        {/* O vídeo fica montado: a câmera liga nele assim que a permissão sai. */}
        <video
          ref={scanner.videoRef}
          muted
          playsInline
          className={cn(
            'w-full max-w-sm mx-auto aspect-square rounded-2xl bg-ink/10 object-cover',
            scanner.state !== 'scanning' && 'hidden'
          )}
        />
        {scanner.state === 'scanning' ? (
          <>
            <p className="text-[13px] text-ink/70 text-center">{t('ticketGate.scanning')}</p>
            <button type="button" onClick={scanner.stop} className={`${BUTTON_SECONDARY} w-full`}>
              {t('ticketGate.stopScan')}
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
            {t(scanner.state === 'loading' ? 'ticketGate.scanLoading' : 'ticketGate.scan')}
          </button>
        )}
        {(scanner.state === 'unsupported' || scanner.state === 'denied') && (
          <p className="text-[13px] text-warn">
            {t(
              scanner.state === 'denied' ? 'ticketGate.cameraDenied' : 'ticketGate.scanUnsupported'
            )}
          </p>
        )}
      </div>

      <CodeBoxesInput
        prefix={TICKET_CODE_PREFIX}
        length={TICKET_CODE_LENGTH}
        alphabet={CHECK_IN_ALPHABET}
        value={code}
        onChange={setCode}
        label={t('ticketGate.codeLabel')}
        boxLabel={(index) => t('ticketGate.character', { n: index + 1, total: TICKET_CODE_LENGTH })}
        disabled={sending}
      />

      {result && (
        <p role="status">
          <StatusText tone={result.tone}>{result.message}</StatusText>
        </p>
      )}

      <button
        type="button"
        onClick={() => void confirm()}
        disabled={sending || code.length !== TICKET_CODE_LENGTH}
        className={`${BUTTON_SECONDARY} w-full`}
      >
        {t('ticketGate.submit')}
      </button>
    </section>
  );
}
