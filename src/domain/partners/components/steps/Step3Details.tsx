import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Sparkles, Globe, Upload, CheckCircle2, X, Utensils, LayoutList } from 'lucide-react';
import { useFormContext } from 'react-hook-form';
import { cn } from '../../../../shared/utils/cn';

interface Step3DetailsProps {
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  errors: { [key: string]: string };
  setErrors: React.Dispatch<React.SetStateAction<{ [key: string]: string }>>;
  categories: { id: string; label: string }[];
}

const breakfastOptions = [
  'A lá carte',
  'Americano',
  'Buffet',
  'Vegano',
  'Vegetariano',
  'Glúten-free',
  'Italiano',
  'Asiático',
];

const amenityOptions = [
  'Restaurante',
  'Serviço de quarto',
  'Bar',
  'Recepção 24 horas',
  'Sauna',
  'Academia',
  'Jardim',
  'Terraço',
  'Transporte para o aeroporto',
  'Quartos familiares',
  'Spa e centro de bem-estar',
  'Banheira de hidromassagem',
  'Wi-Fi gratuito',
  'Ar condicionado',
  'Parque aquático',
  'Estação de carregamento de veículos elétricos',
  'Piscina',
];

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

const sightServiceOptions = ['Estacionamento', 'Guia Turístico', 'Aluguel de Equipamentos'];

const sightAmenityOptions = [
  'Piscina',
  'Restaurante/Bar',
  'Vestiários',
  'Wi-Fi Gratuito',
  'Área de Acampamento',
  'Aceita Pets',
  'Acessibilidade',
  'Espaço para Eventos',
];

const sightActivityOptions = [
  'Trilhas',
  'Esportes Aquáticos',
  'Pesca',
  'Passeios de Barco',
  'Fotografia',
  'Observação de Pássaros',
  'Ecoturismo',
  'Banho de Mar/Rio',
];

