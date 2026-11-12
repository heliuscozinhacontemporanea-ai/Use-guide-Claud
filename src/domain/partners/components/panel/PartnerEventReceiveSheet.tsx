import { useTranslation } from 'react-i18next';
import { formatMoneyMinor } from '../../../../shared/utils/money';
import { Dialog } from '../../../../ui/components/Dialog';
import { TextButton } from '../../../../ui/components/TextButton';
import type { PartnerEventSales } from '../../types/partnerHome';

const BLOCK = 'rounded-2xl bg-sheet-card border border-sheet-card-line';

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={`flex justify-between gap-3 ${strong ? 'text-[16px]' : ''}`}>
      <dt className={strong ? 'font-bold text-ink' : 'text-ink/70'}>{label}</dt>
      <dd className={`text-right ${strong ? 'font-bold' : 'font-semibold'} text-ink`}>{value}</dd>
    </div>
  );
}

/**
 * Folha "Como chegamos a esse valor" (A4): a conta de "Você recebe" do evento, linha a linha, com
 * os números que o servidor calcula a partir dos pedidos e dos repasses.
 */
export function PartnerEventReceiveSheet({
  sales,
  onClose,
  onOpenEarnings,
}: {
  sales: PartnerEventSales | null;
  onClose: () => void;
  onOpenEarnings?: () => void;
}) {
  const { t, i18n } = useTranslation();
  if (!sales) return null;
  const locale = i18n.language;
  const money = (minor: number) => formatMoneyMinor(minor, locale);
  const minus = (minor: number) => `− ${money(minor)}`;
  const { breakdown } = sales;
  const percent =
    breakdown.feeBaseMinor > 0
      ? new Intl.NumberFormat(locale, { style: 'percent', maximumFractionDigits: 1 }).format(
          breakdown.platformFeeMinor / breakdown.feeBaseMinor
        )
      : null;

  return (
    <Dialog
      open
      onOpenChange={(open) => !open && onClose()}
      title={t('partnerCatalog.receive.title')}
      description={`${sales.event.title} · ${t('partnerCatalog.event.sessions', { count: sales.event.sessions })}`}
    >
      <div className="space-y-3">
        <dl className={`${BLOCK} px-4 py-3 space-y-2 text-[15px]`}>
          <Row label={t('partnerCatalog.receive.tickets')} value={money(breakdown.ticketsMinor)} />
          {breakdown.discountMinor > 0 && (
            <Row
              label={t('partnerCatalog.receive.discounts')}
              value={minus(breakdown.discountMinor)}
            />
          )}
          {breakdown.refundedMinor > 0 && (
            <Row
              label={t('partnerCatalog.receive.refunds')}
              value={minus(breakdown.refundedMinor)}
            />
          )}
          <div className="border-t border-line pt-2">
            <Row label={t('partnerCatalog.event.sold')} value={money(sales.soldMinor)} />
          </div>
          <Row
            label={
              percent
                ? t('partnerCatalog.receive.fee', { percent })
                : t('partnerCatalog.receive.feeNoPercent')
            }
            value={minus(breakdown.platformFeeMinor)}
          />
          {breakdown.adjustmentsMinor !== 0 && (
            <Row
              label={t('partnerCatalog.receive.adjustments')}
              value={
                breakdown.adjustmentsMinor > 0
                  ? minus(breakdown.adjustmentsMinor)
                  : `+ ${money(-breakdown.adjustmentsMinor)}`
              }
            />
          )}
          <div className="border-t border-line pt-2">
            <Row
              label={t('partnerCatalog.event.receive')}
              value={money(sales.receiveMinor)}
              strong
            />
          </div>
        </dl>
        <ul className={`${BLOCK} px-4 py-3 space-y-2 text-[14px] text-ink/70`}>
          {breakdown.buyerServiceFeeMinor > 0 && (
            <li>
              {t('partnerCatalog.receive.noteServiceFee', {
                amount: money(breakdown.buyerServiceFeeMinor),
              })}
            </li>
          )}
          <li>{t('partnerCatalog.receive.noteProcessing')}</li>
          <li>
            {sales.payoutDocument
              ? t('partnerCatalog.receive.notePayoutTo', { document: sales.payoutDocument })
              : t('partnerCatalog.receive.notePayout')}
          </li>
        </ul>
        {onOpenEarnings && (
          <div className="flex justify-center">
            <TextButton tone="accent" onClick={onOpenEarnings}>
              {t('partnerCatalog.receive.openEarnings')}
            </TextButton>
          </div>
        )}
      </div>
    </Dialog>
  );
}
