import { ArrowLeft } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BUYER_TERMS_VERSION } from '../../../../shared/constants/legalTerms';
import { TermsAcceptanceField } from '../../../../ui/legal/TermsAcceptanceField';
import type { PublicOffer, PublicSlot } from '../../types/bookings';
import { BUTTON_PRIMARY, BUTTON_SECONDARY } from '../shared/ListState';
import { BookingCheckout } from './BookingCheckout';
import { ParticipantsForm } from './ParticipantsForm';
import { QuantitySelector } from './QuantitySelector';
import { SlotPicker } from './SlotPicker';
import type { RenderPaymentElement } from './types';

export interface BookingFlowProps {
  offer: PublicOffer;
  isAuthenticated: boolean;
  onRequireLogin: () => void;
  onViewMyBookings: () => void;
  renderPaymentElement: RenderPaymentElement;
}

type Step = 'select' | 'participants' | 'checkout';

export function BookingFlow({
  offer,
  isAuthenticated,
  onRequireLogin,
  onViewMyBookings,
  renderPaymentElement,
}: BookingFlowProps) {
  const { t } = useTranslation();
  const [step, setStep] = useState<Step>('select');
  const [slot, setSlot] = useState<PublicSlot | null>(null);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [names, setNames] = useState<string[]>([]);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const participants = Object.values(quantities).reduce((sum, quantity) => sum + quantity, 0);
  const maxParticipants = Math.min(offer.maxParticipantsPerBooking, slot?.available ?? 0);

  const request = useMemo(
    () => ({
      offerId: offer.id,
      slotId: slot?.id ?? '',
      lines: Object.entries(quantities)
        .filter(([, quantity]) => quantity > 0)
        .map(([priceOptionId, quantity]) => ({ priceOptionId, quantity })),
      participants: names.map((name) => ({ name })),
      acceptedTermsVersion: BUYER_TERMS_VERSION,
    }),
    [offer.id, slot?.id, quantities, names]
  );

  const proceed = () => {
    if (!isAuthenticated) {
      onRequireLogin();
      return;
    }
    setStep(offer.requiresParticipantNames ? 'participants' : 'checkout');
  };

  const restart = () => {
    setStep('select');
    setSlot(null);
    setQuantities({});
    setNames([]);
  };

  if (step === 'checkout') {
    return (
      <BookingCheckout
        request={request}
        renderPaymentElement={renderPaymentElement}
        onViewMyBookings={onViewMyBookings}
        onRestart={restart}
      />
    );
  }

  if (step === 'participants') {
    return (
      <div className="space-y-3">
        <button type="button" onClick={() => setStep('select')} className={BUTTON_SECONDARY}>
          <ArrowLeft size={13} className="inline mr-1" aria-hidden="true" />
          {t('bookings.buyer.back')}
        </button>
        <ParticipantsForm
          count={participants}
          onSubmit={(submitted) => {
            setNames(submitted);
            setStep('checkout');
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <SlotPicker
        offerId={offer.id}
        selectedId={slot?.id ?? null}
        onSelect={(selected) => {
          setSlot(selected);
          setQuantities({});
        }}
      />
      {slot && (
        <QuantitySelector
          options={offer.pricing.priceOptions}
          maxParticipants={maxParticipants}
          value={quantities}
          onChange={setQuantities}
        />
      )}
      {slot && participants > 0 && !isAuthenticated && (
        <p className="text-xs text-white/70">{t('bookings.buyer.loginRequired')}</p>
      )}
      {slot && participants > 0 && (
        <TermsAcceptanceField
          audience="buyer"
          checked={termsAccepted}
          onChange={setTermsAccepted}
        />
      )}
      {slot && (
        <button
          type="button"
          disabled={participants === 0 || !termsAccepted}
          onClick={proceed}
          className={`${BUTTON_PRIMARY} w-full`}
        >
          {isAuthenticated ? t('bookings.buyer.continue') : t('bookings.buyer.login')}
        </button>
      )}
    </div>
  );
}
