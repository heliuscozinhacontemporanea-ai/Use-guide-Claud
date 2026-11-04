import { ChevronRight } from 'lucide-react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { formatBusinessDate, formatBusinessDay } from '../../../../shared/utils/businessDateTime';
import { cn } from '../../../../shared/utils/cn';
import { formatMoneyMinor } from '../../../../shared/utils/money';
import type { PartnerCardData } from '../../utils/partnerHomeCardData';

const VALUE = 'text-[22px] font-bold text-ink truncate';
const SUB = 'text-[13px] text-ink/70';

function percent(part: number, whole: number) {
  return whole > 0 ? Math.round((part / whole) * 100) : 0;
}

function Body({ data }: { data: PartnerCardData }) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const time = (iso: string) =>
    formatBusinessDate(iso, lang, { hour: '2-digit', minute: '2-digit' });
  switch (data.id) {
    case 'today':
      return data.items.length === 0 ? (
        <p className={SUB}>{t('partnerPanel.home.todayEmpty')}</p>
      ) : (
        <ul className="space-y-1.5">
          {data.items.slice(0, 4).map((item) => (
            <li key={`${item.kind}-${item.id}`} className="flex justify-between gap-3 text-[14px]">
              <span className="text-ink font-semibold truncate">
                {time(item.startsAt)} {item.title}
              </span>
              <span className="text-ink/70 shrink-0">
                {t('partnerPanel.home.sold', { sold: item.sold, capacity: item.capacity })}
              </span>
            </li>
          ))}
        </ul>
      );
    case 'sales_today':
      return (
        <>
          <p className={VALUE}>{formatMoneyMinor(data.amountMinor, lang)}</p>
          <p className={SUB}>{t('partnerPanel.home.salesCount', { count: data.count })}</p>
        </>
      );
    case 'next_payout':
      return data.payout ? (
        <>
          <p className={VALUE}>{formatMoneyMinor(data.payout.amountMinor, lang)}</p>
          <p className={SUB}>
            {t('partnerPanel.home.nextPayoutOn', {
              date: formatBusinessDay(data.payout.releaseAt, lang),
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
          </p>
        </>
      );
    }
    case 'reviews':
      return (
        <>
          <p className={VALUE}>
            {new Intl.NumberFormat(lang, { maximumFractionDigits: 1 }).format(data.rating)} ★
          </p>
          <p className={SUB}>{t('partnerPanel.cards.reviews.count', { count: data.count })}</p>
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
            {t('partnerPanel.cards.plan_seal.until', { date: formatBusinessDay(data.until, lang) })}
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
                {formatBusinessDate(day.date, lang, { weekday: 'narrow' })}
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
          <p className={VALUE}>{formatMoneyMinor(data.currentMinor, lang)}</p>
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
  }
}

/** Um cartão do Início; o toque abre a aba do assunto (seção 6.1 da proposta). */
export function PartnerHomeCard({
  data,
  large,
  onOpen,
  scopeNote,
}: {
  data: PartnerCardData;
  large: boolean;
  onOpen: () => void;
  /** "de todos os estabelecimentos", nos cartões de dinheiro com mais de um estabelecimento. */
  scopeNote?: ReactNode;
}) {
  const { t } = useTranslation();
  const title =
    data.id === 'next_event' ? data.session.title : t(`partnerPanel.cards.${data.id}.title`);
  return (
    <button
      type="button"
      onClick={onOpen}
      className={cn(
        'press min-w-0 rounded-[20px] bg-surface border border-line p-4 text-left focus-visible:ring-2 focus-visible:ring-teal-400/50',
        large ? 'col-span-2' : 'col-span-2 min-[360px]:col-span-1'
      )}
    >
      <span className="flex items-center gap-2 mb-2">
        <span className="flex-1 min-w-0 text-[13px] font-semibold text-ink/70 line-clamp-2">
          {title}
        </span>
        <ChevronRight size={16} className="text-ink/50 shrink-0" aria-hidden="true" />
      </span>
      <Body data={data} />
      {scopeNote && <span className="block mt-1 text-[12px] text-ink/60">{scopeNote}</span>}
    </button>
  );
}
