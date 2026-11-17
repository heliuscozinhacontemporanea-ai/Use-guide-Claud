import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useRef, useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useCancellationPolicyOptions } from '../../../../shared/hooks/useCancellationPolicyOptions';
import { RadioCardGroup } from '../../../../ui/components/RadioCardGroup';
import { INPUT } from '../../../../ui/styles/controls';
import {
  type OfferFormInput,
  type OfferFormValues,
  offerFormSchema,
} from '../../schemas/offerFormSchema';
import type { OfferFields } from '../../types/bookings';
import { getBookingErrorMessage } from '../../utils/bookingErrorMessage';
import { offerFormToFields } from '../../utils/offerFormMapping';
import { OfferDurationInput } from './OfferDurationInput';
import { OfferPriceFields } from './OfferPriceFields';
import { OfferSellingUnitFields } from './OfferSellingUnitFields';
import { OfferTextFields } from './OfferTextFields';

interface PartnerOfferEditorProps {
  defaultValues: OfferFormValues;
  /** Política da oferta já publicada: só pode trocar por uma igual ou mais flexível (D14). */
  publishedPolicy?: string;
  /** A página entrega o salvar à barra fixa, que tem o "Salvar" (F3, D33). */
  registerSave: (save: (() => void) | null) => void;
  onSubmit: (fields: OfferFields, kind: OfferFormValues['kind']) => Promise<void>;
}

/** Editor de oferta como página empilhada do painel; voltar descarta o que não foi salvo. */
export function PartnerOfferEditor({
  defaultValues,
  publishedPolicy,
  registerSave,
  onSubmit,
}: PartnerOfferEditorProps) {
  const { t } = useTranslation();
  // Translado ainda não é vendável (AVAILABLE_OFFER_KINDS); quando for, a família vem do tipo da oferta.
  const policyOptions = useCancellationPolicyOptions('booking', publishedPolicy);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<OfferFormInput, unknown, OfferFormValues>({
    resolver: zodResolver(offerFormSchema),
    defaultValues,
  });

  // Na venda por grupo, o limite da reserva conta grupos, não pessoas (D20).
  const sellingUnit = useWatch({ control, name: 'sellingUnit' });
  const group = defaultValues.kind === 'tour' && sellingUnit === 'group';

  // A barra pode ser tocada de novo enquanto a gravação anterior não voltou.
  const saving = useRef(false);
  const submit = handleSubmit(async (values) => {
    if (saving.current) return;
    saving.current = true;
    setSubmitError(null);
    try {
      await onSubmit(offerFormToFields(values), values.kind);
    } catch (error: unknown) {
      setSubmitError(getBookingErrorMessage(error));
    } finally {
      saving.current = false;
    }
  });
  const submitRef = useRef(submit);
  submitRef.current = submit;
  useEffect(() => {
    registerSave(() => void submitRef.current());
    return () => registerSave(null);
  }, [registerSave]);

  const durationError = errors.durationHours?.message ?? errors.durationMins?.message;
  const maxError = errors.maxParticipantsPerBooking?.message;

  return (
    <form onSubmit={submit} className="space-y-5" noValidate>
      <OfferTextFields register={register} errors={errors} />
      <OfferPriceFields control={control} register={register} errors={errors} />
      <fieldset className="space-y-1">
        <legend className="text-xs text-ink/70">{t('bookings.editor.durationLabel')}</legend>
        <div className="grid grid-cols-2 gap-3">
          <OfferDurationInput
            label={t('bookings.editor.durationHours')}
            unit="h"
            field={register('durationHours')}
            invalid={Boolean(durationError)}
          />
          <OfferDurationInput
            label={t('bookings.editor.durationMinutes')}
            unit="min"
            field={register('durationMins')}
            invalid={Boolean(durationError)}
          />
        </div>
        {durationError && (
          <span role="alert" className="block text-xs text-danger">
            {t(durationError)}
          </span>
        )}
      </fieldset>
      <label className="block space-y-1">
        <span className="text-xs text-ink/70">
          {t(
            group
              ? 'serviceProof.offerEditor.maxGroupsLabel'
              : 'bookings.editor.maxParticipantsLabel'
          )}
        </span>
        <input
          type="number"
          inputMode="numeric"
          {...register('maxParticipantsPerBooking')}
          className={INPUT}
        />
        {maxError && (
          <span role="alert" className="block text-xs text-danger">
            {t(maxError)}
          </span>
        )}
      </label>
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
    </form>
  );
}
