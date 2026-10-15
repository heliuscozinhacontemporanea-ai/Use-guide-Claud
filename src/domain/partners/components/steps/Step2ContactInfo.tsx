import React, { useState, useRef, useEffect } from 'react';
import {
  Phone,
  Camera,
  Globe,
  MapPin,
  Building2,
  Hash,
  ExternalLink,
  ChevronDown,
  Check,
} from 'lucide-react';
import { useFormContext } from 'react-hook-form';
import { cn } from '../../../../shared/utils/cn';
import { PhoneInputField } from '../../../../ui/components/PhoneInputField';
import { REGIONS } from '../../../../shared/constants/regions';
import { Z_INDEX } from '../../../../shared/constants/zIndex';

interface Category {
  id: string;
  label: string;
}

interface Step2ContactInfoProps {
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  errors: { [key: string]: string };
  setErrors: React.Dispatch<React.SetStateAction<{ [key: string]: string }>>;
  phoneRef: React.RefObject<any>;
  categories: Category[];
}

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
        className={cn(
          'w-full bg-white/5 border rounded-2xl pl-12 pr-5 py-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-left flex items-center justify-between hover:bg-white/10',
          hasError ? 'border-red-500/50 ring-2 ring-red-500/10' : 'border-white/10'
        )}
      >
        <span className={value ? 'text-white' : 'text-white/50'}>{value || placeholder}</span>
        <ChevronDown
          size={16}
          className={cn(
            'text-white/45 transition-transform duration-200',
            isOpen ? 'transform rotate-180' : ''
          )}
        />
      </button>

      {isOpen && (
        <div
          style={{ zIndex: Z_INDEX.dropdown }}
          className="absolute top-full left-0 right-0 mt-2 bg-zinc-900/80 backdrop-blur-xl border border-white/20 rounded-2xl overflow-hidden shadow-2xl py-1 max-h-60 overflow-y-auto no-scrollbar"
        >
          {REGIONS.map((region) => (
            <button
              key={region}
              type="button"
              onClick={() => {
                onChange(region);
                setIsOpen(false);
              }}
              className="w-full px-5 py-3 text-left text-white text-sm hover:bg-white/10 flex items-center justify-between transition-colors"
            >
              <span className={value === region ? 'text-indigo-400 font-bold' : ''}>{region}</span>
              {value === region && <Check size={14} className="text-indigo-400" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function Step2ContactInfo({
  formData: propFormData,
  setFormData,
  errors: propErrors,
  setErrors,
  phoneRef,
  categories,
}: Step2ContactInfoProps) {
  const formContext = useFormContext();

  const formData = formContext ? formContext.watch() : propFormData;
  const rhfErrors = formContext ? formContext.formState.errors : {};

  const getFieldError = (field: string) => {
    return propErrors[field] || rhfErrors[field]?.message?.toString();
  };

  const updateFieldValue = (field: string, value: any) => {
    if (formContext) {
      formContext.setValue(field, value, { shouldValidate: true });
    }
    setFormData((prev: any) => ({ ...prev, [field]: value }));
    clearError(field);
  };

  const handlePhoneChange = (newPhone: string) => {
    updateFieldValue('phone', newPhone);
  };

  const handlePhoneDdiChange = (newDdi: string) => {
    updateFieldValue('phoneDdi', newDdi);
  };

  const clearError = (field: string) => {
    if (propErrors[field]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[field];
        return copy;
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <span className="p-2 rounded-xl bg-white/5 border border-white/10 text-indigo-400">
          <Phone size={18} />
        </span>
        <h3 className="text-sm font-black text-white uppercase tracking-widest">
          Contato e Localização
        </h3>
      </div>

      {formData.category === 'hotel' ? (
        <div className="space-y-4">
          {/* Telefone / WhatsApp */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-white/50 ml-1">
              Telefone / WhatsApp <span className="text-red-500">*</span>
            </label>
            <PhoneInputField
              ref={phoneRef}
              id="partner-phone-hotel"
              phone={formData.phone}
              ddi={formData.phoneDdi}
              onPhoneChange={handlePhoneChange}
              onDdiChange={handlePhoneDdiChange}
              required
            />
            {getFieldError('phone') && (
              <p className="text-xs text-red-400 font-medium ml-1">{getFieldError('phone')}</p>
            )}
          </div>

          {/* Instagram e Site */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/50 ml-1">
                Instagram
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50">
                  <Camera size={16} />
                </div>
                <input
                  type="text"
                  value={formData.instagram || ''}
                  onChange={(e) => updateFieldValue('instagram', e.target.value)}
                  placeholder="@pousada"
                  maxLength={300}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-5 py-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-white/50"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/50 ml-1">
                Site Próprio
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50">
                  <Globe size={16} />
                </div>
                <input
                  type="url"
                  value={formData.website || ''}
                  onChange={(e) => updateFieldValue('website', e.target.value)}
                  placeholder="https://..."
                  maxLength={300}
                  className={cn(
                    'w-full bg-white/5 border rounded-2xl pl-12 pr-5 py-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-white/50',
                    getFieldError('website')
                      ? 'border-red-500/50 ring-2 ring-red-500/10'
                      : 'border-white/10'
                  )}
                />
                {getFieldError('website') && (
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-red-400 uppercase tracking-widest">
                    {getFieldError('website')}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Link de Reserva */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-white/50 ml-1">
              Site de reserva (Booking, Hotéis.com, etc) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50">
                <ExternalLink size={16} />
              </div>
              <input
                type="url"
                value={formData.bookingLinks || ''}
                onChange={(e) => updateFieldValue('bookingLinks', e.target.value)}
                placeholder="Link do seu anúncio em plataformas de reserva"
                maxLength={300}
                className={cn(
                  'w-full bg-white/5 border rounded-2xl pl-12 pr-5 py-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-white/50',
                  getFieldError('bookingLinks')
                    ? 'border-red-500/50 ring-2 ring-red-500/10'
                    : 'border-white/10'
                )}
              />
              {getFieldError('bookingLinks') && (
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-red-400 uppercase tracking-widest">
                  {getFieldError('bookingLinks')}
                </span>
              )}
            </div>
          </div>

          {/* Google Maps e Endereço */}
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/50 ml-1">
                Link Google Maps <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50">
                  <MapPin size={16} strokeWidth={2.5} />
                </div>
                <input
                  type="url"
                  value={formData.googleMaps || ''}
                  onChange={(e) => updateFieldValue('googleMaps', e.target.value)}
                  placeholder="Link da localização no Google Maps"
                  maxLength={300}
                  className={cn(
                    'w-full bg-white/5 border rounded-2xl pl-12 pr-5 py-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-white/50',
                    getFieldError('googleMaps')
                      ? 'border-red-500/50 ring-2 ring-red-500/10'
                      : 'border-white/10'
                  )}
                />
                {getFieldError('googleMaps') && (
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-red-400 uppercase tracking-widest">
                    {getFieldError('googleMaps')}
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/50 ml-1">
                  Endereço (CEP, Rua, Nº)
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50">
                    <Building2 size={16} />
                  </div>
                  <input
                    type="text"
                    value={formData.address || ''}
                    onChange={(e) => updateFieldValue('address', e.target.value)}
                    placeholder="CEP 00000-000, Rua..."
                    maxLength={300}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-5 py-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-white/50"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/50 ml-1">
                  Região / Bairro <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 z-10 pointer-events-none">
                    <Hash size={16} />
                  </div>
                  <RegionDropdown
                    value={formData.region || ''}
                    onChange={(val) => updateFieldValue('region', val)}
                    placeholder="Selecione uma região..."
                    hasError={!!getFieldError('region')}
                  />
                  {getFieldError('region') && (
                    <span className="absolute right-10 top-1/2 -translate-y-1/2 text-[10px] font-bold text-red-400 uppercase tracking-widest">
                      {getFieldError('region')}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : ['restaurant', 'sight', 'tour', 'transfer', 'rental', 'producer'].includes(
          formData.category
        ) ? (
        <div className="space-y-4">
          {/* Telefone / WhatsApp */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-white/50 ml-1">
              Telefone / WhatsApp <span className="text-red-500">*</span>
            </label>
            <PhoneInputField
              ref={phoneRef}
              id="partner-phone-main"
              phone={formData.phone}
              ddi={formData.phoneDdi}
              onPhoneChange={handlePhoneChange}
              onDdiChange={handlePhoneDdiChange}
              required
            />
            {getFieldError('phone') && (
              <p className="text-xs text-red-400 font-medium ml-1">{getFieldError('phone')}</p>
            )}
          </div>

          {/* Instagram e Site */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/50 ml-1">
                Instagram
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50">
                  <Camera size={16} />
                </div>
                <input
                  type="text"
                  value={formData.instagram || ''}
                  onChange={(e) => updateFieldValue('instagram', e.target.value)}
                  placeholder={formData.category === 'producer' ? '@perfil_evento' : '@perfil'}
                  maxLength={300}
                  className={cn(
                    'w-full bg-white/5 border rounded-2xl pl-12 pr-5 py-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-white/50',
                    getFieldError('instagram')
                      ? 'border-red-500/50 ring-2 ring-red-500/10'
                      : 'border-white/10'
                  )}
                />
                {getFieldError('instagram') && (
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-red-400 uppercase tracking-widest">
                    {getFieldError('instagram')}
                  </span>
                )}
              </div>
            </div>
            <div className={cn('space-y-2', formData.category === 'producer' && 'hidden')}>
              <label className="text-[10px] font-black uppercase tracking-widest text-white/50 ml-1">
                {formData.category === 'producer' ? 'Site / Link Vendas' : 'Site Próprio'}
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50">
                  <Globe size={16} />
                </div>
                <input
                  type="url"
                  value={formData.website || ''}
                  onChange={(e) => updateFieldValue('website', e.target.value)}
                  placeholder="https://..."
                  maxLength={300}
                  className={cn(
                    'w-full bg-white/5 border rounded-2xl pl-12 pr-5 py-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-white/50',
                    getFieldError('website')
                      ? 'border-red-500/50 ring-2 ring-red-500/10'
                      : 'border-white/10'
                  )}
                />
                {getFieldError('website') && (
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-red-400 uppercase tracking-widest">
                    {getFieldError('website')}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Google Maps e Endereço */}
          <div className="space-y-4 pt-2">
            <div className={cn('space-y-2', formData.category === 'producer' && 'hidden')}>
              <label className="text-[10px] font-black uppercase tracking-widest text-white/50 ml-1">
                Link Google Maps{' '}
                {(formData.category === 'restaurant' || formData.category === 'sight') && (
                  <span className="text-red-500">*</span>
                )}
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50">
                  <MapPin size={16} strokeWidth={2.5} />
                </div>
                <input
                  type="url"
                  value={formData.googleMaps || ''}
                  onChange={(e) => updateFieldValue('googleMaps', e.target.value)}
                  placeholder="Link da localização no Google Maps"
                  maxLength={300}
                  className={cn(
                    'w-full bg-white/5 border rounded-2xl pl-12 pr-5 py-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-white/50',
                    getFieldError('googleMaps')
                      ? 'border-red-500/50 ring-2 ring-red-500/10'
                      : 'border-white/10'
                  )}
                />
                {getFieldError('googleMaps') && (
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-red-400 uppercase tracking-widest">
                    {getFieldError('googleMaps')}
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/50 ml-1">
                  Endereço completo (CEP, rua/número)
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50">
                    <Building2 size={16} />
                  </div>
                  <input
                    type="text"
                    value={formData.address || ''}
                    onChange={(e) => updateFieldValue('address', e.target.value)}
                    placeholder="CEP 00000-000, Rua..."
                    maxLength={300}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-5 py-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-white/50"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/50 ml-1">
                  Região / Bairro <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 z-10 pointer-events-none">
                    <Hash size={16} />
                  </div>
                  <RegionDropdown
                    value={formData.region || ''}
                    onChange={(val) => updateFieldValue('region', val)}
                    placeholder="Selecione uma região..."
                    hasError={!!getFieldError('region')}
                  />
                  {getFieldError('region') && (
                    <span className="absolute right-10 top-1/2 -translate-y-1/2 text-[10px] font-bold text-red-400 uppercase tracking-widest">
                      {getFieldError('region')}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-white/50 text-xs italic p-4 rounded-xl bg-white/5 border border-white/5">
            Formulário específico para a categoria{' '}
            {categories.find((c) => c.id === formData.category)?.label || formData.category} em
            breve.
          </p>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-white/50 ml-1">
              Telefone / WhatsApp <span className="text-red-500">*</span>
            </label>
            <PhoneInputField
              ref={phoneRef}
              id="partner-phone-fallback"
              phone={formData.phone}
              ddi={formData.phoneDdi}
              onPhoneChange={handlePhoneChange}
              onDdiChange={handlePhoneDdiChange}
              required
            />
          </div>
        </div>
      )}
    </div>
  );
}
