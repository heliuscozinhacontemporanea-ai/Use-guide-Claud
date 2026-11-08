import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { markAllNotificationsAsReadUseCase } from '../application/usecases/markAllNotificationsAsReadUseCase';
import { markNotificationAsReadUseCase } from '../application/usecases/markNotificationAsReadUseCase';
import { subscribeToNotificationsUseCase } from '../application/usecases/subscribeToNotificationsUseCase';
import type { StoredNotification } from '../types/notification';
import { describeNotification } from '../utils/describeNotification';

// A central mostra os 50 mais recentes; avisos somem sozinhos depois de 90 dias (D25).
const LIMIT = 50;

/** Avisos da conta em tempo real, já no idioma ativo. Sem `uid` (sem login), fica vazio. */
export function useNotifications(uid: string | undefined) {
  const { t, i18n } = useTranslation();
  const [raw, setRaw] = useState<StoredNotification[]>([]);
  const [loading, setLoading] = useState(Boolean(uid));
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);

  // biome-ignore lint/correctness/useExhaustiveDependencies: `attempt` refaz a assinatura no "Tentar de novo".
  useEffect(() => {
    setRaw([]);
    setError(false);
    if (!uid) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsubscribe = subscribeToNotificationsUseCase(
      uid,
      (data) => {
        setRaw(data);
        setLoading(false);
      },
      () => {
        setError(true);
        setLoading(false);
      },
      LIMIT
    );
    return unsubscribe;
  }, [uid, attempt]);

  const items = useMemo(
    () => raw.map((notification) => describeNotification(notification, t, i18n.language)),
    [raw, t, i18n.language]
  );
  const unreadCount = items.filter((item) => !item.read).length;

  const markAsRead = useCallback((id: string) => markNotificationAsReadUseCase(id), []);
  const markAllAsRead = useCallback(() => markAllNotificationsAsReadUseCase(), []);
  const retry = useCallback(() => setAttempt((value) => value + 1), []);

  return { items, unreadCount, loading, error, retry, markAsRead, markAllAsRead };
}
