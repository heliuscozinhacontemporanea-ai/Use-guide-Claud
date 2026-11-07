import { getPartnerTermsStatusUseCase } from '../../domain/partners';

/**
 * Sem o aceite da versão atual dos termos do parceiro não há venda nova, cortesia nem divulgador
 * (aprovado em 2026-11-07, etapa 5). Falha de leitura conta como sem aceite: a venda espera.
 */
export async function hasCurrentPartnerTerms(partnerUid: string): Promise<boolean> {
  const status = await getPartnerTermsStatusUseCase(partnerUid).catch(() => null);
  return status?.accepted === true;
}

export class PartnerTermsPendingError extends Error {
  readonly code = 'PARTNER_TERMS_PENDING';
  constructor() {
    super('Aceite os novos termos do parceiro para continuar.');
    this.name = 'PartnerTermsPendingError';
  }
}

/** Para ações do próprio parceiro (cortesias, divulgadores); o admin não precisa do aceite. */
export async function assertActorPartnerTerms(actor: { uid: string; admin?: boolean }) {
  if (actor.admin === true) return;
  if (!(await hasCurrentPartnerTerms(actor.uid))) throw new PartnerTermsPendingError();
}
