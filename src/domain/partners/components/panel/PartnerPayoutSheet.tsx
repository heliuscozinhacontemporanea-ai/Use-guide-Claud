import { useTranslation } from 'react-i18next';
import { formatBusinessDay } from '../../../../shared/utils/businessDateTime';
import { formatMoneyMinor } from '../../../../shared/utils/money';
import { Dialog } from '../../../../ui/components/Dialog';
import type { PartnerPayoutGroup } from '../../types/partnerHome';
import { payoutTotals } from '../../utils/payoutFormat';

const BLOCK = 'rounded-2xl bg-sheet-card border border-sheet-card-line';

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-ink/70">{label}</dt>
      <dd className={`text-right ${strong ? 'font-bold' : 'font-semibold'} text-ink`}>{value}</dd>
    </div>
  );
}

/** Folha do repasse (p21): de onde vem o valor e em qual conta cai. */
export function PartnerPayoutSheet({
  group,
  onClose,
}: {
  group: PartnerPayoutGroup | null;
  onClose: () => void;
}) {
  const { t, i18n } = useTranslation();
  if (!group) return null;
  const locale = i18n.language;
  const money = (minor: number) => formatMoneyMinor(minor, locale);
  const totals = payoutTotals(group);
  const percent =
    totals.soldMinor > 0
      ? new Intl.NumberFormat(locale, { style: 'percent', maximumFractionDigits: 1 }).format(
          totals.feeMinor / totals.soldMinor
        )
      : '';
  const account = {
    name: group.account.name ?? '',
    document: group.account.maskedDocument,
  };

  return (
    <Dialog
      open
      onOpenChange={(open) => !open && onClose()}
      title={
        group.status === 'held'
          ? t('partnerEarnings.sheet.heldTitle')
          : t('partnerEarnings.sheet.title', { date: formatBusinessDay(group.date, locale) })
      }
      description={t(
        group.status === 'paid'
          ? 'partnerEarnings.sheet.accountPaid'
          : 'partnerEarnings.sheet.accountTo',
        account
      )}
    >
      <div className="space-y-4">
        <dl className={`${BLOCK} px-4 py-3 space-y-2 text-[15px]`}>
          <Row label={t('partnerEarnings.sheet.sold')} value={money(totals.soldMinor)} />
          <Row
            label={t('partnerEarnings.sheet.fee', { percent })}
            value={`− ${money(totals.feeMinor)}`}
          />
          {totals.offsetMinor > 0 && (
            <Row
              label={t('partnerEarnings.sheet.offset')}
              value={`− ${money(totals.offsetMinor)}`}
            />
          )}
          <Row
            label={t('partnerEarnings.sheet.receive')}
            value={money(totals.receiveMinor)}
            strong
          />
        </dl>
        <ul className={`${BLOCK} divide-y divide-line overflow-hidden text-[15px]`}>
          {group.lines.map((line) => (
            <li key={line.id} className="px-4 py-3 flex justify-between gap-3">
              <span className="text-ink min-w-0 break-words">
                {[line.title, formatBusinessDay(line.serviceEndsAt, locale)]
                  .filter(Boolean)
                  .join(' · ')}
              </span>
              <span className="font-semibold text-ink shrink-0">{money(line.netMinor)}</span>
            </li>
          ))}
        </ul>
        {group.status !== 'paid' && (
          <p className="px-1 text-[14px] text-ink/70">
            {t(
              group.status === 'held'
                ? 'partnerEarnings.sheet.noteHeld'
                : 'partnerEarnings.sheet.noteScheduled'
            )}
          </p>
        )}
      </div>
    </Dialog>
  );
}
