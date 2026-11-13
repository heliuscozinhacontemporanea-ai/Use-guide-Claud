import type { TicketSessionsTranslation } from './ticketSessionsResources';

export const ticketSessionsFr: TicketSessionsTranslation = {
  sheet: {
    sold: 'Vendus',
    soldTickets: 'Billets vendus',
    entered: 'Entrés',
    enteredOf: '{{entered}} sur {{total}}',
    openGate: 'Ouvrir l’accueil',
    postpone: 'Reporter la séance',
    cancel: 'Annuler la séance',
    gateTitle: 'Accueil',
    openGateMode: 'Ouvrir le mode accueil',
    offlineHint:
      'Sans internet, l’accueil continue de vérifier les QR codes et envoie les entrées au retour de la connexion.',
    error: 'Impossible de charger la séance.',
  },
  postpone: 'Reporter la séance',
  cancel: 'Annuler la séance',
  statusPostponed: 'Séance reportée',
  statusCanceled: 'Séance annulée',
  accountNotice:
    'Vente de billets payants indisponible : terminez la configuration financière du CNPJ de l’établissement de cet événement. Les inscriptions gratuites fonctionnent normalement.',
  entries: {
    title: 'Entrées',
    open: 'Voir qui est entré',
    count_one: '{{count}} entrée',
    count_other: '{{count}} entrées',
    empty: "Personne n'est encore entré.",
    error: 'Impossible de charger les entrées.',
    buyer: 'Acheteur',
    guest: 'Invité',
    guestTag: 'invité',
    offline: 'enregistrée hors ligne',
    method: { qr: 'QR', code: 'Code' },
  },
  postponeDialog: {
    title: 'Reporter la séance',
    description:
      'Les billets restent valables à la nouvelle date, sans pénalité pour vous. Chaque acheteur est prévenu et a 7 jours pour demander un remboursement intégral, frais de service compris.',
    newStart: 'Nouvelle date et heure de début',
    durationKept: 'La séance garde la même durée.',
    reason: 'Motif',
    reasonHint: 'Visible dans l’avis aux acheteurs. De 3 à 300 caractères.',
    submit: 'Reporter la séance',
    invalid: 'Indiquez une date future et le motif.',
    done_one: 'Séance reportée. {{count}} commande reste valable à la nouvelle date.',
    done_other: 'Séance reportée. {{count}} commandes restent valables à la nouvelle date.',
  },
  cancelDialog: {
    title: 'Annuler la séance',
    noSales: 'Cette séance n’a aucun billet payé. L’annuler met fin à ses ventes.',
    withSales_one:
      'Cette séance a {{count}} commande payée. Elle sera remboursée intégralement, frais de service compris.',
    withSales_other:
      'Cette séance a {{count}} commandes payées. Toutes seront remboursées intégralement, frais de service compris.',
    penalty:
      'Votre CNPJ paie une pénalité de 20 % du montant vendu, avec 24 h pour payer dans Versements › Dettes. Ensuite, la pénalité est déduite des versements et les ventes du CNPJ sont suspendues.',
    forceMajeure:
      'C’était un cas de force majeure (ex. : vent ou fermeture par les autorités) ? Déclarez-le dans Versements › Dettes avant l’échéance : la pénalité est suspendue jusqu’à l’examen.',
    reason: 'Motif de l’annulation',
    reasonHint: 'Visible dans l’avis aux acheteurs. De 3 à 300 caractères.',
    postponeInstead: 'Reporter plutôt',
    confirm: 'Annuler la séance',
    back: 'Retour',
    invalid: 'Indiquez le motif de l’annulation.',
    done: 'Séance annulée. Les remboursements ont commencé.',
  },
  failed: 'Impossible de terminer maintenant. Réessayez.',
};
