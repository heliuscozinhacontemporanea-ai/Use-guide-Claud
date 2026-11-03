import { useCallback, useEffect, useState } from 'react';
import { getNotificationPreferencesUseCase } from '../application/usecases/getNotificationPreferencesUseCase';
import { updateNotificationPreferencesUseCase } from '../application/usecases/updateNotificationPreferencesUseCase';
import type {
  NotificationCategory,
  NotificationPreferences,
} from '../types/notificationCategories';

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

  const save = useCallback(
    async (next: NotificationPreferences, patch: Partial<NotificationPreferences>) => {
      const previous = preferences;
      setSaveError(false);
      setPreferences(next);
      try {
        await updateNotificationPreferencesUseCase(patch);
      } catch {
        setPreferences(previous);
        setSaveError(true);
      }
    },
    [preferences]
  );

  const setPush = useCallback(
    (category: NotificationCategory, value: boolean) => {
      if (!preferences) return;
      const push = { ...preferences.push, [category]: value };
      void save({ ...preferences, push }, { push });
    },
    [preferences, save]
  );

  const setOption = useCallback(
    (key: 'quietHours' | 'dailyDigest', value: boolean) => {
      if (!preferences) return;
      void save({ ...preferences, [key]: value }, { [key]: value });
    },
    [preferences, save]
  );

  return { preferences, loading, error, saveError, reload: load, setPush, setOption };
}
