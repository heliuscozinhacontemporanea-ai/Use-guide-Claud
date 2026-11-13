import type { PartnerAddSegmentTranslation } from './partnerAddSegmentResources';

export const partnerAddSegmentFr: PartnerAddSegmentTranslation = {
  entry: 'Vous proposez aussi… ?',
  title: 'Vous proposez aussi… ?',
  description: 'Le panneau affichera ce que vous choisissez.',
  have: 'Déjà actif',
  rows: {
    tours: { title: 'Excursions', hint: 'Départs avec horaires et places' },
    rentals: { title: 'Locations', hint: 'Quad, buggy, vélo ; durée et caution' },
    transfers: { title: 'Transferts', hint: 'Trajets, passagers et bagages' },
    attraction: { title: 'Attraction payante', hint: "Vente d'entrées avec contrôle à l'accueil" },
    events: { title: 'Événements', hint: 'Billets, lots, invités et promoteurs' },
    showcase: { title: 'Hébergement ou restaurant', hint: 'Page dans le guide, avis et label' },
  },
};
