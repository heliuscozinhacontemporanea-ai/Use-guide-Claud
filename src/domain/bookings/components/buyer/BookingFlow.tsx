import { ChevronLeft } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BUYER_TERMS_VERSION } from '../../../../shared/constants/legalTerms';
import { BUTTON_PRIMARY, BUTTON_SECONDARY } from '../../../../ui/styles/controls';
import type { PublicOffer, PublicSlot } from '../../types/bookings';
import { BookingCheckout } from './BookingCheckout';
import {
  BookingContactFields,
  bookingContactPayload,
  EMPTY_BOOKING_CONTACT,
} from './BookingContactFields';
import { OfferPriceOptions } from './OfferPriceOptions';
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

type Step = 'select' | 'details' | 'participants' | 'checkout';

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
  const [contact, setContact] = useState(EMPTY_BOOKING_CONTACT);
  // Telefone para o dia do serviço (D27); a entrada de atração usa QR e não precisa.
  const needsPhone = offer.kind !== 'private_entry';
  const needsPickup = offer.pickupMode === 'buyer_address';
  const contactState = useMemo(
    () => bookingContactPayload(contact, { pickup: needsPickup, phone: needsPhone }),
    [contact, needsPickup, needsPhone]
  );
  const group = offer.sellingUnit === 'group';
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
      ...contactState.payload,
      acceptedTermsVersion: BUYER_TERMS_VERSION,
    }),
    [offer.id, slot?.id, quantities, names, contactState.payload]
  );

  const proceed = () => {
    if (!isAuthenticated) {
      onRequireLogin();
      return;
    }
    // Grupo não tem nome por pessoa: o cliente decide quem leva (D20).
    setStep(offer.requiresParticipantNames && !group ? 'participants' : 'checkout');
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
        <button type="button" onClick={() => setStep('details')} className={BUTTON_SECONDARY}>
          <ChevronLeft size={13} className="inline mr-1" aria-hidden="true" />
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

  if (step === 'select') {
    return (
      <div className="space-y-3">
        <OfferPriceOptions offer={offer} />
        <SlotPicker
          offerId={offer.id}
          place={{ timeZone: offer.timeZone, city: offer.city }}
          selectedId={slot?.id ?? null}
          onSelect={(selected) => {
            setSlot(selected);
            setQuantities({});
          }}
        />
        <button
          type="button"
          disabled={!slot}
          onClick={() => (isAuthenticated ? setStep('details') : onRequireLogin())}
          className={`${BUTTON_PRIMARY} w-full min-h-[52px] text-[16px]`}
        >
          {t('bookings.buyer.reserve')}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <button type="button" onClick={() => setStep('select')} className={BUTTON_SECONDARY}>
        <ChevronLeft size={13} className="inline mr-1" aria-hidden="true" />
        {t('bookings.buyer.back')}
      </button>
      {slot && (
        <QuantitySelector
          options={offer.pricing.priceOptions}
          maxParticipants={maxParticipants}
          value={quantities}
          onChange={setQuantities}
          groupMaxPeople={group ? offer.groupMaxPeople : undefined}
        />
      )}
      {slot && participants > 0 && (
        <BookingContactFields
          value={contact}
          onChange={setContact}
          needsPickup={needsPickup}
          needsPhone={needsPhone}
          isAuthenticated={isAuthenticated}
        />
      )}
      {slot && (
        <button
          type="button"
          disabled={participants === 0 || !contactState.ready}
          onClick={proceed}
          className={`${BUTTON_PRIMARY} w-full`}
        >
          {isAuthenticated ? t('bookings.buyer.continue') : t('bookings.buyer.login')}
        </button>
      )}
    </div>
  );
}
