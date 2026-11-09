import { useTranslation } from 'react-i18next';
import { ChipGroup, type DetailOptions, TextField } from './DetailFields';
import type { FieldKey, PlaceholderKey } from './detailKeys';
import { type DetailsSectionProps, useDetailsForm } from './useDetailsForm';

const MEAL_TYPES: DetailOptions = {
  breakfast: 'Café da Manhã',
  buffet: 'Buffet',
  lunch: 'Almoço',
  dinner: 'Jantar',
  snacks: 'Petiscos',
  drinks: 'Drinks',
  wines: 'Vinhos',
};

const EXTRA_SERVICES: DetailOptions = {
  delivery: 'Delivery',
  onlineBooking: 'Reservas Online',
  liveMusic: 'Música ao Vivo',
  privateEvents: 'Eventos Privados',
};

const AMENITIES: DetailOptions = {
  freeWifi: 'Wi-Fi Gratuito',
  airConditioning: 'Ar Condicionado',
  beachfront: 'Pé na areia',
  outdoorArea: 'Área Externa/Jardim',
  parking: 'Estacionamento',
  accessibility: 'Acessibilidade',
  petsAllowed: 'Aceita Pets',
};

/** Campos da inscrição de restaurante (o cardápio é só por link). */
export function RestaurantDetails(props: DetailsSectionProps) {
  const { t } = useTranslation();
  const { formData, getFieldError, updateFieldValue, toggleInList } = useDetailsForm(props);
  const f = (key: FieldKey) => t(`partnerSignup.details.fields.${key}`);
  const p = (key: PlaceholderKey) => t(`partnerSignup.details.placeholders.${key}`);

  return (
    <div className="space-y-5">
      <TextField
        id="restaurant-menu-link"
        label={f('menuLink')}
        inputMode="url"
        value={formData.menuLink || ''}
        onChange={(value) => updateFieldValue('menuLink', value)}
        placeholder="https://"
        error={getFieldError('menuLink')}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <TextField
          id="restaurant-subcategory"
          label={f('subcategory')}
          value={formData.subcategory || ''}
          onChange={(value) => updateFieldValue('subcategory', value)}
          placeholder={p('subcategory')}
          required
          error={getFieldError('subcategory')}
        />
        <TextField
          id="restaurant-cuisine"
          label={f('cuisine')}
          value={formData.cuisineType || ''}
          onChange={(value) => updateFieldValue('cuisineType', value)}
          placeholder={p('cuisine')}
          error={getFieldError('cuisineType')}
        />
      </div>
      <ChipGroup
        label={f('mealTypes')}
        options={MEAL_TYPES}
        selected={formData.mealTypes || []}
        onToggle={(value) => toggleInList('mealTypes', value)}
        error={getFieldError('mealTypes')}
      />
      <ChipGroup
        label={f('extraServices')}
        options={EXTRA_SERVICES}
        selected={formData.additionalServices || []}
        onToggle={(value) => toggleInList('additionalServices', value)}
      />
      <ChipGroup
        label={f('amenities')}
        options={AMENITIES}
        selected={formData.amenitiesRestaurant || []}
        onToggle={(value) => toggleInList('amenitiesRestaurant', value)}
      />
    </div>
  );
}
