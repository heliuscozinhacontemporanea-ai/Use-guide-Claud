import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { formatBusinessDate } from '../../../../shared/utils/businessDateTime';
import { formatMoneyMinor } from '../../../../shared/utils/money';
import { zonedDayKey } from '../../../../shared/utils/timeZones';
import { Dialog } from '../../../../ui/components/Dialog';
import { TextButton } from '../../../../ui/components/TextButton';
import type { PartnerEventLot } from '../../types/partnerHome';
import { dayToDate, lotPeriod, lotWindow } from '../../utils/eventLots';

const BLOCK = 'rounded-2xl bg-sheet-card border border-sheet-card-line';
const ARROW =
  'press size-11 rounded-xl flex items-center justify-center text-ink disabled:text-ink/25 focus-visible:ring-2 focus-visible:ring-teal-400/50 focus-visible:outline-none';

/** Folha do lote (A5): situação, preço, vendidos e os ingressos por dia em janelas de 14 dias. */
export function PartnerEventLotSheet({
  lot,
  subtitle,
  statusLabel,
  statusTone,
  timeZone,
  onClose,
  onEdit,
}: {
  lot: PartnerEventLot | null;
  subtitle: string;
  statusLabel: string;
  statusTone: string;
  timeZone: string;
  onClose: () => void;
  onEdit: () => void;
}) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language;
  const [index, setIndex] = useState(0);
  const lotId = lot?.id;
  // Cada lote abre na janela que termina hoje.
  // biome-ignore lint/correctness/useExhaustiveDependencies: lotId é o gatilho da volta ao início
  useEffect(() => setIndex(0), [lotId]);
  if (!lot) return null;

  const money = (minor: number) => formatMoneyMinor(minor, locale);
  const dayLabel = (day: string) =>
    new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short', timeZone: 'UTC' }).format(
      dayToDate(day)
    );
  const today = zonedDayKey(new Date().toISOString(), timeZone);
  const window = lotWindow(lot.days, lotPeriod(lot, today, timeZone), index);
  const notStarted = lot.status === 'not_started';
  const peak = Math.max(1, ...window.bars.map((bar) => bar.count));
  const first = window.bars[0]?.day ?? today;
  const last = window.bars[window.bars.length - 1]?.day ?? today;
  const range = t('partnerCatalog.lots.range', { from: dayLabel(first), to: dayLabel(last) });
  const rows: Array<[string, string, string?]> = [
    [t('partnerCatalog.lots.statusLabel'), statusLabel, statusTone],
    [t('partnerCatalog.lots.price'), money(lot.priceMinor)],
    [
      t('partnerCatalog.lots.soldLabel'),
      t('partnerCatalog.event.sessionSold', { sold: lot.sold, capacity: lot.quantity }),
    ],
    ...(lot.salesEndsAt
      ? [
          [
            t('partnerCatalog.lots.salesUntil'),
            formatBusinessDate(
              lot.salesEndsAt,
              locale,
              { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' },
              timeZone
            ),
          ] as [string, string],
        ]
      : []),
  ];

  return (
    <Dialog
      open
      onOpenChange={(open) => !open && onClose()}
      title={lot.name}
      description={subtitle}
    >
      <div className="space-y-3">
        <dl className={`${BLOCK} px-4 py-3 space-y-2 text-[15px]`}>
          {rows.map(([label, value, tone]) => (
            <div key={label} className="flex justify-between gap-3">
              <dt className="text-ink/70">{label}</dt>
              <dd className={`text-right font-semibold ${tone ?? 'text-ink'}`}>{value}</dd>
            </div>
          ))}
          <div className="border-t border-line pt-2 flex justify-between gap-3">
            <dt className="font-semibold text-ink">{t('partnerCatalog.event.sold')}</dt>
            <dd className="text-right font-semibold text-ink">{money(lot.soldMinor)}</dd>
          </div>
        </dl>

        {notStarted ? (
          <p className={`${BLOCK} px-4 py-3 text-[14px] text-ink/70`}>
            {lot.salesStartsAt
              ? t('partnerCatalog.lots.opensNotice', {
                  date: formatBusinessDate(
                    lot.salesStartsAt,
                    locale,
                    { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' },
                    timeZone
                  ),
                })
              : t('partnerCatalog.lots.status.not_started')}
          </p>
        ) : (
          <section className={`${BLOCK} px-4 py-3`} aria-label={t('partnerCatalog.lots.perDay')}>
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-[15px] font-semibold text-ink">
                {t('partnerCatalog.lots.perDay')}
              </h3>
              <span className="text-[13px] text-ink/70">
                {t('partnerCatalog.lots.windowTotal', { count: window.total })}
              </span>
            </div>
            <div className="mt-3 flex items-end gap-1.5 h-24" role="img" aria-label={range}>
              {window.bars.map((bar) => (
                <span
                  key={bar.day}
                  title={`${dayLabel(bar.day)}: ${bar.count}`}
                  className={`flex-1 rounded-t ${
                    bar.count > 0 ? 'bg-accent' : bar.inPeriod ? 'bg-ink/10' : 'bg-transparent'
                  }`}
                  style={{
                    height: bar.count > 0 ? `${Math.max(6, (bar.count / peak) * 100)}%` : 3,
                  }}
                />
              ))}
            </div>
            <div className="mt-1 flex items-center justify-between gap-2">
              <button
                type="button"
                className={ARROW}
                disabled={!window.hasOlder}
                onClick={() => setIndex((value) => value + 1)}
                aria-label={t('partnerCatalog.lots.older')}
              >
                <ChevronLeft size={20} aria-hidden="true" />
              </button>
              <span className="text-[13px] font-semibold text-ink" aria-live="polite">
                {range}
              </span>
              <button
                type="button"
                className={ARROW}
                disabled={!window.hasNewer}
                onClick={() => setIndex((value) => Math.max(0, value - 1))}
                aria-label={t('partnerCatalog.lots.newer')}
              >
                <ChevronRight size={20} aria-hidden="true" />
              </button>
            </div>
            <p className="text-[13px] text-ink/70">
              {window.best
                ? t('partnerCatalog.lots.bestDay', {
                    date: dayLabel(window.best.day),
                    count: window.best.count,
                  })
                : t('partnerCatalog.lots.noSalesInWindow')}
            </p>
          </section>
        )}

        <div className="flex justify-center">
          <TextButton tone="accent" onClick={onEdit}>
            {t('partnerCatalog.lots.edit')}
          </TextButton>
        </div>
      </div>
    </Dialog>
  );
}
