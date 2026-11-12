/** Textos do campo de sessões do evento (parceiro e admin). pt-BR é a fonte. */
export interface EventSessionsTranslation {
  loading: string;
  loadError: string;
  title: string;
  add: string;
  session: string;
  remove: string;
  startsAt: string;
  endsAt: string;
  capacity: string;
  salesEndsAt: string;
  salesEndsHint: string;
  lotDates: {
    button: string;
    buttonAria: string;
    title: string;
    hint: string;
    startsAt: string;
    endsAt: string;
    clear: string;
    save: string;
    saving: string;
    saved: string;
    orderError: string;
    saveError: string;
    summary: string;
    fromNow: string;
    untilSession: string;
  };
}

export const eventSessionsPtBR: EventSessionsTranslation = {
  loading: 'Carregando as sessões do evento…',
  loadError:
    'Não foi possível carregar as sessões deste evento. Feche e abra o editor de novo antes de salvar.',
  title: 'Sessões do evento',
  add: 'Adicionar data',
  session: 'Sessão {{n}}',
  remove: 'Remover {{session}}',
  startsAt: 'Início',
  endsAt: 'Término',
  capacity: 'Capacidade máxima',
  salesEndsAt: 'Vendas pelo app até',
  salesEndsHint:
    'Sugerimos 2 h antes do início. Depois desse horário, a lista da portaria sem internet pode ser preparada.',
  lotDates: {
    button: 'Datas de venda',
    buttonAria: 'Datas de venda do lote {{name}}',
    title: 'Datas de venda · {{name}}',
    hint: 'Hora do local do evento. Sem início, o lote vende desde já; sem fim, vende até o encerramento das vendas da sessão.',
    startsAt: 'Início das vendas',
    endsAt: 'Fim das vendas',
    clear: 'Limpar',
    save: 'Salvar datas',
    saving: 'Salvando…',
    saved: 'Datas de venda do lote atualizadas.',
    orderError: 'O fim das vendas precisa ser depois do início.',
    saveError: 'Não foi possível salvar as datas. Tente de novo.',
    summary: 'Vendas: {{from}} até {{to}}',
    fromNow: 'desde já',
    untilSession: 'o fim das vendas da sessão',
  },
};

export const eventSessionsEn: EventSessionsTranslation = {
  loading: 'Loading the event sessions…',
  loadError: 'Could not load this event’s sessions. Close and reopen the editor before saving.',
  title: 'Event sessions',
  add: 'Add date',
  session: 'Session {{n}}',
  remove: 'Remove {{session}}',
  startsAt: 'Start',
  endsAt: 'End',
  capacity: 'Maximum capacity',
  salesEndsAt: 'App sales until',
  salesEndsHint:
    'We suggest 2 h before the start. After that time, the offline entrance list can be prepared.',
  lotDates: {
    button: 'Sale dates',
    buttonAria: 'Sale dates for tier {{name}}',
    title: 'Sale dates · {{name}}',
    hint: 'Time at the event location. With no start, the tier sells right away; with no end, it sells until the session stops selling.',
    startsAt: 'Sales start',
    endsAt: 'Sales end',
    clear: 'Clear',
    save: 'Save dates',
    saving: 'Saving…',
    saved: 'Tier sale dates updated.',
    orderError: 'Sales must end after they start.',
    saveError: 'Could not save the dates. Try again.',
    summary: 'Sales: {{from}} to {{to}}',
    fromNow: 'right away',
    untilSession: 'the end of session sales',
  },
};

export const eventSessionsFr: EventSessionsTranslation = {
  loading: 'Chargement des séances de l’événement…',
  loadError:
    'Impossible de charger les séances de cet événement. Fermez et rouvrez l’éditeur avant d’enregistrer.',
  title: 'Séances de l’événement',
  add: 'Ajouter une date',
  session: 'Séance {{n}}',
  remove: 'Supprimer {{session}}',
  startsAt: 'Début',
  endsAt: 'Fin',
  capacity: 'Capacité maximale',
  salesEndsAt: 'Ventes dans l’app jusqu’à',
  salesEndsHint:
    'Nous suggérons 2 h avant le début. Après cet horaire, la liste d’entrée hors ligne peut être préparée.',
  lotDates: {
    button: 'Dates de vente',
    buttonAria: 'Dates de vente du lot {{name}}',
    title: 'Dates de vente · {{name}}',
    hint: 'Heure du lieu de l’événement. Sans début, le lot se vend dès maintenant ; sans fin, jusqu’à la clôture des ventes de la séance.',
    startsAt: 'Début des ventes',
    endsAt: 'Fin des ventes',
    clear: 'Effacer',
    save: 'Enregistrer les dates',
    saving: 'Enregistrement…',
    saved: 'Dates de vente du lot mises à jour.',
    orderError: 'La fin des ventes doit être après le début.',
    saveError: 'Impossible d’enregistrer les dates. Réessayez.',
    summary: 'Ventes : {{from}} au {{to}}',
    fromNow: 'dès maintenant',
    untilSession: 'la fin des ventes de la séance',
  },
};
