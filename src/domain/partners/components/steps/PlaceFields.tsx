import { Building2, Hash, MapPin } from 'lucide-react';
import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import { REGIONS } from '../../../../shared/constants/regions';
import { cn } from '../../../../shared/utils/cn';
import { BR_STATES } from '../../../../shared/utils/timeZones';

const LABEL = 'text-[10px] font-black uppercase tracking-widest text-ink/70 ml-1';
const FIELD =
  'w-full bg-surface border rounded-2xl pl-12 pr-5 py-4 text-ink text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400/50 transition-all placeholder:text-ink/50';
const ICON = 'absolute left-4 top-1/2 -translate-y-1/2 text-ink/60 pointer-events-none';
const ERROR = 'text-[11px] font-semibold text-danger ml-1';

/**
 * Região ou bairro em texto livre, para o país inteiro; as regiões já usadas pela busca aparecem como
 * sugestão.
 */
export function RegionInput({
  value,
  onChange,
  label,
  hasError,
}: {
  value: string;
  onChange: (value: string) => void;
  label: string;
  hasError?: boolean;
}) {
  const { t } = useTranslation();
  const listId = useId();
  return (
    <div className="relative">
      <Hash size={16} className={ICON} aria-hidden="true" />
      <input
        type="text"
        aria-label={label}
        list={listId}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={t('partners.place.regionPlaceholder')}
        maxLength={100}
        className={cn(FIELD, hasError ? 'border-danger' : 'border-line')}
      />
      <datalist id={listId}>
        {REGIONS.map((region) => (
          <option key={region} value={region} />
        ))}
      </datalist>
    </div>
  );
}

/**
 * Endereço, região, estado e cidade do estabelecimento. Estado e cidade dão o fuso dos horários de
 * eventos e passeios (D28); o servidor calcula, o parceiro não escolhe fuso.
 */
export function PlaceFields({
  formData,
  addressLabel,
  updateFieldValue,
  getFieldError,
}: {
  formData: { address?: string; region?: string; state?: string; city?: string };
  addressLabel: string;
  updateFieldValue: (field: string, value: string) => void;
  getFieldError: (field: string) => string | undefined;
}) {
  const { t } = useTranslation();
  const ids = { state: useId(), city: useId() };
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor={ids.state} className={LABEL}>
            {t('partners.place.state')} <span className="text-danger">*</span>
          </label>
          <div className="relative">
            <MapPin size={16} className={ICON} aria-hidden="true" />
            <select
              id={ids.state}
              value={formData.state || ''}
              onChange={(event) => updateFieldValue('state', event.target.value)}
              className={cn(FIELD, getFieldError('state') ? 'border-danger' : 'border-line')}
            >
              <option value="">{t('partners.place.statePlaceholder')}</option>
              {BR_STATES.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
          </div>
          {getFieldError('state') && <p className={ERROR}>{getFieldError('state')}</p>}
        </div>
        <div className="space-y-2">
          <label htmlFor={ids.city} className={LABEL}>
            {t('partners.place.city')} <span className="text-danger">*</span>
          </label>
          <div className="relative">
            <Building2 size={16} className={ICON} aria-hidden="true" />
            <input
              id={ids.city}
              type="text"
              value={formData.city || ''}
              onChange={(event) => updateFieldValue('city', event.target.value)}
              placeholder={t('partners.place.cityPlaceholder')}
              maxLength={100}
              autoComplete="address-level2"
              className={cn(FIELD, getFieldError('city') ? 'border-danger' : 'border-line')}
            />
          </div>
          {getFieldError('city') && <p className={ERROR}>{getFieldError('city')}</p>}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <span className={LABEL}>{addressLabel}</span>
          <div className="relative">
            <Building2 size={16} className={ICON} aria-hidden="true" />
            <input
              type="text"
              aria-label={addressLabel}
              value={formData.address || ''}
              onChange={(event) => updateFieldValue('address', event.target.value)}
              placeholder="CEP 00000-000, Rua..."
              maxLength={300}
              autoComplete="street-address"
              className={cn(FIELD, 'border-line')}
            />
          </div>
        </div>
        <div className="space-y-2">
          <span className={LABEL}>
            {t('partners.place.region')} <span className="text-danger">*</span>
          </span>
          <RegionInput
            value={formData.region || ''}
            onChange={(value) => updateFieldValue('region', value)}
            label={t('partners.place.region')}
            hasError={!!getFieldError('region')}
          />
          {getFieldError('region') && <p className={ERROR}>{getFieldError('region')}</p>}
        </div>
      </div>
    </div>
  );
}
