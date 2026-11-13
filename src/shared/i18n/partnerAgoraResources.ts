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
