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

/** Evento com vendas não é excluído pelo parceiro: as sessões são canceladas uma a uma (D27). */
export class EventHasSalesError extends EventDomainError {
  readonly reason = 'EVENT_HAS_SALES';
  constructor(message = 'Este evento tem vendas. Para cancelar, use cada sessão.') {
    super('CONFLICT', message);
    this.name = 'EventHasSalesError';
  }
}
