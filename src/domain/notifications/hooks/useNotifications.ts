import { useState, useEffect, useCallback, useRef } from 'react';
import { subscribeToNotificationsUseCase } from '../application/usecases/subscribeToNotificationsUseCase';
import { markNotificationAsReadUseCase } from '../application/usecases/markNotificationAsReadUseCase';
import { markAllNotificationsAsReadUseCase } from '../application/usecases/markAllNotificationsAsReadUseCase';
import { Notification } from '../types/notification';

const PAGE_SIZE = 10;

export function useNotifications(partnerId: string | undefined) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [limitCount, setLimitCount] = useState(PAGE_SIZE);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const prevPartnerIdRef = useRef<string | undefined>(partnerId);

  useEffect(() => {
    if (prevPartnerIdRef.current !== partnerId) {
      prevPartnerIdRef.current = partnerId;
      setLimitCount(PAGE_SIZE);
      setNotifications([]);
      setHasMore(true);
    }
  }, [partnerId]);

  useEffect(() => {
    if (!partnerId) {
      setLoading(false);
      setLoadingMore(false);
      return;
    }

    if (limitCount === PAGE_SIZE) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }
    setError(null);

    const unsubscribe = subscribeToNotificationsUseCase(
      partnerId,
      (data) => {
        setNotifications(data);
        setHasMore(data.length >= limitCount);
        setLoading(false);
        setLoadingMore(false);
      },
      (err) => {
        console.error('[useNotifications] Erro ao carregar notificações:', err);
        setError('Não foi possível carregar as notificações.');
        setLoading(false);
        setLoadingMore(false);
      },
      limitCount
    );

    return () => unsubscribe();
  }, [partnerId, limitCount]);

  const loadMore = useCallback(() => {
    if (!loading && !loadingMore && hasMore) {
      setLimitCount((prev) => prev + PAGE_SIZE);
    }
  }, [loading, loadingMore, hasMore]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = useCallback(async (notificationId: string) => {
    await markNotificationAsReadUseCase(notificationId);
  }, []);

  const markAllAsRead = useCallback(async () => {
    if (unreadCount === 0) return;
    await markAllNotificationsAsReadUseCase();
  }, [unreadCount]);

  return {
    notifications,
    unreadCount,
    loading,
    loadingMore,
    hasMore,
    loadMore,
    markAsRead,
    markAllAsRead,
  };
}
