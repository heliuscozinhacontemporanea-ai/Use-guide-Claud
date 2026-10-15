import { Bed, Bike, Calendar, Camera, Car, Compass, Utensils } from 'lucide-react';
import type { ReactNode } from 'react';

export interface ListingCategoryOption {
  id: string;
  label: string;
  icon: ReactNode;
}

/**
 * Categorias que o parceiro pode cadastrar, na inscrição e no painel (decisão D9). A categoria
 * pertence ao cadastro: uma mesma conta pode ter várias. `producer` é o perfil de produtor de eventos.
 */
export const LISTING_CATEGORIES: ListingCategoryOption[] = [
  { id: 'hotel', label: 'Hospedagem', icon: <Bed size={18} aria-hidden="true" /> },
  { id: 'restaurant', label: 'Restaurantes', icon: <Utensils size={18} aria-hidden="true" /> },
  { id: 'sight', label: 'Atrações turísticas', icon: <Camera size={18} aria-hidden="true" /> },
  { id: 'tour', label: 'Passeios', icon: <Compass size={18} aria-hidden="true" /> },
  { id: 'transfer', label: 'Translados', icon: <Car size={18} aria-hidden="true" /> },
  { id: 'rental', label: 'Aluguéis', icon: <Bike size={18} aria-hidden="true" /> },
  {
    id: 'producer',
    label: 'Eventos (sou produtor)',
    icon: <Calendar size={18} aria-hidden="true" />,
  },
];
