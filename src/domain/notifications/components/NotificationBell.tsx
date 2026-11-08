import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { syncPushDeviceUseCase } from '../application/usecases/syncPushDeviceUseCase';
import { useNotifications } from '../hooks/useNotifications';
import type { NotificationLink } from '../types/notification';
import { NotificationBellButton } from './NotificationBellButton';
import { NotificationCenterSheet } from './NotificationCenterSheet';

interface NotificationBellProps {
  uid: string;
  /** O app decide para onde cada aviso leva (ingressos, reservas, compras, painel). */
  onNavigate: (link: NotificationLink) => void;
  onOpenSettings: () => void;
}

/** Sininho do topo com a central de notificações, para todas as contas (D25). */
export function NotificationBell({ uid, onNavigate, onOpenSettings }: NotificationBellProps) {
  const { items, unreadCount, loading, error, retry, markAsRead, markAllAsRead } =
    useNotifications(uid);
  const [open, setOpen] = useState(false);
  const { i18n } = useTranslation();

  // Permissão já dada neste aparelho: confirma o token a cada login e quando o idioma muda.
  // biome-ignore lint/correctness/useExhaustiveDependencies: `uid` muda no login de outra conta.
  useEffect(() => {
    if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return;
    void syncPushDeviceUseCase(i18n.language).catch(() => false);
  }, [uid, i18n.language]);

  return (
    <>
      <NotificationBellButton unreadCount={unreadCount} onClick={() => setOpen(true)} />
      <NotificationCenterSheet
        open={open}
        onOpenChange={setOpen}
        items={items}
        loading={loading}
        error={error}
        onRetry={retry}
        onOpenItem={(item) => {
          if (!item.read) void markAsRead(item.id).catch(() => undefined);
          if (item.link) {
            setOpen(false);
            onNavigate(item.link);
          }
        }}
        onMarkAllRead={() => void markAllAsRead().catch(() => undefined)}
        onOpenSettings={() => {
          setOpen(false);
          onOpenSettings();
        }}
      />
    </>
  );
}
