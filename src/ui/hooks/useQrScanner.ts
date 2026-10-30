import { useCallback, useEffect, useRef, useState } from 'react';

export type QrScannerState = 'idle' | 'loading' | 'scanning' | 'unsupported' | 'denied';

type ReadQr = (frame: ImageData) => Promise<string | null>;

// Lado maior do quadro enviado ao leitor: QR de portaria fica grande na câmera, e quadro menor
// decodifica mais rápido em celular simples (teste de velocidade da D20).
const MAX_FRAME_SIDE = 720;

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

/** Leitura de QR pela câmera em qualquer navegador, com o leitor `zxing-wasm` (D20). */
export function useQrScanner(onDetected: (value: string) => void) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const frameRef = useRef<number | null>(null);
  const [state, setState] = useState<QrScannerState>('idle');

  const stop = useCallback(() => {
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    frameRef.current = null;
    for (const track of streamRef.current?.getTracks() ?? []) track.stop();
    streamRef.current = null;
    setState((current) => (current === 'scanning' || current === 'loading' ? 'idle' : current));
  }, []);

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
        video: { facingMode: 'environment' },
      });
      streamRef.current = stream;
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
      const tick = async () => {
        if (!streamRef.current) return;
        const scale = Math.min(1, MAX_FRAME_SIDE / Math.max(video.videoWidth, video.videoHeight));
        canvas.width = Math.round(video.videoWidth * scale);
        canvas.height = Math.round(video.videoHeight * scale);
        let value: string | null = null;
        if (canvas.width > 0 && canvas.height > 0) {
          context.drawImage(video, 0, 0, canvas.width, canvas.height);
          value = await read(context.getImageData(0, 0, canvas.width, canvas.height)).catch(
            () => null
          );
        }
        if (value && streamRef.current) {
          stop();
          onDetected(value);
          return;
        }
        frameRef.current = requestAnimationFrame(() => void tick());
      };
      void tick();
    } catch {
      stop();
      setState('denied');
    }
  }, [onDetected, stop]);

  useEffect(() => stop, [stop]);

  return { videoRef, state, start, stop };
}
