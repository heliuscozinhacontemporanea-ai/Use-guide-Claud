import { useEffect } from 'react';

type WakeLockSentinel = { release: () => Promise<void> };
type WakeLockNavigator = Navigator & {
  wakeLock?: { request: (type: 'screen') => Promise<WakeLockSentinel> };
};

/**
 * Mantém a tela acesa enquanto `active` (modo portaria, D21). O navegador solta a trava quando a
 * página some; ela é pedida de novo ao voltar. Sem suporte, não faz nada.
 * Referência: https://developer.mozilla.org/docs/Web/API/Screen_Wake_Lock_API
 */
export function useScreenWakeLock(active: boolean) {
  useEffect(() => {
    const wakeLock = (navigator as WakeLockNavigator).wakeLock;
    if (!active || !wakeLock) return;
    let sentinel: WakeLockSentinel | null = null;
    const request = () => {
      if (document.visibilityState !== 'visible') return;
      void wakeLock
        .request('screen')
        .then((lock) => {
          sentinel = lock;
        })
        .catch(() => undefined);
    };
    request();
    document.addEventListener('visibilitychange', request);
    return () => {
      document.removeEventListener('visibilitychange', request);
      void sentinel?.release().catch(() => undefined);
    };
  }, [active]);
}
