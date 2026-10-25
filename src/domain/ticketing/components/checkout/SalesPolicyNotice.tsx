import { ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { TicketOrderSalesPolicySnapshot } from '../../types/ticketing';

interface SalesPolicyNoticeProps {
  policy: Pick<TicketOrderSalesPolicySnapshot, 'cancellationPolicy'>;
  /** Depois de reservar, a política mostrada é a gravada no pedido. */
  applied?: boolean;
}

/**
 * Política deste evento numa linha, antes do pagamento (AGENTS.md §8.7). O texto completo, com o
 * arrependimento e as demais regras, fica nos termos (D15).
 */
export function SalesPolicyNotice({ policy, applied }: SalesPolicyNoticeProps) {
  const { t } = useTranslation();
  const key = `salesPolicy.policies.event.${policy.cancellationPolicy}`;
  return (
    <p className="flex items-start gap-2 text-xs text-ink/80">
      <ShieldCheck size={14} className="text-accent shrink-0 mt-0.5" aria-hidden="true" />
      <span>
        <span className="font-semibold">
          {t(applied ? 'ticketCheckout.policy.appliedTitle' : 'ticketCheckout.policy.title', {
            name: t(`${key}.title`),
          })}
          :
        </span>{' '}
        {t(`${key}.description`)}
      </span>
    </p>
  );
}