export function Step3Details({
  formData: propFormData,
  setFormData,
  errors: propErrors,
  setErrors,
  categories,
}: Step3DetailsProps) {
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

  const clearError = (field: string) => {
    if (propErrors[field]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[field];
        return copy;
      });
    }
  };

  const toggleBreakfastType = (type: string) => {
    const current = formData.breakfastTypes || [];
    const next = current.includes(type)
      ? current.filter((t: string) => t !== type)
      : [...current, type];
    updateFieldValue('breakfastTypes', next);
  };

  const toggleAmenity = (amenity: string) => {
    const current = formData.amenities || [];
    const next = current.includes(amenity)
      ? current.filter((a: string) => a !== amenity)
      : [...current, amenity];
    updateFieldValue('amenities', next);
  };

  const toggleMealType = (type: string) => {
    const current = formData.mealTypes || [];
    const nextTypes = current.includes(type)
      ? current.filter((t: string) => t !== type)
      : [...current, type];
    updateFieldValue('mealTypes', nextTypes);
  };

  const toggleAdditionalService = (service: string) => {
    const current = formData.additionalServices || [];
    const next = current.includes(service)
      ? current.filter((s: string) => s !== service)
      : [...current, service];
    updateFieldValue('additionalServices', next);
  };

  const toggleRestaurantAmenity = (amenity: string) => {
    const current = formData.amenitiesRestaurant || [];
    const next = current.includes(amenity)
      ? current.filter((a: string) => a !== amenity)
      : [...current, amenity];
    updateFieldValue('amenitiesRestaurant', next);
  };

  const toggleSightService = (service: string) => {
    const current = formData.sightServices || [];
    const nextServices = current.includes(service)
      ? current.filter((s: string) => s !== service)
      : [...current, service];
    updateFieldValue('sightServices', nextServices);
  };

  const toggleSightAmenity = (amenity: string) => {
    const current = formData.sightAmenities || [];
    const next = current.includes(amenity)
      ? current.filter((a: string) => a !== amenity)
      : [...current, amenity];
    updateFieldValue('sightAmenities', next);
  };

  const toggleSightActivity = (activity: string) => {
    const current = formData.sightActivities || [];
    const nextActivities = current.includes(activity)
      ? current.filter((a: string) => a !== activity)
      : [...current, activity];
    updateFieldValue('sightActivities', nextActivities);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <span className="p-2 rounded-xl bg-white/5 border border-white/10 text-indigo-400">
          <Sparkles size={18} />
        </span>
        <h3 className="text-sm font-black text-white uppercase tracking-widest">
          Serviços e Comodidades
        </h3>
      </div>

      {formData.category === 'hotel' ? (
        <div className="space-y-8">
          {/* Café da Manhã Section */}
          <div className="space-y-6">
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-indigo-400 block ml-1">
                Café da Manhã
              </label>

              {/* Serve Café? */}
              <div className="space-y-3">
                <p className="text-xs font-bold text-white/80 ml-1">
                  Serve café da manhã ao hóspede? <span className="text-red-500">*</span>
                </p>
                <div className="flex gap-2">
                  {[
                    { v: true, l: 'Sim' },
                    { v: false, l: 'Não' },
                  ].map((opt) => (
                    <button
                      key={opt.l}
                      type="button"
                      onClick={() => updateFieldValue('servesBreakfast', opt.v)}
                      className={cn(
                        'flex-1 py-3 px-4 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all active:scale-95',
                        formData.servesBreakfast === opt.v
                          ? 'bg-indigo-500/20 border-indigo-500 text-indigo-400'
                          : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'
                      )}
                    >
                      {opt.l}
                    </button>
                  ))}
                </div>
                {getFieldError('servesBreakfast') && (
                  <p className="text-xs text-red-400 font-medium ml-1">
                    {getFieldError('servesBreakfast')}
                  </p>
                )}
              </div>

              <AnimatePresence>
                {formData.servesBreakfast && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-6 overflow-hidden"
                  >
                    {/* Incluso no preço? */}
                    <div className="space-y-3">
                      <p className="text-xs font-bold text-white/80 ml-1">
                        O café está incluso no preço da estadia?{' '}
                        <span className="text-red-500">*</span>
                      </p>
                      <div className="flex flex-col gap-2">
                        {[
                          { v: true, l: 'Sim, está incluso' },
                          { v: false, l: 'Não, é cobrado à parte' },
                        ].map((opt) => (
                          <button
                            key={opt.l}
                            type="button"
                            onClick={() => updateFieldValue('breakfastIncluded', opt.v)}
                            className={cn(
                              'w-full py-4 px-5 rounded-2xl border text-[10px] font-black uppercase tracking-widest text-left transition-all active:scale-[0.98]',
                              formData.breakfastIncluded === opt.v
                                ? 'bg-indigo-500/20 border-indigo-500 text-indigo-400 shadow-lg shadow-indigo-500/5'
                                : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'
                            )}
                          >
                            {opt.l}
                          </button>
                        ))}
                      </div>
                      {getFieldError('breakfastIncluded') && (
                        <p className="text-xs text-red-400 font-medium ml-1">
                          {getFieldError('breakfastIncluded')}
                        </p>
                      )}
                    </div>

                    {/* Preço se não incluso */}
                    {formData.breakfastIncluded === false && (
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-2 pl-4 border-l-2 border-indigo-500/30"
                      >
                        <label className="text-[10px] font-black uppercase tracking-widest text-white/50 ml-1">
                          Preço por pessoa/dia (com impostos){' '}
                          <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-indigo-400">
                            R$
                          </span>
                          <input
                            type="text"
                            value={formData.breakfastPrice || ''}
                            onChange={(e) => updateFieldValue('breakfastPrice', e.target.value)}
                            placeholder="0,00"
                            className="w-full bg-white/5 border border-white/10 rounded-2xl pl-10 pr-5 py-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-white/50"
                          />
                        </div>
                        {getFieldError('breakfastPrice') && (
                          <p className="text-xs text-red-400 font-medium ml-1">
                            {getFieldError('breakfastPrice')}
                          </p>
                        )}
                      </motion.div>
                    )}

                    {/* Tipos de Café */}
                    <div className="space-y-3">
                      <p className="text-xs font-bold text-white/80 ml-1">
                        Tipos de café da manhã oferecidos:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {breakfastOptions.map((type) => (
                          <button
                            key={type}
                            type="button"
                            onClick={() => toggleBreakfastType(type)}
                            className={cn(
                              'px-4 py-2 rounded-xl border text-[9px] font-black uppercase tracking-[0.1em] transition-all',
                              (formData.breakfastTypes || []).includes(type)
                                ? 'bg-indigo-500 text-white border-indigo-500'
                                : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'
                            )}
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Comodidades Section */}
          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase tracking-widest text-indigo-400 block ml-1">
              Comodidades
            </label>
            <div className="grid grid-cols-2 gap-2">
              {amenityOptions.map((amenity) => (
                <button
                  key={amenity}
                  type="button"
                  onClick={() => toggleAmenity(amenity)}
                  className={cn(
                    'flex items-center gap-3 p-4 rounded-xl border text-left transition-all active:scale-[0.98]',
                    (formData.amenities || []).includes(amenity)
                      ? 'bg-indigo-500/10 border-indigo-500/50 text-indigo-400'
                      : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'
                  )}
                >
                  <div
                    className={cn(
                      'w-2 h-2 rounded-full shrink-0 transition-all',
                      (formData.amenities || []).includes(amenity)
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
      ) : formData.category === 'restaurant' ? (
        <div className="space-y-8">
          {/* Cardápio digital */}
          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase tracking-widest text-indigo-400 block ml-1">
              Cardápio Digital
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/50 ml-1">
                  Upload PDF/Imagem
                </label>
                <div
                  onClick={() =>
                    !formData.menuFile && document.getElementById('menu-file-input')?.click()
                  }
                  className={cn(
                    'relative flex items-center justify-center gap-3 p-4 rounded-2xl border-2 border-dashed transition-all cursor-pointer group/menu',
                    formData.menuFile
                      ? 'bg-indigo-500/10 border-indigo-500/50 text-indigo-400'
                      : 'bg-white/5 border-white/10 text-white/50 hover:border-indigo-500/30 hover:bg-white/10'
                  )}
                >
                  {formData.menuFile ? (
                    <CheckCircle2 size={16} />
                  ) : (
                    <Upload size={16} className="group-hover/menu:scale-110 transition-transform" />
                  )}
                  <span className="text-[10px] font-bold uppercase tracking-wider truncate max-w-[150px]">
                    {formData.menuFile ? formData.menuFile.name : 'Selecionar Arquivo'}
                  </span>
                  {formData.menuFile && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        updateFieldValue('menuFile', null);
                      }}
                      className="absolute -top-2 -right-2 p-1 rounded-full bg-red-500 text-white shadow-lg active:scale-90 transition-transform"
                    >
                      <X size={10} />
                    </button>
                  )}
                  <input
                    id="menu-file-input"
                    type="file"
                    className="hidden"
                    accept=".pdf,image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) updateFieldValue('menuFile', file);
                    }}
                  />
                </div>
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
                <p className="text-xs text-red-400 font-medium ml-1">
                  {getFieldError('subcategory')}
                </p>
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
                <p className="text-xs text-red-400 font-medium ml-1">
                  {getFieldError('cuisineType')}
                </p>
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
      ) : formData.category === 'sight' ? (
        <div className="space-y-10">
          {/* Acesso (Pago ou Gratuito) */}
          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase tracking-widest text-indigo-400 block ml-1">
              Acesso à Atração <span className="text-red-500 ml-0.5">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {['pago', 'gratuito'].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => {
                    updateFieldValue('sightAccessType', type);
                    if (type === 'gratuito') updateFieldValue('sightPrice', '');
                  }}
                  className={cn(
                    'px-4 py-3 rounded-xl border text-[10px] font-bold uppercase tracking-wider transition-all',
                    formData.sightAccessType === type
                      ? 'bg-indigo-500 text-white border-indigo-500 shadow-lg shadow-indigo-500/20'
                      : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'
                  )}
                >
                  {type}
                </button>
              ))}
            </div>
            {getFieldError('sightAccessType') && (
              <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest ml-1">
                {getFieldError('sightAccessType')}
              </p>
            )}

            <AnimatePresence>
              {formData.sightAccessType === 'pago' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2 pt-2"
                >
                  <label className="text-[9px] font-black uppercase tracking-widest text-white/50 block ml-1">
                    Preço por pessoa
                  </label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 group-focus-within:text-indigo-400 transition-colors text-[10px] font-black">
                      R$
                    </div>
                    <input
                      type="text"
                      placeholder="0,00"
                      value={formData.sightPrice || ''}
                      onChange={(e) => updateFieldValue('sightPrice', e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-10 pr-4 text-white text-[11px] font-bold focus:ring-1 focus:ring-indigo-500/50 outline-none transition-all placeholder:text-white/50"
                    />
                  </div>
                  {getFieldError('sightPrice') && (
                    <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest ml-1">
                      {getFieldError('sightPrice')}
                    </p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Serviços oferecidos */}
          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase tracking-widest text-indigo-400 block ml-1">
              Serviços Oferecidos
            </label>
            <div className="flex flex-wrap gap-2">
              {sightServiceOptions.map((service) => (
                <button
                  key={service}
                  type="button"
                  onClick={() => toggleSightService(service)}
                  className={cn(
                    'px-4 py-3 rounded-xl border text-[9px] font-black uppercase tracking-[0.1em] transition-all active:scale-95',
                    (formData.sightServices || []).includes(service)
                      ? 'bg-indigo-500 text-white border-indigo-500 shadow-lg shadow-indigo-500/20'
                      : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:border-white/20'
                  )}
                >
                  {service}
                </button>
              ))}
            </div>
            {getFieldError('sightServices') && (
              <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest ml-1">
                {getFieldError('sightServices')}
              </p>
            )}
          </div>

          {/* Confortos / Comodidades */}
          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase tracking-widest text-indigo-400 block ml-1">
              Confortos e Estrutura
            </label>
            <div className="grid grid-cols-2 gap-2">
              {sightAmenityOptions.map((amenity) => (
                <button
                  key={amenity}
                  type="button"
                  onClick={() => toggleSightAmenity(amenity)}
                  className={cn(
                    'flex items-center gap-3 p-4 rounded-xl border text-left transition-all active:scale-[0.98]',
                    (formData.sightAmenities || []).includes(amenity)
                      ? 'bg-indigo-500/10 border-indigo-500/50 text-indigo-400 shadow-lg shadow-indigo-500/5'
                      : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'
                  )}
                >
                  <div
                    className={cn(
                      'w-2 h-2 rounded-full shrink-0 transition-all',
                      (formData.sightAmenities || []).includes(amenity)
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

          {/* Atividades disponíveis */}
          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase tracking-widest text-indigo-400 block ml-1">
              Atividades Disponíveis
            </label>
            <p className="text-[9px] text-white/50 uppercase font-black ml-1">
              Quais experiências o turista pode vivenciar?
            </p>
            <div className="flex flex-wrap gap-2">
              {sightActivityOptions.map((activity) => (
                <button
                  key={activity}
                  type="button"
                  onClick={() => toggleSightActivity(activity)}
                  className={cn(
                    'px-4 py-2 rounded-xl border text-[9px] font-black uppercase tracking-[0.1em] transition-all active:scale-95',
                    (formData.sightActivities || []).includes(activity)
                      ? 'bg-indigo-500 text-white border-indigo-500 shadow-lg shadow-indigo-500/20'
                      : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:border-white/20'
                  )}
                >
                  {activity}
                </button>
              ))}
            </div>
            {getFieldError('sightActivities') && (
              <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest ml-1">
                {getFieldError('sightActivities')}
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="py-20 text-center space-y-4">
          <p className="text-white/50 text-xs italic">
            Comodidades específicas para{' '}
            {categories.find((c) => c.id === formData.category)?.label || formData.category} em
            breve.
          </p>
        </div>
      )}
    </div>
  );
}
