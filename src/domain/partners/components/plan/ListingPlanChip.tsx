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
  trial: 'bg-info-soft text-info border-info-line',
  active: 'bg-accent-soft text-accent border-accent-line',
  admin: 'bg-accent-soft text-accent border-accent-line',
  suspended: 'bg-danger-soft text-danger border-danger-line',
  pendingSeal: 'bg-warn-soft text-warn border-warn-line',
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
        'press min-h-[44px] inline-flex items-center gap-1.5 px-3 rounded-xl border text-[10px] font-semibold hover:bg-white/10 disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-teal-400/50',
        CHIP_STYLE[status]
      )}
    >
      <BadgeCheck size={12} aria-hidden="true" />
      {label}
    </button>
  );
}
