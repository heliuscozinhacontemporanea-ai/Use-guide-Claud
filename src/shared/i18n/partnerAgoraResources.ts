/** Seção "Agora" do Início do parceiro (p40 a p43, D27). */
export interface PartnerAgoraTranslation {
  title: string;
  titleAt: string;
  arrive: {
    button: string;
    bookings_one: string;
    bookings_other: string;
    people_one: string;
    people_other: string;
    sending: string;
    noLocation: string;
    error: string;
  };
  code: {
    button: string;
    withCode: string;
    arrivedAt: string;
    contactsHint: string;
    noShowAt: string;
    noShow: string;
  };
  start: { button: string; sending: string; sub: string; done: string; error: string };
  gate: {
    title: string;
    opensAt: string;
    openUntil: string;
    startsAt: string;
    entered: string;
    sold_one: string;
    sold_other: string;
    button: string;
  };
  offline: {
    title: string;
    today: string;
    tomorrow: string;
    button: string;
    downloading: string;
    missing: string;
    ready_one: string;
    ready_other: string;
    refresh: string;
    readyNoConnection: string;
    noConnection: string;
    failed: string;
    noticeToday: string;
    noticeTomorrow: string;
    gateAt: string;
    gateLine: string;
  };
  offlineKeys: {
    title: string;
    button: string;
    downloading: string;
    missing: string;
    ready: string;
    noConnection: string;
    failed: string;
    gateLine: string;
  };
  contacts: {
    loading: string;
    error: string;
    people_one: string;
    people_other: string;
    noCode: string;
    coming: string;
    notGoing: string;
    call: string;
    whatsapp: string;
    noName: string;
  };
  sheet: {
    title: string;
    withCode: string;
    confirmedAt: string;
    statusWithCode: string;
    statusMissing: string;
    confirm: string;
    noCode: string;
    noShow: string;
    otherSlot: string;
    pickNoCode: string;
    pickNoShow: string;
    noShowConfirm: string;
    noShowMessage: string;
    noShowButton: string;
    back: string;
    saved: string;
    pending_one: string;
    pending_other: string;
  };
}

