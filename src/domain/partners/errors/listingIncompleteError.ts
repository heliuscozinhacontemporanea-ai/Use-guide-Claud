/** Passo do guia que falta (D34), como o backend devolve em `LISTING_INCOMPLETE`. */
export interface IncompleteStep {
  id: string;
  missing: string[];
}

/** Publicar com passo aberto, ou salvar anúncio publicado deixando um passo incompleto. */
export class ListingIncompleteError extends Error {
  constructor(public readonly steps: IncompleteStep[]) {
    super('LISTING_INCOMPLETE');
    this.name = 'ListingIncompleteError';
  }
}

/** Lê os passos do corpo de erro da API; vazio quando o corpo não os traz. */
export function incompleteStepsOf(error: unknown): IncompleteStep[] {
  const steps = (error as { steps?: unknown } | null)?.steps;
  if (!Array.isArray(steps)) return [];
  return steps.filter(
    (step): step is IncompleteStep =>
      typeof step?.id === 'string' &&
      Array.isArray(step.missing) &&
      step.missing.every((field: unknown) => typeof field === 'string')
  );
}
