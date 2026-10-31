import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { type ReactNode, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { formatBusinessDateTime } from '../../../shared/utils/businessDateTime';
import { type EventOccurrence, useEventOccurrences } from '../../events';
import { usePartnerEventSales } from '../hooks/usePartnerEventSales';
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
import { SessionActions } from './manager/SessionActions';

interface PartnerEventTicketingManagerProps {
  eventListingId: string;
  asAdmin?: boolean;
  /** Montado pela composição com a conta do CNPJ do estabelecimento do evento (D14). */
  accountNotice?: ReactNode;
  /** Recebimentos, montado pela composição; sem ele a aba Financeiro não aparece. */
  financePanel?: ReactNode;
}

export function PartnerEventTicketingManager({
  eventListingId,
  asAdmin = false,
  accountNotice,
  financePanel,
}: PartnerEventTicketingManagerProps) {
  const {
    occurrences,
    loading: occLoading,
    reload: reloadOccurrences,
  } = useEventOccurrences(eventListingId);
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

  const [feedback, setFeedback] = useState<ManagerFeedback | null>(null);

  const lotForm = useTicketLotForm({ selectedOccurrenceId, reloadLots, setFeedback });

  const { i18n } = useTranslation();
  const selectedOccurrence = occurrences.find((occ) => occ.id === selectedOccurrenceId);
  const paidOrders = orders.filter(
    (order) =>
      order.occurrenceId === selectedOccurrenceId &&
      (order.status === 'paid' || order.status === 'partially_refunded')
  ).length;

  return (
    <div className="space-y-4">
      {accountNotice}

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
                  : 'bg-surface border border-line text-ink/80 hover:bg-accent-soft'
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

      <SessionActions
        eventListingId={eventListingId}
        occurrence={selectedOccurrence}
        paidOrders={paidOrders}
        onChanged={(message) => {
          setFeedback({ type: 'success', message });
          void reloadOccurrences();
          void reloadSales();
        }}
      />

      <ManagerTabBar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        showFinance={financePanel !== undefined}
        counts={{
          lots: ticketTypes.length,
          attendees: orders.length,
          checkIns: checkIns.length,
          refunds: refunds.length,
        }}
      />

      {feedback && (
        <div
          role={feedback.type === 'error' ? 'alert' : 'status'}
          className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
            feedback.type === 'success'
              ? 'bg-success-soft border-success-line text-success'
              : 'bg-danger-soft border-danger-line text-danger'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 size={15} className="shrink-0" aria-hidden="true" />
          ) : (
            <AlertCircle size={15} className="shrink-0" aria-hidden="true" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {occLoading || lotsLoading || salesLoading ? (
        <div className="p-6 flex items-center justify-center gap-2 text-xs text-ink/70">
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
          occurrenceId={selectedOccurrenceId}
          sessionLabel={
            selectedOccurrence
              ? formatBusinessDateTime(selectedOccurrence.startsAt, i18n.language)
              : ''
          }
          checkIns={checkIns}
          performCheckIn={performCheckIn}
          reloadSales={reloadSales}
        />
      ) : activeTab === 'refunds' ? (
        <RefundsTab refunds={refunds} />
      ) : (
        financePanel
      )}
    </div>
  );
}
