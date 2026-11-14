import { Suspense } from 'react';
import { useAuthContext } from '../../domain/auth/context/AuthContext';
import type { GuideItem } from '../../domain/guide';
import { useUI } from '../../shared/stores/useUIStore';
import { DelayedFallback } from '../../ui/lazy/DelayedFallback';
import {
  EventTicketingPurchasePanel,
  ItemBookingComposition,
  ListingDetail,
} from '../lazy/screens';

// Categorias com reserva pelo app (passeio, translado, aluguel e entrada de atração).
const BOOKABLE_CATEGORIES = ['tour', 'transfer', 'rental', 'sight'];

/** Espaço do bloco de compra enquanto o código dele chega (DESIGN.md P15). */
function BlockFallback() {
  return (
    <DelayedFallback>
      <div className="h-24 rounded-card bg-surface border border-line animate-pulse-slow" />
    </DelayedFallback>
  );
}

/**
 * Anúncio aberto (guide) com a reserva (bookings) ou a compra de ingressos (ticketing) montadas dentro.
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
  const { user } = useAuthContext();
  const { openLoginModal } = useUI();

  return (
    <Suspense fallback={null}>
      <ListingDetail
        item={item}
        coversTabBar={coversTabBar}
        growsFromCard={growsFromCard}
        onClose={onClose}
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
          item.category === 'event' ? (
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
