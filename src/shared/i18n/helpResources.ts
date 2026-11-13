/** Textos da central de ajuda (Suporte, D25). pt-BR é a fonte; respostas tiradas das regras reais. */
export type HelpTopic =
  | 'purchases'
  | 'tickets'
  | 'bookings'
  | 'refunds'
  | 'account'
  | 'partners'
  | 'app';

export interface HelpTranslation {
  title: string;
  search: string;
  searchLabel: string;
  shortcutsTitle: string;
  shortcuts: { purchases: string; tickets: string; bookings: string };
  greeting: string;
  topicsTitle: string;
  topTitle: string;
  resultsTitle: string;
  topics: Record<HelpTopic, string>;
  noResults: string;
  faq: Array<{ id: string; topic: HelpTopic; q: string; a: string }>;
  contactTitle: string;
  whatsapp: string;
  whatsappMessage: string;
  email: string;
  copy: string;
  copied: string;
  reportProblem: string;
  reportHint: string;
  reportSubject: string;
}

export const helpPtBR: HelpTranslation = {
  title: 'Suporte',
  search: 'Buscar ajuda',
  searchLabel: 'Buscar nas perguntas',
  shortcutsTitle: 'Ajuda com uma compra',
  shortcuts: {
    purchases: 'Minhas compras',
    tickets: 'Meus ingressos',
    bookings: 'Minhas reservas',
  },
  greeting: 'Como podemos ajudar?',
  topicsTitle: 'Assuntos',
  topTitle: 'Perguntas mais lidas',
  resultsTitle: 'Resultados',
  topics: {
    purchases: 'Compras e pagamentos',
    tickets: 'Ingressos e QR Code',
    bookings: 'Passeios, aluguéis e translados',
    refunds: 'Cancelamentos e reembolsos',
    account: 'Sua conta',
    partners: 'Para parceiros',
    app: 'Uso do app',
  },
  noResults: 'Não achamos nada com essas palavras. Fale com a gente aqui embaixo.',
  faq: [
    {
      id: 'payment-methods',
      topic: 'purchases',
      q: 'Quais formas de pagamento posso usar?',
      a: 'Cartão de crédito e Pix. O Pix aparece quando o serviço acontece em até 80 dias depois da compra; para datas mais distantes, só cartão.',
    },
    {
      id: 'pix-pending',
      topic: 'purchases',
      q: 'Paguei com Pix e a compra ainda não aparece. E agora?',
      a: 'A confirmação do Pix chega em poucos minutos e você recebe um aviso. Se o código do Pix vencer antes do pagamento, a reserva é liberada e é preciso fazer uma nova compra.',
    },
    {
      id: 'service-fee',
      topic: 'purchases',
      q: 'O que é a taxa de serviço?',
      a: 'Alguns ingressos têm uma taxa de serviço por ingresso. Quando há, ela aparece destacada antes do pagamento, junto do preço total.',
    },
    {
      id: 'find-tickets',
      topic: 'tickets',
      q: 'Onde vejo meus ingressos?',
      a: 'No menu, em Ingressos. O código do ingresso aparece a partir das 0h do dia do evento, junto do QR Code.',
    },
    {
      id: 'transfer',
      topic: 'tickets',
      q: 'Posso passar o ingresso para outra pessoa?',
      a: 'Sim. Use o @ de outra conta ou, se a pessoa ainda não tem conta, gere um link que vale 30 minutos e uma vez só. Quem recebe um ingresso só pode devolvê-lo para quem comprou.',
    },
    {
      id: 'qr-problem',
      topic: 'tickets',
      q: 'Meu QR Code não funciona ou foi compartilhado. O que faço?',
      a: 'No ingresso, toque em "Problema com o QR Code?". Você troca o QR e o código uma vez, até a entrada, e os antigos deixam de valer.',
    },
    {
      id: 'checkin-code',
      topic: 'bookings',
      q: 'Como funciona a chegada no passeio ou no aluguel?',
      a: 'Mostre ao prestador o código da sua reserva. Ele aparece a partir das 0h do dia do serviço. Se a reserva é por pessoa, cada uma tem o seu código; se é por grupo, o código é um só.',
    },
    {
      id: 'provider-absent',
      topic: 'bookings',
      q: 'O prestador não apareceu. O que faço?',
      a: 'Na reserva, toque em "O prestador não veio". Ele tem 2 horas para responder. Se admitir ou não responder, você recebe o reembolso integral.',
    },
    {
      id: 'cancel-window',
      topic: 'refunds',
      q: 'Posso cancelar uma compra?',
      a: 'Até 7 dias depois da compra e até 48 horas antes do início, o reembolso é integral, inclusive a taxa de serviço. Depois disso, vale a política de cancelamento mostrada antes do pagamento. Quem não comparece não tem reembolso.',
    },
    {
      id: 'organizer-cancels',
      topic: 'refunds',
      q: 'E se o organizador ou o prestador cancelar?',
      a: 'Você recebe o reembolso integral, inclusive a taxa de serviço. Em caso de força maior, primeiro é oferecida uma nova data; se ela não servir, o reembolso é integral.',
    },
    {
      id: 'refund-time',
      topic: 'refunds',
      q: 'Quanto tempo o reembolso demora?',
      a: 'Devolvemos o valor na hora. O tempo para aparecer na sua conta ou na fatura depende do seu banco ou do cartão.',
    },
    {
      id: 'forgot-password',
      topic: 'account',
      q: 'Esqueci minha senha.',
      a: 'Na tela de entrar, toque em "Esqueceu a senha?". Enviamos um link para o seu e-mail.',
    },
    {
      id: 'verify-email',
      topic: 'account',
      q: 'Por que preciso confirmar meu e-mail?',
      a: 'Para comprar, reservar, receber ingressos e cadastrar seu negócio. Contas que entram com o Google já vêm confirmadas.',
    },
    {
      id: 'delete-account',
      topic: 'account',
      q: 'Como excluo minha conta?',
      a: 'No menu, abra a sua conta e toque em "Excluir conta". Por lei, os registros das compras ficam guardados, mas sem os seus dados pessoais.',
    },
    {
      id: 'sell',
      topic: 'partners',
      q: 'Como vendo pelo Use Guide?',
      a: 'Toque em "Seja parceiro", cadastre seu negócio e informe a conta que vai receber os pagamentos, no CNPJ do negócio.',
    },
    {
      id: 'payout',
      topic: 'partners',
      q: 'Quando recebo o valor das vendas?',
      a: 'O valor cai na sua conta 48 horas depois que o serviço termina, se o cliente não tiver aberto uma reclamação. Acompanhe em Recebimentos, no painel do parceiro.',
    },
    {
      id: 'notifications',
      topic: 'app',
      q: 'Como ativo as notificações?',
      a: 'Em Configurações › Notificações, toque em "Ativar". No iPhone, primeiro coloque o Use Guide na tela inicial (Compartilhar › Adicionar à Tela de Início) e abra o app por lá.',
    },
    {
      id: 'wind',
      topic: 'app',
      q: 'De onde vem a previsão de vento e clima?',
      a: 'De institutos públicos de meteorologia. É uma previsão: confira as condições no local antes de sair.',
    },
  ],
  contactTitle: 'Fale com a gente',
  whatsapp: 'Conversar no WhatsApp',
  whatsappMessage: 'Olá! Preciso de ajuda com o Use Guide.',
  email: 'Enviar e-mail',
  copy: 'Copiar e-mail',
  copied: 'E-mail copiado',
  reportProblem: 'Algo não funciona no app?',
  reportHint: 'Conte pra gente o que aconteceu',
  reportSubject: 'Problema no app (versão {{version}})',
};
