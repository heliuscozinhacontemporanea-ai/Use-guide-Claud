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

export const placeTimeEn: PlaceTimeTranslation = {
  suffix: '({{place}} time)',
  suffixLocal: '(local time)',
  formNote: 'Times in {{place}} ({{offset}}).',
  formNoteLocal: 'Local times ({{offset}}).',
};

export const placeTimeFr: PlaceTimeTranslation = {
  suffix: '(heure de {{place}})',
  suffixLocal: '(heure locale)',
  formNote: 'Horaires de {{place}} ({{offset}}).',
  formNoteLocal: 'Horaires locaux ({{offset}}).',
};
