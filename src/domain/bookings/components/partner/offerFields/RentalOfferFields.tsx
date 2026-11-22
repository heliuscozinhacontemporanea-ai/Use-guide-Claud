import { type Control, Controller, type FieldErrors, type UseFormRegister } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { RadioCardGroup } from '../../../../../ui/components/RadioCardGroup';
import type { OfferFormInput } from '../../../schemas/offerFormSchema';
import { OfferNumberField } from './OfferNumberField';
import { OfferToggleField } from './OfferToggleField';
import { RentalPeriodsField } from './RentalPeriodsField';

interface RentalOfferFieldsProps {
  control: Control<OfferFormInput>;
  register: UseFormRegister<OfferFormInput>;
  errors: FieldErrors<OfferFormInput>;
  /** Veículos do anúncio: a oferta escolhe um (F3b). */
  vehicles: string[];
}

/** Aluguel (F3b): veículo, períodos fixos, horário personalizado, retirada e CNH. */
export function RentalOfferFields({ control, register, errors, vehicles }: RentalOfferFieldsProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-5">
      {vehicles.length === 0 ? (
        <p className="text-sm text-ink/70">{t('fleet.editor.noVehicles')}</p>
      ) : (
        <Controller
          control={control}
          name="vehicle"
          render={({ field }) => (
            <RadioCardGroup
              name={field.name}
              legend={t('fleet.editor.vehicleLegend')}
              options={vehicles.map((vehicle) => ({ value: vehicle, title: vehicle }))}
              value={field.value || undefined}
              onChange={field.onChange}
            />
          )}
        />
      )}
      {errors.vehicle?.message && (
        <p role="alert" className="text-xs text-danger">
          {t(errors.vehicle.message)}
        </p>
      )}

      <RentalPeriodsField control={control} register={register} errors={errors} />

      <OfferToggleField
        control={control}
        name="hourlyEnabled"
        title={t('fleet.editor.customLegend')}
        hint={t('fleet.editor.hourlyHint')}
      >
        <div className="grid grid-cols-2 gap-2">
          <OfferNumberField
            label={t('fleet.editor.minHours')}
            field={register('minHours')}
            error={errors.minHours?.message}
          />
          <OfferNumberField
            label={t('fleet.editor.hourlyPrice')}
            decimal
            field={register('hourlyAmount')}
            error={errors.hourlyAmount?.message}
          />
        </div>
      </OfferToggleField>

      <div className="grid grid-cols-2 gap-2">
        <OfferNumberField
          label={t('fleet.editor.peoplePerVehicle')}
          field={register('groupMaxPeople')}
          error={errors.groupMaxPeople?.message}
        />
        <OfferNumberField
          label={t('fleet.editor.maxVehicles')}
          field={register('maxParticipantsPerBooking')}
          error={errors.maxParticipantsPerBooking?.message}
        />
      </div>

      <Controller
        control={control}
        name="pickupMode"
        render={({ field }) => (
          <RadioCardGroup
            name={field.name}
            legend={t('fleet.editor.rentalPickupLegend')}
            options={[
              { value: 'meeting_point', title: t('fleet.editor.pickupStore') },
              { value: 'buyer_address', title: t('fleet.editor.pickupDelivery') },
            ]}
            value={field.value}
            onChange={field.onChange}
          />
        )}
      />
      <Controller
        control={control}
        name="requiresDriverLicense"
        render={({ field }) => (
          <RadioCardGroup
            name={field.name}
            legend={t('fleet.editor.licenseLegend')}
            options={[
              { value: 'yes', title: t('fleet.editor.yes') },
              { value: 'no', title: t('fleet.editor.no') },
            ]}
            value={field.value ? 'yes' : 'no'}
            onChange={(value) => field.onChange(value === 'yes')}
          />
        )}
      />
    </div>
  );
}
