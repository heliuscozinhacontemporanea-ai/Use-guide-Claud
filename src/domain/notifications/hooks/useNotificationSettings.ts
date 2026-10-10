import { useState, useEffect, useCallback } from 'react';
import { getNotificationSettingsUseCase } from '../application/usecases/getNotificationSettingsUseCase';
import { updateNotificationSettingsUseCase } from '../application/usecases/updateNotificationSettingsUseCase';
import { NotificationSettings } from '../types/notification';

export function useNotificationSettings(partnerId: string | undefined) {
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!partnerId) {
      setLoading(false);
      return;
    }

    getNotificationSettingsUseCase(partnerId)
      .then(setSettings)
      .catch((err) => console.error('[useNotificationSettings] Erro ao carregar:', err))
      .finally(() => setLoading(false));
  }, [partnerId]);

  const updateSetting = useCallback(
    async (key: 'reviewNotifications' | 'planExpiringNotifications', value: boolean) => {
      if (!partnerId) return;

      setSettings((prev) => (prev ? { ...prev, [key]: value } : prev));
      await updateNotificationSettingsUseCase(partnerId, { [key]: value });
    },
    [partnerId]
  );

  return { settings, loading, updateSetting };
}
