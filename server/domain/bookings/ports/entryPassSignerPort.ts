/** Conteúdo assinado do QR da entrada de atração privada (D20). Só IDs internos, sem PII. */
export interface EntryPassPayload {
  v: 1;
  kid: string;
  /** Reserva, horário e oferta da entrada. */
  bid: string;
  sid: string;
  oid: string;
  /** Unidade (pessoa) da reserva: cada QR vale uma entrada. */
  u: number;
  /** Nome da pessoa na entrada nominal, para a portaria conferir com o documento sem internet. */
  nm?: string;
  /** Validade em segundos (fim do dia do horário). */
  exp: number;
}

/** Assinatura do QR da entrada, verificável sem internet pela chave pública (AGENTS.md §7.7). */
export interface EntryPassSignerPort {
  sign(payload: Omit<EntryPassPayload, 'kid'>): string;
  /** Devolve o conteúdo se a assinatura vale para a chave atual ou a anterior; senão null. */
  verify(token: string): EntryPassPayload | null;
  publicKeys(): Array<{ kid: string; publicKeyJwk: JsonWebKey }>;
}
