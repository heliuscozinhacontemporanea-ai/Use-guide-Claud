export type TicketingErrorCode =
  | 'INVALID_ARGUMENT'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'UNPROCESSABLE_ENTITY'
  | 'TOO_MANY_REQUESTS'
  | 'TRANSFER_ONLY_TO_BUYER'
  | 'TRANSFER_LINK_INVALID'
  | 'TRANSFER_LINK_EXPIRED'
  | 'TRANSFER_LINK_OWN'
  | 'EMAIL_NOT_VERIFIED'
  | 'SERVICE_UNAVAILABLE';

export class TicketingDomainError extends Error {
  constructor(
    public readonly code: TicketingErrorCode,
    message: string
  ) {
    super(message);
    this.name = 'TicketingDomainError';
  }
}

export class TicketTypeUnavailableError extends TicketingDomainError {
  constructor(message = 'Tipo de ingresso indisponível para compra.') {
    super('UNPROCESSABLE_ENTITY', message);
    this.name = 'TicketTypeUnavailableError';
  }
}

export class InventoryConflictError extends TicketingDomainError {
  constructor(message = 'Os últimos ingressos acabaram de esgotar.') {
    super('CONFLICT', message);
    this.name = 'InventoryConflictError';
  }
}

export class OrderNotFoundError extends TicketingDomainError {
  constructor(message = 'Pedido não encontrado.') {
    super('NOT_FOUND', message);
    this.name = 'OrderNotFoundError';
  }
}

export class RefundNotAllowedError extends TicketingDomainError {
  constructor(message = 'Reembolso não permitido para este ingresso ou pedido.') {
    super('UNPROCESSABLE_ENTITY', message);
    this.name = 'RefundNotAllowedError';
  }
}

export class TicketAlreadyCheckedInError extends TicketingDomainError {
  constructor(message = 'Este ingresso já realizou check-in anteriormente.') {
    super('CONFLICT', message);
    this.name = 'TicketAlreadyCheckedInError';
  }
}

export class TicketNotEligibleForReviewError extends TicketingDomainError {
  constructor(
    message = 'Apenas participantes com ingresso utilizado e evento concluído podem avaliar.'
  ) {
    super('FORBIDDEN', message);
    this.name = 'TicketNotEligibleForReviewError';
  }
}
