import { getPartnerProfileUseCase } from '../../domain/partners';

/** Parceiro suspenso pelo admin não publica nem vende (decisão D8). */
export async function isPartnerSuspended(partnerId: string): Promise<boolean> {
  const partner = await getPartnerProfileUseCase(partnerId);
  return partner?.status === 'suspended';
}
