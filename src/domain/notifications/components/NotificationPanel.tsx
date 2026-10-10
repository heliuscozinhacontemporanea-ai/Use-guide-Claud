import { AnimatePresence, motion } from 'motion/react';
import { Star, MessageSquare, Clock, CheckCheck, Loader2 } from 'lucide-react';
import { Notification } from '../types/notification';
import { Z_INDEX } from '../../../shared/constants/zIndex';
import { cn } from '../../../shared/utils/cn';

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: Notification[];
  loading?: boolean;
  loadingMore?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
}

const ICONS = {
  review: Star,
  admin_message: MessageSquare,
  plan_expiring: Clock,
};

function formatDate(timestamp: any): string {
  if (!timestamp) return '';
  const date = typeof timestamp.toDate === 'function' ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function NotificationPanel({
  isOpen,
  onClose,
  notifications,
  loading = false,
  loadingMore = false,
  hasMore = false,
  onLoadMore,
  onMarkAsRead,
  onMarkAllAsRead,
}: NotificationPanelProps) {
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - (scrollTop + clientHeight) < 40) {
      if (hasMore && !loadingMore && onLoadMore) {
        onLoadMore();
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <div
            className="fixed inset-0"
            style={{ zIndex: Z_INDEX.dropdown - 1 }}
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-80 max-w-[90vw] rounded-2xl border border-white/10 bg-zinc-950/95 backdrop-blur-xl shadow-2xl overflow-hidden"
            style={{ zIndex: Z_INDEX.dropdown }}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
              <span className="text-xs font-bold uppercase tracking-wide text-white/70">
                Notificações
              </span>
              {notifications.some((n) => !n.read) && (
                <button
                  onClick={onMarkAllAsRead}
                  aria-label="Marcar todas como lidas"
                  className="flex items-center gap-1 text-[10px] text-teal-400 hover:text-teal-300 transition-colors"
                >
                  <CheckCheck size={12} />
                  Marcar todas
                </button>
              )}
            </div>

            <div onScroll={handleScroll} className="max-h-96 overflow-y-auto no-scrollbar">
              {loading && notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 gap-2">
                  <Loader2 size={18} className="animate-spin text-teal-400" />
                  <p className="text-xs text-white/50">Carregando...</p>
                </div>
              ) : notifications.length === 0 ? (
                <p className="text-center text-sm text-white/50 py-8 px-4">
                  Nenhuma notificação ainda.
                </p>
              ) : (
                <>
                  {notifications.map((notification) => {
                    const Icon = ICONS[notification.type];
                    return (
                      <button
                        key={notification.id}
                        onClick={() => !notification.read && onMarkAsRead(notification.id)}
                        className={cn(
                          'w-full text-left px-4 py-3 border-b border-white/5 last:border-0 flex gap-3 transition-colors',
                          notification.read ? 'opacity-60' : 'bg-teal-500/5 hover:bg-teal-500/10'
                        )}
                      >
                        <div
                          className={cn(
                            'shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
                            notification.read ? 'bg-white/5' : 'bg-teal-500/15'
                          )}
                        >
                          <Icon
                            size={14}
                            className={notification.read ? 'text-white/50' : 'text-teal-400'}
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-white truncate">
                            {notification.title}
                          </p>
                          <p className="text-[11px] text-white/60 leading-relaxed line-clamp-2 mt-0.5">
                            {notification.message}
                          </p>
                          <p className="text-[9px] text-white/50 mt-1">
                            {formatDate(notification.createdAt)}
                          </p>
                        </div>
                        {!notification.read && (
                          <div className="shrink-0 w-2 h-2 rounded-full bg-teal-400 mt-1.5" />
                        )}
                      </button>
                    );
                  })}

                  {loadingMore && (
                    <div className="flex items-center justify-center py-3 gap-2 border-t border-white/5 bg-white/[0.02]">
                      <Loader2 size={14} className="animate-spin text-teal-400" />
                      <span className="text-[11px] text-white/50">Carregando mais antigas...</span>
                    </div>
                  )}

                  {hasMore && !loadingMore && onLoadMore && (
                    <div className="p-2 border-t border-white/5 text-center">
                      <button
                        type="button"
                        onClick={onLoadMore}
                        className="w-full py-2 text-[11px] font-medium text-teal-400 hover:text-teal-300 transition-colors bg-white/[0.02] hover:bg-white/[0.05] rounded-lg"
                      >
                        Carregar mais notificações
                      </button>
                    </div>
                  )}

                  {!hasMore && notifications.length > 5 && (
                    <p className="text-center text-[10px] text-white/50 py-3 border-t border-white/5">
                      Fim das notificações
                    </p>
                  )}
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
