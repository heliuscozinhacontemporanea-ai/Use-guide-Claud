import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '../../../../shared/utils/cn';
import { isoToZonedDateTime, PLATFORM_TIME_ZONE } from '../../../../shared/utils/timeZones';
import { formatSlotTime } from '../../utils/dates';
import type { CustomStart } from '../../utils/fleetAvailability';
import { FLEET_OPTION, FLEET_OPTION_IDLE, FLEET_OPTION_SELECTED } from './FleetFixedOptions';

/** Partes do dia na hora do lugar: até 5 h, 12 h, 18 h e 24 h. */
const DAY_PARTS = [
  { key: 'dawn', until: 5 },
  { key: 'morning', until: 12 },
  { key: 'afternoon', until: 18 },
  { key: 'evening', until: 24 },
] as const;

type DayPart = (typeof DAY_PARTS)[number]['key'];

function dayPartOf(iso: string, timeZone: string): DayPart {
  const hour = Number(isoToZonedDateTime(iso, timeZone).slice(11, 13));
  return (DAY_PARTS.find((part) => hour < part.until) ?? DAY_PARTS[3]).key;
}

function StartGroup({
  part,
  starts,
  selectedStartsAt,
  timeZone,
  onSelect,
}: {
  part: DayPart;
  starts: CustomStart[];
  selectedStartsAt?: string;
  timeZone?: string;
  onSelect: (startsAt: string) => void;
}) {
  const { t, i18n } = useTranslation();
  const labelId = useId();
  return (
    <div className="space-y-1.5">
      <p id={labelId} className="text-[12px] font-medium text-ink/60">
        {t(`fleet.booking.dayPart.${part}`)}
      </p>
      <div role="group" aria-labelledby={labelId} className="grid grid-cols-4 gap-2">
        {starts.map((start) => {
          const selected = start.startsAt === selectedStartsAt;
          const label = formatSlotTime(start.startsAt, i18n.language, timeZone);
          return (
            <button
              key={start.startsAt}
              type="button"
              disabled={start.free <= 0}
              aria-pressed={selected}
              aria-label={start.free <= 0 ? `${label} · ${t('fleet.booking.soldOut')}` : undefined}
              onClick={() => onSelect(start.startsAt)}
              className={cn(
                FLEET_OPTION,
                'text-center text-[14px] font-medium disabled:line-through',
                selected ? FLEET_OPTION_SELECTED : FLEET_OPTION_IDLE
              )}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Inícios do horário personalizado agrupados em madrugada, manhã, tarde e noite (resposta 4 da
 * comparação com o protótipo, 2026-11-21): a lista do translado pode ter dezenas de horários.
 */
export function FleetStartGrid({
  legend,
  starts,
  selectedStartsAt,
  timeZone,
  onSelect,
}: {
  legend: string;
  starts: CustomStart[];
  selectedStartsAt?: string;
  timeZone?: string;
  onSelect: (startsAt: string) => void;
}) {
  const zone = timeZone ?? PLATFORM_TIME_ZONE;
  const groups = DAY_PARTS.map((part) => ({
    part: part.key,
    starts: starts.filter((start) => dayPartOf(start.startsAt, zone) === part.key),
  })).filter((group) => group.starts.length > 0);

  return (
    <fieldset className="space-y-3">
      <legend className="mb-2 text-[13px] font-semibold text-ink/80">{legend}</legend>
      {groups.map((group) => (
        <StartGroup
          key={group.part}
          part={group.part}
          starts={group.starts}
          selectedStartsAt={selectedStartsAt}
          timeZone={timeZone}
          onSelect={onSelect}
        />
      ))}
    </fieldset>
  );
}
