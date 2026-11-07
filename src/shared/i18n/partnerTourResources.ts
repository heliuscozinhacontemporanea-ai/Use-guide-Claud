/** Tour do painel do parceiro na primeira abertura (etapa 6). */
interface Step {
  title: string;
  text: string;
}

export interface PartnerTourTranslation {
  progress: string;
  neverAgain: string;
  skip: string;
  back: string;
  next: string;
  finish: string;
  replay: string;
  replayHint: string;
  steps: {
    shortcuts: Step;
    establishment: Step;
    attention: Step;
    cards: Step;
    agora: Step;
    catalog: Step;
    earnings: Step;
  };
}

export const partnerTourPtBR: PartnerTourTranslation = {
  progress: '{{current}} de {{total}}',
  neverAgain: 'Não mostrar novamente',
  skip: 'Pular',
  back: 'Voltar',
  next: 'Próximo',
  finish: 'Concluir',
  replay: 'Ver o tour do painel',
  replayHint: 'As partes do painel, uma por vez',
  steps: {
    shortcuts: {
      title: 'Tudo a um toque',
      text: 'Início, Agenda, Catálogo, Ganhos e Mais ficam sempre aqui no topo.',
    },
    establishment: {
      title: 'Seus estabelecimentos',
      text: 'Toque no nome para ver o painel de um estabelecimento só ou de todos.',
    },
    attention: {
      title: 'Resolva agora',
      text: 'Prazos que não podem esperar ficam aqui, de todos os estabelecimentos.',
    },
    cards: {
      title: 'Seu Início',
      text: 'Cartões com vendas, agenda e repasses. Em "Personalizar início" você escolhe quais e em que ordem.',
    },
    agora: {
      title: 'Agora',
      text: 'Na hora do serviço aparecem os cartões do momento, como Inserir código e Portaria. Eles somem sozinhos.',
    },
    catalog: {
      title: 'Catálogo',
      text: 'Crie e edite estabelecimentos, eventos, passeios e aluguéis. Cada evento tem vendas, convidados e divulgadores.',
    },
    earnings: {
      title: 'Ganhos',
      text: 'Quanto você tem a receber, os repasses, as contas de recebimento e os relatórios.',
    },
  },
};

export const partnerTourEn: PartnerTourTranslation = {
  progress: '{{current}} of {{total}}',
  neverAgain: "Don't show again",
  skip: 'Skip',
  back: 'Back',
  next: 'Next',
  finish: 'Done',
  replay: 'See the panel tour',
  replayHint: 'The parts of the panel, one at a time',
  steps: {
    shortcuts: {
      title: 'Everything one tap away',
      text: 'Home, Schedule, Catalog, Earnings and More are always here at the top.',
    },
    establishment: {
      title: 'Your businesses',
      text: 'Tap the name to see the panel for one business or for all of them.',
    },
    attention: {
      title: 'Act now',
      text: "Deadlines that can't wait show up here, from all your businesses.",
    },
    cards: {
      title: 'Your Home',
      text: 'Cards with sales, schedule and payouts. In "Customize home" you choose which ones and in what order.',
    },
    agora: {
      title: 'Now',
      text: 'At service time, cards for the moment show up, such as Enter code and Gate. They go away on their own.',
    },
    catalog: {
      title: 'Catalog',
      text: 'Create and edit businesses, events, tours and rentals. Each event has sales, guests and promoters.',
    },
    earnings: {
      title: 'Earnings',
      text: 'How much you have to receive, payouts, payout accounts and reports.',
    },
  },
};

export const partnerTourFr: PartnerTourTranslation = {
  progress: '{{current}} sur {{total}}',
  neverAgain: 'Ne plus afficher',
  skip: 'Passer',
  back: 'Retour',
  next: 'Suivant',
  finish: 'Terminer',
  replay: 'Voir la visite du tableau de bord',
  replayHint: 'Les parties du tableau de bord, une à la fois',
  steps: {
    shortcuts: {
      title: 'Tout en un geste',
      text: 'Accueil, Agenda, Catalogue, Gains et Plus restent toujours ici en haut.',
    },
    establishment: {
      title: 'Vos établissements',
      text: 'Touchez le nom pour voir le tableau de bord d’un seul établissement ou de tous.',
    },
    attention: {
      title: 'À régler maintenant',
      text: 'Les délais qui ne peuvent pas attendre apparaissent ici, pour tous les établissements.',
    },
    cards: {
      title: 'Votre accueil',
      text: 'Des cartes avec les ventes, l’agenda et les versements. Dans « Personnaliser l’accueil », vous choisissez lesquelles et dans quel ordre.',
    },
    agora: {
      title: 'Maintenant',
      text: 'Au moment du service, les cartes utiles apparaissent, comme Saisir le code et Accueil. Elles disparaissent seules.',
    },
    catalog: {
      title: 'Catalogue',
      text: 'Créez et modifiez établissements, événements, excursions et locations. Chaque événement a ses ventes, invités et promoteurs.',
    },
    earnings: {
      title: 'Gains',
      text: 'Ce que vous avez à recevoir, les versements, les comptes de versement et les rapports.',
    },
  },
};
