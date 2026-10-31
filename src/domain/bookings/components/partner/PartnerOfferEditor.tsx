import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useCancellationPolicyOptions } from '../../../../shared/hooks/useCancellationPolicyOptions';
import { RadioCardGroup } from '../../../../ui/components/RadioCardGroup';
import {
  type OfferFormInput,
  type OfferFormValues,
  offerFormSchema,
} from '../../schemas/offerFormSchema';
import type { OfferFields } from '../../types/bookings';
import { getBookingErrorMessage } from '../../utils/bookingErrorMessage';
import { offerFormToFields } from '../../utils/offerFormMapping';
import { BUTTON_PRIMARY, BUTTON_SECONDARY, INPUT } from '../../../../ui/styles/controls';
import { OfferPriceFields } from './OfferPriceFields';
import { OfferSellingUnitFields } from './OfferSellingUnitFields';
import { OfferTextFields } from './OfferTextFields';

interface PartnerOfferEditorProps {
  mode: 'create' | 'edit';
  defaultValues: OfferFormValues;
  /** Política da oferta já publicada: só pode trocar por uma igual ou mais flexível (D14). */
  publishedPolicy?: string;
  onSubmit: (fields: OfferFields, kind: OfferFormValues['kind']) => Promise<void>;
  onCancel: () => void;
}

export function PartnerOfferEditor({
  mode,
  defaultValues,
  publishedPolicy,
  onSubmit,
  onCancel,
}: PartnerOfferEditorProps) {
  const { t } = useTranslation();
  // Translado ainda não é vendável (AVAILABLE_OFFER_KINDS); quando for, a família vem do tipo da oferta.
  const policyOptions = useCancellationPolicyOptions('booking', publishedPolicy);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<OfferFormInput, unknown, OfferFormValues>({
    resolver: zodResolver(offerFormSchema),
    defaultValues,
  });

  // Na venda por grupo, o limite da reserva conta grupos, não pessoas (D20).
  const sellingUnit = useWatch({ control, name: 'sellingUnit' });
  const group = defaultValues.kind === 'tour' && sellingUnit === 'group';

  const submit = handleSubmit(async (values) => {
    setSubmitError(null);
    try {
      await onSubmit(offerFormToFields(values), values.kind);
    } catch (error: unknown) {
      setSubmitError(getBookingErrorMessage(error));
    }
  });

  const numberField = (name: 'durationMinutes' | 'maxParticipantsPerBooking', label: string) => (
    <label className="block space-y-1">
      <span className="text-xs text-ink/70">{label}</span>
      <input type="number" inputMode="numeric" {...register(name)} className={INPUT} />
      {errors[name]?.message && (
        <span role="alert" className="text-xs text-danger">
          {t(errors[name]?.message ?? '')}
        </span>
      )}
    </label>
  );

  return (
    <form onSubmit={submit} className="space-y-5" noValidate>
      <h3 className="text-base font-bold text-ink">
        {mode === 'create' ? t('bookings.editor.titleNew') : t('bookings.editor.titleEdit')}
      </h3>
      <OfferTextFields register={register} errors={errors} />
      <OfferPriceFields control={control} register={register} errors={errors} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {numberField('durationMinutes', t('bookings.editor.durationLabel'))}
        {numberField(
          'maxParticipantsPerBooking',
          t(
            group
              ? 'serviceProof.offerEditor.maxGroupsLabel'
              : 'bookings.editor.maxParticipantsLabel'
          )
        )}
      </div>
      <label className="block space-y-1">
        <span className="text-xs text-ink/70">{t('bookings.editor.meetingPointLabel')}</span>
        <input {...register('meetingPoint')} className={INPUT} />
      </label>
      {defaultValues.kind === 'tour' && (
        <Controller
          control={control}
          name="pickupMode"
          render={({ field }) => (
            <RadioCardGroup
              name={field.name}
              legend={t('serviceProof.offerEditor.pickupLegend')}
              options={[
                { value: 'meeting_point', title: t('serviceProof.offerEditor.meetingPoint') },
                { value: 'buyer_address', title: t('serviceProof.offerEditor.buyerAddress') },
              ]}
              value={field.value}
              onChange={field.onChange}
            />
          )}
        />
      )}
      <Controller
        control={control}
        name="cancellationPolicy"
        render={({ field }) => (
          <RadioCardGroup
            name={field.name}
            legend={t('salesPolicy.policyLegend')}
            hint={publishedPolicy ? t('salesPolicy.lockedHint') : undefined}
            options={policyOptions}
            value={field.value}
            onChange={field.onChange}
          />
        )}
      />
      <p className="text-xs text-ink/70">{t('salesPolicy.withdrawalNoFee')}</p>
      <OfferSellingUnitFields
        kind={defaultValues.kind}
        control={control}
        register={register}
        errors={errors}
      />
      {submitError && (
        <p role="alert" className="text-xs text-danger">
          {submitError}
        </p>
      )}
      <div className="flex flex-wrap gap-2 justify-end">
        <button type="button" onClick={onCancel} className={BUTTON_SECONDARY}>
          {t('bookings.editor.cancel')}
        </button>
        <button type="submit" disabled={isSubmitting} className={BUTTON_PRIMARY}>
          {t('bookings.editor.save')}
        </button>
      </div>
    </form>
  );
}
