import { useCallback, useEffect, useState } from 'react';
import type { OpenSourceLicense } from '../types/content';

/** Licenças das bibliotecas, carregadas só quando a tela abre (o arquivo tem os textos completos). */
export function useOpenSourceLicenses() {
  const [licenses, setLicenses] = useState<OpenSourceLicense[] | null>(null);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    setError(false);
    try {
      const module = await import('../data/licenses.generated.json');
      setLicenses(module.default as OpenSourceLicense[]);
    } catch {
      setError(true);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return { licenses, loading: !licenses && !error, error, reload: load };
}
