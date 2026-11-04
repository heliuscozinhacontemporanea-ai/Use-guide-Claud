import type { PartnerHomeView } from '../types/partnerHome';

/** `null` = todos os estabelecimentos (padrão, D27). */
export type EstablishmentFilter = string | null;

const belongs = (ids: string[], filter: EstablishmentFilter) =>
  filter === null || ids.length === 0 || ids.includes(filter);

/**
 * "Resolva agora" mostra sempre todos: prazo não pode sumir atrás do filtro (D27). O que é do dia
 * ("Hoje") segue o filtro.
 */
export function filterPartnerHome(view: PartnerHomeView, filter: EstablishmentFilter) {
  return {
    attention: view.attention,
    today: view.today.filter((item) => belongs(item.establishmentIds, filter)),
  };
}

/** Itens de "Resolva agora" por estabelecimento, para o número na folha do filtro. */
export function countAttentionByEstablishment(view: PartnerHomeView): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const item of view.attention) {
    for (const id of item.establishmentIds) counts[id] = (counts[id] ?? 0) + 1;
  }
  return counts;
}

/** Nome curto para a etiqueta da linha: a primeira palavra que não é artigo nem preposição. */
export function shortEstablishmentName(name: string): string {
  const skip = new Set([
    'a',
    'o',
    'as',
    'os',
    'de',
    'do',
    'da',
    'dos',
    'das',
    'e',
    'the',
    'le',
    'la',
  ]);
  return name.split(/\s+/).find((word) => word && !skip.has(word.toLowerCase())) ?? name;
}
