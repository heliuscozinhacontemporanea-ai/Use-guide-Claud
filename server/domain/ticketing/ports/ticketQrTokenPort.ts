/** Conteúdo assinado do QR do ingresso; campos curtos para o QR ficar menos denso e ler rápido. */
export interface TicketQrPayload {
  v: 1;
  kid: string;
  /** ID do ingresso. */
  tid: string;
  /** Sessão (ocorrência) do evento. */
  occ: string;
  /** Versão do QR: muda na transferência e na reemissão, e o QR anterior deixa de valer. */
  qv: number;
  exp: number;
}

export interface TicketQrTokenPort {
  issue(payload: Omit<TicketQrPayload, 'kid'>): string;
  /** Payload de um QR com assinatura válida e dentro da validade; ou null. */
  verify(token: string): TicketQrPayload | null;
  /** Chaves públicas aceitas (atual e, na rotação, a anterior), para conferir sem internet. */
  publicKeys(): Array<{ kid: string; publicKeyJwk: JsonWebKey }>;
}
