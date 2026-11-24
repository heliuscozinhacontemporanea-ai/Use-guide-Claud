/** Erro de regra do pagamento com `code` estável (AGENTS.md §10.2); o controller mapeia o status. */
export class PaymentDomainError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly statusCode = 400
  ) {
    super(message);
    this.name = 'PaymentDomainError';
  }
}
