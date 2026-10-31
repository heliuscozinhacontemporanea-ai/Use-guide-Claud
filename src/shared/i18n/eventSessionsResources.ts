/** Textos do campo de sessões do evento (parceiro e admin). pt-BR é a fonte. */
export interface EventSessionsTranslation {
  loading: string;
  loadError: string;
  title: string;
  timezone: string;
  add: string;
  session: string;
  remove: string;
  startsAt: string;
  endsAt: string;
  capacity: string;
  salesEndsAt: string;
  salesEndsHint: string;
}

export const eventSessionsPtBR: EventSessionsTranslation = {
  loading: 'Carregando as sessões do evento…',
  loadError:
    'Não foi possível carregar as sessões deste evento. Feche e abra o editor de novo antes de salvar.',
  title: 'Sessões do evento',
  timezone: 'Horários no fuso de Fortaleza (UTC−3).',
  add: 'Adicionar data',
  session: 'Sessão {{n}}',
  remove: 'Remover {{session}}',
  startsAt: 'Início',
  endsAt: 'Término',
  capacity: 'Capacidade máxima',
  salesEndsAt: 'Vendas pelo app até',
  salesEndsHint:
    'Sugerimos 2 h antes do início. Depois desse horário, a lista da portaria sem internet pode ser preparada.',
};

export const eventSessionsEn: EventSessionsTranslation = {
  loading: 'Loading the event sessions…',
  loadError: 'Could not load this event’s sessions. Close and reopen the editor before saving.',
  title: 'Event sessions',
  timezone: 'Times in the Fortaleza time zone (UTC−3).',
  add: 'Add date',
  session: 'Session {{n}}',
  remove: 'Remove {{session}}',
  startsAt: 'Start',
  endsAt: 'End',
  capacity: 'Maximum capacity',
  salesEndsAt: 'App sales until',
  salesEndsHint:
    'We suggest 2 h before the start. After that time, the offline entrance list can be prepared.',
};

export const eventSessionsFr: EventSessionsTranslation = {
  loading: 'Chargement des séances de l’événement…',
  loadError:
    'Impossible de charger les séances de cet événement. Fermez et rouvrez l’éditeur avant d’enregistrer.',
  title: 'Séances de l’événement',
  timezone: 'Horaires au fuseau de Fortaleza (UTC−3).',
  add: 'Ajouter une date',
  session: 'Séance {{n}}',
  remove: 'Supprimer {{session}}',
  startsAt: 'Début',
  endsAt: 'Fin',
  capacity: 'Capacité maximale',
  salesEndsAt: 'Ventes dans l’app jusqu’à',
  salesEndsHint:
    'Nous suggérons 2 h avant le début. Après cet horaire, la liste d’entrée hors ligne peut être préparée.',
};
