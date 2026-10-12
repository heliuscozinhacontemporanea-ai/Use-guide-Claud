import { ChipGroup, TextField } from './DetailFields';
import { type DetailsSectionProps, useDetailsForm } from './useDetailsForm';

const TOUR_INCLUDES_OPTIONS = [
  'Guia credenciado',
  'Transporte',
  'Água e lanche',
  'Almoço',
  'Ingressos das paradas',
  'Equipamentos',
  'Fotos',
  'Seguro',
] as const;

/** Campos da inscrição de passeio: atividade guiada com roteiro (decisão D9). */
export function TourDetails(props: DetailsSectionProps) {
  const { formData, getFieldError, updateFieldValue, toggleInList } = useDetailsForm(props);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TextField
          id="tour-duration"
          label="Duração (horas)"
          inputMode="decimal"
          value={formData.tourDurationHours}
          onChange={(value) => updateFieldValue('tourDurationHours', value)}
          placeholder="Ex: 4"
          required
          error={getFieldError('tourDurationHours')}
        />
        <TextField
          id="tour-meeting-point"
          label="Ponto de encontro"
          value={formData.meetingPoint}
          onChange={(value) => updateFieldValue('meetingPoint', value)}
          placeholder="Ex: Em frente à Igreja de Jeri"
          required
          error={getFieldError('meetingPoint')}
        />
      </div>
      <TextField
        id="tour-itinerary"
        label="Roteiro"
        multiline
        maxLength={2000}
        value={formData.itinerary}
        onChange={(value) => updateFieldValue('itinerary', value)}
        placeholder="Paradas, horários e o que o turista vai ver"
        error={getFieldError('itinerary')}
      />
      <ChipGroup
        label="O que está incluído"
        options={TOUR_INCLUDES_OPTIONS}
        selected={formData.tourIncludes}
        onToggle={(value) => toggleInList('tourIncludes', value)}
      />
    </div>
  );
}
