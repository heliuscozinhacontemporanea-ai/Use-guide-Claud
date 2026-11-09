import { guideService } from '../factory';

/** Resumo de um item do dono, sem os campos internos do documento (AGENTS.md §7.9 item 4). */
export interface OwnerGuideItemSummary {
  id: string;
  name: string;
  category: string;
  /** Endereço ou bairro como o parceiro cadastrou. */
  location: string;
  rating: number;
  reviewCount: number;
  /** Fuso do estabelecimento (D28); ausente em dado de teste antigo. */
  timeZone?: string;
}

export async function listOwnerGuideItemsUseCase(
  ownerId: string
): Promise<OwnerGuideItemSummary[]> {
  const items = await guideService.listItemsByOwner(ownerId);
  return items.map((item) => ({
    id: item.id,
    name: item.name,
    category: item.category,
    location: typeof item.location === 'string' ? item.location : '',
    rating: item.rating ?? 0,
    reviewCount: item.reviewCount ?? 0,
    ...(item.timeZone ? { timeZone: item.timeZone } : {}),
  }));
}
