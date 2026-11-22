import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import { E164PhoneField } from '../../../../ui/components/E164PhoneField';
import { TermsAcceptanceField } from '../../../../ui/legal/TermsAcceptanceField';
import { INPUT } from '../../../../ui/styles/controls';

export interface BookingContactState {
  pickupAddress: string;
  contactPhone: string | undefined;
  promoCode: string;
  termsAccepted: boolean;
}

export const EMPTY_BOOKING_CONTACT: BookingContactState = {
  pickupAddress: '',
  contactPhone: undefined,
  promoCode: '',
  termsAccepted: false,
};

/** Endereço de busca, telefone, cupom e termos da reserva (D20, D27, B1c, D15). */
export function BookingContactFields({
  value,
  onChange,
  needsPickup,
  needsPhone,
  isAuthenticated,
  pickupLabel,
}: {
  value: BookingContactState;
  onChange: (next: BookingContactState) => void;
  needsPickup: boolean;
  needsPhone: boolean;
  isAuthenticated: boolean;
  /** Rótulo do endereço quando não é o do passeio ("Onde você está hospedado?"). */
  pickupLabel?: string;
}) {
  const { t } = useTranslation();
  const pickupId = useId();
  const phoneId = useId();
  const promoId = useId();
  const set = (patch: Partial<BookingContactState>) => onChange({ ...value, ...patch });

  return (
    <>
      {needsPickup && (
        <div className="space-y-1.5">
          <label htmlFor={pickupId} className="text-[13px] font-semibold text-ink/80">
            {pickupLabel ?? t('serviceProof.checkout.pickupLabel')}
          </label>
          <input
            id={pickupId}
            value={value.pickupAddress}
            onChange={(event) => set({ pickupAddress: event.target.value })}
            maxLength={300}
            autoComplete="street-address"
            placeholder={t('serviceProof.checkout.pickupPlaceholder')}
            aria-describedby={`${pickupId}-hint`}
            className={INPUT}
          />
          <p id={`${pickupId}-hint`} className="text-[12px] text-ink/70">
            {t('serviceProof.checkout.pickupHint')}
          </p>
        </div>
      )}
      {needsPhone && (
        <div className="space-y-1.5">
          <label htmlFor={phoneId} className="text-[13px] font-semibold text-ink/80">
            {t('serviceProof.checkout.phoneLabel')}
          </label>
          <E164PhoneField
            id={phoneId}
            value={value.contactPhone}
            onChange={(contactPhone) => set({ contactPhone })}
          />
          <p className="text-[12px] text-ink/70">{t('serviceProof.checkout.phoneHint')}</p>
        </div>
      )}
      <div className="space-y-1.5">
        <label htmlFor={promoId} className="text-[13px] font-semibold text-ink/80">
          {t('bookings.buyer.promoCode')}
        </label>
        <input
          id={promoId}
          value={value.promoCode}
          onChange={(event) =>
            set({
              promoCode: event.target.value
                .toUpperCase()
                .replace(/[^A-Z0-9]/g, '')
                .slice(0, 20),
            })
          }
          autoCapitalize="characters"
          autoCorrect="off"
          spellCheck={false}
          className={INPUT}
        />
      </div>
      {!isAuthenticated && (
        <p className="text-xs text-ink/70">{t('bookings.buyer.loginRequired')}</p>
      )}
      <TermsAcceptanceField
        audience="buyer"
        checked={value.termsAccepted}
        onChange={(termsAccepted) => set({ termsAccepted })}
      />
    </>
  );
}

/** O que a reserva leva de contato, cupom e termos; e se já dá para seguir. */
export function bookingContactPayload(
  value: BookingContactState,
  needs: { pickup: boolean; phone: boolean }
) {
  const phoneReady = !needs.phone || /^\+[1-9]\d{7,14}$/.test(value.contactPhone ?? '');
  const pickupReady = !needs.pickup || value.pickupAddress.trim().length >= 3;
  return {
    ready: phoneReady && pickupReady && value.termsAccepted,
    payload: {
      ...(needs.pickup ? { pickupAddress: value.pickupAddress.trim() } : {}),
      ...(needs.phone && value.contactPhone ? { contactPhone: value.contactPhone } : {}),
      ...(value.promoCode.length >= 3 ? { promoCode: value.promoCode } : {}),
    },
  };
}
