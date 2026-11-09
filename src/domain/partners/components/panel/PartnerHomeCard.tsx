import { usePanelItemTime, usePanelTimeZone } from '../../hooks/panelTimeZone';
import { ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { formatBusinessDate, formatBusinessDay } from '../../../../shared/utils/businessDateTime';
import { cn } from '../../../../shared/utils/cn';
import { formatMoneyMinorCompact } from '../../../../shared/utils/money';
import type { PartnerTodayItem } from '../../types/partnerHome';
import type { PartnerCardData } from '../../utils/partnerHomeCardData';

const VALUE = 'text-[22px] font-bold text-ink truncate';
const SUB = 'text-[13px] text-ink/70';

function percent(part: number, whole: number) {
  return whole > 0 ? Math.round((part / whole) * 100) : 0;
}

function Body({
  data,
  labelFor,
  manyEstablishments,
}: {
  data: PartnerCardData;
  labelFor: (item: PartnerTodayItem) => string | null;
  manyEstablishments: boolean;
}) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const { timeZone } = usePanelTimeZone();
  const itemTime = usePanelItemTime(lang);
  switch (data.id) {
    case 'today':
      return data.items.length === 0 ? (
        <p className={SUB}>{t('partnerPanel.home.todayEmpty')}</p>
      ) : (
        <ul className="space-y-3">
          {data.items.slice(0, 4).map((item) => {
            const label = labelFor(item);
            return (
              <li key={`${item.kind}-${item.id}`} className="text-[14px]">
                <span className="block text-ink font-semibold truncate">
                  {itemTime(item, item.startsAt)} · {item.title}
                </span>
                <span className="flex items-center justify-between gap-3">
                  <TodayStatus item={item} />
                  {label && (
                    <span className="shrink-0 px-2 py-0.5 rounded-md bg-ink/[0.07] text-[12px] font-semibold text-ink/80">
                      {label}
                    </span>
                  )}
                </span>
              </li>
            );
          })}
        </ul>
      );
    case 'sales_today':
      return (
        <>
          <p className={VALUE}>{formatMoneyMinorCompact(data.amountMinor, lang)}</p>
          <p className={SUB}>
            {manyEstablishments
              ? t('partnerPanel.cards.sales_today.inEstablishments', { count: data.establishments })
              : t('partnerPanel.home.salesCount', { count: data.count })}
          </p>
        </>
      );
    case 'next_payout':
      return data.payout ? (
        <>
          <p className={VALUE}>{formatMoneyMinorCompact(data.payout.amountMinor, lang)}</p>
          <p className={SUB}>
            {data.payout.accounts > 1
              ? t('partnerPanel.cards.next_payout.inAccounts', { count: data.payout.accounts })
              : t('partnerPanel.home.nextPayoutOn', {
                  date: formatBusinessDay(data.payout.releaseAt, lang, timeZone),
                })}
          </p>
        </>
      ) : (
        <p className={SUB}>{t('partnerPanel.home.noPayout')}</p>
      );
    case 'next_event': {
      const { session } = data;
      const value = percent(session.sold, session.capacity);
      return (
        <>
          <div
            role="progressbar"
            aria-valuenow={value}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={t('partnerPanel.cards.next_event.title')}
            className="h-2 rounded-full bg-ink/10 overflow-hidden mb-2"
          >
            <div className="h-full bg-teal-400" style={{ width: `${value}%` }} />
          </div>
          <p className="text-[14px] text-ink">
            {t('partnerPanel.cards.next_event.sold', {
              sold: session.sold,
              capacity: session.capacity,
            })}
            {session.courtesies > 0 &&
              ` · ${t('courtesy.sessionGuests', { count: session.courtesies })}`}
          </p>
        </>
      );
    }
    case 'promoters':
      return (
        <>
          <ul className="space-y-1.5 mb-2">
            {data.promoters.top.map((row, index) => (
              <li
                key={row.username ?? index}
                className="flex items-center justify-between gap-3 text-[14px]"
              >
                <span className="min-w-0 truncate text-ink font-semibold">
                  {row.username ? `@${row.username}` : t('promoters.tab')}
                </span>
                <span className="shrink-0 text-ink/70">
                  {t('promoters.soldTickets', { count: row.tickets })} ·{' '}
                  {formatMoneyMinorCompact(row.owedMinor, lang)}
                </span>
              </li>
            ))}
          </ul>
          <p className={SUB}>
            {t('partnerPanel.cards.promoters.owed', {
              amount: formatMoneyMinorCompact(data.promoters.owedMinor, lang),
              event: data.promoters.title,
            })}
          </p>
        </>
      );
    case 'guests':
      return (
        <>
          <p className={VALUE}>{data.session.courtesies}</p>
          <p className={cn(SUB, 'truncate')}>{data.session.title}</p>
        </>
      );
    case 'reviews':
      return (
        <>
          <p className={VALUE}>
            {new Intl.NumberFormat(lang, { maximumFractionDigits: 1 }).format(data.rating)} ★
          </p>
          <p className={SUB}>
            {data.unanswered > 0
              ? t('partnerPanel.cards.reviews.unanswered', { count: data.unanswered })
              : t('partnerPanel.cards.reviews.count', { count: data.count })}
          </p>
        </>
      );
    case 'week_bookings':
      return (
        <>
          <p className={VALUE}>{data.sold}</p>
          <p className={SUB}>
            {t('partnerPanel.cards.week_bookings.occupancy', {
              percent: percent(data.sold, data.capacity),
            })}
          </p>
        </>
      );
    case 'plan_seal':
      return (
        <>
          <p className="text-[15px] font-semibold text-ink truncate">{data.name}</p>
          <p className={SUB}>
            {t('partnerPanel.cards.plan_seal.until', {
              date: formatBusinessDay(data.until, lang, timeZone),
            })}
          </p>
        </>
      );
    case 'week_occupancy':
      return (
        <div className="flex items-end gap-2 h-20" aria-hidden="true">
          {data.days.map((day) => (
            <div key={day.date} className="flex-1 flex flex-col items-center gap-1 h-full">
              <div className="flex-1 w-full flex items-end">
                <div
                  className="w-full rounded-t-md bg-teal-400"
                  style={{ height: `${Math.max(4, percent(day.sold, day.capacity))}%` }}
                />
              </div>
              <span className="text-[11px] text-ink/70">
                {formatBusinessDate(day.date, lang, { weekday: 'narrow' }, timeZone)}
              </span>
            </div>
          ))}
        </div>
      );
    case 'month_sales': {
      const diff =
        data.previousMinor > 0 ? percent(data.currentMinor, data.previousMinor) - 100 : null;
      return (
        <>
          <p className={VALUE}>{formatMoneyMinorCompact(data.currentMinor, lang)}</p>
          <p className={SUB}>
            {diff === null
              ? t('partnerPanel.cards.month_sales.noCompare')
              : t('partnerPanel.cards.month_sales.compare', {
                  percent: `${diff > 0 ? '+' : ''}${diff}`,
                })}
          </p>
        </>
      );
    }
    case 'promo_codes': {
      const { summary } = data;
      const alert = summary.alert;
      return (
        <>
          <p className={VALUE}>
            {t('partnerPanel.cards.promo_codes.active', { count: summary.active })}
          </p>
          <p className={SUB}>
            {t('partnerPanel.cards.promo_codes.weekUses', { count: summary.weekUses })}
          </p>
          {summary.top && (
            <p className={cn(SUB, 'truncate')}>
              {t('partnerPanel.cards.promo_codes.top', {
                code: summary.top.code,
                count: summary.top.uses,
              })}
            </p>
          )}
          {alert && (
            <p className="mt-1 text-[13px] font-semibold text-warn truncate">
              {alert.kind === 'ending'
                ? t('partnerPanel.cards.promo_codes.ending', {
                    code: alert.code,
                    when: formatBusinessDay(alert.endsAt, lang, timeZone),
                  })
                : t('partnerPanel.cards.promo_codes.runningOut', alert)}
            </p>
          )}
        </>
      );
    }
  }
}

