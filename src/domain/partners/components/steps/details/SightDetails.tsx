import { AnimatePresence, motion } from 'motion/react';
import { cn } from '../../../../../shared/utils/cn';
import { type DetailsSectionProps, useDetailsForm } from './useDetailsForm';

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

/** Campos da inscrição de atração. */
export function SightDetails(props: DetailsSectionProps) {
  const { formData, getFieldError, updateFieldValue, toggleInList } = useDetailsForm(props);
  const toggleSightService = (value: string) => toggleInList('sightServices', value);
  const toggleSightAmenity = (value: string) => toggleInList('sightAmenities', value);
  const toggleSightActivity = (value: string) => toggleInList('sightActivities', value);

  return (
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
  );
}
