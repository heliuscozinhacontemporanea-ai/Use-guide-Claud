import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { usePublishedOffers } from '../../hooks/usePublishedOffers';
import type { LocalizedText } from '../../types/bookings';
import { formatDuration } from '../../utils/formatDuration';
import { BookingFlow, type BookingFlowProps } from './BookingFlow';
import { OfferPolicySummary } from './OfferPolicySummary';

const CARD = 'rounded-[20px] bg-surface border border-line';

export function textFor(text: LocalizedText | undefined, language: string): string {
  if (!text) return '';
  const key = language === 'en' || language === 'fr' ? language : 'pt-BR';
  return text[key] || text['pt-BR'];
}

interface BookingOfferPanelProps extends Omit<BookingFlowProps, 'offer'> {
  guideItemId: string;
  /** Seções do anúncio entre a oferta e a política ("O que está incluído", print aprovado). */
  between?: ReactNode;
}

/**
 * Reserva no anúncio em tela cheia (2026-11-10): cartão da oferta (opções, horários, Reservar),
 * as seções do anúncio, a política de cancelamento e o aviso de contato pelo pedido (C2/B37).
 */
export function BookingOfferPanel({ guideItemId, between, ...flowProps }: BookingOfferPanelProps) {
  const { t, i18n } = useTranslation();
  const { data, loading } = usePublishedOffers(guideItemId);
  if (loading || data.length === 0) return <>{between}</>;
  const many = data.length > 1;

  return (
    <>
      {data.map((offer) => (
        <section
          key={offer.id}
          className={`${CARD} p-4 space-y-3`}
          aria-label={textFor(offer.title, i18n.language)}
        >
          <p className="text-[13px] text-ink/70">
            {[
              many ? textFor(offer.title, i18n.language) : t('bookings.buyer.choose'),
              offer.durationMinutes ? formatDuration(offer.durationMinutes) : null,
            ]
              .filter(Boolean)
              .join(' · ')}
          </p>
          {many && offer.description && (
            <p className="text-[14px] text-ink/75 whitespace-pre-line">
              {textFor(offer.description, i18n.language)}
            </p>
          )}
          <BookingFlow offer={offer} {...flowProps} />
        </section>
      ))}
      {between}
      {data.map((offer) => (
        <section key={`policy-${offer.id}`} className={`${CARD} p-4 space-y-1.5`}>
          <h2 className="text-[16px] font-semibold text-ink">
            {many
              ? `${t('bookings.buyer.cancellationTitle')} · ${textFor(offer.title, i18n.language)}`
              : t('bookings.buyer.cancellationTitle')}
          </h2>
          <OfferPolicySummary offer={offer} />
        </section>
      ))}
      <p className="px-1 text-center text-[13px] text-ink/70">
        {t('bookings.contact.afterBooking')}
      </p>
    </>
  );
}
