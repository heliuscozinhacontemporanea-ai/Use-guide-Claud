import { cn } from '../../../../shared/utils/cn';
import type { PartnerFleetDay } from '../../types/bookings';
import { type FleetBusyKind, fleetDayWindow } from '../../utils/fleetBusyKind';

/**
 * Barra de ocupação do dia (protótipo do horário personalizado, tela 3): um trecho por reserva, na cor
 * do período ou saída ou na do horário personalizado. Só visual: a lista ao lado diz o mesmo em texto.
 */
export function FleetDayBar({
  day,
  kindOf,
}: {
  day: PartnerFleetDay;
  kindOf: (busy: PartnerFleetDay['busy'][number]) => FleetBusyKind;
}) {
  const window = fleetDayWindow(day);
  const span = window ? window.endMs - window.startMs : 0;
  return (
    <div aria-hidden="true" className="relative h-1.5 overflow-hidden rounded-full bg-ink/[0.08]">
      {window &&
        day.busy.map((busy) => {
          const left = ((Date.parse(busy.startsAt) - window.startMs) / span) * 100;
          const width = ((Date.parse(busy.endsAt) - Date.parse(busy.startsAt)) / span) * 100;
          return (
            <span
              key={`${busy.startsAt}-${busy.endsAt}`}
              style={{ left: `${left}%`, width: `${width}%` }}
              className={cn(
                'absolute inset-y-0 rounded-full',
                kindOf(busy) === 'custom' ? 'bg-accent' : 'bg-partner'
              )}
            />
          );
        })}
    </div>
  );
}
