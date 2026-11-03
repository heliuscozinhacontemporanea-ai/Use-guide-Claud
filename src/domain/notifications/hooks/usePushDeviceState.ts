import { useCallback, useState } from 'react';
import type { PushDeviceState } from '../types/notificationCategories';

function isAppleMobile(): boolean {
  const ua = navigator.userAgent;
  // iPadOS se apresenta como Mac; o toque denuncia o iPad.
  return /iPad|iPhone|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
}

function isInstalled(): boolean {
  const standalone = (navigator as Navigator & { standalone?: boolean }).standalone;
  return standalone === true || window.matchMedia?.('(display-mode: standalone)').matches === true;
}

function readState(): PushDeviceState {
  if (typeof window === 'undefined') return 'unsupported';
  // No iPhone e no iPad, o push só existe no app instalado na Tela de Início (iOS 16.4+).
  if (isAppleMobile() && !isInstalled()) return 'install';
  if (
    !('Notification' in window) ||
    !('serviceWorker' in navigator) ||
    !('PushManager' in window)
  ) {
    return 'unsupported';
  }
  return Notification.permission === 'granted'
    ? 'granted'
    : Notification.permission === 'denied'
      ? 'denied'
      : 'default';
}

/**
 * Estado do push neste aparelho (D25). `enable` só pode ser chamado a partir de um toque: os
 * navegadores recusam pedidos de permissão sem gesto da pessoa.
 */
export function usePushDeviceState() {
  const [state, setState] = useState<PushDeviceState>(readState);

  const enable = useCallback(async () => {
    if (state !== 'default') return;
    await Notification.requestPermission();
    setState(readState());
  }, [state]);

  return { state, enable };
}
