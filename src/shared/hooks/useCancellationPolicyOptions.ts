import { useTranslation } from 'react-i18next';
import {
  type CancellationPolicyFamily,
  canChangeCancellationPolicy,
  policiesOf,
} from '../utils/cancellationPolicy';

/**
 * Opções de política da família, com título e descrição traduzidos. Com `publishedPolicy`, só ficam
 * habilitadas a atual e as mais flexíveis (D14).
 */
export function useCancellationPolicyOptions(
  family: CancellationPolicyFamily,
  publishedPolicy?: string
) {
  const { t } = useTranslation();
  return policiesOf(family).map((policy) => ({
    value: policy,
    title: t(`salesPolicy.policies.${family}.${policy}.title`),
    description: t(`salesPolicy.policies.${family}.${policy}.description`),
    disabled:
      publishedPolicy !== undefined &&
      !canChangeCancellationPolicy(family, publishedPolicy, policy),
  }));
}
