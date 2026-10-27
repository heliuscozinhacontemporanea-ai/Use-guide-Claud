import { MessageSquareWarning } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { formatMoneyMinor } from '../../../../shared/utils/money';
import { StatusText, type StatusTone } from '../../../../ui/components/StatusText';
import { TextButton } from '../../../../ui/components/TextButton';
import { useSaleClaimFor } from '../../hooks/mySaleClaimsContext';
import type { ClaimableSale, SaleClaimStatus } from '../../types/saleClaims';
import { CLAIM_WINDOW_HOURS, isWithinClaimWindow } from '../../utils/claimWindow';
import { formatFortalezaDay } from '../../utils/receivablesFormat';
import { SaleClaimDialog } from './SaleClaimDialog';

const TONE: Record<SaleClaimStatus, StatusTone> = {
  open: 'warn',
  refund_pending: 'info',
  refunded: 'success',
  released: 'muted',
  expired: 'muted',
};

/** "Relatar" do início do serviço até 48 h depois do fim (D16, 2A); depois, o status em uma linha. */
export function SaleClaimAction({ sale }: { sale: ClaimableSale }) {
  const { t, i18n } = useTranslation();
  const { claim, add } = useSaleClaimFor(sale.referenceType, sale.referenceId);
  const [open, setOpen] = useState(false);

  if (claim) {
    return (
      <StatusText tone={TONE[claim.status]}>
        {t(`saleClaims.line.${claim.status}`, {
          date: formatFortalezaDay(claim.decideBy, i18n.language),
          amount: formatMoneyMinor(claim.refundAmountMinor ?? 0, i18n.language),
        })}
      </StatusText>
    );
  }
  if (claim === undefined || !isWithinClaimWindow(sale, new Date())) return null;

  const until = new Date(
    new Date(sale.serviceEndsAt).getTime() + CLAIM_WINDOW_HOURS * 3_600_000
  ).toISOString();
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-[13px] text-ink/70">
        {t('saleClaims.prompt', { date: formatFortalezaDay(until, i18n.language) })}
      </span>
      <TextButton tone="warn" onClick={() => setOpen(true)} aria-label={t('saleClaims.action')}>
        <MessageSquareWarning size={16} aria-hidden="true" />
        {t('saleClaims.actionShort')}
      </TextButton>
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
