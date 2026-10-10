export type EventDomainErrorCode =
  | 'INVALID_ARGUMENT'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'UNPROCESSABLE_ENTITY';

export class EventDomainError extends Error {
  constructor(
    public readonly code: EventDomainErrorCode,
    message: string
  ) {
    super(message);
    this.name = 'EventDomainError';
  }
}

export class EventNotFoundError extends EventDomainError {
  constructor(message = 'Evento não encontrado.') {
    super('NOT_FOUND', message);
    this.name = 'EventNotFoundError';
  }
}

export class OccurrenceNotFoundError extends EventDomainError {
  constructor(message = 'Ocorrência do evento não encontrada.') {
    super('NOT_FOUND', message);
    this.name = 'OccurrenceNotFoundError';
  }
}

export class EventOwnershipError extends EventDomainError {
  constructor(message = 'Você não possui permissão sobre este evento.') {
    super('FORBIDDEN', message);
    this.name = 'EventOwnershipError';
  }
}
