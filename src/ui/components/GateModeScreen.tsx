import { BatteryLow, Check, Flashlight, Keyboard, Wifi, WifiOff, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Z_INDEX } from '../../shared/constants/zIndex';
import { cn } from '../../shared/utils/cn';
import { useLowBattery } from '../hooks/useLowBattery';
import { useQrScanner } from '../hooks/useQrScanner';
import { useScreenWakeLock } from '../hooks/useScreenWakeLock';
import { BUTTON_PRIMARY, BUTTON_SECONDARY } from '../styles/controls';
import { CodeBoxesInput } from './CodeBoxesInput';
import { Dialog } from './Dialog';

/** Resultado de uma leitura: fica na tela até a equipe tocar em "Próximo". */
export interface GateOutcome {
  tone: 'success' | 'danger' | 'warn';
  headline: string;
  detail?: string;
}

export interface GateModeScreenProps {
  title: string;
  /** Ex.: "312 de 450 entraram". */
  stats?: string;
  online: boolean;
  codePrefix: string;
  codeLength: number;
  codeAlphabet: string;
  onQr: (token: string) => Promise<GateOutcome>;
  onCode: (code: string) => Promise<GateOutcome>;
  onClose: () => void;
}

// Sem leitura por 8 s, o botão do código ganha destaque (D21).
const CODE_HINT_AFTER_MS = 8_000;

const OUTCOME_STYLE: Record<GateOutcome['tone'], string> = {
  success: 'bg-[#047857] text-[#ffffff]',
  danger: 'bg-[#be123c] text-[#ffffff]',
  warn: 'bg-[#f59e0b] text-[#0d0e10]',
};

function vibrate(tone: GateOutcome['tone']) {
  // O iPhone não vibra pelo navegador; no Android, curto no verde e duplo no vermelho.
  navigator.vibrate?.(tone === 'success' ? 120 : [90, 60, 90]);
}

/**
 * Modo portaria (D21): câmera sempre aberta, check-in a cada QR lido e tela verde ou vermelha até
 * "Próximo"; "Inserir código" sempre à mão. Tela escura fixa e acesa, com as economias do leitor.
 */
