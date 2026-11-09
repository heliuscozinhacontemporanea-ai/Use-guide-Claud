// "Também trabalha com…?" no Mais do painel (S3, aprovado em 2026-11-09).
type Row = { title: string; hint: string };

export interface PartnerAddSegmentTranslation {
  entry: string;
  title: string;
  description: string;
  have: string;
  rows: {
    tours: Row;
    rentals: Row;
    transfers: Row;
    attraction: Row;
    events: Row;
    showcase: Row;
  };
}

export const partnerAddSegmentPtBR: PartnerAddSegmentTranslation = {
  entry: 'Também trabalha com…?',
  title: 'Também trabalha com…?',
  description: 'O painel passa a mostrar o que você escolher.',
  have: 'Você já tem',
  rows: {
    tours: { title: 'Passeios', hint: 'Saídas com horário e vagas' },
    rentals: { title: 'Aluguéis', hint: 'Quadriciclo, buggy, bike; período e caução' },
    transfers: { title: 'Translados', hint: 'Rotas, passageiros e bagagem' },
    attraction: { title: 'Atração com entrada', hint: 'Venda de entradas com portaria' },
    events: { title: 'Eventos', hint: 'Ingressos, lotes, convidados e divulgadores' },
    showcase: { title: 'Hospedagem ou restaurante', hint: 'Página no guia, avaliações e selo' },
  },
};

export const partnerAddSegmentEn: PartnerAddSegmentTranslation = {
  entry: 'Do you also offer…?',
  title: 'Do you also offer…?',
  description: 'Your panel will show what you choose.',
  have: 'You have this',
  rows: {
    tours: { title: 'Tours', hint: 'Departures with times and spots' },
    rentals: { title: 'Rentals', hint: 'Quad, buggy, bike; period and deposit' },
    transfers: { title: 'Transfers', hint: 'Routes, passengers and luggage' },
    attraction: { title: 'Attraction with tickets', hint: 'Entry tickets with door check' },
    events: { title: 'Events', hint: 'Tickets, batches, guests and promoters' },
    showcase: { title: 'Lodging or restaurant', hint: 'Guide page, reviews and seal' },
  },
};

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
