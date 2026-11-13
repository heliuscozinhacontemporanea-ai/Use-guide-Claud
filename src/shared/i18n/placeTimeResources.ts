/** Hora do lugar do serviço para quem está em outro fuso (D28). pt-BR é a fonte. */
export interface PlaceTimeTranslation {
  suffix: string;
  suffixLocal: string;
  formNote: string;
  formNoteLocal: string;
}

export const placeTimePtBR: PlaceTimeTranslation = {
  suffix: '(horário de {{place}})',
  suffixLocal: '(horário local)',
  formNote: 'Horários de {{place}} ({{offset}}).',
  formNoteLocal: 'Horários do local ({{offset}}).',
};
