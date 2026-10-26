import { MessageSquareWarning } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { formatMoneyMinor } from '../../../../shared/utils/money';
import { useSaleClaimFor } from '../../hooks/mySaleClaimsContext';
import type { BuyerSaleClaim, ClaimableSale, SaleClaimStatus } from '../../types/saleClaims';
import { CLAIM_WINDOW_HOURS, isWithinClaimWindow } from '../../utils/claimWindow';
import { formatFortalezaDateTime } from '../../utils/receivablesFormat';
import { SaleClaimDialog } from './SaleClaimDialog';

const TONE: Record<SaleClaimStatus, string> = {
  open: 'bg-warn-soft text-warn border-warn-line',
  refund_pending: 'bg-info-soft text-info border-info-line',
  refunded: 'bg-success-soft text-success border-success-line',
  released: 'bg-surface text-ink/80 border-line',
  expired: 'bg-surface text-ink/80 border-line',
};

function ClaimStatus({ claim }: { claim: BuyerSaleClaim }) {
  const { t, i18n } = useTranslation();
  return (
    <p
      role="status"
      className={`px-3 py-2 rounded-xl border text-xs flex items-start gap-2 ${TONE[claim.status]}`}
    >
      <MessageSquareWarning size={14} className="shrink-0 mt-0.5" aria-hidden="true" />
      <span>
        <span className="font-bold">{t(`saleClaims.status.${claim.status}`)}</span>{' '}
        {t(`saleClaims.statusDetail.${claim.status}`, {
          date: formatFortalezaDateTime(claim.decideBy, i18n.language),
          amount: formatMoneyMinor(claim.refundAmountMinor ?? 0, i18n.language),
        })}
      </span>
    </p>
  );
}

/** "Relatar problema" do início do serviço até 48 h depois do fim (D16, 2A); depois, o status. */
export function SaleClaimAction({ sale }: { sale: ClaimableSale }) {
  const { t, i18n } = useTranslation();
  const { claim, add } = useSaleClaimFor(sale.referenceType, sale.referenceId);
  const [open, setOpen] = useState(false);

  if (claim) return <ClaimStatus claim={claim} />;
  if (claim === undefined || !isWithinClaimWindow(sale, new Date())) return null;

  const until = new Date(
    new Date(sale.serviceEndsAt).getTime() + CLAIM_WINDOW_HOURS * 3_600_000
  ).toISOString();
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="press min-h-11 px-3.5 rounded-xl border border-warn-line bg-warn-soft text-xs font-bold text-warn flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-teal-400/50"
      >
        <MessageSquareWarning size={14} aria-hidden="true" />
        {t('saleClaims.action')}
      </button>
      <span className="text-[11px] text-ink/70">
        {t('saleClaims.until', { date: formatFortalezaDateTime(until, i18n.language) })}
      </span>
      <SaleClaimDialog
        sale={sale}
        open={open}
        onClose={() => setOpen(false)}
        onOpened={(created) => {
          setOpen(false);
          add(created);
        }}
      />
    </div>
  );
}
