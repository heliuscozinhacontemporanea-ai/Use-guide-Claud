/** Textos da carteira de ingressos do comprador. pt-BR é a fonte. */
type TicketStatusKey =
  | 'reserved'
  | 'issued'
  | 'checked_in'
  | 'transferred'
  | 'refund_pending'
  | 'refunded'
  | 'canceled'
  | 'invalidated'
  | 'expired';
export interface TicketWalletTranslation {
  title: string;
  tabsLabel: string;
  back: string;
  refresh: string;
  loading: string;
  tabs: { upcoming: string; past: string };
  emptyUpcoming: string;
  emptyPast: string;
  session: string;
  code: { label: string; hint: string; warning: string; notYet: string };
  order: string;
  ticketCount_one: string;
  ticketCount_other: string;
  actions: { showQr: string; transfer: string; return: string };
  swap: { action: string; title: string; message: string; confirm: string };
  ticketStatus: Record<TicketStatusKey, string>;
  resume: { title: string; close: string };
  feedback: {
    qrSwapped: string;
    refundRequested: string;
    alreadyPaid: string;
    paid: string;
  };
  errors: { qr: string; qrSwap: string; refund: string; resume: string };
}

export const ticketWalletPtBR: TicketWalletTranslation = {
  title: 'Ingressos',
  tabsLabel: 'Ingressos por data',
  back: 'Voltar',
  refresh: 'Atualizar ingressos',
  loading: 'Carregando seus ingressos…',
  tabs: { upcoming: 'Próximos ({{count}})', past: 'Anteriores ({{count}})' },
  emptyUpcoming: 'Nenhum ingresso para os próximos eventos.',
  emptyPast: 'Nenhum ingresso de eventos passados.',
  session: 'Sessão: {{date}}',
  code: {
    label: 'Código {{code}}',
    hint: 'Mostre o QR Code na entrada. Se a leitura falhar, informe o código.',
    warning:
      'Nunca informe o código por telefone ou mensagem. Ninguém do Use Guide pede este código.',
    notYet: 'O código aparece no dia do evento, a partir de {{date}}.',
  },
  order: 'Pedido #{{id}}',
  ticketCount_one: '{{count}} ingresso',
  ticketCount_other: '{{count}} ingressos',
  actions: {
    showQr: 'Ver QR',
    transfer: 'Transferir',
    return: 'Devolver',
  },
  swap: {
    action: 'Problema com o QR Code?',
    title: 'Trocar o QR Code?',
    message:
      'Use se alguém viu ou copiou seu QR Code. O QR e o código atuais param de funcionar, e você só pode fazer isso uma vez. Se a portaria estiver sem internet, o QR antigo ainda pode passar até ela atualizar: chegue cedo e, se precisar, mostre seu documento.',
    confirm: 'Trocar QR Code',
  },
  ticketStatus: {
    reserved: 'Reservado',
    issued: 'Emitido',
    checked_in: 'Utilizado',
    transferred: 'Transferido',
    refund_pending: 'Reembolso em processamento',
    refunded: 'Reembolsado',
    canceled: 'Cancelado',
    invalidated: 'Inválido',
    expired: 'Expirado',
  },
  resume: { title: 'Concluir pagamento do pedido #{{id}}', close: 'Fechar' },
  feedback: {
    qrSwapped: 'QR Code trocado. O anterior e o código antigo não valem mais.',
    refundRequested: 'Reembolso solicitado. Você recebe pelo mesmo meio de pagamento.',
    alreadyPaid: 'Seu pagamento já estava confirmado. Ingressos atualizados.',
    paid: 'Pagamento confirmado e ingressos emitidos!',
  },
  errors: {
    qr: 'Não foi possível gerar o QR Code.',
    qrSwap: 'Não foi possível trocar o QR Code.',
    refund: 'Não foi possível pedir o reembolso.',
    resume: 'Não foi possível retomar o pagamento deste pedido.',
  },
};
