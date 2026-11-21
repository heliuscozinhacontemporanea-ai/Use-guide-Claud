import { Plus, Trash2 } from 'lucide-react';
import {
  type Control,
  Controller,
  type FieldErrors,
  type UseFormRegister,
  useFieldArray,
} from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { RadioCardGroup } from '../../../../../ui/components/RadioCardGroup';
import { BUTTON_SECONDARY } from '../../../../../ui/styles/controls';
import type { OfferFormInput } from '../../../schemas/offerFormSchema';
import { OfferDurationInput } from '../OfferDurationInput';
import { OfferNumberField } from './OfferNumberField';
import { OfferToggleField } from './OfferToggleField';

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
  const periods = useFieldArray({ control, name: 'periods' });
  const periodsError = errors.periods?.root?.message ?? errors.periods?.message;

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

      <fieldset className="space-y-3">
        <legend className="text-xs text-ink/70">
          {t('fleet.editor.periodsLegend')} {t('fleet.editor.optional')}
        </legend>
        <p className="text-xs text-ink/70">{t('fleet.editor.periodsHint')}</p>
        {periods.fields.map((period, index) => {
          const error = errors.periods?.[index];
          return (
            <div key={period.id} className="space-y-2 rounded-2xl border border-line p-3">
              <div className="grid grid-cols-2 gap-2">
                <OfferNumberField
                  label={t('fleet.editor.periodStart')}
                  type="time"
                  field={register(`periods.${index}.start`)}
                  error={error?.start?.message}
                />
                <OfferNumberField
                  label={t('fleet.editor.periodPrice')}
                  decimal
                  field={register(`periods.${index}.amount`)}
                  error={error?.amount?.message}
                />
              </div>
              <div className="grid grid-cols-[1fr_1fr_auto] gap-2 items-end">
                <OfferDurationInput
                  label={t('bookings.editor.durationHours')}
                  unit="h"
                  field={register(`periods.${index}.hours`)}
                  invalid={Boolean(error?.start)}
                />
                <OfferDurationInput
                  label={t('bookings.editor.durationMinutes')}
                  unit="min"
                  field={register(`periods.${index}.mins`)}
                  invalid={Boolean(error?.start)}
                />
                <button
                  type="button"
                  onClick={() => periods.remove(index)}
                  aria-label={t('fleet.editor.removePeriod')}
                  className={`${BUTTON_SECONDARY} w-11 flex items-center justify-center`}
                >
                  <Trash2 size={15} aria-hidden="true" />
                </button>
              </div>
            </div>
          );
        })}
        {periodsError && (
          <p role="alert" className="text-xs text-danger">
            {t(periodsError)}
          </p>
        )}
        <button
          type="button"
          onClick={() =>
            periods.append({
              id: `p${Date.now().toString(36)}`,
              start: '08:00',
              hours: 4,
              mins: 0,
              amount: '',
            })
          }
          disabled={periods.fields.length >= 12}
          className={BUTTON_SECONDARY}
        >
          <Plus size={13} className="inline mr-1" aria-hidden="true" />
          {t('fleet.editor.addPeriod')}
        </button>
      </fieldset>

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
