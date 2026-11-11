import { ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { formatBusinessDate } from '../../../../shared/utils/businessDateTime';
import { cn } from '../../../../shared/utils/cn';
import { formatMoneyMinor, formatMoneyMinorCompact } from '../../../../shared/utils/money';
import type { PartnerEventLot, PartnerEventSales } from '../../types/partnerHome';
import { lotsFor } from '../../utils/eventLots';
import { PartnerEventLotSheet } from './PartnerEventLotSheet';

const TONE: Record<PartnerEventLot['status'], string> = {
  on_sale: 'text-success',
  not_started: 'text-warn',
  paused: 'text-warn',
  sold_out: 'text-ink/70',
  ended: 'text-ink/70',
};

/**
 * "Vendas por lote" na página do evento (A5): cada lote com vendidos, valor e situação; com mais de
 * uma sessão, um filtro. O toque abre a folha do lote, com os ingressos por dia.
 */
export function PartnerEventLots({
  sales,
  onEdit,
}: {
  sales: PartnerEventSales;
  /** Abre Editar evento, onde ficam os ingressos e lotes. */
  onEdit: () => void;
}) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language;
  const [session, setSession] = useState<string | null>(null);
  const [opened, setOpened] = useState<string | null>(null);
  if (sales.lots.length === 0) return null;

  const lots = lotsFor(sales.lots, session);
  const openedLot = lots.find((lot) => lot.id === opened) ?? null;
  const day = (iso: string) =>
    formatBusinessDate(iso, locale, { day: 'numeric', month: 'short' }, sales.timeZone);
  const sessionName = (iso: string) =>
    formatBusinessDate(iso, locale, { weekday: 'short', day: 'numeric' }, sales.timeZone);
  const statusLabel = (lot: PartnerEventLot) =>
    lot.status === 'not_started' && lot.salesStartsAt
      ? t('partnerCatalog.lots.opensOn', { date: day(lot.salesStartsAt) })
      : t(`partnerCatalog.lots.status.${lot.status}`);
  const filters = [
    { id: null, label: t('partnerCatalog.lots.allSessions') },
    ...sales.sessions.map((item) => ({ id: item.id, label: sessionName(item.startsAt) })),
  ];
  const { discountMinor } = sales.breakdown;

  return (
    <section className="space-y-3" aria-labelledby="event-lots-title">
      <h3 id="event-lots-title" className="px-1 text-[18px] font-display font-bold text-ink">
        {t('partnerCatalog.lots.title')}
      </h3>
      {sales.sessions.length > 1 && (
        <fieldset className="flex gap-2 overflow-x-auto pb-1">
          <legend className="sr-only">{t('partnerCatalog.lots.filter')}</legend>
          {filters.map((filter) => (
            <button
              key={filter.id ?? 'all'}
              type="button"
              aria-pressed={session === filter.id}
              onClick={() => setSession(filter.id)}
              className={cn(
                'press shrink-0 min-h-11 px-4 rounded-full border text-[13px] font-semibold first-letter:uppercase focus-visible:ring-2 focus-visible:ring-teal-400/50 focus-visible:outline-none',
                session === filter.id
                  ? 'bg-ink text-app border-ink'
                  : 'bg-surface text-ink/80 border-line'
              )}
            >
              {filter.label}
            </button>
          ))}
        </fieldset>
      )}
      {lots.length === 0 ? (
        <p className="px-1 text-[14px] text-ink/70">{t('partnerCatalog.lots.emptySession')}</p>
      ) : (
        <ul className="rounded-[20px] bg-surface border border-line divide-y divide-line overflow-hidden">
          {lots.map((lot) => (
            <li key={lot.id}>
              <button
                type="button"
                onClick={() => setOpened(lot.id)}
                className="press w-full px-4 py-3.5 text-left focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-teal-400/50 focus-visible:outline-none"
              >
                <span className="flex items-start justify-between gap-3">
                  <span className="min-w-0">
                    <span className="block text-[15px] font-semibold text-ink break-words">
                      {lot.name} · {formatMoneyMinorCompact(lot.priceMinor, locale)}
                    </span>
                    <span className="block text-[13px] text-ink/70">
                      {t('partnerCatalog.event.sessionSold', {
                        sold: lot.sold,
                        capacity: lot.quantity,
                      })}
                      {lot.soldMinor > 0 && ` · ${formatMoneyMinorCompact(lot.soldMinor, locale)}`}
                    </span>
                  </span>
                  <span
                    className={cn(
                      'shrink-0 inline-flex items-center gap-1 text-[13px] font-semibold',
                      TONE[lot.status]
                    )}
                  >
                    {statusLabel(lot)}
                    <ChevronRight size={16} className="text-ink/50" aria-hidden="true" />
                  </span>
                </span>
                <span
                  className="mt-2.5 block h-1.5 rounded-full bg-ink/10 overflow-hidden"
                  aria-hidden="true"
                >
                  <span
                    className="block h-full rounded-full bg-accent"
                    style={{
                      width: `${lot.quantity > 0 ? Math.min(100, (lot.sold / lot.quantity) * 100) : 0}%`,
                    }}
                  />
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
      {!session && discountMinor > 0 && (
        <p className="px-1 text-[13px] text-ink/70">
          {t('partnerCatalog.lots.couponsNote', {
            amount: formatMoneyMinor(discountMinor, locale),
          })}
        </p>
      )}
      <PartnerEventLotSheet
        lot={openedLot}
        subtitle={`${sales.event.title} · ${
          session
            ? sessionName(sales.sessions.find((item) => item.id === session)?.startsAt ?? '')
            : t('partnerCatalog.lots.allSessionsLower')
        }`}
        statusLabel={openedLot ? statusLabel(openedLot) : ''}
        statusTone={openedLot ? TONE[openedLot.status] : ''}
        timeZone={sales.timeZone}
        onClose={() => setOpened(null)}
        onEdit={onEdit}
      />
    </section>
  );
}
