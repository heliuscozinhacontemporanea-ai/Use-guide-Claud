import { Search, X } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '../../../../shared/utils/cn';
import { ListCard, ListRowButton } from '../../../../ui/components/ListRows';
import { ListEmpty, ListError, ListLoading } from '../../../../ui/components/ListState';
import { SegmentedControl } from '../../../../ui/components/SegmentedControl';
import { TextButton } from '../../../../ui/components/TextButton';
import { INPUT } from '../../../../ui/styles/controls';
import { usePartnerEventOrders } from '../../hooks/usePartnerEventOrders';
import type { PartnerEventOrder, PartnerEventSales } from '../../types/partnerHome';
import { ORDER_TONE } from '../../utils/eventSalesFormat';
import { PartnerOrderSheet } from './PartnerOrderSheet';

/** Pedidos da página do evento (p11): busca por nome ou código, "Com reembolso" e mais páginas. */
export function PartnerEventOrders({
  eventId,
  reloadKey,
  sessions,
  when,
}: {
  eventId: string;
  reloadKey: number;
  sessions: PartnerEventSales['sessions'];
  when: (iso: string) => string;
}) {
  const { t } = useTranslation();
  const orders = usePartnerEventOrders(eventId, reloadKey);
  const [order, setOrder] = useState<PartnerEventOrder | null>(null);
  const filtered = orders.searching || orders.filter === 'refunds';

  const empty = orders.searching
    ? t('partnerCatalog.event.ordersNoResults')
    : orders.filter === 'refunds'
      ? t('partnerCatalog.event.ordersNoRefunds')
      : t('partnerCatalog.event.ordersEmpty');

  return (
    <section className="space-y-3">
      <h3 className="px-1 text-[18px] font-display font-bold text-ink">
        {t('partnerCatalog.event.ordersTitle')}
      </h3>
      <div className="relative">
        <Search
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-ink/60"
          aria-hidden="true"
        />
        <input
          type="search"
          value={orders.query}
          onChange={(event) => orders.setQuery(event.target.value)}
          placeholder={t('partnerCatalog.event.ordersSearch')}
          aria-label={t('partnerCatalog.event.ordersSearch')}
          maxLength={60}
          autoCorrect="off"
          spellCheck={false}
          className={cn(
            INPUT,
            'min-h-12 pl-11 rounded-full [&::-webkit-search-cancel-button]:appearance-none',
            orders.query && 'pr-12'
          )}
        />
        {orders.query && (
          <button
            type="button"
            onClick={() => orders.setQuery('')}
            aria-label={t('partnerCatalog.event.ordersClear')}
            className="press absolute right-1 top-1/2 -translate-y-1/2 size-11 rounded-full inline-flex items-center justify-center text-ink/70 hover:text-ink focus-visible:ring-2 focus-visible:ring-teal-400/50"
          >
            <X size={18} aria-hidden="true" />
          </button>
        )}
      </div>
      <SegmentedControl
        label={t('partnerCatalog.event.ordersFilter')}
        value={orders.filter}
        onChange={orders.setFilter}
        options={[
          { value: 'all', label: t('partnerCatalog.event.ordersAll') },
          { value: 'refunds', label: t('partnerCatalog.event.ordersRefunds') },
        ]}
      />

      {orders.loading && orders.data.length === 0 ? (
        <ListLoading label={t('partnerCatalog.event.ordersTitle')} />
      ) : orders.error && orders.data.length === 0 ? (
        <ListError
          message={t('partnerCatalog.event.ordersError')}
          onRetry={() => void orders.reload()}
        />
      ) : orders.data.length === 0 ? (
        <ListEmpty message={empty} />
      ) : (
        <>
          {filtered && (
            <p className="px-1 text-[13px] text-ink/70" aria-live="polite">
              {t('partnerCatalog.event.ordersFound', { count: orders.total })}
            </p>
          )}
          <ListCard>
            {orders.data.map((row) => (
              <ListRowButton
                key={row.id}
                title={`${row.buyerName ?? t('partnerCatalog.event.buyer')} · ${t(
                  'partnerCatalog.event.tickets',
                  { count: row.tickets }
                )}`}
                sub={[
                  `#${row.code}`,
                  row.promoterUsername
                    ? t('partnerCatalog.event.viaPromoter', { username: row.promoterUsername })
                    : when(row.createdAt),
                ].join(' · ')}
                status={{
                  tone: ORDER_TONE[row.status],
                  text: t(`partnerCatalog.event.status.${row.status}`),
                }}
                onClick={() => setOrder(row)}
              />
            ))}
          </ListCard>
          {orders.error && (
            <ListError
              message={t('partnerCatalog.event.ordersError')}
              onRetry={() => void orders.loadMore()}
            />
          )}
          {orders.hasMore && !orders.error && (
            <div className="flex justify-center">
              <TextButton
                tone="accent"
                disabled={orders.loadingMore}
                onClick={() => void orders.loadMore()}
              >
                {orders.loadingMore
                  ? t('partnerCatalog.event.ordersLoading')
                  : t('partnerCatalog.event.ordersMore', {
                      count: orders.total - orders.data.length,
                    })}
              </TextButton>
            </div>
          )}
        </>
      )}

      <PartnerOrderSheet
        order={order}
        session={sessions.find((session) => session.id === order?.occurrenceId)}
        onClose={() => setOrder(null)}
      />
    </section>
  );
}
