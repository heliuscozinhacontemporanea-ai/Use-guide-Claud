import type { PaymentAccountsTranslation } from './paymentAccountsResources';

export const paymentAccountsFr: PaymentAccountsTranslation = {
  title: 'Versements',
  subtitle:
    "Chaque CNPJ vérifié est payé sur son propre compte. Les ventes d'un établissement vont sur le compte de son CNPJ.",
  loading: 'Chargement des comptes de versement…',
  empty:
    "Aucun CNPJ vérifié pour l'instant. Faites vérifier un établissement avec un CNPJ pour recevoir des paiements.",
  refresh: 'Actualiser les comptes de versement',
  retry: 'Réessayer',
  missingKey:
    "Paiements indisponibles pour le moment : la clé publique Stripe n'est pas configurée.",
  page: {
    title: 'Comptes de versement',
    intro:
      'Chaque CNPJ est versé sur son propre compte. Chaque élément du catalogue est versé sur le compte du CNPJ de son établissement.',
    items_one: '{{count}} élément',
    items_other: '{{count}} éléments',
  },
  listings_one: '{{count}} fiche vend avec ce CNPJ',
  listings_other: '{{count}} fiches vendent avec ce CNPJ',
  requirements_one: '{{count}} élément en attente sur Stripe',
  requirements_other: '{{count}} éléments en attente sur Stripe',
  status: {
    ready: 'Prêt à recevoir',
    pending: 'Inscription incomplète',
    restricted: 'En cours de vérification par Stripe',
    disabled: 'Désactivé par Stripe',
    notStarted: 'Inscription non commencée',
  },
  actions: {
    start: 'Configurer les versements',
    continue: "Continuer l'inscription",
    manage: 'Gérer',
    back: 'Retour aux comptes',
  },
  tabs: {
    label: 'Sections du compte',
    onboarding: 'Inscription',
    balances: 'Soldes',
    payouts: 'Versements',
    payments: 'Paiements',
    account: 'Données du compte',
  },
  errors: {
    NOT_FOUND: "Ce CNPJ n'est pas vérifié sur votre compte.",
    FORBIDDEN: 'Ce compte de versement appartient à un autre partenaire.',
    VALIDATION_ERROR: 'Compte invalide. Actualisez la page et réessayez.',
    PAYMENT_ACCOUNT_UNAVAILABLE:
      "Impossible de joindre Stripe pour l'instant. Réessayez dans un instant.",
  },
};
