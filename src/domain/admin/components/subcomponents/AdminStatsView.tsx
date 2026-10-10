import React from 'react';
import { motion } from 'motion/react';
import { Database, Layers, Calendar, Star, MapPin, RefreshCw } from 'lucide-react';
import { cn } from '../../../../shared/utils/cn';
import { REGIONS } from '../../../search';
import { AdminStats } from '../../types/admin';

interface AdminStatsViewProps {
  stats: AdminStats | null;
  isLoading: boolean;
  categories: Array<{ id: string; label: string; color: string }>;
}

export function AdminStatsView({ stats, isLoading, categories }: AdminStatsViewProps) {
  // Exibe um esqueleto de carregamento polido caso as métricas estejam sendo calculadas em tempo real
  if (isLoading) {
    return (
      <div className="py-24 text-center">
        <div className="inline-block animate-spin mb-6 text-amber-500">
          <RefreshCw size={32} />
        </div>
        <div className="animate-pulse text-white/50 font-black uppercase tracking-[0.4em] text-[10px] italic">
          Calculando métricas...
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-8">
      {/* Cards de Resumo Geral */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4" id="stats-summary-grid">
        {[
          { label: 'Usuários', value: stats.totalUsers, icon: Database, color: 'text-blue-400' },
          { label: 'Itens Guia', value: stats.totalItems, icon: Layers, color: 'text-teal-400' },
          { label: 'Eventos', value: stats.totalEvents, icon: Calendar, color: 'text-[#00D4FF]' },
          { label: 'Avaliações', value: stats.totalReviews, icon: Star, color: 'text-amber-400' },
        ].map((s, idx) => (
          <div
            key={idx}
            className="glassmorphism rounded-3xl p-6 flex flex-col items-center text-center group hover:scale-[1.05] transition-transform duration-500"
            id={`stats-card-${idx}`}
          >
            <div
              className={cn(
                'p-4 rounded-2xl bg-white/5 mb-4 group-hover:bg-white/10 transition-colors',
                s.color
              )}
            >
              <s.icon size={22} className="drop-shadow-lg" />
            </div>
            <div className="text-2xl font-display font-black text-white">{s.value}</div>
            <div className="text-[8px] font-black uppercase tracking-widest text-white/50 mt-1">
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Gráficos / Barras de Distribuição das Categorias e da Geografia */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="distribution-charts-grid">
        <div className="glassmorphism rounded-[2.5rem] p-8">
          <h3 className="text-xs font-black uppercase tracking-widest text-white/50 mb-6 flex items-center gap-2">
            <Layers size={14} className="text-teal-500" /> Distribuição por Categoria
          </h3>
          <div className="space-y-5">
            {Object.entries(stats.itemsByCategory).map(([cat, count]: [string, number]) => {
              const percentage = stats.totalItems > 0 ? (count / stats.totalItems) * 100 : 0;
              const categoryLabel = categories.find((c) => c.id === cat)?.label || cat;
              return (
                <div key={cat} className="space-y-2">
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-tight">
                    <span className="text-white/50">{categoryLabel}</span>
                    <span className="text-white">
                      {count} ({percentage.toFixed(0)}%)
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      className="h-full bg-teal-500"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="glassmorphism rounded-[2.5rem] p-8">
          <h3 className="text-xs font-black uppercase tracking-widest text-white/50 mb-6 flex items-center gap-2">
            <MapPin size={14} className="text-sky-500" /> Distribuição Geográfica
          </h3>
          <div className="space-y-5">
            {REGIONS.map((loc) => {
              const count = stats.itemsByLocation[loc] || 0;
              const percentage = stats.totalItems > 0 ? (count / stats.totalItems) * 100 : 0;
              return (
                <div key={loc} className="space-y-2">
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-tight">
                    <span className="text-white/50">{loc}</span>
                    <span className="text-white">
                      {count} ({percentage.toFixed(0)}%)
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      className="h-full bg-sky-500"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Box de Média de Satisfação de Usuários */}
      <div className="bg-gradient-to-br from-amber-500/10 to-transparent border border-amber-500/20 glassmorphism rounded-[2.5rem] p-8 flex flex-col md:flex-row items-center gap-8">
        <div className="w-24 h-24 rounded-full border-4 border-amber-500/30 flex items-center justify-center text-3xl font-display font-black text-amber-500 shadow-2xl shadow-amber-500/20">
          {stats.avgRating.toFixed(1)}
        </div>
        <div>
          <h4 className="text-lg font-display font-extrabold text-white mb-2">
            Média de Satisfação
          </h4>
          <p className="text-sm text-white/50 leading-relaxed max-w-sm">
            Baseado em {stats.totalReviews} avaliações enviadas pelos usuários. Mantenha os
            estabelecimentos atualizados para melhorar a experiência.
          </p>
        </div>
      </div>
    </div>
  );
}
