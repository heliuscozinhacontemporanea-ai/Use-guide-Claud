import { BarChart3, QrCode, RefreshCw, Ticket as TicketIcon, Users, Wallet } from 'lucide-react';
import type { ManagerTab } from './managerTabs';

export function ManagerTabBar({
  activeTab,
  setActiveTab,
  asAdmin,
  counts,
}: {
  activeTab: ManagerTab;
  setActiveTab: (tab: ManagerTab) => void;
  asAdmin: boolean;
  counts: { lots: number; attendees: number; checkIns: number; refunds: number };
}) {
  return (
    <div className="flex items-center gap-2 border-b border-white/10 pb-2 overflow-x-auto">
      <button
        type="button"
        onClick={() => setActiveTab('lots')}
        className={`min-h-11 px-3.5 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
          activeTab === 'lots' ? 'bg-white/15 text-teal-300' : 'text-white/60 hover:text-white'
        }`}
      >
        <TicketIcon size={14} />
        <span>Ingressos ({counts.lots})</span>
      </button>
      <button
        type="button"
        onClick={() => setActiveTab('sales')}
        className={`min-h-11 px-3.5 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
          activeTab === 'sales' ? 'bg-white/15 text-teal-300' : 'text-white/60 hover:text-white'
        }`}
      >
        <BarChart3 size={14} />
        <span>Vendas</span>
      </button>
      <button
        type="button"
        onClick={() => setActiveTab('attendees')}
        className={`min-h-11 px-3.5 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
          activeTab === 'attendees' ? 'bg-white/15 text-teal-300' : 'text-white/60 hover:text-white'
        }`}
      >
        <Users size={14} />
        <span>Participantes ({counts.attendees})</span>
      </button>
      <button
        type="button"
        onClick={() => setActiveTab('checkin')}
        className={`min-h-11 px-3.5 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
          activeTab === 'checkin' ? 'bg-white/15 text-teal-300' : 'text-white/60 hover:text-white'
        }`}
      >
        <QrCode size={14} />
        <span>Check-in ({counts.checkIns})</span>
      </button>
      <button
        type="button"
        onClick={() => setActiveTab('refunds')}
        className={`min-h-11 px-3.5 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
          activeTab === 'refunds' ? 'bg-white/15 text-teal-300' : 'text-white/60 hover:text-white'
        }`}
      >
        <RefreshCw size={14} />
        <span>Reembolsos ({counts.refunds})</span>
      </button>
      {!asAdmin && (
        <button
          type="button"
          onClick={() => setActiveTab('finance')}
          className={`min-h-11 px-3.5 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'finance' ? 'bg-white/15 text-teal-300' : 'text-white/60 hover:text-white'
          }`}
        >
          <Wallet size={14} />
          <span>Financeiro</span>
        </button>
      )}
    </div>
  );
}
