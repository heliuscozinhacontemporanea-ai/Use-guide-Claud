import { getPartnerTermsStatusUseCase } from '../../domain/partners';

/**
 * O parceiro aceitou a versão atual dos termos? Não bloqueia nada (decisão de 2026-11-07): só põe
 * "Novos termos do parceiro" em "Resolva agora". Falha de leitura conta como sem aceite.
 */
export async function hasCurrentPartnerTerms(partnerUid: string): Promise<boolean> {
  const status = await getPartnerTermsStatusUseCase(partnerUid).catch(() => null);
  return status?.accepted === true;
}
