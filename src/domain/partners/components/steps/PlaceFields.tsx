import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import { REGIONS } from '../../../../shared/constants/regions';
import { cn } from '../../../../shared/utils/cn';
import { BR_STATES } from '../../../../shared/utils/timeZones';
import { RequiredMark, SignupError } from '../sections/SignupFieldParts';
import { SIGNUP_INPUT, SIGNUP_LABEL } from '../sections/signupStyles';

/**
 * Região ou bairro em texto livre, para o país inteiro; as regiões já usadas pela busca aparecem como
 * sugestão.
 */
export function RegionInput({
  value,
  onChange,
  label,
  hasError,
  id,
}: {
  value: string;
  onChange: (value: string) => void;
  label: string;
  hasError?: boolean;
  id?: string;
}) {
  const { t } = useTranslation();
  const listId = useId();
  return (
    <>
      <input
        id={id}
        type="text"
        aria-label={id ? undefined : label}
        list={listId}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={t('partners.place.regionPlaceholder')}
        maxLength={100}
        aria-invalid={hasError}
        className={cn(SIGNUP_INPUT, hasError && 'border-danger-line')}
      />
      <datalist id={listId}>
        {REGIONS.map((region) => (
          <option key={region} value={region} />
        ))}
      </datalist>
    </>
  );
}

/**
 * Estado, cidade, endereço e região do estabelecimento. Estado e cidade dão o fuso dos horários de
 * eventos e passeios (D28); o servidor calcula, o parceiro não escolhe fuso.
 */
export function PlaceFields({
  formData,
  updateFieldValue,
  getFieldError,
  regionRequired = true,
}: {
  regionRequired?: boolean;
  formData: { address?: string; region?: string; state?: string; city?: string };
  updateFieldValue: (field: string, value: string) => void;
  getFieldError: (field: string) => string | undefined;
}) {
  const { t } = useTranslation();
  const ids = { state: useId(), city: useId(), address: useId(), region: useId() };
  const error = (field: string) => <SignupError message={getFieldError(field)} />;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-[7.5rem_1fr] gap-3">
        <div>
          <label htmlFor={ids.state} className={SIGNUP_LABEL}>
            {t('partners.place.state')}
            <RequiredMark />
          </label>
          <select
            id={ids.state}
            value={formData.state || ''}
            onChange={(event) => updateFieldValue('state', event.target.value)}
            aria-required
            aria-invalid={Boolean(getFieldError('state'))}
            className={cn(SIGNUP_INPUT, 'px-3', getFieldError('state') && 'border-danger-line')}
          >
            <option value="">{t('partners.place.statePlaceholder')}</option>
            {BR_STATES.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor={ids.city} className={SIGNUP_LABEL}>
            {t('partners.place.city')}
            <RequiredMark />
          </label>
          <input
            id={ids.city}
            type="text"
            value={formData.city || ''}
            onChange={(event) => updateFieldValue('city', event.target.value)}
            placeholder={t('partners.place.cityPlaceholder')}
            maxLength={100}
            autoComplete="address-level2"
            aria-required
            aria-invalid={Boolean(getFieldError('city'))}
            className={cn(SIGNUP_INPUT, getFieldError('city') && 'border-danger-line')}
          />
        </div>
      </div>
      {error('state')}
      {error('city')}
      <div>
        <label htmlFor={ids.region} className={SIGNUP_LABEL}>
          {t('partners.place.region')}
          <RequiredMark show={regionRequired} />
        </label>
        <RegionInput
          id={ids.region}
          value={formData.region || ''}
          onChange={(value) => updateFieldValue('region', value)}
          label={t('partners.place.region')}
          hasError={Boolean(getFieldError('region'))}
        />
        {error('region')}
      </div>
      <div>
        <label htmlFor={ids.address} className={SIGNUP_LABEL}>
          {t('partners.place.address')}
        </label>
        <input
          id={ids.address}
          type="text"
          value={formData.address || ''}
          onChange={(event) => updateFieldValue('address', event.target.value)}
          placeholder={t('partners.place.addressPlaceholder')}
          maxLength={300}
          autoComplete="street-address"
          className={SIGNUP_INPUT}
        />
      </div>
    </div>
  );
}
