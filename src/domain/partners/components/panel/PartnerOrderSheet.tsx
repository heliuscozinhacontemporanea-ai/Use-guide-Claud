import { useTranslation } from 'react-i18next';
import { formatBusinessDate } from '../../../../shared/utils/businessDateTime';
import { formatMoneyMinor } from '../../../../shared/utils/money';
import { Dialog } from '../../../../ui/components/Dialog';
import { StatusText } from '../../../../ui/components/StatusText';
import type { PartnerEventOrder } from '../../types/partnerHome';
import { ORDER_TONE, sessionLabel } from '../../utils/eventSalesFormat';

const BLOCK = 'rounded-2xl bg-sheet-card border border-sheet-card-line';

/** Folha do pedido (p12): o que foi comprado e a situação do reembolso. */
export function PartnerOrderSheet({
  order,
  session,
  onClose,
}: {
  order: PartnerEventOrder | null;
  session: { startsAt: string } | undefined;
  onClose: () => void;
}) {
  const { t, i18n } = useTranslation();
  if (!order) return null;
  const locale = i18n.language;
  const money = (minor: number) => formatMoneyMinor(minor, locale);
  const date = (iso: string, withTime = true) =>
    formatBusinessDate(iso, locale, {
      day: 'numeric',
      month: 'short',
      ...(withTime ? { hour: '2-digit', minute: '2-digit' } : {}),
    });
  const refund = order.refund;
  const refundText = refund
    ? t(
        `partnerCatalog.order.refund.${refund.state}${
          refund.full && (refund.state === 'in_progress' || refund.state === 'done') ? '_full' : ''
        }`,
        { amount: money(refund.amountMinor), date: date(refund.at, false) }
      )
    : null;

  return (
    <Dialog
      open
      onOpenChange={(open) => !open && onClose()}
      title={`${order.buyerName ?? t('partnerCatalog.event.buyer')} · ${t('partnerCatalog.event.tickets', { count: order.tickets })}`}
      description={t('partnerCatalog.order.bought', {
        code: order.code,
        date: date(order.createdAt),
      })}
    >
      <div className="space-y-4">
        <dl className={`${BLOCK} px-4 py-3 space-y-2 text-[15px]`}>
          {order.lines.map((line) => (
            <div key={`${line.name}-${line.unitPriceMinor}`} className="flex justify-between gap-3">
              <dt className="text-ink/70">{t('partnerCatalog.order.ticket')}</dt>
              <dd className="font-semibold text-ink text-right">
                {line.quantity > 1 ? `${line.quantity} × ` : ''}
                {line.name} · {money(line.unitPriceMinor)}
              </dd>
            </div>
          ))}
          {order.serviceFeeMinor > 0 && (
            <div className="flex justify-between gap-3">
              <dt className="text-ink/70">{t('partnerCatalog.order.serviceFee')}</dt>
              <dd className="font-semibold text-ink">{money(order.serviceFeeMinor)}</dd>
            </div>
          )}
          {order.paymentMethod && (
            <div className="flex justify-between gap-3">
              <dt className="text-ink/70">{t('partnerCatalog.order.paidWith')}</dt>
              <dd className="font-semibold text-ink">
                {t(`partnerCatalog.order.method.${order.paymentMethod}`)}
              </dd>
            </div>
          )}
          {session && (
            <div className="flex justify-between gap-3">
              <dt className="text-ink/70">{t('partnerCatalog.order.session')}</dt>
              <dd className="font-semibold text-ink text-right">
                {sessionLabel(session.startsAt, locale)}
              </dd>
            </div>
          )}
        </dl>
        <section className={`${BLOCK} px-4 py-3 space-y-1`}>
          <StatusText tone={ORDER_TONE[order.status]}>
            {t(`partnerCatalog.event.status.${order.status}`)}
          </StatusText>
          {refundText && <p className="text-[15px] text-ink/80">{refundText}</p>}
        </section>
      </div>
    </Dialog>
  );
}