export const partnerAgoraPtBR: PartnerAgoraTranslation = {
  title: 'Agora',
  titleAt: '{{title}} · {{time}}',
  arrive: {
    button: 'Cheguei',
    bookings_one: '{{count}} reserva',
    bookings_other: '{{count}} reservas',
    people_one: '{{count}} pessoa',
    people_other: '{{count}} pessoas',
    sending: 'Registrando…',
    noLocation: 'Chegada registrada sem a localização.',
    error: 'Não foi possível registrar a chegada. Tente de novo.',
  },
  code: {
    button: 'Inserir código',
    withCode: '{{done}} de {{total}} com código',
    arrivedAt: 'Você chegou às {{time}}',
    contactsHint: 'Os contatos somem com o código, com a ausência marcada ou no fim do horário.',
    noShowAt: '"Cliente não apareceu" libera às {{time}}.',
    noShow: 'Cliente não apareceu',
  },
  start: {
    button: 'Iniciar serviço',
    sending: 'Iniciando…',
    sub: '{{done}} de {{total}} com código · todos aqui',
    done: 'Serviço iniciado às {{time}}. Vale em todos os aparelhos da equipe.',
    error: 'Não foi possível iniciar o serviço. Tente de novo.',
  },
  gate: {
    title: 'Portaria · {{name}}',
    opensAt: 'Abre às {{time}}',
    openUntil: 'Aberta até {{time}}',
    startsAt: 'Começa às {{time}}',
    entered: '{{done}} de {{total}} entraram',
    sold_one: '{{count}} vendido',
    sold_other: '{{count}} vendidos',
    button: 'Abrir portaria',
  },
  offline: {
    title: 'Lista sem internet · {{name}}',
    today: 'Hoje, {{time}}',
    tomorrow: 'Amanhã, {{time}}',
    button: 'Baixar lista',
    downloading: 'Baixando…',
    missing: 'ainda não baixada neste aparelho',
    ready_one: '{{count}} ingresso · atualizada em {{date}}',
    ready_other: '{{count}} ingressos · atualizada em {{date}}',
    refresh: 'Atualizar lista',
    readyNoConnection: 'Sem internet agora: vale a lista que está neste aparelho.',
    noConnection: 'conecte-se à internet para baixar',
    failed: 'Não foi possível baixar a lista. Tente de novo.',
    noticeToday:
      'Prepare-se: seu evento começa hoje, às {{starts}}. As vendas pelo app encerram às {{salesEnd}}; a partir desse horário, a lista sem internet fica disponível para baixar aqui no Início.',
    noticeTomorrow:
      'Prepare-se: seu evento começa amanhã, às {{starts}}. As vendas pelo app encerram às {{salesEnd}}; a partir desse horário, a lista sem internet fica disponível para baixar aqui no Início.',
    gateAt: 'A lista sem internet fica disponível às {{time}}, quando as vendas pelo app encerram.',
    gateLine: 'Lista sem internet: {{detail}}',
  },
  offlineKeys: {
    title: 'Portaria sem internet · {{name}}',
    button: 'Preparar portaria',
    downloading: 'Preparando…',
    missing: 'ainda não preparada neste aparelho',
    ready: 'pronta para funcionar sem internet',
    noConnection: 'conecte-se à internet para preparar',
    failed: 'Não foi possível preparar a portaria. Tente de novo.',
    gateLine: 'Sem internet: {{detail}}',
  },
  contacts: {
    loading: 'Carregando contatos',
    error: 'Não foi possível carregar os contatos.',
    people_one: '{{count}} pessoa',
    people_other: '{{count}} pessoas',
    noCode: 'Sem código ainda',
    coming: 'Respondeu: estou chegando · {{time}}',
    notGoing: 'Respondeu: não vou mais · {{time}}',
    call: 'Ligar para {{name}}',
    whatsapp: 'WhatsApp de {{name}}',
    noName: 'Cliente',
  },
  sheet: {
    title: 'Inserir código',
    withCode: '{{done}} de {{total}} com código',
    confirmedAt: '{{name}} · confirmado às {{time}}',
    statusWithCode: 'Com código',
    statusMissing: 'Falta',
    confirm: 'Confirmar',
    noCode: 'Cliente sem código',
    noShow: 'Cliente não apareceu',
    otherSlot: 'Código de {{title}} · {{time}}',
    pickNoCode: 'Qual cliente está sem código?',
    pickNoShow: 'Qual cliente não apareceu?',
    noShowConfirm: '{{name}} não apareceu?',
    noShowMessage:
      'A reserva conta como ausência, sem reembolso ao cliente, e o seu repasse é liberado. O cliente pode contestar pela reclamação.',
    noShowButton: 'Marcar ausência',
    back: 'Voltar',
    saved: 'Ausência marcada.',
    pending_one: '{{count}} código guardado sem internet. Ele é enviado quando o sinal voltar.',
    pending_other:
      '{{count}} códigos guardados sem internet. Eles são enviados quando o sinal voltar.',
  },
};

