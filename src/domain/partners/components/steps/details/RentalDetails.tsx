import { ChipGroup, TextField, YesNoField } from './DetailFields';
import { type DetailsSectionProps, useDetailsForm } from './useDetailsForm';

const RENTAL_VEHICLE_OPTIONS = [
  'Quadriciclo',
  'Buggy',
  'UTV',
  'Bicicleta',
  'Bicicleta elétrica',
  'Stand up paddle',
  'Caiaque',
  'Equipamento de kitesurf',
] as const;

const RENTAL_INCLUDES_OPTIONS = ['Capacete', 'Combustível', 'Seguro', 'Colete', 'Mapa'] as const;

/** Campos da inscrição de aluguel: o turista usa o veículo ou equipamento por um período (decisão D9). */
export function RentalDetails(props: DetailsSectionProps) {
  const { formData, getFieldError, updateFieldValue, toggleInList } = useDetailsForm(props);

  return (
    <div className="space-y-8">
      <ChipGroup
        label="O que é alugado"
        options={RENTAL_VEHICLE_OPTIONS}
        selected={formData.rentalVehicles}
        onToggle={(value) => toggleInList('rentalVehicles', value)}
        required
        error={getFieldError('rentalVehicles')}
      />
      <TextField
        id="rental-min-hours"
        label="Período mínimo (horas)"
        inputMode="numeric"
        value={formData.minRentalHours}
        onChange={(value) => updateFieldValue('minRentalHours', value.replace(/\D/g, ''))}
        placeholder="Ex: 2"
        required
        error={getFieldError('minRentalHours')}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <YesNoField
          label="Exige caução"
          value={formData.depositRequired}
          onChange={(value) => updateFieldValue('depositRequired', value)}
        />
        <YesNoField
          label="Exige habilitação (CNH)"
          value={formData.driverLicenseRequired}
          onChange={(value) => updateFieldValue('driverLicenseRequired', value)}
        />
      </div>
      <ChipGroup
        label="O que está incluído"
        options={RENTAL_INCLUDES_OPTIONS}
        selected={formData.rentalIncludes}
        onToggle={(value) => toggleInList('rentalIncludes', value)}
      />
    </div>
  );
}
