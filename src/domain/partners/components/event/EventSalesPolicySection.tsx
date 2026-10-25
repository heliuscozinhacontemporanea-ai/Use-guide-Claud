import { ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useCancellationPolicyOptions } from '../../../../shared/hooks/useCancellationPolicyOptions';
import type { EventCancellationPolicy } from '../../../../shared/utils/cancellationPolicy';
import { RadioCardGroup } from '../../../../ui/components/RadioCardGroup';
import { DEFAULT_EVENT_SALES_POLICY, type ServiceFeeMode } from '../../../events';
import type { EventSectionProps } from './eventSectionProps';

/** Política de cancelamento da plataforma e quem paga a taxa de serviço (D14). */
export function EventSalesPolicySection({ item, onChange }: EventSectionProps) {
  const { t } = useTranslation();
  const policy = item.salesPolicy ?? DEFAULT_EVENT_SALES_POLICY;
  const policyOptions = useCancellationPolicyOptions('event', item.publishedCancellationPolicy);
  const update = (patch: Partial<typeof policy>) =>
    onChange({ ...item, salesPolicy: { ...policy, ...patch } });

  return (
    <div className="space-y-6 pt-4 border-t border-line">
      <div className="flex items-center gap-2">
        <span className="p-2 rounded-xl bg-surface border border-line text-indigo-400">
          <ShieldCheck size={18} aria-hidden="true" />
        </span>
        <h3 className="text-sm font-black text-ink uppercase tracking-widest">
          {t('salesPolicy.policyLegend')}
        </h3>
      </div>
      <RadioCardGroup<string>
        name="event-cancellation-policy"
        legend={t('salesPolicy.policyLegend')}
        hint={item.publishedCancellationPolicy ? t('salesPolicy.lockedHint') : undefined}
        options={policyOptions}
        value={policy.cancellationPolicy}
        onChange={(value) => update({ cancellationPolicy: value as EventCancellationPolicy })}
      />
      <p className="text-xs text-ink/70">{t('salesPolicy.withdrawal')}</p>
      <RadioCardGroup<ServiceFeeMode>
        name="event-service-fee-mode"
        legend={t('salesPolicy.serviceFee.legend')}
        options={[
          {
            value: 'pass_to_buyer',
            title: t('salesPolicy.serviceFee.passToBuyer.title'),
            description: t('salesPolicy.serviceFee.passToBuyer.description'),
          },
          {
            value: 'absorb',
            title: t('salesPolicy.serviceFee.absorb.title'),
            description: t('salesPolicy.serviceFee.absorb.description'),
          },
        ]}
        value={policy.serviceFeeMode}
        onChange={(value) => update({ serviceFeeMode: value })}
      />
    </div>
  );
}