export const partnerAgoraEn: PartnerAgoraTranslation = {
  title: 'Now',
  titleAt: '{{title}} · {{time}}',
  arrive: {
    button: "I'm here",
    bookings_one: '{{count}} booking',
    bookings_other: '{{count}} bookings',
    people_one: '{{count}} person',
    people_other: '{{count}} people',
    sending: 'Saving…',
    noLocation: 'Arrival saved without your location.',
    error: 'Could not save your arrival. Try again.',
  },
  code: {
    button: 'Enter code',
    withCode: '{{done}} of {{total}} with code',
    arrivedAt: 'You arrived at {{time}}',
    contactsHint: 'Contacts disappear with the code, a marked no-show or at the end of the slot.',
    noShowAt: '"Customer didn\'t show up" unlocks at {{time}}.',
    noShow: "Customer didn't show up",
  },
  start: {
    button: 'Start service',
    sending: 'Starting…',
    sub: '{{done}} of {{total}} with code · everyone here',
    done: "Service started at {{time}}. It shows on all your team's devices.",
    error: 'Could not start the service. Try again.',
  },
  gate: {
    title: 'Gate · {{name}}',
    opensAt: 'Opens at {{time}}',
    openUntil: 'Open until {{time}}',
    startsAt: 'Starts at {{time}}',
    entered: '{{done}} of {{total}} entered',
    sold_one: '{{count}} sold',
    sold_other: '{{count}} sold',
    button: 'Open gate',
  },
  offline: {
    title: 'Offline list · {{name}}',
    today: 'Today, {{time}}',
    tomorrow: 'Tomorrow, {{time}}',
    button: 'Download list',
    downloading: 'Downloading…',
    missing: 'not downloaded on this device yet',
    ready_one: '{{count}} ticket · updated {{date}}',
    ready_other: '{{count}} tickets · updated {{date}}',
    refresh: 'Update list',
    readyNoConnection: 'No internet right now: the list on this device still works.',
    noConnection: 'connect to the internet to download',
    failed: 'Could not download the list. Try again.',
    noticeToday:
      'Get ready: your event starts today at {{starts}}. App sales close at {{salesEnd}}; from then on, the offline list will be available to download here on Home.',
    noticeTomorrow:
      'Get ready: your event starts tomorrow at {{starts}}. App sales close at {{salesEnd}}; from then on, the offline list will be available to download here on Home.',
    gateAt: 'The offline list will be available at {{time}}, when app sales close.',
    gateLine: 'Offline list: {{detail}}',
  },
  offlineKeys: {
    title: 'Offline gate · {{name}}',
    button: 'Prepare gate',
    downloading: 'Preparing…',
    missing: 'not prepared on this device yet',
    ready: 'ready to work without internet',
    noConnection: 'connect to the internet to prepare',
    failed: 'Could not prepare the gate. Try again.',
    gateLine: 'Offline: {{detail}}',
  },
  contacts: {
    loading: 'Loading contacts',
    error: 'Could not load the contacts.',
    people_one: '{{count}} person',
    people_other: '{{count}} people',
    noCode: 'No code yet',
    coming: "Replied: I'm on my way · {{time}}",
    notGoing: "Replied: I'm not coming · {{time}}",
    call: 'Call {{name}}',
    whatsapp: 'WhatsApp {{name}}',
    noName: 'Customer',
  },
  sheet: {
    title: 'Enter code',
    withCode: '{{done}} of {{total}} with code',
    confirmedAt: '{{name}} · confirmed at {{time}}',
    statusWithCode: 'With code',
    statusMissing: 'Missing',
    confirm: 'Confirm',
    noCode: 'Customer without code',
    noShow: "Customer didn't show up",
    otherSlot: 'Code for {{title}} · {{time}}',
    pickNoCode: 'Which customer has no code?',
    pickNoShow: "Which customer didn't show up?",
    noShowConfirm: "{{name}} didn't show up?",
    noShowMessage:
      'The booking counts as a no-show, with no refund to the customer, and your payout is released. The customer can dispute it through a claim.',
    noShowButton: 'Mark no-show',
    back: 'Back',
    saved: 'No-show marked.',
    pending_one: "{{count}} code saved offline. It's sent when the signal returns.",
    pending_other: "{{count}} codes saved offline. They're sent when the signal returns.",
  },
};

