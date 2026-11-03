export type NotificationErrorCode = 'NOTIFICATION_NOT_FOUND' | 'VALIDATION_ERROR';

const STATUS: Record<NotificationErrorCode, number> = {
  NOTIFICATION_NOT_FOUND: 404,
  VALIDATION_ERROR: 400,
};

/** Erro com `code` estável (AGENTS.md §10.2). Aviso de outra pessoa responde 404, sem revelar que existe. */
export class NotificationDomainError extends Error {
  readonly statusCode: number;
  constructor(
    readonly code: NotificationErrorCode,
    message: string
  ) {
    super(message);
    this.name = 'NotificationDomainError';
    this.statusCode = STATUS[code];
  }
}
