import React from 'react';
import { Globe, LayoutList, Utensils, Clock, Languages } from 'lucide-react';
import { cn } from '../../../shared/utils/cn';
import { maskCurrency } from '../../../shared/utils/currencyMask';

export function RestaurantForm({
  item,
  onChange,
}: {
  item: any;
  onChange: (updates: any) => void;
}) {
  const toggleSelection = (field: string, value: string) => {
    const current = item.operationalInfo?.[field] || [];
    const next = current.includes(value)
      ? current.filter((v: string) => v !== value)
      : [...current, value];
    onChange({ operationalInfo: { ...item.operationalInfo, [field]: next } });
  };

  const mealTypeOptions = [
    'Café da Manhã',
    'Buffet',
    'Almoço',
    'Jantar',
    'Petiscos',
    'Drinks',
    'Vinhos',
  ];
  const serviceOptions = ['Delivery', 'Reservas Online', 'Música ao Vivo', 'Eventos Privados'];
  const amenityOptions = [
    'Wi-Fi Gratuito',
    'Ar Condicionado',
    'Pé na areia',
    'Área Externa/Jardim',
    'Estacionamento',
    'Acessibilidade',
    'Aceita Pets',
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-white/50 ml-1">
            Subcategoria
          </label>
          <div className="relative">
            <LayoutList
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50"
            />
            <input
              type="text"
              value={item.operationalInfo?.subcategory || ''}
              onChange={(e) =>
                onChange({
                  operationalInfo: { ...item.operationalInfo, subcategory: e.target.value },
                })
              }
              placeholder="Ex: Restaurante, Bar, Café..."
              maxLength={100}
              className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-5 py-4 text-white text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
            />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-white/50 ml-1">
            Tipo de Culinária
          </label>
          <div className="relative">
            <Utensils
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50"
            />
            <input
              type="text"
              value={item.operationalInfo?.cuisineType || ''}
              onChange={(e) =>
                onChange({
                  operationalInfo: { ...item.operationalInfo, cuisineType: e.target.value },
                })
              }
              placeholder="Ex: Italiana, Japonesa..."
              maxLength={100}
              className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-5 py-4 text-white text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <label className="text-[10px] font-black uppercase tracking-widest text-indigo-400 block ml-1">
          Tipos de Refeição e Bebidas
        </label>
        <div className="flex flex-wrap gap-2">
          {mealTypeOptions.map((type) => (
            <button
              key={type}
              onClick={() => toggleSelection('mealTypes', type)}
              className={cn(
                'px-4 py-2 rounded-xl border text-[9px] font-black uppercase tracking-[0.1em] transition-all',
                item.operationalInfo?.mealTypes?.includes(type)
                  ? 'bg-indigo-500 text-white border-indigo-500 shadow-lg shadow-indigo-500/20'
                  : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'
              )}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <label className="text-[10px] font-black uppercase tracking-widest text-indigo-400 block ml-1">
          Serviços Adicionais
        </label>
        <div className="flex flex-wrap gap-2">
          {serviceOptions.map((service) => (
            <button
              key={service}
              onClick={() => toggleSelection('additionalServices', service)}
              className={cn(
                'px-4 py-3 rounded-xl border text-[9px] font-black uppercase tracking-[0.1em] transition-all',
                item.operationalInfo?.additionalServices?.includes(service)
                  ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-400'
                  : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'
              )}
            >
              {service}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <label className="text-[10px] font-black uppercase tracking-widest text-indigo-400 block ml-1">
          Comodidades
        </label>
        <div className="grid grid-cols-2 gap-2">
          {amenityOptions.map((amenity) => (
            <button
              key={amenity}
              onClick={() => toggleSelection('amenities', amenity)}
              className={cn(
                'flex items-center gap-3 p-4 rounded-xl border text-left transition-all',
                item.operationalInfo?.amenities?.includes(amenity)
                  ? 'bg-indigo-500/10 border-indigo-500/50 text-indigo-400 shadow-lg shadow-indigo-500/5'
                  : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'
              )}
            >
              <div
                className={cn(
                  'w-2 h-2 rounded-full shrink-0 transition-all',
                  item.operationalInfo?.amenities?.includes(amenity)
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

      <div className="space-y-4">
        <label className="text-[10px] font-black uppercase tracking-widest text-indigo-400 block ml-1">
          Cardápio Digital
        </label>
        <div className="relative">
          <Globe size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" />
          <input
            type="url"
            value={item.operationalInfo?.menuLink || ''}
            onChange={(e) =>
              onChange({ operationalInfo: { ...item.operationalInfo, menuLink: e.target.value } })
            }
            placeholder="Link do Cardápio (Ex: Linktree, Menu.io...)"
            maxLength={300}
            className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-5 py-4 text-white text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
          />
        </div>
      </div>
    </div>
  );
}

export function StayForm({ item, onChange }: { item: any; onChange: (updates: any) => void }) {
  const toggleSelection = (field: string, value: string) => {
    const current = item.operationalInfo?.[field] || [];
    const next = current.includes(value)
      ? current.filter((v: string) => v !== value)
      : [...current, value];
    onChange({ operationalInfo: { ...item.operationalInfo, [field]: next } });
  };

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

  return (
    <div className="space-y-8">
      <div className="space-y-6">
        <label className="text-[10px] font-black uppercase tracking-widest text-indigo-400 block ml-1">
          Café da Manhã
        </label>

        <div className="space-y-3">
          <p className="text-xs font-bold text-white/80 ml-1">Serve café da manhã?</p>
          <div className="flex gap-2">
            {[true, false].map((opt) => (
              <button
                key={opt.toString()}
                onClick={() =>
                  onChange({
                    operationalInfo: {
                      ...item.operationalInfo,
                      breakfast: { ...item.operationalInfo?.breakfast, serves: opt },
                    },
                  })
                }
                className={cn(
                  'flex-1 py-3 px-4 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all',
                  item.operationalInfo?.breakfast?.serves === opt
                    ? 'bg-indigo-500/20 border-indigo-500 text-indigo-400'
                    : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'
                )}
              >
                {opt ? 'Sim' : 'Não'}
              </button>
            ))}
          </div>
        </div>

        {item.operationalInfo?.breakfast?.serves && (
          <div className="space-y-6 pl-4 border-l-2 border-indigo-500/20 py-2">
            <div className="space-y-3">
              <p className="text-xs font-bold text-white/80 ml-1">Incluso na estadia?</p>
              <div className="flex gap-2">
                {[true, false].map((opt) => (
                  <button
                    key={opt.toString()}
                    onClick={() =>
                      onChange({
                        operationalInfo: {
                          ...item.operationalInfo,
                          breakfast: { ...item.operationalInfo?.breakfast, included: opt },
                        },
                      })
                    }
                    className={cn(
                      'flex-1 py-3 px-4 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all',
                      item.operationalInfo?.breakfast?.included === opt
                        ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400'
                        : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'
                    )}
                  >
                    {opt ? 'Sim' : 'Não'}
                  </button>
                ))}
              </div>
            </div>

            {!item.operationalInfo?.breakfast?.included && (
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/50 ml-1">
                  Preço por pessoa/dia
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-indigo-400">
                    R$
                  </span>
                  <input
                    type="text"
                    value={item.operationalInfo?.breakfast?.price || ''}
                    onChange={(e) =>
                      onChange({
                        operationalInfo: {
                          ...item.operationalInfo,
                          breakfast: {
                            ...item.operationalInfo?.breakfast,
                            price: maskCurrency(e.target.value),
                          },
                        },
                      })
                    }
                    placeholder="0,00"
                    maxLength={12}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl pl-10 pr-5 py-4 text-white text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none"
                  />
                </div>
              </div>
            )}

            <div className="space-y-3">
              <p className="text-[10px] font-black uppercase tracking-widest text-white/50 ml-1">
                Tipos oferecidos
              </p>
              <div className="flex flex-wrap gap-2">
                {breakfastOptions.map((type) => (
                  <button
                    key={type}
                    onClick={() => {
                      const current = item.operationalInfo?.breakfast?.types || [];
                      const next = current.includes(type)
                        ? current.filter((t: string) => t !== type)
                        : [...current, type];
                      onChange({
                        operationalInfo: {
                          ...item.operationalInfo,
                          breakfast: { ...item.operationalInfo?.breakfast, types: next },
                        },
                      });
                    }}
                    className={cn(
                      'px-3 py-1.5 rounded-lg border text-[9px] font-bold uppercase tracking-tight transition-all',
                      item.operationalInfo?.breakfast?.types?.includes(type)
                        ? 'bg-indigo-500 text-white border-indigo-500'
                        : 'bg-white/5 border-white/10 text-white/50'
                    )}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <label className="text-[10px] font-black uppercase tracking-widest text-indigo-400 block ml-1">
          Comodidades
        </label>
        <div className="grid grid-cols-2 gap-2">
          {amenityOptions.map((amenity) => (
            <button
              key={amenity}
              onClick={() => toggleSelection('amenities', amenity)}
              className={cn(
                'flex items-center gap-3 p-4 rounded-xl border text-left transition-all',
                item.operationalInfo?.amenities?.includes(amenity)
                  ? 'bg-indigo-500/10 border-indigo-500/50 text-indigo-400 shadow-lg shadow-indigo-500/5'
                  : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'
              )}
            >
              <div
                className={cn(
                  'w-2 h-2 rounded-full shrink-0 transition-all',
                  item.operationalInfo?.amenities?.includes(amenity)
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

      <div className="space-y-6">
        <label className="text-[10px] font-black uppercase tracking-widest text-indigo-400 block ml-1">
          Regras e Horários
        </label>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <span className="text-[9px] text-white/50 uppercase font-black ml-1">Check-in</span>
            <input
              type="text"
              placeholder="Ex: 14h às 22h"
              value={item.operationalInfo?.checkIn || ''}
              onChange={(e) =>
                onChange({ operationalInfo: { ...item.operationalInfo, checkIn: e.target.value } })
              }
              maxLength={100}
              className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-xs focus:ring-1 focus:ring-indigo-500/50 outline-none"
            />
          </div>
          <div className="space-y-2">
            <span className="text-[9px] text-white/50 uppercase font-black ml-1">Check-out</span>
            <input
              type="text"
              placeholder="Ex: Até as 12h"
              value={item.operationalInfo?.checkOut || ''}
              onChange={(e) =>
                onChange({ operationalInfo: { ...item.operationalInfo, checkOut: e.target.value } })
              }
              maxLength={100}
              className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-xs focus:ring-1 focus:ring-indigo-500/50 outline-none"
            />
          </div>
        </div>

        <div className="space-y-4">
          <p className="text-xs font-bold text-white/80 ml-1">Crianças são permitidas?</p>
          <div className="flex gap-2">
            {[true, false].map((opt) => (
              <button
                key={opt.toString()}
                onClick={() =>
                  onChange({ operationalInfo: { ...item.operationalInfo, childrenAllowed: opt } })
                }
                className={cn(
                  'flex-1 py-3 px-4 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all',
                  item.operationalInfo?.childrenAllowed === opt
                    ? 'bg-indigo-500/20 border-indigo-500 text-indigo-400'
                    : 'bg-white/5 border-white/10 text-white/50'
                )}
              >
                {opt ? 'Sim' : 'Não'}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <p className="text-xs font-bold text-white/80 ml-1">Política de Pets</p>
          <div className="grid grid-cols-3 gap-2">
            {['Sim', 'Mediante pedido', 'Não'].map((opt) => (
              <button
                key={opt}
                onClick={() =>
                  onChange({ operationalInfo: { ...item.operationalInfo, petsPolicy: opt } })
                }
                className={cn(
                  'py-3 px-2 rounded-xl border text-[9px] font-black uppercase tracking-widest transition-all text-center',
                  item.operationalInfo?.petsPolicy === opt
                    ? 'bg-indigo-500/20 border-indigo-500 text-indigo-400 shadow-lg shadow-indigo-500/5'
                    : 'bg-white/5 border-white/10 text-white/50'
                )}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function SightForm({ item, onChange }: { item: any; onChange: (updates: any) => void }) {
  const toggleSelection = (field: string, value: string) => {
    const current = item.operationalInfo?.[field] || [];
    const next = current.includes(value)
      ? current.filter((v: string) => v !== value)
      : [...current, value];
    onChange({ operationalInfo: { ...item.operationalInfo, [field]: next } });
  };

  const activityOptions = [
    'Trilhas',
    'Esportes Aquáticos',
    'Pesca',
    'Passeios de Barco',
    'Fotografia',
    'Observação de Pássaros',
    'Ecoturismo',
    'Banho de Mar/Rio',
  ];
  const serviceOptions = ['Estacionamento', 'Guia Turístico', 'Aluguel de Equipamentos'];
  const amenityOptions = [
    'Piscina',
    'Restaurante/Bar',
    'Vestiários',
    'Wi-Fi Gratuito',
    'Área de Acampamento',
    'Estacionamento',
    'Aceita Pets',
    'Acessibilidade',
    'Espaço para Eventos',
  ];

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <label className="text-[10px] font-black uppercase tracking-widest text-indigo-400 block ml-1">
          Acesso à Atração
        </label>
        <div className="grid grid-cols-2 gap-2">
          {['pago', 'gratuito'].map((type) => (
            <button
              key={type}
              onClick={() =>
                onChange({
                  operationalInfo: {
                    ...item.operationalInfo,
                    access: type,
                    price: type === 'gratuito' ? '' : item.operationalInfo?.price,
                  },
                })
              }
              className={cn(
                'px-4 py-3 rounded-xl border text-[10px] font-bold uppercase tracking-wider transition-all',
                item.operationalInfo?.access === type
                  ? 'bg-indigo-500 text-white border-indigo-500 shadow-lg shadow-indigo-500/20'
                  : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'
              )}
            >
              {type}
            </button>
          ))}
        </div>

        {item.operationalInfo?.access === 'pago' && (
          <div className="space-y-2 pt-2 animate-in slide-in-from-top-2 duration-300">
            <label className="text-[9px] font-black uppercase tracking-widest text-white/50 block ml-1">
              Preço por pessoa
            </label>
            <div className="relative group">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400 text-[10px] font-black">
                R$
              </span>
              <input
                type="text"
                placeholder="0,00"
                value={item.operationalInfo?.price || ''}
                onChange={(e) =>
                  onChange({
                    operationalInfo: {
                      ...item.operationalInfo,
                      price: maskCurrency(e.target.value),
                    },
                  })
                }
                maxLength={12}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-10 pr-4 text-white text-xs font-bold focus:ring-1 focus:ring-indigo-500/50 outline-none transition-all placeholder:text-white/50"
              />
            </div>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <label className="text-[10px] font-black uppercase tracking-widest text-indigo-400 block ml-1">
          Atividades Disponíveis
        </label>
        <div className="flex flex-wrap gap-2">
          {activityOptions.map((activity) => (
            <button
              key={activity}
              onClick={() => toggleSelection('activities', activity)}
              className={cn(
                'px-4 py-2 rounded-xl border text-[9px] font-black uppercase tracking-[0.1em] transition-all',
                item.operationalInfo?.activities?.includes(activity)
                  ? 'bg-indigo-500 text-white border-indigo-500 shadow-lg shadow-indigo-500/20'
                  : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'
              )}
            >
              {activity}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <label className="text-[10px] font-black uppercase tracking-widest text-indigo-400 block ml-1">
          Serviços Oferecidos
        </label>
        <div className="flex flex-wrap gap-2">
          {serviceOptions.map((service) => (
            <button
              key={service}
              onClick={() => toggleSelection('services', service)}
              className={cn(
                'px-3 py-2 rounded-lg border text-[9px] font-bold uppercase tracking-tight transition-all',
                item.operationalInfo?.services?.includes(service)
                  ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400'
                  : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'
              )}
            >
              {service}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <label className="text-[10px] font-black uppercase tracking-widest text-indigo-400 block ml-1">
          Estrutura e Comodidades
        </label>
        <div className="grid grid-cols-2 gap-2">
          {amenityOptions.map((amenity) => (
            <button
              key={amenity}
              onClick={() => toggleSelection('amenities', amenity)}
              className={cn(
                'flex items-center gap-3 p-4 rounded-xl border text-left transition-all',
                item.operationalInfo?.amenities?.includes(amenity)
                  ? 'bg-indigo-500/10 border-indigo-500/50 text-indigo-400 shadow-lg shadow-indigo-500/5'
                  : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'
              )}
            >
              <div
                className={cn(
                  'w-2 h-2 rounded-full shrink-0 transition-all',
                  item.operationalInfo?.amenities?.includes(amenity)
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

export function OperatingHoursForm({
  item,
  onChange,
}: {
  item: any;
  onChange: (updates: any) => void;
}) {
  const days = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];

  const handleToggleClosed = (day: string) => {
    const hours = item.operationalInfo?.operatingHours || {};
    const dayData = hours[day] || { open: '08:00', close: '22:00', closed: false };
    onChange({
      operationalInfo: {
        ...item.operationalInfo,
        operatingHours: {
          ...hours,
          [day]: { ...dayData, closed: !dayData.closed },
        },
      },
    });
  };

  const handleTimeChange = (day: string, field: 'open' | 'close', value: string) => {
    const hours = item.operationalInfo?.operatingHours || {};
    const dayData = hours[day] || { open: '08:00', close: '22:00', closed: false };
    onChange({
      operationalInfo: {
        ...item.operationalInfo,
        operatingHours: {
          ...hours,
          [day]: { ...dayData, [field]: value },
        },
      },
    });
  };

  return (
    <div className="space-y-6 pt-4">
      <label className="text-[10px] font-black uppercase tracking-widest text-indigo-400 block ml-1 flex items-center gap-2">
        <Clock size={14} /> Horários de Funcionamento
      </label>
      <div className="space-y-3">
        {days.map((day) => {
          const dayData = item.operationalInfo?.operatingHours?.[day] || {
            open: '08:00',
            close: '22:00',
            closed: false,
          };
          return (
            <div key={day} className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-white uppercase tracking-widest">
                  {day}
                </span>
                <button
                  onClick={() => handleToggleClosed(day)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all',
                    dayData.closed
                      ? 'bg-red-500/20 text-red-400 border border-red-500/20'
                      : 'bg-white/10 text-white/50 border border-white/10'
                  )}
                >
                  {dayData.closed ? 'Fechado' : 'Aberto'}
                </button>
              </div>

              {!dayData.closed && (
                <div className="flex items-center gap-4 w-[90%]">
                  <div className="flex-1 space-y-1">
                    <span className="text-[8px] text-white/50 uppercase font-black ml-1">
                      Abertura
                    </span>
                    <input
                      type="time"
                      value={dayData.open}
                      onChange={(e) => handleTimeChange(day, 'open', e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-[10px] font-bold focus:ring-1 focus:ring-indigo-500/50 outline-none"
                    />
                  </div>
                  <div className="flex-1 space-y-1">
                    <span className="text-[8px] text-white/50 uppercase font-black ml-1">
                      Fechamento
                    </span>
                    <input
                      type="time"
                      value={dayData.close}
                      onChange={(e) => handleTimeChange(day, 'close', e.target.value)}
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
  );
}

export function LanguagesForm({ item, onChange }: { item: any; onChange: (updates: any) => void }) {
  const languagesOptions = ['Português', 'Inglês', 'Espanhol', 'Francês', 'Alemão', 'Italiano'];

  const toggleLanguage = (lang: string) => {
    const current = item.operationalInfo?.languages || [];
    const next = current.includes(lang)
      ? current.filter((l: string) => l !== lang)
      : [...current, lang];
    onChange({ operationalInfo: { ...item.operationalInfo, languages: next } });
  };

  return (
    <div className="space-y-4 pt-4 border-t border-white/5">
      <label className="text-[10px] font-black uppercase tracking-widest text-indigo-400 block ml-1 flex items-center gap-2">
        <Languages size={14} /> Idiomas Atendidos
      </label>
      <div className="grid grid-cols-2 gap-2">
        {languagesOptions.map((lang) => (
          <button
            key={lang}
            onClick={() => toggleLanguage(lang)}
            className={cn(
              'px-4 py-3 rounded-xl border text-[10px] font-bold uppercase tracking-wider transition-all',
              item.operationalInfo?.languages?.includes(lang)
                ? 'bg-indigo-500 text-white border-indigo-500'
                : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'
            )}
          >
            {lang}
          </button>
        ))}
      </div>
    </div>
  );
}
