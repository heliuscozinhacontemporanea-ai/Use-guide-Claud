export class NotificationNotFoundError extends Error {
  readonly statusCode = 404;
  constructor(message = 'Notificação não encontrada') {
    super(message);
    this.name = 'NotificationNotFoundError';
  }
}

export class NotificationForbiddenError extends Error {
  readonly statusCode = 403;
  constructor(message = 'Não autorizado a alterar esta notificação') {
    super(message);
    this.name = 'NotificationForbiddenError';
  }
}
