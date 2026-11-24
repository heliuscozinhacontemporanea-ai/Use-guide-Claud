import type { GuideItem } from '../../domain/guide';
import type { ClaimTarget } from '../../domain/partners';
import { isUseGuideOwner } from '../../shared/constants/useGuideOwner';
import { comparableName } from '../../shared/utils/reservedNames';

// Os mesmos lugares que o servidor aceita no "Sou o dono" (D35): dica, evento e produtor não.
const CLAIMABLE_CATEGORIES = new Set([
  'sight',
  'hotel',
  'restaurant',
  'tour',
  'transfer',
  'rental',
]);
const MAX_SUGGESTIONS = 3;
const MIN_TYPED = 3;

/** O lugar do Use Guide que pode ser assumido, ou `null` (anúncio de parceiro, dica, evento). */
export function claimTargetOf(item: GuideItem): ClaimTarget | null {
  if (!isUseGuideOwner(item.ownerId) || !CLAIMABLE_CATEGORIES.has(item.category)) return null;
  return {
    itemId: item.id,
    name: item.name,
    category: item.category,
    city: item.city ?? null,
    image: item.image || null,
  };
}

/**
 * "Já está no guia?" (D35, 3b): lugares do Use Guide na mesma cidade com nome parecido com o que a
 * pessoa digita (um contém o outro, sem acento, espaço nem disfarce).
 */
export function claimSuggestions(
  items: GuideItem[],
  draft: { name: string; state: string; city: string }
): ClaimTarget[] {
  const typed = comparableName(draft.name);
  const city = comparableName(draft.city);
  if (typed.length < MIN_TYPED || !city) return [];
  const found: ClaimTarget[] = [];
  for (const item of items) {
    const target = claimTargetOf(item);
    if (!target || item.state !== draft.state || comparableName(item.city ?? '') !== city) continue;
    const name = comparableName(item.name);
    if (name.includes(typed) || typed.includes(name)) found.push(target);
    if (found.length === MAX_SUGGESTIONS) break;
  }
  return found;
}
