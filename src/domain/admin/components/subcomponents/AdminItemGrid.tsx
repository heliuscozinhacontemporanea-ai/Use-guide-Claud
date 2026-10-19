import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, RefreshCw, Star, MapPin, Edit2, Trash2, Layers } from 'lucide-react';
import { cn } from '../../../../shared/utils/cn';
import { GuideItem } from '../../../guide';

interface CategoryItem {
  id: string;
  label: string;
  color: string;
}

interface AdminItemGridProps {
  activeTab: 'items' | 'events';
  categories: CategoryItem[];
  filter: string;
  setFilter: (id: string) => void;
  filteredItems: GuideItem[];
  dataLoading: boolean;
  onInitNew: () => void;
  /** Dicas usam o editor do admin; o botão principal abre o editor de cadastro. */
  onInitNewTip?: () => void;
  onEdit: (item: GuideItem) => void;
  onDelete: (coll: string, id: string) => Promise<void>;
}

export function AdminItemGrid({
  activeTab,
  categories,
  filter,
  setFilter,
  filteredItems,
  dataLoading,
  onInitNew,
  onInitNewTip,
  onEdit,
  onDelete,
}: AdminItemGridProps) {
  return (
    <div className="space-y-6" id="items-grid-viewport">
      <div
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-2"
        id="grid-header"
      >
        <h2 className="text-2xl font-display font-extrabold tracking-tight">
          {activeTab === 'items' ? 'Itens do Guia' : 'Agenda Cultural'}
        </h2>

        <div className="flex items-center gap-3">
          {onInitNewTip && (
            <button
              type="button"
              onClick={onInitNewTip}
              className="min-h-[44px] flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all active:scale-95 bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-teal-400/50"
              id="btn-add-new-tip"
            >
              <Plus size={16} strokeWidth={3} aria-hidden="true" />
              Nova dica
            </button>
          )}
          <button
            type="button"
            onClick={onInitNew}
            className={cn(
              'min-h-[44px] flex-1 sm:flex-none flex items-center justify-center gap-3 px-6 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all active:scale-95 group text-black focus-visible:ring-2 focus-visible:ring-teal-400/50',
              activeTab === 'events'
                ? 'bg-[#00D4FF] hover:bg-[#00D4FF]/90 shadow-xl shadow-[#00D4FF]/20'
                : 'bg-teal-500 hover:bg-teal-400 shadow-xl shadow-teal-500/20'
            )}
            id="btn-add-new-record"
          >
            <Plus
              size={18}
              strokeWidth={3}
              className="group-hover:rotate-90 transition-transform"
            />
            Novo Registro
          </button>
        </div>
      </div>

      {activeTab === 'items' && (
        <div
          className="flex gap-2.5 pb-4 overflow-x-auto no-scrollbar -mx-4 px-4"
          id="categories-filter-bar"
        >
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setFilter(cat.id)}
              className={cn(
                'min-h-[44px] whitespace-nowrap px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border shrink-0 focus-visible:ring-2 focus-visible:ring-teal-400/50',
                filter === cat.id
                  ? 'bg-white text-black border-white shadow-xl scale-105'
                  : 'bg-white/[0.03] text-white/50 border-white/10 hover:bg-white/10'
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>
      )}

      {dataLoading ? (
        <div className="py-24 text-center">
          <div className="inline-block animate-spin mb-6 text-teal-500">
            <RefreshCw size={32} />
          </div>
          <div className="animate-pulse text-white/50 font-black uppercase tracking-[0.4em] text-[10px] italic">
            Indexando Banco de Dados...
          </div>
        </div>
      ) : (
        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4"
          id="cards-rendering-area"
        >
          <AnimatePresence mode="popLayout">
            {filteredItems.map((item, idx) => {
              const ratingAverage =
                typeof item.rating === 'number' &&
                item.rating > 0 &&
                typeof item.reviewCount === 'number' &&
                item.reviewCount > 0
                  ? item.rating
                  : null;

              return (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.4, delay: idx * 0.03, ease: [0.23, 1, 0.32, 1] }}
                  role="button"
                  tabIndex={0}
                  onClick={() => onEdit(item)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      onEdit(item);
                    }
                  }}
                  className="group relative cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400/50 rounded-3xl"
                  id={`grid-card-${item.id}`}
                >
                  <div className="absolute inset-0 glassmorphism rounded-3xl group-hover:bg-white/[0.08] group-hover:border-white/30 group-hover:scale-[1.03] transition-all duration-500 shadow-2xl group-hover:shadow-teal-500/10" />

                  <div className="relative p-4 flex items-center gap-4">
                    <div className="relative w-22 h-22 shrink-0 rounded-2xl overflow-hidden border border-white/10 shadow-2xl group-hover:border-white/30 transition-all duration-500">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-125 transition-transform duration-1000 ease-out"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>

                    <div className="flex-1 min-w-0 pr-2">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={cn(
                            'px-2 py-0.5 rounded-lg text-[8px] font-extrabold uppercase tracking-widest border border-white/5',
                            categories.find((c) => c.id === (item.category || 'event'))?.color ||
                              'bg-white/5 text-white/50'
                          )}
                        >
                          {categories.find((c) => c.id === (item.category || 'event'))?.label ||
                            'Evento'}
                        </span>
                        {ratingAverage !== null && (
                          <div className="flex items-center gap-1 text-amber-500 text-[8px] font-black">
                            <Star size={8} fill="currentColor" /> {ratingAverage.toFixed(1)}
                          </div>
                        )}
                      </div>

                      <h4 className="font-display font-bold text-white text-sm line-clamp-1 group-hover:text-teal-400 transition-colors uppercase tracking-tight">
                        {item.name}
                      </h4>

                      <div className="mt-2 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 text-white/50">
                          <MapPin size={10} className="text-teal-500/50" strokeWidth={3} />
                          <span className="text-[8px] font-black uppercase tracking-[0.2em]">
                            {item.location}
                          </span>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            aria-label={`Editar ${item.name}`}
                            onClick={(event) => {
                              event.stopPropagation();
                              onEdit(item);
                            }}
                            className="w-11 h-11 flex items-center justify-center rounded-xl bg-teal-500/10 text-teal-400 hover:bg-teal-500 hover:text-black transition-all focus-visible:ring-2 focus-visible:ring-teal-400/50"
                          >
                            <Edit2 size={14} strokeWidth={2.5} />
                          </button>
                          <button
                            type="button"
                            aria-label={`Excluir ${item.name}`}
                            onClick={(event) => {
                              event.stopPropagation();
                              onDelete(activeTab === 'items' ? 'items' : 'events', item.id);
                            }}
                            className="w-11 h-11 flex items-center justify-center rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all shadow-lg shadow-rose-500/10 focus-visible:ring-2 focus-visible:ring-teal-400/50"
                          >
                            <Trash2 size={14} strokeWidth={2.5} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {filteredItems.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="col-span-full py-32 rounded-[3.5rem] border-2 border-dashed border-white/5 bg-white/[0.01] flex flex-col items-center justify-center text-center px-10"
              id="empty-items-grid"
            >
              <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center text-white/50 mb-6">
                <Layers size={40} strokeWidth={1} />
              </div>
              <p className="text-xs text-white/50 font-black uppercase tracking-[0.4em] italic mb-2">
                Nenhum registro encontrado
              </p>
              <p className="text-[10px] text-white/50 font-medium">
                Tente alterar o filtro ou adicione um novo conteúdo.
              </p>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}
