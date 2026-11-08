import { Calendar } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { formatBusinessDateTime } from '../../../../shared/utils/businessDateTime';
import { cn } from '../../../../shared/utils/cn';
import { type PlaceTime, placeTimeFormNote } from '../../../../shared/utils/placeTime';
import type { EventOccurrence } from '../../../events';

interface OccurrencePickerProps {
  occurrences: EventOccurrence[];
  selectedId: string;
  onSelect: (occurrenceId: string) => void;
  /** Hora do lugar do evento; quem está em outro fuso vê o lugar e a diferença (D28). */
  place?: PlaceTime;
}

export function OccurrencePicker({
  occurrences,
  selectedId,
  onSelect,
  place,
}: OccurrencePickerProps) {
  const { t, i18n } = useTranslation();
  const zoneNote = placeTimeFormNote(t, place);
  return (
    <div className="space-y-1.5">
      <div
        className="flex items-center gap-2 overflow-x-auto pb-1"
        role="radiogroup"
        aria-label={t('ticketCheckout.sessionsLabel')}
      >
        {occurrences.map((occurrence) => (
          <button
            key={occurrence.id}
            type="button"
            role="radio"
            aria-checked={selectedId === occurrence.id}
            onClick={() => onSelect(occurrence.id)}
            className={cn(
              'min-h-11 px-3.5 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-teal-400/50',
              selectedId === occurrence.id
                ? 'bg-teal-400 text-slate-950'
                : 'bg-surface text-ink/70 hover:bg-white/10'
            )}
          >
            <Calendar size={13} aria-hidden="true" />
            <span>
              {formatBusinessDateTime(occurrence.startsAt, i18n.language, place?.timeZone)}
            </span>
          </button>
        ))}
      </div>
      {zoneNote && <p className="text-xs text-ink/70">{zoneNote}</p>}
    </div>
  );
}
