import { ChevronRight, Compass, Heart, MapPin, Star, Ticket } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useMyBookings } from '../../domain/bookings';
import { useFavorites } from '../../domain/favorites';
import { useMyReviews } from '../../domain/reviews';
import { useUserTicketsAndOrders } from '../../domain/ticketing';
import { formatBusinessDate } from '../../shared/utils/businessDateTime';
import { ShortcutTile } from '../../ui/components/ShortcutTile';

interface ProfileHighlightsProps {
  onOpenTickets: () => void;
  onOpenBookings: () => void;
  onOpenFavorites: () => void;
  onOpenReviews: () => void;
}

interface NextUp {
  kind: 'ticket' | 'booking';
  title: string;
  startsAt: string;
  place: string | null;
  count: number;
}

/**
 * Perfil (D19): o próximo evento ou serviço e os atalhos com números. Junta ingressos, reservas,
 * favoritos e avaliações, cada um pelo próprio domínio.
 */
export function ProfileHighlightsComposition({
  onOpenTickets,
  onOpenBookings,
  onOpenFavorites,
  onOpenReviews,
}: ProfileHighlightsProps) {
  const { t, i18n } = useTranslation();
  const wallet = useUserTicketsAndOrders(true);
  const bookings = useMyBookings();
  const { favorites, loading: favoritesLoading } = useFavorites();
  const reviews = useMyReviews();
  const now = Date.now();

  const upcomingTickets = wallet.tickets.filter(
    (ticket) =>
      ticket.status === 'issued' &&
      ticket.eventSnapshot &&
      new Date(ticket.eventSnapshot.startsAt).getTime() > now
  );
  const upcomingBookings = bookings.data.filter(
    (booking) => booking.status === 'confirmed' && new Date(booking.offer.startsAt).getTime() > now
  );

  const candidates: NextUp[] = [];
  const byOrder = new Map<string, NextUp>();
  for (const ticket of upcomingTickets) {
    const event = ticket.eventSnapshot;
    if (!event) continue;
    const current = byOrder.get(ticket.orderId);
    if (current) current.count += 1;
    else
      byOrder.set(ticket.orderId, {
        kind: 'ticket',
        title: event.title,
        startsAt: event.startsAt,
        place: event.locationName ?? null,
        count: 1,
      });
  }
  candidates.push(...byOrder.values());
  for (const booking of upcomingBookings) {
    candidates.push({
      kind: 'booking',
      title: booking.offer.title,
      startsAt: booking.offer.startsAt,
      place: booking.offer.meetingPoint,
      count: booking.participantsCount,
    });
  }
  const next = candidates.sort((a, b) => a.startsAt.localeCompare(b.startsAt))[0];

  const count = (loading: boolean, value: number, more = false) =>
    loading ? null : `${value}${more ? '+' : ''}`;

  return (
    <div className="space-y-4">
      {next && (
        <section>
          <h3 className="text-[13px] font-semibold text-ink/70 px-1 mb-2">{t('profile.next')}</h3>
          <button
            type="button"
            onClick={next.kind === 'ticket' ? onOpenTickets : onOpenBookings}
            className="press w-full p-4 rounded-[20px] bg-surface border border-line flex gap-3 text-left focus-visible:ring-2 focus-visible:ring-teal-400/50 focus-visible:outline-none"
          >
            <span className="w-12 h-12 shrink-0 rounded-2xl bg-accent-soft text-accent flex items-center justify-center">
              {next.kind === 'ticket' ? (
                <Ticket size={22} aria-hidden="true" />
              ) : (
                <Compass size={22} aria-hidden="true" />
              )}
            </span>
            <span className="flex-1 min-w-0">
              <span className="block text-[15px] font-semibold text-ink break-words">
                {next.title}
              </span>
              <span className="block text-sm text-ink/70">
                {formatBusinessDate(next.startsAt, i18n.language, {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                })}{' '}
                ·{' '}
                {t(next.kind === 'ticket' ? 'profile.nextTickets' : 'profile.nextParticipants', {
                  count: next.count,
                })}
              </span>
              {next.place && (
                <span className="mt-1 flex items-center gap-1.5 text-[13px] text-ink/70 min-w-0">
                  <MapPin size={14} className="shrink-0" aria-hidden="true" />
                  <span className="truncate">{next.place}</span>
                </span>
              )}
            </span>
            <ChevronRight size={18} className="text-ink/40 mt-1 shrink-0" aria-hidden="true" />
          </button>
        </section>
      )}
      <div className="grid grid-cols-2 gap-3">
        <ShortcutTile
          icon={<Ticket size={18} aria-hidden="true" />}
          label={t('profile.tiles.tickets')}
          value={count(wallet.loading && wallet.tickets.length === 0, upcomingTickets.length)}
          hint={t('profile.ticketsHint', { count: upcomingTickets.length })}
          onClick={onOpenTickets}
        />
        <ShortcutTile
          icon={<Compass size={18} aria-hidden="true" />}
          label={t('profile.tiles.bookings')}
          value={count(bookings.loading && bookings.data.length === 0, upcomingBookings.length)}
          hint={t('profile.bookingsHint', { count: upcomingBookings.length })}
          onClick={onOpenBookings}
        />
        <ShortcutTile
          icon={<Heart size={18} aria-hidden="true" />}
          label={t('profile.tiles.favorites')}
          value={count(favoritesLoading && favorites.length === 0, favorites.length)}
          hint={t('profile.favoritesHint', { count: favorites.length })}
          onClick={onOpenFavorites}
        />
        <ShortcutTile
          icon={<Star size={18} aria-hidden="true" />}
          label={t('profile.tiles.reviews')}
          value={count(
            reviews.loading && reviews.data.length === 0,
            reviews.data.length,
            reviews.hasMore
          )}
          hint={t('profile.reviewsHint', { count: reviews.data.length })}
          onClick={onOpenReviews}
        />
      </div>
    </div>
  );
}
