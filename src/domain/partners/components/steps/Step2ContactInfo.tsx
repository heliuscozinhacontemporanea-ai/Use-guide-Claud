import type React from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { cn } from '../../../../shared/utils/cn';
import {
  PhoneInputField,
  type PhoneInputFieldRef,
} from '../../../../ui/components/PhoneInputField';
import type { FormState } from '../../types/partsForm';
import { RequiredMark, SignupError } from '../sections/SignupFieldParts';
import { SIGNUP_INPUT, SIGNUP_LABEL } from '../sections/signupStyles';
import { PlaceFields } from './PlaceFields';

interface Step2ContactInfoProps {
  formData: FormState;
  setFormData: React.Dispatch<React.SetStateAction<FormState>>;
  errors: { [key: string]: string };
  setErrors: React.Dispatch<React.SetStateAction<{ [key: string]: string }>>;
  phoneRef: React.RefObject<PhoneInputFieldRef | null>;
  categories?: Array<{ id: string; label: string }>;
}

type TextField = 'instagram' | 'website' | 'bookingLinks' | 'googleMaps';

/**
 * Contato e local (V2): telefone, redes, link de reserva (hospedagem), Google Maps e o lugar.
 * O produtor de eventos não tem site nem mapa (o local fica em cada evento).
 */
export function Step2ContactInfo({
  formData: propFormData,
  setFormData,
  errors: propErrors,
  setErrors,
  phoneRef,
}: Step2ContactInfoProps) {
  const { t } = useTranslation();
  const formContext = useFormContext();
  const formData = (formContext ? formContext.watch() : propFormData) as FormState;
  const rhfErrors = formContext ? formContext.formState.errors : {};
  const getFieldError = (field: string) =>
    propErrors[field] || rhfErrors[field]?.message?.toString();

  const updateFieldValue = (field: string, value: string) => {
    if (formContext) formContext.setValue(field, value, { shouldValidate: true });
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (propErrors[field]) {
      setErrors((prev) => {
        const { [field]: _removed, ...rest } = prev;
        return rest;
      });
    }
  };

  const producer = formData.category === 'producer';
  const hotel = formData.category === 'hotel';

  const text = (
    field: TextField,
    label: string,
    placeholder: string,
    type = 'text',
    required = false
  ) => (
    <div>
      <label htmlFor={`signup-${field}`} className={SIGNUP_LABEL}>
        {label}
        <RequiredMark show={Boolean(required)} />
      </label>
      <input
        id={`signup-${field}`}
        aria-required={required || undefined}
        type={type}
        value={(formData[field] as string) || ''}
        onChange={(event) => updateFieldValue(field, event.target.value)}
        placeholder={placeholder}
        maxLength={300}
        aria-invalid={Boolean(getFieldError(field))}
        className={cn(SIGNUP_INPUT, getFieldError(field) && 'border-danger-line')}
      />
      <SignupError message={getFieldError(field)} />
    </div>
  );

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="partner-phone-main" className={SIGNUP_LABEL}>
          {t('partnerSignup.step2.phone')}
          <RequiredMark />
        </label>
        <PhoneInputField
          ref={phoneRef}
          id="partner-phone-main"
          phone={formData.phone}
          ddi={formData.phoneDdi}
          onPhoneChange={(value) => updateFieldValue('phone', value)}
          onDdiChange={(value) => updateFieldValue('phoneDdi', value)}
          required
        />
        <SignupError message={getFieldError('phone')} />
      </div>
      <div className={cn('grid gap-3', producer ? 'grid-cols-1' : 'grid-cols-2')}>
        {text(
          'instagram',
          t('partnerSignup.step2.instagram'),
          t('partnerSignup.step2.instagramPlaceholder')
        )}
        {!producer && text('website', t('partnerSignup.step2.website'), 'https://', 'url')}
      </div>
      {hotel &&
        text(
          'bookingLinks',
          t('partnerSignup.step2.booking'),
          t('partnerSignup.step2.bookingPlaceholder'),
          'url',
          true
        )}
      {!producer &&
        text(
          'googleMaps',
          t('partnerSignup.step2.maps'),
          t('partnerSignup.step2.mapsPlaceholder'),
          'url',
          true
        )}
      <PlaceFields
        formData={formData}
        updateFieldValue={updateFieldValue}
        getFieldError={getFieldError}
        regionRequired={!producer}
      />
    </div>
  );
}
