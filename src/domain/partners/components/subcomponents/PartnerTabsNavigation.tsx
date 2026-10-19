import React from 'react';
import { Layers, Calendar, BarChart3, Clock } from 'lucide-react';
import { cn } from '../../../../shared/utils/cn';

interface PartnerTabsNavigationProps {
  activeTab: 'items' | 'events' | 'reports';
  setActiveTab: (tab: 'items' | 'events' | 'reports') => void;
  isVerified: boolean;
  hasItems?: boolean;
  hasEvents?: boolean;
}

export function PartnerTabsNavigation({
  activeTab,
  setActiveTab,
  isVerified,
}: PartnerTabsNavigationProps) {
  return (
    <div className="grid grid-cols-3 gap-3">
      <button
        type="button"
        onClick={() => setActiveTab('items')}
        className={cn(
          'py-4 rounded-2xl text-[11px] font-semibold tracking-wide transition-all flex items-center justify-center gap-2 cursor-pointer',
          activeTab === 'items'
            ? 'bg-teal-500 text-black shadow-lg shadow-teal-500/20'
            : 'glassmorphism text-white/50 hover:bg-white/5 bg-white/3'
        )}
      >
        <Layers size={14} /> Meus Itens
      </button>

      {/* Aba de Agenda de Eventos */}
      <button
        type="button"
        onClick={() => setActiveTab('events')}
        className={cn(
          'py-4 rounded-2xl text-[11px] font-semibold tracking-wide transition-all flex items-center justify-center gap-2 cursor-pointer',
          activeTab === 'events'
            ? 'bg-[#00D4FF] text-black shadow-lg shadow-[#00D4FF]/20'
            : 'glassmorphism text-white/50 hover:bg-white/5 bg-white/3'
        )}
      >
        <Calendar size={14} /> Meus Eventos
      </button>

      {/* Aba de Relatórios de Acessos de Usuários com Cadeado Visual Reativo */}
      <button
        type="button"
        onClick={() => setActiveTab('reports')}
        className={cn(
          'py-4 rounded-2xl text-[11px] font-semibold tracking-wide transition-all flex items-center justify-center gap-2 relative overflow-hidden cursor-pointer',
          activeTab === 'reports'
            ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
            : 'glassmorphism text-white/50 hover:bg-white/5 bg-white/3'
        )}
      >
        {/* Caso o parceiro não seja verificado, colocamos uma sobreposição visual protetora que permite cliques com pointer-events-none */}
        {!isVerified && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-10 pointer-events-none">
            <Clock size={12} className="text-white/60 animate-pulse" />
          </div>
        )}
        <BarChart3 size={14} /> Relatórios
      </button>

      <style>{`
        .glassmorphism { background: rgba(255, 255, 255, 0.03); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.08); }
      `}</style>
    </div>
  );
}
