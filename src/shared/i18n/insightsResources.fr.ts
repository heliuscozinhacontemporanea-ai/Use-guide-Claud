import type { InsightsTranslation } from './insightsResources';

export const insightsFr: InsightsTranslation = {
  reports: {
    empty: 'Aucun enregistrement trouvé pour les rapports',
    pickTitle: 'Sélectionnez un élément ou un événement pour voir son rapport',
    typeItem: 'Élément',
    typeEvent: 'Événement',
    typeBusiness: 'Établissement',
    seeAll: 'Tout voir',
    seeAllLabel: 'Voir tous les éléments et événements',
    title: 'Rapport de statistiques',
    loading: 'Chargement du rapport...',
    loadError: 'Impossible de charger le rapport de cet élément.',
    planRequiredTitle: "Statistiques de l'offre Use Guide Vérifié",
    planRequired:
      "Les statistiques de cette fiche font partie de l'offre de l'établissement. Activez l'offre dans Mes éléments. Les avis restent disponibles.",
  },
  stats: {
    views: 'Vues',
    whatsapp: 'Clics WhatsApp',
    favorites: 'Mis en favori',
    shares: 'Partagés',
  },
  audience: {
    title: 'Qui a consulté',
    signedIn: 'Avec un compte Use Guide',
    anonymous: 'Visiteurs',
    noViews: 'Pas encore de vues.',
  },
  chart: {
    title: 'Flux de visites',
    subtitle: '7 derniers jours',
    series: 'Vues',
  },
  reviews: {
    title: 'Avis en attente',
    waiting_one: '{{count}} en attente de réponse',
    waiting_other: '{{count}} en attente de réponse',
    showAll: 'Tout voir',
    showLess: 'Voir moins',
    rating: '{{rating}} sur 5 étoiles',
    replyPlaceholder: 'Écrivez votre réponse...',
    replyLabel: "Réponse à l'avis de {{name}}",
    send: 'Envoyer la réponse',
    cancel: 'Annuler',
    reply: "Répondre à l'avis",
    none: 'Aucun avis en attente',
    replyError: "Impossible d'envoyer la réponse.",
  },
  monthVisits: {
    label: 'Visites du mois',
    versus: '{{percent}} par rapport à {{month}}',
    firstMonth: 'Aucune visite en {{month}}',
    withPlan: 'Disponible avec la formule',
    unavailable: 'Chargement impossible pour le moment',
  },
};
