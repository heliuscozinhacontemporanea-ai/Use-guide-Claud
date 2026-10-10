import React from 'react';
import { Plus, MapPin, Edit2, RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';
import type { PartnerContentRecord } from '../../types/partnerContent';
import { cn } from '../../../../shared/utils/cn';

interface PartnerEventsTableProps {
  eventsList: PartnerContentRecord[];
  loading: boolean;
  onEditEvent: (item: PartnerContentRecord) => void;
  onToggleActive: (eventId: string, currentActiveState: boolean) => Promise<void>;
  onCreateNew: () => void;
}

export function PartnerEventsTable({
  eventsList,
  loading,
  onEditEvent,
  onToggleActive,
  onCreateNew,
}: PartnerEventsTableProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-display font-bold tracking-tight text-white/80">
          Minha Agenda
        </h2>
        <button
          type="button"
          onClick={onCreateNew}
          className="min-h-[44px] px-6 py-4 rounded-2xl text-[11px] font-semibold tracking-wide transition-all flex items-center gap-2 text-black bg-[#00D4FF] shadow-[#00D4FF]/20 shadow-lg cursor-pointer hover:bg-[#3be0ff] focus-visible:ring-2 focus-visible:ring-teal-400/50"
        >
          <Plus size={16} strokeWidth={3} /> Criar Novo
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          <div className="col-span-full py-20 text-center animate-pulse">
            <RefreshCw className="animate-spin inline-block mr-2 text-white/50" />
            <span className="text-white/50 text-xs font-mono">
              Sincronizando agenda de eventos...
            </span>
          </div>
        ) : (
          eventsList.map((item) => (
            <motion.div
              key={item.id}
              role="button"
              tabIndex={0}
              onClick={() => onEditEvent(item)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  onEditEvent(item);
                }
              }}
              whileHover={{ scale: 1.01, backgroundColor: 'rgba(255, 255, 255, 0.08)' }}
              whileTap={{ scale: 0.95 }}
              className="group relative bg-white/5 border border-white/10 glassmorphism-vibrant rounded-3xl p-4 pr-16 flex items-center gap-4 cursor-pointer active:scale-95 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400/50"
            >
              <div className="w-20 h-20 rounded-2xl overflow-hidden border border-white/10 flex-shrink-0">
                <img
                  src={item.image}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  alt=""
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-white truncate">{item.name}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <MapPin size={10} className="text-white/50" />
                  <span className="text-[10px] text-white/50 font-semibold tracking-wide uppercase">
                    {item.location === 'jeri'
                      ? 'Jericoacoara'
                      : item.location === 'prea'
                        ? 'Praia do Preá'
                        : item.location === 'barrinha'
                          ? 'Barrinha de Baixo'
                          : item.location}
                  </span>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  {item.isActive !== false ? (
                    <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500 text-[9px] font-semibold">
                      Ativo
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-md bg-white/5 text-white/50 text-[9px] font-semibold">
                      Inativo
                    </span>
                  )}
                </div>
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={item.isActive !== false}
                aria-label={
                  item.isActive !== false
                    ? `Desativar evento ${item.name}`
                    : `Ativar evento ${item.name}`
                }
                onClick={async (event) => {
                  event.stopPropagation();
                  if (item.id) {
                    await onToggleActive(item.id, item.isActive !== false);
                  }
                }}
                className="absolute top-2 right-2 z-20 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl focus-visible:ring-2 focus-visible:ring-teal-400/50"
              >
                <span
                  className={cn(
                    'w-[40px] h-[22px] rounded-full p-[2px] transition-colors duration-300 ease-in-out flex items-center',
                    item.isActive !== false ? 'bg-emerald-500' : 'bg-white/5 border border-white/10'
                  )}
                >
                  <span
                    className={cn(
                      'w-[18px] h-[18px] rounded-full bg-white shadow-md transform transition-all duration-300',
                      item.isActive !== false ? 'translate-x-[18px]' : 'translate-x-0'
                    )}
                  />
                </span>
              </button>

              <div className="absolute bottom-4 right-4 p-2 rounded-xl bg-white/5 text-white/50 group-hover:text-teal-400 group-hover:bg-teal-400/10 transition-all">
                <Edit2 size={13} />
              </div>
            </motion.div>
          ))
        )}

        {eventsList.length === 0 && !loading && (
          <div className="col-span-full py-10 rounded-[2rem] border-2 border-dashed border-white/5 text-center">
            <p className="text-[10px] text-white/50 font-black uppercase tracking-widest">
              Nenhum evento agendado
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
