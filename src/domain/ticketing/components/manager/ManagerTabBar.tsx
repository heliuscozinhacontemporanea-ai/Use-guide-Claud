import { BarChart3, QrCode, RefreshCw, Ticket as TicketIcon, Users, Wallet } from 'lucide-react';
import type { ManagerTab } from './managerTabs';

export function ManagerTabBar({
  activeTab,
  setActiveTab,
  showFinance,
  counts,
}: {
  activeTab: ManagerTab;
  setActiveTab: (tab: ManagerTab) => void;
  showFinance: boolean;
  counts: { lots: number; attendees: number; checkIns: number; refunds: number };
}) {
  return (
    <div className="flex items-center gap-2 border-b border-line pb-2 overflow-x-auto">
      <button
        type="button"
        onClick={() => setActiveTab('lots')}
        className={`min-h-11 px-3.5 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
          activeTab === 'lots' ? 'bg-accent-soft text-accent' : 'text-ink/70 hover:text-ink'
        }`}
      >
        <TicketIcon size={14} />
        <span>Ingressos ({counts.lots})</span>
      </button>
      <button
        type="button"
        onClick={() => setActiveTab('sales')}
        className={`min-h-11 px-3.5 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
          activeTab === 'sales' ? 'bg-accent-soft text-accent' : 'text-ink/70 hover:text-ink'
        }`}
      >
        <BarChart3 size={14} />
        <span>Vendas</span>
      </button>
      <button
        type="button"
        onClick={() => setActiveTab('attendees')}
        className={`min-h-11 px-3.5 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
          activeTab === 'attendees' ? 'bg-accent-soft text-accent' : 'text-ink/70 hover:text-ink'
        }`}
      >
        <Users size={14} />
        <span>Participantes ({counts.attendees})</span>
      </button>
      <button
        type="button"
        onClick={() => setActiveTab('checkin')}
        className={`min-h-11 px-3.5 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
          activeTab === 'checkin' ? 'bg-accent-soft text-accent' : 'text-ink/70 hover:text-ink'
        }`}
      >
        <QrCode size={14} />
        <span>Check-in ({counts.checkIns})</span>
      </button>
      <button
        type="button"
        onClick={() => setActiveTab('refunds')}
        className={`min-h-11 px-3.5 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
          activeTab === 'refunds' ? 'bg-accent-soft text-accent' : 'text-ink/70 hover:text-ink'
        }`}
      >
        <RefreshCw size={14} />
        <span>Reembolsos ({counts.refunds})</span>
      </button>
      {showFinance && (
        <button
          type="button"
          onClick={() => setActiveTab('finance')}
          className={`min-h-11 px-3.5 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'finance' ? 'bg-accent-soft text-accent' : 'text-ink/70 hover:text-ink'
          }`}
        >
          <Wallet size={14} />
          <span>Financeiro</span>
        </button>
      )}
    </div>
  );
}
