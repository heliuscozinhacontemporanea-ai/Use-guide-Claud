import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { formatBusinessDate } from '../../../../shared/utils/businessDateTime';
import { cn } from '../../../../shared/utils/cn';
import { capitalizeFirst } from '../../../../shared/utils/formatters';
import { Dialog } from '../../../../ui/components/Dialog';
import { usePartnerAgenda } from '../../hooks/usePartnerAgenda';
import type { PartnerTodayItem } from '../../types/partnerHome';
import {
  addBusinessDays,
  businessMonth,
  monthGrid,
  sameBusinessDay,
} from '../../utils/agendaCalendar';

const ARROW =
  'press w-11 h-11 rounded-xl flex items-center justify-center text-ink/80 focus-visible:ring-2 focus-visible:ring-teal-400/50';

/** Calendário do mês (aberto pelo nome do mês na Agenda): o dia escolhido abre a semana dele. */
export function AgendaMonthSheet({
  open,
  onOpenChange,
  selected,
  visible,
  onSelect,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selected: Date;
  /** O que mostrar com o filtro de estabelecimento. */
  visible: (item: PartnerTodayItem) => boolean;
  onSelect: (day: Date) => void;
}) {
  const { t, i18n } = useTranslation();
  const [anchor, setAnchor] = useState(selected);
  const grid = useMemo(() => monthGrid(anchor), [anchor]);
  const last = grid.days[grid.days.length - 1] ?? grid.month;
  const agenda = usePartnerAgenda(
    open ? (grid.days[0] ?? null) : null,
    open ? addBusinessDays(last, 1) : null
  );
  const busy = agenda.data.filter(visible);
  const shiftMonth = (step: number) => setAnchor(addBusinessDays(grid.month, step > 0 ? 40 : -10));
  const weekdays = grid.days
    .slice(0, 7)
    .map((day) => formatBusinessDate(day.toISOString(), i18n.language, { weekday: 'narrow' }));
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={capitalizeFirst(
        formatBusinessDate(grid.month.toISOString(), i18n.language, {
          month: 'long',
          year: 'numeric',
        }),
        i18n.language
      )}
    >
      <div className="space-y-3">
        <div className="flex justify-between">
          <button
            type="button"
            onClick={() => shiftMonth(-1)}
            aria-label={t('partnerPanel.agenda.previousMonth')}
            className={ARROW}
          >
            <ChevronLeft size={20} aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => shiftMonth(1)}
            aria-label={t('partnerPanel.agenda.nextMonth')}
            className={ARROW}
          >
            <ChevronRight size={20} aria-hidden="true" />
          </button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center" aria-hidden="true">
          {weekdays.map((label, index) => (
            <span key={`${label}-${index}`} className="text-[11px] text-ink/60">
              {label}
            </span>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {grid.days.map((day) => {
            const iso = day.toISOString();
            const isSelected = sameBusinessDay(day, selected);
            const outside = businessMonth(day) !== businessMonth(grid.month);
            const hasItems = busy.some((item) => sameBusinessDay(item.startsAt, day));
            return (
              <button
                key={iso}
                type="button"
                aria-pressed={isSelected}
                aria-label={formatBusinessDate(iso, i18n.language, {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                })}
                onClick={() => {
                  onSelect(day);
                  onOpenChange(false);
                }}
                className={cn(
                  'press min-h-11 rounded-2xl flex flex-col items-center justify-center focus-visible:ring-2 focus-visible:ring-teal-400/50',
                  isSelected ? 'bg-ink text-app' : outside ? 'text-ink/40' : 'text-ink'
                )}
              >
                <span className="text-[15px] font-semibold">
                  {formatBusinessDate(iso, i18n.language, { day: 'numeric' })}
                </span>
                <span
                  className={cn(
                    'w-1.5 h-1.5 rounded-full',
                    hasItems ? 'bg-teal-400' : 'bg-transparent'
                  )}
                />
              </button>
            );
          })}
        </div>
      </div>
    </Dialog>
  );
}
