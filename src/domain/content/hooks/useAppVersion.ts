import { useState, useEffect } from 'react';
import { getAppVersionUseCase } from '../factory';
import { AppVersionInfo } from '../ports/contentPort';

export function useAppVersion() {
  const [appVersion, setAppVersion] = useState<AppVersionInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getAppVersionUseCase
      .execute()
      .then((data) => {
        setAppVersion(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching version:', err);
        setError('Não foi possível carregar a versão do app.');
        setLoading(false);
      });
  }, []);

  return { appVersion, loading, error };
}
