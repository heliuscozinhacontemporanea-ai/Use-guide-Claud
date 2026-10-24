import { BadgeCheck } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useUI } from '../../../../shared/stores/useUIStore';
import { cn } from '../../../../shared/utils/cn';
import { setListingSealUseCase } from '../../application/usecases/setListingSealUseCase';
import { useListingPlan } from '../../hooks/useListingPlan';
import { getListingPlanErrorMessage } from '../../utils/listingPlanErrorMessage';
import { formatPlanDate, listingPlanChipStatus } from '../../utils/listingPlanStatus';

interface AdminListingSealControlProps {
  itemId: string;
  name: string;
}

/** Selo de um estabelecimento no painel admin (D8 por estabelecimento, D11). */
export function AdminListingSealControl({ itemId, name }: AdminListingSealControlProps) {
  const { t, i18n } = useTranslation();
  const { showToast, confirmAction } = useUI();
  const { data, loading, reload } = useListingPlan(itemId);
  const [saving, setSaving] = useState(false);
  const status = data ? listingPlanChipStatus(data) : 'none';
  const date = data?.planUntil ? formatPlanDate(data.planUntil, i18n.language) : '';
  const hasSeal = Boolean(data?.seal.isVerified && !data.sealSuspended);

  const toggle = async () => {
    const grant = !hasSeal;
    const confirmed = await confirmAction(
      t(grant ? 'listingPlan.admin.confirmGrant' : 'listingPlan.admin.confirmRevoke', { name }),
      {
        tone: grant ? 'positive' : 'danger',
        confirmLabel: t(grant ? 'listingPlan.admin.grant' : 'listingPlan.admin.revoke'),
      }
    );
    if (!confirmed) return;
    setSaving(true);
    try {
      const view = await setListingSealUseCase(itemId, grant);
      showToast(
        t(
          view.seal.isVerified || !grant
            ? grant
              ? 'listingPlan.admin.granted'
              : 'listingPlan.admin.revoked'
            : 'listingPlan.admin.grantedPendingVerification'
        ),
        'success'
      );
      await reload();
    } catch (err: unknown) {
      showToast(getListingPlanErrorMessage(err), 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-white/70">
        <BadgeCheck size={12} aria-hidden="true" />
        {loading
          ? t('listingPlan.dialog.loading')
          : status === 'none'
            ? t('listingPlan.admin.noPlan')
            : t(`listingPlan.chip.${status}`, { date })}
      </span>
      <button
        type="button"
        onClick={() => void toggle()}
        disabled={loading || saving}
        aria-label={t(hasSeal ? 'listingPlan.admin.revokeLabel' : 'listingPlan.admin.grantLabel', {
          name,
        })}
        className={cn(
          'press min-h-[44px] px-4 rounded-xl text-[10px] font-black uppercase tracking-widest disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-teal-400/50',
          hasSeal
            ? 'bg-seal-soft text-seal hover:bg-blue-500 hover:text-black'
            : 'bg-blue-500 text-black hover:bg-blue-400'
        )}
      >
        {t(hasSeal ? 'listingPlan.admin.revoke' : 'listingPlan.admin.grant')}
      </button>
    </div>
  );
}
