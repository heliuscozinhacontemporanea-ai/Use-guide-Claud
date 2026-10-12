import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  type OfferFormInput,
  type OfferFormValues,
  offerFormSchema,
} from '../../schemas/offerFormSchema';
import type { OfferFields } from '../../types/bookings';
import { getBookingErrorMessage } from '../../utils/bookingErrorMessage';
import { offerFormToFields } from '../../utils/offerFormMapping';
import { BUTTON_PRIMARY, BUTTON_SECONDARY, INPUT } from '../shared/ListState';
import { OfferPriceFields } from './OfferPriceFields';
import { OfferTextFields } from './OfferTextFields';

interface PartnerOfferEditorProps {
  mode: 'create' | 'edit';
  defaultValues: OfferFormValues;
  onSubmit: (fields: OfferFields, kind: OfferFormValues['kind']) => Promise<void>;
  onCancel: () => void;
}

export function PartnerOfferEditor({
  mode,
  defaultValues,
  onSubmit,
  onCancel,
}: PartnerOfferEditorProps) {
  const { t } = useTranslation();
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

  const submit = handleSubmit(async (values) => {
    setSubmitError(null);
    try {
      await onSubmit(offerFormToFields(values), values.kind);
    } catch (error: unknown) {
      setSubmitError(getBookingErrorMessage(error));
    }
  });

  const numberField = (
    name: 'durationMinutes' | 'freeCancellationHoursBefore' | 'maxParticipantsPerBooking',
    label: string
  ) => (
    <label className="block space-y-1">
      <span className="text-xs text-white/70">{label}</span>
      <input type="number" inputMode="numeric" {...register(name)} className={INPUT} />
      {errors[name]?.message && (
        <span role="alert" className="text-xs text-red-300">
          {t(errors[name]?.message ?? '')}
        </span>
      )}
    </label>
  );

  return (
    <form onSubmit={submit} className="space-y-5" noValidate>
      <h3 className="text-base font-bold text-white">
        {mode === 'create' ? t('bookings.editor.titleNew') : t('bookings.editor.titleEdit')}
      </h3>
      <OfferTextFields register={register} errors={errors} />
      <OfferPriceFields control={control} register={register} errors={errors} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {numberField('durationMinutes', t('bookings.editor.durationLabel'))}
        {numberField('maxParticipantsPerBooking', t('bookings.editor.maxParticipantsLabel'))}
      </div>
      <label className="block space-y-1">
        <span className="text-xs text-white/70">{t('bookings.editor.meetingPointLabel')}</span>
        <input {...register('meetingPoint')} className={INPUT} />
      </label>
      <fieldset className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <legend className="text-xs font-semibold text-white/70 mb-2">
          {t('bookings.editor.policyLegend')}
        </legend>
        {numberField('freeCancellationHoursBefore', t('bookings.editor.freeHoursLabel'))}
        <label className="block space-y-1">
          <span className="text-xs text-white/70">{t('bookings.editor.refundAfterLabel')}</span>
          <select {...register('refundPercentAfterDeadline')} className={INPUT}>
            <option value="0">{t('bookings.editor.refundNone')}</option>
            <option value="50">{t('bookings.editor.refundHalf')}</option>
            <option value="100">{t('bookings.editor.refundFull')}</option>
          </select>
        </label>
      </fieldset>
      <label className="flex items-center gap-3 min-h-11">
        <input
          type="checkbox"
          {...register('requiresParticipantNames')}
          className="w-5 h-5 accent-teal-400"
        />
        <span className="text-sm text-white/80">{t('bookings.editor.requireNamesLabel')}</span>
      </label>
      {submitError && (
        <p role="alert" className="text-xs text-red-300">
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
