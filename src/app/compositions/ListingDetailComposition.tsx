import { Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthContext } from '../../domain/auth';
import type { GuideItem } from '../../domain/guide';
import { useUI } from '../../shared/stores/useUIStore';
import { DelayedFallback } from '../../ui/lazy/DelayedFallback';
import {
  EventTicketingPurchasePanel,
  FavoriteButton,
  ItemBookingComposition,
  ListingDetail,
  ReviewSection,
} from '../lazy/screens';

// Categorias com reserva pelo app (passeio, translado, aluguel e entrada de atração).
const BOOKABLE_CATEGORIES = ['tour', 'transfer', 'rental', 'sight'];

// Pergunta da avaliação conforme o tipo de experiência (veja `ReviewSection`).
const REVIEW_PROMPT: Record<string, 'tour' | 'stay' | 'restaurant'> = {
  tour: 'tour',
  transfer: 'tour',
  rental: 'tour',
  hotel: 'stay',
  restaurant: 'restaurant',
};

/** Espaço do bloco de compra enquanto o código dele chega (DESIGN.md P15). */
function BlockFallback() {
  return (
    <DelayedFallback>
      <div className="h-24 rounded-card bg-surface border border-line animate-pulse-slow" />
    </DelayedFallback>
  );
}

/**
 * Anúncio aberto (guide) com a reserva (bookings) ou a compra de ingressos (ticketing), o favoritar
 * (favorites) e as avaliações (reviews) montados dentro.
 * `coversTabBar`: aberto por cima da busca; senão é página da aba, abaixo da barra de abas.
 */
export function ListingDetailComposition({
  item,
  coversTabBar,
  growsFromCard,
  onClose,
}: {
  item: GuideItem;
  coversTabBar: boolean;
  growsFromCard: boolean;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const { user } = useAuthContext();
  const { openLoginModal } = useUI();
  const event = item.category === 'event';

  return (
    <Suspense fallback={null}>
      <ListingDetail
        item={item}
        coversTabBar={coversTabBar}
        growsFromCard={growsFromCard}
        onClose={onClose}
        favorite={(scrollY) => (
          <Suspense fallback={null}>
            <FavoriteButton
              itemId={item.id}
              collectionName={event ? 'events' : 'items'}
              itemTypeLabel={t(`listingDetail.typeLabel.${item.category}`)}
              partnerId={item.partnerId}
              scrollY={scrollY}
              itemDetails={{
                name: item.name,
                image: item.image,
                category: item.category,
                location: item.location,
                rating: item.rating,
                description: item.description,
              }}
            />
          </Suspense>
        )}
        reviews={
          event ? undefined : (
            <Suspense fallback={<BlockFallback />}>
              <ReviewSection
                itemId={item.id}
                itemRating={item.rating}
                itemReviewCount={item.reviewCount}
                partnerId={item.partnerId}
                ownerId={item.ownerId}
                prompt={REVIEW_PROMPT[item.category] ?? 'default'}
              />
            </Suspense>
          )
        }
        renderBooking={
          BOOKABLE_CATEGORIES.includes(item.category)
            ? (included) => (
                <Suspense fallback={<BlockFallback />}>
                  <ItemBookingComposition guideItemId={item.id} between={included} />
                </Suspense>
              )
            : undefined
        }
        ticketPanel={
          event ? (
            <Suspense fallback={<BlockFallback />}>
              <EventTicketingPurchasePanel
                eventId={item.id}
                eventTitle={item.name}
                place={{ timeZone: item.timeZone, city: item.city }}
                userEmail={user?.email || undefined}
                userName={user?.displayName || undefined}
                onRequireLogin={openLoginModal}
              />
            </Suspense>
          ) : undefined
        }
      />
    </Suspense>
  );
}
