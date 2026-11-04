import { useCallback, useMemo, useState } from 'react';
import { PARTNER_HOME_CARD_IDS } from '../types/partnerHomeCards';
import type { PartnerTodayItem } from '../types/partnerHome';
import { type PartnerCardData, partnerCardData } from '../utils/partnerHomeCardData';
import {
  countAttentionByEstablishment,
  filterPartnerHome,
  shortEstablishmentName,
} from '../utils/partnerHomeFilter';
import { useEstablishmentFilter } from './useEstablishmentFilter';
import { usePartnerHome } from './usePartnerHome';
import { usePartnerHomeCards } from './usePartnerHomeCards';

/** Dados do Início com o filtro de estabelecimento (D27, opção A). */
export function usePartnerPanelHome() {
  const home = usePartnerHome();
  const establishments = useMemo(() => home.data?.establishments ?? [], [home.data]);
  const { filter, setFilter } = useEstablishmentFilter(establishments.map((item) => item.id));
  const [sheetOpen, setSheetOpen] = useState(false);

  const filtered = useMemo(
    () => (home.data ? filterPartnerHome(home.data, filter) : { attention: [], today: [] }),
    [home.data, filter]
  );
  const pendingById = useMemo(
    () => (home.data ? countAttentionByEstablishment(home.data) : {}),
    [home.data]
  );
  const names = useMemo(
    () => new Map(establishments.map((item) => [item.id, item.name])),
    [establishments]
  );

  const labelFor = useCallback(
    (item: PartnerTodayItem) => {
      if (filter !== null || establishments.length < 2) return null;
      const name = item.establishmentIds.map((id) => names.get(id)).find(Boolean);
      return name ? shortEstablishmentName(name) : null;
    },
    [filter, establishments.length, names]
  );

  const cardsState = usePartnerHomeCards(home.data?.cards);
  const cards = useMemo(() => {
    const view = home.data;
    const dataOf = (id: (typeof PARTNER_HOME_CARD_IDS)[number]) =>
      view ? partnerCardData(id, view, filtered.today, filter) : null;
    return {
      ...cardsState,
      visible: cardsState.cards
        .map(dataOf)
        .filter((data): data is PartnerCardData => data !== null),
      available: PARTNER_HOME_CARD_IDS.filter((id) => dataOf(id) !== null),
    };
  }, [cardsState, home.data, filtered.today, filter]);

  const otherPending =
    filter !== null &&
    Object.entries(pendingById).some(([id, count]) => id !== filter && count > 0);

  return {
    ...home,
    establishments,
    filter,
    setFilter,
    filterName: filter ? (names.get(filter) ?? null) : null,
    sheetOpen,
    setSheetOpen,
    attention: filtered.attention,
    today: filtered.today,
    pendingById,
    labelFor,
    otherPending,
    cards,
  };
}
