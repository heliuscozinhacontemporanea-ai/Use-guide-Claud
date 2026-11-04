import { ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { formatBusinessDate } from '../../../../shared/utils/businessDateTime';
import { ListEmpty } from '../../../../ui/components/ListState';
import type { PartnerTodayItem } from '../../types/partnerHome';

/** Horários de reserva e sessões do dia; com "Todos", cada linha leva o nome curto do lugar (D27). */
export function PartnerTodayList({
  title,
  items,
  labelFor,
  onOpen,
}: {
  title: string;
  items: PartnerTodayItem[];
  /** Etiqueta do estabelecimento; `null` quando o filtro já diz qual é. */
  labelFor: (item: PartnerTodayItem) => string | null;
  onOpen: (item: PartnerTodayItem) => void;
}) {
  const { t, i18n } = useTranslation();
  const time = (iso: string) =>
    formatBusinessDate(iso, i18n.language, { hour: '2-digit', minute: '2-digit' });
  return (
    <section aria-label={title}>
      <h2 className="px-1 mb-2 text-[18px] font-display font-bold text-ink">{title}</h2>
      {items.length === 0 ? (
        <ListEmpty message={t('partnerPanel.home.todayEmpty')} />
      ) : (
        <ul className="rounded-[20px] bg-surface border border-line divide-y divide-line overflow-hidden">
          {items.map((item) => {
            const label = labelFor(item);
            const parts = [
              item.kind === 'session' ? t('partnerPanel.home.session') : null,
              t('partnerPanel.home.sold', { sold: item.sold, capacity: item.capacity }),
              item.checkedIn !== null && item.checkedIn > 0
                ? t('partnerPanel.home.checkedIn', { count: item.checkedIn })
                : null,
              item.arrivedAt
                ? t('partnerPanel.home.arrivedAt', { time: time(item.arrivedAt) })
                : null,
            ].filter(Boolean);
            return (
              <li key={`${item.kind}-${item.id}`}>
                <button
                  type="button"
                  onClick={() => onOpen(item)}
                  className="press w-full px-4 py-3.5 min-h-16 flex items-center gap-3 text-left focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-teal-400/50"
                >
                  <span className="flex-1 min-w-0">
                    <span className="block text-[15px] font-semibold text-ink truncate">
                      {time(item.startsAt)} · {item.title}
                    </span>
                    <span className="block text-[13px] text-ink/70">{parts.join(' · ')}</span>
                    {label && (
                      <span className="inline-block mt-1.5 px-2 py-0.5 rounded-md bg-ink/[0.07] text-[12px] font-semibold text-ink/80">
                        {label}
                      </span>
                    )}
                  </span>
                  <ChevronRight size={18} className="text-ink/50 shrink-0" aria-hidden="true" />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
