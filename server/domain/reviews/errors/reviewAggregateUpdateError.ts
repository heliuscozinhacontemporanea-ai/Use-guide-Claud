export class ReviewAggregateUpdateError extends Error {
  constructor(
    public readonly itemCollection: 'items' | 'events',
    public readonly itemId: string,
    cause?: unknown
  ) {
    super(`Não foi possível atualizar o aggregate de avaliações de ${itemCollection}/${itemId}.`);
    this.name = 'ReviewAggregateUpdateError';
    if (cause instanceof Error) {
      this.cause = cause;
    }
    Object.setPrototypeOf(this, ReviewAggregateUpdateError.prototype);
  }
}
