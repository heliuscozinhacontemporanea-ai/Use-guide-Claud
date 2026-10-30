import {
  type Control,
  Controller,
  type FieldErrors,
  type UseFormRegister,
  useWatch,
} from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { RadioCardGroup } from '../../../../ui/components/RadioCardGroup';
import { INPUT } from '../../../../ui/styles/controls';
import type { OfferFormInput } from '../../schemas/offerFormSchema';

/** Venda por pessoa ou por grupo e nome por entrada (D20). Entrada de atração é sempre por pessoa. */
export function OfferSellingUnitFields({
  kind,
  control,
  register,
  errors,
}: {
  kind: OfferFormInput['kind'];
  control: Control<OfferFormInput>;
  register: UseFormRegister<OfferFormInput>;
  errors: FieldErrors<OfferFormInput>;
}) {
  const { t } = useTranslation();
  const unit = useWatch({ control, name: 'sellingUnit' });
  const group = kind === 'tour' && unit === 'group';

  return (
    <div className="space-y-3">
      {kind === 'tour' && (
        <Controller
          control={control}
          name="sellingUnit"
          render={({ field }) => (
            <RadioCardGroup
              name={field.name}
              legend={t('serviceProof.offerEditor.sellingUnitLegend')}
              options={[
                {
                  value: 'person',
                  title: t('serviceProof.offerEditor.perPerson'),
                  description: t('serviceProof.offerEditor.perPersonHint'),
                },
                {
                  value: 'group',
                  title: t('serviceProof.offerEditor.perGroup'),
                  description: t('serviceProof.offerEditor.perGroupHint'),
                },
              ]}
              value={field.value}
              onChange={field.onChange}
            />
          )}
        />
      )}
      {group ? (
        <label className="block space-y-1">
          <span className="text-xs text-ink/70">{t('serviceProof.offerEditor.groupMaxLabel')}</span>
          <input
            type="number"
            inputMode="numeric"
            {...register('groupMaxPeople')}
            className={INPUT}
          />
          {errors.groupMaxPeople?.message && (
            <span role="alert" className="text-xs text-danger">
              {t(errors.groupMaxPeople.message)}
            </span>
          )}
        </label>
      ) : (
        <label className="flex items-start gap-3 min-h-11">
          <input
            type="checkbox"
            {...register('requiresParticipantNames')}
            className="w-5 h-5 mt-0.5 accent-teal-400"
          />
          <span className="space-y-0.5">
            <span className="block text-sm text-ink/80">
              {t('bookings.editor.requireNamesLabel')}
            </span>
            <span className="block text-xs text-ink/70">
              {t('serviceProof.offerEditor.requireNamesHint')}
            </span>
          </span>
        </label>
      )}
    </div>
  );
}
