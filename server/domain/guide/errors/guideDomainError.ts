export type GuideErrorCode =
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'VALIDATION_ERROR'
  | 'INVALID_ID'
  | 'CONTACT_IN_TEXT'
  | 'LISTING_INCOMPLETE';

/** Passo do guia que impede publicar ou que o salvamento deixaria incompleto (D34). */
export interface IncompleteListingStep {
  id: string;
  missing: string[];
}

export class GuideDomainError extends Error {
  constructor(
    public readonly code: GuideErrorCode,
    message: string,
    /**
     * CONTACT_IN_TEXT: campo e trechos achados, para o formulário marcar o campo.
     * LISTING_INCOMPLETE: os passos do guia que faltam, com os campos de cada um.
     */
    public readonly details?:
      | { field: string; found: string[] }
      | { steps: IncompleteListingStep[] }
  ) {
    super(message);
    this.name = 'GuideDomainError';
  }
}
