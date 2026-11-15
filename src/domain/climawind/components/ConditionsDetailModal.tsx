import { Navigation } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Dialog } from '../../../ui/components/Dialog';
import { ListError, ListLoading } from '../../../ui/components/ListState';
import { useWindForecast } from '../hooks/useWindForecast';
import type { ForecastDay } from '../types/windForecast';
import { weatherConditionKey } from '../utils/weatherCondition';

interface ConditionsDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  location: { id: string; name: string; lat: number; lon: number };
}

/** Vento acima de 16 nós: dia bom para kite, destacado na lista. */
const KITE_WIND = 16;

function DayRow({ day, locale }: { day: ForecastDay; locale: string }) {
  const { t } = useTranslation();
  // Dia do lugar (AAAA-MM-DD): formatado sem fuso, para não andar um dia.
  const date = new Date(`${day.day}T00:00:00Z`);
  const weekday = new Intl.DateTimeFormat(locale, { weekday: 'short', timeZone: 'UTC' }).format(
    date
  );
  const dayMonth = new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  }).format(date);
  const knots = t('wind.unit.knots');
  return (
    <li className="px-4 py-3 flex items-center gap-3">
      <div className="shrink-0 min-w-24">
        <p className="text-meta text-ink-muted capitalize">{weekday}</p>
        <p className="text-body font-semibold text-ink whitespace-nowrap">{dayMonth}</p>
      </div>
      <Navigation
        size={20}
        className="shrink-0 text-accent"
        role="img"
        aria-label={t('wind.forecast.direction', { degrees: Math.round(day.windDir) })}
        style={{ transform: `rotate(${(day.windDir + 180) % 360}deg)` }}
      />
      <div className="flex-1 min-w-0">
        <p className="flex items-baseline gap-3 tabular-nums">
          <span
            className={day.maxWind >= KITE_WIND ? 'text-title text-accent' : 'text-title text-ink'}
          >
            <span className="sr-only">{t('wind.forecast.wind')} </span>
            {day.maxWind} <span className="text-caption text-ink-muted">{knots}</span>
          </span>
          <span className="text-meta text-danger">
            {t('wind.forecast.gust')} {day.maxGusts} {knots}
          </span>
        </p>
        <p className="text-meta text-ink-muted truncate">
          {t(weatherConditionKey(day.weatherCode))} ·{' '}
          {t('wind.forecast.temperature', { max: day.maxTemp, min: day.minTemp })}
        </p>
      </div>
    </li>
  );
}

/** Previsão de 10 dias de um lugar numa folha (D33), aberta pelo painel de condições. */
export function ConditionsDetailModal({ isOpen, onClose, location }: ConditionsDetailModalProps) {
  const { t, i18n } = useTranslation();
  const { days, loading, error, reload } = useWindForecast(location, isOpen);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => !open && onClose()}
      title={location.name}
      description={t('wind.forecast.subtitle')}
    >
      {loading ? (
        <ListLoading label={t('wind.forecast.loading')} />
      ) : error || !days ? (
        <ListError message={t('wind.forecast.error')} onRetry={reload} />
      ) : (
        <ul className="rounded-card bg-surface border border-line divide-y divide-line">
          {days.map((day) => (
            <DayRow key={day.day} day={day} locale={i18n.language} />
          ))}
        </ul>
      )}
    </Dialog>
  );
}
