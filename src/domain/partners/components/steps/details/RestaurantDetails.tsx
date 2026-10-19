import { Globe, Utensils, LayoutList } from 'lucide-react';
import { cn } from '../../../../../shared/utils/cn';
import { type DetailsSectionProps, useDetailsForm } from './useDetailsForm';

const mealTypeOptions = [
  'Café da Manhã',
  'Buffet',
  'Almoço',
  'Jantar',
  'Petiscos',
  'Drinks',
  'Vinhos',
];

const additionalServiceOptions = [
  'Delivery',
  'Reservas Online',
  'Música ao Vivo',
  'Eventos Privados',
];

const restaurantAmenityOptions = [
  'Wi-Fi Gratuito',
  'Ar Condicionado',
  'Pé na areia',
  'Área Externa/Jardim',
  'Estacionamento',
  'Acessibilidade',
  'Aceita Pets',
];

/** Campos da inscrição de restaurante (o cardápio é só por link). */
export function RestaurantDetails(props: DetailsSectionProps) {
  const { formData, getFieldError, updateFieldValue, toggleInList } = useDetailsForm(props);
  const toggleMealType = (value: string) => toggleInList('mealTypes', value);
  const toggleAdditionalService = (value: string) => toggleInList('additionalServices', value);
  const toggleRestaurantAmenity = (value: string) => toggleInList('amenitiesRestaurant', value);

  return (
    <div className="space-y-8">
      {/* Cardápio digital */}
      <div className="space-y-4">
        <label className="text-[10px] font-black uppercase tracking-widest text-indigo-400 block ml-1">
          Cardápio Digital
        </label>
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-white/50 ml-1">
            Link do Cardápio
          </label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50">
              <Globe size={16} />
            </div>
            <input
              type="url"
              value={formData.menuLink || ''}
              onChange={(e) => updateFieldValue('menuLink', e.target.value)}
              placeholder="https://..."
              className={cn(
                'w-full bg-white/5 border rounded-2xl pl-12 pr-5 py-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-white/50',
                getFieldError('menuLink')
                  ? 'border-red-500/50 ring-2 ring-red-500/10'
                  : 'border-white/10'
              )}
            />
            {getFieldError('menuLink') && (
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-red-400 uppercase tracking-widest">
                {getFieldError('menuLink')}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Subcategoria e Culinária */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-white/50 ml-1">
            Subcategoria <span className="text-red-500 ml-0.5">*</span>
          </label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50">
              <LayoutList size={16} />
            </div>
            <input
              type="text"
              value={formData.subcategory || ''}
              onChange={(e) => updateFieldValue('subcategory', e.target.value)}
              placeholder="Ex: Restaurante, Bar, Café..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-5 py-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-white/50"
            />
          </div>
          {getFieldError('subcategory') && (
            <p className="text-xs text-red-400 font-medium ml-1">{getFieldError('subcategory')}</p>
          )}
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-white/50 ml-1">
            Tipo de Culinária
          </label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50">
              <Utensils size={16} />
            </div>
            <input
              type="text"
              value={formData.cuisineType || ''}
              onChange={(e) => updateFieldValue('cuisineType', e.target.value)}
              placeholder="Ex: Italiana, Japonesa..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-5 py-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-white/50"
            />
          </div>
          {getFieldError('cuisineType') && (
            <p className="text-xs text-red-400 font-medium ml-1">{getFieldError('cuisineType')}</p>
          )}
        </div>
      </div>

      {/* Tipos de Refeição */}
      <div className="space-y-4">
        <label className="text-[10px] font-black uppercase tracking-widest text-indigo-400 block ml-1">
          Tipos de Refeição e Bebidas
        </label>
        <div className="flex flex-wrap gap-2">
          {mealTypeOptions.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => toggleMealType(type)}
              className={cn(
                'px-4 py-2 rounded-xl border text-[9px] font-black uppercase tracking-[0.1em] transition-all active:scale-95',
                (formData.mealTypes || []).includes(type)
                  ? 'bg-indigo-500 text-white border-indigo-500 shadow-lg shadow-indigo-500/20'
                  : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:border-white/20'
              )}
            >
              {type}
            </button>
          ))}
        </div>
        {getFieldError('mealTypes') && (
          <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest ml-1">
            {getFieldError('mealTypes')}
          </p>
        )}
      </div>

      {/* Serviços Adicionais */}
      <div className="space-y-4">
        <label className="text-[10px] font-black uppercase tracking-widest text-indigo-400 block ml-1">
          Serviços Adicionais
        </label>
        <div className="flex flex-wrap gap-2">
          {additionalServiceOptions.map((service) => (
            <button
              key={service}
              type="button"
              onClick={() => toggleAdditionalService(service)}
              className={cn(
                'px-4 py-3 rounded-xl border text-[9px] font-black uppercase tracking-[0.1em] transition-all active:scale-95',
                (formData.additionalServices || []).includes(service)
                  ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-400'
                  : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'
              )}
            >
              {service}
            </button>
          ))}
        </div>
      </div>

      {/* Comodidades Restaurante */}
      <div className="space-y-4">
        <label className="text-[10px] font-black uppercase tracking-widest text-indigo-400 block ml-1">
          Comodidades
        </label>
        <div className="grid grid-cols-2 gap-2">
          {restaurantAmenityOptions.map((amenity) => (
            <button
              key={amenity}
              type="button"
              onClick={() => toggleRestaurantAmenity(amenity)}
              className={cn(
                'flex items-center gap-3 p-4 rounded-xl border text-left transition-all active:scale-[0.98]',
                (formData.amenitiesRestaurant || []).includes(amenity)
                  ? 'bg-indigo-500/10 border-indigo-500/50 text-indigo-400 shadow-lg shadow-indigo-500/5'
                  : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'
              )}
            >
              <div
                className={cn(
                  'w-2 h-2 rounded-full shrink-0 transition-all',
                  (formData.amenitiesRestaurant || []).includes(amenity)
                    ? 'bg-indigo-400 animate-pulse'
                    : 'bg-white/10'
                )}
              />
              <span className="text-[10px] font-bold uppercase tracking-tight leading-tight">
                {amenity}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
