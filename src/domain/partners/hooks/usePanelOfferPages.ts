import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useUI } from '../../../shared/stores/useUIStore';
import {
  type OfferPageRequest,
  offerListingOf,
  type PartnerCatalogRenders,
} from '../components/panel/PartnerCatalogSection';
import type { PartnerContentRecord } from '../types/partnerContent';
import { isOfferPage, type usePanelNavigation } from './usePanelNavigation';

/**
 * Editor de oferta, horários e reservas como páginas empilhadas do painel (F3, D34). Oferta criada
 * troca o editor pelos horários dela; editada, volta. Ao fechar a última página de oferta, a lista de
 * ofertas e o guia do Início são relidos.
 */
export function usePanelOfferPages(
  nav: ReturnType<typeof usePanelNavigation>,
  renderCatalog: PartnerCatalogRenders | undefined,
  onPagesClosed: () => void
) {
  const { t } = useTranslation();
  const { showToast } = useUI();
  const save = useRef<(() => void) | null>(null);
  const [version, setVersion] = useState(0);
  const open = useRef(false);
  const closed = useRef(onPagesClosed);
  closed.current = onPagesClosed;

  useEffect(
    () =>
      nav.pages.subscribe(() => {
        const nowOpen = nav.pages.getPages().some(isOfferPage);
        if (open.current && !nowOpen) {
          setVersion((current) => current + 1);
          closed.current();
        }
        open.current = nowOpen;
      }),
    [nav.pages]
  );

  const openPage = useCallback(
    (request: OfferPageRequest) => nav.pages.push({ view: 'offer', request }),
    [nav.pages]
  );

  const registerSave = useCallback((next: (() => void) | null) => {
    save.current = next;
  }, []);

  const onSaved = useCallback(
    (saved: { offerId: string; created: boolean }) => {
      showToast(t('partnerGuide.offer.saved'), 'success');
      if (saved.created) {
        // Depois de criar, o próximo passo é abrir os horários (guia do Início, D34).
        nav.pages.replace({
          view: 'offer',
          request: { kind: 'slots', offerId: saved.offerId, title: t('partnerGuide.offer.slots') },
        });
        return;
      }
      nav.closeTop((page) => page.view === 'offer' && page.request.kind === 'editor');
    },
    [nav, showToast, t]
  );

  // As listas de ofertas do Catálogo e da página do estabelecimento abrem as páginas por aqui.
  const catalogRenders = useMemo<PartnerCatalogRenders>(() => {
    const renders = renderCatalog ?? {};
    const { renderOffers } = renders;
    return renderOffers
      ? {
          ...renders,
          renderOffers: (props) => renderOffers({ ...props, onOpenPage: openPage, version }),
        }
      : renders;
  }, [renderCatalog, openPage, version]);

  return {
    catalogRenders,
    registerSave,
    save: () => save.current?.(),
    onSaved,
    /** Guia do Início: a primeira oferta do estabelecimento, já ligada a ele. */
    openNew: (
      item: { id: string; category: string } & Pick<PartnerContentRecord, 'operationalInfo'>
    ) =>
      openPage({
        kind: 'editor',
        itemId: item.id,
        category: item.category,
        listing: offerListingOf(item),
        title: t('partnerGuide.offer.newTitle'),
      }),
    openSlots: (offerId: string) =>
      openPage({ kind: 'slots', offerId, title: t('partnerGuide.offer.slots') }),
  };
}
