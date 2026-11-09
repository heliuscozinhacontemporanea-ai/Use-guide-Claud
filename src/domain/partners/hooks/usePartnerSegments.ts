import { useMemo } from 'react';
import type { PartnerContentRecord } from '../types/partnerContent';
import {
  catalogSegmentsFor,
  catalogTabLabel,
  offersLabel,
  panelTabsFor,
  partnerSegments,
} from '../utils/partnerSegments';

/** Segmentos do parceiro e o que o painel mostra para eles (abas, nome do catálogo e partes). */
export function usePartnerSegments(
  items: readonly Pick<PartnerContentRecord, 'category'>[],
  events: readonly unknown[]
) {
  return useMemo(() => {
    const segments = partnerSegments({
      categories: items.map((item) => item.category),
      hasEvents: events.length > 0,
    });
    return {
      segments,
      tabs: panelTabsFor(segments),
      catalogLabel: catalogTabLabel(segments),
      catalogParts: catalogSegmentsFor(segments),
      offersLabel: offersLabel(segments),
    };
  }, [items, events]);
}
