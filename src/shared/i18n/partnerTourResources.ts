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
