import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { syncPushDeviceUseCase } from '../application/usecases/syncPushDeviceUseCase';
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
  const { i18n } = useTranslation();
  const [state, setState] = useState<PushDeviceState>(readState);

  const enable = useCallback(async () => {
    if (state !== 'default') return;
    const permission = await Notification.requestPermission();
    setState(readState());
    if (permission === 'granted') {
      // Sem servidor alcançável o aviso continua na central; o próximo login tenta de novo.
      await syncPushDeviceUseCase(i18n.language).catch(() => false);
    }
  }, [state, i18n.language]);

  return { state, enable };
}