/** Segunda linha do Hoje: quem já usou o código, o total de pessoas ou o vendido e a portaria. */
function TodayStatus({ item }: { item: PartnerTodayItem }) {
  const { t } = useTranslation();
  if (item.kind === 'session') {
    return (
      <span className="min-w-0 text-ink/70">
        {t('partnerPanel.home.sold', { sold: item.sold, capacity: item.capacity })} ·{' '}
        <span className="text-accent font-semibold">{t('partnerPanel.home.gate')}</span>
      </span>
    );
  }
  return (
    <span className="min-w-0 text-ink/70">
      {item.checkedIn
        ? t('partnerPanel.home.arrived', { checkedIn: item.checkedIn, sold: item.sold })
        : t('partnerPanel.home.people', { count: item.sold })}
    </span>
  );
}

/** Um cartão do Início; o toque abre a aba do assunto (seção 6.1 da proposta). */
export function PartnerHomeCard({
  data,
  onOpen,
  labelFor,
  manyEstablishments,
}: {
  data: PartnerCardData;
  onOpen?: () => void;
  labelFor: (item: PartnerTodayItem) => string | null;
  manyEstablishments: boolean;
}) {
  const { t } = useTranslation();
  const title =
    data.id === 'next_event'
      ? data.session.title
      : data.id === 'next_payout' && data.payout && data.payout.accounts > 1
        ? t('partnerPanel.cards.next_payout.titleMany')
        : t(`partnerPanel.cards.${data.id}.title`);
  const body = (
    <>
      <span className={cn('flex items-center gap-2 mb-2', !onOpen && 'pr-9')}>
        <span className="flex-1 min-w-0 text-[13px] font-semibold text-ink/70 line-clamp-2">
          {title}
        </span>
        {onOpen && <ChevronRight size={16} className="text-ink/50 shrink-0" aria-hidden="true" />}
      </span>
      <Body data={data} labelFor={labelFor} manyEstablishments={manyEstablishments} />
    </>
  );
  const box = 'w-full h-full min-w-0 rounded-[20px] bg-surface border border-line p-4 text-left';
  // Sem `onOpen` é o cartão no modo Personalizar: não navega.
  if (!onOpen) return <div className={box}>{body}</div>;
  return (
    <button
      type="button"
      onClick={onOpen}
      className={cn(box, 'press focus-visible:ring-2 focus-visible:ring-teal-400/50')}
    >
      {body}
    </button>
  );
}

export function cardSpan(large: boolean) {
  return large ? 'col-span-2' : 'col-span-2 min-[360px]:col-span-1';
}
