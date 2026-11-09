import { useTranslation } from 'react-i18next';
import { ChipGroup, type DetailOptions, TextField, YesNoField } from './DetailFields';
import type { FieldKey } from './detailKeys';
import { type DetailsSectionProps, useDetailsForm } from './useDetailsForm';

const SERVICES: DetailOptions = {
  parking: 'Estacionamento',
  tourGuide: 'Guia Turístico',
  equipmentRental: 'Aluguel de Equipamentos',
};

const AMENITIES: DetailOptions = {
  pool: 'Piscina',
  restaurantBar: 'Restaurante/Bar',
  lockerRooms: 'Vestiários',
  freeWifi: 'Wi-Fi Gratuito',
  camping: 'Área de Acampamento',
  petsAllowed: 'Aceita Pets',
  accessibility: 'Acessibilidade',
  eventSpace: 'Espaço para Eventos',
};

const ACTIVITIES: DetailOptions = {
  trails: 'Trilhas',
  waterSports: 'Esportes Aquáticos',
  fishing: 'Pesca',
  boatTrips: 'Passeios de Barco',
  photography: 'Fotografia',
  birdwatching: 'Observação de Pássaros',
  ecotourism: 'Ecoturismo',
  swimming: 'Banho de Mar/Rio',
};

/** Campos da inscrição de atração. */
export function SightDetails(props: DetailsSectionProps) {
  const { t } = useTranslation();
  const { formData, getFieldError, updateFieldValue, toggleInList } = useDetailsForm(props);
  const f = (key: FieldKey) => t(`partnerSignup.details.fields.${key}`);
  const access = formData.sightAccessType;

  return (
    <div className="space-y-5">
      <YesNoField
        label={f('sightAccess')}
        value={access === 'pago' ? true : access === 'gratuito' ? false : null}
        onChange={(paid) => {
          updateFieldValue('sightAccessType', paid ? 'pago' : 'gratuito');
          if (!paid) updateFieldValue('sightPrice', '');
        }}
        yesLabel={f('paid')}
        noLabel={f('free')}
        error={getFieldError('sightAccessType')}
      />
      {access === 'pago' ? (
        <TextField
          id="sight-price"
          label={f('pricePerPerson')}
          inputMode="decimal"
          prefix="R$"
          value={formData.sightPrice || ''}
          onChange={(value) => updateFieldValue('sightPrice', value)}
          placeholder="0,00"
          error={getFieldError('sightPrice')}
        />
      ) : null}
      <ChipGroup
        label={f('sightServices')}
        options={SERVICES}
        selected={formData.sightServices || []}
        onToggle={(value) => toggleInList('sightServices', value)}
        error={getFieldError('sightServices')}
      />
      <ChipGroup
        label={f('sightAmenities')}
        options={AMENITIES}
        selected={formData.sightAmenities || []}
        onToggle={(value) => toggleInList('sightAmenities', value)}
      />
      <ChipGroup
        label={f('sightActivities')}
        hint={f('sightActivitiesHint')}
        options={ACTIVITIES}
        selected={formData.sightActivities || []}
        onToggle={(value) => toggleInList('sightActivities', value)}
        error={getFieldError('sightActivities')}
      />
    </div>
  );
}
