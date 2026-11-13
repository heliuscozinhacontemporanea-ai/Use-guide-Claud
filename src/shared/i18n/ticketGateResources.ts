/** Textos da portaria de eventos: QR, código INGR e sessão sem internet (D20). pt-BR é a fonte. */
type OfflineReason =
  | 'notPrepared'
  | 'sessionExpired'
  | 'format'
  | 'signature'
  | 'expired'
  | 'otherSession'
  | 'notInManifest'
  | 'revoked'
  | 'used'
  | 'swappedConflict'
  | 'unsupported';

export interface TicketGateTranslation {
  scan: string;
  scanLoading: string;
  scanning: string;
  stopScan: string;
  scanUnsupported: string;
  cameraDenied: string;
  codeLabel: string;
  character: string;
  submit: string;
  success: string;
  holderFallback: string;
  failed: string;
  codeNeedsInternet: string;
  offlineSaved: string;
  offline: Record<OfflineReason, string>;
  online: string;
  offlineMode: string;
  prepared_one: string;
  prepared_other: string;
  notPrepared: string;
  offlineHint: string;
  prepare: string;
  prepareAgain: string;
  sync_one: string;
  sync_other: string;
  preparedNotice_one: string;
  preparedNotice_other: string;
  synced_one: string;
  synced_other: string;
  syncedConflicts_one: string;
  syncedConflicts_other: string;
  recent: string;
  entries_one: string;
  entries_other: string;
  ticketRef: string;
  method: { online: string; offline: string };
}

export const ticketGatePtBR: TicketGateTranslation = {
  scan: 'Ler QR Code',
  scanLoading: 'Abrindo a câmera…',
  scanning: 'Aponte a câmera para o QR Code do ingresso',
  stopScan: 'Parar câmera',
  scanUnsupported: 'Não foi possível abrir o leitor. Digite o código que aparece abaixo do QR.',
  cameraDenied: 'Sem acesso à câmera. Digite o código que aparece abaixo do QR.',
  codeLabel: 'Código do ingresso',
  character: 'Caractere {{n}} de {{total}}',
  submit: 'Confirmar check-in',
  success: 'Entrada liberada: {{name}} · {{type}}.',
  holderFallback: 'Ingresso válido',
  failed: 'Não foi possível validar o ingresso.',
  codeNeedsInternet: 'Sem internet o código não vale. Leia o QR Code.',
  offlineSaved:
    'QR válido, conferido sem internet. A entrada será enviada quando a conexão voltar.',
  offline: {
    notPrepared: 'Sem internet e sem sessão preparada: prepare o check-in sem internet antes.',
    sessionExpired: 'A sessão sem internet venceu. Conecte-se e prepare de novo.',
    format: 'Este QR não é um ingresso do Use Guide.',
    signature: 'QR adulterado ou falso.',
    expired: 'Este QR venceu.',
    otherSession: 'Este ingresso é de outra sessão do evento.',
    notInManifest: 'Ingresso já usado ou cancelado.',
    revoked: 'Este QR foi substituído (ingresso transferido).',
    used: 'Este ingresso já entrou por este aparelho.',
    swappedConflict:
      'QR trocado pelo titular depois de uma entrada com o QR antigo: confira o documento.',
    unsupported: 'Este aparelho não confere QR sem internet. Use outro ou aguarde o sinal.',
  },
  online: 'Com internet',
  offlineMode: 'Sem internet',
  prepared_one: 'Pronto para funcionar sem internet · {{count}} ingresso',
  prepared_other: 'Pronto para funcionar sem internet · {{count}} ingressos',
  notPrepared: 'Check-in sem internet não preparado',
  offlineHint:
    'Prepare antes de abrir os portões. Sem sinal, o QR é conferido no aparelho e as entradas são enviadas depois.',
  prepare: 'Preparar sem internet',
  prepareAgain: 'Atualizar lista',
  sync_one: 'Enviar {{count}} entrada guardada',
  sync_other: 'Enviar {{count}} entradas guardadas',
  preparedNotice_one: 'Pronto: {{count}} ingresso salvo no aparelho.',
  preparedNotice_other: 'Pronto: {{count}} ingressos salvos no aparelho.',
  synced_one: '{{count}} entrada enviada.',
  synced_other: '{{count}} entradas enviadas.',
  syncedConflicts_one: '{{count}} entrada já tinha sido feita em outro aparelho.',
  syncedConflicts_other: '{{count}} entradas já tinham sido feitas em outro aparelho.',
  recent: 'Entradas feitas',
  entries_one: '{{count}} entrada',
  entries_other: '{{count}} entradas',
  ticketRef: 'Ingresso #{{id}}',
  method: { online: 'com internet', offline: 'enviada depois' },
};
