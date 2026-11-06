import { getPublicGuideItemUseCase } from '../../../domain/guide';

/** Nome do estabelecimento do evento, para "Buggy do Preá convidou você" (p28); null sem ele. */
export async function courtesyBusinessName(establishmentId: string | null | undefined) {
  if (!establishmentId) return null;
  const item = await getPublicGuideItemUseCase(establishmentId).catch(() => null);
  return item?.name?.trim() || null;
}
