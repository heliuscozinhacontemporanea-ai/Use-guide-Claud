import { ChevronLeft } from 'lucide-react';
import { useId, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BUYER_TERMS_VERSION } from '../../../../shared/constants/legalTerms';
import { BUTTON_PRIMARY, BUTTON_SECONDARY } from '../../../../ui/styles/controls';
import { usePublicFleetDay } from '../../hooks/usePublicFleetDay';
import type { PublicOffer } from '../../types/bookings';
import { formatDayLabel, formatSlotRange, placeDateKey } from '../../utils/dates';
import { nextPlaceDates } from '../../utils/fleetAvailability';
import {
  type FleetMode,
  type FleetSelection,
  fleetQuote,
  fleetRequest,
} from '../../utils/fleetSelection';
import { formatMinor } from '../../utils/money';
import { BookingCheckout } from './BookingCheckout';
import {
  BookingContactFields,
  bookingContactPayload,
  EMPTY_BOOKING_CONTACT,
} from './BookingContactFields';
import type { BookingFlowProps } from './BookingFlow';
import { FleetOfferSummary } from './FleetOfferSummary';
import { FleetPicker } from './FleetPicker';
import { FleetStepper } from './FleetStepper';

/** Duas semanas de dias para escolher; o parceiro abre os dias em Dias e reservas. */
const DAYS_AHEAD = 14;

type Step = 'select' | 'details' | 'checkout';

/**
 * Reserva de aluguel ou translado privativo (F3b): dia, período ou horário, veículos, CNH, contato e
 * pagamento. O preço mostrado é só exibição; o servidor recalcula (AGENTS.md §8.5).
 */
