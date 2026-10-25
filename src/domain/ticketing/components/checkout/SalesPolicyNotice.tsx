import { Info } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { TicketOrderSalesPolicySnapshot } from '../../types/ticketing';

interface SalesPolicyNoticeProps {
  policy: TicketOrderSalesPolicySnapshot;
  /** Depois de reservar, a política mostrada é a gravada no pedido. */
  applied?: boolean;
  showServiceFeeNote?: boolean;
}

/** Política de cancelamento e transferência exibida antes do pagamento (AGENTS.md §8.7). */
export function SalesPolicyNotice({ policy, applied, showServiceFeeNote }: SalesPolicyNoticeProps) {
  const { t } = useTranslation();
  const key = `salesPolicy.policies.event.${policy.cancellationPolicy}`;
  return (
    <div className="p-3 rounded-xl bg-surface border border-line space-y-1 text-xs text-ink/70">
      <p className="flex items-center gap-1.5 font-bold text-ink">
        <Info size={13} className="text-teal-400" aria-hidden="true" />
        {applied ? t('ticketCheckout.policy.appliedTitle') : t('ticketCheckout.policy.title')}
      </p>
      <p>
        <span className="font-semibold">{t(`${key}.title`)}:</span> {t(`${key}.description`)}{' '}
        {t('salesPolicy.noShow')}
      </p>
      <p>{t('salesPolicy.withdrawal')}</p>
      {showServiceFeeNote && <p>{t('salesPolicy.serviceFee.notRefundable')}</p>}
      <p>
        {policy.allowTicketTransfer
          ? t('ticketCheckout.policy.transferAllowed', { hours: policy.ticketTransferCutoffHours })
          : t('ticketCheckout.policy.transferDisabled')}
      </p>
    </div>
  );
}
