import { Bell } from 'lucide-react';
import { useTranslation } from 'react-i18next';

/** Sininho do topo do app com o número de avisos não lidos (D25). */
export function NotificationBellButton({
  unreadCount,
  onClick,
}: {
  unreadCount: number;
  onClick: () => void;
}) {
  const { t } = useTranslation();
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={
        unreadCount > 0
          ? t('notify.center.openUnread', { count: unreadCount })
          : t('notify.center.open')
      }
      className="press relative w-11 h-11 rounded-xl flex items-center justify-center text-ink hover:bg-ink/[0.05] focus-visible:ring-2 focus-visible:ring-teal-400/50"
    >
      <Bell size={20} aria-hidden="true" />
      {unreadCount > 0 && (
        <span
          aria-hidden="true"
          className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-danger text-[#ffffff] text-[11px] font-bold leading-[18px] text-center"
        >
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </button>
  );
}
