import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { formatBusinessDate } from '../../../../shared/utils/businessDateTime';
import { cn } from '../../../../shared/utils/cn';
import { ListError, ListLoading } from '../../../../ui/components/ListState';
import { usePartnerAgenda } from '../../hooks/usePartnerAgenda';
import type { PartnerTodayItem } from '../../types/partnerHome';
import {
  addBusinessDays,
  businessDay,
  sameBusinessDay,
  weekStart,
} from '../../utils/agendaCalendar';
import { AgendaDayList } from './AgendaDayList';
import { AgendaMonthSheet } from './AgendaMonthSheet';

const ARROW =
  'press w-11 h-11 rounded-xl flex items-center justify-center text-ink/80 focus-visible:ring-2 focus-visible:ring-teal-400/50';
// Arrastar a faixa da semana além disso troca de semana.
const SWIPE_PX = 50;

/**
 * Agenda (p05): o mês com setas, a faixa da semana (arrastar troca de semana), o calendário do
 * mês ao tocar no nome e a lista do dia escolhido.
 */
export function PartnerAgendaTab({
  visible,
  labelFor,
  onOpenItem,
  reloadKey,
  timeZone,
}: {
  /** Filtro de estabelecimento da casca. */
  visible: (item: PartnerTodayItem) => boolean;
  labelFor: (item: PartnerTodayItem) => string | null;
  onOpenItem: (item: PartnerTodayItem) => void;
  /** Muda quando uma folha altera a agenda (check-in, remarcação, cancelamento). */
  reloadKey: number;
  /** Fuso dos dias da Agenda (D28): o do estabelecimento filtrado, ou o do painel. */
  timeZone: string;
}) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const [selected, setSelected] = useState(() => businessDay(new Date(), timeZone));
  const [monthOpen, setMonthOpen] = useState(false);
  const start = weekStart(selected, timeZone);
  const agenda = usePartnerAgenda(start, addBusinessDays(start, 7, timeZone));
  const swipeFrom = useRef<number | null>(null);
  const reloadRef = useRef(agenda.reload);
  reloadRef.current = agenda.reload;
  const seenReloadKey = useRef(reloadKey);
  useEffect(() => {
    // Só quando uma folha muda a agenda; trocar de semana já recarrega pelo hook.
    if (seenReloadKey.current === reloadKey) return;
    seenReloadKey.current = reloadKey;
    void reloadRef.current();
  }, [reloadKey]);

  const items = agenda.data.filter(visible);
  const days = Array.from({ length: 7 }, (_, index) => addBusinessDays(start, index, timeZone));
  const dayItems = items.filter((item) => sameBusinessDay(item.startsAt, selected, timeZone));
  const shiftWeek = (step: number) => setSelected(addBusinessDays(selected, step * 7, timeZone));
  const isToday = sameBusinessDay(selected, new Date(), timeZone);

  return (
    <section className="space-y-6" aria-label={t('partnerPanel.agenda.title')}>
      <div data-tour="agenda-week" className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1 min-w-0">
          <button
            type="button"
            onClick={() => shiftWeek(-1)}
            aria-label={t('partnerPanel.agenda.previousWeek')}
            className={ARROW}
          >
            <ChevronLeft size={20} aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => setMonthOpen(true)}
            aria-haspopup="dialog"
            aria-label={t('partnerPanel.agenda.openMonth')}
            className="press min-h-11 px-1 rounded-xl text-[22px] font-display font-bold text-ink first-letter:uppercase truncate focus-visible:ring-2 focus-visible:ring-teal-400/50"
          >
            {formatBusinessDate(selected.toISOString(), lang, { month: 'long' }, timeZone)}
          </button>
          <button
            type="button"
            onClick={() => shiftWeek(1)}
            aria-label={t('partnerPanel.agenda.nextWeek')}
            className={ARROW}
          >
            <ChevronRight size={20} aria-hidden="true" />
          </button>
        </div>
        <button
          type="button"
          onClick={() => setSelected(businessDay(new Date(), timeZone))}
          className="press min-h-11 px-2 rounded-xl text-[14px] font-semibold text-accent focus-visible:ring-2 focus-visible:ring-teal-400/50"
        >
          {t('partnerPanel.agenda.today')}
        </button>
      </div>

      <div
        data-tour="agenda-week"
        className="grid grid-cols-7 gap-1 touch-pan-y"
        onPointerDown={(event) => {
          swipeFrom.current = event.clientX;
        }}
        onPointerUp={(event) => {
          if (swipeFrom.current === null) return;
          const distance = event.clientX - swipeFrom.current;
          swipeFrom.current = null;
          if (Math.abs(distance) > SWIPE_PX) shiftWeek(distance < 0 ? 1 : -1);
        }}
      >
        {days.map((day) => {
          const iso = day.toISOString();
          const active = sameBusinessDay(day, selected, timeZone);
          const busy = items.some((item) => sameBusinessDay(item.startsAt, day, timeZone));
          return (
            <button
              key={iso}
              type="button"
              aria-pressed={active}
              aria-label={formatBusinessDate(
                iso,
                lang,
                {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                },
                timeZone
              )}
              onClick={() => setSelected(day)}
              className={cn(
                'press min-h-16 rounded-2xl flex flex-col items-center justify-center focus-visible:ring-2 focus-visible:ring-teal-400/50',
                active ? 'bg-ink text-app' : 'text-ink'
              )}
            >
              <span className={cn('text-[11px]', active ? 'text-app/80' : 'text-ink/60')}>
                {formatBusinessDate(iso, lang, { weekday: 'short' }, timeZone).replace('.', '')}
              </span>
              <span className="text-[17px] font-bold">
                {formatBusinessDate(iso, lang, { day: 'numeric' }, timeZone)}
              </span>
              <span
                className={cn(
                  'w-1.5 h-1.5 rounded-full mt-1',
                  busy ? 'bg-teal-400' : 'bg-transparent'
                )}
              />
            </button>
          );
        })}
      </div>

      {agenda.loading && agenda.data.length === 0 ? (
        <ListLoading label={t('partnerPanel.agenda.title')} />
      ) : agenda.error ? (
        <ListError message={t('partnerPanel.agenda.error')} onRetry={() => void agenda.reload()} />
      ) : (
        <div data-tour="agenda-day">
          <AgendaDayList
            title={formatBusinessDate(
              selected.toISOString(),
              lang,
              {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
              },
              timeZone
            )}
            items={dayItems}
            isToday={isToday}
            labelFor={labelFor}
            onOpen={onOpenItem}
          />
        </div>
      )}

      {monthOpen && (
        <AgendaMonthSheet
          open
          onOpenChange={setMonthOpen}
          selected={selected}
          visible={visible}
          onSelect={setSelected}
          timeZone={timeZone}
        />
      )}
    </section>
  );
}
