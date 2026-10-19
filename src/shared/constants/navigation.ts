import { Compass, Calendar, Map, Car, KeyRound, BedDouble, Utensils, MapPin, Info } from 'lucide-react';
import type { RouteKey } from '../i18n';

export const NAVIGATION: ReadonlyArray<{
  routeKey: RouteKey;
  translationKey: string;
  icon: typeof Compass;
}> = [
  { routeKey: 'explore', translationKey: 'navigation.explore', icon: Compass },
  { routeKey: 'events', translationKey: 'navigation.events', icon: Calendar },
  { routeKey: 'tours', translationKey: 'navigation.tours', icon: Map },
  { routeKey: 'transfers', translationKey: 'navigation.transfers', icon: Car },
  { routeKey: 'rentals', translationKey: 'navigation.rentals', icon: KeyRound },
  {
    routeKey: 'stays',
    translationKey: 'navigation.accommodations',
    icon: BedDouble,
  },
  {
    routeKey: 'restaurants',
    translationKey: 'navigation.restaurants',
    icon: Utensils,
  },
  {
    routeKey: 'attractions',
    translationKey: 'navigation.attractions',
    icon: MapPin,
  },
  { routeKey: 'guide', translationKey: 'navigation.tips', icon: Info },
];
