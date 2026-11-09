import { PLATFORM_TIME_ZONE, zonedDayKey } from '../../../../shared/utils/timeZones';
import { useTranslation } from 'react-i18next';
import { formatBusinessDate } from '../../../../shared/utils/businessDateTime';
import { StatTile } from '../../../../ui/components/StatTile';
import { TextButton } from '../../../../ui/components/TextButton';
import { useItemStats } from '../../hooks/useItemStats';

/** Meio do mês anterior no fuso da plataforma (as visitas são contadas no dia de Brasília, D28). */
function previousMonthIso(now: Date): string {
  const [year, month] = zonedDayKey(now.toISOString(), PLATFORM_TIME_ZONE)
    .split('-')
    .map(Number) as [number, number];
  return new Date(Date.UTC(year, month - 2, 15, 12)).toISOString();
}

/** Visitas do mês com a comparação ao mês anterior (p19). Exige plano (D11). */
export function MonthVisitsTile({
  itemId,
  onOpenPlan,
}: {
  itemId: string;
  onOpenPlan: () => void;
}) {
  const { t, i18n } = useTranslation();
  const { stats, loading, error } = useItemStats(itemId, 'items');
  const label = t('insights.monthVisits.label');
  const locale = i18n.language;

  if (loading) return <StatTile label={label} value="…" />;
  if (!stats) {
    if (error === 'LISTING_PLAN_REQUIRED') {
      return (
        <StatTile
          label={label}
          value="—"
          hint={
            <TextButton tone="accent" onClick={onOpenPlan} className="text-[13px]">
              {t('insights.monthVisits.withPlan')}
            </TextButton>
          }
        />
      );
    }
    return <StatTile label={label} value="—" hint={t('insights.monthVisits.unavailable')} />;
  }

  const { currentViews, previousViews } = stats.month;
  const month = formatBusinessDate(previousMonthIso(new Date()), locale, { month: 'long' });
  const hint =
    previousViews > 0
      ? t('insights.monthVisits.versus', {
          percent: new Intl.NumberFormat(locale, {
            style: 'percent',
            maximumFractionDigits: 0,
            signDisplay: 'exceptZero',
          }).format((currentViews - previousViews) / previousViews),
          month,
        })
      : t('insights.monthVisits.firstMonth', { month });
  return <StatTile label={label} value={currentViews.toLocaleString(locale)} hint={hint} />;
}
