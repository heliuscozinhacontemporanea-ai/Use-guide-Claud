import { BadgeCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '../../../../shared/utils/cn';
import { useListingPlan } from '../../hooks/useListingPlan';
import {
  formatPlanDate,
  type ListingPlanChipStatus,
  listingPlanChipStatus,
} from '../../utils/listingPlanStatus';

const CHIP_STYLE: Record<ListingPlanChipStatus, string> = {
  none: 'bg-white/5 text-white/70 border-white/10',
  trial: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20',
  active: 'bg-teal-500/10 text-teal-300 border-teal-500/20',
  admin: 'bg-teal-500/10 text-teal-300 border-teal-500/20',
  suspended: 'bg-rose-500/10 text-rose-300 border-rose-500/20',
  pendingSeal: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
};

interface ListingPlanChipProps {
  itemId: string;
  name: string;
  onOpen: () => void;
}

export function ListingPlanChip({ itemId, name, onOpen }: ListingPlanChipProps) {
  const { t, i18n } = useTranslation();
  const { data, loading } = useListingPlan(itemId);
  const status = data ? listingPlanChipStatus(data) : 'none';
  const date = data?.planUntil ? formatPlanDate(data.planUntil, i18n.language) : '';
  const label = t(`listingPlan.chip.${status}`, { date });

  return (
    <button
      type="button"
      onClick={onOpen}
      disabled={loading}
      aria-label={t('listingPlan.chip.label', { name, status: label })}
      className={cn(
        'min-h-[44px] inline-flex items-center gap-1.5 px-3 rounded-xl border text-[10px] font-semibold transition-colors hover:bg-white/10 disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-teal-400/50',
        CHIP_STYLE[status]
      )}
    >
      <BadgeCheck size={12} aria-hidden="true" />
      {label}
    </button>
  );
}