export const partnerAgoraFr: PartnerAgoraTranslation = {
  title: 'Maintenant',
  titleAt: '{{title}} · {{time}}',
  arrive: {
    button: 'Je suis arrivé',
    bookings_one: '{{count}} réservation',
    bookings_other: '{{count}} réservations',
    people_one: '{{count}} personne',
    people_other: '{{count}} personnes',
    sending: 'Enregistrement…',
    noLocation: 'Arrivée enregistrée sans la localisation.',
    error: "Impossible d'enregistrer l'arrivée. Réessayez.",
  },
  code: {
    button: 'Saisir le code',
    withCode: '{{done}} sur {{total}} avec code',
    arrivedAt: 'Vous êtes arrivé à {{time}}',
    contactsHint:
      "Les contacts disparaissent avec le code, l'absence marquée ou à la fin du créneau.",
    noShowAt: '« Client absent » se débloque à {{time}}.',
    noShow: 'Client absent',
  },
  start: {
    button: 'Démarrer le service',
    sending: 'Démarrage…',
    sub: '{{done}} sur {{total}} avec code · tout le monde est là',
    done: 'Service démarré à {{time}}. Visible sur tous les appareils de l’équipe.',
    error: 'Impossible de démarrer le service. Réessayez.',
  },
  gate: {
    title: 'Accueil · {{name}}',
    opensAt: 'Ouvre à {{time}}',
    openUntil: "Ouvert jusqu'à {{time}}",
    startsAt: 'Commence à {{time}}',
    entered: '{{done}} sur {{total}} entrés',
    sold_one: '{{count}} vendu',
    sold_other: '{{count}} vendus',
    button: "Ouvrir l'accueil",
  },
  offline: {
    title: 'Liste hors ligne · {{name}}',
    today: "Aujourd'hui, {{time}}",
    tomorrow: 'Demain, {{time}}',
    button: 'Télécharger la liste',
    downloading: 'Téléchargement…',
    missing: 'pas encore téléchargée sur cet appareil',
    ready_one: '{{count}} billet · mise à jour le {{date}}',
    ready_other: '{{count}} billets · mise à jour le {{date}}',
    refresh: 'Mettre à jour la liste',
    readyNoConnection: 'Pas d’internet pour l’instant : la liste de cet appareil reste valable.',
    noConnection: 'connectez-vous à internet pour télécharger',
    failed: 'Impossible de télécharger la liste. Réessayez.',
    noticeToday:
      'Préparez-vous : votre événement commence aujourd’hui à {{starts}}. Les ventes dans l’app ferment à {{salesEnd}} ; à partir de cette heure, la liste hors ligne pourra être téléchargée ici, sur l’Accueil.',
    noticeTomorrow:
      'Préparez-vous : votre événement commence demain à {{starts}}. Les ventes dans l’app ferment à {{salesEnd}} ; à partir de cette heure, la liste hors ligne pourra être téléchargée ici, sur l’Accueil.',
    gateAt: 'La liste hors ligne sera disponible à {{time}}, à la fermeture des ventes dans l’app.',
    gateLine: 'Liste hors ligne : {{detail}}',
  },
  offlineKeys: {
    title: 'Accueil hors ligne · {{name}}',
    button: 'Préparer l’accueil',
    downloading: 'Préparation…',
    missing: 'pas encore préparé sur cet appareil',
    ready: 'prêt à fonctionner sans internet',
    noConnection: 'connectez-vous à internet pour préparer',
    failed: 'Impossible de préparer l’accueil. Réessayez.',
    gateLine: 'Hors ligne : {{detail}}',
  },
  contacts: {
    loading: 'Chargement des contacts',
    error: 'Impossible de charger les contacts.',
    people_one: '{{count}} personne',
    people_other: '{{count}} personnes',
    noCode: 'Pas encore de code',
    coming: 'A répondu : j’arrive · {{time}}',
    notGoing: 'A répondu : je ne viens plus · {{time}}',
    call: 'Appeler {{name}}',
    whatsapp: 'WhatsApp de {{name}}',
    noName: 'Client',
  },
  sheet: {
    title: 'Saisir le code',
    withCode: '{{done}} sur {{total}} avec code',
    confirmedAt: '{{name}} · confirmé à {{time}}',
    statusWithCode: 'Avec code',
    statusMissing: 'Manquant',
    confirm: 'Confirmer',
    noCode: 'Client sans code',
    noShow: 'Client absent',
    otherSlot: 'Code de {{title}} · {{time}}',
    pickNoCode: 'Quel client n’a pas de code ?',
    pickNoShow: 'Quel client ne s’est pas présenté ?',
    noShowConfirm: '{{name}} ne s’est pas présenté ?',
    noShowMessage:
      'La réservation compte comme une absence, sans remboursement au client, et votre versement est libéré. Le client peut contester par une réclamation.',
    noShowButton: "Marquer l'absence",
    back: 'Retour',
    saved: 'Absence marquée.',
    pending_one: '{{count}} code enregistré hors ligne. Il est envoyé au retour du signal.',
    pending_other: '{{count}} codes enregistrés hors ligne. Ils sont envoyés au retour du signal.',
  },
};
