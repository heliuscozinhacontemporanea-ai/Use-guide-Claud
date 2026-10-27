import { useTranslation } from 'react-i18next';
import { formatMoneyMinor } from '../../../../shared/utils/money';
import type { PayoutEntryView } from '../../types/receivables';
import { payoutStatusKey, payoutStatusTone } from './payoutStatus';
import { formatBusinessDateTime } from '../../../../shared/utils/businessDateTime';

function AmountLine({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 text-xs">
      <dt className="text-ink/70">{label}</dt>
      <dd className={strong ? 'font-bold text-ink' : 'text-ink'}>{value}</dd>
    </div>
  );
}

export function PayoutEntryRow({ entry }: { entry: PayoutEntryView }) {
  const { t, i18n } = useTranslation();
  const money = (value: number) => formatMoneyMinor(value, i18n.language);
  const date = (iso: string) => formatBusinessDateTime(iso, i18n.language);
  const status = payoutStatusKey(entry);
  const net = Math.max(0, entry.partnerAmountMinor - entry.offsetMinor);
  const title =
    entry.title ??
    t(
      entry.referenceType === 'booking'
        ? 'receivables.statement.fallbackBooking'
        : 'receivables.statement.fallbackTicket'
    );
  const settled = status === 'fully_refunded' || status === 'dispute_lost';

  return (
    <li className="p-4 rounded-2xl bg-surface border border-line space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0 space-y-0.5">
          <p className="text-sm font-bold text-ink break-words">{title}</p>
          <p className="text-xs text-ink/70">
            {t('receivables.statement.serviceEnd', { date: date(entry.serviceEndsAt) })}
          </p>
        </div>
        <span
          className={`shrink-0 max-w-[50%] px-2.5 py-1 rounded-full border text-[11px] font-bold text-center ${payoutStatusTone(status)}`}
        >
          {t(`receivables.statement.status.${status}`)}
        </span>
      </div>
      <dl className="space-y-1">
        <AmountLine label={t('receivables.statement.gross')} value={money(entry.grossMinor)} />
        {entry.serviceFeeMinor > 0 && (
          <AmountLine
            label={t('receivables.statement.serviceFee')}
            value={`− ${money(entry.serviceFeeMinor)}`}
          />
        )}
        {entry.refundedMinor > 0 && (
          <AmountLine
            label={t('receivables.statement.refunded')}
            value={`− ${money(entry.refundedMinor)}`}
          />
        )}
        {entry.platformFeeMinor > 0 && (
          <AmountLine
            label={t('receivables.statement.platformFee')}
            value={`− ${money(entry.platformFeeMinor)}`}
          />
        )}
        {entry.offsetMinor > 0 && (
          <AmountLine
            label={t('receivables.statement.offset')}
            value={`− ${money(entry.offsetMinor)}`}
          />
        )}
        {!settled && (
          <AmountLine
            label={t(
              status === 'released'
                ? 'receivables.statement.received'
                : 'receivables.statement.toReceive'
            )}
            value={money(net)}
            strong
          />
        )}
      </dl>
      {!settled && (
        <p className="text-[11px] text-ink/70">
          {entry.releasedAt
            ? t('receivables.statement.releasedOn', { date: date(entry.releasedAt) })
            : t('receivables.statement.releaseOn', { date: date(entry.releaseAt) })}
        </p>
      )}
    </li>
  );
}
