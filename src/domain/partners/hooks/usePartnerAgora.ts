import { useMemo } from 'react';
import { useMinuteClock } from '../../../shared/hooks/useMinuteClock';
import type { PartnerTodayItem } from '../types/partnerHome';
import { agoraCards } from '../utils/agoraCards';
import { usePanelTimeZone } from './panelTimeZone';

/** Cartões de "Agora" (D27), recalculados pelo relógio do aparelho. */
export function usePartnerAgora(items: PartnerTodayItem[]) {
  const now = useMinuteClock();
  const { zoneOf } = usePanelTimeZone();
  const cards = useMemo(() => agoraCards(items, now, zoneOf), [items, now, zoneOf]);
  return { cards, now };
}
