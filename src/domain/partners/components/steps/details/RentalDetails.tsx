import { useTranslation } from 'react-i18next';
import { ChipGroup, type DetailOptions, TextField, YesNoField } from './DetailFields';
import type { FieldKey } from './detailKeys';
import { type DetailsSectionProps, useDetailsForm } from './useDetailsForm';

const RENTAL_VEHICLES: DetailOptions = {
  quad: 'Quadriciclo',
  buggy: 'Buggy',
  utv: 'UTV',
  bike: 'Bicicleta',
  ebike: 'Bicicleta elétrica',
  sup: 'Stand up paddle',
  kayak: 'Caiaque',
  kiteGear: 'Equipamento de kitesurf',
};

const RENTAL_INCLUDES: DetailOptions = {
  helmet: 'Capacete',
  fuel: 'Combustível',
  insurance: 'Seguro',
  lifeVest: 'Colete',
  map: 'Mapa',
};

/** Campos da inscrição de aluguel: o turista usa o veículo ou equipamento por um período (decisão D9). */
export function RentalDetails(props: DetailsSectionProps) {
  const { t } = useTranslation();
  const { formData, getFieldError, updateFieldValue, toggleInList } = useDetailsForm(props);
  const f = (key: FieldKey) => t(`partnerSignup.details.fields.${key}`);

  return (
    <div className="space-y-5">
      <ChipGroup
        label={f('rentalWhat')}
        options={RENTAL_VEHICLES}
        selected={formData.rentalVehicles}
        onToggle={(value) => toggleInList('rentalVehicles', value)}
        error={getFieldError('rentalVehicles')}
      />
      <TextField
        id="rental-min-hours"
        label={f('minHours')}
        inputMode="numeric"
        value={formData.minRentalHours}
        onChange={(value) => updateFieldValue('minRentalHours', value.replace(/\D/g, ''))}
        placeholder={t('partnerSignup.details.placeholders.minHours')}
        error={getFieldError('minRentalHours')}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <YesNoField
          label={f('deposit')}
          value={formData.depositRequired}
          onChange={(value) => updateFieldValue('depositRequired', value)}
        />
        <YesNoField
          label={f('license')}
          value={formData.driverLicenseRequired}
          onChange={(value) => updateFieldValue('driverLicenseRequired', value)}
        />
      </div>
      <ChipGroup
        label={f('includes')}
        options={RENTAL_INCLUDES}
        selected={formData.rentalIncludes}
        onToggle={(value) => toggleInList('rentalIncludes', value)}
      />
    </div>
  );
}
