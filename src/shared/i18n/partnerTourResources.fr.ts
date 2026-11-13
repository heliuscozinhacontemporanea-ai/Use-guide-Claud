import type { PartnerTourTranslation } from './partnerTourResources';

export const partnerTourFr: PartnerTourTranslation = {
  progress: '{{chapter}} · {{current}} sur {{total}}',
  tipsOff: 'Ne plus afficher les conseils',
  skip: 'Passer',
  back: 'Retour',
  next: 'Suivant',
  finish: 'Terminer',
  replay: 'Voir la visite du tableau de bord',
  replayHint: 'Depuis le début ou une seule partie',
  chooserTitle: 'Visite du tableau de bord',
  chooserDescription: 'Tout voir ou seulement la partie utile.',
  fromStart: 'Depuis le début',
  chapters: {
    home: 'Accueil',
    agenda: 'Agenda',
    catalog: 'Catalogue',
    earnings: 'Gains',
    more: 'Plus',
  },
  steps: {
    shortcuts: {
      title: 'Tout en un geste',
      text: 'D’ici, vous allez vers Agenda, Catalogue, Gains et Plus. Passons par chacun.',
    },
    establishment: {
      title: 'Vos établissements',
      text: 'Touchez le nom pour voir un seul établissement ou tous ensemble.',
    },
    attention: {
      title: 'À régler maintenant',
      text: 'Ce qui vous attend : documents, compte de versement et conditions.',
    },
    agora: {
      title: 'Maintenant',
      text: 'Au moment du service, le code, « Je suis là » et l’accueil apparaissent. Ils disparaissent seuls.',
    },
    cards: {
      title: 'Vos chiffres',
      text: 'Ventes, agenda et versements. Dans « Personnaliser l’accueil », choisissez lesquels et dans quel ordre.',
    },
    'agenda-week': {
      title: 'Votre semaine',
      text: 'Changez de semaine avec les flèches ou en faisant glisser les jours. Touchez le mois pour le calendrier.',
    },
    'agenda-day': {
      title: 'La journée',
      text: 'Touchez un créneau ou une séance pour voir qui vient, le code et l’accueil.',
    },
    'catalog-kinds': {
      title: 'Vos annonces',
      text: 'Lieux (vos établissements), Événements et Excursions (excursions, locations et transferts).',
    },
    'catalog-create': {
      title: 'Créer',
      text: 'Créez un lieu, un événement ou une excursion.',
    },
    'catalog-first': {
      title: 'Chaque annonce',
      text: 'Ouvrez un lieu pour l’abonnement et le badge ; un événement, pour les ventes, invités et promoteurs.',
    },
    'earnings-totals': {
      title: 'Votre argent',
      text: 'Ce qui doit encore arriver sur votre compte et ce qui est arrivé ce mois-ci.',
    },
    'earnings-tabs': {
      title: 'Versements, relevé et dettes',
      text: 'Chaque versement, chaque vente et ce qui a été déduit.',
    },
    'earnings-links': {
      title: 'Comptes et rapports',
      text: 'Où arrive l’argent, par CNPJ, et les ventes par période.',
    },
    'more-list': {
      title: 'Plus',
      text: 'Profil, établissements, abonnements et comptes. Juste en dessous : conditions, aide et « Voir la visite du tableau de bord ».',
    },
  },
};
