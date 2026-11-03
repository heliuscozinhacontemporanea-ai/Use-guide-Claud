import { useCallback, useEffect, useState } from 'react';
import { getNotificationPreferencesUseCase } from '../application/usecases/getNotificationPreferencesUseCase';
import { updateNotificationPreferencesUseCase } from '../application/usecases/updateNotificationPreferencesUseCase';
import type { NotificationPreferences } from '../types/notificationCategories';

/** Preferências da conta: carrega, salva na hora e desfaz se o servidor recusar. */
export function useNotificationPreferences() {
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [saveError, setSaveError] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      setPreferences(await getNotificationPreferencesUseCase());
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const update = useCallback(
    async (patch: Partial<NotificationPreferences>) => {
      if (!preferences) return;
      const previous = preferences;
      setSaveError(false);
      setPreferences({ ...preferences, ...patch });
      try {
        await updateNotificationPreferencesUseCase(patch);
      } catch {
        setPreferences(previous);
        setSaveError(true);
      }
    },
    [preferences]
  );

  return { preferences, loading, error, saveError, reload: load, update };
}
