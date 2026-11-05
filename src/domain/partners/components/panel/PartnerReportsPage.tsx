import { ChevronDown } from 'lucide-react';
import { type ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { formatBusinessDate } from '../../../../shared/utils/businessDateTime';
import { formatMoneyMinorCompact } from '../../../../shared/utils/money';
import { BackButton } from '../../../../ui/components/BackButton';
import { DropdownMenu } from '../../../../ui/components/DropdownMenu';
import { ListEmpty, ListError, ListLoading } from '../../../../ui/components/ListState';
import { ListCard, ListRowButton, ListRowStatic } from '../../../../ui/components/ListRows';
import { SegmentedControl } from '../../../../ui/components/SegmentedControl';
import { usePartnerReports } from '../../hooks/usePartnerReports';
import type { PartnerReportPeriod } from '../../types/partnerHome';
import { DEFAULT_UNIT, groupReportBuckets, type ReportUnit } from '../../utils/reportGrouping';

function Bars({
  buckets,
  unit,
  locale,
}: {
  buckets: Array<{ start: string; soldMinor: number }>;
  unit: ReportUnit;
  locale: string;
}) {
  const max = Math.max(1, ...buckets.map((bucket) => bucket.soldMinor));
  const label = (iso: string) =>
    formatBusinessDate(
      iso,
      locale,
      unit === 'month' ? { month: 'short', year: 'numeric' } : { day: 'numeric', month: 'short' }
    );
  return (
    <ul className={`h-36 flex items-end ${buckets.length > 40 ? 'gap-px' : 'gap-1'}`}>
      {buckets.map((bucket) => (
        <li
          key={bucket.start}
          className="flex-1 h-full flex items-end"
          aria-label={`${label(bucket.start)}: ${formatMoneyMinorCompact(bucket.soldMinor, locale)}`}
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

/** Relatórios (p23): vendido no período, por dia ou mês, e por item. */
export function PartnerReportsPage({
  onBack,
  profile,
  initialProfile = false,
}: {
  onBack: () => void;
  /** Visitas e avaliações (insights), montado pela composição. */
  profile: ReactNode;
  initialProfile?: boolean;
}) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language;
  const [period, setPeriod] = useState<PartnerReportPeriod>('30d');
  // `null` segue o padrão do período; a escolha no "^" vale até trocar de período.
  const [chosenUnit, setChosenUnit] = useState<ReportUnit | null>(null);
  const unit = chosenUnit ?? DEFAULT_UNIT[period];
  const [showProfile, setShowProfile] = useState(initialProfile);
  const { data, loading, error, reload } = usePartnerReports(period);

  if (showProfile) {
    return (
      <div className="space-y-4">
        <BackButton
          label={t('partnerEarnings.reports.title')}
          onClick={() => (initialProfile ? onBack() : setShowProfile(false))}
        />
        {profile}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <BackButton label={t('partnerPanel.tabs.earnings')} onClick={onBack} />
        <h2 className="text-[24px] font-display font-bold text-ink">
          {t('partnerEarnings.reports.title')}
        </h2>
      </div>
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
          <section className="rounded-[20px] bg-surface border border-line p-4 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <p className="text-[13px] text-ink/70">
                  {t('partnerEarnings.reports.sold', {
                    period: t(`partnerEarnings.reports.periods.${period}`),
                  })}
                </p>
                <p className="text-[24px] leading-tight font-bold text-ink">
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
                    className="group press shrink-0 min-h-11 px-3 -mr-1 rounded-xl flex items-center gap-1.5 text-[13px] font-semibold text-ink/80 hover:bg-ink/[0.06] focus-visible:ring-2 focus-visible:ring-teal-400/50"
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
            <Bars buckets={groupReportBuckets(data.buckets, unit)} unit={unit} locale={locale} />
          </section>
          {data.truncated && (
            <p className="px-1 text-[13px] text-warn">{t('partnerEarnings.reports.truncated')}</p>
          )}
          <section className="space-y-3">
            <h3 className="px-1 text-[18px] font-display font-bold text-ink">
              {t('partnerEarnings.reports.byItem')}
            </h3>
            {data.items.length === 0 ? (
              <ListEmpty message={t('partnerEarnings.reports.empty')} />
            ) : (
              <ListCard>
                {data.items.map((item) => (
                  <ListRowStatic
                    key={item.key}
                    title={item.title ?? '—'}
                    sub={t('partnerEarnings.reports.sales', { count: item.sales })}
                    aside={
                      <span className="shrink-0 text-[15px] font-semibold text-ink">
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
          onClick={() => setShowProfile(true)}
        />
      </ListCard>
    </div>
  );
}
