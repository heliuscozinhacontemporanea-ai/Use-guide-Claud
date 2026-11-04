import { LOCATIONS } from '../constants/locations';

/** Nome do lugar (nome próprio, não traduzido) a partir do id gravado no item. */
export function locationName(id: string): string {
  return LOCATIONS.find((location) => location.id === id)?.name ?? id;
}
