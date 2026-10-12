import { AnimatePresence, motion } from 'motion/react';
import { cn } from '../../../../../shared/utils/cn';
import { type DetailsSectionProps, useDetailsForm } from './useDetailsForm';

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

/** Campos da inscrição de hospedagem. */
export function HotelDetails(props: DetailsSectionProps) {
  const { formData, getFieldError, updateFieldValue, toggleInList } = useDetailsForm(props);
  const toggleBreakfastType = (value: string) => toggleInList('breakfastTypes', value);
  const toggleAmenity = (value: string) => toggleInList('amenities', value);

  return (
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
                    O café está incluso no preço da estadia? <span className="text-red-500">*</span>
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
                      Preço por pessoa/dia (com impostos) <span className="text-red-500">*</span>
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
  );
}
