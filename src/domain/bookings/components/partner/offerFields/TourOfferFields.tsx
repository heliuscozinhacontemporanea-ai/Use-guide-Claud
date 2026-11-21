import {
  type Control,
  Controller,
  type FieldErrors,
  type UseFormRegister,
  useWatch,
} from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { RadioCardGroup } from '../../../../../ui/components/RadioCardGroup';
import { INPUT } from '../../../../../ui/styles/controls';
import type { OfferFormInput } from '../../../schemas/offerFormSchema';
import { OfferPriceFields } from '../OfferPriceFields';
import { OfferSellingUnitFields } from '../OfferSellingUnitFields';
import { OfferDurationFields } from './OfferDurationFields';
import { OfferNumberField } from './OfferNumberField';

/** Passeio e entrada de atração: preços por pessoa, duração, ponto de encontro e venda por grupo. */
export function TourOfferFields({
  kind,
  control,
  register,
  errors,
}: {
  kind: 'tour' | 'private_entry';
  control: Control<OfferFormInput>;
  register: UseFormRegister<OfferFormInput>;
  errors: FieldErrors<OfferFormInput>;
}) {
  const { t } = useTranslation();
  // Na venda por grupo, o limite da reserva conta grupos, não pessoas (D20).
  const sellingUnit = useWatch({ control, name: 'sellingUnit' });
  const group = kind === 'tour' && sellingUnit === 'group';

  return (
    <div className="space-y-5">
      <OfferPriceFields control={control} register={register} errors={errors} />
      <OfferDurationFields
        legend={t('bookings.editor.durationLabel')}
        register={register}
        errors={errors}
      />
      <OfferNumberField
        label={t(
          group ? 'serviceProof.offerEditor.maxGroupsLabel' : 'bookings.editor.maxParticipantsLabel'
        )}
        field={register('maxParticipantsPerBooking')}
        error={errors.maxParticipantsPerBooking?.message}
      />
      <label className="block space-y-1">
        <span className="text-xs text-ink/70">{t('bookings.editor.meetingPointLabel')}</span>
        <input {...register('meetingPoint')} className={INPUT} />
      </label>
      {kind === 'tour' && (
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
      <OfferSellingUnitFields kind={kind} control={control} register={register} errors={errors} />
    </div>
  );
}
