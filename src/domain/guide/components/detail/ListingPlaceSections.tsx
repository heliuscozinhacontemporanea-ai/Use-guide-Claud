import { ChevronDown, Clock, ExternalLink, ShieldCheck, Star } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '../../../../shared/utils/cn';
import { capitalizeFirst } from '../../../../shared/utils/formatters';
import {
  DAY_KEYS,
  getOperatingStatus,
  type OperatingHours,
  placeClock,
} from '../../../../shared/utils/operatingHoursStatus';
import { PLATFORM_TIME_ZONE } from '../../../../shared/utils/timeZones';
import type { GuideItem } from '../../types/guide';

const CARD = 'rounded-[20px] bg-surface border border-line';
const ICON = 'size-11 shrink-0 rounded-xl flex items-center justify-center';

/**
 * Horário de funcionamento (aprovado em 2026-11-11): aberto ou fechado agora, na hora do lugar, e a
 * semana inteira ao tocar. Sem horário cadastrado, não aparece.
 */
export function OpeningHoursRow({ item }: { item: GuideItem }) {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const hours = item.operationalInfo?.operatingHours as OperatingHours | undefined;
  const timeZone = item.timeZone ?? PLATFORM_TIME_ZONE;
  const now = new Date();
  const status = getOperatingStatus(hours, now, timeZone);
  if (!status || !hours) return null;
  const today = placeClock(now, timeZone).weekday;
  const weekday = new Intl.DateTimeFormat(i18n.language, { weekday: 'long', timeZone: 'UTC' });
  const title =
    status.state === 'open'
      ? t('listingDetail.openNow')
      : status.state === 'closed'
        ? t('listingDetail.closedNow')
        : t('listingDetail.closedToday');
  const detail =
    status.state === 'open'
      ? t('listingDetail.closesAt', { time: status.closesAt })
      : status.state === 'closed'
        ? t('listingDetail.opensAt', { time: status.opensAt })
        : null;

  return (
    <div className="space-y-2">
      <button
        type="button"
        aria-expanded={open}
        aria-label={`${title}${detail ? `, ${detail}` : ''}. ${t('listingDetail.hoursToggle')}`}
        onClick={() => setOpen((value) => !value)}
        className={`${CARD} press w-full px-4 py-3 min-h-16 flex items-center gap-3 text-left focus-visible:ring-2 focus-visible:ring-teal-400/50 focus-visible:outline-none`}
      >
        <span className={cn(ICON, 'bg-accent-soft text-accent')}>
          <Clock size={20} aria-hidden="true" />
        </span>
        <span className="flex-1 min-w-0">
          <span
            className={cn(
              'block text-[15px] font-semibold',
              status.state === 'open' ? 'text-success' : 'text-danger'
            )}
          >
            {title}
          </span>
          {detail && <span className="block text-[13px] text-ink/70">{detail}</span>}
        </span>
        <ChevronDown
          size={18}
          aria-hidden="true"
          className={cn('shrink-0 text-ink/50 transition-transform', open && 'rotate-180')}
        />
      </button>
      {open && (
        <ul className={`${CARD} px-4 divide-y divide-line`}>
          {DAY_KEYS.map((key, index) => {
            const day = hours[key];
            const isToday = index === today;
            // 1º de janeiro de 2023 foi um domingo.
            const name = capitalizeFirst(
              weekday.format(Date.UTC(2023, 0, 1 + index)),
              i18n.language
            );
            return (
              <li
                key={key}
                className={cn(
                  'flex justify-between gap-3 py-2.5 text-[14px]',
                  isToday ? 'font-semibold text-ink' : 'text-ink/70'
                )}
              >
                <span>{isToday ? `${name} · ${t('listingDetail.today')}` : name}</span>
                <span className="tabular-nums">
                  {!day || day.closed ? t('listingDetail.closed') : `${day.open}–${day.close}`}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

/** Hospedagem: horários de check-in e check-out, no lugar do "aberto agora". */
export function StayTimesRow({ item }: { item: GuideItem }) {
  const { t } = useTranslation();
  const checkIn = item.operationalInfo?.checkIn;
  const checkOut = item.operationalInfo?.checkOut;
  if (!checkIn?.from && !checkOut?.to) return null;
  return (
    <div className={`${CARD} px-4 py-3 min-h-16 flex items-center gap-3`}>
      <span className={cn(ICON, 'bg-accent-soft text-accent')}>
        <Clock size={20} aria-hidden="true" />
      </span>
      {checkIn?.from && (
        <span className="flex-1 min-w-0">
          <span className="block text-[13px] text-ink/70">{t('listingDetail.checkIn')}</span>
          <span className="block text-[15px] font-semibold text-ink">
            {checkIn.to
              ? t('listingDetail.checkInRange', { from: checkIn.from, to: checkIn.to })
              : checkIn.from}
          </span>
        </span>
      )}
      {checkOut?.to && (
        <span className="ml-auto text-right">
          <span className="block text-[13px] text-ink/70">{t('listingDetail.checkOut')}</span>
          <span className="block text-[15px] font-semibold text-ink">
            {t('listingDetail.checkOutUntil', { time: checkOut.to })}
          </span>
        </span>
      )}
    </div>
  );
}

/** "Como chegar": abre o mapa do cadastro (Google Maps), em qualquer anúncio que tenha o link. */
export function DirectionsRow({ item }: { item: GuideItem }) {
  const { t } = useTranslation();
  const link = item.googleMapsLink || item.mapLink;
  if (!link) return null;
  return (
    <button
      type="button"
      onClick={() => window.open(link, '_blank', 'noopener,noreferrer')}
      className={`${CARD} press w-full px-4 py-3 min-h-16 flex items-center gap-3 text-left focus-visible:ring-2 focus-visible:ring-teal-400/50 focus-visible:outline-none`}
    >
      <span className={cn(ICON, 'bg-accent-soft text-accent')}>
        <ExternalLink size={20} aria-hidden="true" />
      </span>
      <span className="flex-1 min-w-0">
        <span className="block text-[13px] text-ink/70">{t('listingDetail.directionsHint')}</span>
        <span className="block text-[15px] font-semibold text-ink">
          {t('listingDetail.directions')}
        </span>
      </span>
    </button>
  );
}

/** Evento: quem pode avaliar, com a nota e o total quando já há avaliações. */
export function EventReviewsCard({ item }: { item: GuideItem }) {
  const { t, i18n } = useTranslation();
  const rated = typeof item.rating === 'number' && item.rating > 0 && (item.reviewCount ?? 0) > 0;
  return (
    <section className={`${CARD} p-4 space-y-1.5`}>
      <div className="flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-[16px] font-semibold text-ink">
          <ShieldCheck size={18} className="text-accent" aria-hidden="true" />
          {t('listingDetail.verifiedReviewsTitle')}
        </h2>
        {rated && (
          <span className="shrink-0 inline-flex items-center gap-1 text-[14px] text-ink/70">
            <Star size={14} fill="currentColor" className="text-amber-400" aria-hidden="true" />
            <span className="font-bold text-ink">
              {new Intl.NumberFormat(i18n.language, {
                minimumFractionDigits: 1,
                maximumFractionDigits: 1,
              }).format(item.rating ?? 0)}
            </span>
            · {t('listingDetail.reviewsCount', { count: item.reviewCount ?? 0 })}
          </span>
        )}
      </div>
      <p className="text-[14px] text-ink/75">{t('listingDetail.verifiedReviewsText')}</p>
    </section>
  );
}
