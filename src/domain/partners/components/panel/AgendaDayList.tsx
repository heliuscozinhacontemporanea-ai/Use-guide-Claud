import { ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { formatBusinessDate } from '../../../../shared/utils/businessDateTime';
import { ListEmpty } from '../../../../ui/components/ListState';
import { StatusText } from '../../../../ui/components/StatusText';
import type { PartnerTodayItem } from '../../types/partnerHome';

function ongoing(item: PartnerTodayItem, now: number) {
  const start = new Date(item.startsAt).getTime();
  return item.endsAt ? now >= start && now < new Date(item.endsAt).getTime() : false;
}

/** Lista do dia na Agenda (p05): horário e nome, pessoas e chegadas, ou o evento e a portaria. */
export function AgendaDayList({
  title,
  items,
  isToday,
  labelFor,
  onOpen,
}: {
  title: string;
  items: PartnerTodayItem[];
  isToday: boolean;
  labelFor: (item: PartnerTodayItem) => string | null;
  onOpen: (item: PartnerTodayItem) => void;
}) {
  const { t, i18n } = useTranslation();
  const now = Date.now();
  const time = (iso: string) =>
    formatBusinessDate(iso, i18n.language, { hour: '2-digit', minute: '2-digit' });
  return (
    <section aria-label={title}>
      <h2 className="px-1 mb-2 text-[18px] font-display font-bold text-ink first-letter:uppercase">
        {title}
      </h2>
      {items.length === 0 ? (
        <ListEmpty message={t('partnerPanel.agenda.dayEmpty')} />
      ) : (
        <ul className="rounded-[20px] bg-surface border border-line divide-y divide-line overflow-hidden">
          {items.map((item) => {
            const label = labelFor(item);
            const sub =
              item.kind === 'session'
                ? `${t('partnerPanel.home.session')} · ${t('partnerPanel.home.sold', {
                    sold: item.sold,
                    capacity: item.capacity,
                  })}`
                : [
                    t('partnerPanel.home.people', { count: item.sold }),
                    item.checkedIn
                      ? t('partnerPanel.agenda.arrived', { count: item.checkedIn })
                      : t('partnerPanel.agenda.free', {
                          count: Math.max(0, item.capacity - item.sold),
                        }),
                  ].join(' · ');
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
                    <span className="block text-[13px] text-ink/70">{sub}</span>
                    {(ongoing(item, now) || label) && (
                      <span className="mt-1 flex items-center gap-2">
                        {ongoing(item, now) && (
                          <StatusText tone="success">{t('partnerPanel.agenda.ongoing')}</StatusText>
                        )}
                        {label && (
                          <span className="px-2 py-0.5 rounded-md bg-ink/[0.07] text-[12px] font-semibold text-ink/80">
                            {label}
                          </span>
                        )}
                      </span>
                    )}
                  </span>
                  {item.kind === 'session' && isToday && (
                    <span className="shrink-0 text-[13px] font-semibold text-accent">
                      {t('partnerPanel.home.gate')}
                    </span>
                  )}
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
