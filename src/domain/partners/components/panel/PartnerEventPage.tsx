import { type ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { formatBusinessDate } from '../../../../shared/utils/businessDateTime';
import { formatMoneyMinorCompact } from '../../../../shared/utils/money';
import { BackButton } from '../../../../ui/components/BackButton';
import { ListCard, ListRowButton } from '../../../../ui/components/ListRows';
import { ListEmpty, ListError, ListLoading } from '../../../../ui/components/ListState';
import { SegmentedControl } from '../../../../ui/components/SegmentedControl';
import { StatTile } from '../../../../ui/components/StatTile';
import { TextButton } from '../../../../ui/components/TextButton';
import { usePartnerEventSalesPage } from '../../hooks/usePartnerEventSalesPage';
import type {
  PartnerEventOrder,
  PartnerEventSales,
  PartnerTodayItem,
} from '../../types/partnerHome';
import { addBusinessDays, businessDay, sameBusinessDay } from '../../utils/agendaCalendar';
import { ORDER_TONE, sessionLabel } from '../../utils/eventSalesFormat';
import type { EventGuestsRenderProps } from './PartnerCatalogSection';
import { PartnerOrderSheet } from './PartnerOrderSheet';

function sessionItem(sales: PartnerEventSales, session: PartnerEventSales['sessions'][number]) {
  return {
    kind: 'session',
    id: session.id,
    parentId: sales.event.id,
    establishmentIds: [],
    title: sales.event.title,
    startsAt: session.startsAt,
    endsAt: null,
    sold: session.sold,
    capacity: session.capacity,
    checkedIn: null,
    arrivedAt: null,
  } satisfies PartnerTodayItem;
}

/** Página do evento (p10, p11): vendido, a receber, sessões e pedidos; a edição fica em "Editar". */
export function PartnerEventPage({
  eventId,
  reloadKey,
  onBack,
  onEdit,
  onOpenSession,
  renderGuests,
}: {
  eventId: string;
  reloadKey: number;
  onBack: () => void;
  /** `hasSales`: com pedidos, Editar evento não oferece excluir (D27). */
  onEdit: (hasSales: boolean) => void;
  onOpenSession: (item: PartnerTodayItem) => void;
  renderGuests?: (props: EventGuestsRenderProps) => ReactNode;
}) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language;
  const { data, loading, error, reload } = usePartnerEventSalesPage(eventId, reloadKey);
  const [order, setOrder] = useState<PartnerEventOrder | null>(null);
  const [tab, setTab] = useState<'sales' | 'guests'>('sales');
  const now = new Date();
  const guests = tab === 'guests' && renderGuests;
  // No topo de Convidados, a próxima sessão e o vendido dela (p13).
  const next =
    data?.sessions.find((session) => new Date(session.startsAt) > now) ?? data?.sessions[0];

  const when = (iso: string) => {
    const time = formatBusinessDate(iso, locale, { hour: '2-digit', minute: '2-digit' });
    if (sameBusinessDay(iso, now)) return t('partnerCatalog.event.today', { time });
    if (sameBusinessDay(iso, addBusinessDays(businessDay(now), -1)))
      return t('partnerCatalog.event.yesterday', { time });
    return formatBusinessDate(iso, locale, {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <BackButton label={t('partnerPanel.tabs.catalog')} onClick={onBack} />
          <h2 className="flex-1 min-w-0 text-[24px] font-display font-bold text-ink break-words">
            {data?.event.title ?? ''}
          </h2>
          {!guests && (
            <TextButton tone="accent" onClick={() => onEdit((data?.ordersTotal ?? 0) > 0)}>
              {t('partnerCatalog.event.edit')}
            </TextButton>
          )}
        </div>
        {data &&
          (guests && next ? (
            <p className="px-1 text-[14px] text-ink/70">
              {t('courtesy.header', {
                when: sessionLabel(next.startsAt, locale),
                sold: next.sold,
                capacity: next.capacity,
              })}
            </p>
          ) : (
            <p className="px-1 text-[14px] text-ink/70">
              {t(`partnerCatalog.status.${data.event.status}`)} ·{' '}
              {t('partnerCatalog.event.sessions', { count: data.event.sessions })}
            </p>
          ))}
      </div>

      {renderGuests && (
        <SegmentedControl
          label={data?.event.title ?? ''}
          value={tab}
          onChange={setTab}
          options={[
            { value: 'sales', label: t('courtesy.tabs.sales') },
            { value: 'guests', label: t('courtesy.tabs.guests') },
          ]}
        />
      )}

      {loading && !data ? (
        <ListLoading label={t('partnerCatalog.event.ordersTitle')} />
      ) : error || !data ? (
        <ListError message={t('partnerCatalog.event.loadError')} onRetry={() => void reload()} />
      ) : guests ? (
        guests({
          eventId,
          eventTitle: data.event.title,
          openSessions: data.sessions.filter(
            (session) => new Date(session.startsAt).getTime() + 6 * 3_600_000 > now.getTime()
          ),
          allSessions: data.sessions,
          onChanged: () => void reload(),
        })
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3">
            <StatTile
              label={t('partnerCatalog.event.sold')}
              value={formatMoneyMinorCompact(data.soldMinor, locale)}
              hint={t('partnerCatalog.event.tickets', { count: data.ticketsSold })}
            />
            <StatTile
              label={t('partnerCatalog.event.receive')}
              value={formatMoneyMinorCompact(data.receiveMinor, locale)}
              hint={t('partnerCatalog.event.receiveHint')}
            />
          </div>

          {data.sessions.length > 0 && (
            <section className="space-y-3">
              <h3 className="px-1 text-[18px] font-display font-bold text-ink">
                {t('partnerCatalog.event.sessionsTitle')}
              </h3>
              <ListCard>
                {data.sessions.map((session) => (
                  <ListRowButton
                    key={session.id}
                    title={sessionLabel(session.startsAt, locale)}
                    sub={[
                      t('partnerCatalog.event.sessionSold', {
                        sold: session.sold,
                        capacity: session.capacity,
                      }),
                      session.courtesies > 0 &&
                        t('courtesy.sessionGuests', { count: session.courtesies }),
                    ]
                      .filter(Boolean)
                      .join(' · ')}
                    aside={
                      sameBusinessDay(session.startsAt, now) ? (
                        <span className="shrink-0 text-[13px] font-semibold text-accent">
                          {t('partnerPanel.home.gate')}
                        </span>
                      ) : null
                    }
                    onClick={() => onOpenSession(sessionItem(data, session))}
                  />
                ))}
              </ListCard>
            </section>
          )}

          <section className="space-y-3">
            <h3 className="px-1 text-[18px] font-display font-bold text-ink">
              {t('partnerCatalog.event.ordersTitle')}
            </h3>
            {data.orders.length === 0 ? (
              <ListEmpty message={t('partnerCatalog.event.ordersEmpty')} />
            ) : (
              <ListCard>
                {data.orders.map((row) => (
                  <ListRowButton
                    key={row.id}
                    title={`${row.buyerName ?? t('partnerCatalog.event.buyer')} · ${t(
                      'partnerCatalog.event.tickets',
                      { count: row.tickets }
                    )}`}
                    sub={`#${row.code} · ${when(row.createdAt)}`}
                    status={{
                      tone: ORDER_TONE[row.status],
                      text: t(`partnerCatalog.event.status.${row.status}`),
                    }}
                    onClick={() => setOrder(row)}
                  />
                ))}
              </ListCard>
            )}
            {data.ordersTotal > data.orders.length && (
              <p className="px-1 text-[13px] text-ink/70">
                {t('partnerCatalog.event.ordersMore', {
                  shown: data.orders.length,
                  total: data.ordersTotal,
                })}
              </p>
            )}
          </section>
        </>
      )}

      <PartnerOrderSheet
        order={order}
        session={data?.sessions.find((session) => session.id === order?.occurrenceId)}
        onClose={() => setOrder(null)}
      />
    </div>
  );
}
