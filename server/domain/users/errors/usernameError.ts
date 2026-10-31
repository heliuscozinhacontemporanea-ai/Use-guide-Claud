export type UsernameErrorCode =
  | 'USERNAME_INVALID'
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
