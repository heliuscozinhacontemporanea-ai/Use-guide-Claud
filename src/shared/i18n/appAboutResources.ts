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