export function GateModeScreen({
  title,
  stats,
  online,
  codePrefix,
  codeLength,
  codeAlphabet,
  onQr,
  onCode,
  onClose,
}: GateModeScreenProps) {
  const { t } = useTranslation();
  const [outcome, setOutcome] = useState<GateOutcome | null>(null);
  const [busy, setBusy] = useState(false);
  const [codeOpen, setCodeOpen] = useState(false);
  const [code, setCode] = useState('');
  const [codeHint, setCodeHint] = useState(false);
  const nextRef = useRef<HTMLButtonElement | null>(null);
  const lowBattery = useLowBattery(true);
  useScreenWakeLock(true);

  const show = useCallback((result: GateOutcome) => {
    vibrate(result.tone);
    setOutcome(result);
  }, []);

  const onDetected = useCallback(
    (token: string) => {
      setBusy(true);
      void onQr(token)
        .then(show)
        .catch(() => show({ tone: 'danger', headline: t('gateMode.failed') }))
        .finally(() => setBusy(false));
    },
    [onQr, show, t]
  );
  const scanner = useQrScanner(onDetected, {
    continuous: true,
    paused: busy || codeOpen || outcome !== null,
  });
  const { start, stop } = scanner;

  useEffect(() => {
    void start();
    return stop;
  }, [start, stop]);

  useEffect(() => {
    if (outcome) {
      nextRef.current?.focus();
      return;
    }
    setCodeHint(false);
    const timer = window.setTimeout(() => setCodeHint(true), CODE_HINT_AFTER_MS);
    return () => window.clearTimeout(timer);
  }, [outcome]);

  const submitCode = async () => {
    setBusy(true);
    try {
      const result = await onCode(code);
      setCodeOpen(false);
      setCode('');
      show(result);
    } catch {
      setCodeOpen(false);
      show({ tone: 'danger', headline: t('gateMode.failed') });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="ug-force-dark fixed inset-0 bg-app text-ink flex flex-col pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]"
      style={{ zIndex: Z_INDEX.modalNested }}
    >
      <header className="flex items-center gap-3 px-4 py-3">
        <div className="flex-1 min-w-0">
          <p className="text-[15px] font-semibold truncate">{title}</p>
          <p className="text-[13px] text-ink/70 flex items-center gap-1.5">
            {online ? (
              <Wifi size={14} aria-hidden="true" />
            ) : (
              <WifiOff size={14} className="text-warn" aria-hidden="true" />
            )}
            <span>{t(online ? 'gateMode.online' : 'gateMode.offline')}</span>
            {stats && <span>· {stats}</span>}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label={t('gateMode.close')}
          className="press w-11 h-11 rounded-xl bg-surface flex items-center justify-center focus-visible:ring-2 focus-visible:ring-teal-400/50"
        >
          <X size={20} aria-hidden="true" />
        </button>
      </header>

      {lowBattery && (
        <p className="mx-4 mb-2 px-3 py-2 rounded-xl bg-warn-soft text-warn text-[13px] flex items-center gap-2">
          <BatteryLow size={16} aria-hidden="true" />
          {t('gateMode.lowBattery')}
        </p>
      )}

      <div className="relative flex-1 min-h-0 mx-4 rounded-3xl overflow-hidden bg-surface">
        <video
          ref={scanner.videoRef}
          muted
          playsInline
          className={cn(
            'absolute inset-0 w-full h-full object-cover',
            scanner.state !== 'scanning' && 'invisible'
          )}
        />
        {scanner.state === 'scanning' && (
          <div
            className="absolute inset-[10%] rounded-3xl border-2 border-accent/80 pointer-events-none"
            aria-hidden="true"
          />
        )}
        {scanner.state === 'scanning' && (
          <p className="absolute bottom-3 inset-x-3 text-center text-[13px] text-ink/80">
            {t('gateMode.aim')}
          </p>
        )}
        {scanner.state !== 'scanning' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center">
            <p className="text-[15px] text-ink/80">
              {t(
                scanner.state === 'standby'
                  ? 'gateMode.standby'
                  : scanner.state === 'denied'
                    ? 'gateMode.cameraDenied'
                    : scanner.state === 'unsupported'
                      ? 'gateMode.unsupported'
                      : 'gateMode.opening'
              )}
            </p>
            {(scanner.state === 'standby' || scanner.state === 'idle') && (
              <button type="button" onClick={() => void start()} className={BUTTON_PRIMARY}>
                {t('gateMode.resume')}
              </button>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 p-4">
        <button
          type="button"
          onClick={() => setCodeOpen(true)}
          className={cn(
            BUTTON_SECONDARY,
            'flex-1 inline-flex items-center justify-center gap-2',
            codeHint && 'border-accent-line bg-accent-soft text-accent'
          )}
        >
          <Keyboard size={18} aria-hidden="true" />
          {t('gateMode.enterCode')}
        </button>
        {scanner.torchAvailable && (
          <button
            type="button"
            onClick={() => void scanner.toggleTorch()}
            aria-pressed={scanner.torchOn}
            aria-label={t('gateMode.torch')}
            className={cn(
              'press w-12 h-12 rounded-xl flex items-center justify-center focus-visible:ring-2 focus-visible:ring-teal-400/50',
              scanner.torchOn ? 'bg-ink text-app' : 'bg-surface text-ink'
            )}
          >
            <Flashlight size={20} aria-hidden="true" />
          </button>
        )}
      </div>

      {outcome && (
        <div
          role="alert"
          className={cn(
            'absolute inset-0 flex flex-col p-6 pt-[calc(env(safe-area-inset-top)+24px)] pb-[calc(env(safe-area-inset-bottom)+24px)]',
            OUTCOME_STYLE[outcome.tone]
          )}
        >
          <div className="flex-1 flex flex-col items-center justify-center text-center gap-4">
            <span className="w-24 h-24 rounded-full bg-[#ffffff]/20 flex items-center justify-center">
              {outcome.tone === 'success' ? (
                <Check size={56} strokeWidth={3} aria-hidden="true" />
              ) : (
                <X size={56} strokeWidth={3} aria-hidden="true" />
              )}
            </span>
            <p className="text-[28px] font-display font-bold leading-tight">{outcome.headline}</p>
            {outcome.detail && <p className="text-[17px] leading-snug">{outcome.detail}</p>}
          </div>
          <div className="space-y-3">
            <button
              ref={nextRef}
              type="button"
              onClick={() => setOutcome(null)}
              className="press w-full min-h-14 rounded-2xl bg-[#ffffff] text-[#0d0e10] text-[17px] font-bold focus-visible:ring-4 focus-visible:ring-[#ffffff]/50"
            >
              {t('gateMode.next')}
            </button>
            {outcome.tone !== 'success' && (
              <button
                type="button"
                onClick={() => {
                  setOutcome(null);
                  setCodeOpen(true);
                }}
                className="press w-full min-h-12 rounded-2xl border-2 border-current text-[15px] font-semibold"
              >
                {t('gateMode.enterCode')}
              </button>
            )}
          </div>
        </div>
      )}

      {codeOpen && (
        <Dialog
          open
          nested
          onOpenChange={(open) => !open && setCodeOpen(false)}
          title={t('gateMode.codeTitle')}
          className="ug-force-dark"
        >
          <form
            className="space-y-5"
            noValidate
            onSubmit={(event) => {
              event.preventDefault();
              void submitCode();
            }}
          >
            <CodeBoxesInput
              prefix={codePrefix}
              length={codeLength}
              alphabet={codeAlphabet}
              value={code}
              onChange={setCode}
              label={t('gateMode.codeLabel')}
              boxLabel={(index) => t('gateMode.character', { n: index + 1, total: codeLength })}
              disabled={busy}
            />
            <button
              type="submit"
              disabled={busy || code.length !== codeLength}
              className={`${BUTTON_PRIMARY} w-full`}
            >
              {t('gateMode.confirmCode')}
            </button>
          </form>
        </Dialog>
      )}
    </div>
  );
}
