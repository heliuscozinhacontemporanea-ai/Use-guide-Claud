import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { LayoutList } from 'lucide-react';
import { useFormContext } from 'react-hook-form';
import { cn } from '../../../../shared/utils/cn';

interface OperatingDay {
  open: string;
  close: string;
  closed: boolean;
}

interface Step4AdditionalProps {
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  errors?: { [key: string]: string };
  setErrors?: React.Dispatch<React.SetStateAction<{ [key: string]: string }>>;
  categories?: { id: string; label: string }[];
}

const languagesOptions = ['Português', 'Inglês', 'Espanhol', 'Francês', 'Alemão', 'Italiano'];

export function Step4Additional({ formData: propFormData, setFormData }: Step4AdditionalProps) {
  const formContext = useFormContext();

  const formData = formContext ? formContext.watch() : propFormData;

  const updateFieldValue = (field: string, value: any) => {
    if (formContext) {
      formContext.setValue(field, value, { shouldValidate: true });
    }
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const toggleLanguage = (lang: string) => {
    const current = formData.languages || [];
    const next = current.includes(lang)
      ? current.filter((l: string) => l !== lang)
      : [...current, lang];
    updateFieldValue('languages', next);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <span className="p-2 rounded-xl bg-white/5 border border-white/10 text-indigo-400">
          <LayoutList size={18} />
        </span>
        <h3 className="text-sm font-black text-white uppercase tracking-widest">
          Detalhes Operacionais
        </h3>
      </div>

      {formData.category === 'hotel' ? (
        <div className="space-y-10">
          {/* Idiomas */}
          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase tracking-widest text-indigo-400 block ml-1">
              Idiomas atendidos
            </label>
            <div className="grid grid-cols-2 gap-2">
              {languagesOptions.map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => toggleLanguage(lang)}
                  className={cn(
                    'px-4 py-3 rounded-xl border text-[10px] font-bold uppercase tracking-wider transition-all',
                    (formData.languages || []).includes(lang)
                      ? 'bg-indigo-500 text-white border-indigo-500'
                      : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'
                  )}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>

          {/* Regras: Check-in/out */}
          <div className="space-y-6">
            <label className="text-[10px] font-black uppercase tracking-widest text-indigo-400 block ml-1">
              Regras
            </label>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3 w-[80%] md:w-full">
                <p className="text-[10px] font-black text-white/50 uppercase tracking-widest ml-1">
                  Check-in
                </p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 space-y-1">
                    <span className="text-[9px] text-white/50 uppercase font-black ml-1">Das</span>
                    <input
                      type="time"
                      value={formData.checkInFrom || ''}
                      onChange={(e) => updateFieldValue('checkInFrom', e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                    />
                  </div>
                  <div className="flex-1 space-y-1">
                    <span className="text-[9px] text-white/50 uppercase font-black ml-1">Até</span>
                    <input
                      type="time"
                      value={formData.checkInTo || ''}
                      onChange={(e) => updateFieldValue('checkInTo', e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3 w-[80%] md:w-full">
                <p className="text-[10px] font-black text-white/50 uppercase tracking-widest ml-1">
                  Check-out
                </p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 space-y-1">
                    <span className="text-[9px] text-white/50 uppercase font-black ml-1">Das</span>
                    <input
                      type="time"
                      value={formData.checkOutFrom || ''}
                      onChange={(e) => updateFieldValue('checkOutFrom', e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                    />
                  </div>
                  <div className="flex-1 space-y-1">
                    <span className="text-[9px] text-white/50 uppercase font-black ml-1">Até</span>
                    <input
                      type="time"
                      value={formData.checkOutTo || ''}
                      onChange={(e) => updateFieldValue('checkOutTo', e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Crianças e Pets */}
          <div className="space-y-8">
            {/* Crianças */}
            <div className="space-y-3">
              <p className="text-xs font-bold text-white/80 ml-1">
                Crianças são permitidas? <span className="text-red-500">*</span>
              </p>
              <div className="flex gap-2">
                {[
                  { v: true, l: 'Sim' },
                  { v: false, l: 'Não' },
                ].map((opt) => (
                  <button
                    key={opt.l}
                    type="button"
                    onClick={() => updateFieldValue('childrenAllowed', opt.v)}
                    className={cn(
                      'flex-1 py-3 px-4 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all',
                      formData.childrenAllowed === opt.v
                        ? 'bg-indigo-500/20 border-indigo-500 text-indigo-400'
                        : 'bg-white/5 border-white/10 text-white/50'
                    )}
                  >
                    {opt.l}
                  </button>
                ))}
              </div>
            </div>

            {/* Pets */}
            <div className="space-y-3">
              <p className="text-xs font-bold text-white/80 ml-1">
                Pets são permitidos? <span className="text-red-500">*</span>
              </p>
              <div className="flex flex-col gap-2">
                {['Sim', 'Mediante pedido', 'Não'].map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => {
                      updateFieldValue('petsPolicy', opt);
                      if (opt === 'Não') updateFieldValue('petsExtraCost', '');
                    }}
                    className={cn(
                      'w-full py-4 px-5 rounded-2xl border text-[10px] font-black uppercase tracking-widest text-left transition-all',
                      formData.petsPolicy === opt
                        ? 'bg-indigo-500/20 border-indigo-500 text-indigo-400 shadow-lg shadow-indigo-500/5'
                        : 'bg-white/5 border-white/10 text-white/50'
                    )}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            {/* Custos extras para Pets */}
            <AnimatePresence>
              {(formData.petsPolicy === 'Sim' || formData.petsPolicy === 'Mediante pedido') && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-3 overflow-hidden pl-4 border-l-2 border-indigo-500/30"
                >
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/50 ml-1">
                    Custos extras para Pets? <span className="text-red-500">*</span>
                  </p>
                  <div className="flex gap-2">
                    {['Gratuito', 'Custos extras'].map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => updateFieldValue('petsExtraCost', opt)}
                        className={cn(
                          'flex-1 py-3 px-4 rounded-xl border text-[10px] font-bold uppercase tracking-wider transition-all',
                          formData.petsExtraCost === opt
                            ? 'bg-indigo-500/20 border-indigo-500 text-indigo-400'
                            : 'bg-white/5 border-white/10 text-white/50'
                        )}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      ) : formData.category === 'restaurant' || formData.category === 'sight' ? (
        <div className="space-y-10">
          {/* Idiomas */}
          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase tracking-widest text-indigo-400 block ml-1">
              Idiomas atendidos
            </label>
            <div className="grid grid-cols-2 gap-2">
              {languagesOptions.map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => toggleLanguage(lang)}
                  className={cn(
                    'px-4 py-3 rounded-xl border text-[10px] font-bold uppercase tracking-wider transition-all',
                    (formData.languages || []).includes(lang)
                      ? 'bg-indigo-500 text-white border-indigo-500'
                      : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'
                  )}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>

          {/* Horários de Funcionamento */}
          <div className="space-y-6">
            <label className="text-[10px] font-black uppercase tracking-widest text-indigo-400 block ml-1">
              Horários de Funcionamento
            </label>

            <div className="space-y-3">
              {['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'].map((day) => {
                const hours = (formData.operatingHours?.[day] || {
                  open: '08:00',
                  close: '22:00',
                  closed: false,
                }) as OperatingDay;
                return (
                  <div
                    key={day}
                    className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-white uppercase tracking-widest">
                        {day}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const currentHours = formData.operatingHours || {};
                          const dayData = currentHours[day] || {
                            open: '08:00',
                            close: '22:00',
                            closed: false,
                          };
                          updateFieldValue('operatingHours', {
                            ...currentHours,
                            [day]: { ...dayData, closed: !dayData.closed },
                          });
                        }}
                        className={cn(
                          'px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all',
                          hours.closed
                            ? 'bg-red-500/20 text-red-400 border border-red-500/20'
                            : 'bg-white/10 text-white/50 border border-white/10'
                        )}
                      >
                        {hours.closed ? 'Fechado' : 'Aberto'}
                      </button>
                    </div>

                    {!hours.closed && (
                      <div className="flex items-center gap-4 w-[90%]">
                        <div className="flex-1 space-y-1">
                          <span className="text-[8px] text-white/50 uppercase font-black ml-1">
                            Abertura
                          </span>
                          <input
                            type="time"
                            value={hours.open || ''}
                            onChange={(e) => {
                              const currentHours = formData.operatingHours || {};
                              const dayData = currentHours[day] || {
                                open: '08:00',
                                close: '22:00',
                                closed: false,
                              };
                              updateFieldValue('operatingHours', {
                                ...currentHours,
                                [day]: { ...dayData, open: e.target.value },
                              });
                            }}
                            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-[10px] font-bold focus:ring-1 focus:ring-indigo-500/50 outline-none"
                          />
                        </div>
                        <div className="flex-1 space-y-1">
                          <span className="text-[8px] text-white/50 uppercase font-black ml-1">
                            Fechamento
                          </span>
                          <input
                            type="time"
                            value={hours.close || ''}
                            onChange={(e) => {
                              const currentHours = formData.operatingHours || {};
                              const dayData = currentHours[day] || {
                                open: '08:00',
                                close: '22:00',
                                closed: false,
                              };
                              updateFieldValue('operatingHours', {
                                ...currentHours,
                                [day]: { ...dayData, close: e.target.value },
                              });
                            }}
                            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-[10px] font-bold focus:ring-1 focus:ring-indigo-500/50 outline-none"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="py-20 text-center">
          <p className="text-white/50 text-xs italic">Configurações operacionais em breve.</p>
        </div>
      )}
    </div>
  );
}
