export type UsernameErrorCode =
  | 'USERNAME_INVALID'
  /** Nome do Use Guide, de uma marca ou de um órgão público (D35, item 10). */
  | 'USERNAME_RESERVED'
  | 'USERNAME_TAKEN'
  | 'USERNAME_CHANGE_TOO_SOON'
  | 'USERNAME_NOT_FOUND';

/** Erros do @usuário com `code` estável (§10.2). */
export class UsernameError extends Error {
  constructor(
    public readonly code: UsernameErrorCode,
    message: string
  ) {
    super(message);
    this.name = 'UsernameError';
  }
}
