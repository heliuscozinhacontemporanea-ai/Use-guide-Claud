import { useCallback, useMemo, useState } from 'react';
import { useMinuteClock } from '../../../shared/hooks/useMinuteClock';
import { agoraStarted } from '../adapters/localAgoraStartedAdapter';
import type { PartnerTodayItem } from '../types/partnerHome';
import { agoraCards } from '../utils/agoraCards';

/** Cartões de "Agora" (D27), recalculados pelo relógio do aparelho. */
export function usePartnerAgora(items: PartnerTodayItem[]) {
  const now = useMinuteClock();
  const [started, setStarted] = useState(() => new Set(agoraStarted.list()));
  const cards = useMemo(() => agoraCards(items, now, started), [items, now, started]);
  const start = useCallback((slotId: string) => setStarted(new Set(agoraStarted.add(slotId))), []);
  return { cards, now, start };
}
