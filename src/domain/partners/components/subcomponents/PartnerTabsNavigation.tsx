import { Layers, Calendar, BarChart3 } from 'lucide-react';
import { cn } from '../../../../shared/utils/cn';

interface PartnerTabsNavigationProps {
  activeTab: 'items' | 'events' | 'reports';
  setActiveTab: (tab: 'items' | 'events' | 'reports') => void;
}

export function PartnerTabsNavigation({ activeTab, setActiveTab }: PartnerTabsNavigationProps) {
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
        <BarChart3 size={14} /> Relatórios
      </button>

      <style>{`
        .glassmorphism { background: rgba(255, 255, 255, 0.03); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.08); }
      `}</style>
    </div>
  );
}
