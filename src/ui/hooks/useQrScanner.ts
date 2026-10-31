import { useCallback, useEffect, useRef, useState } from 'react';

export type QrScannerState = 'idle' | 'loading' | 'scanning' | 'standby' | 'unsupported' | 'denied';

type ReadQr = (frame: ImageData) => Promise<string | null>;

export interface QrScannerOptions {
  /** Continua lendo depois de cada QR (modo portaria); sem isso, desliga ao ler o primeiro. */
  continuous?: boolean;
  /** Enquanto true, a câmera fica ligada mas nada é decodificado (tela de resultado aberta). */
  paused?: boolean;
}

// Lado maior do quadro enviado ao leitor, igual ao teste de velocidade da D20.
const MAX_FRAME_SIDE = 720;
// Só o centro (onde fica a mira): menos pixels por quadro e leitura mais rápida.
const CENTER_FRACTION = 0.8;
// Bateria sem perder velocidade (D21): cada quadro com uso; parado, 4 por segundo; depois, espera.
const SLOW_AFTER_MS = 10_000;
const SLOW_INTERVAL_MS = 250;
const STANDBY_AFTER_MS = 60_000;
// A câmera relê o mesmo QR enquanto ele continua na frente dela.
const SAME_VALUE_IGNORE_MS = 5_000;

let readerPromise: Promise<ReadQr> | null = null;

/**
 * Carrega o `zxing-wasm` só quando a portaria abre o leitor (D20). O `.wasm` sai do próprio
 * domínio: o padrão da biblioteca buscaria no jsDelivr, que a CSP não libera.
 */
function loadReader(): Promise<ReadQr> {
  readerPromise ??= Promise.all([
    import('zxing-wasm/reader'),
    import('zxing-wasm/reader/zxing_reader.wasm?url'),
  ])
    .then(([zxing, wasm]) => {
      zxing.prepareZXingModule({
        overrides: {
          locateFile: (path: string, prefix: string) =>
            path.endsWith('.wasm') ? wasm.default : prefix + path,
        },
      });
      return async (frame: ImageData) => {
        const [result] = await zxing.readBarcodes(frame, {
          formats: ['QRCode'],
          tryHarder: true,
          maxNumberOfSymbols: 1,
        });
        return result?.isValid ? result.text : null;
      };
    })
    .catch((error: unknown) => {
      readerPromise = null;
      throw error;
    });
  return readerPromise;
}

type TorchCapabilities = { torch?: boolean };

// O mesmo id pode ser de requestAnimationFrame ou de setTimeout, conforme o ritmo da leitura.
function clearTimer(timer: { current: number | null }) {
  if (timer.current !== null) {
    cancelAnimationFrame(timer.current);
    clearTimeout(timer.current);
  }
  timer.current = null;
}

/** Leitura de QR pela câmera em qualquer navegador, com o leitor `zxing-wasm` (D20, D21). */
export function useQrScanner(
  onDetected: (value: string) => void,
  { continuous = false, paused = false }: QrScannerOptions = {}
) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<number | null>(null);
  const activityRef = useRef(0);
  const lastValueRef = useRef<{ value: string; at: number } | null>(null);
  const pausedRef = useRef(paused);
  const onDetectedRef = useRef(onDetected);
  const [state, setState] = useState<QrScannerState>('idle');
  const [torchAvailable, setTorchAvailable] = useState(false);
  const [torchOn, setTorchOn] = useState(false);

  onDetectedRef.current = onDetected;
  useEffect(() => {
    pausedRef.current = paused;
    // Voltar da tela de resultado conta como uso: a leitura volta à velocidade máxima.
    if (!paused) activityRef.current = Date.now();
  }, [paused]);

  const releaseCamera = useCallback(() => {
    clearTimer(timerRef);
    for (const track of streamRef.current?.getTracks() ?? []) track.stop();
    streamRef.current = null;
    setTorchOn(false);
  }, []);

  const stop = useCallback(() => {
    releaseCamera();
    setState((current) =>
      current === 'scanning' || current === 'loading' || current === 'standby' ? 'idle' : current
    );
  }, [releaseCamera]);

  const standby = useCallback(() => {
    releaseCamera();
    setState('standby');
  }, [releaseCamera]);

  const start = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setState('unsupported');
      return;
    }
    setState('loading');
    let read: ReadQr;
    try {
      read = await loadReader();
    } catch {
      setState('unsupported');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;
      const track = stream.getVideoTracks()[0];
      // `torch` não está nos tipos do DOM; Chrome Android informa quando a lanterna existe.
      const capabilities = track?.getCapabilities?.() as TorchCapabilities | undefined;
      setTorchAvailable(Boolean(capabilities?.torch));
      setState('scanning');
      const video = videoRef.current;
      if (!video) return;
      video.srcObject = stream;
      await video.play();
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d', { willReadFrequently: true });
      if (!context) {
        stop();
        setState('unsupported');
        return;
      }
      activityRef.current = Date.now();

      const schedule = () => {
        const idleFor = Date.now() - activityRef.current;
        if (continuous && idleFor >= STANDBY_AFTER_MS) {
          standby();
          return;
        }
        timerRef.current =
          idleFor >= SLOW_AFTER_MS || pausedRef.current
            ? window.setTimeout(() => void tick(), SLOW_INTERVAL_MS)
            : requestAnimationFrame(() => void tick());
      };

      const tick = async () => {
        if (!streamRef.current) return;
        if (pausedRef.current) {
          activityRef.current = Date.now();
          schedule();
          return;
        }
        const side = Math.min(video.videoWidth, video.videoHeight) * CENTER_FRACTION;
        const scale = Math.min(1, MAX_FRAME_SIDE / Math.max(side, 1));
        canvas.width = Math.round(side * scale);
        canvas.height = canvas.width;
        let value: string | null = null;
        if (canvas.width > 0) {
          context.drawImage(
            video,
            (video.videoWidth - side) / 2,
            (video.videoHeight - side) / 2,
            side,
            side,
            0,
            0,
            canvas.width,
            canvas.height
          );
          value = await read(context.getImageData(0, 0, canvas.width, canvas.height)).catch(
            () => null
          );
        }
        if (value && streamRef.current) {
          const now = Date.now();
          const repeated =
            lastValueRef.current?.value === value &&
            now - lastValueRef.current.at < SAME_VALUE_IGNORE_MS;
          lastValueRef.current = { value, at: now };
          if (!repeated) {
            activityRef.current = now;
            if (!continuous) {
              stop();
              onDetectedRef.current(value);
              return;
            }
            onDetectedRef.current(value);
          }
        }
        schedule();
      };
      void tick();
    } catch {
      stop();
      setState('denied');
    }
  }, [continuous, standby, stop]);

  const toggleTorch = useCallback(async () => {
    const track = streamRef.current?.getVideoTracks()[0];
    if (!track) return;
    const next = !torchOn;
    await track
      .applyConstraints({ advanced: [{ torch: next } as MediaTrackConstraintSet] })
      .then(() => setTorchOn(next))
      .catch(() => setTorchAvailable(false));
  }, [torchOn]);

  // Fora da tela (outro app, tela bloqueada), a câmera desliga e espera o toque para voltar.
  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden && streamRef.current) standby();
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, [standby]);

  useEffect(() => stop, [stop]);

  return { videoRef, state, start, stop, torchAvailable, torchOn, toggleTorch };
}
