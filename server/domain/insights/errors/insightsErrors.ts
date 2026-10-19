export class InsightsAccessError extends Error {
  readonly code = 'FORBIDDEN';

  constructor() {
    super('Acesso não autorizado às métricas deste item.');
    this.name = 'InsightsAccessError';
  }
}

/** Integração obrigatória ausente (ex.: chave HMAC); a rota responde 503 em vez de derrubar o processo. */
export class InsightsUnavailableError extends Error {
  readonly code = 'INSIGHTS_UNAVAILABLE';

  constructor() {
    super('Métricas indisponíveis no momento.');
    this.name = 'InsightsUnavailableError';
  }
}
