import { useCallback, useEffect, useRef, useState } from 'react';

type Detector = { detect(source: HTMLVideoElement): Promise<Array<{ rawValue: string }>> };
type DetectorCtor = new (options: { formats: string[] }) => Detector;

export type QrScannerState = 'idle' | 'scanning' | 'unsupported' | 'denied';

/**
 * Leitura de QR pela câmera com o BarcodeDetector do navegador, sem biblioteca nova. Safari e
 * Firefox ainda não têm o leitor: aí o estado vira `unsupported` e a tela pede o código curto.
 * Referência: https://developer.mozilla.org/docs/Web/API/BarcodeDetector
 */
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
    setState((current) => (current === 'scanning' ? 'idle' : current));
  }, []);

  const start = useCallback(async () => {
    const Ctor = (globalThis as { BarcodeDetector?: DetectorCtor }).BarcodeDetector;
    if (!Ctor || !navigator.mediaDevices?.getUserMedia) {
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
      const detector = new Ctor({ formats: ['qr_code'] });
      const tick = async () => {
        if (!streamRef.current) return;
        const found = await detector.detect(video).catch(() => []);
        const value = found[0]?.rawValue;
        if (value) {
          stop();
          onDetected(value);
          return;
        }
        frameRef.current = requestAnimationFrame(() => void tick());
      };
      void tick();
    } catch {
      setState('denied');
    }
  }, [onDetected, stop]);

  useEffect(() => stop, [stop]);

  return { videoRef, state, start, stop };
}
