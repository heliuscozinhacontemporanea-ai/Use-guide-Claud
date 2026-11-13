import type { ListingPlanTranslation } from './listingPlanResources';

export const listingPlanFr: ListingPlanTranslation = {
  chip: {
    active: "Badge jusqu'au {{date}}",
    trial: "Essai gratuit jusqu'au {{date}}",
    admin: "Badge de l'équipe",
    suspended: 'Badge suspendu',
    pendingSeal: 'Offre active, badge après la vérification',
    none: 'Obtenir le badge',
  },
  planNames: {
    trial: 'Essai gratuit',
    monthly: 'Mensuel',
    'semi-annual': 'Semestriel',
    annual: 'Annuel',
    admin: "Accordé par l'équipe",
  },
  dialog: {
    title: 'Use Guide Vérifié',
    close: 'Fermer',
    loading: "Chargement de l'offre…",
    retry: 'Réessayer',
  },
  status: {
    activeUntil: "Offre {{plan}} active jusqu'au {{date}}.",
    adminGranted: "Badge accordé par l'équipe Use Guide.",
    none: "Cet établissement n'a pas encore d'offre.",
    sealOn: "Le badge s'affiche sur l'établissement et sur ses événements.",
    sealPendingVerification:
      "Le badge s'affiche une fois la vérification de l'établissement approuvée par l'équipe.",
    sealSuspended: "L'équipe Use Guide a retiré le badge. L'offre reste active.",
  },
  benefits: {
    title: "L'offre comprend",
    seal: "Badge « Use Guide Vérifié » sur l'établissement et sur ses événements",
    metrics: 'Statistiques de vues et de clics',
    featured: 'Rotation quotidienne dans les places « À la une » en haut de la liste',
    reviews: 'Les avis et les réponses restent disponibles, avec ou sans offre',
  },
  verificationRequired:
    "Pour activer une offre, envoyez la vérification de cet établissement et attendez l'approbation de l'équipe.",
  verifyAction: "Vérifier l'établissement",
  options: {
    title: 'Choisissez la période',
    trialName: 'Essai gratuit de 7 jours',
    trialHint: "Une fois par compte, sur l'établissement de votre choix.",
    free: 'Gratuit',
    perMonth: '{{amount}}/mois',
    empty: 'Aucune offre disponible pour le moment.',
  },
  actions: {
    activateTrial: 'Activer 7 jours gratuits',
    continue: 'Passer au paiement',
    processing: 'Traitement…',
  },
  trialActivated: "Essai gratuit actif jusqu'au {{date}}.",
  checkoutName: 'Use Guide Vérifié · {{plan}} · {{name}}',
  admin: {
    grant: 'Accorder le badge',
    revoke: 'Retirer le badge',
    grantLabel: 'Accorder le badge à {{name}}',
    revokeLabel: 'Retirer le badge de {{name}}',
    confirmGrant: "Accorder le badge à {{name}} ? Une offre payante en cours n'est pas modifiée.",
    confirmRevoke:
      'Retirer le badge de {{name}} ? Une offre payante en cours est conservée ; seul le badge disparaît.',
    granted: 'Badge accordé.',
    grantedPendingVerification:
      "Badge accordé. Il s'affiche une fois la vérification de l'établissement approuvée.",
    revoked: 'Badge retiré.',
    noPlan: 'Sans offre',
  },
  errors: {
    VALIDATION_ERROR: 'Données invalides. Vérifiez et réessayez.',
    FORBIDDEN: "Cet établissement n'appartient pas à votre compte.",
    NOT_FOUND: 'Établissement introuvable.',
    LISTING_PENDING_VERIFICATION: "L'équipe doit vérifier l'établissement avant l'offre.",
    TRIAL_ALREADY_USED: "L'essai gratuit a déjà été utilisé sur ce compte.",
    PLAN_ALREADY_ACTIVE: 'Cet établissement a déjà une offre active.',
    PARTNER_SUSPENDED: 'Votre compte est suspendu.',
    INTERNAL_ERROR: 'Impossible de terminer pour le moment. Réessayez dans un instant.',
  },
};
