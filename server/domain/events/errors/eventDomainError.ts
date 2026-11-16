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

/**
 * Sessão com vendas ou cortesias não é excluída pelo parceiro: cancelar ou adiar é pela folha da
 * sessão, que mostra reembolso e multa antes de confirmar (D14, D27).
 */
export class OccurrenceHasSalesError extends EventDomainError {
  readonly reason = 'SESSION_HAS_SALES';
  constructor(
    message = 'Esta sessão tem vendas ou cortesias. Cancele ou adie pela folha da sessão.'
  ) {
    super('CONFLICT', message);
    this.name = 'OccurrenceHasSalesError';
  }
}

/** Sessão com vendas não muda de data pela edição: o adiamento avisa os compradores (D27). */
export class OccurrenceDateLockedError extends EventDomainError {
  readonly reason = 'SESSION_DATE_LOCKED';
  constructor(message = 'Sessão com vendas: para mudar a data, adie pela folha da sessão.') {
    super('UNPROCESSABLE_ENTITY', message);
    this.name = 'OccurrenceDateLockedError';
  }
}

export class CapacityBelowSoldError extends EventDomainError {
  readonly reason = 'CAPACITY_BELOW_SOLD';
  constructor(
    message = 'A capacidade não pode ficar abaixo dos ingressos vendidos, reservados ou dados como cortesia.'
  ) {
    super('UNPROCESSABLE_ENTITY', message);
    this.name = 'CapacityBelowSoldError';
  }
}
