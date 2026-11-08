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

export const helpEn: HelpTranslation = {
  title: 'Support',
  search: 'Search help',
  searchLabel: 'Search the questions',
  shortcutsTitle: 'Help with a purchase',
  shortcuts: {
    purchases: 'My purchases',
    tickets: 'My tickets',
    bookings: 'My bookings',
  },
  greeting: 'How can we help?',
  topicsTitle: 'Topics',
  topTitle: 'Most read questions',
  resultsTitle: 'Results',
  topics: {
    purchases: 'Purchases and payments',
    tickets: 'Tickets and QR code',
    bookings: 'Tours, rentals and transfers',
    refunds: 'Cancellations and refunds',
    account: 'Your account',
    partners: 'For partners',
    app: 'Using the app',
  },
  noResults: 'Nothing matches those words. Get in touch with us below.',
  faq: [
    {
      id: 'payment-methods',
      topic: 'purchases',
      q: 'Which payment methods can I use?',
      a: 'Credit card and Pix. Pix shows up when the service takes place within 80 days of the purchase; for later dates, card only.',
    },
    {
      id: 'pix-pending',
      topic: 'purchases',
      q: 'I paid with Pix and the purchase isn’t showing yet. What now?',
      a: 'Pix confirmation arrives within a few minutes and you get an alert. If the Pix code expires before payment, the reservation is released and you need to buy again.',
    },
    {
      id: 'service-fee',
      topic: 'purchases',
      q: 'What is the service fee?',
      a: 'Some tickets have a service fee per ticket. When there is one, it is shown before payment, together with the total price.',
    },
    {
      id: 'find-tickets',
      topic: 'tickets',
      q: 'Where can I see my tickets?',
      a: 'In the menu, under Tickets. The ticket code shows up from midnight on the day of the event, next to the QR code.',
    },
    {
      id: 'transfer',
      topic: 'tickets',
      q: 'Can I give my ticket to someone else?',
      a: 'Yes. Use another account’s @ or, if the person doesn’t have an account yet, create a link that is valid for 30 minutes and can be used once. Whoever receives a ticket can only return it to the buyer.',
    },
    {
      id: 'qr-problem',
      topic: 'tickets',
      q: 'My QR code doesn’t work or was shared. What should I do?',
      a: 'On the ticket, tap "Problem with the QR code?". You can replace the QR and the code once, until entry, and the old ones stop working.',
    },
    {
      id: 'checkin-code',
      topic: 'bookings',
      q: 'How do I check in for a tour or rental?',
      a: 'Show the provider your booking code. It appears from midnight on the day of the service. If the booking is per person, each person has a code; if it’s for a group, there’s one code.',
    },
    {
      id: 'provider-absent',
      topic: 'bookings',
      q: 'The provider didn’t show up. What should I do?',
      a: 'On the booking, tap "The provider didn’t come". They have 2 hours to reply. If they admit it or don’t reply, you get a full refund.',
    },
    {
      id: 'cancel-window',
      topic: 'refunds',
      q: 'Can I cancel a purchase?',
      a: 'Up to 7 days after the purchase and up to 48 hours before the start, you get a full refund, including the service fee. After that, the cancellation policy shown before payment applies. No-shows are not refunded.',
    },
    {
      id: 'organizer-cancels',
      topic: 'refunds',
      q: 'What if the organizer or provider cancels?',
      a: 'You get a full refund, including the service fee. In case of force majeure, a new date is offered first; if it doesn’t work for you, the refund is full.',
    },
    {
      id: 'refund-time',
      topic: 'refunds',
      q: 'How long does a refund take?',
      a: 'We send the money back right away. How long it takes to show up in your account or card statement depends on your bank or card.',
    },
    {
      id: 'forgot-password',
      topic: 'account',
      q: 'I forgot my password.',
      a: 'On the sign-in screen, tap "Forgot password". We send a link to your email.',
    },
    {
      id: 'verify-email',
      topic: 'account',
      q: 'Why do I need to confirm my email?',
      a: 'To buy, book, receive tickets and register your business. Accounts that sign in with Google are already confirmed.',
    },
    {
      id: 'delete-account',
      topic: 'account',
      q: 'How do I delete my account?',
      a: 'In the menu, open your account and tap "Delete account". By law, purchase records are kept, but without your personal details.',
    },
    {
      id: 'sell',
      topic: 'partners',
      q: 'How do I sell on Use Guide?',
      a: 'Tap "Become a partner", register your business and add the account that will receive payments, under the business’s CNPJ.',
    },
    {
      id: 'payout',
      topic: 'partners',
      q: 'When do I get paid for sales?',
      a: 'The money reaches your account 48 hours after the service ends, as long as the customer hasn’t opened a complaint. Follow it in Payouts, in the partner panel.',
    },
    {
      id: 'notifications',
      topic: 'app',
      q: 'How do I turn on notifications?',
      a: 'In Settings › Notifications, tap "Turn on". On iPhone, first add Use Guide to your Home Screen (Share › Add to Home Screen) and open the app from there.',
    },
    {
      id: 'wind',
      topic: 'app',
      q: 'Where does the wind and weather forecast come from?',
      a: 'From public weather institutes. It’s a forecast: check the conditions on site before heading out.',
    },
  ],
  contactTitle: 'Talk to us',
  whatsapp: 'Chat on WhatsApp',
  whatsappMessage: 'Hi! I need help with Use Guide.',
  email: 'Send an email',
  copy: 'Copy email',
  copied: 'Email copied',
  reportProblem: 'Something not working?',
  reportHint: 'Tell us what happened',
  reportSubject: 'Problem with the app (version {{version}})',
};

