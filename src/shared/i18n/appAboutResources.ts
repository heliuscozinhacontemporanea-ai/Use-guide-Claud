/** Textos de Sobre o app, Licenças e créditos e Notificações (Configurações). pt-BR é a fonte. */
export interface AppAboutTranslation {
  title: string;
  version: string;
  description: string;
  terms: string;
  licenses: string;
  rights: string;
  licensesTitle: string;
  licensesIntro: string;
  credits: string;
  hamsterWork: string;
  creditBy: string;
  libraries: string;
  project: string;
  loadError: string;
  retry: string;
}

export const appAboutPtBR: AppAboutTranslation = {
  title: 'Sobre o app',
  version: 'Versão {{version}}',
  description:
    'O Use Guide é um guia de viagem com hospedagens, restaurantes, passeios, atrações, eventos e dicas, além da previsão de vento e clima. Pelo app, você compra ingressos e reserva passeios, aluguéis e traslados com pagamento seguro. Estabelecimentos e organizadores divulgam e vendem seus serviços pela plataforma.',
  terms: 'Termos e políticas',
  licenses: 'Licenças e créditos',
  rights: '© {{year}} Use Guide. Todos os direitos reservados.',
  licensesTitle: 'Licenças e créditos',
  licensesIntro:
    'O Use Guide usa projetos de código aberto e trabalhos de outros autores. Agradecemos a quem os criou.',
  credits: 'Créditos',
  hamsterWork: 'Animação do hamster na página não encontrada',
  creditBy: 'por {{author}} · {{source}}',
  libraries: 'Bibliotecas de código aberto',
  project: 'Página do projeto',
  loadError: 'Não foi possível carregar as licenças.',
  retry: 'Tentar de novo',
};

export const appAboutEn: AppAboutTranslation = {
  title: 'About the app',
  version: 'Version {{version}}',
  description:
    'Use Guide is a travel guide with stays, restaurants, tours, attractions, events and tips, plus wind and weather forecasts. In the app, you can buy tickets and book tours, rentals and transfers with secure payment. Businesses and organizers promote and sell their services on the platform.',
  terms: 'Terms and policies',
  licenses: 'Licenses and credits',
  rights: '© {{year}} Use Guide. All rights reserved.',
  licensesTitle: 'Licenses and credits',
  licensesIntro:
    'Use Guide relies on open source projects and work by other authors. Thank you to everyone who made them.',
  credits: 'Credits',
  hamsterWork: 'Hamster animation on the page not found',
  creditBy: 'by {{author}} · {{source}}',
  libraries: 'Open source libraries',
  project: 'Project page',
  loadError: 'We couldn’t load the licenses.',
  retry: 'Try again',
};

export const appAboutFr: AppAboutTranslation = {
  title: 'À propos de l’app',
  version: 'Version {{version}}',
  description:
    'Use Guide est un guide de voyage avec hébergements, restaurants, excursions, attractions, événements et conseils, ainsi que les prévisions de vent et de météo. Dans l’app, vous achetez des billets et réservez excursions, locations et transferts avec un paiement sécurisé. Établissements et organisateurs y présentent et vendent leurs services.',
  terms: 'Conditions et politiques',
  licenses: 'Licences et crédits',
  rights: '© {{year}} Use Guide. Tous droits réservés.',
  licensesTitle: 'Licences et crédits',
  licensesIntro:
    'Use Guide s’appuie sur des projets open source et le travail d’autres auteurs. Merci à celles et ceux qui les ont créés.',
  credits: 'Crédits',
  hamsterWork: 'Animation du hamster de la page introuvable',
  creditBy: 'par {{author}} · {{source}}',
  libraries: 'Bibliothèques open source',
  project: 'Page du projet',
  loadError: 'Impossible de charger les licences.',
  retry: 'Réessayer',
};
