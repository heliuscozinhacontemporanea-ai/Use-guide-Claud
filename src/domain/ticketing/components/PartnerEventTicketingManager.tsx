import { AlertCircle, CheckCircle2, Loader2, Wallet } from 'lucide-react';
import { useEffect, useState } from 'react';
import { type EventOccurrence, useEventOccurrences } from '../../events';
import { PartnerStripeConnectPortal } from '../../payment';
import { GlassCard } from '../../../ui/components/GlassCard';
import { useOfflineCheckIn } from '../hooks/useOfflineCheckIn';
import { usePartnerEventSales, usePartnerMerchantAccount } from '../hooks/usePartnerEventSales';
import { useTicketLotForm } from '../hooks/useTicketLotForm';
import { useManagementTicketTypes } from '../hooks/useTicketTypes';
import { AttendeesTab } from './manager/AttendeesTab';
import { CheckInTab } from './manager/CheckInTab';
import { LotsTab } from './manager/LotsTab';
import { ManagerTabBar } from './manager/ManagerTabBar';
import type { ManagerFeedback } from './manager/managerFeedback';
import type { ManagerTab } from './manager/managerTabs';
import { RefundsTab } from './manager/RefundsTab';
import { SalesTab } from './manager/SalesTab';

interface PartnerEventTicketingManagerProps {
  eventListingId: string;
  asAdmin?: boolean;
}

export function PartnerEventTicketingManager({
  eventListingId,
  asAdmin = false,
}: PartnerEventTicketingManagerProps) {
  const { occurrences, loading: occLoading } = useEventOccurrences(eventListingId);
  const [selectedOccurrenceId, setSelectedOccurrenceId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<ManagerTab>('lots');

  useEffect(() => {
    if (!selectedOccurrenceId && occurrences.length > 0 && occurrences[0]) {
      setSelectedOccurrenceId(occurrences[0].id);
    }
  }, [occurrences, selectedOccurrenceId]);

  const {
    ticketTypes,
    loading: lotsLoading,
    reload: reloadLots,
  } = useManagementTicketTypes(selectedOccurrenceId || undefined);

  const {
    analytics,
    orders,
    checkIns,
    refunds,
    loading: salesLoading,
    reload: reloadSales,
    performCheckIn,
  } = usePartnerEventSales(eventListingId, selectedOccurrenceId || undefined, asAdmin);

  const { status: merchantStatus } = usePartnerMerchantAccount(!asAdmin);

  const [feedback, setFeedback] = useState<ManagerFeedback | null>(null);

  const lotForm = useTicketLotForm({ selectedOccurrenceId, reloadLots, setFeedback });
  const checkIn = useOfflineCheckIn({
    eventListingId,
    selectedOccurrenceId,
    performCheckIn,
    reloadSales,
    setFeedback,
  });

  const isStripeReady = merchantStatus?.readyForSales === true;

  return (
    <div className="space-y-4">
      {!asAdmin && merchantStatus && !isStripeReady && (
        <GlassCard className="p-4 border-amber-500/30 bg-amber-950/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="text-xs font-bold text-amber-300">
              Vendas online indisponíveis. Conclua a configuração financeira.
            </div>
            <p className="text-xs text-white/70">
              Para vender ingressos pagos com repasse automático via Stripe Connect, finalize o
              onboarding na aba Financeiro. Eventos gratuitos funcionam imediatamente.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setActiveTab('finance')}
            className="min-h-11 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shrink-0 cursor-pointer"
          >
            <Wallet size={14} />
            <span>Abrir Financeiro</span>
          </button>
        </GlassCard>
      )}

      {occurrences.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {occurrences.map((occ: EventOccurrence) => (
            <button
              key={occ.id}
              type="button"
              onClick={() => setSelectedOccurrenceId(occ.id)}
              className={`min-h-11 px-3.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                selectedOccurrenceId === occ.id
                  ? 'bg-teal-400 text-slate-950'
                  : 'bg-white/5 text-white/70 hover:bg-white/10'
              }`}
            >
              {new Date(occ.startsAt).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
                timeZone: 'America/Fortaleza',
              })}{' '}
              • Cap: {occ.capacity}
            </button>
          ))}
        </div>
      )}

      <ManagerTabBar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        asAdmin={asAdmin}
        counts={{
          lots: ticketTypes.length,
          attendees: orders.length,
          checkIns: checkIns.length,
          refunds: refunds.length,
        }}
      />

      {feedback && (
        <div
          className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
            feedback.type === 'success'
              ? 'bg-teal-500/10 border-teal-500/30 text-teal-200'
              : 'bg-red-500/10 border-red-500/30 text-red-200'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 size={15} className="shrink-0 text-teal-400" />
          ) : (
            <AlertCircle size={15} className="shrink-0 text-red-400" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {occLoading || lotsLoading || salesLoading ? (
        <div className="p-6 flex items-center justify-center gap-2 text-xs text-white/60">
          <Loader2 size={16} className="animate-spin text-teal-400" />
          <span>Carregando dados operacionais...</span>
        </div>
      ) : activeTab === 'lots' ? (
        <LotsTab
          form={lotForm}
          ticketTypes={ticketTypes}
          selectedOccurrenceId={selectedOccurrenceId}
        />
      ) : activeTab === 'sales' ? (
        <SalesTab analytics={analytics} />
      ) : activeTab === 'attendees' ? (
        <AttendeesTab orders={orders} />
      ) : activeTab === 'checkin' ? (
        <CheckInTab
          checkIn={checkIn}
          checkIns={checkIns}
          selectedOccurrenceId={selectedOccurrenceId}
        />
      ) : activeTab === 'refunds' ? (
        <RefundsTab refunds={refunds} />
      ) : (
        <PartnerStripeConnectPortal />
      )}
    </div>
  );
}
