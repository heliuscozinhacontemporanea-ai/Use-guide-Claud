// Explorar v3 (D37): vitrine, abas Experiências e Serviços, destinos e cartão de vitrine.
export interface ExploreTranslation {
  tabs: { empty: string };
  search: {
    label: string;
    destination: string;
    tours: string;
    events: string;
    stays: string;
    restaurants: string;
    transfers: string;
    rentals: string;
  };
}

export const explorePtBR: ExploreTranslation = {
  tabs: { empty: 'Nada por aqui ainda. Volte logo, sempre entram anúncios novos.' },
  search: {
    label: 'Buscar',
    destination: 'Para onde você vai?',
    tours: 'Buscar passeios',
    events: 'Buscar eventos',
    stays: 'Buscar hospedagem',
    restaurants: 'Buscar restaurantes',
    transfers: 'Buscar translados',
    rentals: 'Buscar aluguéis',
  },
};