export const helpFr: HelpTranslation = {
  title: 'Assistance',
  search: 'Rechercher de l’aide',
  searchLabel: 'Rechercher dans les questions',
  shortcutsTitle: 'Aide pour un achat',
  shortcuts: {
    purchases: 'Mes achats',
    tickets: 'Mes billets',
    bookings: 'Mes réservations',
  },
  greeting: 'Comment pouvons-nous vous aider ?',
  topicsTitle: 'Sujets',
  topTitle: 'Questions les plus lues',
  resultsTitle: 'Résultats',
  topics: {
    purchases: 'Achats et paiements',
    tickets: 'Billets et QR code',
    bookings: 'Excursions, locations et transferts',
    refunds: 'Annulations et remboursements',
    account: 'Votre compte',
    partners: 'Pour les partenaires',
    app: 'Utiliser l’app',
  },
  noResults: 'Rien ne correspond à ces mots. Contactez-nous ci-dessous.',
  faq: [
    {
      id: 'payment-methods',
      topic: 'purchases',
      q: 'Quels moyens de paiement puis-je utiliser ?',
      a: 'Carte de crédit et Pix. Le Pix apparaît quand la prestation a lieu dans les 80 jours suivant l’achat ; pour des dates plus lointaines, carte uniquement.',
    },
    {
      id: 'pix-pending',
      topic: 'purchases',
      q: 'J’ai payé par Pix et l’achat n’apparaît pas encore. Que faire ?',
      a: 'La confirmation du Pix arrive en quelques minutes et vous recevez une alerte. Si le code Pix expire avant le paiement, la réservation est libérée et il faut refaire l’achat.',
    },
    {
      id: 'service-fee',
      topic: 'purchases',
      q: 'Qu’est-ce que les frais de service ?',
      a: 'Certains billets ont des frais de service par billet. Le cas échéant, ils sont indiqués avant le paiement, avec le prix total.',
    },
    {
      id: 'find-tickets',
      topic: 'tickets',
      q: 'Où voir mes billets ?',
      a: 'Dans le menu, rubrique Billets. Le code du billet apparaît à partir de minuit le jour de l’événement, à côté du QR code.',
    },
    {
      id: 'transfer',
      topic: 'tickets',
      q: 'Puis-je donner mon billet à quelqu’un d’autre ?',
      a: 'Oui. Utilisez le @ d’un autre compte ou, si la personne n’a pas encore de compte, créez un lien valable 30 minutes et une seule fois. La personne qui reçoit un billet ne peut le rendre qu’à l’acheteur.',
    },
    {
      id: 'qr-problem',
      topic: 'tickets',
      q: 'Mon QR code ne fonctionne pas ou a été partagé. Que faire ?',
      a: 'Sur le billet, touchez « Problème avec le QR code ? ». Vous remplacez le QR et le code une fois, jusqu’à l’entrée, et les anciens ne sont plus valables.',
    },
    {
      id: 'checkin-code',
      topic: 'bookings',
      q: 'Comment se passe l’arrivée pour une excursion ou une location ?',
      a: 'Montrez au prestataire le code de votre réservation. Il apparaît à partir de minuit le jour de la prestation. Si la réservation est par personne, chacune a son code ; si elle est de groupe, il n’y a qu’un code.',
    },
    {
      id: 'provider-absent',
      topic: 'bookings',
      q: 'Le prestataire ne s’est pas présenté. Que faire ?',
      a: 'Sur la réservation, touchez « Le prestataire n’est pas venu ». Il a 2 heures pour répondre. S’il le reconnaît ou ne répond pas, vous êtes remboursé intégralement.',
    },
    {
      id: 'cancel-window',
      topic: 'refunds',
      q: 'Puis-je annuler un achat ?',
      a: 'Jusqu’à 7 jours après l’achat et jusqu’à 48 heures avant le début, le remboursement est intégral, frais de service compris. Ensuite, c’est la politique d’annulation affichée avant le paiement qui s’applique. Les absences ne sont pas remboursées.',
    },
    {
      id: 'organizer-cancels',
      topic: 'refunds',
      q: 'Et si l’organisateur ou le prestataire annule ?',
      a: 'Vous êtes remboursé intégralement, frais de service compris. En cas de force majeure, une nouvelle date est d’abord proposée ; si elle ne vous convient pas, le remboursement est intégral.',
    },
    {
      id: 'refund-time',
      topic: 'refunds',
      q: 'Combien de temps prend un remboursement ?',
      a: 'Nous renvoyons l’argent tout de suite. Le délai pour le voir sur votre compte ou votre relevé dépend de votre banque ou de votre carte.',
    },
    {
      id: 'forgot-password',
      topic: 'account',
      q: 'J’ai oublié mon mot de passe.',
      a: 'Sur l’écran de connexion, touchez « Mot de passe oublié ». Nous envoyons un lien à votre e-mail.',
    },
    {
      id: 'verify-email',
      topic: 'account',
      q: 'Pourquoi dois-je confirmer mon e-mail ?',
      a: 'Pour acheter, réserver, recevoir des billets et inscrire votre établissement. Les comptes connectés avec Google sont déjà confirmés.',
    },
    {
      id: 'delete-account',
      topic: 'account',
      q: 'Comment supprimer mon compte ?',
      a: 'Dans le menu, ouvrez votre compte et touchez « Supprimer le compte ». La loi impose de garder les achats, mais sans vos données personnelles.',
    },
    {
      id: 'sell',
      topic: 'partners',
      q: 'Comment vendre sur Use Guide ?',
      a: 'Touchez « Devenir partenaire », inscrivez votre établissement et indiquez le compte qui recevra les paiements, au CNPJ de l’établissement.',
    },
    {
      id: 'payout',
      topic: 'partners',
      q: 'Quand suis-je payé pour mes ventes ?',
      a: 'L’argent arrive sur votre compte 48 heures après la fin de la prestation, si le client n’a pas ouvert de réclamation. Suivez-le dans Versements, dans l’espace partenaire.',
    },
    {
      id: 'notifications',
      topic: 'app',
      q: 'Comment activer les notifications ?',
      a: 'Dans Réglages › Notifications, touchez « Activer ». Sur iPhone, ajoutez d’abord Use Guide à l’écran d’accueil (Partager › Sur l’écran d’accueil) et ouvrez l’app depuis là.',
    },
    {
      id: 'wind',
      topic: 'app',
      q: 'D’où viennent les prévisions de vent et de météo ?',
      a: 'D’instituts publics de météorologie. C’est une prévision : vérifiez les conditions sur place avant de partir.',
    },
  ],
  contactTitle: 'Nous contacter',
  whatsapp: 'Discuter sur WhatsApp',
  whatsappMessage: 'Bonjour ! J’ai besoin d’aide avec Use Guide.',
  email: 'Envoyer un e-mail',
  copy: 'Copier l’e-mail',
  copied: 'E-mail copié',
  reportProblem: 'Quelque chose ne marche pas ?',
  reportHint: 'Racontez-nous ce qui s’est passé',
  reportSubject: 'Problème dans l’app (version {{version}})',
};
