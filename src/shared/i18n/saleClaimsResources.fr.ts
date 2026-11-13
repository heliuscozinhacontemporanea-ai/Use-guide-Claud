import type { SaleClaimsTranslation } from './saleClaimsResources';

export const saleClaimsFr: SaleClaimsTranslation = {
  action: 'Signaler un problème',
  actionShort: 'Signaler',
  prompt: 'Un souci ? Jusqu’au {{date}}',
  dialog: {
    title: 'Signaler un problème',
    description:
      'Dites-nous ce qui s’est passé. Le paiement de l’organisateur est retenu jusqu’à notre examen, sous 5 jours.',
    reasonLabel: 'Que s’est-il passé ?',
    reasonRequired: 'Choisissez ce qui s’est passé.',
    detailsLabel: 'Détails (facultatif)',
    detailsHint: 'Jusqu’à {{max}} caractères. N’indiquez ni documents ni données de carte.',
    submit: 'Envoyer le signalement',
    sending: 'Envoi…',
  },
  reason: {
    did_not_happen: 'Cela n’a pas eu lieu',
    not_as_described: 'Différent de l’annonce',
    changed_without_notice: 'Modifié sans prévenir',
    safety_issue: 'Problème de sécurité',
    other: 'Autre motif',
  },
  line: {
    open: 'Problème en cours d’examen · réponse avant le {{date}}',
    refund_pending: 'Remboursement en cours',
    refunded: 'Remboursé {{amount}}',
    released: 'Examen terminé, sans remboursement',
    expired: 'Examen clos, sans remboursement',
  },
  errors: {
    NOT_FOUND: 'Achat introuvable.',
    CLAIM_NOT_ALLOWED: 'Cet achat n’a aucun montant à réclamer.',
    CLAIM_TOO_EARLY: 'Avant le début, annulez plutôt l’achat.',
    CLAIM_WINDOW_CLOSED: 'Le signalement devait être fait dans les 48 h après la fin.',
    CLAIM_ALREADY_EXISTS: 'Vous avez déjà signalé un problème pour cet achat.',
    UNAVAILABLE: 'Envoi impossible pour le moment. Réessayez.',
  },
};
