import { CalendarCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { GlassCard } from '../../../../ui/components/GlassCard';
import { usePublishedOffers } from '../../hooks/usePublishedOffers';
import type { LocalizedText } from '../../types/bookings';
import { formatMinor } from '../../utils/money';
import { BookingFlow, type BookingFlowProps } from './BookingFlow';
import { OfferPolicySummary } from './OfferPolicySummary';

function textFor(text: LocalizedText | undefined, language: string): string {
  if (!text) return '';
  const key = language === 'en' || language === 'fr' ? language : 'pt-BR';
  return text[key] || text['pt-BR'];
}

interface BookingOfferPanelProps extends Omit<BookingFlowProps, 'offer'> {
  guideItemId: string;
}

/** Painel de reserva dentro do detalhe do item; sem oferta publicada não renderiza nada. */
export function BookingOfferPanel({ guideItemId, ...flowProps }: BookingOfferPanelProps) {
  const { t, i18n } = useTranslation();
  const { data, loading } = usePublishedOffers(guideItemId);
  if (loading || data.length === 0) return null;

  return (
    <div className="space-y-3">
      {data.map((offer) => {
        const fromMinor = Math.min(
          ...offer.pricing.priceOptions.map((option) => option.unitAmountMinor)
        );
        return (
          <GlassCard key={offer.id} className="p-5 space-y-4 border border-white/10">
            <div className="flex items-start gap-3">
              <CalendarCheck size={20} className="text-teal-300 shrink-0" aria-hidden="true" />
              <div className="min-w-0">
                <h3 className="text-base font-bold text-white break-words">
                  {textFor(offer.title, i18n.language)}
                </h3>
                <p className="text-xs text-white/70">
                  {t('bookings.partner.fromPrice', {
                    amount: formatMinor(fromMinor, i18n.language),
                  })}
                </p>
              </div>
            </div>
            {offer.description && (
              <p className="text-sm text-white/80 whitespace-pre-line">
                {textFor(offer.description, i18n.language)}
              </p>
            )}
            <OfferPolicySummary offer={offer} />
            <BookingFlow offer={offer} {...flowProps} />
          </GlassCard>
        );
      })}
    </div>
  );
}
