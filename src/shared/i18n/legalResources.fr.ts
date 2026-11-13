import type { LegalTranslation } from './legalResources';

export const legalFr: LegalTranslation = {
  title: 'Conditions et politiques',
  version: 'Version du {{date}}',
  prevailing: 'En cas de divergence entre les langues, la version portugaise prévaut.',
  use: {
    title: 'Conditions d’utilisation',
    paragraphs: [
      'En utilisant Use Guide, vous acceptez ces conditions et la politique de confidentialité ci-dessous. Si vous n’êtes pas d’accord, n’utilisez pas l’application.',
      'Use Guide rassemble des informations, des cartes et des conseils sur des destinations touristiques au Brésil et vend des billets, des excursions, des locations, des transferts et des entrées d’organisateurs et d’établissements inscrits.',
      'Vous devez fournir des informations exactes et garder vos identifiants secrets. Le compte est personnel et non transférable.',
      'Il est interdit d’utiliser l’application pour des activités illégales, de copier ou diffuser son contenu sans autorisation et de tenter d’accéder à des zones restreintes.',
      'Les informations sur les itinéraires, les sentiers et la météo sont indicatives. Évaluez les risques avant de suivre un itinéraire proposé.',
      'L’application utilise des services tiers, comme Google Maps, Firebase et Stripe, soumis à leurs propres règles.',
      'Changements de ces conditions : quand le changement est important, nous prévenons dans l’application 15 jours à l’avance. Continuer à utiliser Use Guide après la date d’entrée en vigueur vaut acceptation de la nouvelle version.',
      'Ces conditions peuvent changer. Les nouveaux achats et ventes demandent l’acceptation de la version actuelle ; votre commande suit la version que vous avez acceptée.',
      'Questions : ajuda@useguide.com.br.',
    ],
  },
  purchases: {
    title: 'Achats, annulation et remboursement',
    paragraphs: [
      'Vous payez Use Guide, qui reverse le montant à l’organisateur après la prestation.',
      'Avant le paiement, le total s’affiche avec les frais de service séparés. Les frais de service rémunèrent la plateforme.',
      'Chaque organisateur choisit l’une des politiques d’annulation de la plateforme, listées ci-dessous. La politique choisie s’affiche avant le paiement et est enregistrée avec la commande : les modifications ultérieures de l’annonce ne changent pas votre commande.',
      'Droit de rétractation (Code brésilien de la consommation, art. 49) : en annulant dans les 7 jours suivant l’achat et au moins 48 heures avant le début, le remboursement est intégral, frais de service éventuels compris.',
      'En dehors de ce délai, la politique de la commande s’applique et les frais de service ne sont pas remboursés. Après le début, ou en cas d’absence, il n’y a pas de remboursement.',
      'Annulation par l’organisateur : remboursement intégral, frais de service compris. En cas de force majeure prouvée, l’organisateur peut proposer une nouvelle date ; si vous ne l’acceptez pas, vous êtes remboursé intégralement.',
      'Le remboursement est effectué sur le moyen de paiement utilisé pour l’achat.',
      'Transfert de billet : autorisé lorsque l’organisateur le permet, jusqu’au délai indiqué sur la commande.',
      'Si vous contestez l’achat auprès de votre banque, la commande est suspendue jusqu’à la décision.',
    ],
    policiesTitle: 'Politiques d’annulation de la plateforme',
    families: {
      event: 'Événements',
      booking: 'Excursions, locations et entrées',
      transfer: 'Transferts (Code civil brésilien, art. 740)',
    },
  },
  partner: {
    title: 'Conditions du partenaire',
    paragraphs: [
      'Chaque CNPJ vérifié reçoit sur son propre compte Stripe, et chaque établissement vend via le compte de son CNPJ. Les CPF ne vendent pas.',
      'Les frais Stripe sont pris en charge par la plateforme. En cas de remboursement partiel, la commission de la plateforme porte sur le montant que vous conservez.',
      'Versement : le montant de chaque vente est transféré 48 heures après la fin de la prestation. Une réclamation ouverte dans ce délai suspend le versement de cette vente jusqu’à 5 jours.',
      'Politique d’annulation : vous choisissez l’une des options de la plateforme. Après la publication, vous ne pouvez passer qu’à une option plus flexible. Le droit de rétractation de l’acheteur s’applique toujours.',
      'Annulation par le propriétaire : les acheteurs sont remboursés intégralement, frais de service compris, par la plateforme avant le versement. Vous payez une pénalité de 20 % du montant vendu (hors frais de service), par carte ou Pix, sous 24 heures. À défaut, la pénalité est déduite des versements en attente et futurs du CNPJ, qui est bloqué pour de nouvelles ventes jusqu’au paiement.',
      'Force majeure prouvée : la première solution est le report. Les acheteurs qui n’acceptent pas la nouvelle date sont remboursés intégralement, sans pénalité pour vous.',
      'Contestations de carte : avec une preuve d’utilisation (check-in), la plateforme conteste et assume le résultat. Sans preuve, le montant contesté devient une dette du CNPJ.',
      'Billets offerts : vous pouvez envoyer des billets offerts par @ ou par lien personnel, un par personne et par événement. Le billet offert occupe une place dans la séance, n’a ni prix, ni frais, ni reversement, et ne peut être ni remboursé, ni transféré, ni vendu. Il est interdit d’offrir un billet à une personne qui a acheté, annulé ou été remboursée d’un billet du même événement.',
      'Promoteurs : l’accord avec chaque promoteur (commission, montant par billet ou forfait) est payé par vous, directement, après l’événement. Use Guide calcule et affiche les montants, mais n’effectue ni ne garantit ce paiement.',
      'Vente hors de la plateforme : il est interdit de vendre ou de faire payer hors d’Use Guide un billet, un billet offert, un lien d’invitation, une réservation ou un service proposé ici, ainsi que de demander à un client d’annuler son achat pour payer en dehors. Le non-respect de cette règle suspend les ventes du CNPJ et peut entraîner la fermeture du compte partenaire.',
      'Changements de ces conditions : quand le changement est important, nous prévenons dans l’application 15 jours à l’avance. Continuer à vendre après la date d’entrée en vigueur vaut acceptation de la nouvelle version ; l’acceptation peut aussi être enregistrée dans Gains › Comptes de versement.',
    ],
    feesWithValues:
      'Commission de la plateforme : {{bookings}} sur les réservations (excursions, locations, transferts et entrées). Sur les billets, {{tickets}} plus des frais de service de {{serviceFee}} par billet payant, facturés à l’acheteur ; ou {{absorbed}} lorsque vous prenez les frais de service en charge.',
    feesGeneric:
      'Commission de la plateforme : les taux en vigueur s’affichent dans Versements, sur le panneau du partenaire, avant l’acceptation de ces conditions.',
  },
  privacy: {
    title: 'Confidentialité des données',
    paragraphs: [
      'Nous ne collectons que le nécessaire, comme le nom, l’e-mail, la localisation et les données d’utilisation, avec votre consentement, pour offrir une expérience personnalisée (loi brésilienne 13.709/2018, LGPD).',
      'Nous utilisons ces données pour afficher des lieux et des produits, personnaliser les recommandations, améliorer les performances et la sécurité et envoyer des notifications.',
      'Si vous activez les notifications, nous conservons un identifiant de l’appareil pour les envoyer. Vous pouvez les désactiver à tout moment dans Paramètres › Notifications ou dans votre navigateur ; l’identifiant est supprimé lorsque vous vous déconnectez sur cet appareil ou supprimez votre compte.',
      'Les services tiers, comme Google et Stripe, suivent leurs propres règles de confidentialité, compatibles avec la LGPD. Les données de carte restent chez Stripe et ne passent jamais par Use Guide.',
      'Les données sont stockées sur des serveurs protégés par chiffrement et consultées uniquement par des personnes autorisées.',
      'Vous pouvez demander l’accès, la correction ou la suppression de vos données à ajuda@useguide.com.br. Les données d’achat sont anonymisées, et non supprimées, pendant la durée légale.',
    ],
  },
  accept: {
    buyer: 'J’ai lu et j’accepte les <terms>conditions et la politique d’annulation</terms>',
    partner: 'J’ai lu et j’accepte les <terms>conditions du partenaire</terms>',
    required: 'Acceptez les conditions pour continuer.',
    close: 'Fermer',
  },
  partnerTerms: {
    title: 'Conditions du partenaire',
    description:
      'Lisez et acceptez les règles sur les commissions, versements, annulations, pénalités, billets offerts, promoteurs et ventes hors de la plateforme.',
    button: 'Accepter les conditions',
    accepted: 'Conditions du partenaire acceptées le {{date}}.',
    error: 'Impossible d’enregistrer votre acceptation. Réessayez.',
  },
  about: {
    title: 'À propos',
    back: 'Retour',
    general: 'Général',
    licenses: 'Licences',
    terms: 'Conditions',
  },
};
