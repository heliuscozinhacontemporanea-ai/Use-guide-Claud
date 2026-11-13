import type { EventSessionsTranslation } from './eventSessionsResources';

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
