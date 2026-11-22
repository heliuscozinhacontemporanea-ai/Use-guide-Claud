import { useTranslation } from 'react-i18next';
import { ListCard, ListRowButton } from '../../../../ui/components/ListRows';
import { usePartnerOffers } from '../../hooks/usePartnerOffers';
import { isBookableCategory, offerKindForCategory } from '../../utils/offerKindByCategory';

/**
 * "Ver as ofertas deste passeio · 1 oferta à venda", no bloco Detalhes do anúncio (protótipo da F3,
 * tela 1). O toque leva à página do estabelecimento, onde estão as ofertas.
 */
export function ListingOffersLink({
  itemId,
  category,
  onOpen,
}: {
  itemId: string;
  category: string;
  onOpen: () => void;
}) {
  const { t } = useTranslation();
  const offers = usePartnerOffers();
  const kind = offerKindForCategory(category);
  if (!isBookableCategory(category) || !kind || offers.loading) return null;
  const forSale = offers.data.filter(
    (offer) => offer.guideItemId === itemId && offer.status === 'published'
  ).length;
  return (
    <ListCard>
      <ListRowButton
        title={t(`bookings.partner.listingOffers.${kind}`)}
        sub={
          forSale === 0
            ? t('bookings.partner.listingOffersNone')
            : t('bookings.partner.listingOffersCount', { count: forSale })
        }
        onClick={onOpen}
      />
    </ListCard>
  );
}
