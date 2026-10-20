import { ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '../../../../shared/utils/cn';
import { useListingVerification } from '../../hooks/useListingVerification';
import { VERIFICATION_STATUS_STYLE } from './verificationStatusStyle';

interface VerificationStatusChipProps {
  itemId: string;
  name: string;
  onOpen: () => void;
}

export function VerificationStatusChip({ itemId, name, onOpen }: VerificationStatusChipProps) {
  const { t } = useTranslation();
  const { data, loading } = useListingVerification(itemId);
  const status = data?.status ?? 'not_submitted';
  const label = t(`verification.status.${status}`);

  return (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        onOpen();
      }}
      onKeyDown={(event) => event.stopPropagation()}
      disabled={loading}
      aria-label={t('verification.chipLabel', { name, status: label })}
      className={cn(
        'min-h-[44px] inline-flex items-center gap-1.5 px-3 rounded-xl border text-[10px] font-semibold transition-colors hover:bg-white/10 disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-teal-400/50',
        VERIFICATION_STATUS_STYLE[status]
      )}
    >
      <ShieldCheck size={12} aria-hidden="true" />
      {label}
    </button>
  );
}
