/** Conta encontrada pelo @; `email` e `emailVerified` só circulam no servidor (transferência). */
export interface UsernameOwner {
  uid: string;
  username: string;
  displayName: string | null;
  photoURL: string | null;
  email: string;
  emailVerified: boolean;
}

export interface UsernamePort {
  /** @ atual da conta e quando foi trocado pela última vez. */
  getCurrent(uid: string): Promise<{ username: string | null; changedAt: string | null }>;
  /** Livre: nunca usado, da própria conta ou com a reserva de 14 dias vencida. */
  isAvailable(username: string, uid: string, nowIso: string): Promise<boolean>;
  /**
   * Grava o @ numa transação: reserva `usernames/{nome}`, guarda o anterior até `releaseAtIso` e
   * atualiza a conta e o perfil público. Lança USERNAME_TAKEN se outra conta pegou antes.
   */
  claim(uid: string, username: string, nowIso: string, releaseAtIso: string): Promise<void>;
  findOwner(username: string): Promise<UsernameOwner | null>;
  /** Exclusão de conta: o @ fica reservado até `releaseAtIso`, sem dono. */
  releaseAll(uid: string, releaseAtIso: string): Promise<void>;
}
