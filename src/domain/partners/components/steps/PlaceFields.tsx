import { Building2, Check, ChevronDown, Hash, MapPin } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { REGIONS } from '../../../../shared/constants/regions';
import { Z_INDEX } from '../../../../shared/constants/zIndex';
import { cn } from '../../../../shared/utils/cn';
import { BR_STATES } from '../../../../shared/utils/timeZones';

const LABEL = 'text-[10px] font-black uppercase tracking-widest text-ink/70 ml-1';
const FIELD =
  'w-full bg-surface border rounded-2xl pl-12 pr-5 py-4 text-ink text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400/50 transition-all placeholder:text-ink/50';
const ICON = 'absolute left-4 top-1/2 -translate-y-1/2 text-ink/60 pointer-events-none';
const ERROR = 'text-[11px] font-semibold text-danger ml-1';

function RegionDropdown({
  value,
  onChange,
  placeholder,
  hasError,
}: {
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
  hasError?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        className={cn(
          FIELD,
          'text-left flex items-center justify-between',
          hasError ? 'border-danger' : 'border-line'
        )}
      >
        <span className={value ? 'text-ink' : 'text-ink/50'}>{value || placeholder}</span>
        <ChevronDown
          size={16}
          aria-hidden="true"
          className={cn('text-ink/60 transition-transform duration-200', isOpen && 'rotate-180')}
        />
      </button>
      {isOpen && (
        <div
          style={{ zIndex: Z_INDEX.dropdown }}
          className="absolute top-full left-0 right-0 mt-2 bg-surface border border-line rounded-2xl overflow-hidden shadow-2xl py-1 max-h-60 overflow-y-auto"
        >
          {REGIONS.map((region) => (
            <button
              key={region}
              type="button"
              onClick={() => {
                onChange(region);
                setIsOpen(false);
              }}
              className="w-full min-h-11 px-5 py-3 text-left text-ink text-sm hover:bg-accent-soft flex items-center justify-between"
            >
              <span className={value === region ? 'text-accent font-bold' : ''}>{region}</span>
              {value === region && <Check size={14} className="text-accent" aria-hidden="true" />}
            </button>
          ))}
        </div>
      )}
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
          <div className="relative">
            <Hash size={16} className={cn(ICON, 'z-10')} aria-hidden="true" />
            <RegionDropdown
              value={formData.region || ''}
              onChange={(value) => updateFieldValue('region', value)}
              placeholder={t('partners.place.regionPlaceholder')}
              hasError={!!getFieldError('region')}
            />
          </div>
          {getFieldError('region') && <p className={ERROR}>{getFieldError('region')}</p>}
        </div>
      </div>
    </div>
  );
}
