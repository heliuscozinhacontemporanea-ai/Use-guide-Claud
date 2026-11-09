import { createContext, type ReactNode, useContext, useMemo } from 'react';
import { formatBusinessDate } from '../../../shared/utils/businessDateTime';
import { utcOffsetLabel } from '../../../shared/utils/placeTime';
import { PLATFORM_TIME_ZONE } from '../../../shared/utils/timeZones';

interface PanelTimeZone {
  /** Fuso de "Hoje", da Agenda e das contas do painel (D28). */
  timeZone: string;
  /** Fuso do lugar do item (o do estabelecimento dele), ou o do painel. */
  zoneOf: (item: { establishmentIds: string[] }) => string;
}

const PanelTimeZoneContext = createContext<PanelTimeZone>({
  timeZone: PLATFORM_TIME_ZONE,
  zoneOf: () => PLATFORM_TIME_ZONE,
});

export function PanelTimeZoneProvider({
  timeZone,
  establishments,
  children,
}: {
  timeZone: string;
  establishments: ReadonlyArray<{ id: string; timeZone?: string }>;
  children: ReactNode;
}) {
  const value = useMemo<PanelTimeZone>(() => {
    const zones = new Map(establishments.map((item) => [item.id, item.timeZone]));
    return {
      timeZone,
      zoneOf: (item) => item.establishmentIds.map((id) => zones.get(id)).find(Boolean) ?? timeZone,
    };
  }, [timeZone, establishments]);
  return <PanelTimeZoneContext.Provider value={value}>{children}</PanelTimeZoneContext.Provider>;
}

export function usePanelTimeZone(): PanelTimeZone {
  return useContext(PanelTimeZoneContext);
}

/**
 * Hora de um item do painel na hora do lugar dele (D28): "20:00", ou "19:00 (UTC−4)" quando o
 * estabelecimento do item está em outro fuso que o do painel.
 */
export function usePanelItemTime(locale: string) {
  const { timeZone, zoneOf } = usePanelTimeZone();
  return (item: { establishmentIds: string[] }, iso: string) => {
    const zone = zoneOf(item);
    const time = formatBusinessDate(iso, locale, { hour: '2-digit', minute: '2-digit' }, zone);
    return zone === timeZone || utcOffsetLabel(zone, iso) === utcOffsetLabel(timeZone, iso)
      ? time
      : `${time} (${utcOffsetLabel(zone, iso)})`;
  };
}
