import { Settings } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '../../../shared/utils/cn';
import { Dialog } from '../../../ui/components/Dialog';
import { TextButton } from '../../../ui/components/TextButton';
import type { NotificationCenterItem } from '../types/notificationCategories';

const TIME_ZONE = 'America/Fortaleza';

function dayKey(date: Date): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: TIME_ZONE }).format(date);
}

function relativeTime(date: Date, locale: string, now: Date): string {
  const minutes = Math.round((date.getTime() - now.getTime()) / 60_000);
  const format = new Intl.RelativeTimeFormat(locale, { numeric: 'auto', style: 'short' });
  if (Math.abs(minutes) < 60) return format.format(minutes, 'minute');
  const hours = Math.round(minutes / 60);
  if (Math.abs(hours) < 24) return format.format(hours, 'hour');
  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
    timeZone: TIME_ZONE,
  }).format(date);
}

interface NotificationCenterSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: NotificationCenterItem[];
  loading: boolean;
  error: boolean;
  onRetry: () => void;
  onOpenItem: (item: NotificationCenterItem) => void;
  onMarkAllRead: () => void;
  onOpenSettings: () => void;
  now?: Date;
}

/** Central de notificações de todas as contas (D25): Hoje e Antes, tocar abre o lugar certo. */
export function NotificationCenterSheet({
  open,
  onOpenChange,
  items,
  loading,
  error,
  onRetry,
  onOpenItem,
  onMarkAllRead,
  onOpenSettings,
  now = new Date(),
}: NotificationCenterSheetProps) {
  const { t, i18n } = useTranslation();
  const today = dayKey(now);
  const groups = [
    { key: 'today', items: items.filter((item) => dayKey(item.createdAt) === today) },
    { key: 'earlier', items: items.filter((item) => dayKey(item.createdAt) !== today) },
  ].filter((group) => group.items.length > 0);
  const hasUnread = items.some((item) => !item.read);

  return (
    <Dialog open={open} onOpenChange={onOpenChange} title={t('notify.center.title')}>
      <div className="flex items-center justify-between gap-2 -mt-1 mb-3">
        <TextButton tone="accent" disabled={!hasUnread} onClick={onMarkAllRead}>
          {t('notify.center.markAll')}
        </TextButton>
        <button
          type="button"
          onClick={onOpenSettings}
          aria-label={t('notify.center.settings')}
          className="press w-11 h-11 rounded-xl flex items-center justify-center text-ink/80 hover:bg-ink/[0.05] focus-visible:ring-2 focus-visible:ring-teal-400/50"
        >
          <Settings size={20} aria-hidden="true" />
        </button>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[0, 1, 2].map((row) => (
            <div
              key={row}
              className="h-[72px] rounded-2xl bg-ink/[0.04] animate-pulse motion-reduce:animate-none"
            />
          ))}
        </div>
      ) : error ? (
        <div className="flex items-center justify-between gap-2 py-6 text-[13px] text-ink/70">
          <span role="alert">{t('notify.center.loadError')}</span>
          <TextButton tone="accent" onClick={onRetry}>
            {t('notify.retry')}
          </TextButton>
        </div>
      ) : groups.length === 0 ? (
        <div className="py-10 text-center space-y-1">
          <p className="text-[15px] font-semibold text-ink">{t('notify.center.empty')}</p>
          <p className="text-[13px] text-ink/70">{t('notify.center.emptyHint')}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {groups.map((group) => (
            <section key={group.key}>
              <h3 className="mb-2 text-xs font-bold text-ink">{t(`notify.center.${group.key}`)}</h3>
              <ul className="space-y-2">
                {group.items.map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => onOpenItem(item)}
                      className="press w-full p-4 rounded-2xl bg-ink/[0.04] flex items-start gap-3 text-left hover:bg-ink/[0.06] focus-visible:ring-2 focus-visible:ring-teal-400/50 focus-visible:outline-none"
                    >
                      <span className="flex-1 min-w-0 space-y-0.5">
                        <span
                          className={cn(
                            'block text-[15px] text-ink break-words',
                            item.read ? 'font-medium' : 'font-semibold'
                          )}
                        >
                          {item.title}
                        </span>
                        <span className="block text-[13px] text-ink/70 break-words">
                          {item.body}
                        </span>
                      </span>
                      <span className="shrink-0 flex items-center gap-2 pt-0.5">
                        <span className="text-[12px] text-ink/70 tabular-nums">
                          {relativeTime(item.createdAt, i18n.language, now)}
                        </span>
                        {!item.read && (
                          <span className="w-2 h-2 rounded-full bg-accent">
                            <span className="sr-only">{t('notify.center.unread')}</span>
                          </span>
                        )}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </Dialog>
  );
}
