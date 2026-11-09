import { useTranslation } from 'react-i18next';
import { ChipGroup, type DetailOptions, TextField, YesNoField } from './DetailFields';
import type { FieldKey } from './detailKeys';
import { type DetailsSectionProps, useDetailsForm } from './useDetailsForm';

const BREAKFAST_TYPES: DetailOptions = {
  aLaCarte: 'A lá carte',
  american: 'Americano',
  buffet: 'Buffet',
  vegan: 'Vegano',
  vegetarian: 'Vegetariano',
  glutenFree: 'Glúten-free',
  italian: 'Italiano',
  asian: 'Asiático',
};

const AMENITIES: DetailOptions = {
  restaurant: 'Restaurante',
  roomService: 'Serviço de quarto',
  bar: 'Bar',
  reception24h: 'Recepção 24 horas',
  sauna: 'Sauna',
  gym: 'Academia',
  garden: 'Jardim',
  terrace: 'Terraço',
  airportShuttle: 'Transporte para o aeroporto',
  familyRooms: 'Quartos familiares',
  spa: 'Spa e centro de bem-estar',
  hotTub: 'Banheira de hidromassagem',
  freeWifi: 'Wi-Fi gratuito',
  airConditioning: 'Ar condicionado',
  waterPark: 'Parque aquático',
  evCharging: 'Estação de carregamento de veículos elétricos',
  pool: 'Piscina',
};

/** Campos da inscrição de hospedagem. */
export function HotelDetails(props: DetailsSectionProps) {
  const { t } = useTranslation();
  const { formData, getFieldError, updateFieldValue, toggleInList } = useDetailsForm(props);
  const f = (key: FieldKey) => t(`partnerSignup.details.fields.${key}`);

  return (
    <div className="space-y-5">
      <YesNoField
        label={f('servesBreakfast')}
        value={formData.servesBreakfast}
        onChange={(value) => updateFieldValue('servesBreakfast', value)}
        required
        error={getFieldError('servesBreakfast')}
      />
      {formData.servesBreakfast ? (
        <>
          <YesNoField
            label={f('breakfastIncluded')}
            value={formData.breakfastIncluded}
            onChange={(value) => updateFieldValue('breakfastIncluded', value)}
            yesLabel={f('breakfastIncludedYes')}
            noLabel={f('breakfastIncludedNo')}
            stacked
            required
            error={getFieldError('breakfastIncluded')}
          />
          {formData.breakfastIncluded === false ? (
            <TextField
              id="hotel-breakfast-price"
              label={f('breakfastPrice')}
              inputMode="decimal"
              prefix="R$"
              value={formData.breakfastPrice || ''}
              onChange={(value) => updateFieldValue('breakfastPrice', value)}
              placeholder="0,00"
              required
              error={getFieldError('breakfastPrice')}
            />
          ) : null}
          <ChipGroup
            label={f('breakfastTypes')}
            options={BREAKFAST_TYPES}
            selected={formData.breakfastTypes || []}
            onToggle={(value) => toggleInList('breakfastTypes', value)}
          />
        </>
      ) : null}
      <ChipGroup
        label={f('amenities')}
        options={AMENITIES}
        selected={formData.amenities || []}
        onToggle={(value) => toggleInList('amenities', value)}
      />
    </div>
  );
}