export function FleetBookingFlow({
  offer,
  isAuthenticated,
  onRequireLogin,
  onViewMyBookings,
  renderPaymentElement,
}: Omit<BookingFlowProps, 'offer'> & { offer: PublicOffer & { kind: 'rental' | 'transfer' } }) {
  const { t, i18n } = useTranslation();
  const licenseId = useId();
  const timeZone = offer.timeZone;
  const dates = useMemo(
    () => nextPlaceDates(placeDateKey(new Date().toISOString(), timeZone), DAYS_AHEAD),
    [timeZone]
  );
  const firstMode: FleetMode = (offer.fleet?.fixed.length ?? 0) > 0 ? 'fixed' : 'custom';
  const [date, setDate] = useState(dates[0] ?? '');
  const [selection, setSelection] = useState<FleetSelection>({ mode: firstMode });
  const [step, setStep] = useState<Step>('select');
  const [vehicles, setVehicles] = useState(1);
  const [license, setLicense] = useState(false);
  const [contact, setContact] = useState(EMPTY_BOOKING_CONTACT);
  const day = usePublicFleetDay(offer.id, date);

  const quote = useMemo(
    () => (day.data ? fleetQuote(offer, day.data, selection) : null),
    [offer, day.data, selection]
  );
  const maxVehicles = Math.min(offer.maxParticipantsPerBooking, quote?.free ?? 0);
  const needsPickup = offer.pickupMode === 'buyer_address';
  // Telefone para o dia do serviço (D27): aluguel e translado sempre pedem.
  const contactState = useMemo(
    () => bookingContactPayload(contact, { pickup: needsPickup, phone: true }),
    [contact, needsPickup]
  );
  const needsLicense = offer.requiresDriverLicense === true;

  const request = useMemo(() => {
    const fleet = fleetRequest(date, selection, day.data);
    return {
      offerId: offer.id,
      ...(fleet ? { fleet } : {}),
      lines: quote ? [{ priceOptionId: quote.priceOptionId, quantity: vehicles }] : [],
      participants: [],
      ...(needsLicense ? { driverLicenseDeclared: true } : {}),
      ...contactState.payload,
      acceptedTermsVersion: BUYER_TERMS_VERSION,
    };
  }, [offer.id, date, selection, day.data, quote, vehicles, needsLicense, contactState.payload]);

  if (step === 'checkout') {
    return (
      <BookingCheckout
        request={request}
        renderPaymentElement={renderPaymentElement}
        onViewMyBookings={onViewMyBookings}
        onRestart={() => {
          setStep('select');
          setSelection({ mode: firstMode });
          void day.reload();
        }}
      />
    );
  }

  if (step === 'select') {
    return (
      <div className="space-y-3">
        <FleetOfferSummary offer={offer} />
        <FleetPicker
          offer={offer}
          dates={dates}
          date={date}
          onDate={(next) => {
            setDate(next);
            setSelection({ mode: selection.mode });
          }}
          day={{ ...day, reload: () => void day.reload() }}
          selection={selection}
          quote={quote}
          onSelection={setSelection}
        />
        <button
          type="button"
          disabled={!quote || quote.free < 1}
          onClick={() => {
            if (!isAuthenticated) {
              onRequireLogin();
              return;
            }
            setVehicles((current) => Math.min(Math.max(1, current), Math.max(1, maxVehicles)));
            setStep('details');
          }}
          className={`${BUTTON_PRIMARY} w-full min-h-[52px] text-[16px]`}
        >
          {t('bookings.buyer.reserve')}
        </button>
      </div>
    );
  }

  const capacity =
    offer.groupMaxPeople === undefined
      ? null
      : t(offer.kind === 'rental' ? 'fleet.booking.perVehicle' : 'fleet.booking.passengers', {
          count: offer.groupMaxPeople,
        });
  const free = quote ? t('fleet.booking.free', { count: quote.free }) : null;
  const ready =
    quote !== null &&
    vehicles >= 1 &&
    vehicles <= maxVehicles &&
    (!needsLicense || license) &&
    contactState.ready;

  return (
    <div className="space-y-4">
      <button type="button" onClick={() => setStep('select')} className={BUTTON_SECONDARY}>
        <ChevronLeft size={13} className="inline mr-1" aria-hidden="true" />
        {t('bookings.buyer.back')}
      </button>
      {quote && (
        <p className="text-[14px] font-semibold text-ink">
          {[
            formatDayLabel(quote.startsAt, i18n.language, timeZone),
            formatSlotRange(quote.startsAt, quote.endsAt, i18n.language, timeZone),
          ].join(' · ')}
        </p>
      )}
      <FleetStepper
        label={t('fleet.booking.vehicles')}
        hint={[capacity, free].filter(Boolean).join(' · ')}
        value={vehicles}
        min={1}
        max={Math.max(1, maxVehicles)}
        onChange={setVehicles}
        lessLabel={t('fleet.booking.lessVehicles')}
        moreLabel={t('fleet.booking.moreVehicles')}
      />
      {needsLicense && (
        <label
          htmlFor={licenseId}
          className="flex items-start gap-3 min-h-11 text-[14px] text-ink cursor-pointer"
        >
          <input
            id={licenseId}
            type="checkbox"
            checked={license}
            onChange={(event) => setLicense(event.target.checked)}
            className="mt-0.5 size-5 shrink-0 accent-teal-400"
          />
          <span>{t('fleet.booking.license')}</span>
        </label>
      )}
      <BookingContactFields
        value={contact}
        onChange={setContact}
        needsPickup={needsPickup}
        pickupLabel={t(
          offer.kind === 'transfer'
            ? 'fleet.booking.pickupAddressLabel'
            : 'fleet.booking.deliveryAddressLabel'
        )}
        needsPhone
        isAuthenticated={isAuthenticated}
      />
      {quote && (
        <p className="flex items-baseline justify-between gap-3 px-1">
          <span className="text-[14px] text-ink/70">{t('fleet.booking.totalLabel')}</span>
          <span className="text-[16px] font-semibold text-ink">
            {formatMinor(quote.unitAmountMinor * vehicles, i18n.language)}
          </span>
        </p>
      )}
      <button
        type="button"
        disabled={!ready}
        onClick={() => (isAuthenticated ? setStep('checkout') : onRequireLogin())}
        className={`${BUTTON_PRIMARY} w-full`}
      >
        {isAuthenticated ? t('bookings.buyer.continue') : t('bookings.buyer.login')}
      </button>
    </div>
  );
}
