import { useTranslation } from 'react-i18next';
import { ChipGroup, type DetailOptions, TextField } from './DetailFields';
import type { FieldKey, PlaceholderKey } from './detailKeys';
import { type DetailsSectionProps, useDetailsForm } from './useDetailsForm';

const TOUR_INCLUDES: DetailOptions = {
  licensedGuide: 'Guia credenciado',
  transport: 'Transporte',
  waterSnack: 'Água e lanche',
  lunch: 'Almoço',
  stopTickets: 'Ingressos das paradas',
  equipment: 'Equipamentos',
  photos: 'Fotos',
  insurance: 'Seguro',
};

/** Campos da inscrição de passeio: atividade guiada com roteiro (decisão D9). */
export function TourDetails(props: DetailsSectionProps) {
  const { t } = useTranslation();
  const { formData, getFieldError, updateFieldValue, toggleInList } = useDetailsForm(props);
  const f = (key: FieldKey) => t(`partnerSignup.details.fields.${key}`);
  const p = (key: PlaceholderKey) => t(`partnerSignup.details.placeholders.${key}`);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <TextField
          id="tour-duration"
          label={f('tourDuration')}
          inputMode="decimal"
          value={formData.tourDurationHours}
          onChange={(value) => updateFieldValue('tourDurationHours', value)}
          placeholder={p('tourDuration')}
          required
          error={getFieldError('tourDurationHours')}
        />
        <TextField
          id="tour-meeting-point"
          label={f('meetingPoint')}
          value={formData.meetingPoint}
          onChange={(value) => updateFieldValue('meetingPoint', value)}
          placeholder={p('meetingPoint')}
          required
          error={getFieldError('meetingPoint')}
        />
      </div>
      <TextField
        id="tour-itinerary"
        label={f('itinerary')}
        multiline
        maxLength={2000}
        value={formData.itinerary}
        onChange={(value) => updateFieldValue('itinerary', value)}
        placeholder={p('itinerary')}
        error={getFieldError('itinerary')}
      />
      <ChipGroup
        label={f('includes')}
        options={TOUR_INCLUDES}
        selected={formData.tourIncludes}
        onToggle={(value) => toggleInList('tourIncludes', value)}
      />
    </div>
  );
}
