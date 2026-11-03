import { useEffect, useState } from 'react';
import { getAppVersionUseCase } from '../factory';
import type { AppVersionInfo } from '../ports/contentPort';

/** Versão publicada do app; `null` enquanto carrega ou se o servidor não responder. */
export function useAppVersion() {
  const [appVersion, setAppVersion] = useState<AppVersionInfo | null>(null);

  useEffect(() => {
    let active = true;
    getAppVersionUseCase
      .execute()
      .then((data) => active && setAppVersion(data))
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  return { appVersion };
}
