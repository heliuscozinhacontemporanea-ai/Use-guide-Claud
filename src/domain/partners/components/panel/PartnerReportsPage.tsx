import { ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { formatBusinessDate } from '../../../../shared/utils/businessDateTime';
import { formatMoneyMinorCompact } from '../../../../shared/utils/money';
import { DropdownMenu } from '../../../../ui/components/DropdownMenu';
import { ListCard, ListRowButton, ListRowStatic } from '../../../../ui/components/ListRows';
import { ListEmpty, ListError, ListLoading } from '../../../../ui/components/ListState';
import { SegmentedControl } from '../../../../ui/components/SegmentedControl';
import { usePartnerReports } from '../../hooks/usePartnerReports';
import type { PartnerReportPeriod, PartnerReports } from '../../types/partnerHome';
import { DEFAULT_UNIT, groupReportBuckets, type ReportUnit } from '../../utils/reportGrouping';

function Bars({
  buckets,
  unit,
  locale,
  timeZone,
}: {
  buckets: Array<{ start: string; soldMinor: number }>;
  unit: ReportUnit;
  locale: string;
  timeZone: string;
}) {
  const { t } = useTranslation();
  const max = Math.max(1, ...buckets.map((bucket) => bucket.soldMinor));
  const label = (iso: string) =>
    formatBusinessDate(
      iso,
      locale,
      unit === 'month' ? { month: 'short', year: 'numeric' } : { day: 'numeric', month: 'short' },
      timeZone
    );
  return (
    <ul className={`h-36 flex items-end ${buckets.length > 40 ? 'gap-px' : 'gap-1'}`}>
      {buckets.map((bucket) => (
        <li
          key={bucket.start}
          className="flex-1 h-full flex items-end"
          aria-label={t('partnerEarnings.reports.barLabel', {
            date: label(bucket.start),
            value: formatMoneyMinorCompact(bucket.soldMinor, locale),
          })}
        >
          <span
            className="block w-full rounded-t-md bg-accent"
            style={{
              height: `${Math.max(bucket.soldMinor > 0 ? 4 : 1, (bucket.soldMinor / max) * 100)}%`,
            }}
          />
        </li>
      ))}
    </ul>
  );
}

type ReportItem = PartnerReports['items'][number];

/**
 * Relatórios (p23): vendido no período, por dia ou mês, e por item. Abre por cima do painel (D33);
 * "Visitas e avaliações" abre outra página por cima desta.
 */
export function PartnerReportsPage({ onOpenProfile }: { onOpenProfile: () => void }) {
  const { t, i18n } = useTranslation();
  // Ingressos (e quantos vieram de divulgador) ou pessoas e grupos; sem unidades, o número de vendas.
  const itemUnits = (item: ReportItem) => {
    const parts = [
      item.tickets > 0 && t('partnerEarnings.reports.tickets', { count: item.tickets }),
      item.promoterTickets > 0 &&
        t('partnerEarnings.reports.promoterTickets', { count: item.promoterTickets }),
      item.people > 0 && t('partnerEarnings.reports.people', { count: item.people }),
      item.groups > 0 && t('partnerEarnings.reports.groups', { count: item.groups }),
    ].filter(Boolean);
    return parts.length > 0
      ? parts.join(' · ')
      : t('partnerEarnings.reports.sales', { count: item.sales });
  };
  const locale = i18n.language;
  const [period, setPeriod] = useState<PartnerReportPeriod>('30d');
  // `null` segue o padrão do período; a escolha no "^" vale até trocar de período.
  const [chosenUnit, setChosenUnit] = useState<ReportUnit | null>(null);
  const unit = chosenUnit ?? DEFAULT_UNIT[period];
  const { data, loading, error, reload } = usePartnerReports(period);

  return (
    <div className="space-y-5">
      <SegmentedControl<PartnerReportPeriod>
        label={t('partnerEarnings.reports.title')}
        value={period}
        onChange={(next) => {
          setPeriod(next);
          setChosenUnit(null);
        }}
        options={(['7d', '30d', '12m'] as const).map((value) => ({
          value,
          label: t(`partnerEarnings.reports.periods.${value}`),
        }))}
      />
      {loading && !data ? (
        <ListLoading label={t('partnerEarnings.reports.title')} />
      ) : error || !data ? (
        <ListError message={t('partnerEarnings.reports.loadError')} onRetry={() => void reload()} />
      ) : (
        <>
          <section className="rounded-card bg-surface border border-line p-4 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <p className="text-meta text-ink-muted">
                  {t('partnerEarnings.reports.sold', {
                    period: t(`partnerEarnings.reports.periods.${period}`),
                  })}
                </p>
                <p className="text-heading font-bold text-ink tabular-nums">
                  {formatMoneyMinorCompact(data.soldMinor, locale)}
                </p>
              </div>
              <DropdownMenu
                trigger={
                  <button
                    type="button"
                    aria-label={t('partnerEarnings.reports.groupBy', {
                      unit: t(`partnerEarnings.reports.units.${unit}`),
                    })}
                    className="group press shrink-0 min-h-11 px-3 -mr-1 rounded-control flex items-center gap-1.5 text-meta font-semibold text-ink-muted hover:bg-ink/[0.06] focus-visible:ring-2 focus-visible:ring-teal-400/50"
                  >
                    {t(`partnerEarnings.reports.units.${unit}`)}
                    {/* "v" fechado e "^" aberto: o Radix marca o botão com data-state. */}
                    <ChevronDown
                      size={16}
                      aria-hidden="true"
                      className="transition-transform duration-150 group-data-[state=open]:rotate-180 motion-reduce:transition-none"
                    />
                  </button>
                }
                items={(['day', 'week', 'month'] as const).map((value) => ({
                  label: t(`partnerEarnings.reports.units.${value}`),
                  onClick: () => setChosenUnit(value),
                }))}
              />
            </div>
            <Bars
              buckets={groupReportBuckets(data.buckets, unit, data.timeZone)}
              unit={unit}
              locale={locale}
              timeZone={data.timeZone}
            />
          </section>
          {data.truncated && (
            <p className="px-1 text-meta text-warn">{t('partnerEarnings.reports.truncated')}</p>
          )}
          <section className="space-y-3">
            <h3 className="px-1 text-title text-ink">{t('partnerEarnings.reports.byItem')}</h3>
            {data.items.length === 0 ? (
              <ListEmpty message={t('partnerEarnings.reports.empty')} />
            ) : (
              <ListCard>
                {data.items.map((item) => (
                  <ListRowStatic
                    key={item.key}
                    title={item.title ?? '—'}
                    sub={itemUnits(item)}
                    aside={
                      <span className="shrink-0 text-body font-semibold text-ink tabular-nums">
                        {formatMoneyMinorCompact(item.soldMinor, locale)}
                      </span>
                    }
                  />
                ))}
              </ListCard>
            )}
          </section>
        </>
      )}
      <ListCard>
        <ListRowButton
          title={t('partnerEarnings.reports.profile')}
          sub={t('partnerEarnings.reports.profileHint')}
          onClick={onOpenProfile}
        />
      </ListCard>
    </div>
  );
}
