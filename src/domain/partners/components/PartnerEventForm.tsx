import React, { useState, useRef, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, type Resolver } from 'react-hook-form';
import {
  Building2,
  Phone,
  Globe,
  MapPin,
  Camera,
  CheckCircle2,
  Trash2,
  Upload,
  RefreshCw,
  ChevronDown,
  Check,
  Hash,
  Ticket,
} from 'lucide-react';
import { cn } from '../../../shared/utils/cn';
import { REGIONS } from '../../../shared/constants/regions';
import {
  partnerEventFormSchema,
  type PartnerEventFormValues,
} from '../schemas/partnerEventFormSchema';
import type { PartnerBusiness, PartnerCategory } from '../types/partner';
import type { PartnerContentEditorState } from '../types/partnerContent';
import { businessDateTimeToIso, isoToBusinessDateTime } from '../../../shared/utils/businessDateTime';
import { EVENT_CATEGORIES } from '../../events';


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
            'text-white/50 transition-transform duration-200',
            isOpen ? 'transform rotate-180' : ''
          )}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-zinc-950/90 backdrop-blur-3xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl z-50 py-1 max-h-60 overflow-y-auto no-scrollbar">
          {REGIONS.map((region) => (
            <button
              key={region}
              type="button"
              onClick={() => {
                onChange(region);
                setIsOpen(false);
              }}
              className="w-full px-5 py-3.5 text-left text-white text-sm hover:bg-white/5 flex items-center justify-between transition-colors font-medium border-b border-white/[0.02]"
            >
              <span className={value === region ? 'text-indigo-400 font-bold' : 'text-white/85'}>
                {region}
              </span>
              {value === region && <Check size={14} className="text-indigo-400" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

interface PartnerEventFormProps {
  item: PartnerContentEditorState;
  onChange: (updatedItem: PartnerContentEditorState) => void;
  isUploading: boolean;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  partnerCategory?: PartnerCategory | null;
  businesses?: PartnerBusiness[];
  renderEventTicketingManager?: (eventListingId: string) => React.ReactNode;
}

export function PartnerEventForm({
  item,
  onChange,
  isUploading,
  onImageUpload,
  partnerCategory,
  businesses,
  renderEventTicketingManager,
}: PartnerEventFormProps) {
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isEstablishmentOpen, setIsEstablishmentOpen] = useState(false);
  const categoryRef = useRef<HTMLDivElement>(null);
  const establishmentRef = useRef<HTMLDivElement>(null);

  const { reset } = useForm<PartnerEventFormValues>({
    resolver: zodResolver(partnerEventFormSchema) as unknown as Resolver<PartnerEventFormValues>,
  });

  useEffect(() => {
    reset({
      name: item?.name || '',
      description: item?.description || '',
      eventCategory: item?.eventCategory || '',
      customCategory: item?.customCategory || '',
      establishmentId: item?.establishmentId || '',
      date: item?.date || '',
      endDate: item?.endDate || '',
      location: item?.location || '',
      googleMapsLink: item?.googleMapsLink || '',
      images: item?.images || [],
      image: item?.image || '',
      entryType: item?.entryType || 'gratuito',
      whatsappLink: item?.whatsappLink || '',
      websiteLink: item?.websiteLink || '',
      instagramLink: item?.instagramLink || '',
      address: item?.address || '',
    });
  }, [item, reset]);

  const requiresEstablishment =
    partnerCategory === 'hotel' ||
    partnerCategory === 'restaurant' ||
    partnerCategory === 'sight';

  const partnerEstablishments = (businesses ?? []).filter(
    (business) => business.type === 'item'
  );

  const selectedEstablishment = partnerEstablishments.find(
    (business) => business.businessId === item.establishmentId
  );

  const isEditingExistingEvent = Boolean(item.id);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (categoryRef.current && !categoryRef.current.contains(event.target as Node)) {
        setIsCategoryOpen(false);
      }
      if (establishmentRef.current && !establishmentRef.current.contains(event.target as Node)) {
        setIsEstablishmentOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const updateField = (field: string, value: any) => {
    onChange({ ...item, [field]: value });
  };

  return (
    <div className="flex-1 overflow-y-auto px-8 pb-10 space-y-10 no-scrollbar">
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-xl bg-white/5 border border-white/10 text-indigo-400">
            <Building2 size={18} />
          </span>
          <h3 className="text-sm font-black text-white uppercase tracking-widest">
            Informações Básicas
          </h3>
        </div>

        <div className="space-y-4">
          {requiresEstablishment && (
            <div className="space-y-2 relative" ref={establishmentRef}>
              <label className="text-[10px] font-black uppercase tracking-widest text-white/50 ml-1">
                Estabelecimento do Evento <span className="text-rose-500 font-bold">*</span>
              </label>
              {isEditingExistingEvent ? (
                <div className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white/70 text-sm flex items-center justify-between cursor-not-allowed">
                  <span>
                    {selectedEstablishment?.businessName ||
                      item.establishmentId ||
                      'Estabelecimento vinculado'}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-white/50">
                    Somente leitura
                  </span>
                </div>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setIsEstablishmentOpen(!isEstablishmentOpen)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-left flex items-center justify-between hover:bg-white/10"
                  >
                    <span className={selectedEstablishment ? 'text-white' : 'text-white/50'}>
                      {selectedEstablishment?.businessName ||
                        'Selecione o estabelecimento...'}
                    </span>
                    <ChevronDown
                      size={16}
                      className={cn(
                        'text-white/50 transition-transform duration-200',
                        isEstablishmentOpen ? 'transform rotate-180' : ''
                      )}
                    />
                  </button>

                  {isEstablishmentOpen && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-zinc-950/90 backdrop-blur-3xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl z-50 py-1 max-h-60 overflow-y-auto no-scrollbar">
                      {partnerEstablishments.length === 0 ? (
                        <div className="px-5 py-3.5 text-white/50 text-xs">
                          Nenhum estabelecimento cadastrado no seu perfil.
                        </div>
                      ) : (
                        partnerEstablishments.map((est) => (
                          <button
                            key={est.businessId}
                            type="button"
                            onClick={() => {
                              updateField('establishmentId', est.businessId);
                              setIsEstablishmentOpen(false);
                            }}
                            className="w-full px-5 py-3.5 text-left text-white text-sm hover:bg-white/5 flex items-center justify-between transition-colors font-medium border-b border-white/[0.02]"
                          >
                            <span
                              className={
                                item.establishmentId === est.businessId
                                  ? 'text-indigo-400 font-bold'
                                  : 'text-white/80'
                              }
                            >
                              {est.businessName}
                            </span>
                            {item.establishmentId === est.businessId && (
                              <Check size={14} className="text-indigo-400" />
                            )}
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-white/50 ml-1">
              Nome do Evento <span className="text-rose-500 font-bold">*</span>
            </label>
            <input
              type="text"
              value={item.name || ''}
              onChange={(e) => updateField('name', e.target.value)}
              maxLength={100}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-white/50"
              placeholder="Ex: Show na Praia, Sunset Party..."
            />
          </div>

          <div className="space-y-2 relative" ref={categoryRef}>
            <label className="text-[10px] font-black uppercase tracking-widest text-white/50 ml-1">
              Categoria <span className="text-rose-500 font-bold">*</span>
            </label>
            <button
              type="button"
              onClick={() => {
                setIsCategoryOpen(!isCategoryOpen);
              }}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-left flex items-center justify-between hover:bg-white/10"
            >
              <span className={item.eventCategory ? 'text-white' : 'text-white/50'}>
                {item.eventCategory || 'Selecione uma categoria...'}
              </span>
              <ChevronDown
                size={16}
                className={cn(
                  'text-white/50 transition-transform duration-200',
                  isCategoryOpen ? 'transform rotate-180' : ''
                )}
              />
            </button>

            {isCategoryOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-zinc-950/90 backdrop-blur-3xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl z-50 py-1 max-h-60 overflow-y-auto no-scrollbar">
                {EVENT_CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => {
                      onChange({
                        ...item,
                        eventCategory: cat,
                        ...(cat !== 'Outro' && { customCategory: '' }),
                      });
                      setIsCategoryOpen(false);
                    }}
                    className="w-full px-5 py-3.5 text-left text-white text-sm hover:bg-white/5 flex items-center justify-between transition-colors font-medium border-b border-white/[0.02]"
                  >
                    <span
                      className={
                        item.eventCategory === cat ? 'text-indigo-400 font-bold' : 'text-white/80'
                      }
                    >
                      {cat}
                    </span>
                    {item.eventCategory === cat && <Check size={14} className="text-indigo-400" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {item.eventCategory === 'Outro' && (
            <div className="space-y-2 animate-fade-in relative z-10">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/50 ml-1">
                Especifique a Categoria <span className="text-rose-500 font-bold">*</span>
              </label>
              <input
                type="text"
                value={item.customCategory || ''}
                onChange={(e) => updateField('customCategory', e.target.value)}
                maxLength={100}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-white/50"
                placeholder="Ex: Luau, Palestra, Workshop..."
              />
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-white/50 ml-1">
              Data e Hora de Início <span className="text-rose-500 font-bold">*</span>
            </label>
            <input
              type="datetime-local"
              value={isoToBusinessDateTime(item.date)}
              onChange={(e) => updateField('date', businessDateTimeToIso(e.target.value))}
              className="w-[85%] bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-white/50 ml-1">
              Data e Hora de Término <span className="text-rose-500 font-bold">*</span>
            </label>
            <input
              type="datetime-local"
              value={isoToBusinessDateTime(item.endDate)}
              onChange={(e) => updateField('endDate', businessDateTimeToIso(e.target.value))}
              className="w-[85%] bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center px-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/50">
                Descrição do Evento
              </label>
              <span className="text-[10px] font-bold text-white/50">
                {item.description?.length || 0}/400
              </span>
            </div>
            <textarea
              value={item.description || ''}
              onChange={(e) => updateField('description', e.target.value.slice(0, 400))}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-white/50 resize-none h-32 no-scrollbar"
              placeholder="Descreva os detalhes importantes, atrações ou diferenciais do evento..."
            />
          </div>
        </div>
      </div>

      <div className="space-y-6 pt-4 border-t border-white/5">
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-xl bg-white/5 border border-white/10 text-indigo-400">
            <Ticket size={18} />
          </span>
          <h3 className="text-sm font-black text-white uppercase tracking-widest">
            Entradas / Ingressos
          </h3>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => updateField('entryType', 'pago')}
            className={cn(
              'relative overflow-hidden py-4 px-6 rounded-2xl border text-sm font-bold tracking-wider uppercase transition-all duration-300 flex items-center justify-center gap-2 backdrop-blur-md',
              item.entryType === 'pago'
                ? 'bg-indigo-500/80 border-indigo-500/20 text-white shadow-[0_0_20px_rgba(99,102,241,0.2)]'
                : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:text-white'
            )}
          >
            Pago
          </button>

          <button
            type="button"
            onClick={() => updateField('entryType', 'gratuito')}
            className={cn(
              'relative overflow-hidden py-4 px-6 rounded-2xl border text-sm font-bold tracking-wider uppercase transition-all duration-300 flex items-center justify-center gap-2 backdrop-blur-md',
              !item.entryType || item.entryType === 'gratuito'
                ? 'bg-indigo-500/50 border-indigo-500/20 text-white shadow-[0_0_20px_rgba(99,102,241,0.2)]'
                : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:text-white'
            )}
          >
            Entrada gratuita
          </button>
        </div>

        {item.id && renderEventTicketingManager && (
          <div className="pt-4">{renderEventTicketingManager(item.id)}</div>
        )}
      </div>

      <div className="space-y-6 pt-4 border-t border-white/5">
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-xl bg-white/5 border border-white/10 text-indigo-400">
            <Phone size={18} />
          </span>
          <h3 className="text-sm font-black text-white uppercase tracking-widest">
            Contato e Localização
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-white/50 ml-1">
              WhatsApp de Contato / Reservas
            </label>
            <div className="relative">
              <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" />
              <input
                type="text"
                placeholder="(85) 99999-9999"
                value={item.whatsappLink || ''}
                onChange={(e) => updateField('whatsappLink', e.target.value)}
                maxLength={300}
                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-5 py-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-white/50 ml-1">
              Site / Link de Ingressos
            </label>
            <div className="relative">
              <Globe size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" />
              <input
                type="text"
                placeholder="https://..."
                value={item.websiteLink || ''}
                onChange={(e) => updateField('websiteLink', e.target.value)}
                maxLength={300}
                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-5 py-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-white/50 ml-1">
              Instagram do Evento
            </label>
            <div className="relative">
              <Camera
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50"
              />
              <input
                type="text"
                placeholder="@perfil"
                value={item.instagramLink || ''}
                onChange={(e) => updateField('instagramLink', e.target.value)}
                maxLength={300}
                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-5 py-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-white/50 ml-1">
              Google Maps (Local) <span className="text-rose-500 font-bold">*</span>
            </label>
            <div className="relative">
              <MapPin
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50"
              />
              <input
                type="text"
                placeholder="Link da localização"
                value={item.googleMapsLink || ''}
                onChange={(e) => updateField('googleMapsLink', e.target.value)}
                maxLength={300}
                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-5 py-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
              />
            </div>
          </div>

          <div className="space-y-2 sm:col-span-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-white/50 ml-1">
              Região / Bairro <span className="text-rose-500 font-bold">*</span>
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 z-10 pointer-events-none">
                <Hash size={16} />
              </div>
              <RegionDropdown
                value={item.location || ''}
                onChange={(val) => updateField('location', val)}
                placeholder="Selecione uma região..."
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-white/50 ml-1">
            Endereço do Local
          </label>
          <div className="relative">
            <Building2
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50"
            />
            <input
              type="text"
              placeholder="Rua, Número, Referência..."
              value={item.address || ''}
              onChange={(e) => updateField('address', e.target.value)}
              maxLength={300}
              className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-5 py-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
            />
          </div>
        </div>
      </div>

      <div className="space-y-6 pt-4 border-t border-white/5">
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-xl bg-white/5 border border-white/10 text-indigo-400">
            <Camera size={18} />
          </span>
          <h3 className="text-sm font-black text-white uppercase tracking-widest">
            Fotos do Evento
          </h3>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {(item.images || []).map((img: string, i: number) => (
            <div
              key={i}
              className="group relative aspect-square rounded-2xl overflow-hidden border border-white/10 shadow-lg"
            >
              <img
                src={img}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                alt=""
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => updateField('image', img)}
                  aria-label="Definir como principal"
                  className={cn(
                    'p-2 rounded-lg transition-all',
                    item.image === img
                      ? 'bg-emerald-500 text-white'
                      : 'bg-white/20 text-white hover:bg-white/40'
                  )}
                  title="Definir como principal"
                >
                  <CheckCircle2 size={14} />
                </button>
                <button
                  type="button"
                  aria-label="Remover foto"
                  onClick={() => {
                    const newImgs = (item.images || []).filter((_: string, idx: number) => idx !== i);
                    onChange({
                      ...item,
                      images: newImgs,
                      image: item.image === img ? newImgs[0] || '' : item.image,
                    });
                  }}
                  className="p-2 bg-red-500/80 rounded-lg text-white hover:bg-red-500 transition-all"
                >
                  <Trash2 size={14} />
                </button>
              </div>
              {item.image === img && (
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-emerald-500 text-white text-[8px] font-black uppercase tracking-widest shadow-xl">
                  Principal
                </div>
              )}
            </div>
          ))}
          {(item.images || []).length < 5 && (
            <label
              className={cn(
                'aspect-square rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all gap-2',
                isUploading
                  ? 'border-indigo-500/20 bg-indigo-500/5 animate-pulse'
                  : 'border-white/5 hover:border-indigo-500/30 hover:bg-white/5'
              )}
            >
              <input type="file" className="hidden" onChange={onImageUpload} multiple />
              <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-white/50">
                {isUploading ? (
                  <RefreshCw className="animate-spin" size={16} />
                ) : (
                  <Upload size={16} />
                )}
              </div>
              <span className="text-[8px] font-black uppercase tracking-widest text-white/50">
                Add Fotos
              </span>
            </label>
          )}
        </div>
      </div>
    </div>
  );
}
