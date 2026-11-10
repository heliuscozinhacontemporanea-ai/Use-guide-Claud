import { Calendar, ExternalLink, MessageCircle, ShieldCheck, Utensils } from 'lucide-react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { LOCATIONS } from '../../../../shared/constants/locations';
import { formatSessionLabel } from '../../../../shared/utils/businessDateTime';
import { whatsAppUrl } from '../../../../shared/utils/phone';
import { placeTimeSuffix } from '../../../../shared/utils/placeTime';
import { trackInteractionUseCase as trackInteraction } from '../../../insights';
import { ReviewSection } from '../../../reviews';
import type { GuideItem } from '../../types/guide';
import { ListingDetailPage } from './ListingDetailPage';

const CARD = 'rounded-[20px] bg-surface border border-line';
const ROW =
  'press w-full px-4 py-3.5 min-h-16 flex items-center gap-3 text-left focus-visible:ring-2 focus-visible:ring-teal-400/50 focus-visible:outline-none';

const FAVORITE_LABEL: Record<string, string> = {
  tour: 'passeio',
  transfer: 'translado',
  rental: 'aluguel',
  hotel: 'hospedagem',
  restaurant: 'restaurante',
  sight: 'atração',
  event: 'evento',
  tips: 'dica',
};

const REVIEW_PROMPT: Record<string, 'tour' | 'stay' | 'restaurant'> = {
  tour: 'tour',
  transfer: 'tour',
  rental: 'tour',
  hotel: 'stay',
  restaurant: 'restaurant',
};

function locationOf(item: GuideItem): string {
  const known = LOCATIONS.find((location) => location.id === item.location)?.name;
  if (known) return `${known}, Ceará`;
  return [item.city || item.location, item.state].filter(Boolean).join(', ');
}

/** Contato do anúncio de vitrine (C2/B37: quem vende pelo app não tem telefone público). */
function WhatsAppRow({ item, hint }: { item: GuideItem; hint: string }) {
  const { t } = useTranslation();
  const url = whatsAppUrl(item.phone);
  if (!url) return null;
  return (
    <button
      type="button"
      onClick={() => {
        void trackInteraction(
          item.id,
          'whatsapp_click',
          item.category === 'event' ? 'events' : 'items',
          item.partnerId
        );
        window.open(url, '_blank', 'noopener,noreferrer');
      }}
      className={`${CARD} ${ROW}`}
    >
      <span className="size-11 shrink-0 rounded-xl bg-[#25d366]/12 text-[#25d366] flex items-center justify-center">
        <MessageCircle size={20} aria-hidden="true" />
      </span>
      <span className="flex-1 min-w-0">
        <span className="block text-[13px] text-ink/70">{hint}</span>
        <span className="block text-[15px] font-semibold text-ink">
          {t('listingDetail.whatsapp')}
        </span>
      </span>
    </button>
  );
}

function InfoCard({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className={`${CARD} px-4 py-3.5 flex items-center gap-3`}>
      <span className="size-11 shrink-0 rounded-xl bg-ink/[0.06] text-ink/80 flex items-center justify-center">
        {icon}
      </span>
      <span className="min-w-0">
        <span className="block text-[13px] text-ink/70">{label}</span>
        <span className="block text-[15px] font-semibold text-ink">{value}</span>
      </span>
    </div>
  );
}

/**
 * Anúncio aberto, de qualquer categoria, na tela cheia aprovada (2026-11-10). O painel de reserva
 * (bookings) e o de ingressos (ticketing) chegam montados pela composição do app.
 */
export function ListingDetail({
  item,
  onClose,
  renderBooking,
  ticketPanel,
}: {
  item: GuideItem;
  onClose: () => void;
  /**
   * Painel de reserva (bookings) montado pelo app. Recebe "O que está incluído" para pôr entre a
   * oferta e a política, como no print aprovado.
   */
  renderBooking?: (included: ReactNode) => ReactNode;
  ticketPanel?: ReactNode;
}) {
  const { t, i18n } = useTranslation();
  const event = item.category === 'event';
  const includes = item.operationalInfo?.includes ?? [];
  const included =
    includes.length > 0 ? (
      <section className={`${CARD} p-4 space-y-1.5`}>
        <h2 className="text-[16px] font-semibold text-ink">{t('listingDetail.included')}</h2>
        <p className="text-[14px] text-ink/75">{includes.join(' · ')}</p>
      </section>
    ) : null;

  return (
    <ListingDetailPage
      item={item}
      onClose={onClose}
      locationLabel={locationOf(item)}
      collectionName={event ? 'events' : 'items'}
      favoriteLabel={FAVORITE_LABEL[item.category] ?? 'item'}
    >
      {event && item.date && (
        <InfoCard
          icon={<Calendar size={20} aria-hidden="true" />}
          label={t('listingDetail.eventDate')}
          value={`${formatSessionLabel(item.date, i18n.language, item.timeZone)}${placeTimeSuffix(t, item, item.date)}`}
        />
      )}
      {item.category === 'restaurant' && item.operationalInfo?.cuisineType && (
        <InfoCard
          icon={<Utensils size={20} aria-hidden="true" />}
          label={t('listingDetail.cuisine')}
          value={item.operationalInfo.cuisineType}
        />
      )}
      <WhatsAppRow
        item={item}
        hint={t(
          item.category === 'restaurant' || item.category === 'hotel'
            ? `listingDetail.whatsappHint.${item.category}`
            : 'listingDetail.whatsappHint.default'
        )}
      />
      {item.category === 'sight' && item.mapLink && (
        <button
          type="button"
          onClick={() => window.open(item.mapLink, '_blank', 'noopener,noreferrer')}
          className={`${CARD} ${ROW}`}
        >
          <span className="size-11 shrink-0 rounded-xl bg-accent-soft text-accent flex items-center justify-center">
            <ExternalLink size={20} aria-hidden="true" />
          </span>
          <span className="flex-1 min-w-0">
            <span className="block text-[13px] text-ink/70">
              {t('listingDetail.directionsHint')}
            </span>
            <span className="block text-[15px] font-semibold text-ink">
              {t('listingDetail.directions')}
            </span>
          </span>
        </button>
      )}
      {ticketPanel}
      {renderBooking ? renderBooking(included) : included}
      {event ? (
        <section className={`${CARD} p-4 space-y-1.5`}>
          <h2 className="flex items-center gap-2 text-[16px] font-semibold text-ink">
            <ShieldCheck size={18} className="text-accent" aria-hidden="true" />
            {t('listingDetail.verifiedReviewsTitle')}
          </h2>
          <p className="text-[14px] text-ink/75">{t('listingDetail.verifiedReviewsText')}</p>
        </section>
      ) : (
        <ReviewSection
          itemId={item.id}
          itemRating={item.rating}
          itemReviewCount={item.reviewCount}
          partnerId={item.partnerId}
          ownerId={item.ownerId}
          prompt={REVIEW_PROMPT[item.category] ?? 'default'}
        />
      )}
    </ListingDetailPage>
  );
}
