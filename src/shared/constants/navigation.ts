import { Compass, Calendar, Map, BedDouble, Utensils, MapPin, Info } from 'lucide-react';
export const NAVIGATION = [
  { path: '/', translationKey: 'navigation.explore', icon: Compass },
  { path: '/eventos', translationKey: 'navigation.events', icon: Calendar },
  { path: '/passeios', translationKey: 'navigation.tours', icon: Map },
  {
    path: '/pousadas',
    translationKey: 'navigation.accommodations',
    icon: BedDouble,
  },
  {
    path: '/restaurantes',
    translationKey: 'navigation.restaurants',
    icon: Utensils,
  },
  {
    path: '/pontos',
    translationKey: 'navigation.attractions',
    icon: MapPin,
  },
  { path: '/info', translationKey: 'navigation.tips', icon: Info },
] as const;
