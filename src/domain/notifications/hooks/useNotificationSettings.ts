import { useCallback, useEffect, useState } from 'react';
import { getNotificationSettingsUseCase } from '../application/usecases/getNotificationSettingsUseCase';
import { updateNotificationSettingsUseCase } from '../application/usecases/updateNotificationSettingsUseCase';
import type { NotificationSettings } from '../types/notification';

export type NotificationSettingKey = 'reviewNotifications' | 'planExpiringNotifications';

/** Preferências de notificação do parceiro: carrega, salva na hora e desfaz se o servidor recusar. */
export function useNotificationSettings(partnerId: string | undefined) {
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [saveError, setSaveError] = useState(false);

  const load = useCallback(async () => {
    if (!partnerId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(false);
    try {
      setSettings(await getNotificationSettingsUseCase(partnerId));
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [partnerId]);

  useEffect(() => {
    void load();
  }, [load]);

  const updateSetting = useCallback(
    async (key: NotificationSettingKey, value: boolean) => {
      if (!partnerId) return;
      setSaveError(false);
      setSettings((prev) => (prev ? { ...prev, [key]: value } : prev));
      try {
        await updateNotificationSettingsUseCase(partnerId, { [key]: value });
      } catch {
        setSettings((prev) => (prev ? { ...prev, [key]: !value } : prev));
        setSaveError(true);
      }
    },
    [partnerId]
  );

  return { settings, loading, error, saveError, reload: load, updateSetting };
}
