import { notifyTypesFr } from './notifyTypesResources.fr';
import type { NotifyTranslation } from './notifyResources';

export const notifyFr: NotifyTranslation = {
  types: notifyTypesFr,
  settingsTitle: 'Notifications',
  device: {
    defaultTitle: 'Activez les notifications',
    default:
      'Sachez tout de suite quand votre achat est confirmé, qu’une excursion change d’horaire ou que votre guide arrive.',
    enable: 'Activer',
    granted: 'Notifications activées',
    grantedHint: 'Pour les désactiver, passez par les réglages du téléphone ou du navigateur.',
    denied:
      'Les notifications de Use Guide sont désactivées ici. Pour les recevoir, autorisez-les dans les réglages du navigateur.',
    install:
      'Sur iPhone, les notifications ne fonctionnent qu’avec Use Guide sur l’écran d’accueil. Touchez Partager, puis « Sur l’écran d’accueil », et ouvrez l’app depuis là.',
    unsupported:
      'Ce navigateur n’affiche pas les notifications. Vous voyez toujours tout sous la cloche, en haut de l’écran.',
  },
  always: {
    title: 'Nous vous prévenons toujours pour',
    on: 'Toujours',
    purchases: {
      label: 'Achats et paiements',
      hint: 'Paiement confirmé, Pix en attente et remboursements',
    },
    trips: {
      label: 'Billets et réservations',
      hint: 'Confirmation, rappels et changements d’horaire',
    },
    account: {
      label: 'Votre compte',
      hint: 'Nouvelles connexions et changement d’e-mail ou de mot de passe',
    },
    partnerClaims: {
      label: 'Annulations et réclamations',
      hint: 'Ainsi que les avis de vos clients',
    },
    partnerMoney: {
      label: 'Versements et inscription',
      hint: 'Paiement de vos ventes et vérification de votre établissement',
    },
    note: 'Ce sont des messages importants, ils ne peuvent donc pas être désactivés.',
  },
  choices: {
    title: 'À vous de choisir',
    reviewRequests: 'Demandes d’avis',
    reviewRequestsHint:
      'Après une excursion, un événement ou un séjour, nous demandons votre avis.',
    news: 'Nouveautés et offres',
    newsHint: 'Nouveaux événements et conseils pour profiter du voyage.',
    nightNote: 'Ces messages n’arrivent jamais entre 23 h 30 et 5 h 30.',
  },
  sales: {
    title: 'Alertes de vente',
    each: 'À chaque vente',
    eachHint: 'Une alerte pour chaque vente ou réservation.',
    daily: 'Résumé en fin de journée',
    dailyHint: 'Une seule alerte avec les ventes du jour.',
    note: 'Les annulations et réclamations arrivent toujours tout de suite.',
  },
  loadError: 'Impossible de charger vos choix.',
  saveError: 'Impossible d’enregistrer. Réessayez.',
  retry: 'Réessayer',
  center: {
    title: 'Notifications',
    open: 'Ouvrir les notifications',
    openUnread_one: 'Ouvrir les notifications, {{count}} non lue',
    openUnread_other: 'Ouvrir les notifications, {{count}} non lues',
    markAll: 'Tout marquer comme lu',
    more: 'Plus d’options',
    filterUnread: 'Non lues',
    filterAll: 'Tout',
    upToDate: 'Vous êtes à jour',
    upToDateHint: 'Les nouveautés apparaîtront ici.',
    settings: 'Réglages',
    today: 'Aujourd’hui',
    earlier: 'Plus tôt',
    empty: 'Aucune notification',
    emptyHint: 'Quand votre achat est confirmé ou que quelque chose change, vous le verrez ici.',
    unread: 'Non lue',
    loadError: 'Impossible de charger les notifications.',
  },
};
