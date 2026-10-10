export interface TicketQrPayload {
  v: 1;
  ticketId: string;
  occurrenceId: string;
  qrVersion: number;
  iat: number;
  exp: number;
}

export interface TicketQrTokenPort {
  issue(payload: TicketQrPayload): string;
  verify(token: string): TicketQrPayload | null;
  getPublicKeyMetadata(): {
    keyId: string;
    publicKeyJwk: JsonWebKey;
  };
}
