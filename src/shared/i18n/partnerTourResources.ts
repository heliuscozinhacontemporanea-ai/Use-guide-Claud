/** Tour do painel do parceiro, um capítulo por aba (proposta 2 do tour, 2026-11-07). */
interface Step {
  title: string;
  text: string;
}

type Chapter = 'home' | 'agenda' | 'catalog' | 'earnings' | 'more';
type StepId =
  | 'shortcuts'
  | 'establishment'
  | 'attention'
  | 'agora'
  | 'cards'
  | 'agenda-week'
  | 'agenda-day'
  | 'catalog-kinds'
  | 'catalog-create'
  | 'catalog-first'
  | 'earnings-totals'
  | 'earnings-tabs'
  | 'earnings-links'
  | 'more-list';

export interface PartnerTourTranslation {
  progress: string;
  tipsOff: string;
  skip: string;
  back: string;
  next: string;
  finish: string;
  replay: string;
  replayHint: string;
  chooserTitle: string;
  chooserDescription: string;
  fromStart: string;
  chapters: Record<Chapter, string>;
  steps: Record<StepId, Step>;
}

export const partnerTourPtBR: PartnerTourTranslation = {
  progress: '{{chapter}} · {{current}} de {{total}}',
  tipsOff: 'Não mostrar dicas do painel',
  skip: 'Pular',
  back: 'Voltar',
  next: 'Próximo',
  finish: 'Concluir',
  replay: 'Ver o tour do painel',
  replayHint: 'Do começo ou só uma parte',
  chooserTitle: 'Tour do painel',
  chooserDescription: 'Veja tudo ou só a parte que precisar.',
  fromStart: 'Do começo',
  chapters: {
    home: 'Início',
    agenda: 'Agenda',
    catalog: 'Catálogo',
    earnings: 'Ganhos',
    more: 'Mais',
  },
  steps: {
    shortcuts: {
      title: 'Tudo a um toque',
      text: 'Daqui você vai para Agenda, Catálogo, Ganhos e Mais. Vamos passar por cada uma.',
    },
    establishment: {
      title: 'Seus estabelecimentos',
      text: 'Toque no nome para ver o painel de um estabelecimento só ou de todos juntos.',
    },
    attention: {
      title: 'Resolva agora',
      text: 'Pendências que precisam de você, como documentos, conta de recebimento e termos.',
    },
    agora: {
      title: 'Agora',
      text: 'Na hora do serviço aparecem o código, o Cheguei e a portaria. Eles somem sozinhos.',
    },
    cards: {
      title: 'Seus números',
      text: 'Vendas, agenda e repasses. Em "Personalizar início" você escolhe quais aparecem e em que ordem.',
    },
    'agenda-week': {
      title: 'Sua semana',
      text: 'Mude de semana pelas setas ou arrastando os dias. Toque no mês para ver o calendário.',
    },
    'agenda-day': {
      title: 'O dia',
      text: 'Toque num horário ou numa sessão para ver quem vem, o código e a portaria.',
    },
    'catalog-kinds': {
      title: 'Seus anúncios',
      text: 'Lugares (seus estabelecimentos), Eventos e Passeios (passeios, aluguéis e translados).',
    },
    'catalog-create': {
      title: 'Criar',
      text: 'Crie um lugar, um evento ou um passeio.',
    },
    'catalog-first': {
      title: 'Cada anúncio',
      text: 'Abra um lugar para ver o plano e o selo; um evento, para vendas, convidados e divulgadores.',
    },
    'earnings-totals': {
      title: 'Seu dinheiro',
      text: 'O que ainda vai cair na conta e o que já caiu neste mês.',
    },
    'earnings-tabs': {
      title: 'Repasses, extrato e dívidas',
      text: 'Cada repasse, cada venda e o que foi descontado.',
    },
    'earnings-links': {
      title: 'Contas e relatórios',
      text: 'Onde o dinheiro cai, por CNPJ, e as vendas por período.',
    },
    'more-list': {
      title: 'Mais',
      text: 'Perfil, estabelecimentos, planos e contas. Logo abaixo ficam termos, ajuda e "Ver o tour do painel".',
    },
  },
};

export const partnerTourEn: PartnerTourTranslation = {
  progress: '{{chapter}} · {{current}} of {{total}}',
  tipsOff: "Don't show panel tips",
  skip: 'Skip',
  back: 'Back',
  next: 'Next',
  finish: 'Done',
  replay: 'See the panel tour',
  replayHint: 'From the start or just one part',
  chooserTitle: 'Panel tour',
  chooserDescription: 'See it all or just the part you need.',
  fromStart: 'From the start',
  chapters: {
    home: 'Home',
    agenda: 'Schedule',
    catalog: 'Catalog',
    earnings: 'Earnings',
    more: 'More',
  },
  steps: {
    shortcuts: {
      title: 'Everything one tap away',
      text: "From here you go to Schedule, Catalog, Earnings and More. Let's go through each one.",
    },
    establishment: {
      title: 'Your businesses',
      text: 'Tap the name to see the panel for one business or for all of them together.',
    },
    attention: {
      title: 'Act now',
      text: 'Things that need you, such as documents, payout account and terms.',
    },
    agora: {
      title: 'Now',
      text: "At service time, the code, I'm here and the gate show up. They go away on their own.",
    },
    cards: {
      title: 'Your numbers',
      text: 'Sales, schedule and payouts. In "Customize home" you choose which ones show and in what order.',
    },
    'agenda-week': {
      title: 'Your week',
      text: 'Change weeks with the arrows or by swiping the days. Tap the month to see the calendar.',
    },
    'agenda-day': {
      title: 'The day',
      text: 'Tap a time slot or a session to see who is coming, the code and the gate.',
    },
    'catalog-kinds': {
      title: 'Your listings',
      text: 'Places (your businesses), Events and Tours (tours, rentals and transfers).',
    },
    'catalog-create': {
      title: 'Create',
      text: 'Create a place, an event or a tour.',
    },
    'catalog-first': {
      title: 'Each listing',
      text: 'Open a place to see its plan and seal; an event, for sales, guests and promoters.',
    },
    'earnings-totals': {
      title: 'Your money',
      text: 'What is still coming to your account and what has arrived this month.',
    },
    'earnings-tabs': {
      title: 'Payouts, statement and debts',
      text: 'Each payout, each sale and what was deducted.',
    },
    'earnings-links': {
      title: 'Accounts and reports',
      text: 'Where the money goes, by CNPJ, and sales by period.',
    },
    'more-list': {
      title: 'More',
      text: 'Profile, businesses, plans and accounts. Terms, help and "See the panel tour" are right below.',
    },
  },
};

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
