import { CategoryFilter } from '../types/search';

export { REGIONS } from '../../../shared/constants/regions';

export const CATEGORY_FILTERS: CategoryFilter[] = [
  { id: 'event', label: 'Eventos' },
  { id: 'tour', label: 'Passeios' },
  { id: 'hotel', label: 'Hospedagens' },
  { id: 'restaurant', label: 'Restaurantes' },
  { id: 'sight', label: 'Atrações' },
  { id: 'tips', label: 'Dicas' },
];

export const PLACEHOLDER_PHRASES: string[] = [
  'Buscar Restaurantes',
  'Pesquise Hospedagens',
  'Descubra Eventos',
  'Explore Aventuras',
];
